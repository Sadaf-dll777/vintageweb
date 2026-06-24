import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, Zap, Shield, MessageCircle, ArrowRight } from "lucide-react";
import { formatPrice, useShop } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — VintageStore" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, currency } = useShop();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="container-wide py-12">
      <h1 className="font-display text-5xl uppercase">Your Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link to="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Browse Shop</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.product.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <img src={i.product.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base">{i.product.name}</h3>
                    <div className="text-sm text-primary">{formatPrice(i.product.price, currency)} <span className="text-muted-foreground">/ each</span></div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background p-1">
                    <button onClick={() => setQty(i.product.id, i.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                    <button onClick={() => setQty(i.product.id, i.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="hidden w-24 text-right font-display text-lg text-foreground sm:block">
                    {formatPrice(i.product.price * i.qty, currency)}
                  </div>
                  <button onClick={() => remove(i.product.id)} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Fast Delivery</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Secure Payment</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-primary" /> 24/7 Support</span>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <input placeholder="COUPON CODE" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase tracking-wider outline-none placeholder:text-muted-foreground/60" />
            <button className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background">Apply</button>
          </div>
          <div className="mt-5 flex justify-between border-t border-border pt-5 text-sm">
            <span className="text-muted-foreground">Subtotal ({count} items)</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
            <span className="text-base">Total</span>
            <span className="font-display text-3xl text-primary">{formatPrice(subtotal, currency)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-base uppercase tracking-wider text-primary-foreground glow-red hover:brightness-110"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            <Zap className="mr-1 inline h-3 w-3 text-primary" />
            Fast checkout • Instant processing after payment
          </p>
        </aside>
      </div>
    </div>
  );
}
