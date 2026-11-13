"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import { Icon } from "./icons";
import { Logo } from "./logo";

export function Header({ onDark = false }: { onDark?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = (href: string) => path === href || path.startsWith(href + "/") || (href === "/news" && path.startsWith("/events"));

  return (
    <header className="wrap flex items-center justify-between gap-6 py-[18px] relative z-30">
      <Logo onDark={onDark} />

      <nav aria-label="Main" className="hidden xl:block">
        <ul
          className={`flex items-center gap-0.5 rounded-full p-1 ${onDark ? "glass" : "bg-white border border-rule"}`}
        >
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active(n.href) ? "page" : undefined}
                className={`flex items-center min-h-[34px] whitespace-nowrap rounded-full px-[13px] text-[14px] font-medium transition-colors ${
                  active(n.href)
                    ? onDark
                      ? "bg-white/15"
                      : "bg-navy text-cream"
                    : onDark
                      ? "hover:bg-white/10"
                      : "hover:bg-cream"
                }`}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <Link href="/membership" className={`btn btn-sm hidden sm:inline-flex ${onDark ? "btn-glass" : "btn-line"}`}>
          Membership
        </Link>
        <Link href="/join" className="btn btn-sm btn-coral hidden sm:inline-flex">
          Join
        </Link>
        <button
          type="button"
          className={`xl:hidden grid place-items-center w-12 h-12 rounded-full ${onDark ? "glass" : "bg-white border border-rule"}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="xl:hidden fixed inset-0 z-40 grad overflow-y-auto">
          <div className="wrap flex items-center justify-between py-[18px]">
            <Logo onDark />
            <button
              type="button"
              className="grid place-items-center w-12 h-12 rounded-full glass"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <Icon name="x" size={22} />
            </button>
          </div>
          <nav aria-label="Main" className="wrap pt-4 pb-10">
            <ul className="flex flex-col">
              {NAV.map((n) => (
                <li key={n.href} className="border-b border-white/12">
                  <Link
                    href={n.href}
                    aria-current={active(n.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-display text-[28px] font-semibold tracking-[-0.03em]"
                  >
                    {n.label}
                    <Icon name="chevron" size={20} className={active(n.href) ? "text-coral" : "opacity-50"} />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3">
              <Link href="/join" className="btn btn-coral w-full">Join the Digital Communities</Link>
              <Link href="/membership" className="btn btn-glass w-full">Membership</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
