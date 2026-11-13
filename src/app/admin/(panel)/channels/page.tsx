import Link from "next/link";
import { Icon, WhatsAppLogo, TelegramLogo, XLogo, LinkedInLogo, InstagramLogo } from "@/components/icons";
import { saveChannelPost, saveChannelPostAs, saveIncident } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Channel, ChannelPost, Incident } from "@/lib/models";
import { Back, Flash, PageHead, Panel, Status, ago, shortDate } from "../ui";

export const metadata = { title: { absolute: "Channels | TFN Admin" } };

const PLATFORMS = ["WhatsApp", "Telegram", "X", "LinkedIn", "Instagram"] as const;
const LOGO: Record<string, (p: { size?: number }) => React.ReactNode> = { WhatsApp: WhatsAppLogo, Telegram: TelegramLogo, X: XLogo, LinkedIn: LinkedInLogo, Instagram: InstagramLogo };
const DONE: Record<string, string> = { saved: "Saved.", submit: "Sent for approval.", approve: "Approved and scheduled.", back: "Sent back to draft.", posted: "Marked as posted." };
const ERR: Record<string, string> = { approve: "Only a reviewer or super administrator can approve posts.", own: "Someone else needs to approve a post you wrote." };
const DAY = 86400000;
const LAGOS = 3600000; // UTC+1, no daylight saving

/** yyyy-mm-ddThh:mm in Lagos time, for datetime-local inputs */
const local = (d?: Date | null) => (d ? new Date(new Date(d).getTime() + LAGOS).toISOString().slice(0, 16) : "");
const time = (d: Date) => new Date(d).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });

function Logos({ list, size = 16 }: { list?: string[]; size?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={(list || []).join(", ")}>
      {(list || []).map((c) => { const L = LOGO[c]; return L ? <span key={c} aria-hidden="true"><L size={size} /></span> : null; })}
    </span>
  );
}

