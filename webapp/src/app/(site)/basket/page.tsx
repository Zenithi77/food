"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { formatMNT } from "@/lib/format";

const VAT_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 5000;

export default function BasketPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clear } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => setHydrated(true), []);

  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + shipping + vat;

  async function handleCheckout() {
    setError(null);
    if (!address.trim()) {
      setError("Хүргэлтийн хаягаа оруулна уу.");
      return;
    }
    if (!phone.trim()) {
      setError("Утасны дугаараа оруулна уу.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address: address.trim(),
          phone: phone.trim(),
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(data.error ?? "Захиалга үүсгэхэд алдаа гарлаа.");
        return;
      }
      clear();
      router.push("/orders?success=1");
    } finally {
      setPlacing(false);
    }
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-u-xl w-full text-center">
        <h1 className="font-display-lg text-display-lg text-primary mb-u-md">Таны сагс</h1>
        <p className="text-secondary mb-u-lg">Таны сагс хоосон байна.</p>
        <Link
          href="/"
          className="inline-block bg-primary text-on-primary py-3 px-8 rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity"
        >
          ХУДАЛДАН АВАЛТ ҮРГЭЛЖЛҮҮЛЭХ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-u-xl w-full">
      <h1 className="font-display-lg text-display-lg text-primary mb-u-lg">Таны сагс</h1>
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-u-xl">
        <div className="lg:col-span-8 space-y-u-md">
          {items.map((item) => (
            <div
              key={item.productId}
              className="item-card-shadow bg-surface-container-lowest p-u-md rounded-lg flex items-center gap-u-md"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded overflow-hidden flex-shrink-0 relative">
                <Image src={item.imageUrl} alt={item.name} fill sizes="128px" className="object-cover" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary">{item.name}</h3>
                    <p className="text-on-surface-variant font-label-sm uppercase tracking-wider">{item.unit}</p>
                  </div>
                  <p className="font-label-md text-label-md text-primary">{formatMNT(item.price)}</p>
                </div>
                <div className="mt-u-md flex justify-between items-center">
                  <div className="flex items-center border border-tertiary-fixed rounded-full px-2 py-1 bg-surface-container-low">
                    <button
                      className="p-1 hover:text-primary transition-colors active:scale-90"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <MaterialIcon name="remove" className="text-sm" />
                    </button>
                    <span className="px-4 font-label-md">{item.quantity}</span>
                    <button
                      className="p-1 hover:text-primary transition-colors active:scale-90"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <MaterialIcon name="add" className="text-sm" />
                    </button>
                  </div>
                  <button
                    className="text-secondary hover:text-error transition-colors flex items-center gap-1 font-label-sm"
                    onClick={() => removeItem(item.productId)}
                  >
                    <MaterialIcon name="delete" className="text-base" />
                    УСТГАХ
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="item-card-shadow bg-surface-container-lowest p-u-md rounded-lg space-y-u-sm">
            <h2 className="font-headline-md text-headline-md text-primary mb-1">Хүргэлтийн мэдээлэл</h2>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                Хаяг
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Дүүрэг, хороо, байр, тоот..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                Утасны дугаар
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="99001122"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                Нэмэлт тэмдэглэл (заавал биш)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Жишээ нь: орой 18 цагийн дараа хүргэнэ үү"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-secondary-container rounded-lg p-u-lg lg:sticky lg:top-28">
            <h2 className="font-headline-md text-headline-md text-primary mb-u-md">Захиалгын дүн</h2>
            <div className="space-y-u-sm mb-u-lg">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Дэд дүн</span>
                <span className="font-label-md">{formatMNT(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Хүргэлт</span>
                <span className="font-label-md text-primary">{shipping === 0 ? "Үнэгүй" : formatMNT(shipping)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">НӨАТ (10%)</span>
                <span className="font-label-md">{formatMNT(vat)}</span>
              </div>
              <div className="pt-u-sm border-t border-outline-variant flex justify-between items-center mt-u-md">
                <span className="font-label-md text-on-surface">Нийт дүн</span>
                <span className="font-headline-md text-headline-md text-primary">{formatMNT(total)}</span>
              </div>
            </div>

            {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-label-sm text-secondary mb-u-md">
                {formatMNT(FREE_SHIPPING_THRESHOLD - subtotal)}-ны худалдан авалт хийвэл хүргэлт үнэгүй.
              </p>
            )}

            {error && <p className="text-error text-label-sm mb-u-md">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={placing || !hydrated || items.length === 0}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity active:scale-[0.98] duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {placing ? "ЗАХИАЛГА ҮҮСГЭЖ БАЙНА..." : "ЗАХИАЛГА ХИЙХ"}
              {!placing && <MaterialIcon name="arrow_forward" className="text-base" />}
            </button>

            <div className="mt-u-md text-center">
              <p className="text-label-sm text-on-surface-variant italic">Хүргэлт: Улаанбаатар хотын дотор 24 цагийн дотор.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
