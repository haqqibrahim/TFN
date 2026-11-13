import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { Faqs } from "@/components/faqs";
import { Arrow, Icon, type IconName } from "@/components/icons";
import { communityLinks, currentMember } from "@/lib/member";
import { SITE } from "@/lib/site";
import { JoinForm } from "./join-form";

export const metadata: Metadata = {
  title: { absolute: "Join the Tertiary Digital Communities | TFN" },
  description: "Register for TFN’s Tertiary Digital Communities to get the official WhatsApp and Telegram links. Free, and easy to leave.",
};

const NEVER: { label: string; icon: IconName }[] = [
  { label: "Passwords", icon: "lock" },
  { label: "Bank or card details", icon: "card" },
  { label: "PVC images", icon: "id" },
  { label: "Payment", icon: "cash" },
];

const FAQS = [
  { q: "Does it cost anything?", a: "No. Joining is free." },
  { q: "Why do I have to register first?", a: "So the channels stay for real students and staff, and so we can share updates that fit your campus and state. The links appear as soon as you register." },
  { q: "Why do you ask about a PVC?", a: "To understand how many members can vote. It’s a yes or no question only. Never send a photo of your PVC to anyone, including people claiming to be TFN." },
  { q: "Is this TFN membership?", a: "No. Membership will have its own application, and we’ll announce it on the channels." },
  { q: "Will I be added to a group chat?", a: "No. Channels are one-way updates. Discussion spaces are separate and optional." },
  { q: "How do I leave?", a: "Unfollow the channel any time. To delete a registration, use the link on your confirmation page or contact us." },
  { q: "How do I know a channel is real?", a: "Official links are only shown on this website after you register. Links shared anywhere else may be fake." },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 lg:p-8" aria-labelledby={`step-${n}`}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <span className="w-10 h-10 rounded-full bg-navy text-cream grid place-items-center font-display font-semibold text-[18px] flex-none">{n}</span>
        <div className="flex-1 min-w-0">
          <h2 id={`step-${n}`} className="text-[26px] lg:text-[30px]">{title}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

type Channel = "WhatsApp" | "Telegram" | "Both";

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
  const { channel } = await searchParams;
  const pick: Channel = channel === "WhatsApp" || channel === "Telegram" ? channel : "Both";
  const member = await currentMember();
  const COMMUNITY_LINKS = member ? await communityLinks() : null;
  return (
    <>
      <section className="wrap pt-6 lg:pt-10 pb-8 grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-center">
        <div>
          <h1 className="h-page max-w-[14ch]">Join the Tertiary Digital Communities</h1>
          <p className="mt-4 lede text-muted max-w-[36ch]">Register once, then follow TFN’s official WhatsApp and Telegram channels for updates and opportunities.</p>
        </div>
        <Photo src="/photos/student-volunteers.jpg" alt="Student volunteers sitting together" priority className="h-[240px] lg:h-[340px] rounded-[20px]" sizes="(min-width:1024px) 50vw, 100vw" />
      </section>

      <div className="wrap pb-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 items-start [&>*]:min-w-0">
        <div className="grid gap-5 [&>*]:min-w-0">
          {member ? (
            <Step n={1} title={`You’re registered, ${member.firstName}`}>
              <p className="mt-2 text-muted">These are TFN’s official channels. Follow one or both.</p>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                <ChannelButtons variant="line" full links={COMMUNITY_LINKS!} />
              </div>
              <p className="mt-4 text-[15px] text-muted">
                Free. Unfollow any time. <Link href="/join/done" className="link">Manage your registration</Link>
              </p>
            </Step>
          ) : (
            <>
              <Step n={1} title="Register">
                <p className="mt-2 text-muted">It takes a minute. The channel links appear as soon as you’re done.</p>
                <div className="mt-6 scroll-mt-6" id="register">
                  <JoinForm channel={pick} />
                </div>
              </Step>

              <Step n={2} title="Follow an official channel">
                <div className="mt-5 grid sm:grid-cols-2 gap-3" aria-hidden="true">
                  {["WhatsApp Channel", "Telegram Channel"].map((l) => (
                    <span key={l} className="btn btn-line w-full !justify-start opacity-55 cursor-not-allowed">
                      <Icon name="lock" size={20} /> {l}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[15px] text-muted">Register above to unlock the links. Free. Unfollow any time.</p>
              </Step>
            </>
          )}

          <Step n={member ? 2 : 3} title="Ask and take part">
            <p className="mt-2 text-muted">Questions and discussion happen in small moderated spaces, never the channel.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {member && (
                <a href={COMMUNITY_LINKS?.help} target="_blank" rel="noopener noreferrer" className="btn btn-line">Join a community space <Arrow /></a>
              )}
              <Link href="/contact?topic=Digital%20Communities" className="btn btn-line">Contact support</Link>
            </div>
          </Step>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-6">
          <section className="grad rounded-[20px] p-6" aria-labelledby="safe">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-[14px] bg-white/12 grid place-items-center text-coral"><Icon name="shield" size={22} /></span>
              <h2 id="safe" className="text-[26px]">Stay safe</h2>
            </div>
            <p className="mt-3 text-cream/80">Official links are only shown here after you register. TFN will never ask for:</p>
            <ul className="mt-4 grid grid-cols-2 gap-2.5">
              {NEVER.map((n) => (
                <li key={n.label} className="rounded-[14px] bg-white/8 border border-white/14 p-3 flex flex-col gap-2">
                  <span className="relative w-8 h-8 grid place-items-center text-cream">
                    <Icon name={n.icon} size={22} />
                    <svg className="absolute inset-0 text-coral" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 27L27 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                  </span>
                  <span className="text-[14px] font-semibold leading-tight">{n.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact?topic=Digital%20Communities&fake=1" className="mt-5 btn btn-white w-full">Report a suspicious channel</Link>
          </section>
          <p className="text-[14px] text-muted px-1">
            Joining is free and is not TFN membership. Questions? Email <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </aside>
      </div>

      <section className="wrap pb-20 lg:pb-28" aria-labelledby="faq">
        <h2 id="faq" className="h-sec mb-6">Questions</h2>
        <Faqs items={FAQS} />
      </section>
    </>
  );
}
