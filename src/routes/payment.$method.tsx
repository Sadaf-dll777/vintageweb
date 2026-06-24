import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Copy, Shield, Zap, MessageCircle, Heart, Trash2, Plus, Check } from "lucide-react";
import { USD_TO_BDT, useShop } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payment/$method")({
  head: () => ({ meta: [{ title: "Pay — VintageStore" }] }),
  component: PaymentPage,
});

const methodMeta: Record<string, { name: string; number: string; color: string; type: "mobile" | "crypto" }> = {
  bkash: { name: "bKash", number: "01737784088", color: "#E2136E", type: "mobile" },
  nagad: { name: "Nagad", number: "01737784088", color: "#F47A1F", type: "mobile" },
  rocket: { name: "Rocket", number: "01737784088", color: "#8C3494", type: "mobile" },
  upay: { name: "Upay", number: "01737784088", color: "#E73C7E", type: "mobile" },
  binance: { name: "Binance", number: "851074382", color: "#F3BA2F", type: "crypto" },
};

function PaymentPage() {
  const { method } = Route.useParams();
  const m = methodMeta[method] ?? methodMeta.bkash;
  const nav = useNavigate();
  const { items, clear, setQty, remove } = useShop();
  const [tip, setTip] = useState(0);
  const [txn, setTxn] = useState("");
  const [sender, setSender] = useState("");
  const [done, setDone] = useState(false);

  const subtotalBDT = Math.round(items.reduce((s, i) => s + i.product.price * i.qty, 0) * USD_TO_BDT);
  const totalBDT = subtotalBDT + tip;

  const steps = m.type === "mobile"
    ? [
        `Open your ${m.name} App`,
        "Tap on Send Money or from Agent Choose Cash In",
        `Enter the number: ${m.number}`,
        `Enter exact amount: ${totalBDT} BDT`,
        "Tap Next and confirm with your PIN",
        "Note down your Transaction ID (TxID)",
        "Enter the Transaction ID below to complete your order",
      ]
    : [
        "Open the Binance app",
        "Go to Pay → Send",
        `Enter Binance ID: ${m.number}`,
        `Send equivalent of ${totalBDT} BDT in USDT`,
        "Copy the Transaction ID from your Binance receipt",
        "Submit the Transaction ID below to complete your order",
      ];

  if (done) {
    return (
      <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-success/20 text-success">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-5xl uppercase">Order Received!</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We've received your payment details. Our team will verify and deliver your order shortly. You'll get an email confirmation at the address you provided.
        </p>
        <Link to="/shop" className="mt-6 rounded-full bg-primary px-7 py-3 font-display uppercase tracking-wider text-primary-foreground glow-red">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <button onClick={() => nav({ to: "/checkout" })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Change provider
          </button>

          {/* pay card */}
          <section className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card p-6">
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: `radial-gradient(circle at top right, ${m.color}, transparent 60%)` }}
            />
            <div className="relative flex flex-wrap items-start gap-6">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-background text-2xl font-display" style={{ color: m.color }}>
                {m.name[0]}
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pay with</div>
                  <div className="font-display text-2xl">{m.name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {m.type === "mobile" ? "Send to" : "Binance ID"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl text-primary tracking-wider">{m.number}</span>
                    <button onClick={() => navigator.clipboard.writeText(m.number)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-primary">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exact Amount</div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl">{totalBDT} BDT</span>
                    <button onClick={() => navigator.clipboard.writeText(String(totalBDT))} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-primary">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden h-32 w-32 shrink-0 rounded-xl bg-white p-2 sm:block">
                <img
                  alt="QR"
                  className="h-full w-full"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(m.number)}`}
                />
              </div>
            </div>
          </section>

          {/* steps */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              ⚡ Step-by-step
            </div>
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <span className="text-sm text-foreground/90">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* confirm */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Shield className="h-3.5 w-3.5" /> Confirm Your Payment
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Transaction ID *</span>
                <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Enter Transaction ID" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {m.type === "mobile" ? "Sender Number *" : "Sender Wallet/ID *"}
                </span>
                <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder={m.type === "mobile" ? "Enter your mobile number" : "Enter Binance ID"} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
              </label>
              <button
                onClick={() => {
                  if (!txn || !sender) return alert("Please fill all fields");
                  clear();
                  setDone(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display uppercase tracking-wider text-primary-foreground glow-red hover:brightness-110"
              >
                <Shield className="h-4 w-4" /> Submit Payment
              </button>
            </div>
          </section>
        </div>

        {/* Summary */}
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

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gold">
              <Heart className="h-4 w-4" /> Support Us (Optional Tip)
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 10, 20, 50, 100].map((t) => (
                <button key={t} onClick={() => setTip(t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-bold",
                    tip === t ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >{t === 0 ? "No tip" : `${t} BDT`}</button>
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

          <div className="mt-5 flex justify-center gap-5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Fast</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 24/7</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
