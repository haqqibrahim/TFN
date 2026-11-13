"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./icons";

/** Confirmation panel shown in place of a form once it has been sent. */
export function Sent({ title, children }: { title: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-[20px] grad p-6 lg:p-8 outline-none">
      <span className="w-12 h-12 rounded-full bg-coral text-navy grid place-items-center"><Icon name="check" size={24} strokeWidth={2.4} /></span>
      <h3 className="mt-5 text-[28px]">{title}</h3>
      <div className="mt-2 text-cream/80">{children}</div>
    </div>
  );
}
