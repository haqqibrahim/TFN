import Link from "next/link";
import { Icon } from "@/components/icons";
import { enquiryToIncident, updateEnquiry } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminUser, Enquiry, Upload } from "@/lib/models";
import { Back, Flash, PageHead, Panel, Status, Tabs, Who, ago, shortDate } from "../ui";

export const metadata = { title: { absolute: "Inbox | TFN Admin" } };

const DONE: Record<string, string> = { replied: "Reply saved to the conversation.", saved: "Updated.", incident: "Logged as an incident. The channels team can see it." };

export default async function Inbox({ searchParams }: { searchParams: Promise<{ tab?: string; id?: string; done?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  await db();
  const tab = ["unassigned", "mine", "closed"].includes(sp.tab || "") ? sp.tab! : "all";
  const filter: Record<string, unknown> =
    tab === "closed" ? { status: "closed" } : tab === "mine" ? { assignee: me.name, status: { $ne: "closed" } } : tab === "unassigned" ? { $or: [{ assignee: "" }, { assignee: null }], status: { $ne: "closed" } } : { status: { $ne: "closed" } };
  const [list, selected, staff, nAll, nUn, nMine, nClosed] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
    sp.id && /^[a-f0-9]{24}$/.test(sp.id) ? Enquiry.findById(sp.id).lean() : null,
    AdminUser.find({ active: true }).select("name").sort({ name: 1 }).lean(),
    Enquiry.countDocuments({ status: { $ne: "closed" } }),
    Enquiry.countDocuments({ $or: [{ assignee: "" }, { assignee: null }], status: { $ne: "closed" } }),
    Enquiry.countDocuments({ assignee: me.name, status: { $ne: "closed" } }),
    Enquiry.countDocuments({ status: "closed" }),
  ]);
  const file = selected?.attachment ? await Upload.findById(selected.attachment).select("name size").lean() : null;
  const looksLikeFake = selected && /fake|scam|impersonat|fees?|pay/i.test(`${selected.subject} ${selected.message}`);

  return (
    <>
      <PageHead title="Inbox" sub="Messages from the contact and partnership forms." />
      <Flash ok={sp.done ? DONE[sp.done] : null} />
      <Tabs current={{ all: "Open", unassigned: "Unassigned", mine: "Mine", closed: "Closed" }[tab]!} items={[
        { href: "/admin/inbox", label: "Open", count: nAll },
        { href: "/admin/inbox?tab=unassigned", label: "Unassigned", count: nUn },
        { href: "/admin/inbox?tab=mine", label: "Mine", count: nMine },
        { href: "/admin/inbox?tab=closed", label: "Closed", count: nClosed },
      ]} />
      <div className="grid lg:grid-cols-[minmax(280px,400px)_1fr] gap-5 items-start">
        <ul className={`grid gap-2 ${selected ? "hidden lg:grid" : ""}`}>
          {list.map((e) => (
            <li key={String(e._id)}>
              <Link href={`/admin/inbox?${tab !== "all" ? `tab=${tab}&` : ""}id=${e._id}`} aria-current={String(e._id) === sp.id ? "true" : undefined}
                className="block rounded-[20px] bg-white border border-adminline p-4 hover:border-navy aria-[current]:border-navy aria-[current]:ring-2 aria-[current]:ring-navy/15">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold flex-1 truncate ${e.status === "new" ? "" : "font-medium"}`}>{e.name}</span>
                  <span className="text-[13px] text-muted whitespace-nowrap">{ago(e.createdAt)}</span>
                </div>
                <p className="text-[15px] truncate mt-0.5">{e.subject || e.category}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Status s={e.status || "new"} />
                  <span className="text-[13px] text-muted truncate">{e.kind === "partnership" ? "Partnership" : e.category}</span>
                </div>
              </Link>
            </li>
          ))}
          {!list.length && <li className="rounded-[20px] bg-white border border-adminline p-6 text-muted">No messages here.</li>}
        </ul>

        {selected ? (
          <div className="grid gap-5 min-w-0">
            <div className="lg:hidden"><Back href={`/admin/inbox${tab !== "all" ? `?tab=${tab}` : ""}`}>All messages</Back></div>
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] text-muted">{selected.kind === "partnership" ? "Partnership enquiry" : selected.category}</p>
                  <h2 className="text-[24px] mt-1">{selected.subject || "No subject"}</h2>
                </div>
                <Status s={selected.status || "new"} />
              </div>
              <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
                <div className="flex gap-2"><dt className="text-muted">From</dt><dd className="font-semibold">{selected.name}</dd></div>
                <div className="flex gap-2 min-w-0"><dt className="text-muted">Email</dt><dd className="truncate"><a className="link" href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.subject || "Your message to TFN"))}`}>{selected.email}</a></dd></div>
                {selected.phone && <div className="flex gap-2"><dt className="text-muted">Phone</dt><dd>{selected.phone}</dd></div>}
                {selected.organisation && <div className="flex gap-2"><dt className="text-muted">Organisation</dt><dd>{selected.organisation}{selected.orgType ? `, ${selected.orgType}` : ""}</dd></div>}
                {selected.website && <div className="flex gap-2 min-w-0"><dt className="text-muted">Website</dt><dd className="truncate">{selected.website}</dd></div>}
                <div className="flex gap-2"><dt className="text-muted">Sent</dt><dd>{shortDate(selected.createdAt)}</dd></div>
              </dl>
              <p className="mt-5 whitespace-pre-line rounded-[14px] bg-admin p-4">{selected.message}</p>
              {file && <a href={`/api/admin/files/${file._id}`} className="mt-4 inline-flex items-center gap-2 link"><Icon name="download" size={16} /> {file.name}</a>}
            </Panel>

            {!!selected.notes?.length && (
              <Panel title="Replies and notes">
                <ol className="grid gap-3">
                  {selected.notes.map((n: { by?: string | null; text?: string | null; at?: Date | null }, i: number) => (
                    <li key={i} className="rounded-[14px] border border-adminline p-4">
                      <div className="flex items-center justify-between gap-2 text-[14px]"><Who name={n.by || ""} /><span className="text-muted">{ago(n.at || undefined)}</span></div>
                      <p className="mt-2 whitespace-pre-line">{n.text}</p>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}

            <Panel title="Reply and update">
              <form action={updateEnquiry} className="grid gap-4">
                <input type="hidden" name="id" value={String(selected._id)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="assignee" className="label">Assigned to</label>
                    <select id="assignee" name="assignee" defaultValue={selected.assignee || ""} className="field">
                      <option value="">No one</option>
                      {staff.map((s) => <option key={String(s._id)} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="label">Status</label>
                    <select id="status" name="status" defaultValue={selected.status || "new"} className="field">
                      <option value="new">New</option><option value="open">Open</option><option value="replied">Replied</option><option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="reply" className="label">Reply or note</label>
                  <textarea id="reply" name="reply" className="field" placeholder={`What you told ${selected.name.split(" ")[0]}, or a note for the team`} />
                  <p className="hint">Send the email from your inbox, then paste it here so the team can see it.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-navy">Save</button>
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.subject || "Your message to TFN"))}`} className="btn btn-sm btn-line"><Icon name="mail" size={17} /> Write email</a>
                </div>
              </form>
            </Panel>

            {(looksLikeFake || selected.category === "Digital Communities") && (
              <form action={enquiryToIncident} className="rounded-[20px] border border-coral/40 bg-coral-tint/60 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <input type="hidden" name="id" value={String(selected._id)} />
                <p className="flex-1 text-[15px]"><span className="font-semibold">Reporting a fake group or a scam?</span> Log it so the channels team can warn members.</p>
                <button className="btn btn-sm btn-navy"><Icon name="alert" size={17} /> Log as incident</button>
              </form>
            )}
          </div>
        ) : (
          <div className="hidden lg:grid place-items-center rounded-[20px] border-2 border-dashed border-adminline min-h-[320px] text-muted p-8 text-center">Choose a message to read it.</div>
        )}
      </div>
    </>
  );
}
