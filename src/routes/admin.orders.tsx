import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiOrder } from "@/lib/api";
import { Eye, ShoppingBag, X } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES: ApiOrder["status"][] = ["pending", "paid", "delivered", "cancelled"];

function OrdersAdmin() {
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: api.listOrders });
  const [open, setOpen] = useState<ApiOrder | null>(null);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiOrder["status"] }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-black uppercase tracking-wide">Orders</h2>
        <p className="text-sm text-muted-foreground">
          {orders.data?.length ?? 0} order{(orders.data?.length ?? 0) === 1 ? "" : "s"} · update status as you fulfill them.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {orders.isLoading ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !orders.data?.length ? (
          <div className="px-5 py-20 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No orders yet. Test checkout from the storefront to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="p-3">When</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.data?.map((o) => (
                  <tr key={o.id} className="transition hover:bg-accent/20">
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.contact}</div>
                    </td>
                    <td className="p-3">
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-medium uppercase">
                        {o.payment_method}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-display font-black">${Number(o.total_usd).toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground">৳{Number(o.total_bdt).toFixed(0)}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: o.id, status: e.target.value as ApiOrder["status"] })
                        }
                        className={`rounded border bg-background px-2 py-1 text-xs font-bold uppercase tracking-wider ${statusClass(o.status)}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setOpen(o)} title="View" className="inline-flex items-center gap-1 rounded p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent p-6">
              <div>
                <h3 className="font-display text-2xl font-black uppercase tracking-wide">
                  Order #{open.id.slice(0, 8)}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{new Date(open.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Row label="Customer" value={open.customer_name} />
                <Row label="Contact" value={open.contact} />
                <Row label="Method" value={open.payment_method} />
                <Row label="Transaction ID" value={open.transaction_id || "—"} />
                <Row label="Total USD" value={`$${Number(open.total_usd).toFixed(2)}`} />
                <Row label="Total BDT" value={`৳${Number(open.total_bdt).toFixed(0)}`} />
              </dl>
              {open.notes && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Customer notes</div>
                  <p className="mt-1 rounded-md border border-border bg-background p-3 text-sm">{open.notes}</p>
                </div>
              )}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Items</div>
                <ul className="mt-2 overflow-hidden rounded-md border border-border">
                  {open.items.map((it, i) => (
                    <li key={i} className="flex justify-between border-b border-border bg-background px-3 py-2 text-sm last:border-0">
                      <span><span className="font-semibold">{it.qty}×</span> {it.name}</span>
                      <span className="font-display font-black">${(Number(it.price_usd) * it.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {open.payment_proof_url && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Payment proof</div>
                  <a href={open.payment_proof_url} target="_blank" rel="noopener noreferrer" className="mt-2 block overflow-hidden rounded-md border border-border">
                    <img src={open.payment_proof_url} alt="proof" className="max-h-96 w-full object-contain bg-background" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function statusClass(status: string) {
  switch (status) {
    case "pending": return "border-gold/40 text-gold";
    case "paid": return "border-success/40 text-success";
    case "delivered": return "border-success/40 text-success";
    case "cancelled": return "border-destructive/40 text-destructive";
    default: return "border-border";
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}