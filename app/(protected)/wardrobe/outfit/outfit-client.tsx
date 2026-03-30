"use client";

import { useState } from "react";
import Link from "next/link";
import { generateOutfit } from "@/lib/outfit-engine";
import type { WardrobeItem, Occasion, Outfit } from "@/lib/types";

const OCCASIONS: Occasion[] = [
  "Casual",
  "Smart Casual",
  "Business Casual",
  "Formal",
  "Athletic",
  "Date Night",
];

type SlotKey = keyof Outfit;

const SLOT_LABELS: { key: SlotKey; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Outerwear" },
  { key: "accessory", label: "Accessory" },
];

const CATEGORY_LINKS: Partial<Record<SlotKey, string>> = {
  top: "Tops",
  bottom: "Bottoms",
  shoes: "Shoes",
  outerwear: "Outerwear",
  accessory: "Accessories",
};

function SlotCard({ item, slotKey }: { item: WardrobeItem | null; slotKey: SlotKey }) {
  if (!item) {
    const cat = CATEGORY_LINKS[slotKey] ?? "items";
    return (
      <div className="missing-slot-card">
        <span className="missing-slot-icon">👕</span>
        <span className="missing-slot-text">
          No {cat} in wardrobe
          <br />
          <Link href="/wardrobe/add" style={{ color: "var(--fg)", fontWeight: 600 }}>
            + Add one
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="outfit-item-card">
      <div
        className="outfit-card-swatch"
        style={
          item.image_url
            ? { backgroundImage: `url(${item.image_url})` }
            : { background: item.color ?? "#e0e0e0" }
        }
      />
      <div className="outfit-card-body">
        <span className="outfit-card-name">{item.name}</span>
        <span className="outfit-card-cat">{item.category}</span>
      </div>
    </div>
  );
}

export function OutfitClient({ items }: { items: WardrobeItem[] }) {
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [seed, setSeed] = useState(0);
  const [step, setStep] = useState<"pick" | "show">("pick");

  function generate(newSeed: number) {
    if (!occasion) return;
    setOutfit(generateOutfit(items, occasion, newSeed));
    setStep("show");
  }

  function handleGenerate() {
    generate(seed);
  }

  function handleRegenerate() {
    const next = seed + 1;
    setSeed(next);
    generate(next);
  }

  function handleReset() {
    setStep("pick");
    setOutfit(null);
    setSeed(0);
  }

  if (items.length === 0) {
    return (
      <div className="outfit-empty">
        <div className="outfit-empty-icon">👗</div>
        <h2 className="outfit-empty-title">Your wardrobe is empty</h2>
        <p className="outfit-empty-sub">
          Add some items first to generate outfits.
        </p>
        <Link href="/wardrobe/add" className="add-btn">
          + Add Your First Item
        </Link>
      </div>
    );
  }

  if (step === "pick") {
    return (
      <div>
        <h2 className="outfit-step-title">What&apos;s the occasion?</h2>
        <p className="outfit-step-sub">
          Pick a style and we&apos;ll build an outfit from your wardrobe.
        </p>
        <div className="occasion-grid">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              className={`occasion-btn ${occasion === occ ? "active" : ""}`}
              onClick={() => setOccasion(occ)}
            >
              {occ}
            </button>
          ))}
        </div>
        <button
          className="btn-submit"
          onClick={handleGenerate}
          disabled={!occasion}
        >
          Generate Outfit
        </button>
      </div>
    );
  }

  // Show outfit
  const visibleSlots = SLOT_LABELS.filter(
    ({ key }) => outfit?.[key] !== undefined
  );

  return (
    <div>
      <h2 className="outfit-step-title">{occasion}</h2>
      <p className="outfit-step-sub">
        Here&apos;s an outfit from your wardrobe. Hit regenerate for a different combo.
      </p>

      <div className="outfit-slots">
        {visibleSlots.map(({ key, label }) => (
          <div key={key} className="outfit-slot">
            <span className="slot-label">{label}</span>
            <SlotCard item={outfit?.[key] ?? null} slotKey={key} />
          </div>
        ))}
      </div>

      <div className="outfit-actions">
        <button className="btn-submit" onClick={handleRegenerate}>
          Regenerate
        </button>
        <button className="btn-cancel" onClick={handleReset}>
          Try Different Occasion
        </button>
      </div>
    </div>
  );
}
