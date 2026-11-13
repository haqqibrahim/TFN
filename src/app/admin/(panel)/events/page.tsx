import Link from "next/link";
import { Icon } from "@/components/icons";
import { saveEvent, toggleCheckIn } from "@/lib/admin-actions";
import { allowed, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fmtDate, fmtTime } from "@/lib/format";
import { Event, EventRegistration } from "@/lib/models";
import { PROGRAMMES } from "@/lib/site";
import { Back, Flash, PageHead, Panel, Stat, Status, Table } from "../ui";

export const metadata = { title: { absolute: "Events | TFN Admin" } };
const LAGOS = 3600000;
const local = (d?: Date | null) => (d ? new Date(new Date(d).getTime() + LAGOS).toISOString().slice(0, 16) : "");

export default async function Events({ searchParams }: { searchParams: Promise<{ event?: string; q?: string; filter?: string; new?: string; edit?: string; done?: string; err?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  await db();
  const canManage = allowed(me.role, "events");
  const events = await Event.find().sort({ startsAt: -1 }).lean();
  const upcoming = events.filter((e) => +new Date(e.endsAt || e.startsAt) >= Date.now()).reverse();
  const ev = events.find((e) => String(e._id) === sp.event) || upcoming[0] || events[0];

  if (sp.new || sp.edit) {
    const e = sp.edit ? events.find((x) => String(x._id) === sp.edit) : null;
    return (
      <>
        <Back href={`/admin/events${e ? `?event=${e._id}` : ""}`}>Events</Back>
        <PageHead title={e ? `Edit ${e.title}` : "New event"} />
        <Flash err={sp.err === "missing" ? "Add a title and a start time." : null} />
        <Panel>
          <form action={saveEvent} className="grid sm:grid-cols-2 gap-4 max-w-[860px]">
            <input type="hidden" name="id" value={e ? String(e._id) : ""} />
            <div className="sm:col-span-2"><label htmlFor="title" className="label">Title</label><input id="title" name="title" required defaultValue={e?.title} className="field" /></div>
            <div><label htmlFor="programme" className="label">Programme</label>
              <select id="programme" name="programme" defaultValue={e?.programme || ""} className="field"><option value="">None</option>{PROGRAMMES.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}</select></div>
            <div><label htmlFor="theme" className="label">Theme</label><input id="theme" name="theme" defaultValue={e?.theme || ""} className="field" /></div>
            <div><label htmlFor="startsAt" className="label">Starts</label><input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={local(e?.startsAt)} className="field" /></div>
            <div><label htmlFor="endsAt" className="label">Ends</label><input id="endsAt" name="endsAt" type="datetime-local" defaultValue={local(e?.endsAt)} className="field" /><p className="hint">Lagos time.</p></div>
            <div><label htmlFor="venue" className="label">Venue</label><input id="venue" name="venue" defaultValue={e?.venue || ""} className="field" placeholder="Shehu Musa Yar’Adua Centre" /></div>
            <div><label htmlFor="city" className="label">City</label><input id="city" name="city" defaultValue={e?.city || ""} className="field" placeholder="Abuja" /></div>
            <div><label htmlFor="capacity" className="label">Places</label><input id="capacity" name="capacity" inputMode="numeric" defaultValue={e?.capacity || ""} className="field" /><p className="hint">Leave empty for no limit.</p></div>
            <div><label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={e?.status || "draft"} className="field"><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Registration closed</option></select></div>
            <label className="check sm:col-span-2"><input type="checkbox" name="online" defaultChecked={!!e?.online} /> Also streamed online</label>
            <div className="sm:col-span-2"><label htmlFor="summary" className="label">Summary</label><input id="summary" name="summary" defaultValue={e?.summary || ""} className="field" /></div>
            <div className="sm:col-span-2"><label htmlFor="about" className="label">About the event</label><textarea id="about" name="about" defaultValue={e?.about || ""} className="field" /></div>
            <div className="sm:col-span-2 flex gap-2"><button className="btn btn-sm btn-navy">{e ? "Save changes" : "Create event"}</button></div>
          </form>
        </Panel>
      </>
    );
  }

  if (!ev) {
    return (
      <>
        <PageHead title="Events">{canManage && <Link href="/admin/events?new=1" className="btn btn-sm btn-coral"><Icon name="plus" size={17} /> New event</Link>}</PageHead>
        <Panel><p className="text-muted">No events yet.</p></Panel>
      </>
    );
  }

  const all = await EventRegistration.find({ event: ev._id }).sort({ name: 1 }).lean();
  const q = (sp.q || "").toLowerCase();
  const rows = all.filter((r) =>
    (!q || `${r.name} ${r.email} ${r.institution}`.toLowerCase().includes(q)) &&
    (sp.filter === "in" ? r.attendance === "In person" : sp.filter === "online" ? r.attendance === "Online" : sp.filter === "access" ? !!r.access : sp.filter === "here" ? r.checkedIn : true));
  const inPerson = all.filter((r) => r.attendance === "In person").length;
  const here = all.filter((r) => r.checkedIn).length;
  const access = all.filter((r) => r.access).length;
  const back = `/admin/events?event=${ev._id}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}${sp.filter ? `&filter=${sp.filter}` : ""}`;
  const FILTERS = [["", "Everyone"], ["in", "In person"], ["online", "Online"], ["access", "Access needs"], ["here", "Checked in"]];

  return (
    <>
      <PageHead title="Events" sub="Registrations and check-in.">
        {canManage && <Link href="/admin/events?new=1" className="btn btn-sm btn-coral"><Icon name="plus" size={17} /> New event</Link>}
      </PageHead>
      <Flash ok={sp.done === "saved" ? "Event saved." : null} />

      <form className="flex flex-col sm:flex-row gap-2 mb-5">
        <label htmlFor="event" className="sr-only">Event</label>
        <select id="event" name="event" defaultValue={String(ev._id)} className="field sm:max-w-[520px]">
          {upcoming.length > 0 && <optgroup label="Coming up">{upcoming.map((e) => <option key={String(e._id)} value={String(e._id)}>{e.title}, {fmtDate(e.startsAt, "short")}</option>)}</optgroup>}
          <optgroup label="Past">{events.filter((e) => !upcoming.includes(e)).map((e) => <option key={String(e._id)} value={String(e._id)}>{e.title}, {fmtDate(e.startsAt, "short")}</option>)}</optgroup>
        </select>
        <button className="btn btn-sm btn-navy !min-h-12">Show</button>
      </form>

      <Panel className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] text-muted">{ev.programme}</p>
            <h2 className="text-[24px] mt-0.5">{ev.title}</h2>
            <p className="mt-1 text-muted">{fmtDate(ev.startsAt)}, {fmtTime(ev.startsAt)}. {ev.venue}{ev.city && ev.city !== ev.venue ? `, ${ev.city}` : ""}{ev.online && ev.venue !== "Online" ? ", and online" : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Status s={ev.status || "published"} />
            {ev.status === "published" && <Link href={`/events/${ev.slug}`} target="_blank" className="btn btn-sm btn-line"><Icon name="eye" size={17} /> View</Link>}
            {canManage && <Link href={`/admin/events?edit=${ev._id}`} className="btn btn-sm btn-line"><Icon name="edit" size={17} /> Edit</Link>}
          </div>
        </div>
      </Panel>

      <ul className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <Stat k="Registered" v={all.length} n={ev.capacity ? `${Math.max(0, ev.capacity - all.length)} of ${ev.capacity} places left` : "No limit on places"} />
        <Stat k="In person" v={inPerson} n={`${all.length - inPerson} online`} />
        <Stat k="Checked in" v={here} n={inPerson ? `${Math.round((here / inPerson) * 100)}% of in-person` : undefined} />
        <Stat k="Access needs" v={access} n={access ? "Check before the day" : "None shared"} />
      </ul>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <form className="flex gap-2 flex-1" role="search">
          <input type="hidden" name="event" value={String(ev._id)} />
          {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
          <label htmlFor="q" className="sr-only">Search attendees</label>
          <input id="q" name="q" defaultValue={sp.q} placeholder="Search name, email or institution" className="field lg:max-w-[360px]" />
          <button className="btn btn-sm btn-navy !min-h-12">Search</button>
        </form>
        <nav aria-label="Filter attendees" className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <ul className="flex gap-2 w-max">
            {FILTERS.map(([v, l]) => (
              <li key={v}><Link href={`/admin/events?event=${ev._id}${v ? `&filter=${v}` : ""}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`} aria-current={(sp.filter || "") === v ? "page" : undefined} className="chip">{l}</Link></li>
            ))}
          </ul>
        </nav>
        {canManage && <a href={`/api/admin/export/attendees?event=${ev._id}`} className="btn btn-sm btn-line"><Icon name="download" size={17} /> Export</a>}
      </div>

      <Table head={["Name", "Institution", "Attending", "Access needs", "Check-in"]} empty={rows.length ? undefined : all.length ? "No one matches." : "No one has registered yet."}>
        {rows.map((r) => (
          <tr key={String(r._id)}>
            <td><span className="font-semibold block">{r.name}</span><span className="text-[13px] text-muted">{r.email}</span></td>
            <td className="max-w-[240px]"><span className="line-clamp-2">{r.institution}</span>{r.role && <span className="text-[13px] text-muted">{r.role}</span>}</td>
            <td className="whitespace-nowrap">{r.attendance}</td>
            <td className="max-w-[220px] text-[14px]">{r.access || <span className="text-muted">None</span>}</td>
            <td>
              {r.attendance === "In person" ? (
                <form action={toggleCheckIn}>
                  <input type="hidden" name="id" value={String(r._id)} />
                  <input type="hidden" name="back" value={back} />
                  <button disabled={!canManage} aria-pressed={!!r.checkedIn} className={`btn btn-sm whitespace-nowrap ${r.checkedIn ? "bg-ok-tint text-ok" : "btn-line"}`}>
                    {r.checkedIn ? <><Icon name="check" size={16} /> Checked in</> : "Check in"}
                  </button>
                </form>
              ) : <span className="text-[14px] text-muted">Joins online</span>}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
