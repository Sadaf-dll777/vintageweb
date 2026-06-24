import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Zap, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — VintageStore" },
      { name: "description", content: "Sign in or create your VintageStore account to shop gaming gift cards, top-ups and subscriptions." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPw, setShowPw] = useState(false);

  const isSignIn = mode === "signin";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* radial glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, oklch(0.62 0.22 25 / 0.18), transparent 70%), radial-gradient(40% 40% at 80% 80%, oklch(0.62 0.22 25 / 0.08), transparent 70%)",
        }}
      />

      <div className="container-wide flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div
          key={mode}
          className="auth-card-in w-full max-w-md rounded-2xl border border-border/60 bg-card/60 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-10"
        >
          {/* Icon badge */}
          <div
            className="auth-row-in mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-red"
            style={{ animationDelay: "0ms" }}
          >
            {isSignIn ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>

          {/* Heading */}
          <h1
            className="auth-row-in mt-5 text-center font-display text-4xl tracking-wide"
            style={{ animationDelay: "80ms" }}
          >
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h1>
          <p
            className="auth-row-in mt-2 text-center text-sm text-muted-foreground"
            style={{ animationDelay: "140ms" }}
          >
            {isSignIn
              ? "Sign in to your VintageStore account"
              : "Join VintageStore for the best gaming deals"}
          </p>

          {/* Email warning for signup */}
          {!isSignIn && (
            <div
              className="auth-row-in mt-6 flex gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4"
              style={{ animationDelay: "200ms" }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div className="text-xs leading-relaxed">
                <div className="font-semibold text-gold">Use your real email address!</div>
                <p className="mt-1 text-muted-foreground">
                  We deliver products (license keys, gift cards, etc.) directly to your email.
                  Using a fake email means you won't receive your purchases.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {!isSignIn && (
              <Field label="Display Name" delay={260}>
                <InputWithIcon icon={<User className="h-4 w-4" />} placeholder="Your name" />
              </Field>
            )}

            <Field label="Email" delay={!isSignIn ? 320 : 220}>
              <InputWithIcon
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Password" delay={!isSignIn ? 380 : 280}>
              <InputWithIcon
                icon={<Lock className="h-4 w-4" />}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </Field>

            <button
              type="submit"
              style={{ animationDelay: `${!isSignIn ? 440 : 340}ms` }}
              className="auth-row-in group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold tracking-widest text-primary-foreground glow-red transition-all hover:brightness-110 hover:-translate-y-0.5"
            >
              {isSignIn ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Trust row */}
          <div
            className="auth-row-in mt-6 flex items-center justify-center gap-5 text-[11px] text-muted-foreground"
            style={{ animationDelay: `${!isSignIn ? 500 : 400}ms` }}
          >
            <TrustItem icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Secure" />
            <TrustItem icon={<Zap className="h-3.5 w-3.5" />} label="Instant Access" />
            <TrustItem icon={<Sparkles className="h-3.5 w-3.5" />} label="Encrypted" />
          </div>

          {/* Links */}
          <div
            className="auth-row-in mt-5 space-y-2 text-center text-sm"
            style={{ animationDelay: `${!isSignIn ? 560 : 460}ms` }}
          >
            {isSignIn && (
              <button type="button" className="text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            )}
            <div className={cn(!isSignIn && "pt-1")}>
              <span className="text-muted-foreground">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode(isSignIn ? "signup" : "signin")}
                className="font-semibold text-primary hover:underline"
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  delay,
  children,
}: {
  label: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-row-in" style={{ animationDelay: `${delay}ms` }}>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function InputWithIcon({
  icon,
  trailing,
  type = "text",
  placeholder,
}: {
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="group relative flex items-center rounded-xl border border-border bg-input/40 transition-all focus-within:border-primary/60 focus-within:bg-input/60 focus-within:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]">
      <span className="pl-3.5 text-muted-foreground">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/70"
      />
      {trailing && <span className="pr-3.5">{trailing}</span>}
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}