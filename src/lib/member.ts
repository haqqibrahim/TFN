import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { isValidObjectId } from "mongoose";
import { db } from "./db";
import { JoinRegistration } from "./models";

/**
 * The real community links. They live only on the server and are shown only to people
 * who have registered, so they never appear in the site's public pages or scripts.
 */
export const COMMUNITY_LINKS = {
  whatsapp: process.env.WHATSAPP_CHANNEL_URL || "https://whatsapp.com/channel/tfnetwork",
  telegram: process.env.TELEGRAM_CHANNEL_URL || "https://t.me/tfnetwork",
  help: process.env.TELEGRAM_HELP_URL || "https://t.me/tfnetwork_help",
};

const COOKIE = "tfn_member";
const MAX_AGE = 60 * 60 * 24 * 365;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
  return "dev-only-member-secret";
}

const sign = (id: string) => crypto.createHmac("sha256", secret()).update("member:" + id).digest("base64url");

export async function setMemberCookie(id: string) {
  (await cookies()).set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearMemberCookie() {
  (await cookies()).delete(COOKIE);
}

/** The registration behind a valid member cookie, or null. */
export async function currentMember() {
  const raw = (await cookies()).get(COOKIE)?.value || "";
  const [id, mac] = raw.split(".");
  if (!id || !mac || !isValidObjectId(id)) return null;
  const want = Buffer.from(sign(id));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  await db();
  const reg = await JoinRegistration.findById(id).lean<{ _id: unknown; firstName: string; channels?: string[]; deleteToken?: string }>();
  return reg;
}
