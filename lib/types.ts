export type AppCategory =
  | "Tops"
  | "Bottoms"
  | "Outerwear"
  | "Shoes"
  | "Accessories"
  | "Dresses"
  | "Activewear"
  | "Loungewear";

export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  tags: string[];
  uses: number;
  image_url: string | null;
};

export type AnalysisResult = {
  category: AppCategory | null;
  confidence: number;
};

export type Occasion =
  | "Casual"
  | "Smart Casual"
  | "Business Casual"
  | "Formal"
  | "Athletic"
  | "Date Night";

export type Outfit = {
  top: WardrobeItem | null;
  bottom: WardrobeItem | null;
  shoes: WardrobeItem | null;
  outerwear: WardrobeItem | null;
  accessory: WardrobeItem | null;
};
