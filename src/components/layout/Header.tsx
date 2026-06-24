import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, Zap, User } from "lucide-react";
import { useShop } from "@/lib/store";
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

  return (
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
          <button className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">
            <Search className="h-4 w-4" />
          </button>
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
  );
}
