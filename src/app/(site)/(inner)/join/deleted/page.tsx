import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Registration deleted", robots: { index: false } };

export default function Deleted() {
  return (
    <section className="wrap pt-10 pb-24 max-w-2xl">
      <h1 className="h-page">Your registration has been deleted</h1>
      <p className="mt-4 lede text-muted">We’ve removed your details. If you follow a TFN channel, unfollow it in WhatsApp or Telegram.</p>
      <Link href="/" className="mt-8 btn btn-navy">Back to the home page</Link>
    </section>
  );
}
