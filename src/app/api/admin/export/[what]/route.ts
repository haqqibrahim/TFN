import { allowed, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Activity, Event, EventRegistration, JoinRegistration } from "@/lib/models";

const esc = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows: unknown[][]) => rows.map((r) => r.map(esc).join(",")).join("\r\n");
const day = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export async function GET(req: Request, { params }: { params: Promise<{ what: string }> }) {
  const me = await requireAdmin();
  await db();
  const { what } = await params;
  const url = new URL(req.url);
  let body = "";
  let file = "export.csv";

  if (what === "registrations") {
    if (!allowed(me.role, "registrations")) return new Response("Forbidden", { status: 403 });
    const q: Record<string, unknown> = {};
    for (const k of ["institution", "state"]) if (url.searchParams.get(k)) q[k] = url.searchParams.get(k);
    if (url.searchParams.get("channel")) q.channels = url.searchParams.get("channel");
    const pvc = url.searchParams.get("pvc");
    if (pvc === "Yes" || pvc === "No") q.pvc = pvc;
    const rows = await JoinRegistration.find(q).sort({ createdAt: -1 }).lean();
    body = csv([["First name", "Email", "WhatsApp", "Institution", "State", "Role", "PVC", "Channels", "Email updates", "Joined"],
      ...rows.map((r) => [r.firstName, r.email, r.whatsapp, r.institution, r.state, r.role, r.pvc || "Not asked", (r.channels || []).join(" and "), r.emailUpdates ? "Yes" : "No", day(r.createdAt)])]);
    file = `tfn-registrations-${day(new Date())}.csv`;
    await Activity.create({ who: me.name, what: `exported ${rows.length} registrations`, href: "/admin/registrations" });
  } else if (what === "attendees") {
    if (!allowed(me.role, "events")) return new Response("Forbidden", { status: 403 });
    const ev = await Event.findById(url.searchParams.get("event")).lean();
    if (!ev) return new Response("Not found", { status: 404 });
    const rows = await EventRegistration.find({ event: ev._id }).sort({ name: 1 }).lean();
    body = csv([["Name", "Email", "Institution", "Role", "Attending", "Access needs", "Checked in", "Registered"],
      ...rows.map((r) => [r.name, r.email, r.institution, r.role, r.attendance, r.access, r.checkedIn ? "Yes" : "No", day(r.createdAt)])]);
    file = `${ev.slug}-attendees.csv`;
    await Activity.create({ who: me.name, what: `exported the attendee list for “${ev.title}”`, href: `/admin/events?event=${ev._id}` });
  } else {
    return new Response("Not found", { status: 404 });
  }
  return new Response("﻿" + body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "private, no-store" },
  });
}
