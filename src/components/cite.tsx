"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

type Pub = { title: string; authors: { name: string }[]; year: number; url: string };

function surnameFirst(name: string) {
  const parts = name.replace(/^(Dr|Prof\.?|Hon\.?)\s+/i, "").split(/\s+/);
  const last = parts.pop()!;
  return { last, initials: parts.map((p) => p[0] + ".").join(" ") };
}

function cite(style: string, p: Pub) {
  const a = p.authors.map((x) => surnameFirst(x.name));
  if (style === "APA") {
    const names = a.map((x) => `${x.last}, ${x.initials}`).join(a.length > 1 ? ", & " : "");
    return `${names} (${p.year}). ${p.title}. Tertiary Futures Network. ${p.url}`;
  }
  if (style === "Chicago") {
    const names = a.map((x, i) => (i === 0 ? `${x.last}, ${x.initials}` : `${x.initials} ${x.last}`)).join(" and ");
    return `${names} ${p.title}. Abuja: Tertiary Futures Network, ${p.year}.`;
  }
  const names = a.map((x) => `${x.last}, ${x.initials}`).join(" and ");
  return `${names} (${p.year}). ${p.title}. Abuja: Tertiary Futures Network.`;
}

export function Cite(p: Pub) {
  const [style, setStyle] = useState("Harvard");
  const text = cite(style, p);
  return (
    <div>
      <div className="flex gap-2" role="group" aria-label="Citation style">
        {["Harvard", "APA", "Chicago"].map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={style === s} onClick={() => setStyle(s)}>{s}</button>
        ))}
      </div>
      <p className="mt-4 rounded-[14px] bg-cream p-4 text-[15px] break-words" aria-live="polite">{text}</p>
      <CopyButton text={text} label="Copy citation" done="Citation copied" className="mt-3 btn btn-sm btn-line" />
    </div>
  );
}
