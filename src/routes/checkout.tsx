import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Heart, Shield, Zap, MessageCircle, Trash2, Plus, ArrowLeft } from "lucide-react";
import { formatPrice, useShop, USD_TO_BDT } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — VintageStore" }] }),
  component: CheckoutPage,
});

const providers = [
  { id: "bkash", name: "bKash", color: "#E2136E" },
  { id: "nagad", name: "Nagad", color: "#F47A1F" },
  { id: "rocket", name: "Rocket", color: "#8C3494" },
  { id: "upay", name: "Upay", color: "#E73C7E" },
  { id: "binance", name: "Binance", color: "#F3BA2F" },
];

function CheckoutPage() {
  const nav = useNavigate();
  const { items, currency, setQty, remove } = useShop();
  const subtotalUSD = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const subtotalBDT = Math.round(subtotalUSD * USD_TO_BDT);
  const [tip, setTip] = useState(0);
  const [provider, setProvider] = useState<string | null>(null);
  const totalBDT = subtotalBDT + tip;

  return (
    <div className="container-wide py-10">
      {/* steps */}
      <div className="mx-auto mb-10 flex max-w-xl items-center justify-center gap-2 text-xs font-bold uppercase">
        <Step n={<Check className="h-3 w-3" />} label="Cart" done />
        <Bar />
        <Step n="2" label="Checkout" active />
        <Bar />
        <Step n="3" label="Complete" />
      </div>

      <h1 className="font-display text-5xl uppercase">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Customer Information */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <h2 className="font-display text-2xl">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name *" placeholder="John Doe" />
              <Field label="Email" placeholder="you@email.com" type="email" />
              <Field label="Phone *" placeholder="01XXXXXXXXX" />
              <Field label="Notes (optional)" placeholder="Add any extra instructions" />
            </div>
          </section>

          {/* Provider */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2 text-success"><Check className="h-4 w-4" /> Payment Methods</span>
              <span className="h-px flex-1 bg-border" />
              <span className="flex items-center gap-2 text-primary"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">2</span> Provider</span>
              <span className="h-px flex-1 bg-border" />
              <span className="flex items-center gap-2 text-muted-foreground"><span className="grid h-6 w-6 place-items-center rounded-full bg-secondary">3</span> Pay</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <Link to="/cart" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Banking</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {providers.map((p) => {
                const sel = provider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      "group relative flex flex-col items-center gap-3 rounded-2xl border-2 bg-background p-5 transition-all",
                      sel ? "border-primary bg-primary/5 glow-red" : "border-border hover:border-primary/50",
                    )}
                  >
                    {sel && (
                      <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <span
                      className="grid h-12 w-12 place-items-center rounded-xl font-display text-lg text-white"
                      style={{ background: p.color }}
                    >
                      {p.name[0]}
                    </span>
                    <span className="font-display tracking-wider">{p.name.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Order Summary</h2>

          <ul className="mt-5 space-y-3">
            {items.map((i) => (
              <li key={i.product.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <img src={i.product.image} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                <div className="min-w-0 flex-1 truncate text-sm">{i.product.name}</div>
                <button onClick={() => remove(i.product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                <button onClick={() => setQty(i.product.id, i.qty + 1)} className="text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
                <span className="shrink-0 text-sm font-bold">{Math.round(i.product.price * i.qty * USD_TO_BDT)} BDT</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <input placeholder="COUPON CODE" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase tracking-wider outline-none" />
            <button className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background">Apply</button>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gold">
              <Heart className="h-4 w-4" /> Support Us (Optional Tip)
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 10, 20, 50, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-bold",
                    tip === t ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === 0 ? "No tip" : `${t} BDT`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotalBDT} BDT</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
            <span>Total</span>
            <span className="font-display text-3xl text-primary">{totalBDT} BDT</span>
          </div>

          <button
            onClick={() => {
              if (!provider) return alert("Select a payment provider");
              nav({ to: "/payment/$method", params: { method: provider } });
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-base uppercase tracking-wider text-primary-foreground glow-red hover:brightness-110"
          >
            <Shield className="h-4 w-4" /> Confirm Order →
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            <Zap className="mr-1 inline h-3 w-3 text-primary" />
            Instant processing after verification
          </p>
          <div className="mt-4 flex justify-center gap-5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Payment</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Fast Delivery</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 24/7 Support</span>
          </div>

          {/* hidden currency var to silence ts */}
          <span className="hidden">{currency}</span>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input {...rest} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function Step({ n, label, active, done }: { n: React.ReactNode; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "grid h-7 w-7 place-items-center rounded-full text-xs",
        done ? "bg-success text-background" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
      )}>{n}</span>
      <span className={cn(active ? "text-foreground" : done ? "text-success" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}

function Bar() {
  return <span className="h-px w-12 bg-border" />;
}
