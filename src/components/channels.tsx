import { SITE } from "@/lib/site";
import { Arrow, InstagramLogo, LinkedInLogo, TelegramLogo, WhatsAppLogo, XLogo } from "./icons";

/** White pill buttons for the two official channels. */
export function ChannelButtons({ variant = "white", full = false }: { variant?: "white" | "line"; full?: boolean }) {
  const cls = `btn ${variant === "white" ? "btn-white" : "btn-line"} ${full ? "w-full" : ""} !pl-2.5`;
  return (
    <>
      <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className={cls}>
        <WhatsAppLogo size={30} />
        WhatsApp Channel
        <Arrow />
      </a>
      <a href={SITE.telegram} target="_blank" rel="noopener noreferrer" className={cls}>
        <TelegramLogo size={30} />
        Telegram Channel
        <Arrow />
      </a>
    </>
  );
}

export function SocialLinks({ size = 44 }: { size?: number }) {
  const items = [
    { href: SITE.whatsapp, label: "TFN on WhatsApp", Logo: WhatsAppLogo },
    { href: SITE.telegram, label: "TFN on Telegram", Logo: TelegramLogo },
    { href: SITE.x, label: "TFN on X", Logo: XLogo },
    { href: SITE.linkedin, label: "TFN on LinkedIn", Logo: LinkedInLogo },
    { href: SITE.instagram, label: "TFN on Instagram", Logo: InstagramLogo },
  ];
  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map(({ href, label, Logo }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid place-items-center rounded-full bg-white/8 border border-white/14 hover:bg-white/16 transition-colors"
            style={{ width: size, height: size }}
          >
            <Logo size={size - 14} />
          </a>
        </li>
      ))}
    </ul>
  );
}
