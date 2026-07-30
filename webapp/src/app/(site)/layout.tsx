import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { listCategories } from "@/lib/db";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [session, categories] = await Promise.all([getSession(), listCategories()]);

  return (
    <>
      <Suspense fallback={null}>
        <Header initialSession={session} categories={categories} />
      </Suspense>
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </>
  );
}
