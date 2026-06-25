import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/content")({
  component: ContentAdmin,
});

function ContentAdmin() {
  const qc = useQueryClient();
  const site = useQuery({ queryKey: ["site"], queryFn: api.getSite });
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (site.data) setText(JSON.stringify(site.data, null, 2));
  }, [site.data]);

  const save = useMutation({
    mutationFn: (content: Record<string, unknown>) => api.saveSite(content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site"] }),
  });

  function onSave() {
    setErr(null);
    try {
      const parsed = JSON.parse(text);
      save.mutate(parsed);
    } catch (e) {
      setErr("Invalid JSON: " + (e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black uppercase tracking-wide">Site Content</h2>
          <p className="text-sm text-muted-foreground">
            Raw JSON that drives hero, reviews, why-us, partners, and payment methods.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={save.isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">
          Keep the shape compatible with{" "}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono">src/config/site.ts</code>.
          When fields are missing here, the storefront falls back to the config file.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">site.json</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-[560px] w-full resize-none bg-background p-4 font-mono text-xs leading-relaxed focus:outline-none"
          spellCheck={false}
        />
      </div>

      {err && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </p>
      )}
      {save.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(save.error as Error).message}
        </p>
      )}
      {save.isSuccess && (
        <p className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          ✓ Saved.
        </p>
      )}
    </div>
  );
}