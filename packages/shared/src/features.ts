import type { SubscriptionTier } from "./types.js";

export type FeatureKey =
  | "ai_food_scan"
  | "full_macros"
  | "ai_recommendations"
  | "meal_reminders"
  | "meal_plan"
  | "shopping_list"
  | "workouts_all"
  | "ai_coach"
  | "personal_program"
  | "progress_analytics"
  | "sleep_tracking"
  | "community"
  | "ads_hidden";

export interface FeatureRule {
  minTier: SubscriptionTier;
  dailyQuota?: number;
}

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  plus: 2,
  pro: 3,
};

export const FEATURES: Record<FeatureKey, FeatureRule> = {
  ai_food_scan: { minTier: "basic", dailyQuota: 3 },
  full_macros: { minTier: "plus" },
  ai_recommendations: { minTier: "plus" },
  meal_reminders: { minTier: "plus" },
  meal_plan: { minTier: "plus" },
  shopping_list: { minTier: "plus" },
  workouts_all: { minTier: "pro" },
  ai_coach: { minTier: "pro" },
  personal_program: { minTier: "pro" },
  progress_analytics: { minTier: "pro" },
  sleep_tracking: { minTier: "pro" },
  community: { minTier: "pro" },
  ads_hidden: { minTier: "plus" },
};

export function tierRank(t: SubscriptionTier): number {
  return TIER_RANK[t];
}

export function tierMeets(actual: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_RANK[actual] >= TIER_RANK[required];
}

export function canUseFeature(tier: SubscriptionTier, key: FeatureKey): boolean {
  const rule = FEATURES[key];
  return tierMeets(tier, rule.minTier);
}

export function featureQuota(tier: SubscriptionTier, key: FeatureKey): number | undefined {
  const rule = FEATURES[key];
  if (!canUseFeature(tier, key)) return 0;
  return tier === rule.minTier ? rule.dailyQuota : undefined;
}

export interface TierPlan {
  tier: SubscriptionTier;
  priceUzs: number;
  nameUz: string;
  taglineUz: string;
  featuresUz: string[];
  highlighted?: boolean;
}

export const TIER_PLANS: TierPlan[] = [
  {
    tier: "basic",
    priceUzs: 39000,
    nameUz: "Basic",
    taglineUz: "Boshlash uchun",
    featuresUz: [
      "Kaloriya hisoblash",
      "Vazn kuzatuvi",
      "Kunlik statistika",
      "AI ovqat skaneri (kuniga 3 marta)",
      "Asosiy mashqlar",
    ],
  },
  {
    tier: "plus",
    priceUzs: 59000,
    nameUz: "Plus",
    taglineUz: "Eng mashhur",
    featuresUz: [
      "Cheksiz AI skaner",
      "To'liq makro tahlil",
      "AI ovqat tavsiyalari",
      "Suv/ovqat eslatmalari",
      "Shaxsiy ovqat rejasi",
      "Xarid ro'yxati",
    ],
    highlighted: true,
  },
  {
    tier: "pro",
    priceUzs: 89000,
    nameUz: "Pro",
    taglineUz: "To'liq imkoniyat",
    featuresUz: [
      "Plus-ning hammasi",
      "Barcha mashqlar (uy + zal)",
      "AI murabbiy",
      "Shaxsiy mashq dasturi",
      "Progress tahlili",
      "Uyqu nazorati",
      "Community",
      "Reklamasiz",
    ],
  },
];
