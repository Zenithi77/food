"use client";

import Image from "next/image";
import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useCartStore } from "@/store/cart";
import { formatMNT } from "@/lib/format";
import type { ProductDTO } from "@/types";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group item-card-shadow bg-surface-container-lowest rounded-lg p-u-sm">
      <div className="aspect-square rounded overflow-hidden mb-u-sm relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button
          onClick={handleAdd}
          aria-label={`${product.name}-г сагсанд нэмэх`}
          disabled={product.stock <= 0}
          className="absolute bottom-3 right-3 w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-md text-primary hover:bg-primary hover:text-on-primary transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <MaterialIcon name={added ? "check" : "add"} />
        </button>
      </div>
      <h4 className="font-headline-md text-headline-md text-primary">{product.name}</h4>
      <p className="font-label-md text-label-md text-secondary">
        {formatMNT(product.price)} / {product.unit}
      </p>
      {product.stock <= 0 && <p className="text-label-sm text-error mt-1">Дууссан</p>}
    </div>
  );
}
