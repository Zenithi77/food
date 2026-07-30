import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <Suspense fallback={null}>
        <Header initialSession={session} />
      </Suspense>
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </>
  );
}
