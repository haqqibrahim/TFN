import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/cards";
import { Arrow, Icon } from "@/components/icons";
import { PARTNER_TYPES } from "@/lib/site";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = {
  title: "Partner with TFN",
  description: "Work with TFN on programmes, research, events and opportunities for Nigeria’s tertiary institutions.",
};

const PARTNERS = ["Ajala Education Trust", "Unity Bridge Foundation", "Coastline Energy", "Sahel Learning Fund", "Innovate Naija Fund"];

function Mark({ name }: { name: string }) {
  const letters = name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  return (
    <li className="card h-[96px] px-5 flex items-center gap-3">
      <span className="w-11 h-11 rounded-[12px] bg-navy text-cream grid place-items-center font-display font-semibold tracking-[-0.03em] flex-none">{letters}</span>
      <span className="font-display font-semibold tracking-[-0.02em] leading-tight">{name}</span>
    </li>
  );
}

export default function Partners() {
  return (
    <>
      <section className="px-[var(--band)]">
        <div className="grad rounded-[24px] md:rounded-[28px] overflow-hidden grid lg:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            <h1 className="h-page">Partnerships that turn shared priorities into action</h1>
            <p className="mt-4 lede text-cream/80 max-w-[40ch]">We work with institutions, public bodies, companies and development partners on programmes, research and opportunities.</p>
            <Link href="#enquiry" className="mt-8 btn btn-coral self-start">Start a partnership enquiry <Arrow /></Link>
          </div>
          <Photo src="/photos/delegates.jpg" alt="Delegates talking at an event" priority className="min-h-[260px] lg:min-h-[480px]" sizes="(min-width:1024px) 50vw, 100vw" />
        </div>
      </section>

      <section className="wrap py-16 lg:py-24" aria-labelledby="who">
        <h2 id="who" className="h-sec mb-8">Who we partner with</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PARTNER_TYPES.map((t) => (
            <li key={t.name} className="card p-6">
              <span className="w-11 h-11 rounded-[14px] bg-coral-tint text-coral-ink grid place-items-center"><Icon name={t.icon} size={22} /></span>
              <h3 className="mt-4 text-[22px]">{t.name}</h3>
              <p className="mt-1.5 text-muted text-[15px]">{t.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap pb-16 lg:pb-24" aria-labelledby="ours">
        <h2 id="ours" className="h-sec">Our partners</h2>
        <p className="mt-3 text-muted">Partner names and logos appear here with their permission.</p>
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PARTNERS.map((p) => <Mark key={p} name={p} />)}
          <li className="h-[96px] rounded-[20px] border-[1.5px] border-dashed border-field px-5 flex items-center gap-3 text-muted">
            <span className="w-11 h-11 rounded-[12px] border-[1.5px] border-dashed border-field grid place-items-center"><Icon name="plus" size={20} /></span>
            <Link href="#enquiry" className="font-semibold text-navy hover:underline underline-offset-4">Your institution here</Link>
          </li>
        </ul>
      </section>

      <section id="enquiry" className="wrap pb-20 lg:pb-28 scroll-mt-6" aria-labelledby="enq">
        <div className="card p-6 sm:p-8 lg:p-12 grid lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-14">
          <div>
            <h2 id="enq" className="h-sec">Start a partnership enquiry</h2>
            <p className="mt-3 text-muted lede">Tell us about your organisation and what you’d like to work on together.</p>
          </div>
          <PartnerForm />
        </div>
      </section>
    </>
  );
}
