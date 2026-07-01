import { Link } from "@tanstack/react-router";
import { Mail, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 mt-24">
      <div className="container-wide grid grid-cols-1 gap-10 py-14 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5 fill-current" strokeWidth={0} />
            </div>
            <span className="font-display text-xl font-light tracking-wider">
              VINTAGE<span className="text-primary">STORE</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Bangladesh's trusted source for gaming top-ups, subscriptions, gift cards & digital products.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="https://www.facebook.com/profile.php?id=61579235810448"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 ease-out hover:border-primary hover:text-primary hover:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.15),0_8px_24px_-6px_oklch(0.62_0.22_25_/_0.45)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://discord.gg/ZNmUY3S6P7"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 ease-out hover:border-primary hover:text-primary hover:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.15),0_8px_24px_-6px_oklch(0.62_0.22_25_/_0.45)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
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
