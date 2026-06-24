import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type Currency = "USD" | "BDT";
export const USD_TO_BDT = 119;

export interface CartItem {
  product: Product;
  qty: number;
}

interface ShopState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (c) => set({ currency: c }),
      items: [],
      add: (p) =>
        set((s) => {
          const found = s.items.find((i) => i.product.id === p.id);
          return {
            items: found
              ? s.items.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i))
              : [...s.items, { product: p, qty: 1 }],
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((i) => i.product.id !== id)
            : s.items.map((i) => (i.product.id === id ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "vintage-store-cart" },
  ),
);

export const formatPrice = (usd: number, currency: Currency) => {
  if (currency === "BDT") return `${Math.round(usd * USD_TO_BDT)} BDT`;
  return `$${usd.toFixed(2)} USD`;
};
