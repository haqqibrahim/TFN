import type { Metadata } from "next";
import { ChannelButtons } from "@/components/channels";
import { CopyButton } from "@/components/copy-button";
import { Icon, WhatsAppLogo } from "@/components/icons";
import { deleteJoinAction } from "@/lib/actions";

export const metadata: Metadata = { title: "You’re registered", robots: { index: false } };

export default async function JoinDone({ searchParams }: { searchParams: Promise<{ n?: string; t?: string }> }) {
  const { n, t } = await searchParams;
  const name = (n || "").slice(0, 40);
  const shareText = encodeURIComponent("Join TFN’s Digital Communities for updates and opportunities: ");
  return (
    <section className="wrap pt-6 pb-20 lg:pb-28">
      <div className="band !mx-0 grad p-6 sm:p-10 lg:p-14">
        <span className="w-14 h-14 rounded-full bg-coral text-navy grid place-items-center"><Icon name="check" size={28} strokeWidth={2.4} /></span>
        <h1 className="mt-6 h-page">You’re registered{name ? `, ${name}` : ""}</h1>
        <p className="mt-4 lede text-cream/80 max-w-[38ch]">One more step: follow a channel to start getting updates.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <ChannelButtons />
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <section className="card p-6 lg:p-8" aria-labelledby="share">
          <h2 id="share" className="text-[28px]">Bring your coursemates</h2>
          <p className="mt-2 text-muted">Share the join page</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="btn btn-line !pl-2.5" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${shareText}${encodeURIComponent((process.env.SITE_URL || "https://tfnetwork.org") + "/join")}`}>
              <WhatsAppLogo size={30} /> Share on WhatsApp
            </a>
            <CopyButton text="/join" absolute label="Copy join link" done="Join link copied" />
          </div>
        </section>
        <section className="card p-6 lg:p-8" aria-labelledby="mind">
          <h2 id="mind" className="text-[28px]">Changed your mind?</h2>
          <p className="mt-2 text-muted">Unsubscribe from any email, or delete your registration now. Unfollowing a channel is done in WhatsApp or Telegram.</p>
          {t && (
            <form action={deleteJoinAction} className="mt-5">
              <input type="hidden" name="t" value={t} />
              <button className="btn btn-line" type="submit"><Icon name="trash" size={18} /> Delete my registration</button>
            </form>
          )}
        </section>
      </div>
    </section>
  );
}
