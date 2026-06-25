import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiCategory } from "@/lib/api";

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
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4 font-semibold">Categories ({categories.data?.length ?? 0})</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Emoji</th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Order</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {categories.data?.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 text-lg">{c.emoji}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3 font-mono text-xs">{c.slug}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setForm({ ...c, _editingId: c.id })} className="rounded border border-input px-2 py-1 text-xs hover:bg-accent">Edit</button>
                  <button onClick={() => confirm(`Delete ${c.name}?`) && del.mutate(c.id)} className="ml-2 rounded border border-destructive/50 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold">{form._editingId ? "Edit category" : "New category"}</h2>
        <input required placeholder="Name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input required placeholder="slug-url" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" />
        <input placeholder="Emoji (🎮)" value={form.emoji ?? ""} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="input" />
        <input type="number" placeholder="Sort order" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="input" />
        {save.error && <p className="text-xs text-destructive">{(save.error as Error).message}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={save.isPending} className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {save.isPending ? "Saving…" : form._editingId ? "Update" : "Create"}
          </button>
          {form._editingId && <button type="button" onClick={() => setForm(EMPTY)} className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">Cancel</button>}
        </div>
      </form>
    </div>
  );
}