import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check, Heart, Shield, Zap, MessageCircle, Trash2, Plus, ArrowLeft,
  Copy, Smartphone, Building2, Sparkles, User, MapPin, ChevronDown, Gamepad2,
} from "lucide-react";
import { useShop, USD_TO_BDT, type Currency } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — VintageStore" }] }),
  component: CheckoutPage,
});

type Stage = "method" | "provider" | "pay";
type MethodId = "mobile" | "bank";

interface Provider {
  id: string;
  name: string;
  number: string;
  color: string;
  short?: string;
  steps: string[];
}

const mobileProviders: Provider[] = [
  {
    id: "bkash", name: "bKash", number: "01737784088", color: "#E2136E",
    steps: [
      "Open your bKash App",
      "Tap on Send Money or from Agent Choose Cash In",
      "Enter the number: 01737784088",
      "Enter exact amount",
      "Tap Next and confirm with your PIN",
      "Note down your Transaction ID (TxID)",
      "Enter the Transaction ID below to complete your order",
    ],
  },
  {
    id: "nagad", name: "Nagad", number: "01737784088", color: "#F47A1F",
    steps: [
      "Open Nagad App or dial *167#",
      "Choose Send Money",
      "Enter the number: 01737784088",
      "Enter exact amount",
      "Confirm with your PIN",
      "Note down the Transaction ID",
      "Enter it below",
    ],
  },
  {
    id: "rocket", name: "Rocket", number: "017377840880", color: "#8C3494",
    steps: [
      "Dial *322# or open Rocket App",
      "Choose Send Money",
      "Enter the number: 017377840880",
      "Enter exact amount",
      "Confirm with your PIN",
      "Copy the Transaction ID",
      "Enter it below",
    ],
  },
  {
    id: "upay", name: "Upay", number: "01737784088", color: "#E73C7E",
    steps: [
      "Open Upay App",
      "Choose Send Money",
      "Enter the number: 01737784088",
      "Enter exact amount",
      "Confirm with your PIN",
      "Copy the Transaction ID",
      "Enter it below",
    ],
  },
];

const bankProvider: Provider = {
  id: "bank", name: "Bank Transfer", number: "1234 5678 9012 3456", color: "#3B82F6",
  steps: [
    "Log in to your online banking",
    "Choose Transfer / Send Money",
    "Account Number: 1234 5678 9012 3456",
    "Account Name: VintageStore Ltd",
    "Bank: City Bank PLC",
    "Send exact amount in BDT",
    "Copy the Transaction Reference and enter it below",
  ],
};

