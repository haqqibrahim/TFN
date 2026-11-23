"use client";

import { COUNCIL_NAMES, type Council } from "@/lib/fct-map";
import { AGES, NETS, fmt, pct, pctTxt, type Filters } from "./data";

type Set = (f: Partial<Filters>) => void;

export function Pill({ on, dark, onClick, children }: { on: boolean; dark?: boolean; onClick: () => void; children: React.ReactNode }) {
  const tone = on
    ? dark ? "bg-coral text-navy border-coral" : "bg-navy text-cream border-navy"
    : dark ? "bg-transparent text-cream border-cream/35 hover:border-cream" : "bg-transparent text-navy border-[#C9C2B4] hover:border-navy";
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`min-h-9 px-3.5 rounded-full border-[1.5px] font-semibold transition-colors whitespace-nowrap ${dark ? "text-[16px] min-h-11 px-4" : "text-[14px]"} ${tone}`}>
      {children}
    </button>
  );
}

export function FilterGroups({ f, set, dark, scroll }: { f: Filters; set: Set; dark?: boolean; scroll?: boolean }) {
  const groups: { label: string; key: "g" | "age" | "net"; opts: { v: string; label: string }[] }[] = [
    { label: "Gender", key: "g", opts: [{ v: "M", label: "Men" }, { v: "F", label: "Women" }] },
    { label: "Age today", key: "age", opts: AGES.map((a) => ({ v: a, label: a })) },
    { label: "Network", key: "net", opts: NETS.slice(0, 4).map((n) => ({ v: n.k, label: n.k })) },
  ];
  return (
    <>
      {groups.map((g) => (
        <div key={g.key} role="group" aria-label={g.label} className={`flex items-center gap-1.5 ${scroll ? "overflow-x-auto pb-0.5" : "flex-wrap"}`}>
          <span className={`font-semibold mr-1 whitespace-nowrap ${dark ? "w-[104px] text-[16px] text-[#C9CFDD] font-normal" : "text-[14px] text-muted"}`}>{g.label}</span>
          {[{ v: "all", label: "All" }, ...g.opts].map((o) => (
            <Pill key={o.v} dark={dark} on={f[g.key] === o.v} onClick={() => set({ [g.key]: o.v } as Partial<Filters>)}>{o.label}</Pill>
          ))}
        </div>
      ))}
    </>
  );
}

export function LivePill({ ago, dark }: { ago: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[14px] ${dark ? "border border-cream/30 text-[16px]" : "bg-white border border-adminline"}`}>
      <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-full animate-[tfn-pulse_1.8s_infinite] ${dark ? "bg-coral" : "bg-[#1F9D63]"}`} />
      <strong>Live</strong>
      <span className={dark ? "text-[#C9CFDD]" : "text-muted"}>Synced {ago}</span>
    </span>
  );
}

