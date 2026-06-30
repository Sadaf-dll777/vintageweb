/**
 * VintageStore API client — Lovable Cloud (Supabase) edition.
 *
 * The app talks directly to Supabase. The exported `api` surface matches the
 * previous Fastify/mock client so existing route code keeps working.
 */

import { supabase } from "@/integrations/supabase/client";
import { brand, reviews, whyUs, partners } from "@/config/site";
import type { Database } from "@/integrations/supabase/types";

type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type Json = Database["public"]["Tables"]["orders"]["Row"]["items"];

const USD_TO_BDT = brand.usdToBdt || 120;

// ============ Types ============

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
  price_bdt: number;
  price_usd?: number;
  image_url: string;
  badge: string;
  stock: number;
  in_stock?: boolean;
  sort_order: number;
  delivery: string;
  tagline: string;
  created_at: string;
  flash_ends_at?: string | null;
  options?: ProductOption[];
}

export interface ProductOption {
  label: string;
  price_bdt: number;
  out_of_stock?: boolean;
}

export interface ApiOptionPreset {
  id: string;
  name: string;
  options: ProductOption[];
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
  total_usd: number;
  total_bdt: number;
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

// ============ Legacy compat exports ============

export const apiEnabled = true;
export const usingMock = false;

/** Legacy localStorage token shim — no-op. Auth is handled by Supabase. */
export const adminToken = {
  get: () => null as string | null,
  set: (_t: string) => {},
  clear: () => {},
};

/** Legacy mock reset — no-op in Cloud mode. */
export function resetMockDB() {
  /* no-op: data lives in Lovable Cloud now */
}

// ============ Helpers ============

type DbCategory = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  sort_order: number;
};

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  description: string;
  price_bdt: number | string;
  image_url: string;
  badge: string;
  stock: number;
  sort_order: number;
  delivery: string;
  tagline: string;
  created_at: string;
  flash_ends_at?: string | null;
  options?: unknown;
  categories?: { slug: string; name: string } | null;
};

function mapProduct(p: DbProduct): ApiProduct {
  const priceBdt = Number(p.price_bdt) || 0;
  const priceUsd = priceBdt / USD_TO_BDT;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category_id: p.category_id,
    category_slug: p.categories?.slug ?? null,
    category_name: p.categories?.name ?? null,
    description: p.description,
    price_bdt: priceBdt,
    price_usd: priceUsd,
    image_url: p.image_url,
    badge: p.badge,
    stock: p.stock,
    in_stock: p.stock > 0,
    sort_order: p.sort_order,
    delivery: p.delivery,
    tagline: p.tagline,
    created_at: p.created_at,
    flash_ends_at: p.flash_ends_at ?? null,
    options: Array.isArray(p.options) ? (p.options as ProductOption[]) : [],
  };
}

type DbOrder = {
  id: string;
  user_email: string;
  customer_name: string;
  contact: string;
  items: unknown;
  total_usd: number | string;
  total_bdt: number | string;
  payment_method: string;
  payment_proof_url: string;
  transaction_id: string;
  sender_number: string;
  notes: string;
  status: ApiOrder["status"];
  delivered_key: string;
  key_instructions: string;
  key_redeem_label: string;
  notes_thread: unknown;
  created_at: string;
};

function mapOrder(o: DbOrder): ApiOrder {
  return {
    id: o.id,
    user_email: o.user_email,
    customer_name: o.customer_name,
    contact: o.contact,
    items: Array.isArray(o.items) ? (o.items as ApiOrder["items"]) : [],
    total_usd: Number(o.total_usd) || 0,
    total_bdt: Number(o.total_bdt) || 0,
    payment_method: o.payment_method,
    payment_proof_url: o.payment_proof_url,
    transaction_id: o.transaction_id,
    sender_number: o.sender_number,
    notes: o.notes,
    status: o.status,
    delivered_key: o.delivered_key,
    key_instructions: o.key_instructions,
    key_redeem_label: o.key_redeem_label,
    notes_thread: Array.isArray(o.notes_thread)
      ? (o.notes_thread as ApiOrder["notes_thread"])
      : [],
    created_at: o.created_at,
  };
}

function rethrow<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  return (async () => {
    const { data, error } = await p;
    if (error) throw new Error(error.message);
    return data as T;
  })();
}

// ============ API surface ============

