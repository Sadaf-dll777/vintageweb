import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/gift-cards")({
  head: () => ({ meta: [{ title: "Gift Cards — VintageStore" }] }),
  component: GCPage,
});

function GCPage() {
  const list = products.filter((p) => p.category === "gift-cards");
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
      <h1 className="mt-3 font-display text-5xl uppercase sm:text-6xl">Gift Cards</h1>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 8) * 0.06}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
