"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ALIASES, INSTITUTIONS, type Institution } from "@/lib/institutions";
import { useField } from "./form";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");
const INDEX = INSTITUTIONS.map((i) => {
  const name = norm(i.name);
  const alias = ALIASES[i.name] ? " " + norm(ALIASES[i.name]) : "";
  return { ...i, name: i.name, plain: name.replace(/\s+/g, " ").trim(), key: " " + name + alias + " " };
});

function search(q: string): Institution[] {
  const query = norm(q).replace(/\s+/g, " ").trim();
  const words = query.split(" ").filter(Boolean);
  if (!words.length) return [];
  const score = (i: (typeof INDEX)[number]) => {
    let s = 0;
    if (i.plain === query) s += 100;
    if (ALIASES[i.name] && ` ${norm(ALIASES[i.name])} `.includes(` ${query} `)) s += 80; // typed a short name like "unilag"
    if (i.plain.startsWith(query)) s += 20;
    s += words.filter((w) => i.key.includes(" " + w)).length * 5; // whole-word starts
    return s;
  };
  return INDEX.filter((i) => words.every((w) => i.key.includes(w)))
    .map((i) => ({ i, s: score(i) }))
    .sort((a, b) => b.s - a.s || a.i.plain.length - b.i.plain.length)
    .slice(0, 8)
    .map(({ i }) => ({ name: i.name, kind: i.kind }));
}

/** Search-as-you-type list of Nigerian institutions, with "type your own" for anything missing. */
export function InstitutionPicker({ name = "institution", label = "Institution" }: { name?: string; label?: string }) {
  const { error, value } = useField(name);
  const [q, setQ] = useState(typeof value === "string" ? value : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = `f-${name}`;
  const lid = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => search(q), [q]);
  const exact = results.some((r) => norm(r.name).trim() === norm(q).trim());
  const typed = q.trim();
  const options: { name: string; kind?: string; own?: boolean }[] = [...results];
  if (typed.length >= 3 && !exact) options.push({ name: typed, own: true });
  const show = open && typed.length > 0;

  function pick(n: string) {
    setQ(n);
    setOpen(false);
    setActive(-1);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && show && active >= 0 && options[active]) {
      e.preventDefault();
      pick(options[active].name);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="label">{label}</label>
      <p id={lid + "h"} className="hint -mt-1 mb-2">Start typing and choose yours. Not listed? Type the full name.</p>
      <input
        ref={inputRef}
        id={id}
        name={name}
        className="field"
        type="text"
        role="combobox"
        autoComplete="off"
        required
        maxLength={160}
        placeholder="e.g. University of Ibadan"
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls={lid + "l"}
        aria-activedescendant={show && active >= 0 ? `${lid}o${active}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[lid + "h", error ? lid + "e" : ""].filter(Boolean).join(" ")}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKey}
      />
      {show && (
        <ul
          id={lid + "l"}
          role="listbox"
          aria-label="Matching institutions"
          className="absolute z-20 left-0 right-0 mt-1.5 max-h-[300px] overflow-auto rounded-[14px] border-[1.5px] border-field bg-white shadow-lg py-1"
        >
          {options.length === 0 && <li className="px-4 py-3 text-muted">Keep typing to search</li>}
          {options.map((o, i) => (
            <li
              key={(o.own ? "own:" : "") + o.name}
              id={`${lid}o${i}`}
              role="option"
              aria-selected={i === active}
              className={`px-4 py-2.5 cursor-pointer ${i === active ? "bg-cream" : ""} ${o.own ? "border-t border-field" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o.name);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {o.own ? (
                <span>Use “{o.name}”</span>
              ) : (
                <>
                  <span className="block font-medium leading-snug">{o.name}</span>
                  <span className="block text-[13px] text-muted">{o.kind}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p id={lid + "e"} className="err">{error}</p>}
    </div>
  );
}
