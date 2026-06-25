import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles,
  Gamepad2,
  Tv,
  Gift,
  User as UserIcon,
  Joystick,
  Globe,
  Target,
  Flame,
  Crosshair,
  Swords,
  Crown,
  Star,
  type LucideIcon,
} from "lucide-react";
import { products, categories, type Category } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — VintageStore" },
      { name: "description", content: "Browse top-ups, subscriptions, gift cards & more. Instant delivery." },
    ],
  }),
  component: ShopPage,
});

type SortKey = "popular" | "price-asc" | "price-desc" | "newest";

const SORT_LABEL: Record<SortKey, string> = {
  popular: "Most Popular",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  newest: "Newest",
};

const CATEGORY_META: Record<Category | "all", { Icon: LucideIcon; tagline: string; tint: string }> = {
  all: { Icon: Target, tagline: "Everything in one place", tint: "from-primary/40 via-primary/10 to-transparent" },
  "top-up": { Icon: Gamepad2, tagline: "Instant credits for your favorite games", tint: "from-primary/40 via-primary/10 to-transparent" },
  subscriptions: { Icon: Tv, tagline: "Premium streaming & gaming passes", tint: "from-blue-500/30 via-primary/10 to-transparent" },
  "gift-cards": { Icon: Gift, tagline: "Send credit to anyone, instantly", tint: "from-orange-500/30 via-primary/10 to-transparent" },
  accounts: { Icon: UserIcon, tagline: "Verified accounts, ready to play", tint: "from-violet-500/30 via-primary/10 to-transparent" },
  games: { Icon: Joystick, tagline: "PC & console titles at the best prices", tint: "from-pink-500/30 via-primary/10 to-transparent" },
  "region-change": { Icon: Globe, tagline: "Switch your store region in minutes", tint: "from-cyan-500/30 via-primary/10 to-transparent" },
};

// Brand sub-chips per category (shown only when a real category is selected)
const BRANDS: Partial<Record<Category, { id: string; label: string; Icon: LucideIcon }[]>> = {
  "top-up": [
    { id: "all", label: "All Top-Up", Icon: Sparkles },
    { id: "fortnite", label: "Fortnite", Icon: Crown },
    { id: "genshin-impact", label: "Genshin Impact", Icon: Sparkles },
    { id: "valorant", label: "Valorant", Icon: Crosshair },
    { id: "mobile-legends", label: "Mobile Legends", Icon: Swords },
    { id: "pubg-mobile", label: "PUBG Mobile", Icon: Target },
    { id: "free-fire", label: "Free Fire", Icon: Flame },
    { id: "apex-legends", label: "Apex Legends", Icon: Crosshair },
    { id: "honkai-star-rail", label: "Honkai Star Rail", Icon: Star },
  ],
  "gift-cards": [
    { id: "all", label: "All Gift Cards", Icon: Sparkles },
    { id: "steam", label: "Steam", Icon: Joystick },
    { id: "playstation", label: "PlayStation", Icon: Gamepad2 },
    { id: "xbox", label: "Xbox", Icon: Gamepad2 },
    { id: "razer", label: "Razer", Icon: Swords },
  ],
  subscriptions: [
    { id: "all", label: "All Subscriptions", Icon: Sparkles },
    { id: "netflix", label: "Netflix", Icon: Tv },
    { id: "spotify", label: "Spotify", Icon: Sparkles },
    { id: "youtube", label: "YouTube", Icon: Tv },
    { id: "discord", label: "Discord", Icon: UserIcon },
  ],
  "region-change": [
    { id: "all", label: "All Regions", Icon: Sparkles },
    { id: "steam", label: "Steam", Icon: Joystick },
  ],
};

const ALL_TAGS = [
  "argentina", "bangladesh", "china", "gift-card", "global", "india", "india-region",
  "indonesia", "malaysia", "pc", "playstation", "turkey", "turkey-region", "ukraine", "usa",
] as const;

// Brand inference from product id when not on product itself
function brandOf(p: { id: string }) {
  const id = p.id.toLowerCase();
  const map: Record<string, string> = {
    fortnite: "fortnite", genshin: "genshin-impact", valorant: "valorant", pubg: "pubg-mobile",
    freefire: "free-fire", razer: "razer", playstation: "playstation", xbox: "xbox",
    steam: "steam", netflix: "netflix", spotify: "spotify", youtube: "youtube", discord: "discord",
  };
  for (const key of Object.keys(map)) if (id.includes(key)) return map[key];
  return "";
}

function tagsOf(name: string): string[] {
  const n = name.toLowerCase();
  const out: string[] = [];
  for (const t of ALL_TAGS) if (n.includes(t.replace("-", " ")) || n.includes(t)) out.push(t);
  if (n.includes("gift card")) out.push("gift-card");
  if (n.includes("global")) out.push("global");
  if (n.includes("(us)") || n.includes(" us ") || n.endsWith(" us")) out.push("usa");
  return Array.from(new Set(out));
}

