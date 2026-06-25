import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, type ApiOrder } from "@/lib/api";
import { Eye, ShoppingBag, X, Check, Send, KeyRound, MessageSquare, Ban } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES: ApiOrder["status"][] = ["review", "verified", "processing", "completed", "cancelled"];
const STEP_LABELS = ["Order Placed", "Payment Review", "Payment Verified", "Processing", "Completed"];

function activeStep(s: ApiOrder["status"]): number {
  switch (s) {
    case "review": return 1;
    case "verified": return 2;
    case "processing": return 3;
    case "completed": return 4;
    default: return -1;
  }
}

function OrdersAdmin() {
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: api.listOrders });
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.data?.find((o) => o.id === openId) ?? null;

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
          {orders.data?.length ?? 0} order{(orders.data?.length ?? 0) === 1 ? "" : "s"} · click an order to verify payment, deliver keys and post notes.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {orders.isLoading ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !orders.data?.length ? (
          <div className="px-5 py-20 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No orders yet. Place a test order from the storefront to create one.</p>
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
                {orders.data.map((o) => (
                  <tr key={o.id} className="transition hover:bg-accent/20">
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.contact}</div>
                      {o.user_email && <div className="text-[10px] text-muted-foreground/70">{o.user_email}</div>}
                    </td>
                    <td className="p-3">
                      <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-medium uppercase">{o.payment_method}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-display font-black">৳{Number(o.total_bdt).toFixed(0)}</div>
                      <div className="text-[10px] text-muted-foreground">${Number(o.total_usd).toFixed(2)}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value as ApiOrder["status"] })}
                        className={`rounded border bg-background px-2 py-1 text-xs font-bold uppercase tracking-wider ${statusClass(o.status)}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setOpenId(o.id)} title="Manage" className="inline-flex items-center gap-1 rounded p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground">
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

      {open && <OrderDrawer order={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function OrderDrawer({ order, onClose }: { order: ApiOrder; onClose: () => void }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-orders"] });

  const setStatus = useMutation({
    mutationFn: (s: ApiOrder["status"]) => api.updateOrderStatus(order.id, s),
    onSuccess: invalidate,
  });
  const setDelivery = useMutation({
    mutationFn: (patch: Partial<Pick<ApiOrder, "delivered_key" | "key_instructions" | "key_redeem_label">>) =>
      api.updateOrderDelivery(order.id, patch),
    onSuccess: invalidate,
  });
  const sendNote = useMutation({
    mutationFn: (text: string) => api.appendOrderNote(order.id, { from: "support", text }),
    onSuccess: invalidate,
  });

  const [key, setKey] = useState(order.delivered_key ?? "");
  const [howTo, setHowTo] = useState(order.key_instructions ?? "");
  const [label, setLabel] = useState(order.key_redeem_label ?? "");
  const [note, setNote] = useState("");
  useEffect(() => {
    setKey(order.delivered_key ?? "");
    setHowTo(order.key_instructions ?? "");
    setLabel(order.key_redeem_label ?? "");
  }, [order.id, order.delivered_key, order.key_instructions, order.key_redeem_label]);

  const step = activeStep(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent p-6">
          <div>
            <h3 className="font-display text-2xl font-black uppercase tracking-wide">Order #{order.id.slice(0, 8)}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Stepper */}
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              {STEP_LABELS.map((lbl, i) => {
                const done = order.status === "completed" || i < step || (i === step && order.status !== "review");
                const active = i === step && order.status !== "completed";
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className={`grid h-9 w-9 place-items-center rounded-full text-xs ${done ? "bg-primary text-primary-foreground" : active ? "border border-primary bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{lbl}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <ActionBtn disabled={order.status !== "review"} onClick={() => setStatus.mutate("verified")}>Verify payment</ActionBtn>
            <ActionBtn disabled={order.status !== "verified"} onClick={() => setStatus.mutate("processing")}>Mark processing</ActionBtn>
            <ActionBtn disabled={order.status !== "processing"} onClick={() => setStatus.mutate("completed")} variant="success">Mark completed</ActionBtn>
            <ActionBtn onClick={() => setStatus.mutate("cancelled")} variant="danger"><Ban className="mr-1 inline h-3 w-3" /> Cancel</ActionBtn>
          </div>

          {/* Customer + Payment */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Row label="Customer" value={order.customer_name} />
            <Row label="User email" value={order.user_email || "guest"} />
            <Row label="Contact" value={order.contact} />
            <Row label="Method" value={order.payment_method} />
            <Row label="Transaction ID" value={order.transaction_id || "—"} />
            <Row label="Sender number" value={order.sender_number || "—"} />
            <Row label="Total BDT" value={`৳${Number(order.total_bdt).toFixed(0)}`} />
            <Row label="Total USD" value={`$${Number(order.total_usd).toFixed(2)}`} />
          </div>

          {/* Items */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Items</div>
            <ul className="mt-2 overflow-hidden rounded-md border border-border">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-border bg-background px-3 py-2 text-sm last:border-0">
                  {it.image_url && <img src={it.image_url} className="h-10 w-10 rounded object-cover" alt="" />}
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}{it.variant ? ` — ${it.variant}` : ""}</div>
                    <div className="text-xs text-muted-foreground">Qty {it.qty}</div>
                  </div>
                  <span className="font-display font-black">৳{Number(it.price_bdt ?? (Number(it.price_usd) || 0) * 120).toFixed(0)}</span>
                </li>
              ))}
            </ul>
          </div>

          {order.payment_proof_url && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Payment proof</div>
              <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" className="mt-2 block overflow-hidden rounded-md border border-border">
                <img src={order.payment_proof_url} alt="proof" className="max-h-96 w-full object-contain bg-background" />
              </a>
            </div>
          )}

          {/* Item delivery */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <KeyRound className="h-3.5 w-3.5" /> Item delivery
            </div>
            <p className="mb-3 text-xs text-muted-foreground">What you enter here appears in the customer's <strong>My Keys</strong> section.</p>
            <div className="space-y-3">
              <Field label="Redeem heading (optional)" value={label} onChange={setLabel} placeholder="e.g. Spotify Join" />
              <Field label="Account credentials / key / link" value={key} onChange={setKey} placeholder="https://… or LICENSE-XXXX" textarea />
              <Field label="How to redeem (instructions)" value={howTo} onChange={setHowTo} placeholder="Go to the link, click accept…" textarea />
              <button
                onClick={() => setDelivery.mutate({ delivered_key: key, key_instructions: howTo, key_redeem_label: label })}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:brightness-110"
              >
                Save delivery
              </button>
            </div>
          </div>

          {/* Order notes thread */}
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> Order notes
            </div>
            {order.notes && (
              <p className="mb-3 rounded-md border border-border bg-card p-3 text-sm">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Customer note · </span>
                {order.notes}
              </p>
            )}
            <div className="space-y-2">
              {(order.notes_thread ?? []).map((n, i) => (
                <div key={i} className={`rounded-md border p-3 text-sm ${n.from === "support" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>{n.from === "support" ? "Support" : order.customer_name}</span>
                    <span>{new Date(n.at).toLocaleString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{n.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && note.trim()) {
                    sendNote.mutate(note.trim());
                    setNote("");
                  }
                }}
                placeholder="Type a reply to the customer…"
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                disabled={!note.trim()}
                onClick={() => { if (note.trim()) { sendNote.mutate(note.trim()); setNote(""); } }}
                className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      )}
    </label>
  );
}

function ActionBtn({ children, onClick, disabled, variant }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "success" | "danger" }) {
  const tone =
    variant === "success" ? "border-success/40 bg-success/10 text-success hover:bg-success/20" :
    variant === "danger" ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20" :
    "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20";
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}>
      {children}
    </button>
  );
}

function statusClass(status: string) {
  switch (status) {
    case "review": return "border-gold/40 text-gold";
    case "verified": return "border-sky-500/40 text-sky-400";
    case "processing": return "border-primary/40 text-primary";
    case "completed": return "border-success/40 text-success";
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