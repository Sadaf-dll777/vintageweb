import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — VintageStore" }] }),
  component: SubsPage,
});

function SubsPage() {
  const list = products.filter((p) => p.category === "subscriptions");
  return (
    <div
      className="container-wide py-12 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(196,0,64,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(196,0,64,0.08) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <span className="text-xs font-bold uppercase tracking-widest text-primary">⚡ Category</span>
      <h1 className="mt-3 font-display text-5xl uppercase sm:text-6xl">Subscriptions</h1>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
