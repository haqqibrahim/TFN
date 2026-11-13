/* Dev helper: print the current authenticator code for a local admin account.
 * Usage: pnpm tsx scripts/totp.ts admin@tfnetwork.test */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import mongoose from "mongoose";
import { generateSync } from "otplib";

(async () => {
  if (process.env.NODE_ENV === "production") throw new Error("Dev only");
  await mongoose.connect(process.env.MONGODB_URI!, { dbName: process.env.MONGODB_DB });
  const u = await mongoose.connection.db!.collection("adminusers").findOne({ email: process.argv[2] });
  if (!u?.totpSecret) throw new Error("No authenticator secret for that account");
  console.log(generateSync({ secret: u.totpSecret }));
  await mongoose.disconnect();
})();
