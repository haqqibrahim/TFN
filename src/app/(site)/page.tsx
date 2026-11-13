import Link from "next/link";
import { DateTile, Photo, ProgrammeCard, SectionHead } from "@/components/cards";
import { ChannelButtons } from "@/components/channels";
import { CopyButton } from "@/components/copy-button";
import { Header } from "@/components/header";
import { Arrow, Icon } from "@/components/icons";
import { fmtDate, fmtDay } from "@/lib/format";
import { featuredPublication, openOpportunities, upcomingEvents } from "@/lib/queries";
import { DIVISIONS, OPP_ICONS, programmeBySlug } from "@/lib/site";

export const revalidate = 60;

const FEATURES = [
  "Official WhatsApp and Telegram channels",
  "Every opportunity checked before we post",
  "Ten flagship programmes",
  "All 36 states and the FCT",
  "Free to join, leave any time",
];

export default async function Home() {
  const [events, opps, pub] = await Promise.all([upcomingEvents(3), openOpportunities({}, 2), featuredPublication()]);
  const heroEvents = events.slice(0, 2);
  const boardEvent = events.find((e) => e.slug === "national-tertiary-policy-dialogue-2027") ?? events[0];
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
                {heroEvents.length > 0 && (
                  <aside className="glass rounded-[20px] px-3 pt-2.5 pb-3.5 flex flex-col gap-2.5" aria-labelledby="coming-up">
                    <span aria-hidden="true" className="self-center w-[34px] h-1 rounded-full bg-white/40" />
                    <h2 id="coming-up" className="flex items-center gap-1.5 text-[13px] font-sans font-normal tracking-normal text-cream/80">
                      <Icon name="calendar" size={14} /> Coming up across Nigeria
                    </h2>
                    {heroEvents.map((e) => (
                      <Link key={e._id} href={`/events/${e.slug}`} className="block rounded-[20px] bg-white/7 border border-white/12 hover:bg-white/12 transition-colors px-3.5 py-3">
                        <span className="flex justify-between gap-2.5 text-[13px]">
                          <strong className="font-semibold">{e.title}</strong>
                          <span className="text-cream/70">{e.free ? "Free" : ""}</span>
                        </span>
                        <span className="mt-1.5 flex items-end justify-between gap-2.5">
                          <span className="flex flex-col">
                            <span className="text-[12px] text-cream/60">Date</span>
                            <span className="font-display text-[26px] font-medium tracking-[-0.03em] leading-[1.1]">{fmtDay(e.startsAt)}</span>
                          </span>
                          <span className="mb-1 rounded-full bg-white/14 px-2.5 py-0.5 text-[12px] font-semibold">{e.city}</span>
                          {e.placesLeft !== null && (
                            <span className="flex flex-col items-end">
                              <span className="text-[12px] text-cream/60">Places left</span>
                              <span className="font-display text-[26px] font-medium tracking-[-0.03em] leading-[1.1]">{e.placesLeft}</span>
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                    <Link href="/news#events" className="self-start rounded-full bg-coral text-navy px-3 py-1 text-[13px] font-bold">Registration open</Link>
                  </aside>
                )}
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

      {/* On the board */}
      <section className="band grad" aria-labelledby="board">
        <div className="wrap py-14 lg:py-20">
          <SectionHead id="board" title="On the board" onDark action={{ href: "/news", label: "All news and events" }} />
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
            {boardEvent && (
              <Link href={`/events/${boardEvent.slug}`} className="group glass rounded-[20px] overflow-hidden flex flex-col">
                <Photo src="/photos/auditorium-full.jpg" alt="A packed conference hall during a session" height={260} className="!bg-white/10" />
                <div className="p-5 flex items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-coral"><Icon name="calendar" size={16} /> Event</span>
                    <h3 className="mt-1.5 text-[26px] tracking-[-0.03em]">{boardEvent.title}</h3>
                    <p className="mt-1 text-cream/75">{fmtDate(boardEvent.startsAt)}, {boardEvent.city}</p>
                  </div>
                  <span className="w-11 h-11 rounded-full bg-coral text-navy grid place-items-center flex-none"><Arrow /></span>
                </div>
              </Link>
            )}
            <div className="grid gap-4">
              {opps.map((o) => (
                <Link key={o._id} href={`/opportunities/${o.slug}`} className="group glass rounded-[20px] p-5 flex gap-4 items-start hover:bg-white/14 transition-colors">
                  <span className="w-11 h-11 rounded-[14px] grid place-items-center bg-white/12 text-coral flex-none">
                    <Icon name={OPP_ICONS[o.category] || "opportunities"} size={22} />
                  </span>
                  <div className="flex-1">
                    <span className="text-[14px] text-cream/70">{o.category.replace(/s$/, "")}</span>
                    <h3 className="text-[21px] tracking-[-0.03em] leading-tight mt-0.5">{o.title}</h3>
                    <p className="mt-2 text-[14px] text-cream/75">Closes {fmtDate(o.closesAt)}</p>
                  </div>
                  <Arrow className="mt-1" />
                </Link>
              ))}
              <Link href="/opportunities" className="btn btn-white self-start">Explore the Opportunity Hub <Arrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research + About */}
      <section className="wrap py-16 lg:py-24 grid lg:grid-cols-2 gap-5" aria-label="Research and about TFN">
        {pub && (
          <article className="card overflow-hidden flex flex-col relative group">
            <Photo src="/photos/women-laptop.jpg" alt="Young women gathered around a laptop" height={260} />
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-[15px] font-semibold text-coral-ink tracking-normal font-sans">Research & insights</h2>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] text-muted"><Icon name="doc" size={16} /> {pub.type}</span>
              <h3 className="mt-1.5 text-[26px] tracking-[-0.03em]">
                <Link href={`/research/${pub.slug}`} className="after:absolute after:inset-0">{pub.title}</Link>
              </h3>
              <p className="mt-2 text-muted text-[15px]">{fmtDate(pub.publishedAt)}</p>
              <Link href="/research" className="relative z-10 mt-auto pt-5 link self-start">Browse all publications</Link>
            </div>
          </article>
        )}
        <article className="card overflow-hidden flex flex-col">
          <Photo src="/photos/team-planning.jpg" alt="Young people planning around a table" height={300} />
          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-[30px]">A network for ideas, institutions and leadership</h2>
            <p className="mt-3 text-muted">Beginning with tertiary institutions, TFN connects students, academics, institutional leaders, public officials and partners.</p>
            <Link href="/about" className="mt-auto pt-5 btn btn-line self-start">About TFN <Arrow /></Link>
          </div>
        </article>
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
