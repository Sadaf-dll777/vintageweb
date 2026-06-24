import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const REVIEWS = [
  { name: "Rakib H.", text: "He is lil bit slow but he always one of the best guy.", stars: 5 },
  { name: "Sadia A.", text: "Service was a bit slow, took a day to receive my codes and with no email confirmation, but in the end I got what I wanted and for great prices.", stars: 5 },
  { name: "Tanvir M.", text: "good pricing with best delivery system", stars: 5 },
  { name: "Nayeem R.", text: "Smooth checkout, instant delivery on PUBG UC. Highly recommend!", stars: 5 },
  { name: "Sumaiya K.", text: "Best place for Netflix subs in BD. Fair price, no hassle.", stars: 5 },
  { name: "Imran F.", text: "Used bKash to pay, got my Steam key in 10 minutes. Legit shop.", stars: 5 },
];

export function Reviews() {
  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    onSelect();
  }, [embla, onSelect]);

  return (
    <section className="container-wide py-20">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold">
          ⚡ Reviews
        </span>
        <h2 className="mt-3 font-display text-4xl uppercase sm:text-5xl">
          What <span className="text-gold">Gamers</span> Say
        </h2>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {REVIEWS.map((r, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full px-3 sm:basis-1/2 lg:basis-1/3">
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </div>
                <p className="flex-1 text-sm italic text-muted-foreground">"{r.text}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 font-display text-sm text-primary">
                    {r.name.charAt(0)}
                  </span>
                  <div>
                    <div className="font-display text-sm tracking-wide">Verified Buyer</div>
                    <div className="text-xs text-muted-foreground">{r.name}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => embla?.scrollPrev()}
          aria-label="Previous"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {snaps.map((_, i) => (
            <button
              key={i}
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === selected ? "w-10 bg-gold" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => embla?.scrollNext()}
          aria-label="Next"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition hover:border-primary hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}