import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiEnabled, resetMockDB, usingMock } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, FileText, LogOut, RotateCcw, Zap } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/content", label: "Site Content", icon: FileText },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!apiEnabled) {
      setReady(true);
      return;
    }
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/auth", search: { redirect: "/admin" } });
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (cancelled) return;
      if (error || !data) {
        setDenied(true);
        setReady(true);
        return;
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [pathname, navigate]);

  if (!apiEnabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold">Admin disabled</h1>
        <p className="mt-3 text-muted-foreground">
          The admin panel needs the backend running. Set{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">VITE_API_URL</code> in your{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">.env</code> file (e.g.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">http://localhost:4000</code>) and start
          the backend from the <code className="rounded bg-muted px-1.5 py-0.5">backend/</code>{" "}
          folder. See <code className="rounded bg-muted px-1.5 py-0.5">backend/README.md</code>.
        </p>
      </div>
    );
  }

  if (!ready) return null;

  if (pathname === "/admin/login") return <Outlet />;

  if (denied) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-3 text-muted-foreground">
          Your account does not have the <code className="rounded bg-muted px-1.5 py-0.5">admin</code> role.
          Ask an administrator to grant access.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth", search: { redirect: "/admin" } });
          }}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Top stripe */}
      <div className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Zap className="h-5 w-5" strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black uppercase leading-none tracking-wide">
                Vintage<span className="text-primary">Store</span> Admin
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {usingMock ? "Preview mode · local mock data" : "Live · connected to API"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {usingMock && (
              <button
                onClick={() => {
                  if (confirm("Wipe all local mock data and reseed from defaults?")) {
                    resetMockDB();
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset data
              </button>
            )}
            <button
              onClick={() => {
                supabase.auth.signOut().then(() => {
                  navigate({ to: "/auth", search: { redirect: "/admin" } });
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}