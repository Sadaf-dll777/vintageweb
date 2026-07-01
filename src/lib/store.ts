import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";
import { brand } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

export type Currency = "USD" | "BDT";
export const USD_TO_BDT = brand.usdToBdt;

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
  id: string;
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
  ready: boolean;
  setUser: (u: AuthUser | null) => void;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<AuthUser>) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  (set, get) => ({
    user: null,
    ready: false,
    setUser: (user) => set({ user, ready: true }),
    signOut: async () => {
      await supabase.auth.signOut();
      set({ user: null });
    },
    updateProfile: async (patch) => {
      const cur = get().user;
      if (!cur) return;
      const next = { ...cur, ...patch };
      set({ user: next });
      await supabase.auth.updateUser({
        data: {
          display_name: next.displayName,
          phone: next.phone,
          bio: next.bio,
          avatar: next.avatar,
          country: next.country,
        },
      });
    },
  }),
);

function sessionToUser(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]): AuthUser | null {
  if (!session?.user) return null;
  const u = session.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const str = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : undefined);
  return {
    id: u.id,
    email: (u.email ?? "").toLowerCase(),
    displayName: str("display_name") || str("full_name") || str("name") || (u.email ?? "").split("@")[0],
    phone: str("phone"),
    bio: str("bio"),
    avatar: str("avatar") || str("avatar_url"),
    country: str("country"),
    createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
  };
}

// Initialise + subscribe to auth state on the client.
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => {
    useAuth.getState().setUser(sessionToUser(data.session));
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuth.getState().setUser(sessionToUser(session));
  });
}
