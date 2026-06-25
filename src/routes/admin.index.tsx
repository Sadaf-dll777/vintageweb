import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const products = useQuery({ queryKey: ["admin-products"], queryFn: api.listProducts });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: api.listCategories });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: api.listOrders });

  const stats = [
    { label: "Products", value: products.data?.length ?? "—" },
    { label: "Categories", value: categories.data?.length ?? "—" },
    { label: "Orders", value: orders.data?.length ?? "—" },
    {
      label: "Pending orders",
      value: orders.data?.filter((o) => o.status === "pending").length ?? "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Recent orders</h2>
        {orders.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : orders.data && orders.data.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {orders.data.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()} · {o.payment_method}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${Number(o.total_usd).toFixed(2)}</div>
                  <div className="text-xs uppercase">{o.status}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}