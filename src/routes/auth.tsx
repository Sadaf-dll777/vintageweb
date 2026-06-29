import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Zap, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — VintageStore" },
      { name: "description", content: "Sign in or create your VintageStore account to shop gaming gift cards, top-ups and subscriptions." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirectTo = (search.redirect && search.redirect.startsWith("/")) ? search.redirect : "/profile";
  const isAdminLogin = redirectTo.startsWith("/admin");

  const isSignIn = mode === "signin";

  // If already signed in (or session arrives after OAuth), bounce to destination.
  useEffect(() => {
    if (!user) return;
    (async () => {
      let dest = redirectTo;
      if (dest === "/profile") {
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", auth.user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (data) dest = "/admin";
        }
      }
      navigate({ to: dest });
    })();
  }, [user, navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
      }
      // onAuthStateChange will populate user → effect navigates.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      if (search.redirect) {
        window.sessionStorage.setItem("vs-auth-redirect", search.redirect);
      }

      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) throw result.error;
      if (result.redirected) return;

      navigate({ to: redirectTo });
      // Browser will navigate to Google; nothing else to do.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  }

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

      <div className="container-wide flex min-h-screen items-center justify-center py-16">
        <div
          key={mode}
          className="auth-card-in w-full max-w-md rounded-2xl border border-border/60 bg-card/60 p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-10"
        >
          {/* Icon badge */}
          <div
            className="auth-row-in mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary glow-red"
            style={{ animationDelay: "0ms" }}
          >
            {isAdminLogin ? <ShieldCheck className="h-6 w-6" /> : isSignIn ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>

          {/* Heading */}
          <h1
            className="auth-row-in mt-5 text-center font-display text-4xl tracking-wide"
            style={{ animationDelay: "80ms" }}
          >
            {isAdminLogin ? "Admin Sign In" : isSignIn ? "Welcome Back" : "Create Account"}
          </h1>
          <p
            className="auth-row-in mt-2 text-center text-sm text-muted-foreground"
            style={{ animationDelay: "140ms" }}
          >
            {isAdminLogin
              ? "Sign in with your administrator account"
              : isSignIn
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

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="auth-row-in mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold tracking-wide transition-all hover:bg-background hover:-translate-y-0.5 disabled:opacity-60"
            style={{ animationDelay: "180ms" }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.5-.2-3-.5-4.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16 4.5 9.1 9 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45.5c5.4 0 10.3-2 14-5.3l-6.5-5.3c-2 1.4-4.6 2.2-7.5 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9 41 16 45.5 24 45.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.5 5.3C41.8 35.4 44.5 30.6 44.5 25c0-1.5-.2-3-.5-4.5z"/>
            </svg>
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="auth-row-in my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground" style={{ animationDelay: "200ms" }}>
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
            {!isSignIn && !isAdminLogin && (
              <Field label="Display Name" delay={260}>
                <InputWithIcon icon={<User className="h-4 w-4" />} placeholder="Your name" value={name} onChange={setName} />
              </Field>
            )}

            <Field label="Email" delay={!isSignIn ? 320 : 220}>
              <InputWithIcon
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />
            </Field>

            <Field label="Password" delay={!isSignIn ? 380 : 280}>
              <InputWithIcon
                icon={<Lock className="h-4 w-4" />}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
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

            {error && (
              <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ animationDelay: `${!isSignIn ? 440 : 340}ms` }}
              className="auth-row-in group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold tracking-widest text-primary-foreground glow-red transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-70"
            >
              {loading ? "PLEASE WAIT…" : isSignIn ? "SIGN IN" : "CREATE ACCOUNT"}
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
            {isSignIn && !isAdminLogin && (
              <button type="button" className="text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            )}
            {!isAdminLogin && <div className={cn(!isSignIn && "pt-1")}>
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
            </div>}
          </div>

          {!isAdminLogin && <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to store
            </Link>
          </div>}
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
  value,
  onChange,
}: {
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="group relative flex items-center rounded-xl border border-border bg-input/40 transition-all focus-within:border-primary/60 focus-within:bg-input/60 focus-within:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]">
      <span className="pl-3.5 text-muted-foreground">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
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