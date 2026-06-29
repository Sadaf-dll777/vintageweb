import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame, Clock, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";

export interface FlashDeal {
  id?: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  currency?: string; // e.g. "BDT"
  endsAt: string; // ISO timestamp
  urgency?: "rising" | "moderate" | "hot";
  soldPercent?: number; // 0-100
  href?: string;
}

interface FlashDealsConfig {
  enabled?: boolean;
  title?: string;
  subtitleSuffix?: string;
  deals?: FlashDeal[];
}

const DEFAULTS: Required<Pick<FlashDealsConfig, "title" | "subtitleSuffix">> & { deals: FlashDeal[] } = {
  title: "Flash Deals",
  subtitleSuffix: "deals active",
  deals: [
    {
      name: "Change Steam Region To India",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80",
      originalPrice: 400,
      salePrice: 199,
      currency: "BDT",
      endsAt: new Date(Date.now() + 11 * 3600_000).toISOString(),
      urgency: "rising",
      soldPercent: 27,
    },
    {
      name: "Ea Sports Fc 26 Steam Account",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      originalPrice: 3200,
      salePrice: 290,
      currency: "BDT",
      endsAt: new Date(Date.now() + 7 * 3600_000 + 15 * 60_000).toISOString(),
      urgency: "moderate",
      soldPercent: 0,
    },
    {
      name: "Playstation Gift Card India Region (1000 INR)",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80",
      originalPrice: 2350,
      salePrice: 2300,
      currency: "BDT",
      endsAt: new Date(Date.now() + 9 * 3600_000 + 46 * 60_000).toISOString(),
      urgency: "moderate",
      soldPercent: 0,
    },
  ],
};

function useCountdown(endsAt: string) {
  const target = useMemo(() => new Date(endsAt).getTime(), [endsAt]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const totalH = Math.floor(diff / 3_600_000);
  const h = totalH % 100;
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s, expired: diff === 0 };
}

const pad = (n: number) => n.toString().padStart(2, "0");

function UrgencyBadge({ kind }: { kind: FlashDeal["urgency"] }) {
  if (kind === "rising") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.62_0.22_25_/_0.18)] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
        <Flame className="h-3 w-3 fill-current" strokeWidth={0} /> Rising
      </span>
    );
  }
  if (kind === "hot") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.62_0.22_25_/_0.18)] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
        <Flame className="h-3 w-3 fill-current" strokeWidth={0} /> Hot
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
      <Sparkles className="h-3 w-3" /> Moderate
    </span>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative grid h-11 min-w-[3.25rem] place-items-center overflow-hidden rounded-lg border border-primary/50 bg-background/70 px-2"
        style={{ boxShadow: "inset 0 0 12px oklch(0.62 0.22 25 / 0.25), 0 0 14px oklch(0.62 0.22 25 / 0.25)" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-2xl leading-none tabular-nums text-primary"
            style={{ textShadow: "0 0 14px oklch(0.62 0.22 25 / 0.7)" }}
          >
            {pad(value)}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function TimeDot() {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      className="mb-4 font-display text-2xl leading-none text-primary"
    >
      :
    </motion.span>
  );
}

function DealCard({ deal }: { deal: FlashDeal }) {
  const { h, m, s } = useCountdown(deal.endsAt);
  const currency = deal.currency ?? "BDT";
  const pct = Math.max(0, Math.min(100, deal.soldPercent ?? 0));
  const discount =
    deal.originalPrice > deal.salePrice
      ? Math.round(((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100)
      : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-4 transition-[border-color,box-shadow] duration-500 hover:border-primary/60 hover:shadow-[0_25px_60px_-15px_oklch(0.62_0.22_25_/_0.55),0_0_0_1px_oklch(0.62_0.22_25_/_0.35)]"
    >
      {/* ambient glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, oklch(0.62 0.22 25 / 0.18) 0%, transparent 60%)",
        }}
      />

      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
          <img src={deal.image} alt={deal.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-bold leading-tight">{deal.name}</h4>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-xl text-primary">
              {deal.salePrice} {currency}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {deal.originalPrice} {currency}
            </span>
            {discount > 0 && (
              <span className="rounded-md bg-[oklch(0.62_0.22_25_/_0.18)] px-1.5 py-0.5 text-[10px] font-black tabular-nums text-primary">
                -{discount}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* countdown row */}
      <div className="relative mt-4 flex items-center gap-1.5">
        <TimeUnit value={h} label="H" />
        <TimeDot />
        <TimeUnit value={m} label="M" />
        <TimeDot />
        <TimeUnit value={s} label="S" />
      </div>

      {/* urgency + progress */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <UrgencyBadge kind={deal.urgency ?? "moderate"} />
        <span className="text-[11px] font-bold tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border/60">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-primary"
          style={{ boxShadow: "0 0 12px oklch(0.62 0.22 25 / 0.6)" }}
        />
      </div>

      {/* CTA */}
      <a
        href={deal.href ?? "#"}
        className="group/btn relative mt-4 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-display text-sm uppercase tracking-widest text-white"
        style={{
          background: "linear-gradient(90deg, #ffb020 0%, #ff7a18 45%, #e2253a 100%)",
          boxShadow: "0 10px 30px -10px oklch(0.62 0.22 25 / 0.8)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/30 opacity-0 transition-all duration-700 group-hover/btn:left-full group-hover/btn:opacity-100"
        />
        <Zap className="h-4 w-4 fill-current" strokeWidth={0} /> Grab Deal
      </a>
    </motion.div>
  );
}

export function FlashDeals() {
  const site = useQuery({ queryKey: ["site"], queryFn: api.getSite });
  const cfg = (site.data?.flashDeals as FlashDealsConfig | undefined) ?? {};
  const enabled = cfg.enabled ?? true;
  const deals = cfg.deals && cfg.deals.length > 0 ? cfg.deals : DEFAULTS.deals;

  if (!enabled || deals.length === 0) return null;

  return (
    <section className="container-wide py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-3 font-display text-4xl uppercase">
            <motion.span
              initial={{ opacity: 0, scale: 0.72, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.7 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-primary/15 bg-[oklch(0.62_0.22_25_/_0.14)] text-primary"
              style={{ boxShadow: "inset 0 0 18px oklch(0.62 0.22 25 / 0.12)" }}
            >
              <motion.span
                aria-hidden
                animate={{ opacity: [0.18, 0.42, 0.18], scale: [0.72, 1.12, 0.72] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-1 rounded-2xl bg-primary/20 blur-md"
              />
              <motion.span
                aria-hidden
                animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid place-items-center"
                style={{ filter: "drop-shadow(0 0 10px oklch(0.62 0.22 25 / 0.72))" }}
              >
                <Flame className="h-6 w-6" strokeWidth={2.4} />
              </motion.span>
            </motion.span>
            {cfg.title ?? DEFAULTS.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {deals.length} {cfg.subtitleSuffix ?? DEFAULTS.subtitleSuffix}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
          <Sparkles className="h-3.5 w-3.5" /> Limited Time Active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((d, i) => (
          <motion.div
            key={d.id ?? `${d.name}-${i}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <DealCard deal={d} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}