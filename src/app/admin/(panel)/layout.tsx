import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChannelPost, Enquiry, Opportunity } from "@/lib/models";
import { AdminNav } from "./nav";

export const metadata: Metadata = { title: { default: "TFN Admin", template: "%s | TFN Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  await db();
  const [opps, channels, inbox] = await Promise.all([
    Opportunity.countDocuments({ status: "pending" }),
    ChannelPost.countDocuments({ status: "review" }),
    Enquiry.countDocuments({ status: "new" }),
  ]);
  return (
    <div className="min-h-dvh bg-admin lg:grid lg:grid-cols-[248px_1fr]">
      <AdminNav me={me} badges={{ opportunities: opps, channels, inbox }} />
      <main id="main" className="min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8">{children}</main>
    </div>
  );
}
