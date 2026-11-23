/* Create or reset an admin sign-in.
 * Usage: ADMIN_PASSWORD='…' pnpm tsx scripts/add-admin.ts <email-or-username> "<Display name>" [role]
 * The password is read from the environment so it never lands in shell history or the repo.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { db } from "../src/lib/db";
import { AdminUser, ROLES, type Role } from "../src/lib/models";

async function main() {
  const [login, name, role = "Viewer"] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;
  if (!login || !name || !password) throw new Error("Give a login and a name, and set ADMIN_PASSWORD");
  if (!ROLES.includes(role as Role)) throw new Error(`Role must be one of: ${ROLES.join(", ")}`);
  await db();
  const email = login.trim().toLowerCase();
  await AdminUser.findOneAndUpdate(
    { email },
    { email, name, role, passwordHash: await bcrypt.hash(password, 12), active: true, mustChangePassword: false },
    { upsert: true },
  );
  console.log(`Admin sign-in "${email}" is ready (${role}).`);
}

main()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
