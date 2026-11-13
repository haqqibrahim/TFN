"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { signOut } from "@/lib/auth-actions";
import { initials } from "@/lib/format";

const ITEMS: { href: string; label: string; icon: IconName; badge?: "opportunities" | "channels" | "inbox" }[] = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/content", label: "Content", icon: "file" },
  { href: "/admin/opportunities", label: "Opportunities", icon: "opportunities", badge: "opportunities" },
  { href: "/admin/registrations", label: "Registrations", icon: "users" },
  { href: "/admin/channels", label: "Channels", icon: "megaphone", badge: "channels" },
  { href: "/admin/inbox", label: "Inbox", icon: "inbox", badge: "inbox" },
  { href: "/admin/events", label: "Events", icon: "calendar" },
  { href: "/admin/users", label: "Users & roles", icon: "key" },
];

export function AdminNav({ me, badges }: { me: { name: string; role: string }; badges: Record<string, number> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));

  const body = (
    <>
      <nav aria-label="Admin" className="flex-1">
        <ul className="grid gap-1">
          {ITEMS.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active(it.href) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 min-h-11 text-[15px] font-medium transition-colors ${active(it.href) ? "bg-navy text-cream" : "hover:bg-admin"}`}
              >
                <Icon name={it.icon} size={19} />
                <span className="flex-1">{it.label}</span>
                {it.badge && badges[it.badge] > 0 && (
                  <span className={`min-w-6 h-6 px-1.5 rounded-full grid place-items-center text-[12px] font-bold ${active(it.href) ? "bg-coral text-navy" : "bg-coral-tint text-coral-ink"}`} aria-label={`${badges[it.badge]} waiting`}>
                    {badges[it.badge]}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 pt-5 border-t border-adminline grid gap-1">
        <div className="flex items-center gap-3 px-2 pb-3">
          <span className="w-10 h-10 rounded-full bg-coral-tint text-coral-ink grid place-items-center font-semibold text-[14px] flex-none" aria-hidden="true">{initials(me.name)}</span>
          <span className="min-w-0">
            <span className="block font-semibold text-[15px] truncate">{me.name}</span>
            <span className="block text-[13px] text-muted">{me.role === "Super admin" ? "Super administrator" : me.role}</span>
          </span>
        </div>
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-full px-4 min-h-11 text-[15px] hover:bg-admin">
          <Icon name="eye" size={19} /> View the website
        </Link>
        <form action={signOut}>
          <button type="submit" className="w-full flex items-center gap-3 rounded-full px-4 min-h-11 text-[15px] hover:bg-admin">
            <Icon name="logout" size={19} /> Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-adminline px-4 h-16 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5 font-display font-semibold tracking-[-0.02em]"><LogoMark size={34} /> TFN Admin</Link>
        <button type="button" aria-expanded={open} aria-controls="admin-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)} className="w-11 h-11 rounded-full border border-adminline grid place-items-center">
          <Icon name={open ? "x" : "menu"} size={20} />
        </button>
      </div>
      {open && (
        <div id="admin-menu" className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-white p-4 flex flex-col overflow-y-auto">{body}</div>
      )}
      <aside className="hidden lg:flex flex-col sticky top-0 h-dvh bg-white border-r border-adminline p-4 overflow-y-auto">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-1 pb-6 font-display text-[18px] font-semibold tracking-[-0.02em]"><LogoMark size={36} /> TFN Admin</Link>
        {body}
      </aside>
    </>
  );
}
