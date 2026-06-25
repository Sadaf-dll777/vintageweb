import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminToken, apiEnabled } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/content", label: "Site Content" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!apiEnabled) {
      setReady(true);
      return;
    }
    const token = adminToken.get();
    if (!token && pathname !== "/admin/login") {
      navigate({ to: "/admin/login" });
      return;
    }
    setReady(true);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">VintageStore Admin</h1>
          <p className="text-sm text-muted-foreground">Manage products, orders & content</p>
        </div>
        <button
          onClick={() => {
            adminToken.clear();
            navigate({ to: "/admin/login" });
          }}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
        >
          Sign out
        </button>
      </div>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-border pb-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}