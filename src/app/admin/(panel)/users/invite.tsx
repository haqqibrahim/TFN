"use client";

import { useActionState } from "react";
import { inviteUser, type InviteState } from "@/lib/admin-actions";
import { CopyButton } from "@/components/copy-button";
import { Submit } from "@/components/form";

export function Invite({ roles }: { roles: readonly string[] }) {
  const [s, action] = useActionState<InviteState, FormData>(inviteUser, {});
  if (s.ok) {
    return (
      <div role="status" className="rounded-[14px] bg-ok-tint p-4">
        <p className="font-semibold text-ok">Account created for {s.email}</p>
        <p className="mt-1 text-[15px]">Send them this temporary password privately. They’ll set up two-step sign-in the first time they sign in.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="font-mono text-[17px] bg-white rounded-[12px] px-3 py-2 tracking-[0.06em]">{s.password}</code>
          <CopyButton text={s.password || ""} label="Copy password" />
        </div>
        <p className="hint">You won’t see this password again.</p>
      </div>
    );
  }
  return (
    <form action={action} className="grid sm:grid-cols-[1fr_1fr_200px_auto] gap-3 items-end">
      {s.error && <p role="alert" className="sm:col-span-4 err !mt-0">{s.error}</p>}
      <div><label htmlFor="u-name" className="label">Name</label><input id="u-name" name="name" required className="field" /></div>
      <div><label htmlFor="u-email" className="label">Work email</label><input id="u-email" name="email" type="email" required className="field" placeholder="name@tfnetwork.org" /></div>
      <div><label htmlFor="u-role" className="label">Role</label>
        <select id="u-role" name="role" defaultValue="Viewer" className="field">{roles.map((r) => <option key={r}>{r}</option>)}</select></div>
      <Submit className="btn btn-sm btn-navy !min-h-12" pending="Creating…">Create account</Submit>
    </form>
  );
}
