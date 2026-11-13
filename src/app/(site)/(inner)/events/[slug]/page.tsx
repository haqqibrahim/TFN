import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, BackLink, DateTile, Photo } from "@/components/cards";
import { Arrow, Icon } from "@/components/icons";
import { fmtLongDay, fmtTime } from "@/lib/format";
import { eventBySlug } from "@/lib/queries";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await eventBySlug((await params).slug);
  if (!e) return {};
  return { title: e.title, description: e.summary || e.about?.slice(0, 155) };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await eventBySlug(slug);
  if (!e) notFound();
  const past = new Date(e.endsAt || e.startsAt) < new Date();
  const open = !past && e.status === "published";
  const inPersonFull = e.placesLeft === 0;
  const where = e.venue === "Online" ? "Online" : `${e.venue}, ${e.city}${e.online ? ". Also online." : ""}`;
  const cal = `/events/${e.slug}/calendar`;

  return (
    <>
      <section className="wrap pt-4 lg:pt-6 pb-10">
        <BackLink href="/news#events" label="News & Events" />
        <div className="mt-6 grad rounded-[24px] md:rounded-[28px] overflow-hidden grid lg:grid-cols-[1.2fr_1fr]">
          <div className="p-6 sm:p-10 lg:p-12 flex flex-col">
            <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-coral"><Icon name="calendar" size={18} /> Event</span>
            <h1 className="mt-3 h-page">{e.title}</h1>
            {e.theme && <p className="mt-4 lede text-cream/85 max-w-[44ch]">Theme: {e.theme}</p>}
            <div className="mt-6 flex items-center gap-4">
              <DateTile date={e.startsAt} onDark />
              <div>
                <p className="font-semibold">{fmtLongDay(e.startsAt)}, {fmtTime(e.startsAt)}{e.endsAt ? ` to ${fmtTime(e.endsAt)}` : ""}</p>
                <p className="text-cream/75">{where}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {open ? <a href="#register" className="btn btn-coral">Register to attend <Arrow /></a> : <span className="btn btn-glass !cursor-default">{past ? "This event has finished" : "Registration closed"}</span>}
              <a href={cal} className="btn btn-glass"><Icon name="calendar" size={18} /> Add to calendar</a>
            </div>
            {open && e.placesLeft !== null && (
              <p className="mt-5 text-[15px] text-cream/80">{e.free ? "Free. " : ""}{e.placesLeft > 0 ? `${e.placesLeft} in-person places left.` : "In-person places are full. You can still join online."}</p>
            )}
          </div>
          {e.image && <Photo src={e.image} alt={e.imageAlt || ""} priority className="min-h-[260px] lg:min-h-full" sizes="(min-width:1024px) 45vw, 100vw" pos="50% 25%" />}
        </div>
      </section>

      <div className="wrap pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 items-start [&>*]:min-w-0">
        <div className="grid gap-12">
          <section aria-labelledby="about">
            <h2 id="about" className="text-[30px]">About the event</h2>
            <p className="mt-3 lede">{e.about}</p>
            {e.objectives && e.objectives.length > 0 && (
              <>
                <h3 className="mt-8 text-[22px]">Objectives</h3>
                <ul className="mt-3 grid gap-2.5">
                  {e.objectives.map((o) => <li key={o} className="flex gap-3"><Icon name="check" size={20} strokeWidth={2.2} className="text-coral-ink flex-none mt-0.5" /> {o}</li>)}
                </ul>
              </>
            )}
          </section>

          {e.agenda && e.agenda.length > 0 && (
            <section aria-labelledby="prog">
              <h2 id="prog" className="text-[30px]">Programme</h2>
              <ol className="mt-5 relative border-l-2 border-rule ml-[52px] sm:ml-[60px] grid gap-5">
                {e.agenda.map((a) => {
                  const [item, who] = a.item.split("|");
                  return (
                    <li key={a.time + item} className="relative pl-5">
                      <span className="absolute -left-[60px] sm:-left-[68px] top-0 w-[48px] text-right font-display font-semibold tracking-[-0.02em]">{a.time}</span>
                      <span className="absolute -left-[7px] top-[7px] w-3 h-3 rounded-full bg-coral ring-4 ring-cream" aria-hidden="true" />
                      <p className="font-semibold">{item}</p>
                      {who && <p className="text-muted text-[15px]">{who}</p>}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {e.speakers && e.speakers.length > 0 && (
            <section aria-labelledby="speakers">
              <h2 id="speakers" className="text-[30px]">Speakers</h2>
              <ul className="mt-5 grid sm:grid-cols-2 gap-3">
                {e.speakers.map((s) => (
                  <li key={s.name} className="card p-4 flex items-center gap-4">
                    <Avatar name={s.name} size={52} />
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-[14px] text-muted">{s.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {e.accessibility && (
            <section aria-labelledby="access" className="rounded-[20px] bg-white p-6 flex gap-4">
              <Icon name="users" size={26} className="text-coral-ink flex-none" />
              <div>
                <h2 id="access" className="text-[24px]">Taking part</h2>
                <p className="mt-2 text-muted">{e.accessibility}</p>
                <Link href="/contact?topic=Programmes" className="mt-3 inline-block link">Contact the events team</Link>
              </div>
            </section>
          )}
        </div>

        {open && (
          <aside id="register" className="card p-6 lg:p-7 lg:sticky lg:top-6 scroll-mt-6" aria-labelledby="reg">
            <h2 id="reg" className="text-[26px]">Register to attend</h2>
            <p className="mt-1 mb-5 text-muted text-[15px]">{e.free ? "Free. " : ""}Takes a minute.</p>
            <RegisterForm slug={e.slug} online={Boolean(e.online)} inPersonFull={inPersonFull} calendarHref={cal} />
          </aside>
        )}
      </div>
    </>
  );
}
