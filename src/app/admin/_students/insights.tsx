"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COUNCILS, COUNCIL_NAMES, MAPS, wardsOf, type Council } from "@/lib/fct-map";
import { NO_FILTERS, crunch, fmt, pct, pctTxt, tags, useLive, useRollup, type Filters, type Stats, type StudentRow } from "./data";
import { AgeBars, FilterGroups, GenderSplit, LivePill, NetDonut, WardDetail } from "./parts";
import { MapCrumb, MapLegend, WardMap } from "./ward-map";

export function useStudentView(stats: Stats) {
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const [hov, setHov] = useState<string | null>(null);
  const set = (p: Partial<Filters>) => setF((o) => ({ ...o, ...p }));
  const d = useMemo(() => crunch(stats.cube, f), [stats.cube, f]);
  const view: "FCT" | Council = f.council ?? "FCT";
  const unit = f.council ? "ward" : "council";
  const counts = f.council ? d.wards : d.councils;
  const focus = hov || f.ward;
  const fd = useMemo(
    () => (focus ? crunch(stats.cube, f.council ? { ...f, ward: focus } : { ...f, council: focus as Council, ward: null }) : null),
    [stats.cube, f, focus],
  );
  const names: string[] = f.council ? wardsOf(f.council) : [...COUNCILS];
  const areas = names.map((name) => ({ name, n: counts[name] || 0 })).sort((a, b) => b.n - a.n);
  const areasTotal = areas.reduce((a, b) => a + b.n, 0);
  const pick = (name: string) => {
    setHov(null);
    if (!f.council) set({ council: name as Council, ward: null });
    else set({ ward: f.ward === name ? null : name });
  };
  const back = () => { setHov(null); set({ council: null, ward: null }); };
  const shown = useRollup(d.total);
  const t = tags(f);
  return { f, set, d, view, unit, counts, focus, fd, areas, areasTotal, pick, back, setHov, shown, t, clear: () => setF(NO_FILTERS) } as const;
}

