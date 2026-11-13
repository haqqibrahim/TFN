"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitOpportunityAction, type FormState } from "@/lib/actions";
import { Check, ErrorSummary, Field, FormCtx, Honeypot, Submit } from "@/components/form";
import { FileField } from "@/components/file-field";
import { Sent } from "@/components/sent";

const CATS = ["Scholarships", "Fellowships", "Internships", "Grants", "Training", "Enterprise", "Competitions"];

export function SubmitForm() {
  const [state, action] = useActionState<FormState, FormData>(submitOpportunityAction, {});
  const today = new Date().toISOString().slice(0, 10);
  if (state.ok) {
    return (
      <Sent title="Submitted for review">
        <p>Thank you. We’ll check the details and email you when it’s live, or if we need anything else.</p>
        <Link href="/opportunities" className="mt-5 btn btn-white">Back to the Opportunity Hub</Link>
      </Sent>
    );
  }
  return (
    <FormCtx.Provider value={state}>
      <form action={action} noValidate className="grid gap-5 relative">
        <ErrorSummary />
        <Honeypot />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="provider" label="Organisation or provider" required autoComplete="organization" />
          <Field name="title" label="Opportunity title" required />
          <Field name="category" label="Category" required options={CATS} />
          <Field name="location" label="Location or delivery mode" required placeholder="e.g. Lagos, online" />
        </div>
        <Field name="description" label="Description" required textarea rows={5} />
        <Field name="eligibility" label="Eligibility" required textarea rows={4} hint="One requirement per line" />
        <div className="grid grid-cols-2 gap-5">
          <Field name="opensAt" label="Opens" type="date" />
          <Field name="closesAt" label="Closes" type="date" required min={today} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="applyUrl" label="Application link" type="url" required inputMode="url" placeholder="https://" />
          <Field name="submitterEmail" label="Contact email" type="email" required autoComplete="email" inputMode="email" />
        </div>
        <FileField label="Supporting document" />
        <Check name="consent">
          I agree that TFN may review this submission and contact me about it. TFN may ask for more information, and may decline submissions that are incomplete, unverifiable or misleading.
        </Check>
        <Submit className="btn btn-navy w-full sm:w-auto sm:justify-self-start" pending="Submitting…">Submit for review</Submit>
      </form>
    </FormCtx.Provider>
  );
}
