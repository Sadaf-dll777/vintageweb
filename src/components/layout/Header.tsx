import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, Zap, User, Clock, TrendingUp, X, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShop, useAuth } from "@/lib/store";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const user = useAuth((s) => s.user);
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const quickRef = useRef<HTMLDivElement>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [path]);
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
          <span className="font-display text-lg tracking-wider sm:text-xl">
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
                  "group relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:[text-shadow:0_0_18px_rgba(255,40,90,0.45)]",
                  active
                    ? "text-[#ff2c5f] [text-shadow:0_0_18px_rgba(255,40,90,0.45)]"
                    : "text-foreground/80 hover:text-[#ff2c5f]",
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
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block"><ThemeToggle /></div>
          <div className="relative hidden items-center rounded-full border border-border/80 bg-card/80 p-0.5 text-xs font-bold backdrop-blur sm:flex shadow-[inset_0_1px_0_oklch(1_0_0_/_0.04)]">
            {/* Soft glow that crossfades color with the active currency */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full blur-sm opacity-30 transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                currency === "BDT"
                  ? "left-0.5 bg-[oklch(0.78_0.18_150_/_0.35)]"
                  : "left-[calc(50%+0px)] bg-[oklch(0.85_0.16_85_/_0.35)]",
              )}
            />
            <span
              aria-hidden
              className={cn(
                "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                currency === "BDT"
                  ? "left-0.5 bg-[linear-gradient(135deg,oklch(0.78_0.18_150),oklch(0.62_0.20_160))] shadow-[0_3px_10px_-4px_oklch(0.7_0.18_150_/_0.35)]"
                  : "left-[calc(50%+0px)] bg-[linear-gradient(135deg,oklch(0.85_0.16_85),oklch(0.7_0.18_60))] shadow-[0_3px_10px_-4px_oklch(0.82_0.16_85_/_0.4)]",
              )}
            />
            <button
              onClick={() => setCurrency("BDT")}
              className={cn(
                "relative z-10 rounded-full px-2 py-1.5 text-xs font-bold tracking-wide transition-all duration-300",
                currency === "BDT"
                  ? "text-background scale-105"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              BDT
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={cn(
                "relative z-10 rounded-full px-2 py-1.5 text-xs font-bold tracking-wide transition-all duration-300",
                currency === "USD"
                  ? "text-background scale-105"
                  : "text-muted-foreground hover:text-foreground",
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
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-sm font-semibold text-primary hover:bg-primary/20 sm:px-3 sm:py-1.5"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden max-w-[120px] truncate sm:inline">{user.displayName || user.email}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground glow-red hover:brightness-110 sm:flex"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
          )}
          {!user && (
            <Link
              to="/auth"
              aria-label="Sign in"
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground glow-red sm:hidden"
            >
              <User className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>

    {/* Mobile menu drawer */}
    {mobileOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div
          className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <aside className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col border-l border-border/60 bg-background shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground glow-red">
                <Zap className="h-5 w-5 fill-current" strokeWidth={0} />
              </div>
              <span className="font-display text-lg tracking-wider">
                VINTAGE<span className="text-primary">STORE</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {navItems.map((n) => {
              const active = path === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block border-b border-border/40 px-4 py-4 text-base transition-colors",
                    active ? "text-primary" : "text-foreground/85 hover:text-primary",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
            <div className="mt-6 flex items-center gap-3 px-4">
              <ThemeToggle />
              <div className="relative flex items-center rounded-full border border-border/80 bg-card/80 p-0.5 text-xs font-bold shadow-[inset_0_1px_0_oklch(1_0_0_/_0.04)]">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    currency === "BDT"
                      ? "left-0.5 bg-[linear-gradient(135deg,oklch(0.78_0.18_150),oklch(0.62_0.20_160))] shadow-[0_3px_10px_-4px_oklch(0.7_0.18_150_/_0.35)]"
                      : "left-[calc(50%+0px)] bg-[linear-gradient(135deg,oklch(0.85_0.16_85),oklch(0.7_0.18_60))] shadow-[0_3px_10px_-4px_oklch(0.82_0.16_85_/_0.4)]",
                  )}
                />
                <button
                  onClick={() => setCurrency("BDT")}
                  className={cn(
                    "relative z-10 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition-all",
                    currency === "BDT" ? "text-background" : "text-muted-foreground",
                  )}
                >BDT</button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={cn(
                    "relative z-10 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition-all",
                    currency === "USD" ? "text-background" : "text-muted-foreground",
                  )}
                >USD</button>
              </div>
            </div>
          </nav>
        </aside>
      </div>
    )}

    {/* Search row — not sticky, scrolls away with the page */}
    {path === "/" && (
    <div ref={wrapRef} className="bg-background/80 backdrop-blur-xl">
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
    )}
    </>
  );
}
