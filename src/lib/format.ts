const tz = "Africa/Lagos";

export function fmtDate(d?: Date | string | null, style: "long" | "short" = "long") {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: tz,
  });
}

export function fmtDay(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz });
}

export function fmtLongDay(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz });
}

export function fmtTime(d: Date | string) {
  return new Date(d)
    .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz })
    .replace(" ", "")
    .toLowerCase();
}

export function monthDay(d: Date | string) {
  const x = new Date(d);
  return {
    month: x.toLocaleDateString("en-GB", { month: "short", timeZone: tz }).toUpperCase(),
    day: x.toLocaleDateString("en-GB", { day: "2-digit", timeZone: tz }),
  };
}

export function daysUntil(d?: Date | string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

export function initials(name: string) {
  return name
    .replace(/^(Dr|Prof|Hon|Mr|Mrs|Ms)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function maskPhone(p?: string | null) {
  if (!p) return "";
  const d = p.replace(/\s+/g, "");
  if (d.length < 6) return d;
  return d.slice(0, 4) + " ••• •• " + d.slice(-2);
}
