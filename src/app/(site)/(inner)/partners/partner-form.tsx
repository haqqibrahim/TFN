"use client";

import { useActionState } from "react";
import { partnershipAction, type FormState } from "@/lib/actions";
import { PARTNER_AREAS, PARTNER_TYPES } from "@/lib/site";
import { Check, ErrorSummary, Field, FormCtx, Honeypot, Submit } from "@/components/form";
import { FileField } from "@/components/file-field";
import { Sent } from "@/components/sent";

export function PartnerForm() {
  const [state, action] = useActionState<FormState, FormData>(partnershipAction, {});
  if (state.ok) {
    return (
      <Sent title={`Thank you, ${state.message || "we’ve got it"}`}>
        Your proposal is with our partnerships team. Every proposal is reviewed through TFN’s authorised processes, and we’ll reply by email.
      </Sent>
    );
  }
  return (
    <FormCtx.Provider value={state}>
      <form action={action} noValidate className="grid gap-5 relative">
        <ErrorSummary />
        <Honeypot />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="organisation" label="Organisation name" required autoComplete="organization" />
          <Field name="orgType" label="Organisation type" required options={PARTNER_TYPES.map((t) => t.name)} />
          <Field name="website" label="Website" type="url" inputMode="url" placeholder="https://" />
          <Field name="name" label="Contact person" required autoComplete="name" />
          <Field name="email" label="Official email" type="email" required autoComplete="email" inputMode="email" />
          <Field name="area" label="Area of collaboration" required options={PARTNER_AREAS} />
        </div>
        <Field name="message" label="Brief proposal" required textarea rows={6} />
        <FileField label="Relevant attachment" />
        <Check name="consent">TFN may contact me about this proposal. Every proposal is reviewed through TFN’s authorised processes.</Check>
        <Submit className="btn btn-navy w-full sm:w-auto sm:justify-self-start">Send enquiry</Submit>
      </form>
    </FormCtx.Provider>
  );
}
