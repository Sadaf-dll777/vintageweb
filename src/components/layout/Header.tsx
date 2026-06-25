import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, Zap, User, Clock, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShop } from "@/lib/store";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/top-up", label: "Top-Up" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/gift-cards", label: "Gift Cards" },
];

export function Header() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { items, currency, setCurrency } = useShop();
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const quickRef = useRef<HTMLDivElement>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<string[]>([
    "Discord Nitro Premium Subscription",
    "Spotify Family Join Premium Subscription",
  ]);
  const trending = ["steam", "visa", "Discord Nitro Premium Subscription", "chat", "steam region", "spotify"];
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchFocused) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSearchFocused(false); inputRef.current?.blur(); } };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchFocused]);

  useEffect(() => {
    if (!quickOpen) return;
    const onClick = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setQuickOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [quickOpen]);

  const quickResults = quickQuery.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(quickQuery.trim().toLowerCase())).slice(0, 6)
    : [];

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground glow-red">
            <Zap className="h-5 w-5 fill-current" strokeWidth={0} />
          </div>
          <span className="font-display text-xl tracking-wider">
            VINTAGE<span className="text-primary">STORE</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="mx-auto hidden items-center gap-1 rounded-full border border-border/60 bg-card/40 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:flex">
          {navItems.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                  active ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                {/* glowing red pill — visible on active + hover */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 rounded-full border transition-all duration-300 ease-out",
                    active
                      ? "scale-100 border-primary/60 bg-primary/15 opacity-100 shadow-[0_0_20px_-2px_var(--color-primary),inset_0_0_12px_-4px_var(--color-primary)]"
                      : "scale-90 border-transparent bg-primary/0 opacity-0 group-hover:scale-100 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:opacity-100 group-hover:shadow-[0_0_18px_-4px_var(--color-primary),inset_0_0_10px_-4px_var(--color-primary)]",
                  )}
                />
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-border bg-card p-0.5 text-xs font-bold sm:flex">
            <button
              onClick={() => setCurrency("BDT")}
              className={cn(
                "rounded-full px-3 py-1 transition",
                currency === "BDT" ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              BDT
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={cn(
                "rounded-full px-3 py-1 transition",
                currency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              USD
            </button>
          </div>
          <div ref={quickRef} className="relative">
            <button
              onClick={() => {
                setQuickOpen((v) => !v);
                setTimeout(() => quickInputRef.current?.focus(), 50);
              }}
              aria-label="Search"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border bg-card transition-colors",
                quickOpen
                  ? "border-primary/60 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Search className="h-4 w-4" />
            </button>

            {quickOpen && (
              <div className="search-drop absolute right-0 top-[calc(100%+10px)] z-50 w-[340px]">
                <div className="flex items-center rounded-2xl border border-primary/60 bg-card/90 px-4 py-3 shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12),0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  <input
                    ref={quickInputRef}
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {quickQuery && (
                    <button
                      onClick={() => setQuickQuery("")}
                      className="ml-2 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Clear"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {quickQuery.trim() && (
                  <div className="search-drop mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                    {quickResults.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">No products found</div>
                    ) : (
                      <ul className="max-h-80 overflow-auto">
                        {quickResults.map((p) => (
                          <li key={p.id}>
                            <Link
                              to="/product/$slug"
                              params={{ slug: p.id }}
                              onClick={() => { setQuickOpen(false); setQuickQuery(""); }}
                              className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/60"
                            >
                              <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{p.name}</div>
                                <div className="text-xs text-muted-foreground">${p.price.toFixed(2)}</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/auth"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground glow-red hover:brightness-110"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      </div>
    </header>

    {/* Search row — not sticky, scrolls away with the page */}
    <div ref={wrapRef} className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-3">
          <div className="mx-auto max-w-2xl">
            <div
              className={cn(
                "relative flex items-center rounded-full border bg-card/60 transition-all duration-300",
                searchFocused
                  ? "border-primary/60 shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12),0_20px_60px_-20px_rgba(0,0,0,0.8)]"
                  : "border-border/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]",
              )}
            >
              <Search className={cn("ml-5 h-4 w-4 transition-colors", searchFocused ? "text-primary" : "text-muted-foreground")} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products..."
                className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="mr-4 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Clear"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown — opens on focus */}
            {searchFocused && (
              <div className="search-drop mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                {recent.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        RECENT
                      </div>
                      <button
                        onClick={() => setRecent([])}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r, i) => (
                        <button
                          key={r}
                          style={{ animationDelay: `${i * 40}ms` }}
                          onClick={() => setQuery(r)}
                          className="chip-pop rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground hover:border-primary/40 hover:bg-secondary"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={cn(recent.length > 0 && "mt-4")}>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    TRENDING NOW
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t, i) => (
                      <button
                        key={t}
                        style={{ animationDelay: `${i * 40 + 80}ms` }}
                        onClick={() => setQuery(t)}
                        className="chip-pop rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
