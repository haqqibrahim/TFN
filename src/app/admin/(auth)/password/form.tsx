"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changePassword, signOut, type PasswordState } from "@/lib/auth-actions";
import { Submit } from "@/components/form";
import { Card, Err, darkField } from "../shell";

export function PasswordForm({ first, name }: { first: boolean; name: string }) {
  const [s, action] = useActionState<PasswordState, FormData>(changePassword, {});
  return (
    <Card
      title={first ? `Welcome, ${name}. Set your password` : "Change your password"}
      sub={first ? "You’re signed in with a temporary password. Choose your own before you continue." : undefined}
    >
      <form action={action} className="grid gap-5">
        <Err msg={s.error} />
        <div>
          <label htmlFor="current" className="block font-semibold text-[15px] mb-2">{first ? "Temporary password" : "Current password"}</label>
          <input id="current" name="current" type="password" autoComplete="current-password" required aria-invalid={s.field === "current"} className={darkField} />
        </div>
        <div>
          <label htmlFor="next" className="block font-semibold text-[15px] mb-2">New password</label>
          <input id="next" name="next" type="password" autoComplete="new-password" required minLength={10} aria-invalid={s.field === "next"} aria-describedby="next-hint" className={darkField} />
          <p id="next-hint" className="mt-1.5 text-[14px] text-cream/65">At least 10 characters. A short phrase is easy to remember.</p>
        </div>
        <div>
          <label htmlFor="confirm" className="block font-semibold text-[15px] mb-2">Type it again</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required aria-invalid={s.field === "confirm"} className={darkField} />
        </div>
        <Submit className="btn btn-coral w-full" pending="Saving…">Save password</Submit>
      </form>
      <div className="mt-5 flex justify-between gap-3 text-[15px]">
        {first ? (
          <form action={signOut}><button className="underline underline-offset-4 text-cream/80">Sign out</button></form>
        ) : (
          <Link href="/admin" className="underline underline-offset-4 text-cream/80">Back to the dashboard</Link>
        )}
      </div>
    </Card>
  );
}
