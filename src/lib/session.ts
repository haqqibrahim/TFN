/** JWT session helpers. Edge-safe (used by middleware), so no database imports here. */
import { jwtVerify, SignJWT } from "jose";

export const COOKIE = "tfn_admin";
export type Session = { sub: string; name: string; role: string };

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function sign(s: Session, ttl: string) {
  return new SignJWT({ ...s, v: 2 }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(ttl).sign(key());
}

export async function read(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    // Sessions from the old two-step sign-in (no v: 2) are not accepted.
    return payload.v === 2 ? (payload as unknown as Session) : null;
  } catch {
    return null;
  }
}
