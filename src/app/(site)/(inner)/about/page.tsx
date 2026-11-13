import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/cards";
import { Arrow, Icon, type IconName } from "@/components/icons";
import { DIVISIONS, PROGRAMMES } from "@/lib/site";

export const metadata: Metadata = {
  title: "About TFN",
  description: "TFN connects tertiary institutions, emerging leaders, academics, policymakers and partners through policy, leadership, research and opportunity.",
};

const APPROACH: { verb: string; line: string; icon: IconName }[] = [
  { verb: "Connect", line: "Relationships across institutions, sectors and communities.", icon: "institutions" },
  { verb: "Convene", line: "Spaces for discussion, learning and collaboration.", icon: "users" },
  { verb: "Develop", line: "Leadership, knowledge and institutional capacity.", icon: "leadership" },
  { verb: "Enable", line: "Routes to opportunities and resources.", icon: "opportunities" },
  { verb: "Share", line: "Research, insights and practical knowledge.", icon: "research" },
  { verb: "Collaborate", line: "Programmes delivered with partners.", icon: "handshake" },
];

const GOVERNANCE = [
  { name: "Governing Board", line: "Oversight and direction" },
  { name: "Executive Leadership", line: "Runs operations and delivers the mandate" },
  { name: "Advisory Council", line: "Specialist advice" },
  { name: "Campus and institutional representatives", line: "On the ground at each institution" },
];

const PEOPLE = [
  { role: "Chair, Governing Board", name: "Prof. Adaeze Nwosu" },
  { role: "Executive Director" },
  { role: "Chair, Advisory Council" },
  { role: "Programmes Lead" },
];

export default function About() {
  return (
    <>
      <section className="wrap pt-6 lg:pt-10 pb-10 grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-12 items-center">
        <div>
          <h1 className="h-page">A network for ideas, institutions and leadership</h1>
          <p className="mt-5 lede text-muted max-w-[42ch]">TFN connects tertiary institutions, emerging leaders, academics, policymakers and partners. We start on campus, and look beyond it.</p>
        </div>
        <Photo src="/photos/audience-listening.jpg" alt="Young people listening during a session" priority className="h-[260px] lg:h-[400px] rounded-[20px]" sizes="(min-width:1024px) 50vw, 100vw" />
      </section>

      <section className="band grad" aria-label="Vision and mission">
        <div className="wrap py-10 lg:py-14 grid md:grid-cols-2 gap-4">
          <article className="glass rounded-[20px] p-6 lg:p-8">
            <h2 className="text-[30px]">Our vision</h2>
            <p className="mt-3 text-cream/85 lede">A connected and empowered network of institutions and emerging leaders contributing to inclusive development, informed public policy and a better-prepared future.</p>
          </article>
          <article className="glass rounded-[20px] p-6 lg:p-8">
            <h2 className="text-[30px]">Our mission</h2>
            <p className="mt-3 text-cream/85 lede">To connect tertiary institutions, emerging leaders, knowledge communities and partners through policy, leadership, research, collaboration and opportunity.</p>
          </article>
        </div>
      </section>

      <section className="wrap py-16 lg:py-24" aria-labelledby="how">
        <h2 id="how" className="h-sec mb-8">How we work</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPROACH.map((a) => (
            <li key={a.verb} className="card p-6 flex gap-4 items-start">
              <span className="w-11 h-11 rounded-[14px] bg-coral-tint text-coral-ink grid place-items-center flex-none"><Icon name={a.icon} size={22} /></span>
              <div>
                <h3 className="text-[24px]">{a.verb}</h3>
                <p className="mt-1 text-muted text-[15px]">{a.line}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="divisions" className="wrap pb-16 lg:pb-24 scroll-mt-6" aria-labelledby="div">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 id="div" className="h-sec">Six divisions, ten programmes</h2>
            <p className="mt-3 text-muted lede">Each division runs part of TFN’s work.</p>
          </div>
          <Link href="/programmes" className="btn btn-sm btn-line">See all ten programmes <Arrow /></Link>
        </div>
        <ul className="grid gap-2.5">
          {DIVISIONS.map((d) => {
            const progs = PROGRAMMES.filter((p) => p.division === d.slug);
            return (
              <li key={d.slug}>
                <details className="group card px-5">
                  <summary className="flex items-center gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="w-10 h-10 rounded-[12px] bg-coral-tint text-coral-ink grid place-items-center flex-none"><Icon name={d.icon} size={20} /></span>
                    <span className="flex-1">
                      <span className="block font-display text-[20px] font-semibold tracking-[-0.025em]">{d.name}</span>
                      <span className="block text-muted text-[15px]">{d.line}</span>
                    </span>
                    <Icon name="chevronDown" size={20} className="flex-none transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="pb-5 pl-14 flex flex-wrap gap-2">
                    {progs.length ? progs.map((p) => (
                      <li key={p.slug}><Link href={`/programmes/${p.slug}`} className="chip">{p.name} <Arrow size={12} /></Link></li>
                    )) : <li className="text-muted text-[15px]">Supports programmes across the network.</li>}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="wrap pb-16 lg:pb-24" aria-labelledby="gov">
        <h2 id="gov" className="h-sec mb-8">How we’re governed</h2>
        <ol className="grid gap-3 max-w-3xl">
          {GOVERNANCE.map((g, i) => (
            <li key={g.name} className="card p-5 flex items-center gap-4" style={{ marginLeft: `min(${i * 28}px, ${i * 4}vw)` }}>
              <span className="w-2.5 self-stretch rounded-full" style={{ background: i === 0 ? "#14213D" : i === 3 ? "#FF6B5B" : "#59627A", opacity: i === 2 ? 0.6 : 1 }} aria-hidden="true" />
              <div>
                <h3 className="text-[21px]">{g.name}</h3>
                <p className="text-muted text-[15px]">{g.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap pb-16 lg:pb-24" aria-labelledby="people">
        <h2 id="people" className="h-sec mb-8">Our people</h2>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PEOPLE.map((p) => (
            <li key={p.role} className="card p-5">
              <span className={`w-16 h-16 rounded-full grid place-items-center font-display text-[22px] font-semibold ${p.name ? "bg-navy text-cream" : "bg-cream text-muted border-[1.5px] border-dashed border-field"}`} aria-hidden="true">
                {p.name ? "AN" : <Icon name="users" size={24} />}
              </span>
              <p className="mt-4 font-display text-[19px] font-semibold tracking-[-0.025em] leading-tight">{p.name ?? "To be announced"}</p>
              <p className="mt-1 text-muted text-[14px]">{p.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap pb-20 lg:pb-28" aria-labelledby="be">
        <div className="band !mx-0 grad p-8 lg:p-14 text-center">
          <h2 id="be" className="h-page">Be part of it</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/join" className="btn btn-coral">Join the Digital Communities <Arrow /></Link>
            <Link href="/partners" className="btn btn-glass">Partner with TFN</Link>
          </div>
        </div>
      </section>
    </>
  );
}
