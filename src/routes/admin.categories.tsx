import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiCategory } from "@/lib/api";
import { Pencil, Trash2, FolderTree } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdmin,
});

type FormState = Partial<ApiCategory> & { _editingId?: string };
const EMPTY: FormState = { slug: "", name: "", emoji: "", sort_order: 0 };

function CategoriesAdmin() {
  const qc = useQueryClient();
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: api.listCategories });
  const [form, setForm] = useState<FormState>(EMPTY);

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const { _editingId, ...data } = f;
      const payload: Partial<ApiCategory> = { ...data, sort_order: Number(data.sort_order ?? 0) };
      return _editingId ? api.updateCategory(_editingId, payload) : api.createCategory(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setForm(EMPTY);
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-black uppercase tracking-wide">Categories</h2>
        <p className="text-sm text-muted-foreground">
          {categories.data?.length ?? 0} categor{(categories.data?.length ?? 0) === 1 ? "y" : "ies"} grouping your products.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {!categories.data?.length ? (
            <div className="px-5 py-16 text-center">
              <FolderTree className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No categories yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="p-3"></th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3 text-center">Order</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.data?.map((c) => (
                  <tr key={c.id} className={`transition hover:bg-accent/20 ${form._editingId === c.id ? "bg-primary/5" : ""}`}>
                    <td className="p-3 text-2xl">{c.emoji || "📦"}</td>
                    <td className="p-3 font-semibold">{c.name}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
                    <td className="p-3 text-center font-display font-black">{c.sort_order}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setForm({ ...c, _editingId: c.id })} title="Edit" className="rounded p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => confirm(`Delete ${c.name}?`) && del.mutate(c.id)} title="Delete" className="rounded p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}
          className="space-y-3 self-start rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6"
        >
          <div className="-mx-5 -mt-5 border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-5 py-3">
            <h3 className="font-display text-base font-black uppercase tracking-wide">
              {form._editingId ? "Edit category" : "New category"}
            </h3>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Name</label>
            <input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input mt-1.5" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Slug (URL)</label>
            <input required value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input mt-1.5" />
          </div>
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Emoji</label>
              <input placeholder="🎮" value={form.emoji ?? ""} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="input mt-1.5" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Order</label>
              <input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input mt-1.5" />
            </div>
          </div>

          {save.error && (
            <p className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {(save.error as Error).message}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={save.isPending} className="flex-1 rounded-md bg-primary px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90 disabled:opacity-60">
              {save.isPending ? "Saving…" : form._editingId ? "Update" : "Create"}
            </button>
            {form._editingId && (
              <button type="button" onClick={() => setForm(EMPTY)} className="rounded-md border border-border px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/40 hover:text-foreground">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}