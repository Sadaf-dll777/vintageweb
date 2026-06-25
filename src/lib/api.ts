/**
 * VintageStore API client.
 *
 * Two modes:
 *   1. REAL — when VITE_API_URL is set, talks to the Node/Postgres backend
 *      in ./backend (deploy this on your VPS).
 *   2. MOCK — when VITE_API_URL is unset (current setup), uses a
 *      localStorage-backed mock seeded from src/data/products.ts and
 *      src/config/site.ts so you can preview and style the admin in
 *      Lovable without running the real backend.
 *
 * The interface is identical, so flipping VITE_API_URL switches modes
 * with no other code changes.
 */

import { products as seedProducts, categories as seedCategories } from "@/data/products";
import * as siteConfig from "@/config/site";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

/** True when a real backend URL is configured. */
export const apiEnabled = true; // mock mode counts as enabled
export const usingMock = !API_URL;

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
  price_bdt: number | string;
  price_usd?: number | string;
  image_url: string;
  badge: string;
  stock: number;
  in_stock?: boolean;
  sort_order: number;
  delivery: string;
  tagline: string;
  created_at: string;
}

export interface ApiOrder {
  id: string;
  user_email: string;
  customer_name: string;
  contact: string;
  items: Array<{
    product_id?: string;
    name: string;
    variant?: string;
    qty: number;
    price_usd: number;
    price_bdt?: number;
    image_url?: string;
  }>;
  total_usd: number | string;
  total_bdt: number | string;
  payment_method: string;
  payment_proof_url: string;
  transaction_id: string;
  sender_number?: string;
  notes: string;
  status: "review" | "verified" | "processing" | "completed" | "cancelled";
  delivered_key?: string;
  key_instructions?: string;
  key_redeem_label?: string;
  notes_thread?: Array<{ from: "support" | "customer"; text: string; at: string }>;
  created_at: string;
}

// ============ Real network client ============

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

// ============ Mock backend (localStorage) ============

const MOCK_KEY = "vintage_mock_db_v2";