export default async function Channels({ searchParams }: { searchParams: Promise<{ id?: string; new?: string; week?: string; done?: string; err?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  await db();

  // Monday of the chosen week, in Lagos time
  const offset = Number(sp.week) || 0;
  const nowLagos = new Date(Date.now() + LAGOS);
  const dow = (nowLagos.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(nowLagos.getUTCFullYear(), nowLagos.getUTCMonth(), nowLagos.getUTCDate() - dow + offset * 7) - LAGOS);
  const sunday = new Date(monday.getTime() + 7 * DAY);

  const [week, waiting, channels, incidents, selected] = await Promise.all([
    ChannelPost.find({ scheduledFor: { $gte: monday, $lt: sunday } }).sort({ scheduledFor: 1 }).lean(),
    ChannelPost.find({ status: "review" }).sort({ scheduledFor: 1 }).lean(),
    Channel.find().sort({ members: -1 }).lean(),
    Incident.find().sort({ status: -1, createdAt: -1 }).limit(12).lean(),
    sp.id && /^[a-f0-9]{24}$/.test(sp.id) ? ChannelPost.findById(sp.id).lean() : null,
  ]);
  const days = Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * DAY));
  const todayKey = new Date(Date.now() + LAGOS).toISOString().slice(0, 10);
  const canApprove = me.role === "Super admin" || me.role === "Reviewer";
  const editing = selected || (sp.new ? { status: "draft", channels: ["WhatsApp", "Telegram"] } : null);

  return (
    <>
      <PageHead title="Channels" sub="What goes out on TFN’s WhatsApp, Telegram and social accounts.">
        <Link href="/admin/channels?new=1" className="btn btn-sm btn-coral"><Icon name="plus" size={17} /> New post</Link>
      </PageHead>
      <Flash ok={sp.done ? DONE[sp.done] : null} err={sp.err ? ERR[sp.err] : null} />

      {editing && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <PostEditor p={editing as any} canApprove={canApprove} me={me.name} />
      )}

      <Panel title={offset === 0 ? "This week" : `Week of ${shortDate(days[0])}`} action={
        <div className="flex gap-1.5">
          <Link href={`/admin/channels?week=${offset - 1}`} aria-label="Previous week" className="w-10 h-10 rounded-full border border-adminline grid place-items-center hover:border-navy"><Icon name="back" size={17} /></Link>
          {offset !== 0 && <Link href="/admin/channels" className="btn btn-sm btn-line">Today</Link>}
          <Link href={`/admin/channels?week=${offset + 1}`} aria-label="Next week" className="w-10 h-10 rounded-full border border-adminline grid place-items-center hover:border-navy"><Icon name="back" size={17} className="rotate-180" /></Link>
        </div>
      }>
        <ol className="grid sm:grid-cols-7 gap-2">
          {days.map((d) => {
            const key = new Date(d.getTime() + LAGOS).toISOString().slice(0, 10);
            const posts = week.filter((p) => new Date(new Date(p.scheduledFor!).getTime() + LAGOS).toISOString().slice(0, 10) === key);
            return (
              <li key={key} className={`rounded-[14px] p-2.5 min-h-[120px] ${key === todayKey ? "bg-coral-tint/60 ring-1 ring-coral/40" : "bg-admin"}`}>
                <p className="text-[13px] font-semibold mb-2">{d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", timeZone: "Africa/Lagos" })}</p>
                <ul className="grid gap-1.5">
                  {posts.map((p) => (
                    <li key={String(p._id)}>
                      <Link href={`/admin/channels?week=${offset}&id=${p._id}`} className="block rounded-[12px] bg-white border border-adminline p-2 hover:border-navy text-[13px]">
                        <span className="flex items-center justify-between gap-1 text-muted">{time(p.scheduledFor!)}<Logos list={p.channels} size={13} /></span>
                        <span className="block font-semibold leading-snug mt-1 line-clamp-2">{p.title}</span>
                        <span className="block mt-1.5"><Status s={p.status || "draft"} /></span>
                      </Link>
                    </li>
                  ))}
                  {!posts.length && <li className="text-[13px] text-muted/70">Nothing planned</li>}
                </ul>
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid xl:grid-cols-2 gap-5 mt-5">
        <Panel title="Waiting for approval">
          {waiting.length ? (
            <ul className="grid gap-2.5">
              {waiting.map((p) => (
                <li key={String(p._id)} className="flex items-center gap-3 rounded-[14px] border border-adminline p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-[13px] text-muted flex items-center gap-2">{p.scheduledFor ? `${shortDate(p.scheduledFor)}, ${time(p.scheduledFor)}` : "Not scheduled"} <Logos list={p.channels} size={13} /></p>
                  </div>
                  <Link href={`/admin/channels?id=${p._id}`} className="btn btn-sm btn-navy">Review</Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted">Nothing waiting.</p>}
        </Panel>

        <Panel title="Official channels">
          <ul className="grid gap-2.5">
            {channels.map((c) => {
              const L = LOGO[c.platform];
              return (
                <li key={String(c._id)} className="flex items-center gap-3 rounded-[14px] border border-adminline p-3">
                  <span className="w-10 h-10 rounded-[12px] bg-admin grid place-items-center flex-none">{L ? <L size={20} /> : null}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-[13px] text-muted truncate">{c.handle}{c.owner ? `, run by ${c.owner}` : ""}</p>
                  </div>
                  <span className="text-right"><span className="block font-display font-semibold text-[18px]">{(c.members || 0).toLocaleString("en-GB")}</span><span className="text-[12px] text-muted">members</span></span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <section id="incidents" className="mt-5 scroll-mt-6">
        <Panel title="Incidents" action={<span className="text-[14px] text-muted">Fake groups, scams and impersonation</span>}>
          <ul className="grid gap-2.5">
            {incidents.map((i) => (
              <li key={String(i._id)} className={`rounded-[14px] border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${i.status === "open" ? "border-coral/40 bg-coral-tint/30" : "border-adminline"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Status s={i.severity || "medium"} /><Status s={i.status || "open"} /></div>
                  <p className="font-semibold mt-1.5">{i.title}</p>
                  {i.detail && <p className="text-[14px] text-muted mt-0.5">{i.detail}</p>}
                  <p className="text-[13px] text-muted mt-1">Logged by {i.reportedBy || "the team"}, {ago(i.createdAt)}</p>
                </div>
                <form action={saveIncident}>
                  <input type="hidden" name="id" value={String(i._id)} />
                  <input type="hidden" name="status" value={i.status === "open" ? "resolved" : "open"} />
                  <button className={`btn btn-sm ${i.status === "open" ? "btn-navy" : "btn-line"}`}>{i.status === "open" ? "Mark resolved" : "Reopen"}</button>
                </form>
              </li>
            ))}
          </ul>
          <details className="mt-4 group">
            <summary className="cursor-pointer btn btn-sm btn-line inline-flex"><Icon name="plus" size={17} /> Log an incident</summary>
            <form action={saveIncident} className="mt-4 grid sm:grid-cols-[1fr_180px] gap-3">
              <div><label htmlFor="i-title" className="label">What happened</label><input id="i-title" name="title" required className="field" placeholder="Fake TFN group on Telegram asking for a ‘registration fee’" /></div>
              <div><label htmlFor="i-sev" className="label">How serious</label><select id="i-sev" name="severity" defaultValue="medium" className="field"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
              <div className="sm:col-span-2"><label htmlFor="i-detail" className="label">Details</label><textarea id="i-detail" name="detail" className="field !min-h-[90px]" placeholder="Where it was seen, who reported it, what you’ve done so far" /></div>
              <div><button className="btn btn-sm btn-navy">Log incident</button></div>
            </form>
          </details>
        </Panel>
      </section>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PostEditor({ p, canApprove, me }: { p: any; canApprove: boolean; me: string }) {
  const id = p._id ? String(p._id) : "";
  const checks = [
    "Links go to tfnetwork.org or an official partner site",
    "No request for money, passwords or bank details",
    "Dates, times and places match the website",
  ];
  return (
    <Panel className="mb-5" title={id ? "Post" : "New post"} action={<Link href="/admin/channels" className="btn btn-sm btn-line">Close</Link>}>
      <div className="lg:hidden -mt-2 mb-2"><Back href="/admin/channels">Calendar</Back></div>
      <form action={saveChannelPost} className="grid lg:grid-cols-[1fr_300px] gap-6">
        <input type="hidden" name="id" value={id} />
        <div className="grid gap-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2"><Status s={p.status || "draft"} />{p.owner && <span className="text-[14px] text-muted">Written by {p.owner}{p.approvedBy ? `, approved by ${p.approvedBy}` : ""}</span>}</div>
          <div><label htmlFor="c-title" className="label">Title</label><input id="c-title" name="title" required defaultValue={p.title} className="field" /><p className="hint">For the team. It isn’t posted.</p></div>
          <div><label htmlFor="c-body" className="label">Message</label><textarea id="c-body" name="body" defaultValue={p.body} className="field" maxLength={1000} /></div>
          <div><label htmlFor="c-link" className="label">Link</label><input id="c-link" name="link" defaultValue={p.link} className="field" placeholder="/opportunities/student-innovation-grant" /></div>
          <fieldset>
            <legend className="label">Where it goes</legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((c) => {
                const L = LOGO[c];
                return (
                  <label key={c} className="cursor-pointer">
                    <input type="checkbox" name="channels" value={c} defaultChecked={(p.channels || []).includes(c)} className="sr-only" />
                    <span className="chip"><L size={16} /> {c}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="max-w-[280px]"><label htmlFor="c-when" className="label">Goes out</label><input id="c-when" name="scheduledFor" type="datetime-local" defaultValue={local(p.scheduledFor)} className="field" /><p className="hint">Lagos time.</p></div>
        </div>
        <div className="grid gap-4 content-start">
          {(p.status === "review" || p.status === "approved") && (
            <div className="rounded-[14px] bg-admin p-4">
              <p className="font-semibold mb-2">Before approving</p>
              <ul className="grid gap-2 text-[14px]">
                {checks.map((c) => <li key={c} className="flex gap-2"><Icon name="check" size={16} className="flex-none mt-0.5 text-ok" />{c}</li>)}
              </ul>
            </div>
          )}
          <div className="grid gap-2">
            <button formAction={saveChannelPostAs.bind(null, "")} className="btn btn-sm btn-line w-full">Save</button>
            {(p.status === "draft" || p.status === "brief") && <button formAction={saveChannelPostAs.bind(null, "submit")} className="btn btn-sm btn-navy w-full">Send for approval</button>}
            {p.status === "review" && canApprove && <button formAction={saveChannelPostAs.bind(null, "approve")} className="btn btn-sm btn-coral w-full">Approve and schedule</button>}
            {(p.status === "review" || p.status === "approved") && canApprove && <button formAction={saveChannelPostAs.bind(null, "back")} className="btn btn-sm btn-line w-full">Send back</button>}
            {p.status === "approved" && <button formAction={saveChannelPostAs.bind(null, "posted")} className="btn btn-sm btn-navy w-full">Mark as posted</button>}
          </div>
          {p.status === "review" && !canApprove && <p className="hint">A reviewer will approve this.</p>}
        </div>
      </form>
    </Panel>
  );
}
