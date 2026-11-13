"use client";

import { useState } from "react";
import { Icon } from "./icons";

export function CopyButton({
  text,
  label,
  done = "Copied",
  className = "btn btn-line",
  absolute = false,
}: {
  text: string;
  label: string;
  done?: string;
  className?: string;
  /** when true, `text` is a path and is turned into a full URL on this origin */
  absolute?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const value = absolute ? new URL(text, window.location.origin).toString() : text;
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const t = document.createElement("textarea");
          t.value = value;
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          t.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }}
    >
      <Icon name={copied ? "check" : "copy"} size={18} />
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
