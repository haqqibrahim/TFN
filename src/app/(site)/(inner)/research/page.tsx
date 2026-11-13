import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, PubCard } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { Arrow, Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import { PUB_TYPES } from "@/lib/models";
import { featuredPublication, publications, publicationTypeCounts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Research & Publications",
  description: "Policy briefs, research papers and reports on tertiary education, leadership and public policy in Nigeria, from TFN Research & Insights.",
};

const TOPICS = ["University funding", "Student loans", "Graduate jobs", "Campus housing", "Research funding", "Access and inclusion"];
const TYPE_LABEL: Record<string, string> = {
  "Policy brief": "Policy briefs", "Research paper": "Research papers", Report: "Reports",
  "Working paper": "Working papers", Opinion: "Opinion", "Conference paper": "Conference papers",
};

type SP = { q?: string; topic?: string; type?: string; year?: string; sort?: string };

function qs(sp: SP, patch: Partial<SP>) {
  const n = { ...sp, ...patch };
  const s = new URLSearchParams(Object.entries(n).filter(([, v]) => v) as [string, string][]).toString();
  return `/research${s ? `?${s}` : ""}#results`;
}

export default async function Research({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const type = (PUB_TYPES as readonly string[]).includes(sp.type || "") ? sp.type : undefined;
  const topic = TOPICS.includes(sp.topic || "") ? sp.topic : undefined;
  const filtering = Boolean(sp.q || type || topic || sp.year);
  const [featured, list, counts] = await Promise.all([
    featuredPublication(),
    publications({ q: sp.q?.slice(0, 80), type, topic, year: sp.year, sort: sp.sort }),
    publicationTypeCounts(),
  ]);
  const shown = filtering ? list : list.filter((p) => p.slug !== featured?.slug);
  const thisYear = new Date().getFullYear();

  return (
    <>
      <section className="px-[var(--band)]">
        <div className="grad rounded-[24px] md:rounded-[28px] px-6 sm:px-10 lg:px-14 py-10 lg:py-16">
          <h1 className="h-page max-w-[16ch]">Research and insights for better decisions</h1>
          <form method="get" action="/research#results" role="search" className="mt-8 max-w-2xl">
            <label htmlFor="q" className="sr-only">Search publications</label>
            <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 text-navy">
              <Icon name="search" size={20} className="flex-none text-muted" />
              <input id="q" name="q" type="search" defaultValue={sp.q} placeholder="Search by title, author or topic" className="flex-1 min-w-0 h-11 bg-transparent outline-none text-[16px]" />
              <button className="btn btn-navy btn-sm !min-h-11" type="submit">Search</button>
            </div>
          </form>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Popular topics">
            {TOPICS.map((t) => (
              <li key={t}><Link href={qs({}, { topic: t })} className="inline-flex min-h-10 items-center rounded-full px-4 text-[15px] font-medium glass hover:bg-white/16">{t}</Link></li>
            ))}
          </ul>
        </div>
      </section>

      {featured && !filtering && (
        <section className="wrap pt-12 lg:pt-16" aria-labelledby="feat">
          <h2 id="feat" className="sr-only">Featured publication</h2>
          <article className="card p-6 sm:p-8 lg:p-10 grid lg:grid-cols-[1.4fr_1fr] gap-8 relative">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-coral-tint text-coral-ink px-3 py-1 text-[14px] font-semibold">
                <Icon name="doc" size={16} /> New {featured.type.toLowerCase()}
              </span>
              <h3 className="mt-4 text-[30px] lg:text-[40px] leading-[1.05]">
                <Link href={`/research/${featured.slug}`} className="after:absolute after:inset-0">{featured.title}</Link>
              </h3>
              <p className="mt-3 text-muted lede">{featured.summary}</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar name={featured.authors[0]?.name || "TFN"} size={40} />
                <div className="text-[15px]">
                  <p className="font-semibold">{featured.authors.map((a) => a.name).join(" and ")}</p>
                  <p className="text-muted">{fmtDate(featured.publishedAt)}, {featured.readMinutes} min read</p>
                </div>
              </div>
            </div>
            {featured.findings && featured.findings.length > 0 && (
              <ul className="grid gap-3 self-center">
                {featured.findings.slice(0, 2).map((f) => (
                  <li key={f.figure} className="rounded-[14px] bg-cream p-4">
                    <p className="font-display text-[34px] font-semibold tracking-[-0.04em] leading-none">{f.figure}</p>
                    <p className="mt-1.5 text-[14px] text-muted">{f.line}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      )}

      {!filtering && (
        <section className="wrap pt-12 lg:pt-16" aria-labelledby="types">
          <h2 id="types" className="h-sec mb-6">Browse by type</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PUB_TYPES.map((t) => (
              <li key={t}>
                <Link href={qs({}, { type: t })} className="group card p-4 flex flex-col h-full hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
                  <span className="w-9 h-9 rounded-[12px] bg-navy text-cream grid place-items-center"><Icon name="doc" size={18} /></span>
                  <span className="mt-3 font-semibold leading-tight">{TYPE_LABEL[t]}</span>
                  <span className="mt-auto pt-2 text-[14px] text-muted">{counts[t] || 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="results" className="wrap py-12 lg:py-16 scroll-mt-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start [&>*]:min-w-0" aria-labelledby="all">
        <form method="get" action="/research#results" className="card p-5 grid gap-4 lg:sticky lg:top-6" aria-label="Filter publications">
          {sp.q && <input type="hidden" name="q" value={sp.q} />}
          <h2 className="text-[20px]">Filter</h2>
          <div>
            <label htmlFor="topic" className="label">Topic</label>
            <select id="topic" name="topic" defaultValue={topic || ""} className="field">
              <option value="">All topics</option>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="type" className="label">Type</label>
            <select id="type" name="type" defaultValue={type || ""} className="field">
              <option value="">All types</option>
              {PUB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="label">Year</label>
            <select id="year" name="year" defaultValue={sp.year || ""} className="field">
              <option value="">Any year</option>
              {[thisYear, thisYear - 1, thisYear - 2].map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="label">Sort by</label>
            <select id="sort" name="sort" defaultValue={sp.sort || ""} className="field">
              <option value="">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <button className="btn btn-navy" type="submit">Show results</button>
          {filtering && <Link href="/research#results" className="text-center link text-[15px]">Clear filters</Link>}
        </form>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-6">
            <h2 id="all" className="h-sec">{filtering ? "Results" : "Latest publications"}</h2>
            <p className="text-muted" aria-live="polite">
              {list.length} {list.length === 1 ? "publication" : "publications"}
              {sp.q ? ` for “${sp.q.slice(0, 80)}”` : ""}{topic ? ` on ${topic.toLowerCase()}` : ""}
            </p>
          </div>
          {shown.length ? (
            <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {shown.map((p) => <li key={p._id}><PubCard p={p} /></li>)}
            </ul>
          ) : (
            <div className="card p-8 text-center">
              <p className="font-display text-[24px] font-semibold tracking-[-0.03em]">No publications match that search</p>
              <p className="mt-2 text-muted">Try a broader word, or browse by topic.</p>
              <Link href="/research#results" className="mt-5 btn btn-line">Clear filters</Link>
            </div>
          )}
        </div>
      </section>

      <section className="wrap pb-12 lg:pb-16" aria-labelledby="publish">
        <div className="card p-6 sm:p-10 grid lg:grid-cols-[1fr_1.6fr] gap-8">
          <div>
            <h2 id="publish" className="h-sec">Publish with TFN</h2>
            <p className="mt-3 text-muted">Researchers, academics and students can propose papers, briefs and commentary.</p>
            <Link href="/contact?topic=Research" className="mt-6 btn btn-navy">Propose a publication <Arrow /></Link>
          </div>
          <ol className="grid sm:grid-cols-3 gap-3">
            {[
              { t: "Send a short proposal", l: "Your question, method and what you expect to find." },
              { t: "Work with an editor", l: "We help shape it for decision-makers." },
              { t: "Published and shared", l: "On the site and across the Digital Communities." },
            ].map((s, i) => (
              <li key={s.t} className="rounded-[14px] bg-cream p-5">
                <span className="w-9 h-9 rounded-full bg-navy text-cream grid place-items-center font-semibold">{i + 1}</span>
                <h3 className="mt-3 text-[19px]">{s.t}</h3>
                <p className="mt-1 text-[15px] text-muted">{s.l}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band grad mb-0" aria-labelledby="phone">
        <div className="wrap py-10 flex flex-col lg:flex-row lg:items-center gap-6">
          <h2 id="phone" className="h-sec flex-1">New research, straight to your phone</h2>
          <div className="flex flex-wrap gap-3"><ChannelButtons /></div>
        </div>
      </section>
    </>
  );
}
