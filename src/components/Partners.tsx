const PAY = ["bKash", "Nagad", "Rocket", "Upay", "Binance"];
const PLATFORMS = ["Steam", "PlayStation", "Xbox", "Epic Games", "Nintendo", "EA Play", "Riot Games", "Blizzard"];

export function Partners() {
  return (
    <section className="container-wide py-16">
      <div className="mb-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Payment Partners & Platforms We Support
        </div>
      </div>
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap justify-center gap-3">
        {PAY.map((p) => (
          <span
            key={p}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold tracking-wide text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            · {p}
          </span>
        ))}
      </div>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
        {PLATFORMS.map((p) => (
          <span
            key={p}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold tracking-wide text-muted-foreground transition hover:border-gold hover:text-gold"
          >
            · {p}
          </span>
        ))}
      </div>
    </section>
  );
}