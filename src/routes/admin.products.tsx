import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiProduct } from "@/lib/api";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

type FormState = Partial<ApiProduct> & { _editingId?: string };

const EMPTY: FormState = {
  slug: "",
  name: "",
  category_id: null,
  description: "",
  price_usd: 0,
  image_url: "",
  badge: "",
  in_stock: true,
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

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const { _editingId, ...payload } = f;
      const data: Partial<ApiProduct> = {
        ...payload,
        price_usd: Number(payload.price_usd ?? 0),
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
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold">Products ({products.data?.length ?? 0})</h2>
        </div>
        {products.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.data?.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3 font-mono text-xs">{p.slug}</td>
                    <td className="p-3">${Number(p.price_usd).toFixed(2)}</td>
                    <td className="p-3">{p.in_stock ? "✓" : "—"}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setForm({ ...p, _editingId: p.id })}
                        className="rounded border border-input px-2 py-1 text-xs hover:bg-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirm(`Delete ${p.name}?`) && del.mutate(p.id)}
                        className="ml-2 rounded border border-destructive/50 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </button>
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
        className="space-y-3 rounded-lg border border-border bg-card p-4"
      >
        <h2 className="font-semibold">{form._editingId ? "Edit product" : "New product"}</h2>

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
        <Field label="Price (USD)">
          <input type="number" step="0.01" value={form.price_usd ?? 0} onChange={(e) => setForm({ ...form, price_usd: Number(e.target.value) })} className="input" />
        </Field>
        <Field label="Image">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="text-xs"
          />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
          <input
            placeholder="or paste image URL"
            value={form.image_url ?? ""}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="input mt-2"
          />
          {form.image_url && (
            <img src={form.image_url} alt="" className="mt-2 h-24 w-24 rounded object-cover" />
          )}
        </Field>
        <Field label="Badge (e.g. FEATURED)">
          <input value={form.badge ?? ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="input" />
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.in_stock ?? true} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} />
          In stock
        </label>

        {save.error && <p className="text-xs text-destructive">{(save.error as Error).message}</p>}

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={save.isPending} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {save.isPending ? "Saving…" : form._editingId ? "Update" : "Create"}
          </button>
          {form._editingId && (
            <button type="button" onClick={() => setForm(EMPTY)} className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}