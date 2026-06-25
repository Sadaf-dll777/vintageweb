/**
 * ============================================================
 *  SITE CONFIG — EDIT EVERYTHING FROM HERE
 * ============================================================
 *
 * This single file controls most of the editable text/numbers on the
 * website. When you move to your VPS later, each section below will map
 * cleanly to one API endpoint (the comments mark which one).
 *
 * Safe to edit by hand. Save the file → the site updates instantly in dev.
 *
 * Sections:
 *   1. brand           — site name, contact, currency rate
 *   2. payments        — bKash / Nagad / Rocket / Upay / Bank / Binance / Bybit
 *   3. reviews         — customer review carousel
 *   4. whyUs           — "Why Choose Us" features
 *   5. partners        — payment partners + platforms strip
 *
 * Products & categories live in `src/data/products.ts` (kept separate
 * because the file is longer).
 */

// ──────────────────────────────────────────────────────────────
// 1. BRAND  →  future: GET /api/site/brand
// ──────────────────────────────────────────────────────────────
export const brand = {
  name: "VintageStore",
  tagline: "Digital Marketplace for Gamers",
  /** USD → BDT conversion rate. Update when the market moves. */
  usdToBdt: 119,
};

// ──────────────────────────────────────────────────────────────
// 2. PAYMENTS  →  future: GET /api/site/payments
// ──────────────────────────────────────────────────────────────
// To add a new mobile wallet: copy one block, change id/name/number/logo/steps.
// To change a number/ID: just edit the `number` field.
// `logo` is an imported asset URL — add the image to src/assets first, then
// `import myLogo from "@/assets/my-logo.png.asset.json"` and use `myLogo.url`.

import bkashLogo from "@/assets/bkash.png.asset.json";
import nagadLogo from "@/assets/nagad.png.asset.json";
import rocketLogo from "@/assets/rocket.png.asset.json";
import upayLogo from "@/assets/upay.png.asset.json";
import bracBankLogo from "@/assets/brac-bank.png.asset.json";
import binanceLogo from "@/assets/binance.png.asset.json";
import bybitLogo from "@/assets/bybit.png.asset.json";

export interface PaymentProvider {
  id: string;
  name: string;
  number: string;
  color: string;
  logo: string;
  steps: string[];
}

export const mobileProviders: PaymentProvider[] = [
  {
    id: "bkash",
    name: "bKash",
    number: "01737784088",
    color: "#E2136E",
    logo: bkashLogo.url,
    steps: [
      "Open your bKash App",
      "Tap on Send Money or from Agent Choose Cash In",
      "Enter the number: 01737784088",
      "Enter exact amount",
      "Tap Next and confirm with your PIN",
      "Note down your Transaction ID (TxID)",
      "Enter the Transaction ID below to complete your order",
    ],
  },
  {
    id: "nagad",
    name: "Nagad",
    number: "01737784088",
    color: "#F47A1F",
    logo: nagadLogo.url,
    steps: [
      "Open Nagad App or dial *167#",
      "Choose Send Money",
      "Enter the number: 01737784088",
      "Enter exact amount",
      "Confirm with your PIN",
      "Note down the Transaction ID",
      "Enter it below",
    ],
  },
  {
    id: "rocket",
    name: "Rocket",
    number: "017377840880",
    color: "#8C3494",
    logo: rocketLogo.url,
    steps: [
      "Dial *322# or open Rocket App",
      "Choose Send Money",
      "Enter the number: 017377840880",
      "Enter exact amount",
      "Confirm with your PIN",
      "Copy the Transaction ID",
      "Enter it below",
    ],
  },
  {
    id: "upay",
    name: "Upay",
    number: "01737784088",
    color: "#E73C7E",
    logo: upayLogo.url,
    steps: [
      "Open Upay App",
      "Choose Send Money",
      "Enter the number: 01737784088",
      "Enter exact amount",
      "Confirm with your PIN",
      "Copy the Transaction ID",
      "Enter it below",
    ],
  },
];

