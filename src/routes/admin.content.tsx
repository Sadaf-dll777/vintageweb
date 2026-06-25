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
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold">Site content (raw JSON)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the JSON blob that drives hero, reviews, why-us, partners, and payment methods.
          Keep the shape compatible with <code className="rounded bg-muted px-1">src/config/site.ts</code> —
          when fields don't exist here, the storefront falls back to the config file.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-[500px] w-full rounded-lg border border-border bg-card p-3 font-mono text-xs"
        spellCheck={false}
      />

      {err && <p className="text-sm text-destructive">{err}</p>}
      {save.error && <p className="text-sm text-destructive">{(save.error as Error).message}</p>}
      {save.isSuccess && <p className="text-sm text-green-600">Saved.</p>}

      <button onClick={onSave} disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {save.isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}