import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { Faqs } from "@/components/faqs";
import { Arrow, Icon, type IconName } from "@/components/icons";

export const metadata: Metadata = {
  title: "TFN Membership",
  description: "Membership connects you with institutions, emerging leaders, academics and partners across TFN. Applications open soon.",
};

const BENEFITS: { name: string; icon: IconName }[] = [
  { name: "Updates on programmes and events", icon: "megaphone" },
  { name: "A seat at dialogues and learning sessions", icon: "mic" },
  { name: "Member resources", icon: "research" },
  { name: "Connections across the network", icon: "users" },
  { name: "Contribute to research", icon: "doc" },
  { name: "Shape TFN initiatives", icon: "flag" },
];

const STEPS = [
  { name: "Choose a category", line: "Categories are announced when applications open." },
  { name: "Apply online", line: "Your contact and affiliation details." },
  { name: "Application review", line: "TFN reviews every application." },
];

const FAQS = [
  { q: "When do applications open?", a: "Once TFN’s membership framework is approved. Digital Communities followers hear first." },
  { q: "Is there a fee?", a: "Any fees will be published with the membership categories." },
  { q: "Is joining the Digital Communities membership?", a: "No. It’s free and open to all, while membership has its own application." },
  { q: "Can my institution join?", a: "Institutional affiliation is being considered. Contact us to register interest." },
];

export default function Membership() {
  return (
    <>
      <section className="wrap pt-6 lg:pt-10 pb-10 grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-center">
        <div>
          <h1 className="h-page">Be part of the network</h1>
          <p className="mt-4 lede text-muted max-w-[38ch]">Membership connects you with institutions, emerging leaders, academics and partners across TFN.</p>
        </div>
        <Photo src="/photos/three-young-men.jpg" alt="Three young men smiling together" priority className="h-[260px] lg:h-[380px] rounded-[20px]" sizes="(min-width:1024px) 50vw, 100vw" pos="50% 30%" />
      </section>

      <section className="band grad" aria-labelledby="open">
        <div className="wrap py-10 lg:py-14 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-coral text-navy px-3 py-1 text-[14px] font-bold">
              <span className="w-2 h-2 rounded-full bg-navy" aria-hidden="true" /> Open now
            </span>
            <h2 id="open" className="mt-4 h-sec">Connect today through the Digital Communities</h2>
            <p className="mt-3 text-cream/80 max-w-[44ch]">Membership applications aren’t open yet. Join now and you’ll hear the moment they are.</p>
          </div>
          <div className="grid gap-3">
            <Link href="/join" className="btn btn-coral w-full">Join the Digital Communities <Arrow /></Link>
            <div className="grid sm:grid-cols-2 gap-3"><ChannelButtons full /></div>
            <p className="text-[14px] text-cream/70 text-center">Free. Not the same as membership.</p>
          </div>
        </div>
      </section>

      <section className="wrap py-16 lg:py-24" aria-labelledby="expect">
        <h2 id="expect" className="h-sec">What members can expect</h2>
        <ul className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {BENEFITS.map((b) => (
            <li key={b.name} className="card p-5 sm:p-6">
              <span className="w-11 h-11 rounded-[14px] bg-coral-tint text-coral-ink grid place-items-center"><Icon name={b.icon} size={22} /></span>
              <p className="mt-4 font-display text-[18px] sm:text-[21px] font-semibold tracking-[-0.025em] leading-tight">{b.name}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] text-muted">Final benefits follow the approved membership policy.</p>
      </section>

      <section className="wrap pb-16 lg:pb-24" aria-labelledby="apply">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="apply" className="h-sec">How to apply</h2>
          <span className="rounded-full bg-white border border-rule px-3 py-1 text-[14px] font-semibold">Opens soon</span>
        </div>
        <ol className="mt-8 grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <li key={s.name} className="card p-6 opacity-90">
              <span className="w-10 h-10 rounded-full border-[1.5px] border-navy grid place-items-center font-display font-semibold">{i + 1}</span>
              <h3 className="mt-4 text-[22px]">{s.name}</h3>
              <p className="mt-1.5 text-muted text-[15px]">{s.line}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap pb-20 lg:pb-28" aria-labelledby="faq">
        <h2 id="faq" className="h-sec mb-6">Questions</h2>
        <Faqs items={FAQS} />
      </section>
    </>
  );
}
