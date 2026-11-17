"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { COUNCILS, COUNCIL_NAMES, wardsOf } from "@/lib/fct-map";
import { NETS, YEAR, fmt, useLive, useRollup, type StudentRow } from "./data";
import { LivePill, Pill } from "./parts";

const PER = 25;

export function Records({ rows, total, syncedAt }: { rows: StudentRow[]; total: number; syncedAt: number }) {
  const [q, setQ] = useState("");
  const [g, setG] = useState<"all" | "M" | "F">("all");
  const [net, setNet] = useState("all");
  const [ward, setWard] = useState("all");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const { ago, tick } = useLive(syncedAt);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  const shown = useRollup(total);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) =>
      (g === "all" || r.gender === g) && (net === "all" || r.network === net) && (ward === "all" || r.ward === ward || ward === "c:" + r.council) &&
      (!s || `${r.name} ${r.ward} ${r.council} ${r.rid}`.toLowerCase().includes(s)));
  }, [rows, q, g, net, ward]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const p = Math.min(page, pages - 1);
  const slice = list.slice(p * PER, p * PER + PER);
  const rec = rows.find((r) => r.rid === open);
  const feed = rows.length ? [0, 1, 2, 3, 4].map((i) => rows[(tick + i) % rows.length]) : [];
  const reset = (fn: () => void) => { fn(); setPage(0); };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px]">Student records</h1>
          <p className="mt-1 text-muted">A presentation sample of {fmt(rows.length)} records. Names, VINs and phone numbers are masked.</p>
        </div>
        <LivePill ago={ago} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-[20px] bg-navy text-cream px-4 sm:px-5 py-3.5"><p className="text-[14px] text-[#C9CFDD]">Students in the database</p><p className="font-display font-semibold text-[26px] sm:text-[32px] tracking-[-0.035em] tabular-nums">{fmt(shown)}</p></div>
        <div className="rounded-[20px] bg-white border border-adminline px-4 sm:px-5 py-3.5"><p className="text-[14px] font-semibold text-muted">Shown in this view</p><p className="font-display font-semibold text-[26px] sm:text-[32px] tracking-[-0.035em]">{fmt(rows.length)}</p></div>
        <div className="rounded-[20px] bg-white border border-adminline px-4 sm:px-5 py-3.5"><p className="text-[14px] font-semibold text-muted">Area councils</p><p className="font-display font-semibold text-[26px] sm:text-[32px] tracking-[-0.035em]">{COUNCILS.length}</p></div>
        <div className="rounded-[20px] bg-white border border-adminline px-4 sm:px-5 py-3.5"><p className="text-[14px] font-semibold text-muted">Wards covered</p><p className="font-display font-semibold text-[26px] sm:text-[32px] tracking-[-0.035em]">{COUNCILS.reduce((n, c) => n + wardsOf(c).length, 0)}</p></div>
      </div>

      <div className="flex flex-wrap gap-5 items-start">
        <section className="flex-[999_1_860px] min-w-0 bg-white border border-adminline rounded-[20px] overflow-hidden">
          <div className="px-5 sm:px-7 py-5 flex flex-wrap items-center gap-3 border-b border-adminline">
            <label className="flex-[1_1_260px] flex items-center gap-2 min-h-11 px-3.5 rounded-[12px] border-[1.5px] border-[#C9C2B4] focus-within:border-navy">
              <Icon name="search" size={18} className="text-muted flex-none" />
              <span className="sr-only">Search records</span>
              <input type="search" value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Search name, ward, council or record ID" className="flex-1 min-w-0 bg-transparent outline-none" />
            </label>
            <label className="flex items-center gap-2 text-[14px] font-semibold text-muted">
              Area
              <span className="relative">
                <select value={ward} onChange={(e) => reset(() => setWard(e.target.value))} className="appearance-none min-h-11 rounded-[12px] border-[1.5px] border-[#C9C2B4] pl-3.5 pr-11 text-navy font-normal bg-white cursor-pointer hover:border-navy focus:border-navy">
                  <option value="all">All of the FCT</option>
                  {COUNCILS.map((c) => (
                    <optgroup key={c} label={COUNCIL_NAMES[c]}>
                      <option value={"c:" + c}>All of {c}</option>
                      {wardsOf(c).map((w) => <option key={w} value={w}>{w}</option>)}
                    </optgroup>
                  ))}
                </select>
                <Icon name="chevronDown" size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy" />
              </span>
            </label>
            <div role="group" aria-label="Gender" className="flex gap-1.5">
              {(["all", "M", "F"] as const).map((x) => <Pill key={x} on={g === x} onClick={() => reset(() => setG(x))}>{x === "all" ? "All" : x === "M" ? "Men" : "Women"}</Pill>)}
            </div>
            <div role="group" aria-label="Network" className="flex flex-wrap gap-1.5">
              {["all", ...NETS.slice(0, 4).map((n) => n.k)].map((x) => <Pill key={x} on={net === x} onClick={() => reset(() => setNet(x))}>{x === "all" ? "All networks" : x}</Pill>)}
            </div>
          </div>

          {feed[0] && (
            <div key={feed[0].rid + tick} className="flex items-center gap-3 px-5 sm:px-7 py-2.5 bg-[#EAF6EF] border-b border-[#CDE9D9] text-[14px] animate-[tfn-in_.5s_ease]">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#1F9D63] animate-[tfn-pulse_1.8s_infinite] flex-none" />
              <span className="min-w-0 truncate"><strong>Just synced:</strong> {feed[0].rid}, {feed[0].name}, {feed[0].ward}, {feed[0].council}</span>
            </div>
          )}

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[860px] text-[14px]">
              <thead>
                <tr className="text-left text-[13px] text-muted">
                  {["Record", "Name", "Gender", "Age", "Ward", "Council", "VIN", "Phone"].map((h) => <th key={h} scope="col" className="px-4 first:pl-7 last:pr-7 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => (
                  <tr key={r.rid} className={`border-t border-[#F0EBE1] ${open === r.rid ? "bg-coral-tint" : "hover:bg-admin"}`}>
                    <td className="pl-7 pr-4 py-3 font-mono text-[13px] text-muted whitespace-nowrap">{r.rid}</td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => setOpen(r.rid)} className="inline-flex items-center gap-2.5 min-h-9 font-semibold whitespace-nowrap hover:underline">
                        <span aria-hidden="true" className="w-[30px] h-[30px] rounded-full bg-cream grid place-items-center text-[13px] font-bold">{r.name.slice(0, 1)}</span>{r.name}
                      </button>
                    </td>
                    <td className="px-4">{r.gender === "M" ? "Male" : "Female"}</td>
                    <td className="px-4 tabular-nums">{YEAR - r.birthYear}</td>
                    <td className="px-4 whitespace-nowrap">{r.ward}</td>
                    <td className="px-4 whitespace-nowrap">{r.council}</td>
                    <td className="px-4 font-mono text-[13px] whitespace-nowrap">{r.vin}</td>
                    <td className="pl-4 pr-7 font-mono text-[13px] whitespace-nowrap">{r.phone || "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden grid gap-2.5 px-5 py-4">
            {slice.map((r) => {
              const on = open === r.rid;
              return (
                <li key={r.rid} className={`rounded-[20px] border border-adminline overflow-hidden ${on ? "bg-coral-tint" : "bg-white"}`}>
                  <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : r.rid)} className="w-full flex items-center gap-3 px-3.5 py-3 min-h-16 text-left">
                    <span aria-hidden="true" className="w-10 h-10 rounded-full bg-cream grid place-items-center font-bold flex-none">{r.name.slice(0, 1)}</span>
                    <span className="flex-1 min-w-0"><span className="block font-semibold">{r.name}</span><span className="block text-[13px] text-muted truncate">{r.ward}, {r.council}, {r.gender === "M" ? "Male" : "Female"}, {YEAR - r.birthYear}</span></span>
                    <span className="text-[12px] text-muted font-mono">{r.rid}</span>
                  </button>
                  {on && (
                    <dl className="px-3.5 pb-3.5 grid grid-cols-[96px_minmax(0,1fr)] gap-x-2.5 gap-y-1.5 text-[14px]">
                      <dt className="text-muted">Council</dt><dd>{COUNCIL_NAMES[r.council]}</dd>
                      <dt className="text-muted">VIN</dt><dd className="font-mono">{r.vin}</dd>
                      <dt className="text-muted">Phone</dt><dd className="font-mono">{r.phone || "None"}</dd>
                      <dt className="text-muted">Network</dt><dd>{r.network || "None"}</dd>
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>

          {slice.length === 0 && <p className="p-6 text-center text-muted">No records match. Try a different search.</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-adminline text-[14px] text-muted">
            <span>{list.length ? `${fmt(p * PER + 1)}–${fmt(Math.min(list.length, p * PER + PER))} of ${fmt(list.length)}` : "0 records"}</span>
            <div className="flex gap-2">
              <button type="button" disabled={p === 0} onClick={() => setPage(p - 1)} className="btn btn-line btn-sm">Previous</button>
              <button type="button" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="btn btn-line btn-sm">Next</button>
            </div>
          </div>
        </section>

        <aside aria-label="Sync stream" className="flex-[1_1_300px] min-w-0 grid gap-4">
          {rec && (
            <section role="dialog" aria-label={`Record ${rec.rid}`} className="hidden md:grid content-start fixed z-40 right-4 top-4 w-[380px] max-h-[calc(100dvh-32px)] overflow-y-auto bg-white border border-adminline rounded-[20px] p-5 gap-3.5 shadow-[0_24px_60px_rgba(20,33,61,.25)] animate-[tfn-in_.3s_ease]">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="w-[52px] h-[52px] rounded-full bg-navy text-cream grid place-items-center font-display font-semibold text-[22px]">{rec.name.slice(0, 1)}</span>
                  <div><p className="text-[19px] font-bold">{rec.name}</p><p className="text-[13px] text-muted font-mono">{rec.rid}</p></div>
                </div>
                <button type="button" aria-label="Close record" onClick={() => setOpen(null)} className="w-10 h-10 rounded-full bg-admin grid place-items-center"><Icon name="x" size={16} /></button>
              </div>
              <dl className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[14px]">
                <dt className="text-muted">Gender</dt><dd>{rec.gender === "M" ? "Male" : "Female"}</dd>
                <dt className="text-muted">Age today</dt><dd>{YEAR - rec.birthYear}</dd>
                <dt className="text-muted">Ward</dt><dd>{rec.ward}</dd>
                <dt className="text-muted">Area council</dt><dd>{COUNCIL_NAMES[rec.council]}</dd>
                <dt className="text-muted">VIN</dt><dd className="font-mono">{rec.vin}</dd>
                <dt className="text-muted">Phone</dt><dd className="font-mono">{rec.phone || "None"}{rec.network && <span className="font-sans text-muted"> on {rec.network}</span>}</dd>
              </dl>
              <p className="flex items-center gap-2 bg-admin rounded-[12px] px-3 py-2.5 text-[13px] text-muted"><Icon name="lock" size={16} className="flex-none" /> Masked for presentation.</p>
            </section>
          )}
          <section className="hidden md:grid bg-navy text-cream rounded-[20px] px-6 py-5 gap-1">
            <h2 className="flex items-center gap-2 text-[17px] font-bold font-sans tracking-normal mb-1"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-coral animate-[tfn-pulse_1.8s_infinite]" />Sync stream</h2>
            {feed.map((r, i) => (
              <div key={r.rid + i} className="flex justify-between gap-3 py-2 border-t border-cream/14 text-[14px]">
                <span className="min-w-0"><span className="block font-semibold">{r.name}</span><span className="block text-[12px] text-[#C9CFDD] font-mono">{r.rid}</span></span>
                <span className="text-[#C9CFDD] whitespace-nowrap">{r.ward}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
