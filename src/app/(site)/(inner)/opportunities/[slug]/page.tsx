import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/cards";
import { ShareButton } from "@/components/share-button";
import { Arrow, Icon } from "@/components/icons";
import { daysUntil, fmtDate, fmtLongDay } from "@/lib/format";
import { openOpportunities, opportunityBySlug } from "@/lib/queries";
import { OPP_ICONS } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const o = await opportunityBySlug((await params).slug);
  if (!o) return {};
  return { title: `${o.title} | Opportunity Hub`, description: o.summary || o.description?.slice(0, 155) };
}

export default async function OpportunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const o = await opportunityBySlug((await params).slug);
  if (!o) notFound();
  const closed = o.status === "closed" || (o.closesAt && new Date(o.closesAt) < new Date());
  const left = daysUntil(o.closesAt);
  const soon = (await openOpportunities({}, 4)).filter((x) => x.slug !== o.slug).slice(0, 2);
  const apply = o.applyUrl && !closed ? (
    <a href={o.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-coral">Apply on the provider’s site <Arrow /></a>
  ) : null;

  return (
    <>
      <section className="wrap pt-4 lg:pt-6 pb-8">
        <BackLink href="/opportunities" label="All opportunities" />
        <div className="mt-6 band !mx-0 grad p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
            <span className="w-9 h-9 rounded-[12px] bg-white/12 text-coral grid place-items-center"><Icon name={OPP_ICONS[o.category] || "opportunities"} size={18} /></span>
            {o.category.replace(/s$/, "")}
          </span>
          <h1 className="mt-4 h-page max-w-[20ch]">{o.title}</h1>
          <p className="mt-3 lede text-cream/80">Offered by {o.provider}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {closed ? <span className="btn btn-glass !cursor-default">This opportunity has closed</span> : apply}
            <ShareButton title={o.title} className="btn btn-glass" />
          </div>
        </div>
      </section>

      <section className="wrap pb-10" aria-label="Key details">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { k: "Closes", v: o.closesAt ? fmtLongDay(o.closesAt) : "Open", note: !closed && left !== null && left <= 21 ? `${left} ${left === 1 ? "day" : "days"} left` : undefined, icon: "clock" as const },
            { k: "Where", v: o.location, icon: "pin" as const },
            { k: "Level", v: o.level || "Any", icon: "cap" as const },
            { k: "Value", v: o.value || "See provider", icon: "coins" as const },
          ].map((d) => (
            <div key={d.k} className="card p-4 sm:p-5">
              <dt className="flex items-center gap-1.5 text-[14px] text-muted"><Icon name={d.icon} size={16} /> {d.k}</dt>
              <dd className="mt-1.5 font-display text-[18px] sm:text-[21px] font-semibold tracking-[-0.025em] leading-tight">{d.v}</dd>
              {d.note && <dd className="mt-2 inline-block rounded-full bg-coral-tint text-coral-ink px-2.5 py-0.5 text-[13px] font-semibold">{d.note}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <div className="wrap pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 items-start [&>*]:min-w-0">
        <article className="grid gap-10">
          <section aria-labelledby="offers">
            <h2 id="offers" className="text-[30px]">What it offers</h2>
            {o.description && <p className="mt-3 lede">{o.description}</p>}
            {o.offers && o.offers.length > 0 && (
              <ul className="mt-4 grid gap-2">
                {o.offers.map((x) => <li key={x} className="flex gap-3"><Icon name="check" size={20} className="text-coral-ink flex-none mt-0.5" strokeWidth={2.2} /> {x}</li>)}
              </ul>
            )}
          </section>
          {o.eligibility && o.eligibility.length > 0 && (
            <section aria-labelledby="who">
              <h2 id="who" className="text-[30px]">Who can apply</h2>
              <ul className="mt-4 grid gap-2.5">
                {o.eligibility.map((x) => (
                  <li key={x} className="card p-4 flex gap-3"><Icon name="check" size={20} className="text-coral-ink flex-none mt-0.5" strokeWidth={2.2} /> {x}</li>
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="how">
            <h2 id="how" className="text-[30px]">How to apply</h2>
            {o.howToApply && o.howToApply.length > 0 && (
              <ol className="mt-4 grid gap-2.5">
                {o.howToApply.map((x, i) => (
                  <li key={x} className="flex gap-3 items-start">
                    <span className="w-7 h-7 rounded-full bg-navy text-cream grid place-items-center text-[14px] font-semibold flex-none">{i + 1}</span>
                    <span className="pt-0.5">{x}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 text-muted">Apply directly with the provider. TFN doesn’t handle applications.</p>
            {apply && <div className="mt-5">{apply}</div>}
          </section>
        </article>

        <aside className="grid gap-5 lg:sticky lg:top-6">
          <section className="rounded-[20px] bg-coral-tint p-6" aria-labelledby="check">
            <Icon name="shield" size={26} className="text-coral-ink" />
            <h2 id="check" className="mt-3 text-[24px]">Check before you apply</h2>
            <p className="mt-2">Confirm deadlines, eligibility and requirements with the provider. TFN can’t guarantee selection or funding. A real opportunity never asks you to pay TFN.</p>
            <Link href="/contact?topic=Digital%20Communities&fake=1" className="mt-4 inline-block link">Report a suspicious listing</Link>
          </section>
          {soon.length > 0 && (
            <section aria-labelledby="soon">
              <h2 id="soon" className="text-[24px] mb-3">Closing soon</h2>
              <ul className="grid gap-2.5">
                {soon.map((s) => (
                  <li key={s._id}>
                    <Link href={`/opportunities/${s.slug}`} className="group card p-4 flex items-center gap-3 hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
                      <span className="w-10 h-10 rounded-[12px] bg-coral-tint text-coral-ink grid place-items-center flex-none"><Icon name={OPP_ICONS[s.category] || "opportunities"} size={18} /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold leading-tight">{s.title}</span>
                        <span className="block text-[14px] text-muted mt-0.5">Closes {fmtDate(s.closesAt)}</span>
                      </span>
                      <Arrow className="flex-none" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
