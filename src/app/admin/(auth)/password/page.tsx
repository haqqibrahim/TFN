import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminUser } from "@/lib/models";
import { AuthShell } from "../shell";
import { PasswordForm } from "./form";

export const metadata: Metadata = { title: { absolute: "Your password | TFN Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const me = await requireAdmin(undefined, { allowMustChange: true });
  await db();
  const u = await AdminUser.findById(me.id).select("mustChangePassword").lean();
  return (
    <AuthShell>
      <PasswordForm first={!!u?.mustChangePassword} name={me.name.split(" ")[0]} />
    </AuthShell>
  );
}
