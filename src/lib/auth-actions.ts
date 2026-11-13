"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { db } from "./db";
import { Activity, AdminUser } from "./models";
import { clearSession, getSession, setSession } from "./auth";

export type SignInState = {
  step?: "password" | "code" | "enrol" | "backup-codes";
  error?: string;
  email?: string;
  qr?: string;
  secret?: string;
  codes?: string[];
};

/* Basic in-memory throttle: 5 failures per email or IP per 15 minutes. */
const fails = new Map<string, { n: number; until: number }>();
function throttled(k: string) {
  const f = fails.get(k);
  return Boolean(f && f.n >= 5 && f.until > Date.now());
}
function fail(k: string) {
  const f = fails.get(k);
  const fresh = !f || f.until < Date.now();
  fails.set(k, { n: fresh ? 1 : f!.n + 1, until: Date.now() + 15 * 60_000 });
}

const DUMMY = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Wf4xUjQf7Ckh0JQyHkG/7xY0vYcB2";

export async function passwordStep(_: SignInState, fd: FormData): Promise<SignInState> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!email || !password) return { step: "password", email, error: "Enter your work email and password." };
  if (throttled(email)) return { step: "password", email, error: "Too many attempts. Wait 15 minutes and try again." };
  await db();
  const u = await AdminUser.findOne({ email });
  const ok = await bcrypt.compare(password, u?.passwordHash || DUMMY);
  if (!u || !ok || !u.active) {
    fail(email);
    return { step: "password", email, error: "That email and password don’t match an active admin account." };
  }
  await setSession({ sub: String(u._id), name: u.name, role: u.role, stage: "password" });
  if (u.totpEnabled && u.totpSecret) return { step: "code", email };
  // First sign-in: set up the authenticator app.
  const secret = generateSecret();
  u.totpSecret = secret;
  await u.save();
  const qr = await QRCode.toDataURL(generateURI({ secret, issuer: "TFN Admin", label: u.email }), { margin: 1, width: 220, color: { dark: "#14213D", light: "#FFFFFF" } });
  return { step: "enrol", email, qr, secret };
}

async function pendingUser() {
  const s = await getSession();
  if (!s || s.stage !== "password") return null;
  await db();
  return AdminUser.findById(s.sub);
}

export async function codeStep(prev: SignInState, fd: FormData): Promise<SignInState> {
  const u = await pendingUser();
  if (!u) return { step: "password", error: "Your sign-in timed out. Start again." };
  if (throttled(String(u._id))) return { ...prev, error: "Too many attempts. Wait 15 minutes and try again." };
  const code = String(fd.get("code") || "").replace(/\s/g, "");
  const backup = fd.get("mode") === "backup";

  let ok = false;
  if (backup) {
    for (const [i, h] of (u.backupCodes || []).entries()) {
      if (await bcrypt.compare(code.toUpperCase(), h)) {
        ok = true;
        u.backupCodes.splice(i, 1);
        break;
      }
    }
  } else if (/^\d{6}$/.test(code) && u.totpSecret) {
    ok = verifySync({ secret: u.totpSecret, token: code, epochTolerance: 30 }).valid;
  }
  if (!ok) {
    fail(String(u._id));
    return { ...prev, qr: prev.qr, secret: prev.secret, error: backup ? "That backup code isn’t valid." : "That code isn’t right. Check the time on your phone and try the newest code." };
  }

  let codes: string[] | undefined;
  if (!u.totpEnabled) {
    u.totpEnabled = true;
    codes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
    u.backupCodes = await Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
  }
  u.lastSignIn = new Date();
  await u.save();
  await setSession({ sub: String(u._id), name: u.name, role: u.role, stage: "full" });
  await Activity.create({ who: u.name, what: "signed in", href: "/admin/users" });
  if (codes) return { step: "backup-codes", codes };
  redirect("/admin");
}

export async function signOut() {
  await clearSession();
  redirect("/admin/sign-in");
}
