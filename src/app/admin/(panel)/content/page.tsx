import Link from "next/link";
import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Post, Publication } from "@/lib/models";
import { Flash, PageHead, Status, Table, Tabs, Who, ago } from "../ui";

export const metadata = { title: { absolute: "Content | TFN Admin" } };

type Row = { id: string; kind: "post" | "publication"; title: string; type: string; section: string; status: string; by?: string; updated: Date };
const STATUSES = [["", "Any status"], ["draft", "Draft"], ["review", "In review"], ["approved", "Approved"], ["published", "Published"]];

export default async function ContentList({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; status?: string; done?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  await db();
  const tab = sp.tab === "news" || sp.tab === "publications" ? sp.tab : "all";
  const q: Record<string, unknown> = {};
  if (sp.status) q.status = sp.status;
  if (sp.q) q.title = { $regex: sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const [posts, pubs, nPosts, nPubs] = await Promise.all([
    tab !== "publications" ? Post.find(q).sort({ updatedAt: -1 }).limit(100).lean() : [],
    tab !== "news" ? Publication.find(q).sort({ updatedAt: -1 }).limit(100).lean() : [],
    Post.countDocuments(),
    Publication.countDocuments(),
  ]);
  const rows: Row[] = [
    ...posts.map((p) => ({ id: String(p._id), kind: "post" as const, title: p.title, type: "News", section: p.category || "TFN news", status: p.status || "draft", by: p.updatedBy || p.author || "", updated: p.updatedAt as Date })),
    ...pubs.map((p) => ({ id: String(p._id), kind: "publication" as const, title: p.title, type: "Publication", section: p.type || "", status: p.status || "draft", by: p.updatedBy || p.authors?.[0]?.name || "", updated: p.updatedAt as Date })),
  ].sort((a, b) => +new Date(b.updated) - +new Date(a.updated));
  const qs = (t: string) => `/admin/content?tab=${t}${sp.status ? `&status=${sp.status}` : ""}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`;

  return (
    <>
      <PageHead title="Content" sub="News stories and research publications on the website.">
        <Link href="/admin/content/post/new" className="btn btn-sm btn-coral"><Icon name="plus" size={17} /> New story</Link>
        <Link href="/admin/content/publication/new" className="btn btn-sm btn-line"><Icon name="plus" size={17} /> New publication</Link>
      </PageHead>
      <Flash ok={sp.done === "deleted" ? "Deleted." : null} />
      <Tabs current={tab === "all" ? "All" : tab === "news" ? "News" : "Publications"} items={[
        { href: qs("all"), label: "All", count: nPosts + nPubs },
        { href: qs("news"), label: "News", count: nPosts },
        { href: qs("publications"), label: "Publications", count: nPubs },
      ]} />
      <form className="flex flex-col sm:flex-row gap-2 mb-4" role="search">
        <input type="hidden" name="tab" value={tab} />
        <label htmlFor="q" className="sr-only">Search titles</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search titles" className="field sm:max-w-[360px]" />
        <label htmlFor="status" className="sr-only">Status</label>
        <select id="status" name="status" defaultValue={sp.status || ""} className="field sm:max-w-[200px]">
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn btn-sm btn-navy !min-h-12">Filter</button>
      </form>
      <Table head={["Title", "Type", "Section", "Status", "Last edited by", "Updated"]} empty={rows.length ? undefined : "Nothing matches. Try another search or status."}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-admin/60">
            <td className="max-w-[380px]"><Link href={`/admin/content/${r.kind}/${r.id}`} className="font-semibold hover:underline underline-offset-4 line-clamp-2">{r.title}</Link></td>
            <td className="text-muted">{r.type}</td>
            <td className="text-muted whitespace-nowrap">{r.section}</td>
            <td><Status s={r.status} /></td>
            <td><Who name={r.by} /></td>
            <td className="text-muted whitespace-nowrap">{ago(r.updated)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
