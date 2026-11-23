import "server-only";
import { db, plain } from "./db";
import { StudentRecord, StudentStat } from "./models";
import type { Stats, StudentRow } from "@/app/admin/_students/data";

export async function studentStats(): Promise<Stats | null> {
  await db();
  const s = await StudentStat.findOne({ key: "fct" }).select("total cube").lean();
  return s ? (plain(s) as unknown as Stats) : null;
}

export async function studentRows(limit = 2000): Promise<StudentRow[]> {
  await db();
  const rows = await StudentRecord.find().sort({ rid: 1 }).limit(limit)
    .select("-_id rid name gender council ward vin phone network birthYear").lean();
  return plain(rows) as unknown as StudentRow[];
}
