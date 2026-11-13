import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChannelButtons } from "@/components/channels";
import { CopyButton } from "@/components/copy-button";
import { Icon, WhatsAppLogo } from "@/components/icons";
import { deleteJoinAction } from "@/lib/actions";
import { COMMUNITY_LINKS, currentMember } from "@/lib/member";

export const metadata: Metadata = { title: "You’re registered", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function JoinDone() {
  const member = await currentMember();
  if (!member) redirect("/join#register");
  const name = member.firstName.slice(0, 40);
  const chosen = member.channels?.length ? member.channels : ["WhatsApp", "Telegram"];
  const other = chosen.length === 1 ? (chosen[0] === "WhatsApp" ? "Telegram" : "WhatsApp") : null;
  const shareText = encodeURIComponent("Join TFN’s Digital Communities for updates and opportunities: ");
  return (
    <section className="wrap pt-6 pb-20 lg:pb-28">
      <div className="band !mx-0 grad p-6 sm:p-10 lg:p-14">
        <span className="w-14 h-14 rounded-full bg-coral text-navy grid place-items-center"><Icon name="check" size={28} strokeWidth={2.4} /></span>
        <h1 className="mt-6 h-page">You’re registered, {name}</h1>
        <p className="mt-4 lede text-cream/80 max-w-[38ch]">
          {chosen.length > 1 ? "Here are your links. Follow a channel to start getting updates." : `Here’s your link. Follow the ${chosen[0]} channel to start getting updates.`}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <ChannelButtons links={COMMUNITY_LINKS} only={chosen} />
        </div>
        <p className="mt-5 text-[15px] text-cream/75">
          Have a question? <a href={COMMUNITY_LINKS.help} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-coral">Join the moderated help group</a>
          {other && <>. Prefer {other}? <a href={other === "WhatsApp" ? COMMUNITY_LINKS.whatsapp : COMMUNITY_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-coral">Follow it too</a></>}
        </p>
        <p className="mt-2 text-[14px] text-cream/60">Please don’t repost these links. Send friends to the join page instead.</p>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <section className="card p-6 lg:p-8" aria-labelledby="share">
          <h2 id="share" className="text-[28px]">Bring your coursemates</h2>
          <p className="mt-2 text-muted">Share the join page. They’ll get the links once they register.</p>
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
          {member.deleteToken && (
            <form action={deleteJoinAction} className="mt-5">
              <input type="hidden" name="t" value={member.deleteToken} />
              <button className="btn btn-line" type="submit"><Icon name="trash" size={18} /> Delete my registration</button>
            </form>
          )}
        </section>
      </div>
    </section>
  );
}