/** Details for the council or ward under the pointer (or the selected one); otherwise the largest ones. */
export function WardDetail({
  unit, council, focus, areasTotal, d, selected, top, dark,
}: {
  unit: "council" | "ward";
  council: Council | null;
  focus: string | null;
  areasTotal: number;
  d: { total: number; reach: number; g: Record<string, number>; a: Record<string, number> } | null;
  selected: string | null;
  top: { name: string; n: number }[];
  dark?: boolean;
}) {
  const sub = dark ? "text-[#C9CFDD]" : "text-muted";
  const tile = dark ? "bg-white/8" : "bg-admin";
  const line = dark ? "border-cream/15" : "border-[#F0EBE1]";
  const where = council ? (council === "AMAC" ? "the Municipal Area Council" : council) : "the FCT";
  if (!focus || !d) {
    return (
      <div className="grid gap-3 content-start">
        <h3 className={dark ? "text-[24px]" : "text-[20px]"}>Point at {unit === "council" ? "an area council" : "a ward"}</h3>
        <p className={sub}>{unit === "council" ? "Hover over a council to see its numbers. Click it to open its wards." : "Hover over a ward to see its numbers. Click it to filter the whole page to that ward."}</p>
        <p className={`font-bold mt-2 ${dark ? "text-[18px]" : "text-[14px]"}`}>Largest {unit === "council" ? "councils" : "wards"} in {where}</p>
        <ul>
          {top.map((w) => (
            <li key={w.name} className={`flex justify-between gap-3 py-2 border-b ${line} ${dark ? "text-[19px]" : ""}`}>
              <span className="font-semibold">{w.name}</span>
              <span className="tabular-nums">{fmt(w.n)} <span className={sub}>({pctTxt(w.n, areasTotal)})</span></span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const gt = (d.g.M || 0) + (d.g.F || 0);
  const at = AGES.reduce((s, k) => s + (d.a[k] || 0), 0);
  const ageMax = Math.max(1, ...AGES.map((k) => d.a[k] || 0));
  return (
    <div className="grid gap-3 content-start">
      <h3 className={dark ? "text-[28px]" : "text-[22px]"}>{unit === "council" ? COUNCIL_NAMES[focus as Council] : focus}</h3>
      <div>
        <p className={`font-display font-semibold tracking-[-0.04em] leading-none tabular-nums ${dark ? "text-[72px]" : "text-[52px]"}`}>{fmt(d.total)}</p>
        <p className={`${sub} ${dark ? "text-[17px]" : "text-[14px]"}`}>{pctTxt(d.total, areasTotal)} of the students shown in {where}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className={`${tile} rounded-[12px] px-3 py-2.5`}><p className={`text-[12px] ${sub}`}>Men</p><p className="font-bold">{pctTxt(d.g.M || 0, gt)}</p></div>
        <div className={`${tile} rounded-[12px] px-3 py-2.5`}><p className={`text-[12px] ${sub}`}>Women</p><p className="font-bold">{pctTxt(d.g.F || 0, gt)}</p></div>
        <div className={`${dark ? "bg-coral/20" : "bg-coral-tint"} rounded-[12px] px-3 py-2.5`}><p className={`text-[12px] ${dark ? "text-[#FFD3CC]" : "text-coral-ink"}`}>By phone</p><p className="font-bold">{pctTxt(d.reach, d.total)}</p></div>
      </div>
      <p className={`font-bold ${dark ? "text-[17px]" : "text-[14px]"}`}>By age</p>
      <ul className="grid gap-1.5">
        {AGES.map((k) => (
          <li key={k} className={`grid grid-cols-[56px_minmax(0,1fr)_52px] items-center gap-2.5 ${dark ? "text-[16px]" : "text-[13px]"}`}>
            <span className={sub}>{k}</span>
            <span className={`h-2.5 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-[#EFE9DE]"}`}><span className={`block h-full rounded-full transition-[width] duration-400 ${dark ? "bg-cream" : "bg-navy"}`} style={{ width: pct(d.a[k] || 0, ageMax) + "%" }} /></span>
            <span className="text-right tabular-nums">{pctTxt(d.a[k] || 0, at)}</span>
          </li>
        ))}
      </ul>
      <p className={`${sub} ${dark ? "text-[16px]" : "text-[13px]"}`}>
        {unit === "council" ? "Click to open its wards" : selected === focus ? "Click it again to see every ward" : "Click to filter the page to this ward"}
      </p>
    </div>
  );
}

export function AgeBars({ a, f, set, dark, height = 170 }: { a: Record<string, number>; f: Filters; set: Set; dark?: boolean; height?: number }) {
  const max = Math.max(1, ...AGES.map((k) => a[k] || 0));
  return (
    <div className="flex items-end gap-3.5 h-full">
      {AGES.map((k) => {
        const on = f.age === k;
        const bg = on ? "#FF6B5B" : dark ? (f.age === "all" ? "#F4EDE0" : "rgba(244,237,224,0.35)") : f.age === "all" ? "#14213D" : "#9AA6C4";
        return (
          <button key={k} type="button" aria-pressed={on} aria-label={`Age ${k}, ${fmt(a[k] || 0)}`} onClick={() => set({ age: on ? "all" : k })} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5">
            <span className={`font-bold tabular-nums ${dark ? "text-[15px]" : "text-[13px]"}`}>{fmt(a[k] || 0)}</span>
            <span className="w-full max-w-16 rounded-t-[14px] rounded-b-[4px] transition-[height] duration-400" style={{ height: Math.max(4, (pct(a[k] || 0, max) * height) / 100), background: bg }} />
            <span className={`${dark ? "text-[15px] text-[#C9CFDD]" : "text-[13px] text-muted"}`}>{k}</span>
          </button>
        );
      })}
    </div>
  );
}

export function GenderSplit({ g, dark }: { g: Record<string, number>; dark?: boolean }) {
  const m = g.M || 0, w = g.F || 0, t = m + w;
  return (
    <div className="grid gap-3">
      <div className="flex justify-between items-end">
        <span><span className={`block font-display font-semibold tracking-[-0.04em] leading-none ${dark ? "text-[44px]" : "text-[40px]"}`}>{pctTxt(m, t)}</span><span className={dark ? "text-[15px] text-[#C9CFDD]" : "text-[14px] text-muted"}>{fmt(m)} men</span></span>
        <span className="text-right"><span className={`block font-display font-semibold tracking-[-0.04em] leading-none ${dark ? "text-[44px] text-[#FF8A7D]" : "text-[40px] text-coral-ink"}`}>{pctTxt(w, t)}</span><span className={dark ? "text-[15px] text-[#C9CFDD]" : "text-[14px] text-muted"}>{fmt(w)} women</span></span>
      </div>
      <div role="img" aria-label={`Men ${pctTxt(m, t)}, women ${pctTxt(w, t)}`} className={`flex gap-1 ${dark ? "h-14" : "h-11"}`}>
        <span className={`rounded-l-[12px] rounded-r-[4px] transition-[width] duration-400 ${dark ? "bg-cream" : "bg-navy"}`} style={{ width: pct(m, t) + "%" }} />
        <span className="rounded-r-[12px] rounded-l-[4px] bg-coral transition-[width] duration-400" style={{ width: pct(w, t) + "%" }} />
      </div>
    </div>
  );
}

export function NetDonut({ n, reach, total, f, set, dark, size = 150 }: { n: Record<string, number>; reach: number; total: number; f: Filters; set: Set; dark?: boolean; size?: number }) {
  const t = NETS.reduce((s, x) => s + (n[x.k] || 0), 0);
  let acc = 0;
  const stops = NETS.map((x) => { const a = acc; acc += pct(n[x.k] || 0, t); return `${x.c} ${a.toFixed(2)}% ${acc.toFixed(2)}%`; });
  return (
    <div className="flex items-center gap-5">
      <span role="img" aria-label="Share by phone network" className="flex-none rounded-full grid place-items-center" style={{ width: size, height: size, background: `conic-gradient(${stops.join(",")})` }}>
        <span className={`rounded-full grid place-items-center text-center leading-tight ${dark ? "bg-navy" : "bg-white"}`} style={{ width: size * 0.61, height: size * 0.61 }}>
          <span><span className="block font-display font-semibold text-[20px]">{pctTxt(reach, total)}</span><span className={`text-[12px] ${dark ? "text-[#C9CFDD]" : "text-muted"}`}>reachable</span></span>
        </span>
      </span>
      <ul className="flex-1 min-w-0 grid gap-0.5">
        {NETS.map((x) => {
          const on = f.net === x.k;
          return (
            <li key={x.k}>
              <button type="button" aria-pressed={on} disabled={x.k === "Other"} onClick={() => set({ net: on ? "all" : x.k })} className={`w-full flex items-center gap-2 min-h-8 px-2 rounded-[12px] ${dark ? "text-[16px]" : "text-[14px]"} ${on ? (dark ? "bg-coral/25" : "bg-coral-tint") : ""}`}>
                <span className="w-3 h-3 rounded-[4px] border border-black/10" style={{ background: x.c }} />
                <span className="font-semibold">{x.k}</span>
                <span className={`ml-auto tabular-nums ${dark ? "text-[#C9CFDD]" : "text-muted"}`}>{pctTxt(n[x.k] || 0, t)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
