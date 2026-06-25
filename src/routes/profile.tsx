import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/store";
import { api, type ApiOrder } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Package,
  Key,
  Star,
  Wallet,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  Clock as ClockIcon,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Lock,
  Mail,
  Save,
  ExternalLink,
  ArrowLeft,
  Send,
  MessageSquare,
  Hash,
  Calendar,
  CreditCard,
  FileText,
  Phone,
} from "lucide-react";

type TabId = "orders" | "keys" | "reviews" | "credits" | "profile" | "settings";

const STEP_LABELS = ["Order Placed", "Payment Review", "Payment Verified", "Processing", "Completed"];
function activeStep(s: ApiOrder["status"]): number {
  switch (s) {
    case "review": return 1;
    case "verified": return 2;
    case "processing": return 3;
    case "completed": return 4;
    default: return -1;
  }
}
function statusLabel(s: ApiOrder["status"]) {
  return s === "review" ? "PAYMENT REVIEW" : s.toUpperCase();
}

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Dashboard — VintageStore" },
      { name: "description", content: "Manage your orders, keys, reviews, credits and profile." },
    ],
  }),
  component: DashboardPage,
});

const fmtId = (s: string) => `#${s.slice(0, 8)}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function DashboardPage() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("orders");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const ordersQ = useQuery({ queryKey: ["my-orders"], queryFn: api.listOrders, refetchInterval: 4000 });
  const orders = useMemo(
    () => (ordersQ.data ?? []).filter((o) => user && o.user_email && o.user_email === user.email.toLowerCase()),
    [ordersQ.data, user],
  );

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);
  if (!user) return null;

  const completedCount = orders.filter((o) => o.status === "completed").length;
  const deliveredOrders = orders.filter((o) => (o.delivered_key ?? "").trim().length > 0);
  const keysCount = deliveredOrders.length;
  const reviewsPending = completedCount; // simple: all completed orders can be reviewed
  const openOrder = orders.find((o) => o.id === openOrderId) ?? null;

  const tabs: { id: TabId; label: string; icon: typeof Package; badge?: number }[] = [
    { id: "orders", label: "Orders", icon: Package, badge: orders.length },
    { id: "keys", label: "My Keys", icon: Key, badge: keysCount },
    { id: "reviews", label: "Reviews", icon: Star, badge: reviewsPending },
    { id: "credits", label: "Credits", icon: Wallet },
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="container-wide py-8">
      {/* Welcome — hidden when viewing a specific order so the page focuses on the stepper */}
      {!openOrder && (
        <div className="dash-fade-in">
          <h1 className="font-display text-4xl tracking-wide">
            Welcome back, <span className="text-primary">{user.displayName || user.email}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your orders and digital items</p>
        </div>
      )}

      {/* Stat row */}
      {!openOrder && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Package className="h-4 w-4" />} label="TOTAL ORDERS" value={orders.length} />
          <StatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="COMPLETED" value={completedCount} accent="emerald" />
          <StatCard icon={<Key className="h-4 w-4" />} label="KEYS RECEIVED" value={keysCount} />
        </div>
      )}

      {/* Body */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-border/60 bg-card/40 p-3 backdrop-blur-xl">
          <nav className="space-y-1">
            {tabs.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setOpenOrderId(null); }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                    active
                      ? "border border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_-4px_var(--color-primary),inset_0_0_14px_-4px_var(--color-primary)]"
                      : "border border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left font-medium">{t.label}</span>
                  {typeof t.badge === "number" && t.badge > 0 && (
                    <span className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                    )}>{t.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 space-y-2 rounded-xl border border-border/40 bg-background/40 p-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              All purchases are securely stored
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-3.5 w-3.5 text-primary" />
              Access your items anytime
            </div>
          </div>

          <button
            onClick={() => { signOut(); navigate({ to: "/" }); }}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Tab content */}
        <section key={openOrderId ?? tab} className="dash-fade-in min-h-[400px]">
          {openOrder ? (
            <OrderDetail order={openOrder} onBack={() => setOpenOrderId(null)} />
          ) : (
            <>
              {tab === "orders" && <OrdersTab orders={orders} onOpen={(id) => setOpenOrderId(id)} />}
              {tab === "keys" && <KeysTab orders={deliveredOrders} />}
              {tab === "reviews" && <ReviewsTab orders={orders} />}
          {tab === "credits" && <CreditsTab />}
          {tab === "profile" && <ProfileTab />}
          {tab === "settings" && <SettingsTab onSignOut={() => { signOut(); navigate({ to: "/" }); }} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------- Components ----------
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: "emerald" }) {
  return (
    <div className={cn(
      "rounded-2xl border bg-card/40 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5",
      accent === "emerald"
        ? "border-emerald-500/30 shadow-[0_0_24px_-12px_rgba(16,185,129,0.5)]"
        : "border-border/60",
    )}>
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-4xl">{value}</div>
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl sm:p-6", className)}>{children}</div>
  );
}

function StatusBadge({ status }: { status: ApiOrder["status"] | "assigned" }) {
  const map = {
    completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    processing: "border-primary/40 bg-primary/10 text-primary",
    verified: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    review: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
    assigned: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  } as Record<string, string>;
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", map[status] ?? "border-border")}>
      {status === "review" ? "PAYMENT REVIEW" : status}
    </span>
  );
}

function OrdersTab({ orders, onOpen }: { orders: ApiOrder[]; onOpen: (id: string) => void }) {
  if (orders.length === 0) {
    return (
      <Panel>
        <div className="grid place-items-center gap-2 py-12 text-muted-foreground">
          <Package className="h-8 w-8 opacity-50" />
          <div className="text-sm">No orders yet. Place an order from the shop.</div>
        </div>
      </Panel>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((o, i) => (
        <button
          key={o.id}
          onClick={() => onOpen(o.id)}
          style={{ animationDelay: `${i * 60}ms` }}
          className="dash-row-in group flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 text-left backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-card/60"
        >
          {o.items[0]?.image_url && (
            <img src={o.items[0].image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-sm font-semibold">
                {o.items[0]?.name ?? "Order"}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {fmtId(o.id)} • {fmtDate(o.created_at)} • {o.payment_method}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">৳{Number(o.total_bdt).toFixed(0)} BDT</div>
            <div className="text-[10px] text-muted-foreground">${Number(o.total_usd).toFixed(2)}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </button>
      ))}
    </div>
  );
}

function KeysTab({ orders }: { orders: ApiOrder[] }) {
  if (orders.length === 0) {
    return (
      <Panel>
        <div className="grid place-items-center gap-2 py-12 text-muted-foreground">
          <Key className="h-8 w-8 opacity-50" />
          <div className="text-sm">No keys yet. Once we deliver an order, your credentials appear here.</div>
        </div>
      </Panel>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o, i) => (
        <KeyCard key={o.id} order={o} delay={i * 80} />
      ))}
    </div>
  );
}

function KeyCard({ order, delay }: { order: ApiOrder; delay: number }) {
  const [copied, setCopied] = useState(false);
  const product = order.items[0];
  const label = order.key_redeem_label || product?.name?.split(" ").slice(0, 2).join(" ") || "Redeem";
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="dash-row-in rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        {product?.image_url && <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
        <div className="flex-1">
          <div className="text-sm font-semibold">{product?.name ?? "Order"}</div>
          <div className="text-[11px] text-muted-foreground">Delivered {fmtDate(order.created_at)}</div>
        </div>
        <StatusBadge status="assigned" />
      </div>

      <div className="mt-4 text-[10px] font-bold tracking-widest text-muted-foreground">ACCOUNT CREDENTIALS</div>
      <div className="mt-1 flex items-start gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3">
        <code className="flex-1 break-all font-mono text-xs leading-relaxed text-primary">{order.delivered_key}</code>
        <button
          onClick={() => { navigator.clipboard.writeText(order.delivered_key ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-primary hover:bg-primary/10"
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {order.key_instructions && (
        <>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
            <ExternalLink className="h-3 w-3" /> How to Redeem — {label}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{order.key_instructions}</div>
        </>
      )}
    </div>
  );
}

function ReviewsTab({ orders }: { orders: ApiOrder[] }) {
  const pending = orders.filter((o) => o.status === "completed");
  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
          <span className="text-primary">★</span> You have <span className="font-bold">{pending.length}</span> products waiting for your review. Your feedback helps other gamers!
        </div>
      )}
      {pending.map((o, i) => (
        <div
          key={o.id}
          style={{ animationDelay: `${i * 60}ms` }}
          className="dash-row-in flex items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 backdrop-blur-xl"
        >
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
            <Star className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{o.items[0]?.name ?? "Order"}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Purchased {fmtDate(o.created_at)}</div>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground glow-red hover:brightness-110">
            <Star className="h-3.5 w-3.5" /> Write Review
          </button>
        </div>
      ))}
    </div>
  );
}

function CreditsTab() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> BDT BALANCE
          </div>
          <div className="mt-1 font-display text-4xl">0 <span className="text-base text-muted-foreground">BDT</span></div>
        </Panel>
        <Panel>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" /> USD BALANCE
          </div>
          <div className="mt-1 font-display text-4xl">$0.00 <span className="text-base text-muted-foreground">USD</span></div>
        </Panel>
      </div>
      <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        <span className="text-primary">ⓘ</span> Store credits expire <span className="font-bold text-foreground">3 months</span> after being issued. Use them at checkout — credits are applied in the same currency as your order.
      </div>
      <Panel>
        <div className="text-sm font-semibold">Your Credits</div>
        <div className="mt-6 grid place-items-center gap-2 py-10 text-muted-foreground">
          <Wallet className="h-8 w-8 opacity-50" />
          <div className="text-sm">No store credits yet</div>
        </div>
      </Panel>
    </div>
  );
}

function ProfileTab() {
  const user = useAuth((s) => s.user)!;
  const updateProfile = useAuth((s) => s.updateProfile);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [fullName, setFullName] = useState(user.bio ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <Panel>
      <h3 className="text-lg font-semibold">Edit Profile</h3>
      <p className="text-xs text-muted-foreground">Update your display info. This is visible on your reviews.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile({ displayName, phone, bio: fullName });
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
      >
        <DashField label="Email">
          <input value={user.email} disabled className="w-full bg-transparent px-3 py-2.5 text-sm text-muted-foreground outline-none" />
        </DashField>
        <DashField label="Display Name">
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" />
        </DashField>
        <DashField label="Full Name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" />
        </DashField>
        <DashField label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" />
        </DashField>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground glow-red hover:brightness-110"
        >
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </form>
    </Panel>
  );
}

function SettingsTab({ onSignOut }: { onSignOut: () => void }) {
  const user = useAuth((s) => s.user)!;
  return (
    <Panel>
      <h3 className="text-lg font-semibold">Account Settings</h3>
      <p className="text-xs text-muted-foreground">Manage your login credentials</p>

      <div className="mt-5 space-y-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-muted-foreground">Email</div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" /> {user.email}
          </div>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-muted-foreground">Password</div>
            <div className="mt-1 flex items-center gap-2 text-sm tracking-widest">
              <Lock className="h-4 w-4 text-muted-foreground" /> ••••••••
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3.5 py-2 text-xs font-bold text-foreground hover:bg-secondary">
            <Lock className="h-3.5 w-3.5" /> Change Password
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/20"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </Panel>
  );
}

function DashField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="rounded-xl border border-border bg-input/40 transition-all focus-within:border-primary/60 focus-within:bg-input/60 focus-within:shadow-[0_0_0_4px_oklch(0.62_0.22_25_/_0.12)]">
        {children}
      </div>
    </div>
  );
}

// ---------- Order Detail screen (matches screenshots) ----------
function OrderDetail({ order, onBack }: { order: ApiOrder; onBack: () => void }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const sendNote = useMutation({
    mutationFn: (text: string) => api.appendOrderNote(order.id, { from: "customer", text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-orders"] }),
  });
  const step = activeStep(order.status);
  const completed = order.status === "completed";

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      {/* Hero status banner */}
      <div className={cn(
        "rounded-2xl border p-8 text-center backdrop-blur-xl",
        completed
          ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent shadow-[0_0_60px_-20px_rgba(16,185,129,0.5)]"
          : "border-border/60 bg-card/40",
      )}>
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> {statusLabel(order.status)}
        </div>
        <div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
          {completed ? <CheckCircle2 className="h-10 w-10" /> : <ClockIcon className="h-10 w-10" />}
        </div>
        <h2 className="mt-5 font-display text-3xl tracking-wide">
          {completed ? "Your order has been delivered" :
           order.status === "processing" ? "We're preparing your delivery" :
           order.status === "verified" ? "Payment verified — processing soon" :
           order.status === "cancelled" ? "Order cancelled" :
           "Payment is being reviewed"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {completed ? "All items have been delivered. Enjoy!" :
           order.status === "cancelled" ? "If this is a mistake, message us in the order notes below." :
           "We'll update this screen the moment the next step completes."}
        </p>
      </div>

      {/* Stepper */}
      <Panel>
        <div className="flex items-center justify-between gap-2">
          {STEP_LABELS.map((lbl, i) => {
            const done = completed || i < step || (i === step && order.status !== "review");
            const active = i === step && !completed;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full items-center">
                  {i > 0 && (
                    <span className={cn("absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2", (done || i <= step) ? "bg-primary" : "bg-border")} />
                  )}
                  {i < STEP_LABELS.length - 1 && (
                    <span className={cn("absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2", (completed || i < step) ? "bg-primary" : "bg-border")} />
                  )}
                  <div className={cn(
                    "relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full text-xs font-bold",
                    done ? "bg-primary text-primary-foreground shadow-[0_0_20px_-4px_var(--color-primary)]" :
                    active ? "border-2 border-primary bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground",
                  )}>
                    {done ? <Check className="h-5 w-5" /> : i + 1}
                  </div>
                </div>
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{lbl}</div>
              </div>
            );
          })}
        </div>
        {completed && (
          <div className="mt-5 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-300">
            ✅ Order complete — all steps finished!
          </div>
        )}
      </Panel>

      {/* Items + Sidebar */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ordered Items</div>
          <ul className="space-y-3">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
                {it.image_url && <img src={it.image_url} className="h-14 w-14 rounded-lg object-cover" alt="" />}
                <div className="flex-1">
                  <div className="text-sm font-semibold">{it.name}{it.variant ? ` — ${it.variant}` : ""}</div>
                  <div className="text-xs text-muted-foreground">Quantity: {it.qty}</div>
                </div>
                <div className="font-display text-lg">৳{Number(it.price_bdt ?? (Number(it.price_usd) || 0) * 120).toFixed(0)} BDT</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="space-y-4 text-sm">
          <SidebarRow icon={<Hash className="h-4 w-4" />} label="Order ID" value={order.id.slice(0, 8).toUpperCase()} mono />
          <SidebarRow icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Status">
            <StatusBadge status={order.status} />
          </SidebarRow>
          <SidebarRow icon={<Calendar className="h-4 w-4" />} label="Order Date" value={fmtDate(order.created_at)} />
          <SidebarRow icon={<CreditCard className="h-4 w-4" />} label="Payment" value={order.payment_method} />
          {order.transaction_id && (
            <SidebarRow icon={<FileText className="h-4 w-4" />} label="Transaction ID" value={order.transaction_id} mono />
          )}
          {order.sender_number && (
            <SidebarRow icon={<Phone className="h-4 w-4" />} label="Sender Number" value={order.sender_number} />
          )}
          <div className="my-2 h-px bg-border/60" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-display text-foreground">৳{Number(order.total_bdt).toFixed(0)} BDT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold">Total Paid</span>
            <span className="font-display text-2xl text-primary">৳{Number(order.total_bdt).toFixed(0)} BDT</span>
          </div>
        </Panel>
      </div>

      {/* Order notes thread */}
      <Panel>
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <MessageSquare className="h-4 w-4" /> Order Notes
        </div>
        <div className="space-y-2">
          {(order.notes_thread ?? []).length === 0 && (
            <p className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
              No messages yet. Reach out to support here for anything about this order.
            </p>
          )}
          {(order.notes_thread ?? []).map((n, i) => (
            <div key={i} className={cn(
              "rounded-xl border p-3 text-sm",
              n.from === "support" ? "border-primary/30 bg-primary/5" : "border-border bg-background/40",
            )}>
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>{n.from === "support" ? "Support" : "You"}</span>
                <span>{new Date(n.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="whitespace-pre-wrap">{n.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && note.trim()) {
                sendNote.mutate(note.trim());
                setNote("");
              }
            }}
            placeholder="Type a reply..."
            className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={!note.trim()}
            onClick={() => { if (note.trim()) { sendNote.mutate(note.trim()); setNote(""); } }}
            className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground glow-red disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </Panel>
    </div>
  );
}

function SidebarRow({ icon, label, value, children, mono }: { icon: React.ReactNode; label: string; value?: string; children?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        {value !== undefined ? (
          <div className={cn("mt-0.5 truncate text-sm font-semibold", mono && "font-mono")}>{value}</div>
        ) : (
          <div className="mt-1">{children}</div>
        )}
      </div>
    </div>
  );
}