export const api = {
  // ---- Auth ----
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    return {
      token: data.session?.access_token ?? "",
      admin: { id: data.user?.id ?? "", email: data.user?.email ?? "" },
    };
  },

  async me() {
    const { data } = await supabase.auth.getUser();
    return {
      admin: {
        sub: data.user?.id ?? "",
        email: data.user?.email ?? "",
      },
    };
  },

  // ---- Categories ----
  async listCategories(): Promise<ApiCategory[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, emoji, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ApiCategory[];
  },

  async createCategory(data: Partial<ApiCategory>): Promise<ApiCategory> {
    const payload = {
      slug: (data.slug || "").trim(),
      name: (data.name || "").trim(),
      emoji: data.emoji ?? "",
      sort_order: Number(data.sort_order ?? 0),
    };
    if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g, "-");
    const { data: row, error } = await supabase
      .from("categories")
      .insert(payload)
      .select("id, slug, name, emoji, sort_order")
      .single();
    if (error) throw new Error(error.message);
    return row as ApiCategory;
  },

  async updateCategory(id: string, patch: Partial<ApiCategory>): Promise<ApiCategory> {
    const update: CategoryUpdate = {};
    if (patch.slug !== undefined) update.slug = patch.slug;
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.emoji !== undefined) update.emoji = patch.emoji;
    if (patch.sort_order !== undefined) update.sort_order = Number(patch.sort_order);
    const { data: row, error } = await supabase
      .from("categories")
      .update(update)
      .eq("id", id)
      .select("id, slug, name, emoji, sort_order")
      .single();
    if (error) throw new Error(error.message);
    return row as ApiCategory;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Products ----
  async listProducts(): Promise<ApiProduct[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(slug, name)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => mapProduct(p as unknown as DbProduct));
  },

  async getProduct(slug: string): Promise<ApiProduct> {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(slug, name)")
      .eq("slug", slug)
      .single();
    if (error) throw new Error(error.message);
    return mapProduct(data as unknown as DbProduct);
  },

  async createProduct(data: Partial<ApiProduct>): Promise<ApiProduct> {
    const payload = {
      slug: (data.slug || "").trim() || (data.name || "").toLowerCase().replace(/\s+/g, "-"),
      name: (data.name || "Untitled").trim(),
      category_id: data.category_id ?? null,
      description: data.description ?? "",
      price_bdt: Number(data.price_bdt ?? 0),
      image_url: data.image_url ?? "",
      badge: data.badge ?? "",
      stock: Number(data.stock ?? 0),
      sort_order: Number(data.sort_order ?? 0),
      delivery: data.delivery ?? "",
      tagline: data.tagline ?? "",
      flash_ends_at: data.flash_ends_at ?? null,
      options: (data.options ?? []) as unknown as Json,
    };
    const { data: row, error } = await supabase
      .from("products")
      .insert(payload)
      .select("*, categories(slug, name)")
      .single();
    if (error) throw new Error(error.message);
    return mapProduct(row as unknown as DbProduct);
  },

  async updateProduct(id: string, patch: Partial<ApiProduct>): Promise<ApiProduct> {
    const update: ProductUpdate = {};
    if (patch.slug !== undefined) update.slug = patch.slug;
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.category_id !== undefined) update.category_id = patch.category_id;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.price_bdt !== undefined) update.price_bdt = Number(patch.price_bdt);
    if (patch.image_url !== undefined) update.image_url = patch.image_url;
    if (patch.badge !== undefined) update.badge = patch.badge;
    if (patch.stock !== undefined) update.stock = Number(patch.stock);
    if (patch.sort_order !== undefined) update.sort_order = Number(patch.sort_order);
    if (patch.delivery !== undefined) update.delivery = patch.delivery;
    if (patch.tagline !== undefined) update.tagline = patch.tagline;
    if (patch.flash_ends_at !== undefined) update.flash_ends_at = patch.flash_ends_at;
    if (patch.options !== undefined) {
      (update as unknown as { options: Json }).options = (patch.options ?? []) as unknown as Json;
    }
    const { data: row, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", id)
      .select("*, categories(slug, name)")
      .single();
    if (error) throw new Error(error.message);
    return mapProduct(row as unknown as DbProduct);
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Option Presets (reusable variant/duration sets) ----
  async listOptionPresets(): Promise<ApiOptionPreset[]> {
    const { data, error } = await supabase
      .from("option_presets" as never)
      .select("id, name, options, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Array<{ id: string; name: string; options: unknown; created_at: string }>).map((r) => ({
      id: r.id,
      name: r.name,
      options: Array.isArray(r.options) ? (r.options as ProductOption[]) : [],
      created_at: r.created_at,
    }));
  },

  async createOptionPreset(name: string, options: ProductOption[]): Promise<ApiOptionPreset> {
    const { data, error } = await supabase
      .from("option_presets" as never)
      .insert({ name, options: options as unknown as Json } as never)
      .select("id, name, options, created_at")
      .single();
    if (error) throw new Error(error.message);
    const r = data as unknown as { id: string; name: string; options: unknown; created_at: string };
    return { id: r.id, name: r.name, options: Array.isArray(r.options) ? (r.options as ProductOption[]) : [], created_at: r.created_at };
  },

  async deleteOptionPreset(id: string) {
    const { error } = await supabase.from("option_presets" as never).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Orders ----
  async listOrders(): Promise<ApiOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((o) => mapOrder(o as unknown as DbOrder));
  },

  async placeOrder(
    data: Omit<ApiOrder, "id" | "status" | "created_at">,
  ): Promise<{ id: string; created_at: string; status: ApiOrder["status"] }> {
    const payload: OrderInsert = {
      user_email: (data.user_email || "").toLowerCase(),
      customer_name: data.customer_name || "",
      contact: data.contact || "",
      items: (data.items ?? []) as unknown as Json,
      total_usd: Number(data.total_usd) || 0,
      total_bdt: Number(data.total_bdt) || 0,
      payment_method: data.payment_method || "",
      payment_proof_url: data.payment_proof_url || "",
      transaction_id: data.transaction_id || "",
      sender_number: data.sender_number || "",
      notes: data.notes || "",
      notes_thread: (data.notes_thread ?? []) as unknown as Json,
    };
    const { data: row, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("id, created_at, status")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: row!.id,
      created_at: row!.created_at,
      status: row!.status as ApiOrder["status"],
    };
  },

  async updateOrderStatus(id: string, status: ApiOrder["status"]): Promise<ApiOrder> {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapOrder(data as unknown as DbOrder);
  },

  async updateOrderDelivery(
    id: string,
    patch: Partial<Pick<ApiOrder, "delivered_key" | "key_instructions" | "key_redeem_label">>,
  ): Promise<ApiOrder> {
    const update: OrderUpdate = {};
    if (patch.delivered_key !== undefined) update.delivered_key = patch.delivered_key;
    if (patch.key_instructions !== undefined) update.key_instructions = patch.key_instructions;
    if (patch.key_redeem_label !== undefined) update.key_redeem_label = patch.key_redeem_label;
    const { data, error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapOrder(data as unknown as DbOrder);
  },

  async appendOrderNote(
    id: string,
    note: { from: "support" | "customer"; text: string },
  ): Promise<ApiOrder> {
    const { data: current, error: readErr } = await supabase
      .from("orders")
      .select("notes_thread")
      .eq("id", id)
      .single();
    if (readErr) throw new Error(readErr.message);
    const thread = Array.isArray(current?.notes_thread)
      ? (current!.notes_thread as ApiOrder["notes_thread"])!
      : [];
    thread.push({ ...note, at: new Date().toISOString() });
    const { data, error } = await supabase
      .from("orders")
      .update({ notes_thread: thread as unknown as Json })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapOrder(data as unknown as DbOrder);
  },

  async deleteOrder(id: string) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Site content ----
  async getSite(): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const stored = (data?.content as Record<string, unknown> | null) ?? {};
    // Fall back to local site config defaults so the admin UI shows something
    // even before the row has been edited.
    return {
      brand,
      reviews,
      whyUs,
      partners,
      flashDeals: {
        enabled: true,
        title: "Flash Deals",
        subtitleSuffix: "deals active",
        deals: [
          {
            name: "Change Steam Region To India",
            image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
            originalPrice: 400,
            salePrice: 199,
            currency: "BDT",
            endsAt: new Date(Date.now() + 11 * 3600_000).toISOString(),
            urgency: "rising",
            soldPercent: 27,
            href: "#",
          },
        ],
      },
      ...stored,
    };
  },

  async saveSite(content: Record<string, unknown>) {
    const { error } = await supabase
      .from("site_content")
      .upsert({ id: 1, content: content as unknown as Json });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Uploads ----
  async upload(
    file: File,
    bucket: "product-images" | "payment-proofs" = "product-images",
  ): Promise<{ url: string; filename: string }> {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, filename: file.name };
  },
};

// Silence the unused-import lint when the rethrow helper is intentionally
// exported for future use by ad-hoc callers.
void rethrow;