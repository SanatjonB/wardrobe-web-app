// Browser-only module — never import this server-side.
// Always use dynamic import: await import("@/lib/image-analysis")

import type { AppCategory, AnalysisResult } from "./types";

// ── Color extraction ─────────────────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Extracts the dominant non-neutral color from an image using the Canvas API.
 * Returns a hex color string, or null if the image is all neutral (white/black/gray).
 */
export function extractDominantColor(img: HTMLImageElement): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, 50, 50);
  const { data } = ctx.getImageData(0, 0, 50, 50);

  // 36 hue buckets (10° each), each storing sum of R/G/B and count
  const buckets: { r: number; g: number; b: number; count: number }[] = Array.from(
    { length: 36 },
    () => ({ r: 0, g: 0, b: 0, count: 0 })
  );

  let neutralR = 0, neutralG = 0, neutralB = 0, neutralCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue; // skip transparent
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 15 || l > 90 || l < 8) {
      neutralR += r; neutralG += g; neutralB += b; neutralCount++;
      continue;
    }
    const bucket = Math.floor(h / 10) % 36;
    buckets[bucket].r += r;
    buckets[bucket].g += g;
    buckets[bucket].b += b;
    buckets[bucket].count++;
  }

  // Find the most populated hue bucket
  let best = buckets[0];
  for (const bucket of buckets) {
    if (bucket.count > best.count) best = bucket;
  }

  if (best.count === 0) {
    // All neutral — return median neutral pixel
    if (neutralCount === 0) return null;
    return rgbToHex(
      Math.round(neutralR / neutralCount),
      Math.round(neutralG / neutralCount),
      Math.round(neutralB / neutralCount)
    );
  }

  return rgbToHex(
    Math.round(best.r / best.count),
    Math.round(best.g / best.count),
    Math.round(best.b / best.count)
  );
}

// ── Category classification via MobileNet ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mobilenetModel: any = null;

/**
 * Silently pre-warms the MobileNet model in the background.
 * Call this from the wardrobe page so the model is ready before the user
 * opens Add Item — avoids the 3-5s wait on first photo upload.
 */
export async function preloadModel(): Promise<void> {
  await getModel();
}

async function getModel() {
  if (!mobilenetModel) {
    const tf = await import("@tensorflow/tfjs");
    await tf.ready();
    const mn = await import("@tensorflow-models/mobilenet");
    mobilenetModel = await mn.load({ version: 2, alpha: 0.5 });
  }
  return mobilenetModel;
}

const CATEGORY_KEYWORDS: Record<AppCategory, string[]> = {
  Tops: [
    "jersey", "t-shirt", "tee shirt", "polo shirt", "sweatshirt", "hoodie",
    "blouse", "cardigan", "pullover", "tank top", "crop top", "henley",
    "dress shirt", "oxford cloth", "button-down", "tunic", "overshirt",
    "flannel", "chambray", "kimono", "wrap top", "fleece", "crewneck",
    "crew neck", "mock neck", "turtleneck", "raglan", "knitwear",
    // MobileNet often uses these for hoodies/sweatshirts:
    "sweat shirt", "knit shirt", "wool jersey",
  ],
  Bottoms: [
    "jeans", "jean", "trousers", "shorts", "skirt", "chinos", "slacks",
    "sweatpants", "leggings", "joggers", "culottes", "miniskirt",
    "cargo pants", "capri", "palazzo",
  ],
  Outerwear: [
    "coat", "jacket", "trench coat", "parka", "blazer", "overcoat",
    "windbreaker", "bomber", "peacoat", "raincoat", "anorak",
    "denim jacket", "leather jacket", "sport coat",
  ],
  Shoes: [
    "shoe", "sneaker", "boot", "sandal", "loafer", "pump",
    "heel", "stiletto", "moccasin", "slipper", "running shoe",
    "athletic shoe", "basketball shoe", "tennis shoe", "flip-flop",
    "clog", "oxford shoe", "derby", "brogue", "espadrille",
  ],
  Accessories: [
    "belt", "necktie", "bow tie", "scarf", "hat", "baseball cap",
    // Note: avoid "cap" alone — MobileNet predicts "knit cap" for hooded tops
    "beanie", "sunglasses", "eyeglass", "gloves", "handbag", "purse",
    "backpack", "wallet", "wristwatch", "necklace", "bracelet", "earring",
    "umbrella", "hair band", "bandana", "stocking cap",
  ],
  Dresses: [
    "dress", "gown", "sundress", "evening gown", "cocktail dress",
    "maxi dress", "wrap dress", "shift dress", "sheath",
  ],
  Activewear: [
    "gym shorts", "sports bra", "yoga pants",
    "compression", "cycling shorts", "swimsuit", "swim wear",
    "tracksuit", "racerback",
  ],
  Loungewear: [
    "pajamas", "robe", "nightgown", "sweatsuit", "onesie", "sleepwear",
    "nightwear",
  ],
};

function labelToCategory(label: string): AppCategory | null {
  const lower = label.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return cat as AppCategory;
    }
  }
  return null;
}

/**
 * Classifies a clothing image using TF.js MobileNet.
 * Returns the predicted AppCategory and confidence score (0–1).
 */
export async function classifyImage(img: HTMLImageElement): Promise<AnalysisResult> {
  const model = await getModel();
  // Get top 5 predictions
  const predictions: { className: string; probability: number }[] =
    await model.classify(img, 5);

  // Accumulate confidence per category.
  // The #1 prediction gets 3× weight — prevents weak repeated guesses
  // (e.g. 3 low-confidence Accessories) from beating one strong Tops hit.
  const scores: Partial<Record<AppCategory, number>> = {};
  predictions.forEach((pred, i) => {
    const weight = i === 0 ? 3 : 1;
    const cat = labelToCategory(pred.className);
    if (cat) {
      scores[cat] = (scores[cat] ?? 0) + pred.probability * weight;
    }
  });

  let bestCat: AppCategory | null = null;
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat as AppCategory;
    }
  }

  // Require a minimum confidence — if the model is just guessing, don't auto-fill
  if (bestScore < 0.08) return { category: null, confidence: 0 };

  return { category: bestCat, confidence: bestScore };
}
