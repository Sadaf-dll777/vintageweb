/**
 * Tiny REST client for the VintageStore backend (./backend folder).
 * Set VITE_API_URL to enable. When unset or unreachable, callers should
 * fall back to the static config files in src/config/ and src/data/.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

export const apiEnabled = Boolean(API_URL);

const TOKEN_KEY = "vintage_admin_token";

export const adminToken = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error("VITE_API_URL is not set");
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = adminToken.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ============ Types (mirror backend shape) ============

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  sort_order: number;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  category_slug?: string | null;
  category_name?: string | null;
  description: string;
  price_usd: number | string;
  image_url: string;
  badge: string;
  in_stock: boolean;
  sort_order: number;
  delivery: string;
  tagline: string;
  created_at: string;
}

export interface ApiOrder {
  id: string;
  customer_name: string;
  contact: string;
  items: Array<{ product_id?: string; name: string; qty: number; price_usd: number }>;
  total_usd: number | string;
  total_bdt: number | string;
  payment_method: string;
  payment_proof_url: string;
  transaction_id: string;
  notes: string;
  status: "pending" | "paid" | "delivered" | "cancelled";
  created_at: string;
}

// ============ Endpoints ============

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; admin: { id: string; email: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ admin: { sub: string; email: string } }>("/api/auth/me"),

  // Products
  listProducts: () => request<ApiProduct[]>("/api/products"),
  getProduct: (slug: string) => request<ApiProduct>(`/api/products/${encodeURIComponent(slug)}`),
  createProduct: (data: Partial<ApiProduct>) =>
    request<ApiProduct>("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<ApiProduct>) =>
    request<ApiProduct>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    request<{ ok: true }>(`/api/products/${id}`, { method: "DELETE" }),

  // Categories
  listCategories: () => request<ApiCategory[]>("/api/categories"),
  createCategory: (data: Partial<ApiCategory>) =>
    request<ApiCategory>("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<ApiCategory>) =>
    request<ApiCategory>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request<{ ok: true }>(`/api/categories/${id}`, { method: "DELETE" }),

  // Orders
  listOrders: () => request<ApiOrder[]>("/api/orders"),
  placeOrder: (data: Omit<ApiOrder, "id" | "status" | "created_at">) =>
    request<{ id: string; created_at: string; status: string }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateOrderStatus: (id: string, status: ApiOrder["status"]) =>
    request<ApiOrder>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteOrder: (id: string) =>
    request<{ ok: true }>(`/api/orders/${id}`, { method: "DELETE" }),

  // Site content (single JSON blob)
  getSite: () => request<Record<string, unknown>>("/api/site"),
  saveSite: (content: Record<string, unknown>) =>
    request<{ ok: true }>("/api/site", { method: "PUT", body: JSON.stringify(content) }),

  // Upload
  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    return request<{ url: string; filename: string }>("/api/upload", {
      method: "POST",
      body: fd,
    });
  },
};