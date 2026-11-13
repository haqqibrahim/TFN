import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink, NewsCard, Photo } from "@/components/cards";
import { CopyButton } from "@/components/copy-button";
import { Arrow, WhatsAppLogo } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { latestPosts, postBySlug } from "@/lib/queries";
import { programmeByName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = await postBySlug((await params).slug);
  if (!n) return {};
  return {
    title: n.seoTitle || n.title,
    description: n.seoDescription || n.summary,
    openGraph: { title: n.title, description: n.summary, images: n.image ? [n.image] : undefined, type: "article" },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await postBySlug(slug);
  if (!n) notFound();
  const related = await latestPosts({ limit: 2, exclude: slug });
  const prog = n.programme ? programmeByName(n.programme) : undefined;
  const url = `${process.env.SITE_URL || "https://tfnetwork.org"}/news/${n.slug}`;

  return (
    <>
      <article className="wrap pt-4 lg:pt-6 pb-14">
        <BackLink href="/news" label="News & Events" />
        <header className="mt-6 max-w-3xl">
          <span className="text-[15px] font-semibold text-coral-ink">{n.category.replace(/s$/, "")}</span>
          <h1 className="mt-3 text-[clamp(34px,4.6vw,62px)] leading-[1.02] tracking-[-0.04em]">{n.title}</h1>
          <p className="mt-4 text-muted">By {n.author}, {fmtDate(n.publishedAt)}</p>
        </header>
        {n.image && (
          <figure className="mt-8">
            <Photo src={n.image} alt={n.imageAlt || ""} priority className="h-[260px] sm:h-[400px] lg:h-[520px] rounded-[20px]" sizes="(min-width:1312px) 1200px, 100vw" />
            {n.caption && <figcaption className="mt-3 text-[14px] text-muted">{n.caption}</figcaption>}
          </figure>
        )}
        <div className="mt-10 grid lg:grid-cols-[1fr_280px] gap-10 lg:gap-16">
          <div className="prose-tfn text-[18px] lg:text-[19px] leading-[1.65] max-w-[68ch]" dangerouslySetInnerHTML={{ __html: renderMarkdown(n.body || "") }} />
          <aside className="grid gap-5 content-start lg:sticky lg:top-6">
            <section aria-labelledby="share">
              <h2 id="share" className="text-[18px]">Share</h2>
              <div className="mt-3 flex flex-wrap lg:flex-col gap-2.5">
                <a className="btn btn-line !pl-2.5" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${n.title} ${url}`)}`}>
                  <WhatsAppLogo size={30} /> WhatsApp
                </a>
                <CopyButton text={`/news/${n.slug}`} absolute label="Copy link" done="Link copied" />
              </div>
            </section>
            {prog && (
              <Link href={`/programmes/${prog.slug}`} className="group card overflow-hidden">
                <Photo src={prog.img} alt="" height={120} sizes="280px" />
                <span className="block p-4">
                  <span className="block text-[14px] text-muted">Programme</span>
                  <span className="flex items-center justify-between gap-2 font-display text-[18px] font-semibold tracking-[-0.025em]">{prog.name} <Arrow /></span>
                </span>
              </Link>
            )}
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="wrap pb-20 lg:pb-28" aria-labelledby="rel">
          <h2 id="rel" className="h-sec mb-6">Related</h2>
          <ul className="grid md:grid-cols-2 gap-4">{related.map((r) => <li key={r._id}><NewsCard n={r} /></li>)}</ul>
        </section>
      )}
    </>
  );
}
