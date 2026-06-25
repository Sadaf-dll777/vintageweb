import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check, Heart, Shield, Zap, MessageCircle, Trash2, Plus, ArrowLeft,
  Copy, Smartphone, Building2, Sparkles, User, MapPin, ChevronDown, Gamepad2,
  ChevronRight, Landmark, Upload, Bitcoin,
} from "lucide-react";
import { useShop, USD_TO_BDT, type Currency } from "@/lib/store";
import { cn } from "@/lib/utils";
import bracBankLogo from "@/assets/brac-bank.png.asset.json";
import {
  mobileProviders,
  bankProvider,
  cryptoProviders,
  bankDetailsText,
  type PaymentProvider as Provider,
} from "@/config/site";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — VintageStore" }] }),
  component: CheckoutPage,
});

type Stage = "method" | "provider" | "pay";
type MethodId = "mobile" | "bank" | "crypto";

function CheckoutPage() {
  const { items, currency, setCurrency, setQty, remove, clear } = useShop();
  const subtotalUSD = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const subtotalBDT = Math.round(subtotalUSD * USD_TO_BDT);
  const [tip, setTip] = useState(0);
  const totalBDT = subtotalBDT + tip;
  const tipUSD = currency === "USD" ? tip : 0;
  const totalUSD = subtotalUSD + tipUSD;
  const fmt = (usd: number) =>
    currency === "USD" ? `$${usd.toFixed(2)} USD` : `${Math.round(usd * USD_TO_BDT)} BDT`;
  const totalAmount = currency === "USD" ? totalUSD : totalBDT;
  const totalDisplay = currency === "USD" ? `$${totalUSD.toFixed(2)} USD` : `${totalBDT} BDT`;
  const tipOptions = currency === "USD" ? [0, 1, 5, 10, 50] : [0, 10, 20, 50, 100];

  const [stage, setStage] = useState<Stage>("method");
  const [method, setMethod] = useState<MethodId | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [txn, setTxn] = useState("");
  const [sender, setSender] = useState("");
  const [bankName, setBankName] = useState("");
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [epicEmail, setEpicEmail] = useState("");
  const [epicPass, setEpicPass] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
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
    providerId === "bank"
      ? bankProvider
      : cryptoProviders.find((p) => p.id === providerId)
        ?? mobileProviders.find((p) => p.id === providerId)
        ?? null;

  // Reset payment flow + tip when currency changes (USD = crypto only; BDT = mobile/bank only)
  useEffect(() => {
    setStage("method");
    setMethod(null);
    setProviderId(null);
    setTip(0);
  }, [currency]);

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
                  <span className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                    <span className={cn("text-primary", errors.fullName && "animate-step-pulse")} aria-hidden>*</span>
                  </span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setAddressesOpen(true)}
                    placeholder="Your full name"
                    aria-invalid={errors.fullName || undefined}
                    className={cn(
                      "w-full rounded-lg border bg-background/60 px-4 py-3 text-sm outline-none transition-all focus:border-primary/60 focus:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]",
                      errors.fullName ? "border-destructive/70 bg-destructive/5" : "border-border",
                    )}
                  />
                  {errors.fullName && (
                    <span className="mt-1 block text-[11px] font-semibold text-destructive">This field is required</span>
                  )}
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
              <Field
                label="Phone"
                required
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                invalid={errors.phone}
              />
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
              <Field
                label="Epic Games Email ID"
                required
                placeholder="enter email id"
                value={epicEmail}
                onChange={(e) => setEpicEmail(e.target.value)}
                invalid={errors.epicEmail}
              />
              <Field
                label="Epic Games Password"
                required
                placeholder="enter password"
                type="password"
                value={epicPass}
                onChange={(e) => setEpicPass(e.target.value)}
                invalid={errors.epicPass}
              />
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
                  {currency === "USD" ? (
                    <MethodTile
                      icon={<Bitcoin className="h-6 w-6" />}
                      title="Crypto / Exchange"
                      subtitle="Binance, Bybit, USDT…"
                      count={`${cryptoProviders.length} options`}
                      logos={cryptoProviders.map((p) => ({ src: p.logo!, alt: p.name }))}
                      selected={method === "crypto"}
                      tint="from-amber-500/25 via-amber-500/10 to-transparent"
                      ringColor="rgba(240,185,11,0.45)"
                      onClick={() => { setMethod("crypto"); setStage("provider"); }}
                    />
                  ) : (
                    <>
                      <MethodTile
                        icon={<Smartphone className="h-6 w-6" />}
                        title="Mobile Banking"
                        subtitle="bKash, Nagad, Rocket, Upay"
                        count={`${mobileProviders.length} options`}
                        logos={mobileProviders.map((p) => ({ src: p.logo!, alt: p.name }))}
                        selected={method === "mobile"}
                        tint="from-primary/25 via-primary/10 to-transparent"
                        ringColor="oklch(0.62 0.22 25 / 0.45)"
                        onClick={() => { setMethod("mobile"); setStage("provider"); }}
                      />
                      <MethodTile
                        icon={<Building2 className="h-6 w-6" />}
                        title="Bank Transfer"
                        subtitle="Brac Bank — Banpara Sub Branch"
                        count="1 option"
                        logos={[{ src: bracBankLogo.url, alt: "Brac Bank" }]}
                        selected={method === "bank"}
                        tint="from-sky-500/25 via-sky-500/10 to-transparent"
                        ringColor="rgba(59,130,246,0.45)"
                        onClick={() => {
                          setMethod("bank");
                          setProviderId("bank");
                          setStage("pay");
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STAGE: choose provider */}
            {stage === "provider" && (method === "mobile" || method === "crypto") && (
              <div className="mt-6 animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <button onClick={() => setStage("method")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {method === "crypto" ? "Crypto / Exchange" : "Mobile Banking"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(method === "crypto" ? cryptoProviders : mobileProviders).map((p) => {
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
                          className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-white p-1.5"
                        >
                          {p.logo ? (
                            <img src={p.logo} alt={p.name} className="h-full w-full object-contain" />
                          ) : (
                            <span className="grid h-full w-full place-items-center rounded-md font-display text-lg" style={{ color: p.color }}>
                              {p.id === "binance" ? "◆" : p.id === "bybit" ? "B" : p.name[0]}
                            </span>
                          )}
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
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStage(method === "mobile" || method === "crypto" ? "provider" : "method")}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Change provider
                  </button>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Pay {totalDisplay}
                  </span>
                </div>

                {/* Pay card */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-background p-6">
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${provider.color}, transparent 60%)` }}
                  />
                  <div className="relative flex flex-wrap items-start gap-6">
                    <span
                      className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white p-2"
                    >
                      {provider.logo ? (
                        <img src={provider.logo} alt={provider.name} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-2xl font-display" style={{ color: provider.color }}>
                          {provider.id === "binance" ? "◆" : provider.id === "bybit" ? "B" : provider.name[0]}
                        </span>
                      )}
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
                          <CopyButton value={provider.number} tone="primary" />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exact Amount</div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-3xl">{totalDisplay}</span>
                          <CopyButton value={String(totalAmount)} />
                        </div>
                      </div>
                    </div>
                    {method !== "crypto" && (
                      <div className="hidden h-28 w-28 shrink-0 rounded-xl bg-white p-2 sm:block">
                        <img
                          alt="QR"
                          className="h-full w-full"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(provider.number)}`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="rounded-2xl border border-border bg-background p-6">
                  {method === "bank" && (
                    <div className="-mt-1 mb-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <Landmark className="h-3.5 w-3.5" /> Bank Details
                        </div>
                        <CopyButton value={bankDetailsText} label="Copy all" />
                      </div>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: "Bank", value: "Brac Bank" },
                          { label: "Account Name", value: "MD FARUQ HOSSAIN" },
                          { label: "Account Number", value: "1076776160001" },
                          { label: "Branch", value: "Banpara Sub Branch" },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="detail-row flex items-center justify-between gap-3 rounded-lg bg-card/60 px-3 py-2"
                          >
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">{row.label}</span>
                            <span className="font-medium text-foreground">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 h-px bg-border/60" />
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Step-by-step
                  </div>
                  <ol className="space-y-3">
                    {(method === "bank"
                      ? [
                          "Transfer the exact amount to our bank account",
                          "Take a screenshot or save the receipt PDF",
                          "Fill in the details below",
                        ]
                      : provider.steps
                    ).map((s, i) => (
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
                  {method === "crypto" ? (
                    <div className="space-y-4">
                      <Field
                        label={provider.id === "binance" ? "Order ID" : "Transaction ID"}
                        required
                        invalid={errors.txn}
                        placeholder={provider.id === "binance" ? "Enter Binance Order ID" : "Enter Bybit Transaction ID"}
                        value={txn}
                        onChange={(e) => setTxn(e.target.value)}
                      />
                      <div>
                        <span className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Proof Of Payment <span className="text-primary" aria-hidden>*</span>
                        </span>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                          <Upload className="h-4 w-4" />
                          <span className="truncate">{receiptName ?? "Provide Screenshot Of Payment"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? null)}
                          />
                        </label>
                      </div>
                    </div>
                  ) : method === "bank" ? (
                    <div className="space-y-4">
                      <Field
                        label="Your Bank Name"
                        required
                        invalid={errors.bankName}
                        placeholder="e.g. DBBL, Brac Bank, City Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                      <Field
                        label="Reference / Transaction ID"
                        required
                        invalid={errors.txn}
                        placeholder="Enter bank transfer reference"
                        value={txn}
                        onChange={(e) => setTxn(e.target.value)}
                      />
                      <div>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Transfer Receipt</span>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                          <Upload className="h-4 w-4" />
                          <span className="truncate">{receiptName ?? "Upload receipt screenshot or PDF"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? null)}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Field
                        label="Transaction ID"
                        required
                        invalid={errors.txn}
                        placeholder="Enter Transaction ID"
                        value={txn}
                        onChange={(e) => setTxn(e.target.value)}
                      />
                      <Field
                        label="Sender Number"
                        required
                        invalid={errors.sender}
                        placeholder="Enter your mobile number"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="h-fit self-start rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl">Order Summary</h2>

          <ul className="mt-5 space-y-3">
            {items.map((i) => (
              <li key={i.product.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <img src={i.product.image} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                <div className="min-w-0 flex-1 truncate text-sm">{i.product.name}</div>
                <button onClick={() => remove(i.product.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                <button onClick={() => setQty(i.product.id, i.qty + 1)} className="text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" /></button>
                <span className="shrink-0 text-sm font-bold">{fmt(i.product.price * i.qty)}</span>
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
              {tipOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-bold",
                    tip === t ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === 0 ? "No tip" : currency === "USD" ? `$${t} USD` : `${t} BDT`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{fmt(subtotalUSD)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
            <span>Total</span>
            <span className="font-display text-3xl text-primary">{totalDisplay}</span>
          </div>

          <button
            onClick={() => {
              const next: Record<string, boolean> = {};
              if (!fullName.trim()) next.fullName = true;
              if (!phone.trim()) next.phone = true;
              if (!epicEmail.trim()) next.epicEmail = true;
              if (!epicPass.trim()) next.epicPass = true;
              if (stage !== "pay" || !provider) {
                setErrors(next);
                return alert("Choose a payment provider");
              }
              if (method === "bank") {
                if (!bankName.trim()) next.bankName = true;
                if (!txn.trim()) next.txn = true;
              } else if (method === "crypto") {
                if (!txn.trim()) next.txn = true;
              } else {
                if (!txn.trim()) next.txn = true;
                if (!sender.trim()) next.sender = true;
              }
              setErrors(next);
              if (Object.keys(next).length > 0) {
                const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
                first?.scrollIntoView({ behavior: "smooth", block: "center" });
                first?.focus({ preventScroll: true });
                return;
              }
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
            <span className="flex items-center gap-2.5">
              <span className="relative grid place-items-center">
                {active && (
                  <span
                    aria-hidden
                    className="animate-step-ring absolute inset-0 rounded-full bg-primary/40"
                  />
                )}
                <span
                  className={cn(
                    "relative grid h-7 w-7 place-items-center rounded-full text-[11px] transition-all duration-500",
                    done && "bg-success text-background",
                    active && "animate-step-pulse bg-primary text-primary-foreground scale-110",
                    !done && !active && "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : it.n}
                </span>
              </span>
              <span
                className={cn(
                  "transition-colors duration-500",
                  done ? "text-success" : active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {it.label}
              </span>
            </span>
            {idx < items.length - 1 && (
              <span className="relative h-px flex-1 overflow-hidden bg-border/60">
                <span
                  key={`fill-${currentIdx}-${idx}`}
                  className={cn(
                    "absolute inset-0 origin-left",
                    idx < currentIdx ? "animate-step-line bg-success" : "scale-x-0 bg-primary",
                  )}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function MethodTile({
  icon, title, subtitle, count, swatches, logos, selected, onClick, tint, ringColor,
}: {
  icon: React.ReactNode; title: string; subtitle: string; count: string;
  swatches?: string[]; logos?: { src: string; alt: string }[]; selected: boolean; onClick: () => void;
  tint?: string; ringColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-background/40 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]",
        selected ? "border-primary/70" : "border-border/70 hover:border-primary/40",
      )}
      style={selected && ringColor ? { boxShadow: `0 0 0 1px ${ringColor}, 0 20px 60px -20px ${ringColor}` } : undefined}
    >
      {/* gradient tint background */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity duration-500 group-hover:opacity-100",
          tint ?? "from-primary/15 via-transparent to-transparent",
        )}
      />
      <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border/60 bg-background/80 text-foreground shadow-inner transition-transform duration-300 group-hover:scale-105">
        {icon}
      </span>
      <div className="relative min-w-0 flex-1">
        <div className="font-display text-xl tracking-wide">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        <div className="mt-2.5 flex items-center gap-2">
          {logos && logos.length > 0 ? (
            <div className="flex -space-x-1.5">
              {logos.map((l, i) => (
                <span key={i} className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border-2 border-background bg-white p-0.5 shadow-md transition-transform duration-300 hover:z-10 hover:-translate-y-0.5 hover:scale-110" style={{ transitionDelay: `${i * 40}ms` }}>
                  <img src={l.src} alt={l.alt} className="h-full w-full object-contain" />
                </span>
              ))}
            </div>
          ) : (
            <div className="flex -space-x-1">
              {(swatches ?? []).map((c, i) => (
                <span key={i} className="h-5 w-5 rounded-full border-2 border-background shadow-md" style={{ background: c }} />
              ))}
            </div>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{count}</span>
        </div>
      </div>
      <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:border-primary/60 group-hover:text-primary">
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function Field({
  label,
  invalid,
  required,
  ...rest
}: { label: string; invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && (
          <span
            className={cn(
              "text-primary transition-transform",
              invalid && "animate-step-pulse",
            )}
            aria-hidden
          >
            *
          </span>
        )}
      </span>
      <input
        {...rest}
        required={required}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary",
          invalid
            ? "border-destructive/70 bg-destructive/5 focus:border-destructive"
            : "border-border",
        )}
      />
      {invalid && (
        <span className="mt-1 block text-[11px] font-semibold text-destructive">
          This field is required
        </span>
      )}
    </label>
  );
}

function CopyButton({
  value,
  label,
  tone = "default",
}: {
  value: string;
  label?: string;
  tone?: "default" | "primary";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  const ring = tone === "primary"
    ? "border-primary/40 text-primary hover:border-primary"
    : "border-border text-muted-foreground hover:border-primary hover:text-primary";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy"}
      className={cn(
        "group/copy relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg border bg-background/40 px-2 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-10px_oklch(0.62_0.22_25_/_0.55)] active:scale-95",
        copied ? "border-success/60 text-success" : ring,
        !label && "h-7 w-7 justify-center px-0 py-0",
      )}
    >
      {/* hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 group-hover/copy:translate-x-full"
      />
      {/* ripple on click */}
      {copied && (
        <span
          aria-hidden
          key={String(copied)}
          className="pointer-events-none absolute inset-0 animate-step-ring rounded-lg bg-success/30"
        />
      )}
      <span className="relative grid h-3.5 w-3.5 place-items-center">
        <Copy
          className={cn(
            "absolute h-3.5 w-3.5 transition-all duration-300",
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Check
          className={cn(
            "absolute h-3.5 w-3.5 transition-all duration-300",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </span>
      {label && (
        <span className="relative">{copied ? "Copied!" : label}</span>
      )}
    </button>
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

function CheckoutStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-xl">
      <Step n={current > 1 ? <Check className="h-3 w-3" /> : 1} label="Cart" done={current > 1} active={current === 1} />
      <Bar />
      <Step n={current > 2 ? <Check className="h-3 w-3" /> : 2} label="Checkout" done={current > 2} active={current === 2} />
      <Bar />
      <Step n={3} label="Complete" active={current === 3} />
    </div>
  );
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
