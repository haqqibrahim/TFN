import Link from "next/link";
import { Photo, ProgrammeCard, SectionHead } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { CopyButton } from "@/components/copy-button";
import { Header } from "@/components/header";
import { Arrow, Icon, TelegramLogo, WhatsAppLogo } from "@/components/icons";
import { DIVISIONS, SITE, programmeBySlug } from "@/lib/site";

const FEATURES = [
  "Official WhatsApp and Telegram channels",
  "Every opportunity checked before we post",
  "Ten flagship programmes",
  "All 36 states and the FCT",
  "Free to join, leave any time",
];

const CHANNELS = [
  { name: "WhatsApp Channel", line: "Opportunities, events and programme news", href: SITE.whatsapp, Logo: WhatsAppLogo },
  { name: "Telegram Channel", line: "The same updates, plus a moderated help group", href: SITE.telegram, Logo: TelegramLogo },
];

export default function Home() {
  const progs = ["policy-forum", "campus-connect", "leadership-academy"].map((s) => programmeBySlug(s)!);

  return (
    <main>
      {/* Hero */}
      <div className="pt-3 px-[var(--band)]">
        <section className="grad rounded-[24px] md:rounded-[28px] overflow-hidden min-h-[760px] lg:min-h-[800px] flex flex-col">
          <Header onDark />
          <div id="main" className="wrap flex-1 flex flex-col pt-10 lg:pt-16 pb-6">
            <div className="flex-1 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
              <div className="flex-[1_1_560px] max-w-[820px]">
                <h1 className="display">Connecting ideas. Developing leaders. Shaping futures.</h1>
                <p className="mt-6 text-cream/80 max-w-[34em]">
                  A network for Nigeria’s universities, polytechnics and colleges, and the people building what comes next.
                </p>
              </div>

              <div className="flex-[0_1_380px] w-full flex flex-col-reverse sm:flex-col gap-5">
                <aside className="glass rounded-[20px] px-3 pt-2.5 pb-3.5 flex flex-col gap-2.5" aria-labelledby="official">
                  <span aria-hidden="true" className="self-center w-[34px] h-1 rounded-full bg-white/40" />
                  <h2 id="official" className="flex items-center gap-1.5 text-[13px] font-sans font-normal tracking-normal text-cream/80">
                    <Icon name="shield" size={14} /> Official TFN channels
                  </h2>
                  {CHANNELS.map(({ name, line, href, Logo }) => (
                    <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[20px] bg-white/7 border border-white/12 hover:bg-white/12 transition-colors px-3.5 py-3">
                      <span className="w-11 h-11 rounded-[14px] bg-white grid place-items-center flex-none"><Logo size={24} /></span>
                      <span className="flex-1 min-w-0">
                        <strong className="block font-semibold text-[15px]">{name}</strong>
                        <span className="block text-[13px] text-cream/70">{line}</span>
                      </span>
                      <Arrow className="flex-none" />
                    </a>
                  ))}
                  <p className="px-1 text-[13px] text-cream/70">Free to follow. We never ask for money.</p>
                </aside>
                <div className="flex flex-wrap items-center sm:justify-end gap-x-5 gap-y-2.5">
                  <Link href="/join" className="btn btn-coral">Join the Digital Communities <Arrow /></Link>
                  <Link href="/programmes" className="inline-flex items-center gap-1.5 min-h-11 font-semibold text-[15px] hover:text-coral">Our programmes <Arrow /></Link>
                </div>
              </div>
            </div>

            <ul className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-x-5 gap-y-4 text-[14px] md:text-[15px]">
              {FEATURES.map((f, i) => (
                <li key={f} className={`pt-3 border-t ${i === 0 ? "border-coral border-t-2 font-semibold" : "border-white/25 text-cream/80"} ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Phone updates band */}
      <section className="band grad mt-[var(--band)]" aria-labelledby="updates">
        <div className="wrap py-10 lg:py-12 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex-1">
            <h2 id="updates" className="h-sec">Get TFN updates on your phone</h2>
            <p className="mt-2 text-cream/80">Opportunities, programme news and events. Free, and you can leave any time.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ChannelButtons />
            <CopyButton text="/join" absolute label="Copy join link to share" done="Join link copied" className="btn btn-line-light" />
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="wrap py-16 lg:py-24" aria-labelledby="progs">
        <SectionHead id="progs" title="Our programmes" action={{ href: "/programmes", label: "See all ten programmes" }} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {progs.map((p) => <ProgrammeCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* What we do */}
      <section className="wrap pb-16 lg:pb-24" aria-labelledby="what">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
          <div>
            <h2 id="what" className="h-sec">What we do</h2>
            <p className="mt-3 text-muted lede max-w-sm">Six divisions, each running part of TFN’s work.</p>
          </div>
          <nav aria-label="Divisions">
            <ul className="grid md:grid-cols-2 gap-3">
              {DIVISIONS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/about#divisions`} className="group card flex items-center gap-4 p-4 hover:shadow-[0_0_0_2px_var(--color-navy)] transition-shadow">
                    <span className="w-10 h-10 rounded-[12px] grid place-items-center bg-coral-tint text-coral-ink flex-none">
                      <Icon name={d.icon} size={20} />
                    </span>
                    <span className="flex-1 font-semibold leading-tight">{d.name}</span>
                    <Icon name="chevron" size={18} className="opacity-50 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* About */}
      <section className="wrap pb-16 lg:pb-24" aria-labelledby="about-tfn">
        <div className="card overflow-hidden grid md:grid-cols-2">
          <div className="p-6 lg:p-10 flex flex-col justify-center order-2 md:order-1">
            <h2 id="about-tfn" className="h-sec">A network for ideas, institutions and leadership</h2>
            <p className="mt-3 text-muted lede">Beginning with tertiary institutions, TFN connects students, academics, institutional leaders, public officials and partners.</p>
            <Link href="/about" className="mt-6 btn btn-line self-start">About TFN <Arrow /></Link>
          </div>
          <Photo src="/photos/team-planning.jpg" alt="Young people planning around a table" className="min-h-[260px] md:min-h-[340px] order-1 md:order-2" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      </section>

      {/* Partner */}
      <section className="wrap pb-16 lg:pb-24" aria-labelledby="partner">
        <div className="card overflow-hidden grid md:grid-cols-2">
          <Photo src="/photos/conference-stage.jpg" alt="A speaker addressing a full room" className="min-h-[260px] md:min-h-[340px]" sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="p-6 lg:p-10 flex flex-col justify-center">
            <h2 id="partner" className="h-sec">Partner with TFN</h2>
            <p className="mt-3 text-muted lede">Work with us on programmes, research, events and opportunities.</p>
            <Link href="/partners#enquiry" className="mt-6 btn btn-navy self-start">Start a partnership enquiry <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* Be part */}
      <section className="wrap pb-20 lg:pb-28 text-center" aria-labelledby="bepart">
        <h2 id="bepart" className="h-page mx-auto max-w-[16ch]">Be part of the network</h2>
        <p className="mt-4 lede text-muted max-w-xl mx-auto">Membership opens soon. Join the Digital Communities now and we’ll tell you first.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/join" className="btn btn-navy">Join the Digital Communities <Arrow /></Link>
          <Link href="/membership" className="btn btn-line">About membership</Link>
        </div>
      </section>
    </main>
  );
}
