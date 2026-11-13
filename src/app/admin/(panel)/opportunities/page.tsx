import Link from "next/link";
import { Icon } from "@/components/icons";
import { createOpportunity, reviewOpportunity, reviewOpportunityAs } from "@/lib/admin-actions";
import { allowed, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { daysUntil } from "@/lib/format";
import { Opportunity, OPP_CATEGORIES, Upload } from "@/lib/models";
import { Back, Flash, PageHead, Panel, Status, Tabs, ago, shortDate } from "../ui";

export const metadata = { title: { absolute: "Opportunities | TFN Admin" } };

const TABS = [["pending", "Waiting"], ["published", "Published"], ["closed", "Closed"], ["declined", "Declined"]] as const;
const DONE: Record<string, string> = { approve: "Published. It’s now on the opportunities board.", decline: "Declined. It won’t appear on the website.", close: "Closed and taken off the board.", changes: "Saved your note. It stays in the queue." };
const ERR: Record<string, string> = { checks: "Tick all four checks before publishing.", publish: "Your role can’t publish. A reviewer will do this.", missing: "Add a title, provider and closing date." };

const host = (u?: string) => { try { return u ? new URL(u).hostname.replace(/^www\./, "") : ""; } catch { return ""; } };

export default async function Opportunities({ searchParams }: { searchParams: Promise<{ tab?: string; id?: string; new?: string; done?: string; err?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  await db();
  const [counts, selected] = await Promise.all([
    Opportunity.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    sp.id && /^[a-f0-9]{24}$/.test(sp.id) ? Opportunity.findById(sp.id).lean() : null,
  ]);
  const tab = (TABS.find(([s]) => s === sp.tab)?.[0]) || (selected?.status as string) || "pending";
  const list = await Opportunity.find({ status: tab }).sort(tab === "published" ? { closesAt: 1 } : { createdAt: -1 }).limit(100).lean();
  const n = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const file = selected?.attachment ? await Upload.findById(selected.attachment).select("name size").lean() : null;
  const canPublish = allowed(me.role, "publish");
  const detailOpen = Boolean(selected || sp.new);

  return (
    <>
      <PageHead title="Opportunities" sub="Check what people send in before it goes on the board.">
        <Link href="/admin/opportunities?new=1" className="btn btn-sm btn-coral"><Icon name="plus" size={17} /> Add opportunity</Link>
      </PageHead>
      <Flash ok={sp.done ? DONE[sp.done] : null} err={sp.err ? ERR[sp.err] : null} />
      <Tabs current={TABS.find(([s]) => s === tab)?.[1] || "Waiting"} items={TABS.map(([s, l]) => ({ href: `/admin/opportunities?tab=${s}`, label: l, count: n[s] || 0 }))} />

      <div className="grid lg:grid-cols-[minmax(280px,380px)_1fr] gap-5 items-start">
        <ul className={`grid gap-2.5 ${detailOpen ? "hidden lg:grid" : ""}`}>
          {list.map((o) => {
            const days = daysUntil(o.closesAt);
            return (
              <li key={String(o._id)}>
                <Link href={`/admin/opportunities?tab=${tab}&id=${o._id}`} aria-current={String(o._id) === sp.id ? "true" : undefined}
                  className="block rounded-[20px] bg-white border border-adminline p-4 hover:border-navy aria-[current]:border-navy aria-[current]:ring-2 aria-[current]:ring-navy/15">
                  <p className="text-[13px] text-muted">{o.category} from {o.provider}</p>
                  <p className="font-semibold leading-snug mt-0.5">{o.title}</p>
                  <p className="mt-2 text-[13px] text-muted">
                    {tab === "pending" ? `Sent ${ago(o.createdAt)}${o.submitterName ? ` by ${o.submitterName}` : ""}` : days !== null && days >= 0 ? `Closes ${shortDate(o.closesAt)}` : `Closed ${shortDate(o.closesAt)}`}
                  </p>
                </Link>
              </li>
            );
          })}
          {!list.length && <li className="rounded-[20px] bg-white border border-adminline p-6 text-muted">Nothing here right now.</li>}
        </ul>

        {sp.new ? (
          <Panel title="Add an opportunity">
            <div className="lg:hidden -mt-2"><Back href="/admin/opportunities">All opportunities</Back></div>
            <form action={createOpportunity} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label htmlFor="title" className="label">Title</label><input id="title" name="title" required className="field" /></div>
              <div><label htmlFor="provider" className="label">Provider</label><input id="provider" name="provider" required className="field" /></div>
              <div><label htmlFor="category" className="label">Type</label><select id="category" name="category" className="field">{OPP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label htmlFor="location" className="label">Where</label><input id="location" name="location" placeholder="Nigeria, Abroad, Online or a city" className="field" /></div>
              <div><label htmlFor="level" className="label">Who it’s for</label><input id="level" name="level" placeholder="Undergraduates" className="field" /></div>
              <div><label htmlFor="value" className="label">Value</label><input id="value" name="value" placeholder="₦500,000 a year" className="field" /></div>
              <div><label htmlFor="closesAt" className="label">Closing date</label><input id="closesAt" name="closesAt" type="date" required className="field" /></div>
              <div className="sm:col-span-2"><label htmlFor="applyUrl" className="label">Official link to apply</label><input id="applyUrl" name="applyUrl" type="url" placeholder="https://" className="field" /></div>
              <div className="sm:col-span-2"><label htmlFor="description" className="label">Description</label><textarea id="description" name="description" className="field" /></div>
              <div><label htmlFor="eligibility" className="label">Who can apply</label><textarea id="eligibility" name="eligibility" className="field !min-h-[110px]" /><p className="hint">One point per line.</p></div>
              <div><label htmlFor="howToApply" className="label">How to apply</label><textarea id="howToApply" name="howToApply" className="field !min-h-[110px]" /><p className="hint">One step per line.</p></div>
              <div className="sm:col-span-2 flex flex-wrap gap-2"><button className="btn btn-sm btn-navy">Add to the review queue</button><Link href="/admin/opportunities" className="btn btn-sm btn-line">Cancel</Link></div>
            </form>
          </Panel>
        ) : selected ? (
          <Detail o={selected} file={file} canPublish={canPublish} tab={tab} />
        ) : (
          <div className="hidden lg:grid place-items-center rounded-[20px] border-2 border-dashed border-adminline min-h-[320px] text-muted p-8 text-center">
            Choose an opportunity to review it.
          </div>
        )}
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Detail({ o, file, canPublish, tab }: { o: any; file: any; canPublish: boolean; tab: string }) {
  const id = String(o._id);
  const days = daysUntil(o.closesAt);
  const linkHost = host(o.applyUrl);
  const mailHost = (o.submitterEmail || "").split("@")[1] || "";
  const sameDomain = linkHost && mailHost && (mailHost.endsWith(linkHost) || linkHost.endsWith(mailHost));
  const checks = [
    { k: "c_provider", on: o.checks?.provider, label: "The provider is a real, registered organisation", fact: o.provider },
    { k: "c_link", on: o.checks?.link, label: "The link goes to the provider’s official site", fact: linkHost ? `Goes to ${linkHost}${sameDomain ? ", same as the sender’s email" : mailHost ? `. Sender’s email is at ${mailHost}` : ""}` : "No link given" },
    { k: "c_free", on: o.checks?.free, label: "Applying is free. No fees or payment asked", fact: /fee|pay|₦\s?\d+ to apply|processing/i.test(`${o.description} ${(o.howToApply || []).join(" ")}`) ? "The text mentions a fee or payment. Read it carefully." : "No mention of fees found" },
    { k: "c_deadline", on: o.checks?.deadline, label: "The closing date is real and still ahead", fact: o.closesAt ? `${shortDate(o.closesAt)}${days !== null ? days >= 0 ? `, in ${days} ${days === 1 ? "day" : "days"}` : ", already passed" : ""}` : "No closing date" },
  ];

  return (
    <div className="grid gap-5 min-w-0">
      <div className="lg:hidden"><Back href={`/admin/opportunities?tab=${tab}`}>All opportunities</Back></div>
      <Panel>
        <div className="flex flex-wrap items-start gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-[14px] text-muted">{o.category} from {o.provider}</p>
            <h2 className="text-[24px] mt-1">{o.title}</h2>
          </div>
          <Status s={o.status} />
        </div>
        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[15px]">
          {[["Where", o.location], ["Who it’s for", o.level], ["Value", o.value], ["Closes", shortDate(o.closesAt)]].map(([k, v]) => (
            <div key={k} className="rounded-[14px] bg-admin p-3"><dt className="text-[13px] text-muted">{k}</dt><dd className="font-semibold mt-0.5">{v || "Not given"}</dd></div>
          ))}
        </dl>
        {o.description && <p className="mt-5 whitespace-pre-line">{o.description}</p>}
        {!!o.eligibility?.length && (<><h3 className="mt-5 text-[17px]">Who can apply</h3><ul className="mt-2 list-disc pl-5 grid gap-1">{o.eligibility.map((e: string) => <li key={e}>{e}</li>)}</ul></>)}
        {!!o.howToApply?.length && (<><h3 className="mt-5 text-[17px]">How to apply</h3><ol className="mt-2 list-decimal pl-5 grid gap-1">{o.howToApply.map((e: string) => <li key={e}>{e}</li>)}</ol></>)}
        <div className="mt-5 pt-4 border-t border-adminline flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          {o.applyUrl && <a href={o.applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="link break-all">{linkHost || "Apply link"}</a>}
          {file && <a href={`/api/admin/files/${file._id}`} className="link inline-flex items-center gap-1.5"><Icon name="download" size={16} />{file.name}</a>}
          {o.submitterName && <span className="text-muted">Sent by {o.submitterName}{o.submitterEmail ? `, ${o.submitterEmail}` : ""}, {ago(o.createdAt)}</span>}
        </div>
      </Panel>

      <Panel title="Before it goes live">
        <form action={reviewOpportunity} className="grid gap-4">
          <input type="hidden" name="id" value={id} />
          <ul className="grid gap-3">
            {checks.map((c) => (
              <li key={c.k}>
                <label className="check rounded-[14px] border border-adminline p-3.5 cursor-pointer has-[:checked]:border-ok has-[:checked]:bg-ok-tint/40">
                  <input type="checkbox" name={c.k} defaultChecked={!!c.on} />
                  <span><span className="font-semibold block">{c.label}</span><span className="text-[14px] text-muted">{c.fact}</span></span>
                </label>
              </li>
            ))}
          </ul>
          <div>
            <label htmlFor="note" className="label">Note to the person who sent it</label>
            <textarea id="note" name="note" defaultValue={o.reviewNote} className="field !min-h-[100px]" placeholder="What needs to change, or why it was declined" />
          </div>
          <div className="flex flex-wrap gap-2">
            {o.status !== "published" && canPublish && <button formAction={reviewOpportunityAs.bind(null, "approve")} className="btn btn-sm btn-coral">Approve and publish</button>}
            {o.status === "pending" && <button formAction={reviewOpportunityAs.bind(null, "changes")} className="btn btn-sm btn-line">Save and ask for changes</button>}
            {o.status === "pending" && <button formAction={reviewOpportunityAs.bind(null, "decline")} className="btn btn-sm btn-line">Decline</button>}
            {o.status === "published" && <button formAction={reviewOpportunityAs.bind(null, "close")} className="btn btn-sm btn-line">Close early</button>}
            {o.status === "published" && <Link href={`/opportunities/${o.slug}`} target="_blank" className="btn btn-sm btn-line"><Icon name="eye" size={17} /> View on site</Link>}
          </div>
        </form>
      </Panel>
    </div>
  );
}
