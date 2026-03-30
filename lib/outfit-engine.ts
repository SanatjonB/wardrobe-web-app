// Pure TypeScript — no React, no Supabase dependencies.
// Safe to import server-side or client-side.

import type { WardrobeItem, Occasion, Outfit, AppCategory } from "./types";

// ── Color utilities ──────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function isNeutral(hex: string): boolean {
  if (!hex || hex.length < 7) return true;
  const [, s, l] = hexToHsl(hex);
  return s < 15 || l > 88 || l < 10;
}

export function colorsCompatible(a: string, b: string): boolean {
  if (isNeutral(a) || isNeutral(b)) return true;
  const [hA] = hexToHsl(a);
  const [hB] = hexToHsl(b);
  const delta = Math.abs(hA - hB);
  const diff = Math.min(delta, 360 - delta);
  return (
    diff <= 30 ||                          // analogous
    (diff >= 150 && diff <= 210) ||        // complementary
    Math.abs(diff - 120) <= 20             // triadic
  );
}

// ── Occasion rules ───────────────────────────────────────────────────────────

type OccasionRule = {
  topCategories: AppCategory[];   // acceptable categories for top slot
  bottomRequired: boolean;
  shoesRequired: boolean;
  forbidden: AppCategory[];
  preferredTags: string[];
};

const RULES: Record<Occasion, OccasionRule> = {
  Casual: {
    topCategories: ["Tops", "Dresses"],
    bottomRequired: true,
    shoesRequired: false,
    forbidden: [],
    preferredTags: ["casual", "everyday", "relaxed", "weekend"],
  },
  "Smart Casual": {
    topCategories: ["Tops", "Dresses"],
    bottomRequired: true,
    shoesRequired: true,
    forbidden: ["Activewear", "Loungewear"],
    preferredTags: ["smart casual", "casual", "everyday"],
  },
  "Business Casual": {
    topCategories: ["Tops"],
    bottomRequired: true,
    shoesRequired: true,
    forbidden: ["Activewear", "Loungewear"],
    preferredTags: ["work", "office", "business", "professional"],
  },
  Formal: {
    topCategories: ["Tops", "Dresses"],
    bottomRequired: true,
    shoesRequired: true,
    forbidden: ["Activewear", "Loungewear"],
    preferredTags: ["formal", "dress", "event", "evening"],
  },
  Athletic: {
    topCategories: ["Activewear", "Tops"],
    bottomRequired: true,
    shoesRequired: true,
    forbidden: ["Dresses", "Loungewear", "Outerwear"],
    preferredTags: ["sport", "gym", "workout", "athletic", "active"],
  },
  "Date Night": {
    topCategories: ["Tops", "Dresses"],
    bottomRequired: true,
    shoesRequired: true,
    forbidden: ["Activewear", "Loungewear"],
    preferredTags: ["date", "evening", "night out", "going out"],
  },
};

// ── Scoring ──────────────────────────────────────────────────────────────────

function scoreItem(
  item: WardrobeItem,
  occasion: Occasion,
  partnerItems: WardrobeItem[]
): number {
  const rule = RULES[occasion];
  let score = 50;

  // Preferred tags bonus
  const itemTags = item.tags?.map((t) => t.toLowerCase()) ?? [];
  if (rule.preferredTags.some((pt) => itemTags.includes(pt))) score += 20;

  // Proven piece bonus
  if ((item.uses ?? 0) > 0) score += 15;

  // Color compatibility with partners
  for (const partner of partnerItems) {
    if (colorsCompatible(item.color, partner.color)) score += 10;
    else score -= 10;
  }

  return score;
}

// ── Main generation function ─────────────────────────────────────────────────

/**
 * Generates an outfit from the user's wardrobe for the given occasion.
 * Pass a different `seed` value to get a different valid combination.
 */
export function generateOutfit(
  items: WardrobeItem[],
  occasion: Occasion,
  seed = 0
): Outfit {
  const rule = RULES[occasion];

  // Group items by category, filtering out forbidden categories
  const byCategory = new Map<string, WardrobeItem[]>();
  for (const item of items) {
    if (rule.forbidden.includes(item.category as AppCategory)) continue;
    const arr = byCategory.get(item.category) ?? [];
    arr.push(item);
    byCategory.set(item.category, arr);
  }

  const pick = (pool: WardrobeItem[], partners: WardrobeItem[], offset: number): WardrobeItem | null => {
    if (pool.length === 0) return null;
    const scored = pool
      .map((item) => ({ item, score: scoreItem(item, occasion, partners) }))
      .sort((a, b) => b.score - a.score);
    return scored[offset % scored.length].item;
  };

  const chosen: WardrobeItem[] = [];

  // Check if a dress can satisfy both top + bottom
  const dresses = byCategory.get("Dresses") ?? [];
  const useDress =
    rule.topCategories.includes("Dresses") &&
    dresses.length > 0 &&
    // Use dress every other seed, or always if no tops available
    (((byCategory.get("Tops") ?? []).length === 0) || seed % 2 === 1);

  let top: WardrobeItem | null = null;
  let bottom: WardrobeItem | null = null;

  if (useDress) {
    const dress = pick(dresses, chosen, seed);
    top = dress;
    bottom = null; // dress covers both slots
    if (dress) chosen.push(dress);
  } else {
    // Pick top from acceptable top categories
    const topPool: WardrobeItem[] = [];
    for (const cat of rule.topCategories) {
      if (cat !== "Dresses") topPool.push(...(byCategory.get(cat) ?? []));
    }
    top = pick(topPool, chosen, seed);
    if (top) chosen.push(top);

    if (rule.bottomRequired) {
      const bottomPool = [
        ...(byCategory.get("Bottoms") ?? []),
        // For Athletic, also allow Activewear as bottoms
        ...(occasion === "Athletic" ? byCategory.get("Activewear") ?? [] : []),
      ].filter((item) => item !== top);
      bottom = pick(bottomPool, chosen, seed);
      if (bottom) chosen.push(bottom);
    }
  }

  // Shoes
  let shoes: WardrobeItem | null = null;
  if (rule.shoesRequired || (byCategory.get("Shoes") ?? []).length > 0) {
    shoes = pick(byCategory.get("Shoes") ?? [], chosen, seed);
    if (shoes) chosen.push(shoes);
  }

  // Optional: Outerwear (only if score is good enough)
  let outerwear: WardrobeItem | null = null;
  const outerwearPool = byCategory.get("Outerwear") ?? [];
  if (outerwearPool.length > 0) {
    const candidate = pick(outerwearPool, chosen, seed);
    if (candidate && scoreItem(candidate, occasion, chosen) > 40) {
      outerwear = candidate;
      chosen.push(outerwear);
    }
  }

  // Optional: Accessory
  let accessory: WardrobeItem | null = null;
  const accessoryPool = byCategory.get("Accessories") ?? [];
  if (accessoryPool.length > 0) {
    const candidate = pick(accessoryPool, chosen, seed);
    if (candidate && scoreItem(candidate, occasion, chosen) > 40) {
      accessory = candidate;
    }
  }

  return { top, bottom, shoes, outerwear, accessory };
}
