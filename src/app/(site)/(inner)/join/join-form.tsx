"use client";

import Link from "next/link";
import { useActionState } from "react";
import { joinAction, type FormState } from "@/lib/actions";
import { JOIN_ROLES, NIGERIAN_STATES } from "@/lib/site";
import { Check, ChipGroup, ErrorSummary, Field, FormCtx, Honeypot, Submit } from "@/components/form";
import { TelegramLogo, WhatsAppLogo } from "@/components/icons";
import { InstitutionPicker } from "@/components/institution-picker";

export function JoinForm({ channel = "Both" }: { channel?: "WhatsApp" | "Telegram" | "Both" }) {
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
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="whatsapp" label="WhatsApp number" required prefix="+234" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="803 123 4567" />
          <Field name="state" label="State" required options={NIGERIAN_STATES} />
        </div>
        <InstitutionPicker />
        <ChipGroup name="role" legend="I am a" options={JOIN_ROLES} required defaultValue="Student" />
        <ChipGroup
          name="pvc"
          legend="Do you have a Permanent Voter’s Card (PVC)?"
          hint="We only ask yes or no. Never send a photo of your PVC to anyone."
          required
          options={["Yes", "No"]}
        />
        <ChipGroup
          name="channel"
          legend="Which channel do you want to join?"
          required
          defaultValue={channel}
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
        <Submit className="btn btn-navy w-full sm:w-auto sm:self-start" pending="Registering…">Register and get the links</Submit>
      </form>
    </FormCtx.Provider>
  );
}
