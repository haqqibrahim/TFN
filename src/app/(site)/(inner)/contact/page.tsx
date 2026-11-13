import type { Metadata } from "next";
import { ChannelButtons } from "@/components/channels";
import { Icon } from "@/components/icons";
import { CONTACT_TOPICS, SITE } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact TFN",
  description: "Send TFN a message about programmes, partnerships, research, media, membership or the Digital Communities.",
};

export default async function Contact({ searchParams }: { searchParams: Promise<{ topic?: string; fake?: string }> }) {
  const sp = await searchParams;
  const topic = CONTACT_TOPICS.includes(sp.topic || "") ? sp.topic! : "General";
  return (
    <>
      <section className="wrap pt-6 lg:pt-10 pb-8">
        <h1 className="h-page max-w-[12ch]">Connect with TFN</h1>
        <p className="mt-4 lede text-muted max-w-[40ch]">Choose what your message is about and it reaches the right team.</p>
      </section>
      <div className="wrap pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start [&>*]:min-w-0">
        <div>
          <ContactForm topic={topic} fake={sp.fake === "1"} />
        </div>
        <aside className="grid gap-5 lg:sticky lg:top-6">
          <section className={`rounded-[20px] p-6 ${sp.fake === "1" ? "bg-coral-tint ring-2 ring-coral" : "bg-white"}`} aria-labelledby="fake">
            <span className="w-11 h-11 rounded-[14px] bg-coral-tint text-coral-ink grid place-items-center"><Icon name="alert" size={22} /></span>
            <h2 id="fake" className="mt-4 text-[24px]">Seen a fake TFN channel?</h2>
            <p className="mt-2 text-muted">Official links are only on our join page. Choose Digital Communities and tell us what you saw.</p>
          </section>
          <section className="grad rounded-[20px] p-6" aria-labelledby="other">
            <h2 id="other" className="text-[24px]">Other ways to reach us</h2>
            <ul className="mt-4 grid gap-3">
              <li><a className="flex items-center gap-3 hover:text-coral" href={`mailto:${SITE.email}`}><Icon name="mail" size={20} /> {SITE.email}</a></li>
              <li><a className="flex items-center gap-3 hover:text-coral" href={`tel:${SITE.phone.replace(/\s/g, "")}`}><Icon name="phone" size={20} /> {SITE.phone}</a></li>
              <li className="flex items-start gap-3"><Icon name="pin" size={20} className="mt-0.5 flex-none" /> <span>{SITE.address.join(", ")}</span></li>
            </ul>
            <div className="mt-6 grid gap-2.5">
              <ChannelButtons full />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
