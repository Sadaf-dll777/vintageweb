import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiOrder } from "@/lib/api";

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
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4 font-semibold">
        Orders ({orders.data?.length ?? 0})
      </div>
      {orders.isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Method</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.data?.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.contact}</div>
                  </td>
                  <td className="p-3">{o.payment_method}</td>
                  <td className="p-3">
                    <div>${Number(o.total_usd).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">৳{Number(o.total_bdt).toFixed(0)}</div>
                  </td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: o.id, status: e.target.value as ApiOrder["status"] })
                      }
                      className="rounded border border-input bg-background px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setOpen(o)} className="rounded border border-input px-2 py-1 text-xs hover:bg-accent">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Order {open.id.slice(0, 8)}</h3>
                <p className="text-xs text-muted-foreground">{new Date(open.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded border border-input px-2 py-1 text-xs hover:bg-accent">Close</button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Customer" value={open.customer_name} />
              <Row label="Contact" value={open.contact} />
              <Row label="Method" value={open.payment_method} />
              <Row label="Transaction ID" value={open.transaction_id || "—"} />
              <Row label="Total" value={`$${Number(open.total_usd).toFixed(2)} (৳${Number(open.total_bdt).toFixed(0)})`} />
              <Row label="Notes" value={open.notes || "—"} />
            </dl>
            <div className="mt-4">
              <div className="text-xs font-medium uppercase text-muted-foreground">Items</div>
              <ul className="mt-2 space-y-1 text-sm">
                {open.items.map((it, i) => (
                  <li key={i} className="flex justify-between border-b border-border/50 py-1">
                    <span>{it.qty}× {it.name}</span>
                    <span>${(Number(it.price_usd) * it.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            {open.payment_proof_url && (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase text-muted-foreground">Payment proof</div>
                <a href={open.payment_proof_url} target="_blank" rel="noopener noreferrer">
                  <img src={open.payment_proof_url} alt="proof" className="mt-2 max-h-80 rounded border border-border" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/40 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}