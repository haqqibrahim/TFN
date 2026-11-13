import Link from "next/link";
import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { Activity, ChannelPost, Enquiry, Incident, JoinRegistration, Opportunity, Post, Publication } from "@/lib/models";
import { Panel, Status, Who, ago } from "./ui";

export const metadata = { title: { absolute: "Dashboard | TFN Admin" } };

const WEEK = 7 * 86400000;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string; done?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  await db();
  const now = Date.now();
  const weekStart = new Date(now - WEEK);
  const [thisWeek, lastWeek, pendingOpps, reviewPosts, reviewNews, reviewPubs, closing, incidents, activity, byChannel, weeks, newInbox] = await Promise.all([
    JoinRegistration.countDocuments({ createdAt: { $gte: weekStart } }),
    JoinRegistration.countDocuments({ createdAt: { $gte: new Date(now - 2 * WEEK), $lt: weekStart } }),
    Opportunity.find({ status: "pending" }).sort({ createdAt: -1 }).limit(3).lean(),
    ChannelPost.find({ status: "review" }).sort({ scheduledFor: 1 }).limit(3).lean(),
    Post.find({ status: "review" }).limit(3).lean(),
    Publication.find({ status: "review" }).limit(3).lean(),
    Opportunity.find({ status: "published", closesAt: { $gte: new Date(), $lte: new Date(now + WEEK) } }).sort({ closesAt: 1 }).lean(),
    Incident.find({ status: "open" }).sort({ createdAt: -1 }).lean(),
    Activity.find().sort({ createdAt: -1 }).limit(6).lean(),
    JoinRegistration.aggregate([{ $match: { createdAt: { $gte: weekStart } } }, { $unwind: "$channels" }, { $group: { _id: "$channels", n: { $sum: 1 } } }]),
    JoinRegistration.aggregate([
      { $match: { createdAt: { $gte: new Date(now - 8 * WEEK) } } },
      { $group: { _id: { $floor: { $divide: [{ $subtract: [new Date(now), "$createdAt"] }, WEEK] } }, n: { $sum: 1 } } },
    ]),
    Enquiry.countDocuments({ status: "new" }),
  ]);
  const series = Array.from({ length: 8 }, (_, i) => {
    const idx = 7 - i;
    return { n: weeks.find((w) => w._id === idx)?.n || 0, end: new Date(now - idx * WEEK) };
  });
  const max = Math.max(1, ...series.map((s) => s.n));
  const change = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
  const waiting = pendingOpps.length + reviewPosts.length + reviewNews.length + reviewPubs.length;
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const waitingNote = [
    pendingOpps.length && plural(pendingOpps.length, "opportunity", "opportunities"),
    reviewPosts.length && plural(reviewPosts.length, "channel post", "channel posts"),
    reviewNews.length + reviewPubs.length && plural(reviewNews.length + reviewPubs.length, "story or paper", "stories and papers"),
  ].filter(Boolean).join(", ");
  const ch = Object.fromEntries(byChannel.map((c) => [c._id, c.n]));
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const top = incidents.find((i) => i.severity === "high") || incidents[0];

  const attention = [
    ...reviewPosts.map((p) => ({ kind: "Channel post", title: p.title, note: p.scheduledFor ? `For ${fmtDate(p.scheduledFor, "short")}` : "", status: "review", href: `/admin/channels?id=${p._id}`, cta: "Review" })),
    ...pendingOpps.map((o) => ({ kind: "Opportunity", title: o.title, note: o.provider, status: "pending", href: `/admin/opportunities?id=${o._id}`, cta: "Review" })),
    ...reviewNews.map((p) => ({ kind: "News", title: p.title, note: p.updatedBy ? `From ${p.updatedBy}` : "", status: "review", href: `/admin/content/post/${p._id}`, cta: "Review" })),
    ...reviewPubs.map((p) => ({ kind: "Publication", title: p.title, note: "", status: "review", href: `/admin/content/publication/${p._id}`, cta: "Review" })),
  ].slice(0, 5);

  return (
    <>
      {sp.done === "password" && <p role="status" className="mb-4 rounded-[14px] bg-ok-tint text-ok px-4 py-3 font-medium">Password saved. Use it next time you sign in.</p>}
      {sp.denied && (
        <p role="alert" className="mb-4 rounded-[14px] bg-coral-tint text-coral-ink px-4 py-3 font-medium">Your role doesn’t have access to that area. Ask a super administrator if you need it.</p>
      )}
      <div className="mb-6">
        <h1 className="text-[28px] sm:text-[32px]">{greet}, {me.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" })}</p>
      </div>

      {top && (
        <div className="mb-5 rounded-[20px] grad p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-11 h-11 rounded-[14px] bg-coral text-navy grid place-items-center flex-none"><Icon name="alert" size={22} /></span>
          <div className="flex-1">
            <p className="font-semibold">{top.title}</p>
            {top.detail && <p className="text-cream/75 text-[15px]">{top.detail}</p>}
          </div>
          <Link href="/admin/channels#incidents" className="btn btn-sm btn-white self-start sm:self-auto">Open incident</Link>
        </div>
      )}

      <ul className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { k: "New registrations this week", v: thisWeek.toLocaleString("en-GB"), n: change === null ? "First week of data" : change === 0 ? "Same as last week" : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% on last week`, href: "/admin/registrations" },
          { k: "Waiting for your approval", v: waiting, n: waitingNote || "Nothing waiting", href: "/admin/opportunities" },
          { k: "Opportunities closing in 7 days", v: closing.length, n: closing[0] ? `Next: ${fmtDate(closing[0].closesAt, "short")}` : "None this week", href: "/admin/opportunities?tab=published" },
          { k: "New messages", v: newInbox, n: `${incidents.length} open ${incidents.length === 1 ? "incident" : "incidents"}`, href: "/admin/inbox" },
        ].map((s) => (
          <li key={s.k}>
            <Link href={s.href} className="block bg-white rounded-[20px] border border-adminline p-4 sm:p-5 h-full hover:border-navy transition-colors">
              <p className="text-[14px] text-muted leading-snug">{s.k}</p>
              <p className="mt-2 font-display text-[32px] sm:text-[40px] font-semibold tracking-[-0.04em] leading-none">{s.v}</p>
              <p className="mt-2 text-[13px] text-muted">{s.n}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5 [&>*]:min-w-0">
        <Panel title="Digital Communities registrations" action={<Link href="/admin/registrations" className="btn btn-sm btn-line">Full report</Link>}>
          <figure>
            <div className="flex items-end gap-2 sm:gap-3 h-[200px]" role="img" aria-label={`Weekly registrations for the last 8 weeks: ${series.map((s) => s.n).join(", ")}`}>
              {series.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[12px] font-semibold">{s.n}</span>
                  <span className={`w-full rounded-t-[8px] ${i === 7 ? "bg-coral" : "bg-navy"}`} style={{ height: `${Math.max(3, (s.n / max) * 150)}px` }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 sm:gap-3 mt-2 text-[11px] sm:text-[12px] text-muted">
              {series.map((s, i) => <span key={i} className="flex-1 text-center">{s.end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>)}
            </div>
          </figure>
          <div className="mt-5 pt-4 border-t border-adminline flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <span className="text-muted">By channel this week:</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#25D366] mr-1.5" />WhatsApp <b>{ch.WhatsApp || 0}</b></span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#229ED9] mr-1.5" />Telegram <b>{ch.Telegram || 0}</b></span>
          </div>
        </Panel>

        <Panel title="Needs your attention">
          {attention.length ? (
            <ul className="grid grid-cols-1 gap-2.5 [&>li]:min-w-0">
              {attention.map((a) => (
                <li key={a.href} className="flex items-center gap-3 rounded-[14px] border border-adminline p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-muted">{a.kind}</p>
                    <p className="font-semibold leading-tight truncate">{a.title}</p>
                    <div className="mt-1.5 flex items-center gap-2"><Status s={a.status} /> <span className="text-[13px] text-muted truncate">{a.note}</span></div>
                  </div>
                  <Link href={a.href} className="btn btn-sm btn-navy">{a.cta}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Nothing waiting. Nice work.</p>
          )}
        </Panel>
      </div>

      <Panel title="Recent activity" className="mt-5">
        <ul className="grid grid-cols-1 gap-3 [&>li]:min-w-0">
          {activity.map((a) => (
            <li key={String(a._id)} className="flex items-center gap-3 text-[15px]">
              <Who name={a.who || ""} />
              <span className="text-muted flex-1 min-w-0 truncate">{a.what}</span>
              <span className="text-[13px] text-muted whitespace-nowrap">{ago(a.createdAt)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
