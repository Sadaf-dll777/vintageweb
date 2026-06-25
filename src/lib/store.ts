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

// ============ Mock Auth (temporary — swap for real DB later) ============
export interface AuthUser {
  email: string;
  displayName: string;
  phone?: string;
  bio?: string;
  avatar?: string; // data URL
  country?: string;
  createdAt: number;
}

interface AuthState {
  user: AuthUser | null;
  // store mock credentials so sign-in can re-validate after sign-out
  accounts: Record<string, { password: string; user: AuthUser }>;
  signUp: (email: string, password: string, displayName: string) => { ok: boolean; error?: string };
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: {},
      signUp: (email, password, displayName) => {
        const key = email.trim().toLowerCase();
        if (!key || !password) return { ok: false, error: "Email and password required" };
        const accounts = get().accounts;
        if (accounts[key]) return { ok: false, error: "Account already exists. Try signing in." };
        const user: AuthUser = {
          email: key,
          displayName: displayName || key.split("@")[0],
          createdAt: Date.now(),
        };
        set({
          accounts: { ...accounts, [key]: { password, user } },
          user,
        });
        return { ok: true };
      },
      signIn: (email, password) => {
        const key = email.trim().toLowerCase();
        const accounts = get().accounts;
        const rec = accounts[key];
        if (!rec) {
          // Temporary convenience: auto-create on first sign-in so the user
          // can get into the profile editor without a separate signup step.
          const user: AuthUser = {
            email: key,
            displayName: key.split("@")[0] || "User",
            createdAt: Date.now(),
          };
          set({ accounts: { ...accounts, [key]: { password, user } }, user });
          return { ok: true };
        }
        if (rec.password !== password) return { ok: false, error: "Incorrect password" };
        set({ user: rec.user });
        return { ok: true };
      },
      signOut: () => set({ user: null }),
      updateProfile: (patch) => {
        const cur = get().user;
        if (!cur) return;
        const next = { ...cur, ...patch };
        const accounts = { ...get().accounts };
        if (accounts[cur.email]) {
          accounts[cur.email] = { ...accounts[cur.email], user: next };
        }
        set({ user: next, accounts });
      },
    }),
    { name: "vintage-store-auth" },
  ),
);
