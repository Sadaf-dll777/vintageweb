import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/login")({
  component: LoginRedirect,
});

function LoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [navigate]);
  return (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Redirecting to sign in…
    </div>
  );
}

// Unused — kept to avoid removing the JSX entirely; not referenced.
function _LegacyForm() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0,var(--background)_70%)]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40">
            <Zap className="h-7 w-7" strokeWidth={3} />
          </div>
          <h1 className="mt-5 font-display text-4xl font-black uppercase tracking-wide">
            Admin <span className="text-primary">Console</span>
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Restricted area · Authorized personnel only
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur"
        >
          {usingMock && (
            <div className="mb-5 rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-foreground">
              <span className="font-bold uppercase tracking-wide text-gold">Preview · </span>
              Use{" "}
              <code className="rounded bg-background/60 px-1 font-mono">admin@vintagestore.local</code>
              {" / "}
              <code className="rounded bg-background/60 px-1 font-mono">admin</code>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vintagestore.local"
                className="input mt-1.5"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input mt-1.5"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in…" : "Enter Console"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ← <a href="/" className="hover:text-foreground">Back to storefront</a>
        </p>
      </div>
    </div>
  );
}