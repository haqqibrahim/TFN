"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";
import { fmt, pctTxt, useLive, type Stats } from "./data";
import { useStudentView } from "./insights";
import { AgeBars, FilterGroups, GenderSplit, LivePill, NetDonut, WardDetail } from "./parts";
import { MapCrumb, MapLegend, WardMap } from "./ward-map";

/** Full-screen version for a projector: navy, large type, same filters and map. */
export function Present({ stats, syncedAt }: { stats: Stats; syncedAt: number }) {
  const v = useStudentView(stats);
  const { f, set, d, areas } = v;
  const { ago } = useLive(syncedAt);
  const scale = useFit(1920, 1080);
  return (
    <main className="fixed inset-0 overflow-hidden bg-navy">
    <div className="absolute left-1/2 top-1/2 w-[1920px] h-[1080px] overflow-hidden bg-navy text-cream text-[18px] px-16 py-12 grid gap-10 grid-cols-[700px_minmax(0,1fr)]" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(900px 500px at 92% -10%, rgba(255,107,91,.28), transparent 70%), radial-gradient(800px 520px at -5% 110%, rgba(90,130,230,.30), transparent 70%), repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 18px)" }} />

      <div className="relative flex flex-col gap-6 min-w-0 min-h-0">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-3 font-bold text-[20px]"><LogoMark size={40} onDark /> Tertiary Futures Network</span>
          <LivePill ago={ago} dark />
        </div>
        <div>
          <h1 className="text-[40px]">Registered students in the FCT</h1>
          <p className="mt-2 font-display font-semibold tracking-[-0.05em] leading-[.9] tabular-nums text-white text-[180px]">{fmt(v.shown)}</p>
          <p className="mt-2 text-[22px] text-[#FFD3CC]">{v.t.length ? v.t.join(", ") : "Everyone registered with the occupation Student"}</p>
        </div>
        <div className="grid grid-cols-3 gap-3.5">
          {[
            { k: "Men", n: fmt(d.g.M || 0) },
            { k: "Women", n: fmt(d.g.F || 0) },
          ].map((x) => (
            <div key={x.k} className="rounded-[20px] bg-white/7 border border-cream/18 px-4 py-3.5">
              <p className="text-[16px] text-[#C9CFDD]">{x.k}</p>
              <p className="font-display font-semibold text-[34px] tracking-[-0.03em]">{x.n}</p>
            </div>
          ))}
          <div className="rounded-[20px] bg-coral/18 border border-coral/50 px-4 py-3.5">
            <p className="text-[16px] text-[#FFD3CC]">Reachable by phone</p>
            <p className="font-display font-semibold text-[34px] tracking-[-0.03em]">{pctTxt(d.reach, d.total)}</p>
          </div>
        </div>
        <div className="grid gap-3"><FilterGroups f={f} set={set} dark /></div>
        <div className="mt-auto flex items-center justify-between gap-4">
          {v.t.length > 0 ? <button type="button" onClick={v.clear} className="btn btn-coral">Show everyone</button> : <span />}
          <Link href="/admin/students" className="font-semibold text-[15px] underline">Exit present mode</Link>
        </div>
      </div>

      <div className="relative grid gap-6 min-w-0 min-h-0 grid-rows-[minmax(0,1fr)_300px]">
        <div className="grid gap-5 min-h-0 grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] bg-white/4 border border-cream/16 p-6 pb-4 flex flex-col gap-2.5 min-h-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="text-[20px] font-bold font-sans tracking-normal">Where they are registered</h2>
              <MapCrumb council={f.council} onBack={v.back} dark />
            </div>
            <div className="flex-1 min-h-0"><WardMap key={v.view} view={v.view} counts={v.counts} selected={f.ward} onPick={v.pick} onHover={v.setHov} dark fs={28} /></div>
            <MapLegend max={areas[0]?.n || 1} dark />
          </div>
          <div className="rounded-[28px] bg-white/5 border border-cream/16 p-6 overflow-hidden" aria-live="polite">
            <WardDetail unit={v.unit} council={f.council} focus={v.focus} d={v.fd} areasTotal={v.areasTotal} selected={f.ward} top={areas.slice(0, 6)} dark />
          </div>
        </div>
        <div className="grid gap-5 grid-cols-3 min-h-0">
          <section className="rounded-[20px] bg-white/5 border border-cream/16 p-5 flex flex-col gap-2.5">
            <h2 className="text-[18px] font-bold font-sans tracking-normal">Age today</h2>
            <div className="flex-1 min-h-0"><AgeBars a={d.a} f={f} set={set} dark height={150} /></div>
          </section>
          <section className="rounded-[20px] bg-white/5 border border-cream/16 p-5 grid gap-4 content-start">
            <h2 className="text-[18px] font-bold font-sans tracking-normal">Men and women</h2>
            <GenderSplit g={d.g} dark />
          </section>
          <section className="rounded-[20px] bg-white/5 border border-cream/16 p-5 grid gap-3 content-start">
            <h2 className="text-[18px] font-bold font-sans tracking-normal">Phone networks</h2>
            <NetDonut n={d.n} reach={d.reach} total={d.total} f={f} set={set} dark size={112} />
          </section>
        </div>
      </div>
    </div>
    </main>
  );
}

/** Scale a fixed-size slide so it fits the window, like a presentation. */
function useFit(w: number, h: number) {
  const [s, setS] = useState(1);
  useEffect(() => {
    const fit = () => setS(Math.min(window.innerWidth / w, window.innerHeight / h));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [w, h]);
  return s;
}
