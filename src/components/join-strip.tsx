"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { Arrow, TelegramLogo, WhatsAppLogo } from "./icons";

/** Thin site-wide strip above inner-page headers. */
export function JoinStrip() {
  const path = usePathname();
  if (path.startsWith("/join")) return null;
  return (
    <div className="bg-navy text-cream text-[14px]">
      <div className="wrap flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline text-cream/70">Official channels</span>
          <Link href={SITE.whatsapp} aria-label="Join the TFN WhatsApp Channel">
            <WhatsAppLogo size={22} />
          </Link>
          <Link href={SITE.telegram} aria-label="Join the TFN Telegram Channel">
            <TelegramLogo size={22} />
          </Link>
        </div>
        <Link href="/join" className="inline-flex items-center gap-1.5 font-semibold hover:text-coral">
          Join the Digital Communities <Arrow size={12} />
        </Link>
      </div>
    </div>
  );
}
