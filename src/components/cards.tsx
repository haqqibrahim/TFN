import Image from "next/image";
import Link from "next/link";
import { fmtDate, initials, monthDay } from "@/lib/format";
import type { EventItem, OppItem, PostItem, PubItem } from "@/lib/queries";
import { OPP_ICONS, type Programme } from "@/lib/site";
import { Arrow, Icon } from "./icons";

export function SectionHead({
  title, sub, action, onDark = false, id,
}: { title: string; sub?: string; action?: { href: string; label: string }; onDark?: boolean; id?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-8">
      <div className="max-w-2xl">
        <h2 id={id} className="h-sec">{title}</h2>
        {sub && <p className={`mt-3 lede ${onDark ? "text-cream/75" : "text-muted"}`}>{sub}</p>}
      </div>
      {action && (
        <Link href={action.href} className={`btn btn-sm ${onDark ? "btn-white" : "btn-line"}`}>
          {action.label} <Arrow />
        </Link>
      )}
    </div>
  );
}

export function Photo({ src, alt, className = "", sizes = "(min-width: 1024px) 33vw, 100vw", priority = false, pos, height }: {
  src: string; alt: string; className?: string; sizes?: string; priority?: boolean; pos?: string; height?: number;
}) {
  return (
    <div className={`relative overflow-hidden bg-rule ${className}`} style={height ? { height } : undefined}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={pos ? { objectPosition: pos } : undefined} />
    </div>
  );
}

export function ProgrammeCard({ p, imgH = 230 }: { p: Programme; imgH?: number }) {
  return (
    <Link href={`/programmes/${p.slug}`} className="group card overflow-hidden flex flex-col h-full hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
      <Photo src={p.img} alt={p.alt} pos={p.pos} height={imgH} className="w-full" sizes="(min-width: 1024px) 400px, 100vw" />
      <div className="p-5 pt-4 flex-1 flex flex-col">
        <h3 className="text-[22px] tracking-[-0.03em]">{p.name}</h3>
        <p className="mt-1.5 text-muted text-[15px] flex-1">{p.line}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-[15px]">
          {p.ownChannels ? "About the project" : "Find out more"}
          <Arrow className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function DateTile({ date, onDark = false }: { date: string; onDark?: boolean }) {
  const { month, day } = monthDay(date);
  return (
    <div
      className={`tile flex-none w-[64px] h-[68px] grid place-items-center text-center leading-none ${
        onDark ? "bg-white/12 border border-white/16" : "bg-coral-tint text-coral-ink"
      }`}
    >
      <div>
        <div className="text-[12px] font-semibold tracking-[0.04em]">{month}</div>
        <div className="font-display text-[28px] font-semibold tracking-[-0.04em] mt-1">{day}</div>
      </div>
    </div>
  );
}

export function EventRow({ e }: { e: EventItem }) {
  return (
    <Link href={`/events/${e.slug}`} className="group flex gap-4 items-center card p-3.5 pr-5 hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
      <DateTile date={e.startsAt} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[19px] tracking-[-0.025em] leading-tight">{e.title}</h3>
        <p className="text-muted text-[15px] mt-1 flex items-center gap-1.5">
          <Icon name="pin" size={15} /> {e.venue === "Online" ? "Online" : `${e.venue}, ${e.city}`}
        </p>
      </div>
      <Icon name="chevron" size={20} className="flex-none opacity-60 group-hover:opacity-100" />
    </Link>
  );
}

export function OppCard({ o }: { o: OppItem }) {
  return (
    <Link href={`/opportunities/${o.slug}`} className="group card p-5 flex flex-col h-full hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold">
          <span className="tile w-9 h-9 grid place-items-center bg-coral-tint text-coral-ink !rounded-[12px]">
            <Icon name={OPP_ICONS[o.category] || "opportunities"} size={18} />
          </span>
          {o.category.replace(/s$/, "")}
        </span>
        <span className="text-[13px] font-medium rounded-full bg-cream px-3 py-1">{o.location}</span>
      </div>
      <h3 className="mt-4 text-[21px] tracking-[-0.03em] leading-tight">{o.title}</h3>
      <p className="mt-1 text-muted text-[15px]">{o.provider}</p>
      {o.value && <p className="mt-3 text-[15px] font-medium">{o.value}</p>}
      <div className="mt-auto pt-5 flex items-center justify-between text-[14px]">
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Icon name="clock" size={16} /> Closes {fmtDate(o.closesAt)}
        </span>
        <Arrow className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full bg-coral-tint text-coral-ink font-semibold flex-none"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function PubCard({ p }: { p: PubItem }) {
  const a = p.authors?.[0];
  return (
    <article className="group card p-5 flex flex-col h-full relative hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
      <div className="flex items-center gap-2 text-[14px]">
        <span className="tile w-9 h-9 grid place-items-center bg-navy text-cream !rounded-[12px]">
          <Icon name="doc" size={18} />
        </span>
        <span className="font-semibold">{p.type}</span>
        {p.topic && <span className="text-muted">{p.topic}</span>}
      </div>
      <h3 className="mt-4 text-[21px] tracking-[-0.03em] leading-tight">
        <Link href={`/research/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link>
      </h3>
      <div className="mt-auto pt-5 flex items-center gap-2.5 text-[14px]">
        {a && <Avatar name={a.name} size={30} />}
        <span className="font-medium">{a?.name}</span>
        <span className="ml-auto text-muted whitespace-nowrap">{fmtDate(p.publishedAt, "short")}</span>
        {p.readMinutes && <span className="text-muted whitespace-nowrap">{p.readMinutes} min</span>}
      </div>
    </article>
  );
}

export function NewsCard({ n, big = false }: { n: PostItem; big?: boolean }) {
  return (
    <Link href={`/news/${n.slug}`} className="group card overflow-hidden flex flex-col h-full hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
      {n.image && <Photo src={n.image} alt={n.imageAlt || ""} className={big ? "h-[300px]" : "h-[200px]"} />}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-[14px] font-semibold text-coral-ink">{n.category}</span>
        <h3 className={`mt-2 tracking-[-0.03em] leading-tight ${big ? "text-[28px]" : "text-[20px]"}`}>{n.title}</h3>
        {big && n.summary && <p className="mt-2 text-muted">{n.summary}</p>}
        <p className="mt-auto pt-4 text-[14px] text-muted">{fmtDate(n.publishedAt)}</p>
      </div>
    </Link>
  );
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[15px]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            {i > 0 && <Icon name="chevron" size={14} className="opacity-50" />}
            {it.href ? (
              <Link href={it.href} className="font-medium hover:underline underline-offset-4">{it.label}</Link>
            ) : (
              <span aria-current="page" className="text-muted">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline underline-offset-4">
      <Icon name="back" size={16} /> {label}
    </Link>
  );
}
