import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { AdminUser, type Role } from "./models";
import { COOKIE, read, sign, type Session } from "./session";

export async function setSession(s: Session) {
  const ttl = s.stage === "full" ? "8h" : "10m";
  const jar = await cookies();
  jar.set(COOKIE, await sign(s, ttl), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: s.stage === "full" ? 8 * 3600 : 600,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession() {
  return read((await cookies()).get(COOKIE)?.value);
}

/** Use in every admin page and action. Re-checks the account is still active. */
export async function requireAdmin(roles?: Role[]) {
  const s = await getSession();
  if (!s || s.stage !== "full") redirect("/admin/sign-in");
  await db();
  const u = await AdminUser.findById(s.sub).select("name email role active").lean();
  if (!u || !u.active) {
    try { await clearSession(); } catch { /* cookies are read-only while rendering; the sign-in page replaces it */ }
    redirect("/admin/sign-in");
  }
  if (roles && u.role !== "Super admin" && !roles.includes(u.role as Role)) {
    redirect("/admin?denied=1");
  }
  return { id: String(u._id), name: u.name, email: u.email, role: u.role as Role };
}

/** Which roles may do what. Super admin can do everything. */
export const CAN = {
  publish: ["Super admin", "Reviewer"] as Role[],
  edit: ["Super admin", "Editor", "Reviewer"] as Role[],
  opportunities: ["Super admin", "Reviewer", "Editor"] as Role[],
  channels: ["Super admin", "Channels lead", "Reviewer"] as Role[],
  events: ["Super admin", "Events lead"] as Role[],
  inbox: ["Super admin", "Editor", "Reviewer", "Channels lead", "Events lead"] as Role[],
  registrations: ["Super admin", "Channels lead"] as Role[],
  users: ["Super admin"] as Role[],
};

export function allowed(role: Role, what: keyof typeof CAN) {
  return role === "Super admin" || CAN[what].includes(role);
}
