import type { FoodMicros, Goal, Sex } from "./types.js";

export interface RDI {
  fiber_g: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  vitamin_b12_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  potassium_mg: number;
  sodium_mg: number;
}

export const RDI_ADULT: Record<Sex, RDI> = {
  male: {
    fiber_g: 38,
    vitamin_a_mcg: 900,
    vitamin_c_mg: 90,
    vitamin_d_mcg: 15,
    vitamin_b12_mcg: 2.4,
    iron_mg: 8,
    calcium_mg: 1000,
    potassium_mg: 3400,
    sodium_mg: 2300,
  },
  female: {
    fiber_g: 25,
    vitamin_a_mcg: 700,
    vitamin_c_mg: 75,
    vitamin_d_mcg: 15,
    vitamin_b12_mcg: 2.4,
    iron_mg: 18,
    calcium_mg: 1000,
    potassium_mg: 2600,
    sodium_mg: 2300,
  },
};

export function rdiFor(sex: Sex): RDI {
  return RDI_ADULT[sex];
}

export function rdiPercent(value: number | undefined, target: number): number {
  if (typeof value !== "number" || target <= 0) return 0;
  return Math.round((value / target) * 100);
}

export function proteinPerKg(goal: Goal): number {
  return goal === "gain" ? 2.0 : goal === "lose" ? 1.8 : 1.6;
}

export function bmiCategory(bmi: number): "underweight" | "healthy" | "overweight" | "obese" {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
}

export function macroBalance(
  proteinG: number,
  fatG: number,
  carbsG: number,
): { proteinPct: number; fatPct: number; carbsPct: number } {
  const total = proteinG * 4 + fatG * 9 + carbsG * 4;
  if (total <= 0) return { proteinPct: 0, fatPct: 0, carbsPct: 0 };
  return {
    proteinPct: Math.round(((proteinG * 4) / total) * 100),
    fatPct: Math.round(((fatG * 9) / total) * 100),
    carbsPct: Math.round(((carbsG * 4) / total) * 100),
  };
}

export function sumMicros(entries: (FoodMicros | undefined)[]): FoodMicros {
  const keys: (keyof FoodMicros)[] = [
    "fiber_g",
    "vitamin_a_mcg",
    "vitamin_c_mg",
    "vitamin_d_mcg",
    "vitamin_b12_mcg",
    "iron_mg",
    "calcium_mg",
    "potassium_mg",
    "sodium_mg",
  ];
  const out: FoodMicros = {};
  for (const k of keys) {
    let total = 0;
    let hit = false;
    for (const e of entries) {
      const v = e?.[k];
      if (typeof v === "number") {
        total += v;
        hit = true;
      }
    }
    if (hit) out[k] = Math.round(total * 100) / 100;
  }
  return out;
}

export interface HealthFlag {
  kind: "sodium_high" | "sugar_high" | "protein_low" | "fiber_low" | "calorie_over" | "hydration_low";
  severity: "watch" | "risk";
  detail?: string;
}

export function scoreDay(input: {
  kcalConsumed: number;
  kcalTarget: number;
  proteinG: number;
  proteinTargetG: number;
  fiberG: number;
  fiberTargetG: number;
  sodiumMg: number;
  sugarG: number;
  waterMl: number;
  waterTargetMl: number;
}): HealthFlag[] {
  const flags: HealthFlag[] = [];
  if (input.kcalConsumed > input.kcalTarget * 1.15) {
    flags.push({ kind: "calorie_over", severity: "risk" });
  } else if (input.kcalConsumed > input.kcalTarget * 1.05) {
    flags.push({ kind: "calorie_over", severity: "watch" });
  }
  if (input.proteinG < input.proteinTargetG * 0.7) {
    flags.push({ kind: "protein_low", severity: "watch" });
  }
  if (input.fiberG < input.fiberTargetG * 0.5) {
    flags.push({ kind: "fiber_low", severity: "watch" });
  }
  if (input.sodiumMg > 2300) {
    flags.push({ kind: "sodium_high", severity: input.sodiumMg > 3000 ? "risk" : "watch" });
  }
  if (input.sugarG > 50) {
    flags.push({ kind: "sugar_high", severity: input.sugarG > 75 ? "risk" : "watch" });
  }
  if (input.waterMl < input.waterTargetMl * 0.6) {
    flags.push({ kind: "hydration_low", severity: "watch" });
  }
  return flags;
}
