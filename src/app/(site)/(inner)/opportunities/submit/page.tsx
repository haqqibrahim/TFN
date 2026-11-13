import type { Metadata } from "next";
import { BackLink } from "@/components/cards";
import { Icon, type IconName } from "@/components/icons";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit an Opportunity",
  description: "Share a scholarship, fellowship, internship, grant or training opportunity with TFN’s network. Every submission is reviewed.",
};

const NEXT: { line: string; icon: IconName }[] = [
  { line: "We check the details with you or the provider.", icon: "shield" },
  { line: "Approved listings appear on the Opportunity Hub.", icon: "check" },
  { line: "We may share it on the Digital Communities channels.", icon: "megaphone" },
];

export default function SubmitOpportunity() {
  return (
    <>
      <section className="wrap pt-4 lg:pt-6 pb-8">
        <BackLink href="/opportunities" label="Opportunity Hub" />
        <h1 className="mt-6 h-page">Submit an opportunity</h1>
        <p className="mt-4 lede text-muted max-w-[46ch]">Share an opportunity with students, graduates and emerging leaders across the network. We review every submission before it goes live.</p>
      </section>
      <div className="wrap pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 items-start [&>*]:min-w-0">
        <div className="card p-6 sm:p-8">
          <SubmitForm />
        </div>
        <aside className="grad rounded-[20px] p-6 lg:sticky lg:top-6" aria-labelledby="next">
          <h2 id="next" className="text-[26px]">What happens next</h2>
          <ol className="mt-5 grid gap-4">
            {NEXT.map((n) => (
              <li key={n.line} className="flex gap-3 items-start">
                <span className="w-10 h-10 rounded-[12px] bg-white/12 text-coral grid place-items-center flex-none"><Icon name={n.icon} size={20} /></span>
                <span className="pt-2">{n.line}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
