import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink, Photo } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { Arrow, Icon } from "@/components/icons";
import { DIVISIONS, PROGRAMMES, programmeBySlug } from "@/lib/site";

export function generateStaticParams() {
  return PROGRAMMES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = programmeBySlug((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.intro };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = programmeBySlug((await params).slug);
  if (!p) notFound();
  const division = DIVISIONS.find((d) => d.slug === p.division);

  const others = PROGRAMMES.filter((o) => o.slug !== p.slug && o.slug !== "digital-communities").slice(0, 9)
    .sort((a, b) => Number(b.division === p.division) - Number(a.division === p.division)).slice(0, 3);
  const isTDC = p.slug === "digital-communities";

  return (
    <>
      <section className="wrap pt-4 lg:pt-6 pb-10">
        <BackLink href="/programmes" label="All programmes" />
        <div className="mt-6 grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-12 items-center">
          <div>
            {division && (
              <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-coral-ink">
                <Icon name={division.icon} size={18} /> {division.name}
              </span>
            )}
            <h1 className="mt-3 h-page">{p.name}</h1>
            <p className="mt-4 lede text-muted max-w-[44ch]">{p.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={p.primary.href} className="btn btn-navy">{p.primary.label} <Arrow /></Link>
              {p.secondary && <Link href={p.secondary.href} className="btn btn-line">{p.secondary.label}</Link>}
            </div>
          </div>
          <Photo src={p.img} alt={p.alt} priority pos={p.pos} className="h-[260px] lg:h-[420px] rounded-[20px]" sizes="(min-width:1024px) 50vw, 100vw" />
        </div>
      </section>

      {isTDC && (
        <section className="band grad" aria-labelledby="follow">
          <div className="wrap py-10 lg:py-12 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <h2 id="follow" className="h-sec">Follow an official channel</h2>
              <p className="mt-2 text-cream/80">Free. Unfollow any time. No group chats.</p>
            </div>
            <div className="flex flex-wrap gap-3"><ChannelButtons /></div>
          </div>
        </section>
      )}

      {p.ownChannels && (
        <section className="wrap pb-6" aria-label="About GOTV data">
          <div className="rounded-[20px] bg-coral-tint p-5 flex gap-4 items-start">
            <Icon name="shield" size={24} className="text-coral-ink flex-none mt-0.5" />
            <p>This project runs its own channels and has its own privacy notice. Registrations for TFN’s Digital Communities are never shared with it.</p>
          </div>
        </section>
      )}

      <section className="wrap py-12 lg:py-16 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-14" aria-label="About the programme">
        <div>
          <h2 className="h-sec">{p.formatsTitle}</h2>
          <p className="mt-3 text-muted">{p.approach}</p>
          <ul className="mt-6 grid gap-2.5">
            {p.formats.map((f) => (
              <li key={f.name} className="card p-4 sm:p-5 flex items-start gap-4">
                <span className="w-9 h-9 rounded-[12px] bg-coral-tint text-coral-ink grid place-items-center flex-none"><Icon name="check" size={18} strokeWidth={2.2} /></span>
                <div>
                  <h3 className="text-[19px] tracking-[-0.02em]">{f.name}</h3>
                  <p className="text-muted text-[15px]">{f.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="h-sec">Who it’s for</h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {p.serves.map((a) => <li key={a} className="chip !cursor-default">{a}</li>)}
          </ul>
        </div>
      </section>

      {!isTDC && (
        <section className="wrap pb-12 lg:pb-16" aria-labelledby="host">
          <div className="band !mx-0 grad p-6 sm:p-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <h2 id="host" className="h-sec">Host or support {p.short.startsWith("Policy Forum") ? "a forum" : "this programme"}</h2>
              <p className="mt-2 text-cream/80 max-w-[48ch]">Institutions and organisations can host, fund or co-deliver {p.name} with us.</p>
            </div>
            <Link href="/partners#enquiry" className="btn btn-white self-start md:self-auto">Partner with TFN <Arrow /></Link>
          </div>
        </section>
      )}

      <section className="wrap pb-20 lg:pb-28" aria-labelledby="others">
        <h2 id="others" className="h-sec mb-6">Other programmes</h2>
        <ul className="grid sm:grid-cols-3 gap-4">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/programmes/${o.slug}`} className="group card overflow-hidden flex flex-col h-full hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
                <Photo src={o.img} alt={o.alt} height={150} sizes="(min-width:640px) 33vw, 100vw" />
                <span className="p-4 flex items-center justify-between gap-3 font-display text-[18px] font-semibold tracking-[-0.025em] leading-tight">
                  {o.name} <Arrow className="flex-none" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
