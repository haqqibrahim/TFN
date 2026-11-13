"use client";

import Link from "next/link";
import { useActionState } from "react";
import { joinAction, type FormState } from "@/lib/actions";
import { JOIN_ROLES, NIGERIAN_STATES } from "@/lib/site";
import { Check, ChipGroup, ErrorSummary, Field, FormCtx, Honeypot, Submit } from "@/components/form";
import { TelegramLogo, WhatsAppLogo } from "@/components/icons";

export function JoinForm() {
  const [state, action] = useActionState<FormState, FormData>(joinAction, {});
  return (
    <FormCtx.Provider value={state}>
      <form action={action} noValidate className="grid gap-5 relative">
        <ErrorSummary />
        <Honeypot />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="firstName" label="First name" required autoComplete="given-name" />
          <Field name="email" label="Email address" type="email" required autoComplete="email" inputMode="email" />
        </div>
        <Field name="whatsapp" label="WhatsApp number" prefix="+234" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="803 123 4567" />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="institution" label="Institution" placeholder="e.g. University of Ibadan" autoComplete="organization" />
          <Field name="state" label="State" options={NIGERIAN_STATES} />
        </div>
        <ChipGroup name="role" legend="I am a" options={JOIN_ROLES} required defaultValue="Student" />
        <ChipGroup
          name="channel"
          legend="Preferred channel"
          required
          defaultValue="Both"
          options={[
            { value: "WhatsApp", label: <><WhatsAppLogo size={20} /> WhatsApp</> },
            { value: "Telegram", label: <><TelegramLogo size={20} /> Telegram</> },
            { value: "Both", label: "Both" },
          ]}
        />
        <div className="grid gap-3 pt-1">
          <Check name="emailUpdates">Send me Digital Communities updates by email and WhatsApp.</Check>
          <Check name="privacy">
            I’ve read the <Link href="/privacy#digital-communities" className="link">privacy notice</Link> and{" "}
            <Link href="/terms#community-standards" className="link">community standards</Link>.
          </Check>
        </div>
        <Submit className="btn btn-navy w-full sm:w-auto sm:self-start" pending="Registering…">Register</Submit>
      </form>
    </FormCtx.Provider>
  );
}
