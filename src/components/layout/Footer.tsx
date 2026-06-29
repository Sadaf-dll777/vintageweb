import { Link } from "@tanstack/react-router";
import { Facebook, Mail, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 mt-24">
      <div className="container-wide grid grid-cols-1 gap-10 py-14 md:grid-cols-3">
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
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_8px_24px_-6px_oklch(0.62_0.22_25_/_0.6)]"
            >
              <Facebook className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            </a>
            <a
              href="#"
              aria-label="Discord"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_8px_24px_-6px_oklch(0.62_0.22_25_/_0.6)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a14.5 14.5 0 0 0-.69 1.418 18.27 18.27 0 0 0-5.736 0A14.5 14.5 0 0 0 9.442 3a19.74 19.74 0 0 0-3.76 1.369C2.21 9.58 1.27 14.65 1.74 19.65a19.92 19.92 0 0 0 6.06 3.07c.49-.66.92-1.36 1.29-2.1-.71-.27-1.39-.6-2.04-.99.17-.13.34-.26.5-.4a14.23 14.23 0 0 0 12.82 0c.16.14.33.27.5.4-.65.39-1.33.73-2.04 1 .37.74.8 1.43 1.29 2.09a19.9 19.9 0 0 0 6.06-3.07c.55-5.81-.94-10.84-3.86-15.28ZM8.52 16.36c-1.2 0-2.18-1.1-2.18-2.45 0-1.35.96-2.46 2.18-2.46 1.22 0 2.2 1.11 2.18 2.46 0 1.35-.97 2.45-2.18 2.45Zm6.96 0c-1.2 0-2.18-1.1-2.18-2.45 0-1.35.96-2.46 2.18-2.46 1.22 0 2.2 1.11 2.18 2.46 0 1.35-.96 2.45-2.18 2.45Z"/>
              </svg>
            </a>
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
        ]} bulleted />

        <div>
          <FooterCol title="Links" links={[
            { label: "Browse Shop", to: "/shop" },
            { label: "Blog & Guides", to: "/shop" },
            { label: "My Cart", to: "/cart" },
            { label: "My Orders", to: "/profile" },
            { label: "My Account", to: "/profile" },
          ]} />
          <a href="mailto:vintagestoresofficial@gmail.com" className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Mail className="h-4 w-4 text-primary" />
            vintagestoresofficial@gmail.com
          </a>
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

function FooterCol({ title, links, bulleted }: { title: string; links: { label: string; to: string }[]; bulleted?: boolean }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary">
              {bulleted && <Zap className="h-3.5 w-3.5 text-primary fill-current" strokeWidth={0} />}
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
