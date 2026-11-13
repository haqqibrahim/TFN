import type { Metadata } from "next";
import Link from "next/link";
import { EventRow, NewsCard, Photo } from "@/components/cards";
import { NEWS_CATEGORIES } from "@/lib/models";
import { latestPosts, upcomingEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "News & Events",
  description: "TFN news, programme updates, announcements and upcoming events across Nigeria’s tertiary institutions.",
};

const GALLERY = [
  { src: "/photos/auditorium-full.jpg", alt: "A packed conference hall during a session" },
  { src: "/photos/workshop-speaker.jpg", alt: "A speaker presenting at a development workshop" },
  { src: "/photos/students-steps.jpg", alt: "Students standing together on campus steps" },
  { src: "/photos/computer-lab.jpg", alt: "Students working in a computer lab" },
  { src: "/photos/audience-hands.jpg", alt: "Students raising their hands in a lecture hall" },
];

export default async function News({ searchParams }: { searchParams: Promise<{ category?: string; more?: string }> }) {
  const sp = await searchParams;
  const category = (NEWS_CATEGORIES as readonly string[]).includes(sp.category || "") ? sp.category : undefined;
  const limit = sp.more ? 30 : 7;
  const [events, posts] = await Promise.all([upcomingEvents(4), latestPosts({ category, limit: limit + 1 })]);
  const hasMore = posts.length > limit;
  const list = posts.slice(0, limit);
  const [lead, ...rest] = list;

  return (
    <>
      <section className="wrap pt-6 lg:pt-10 pb-8">
        <h1 className="h-page">News, events and updates</h1>
        <p className="mt-4 lede text-muted">What’s happening across the network.</p>
      </section>

      {events.length > 0 && (
        <section id="events" className="wrap pb-12 lg:pb-16 scroll-mt-4" aria-labelledby="coming">
          <h2 id="coming" className="h-sec mb-6">Coming up</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {events.map((e) => <li key={e._id}><EventRow e={e} /></li>)}
          </ul>
        </section>
      )}

      <section id="latest" className="wrap pb-12 lg:pb-16 scroll-mt-4" aria-labelledby="latest-h">
        <h2 id="latest-h" className="h-sec mb-5">Latest news</h2>
        <nav aria-label="News categories" className="-mx-[var(--pad)] px-[var(--pad)] overflow-x-auto no-scrollbar mb-6">
          <ul className="flex gap-2 w-max">
            <li><Link href="/news#latest" scroll={false} className="chip" aria-current={!category ? "page" : undefined}>All</Link></li>
            {NEWS_CATEGORIES.map((c) => (
              <li key={c}><Link href={`/news?category=${encodeURIComponent(c)}#latest`} scroll={false} className="chip" aria-current={category === c ? "page" : undefined}>{c}</Link></li>
            ))}
            <li><a href="#gallery" className="chip">Gallery</a></li>
          </ul>
        </nav>
        {lead ? (
          <>
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
              <NewsCard n={lead} big />
              <ul className="grid gap-4">
                {rest.slice(0, 2).map((n) => <li key={n._id}><NewsCard n={n} /></li>)}
              </ul>
            </div>
            {rest.length > 2 && (
              <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.slice(2).map((n) => <li key={n._id}><NewsCard n={n} /></li>)}
              </ul>
            )}
            {hasMore && (
              <div className="mt-6 text-center">
                <Link href={`/news?${category ? `category=${encodeURIComponent(category)}&` : ""}more=1#latest`} scroll={false} className="btn btn-line">Load more news</Link>
              </div>
            )}
          </>
        ) : (
          <div className="card p-8 text-center">
            <p className="font-display text-[24px] font-semibold tracking-[-0.03em]">No {category?.toLowerCase()} yet</p>
            <Link href="/news#latest" className="mt-4 btn btn-line">See all news</Link>
          </div>
        )}
      </section>

      <section id="gallery" className="wrap pb-20 lg:pb-28 scroll-mt-4" aria-labelledby="gal">
        <h2 id="gal" className="h-sec mb-6">From the gallery</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:h-[420px]">
          {GALLERY.map((g, i) => (
            <li key={g.src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <Photo src={g.src} alt={g.alt} className={`rounded-[20px] h-full ${i === 0 ? "min-h-[240px]" : "min-h-[140px]"}`} sizes={i === 0 ? "(min-width:768px) 50vw, 100vw" : "(min-width:768px) 25vw, 50vw"} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
