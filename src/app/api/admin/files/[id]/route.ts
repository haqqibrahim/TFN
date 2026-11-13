import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Upload } from "@/lib/models";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  await db();
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return new Response("Not found", { status: 404 });
  const f = await Upload.findById(id);
  if (!f?.data) return new Response("Not found", { status: 404 });
  const name = (f.name || "attachment").replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": f.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
