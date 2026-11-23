"use client";

import { COUNCIL_NAMES, MAPS, type Council } from "@/lib/fct-map";
import { fmt, mix } from "./data";

/**
 * The FCT by area council, or one council by ward, shaded by count. Clicking a shape picks it;
 * the cards below the map do the same for keyboard users. Every label sits on the map.
 */
export function WardMap({
  view, counts, selected, onPick, onHover, dark = false, fs = 26,
}: {
  view: "FCT" | Council;
  counts: Record<string, number>;
  selected: string | null;
  onPick: (name: string) => void;
  onHover: (name: string | null) => void;
  dark?: boolean;
  fs?: number;
}) {
  const m = MAPS[view];
  const [, , w, h] = m.viewBox.split(" ").map(Number);
  // Keep text the same size on screen whatever the shape of the map.
  const k = Math.max(w / 1020, h / 1095);
  const max = Math.max(1, ...m.labels.map((l) => counts[l.name] || 0));
  const look = (name: string) => {
    const t = (counts[name] || 0) / max;
    const on = selected === name;
    return {
      on,
      fill: on ? "#FF6B5B" : dark ? mix("#2A3B62", "#F4EDE0", t) : mix("#E4E8F1", "#14213D", t),
      ink: on ? "#14213D" : dark ? (t > 0.55 ? "#14213D" : "#F4EDE0") : t > 0.45 ? "#FFFFFF" : "#14213D",
    };
  };
  const label = view === "FCT"
    ? "Map of the 6 area councils of the FCT, shaded by number of registered students"
    : `Map of the wards of ${COUNCIL_NAMES[view]}, shaded by number of registered students`;
  return (
    <svg viewBox={m.viewBox} role="img" aria-label={label} className="block w-full h-full animate-[tfn-in_.4s_ease]" onMouseLeave={() => onHover(null)}>
      {m.areas.map((a, i) => {
        const s = look(a.name);
        return (
          <path
            key={a.name + i}
            d={a.d}
            fill={s.fill}
            stroke={dark ? "#14213D" : "#FFFFFF"}
            strokeWidth={(s.on ? 7 : 2.5) * k}
            strokeLinejoin="round"
            className="cursor-pointer transition-[fill] duration-400"
            onClick={() => onPick(a.name)}
            onMouseEnter={() => onHover(a.name)}
          />
        );
      })}
      {m.frames.map((d) => (
        <path key={d} d={d} fill="none" pointerEvents="none" stroke={dark ? "#F4EDE0" : "#14213D"} strokeOpacity={0.4} strokeWidth={2 * k} strokeDasharray={`${8 * k} ${6 * k}`} />
      ))}
      {m.labels.map((l) => {
        const s = look(l.name);
        const size = Math.round((l.small ? fs * 0.8 : fs) * k);
        const lines = (l.label ?? l.name).split("|");
        return (
          <g key={l.name} pointerEvents="none" textAnchor={l.anchor ?? "middle"} fill={s.ink} stroke={s.fill} strokeWidth={Math.max(3, size / 5)} strokeLinejoin="round" paintOrder="stroke">
            {lines.map((t, i) => <text key={t} x={l.x} y={l.y + i * size * 1.05} fontSize={size} fontWeight={700}>{t}</text>)}
            <text x={l.x} y={l.y + lines.length * size * 1.05} fontSize={Math.round(size * 0.82)} style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(counts[l.name] || 0)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function MapLegend({ max, dark = false }: { max: number; dark?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] ${dark ? "text-[#C9CFDD] text-[15px]" : "text-muted"}`}>
      <span>Fewer students</span>
      <span aria-hidden="true" className="h-2.5 w-40 sm:w-56 rounded-full" style={{ background: dark ? "linear-gradient(90deg,#2A3B62,#F4EDE0)" : "linear-gradient(90deg,#E4E8F1,#14213D)" }} />
      <span>{fmt(max)}</span>
      <span className="inline-flex items-center gap-1.5 ml-2"><span aria-hidden="true" className="w-3 h-3 rounded bg-coral" />Selected</span>
    </div>
  );
}

/** "All of the FCT / Bwari Area Council" above the map, with a way back up. */
export function MapCrumb({ council, onBack, dark = false }: { council: Council | null; onBack: () => void; dark?: boolean }) {
  if (!council) return <p className={dark ? "text-[16px] text-[#C9CFDD]" : "text-[13px] text-muted"}>Click an area council to see its wards.</p>;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 ${dark ? "text-[17px]" : "text-[14px]"}`}>
      <button type="button" onClick={onBack} className={`min-h-9 font-bold underline ${dark ? "text-[#FFB3A9]" : "text-coral-ink"}`}>All of the FCT</button>
      <span aria-hidden="true" className={dark ? "text-[#C9CFDD]" : "text-muted"}>/</span>
      <span className="font-semibold">{COUNCIL_NAMES[council]}</span>
    </p>
  );
}
