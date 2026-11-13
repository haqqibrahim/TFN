import Link from "next/link";
import { SITE } from "@/lib/site";
import { Arrow, InstagramLogo, LinkedInLogo, TelegramLogo, WhatsAppLogo, XLogo } from "./icons";

/**
 * Pill buttons for the two official channels. Without `links` they go to the sign-up form,
 * because the real links are only shown to people who have registered.
 */
export function ChannelButtons({ variant = "white", full = false, links, only }: {
  variant?: "white" | "line";
  full?: boolean;
  links?: { whatsapp: string; telegram: string };
  only?: string[];
}) {
  const cls = `btn ${variant === "white" ? "btn-white" : "btn-line"} ${full ? "w-full" : ""} !pl-2.5`;
  const items = [
    { key: "WhatsApp", label: "WhatsApp Channel", Logo: WhatsAppLogo, href: links?.whatsapp ?? SITE.whatsapp },
    { key: "Telegram", label: "Telegram Channel", Logo: TelegramLogo, href: links?.telegram ?? SITE.telegram },
  ].filter((i) => !only?.length || only.includes(i.key));
  return (
    <>
      {items.map(({ key, label, Logo, href }) =>
        links ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
            <Logo size={30} />
            {label}
            <Arrow />
          </a>
        ) : (
          <Link key={key} href={href} className={cls}>
            <Logo size={30} />
            {label}
            <Arrow />
          </Link>
        ),
      )}
    </>
  );
}

export function SocialLinks({ size = 44 }: { size?: number }) {
  const items = [
    { href: SITE.whatsapp, label: "Join TFN on WhatsApp", Logo: WhatsAppLogo, inside: true },
    { href: SITE.telegram, label: "Join TFN on Telegram", Logo: TelegramLogo, inside: true },
    { href: SITE.x, label: "TFN on X", Logo: XLogo, inside: false },
    { href: SITE.linkedin, label: "TFN on LinkedIn", Logo: LinkedInLogo },
    { href: SITE.instagram, label: "TFN on Instagram", Logo: InstagramLogo },
  ];
  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map(({ href, label, Logo, inside }) => (
        <li key={label}>
          <a
            href={href}
            {...(inside ? {} : { target: "_blank", rel: "noopener noreferrer" })}
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
