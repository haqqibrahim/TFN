import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Stroke({ d, size = 24, strokeWidth = 1.8, ...rest }: P & { d: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  policy: "M3 21h18M5 21V10M19 21V10M9.7 21V10M14.3 21V10M2.5 10L12 4l9.5 6z",
  leadership: "M5 21V4h11l-2 4 2 4H5",
  institutions: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  research: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5V5.5M8 7h8",
  opportunities: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z",
  digital: "M7 2.5h10v19H7zM11 18.5h2",
  calendar: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  cap: "M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v5",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 21h7M10 17h4",
  doc: "M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7",
  pin: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  briefcase: "M3 7h18v13H3zM8 7V4h8v3M3 13h18",
  coins: "M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  check: "M4 12.5l5 5L20 6.5",
  x: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  chevron: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  back: "M15 6l-6 6 6 6",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z",
  lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  id: "M3 5h18v14H3zM7 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM5.5 16c.5-1.7 1.8-2.5 3.5-2.5s3 .8 3.5 2.5M14 9h4M14 13h4",
  cash: "M3 6h18v12H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM6 9v.01M18 15v.01",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M16 3.5a4 4 0 0 1 0 7.5M18 14c2.4.8 4 3.4 4 7",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
  handshake: "M2 12l4-4 4 2 3-3 4 1 5 4M6 8v6l5 5c.8.8 2 .8 2.8 0l5.2-5M10 15l2 2M12.5 12.5l2 2",
  building: "M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01M2 21h20",
  flag: "M5 21V4M5 4h12l-2 4 2 4H5",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  inbox: "M3 13l3-9h12l3 9v7H3zM3 13h5l1 3h6l1-3h5",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  file: "M6 3h9l4 4v14H6zM15 3v4h4",
  megaphone: "M3 10v4h4l7 5V5L7 10zM17 9a4 4 0 0 1 0 6",
  ticket: "M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10",
  key: "M15 3a6 6 0 1 0 3.5 10.9L21 16.5V20h-3v-2h-2v-2l-2.1-2.1A6 6 0 0 0 15 3zM16 7.5v.01",
  logout: "M14 4h6v16h-6M10 8l-4 4 4 4M6 12h11",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.01",
  filter: "M3 5h18l-7 8v6l-4 2v-8z",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...rest }: P & { name: IconName }) {
  return <Stroke d={ICONS[name]} {...rest} />;
}

export function Arrow({ size = 14, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d="M4 10L10 4M5 4h5v5" />
    </svg>
  );
}

/* Brand marks — round logos, used as 44px buttons and inside pills */
export function WhatsAppLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d="M12 5.4a6.6 6.6 0 0 0-5.7 9.9l-.9 3.3 3.4-.9A6.6 6.6 0 1 0 12 5.4z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.7 9c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.6 1.4c.1.2 0 .3-.1.5l-.4.5c-.1.1-.1.3 0 .4.5.9 1.3 1.6 2.2 2 .2.1.3.1.4 0l.5-.6c.1-.2.3-.2.5-.1l1.3.6c.2.1.3.2.3.3 0 .5-.2 1.1-.7 1.4-.5.3-1.2.4-2.3 0-1.6-.6-2.9-1.9-3.6-3.3-.5-1-.5-1.9-.1-2.6z" fill="#FFFFFF" />
    </svg>
  );
}

export function TelegramLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path d="M5.4 11.7l11.3-4.4c.5-.2 1 .1.8.9l-1.9 9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.3-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.1-.8z" fill="#FFFFFF" />
    </svg>
  );
}

export function XLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#000000" />
      <path d="M7 6.5h3l2.6 3.6 3-3.6h1.5l-3.8 4.6 4.7 6.4h-3l-2.9-3.9-3.3 3.9H7.3l4.1-4.9z" fill="#FFFFFF" />
    </svg>
  );
}

export function LinkedInLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#0A66C2" />
      <path d="M7.3 10h2v7h-2zM8.3 6.8a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM10.8 10h1.9v1c.3-.6 1.1-1.2 2.2-1.2 2.1 0 2.5 1.3 2.5 3.1V17h-2v-3.6c0-.9 0-1.9-1.2-1.9s-1.4.9-1.4 1.8V17h-2z" fill="#FFFFFF" />
    </svg>
  );
}

export function InstagramLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <radialGradient id="ig" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="#FDF497" />
          <stop offset=".05" stopColor="#FDF497" />
          <stop offset=".45" stopColor="#FD5949" />
          <stop offset=".6" stopColor="#D6249F" />
          <stop offset=".9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#ig)" />
      <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" strokeWidth="1.5" />
      <circle cx="15.3" cy="8.7" r=".8" fill="#fff" />
    </svg>
  );
}
