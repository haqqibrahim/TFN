"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="wrap pt-16 pb-24 max-w-3xl">
      <h1 className="h-page">Something went wrong on our side</h1>
      <p className="mt-4 lede text-muted">Try again in a moment. If it keeps happening, email info@tfnetwork.org.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-navy">Try again</button>
        <Link href="/" className="btn btn-line">Home page</Link>
      </div>
    </main>
  );
}
