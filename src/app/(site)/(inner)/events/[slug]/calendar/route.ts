import { eventBySlug } from "@/lib/queries";

function ics(d: string | Date) {
  return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function esc(s = "") {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await eventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const site = process.env.SITE_URL || "https://tfnetwork.org";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tertiary Futures Network//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e._id}@tfnetwork.org`,
    `DTSTAMP:${ics(new Date())}`,
    `DTSTART:${ics(e.startsAt)}`,
    `DTEND:${ics(e.endsAt || new Date(new Date(e.startsAt).getTime() + 2 * 3600000))}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc((e.summary || "") + "\n" + site + "/events/" + e.slug)}`,
    `LOCATION:${esc(e.venue === "Online" ? "Online" : `${e.venue}, ${e.city}`)}`,
    `URL:${site}/events/${e.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}
