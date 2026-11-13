import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POLICIES } from "@/lib/policies";

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICIES.map((p) => ({ policy: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> {
  const { policy } = await params;
  const p = POLICIES.find((x) => x.slug === policy);
  return p ? { title: p.title, description: p.intro } : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  const p = POLICIES.find((x) => x.slug === policy);
  if (!p) notFound();
  return (
    <div className="wrap pt-6 lg:pt-10 pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-16 items-start [&>*]:min-w-0">
      <nav aria-label="Policies" className="lg:sticky lg:top-6 -mx-[var(--pad)] px-[var(--pad)] lg:mx-0 lg:px-0 overflow-x-auto no-scrollbar">
        <ul className="flex lg:flex-col gap-2 w-max lg:w-auto">
          {POLICIES.map((x) => (
            <li key={x.slug}>
              <Link href={`/${x.slug}`} aria-current={x.slug === p.slug ? "page" : undefined} className="chip lg:w-full lg:!justify-start">{x.nav}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <article className="card p-6 sm:p-10 lg:p-12 max-w-3xl">
        <h1 className="h-page">{p.title}</h1>
        <p className="mt-3 text-[15px] text-muted">Last updated {p.updated}</p>
        <p className="mt-6 lede">{p.intro}</p>
        <div className="mt-8 grid gap-8">
          {p.sections.map((s) => (
            <section key={s.h} id={s.id} className="scroll-mt-6">
              <h2 className="text-[24px]">{s.h}</h2>
              {s.p && <p className="mt-2 text-[17px]">{s.p}</p>}
              {s.list && (
                <ul className="mt-3 grid gap-2 list-disc pl-5 marker:text-coral">
                  {s.list.map((l) => <li key={l}>{l}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-rule">
          <h2 className="text-[24px]">Questions or requests</h2>
          <p className="mt-2">Send us a message and we’ll respond within 30 days.</p>
          <Link href="/contact?topic=Privacy" className="mt-4 btn btn-navy">Make a privacy enquiry</Link>
        </div>
      </article>
    </div>
  );
}
