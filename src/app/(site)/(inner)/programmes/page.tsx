import type { Metadata } from "next";
import Link from "next/link";
import { ProgrammeCard } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { Arrow } from "@/components/icons";
import { PROGRAMMES, type Audience } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Programmes",
  description: "Explore TFN’s flagship programmes in policy engagement, campus connection, leadership, research, opportunities and institutional dialogue.",
};

const FILTERS: ("All" | Audience)[] = ["All", "Students", "Institutions", "Researchers", "Partners"];

export default async function Programmes({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const sp = await searchParams;
  const active = (FILTERS.includes(sp.for as Audience) ? sp.for : "All") as (typeof FILTERS)[number];
  const list = PROGRAMMES.filter((p) => p.slug !== "digital-communities" && (active === "All" || p.audiences.includes(active)));

  return (
    <>
      <section className="wrap pt-6 lg:pt-10 pb-8">
        <h1 className="h-page">Our programmes</h1>
        <p className="mt-4 lede text-muted">Ten flagship programmes. Find the one for you.</p>
      </section>

      <section className="band grad" aria-labelledby="tdc">
        <div className="wrap py-8 lg:py-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral text-navy px-3 py-1 text-[14px] font-bold">
              <span className="w-2 h-2 rounded-full bg-navy" aria-hidden="true" /> Open now
            </span>
            <h2 id="tdc" className="mt-3 h-sec">
              <Link href="/programmes/digital-communities" className="hover:underline underline-offset-4 decoration-coral">Tertiary Digital Communities</Link>
            </h2>
            <p className="mt-2 text-cream/80">Official TFN updates and opportunities on WhatsApp and Telegram. Free.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/join" className="btn btn-coral">Join the Digital Communities <Arrow /></Link>
            <ChannelButtons />
          </div>
        </div>
      </section>

      <section className="wrap py-10 lg:py-14" aria-label="Programmes">
        <nav aria-label="Filter programmes" className="-mx-[var(--pad)] px-[var(--pad)] overflow-x-auto no-scrollbar">
          <ul className="flex gap-2 w-max">
            {FILTERS.map((f) => (
              <li key={f}>
                <Link
                  href={f === "All" ? "/programmes" : `/programmes?for=${f}`}
                  className="chip"
                  aria-current={active === f ? "page" : undefined}
                  scroll={false}
                >
                  {f === "All" ? "All" : `For ${f.toLowerCase()}`}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="sr-only" aria-live="polite">{list.length} programmes shown</p>
        <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((p) => <li key={p.slug}><ProgrammeCard p={p} imgH={210} /></li>)}
        </ul>
      </section>

      <section className="wrap pb-20 lg:pb-28" aria-labelledby="run">
        <div className="card p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h2 id="run" className="h-sec">Run a programme with us</h2>
            <p className="mt-2 text-muted lede max-w-[46ch]">Institutions and organisations can host, fund or co-deliver TFN programmes.</p>
          </div>
          <Link href="/partners#enquiry" className="btn btn-navy self-start md:self-auto">Start a partnership enquiry <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
