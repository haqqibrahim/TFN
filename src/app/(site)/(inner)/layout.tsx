import { Header } from "@/components/header";
import { JoinStrip } from "@/components/join-strip";

export default function InnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JoinStrip />
      <Header />
      <main id="main">{children}</main>
    </>
  );
}
