"use client";

import { useActionState } from "react";
import { resetPassword, type ResetState } from "@/lib/admin-actions";
import { CopyButton } from "@/components/copy-button";

export function ResetPassword({ id, name }: { id: string; name: string }) {
  const [s, action, pending] = useActionState<ResetState, FormData>(resetPassword, {});
  if (s.password) {
    return (
      <div role="status" className="flex items-center gap-2 whitespace-nowrap">
        <code className="font-mono text-[14px] bg-ok-tint text-ok rounded-[10px] px-2.5 py-1.5">{s.password}</code>
        <CopyButton text={s.password} label="Copy" />
      </div>
    );
  }
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(`Give ${name} a new temporary password? Their current one stops working.`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      {s.error && <span role="alert" className="err !mt-0 mr-2">{s.error}</span>}
      <button disabled={pending} className="btn btn-sm btn-line whitespace-nowrap">{pending ? "Resetting…" : "Reset password"}</button>
    </form>
  );
}