function ShopPage() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // reset brand when category changes
  useEffect(() => { setBrand("all"); }, [cat]);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const inCat = cat === "all" || p.category === cat;
      const inQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
      const pBrand = (p as { brand?: string }).brand ?? brandOf(p);
      const inBrand = brand === "all" || pBrand === brand;
      const min = minPrice === "" ? -Infinity : Number(minPrice);
      const max = maxPrice === "" ? Infinity : Number(maxPrice);
      const inPrice = p.price * 119 >= min && p.price * 119 <= max; // rough BDT
      const pTags = ((p as { tags?: string[] }).tags ?? []).concat(tagsOf(p.name));
      const inTags = activeTags.length === 0 || activeTags.every((t) => pTags.includes(t));
      return inCat && inQ && inBrand && inPrice && inTags;
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest") list.reverse();
    return list;
  }, [cat, q, brand, sort, minPrice, maxPrice, activeTags]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    products.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, []);

  const brandsForCat = cat !== "all" ? BRANDS[cat] : undefined;
  const showBanner = cat !== "all";
  const meta = CATEGORY_META[cat];
  const bannerLabel = cat === "all" ? "All" : categories.find((c) => c.id === cat)?.label ?? "";
  const bannerDesc =
    brand !== "all" && brandsForCat
      ? "Browse our curated collection"
      : meta.tagline;
  const bannerTitle = brand !== "all" && brandsForCat
    ? brandsForCat.find((b) => b.id === brand)?.label ?? bannerLabel
    : bannerLabel;
  const bannerCount = filtered.length;

  const clearFilter = () => {
    setCat("all");
    setBrand("all");
    setActiveTags([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const resetAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setActiveTags([]);
  };

  return (
    <div className="container-wide py-12">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
        ⚡ Digital Marketplace
      </span>
      <h1 className="mt-3 font-display text-5xl uppercase leading-none sm:text-6xl">
        Browse <span className="text-primary">Products</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Best prices for gaming top-ups, gift cards, subscriptions & accounts with instant delivery.
      </p>

      {/* Search row */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 basis-1/2 flex-grow-0 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-bold uppercase tracking-wider transition",
            filtersOpen ? "border-primary text-primary" : "border-border hover:border-primary/60",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-bold uppercase tracking-wider transition",
              sortOpen ? "border-primary text-primary" : "border-border hover:border-primary/60",
            )}
          >
            {SORT_LABEL[sort]}
            <ChevronDown className={cn("h-4 w-4 transition-transform", sortOpen && "rotate-180")} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 z-30 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl search-drop">
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => { setSort(k); setSortOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-secondary",
                    sort === k && "text-primary",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", sort === k ? "bg-primary" : "bg-transparent")} />
                  {SORT_LABEL[k]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters expandable panel */}
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          filtersOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Price range (BDT)</div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Min"
                className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <span className="text-muted-foreground">—</span>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Max"
                className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="mt-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tags</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ALL_TAGS.map((t) => {
                const active = activeTags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition",
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    <X className={cn("h-3 w-3 transition", active ? "opacity-100" : "opacity-40")} />
                    {t.replace(/-/g, " ")}
                  </button>
                );
              })}
            </div>
            <button
              onClick={resetAll}
              className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-primary"
            >
              Reset all
            </button>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-300",
                active
                  ? "border-primary bg-primary/15 text-primary glow-red scale-[1.02]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span>{c.emoji}</span>
              {c.label}
              <span className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-[10px]",
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
              )}>{counts[c.id] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Brand chips (sub-categories) */}
      {brandsForCat && (
        <div className="mt-3 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Brands</span>
          {brandsForCat.map((b) => {
            const active = brand === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setBrand(b.id)}
                className={cn(
                  "chip-pop inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                  active
                    ? "border-primary bg-primary/15 text-primary shadow-[0_0_18px_-6px_var(--color-primary)]"
                    : "border-border bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <b.Icon className="h-3.5 w-3.5" />
                {b.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Category banner */}
      {showBanner && (
        <div
          key={`${cat}-${brand}`}
          className="relative mt-6 overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 ck-pop"
        >
          <div
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r opacity-90", meta.tint)}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/40 bg-background/40 text-primary backdrop-blur">
                <meta.Icon className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{bannerTitle}</h2>
                  <span className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    {bannerCount} items
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{bannerDesc}</p>
              </div>
            </div>
            <button
              onClick={clearFilter}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              Clear filter <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{filtered.length}</span> products found
      </p>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-border bg-secondary/60">
            <Search className="h-7 w-7 text-muted-foreground" />
          </span>
          <h3 className="mt-4 font-display text-2xl uppercase">No products found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different category, brand or clear your filters.</p>
          <button
            onClick={clearFilter}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
          >
            Clear filter <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
