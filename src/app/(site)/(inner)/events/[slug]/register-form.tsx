"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerEventAction, type FormState } from "@/lib/actions";
import { Check, ChipGroup, ErrorSummary, Field, FormCtx, Honeypot, Submit } from "@/components/form";
import { Sent } from "@/components/sent";

export function RegisterForm({ slug, online, inPersonFull, calendarHref }: { slug: string; online: boolean; inPersonFull: boolean; calendarHref: string }) {
  const [state, action] = useActionState<FormState, FormData>(registerEventAction, {});
  if (state.ok) {
    return (
      <Sent title={state.message === "already" ? "You’re already registered" : `You’re in, ${state.message}`}>
        <p>We’ve saved your place. We’ll email joining details a few days before.</p>
        <a href={calendarHref} className="mt-5 btn btn-white">Add to calendar</a>
      </Sent>
    );
  }
  const modes = [!inPersonFull && "In person", online && "Online"].filter(Boolean) as string[];
  return (
    <FormCtx.Provider value={state}>
      <form action={action} noValidate className="grid gap-5 relative">
        <input type="hidden" name="event" value={slug} />
        <ErrorSummary />
        <Honeypot />
        <Field name="name" label="Full name" required autoComplete="name" />
        <Field name="email" label="Email address" type="email" required autoComplete="email" inputMode="email" />
        <Field name="institution" label="Institution or organisation" autoComplete="organization" />
        <Field name="role" label="Role" options={["Student", "Academic staff", "Institution leadership", "Policymaker", "Researcher", "Partner organisation", "Other"]} />
        <ChipGroup name="attendance" legend="How will you attend?" options={modes} required defaultValue={modes[0]} />
        <Field name="access" label="Anything we should arrange for you?" textarea rows={3} hint="For example step-free access, a sign language interpreter or captions" />
        <Check name="privacy">
          I’ve read the <Link href="/privacy" className="link">privacy notice</Link>.
        </Check>
        <Submit className="btn btn-navy w-full" pending="Registering…">Register to attend</Submit>
      </form>
    </FormCtx.Provider>
  );
}
