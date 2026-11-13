"use client";

import { useState } from "react";
import { Icon } from "./icons";

/** Uses the phone's share sheet where available, otherwise copies the link. */
export function ShareButton({ title, className = "btn btn-line" }: { title: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const url = window.location.href.split("#")[0];
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
            return;
          } catch {
            /* cancelled */
            return;
          }
        }
        await navigator.clipboard.writeText(url).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 2200);
      }}
    >
      <Icon name={done ? "check" : "share"} size={18} />
      <span aria-live="polite">{done ? "Link copied" : "Share"}</span>
    </button>
  );
}