export const bankProvider: PaymentProvider = {
  id: "bank",
  name: "Brac Bank",
  number: "1076776160001",
  color: "#0054A6",
  logo: bracBankLogo.url,
  steps: [
    "Log in to your online banking",
    "Choose Transfer / Send Money",
    "Account Number: 1076776160001",
    "Account Name: MD FARUQ HOSSAIN",
    "Bank: Brac Bank — Banpara Sub Branch",
    "Send exact amount in BDT",
    "Copy the Transaction Reference and enter it below",
  ],
};

/** Plain-text block shown in the bank-transfer "Copy details" button. */
export const bankDetailsText =
  "Bank: Brac Bank\nAccount Name: MD FARUQ HOSSAIN\nAccount Number: 1076776160001\nBranch: Banpara Sub Branch";

export const cryptoProviders: PaymentProvider[] = [
  {
    id: "binance",
    name: "Binance",
    number: "851074382",
    color: "#F0B90B",
    logo: binanceLogo.url,
    steps: [
      "Send via Binance Pay Option.",
      "Binance ID: 851074382",
      "Enter the Transaction ID below.",
    ],
  },
  {
    id: "bybit",
    name: "Bybit",
    number: "561054132",
    color: "#F7A600",
    logo: bybitLogo.url,
    steps: [
      "Send via Bybit Pay",
      "Bybit Pay UID: 561054132",
      "Enter the Transaction ID below",
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// 3. REVIEWS  →  future: GET /api/site/reviews
// ──────────────────────────────────────────────────────────────
export interface Review {
  name: string;
  text: string;
  stars: number;
}

export const reviews: Review[] = [
  { name: "Rakib H.", text: "He is lil bit slow but he always one of the best guy.", stars: 5 },
  { name: "Sadia A.", text: "Service was a bit slow, took a day to receive my codes and with no email confirmation, but in the end I got what I wanted and for great prices.", stars: 5 },
  { name: "Tanvir M.", text: "good pricing with best delivery system", stars: 5 },
  { name: "Nayeem R.", text: "Smooth checkout, instant delivery on PUBG UC. Highly recommend!", stars: 5 },
  { name: "Sumaiya K.", text: "Best place for Netflix subs in BD. Fair price, no hassle.", stars: 5 },
  { name: "Imran F.", text: "Used bKash to pay, got my Steam key in 10 minutes. Legit shop.", stars: 5 },
];

// ──────────────────────────────────────────────────────────────
// 4. WHY US  →  future: GET /api/site/why-us
// ──────────────────────────────────────────────────────────────
// `icon` must match a lucide-react icon name used in WhyUs.tsx.
export type WhyUsIcon =
  | "Zap"
  | "ShieldCheck"
  | "CreditCard"
  | "Headphones"
  | "Clock"
  | "Award";

export interface WhyUsItem {
  icon: WhyUsIcon;
  title: string;
  desc: string;
}

export const whyUs: WhyUsItem[] = [
  { icon: "Zap", title: "Instant Delivery", desc: "Get your codes, keys & accounts within seconds of payment — no waiting, no delays." },
  { icon: "ShieldCheck", title: "100% Secure", desc: "Every transaction is encrypted and verified. Your payment data never touches our servers." },
  { icon: "CreditCard", title: "Easy Payments", desc: "Pay with bKash, Nagad, Rocket, Upay or card — whatever works for you." },
  { icon: "Headphones", title: "24/7 Support", desc: "Our support team is always online via live chat. Got an issue? We'll fix it fast." },
  { icon: "Clock", title: "Always Available", desc: "Shop anytime — our store runs 24/7 with automated delivery around the clock." },
  { icon: "Award", title: "Best Prices", desc: "We guarantee the lowest prices for digital products. Find cheaper? We'll match it." },
];

// ──────────────────────────────────────────────────────────────
// 5. PARTNERS  →  future: GET /api/site/partners
// ──────────────────────────────────────────────────────────────
export const partners = {
  payments: ["bKash", "Nagad", "Rocket", "Upay", "Binance"],
  platforms: [
    "Steam",
    "PlayStation",
    "Xbox",
    "Epic Games",
    "Nintendo",
    "EA Play",
    "Riot Games",
    "Blizzard",
  ],
};