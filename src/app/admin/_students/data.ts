"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WARD_COUNCIL, type Council } from "@/lib/fct-map";

/** [ward, gender, ageBand, network, count]. The council comes from the ward. */
export type CubeRow = [string, "M" | "F", string, string, number];
export type Stats = { total: number; cube: CubeRow[] };
export type StudentRow = {
  rid: string; name: string; gender: "M" | "F"; council: Council; ward: string;
  vin: string; phone: string | null; network: string | null; birthYear: number;
};

export const AGES = ["18–21", "22–25", "26–30", "31+"];
export const NETS = [
  { k: "MTN", c: "#14213D" },
  { k: "Glo", c: "#FF6B5B" },
  { k: "Airtel", c: "#9AA6C4" },
  { k: "9mobile", c: "#D8CDB8" },
  { k: "Other", c: "#EFE9DE" },
];
export const YEAR = 2026;

export type Filters = { council: Council | null; ward: string | null; g: "all" | "M" | "F"; age: string; net: string };
export const NO_FILTERS: Filters = { council: null, ward: null, g: "all", age: "all", net: "all" };

export const fmt = (n: number) => Math.round(n).toLocaleString("en-NG");
export const pct = (a: number, b: number) => (b ? (100 * a) / b : 0);
export const pctTxt = (a: number, b: number) => pct(a, b).toFixed(1) + "%";

type Skip = "c" | "w" | "g" | "a" | "n" | null;

/** Totals for the current filters. Each breakdown ignores its own filter so the chart still shows every option. */
export function crunch(cube: CubeRow[], f: Filters) {
  const ok = (r: CubeRow, skip: Skip) =>
    (skip === "c" || !f.council || WARD_COUNCIL[r[0]] === f.council) &&
    (skip === "c" || skip === "w" || !f.ward || r[0] === f.ward) &&
    (skip === "g" || f.g === "all" || r[1] === f.g) &&
    (skip === "a" || f.age === "all" || r[2] === f.age) &&
    (skip === "n" || f.net === "all" || r[3] === f.net);
  const by = (skip: Skip, idx: number, key: (r: CubeRow) => string = (r) => r[idx] as string) => {
    const out: Record<string, number> = {};
    for (const r of cube) if (ok(r, skip)) { const k = key(r); out[k] = (out[k] || 0) + r[4]; }
    return out;
  };
  const nets = by(null, 3);
  const total = Object.values(nets).reduce((a, b) => a + b, 0);
  return {
    total,
    reach: total - (nets.None || 0),
    councils: by("c", 0, (r) => WARD_COUNCIL[r[0]]),
    wards: by("w", 0),
    g: by("g", 1),
    a: by("a", 2),
    n: by("n", 3),
  };
}

export function tags(f: Filters) {
  const t: string[] = [];
  if (f.ward) t.push(f.ward);
  else if (f.council) t.push(f.council === "AMAC" ? "Municipal Area Council" : f.council);
  if (f.g !== "all") t.push(f.g === "M" ? "Men" : "Women");
  if (f.age !== "all") t.push("Aged " + f.age);
  if (f.net !== "all") t.push("On " + f.net);
  return t;
}

/** Counts up to the target number, quickly from zero on first load and briefly on each change. */
export function useRollup(target: number) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = from.current;
    const t0 = performance.now();
    const dur = start === 0 ? 1400 : 600;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const v = start + (target - start) * (1 - Math.pow(1 - k, 3));
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

/** Wait before the next sync: at least 10 seconds, at most 3 minutes, usually under a minute and a half. */
const nextGap = () => 10_000 + Math.pow(Math.random(), 1.7) * 170_000;

/**
 * Syncs at uneven intervals, like a real feed. Each sync moves the stream on by one record,
 * resets "Synced … ago" and re-reads the database.
 */
export function useLive(syncedAt: number) {
  const router = useRouter();
  const [last, setLast] = useState(syncedAt);
  const [now, setNow] = useState(syncedAt);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        const at = Date.now();
        setTick((x) => x + 1);
        setLast(at);
        setNow(at);
        router.refresh();
        schedule();
      }, nextGap());
    };
    schedule();
    return () => { clearInterval(clock); clearTimeout(t); };
  }, [router]);
  const s = Math.max(0, Math.round((now - last) / 1000));
  const ago = s < 5 ? "just now" : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)} min ago`;
  return { ago, tick };
}

export function mix(a: string, b: string, t: number) {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t).toString(16).padStart(2, "0")).join("");
}
