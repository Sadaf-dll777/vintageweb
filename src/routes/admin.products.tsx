import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiProduct } from "@/lib/api";
import { Pencil, Trash2, Plus, ImagePlus, Package } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

type FormState = Partial<ApiProduct> & { _editingId?: string };

const EMPTY: FormState = {
  slug: "",
  name: "",
  category_id: null,
  description: "",
  price_bdt: 0,
  image_url: "",
  badge: "",
  stock: 0,
  sort_order: 0,
  delivery: "",
  tagline: "",
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const products = useQuery({ queryKey: ["admin-products"], queryFn: api.listProducts });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: api.listCategories });
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [flashMode, setFlashMode] = useState<"percent" | "price">("percent");
  const [flashPercent, setFlashPercent] = useState<number>(50);
  const [flashOffer, setFlashOffer] = useState<number>(0);

  const badge = form.badge ?? "";
  const isFlash = /flash/i.test(badge);
  const currentPercent = (() => {
    const m = badge.match(/-\s*(\d{1,2})\s*%/);
    return m ? Number(m[1]) : 0;
  })();
  const price = Number(form.price_bdt ?? 0);
  // For "offer price" mode we treat current price_bdt as the SALE price and
  // reconstruct the original from the badge percent (matches FlashDeals math).
  const reconstructedOriginal =
    currentPercent > 0 && price > 0
      ? Math.round((price * 100) / (100 - currentPercent))
      : price;

  function hasToken(token: string) {
    return new RegExp(`\\b${token}\\b`, "i").test(badge);
  }
  function normalize(s: string) {
    return s.replace(/\s+/g, " ").trim();
  }
  function toggleToken(token: string) {
    if (hasToken(token)) {
      const next = normalize(badge.replace(new RegExp(`\\b${token}\\b`, "ig"), ""));
      setForm((f) => ({ ...f, badge: next }));
    } else {
      setForm((f) => ({ ...f, badge: normalize(`${badge} ${token}`) }));
    }
  }
  function stripFlash(s: string) {
    return normalize(s.replace(/\bFLASH\b\s*-?\s*\d{0,2}\s*%?/gi, ""));
  }

  function applyFlashPercent(pct: number) {
    const clamped = Math.max(1, Math.min(90, Math.round(pct)));
    setFlashPercent(clamped);
    setForm((f) => ({
      ...f,
      badge: normalize(`${stripFlash(f.badge ?? "")} FLASH -${clamped}%`),
    }));
  }

  function applyFlashOffer(offer: number) {
    setFlashOffer(offer);
    const original = reconstructedOriginal || price;
    if (!original || offer <= 0 || offer >= original) return;
    const pct = Math.round(((original - offer) / original) * 100);
    const clamped = Math.max(1, Math.min(90, pct));
    setFlashPercent(clamped);
    setForm((f) => ({
      ...f,
      price_bdt: offer,
      badge: normalize(`${stripFlash(f.badge ?? "")} FLASH -${clamped}%`),
    }));
  }

  function toggleFlash() {
    if (isFlash) {
      setForm((f) => ({ ...f, badge: stripFlash(f.badge ?? "") }));
    } else {
      applyFlashPercent(currentPercent || flashPercent || 50);
    }
  }

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const { _editingId, ...payload } = f;
      const data: Partial<ApiProduct> = {
        ...payload,
        price_bdt: Number(payload.price_bdt ?? 0),
        stock: Number(payload.stock ?? 0),
        sort_order: Number(payload.sort_order ?? 0),
      };
      return _editingId ? api.updateProduct(_editingId, data) : api.createProduct(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(EMPTY);
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const res = await api.upload(file);
      setForm((f) => ({ ...f, image_url: res.url }));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black uppercase tracking-wide">Products</h2>
          <p className="text-sm text-muted-foreground">
            {products.data?.length ?? 0} item{(products.data?.length ?? 0) === 1 ? "" : "s"} in catalog.
          </p>
        </div>
        {form._editingId && (
          <button onClick={() => setForm(EMPTY)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:border-primary/40">
            <Plus className="h-3.5 w-3.5" /> New product
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
        {products.isLoading ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !products.data?.length ? (
          <div className="px-5 py-16 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No products yet. Use the form to add your first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="p-3"></th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.data?.map((p) => (
                  <tr key={p.id} className={`transition hover:bg-accent/20 ${form._editingId === p.id ? "bg-primary/5" : ""}`}>
                    <td className="p-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{p.slug}</div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{p.category_name || "—"}</td>
                    <td className="p-3 text-right font-display font-black">৳{Number(p.price_bdt ?? 0).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      {Number(p.stock ?? 0) > 0 ? (
                        <span className="inline-flex rounded border border-success/40 bg-success/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-success">{p.stock}</span>
                      ) : (
                        <span className="inline-flex rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Out</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setForm({ ...p, _editingId: p.id })}
                          title="Edit"
                          className="rounded p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => confirm(`Delete ${p.name}?`) && del.mutate(p.id)}
                          title="Delete"
                          className="rounded p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
        className="space-y-4 self-start rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6"
      >
        <div className="-mx-5 -mt-5 border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-5 py-3">
          <h3 className="font-display text-base font-black uppercase tracking-wide">
            {form._editingId ? "Edit product" : "New product"}
          </h3>
        </div>

        <Field label="Name">
          <input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Slug (URL)">
          <input required value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" />
        </Field>
        <Field label="Category">
          <select
            value={form.category_id ?? ""}
            onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
            className="input"
          >
            <option value="">— None —</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (BDT ৳)">
          <input type="number" step="1" value={form.price_bdt ?? 0} onChange={(e) => setForm({ ...form, price_bdt: Number(e.target.value) })} className="input" />
        </Field>
        <Field label="Stock quantity">
          <input type="number" step="1" min="0" value={form.stock ?? 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="input" />
        </Field>
        <Field label="Image">
          <div className="flex items-start gap-3">
            <label className="group flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-background transition hover:border-primary/60">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
            <input
              placeholder="or paste image URL"
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="input"
            />
          </div>
          {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
        </Field>
        <Field label="Badge — controls Hero & Flash Deals">
          <div className="flex flex-wrap gap-2">
            {[
              { v: "", label: "None" },
              { v: "FEATURED", label: "Featured (Hero)" },
              { v: "HOT", label: "Hot (Hero)" },
              { v: "NEW", label: "New" },
              { v: "__FLASH__", label: "⚡ Flash Deal" },
            ].map((b) => {
              const active =
                b.v === "__FLASH__" ? isFlash : (form.badge ?? "") === b.v;
              return (
                <button
                  type="button"
                  key={b.label}
                  onClick={() => {
                    if (b.v === "__FLASH__") {
                      const pct = currentPercent || 50;
                      applyFlashPercent(pct);
                    } else {
                      setForm({ ...form, badge: b.v });
                    }
                  }}
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          {isFlash && (
            <div className="mt-3 space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFlashMode("percent")}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    flashMode === "percent"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  By Percent
                </button>
                <button
                  type="button"
                  onClick={() => setFlashMode("price")}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    flashMode === "price"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  By Offer Price
                </button>
              </div>
              {flashMode === "percent" ? (
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Discount %
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={currentPercent || flashPercent}
                    onChange={(e) => applyFlashPercent(Number(e.target.value))}
                    className="input mt-1.5"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Offer price (BDT) — original ৳{reconstructedOriginal.toLocaleString()}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={flashOffer || price}
                    onChange={(e) => applyFlashOffer(Number(e.target.value))}
                    className="input mt-1.5"
                  />
                </label>
              )}
              {currentPercent > 0 && price > 0 && (
                <div className="rounded-md bg-background/60 px-3 py-2 text-xs">
                  <span className="text-muted-foreground line-through">
                    ৳{reconstructedOriginal.toLocaleString()}
                  </span>{" "}
                  <span className="font-display font-black text-primary">
                    ৳{price.toLocaleString()}
                  </span>{" "}
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    -{currentPercent}%
                  </span>
                </div>
              )}
            </div>
          )}
          <input
            value={form.badge ?? ""}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="Or type a custom badge"
            className="input mt-2"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            FEATURED = shown in Hero carousel · FLASH (with -NN%) = shown in Flash Deals
          </p>
        </Field>
        <Field label="Tagline">
          <input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input" />
        </Field>
        <Field label="Delivery">
          <input value={form.delivery ?? ""} onChange={(e) => setForm({ ...form, delivery: e.target.value })} className="input" />
        </Field>
        <Field label="Description">
          <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[80px]" />
        </Field>
        {save.error && (
          <p className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {(save.error as Error).message}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="flex-1 rounded-md bg-primary px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : form._editingId ? "Update" : "Create"}
          </button>
          {form._editingId && (
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="rounded-md border border-border px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}