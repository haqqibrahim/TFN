import type { Metadata } from "next";
import { AuthShell } from "../shell";
import { SignIn } from "./sign-in";

export const metadata: Metadata = { title: { absolute: "Sign in | TFN Admin" }, robots: { index: false, follow: false } };

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn />
    </AuthShell>
  );
}
