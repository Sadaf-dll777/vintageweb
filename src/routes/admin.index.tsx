import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Package, FolderTree, ShoppingBag, Clock, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const products = useQuery({ queryKey: ["admin-products"], queryFn: api.listProducts });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: api.listCategories });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: api.listOrders });

  const revenue = orders.data
    ?.filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total_usd), 0) ?? 0;

  const stats = [
    { label: "Products", value: products.data?.length ?? "—", icon: Package, accent: "text-primary" },
    { label: "Categories", value: categories.data?.length ?? "—", icon: FolderTree, accent: "text-gold" },
    { label: "Total orders", value: orders.data?.length ?? "—", icon: ShoppingBag, accent: "text-success" },
    { label: "Pending", value: orders.data?.filter((o) => o.status === "pending").length ?? "—", icon: Clock, accent: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black uppercase tracking-wide">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Snapshot of your store right now.</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" /> Revenue (paid + delivered)
          </div>
          <div className="mt-1 font-display text-2xl font-black">${revenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:border-primary/40">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-2 font-display text-4xl font-black">{s.value}</div>
                </div>
                <Icon className={`h-5 w-5 ${s.accent}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-black uppercase tracking-wide">Recent orders</h3>
            <p className="text-xs text-muted-foreground">Latest 5 incoming orders.</p>
          </div>
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {orders.isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : orders.data && orders.data.length > 0 ? (
          <ul className="divide-y divide-border">
            {orders.data.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 transition hover:bg-accent/30">
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <div>
                    <div className="text-sm font-semibold">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()} · {o.payment_method}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-black">${Number(o.total_usd).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">৳{Number(o.total_bdt).toFixed(0)}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-12 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No orders yet. Place a test order from the storefront.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-gold/15 text-gold border-gold/30",
    paid: "bg-success/15 text-success border-success/30",
    delivered: "bg-success/15 text-success border-success/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] || ""}`}>
      {status}
    </span>
  );
}