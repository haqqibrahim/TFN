import type { Metadata } from "next";
import { studentRows, studentStats } from "@/lib/students";
import { Insights } from "../../_students/insights";

export const metadata: Metadata = { title: "Students" };
export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const [stats, feed] = await Promise.all([studentStats(), studentRows(60)]);
  if (!stats) return <p className="text-muted">No student data has been loaded yet.</p>;
  return <Insights stats={stats} feed={feed} syncedAt={Date.now()} />;
}
