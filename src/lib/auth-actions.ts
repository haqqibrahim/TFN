"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "./db";
import { Activity, AdminUser } from "./models";
import { clearSession, requireAdmin, setSession } from "./auth";

export type SignInState = { error?: string; email?: string };

/* Basic in-memory throttle: 5 failures per email per 15 minutes. */
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

export async function signIn(_: SignInState, fd: FormData): Promise<SignInState> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!email || !password) return { email, error: "Enter your email and password." };
  if (throttled(email)) return { email, error: "Too many attempts. Wait 15 minutes and try again." };
  await db();
  const u = await AdminUser.findOne({ email });
  const ok = await bcrypt.compare(password, u?.passwordHash || DUMMY);
  if (!u || !ok || !u.active) {
    fail(email);
    return { email, error: "That email and password don’t match an active admin account." };
  }
  fails.delete(email);
  u.lastSignIn = new Date();
  await u.save();
  await setSession({ sub: String(u._id), name: u.name, role: u.role });
  await Activity.create({ who: u.name, what: "signed in", href: "/admin/users" });
  redirect(u.mustChangePassword ? "/admin/password" : "/admin");
}

export type PasswordState = { error?: string; field?: "current" | "next" | "confirm" };

export async function changePassword(_: PasswordState, fd: FormData): Promise<PasswordState> {
  const me = await requireAdmin(undefined, { allowMustChange: true });
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  const confirm = String(fd.get("confirm") || "");
  const u = await AdminUser.findById(me.id);
  if (!u) redirect("/admin/sign-in");
  if (throttled(`pw:${me.id}`)) return { error: "Too many attempts. Wait 15 minutes and try again." };
  if (!(await bcrypt.compare(current, u.passwordHash))) {
    fail(`pw:${me.id}`);
    return { field: "current", error: "Your current password isn’t right." };
  }
  if (next.length < 10) return { field: "next", error: "Use at least 10 characters." };
  if (next === current) return { field: "next", error: "Choose a password you haven’t used here before." };
  if (next.toLowerCase().includes(u.email.split("@")[0].toLowerCase())) return { field: "next", error: "Don’t include your email name in your password." };
  if (next !== confirm) return { field: "confirm", error: "The two new passwords don’t match." };
  u.passwordHash = await bcrypt.hash(next, 12);
  u.mustChangePassword = false;
  await u.save();
  await Activity.create({ who: u.name, what: "changed their password", href: "/admin/users" });
  redirect("/admin?done=password");
}

export async function signOut() {
  await clearSession();
  redirect("/admin/sign-in");
}
