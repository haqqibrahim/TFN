import Link from "next/link";

export function LogoMark({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <span
      className="inline-grid place-items-center flex-none"
      style={{
        width: size,
        height: size,
        borderRadius: size >= 40 ? 10 : 8,
        background: onDark ? "rgba(255,255,255,.12)" : "#14213D",
        border: onDark ? "1px solid rgba(255,255,255,.18)" : "none",
      }}
      aria-hidden="true"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M3 17c3.2-6.4 6-9.5 9-9.5s5.8 3.1 9 9.5" stroke="#FF6B5B" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="12" cy="17" r="2" fill="#F4EDE0" />
      </svg>
    </span>
  );
}

export function Logo({ onDark = false, compact = false }: { onDark?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 font-display font-semibold tracking-[-0.03em]" aria-label="Tertiary Futures Network, home">
      <LogoMark onDark={onDark} />
      <span className={`leading-[1.05] ${compact ? "text-[16px]" : "text-[17px]"}`}>
        Tertiary Futures
        <br />
        Network
      </span>
    </Link>
  );
}
