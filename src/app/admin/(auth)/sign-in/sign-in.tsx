"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { codeStep, passwordStep, type SignInState } from "@/lib/auth-actions";
import { Submit } from "@/components/form";
import { Icon } from "@/components/icons";

function Card({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[28px] p-6 sm:p-8 w-full max-w-[440px]" aria-labelledby="t">
      <p className="text-[14px] text-cream/70">{step}</p>
      <h1 id="t" className="mt-2 text-[30px]">{title}</h1>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p role="alert" className="rounded-[12px] bg-coral/20 border border-coral/50 px-4 py-3 text-[15px] mb-4">{msg}</p> : null;
}

const dark = "w-full min-h-12 rounded-[12px] bg-white/8 border-[1.5px] border-white/30 px-4 text-cream placeholder:text-cream/40 focus:outline-3 focus:outline-coral focus:border-cream";

function CodeBoxes() {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [v, setV] = useState(["", "", "", "", "", ""]);
  const set = (i: number, ch: string) => {
    const next = [...v];
    next[i] = ch;
    setV(next);
  };
  return (
    <fieldset>
      <legend className="sr-only">6-digit code</legend>
      <input type="hidden" name="code" value={v.join("")} />
      <div className="grid grid-cols-6 gap-2" onPaste={(e) => {
        const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (d.length) {
          e.preventDefault();
          setV(d.padEnd(6, " ").split("").map((c) => c.trim()));
          refs.current[Math.min(d.length, 5)]?.focus();
        }
      }}>
        {v.map((c, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            aria-label={`Digit ${i + 1}`}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            value={c}
            autoFocus={i === 0}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (!digits) return set(i, "");
              // Typed or autofilled several digits at once: spread them across the boxes.
              const incoming = digits.length > 1 && digits.startsWith(c) ? digits.slice(c.length) || digits : digits;
              const next = [...v];
              let j = i;
              for (const d of incoming.slice(0, 6 - i)) next[j++] = d;
              setV(next);
              refs.current[Math.min(j, 5)]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !v[i] && i > 0) refs.current[i - 1]?.focus();
            }}
            className="h-14 text-center font-display text-[26px] font-semibold rounded-[12px] bg-white/8 border-[1.5px] border-white/30 text-cream focus:outline-3 focus:outline-coral focus:border-cream"
          />
        ))}
      </div>
    </fieldset>
  );
}

export function SignIn() {
  const [pw, pwAction] = useActionState<SignInState, FormData>(passwordStep, { step: "password" });
  const [code, codeAction] = useActionState<SignInState, FormData>(codeStep, {});
  const [backup, setBackup] = useState(false);

  if (code.step === "backup-codes" && code.codes) {
    return (
      <Card step="Two-step sign-in is on" title="Save your backup codes">
        <p className="text-cream/80 text-[15px]">If you lose your phone, each code signs you in once. Store them somewhere safe. You won’t see them again.</p>
        <ul className="mt-5 grid grid-cols-2 gap-2 font-mono text-[17px]">
          {code.codes.map((c) => <li key={c} className="rounded-[12px] bg-white/10 px-3 py-2 text-center tracking-[0.12em]">{c}</li>)}
        </ul>
        <Link href="/admin" className="mt-6 btn btn-coral w-full">I’ve saved them, continue</Link>
      </Card>
    );
  }

  const state = code.step === "password" ? code : pw;
  if (state.step === "code" || state.step === "enrol" || code.error) {
    const enrol = (code.qr || pw.qr) && !backup;
    const qr = code.qr || pw.qr;
    const secret = code.secret || pw.secret;
    if (code.step === "password") {
      // fall through to password card on timeout
    } else {
      return (
        <Card step="Step 2 of 2" title={enrol ? "Set up two-step sign-in" : "Confirm it’s you"}>
          {enrol && qr && (
            <div className="mb-6">
              <p className="text-cream/80 text-[15px]">Scan this with an authenticator app such as Google Authenticator or Microsoft Authenticator.</p>
              <div className="mt-4 flex items-center gap-4">
                <img src={qr} alt="QR code for your authenticator app" width={150} height={150} className="rounded-[14px] bg-white p-2" />
                <p className="text-[13px] text-cream/70 break-all">Can’t scan? Enter this key: <span className="font-mono text-cream">{secret}</span></p>
              </div>
            </div>
          )}
          <form action={codeAction} className="grid gap-5">
            <Err msg={code.error} />
            <input type="hidden" name="mode" value={backup ? "backup" : "totp"} />
            {backup ? (
              <div>
                <label htmlFor="b" className="block font-semibold text-[15px] mb-2">Backup code</label>
                <input id="b" name="code" autoComplete="off" autoFocus className={`${dark} font-mono tracking-[0.12em] uppercase`} />
              </div>
            ) : (
              <>
                <p className="text-cream/80 text-[15px] -mt-1">Enter the 6-digit code from your authenticator app.</p>
                <CodeBoxes />
              </>
            )}
            <Submit className="btn btn-coral w-full" pending="Checking…">Verify and sign in</Submit>
          </form>
          {!enrol && (
            <div className="mt-5 flex flex-wrap justify-between gap-3 text-[15px]">
              <button type="button" className="underline underline-offset-4" onClick={() => setBackup((b) => !b)}>
                {backup ? "Use your authenticator app" : "Use a backup code"}
              </button>
              <a className="underline underline-offset-4 text-cream/80" href="mailto:info@tfnetwork.org?subject=Lost%20admin%20device">Lost your device?</a>
            </div>
          )}
        </Card>
      );
    }
  }

  return (
    <Card step="Step 1 of 2" title="Sign in to TFN Admin">
      <form action={pwAction} className="grid gap-5">
        <Err msg={state.error} />
        <div>
          <label htmlFor="email" className="block font-semibold text-[15px] mb-2">Work email</label>
          <input id="email" name="email" type="email" autoComplete="username" required defaultValue={pw.email} className={dark} placeholder="name@tfnetwork.org" />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold text-[15px] mb-2">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={dark} />
        </div>
        <Submit className="btn btn-coral w-full" pending="Checking…">Continue</Submit>
      </form>
      <p className="mt-5 text-[14px] text-cream/70 flex gap-2"><Icon name="lock" size={16} className="flex-none mt-0.5" /> Admin accounts are created by a super administrator. There is no public sign-up.</p>
    </Card>
  );
}
