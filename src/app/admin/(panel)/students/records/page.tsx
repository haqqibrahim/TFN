import type { Metadata } from "next";
import { studentRows, studentStats } from "@/lib/students";
import { Records } from "../../../_students/records";

export const metadata: Metadata = { title: "Student records" };
export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const [stats, rows] = await Promise.all([studentStats(), studentRows()]);
  if (!stats) return <p className="text-muted">No student data has been loaded yet.</p>;
  return <Records rows={rows} total={stats.total} syncedAt={Date.now()} />;
}