interface MockDB {
  admins: { email: string; password: string }[];
  categories: ApiCategory[];
  products: ApiProduct[];
  orders: ApiOrder[];
  site: Record<string, unknown>;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function seedDB(): MockDB {
  const categories: ApiCategory[] = seedCategories
    .filter((c) => c.id !== "all")
    .map((c, i) => ({
      id: uid(),
      slug: c.id,
      name: c.label,
      emoji: c.emoji,
      sort_order: i,
    }));
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const products: ApiProduct[] = seedProducts.map((p, i) => ({
    id: uid(),
    slug: p.id,
    name: p.name,
    category_id: catBySlug.get(p.category) ?? null,
    category_slug: p.category,
    category_name: categories.find((c) => c.slug === p.category)?.name ?? null,
    description: p.description ?? "",
    price_bdt: Math.round(p.price * 120),
    image_url: p.image,
    badge: p.badge ?? "",
    stock: 10,
    sort_order: i,
    delivery: p.delivery ?? "",
    tagline: p.tagline ?? "",
    created_at: new Date(Date.now() - i * 3600_000).toISOString(),
  }));
  return {
    admins: [{ email: "admin@vintagestore.local", password: "admin" }],
    categories,
    products,
    orders: [],
    site: {
      brand: siteConfig.brand,
      reviews: siteConfig.reviews,
      whyUs: siteConfig.whyUs,
      partners: siteConfig.partners,
    },
  };
}

function loadDB(): MockDB {
  if (typeof window === "undefined") return seedDB();
  const raw = window.localStorage.getItem(MOCK_KEY);
  if (!raw) {
    const fresh = seedDB();
    window.localStorage.setItem(MOCK_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as MockDB;
  } catch {
    const fresh = seedDB();
    window.localStorage.setItem(MOCK_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveDB(db: MockDB) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_KEY, JSON.stringify(db));
}

/** Reset the mock DB to its seeded state. */
export function resetMockDB() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOCK_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

const mockApi = {
  async login(email: string, password: string) {
    await delay();
    const db = loadDB();
    const found = db.admins.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );
    if (!found) throw new Error("Invalid credentials");
    return { token: "mock-token-" + uid(), admin: { id: "mock", email: found.email } };
  },
  async me() {
    return { admin: { sub: "mock", email: "admin@vintagestore.local" } };
  },

  async listProducts() {
    await delay();
    return loadDB().products;
  },
  async getProduct(slug: string) {
    await delay();
    const p = loadDB().products.find((p) => p.slug === slug);
    if (!p) throw new Error("Not found");
    return p;
  },
  async createProduct(data: Partial<ApiProduct>) {
    await delay();
    const db = loadDB();
    const cat = db.categories.find((c) => c.id === data.category_id);
    const p: ApiProduct = {
      id: uid(),
      slug: data.slug || uid(),
      name: data.name || "Untitled",
      category_id: data.category_id ?? null,
      category_slug: cat?.slug ?? null,
      category_name: cat?.name ?? null,
      description: data.description ?? "",
      price_bdt: Number(data.price_bdt ?? 0),
      image_url: data.image_url ?? "",
      badge: data.badge ?? "",
      stock: Number(data.stock ?? 0),
      sort_order: Number(data.sort_order ?? 0),
      delivery: data.delivery ?? "",
      tagline: data.tagline ?? "",
      created_at: new Date().toISOString(),
    };
    db.products.unshift(p);
    saveDB(db);
    return p;
  },
  async updateProduct(id: string, data: Partial<ApiProduct>) {
    await delay();
    const db = loadDB();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Not found");
    const cat = data.category_id ? db.categories.find((c) => c.id === data.category_id) : null;
    db.products[idx] = {
      ...db.products[idx],
      ...data,
      price_bdt: data.price_bdt !== undefined ? Number(data.price_bdt) : db.products[idx].price_bdt,
      stock: data.stock !== undefined ? Number(data.stock) : db.products[idx].stock,
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : db.products[idx].sort_order,
      category_slug: cat?.slug ?? db.products[idx].category_slug ?? null,
      category_name: cat?.name ?? db.products[idx].category_name ?? null,
    };
    saveDB(db);
    return db.products[idx];
  },
  async deleteProduct(id: string) {
    await delay();
    const db = loadDB();
    db.products = db.products.filter((p) => p.id !== id);
    saveDB(db);
    return { ok: true as const };
  },

  async listCategories() {
    await delay();
    return loadDB().categories;
  },
  async createCategory(data: Partial<ApiCategory>) {
    await delay();
    const db = loadDB();
    const c: ApiCategory = {
      id: uid(),
      slug: data.slug || uid(),
      name: data.name || "Untitled",
      emoji: data.emoji ?? "",
      sort_order: Number(data.sort_order ?? 0),
    };
    db.categories.push(c);
    saveDB(db);
    return c;
  },
  async updateCategory(id: string, data: Partial<ApiCategory>) {
    await delay();
    const db = loadDB();
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Not found");
    db.categories[idx] = { ...db.categories[idx], ...data };
    saveDB(db);
    return db.categories[idx];
  },
  async deleteCategory(id: string) {
    await delay();
    const db = loadDB();
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDB(db);
    return { ok: true as const };
  },

  async listOrders() {
    await delay();
    return loadDB().orders;
  },
  async placeOrder(data: Omit<ApiOrder, "id" | "status" | "created_at">) {
    await delay();
    const db = loadDB();
    const o: ApiOrder = {
      ...data,
      id: uid(),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    db.orders.unshift(o);
    saveDB(db);
    return { id: o.id, created_at: o.created_at, status: o.status };
  },
  async updateOrderStatus(id: string, status: ApiOrder["status"]) {
    await delay();
    const db = loadDB();
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Not found");
    db.orders[idx].status = status;
    saveDB(db);
    return db.orders[idx];
  },
  async deleteOrder(id: string) {
    await delay();
    const db = loadDB();
    db.orders = db.orders.filter((o) => o.id !== id);
    saveDB(db);
    return { ok: true as const };
  },

  async getSite() {
    await delay();
    return loadDB().site;
  },
  async saveSite(content: Record<string, unknown>) {
    await delay();
    const db = loadDB();
    db.site = content;
    saveDB(db);
    return { ok: true as const };
  },

  async upload(file: File) {
    // Read as data URL so the image renders in preview without a server.
    return new Promise<{ url: string; filename: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ url: reader.result as string, filename: file.name });
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },
};

// ============ Real backend client ============

const realApi = {
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

export const api = usingMock ? mockApi : realApi;