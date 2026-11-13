import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Breadcrumb, PubCard } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { Cite } from "@/components/cite";
import { Arrow, Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import { headings, renderMarkdown } from "@/lib/markdown";
import { publicationBySlug, publications } from "@/lib/queries";
import { slugify } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await publicationBySlug((await params).slug);
  if (!p) return {};
  return { title: `${p.title} | TFN Research`, description: p.summary };
}

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await publicationBySlug(slug);
  if (!p) notFound();
  const related = (await publications({}, 8)).filter((x) => x.slug !== p.slug).sort((a, b) => Number(b.topic === p.topic) - Number(a.topic === p.topic)).slice(0, 3);
  const hs = headings(p.body || "");
  const html = renderMarkdown(p.body || "").replace(/<h2>(.*?)<\/h2>/g, (_m, t) => `<h2 id="${slugify(t.replace(/<[^>]+>/g, ""))}">${t}</h2>`);
  const toc = [
    ...(p.findings?.length ? [{ id: "findings", label: "Key findings" }] : []),
    { id: "summary", label: "Summary" },
    ...hs.map((h) => ({ id: slugify(h), label: h })),
    { id: "authors", label: "Authors" },
    { id: "cite", label: "Cite this" },
  ];
  const year = new Date(p.publishedAt || Date.now()).getFullYear();

  return (
    <>
      <section className="wrap pt-4 lg:pt-6 pb-10">
        <Breadcrumb items={[{ href: "/research", label: "Research" }, { href: `/research?type=${encodeURIComponent(p.type)}#results`, label: p.type }, { label: p.title }]} />
        <div className="mt-6 max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-coral-tint text-coral-ink px-3 py-1 text-[14px] font-semibold"><Icon name="doc" size={16} /> {p.type}</span>
          <h1 className="mt-4 text-[clamp(34px,4.4vw,60px)] leading-[1.02] tracking-[-0.04em]">{p.title}</h1>
          {p.summary && <p className="mt-4 lede text-muted max-w-[52ch]">{p.summary}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
            <span className="flex items-center gap-2">
              <span className="flex -space-x-2">{p.authors.map((a) => <span key={a.name} className="ring-2 ring-cream rounded-full"><Avatar name={a.name} size={34} /></span>)}</span>
              <span className="font-semibold">{p.authors.map((a) => a.name).join(" and ")}</span>
            </span>
            <span className="flex flex-wrap gap-2 text-muted">
              <span className="rounded-full bg-white px-3 py-1">{fmtDate(p.publishedAt)}</span>
              {p.pages && <span className="rounded-full bg-white px-3 py-1">{p.pages} pages</span>}
              {p.readMinutes && <span className="rounded-full bg-white px-3 py-1">{p.readMinutes} min read</span>}
            </span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {p.pdfUrl ? (
              <a href={p.pdfUrl} className="btn btn-navy" download><Icon name="download" size={18} /> Download PDF</a>
            ) : (
              <Link href={`/contact?topic=Research`} className="btn btn-navy"><Icon name="mail" size={18} /> Request the PDF</Link>
            )}
            <a href="#cite" className="btn btn-line">Cite</a>
          </div>
        </div>
      </section>

      <div className="wrap pb-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-8 lg:gap-12 items-start [&>*]:min-w-0">
        <nav aria-label="On this page" className="hidden lg:block sticky top-6">
          <p className="font-semibold text-[15px]">On this page</p>
          <ul className="mt-3 grid gap-1 border-l-2 border-rule">
            {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="block -ml-0.5 border-l-2 border-transparent hover:border-coral pl-3 py-1 text-[15px] text-muted hover:text-navy">{t.label}</a></li>)}
          </ul>
        </nav>

        <article className="grid gap-12">
          {p.findings && p.findings.length > 0 && (
            <section id="findings" aria-labelledby="findings-h" className="scroll-mt-6">
              <h2 id="findings-h" className="text-[30px]">Key findings</h2>
              <ul className="mt-5 grid gap-3">
                {p.findings.map((f) => (
                  <li key={f.figure} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <p className="font-display text-[44px] font-semibold tracking-[-0.045em] leading-none text-navy sm:w-[170px] flex-none">{f.figure}</p>
                    <p className="text-muted">{f.line}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section id="summary" className="scroll-mt-6">
            <h2 className="text-[30px] mb-4">Summary</h2>
            <div className="prose-tfn text-[17px] lg:text-[18px] [&_h2]:scroll-mt-6" dangerouslySetInnerHTML={{ __html: html }} />
          </section>
          <section className="grad rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center gap-5" aria-label="Full publication">
            <span className="w-14 h-14 rounded-[14px] bg-white/12 grid place-items-center text-coral flex-none"><Icon name="doc" size={28} /></span>
            <div className="flex-1">
              <p className="font-display text-[22px] font-semibold tracking-[-0.03em]">Read the full {p.type.toLowerCase()}</p>
              <p className="text-cream/75 text-[15px]">PDF{p.pages ? `, ${p.pages} pages` : ""}{p.pdfSize ? `, ${p.pdfSize}` : ""}</p>
            </div>
            {p.pdfUrl ? <a href={p.pdfUrl} download className="btn btn-coral">Download <Icon name="download" size={18} /></a> : <Link href="/contact?topic=Research" className="btn btn-coral">Request it</Link>}
          </section>
          <section id="authors" className="scroll-mt-6" aria-labelledby="authors-h">
            <h2 id="authors-h" className="text-[30px]">Authors</h2>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3">
              {p.authors.map((a) => (
                <li key={a.name} className="card p-5 flex gap-4 items-center">
                  <Avatar name={a.name} size={52} />
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-[14px] text-coral-ink font-medium">{a.role}</p>
                    <p className="text-[14px] text-muted">{a.affiliation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="grid gap-5 lg:sticky lg:top-6">
          <section className="card p-5" aria-labelledby="glance">
            <h2 id="glance" className="text-[20px]">At a glance</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
              <dt className="text-muted">Type</dt><dd className="font-medium">{p.type}</dd>
              {p.programme && <><dt className="text-muted">Programme</dt><dd className="font-medium">{p.programme}</dd></>}
              {p.topic && <><dt className="text-muted">Topic</dt><dd className="font-medium">{p.topic}</dd></>}
              <dt className="text-muted">Published</dt><dd className="font-medium">{fmtDate(p.publishedAt)}</dd>
            </dl>
            {p.tags && p.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => <li key={t}><Link href={`/research?q=${encodeURIComponent(t)}#results`} className="chip !min-h-9 !text-[14px]">{t}</Link></li>)}
              </ul>
            )}
          </section>
          <section id="cite" className="card p-5 scroll-mt-6" aria-labelledby="cite-h">
            <h2 id="cite-h" className="text-[20px] mb-3">Cite this</h2>
            <Cite title={p.title} authors={p.authors} year={year} url={`${process.env.SITE_URL || "https://tfnetwork.org"}/research/${p.slug}`} />
          </section>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="wrap pb-16 lg:pb-24" aria-labelledby="rel">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 id="rel" className="h-sec">Related publications</h2>
            <Link href="/research" className="btn btn-sm btn-line">All publications <Arrow /></Link>
          </div>
          <ul className="grid md:grid-cols-3 gap-4">{related.map((r) => <li key={r._id}><PubCard p={r} /></li>)}</ul>
        </section>
      )}

      <section className="band grad" aria-labelledby="phone">
        <div className="wrap py-10 flex flex-col lg:flex-row lg:items-center gap-6">
          <h2 id="phone" className="h-sec flex-1">New research, straight to your phone</h2>
          <div className="flex flex-wrap gap-3"><ChannelButtons /></div>
        </div>
      </section>
    </>
  );
}
