import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { studentStats } from "@/lib/students";
import { Present } from "../../_students/present";

export const metadata: Metadata = { title: { absolute: "Registered students | TFN" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PresentPage() {
  await requireAdmin();
  const stats = await studentStats();
  if (!stats) return <p className="p-8">No student data has been loaded yet.</p>;
  return <Present stats={stats} syncedAt={Date.now()} />;
}
