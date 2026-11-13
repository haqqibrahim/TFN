"use client";

import { createContext, Fragment, useContext, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/actions";

export const FormCtx = createContext<FormState>({});

export function useField(name: string) {
  const s = useContext(FormCtx);
  const v = s.values?.[name];
  return { error: s.errors?.[name], value: v, values: s.values };
}

export function ErrorSummary() {
  const s = useContext(FormCtx);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (s.ok === false && ref.current) {
      ref.current.focus({ preventScroll: true });
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [s]);
  if (!s.errors || !Object.keys(s.errors).length) {
    return s.ok === false && s.message ? (
      <div ref={ref} tabIndex={-1} role="alert" className="rounded-[14px] border-2 border-[#B3261E] bg-[#FDECEA] p-4 font-medium">{s.message}</div>
    ) : null;
  }
  return (
    <div ref={ref} role="alert" className="rounded-[14px] border-2 border-[#B3261E] bg-[#FDECEA] p-4" tabIndex={-1}>
      <p className="font-semibold">There’s a problem</p>
      <ul className="mt-2 grid gap-1 text-[15px]">
        {Object.entries(s.errors).map(([k, m]) => (
          <li key={k}>
            <a href={`#f-${k}`} className="underline underline-offset-2">{m}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  options?: string[];
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  prefix?: string;
  defaultValue?: string;
  className?: string;
  min?: string;
};

export function Field({ name, label, hint, type = "text", required, textarea, options, prefix, defaultValue, className = "", ...rest }: FieldProps) {
  const { error, value } = useField(name);
  const id = `f-${name}`;
  const hid = useId();
  const dv = (typeof value === "string" ? value : undefined) ?? defaultValue ?? "";
  const common = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [hint ? hid + "h" : "", error ? hid + "e" : ""].filter(Boolean).join(" ") || undefined,
    required,
    defaultValue: dv,
  };
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label} {!required && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {hint && <p id={hid + "h"} className="hint -mt-1 mb-2">{hint}</p>}
      <Fragment key={dv}>
      {textarea ? (
        <textarea className="field" rows={rest.rows ?? 5} placeholder={rest.placeholder} {...common} />
      ) : options ? (
        <select className="field" {...common}>
          <option value="">Choose…</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : prefix ? (
        <div className="flex">
          <span className="inline-flex items-center px-3.5 rounded-l-[12px] border-[1.5px] border-r-0 border-field bg-cream font-medium">{prefix}</span>
          <input className="field !rounded-l-none" type={type} autoComplete={rest.autoComplete} inputMode={rest.inputMode} placeholder={rest.placeholder} {...common} />
        </div>
      ) : (
        <input className="field" type={type} autoComplete={rest.autoComplete} inputMode={rest.inputMode} placeholder={rest.placeholder} min={rest.min} {...common} />
      )}
      </Fragment>
      {error && <p id={hid + "e"} className="err">{error}</p>}
    </div>
  );
}

/** Pill choices backed by real radio / checkbox inputs. */
export function ChipGroup({ name, legend, options, multiple = false, required = false, defaultValue, hint }: {
  name: string; legend: string; options: (string | { value: string; label: React.ReactNode })[]; multiple?: boolean; required?: boolean; defaultValue?: string | string[]; hint?: string;
}) {
  const { error, value } = useField(name);
  const current = value ?? defaultValue;
  const sel = new Set(Array.isArray(current) ? current : current ? [current] : []);
  return (
    <fieldset id={`f-${name}`} aria-invalid={error ? true : undefined}>
      <legend className="label">
        {legend} {!required && <span className="font-normal text-muted">(optional)</span>}
      </legend>
      {hint && <p className="hint -mt-1 mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2" key={[...sel].join()}>
        {options.map((o) => {
          const val = typeof o === "string" ? o : o.value;
          const lab = typeof o === "string" ? o : o.label;
          return (
            <label key={val} className="relative">
              <input className="peer sr-only" type={multiple ? "checkbox" : "radio"} name={name} value={val} defaultChecked={sel.has(val)} />
              <span className="chip">{lab}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="err">{error}</p>}
    </fieldset>
  );
}

export function Check({ name, children, required }: { name: string; children: React.ReactNode; required?: boolean }) {
  const { error, value } = useField(name);
  return (
    <div id={`f-${name}`}>
      <label className="check">
        <input type="checkbox" name={name} defaultChecked={value === "on"} required={required} aria-invalid={error ? true : undefined} key={String(value)} />
        <span>{children}</span>
      </label>
      {error && <p className="err ml-[34px]">{error}</p>}
    </div>
  );
}

export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Submit({ children, className = "btn btn-navy", pending: pendingLabel = "Sending…" }: { children: React.ReactNode; className?: string; pending?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
