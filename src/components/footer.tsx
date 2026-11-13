import Link from "next/link";
import { SITE } from "@/lib/site";
import { SocialLinks } from "./channels";
import { LogoMark } from "./logo";

const COLS = [
  {
    title: "The network",
    links: [
      { href: "/about", label: "About TFN" },
      { href: "/programmes", label: "Programmes" },
      { href: "/membership", label: "Membership" },
      { href: "/partners", label: "Partners" },
    ],
  },
  {
    title: "Stay in touch",
    links: [
      { href: "/join", label: "Join the Digital Communities" },
      { href: "/contact", label: "Contact us" },
      { href: "/contact?topic=Digital%20Communities&fake=1", label: "Report a fake channel" },
      { href: "/contact?topic=Media", label: "Media enquiries" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/cookies", label: "Cookies" },
      { href: "/terms", label: "Terms of use" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy text-cream mt-[var(--band)]">
      <div className="wrap pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Tertiary Futures Network, home">
              <LogoMark onDark size={48} />
              <span className="font-display text-[26px] font-semibold tracking-[-0.035em] leading-[1.02]">
                Tertiary Futures
                <br />
                Network
              </span>
            </Link>
            <p className="mt-5 text-cream/75">Connecting ideas. Developing leaders. Shaping futures.</p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {COLS.map((c) => (
              <div key={c.title}>
                <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-cream/60">{c.title}</h2>
                <ul className="mt-4 grid gap-2.5">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[15px] hover:text-coral transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/12 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-[14px] text-cream/65">
          <address className="not-italic flex flex-wrap gap-x-6 gap-y-1">
            <span>{SITE.address.join(", ")}</span>
            <a className="hover:text-coral" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </address>
          <p>Copyright © {new Date().getFullYear()} Tertiary Futures Network</p>
        </div>
      </div>
    </footer>
  );
}