function CheckoutPage() {
  const { items, currency, setCurrency, setQty, remove, clear } = useShop();
  const subtotalUSD = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const subtotalBDT = Math.round(subtotalUSD * USD_TO_BDT);
  const [tip, setTip] = useState(0);
  const totalBDT = subtotalBDT + tip;

  const [stage, setStage] = useState<Stage>("method");
  const [method, setMethod] = useState<MethodId | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [txn, setTxn] = useState("");
  const [sender, setSender] = useState("");
  const [done, setDone] = useState(false);

  // Customer info
  const [fullName, setFullName] = useState("");
  const [addressesOpen, setAddressesOpen] = useState(false);
  const addrRef = useRef<HTMLDivElement>(null);
  const savedAddresses = [
    { name: "MD FARUQ HOSSAIN", phone: "" },
    { name: "Saif Al Sadaf", phone: "+880 1737-784088" },
  ];
  useEffect(() => {
    if (!addressesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (addrRef.current && !addrRef.current.contains(e.target as Node)) setAddressesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [addressesOpen]);

  const provider: Provider | null =
    providerId === "bank" ? bankProvider : mobileProviders.find((p) => p.id === providerId) ?? null;

  if (done) {
    return (
      <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-success/20 text-success animate-scale-in">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-5xl uppercase">Order Received!</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          We've got your payment details. Our team will verify and deliver shortly.
        </p>
        <Link to="/shop" className="mt-6 rounded-full bg-primary px-7 py-3 font-display uppercase tracking-wider text-primary-foreground glow-red">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      {/* Top progress stepper */}
      <div className="relative flex items-center justify-center">
        <CheckoutStepper current={done ? 3 : 2} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <MiniCurrencyToggle currency={currency} onChange={setCurrency} />
        </div>
      </div>
      <h1 className="mt-6 font-display text-5xl uppercase tracking-wide">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Customer Information */}
          <section className="checkout-card-in rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground glow-red">1</span>
              <h2 className="font-display text-2xl">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full name with saved-address dropdown */}
              <div ref={addrRef} className="relative">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setAddressesOpen(true)}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary/60 focus:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]"
                  />
                </label>
                {addressesOpen && (
                  <div className="ck-pop absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border/70 bg-card/95 p-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.name}
                        type="button"
                        onClick={() => { setFullName(a.name); setAddressesOpen(false); }}
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-secondary/60"
                      >
                        <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{a.name}</div>
                          {a.phone && <div className="text-xs text-muted-foreground">{a.phone}</div>}
                        </div>
                      </button>
                    ))}
                    <div className="my-1 h-px bg-border/60" />
                    <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground">
                      <MapPin className="h-4 w-4" /> Manage addresses…
                    </button>
                  </div>
                )}
              </div>
              <Field label="Email" placeholder="you@email.com" type="email" />
              <Field label="Phone *" placeholder="01XXXXXXXXX" />
              <Field label="Notes (optional)" placeholder="Add any extra instructions" />
            </div>
          </section>

          {/* Game / Account Details */}
          <section className="checkout-card-in rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl" style={{ animationDelay: "80ms" }}>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary/15 text-primary">
                <Gamepad2 className="h-4 w-4" />
              </span>
              <h2 className="font-display text-2xl">Game / Account Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Epic Games Email ID *" placeholder="enter email id" />
              <Field label="Epic Games Password *" placeholder="enter password" type="password" />
            </div>
          </section>

          {/* Payment Stepper */}
          <section className="checkout-card-in rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl" style={{ animationDelay: "160ms" }}>
            <StageHeader stage={stage} />

            {/* STAGE: choose method */}
            {stage === "method" && (
              <div className="mt-6 animate-fade-in">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Choose how you'd like to pay
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MethodTile
                    icon={<Smartphone className="h-6 w-6" />}
                    title="Mobile Banking"
                    subtitle="bKash, Nagad, Rocket, Upay"
                    count={`${mobileProviders.length} options`}
                    swatches={mobileProviders.map((p) => p.color)}
                    selected={method === "mobile"}
                    onClick={() => { setMethod("mobile"); setStage("provider"); }}
                  />
                  <MethodTile
                    icon={<Building2 className="h-6 w-6" />}
                    title="Bank Transfer"
                    subtitle="Local & International banks"
                    count="1 option"
                    swatches={[bankProvider.color]}
                    selected={method === "bank"}
                    onClick={() => {
                      setMethod("bank");
                      setProviderId("bank");
                      setStage("pay");
                    }}
                  />
                </div>
              </div>
            )}

            {/* STAGE: choose provider */}
            {stage === "provider" && method === "mobile" && (
              <div className="mt-6 animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <button onClick={() => setStage("method")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Mobile Banking
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {mobileProviders.map((p) => {
                    const sel = providerId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setProviderId(p.id); setStage("pay"); }}
                        className={cn(
                          "group relative flex flex-col items-center gap-3 rounded-2xl border-2 bg-background p-5 transition-all hover:-translate-y-0.5",
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
              </div>
            )}

            {/* STAGE: pay */}
            {stage === "pay" && provider && (
              <div className="mt-6 space-y-6 animate-fade-in">
                <button
                  onClick={() => setStage(method === "mobile" ? "provider" : "method")}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Change provider
                </button>

                {/* Pay card */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-background p-6">
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${provider.color}, transparent 60%)` }}
                  />
                  <div className="relative flex flex-wrap items-start gap-6">
                    <span
                      className="grid h-16 w-16 place-items-center rounded-2xl bg-card text-2xl font-display"
                      style={{ color: provider.color }}
                    >
                      {provider.name[0]}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pay With</div>
                        <div className="font-display text-2xl">{provider.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Send To</div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-2xl text-primary tracking-wider break-all">{provider.number}</span>
                          <button onClick={() => navigator.clipboard.writeText(provider.number)} className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:border-primary">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exact Amount</div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-3xl">{totalBDT} BDT</span>
                          <button onClick={() => navigator.clipboard.writeText(String(totalBDT))} className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:border-primary">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="hidden h-28 w-28 shrink-0 rounded-xl bg-white p-2 sm:block">
                      <img
                        alt="QR"
                        className="h-full w-full"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(provider.number)}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="rounded-2xl border border-border bg-background p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Step-by-step
                  </div>
                  <ol className="space-y-3">
                    {provider.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                        <span className="text-sm text-foreground/90">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Confirm */}
                <div className="rounded-2xl border border-border bg-background/60 p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <Shield className="h-3.5 w-3.5" /> Confirm Your Payment
                  </div>
                  <div className="space-y-4">
                    <Field
                      label="Transaction ID *"
                      placeholder="Enter Transaction ID"
                      value={txn}
                      onChange={(e) => setTxn(e.target.value)}
                    />
                    <Field
                      label={method === "mobile" ? "Sender Number *" : "Sender Account *"}
                      placeholder={method === "mobile" ? "Enter your mobile number" : "Enter account number"}
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
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
              if (stage !== "pay" || !provider) return alert("Choose a payment provider");
              if (!txn || !sender) return alert("Enter Transaction ID and Sender details");
              clear();
              setDone(true);
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
          <span className="hidden">{currency}</span>
        </aside>
      </div>
    </div>
  );
}

function StageHeader({ stage }: { stage: Stage }) {
  const items: { id: Stage; n: number; label: string }[] = [
    { id: "method", n: 1, label: "Payment Methods" },
    { id: "provider", n: 2, label: "Provider" },
    { id: "pay", n: 3, label: "Pay" },
  ];
  const order: Stage[] = ["method", "provider", "pay"];
  const currentIdx = order.indexOf(stage);
  return (
    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
      {items.map((it, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <span key={it.id} className="flex flex-1 items-center gap-3">
            <span className="flex items-center gap-2">
              <span className={cn(
                "grid h-6 w-6 place-items-center rounded-full",
                done ? "bg-success text-background" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
              )}>
                {done ? <Check className="h-3 w-3" /> : it.n}
              </span>
              <span className={cn(done ? "text-success" : active ? "text-foreground" : "text-muted-foreground")}>
                {it.label}
              </span>
            </span>
            {idx < items.length - 1 && <span className="h-px flex-1 bg-border" />}
          </span>
        );
      })}
    </div>
  );
}

function MethodTile({
  icon, title, subtitle, count, swatches, selected, onClick,
}: {
  icon: React.ReactNode; title: string; subtitle: string; count: string;
  swatches: string[]; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border-2 bg-background p-5 text-left transition-all hover:-translate-y-0.5",
        selected ? "border-primary glow-red" : "border-border hover:border-primary/50",
      )}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex -space-x-1">
            {swatches.map((c, i) => (
              <span key={i} className="h-4 w-4 rounded-full border-2 border-background" style={{ background: c }} />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{count}</span>
        </div>
      </div>
      <span className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary">→</span>
    </button>
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

function MiniCurrencyToggle({ currency, onChange }: { currency: Currency; onChange: (c: Currency) => void }) {
  return (
    <div className="relative flex items-center rounded-full border border-border bg-card p-0.5 text-[11px] font-bold">
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          currency === "BDT"
            ? "left-0.5 bg-primary shadow-[0_6px_20px_-6px_oklch(0.62_0.22_25_/_0.7)]"
            : "left-[calc(50%+0px)] bg-foreground shadow-[0_4px_18px_-6px_rgba(255,255,255,0.35)]",
        )}
      />
      <button onClick={() => onChange("BDT")} className={cn("relative z-10 rounded-full px-3 py-1 transition-colors", currency === "BDT" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>BDT</button>
      <button onClick={() => onChange("USD")} className={cn("relative z-10 rounded-full px-3 py-1 transition-colors", currency === "USD" ? "text-background" : "text-muted-foreground hover:text-foreground")}>USD</button>
    </div>
  );
}
