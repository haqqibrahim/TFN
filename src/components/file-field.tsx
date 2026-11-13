"use client";

import { useState } from "react";
import { useField } from "./form";
import { Icon } from "./icons";

export function FileField({ name = "file", label, hint = "PDF or Word, up to 10 MB" }: { name?: string; label: string; hint?: string }) {
  const { error } = useField(name);
  const [file, setFile] = useState<string>("");
  return (
    <div id={`f-${name}`}>
      <span className="label">{label} <span className="font-normal text-muted">(optional)</span></span>
      <label className={`flex items-center gap-4 rounded-[14px] border-[1.5px] border-dashed p-4 cursor-pointer bg-white hover:bg-cream/50 focus-within:outline focus-within:outline-3 focus-within:outline-coral ${error ? "border-[#B3261E]" : "border-field"}`}>
        <span className="w-11 h-11 rounded-[12px] bg-cream grid place-items-center flex-none"><Icon name={file ? "doc" : "plus"} size={20} /></span>
        <span className="min-w-0">
          <span className="block font-semibold truncate">{file || "Choose a file"}</span>
          <span className="block text-[14px] text-muted">{hint}</span>
        </span>
        <input
          type="file"
          name={name}
          className="sr-only"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
        />
      </label>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
