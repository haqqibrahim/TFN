import { LogoMark } from "@/components/logo";

export function AuthShell({ children, foot }: { children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <main className="grad min-h-dvh flex flex-col">
      <div className="wrap py-6 flex items-center gap-3">
        <LogoMark onDark />
        <span className="font-display font-semibold tracking-[-0.03em] text-[17px] leading-[1.05]">Tertiary Futures<br />Network</span>
      </div>
      <div className="flex-1 grid place-items-center px-4 pb-10">{children}</div>
      {foot && <p className="text-center text-[14px] text-cream/60 pb-6 px-4">{foot}</p>}
    </main>
  );
}

export function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 w-full max-w-[440px]" aria-labelledby="t">
      <h1 id="t" className="text-[30px]">{title}</h1>
      {sub && <p className="mt-2 text-cream/75 text-[15px]">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Err({ msg }: { msg?: string }) {
  return msg ? <p role="alert" className="rounded-[12px] bg-coral/20 border border-coral/50 px-4 py-3 text-[15px] mb-4">{msg}</p> : null;
}

export const darkField = "w-full min-h-12 rounded-[12px] bg-white/8 border-[1.5px] border-white/30 px-4 text-cream placeholder:text-cream/40 focus:outline-3 focus:outline-coral focus:border-cream aria-[invalid=true]:border-coral";
