import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { isValidObjectId } from "mongoose";
import { db } from "./db";
import { JoinRegistration, Setting } from "./models";

export type CommunityLinks = { whatsapp: string; telegram: string; help: string };

/** Shown until real links are saved in the admin panel or set as env vars. */
export const PLACEHOLDER_LINKS: CommunityLinks = {
  whatsapp: "https://whatsapp.com/channel/tfnetwork",
  telegram: "https://t.me/tfnetwork",
  help: "https://t.me/tfnetwork_help",
};

/** Which hosts each link may point to, so a typo or a hijacked account can't send members elsewhere. */
export const LINK_HOSTS: Record<keyof CommunityLinks, string[]> = {
  whatsapp: ["whatsapp.com", "www.whatsapp.com", "chat.whatsapp.com", "wa.me"],
  telegram: ["t.me", "telegram.me"],
  help: ["t.me", "telegram.me", "chat.whatsapp.com", "whatsapp.com", "www.whatsapp.com"],
};

export function validLink(kind: keyof CommunityLinks, url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && LINK_HOSTS[kind].includes(u.hostname) && u.pathname.length > 1;
  } catch {
    return false;
  }
}

/**
 * The real community links. Admins set them on the Channels page; env vars and then
 * placeholders fill any gap. They live only on the server and are shown only to people
 * who have registered, so they never appear in the site's public pages or scripts.
 */
export async function communityLinks(): Promise<CommunityLinks & { placeholder: (keyof CommunityLinks)[] }> {
  await db();
  const saved = ((await Setting.findOne({ key: "communityLinks" }).lean<{ value?: Partial<CommunityLinks> }>())?.value || {}) as Partial<CommunityLinks>;
  const env: Partial<CommunityLinks> = {
    whatsapp: process.env.WHATSAPP_CHANNEL_URL,
    telegram: process.env.TELEGRAM_CHANNEL_URL,
    help: process.env.TELEGRAM_HELP_URL,
  };
  const out = { ...PLACEHOLDER_LINKS, placeholder: [] as (keyof CommunityLinks)[] };
  for (const k of ["whatsapp", "telegram", "help"] as const) {
    const v = saved[k] || env[k];
    if (v) out[k] = v;
    else out.placeholder.push(k);
  }
  return out;
}

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
