"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/lib/auth-actions";
import { Submit } from "@/components/form";
import { Icon } from "@/components/icons";
import { Card, Err, darkField } from "../shell";

export function SignIn() {
  const [s, action] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <Card title="Sign in to TFN Admin">
      <form action={action} className="grid gap-5">
        <Err msg={s.error} />
        <div>
          <label htmlFor="email" className="block font-semibold text-[15px] mb-2">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required defaultValue={s.email} className={darkField} placeholder="name@tfnetwork.org" />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold text-[15px] mb-2">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={darkField} />
        </div>
        <Submit className="btn btn-coral w-full" pending="Signing in…">Sign in</Submit>
      </form>
      <p className="mt-5 text-[14px] text-cream/70 flex gap-2"><Icon name="lock" size={16} className="flex-none mt-0.5" /> Accounts are created by a super administrator. Forgotten your password? Ask them to reset it.</p>
    </Card>
  );
}