export function Insights({ stats, feed, syncedAt }: { stats: Stats; feed: StudentRow[]; syncedAt: number }) {
  const v = useStudentView(stats);
  const { f, set, d, areas } = v;
  const { ago, tick } = useLive(syncedAt);
  const max = areas[0]?.n || 1;
  const gt = (d.g.M || 0) + (d.g.F || 0);
  const rows = feed.length ? [0, 1, 2, 3].map((i) => feed[(tick + i) % feed.length]) : [];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px]">Registered students</h1>
          <p className="mt-1 text-muted">Federal Capital Territory, all 6 area councils.</p>
        </div>
        <LivePill ago={ago} />
      </div>

      <section aria-label="Totals" className="relative overflow-hidden rounded-[28px] bg-navy text-cream px-6 sm:px-9 py-7 sm:py-8 flex flex-wrap items-end justify-between gap-7">
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(520px 260px at 88% 0%, rgba(255,107,91,.35), transparent 70%), radial-gradient(480px 300px at 10% 120%, rgba(90,130,230,.30), transparent 70%), repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 14px)" }} />
        <div className="relative min-w-0">
          <p className="text-[15px] text-[#C9CFDD]">Registered as students</p>
          <p className="font-display font-semibold tracking-[-0.045em] leading-[.95] tabular-nums text-[64px] sm:text-[clamp(64px,8vw,112px)]">{fmt(v.shown)}</p>
          <p className="mt-1.5 text-[16px]">{v.t.length ? v.t.join(", ") : "Everyone registered with the occupation Student"}</p>
        </div>
        <div className="relative grid grid-cols-3 gap-2.5 sm:gap-3 flex-[0_1_560px] min-w-0">
          {[
            { k: "Men", n: fmt(d.g.M || 0), s: pctTxt(d.g.M || 0, gt) },
            { k: "Women", n: fmt(d.g.F || 0), s: pctTxt(d.g.F || 0, gt) },
          ].map((x) => (
            <div key={x.k} className="rounded-[20px] bg-white/7 border border-cream/18 px-3 sm:px-4 py-3">
              <p className="text-[13px] text-[#C9CFDD]">{x.k}</p>
              <p className="font-display font-semibold text-[19px] sm:text-[28px] tracking-[-0.03em]">{x.n}</p>
              <p className="text-[13px] text-[#C9CFDD]">{x.s}</p>
            </div>
          ))}
          <div className="rounded-[20px] bg-coral/16 border border-coral/45 px-3 sm:px-4 py-3">
            <p className="text-[13px] text-[#FFD3CC]">Reachable by phone</p>
            <p className="font-display font-semibold text-[19px] sm:text-[28px] tracking-[-0.03em]">{fmt(d.reach)}</p>
            <p className="text-[13px] text-[#FFD3CC]">{pctTxt(d.reach, d.total)} have a number</p>
          </div>
        </div>
      </section>

      <section aria-label="Filters" className="bg-white border border-adminline rounded-[20px] px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-x-7">
        <FilterGroups f={f} set={set} scroll />
        {v.t.length > 0 && (
          <button type="button" onClick={v.clear} className="sm:ml-auto self-start min-h-9 font-bold text-coral-ink underline">Clear filters</button>
        )}
      </section>

      <div className="flex flex-wrap gap-5 items-stretch">
        <section className="flex-[3_1_560px] min-w-0 bg-white border border-adminline rounded-[20px] p-4 sm:p-5 grid gap-3">
          <div className="grid gap-1">
            <h2 className="text-[19px] font-bold font-sans tracking-normal">Where they are registered</h2>
            <MapCrumb council={f.council} onBack={v.back} />
          </div>
          <div className="h-[300px] sm:h-[520px] lg:h-[580px]">
            <WardMap key={v.view} view={v.view} counts={v.counts} selected={f.ward} onPick={v.pick} onHover={v.setHov} />
          </div>
          <MapLegend max={max} />
        </section>
        <section className="flex-[2_1_320px] min-w-0 bg-white border border-adminline rounded-[20px] p-5 sm:p-6" aria-live="polite">
          <WardDetail unit={v.unit} council={f.council} focus={v.focus} d={v.fd} areasTotal={v.areasTotal} selected={f.ward} top={areas.slice(0, 3)} />
        </section>
      </div>

      <section className="bg-white border border-adminline rounded-[20px] p-4 sm:p-5 grid gap-3.5">
        <div className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1">
          <h2 className="text-[19px] font-bold font-sans tracking-normal">{f.council ? `Students in each ward of ${f.council === "AMAC" ? "the Municipal Area Council" : f.council}` : "Students in each area council"}</h2>
          <p className="text-[13px] text-muted">{f.council ? "Largest first. Click a ward to see only its students." : "Largest first. Click a council to see its wards."}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5 sm:gap-3">
          {areas.map((w) => {
            const on = f.ward === w.name;
            const dim = f.ward && !on;
            return (
              <button key={w.name} type="button" aria-pressed={on} onClick={() => v.pick(w.name)} className={`text-left rounded-[20px] border-[1.5px] px-3 sm:px-4 py-3 sm:py-3.5 grid gap-1.5 transition-all ${on ? "bg-navy text-cream border-navy" : "bg-white border-adminline hover:border-navy"} ${dim ? "opacity-50" : ""}`}>
                <span className="flex justify-between items-baseline gap-2">
                  <span className="font-bold text-[14px] sm:text-[15px]">{w.name}</span>
                  <span className={`text-[13px] font-semibold ${on ? "text-[#C9CFDD]" : "text-muted"}`}>{pctTxt(w.n, v.areasTotal)}</span>
                </span>
                <span className="font-display font-semibold tracking-[-0.035em] text-[24px] sm:text-[30px] leading-[1.05] tabular-nums">{fmt(w.n)}</span>
                <span className="h-1.5 rounded-full bg-[#EFE9DE] overflow-hidden"><span className={`block h-full rounded-full transition-[width] duration-400 ${on ? "bg-coral" : "bg-navy"}`} style={{ width: pct(w.n, max) + "%" }} /></span>
                {!f.council && <span className="text-[13px] text-muted">{COUNCIL_NAMES[w.name as Council]}, {MAPS[w.name as Council].labels.length} wards</span>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        <section className="bg-white border border-adminline rounded-[20px] p-4 sm:p-5 grid gap-3">
          <h2 className="text-[19px] font-bold font-sans tracking-normal">Age today</h2>
          <div className="h-[230px] border-b-[1.5px] border-navy pb-1"><AgeBars a={d.a} f={f} set={set} /></div>
          <p className="text-[13px] text-muted">Worked out from year of birth.</p>
        </section>
        <section className="bg-white border border-adminline rounded-[20px] p-4 sm:p-5 grid gap-3 content-start">
          <h2 className="text-[19px] font-bold font-sans tracking-normal">Men and women</h2>
          <GenderSplit g={d.g} />
          <div className="flex flex-wrap gap-2">
            {(["all", "M", "F"] as const).map((g) => (
              <button key={g} type="button" aria-pressed={f.g === g} onClick={() => set({ g })} className={`min-h-9 px-3.5 rounded-full border-[1.5px] text-[14px] font-semibold ${f.g === g ? "bg-navy text-cream border-navy" : "border-[#C9C2B4]"}`}>{g === "all" ? "All" : g === "M" ? "Men" : "Women"}</button>
            ))}
          </div>
        </section>
        <section className="bg-white border border-adminline rounded-[20px] p-4 sm:p-5 grid gap-3 content-start">
          <h2 className="text-[19px] font-bold font-sans tracking-normal">Phone networks</h2>
          <NetDonut n={d.n} reach={d.reach} total={d.total} f={f} set={set} size={140} />
        </section>
      </div>

      <section className="bg-white border border-adminline rounded-[20px] p-4 sm:p-5 grid gap-2">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-1">
          <h2 className="text-[19px] font-bold font-sans tracking-normal">Arriving in the database</h2>
          <Link href="/admin/students/records" className="btn btn-navy min-h-10 px-4 text-[14px]">Open all records</Link>
        </div>
        <ul aria-live="off">
          {rows.map((r, i) => (
            <li key={r.rid + i} className={`grid grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1fr)] sm:grid-cols-[40px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 py-2 border-b border-[#F0EBE1] ${i === 0 ? "animate-[tfn-in_.5s_ease]" : ""}`}>
              <span aria-hidden="true" className="w-9 h-9 rounded-full bg-cream grid place-items-center font-bold text-[14px]">{r.name.slice(0, 1)}</span>
              <span className="min-w-0"><span className="block font-semibold truncate">{r.name}</span><span className="block text-[13px] text-muted">{r.rid}</span></span>
              <span className="text-[14px] min-w-0 truncate">{r.ward}<span className="text-muted">, {r.council}</span></span>
              <span className="hidden sm:block text-[14px] font-mono text-muted">{r.phone}</span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-muted">Names, VINs and phone numbers are masked for presentation.</p>
      </section>
    </div>
  );
}
