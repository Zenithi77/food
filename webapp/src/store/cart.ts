import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ProductDTO } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (product: ProductDTO, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                name: product.name,
                unit: product.unit,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity,
              },
            ],
          });
        }
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "oh-cart" }
  )
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
