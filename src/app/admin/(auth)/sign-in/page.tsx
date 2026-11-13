import type { Metadata } from "next";
import { LogoMark } from "@/components/logo";
import { SignIn } from "./sign-in";

export const metadata: Metadata = { title: { absolute: "Sign in | TFN Admin" }, robots: { index: false, follow: false } };

export default function SignInPage() {
  return (
    <main className="grad min-h-dvh flex flex-col">
      <div className="wrap py-6 flex items-center gap-3">
        <LogoMark onDark />
        <span className="font-display font-semibold tracking-[-0.03em] text-[17px] leading-[1.05]">Tertiary Futures<br />Network</span>
      </div>
      <div className="flex-1 grid place-items-center px-4 pb-10">
        <SignIn />
      </div>
      <p className="text-center text-[14px] text-cream/60 pb-6 px-4">Two-step sign-in is required for every admin account.</p>
    </main>
  );
}
