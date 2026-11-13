import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JoinStrip } from "@/components/join-strip";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <JoinStrip />
      <Header />
      <main id="main" className="wrap pt-10 pb-24 max-w-3xl">
        <p className="font-display text-[clamp(80px,14vw,160px)] font-semibold tracking-[-0.06em] leading-none text-coral">404</p>
        <h1 className="mt-4 h-page">We can’t find that page</h1>
        <p className="mt-4 lede text-muted">It may have moved, or the link may be wrong. These might help:</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-navy">Home page</Link>
          <Link href="/programmes" className="btn btn-line">Programmes</Link>
          <Link href="/join" className="btn btn-line">Join the Digital Communities</Link>
          <Link href="/contact" className="btn btn-line">Contact us</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
