import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth_/initiate")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — VintageStore" },
      { name: "description", content: "Continue signing in to the VintageStore admin area." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    provider: typeof s.provider === "string" ? s.provider : "google",
    redirect_uri: typeof s.redirect_uri === "string" ? s.redirect_uri : undefined,
  }),
  component: AuthInitiatePage,
});

function AuthInitiatePage() {
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const redirectTo = useMemo(() => getSafeRedirectUri(search.redirect_uri), [search.redirect_uri]);

  useEffect(() => {
    let cancelled = false;

    async function startGoogleSignIn() {
      try {
        if (search.provider !== "google") {
          throw new Error("Unsupported sign-in provider");
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });

        if (error) throw error;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Google sign-in failed");
        }
      }
    }

    startGoogleSignIn();
    return () => {
      cancelled = true;
    };
  }, [redirectTo, search.provider]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/60 p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-red">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-4xl tracking-wide">Admin Sign In</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ? error : "Connecting securely…"}
        </p>
        {error && (
          <a
            href="/auth?redirect=%2Fadmin"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold tracking-widest text-primary-foreground transition-all hover:brightness-110"
          >
            TRY AGAIN
          </a>
        )}
      </div>
    </div>
  );
}

function getSafeRedirectUri(value?: string) {
  if (typeof window === "undefined") return "/auth?redirect=%2Fadmin";

  try {
    const url = new URL(value || "/auth?redirect=%2Fadmin", window.location.origin);
    if (url.origin !== window.location.origin) return `${window.location.origin}/auth?redirect=%2Fadmin`;
    return url.toString();
  } catch {
    return `${window.location.origin}/auth?redirect=%2Fadmin`;
  }
}