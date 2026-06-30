import netflixImg from "@/assets/netflix-premium.webp.asset.json";

export type Category = "top-up" | "subscriptions" | "gift-cards" | "accounts" | "games" | "software";

export interface ProductOption {
  label: string;
  price: number; // USD
  outOfStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // USD
  image: string;
  badge?: string;
  featured?: boolean;
  tagline?: string;
  description?: string;
  delivery?: string;
  rating?: number;
  reviews?: number;
  sold?: number;
  stock?: number;
  options?: ProductOption[];
  brand?: string;
  tags?: string[];
}

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80&${q}`;

export const products: Product[] = [
  {
    id: "fortnite-crew",
    name: "Fortnite Crew Pass Subscription",
    category: "subscriptions",
    price: 3.35,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    badge: "FEATURED",
    featured: true,
    tagline: "Experience the next level of gaming. Instant delivery available now.",
    delivery: "30min - 360mins",
  },
  {
    id: "netflix-premium",
    name: "Netflix Premium Subscription",
    category: "subscriptions",
    price: 4.99,
    image: netflixImg.url,
    featured: true,
    tagline: "Stream unlimited movies & series in 4K.",
    delivery: "30min - 360mins",
  },
  {
    id: "discord-nitro",
    name: "Discord Nitro Premium Subscription",
    category: "subscriptions",
    price: 5.5,
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    tagline: "HD streaming, custom emojis, bigger uploads.",
    delivery: "30min - 360mins",
  },
  {
    id: "razer-gold",
    name: "Razer Gold Gift Card Global Region",
    category: "gift-cards",
    price: 10,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
    delivery: "30min - 360mins",
  },
  {
    id: "steam-region-india",
    name: "Change Steam Region To India",
    category: "software",
    price: 2.5,
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
    badge: "FLASH -50%",
    delivery: "30min - 360mins",
  },
  {
    id: "xbox-gift-50",
    name: "Xbox Gift Card Turkey Region — 50 TL",
    category: "gift-cards",
    price: 1.6,
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=1200&q=80",
    delivery: "30min - 360mins",
  },
  {
    id: "pubg-uc-660",
    name: "PUBG Mobile 660 UC Top-Up",
    category: "top-up",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80",
    delivery: "Instant",
  },
  {
    id: "freefire-1080",
    name: "Free Fire 1080 Diamonds Top-Up",
    category: "top-up",
    price: 9.5,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    delivery: "Instant",
  },
  {
    id: "genshin-blessing",
    name: "Genshin Impact Blessing of the Welkin Moon",
    category: "top-up",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80",
    delivery: "30min - 360mins",
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium 3-Month Subscription",
    category: "subscriptions",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=1200&q=80",
    delivery: "Instant",
  },
  {
    id: "google-play-25",
    name: "Google Play Gift Card $25 (US)",
    category: "gift-cards",
    price: 25,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
    delivery: "Instant",
  },
  {
    id: "playstation-50",
    name: "PlayStation Store $50 Gift Card (US)",
    category: "gift-cards",
    price: 50,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
    delivery: "30min - 360mins",
  },
  {
    id: "valorant-points-1000",
    name: "Valorant 1000 VP Top-Up",
    category: "top-up",
    price: 10,
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=80",
    delivery: "30min - 360mins",
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium 1-Month",
    category: "subscriptions",
    price: 6.5,
    image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=1200&q=80",
    delivery: "Instant",
  },
  {
    id: "amazon-gc-25",
    name: "Amazon Gift Card $25 (US)",
    category: "gift-cards",
    price: 25,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    delivery: "Instant",
  },
];

export const categories: { id: Category | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🎯" },
  { id: "top-up", label: "Top-Up", emoji: "🎮" },
  { id: "subscriptions", label: "Subscriptions", emoji: "📺" },
  { id: "gift-cards", label: "Gift Cards", emoji: "🎁" },
  { id: "accounts", label: "Accounts", emoji: "👤" },
  { id: "games", label: "Games", emoji: "🕹️" },
  { id: "software", label: "Software", emoji: "💻" },
];
