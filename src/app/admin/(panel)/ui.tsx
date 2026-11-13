import Link from "next/link";
import { initials } from "@/lib/format";

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px]">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-[20px] border border-adminline p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && <h2 className="text-[20px]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  draft: "bg-[#EEF0F4] text-[#3D4660]",
  brief: "bg-[#EEF0F4] text-[#3D4660]",
  review: "bg-[#FFF1D6] text-[#8A5A00]",
  pending: "bg-[#FFF1D6] text-[#8A5A00]",
  new: "bg-coral-tint text-coral-ink",
  open: "bg-[#FFF1D6] text-[#8A5A00]",
  approved: "bg-[#E3EAFB] text-[#24448F]",
  replied: "bg-[#E3EAFB] text-[#24448F]",
  published: "bg-ok-tint text-ok",
  resolved: "bg-ok-tint text-ok",
  closed: "bg-[#EEF0F4] text-[#3D4660]",
  declined: "bg-[#FDE2E0] text-[#A1271B]",
  high: "bg-[#FDE2E0] text-[#A1271B]",
  medium: "bg-[#FFF1D6] text-[#8A5A00]",
  low: "bg-[#EEF0F4] text-[#3D4660]",
};
const LABELS: Record<string, string> = { review: "In review", brief: "Brief", pending: "Waiting for review" };

export function Status({ s }: { s: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap ${TONES[s] || TONES.draft}`}>
      {LABELS[s] || s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

export function Who({ name }: { name?: string }) {
  if (!name) return <span className="text-muted">None</span>;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="w-7 h-7 rounded-full bg-coral-tint text-coral-ink grid place-items-center text-[11px] font-bold" aria-hidden="true">{initials(name)}</span>
      {name}
    </span>
  );
}

export function Tabs({ items, current }: { items: { href: string; label: string; count?: number }[]; current: string }) {
  return (
    <nav aria-label="Filter" className="-mx-1 px-1 overflow-x-auto no-scrollbar mb-5">
      <ul className="flex gap-2 w-max">
        {items.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="chip !min-h-10" aria-current={current === t.label ? "page" : undefined}>
              {t.label}{typeof t.count === "number" && <span className="opacity-70">{t.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  return (
    <div className="relative bg-white rounded-[20px] border border-adminline overflow-x-auto">
      <table className="w-full text-[15px] min-w-[720px]">
        <thead>
          <tr className="text-left text-[13px] text-muted border-b border-adminline">
            {head.map((h) => <th key={h} scope="col" className="font-semibold px-4 py-3 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-adminline [&>tr:last-child]:border-0 [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle">
          {children}
        </tbody>
      </table>
      {empty && <p className="p-8 text-center text-muted">{empty}</p>}
    </div>
  );
}

export function ago(d?: string | Date) {
  if (!d) return "";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} ${Math.floor(s / 3600) === 1 ? "hour" : "hours"} ago`;
  if (s < 172800) return "Yesterday";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function Flash({ ok, err }: { ok?: string | null; err?: string | null }) {
  if (err) return <p role="alert" className="mb-5 rounded-[14px] bg-[#FDE2E0] text-[#A1271B] px-4 py-3 font-medium">{err}</p>;
  if (ok) return <p role="status" className="mb-5 rounded-[14px] bg-ok-tint text-ok px-4 py-3 font-medium">{ok}</p>;
  return null;
}

export function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-muted hover:text-navy mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      {children}
    </Link>
  );
}

export function Stat({ k, v, n }: { k: string; v: React.ReactNode; n?: string }) {
  return (
    <li className="bg-white rounded-[20px] border border-adminline p-4 sm:p-5">
      <p className="text-[14px] text-muted leading-snug">{k}</p>
      <p className="mt-2 font-display text-[30px] sm:text-[36px] font-semibold tracking-[-0.04em] leading-none">{v}</p>
      {n && <p className="mt-2 text-[13px] text-muted">{n}</p>}
    </li>
  );
}

export function shortDate(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
}
