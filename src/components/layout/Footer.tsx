import { Link } from "@tanstack/react-router";
import { Facebook, MessageCircle, Mail, Zap, ShieldCheck, Award, Headphones, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 mt-24">
      {/* Trust bar */}
      <div className="border-b border-border/60">
        <div className="container-wide grid grid-cols-1 items-center gap-4 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Secure payments
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" fill="currentColor" strokeWidth={0} /> Instant delivery
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Warranty support
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" /> 24/7 support
            </span>
          </div>
          <a
            href="mailto:vintagestoresofficial@gmail.com"
            className="inline-flex items-center justify-center gap-2 justify-self-start rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground glow-red transition hover:brightness-110 md:justify-self-end"
          >
            Contact Support <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="container-wide grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5 fill-current" strokeWidth={0} />
            </div>
            <span className="font-display text-xl tracking-wider">
              VINTAGE<span className="text-primary">STORE</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Bangladesh's trusted source for gaming top-ups, subscriptions, gift cards & digital products.
          </p>
          <div className="mt-5 flex gap-2">
            <a className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground" href="#"><Facebook className="h-4 w-4" /></a>
            <a className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground" href="#"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>

        <FooterCol title="Shop" links={[
          { label: "All Products", to: "/shop" },
          { label: "Steam", to: "/shop" },
          { label: "Fortnite", to: "/shop" },
          { label: "Genshin Impact", to: "/shop" },
          { label: "PlayStation", to: "/shop" },
          { label: "Top-Up", to: "/top-up" },
          { label: "Subscriptions", to: "/subscriptions" },
        ]} />

        <FooterCol title="Links" links={[
          { label: "Browse Shop", to: "/shop" },
          { label: "Blog & Guides", to: "/shop" },
          { label: "My Cart", to: "/cart" },
          { label: "My Orders", to: "/shop" },
          { label: "Sign In", to: "/shop" },
          { label: "My Account", to: "/shop" },
        ]} />

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact</h4>
          <a href="mailto:vintagestoresofficial@gmail.com" className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
            <Mail className="h-4 w-4 text-primary" />
            vintagestoresofficial@gmail.com
          </a>
          <p className="mt-4 text-xs text-muted-foreground">24/7 support · Instant delivery</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5">
        <div className="container-wide text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VintageStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary">
              <span className="text-primary">⚡</span>{l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
