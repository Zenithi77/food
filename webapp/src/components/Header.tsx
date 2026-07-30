"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useCartStore, cartCount } from "@/store/cart";
import type { CategoryDTO, SessionUser } from "@/types";

export function Header({
  initialSession,
  categories,
}: {
  initialSession: SessionUser | null;
  categories: CategoryDTO[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category");
  const items = useCartStore((s) => s.items);
  const [session, setSession] = useState(initialSession);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => setHydrated(true), []);
  useEffect(() => setSession(initialSession), [initialSession]);
  useEffect(() => setMenuOpen(false), [session]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  }

  const count = hydrated ? cartCount(items) : 0;

  return (
    <header className="w-full top-0 sticky z-50 bg-background shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex justify-between items-center">
        <div className="flex items-center gap-u-xl">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-on-primary group-hover:opacity-90 transition-opacity">
              <MaterialIcon name="shopping_basket" className="text-lg" />
            </span>
            <span className="font-headline-md text-headline-md font-medium text-primary">ХүнсМаркет</span>
          </Link>
          <nav className="hidden md:flex gap-u-md">
            <Link href="/" className="relative py-1 text-secondary hover:text-primary transition-colors font-label-md text-label-md group">
              Дэлгүүр
              <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-primary transition-all duration-200 group-hover:w-full" />
            </Link>
            <Link href="/orders" className="relative py-1 text-secondary hover:text-primary transition-colors font-label-md text-label-md group">
              Захиалгууд
              <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-primary transition-all duration-200 group-hover:w-full" />
            </Link>
            <a href="#" className="relative py-1 text-secondary hover:text-primary transition-colors font-label-md text-label-md group">
              Бидний тухай
              <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-primary transition-all duration-200 group-hover:w-full" />
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-u-md">
          <form onSubmit={handleSearch} className="hidden md:block relative">
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-surface-container-low border-none rounded-full pl-10 pr-u-md py-2 text-label-md focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-colors w-64"
              placeholder="Бүтээгдэхүүн хайх..."
              type="text"
            />
          </form>
          {session ? (
            <div className="hidden md:flex items-center gap-u-md">
              {session.role === "ADMIN" && (
                <Link href="/admin" className="text-secondary hover:text-primary transition-colors font-label-md text-label-md">
                  Админ
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-secondary hover:text-error transition-colors font-label-md text-label-md"
              >
                Гарах
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 text-secondary hover:text-primary transition-colors font-label-md text-label-md"
            >
              <MaterialIcon name="account_circle" className="text-xl" />
              Нэвтрэх
            </Link>
          )}
          <Link
            href="/basket"
            className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-150 ease-in-out text-primary"
          >
            <MaterialIcon name="shopping_cart" />
            {count > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Цэс хаах" : "Цэс нээх"}
            aria-expanded={menuOpen}
            className="md:hidden p-2 text-primary"
          >
            <MaterialIcon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="border-t border-outline-variant/60 bg-surface-container-low/50">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <nav className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
              {categories.map((c) => {
                const active = activeCategoryId === c.id;
                return (
                  <Link
                    key={c.id}
                    href={`/?category=${c.id}`}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                      active
                        ? "bg-primary text-on-primary"
                        : "text-secondary hover:bg-surface-container-high hover:text-primary"
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-background px-margin-mobile py-u-md flex flex-col gap-u-sm">
          <form onSubmit={handleSearch} className="relative mb-u-sm">
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-u-md py-2 text-label-md focus:ring-2 focus:ring-primary/40"
              placeholder="Бүтээгдэхүүн хайх..."
              type="text"
            />
          </form>
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-secondary hover:text-primary transition-colors font-label-md text-label-md py-1">
            Дэлгүүр
          </Link>
          <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-secondary hover:text-primary transition-colors font-label-md text-label-md py-1">
            Захиалгууд
          </Link>
          <a href="#" onClick={() => setMenuOpen(false)} className="text-secondary hover:text-primary transition-colors font-label-md text-label-md py-1">
            Бидний тухай
          </a>
          <div className="border-t border-outline-variant pt-u-sm mt-1">
            {session ? (
              <>
                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block text-secondary hover:text-primary transition-colors font-label-md text-label-md py-1"
                  >
                    Админ
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left w-full text-secondary hover:text-error transition-colors font-label-md text-label-md py-1"
                >
                  Гарах
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-secondary hover:text-primary transition-colors font-label-md text-label-md py-1"
              >
                Нэвтрэх
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
