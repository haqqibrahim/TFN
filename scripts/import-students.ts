/* Load the masked FCT student dataset into the database.
 * Usage: pnpm import:students /path/to/fct-students.json
 * The JSON is made outside the repo. It must already be masked:
 * this script refuses any record whose name, VIN or phone is not masked.
 * Replaces the previous import (records and totals) in one go.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { db } from "../src/lib/db";
import { StudentRecord, StudentStat } from "../src/lib/models";

type Rec = { rid: string; name: string; gender: "M" | "F"; council: string; ward: string; vin: string; phone: string | null; network: string | null; birthYear: number };

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Give the path to the masked JSON file");
  const data = JSON.parse(readFileSync(file, "utf8"));
  const recs: Rec[] = data.records;
  const masked = (s: string | null) => s == null || s.includes("•");
  const bad = recs.filter((r) => !masked(r.name) || !masked(r.vin) || !masked(r.phone));
  if (bad.length) throw new Error(`${bad.length} records are not masked (first: ${bad[0].rid}). Nothing was imported.`);

  await db();
  await StudentRecord.deleteMany({});
  await StudentRecord.insertMany(recs, { ordered: false });
  const stats = { ...data };
  delete stats.records;
  await StudentStat.deleteMany({});
  await StudentStat.create(stats);
  console.log(`Imported ${recs.length} masked records and totals for ${stats.total} students.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
