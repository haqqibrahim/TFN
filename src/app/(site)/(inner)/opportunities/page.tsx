import type { Metadata } from "next";
import Link from "next/link";
import { OppCard, Photo } from "@/components/cards";
import { Arrow, Icon } from "@/components/icons";
import { OPP_CATEGORIES } from "@/lib/models";
import { openOpportunities } from "@/lib/queries";
import { OPP_ICONS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Opportunity Hub",
  description: "Scholarships, fellowships, internships, grants, training and competitions for Nigerian students and graduates, checked and gathered in one place.",
};

type SP = { category?: string; location?: string; closing?: string; sort?: string; more?: string };

function href(sp: SP, patch: Partial<SP>) {
  const next = { ...sp, ...patch };
  const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
  return `/opportunities${qs ? `?${qs}` : ""}#board`;
}

export default async function Opportunities({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = (OPP_CATEGORIES as readonly string[]).includes(sp.category || "") ? sp.category : undefined;
  const all = await openOpportunities({ category, location: sp.location, closing: sp.closing, sort: sp.sort });
  const shown = sp.more ? all : all.slice(0, 9);

  return (
    <>
      <section className="px-[var(--band)]">
        <div className="grad rounded-[24px] md:rounded-[28px] overflow-hidden grid lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            <h1 className="h-page">Discover opportunities. Take your next step.</h1>
            <p className="mt-4 lede text-cream/80 max-w-[40ch]">Scholarships, fellowships, internships, grants and more, checked and gathered in one place.</p>
          </div>
          <Photo src="/photos/students-laptops.jpg" alt="Students working on laptops together" priority className="min-h-[240px] lg:min-h-[440px]" sizes="(min-width:1024px) 50vw, 100vw" />
        </div>
      </section>

      <section className="wrap pt-10 lg:pt-14" aria-label="Filter opportunities">
        <nav aria-label="Categories" className="-mx-[var(--pad)] px-[var(--pad)] overflow-x-auto no-scrollbar">
          <ul className="flex gap-2 w-max">
            <li><Link href={href(sp, { category: undefined, more: undefined })} scroll={false} className="chip" aria-current={!category ? "page" : undefined}>All</Link></li>
            {OPP_CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={href(sp, { category: c, more: undefined })} scroll={false} className="chip" aria-current={category === c ? "page" : undefined}>
                  <Icon name={OPP_ICONS[c]} size={17} /> {c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form method="get" action="/opportunities#board" className="mt-5 grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
          {category && <input type="hidden" name="category" value={category} />}
          <div>
            <label htmlFor="location" className="label">Location</label>
            <select id="location" name="location" defaultValue={sp.location || ""} className="field">
              <option value="">Anywhere</option>
              <option>Nigeria</option>
              <option>Online</option>
              <option>Abroad</option>
            </select>
          </div>
          <div>
            <label htmlFor="closing" className="label">Closing</label>
            <select id="closing" name="closing" defaultValue={sp.closing || ""} className="field">
              <option value="">Any time</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="sort" className="label">Sort by</label>
            <select id="sort" name="sort" defaultValue={sp.sort || ""} className="field">
              <option value="">Closing soonest</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <button className="btn btn-navy col-span-2 md:col-span-1" type="submit"><Icon name="filter" size={18} /> Apply</button>
        </form>
      </section>

      <section id="board" className="wrap py-10 lg:py-14 scroll-mt-4" aria-labelledby="board-h">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-6">
          <h2 id="board-h" className="h-sec">On the board now</h2>
          <p className="text-muted" aria-live="polite">{all.length} {all.length === 1 ? "opportunity" : "opportunities"}</p>
        </div>
        {shown.length ? (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((o) => <li key={o._id}><OppCard o={o} /></li>)}
          </ul>
        ) : (
          <div className="card p-8 text-center">
            <p className="font-display text-[24px] font-semibold tracking-[-0.03em]">Nothing matches those filters right now</p>
            <p className="mt-2 text-muted">New listings arrive every week. Clear the filters, or join the Digital Communities to hear first.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/opportunities" className="btn btn-line">Clear filters</Link>
              <Link href="/join" className="btn btn-navy">Join the Digital Communities</Link>
            </div>
          </div>
        )}
        {!sp.more && all.length > shown.length && (
          <div className="mt-6 text-center">
            <Link href={href(sp, { more: "1" })} scroll={false} className="btn btn-line">Show more opportunities</Link>
          </div>
        )}
        <p className="mt-8 rounded-[14px] bg-white/60 border border-rule p-4 text-[15px] text-muted flex gap-3">
          <Icon name="alert" size={20} className="flex-none mt-0.5" />
          TFN lists opportunities to help you find them. Unless stated, TFN isn’t the provider. Always check details with the provider before you apply.
        </p>
      </section>

      <section className="wrap pb-20 lg:pb-28" aria-labelledby="share">
        <div className="band !mx-0 grad p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 id="share" className="h-sec">Have an opportunity to share?</h2>
            <p className="mt-2 text-cream/80">Institutions and organisations can submit opportunities for review.</p>
          </div>
          <Link href="/opportunities/submit" className="btn btn-coral self-start md:self-auto">Submit an opportunity <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
