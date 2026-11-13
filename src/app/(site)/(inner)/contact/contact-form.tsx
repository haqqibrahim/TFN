"use client";

import { useActionState, useState } from "react";
import { enquiryAction, type FormState } from "@/lib/actions";
import { CONTACT_TOPICS } from "@/lib/site";
import { Check, ErrorSummary, Field, FormCtx, Honeypot, Submit } from "@/components/form";
import { Sent } from "@/components/sent";

export function ContactForm({ topic, fake }: { topic: string; fake: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(enquiryAction, {});
  const [cat, setCat] = useState(topic);
  const chosen = (state.values?.category as string) || cat;

  if (state.ok) {
    return (
      <Sent title={`Thanks, ${state.message || "we’ve got it"}`}>
        Your message has reached the {chosen.toLowerCase()} team. We reply within five working days.
      </Sent>
    );
  }

  return (
    <FormCtx.Provider value={state}>
      <section aria-labelledby="about-q" className="mb-8">
        <h2 id="about-q" className="text-[24px]">What’s it about?</h2>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Enquiry category">
          {CONTACT_TOPICS.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={chosen === t} onClick={() => setCat(t)}>
              {t}
            </button>
          ))}
        </div>
      </section>
      <form action={action} noValidate className="grid gap-5 relative card p-6 lg:p-8">
        <ErrorSummary />
        <Honeypot />
        <div className="grid sm:grid-cols-2 gap-5">
          <Field name="name" label="Full name" required autoComplete="name" />
          <Field name="email" label="Email address" type="email" required autoComplete="email" inputMode="email" />
          <Field name="organisation" label="Organisation or institution" autoComplete="organization" />
          <Field name="role" label="Role or affiliation" />
          <Field name="phone" label="Telephone" type="tel" autoComplete="tel" inputMode="tel" />
          <div>
            <label htmlFor="f-category" className="label">Enquiry category</label>
            <select id="f-category" name="category" className="field" value={chosen} onChange={(e) => setCat(e.target.value)}>
              {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <Field name="subject" label="Subject" required defaultValue={fake ? "Suspicious TFN channel" : undefined} />
        <Field
          name="message"
          label="Message"
          required
          textarea
          rows={6}
          hint={fake ? "Tell us where you saw it, the link or number, and what it asked for. Don’t include passwords or bank details." : undefined}
        />
        <Check name="consent">TFN may contact me about this enquiry.</Check>
        <Submit className="btn btn-navy w-full sm:w-auto sm:justify-self-start">Send message</Submit>
      </form>
    </FormCtx.Provider>
  );
}
