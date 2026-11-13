import Link from "next/link";
import { Icon } from "@/components/icons";
import { deleteRegistration } from "@/lib/admin-actions";
import { allowed, CAN, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { maskPhone } from "@/lib/format";
import { JoinRegistration } from "@/lib/models";
import { ConfirmButton } from "../confirm";
import { Flash, PageHead, Stat, Table, shortDate } from "../ui";

export const metadata = { title: { absolute: "Registrations | TFN Admin" } };
const PER = 25;

export default async function Registrations({ searchParams }: { searchParams: Promise<{ q?: string; institution?: string; state?: string; channel?: string; page?: string; done?: string }> }) {
  const me = await requireAdmin(CAN.registrations);
  const sp = await searchParams;
  await db();
  const canManage = allowed(me.role, "registrations");
  const q: Record<string, unknown> = {};
  if (sp.institution) q.institution = sp.institution;
  if (sp.state) q.state = sp.state;
  if (sp.channel) q.channels = sp.channel;
  if (sp.q) {
    const rx = { $regex: sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    q.$or = [{ firstName: rx }, { email: rx }];
  }
  const page = Math.max(1, Number(sp.page) || 1);
  const week = new Date(Date.now() - 7 * 86400000);
  const [total, thisWeek, institutions, states, matching, rows] = await Promise.all([
    JoinRegistration.countDocuments(),
    JoinRegistration.countDocuments({ createdAt: { $gte: week } }),
    JoinRegistration.aggregate([{ $group: { _id: "$institution", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    JoinRegistration.aggregate([{ $group: { _id: "$state", n: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    JoinRegistration.countDocuments(q),
    JoinRegistration.find(q).sort({ createdAt: -1 }).skip((page - 1) * PER).limit(PER).lean(),
  ]);
  const pages = Math.max(1, Math.ceil(matching / PER));
  const params = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const k of ["q", "institution", "state", "channel"] as const) if (sp[k]) p.set(k, sp[k]!);
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    return p.toString();
  };
  const filtered = Boolean(sp.q || sp.institution || sp.state || sp.channel);

  return (
    <>
      <PageHead title="Registrations" sub="People who joined the Tertiary Digital Communities.">
        {canManage && <a href={`/api/admin/export/registrations?${params({})}`} className="btn btn-sm btn-navy"><Icon name="download" size={17} /> Export CSV</a>}
      </PageHead>
      <Flash ok={sp.done === "deleted" ? "Registration deleted." : null} />
      <ul className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <Stat k="Total members" v={total.toLocaleString("en-GB")} />
        <Stat k="Joined this week" v={thisWeek.toLocaleString("en-GB")} />
        <Stat k="Institutions" v={institutions.filter((i) => i._id).length} n={institutions[0]?._id ? `Most from ${institutions[0]._id}` : undefined} />
        <Stat k="States" v={states.filter((s) => s._id).length} n="Out of 37 including the FCT" />
      </ul>

      <form className="grid sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_auto] gap-2 mb-4" role="search">
        <div><label htmlFor="q" className="sr-only">Search by name or email</label><input id="q" name="q" defaultValue={sp.q} placeholder="Search by name or email" className="field" /></div>
        <div><label htmlFor="institution" className="sr-only">Institution</label>
          <select id="institution" name="institution" defaultValue={sp.institution || ""} className="field">
            <option value="">All institutions</option>
            {institutions.filter((i) => i._id).sort((a, b) => a._id.localeCompare(b._id)).map((i) => <option key={i._id} value={i._id}>{i._id}</option>)}
          </select></div>
        <div><label htmlFor="state" className="sr-only">State</label>
          <select id="state" name="state" defaultValue={sp.state || ""} className="field">
            <option value="">All states</option>
            {states.filter((s) => s._id).map((s) => <option key={s._id} value={s._id}>{s._id}</option>)}
          </select></div>
        <div><label htmlFor="channel" className="sr-only">Channel</label>
          <select id="channel" name="channel" defaultValue={sp.channel || ""} className="field">
            <option value="">Any channel</option><option>WhatsApp</option><option>Telegram</option>
          </select></div>
        <div className="flex gap-2"><button className="btn btn-sm btn-navy !min-h-12 flex-1">Filter</button>{filtered && <Link href="/admin/registrations" className="btn btn-sm btn-line !min-h-12">Clear</Link>}</div>
      </form>

      <p className="text-[14px] text-muted mb-2">{matching.toLocaleString("en-GB")} {matching === 1 ? "person" : "people"}{filtered ? " match" : ""}</p>
      <Table head={["Name", "Email", "WhatsApp", "Institution", "State", "Channels", "Joined", ...(canManage ? [""] : [])]} empty={rows.length ? undefined : "No one matches these filters."}>
        {rows.map((r) => (
          <tr key={String(r._id)}>
            <td className="font-semibold whitespace-nowrap">{r.firstName}</td>
            <td className="text-muted max-w-[220px] truncate">{r.email}</td>
            <td className="whitespace-nowrap font-mono text-[14px]">{maskPhone(r.whatsapp)}</td>
            <td className="max-w-[220px] truncate">{r.institution}</td>
            <td className="whitespace-nowrap">{r.state}</td>
            <td className="whitespace-nowrap">{(r.channels || []).join(", ")}</td>
            <td className="text-muted whitespace-nowrap">{shortDate(r.createdAt)}</td>
            {canManage && (
              <td>
                <form action={deleteRegistration}>
                  <input type="hidden" name="id" value={String(r._id)} />
                  <ConfirmButton message={`Delete ${r.firstName}’s registration? This can’t be undone.`} aria-label={`Delete ${r.firstName}’s registration`} title="Delete on request" className="w-9 h-9 rounded-full grid place-items-center text-muted hover:bg-[#FDE2E0] hover:text-[#A1271B]"><Icon name="trash" size={17} /></ConfirmButton>
                </form>
              </td>
            )}
          </tr>
        ))}
      </Table>
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-3">
          {page > 1 ? <Link href={`/admin/registrations?${params({ page: page - 1 })}`} className="btn btn-sm btn-line">Previous</Link> : <span />}
          <span className="text-[14px] text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link href={`/admin/registrations?${params({ page: page + 1 })}`} className="btn btn-sm btn-line">Next</Link> : <span />}
        </nav>
      )}
      <p className="mt-6 text-[14px] text-muted max-w-[640px]">Phone numbers are partly hidden here. Exports contain full details, are logged, and must be stored and shared under the Digital Communities privacy notice.</p>
    </>
  );
}
