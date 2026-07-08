import {
  CALORIE_FLOOR_FEMALE,
  CALORIE_FLOOR_MALE,
  HEALTHY_BMI_MAX,
  HEALTHY_BMI_MIN,
  KCAL_PER_KG_FAT,
  MAX_DEFICIT_PCT,
  MAX_SURPLUS_PCT,
  MAX_WEEKLY_LOSS_KG_SOFT_CAP,
  MAX_WEEKLY_LOSS_PCT_OF_BODYWEIGHT,
  MEAL_SPLIT,
  WATER_ML_PER_KG,
} from "./constants.js";
import type {
  ActivityLevel,
  DerivedTargets,
  Goal,
  GoalPace,
  Macros,
  MealType,
  Profile,
  Sex,
} from "./types.js";

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const PACE_DELTA_PCT: Record<GoalPace, number> = {
  slow: 0.10,
  normal: 0.17,
  fast: 0.25,
};

export function calculateBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function calculateTdee(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTOR[activity]);
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function calorieFloor(sex: Sex): number {
  return sex === "male" ? CALORIE_FLOOR_MALE : CALORIE_FLOOR_FEMALE;
}

export interface GoalCalorieResult {
  dailyKcal: number;
  isSafeGoal: boolean;
  guardrailNote?: string;
}

export function applyGoalToKcal(
  tdee: number,
  goal: Goal,
  pace: GoalPace,
  profile: { sex: Sex; weightKg: number; heightCm: number; targetWeightKg?: number },
): GoalCalorieResult {
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
  const floor = calorieFloor(profile.sex);
  const isUnderweight = bmi < HEALTHY_BMI_MIN;
  const isAlreadyHealthy = bmi >= HEALTHY_BMI_MIN && bmi <= HEALTHY_BMI_MAX;

  if (goal === "lose" && isUnderweight) {
    return {
      dailyKcal: tdee,
      isSafeGoal: false,
      guardrailNote:
        "BMI 18.5 dan past. Ozish tavsiya etilmaydi — mutaxassisga murojaat qiling.",
    };
  }

  if (goal === "lose" && isAlreadyHealthy && pace === "fast") {
    const pct = Math.min(PACE_DELTA_PCT.normal, MAX_DEFICIT_PCT);
    const kcal = Math.max(floor, Math.round(tdee * (1 - pct)));
    return {
      dailyKcal: kcal,
      isSafeGoal: true,
      guardrailNote: "Sog'lom vazn oralig'idasiz — sur'at 'Odatiy' ga tushirildi.",
    };
  }

  if (goal === "maintain") {
    return { dailyKcal: tdee, isSafeGoal: true };
  }

  const pct = Math.min(
    PACE_DELTA_PCT[pace],
    goal === "lose" ? MAX_DEFICIT_PCT : MAX_SURPLUS_PCT,
  );
  const rawKcal = Math.round(
    goal === "lose" ? tdee * (1 - pct) : tdee * (1 + pct),
  );

  if (goal === "lose" && rawKcal < floor) {
    return {
      dailyKcal: floor,
      isSafeGoal: true,
      guardrailNote: `Kaloriya minimumga (${floor} kkal) cheklandi.`,
    };
  }

  return { dailyKcal: rawKcal, isSafeGoal: true };
}

export function macroSplit(
  dailyKcal: number,
  weightKg: number,
  goal: Goal,
): { proteinG: number; fatG: number; carbsG: number } {
  const proteinPerKg = goal === "gain" ? 2.0 : goal === "lose" ? 1.8 : 1.6;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((dailyKcal * 0.28) / 9);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsKcal = Math.max(0, dailyKcal - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);
  return { proteinG, fatG, carbsG };
}

export function waterTarget(weightKg: number, activity: ActivityLevel): number {
  const base = weightKg * WATER_ML_PER_KG;
  const bump =
    activity === "active" || activity === "very_active" ? 500 : 0;
  return Math.round((base + bump) / 50) * 50;
}

export function deriveTargets(profile: Profile): DerivedTargets {
  const bmr = calculateBmr(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.sex,
  );
  const tdee = calculateTdee(bmr, profile.activity);
  const goalResult = applyGoalToKcal(tdee, profile.goal, profile.goalPace, profile);
  const macros = macroSplit(goalResult.dailyKcal, profile.weightKg, profile.goal);
  const bmi = calculateBmi(profile.weightKg, profile.heightCm);
  const water = waterTarget(profile.weightKg, profile.activity);

  return {
    bmr,
    tdee,
    dailyKcal: goalResult.dailyKcal,
    proteinG: macros.proteinG,
    fatG: macros.fatG,
    carbsG: macros.carbsG,
    waterMl: water,
    bmi,
    isSafeGoal: goalResult.isSafeGoal,
    guardrailNote: goalResult.guardrailNote,
  };
}

export function mealBudget(dailyKcal: number, meal: MealType): number {
  return Math.round(dailyKcal * MEAL_SPLIT[meal]);
}

export interface WeightForecastPoint {
  weeksFromNow: number;
  minKg: number;
  expectedKg: number;
  maxKg: number;
}

export function forecastWeight(
  currentKg: number,
  dailyDeltaKcal: number,
  weeks: number[],
): WeightForecastPoint[] {
  const weeklyKg = (dailyDeltaKcal * 7) / KCAL_PER_KG_FAT;
  const safeCap = Math.min(
    currentKg * MAX_WEEKLY_LOSS_PCT_OF_BODYWEIGHT,
    MAX_WEEKLY_LOSS_KG_SOFT_CAP,
  );
  const clamped =
    weeklyKg < 0 ? -Math.min(Math.abs(weeklyKg), safeCap) : Math.min(weeklyKg, safeCap);

  return weeks.map((w) => {
    const expected = currentKg + clamped * w;
    const spread = Math.abs(clamped) * w * 0.3;
    return {
      weeksFromNow: w,
      expectedKg: Math.round(expected * 10) / 10,
      minKg: Math.round((expected - spread) * 10) / 10,
      maxKg: Math.round((expected + spread) * 10) / 10,
    };
  });
}

export function sumMacros(entries: { macros: Macros; portionPct: number }[]): Macros {
  return entries.reduce<Macros>(
    (acc, e) => {
      const f = e.portionPct / 100;
      return {
        kcal: acc.kcal + e.macros.kcal * f,
        protein_g: acc.protein_g + e.macros.protein_g * f,
        fat_g: acc.fat_g + e.macros.fat_g * f,
        carbs_g: acc.carbs_g + e.macros.carbs_g * f,
        sugar_g: (acc.sugar_g ?? 0) + (e.macros.sugar_g ?? 0) * f,
        salt_g: (acc.salt_g ?? 0) + (e.macros.salt_g ?? 0) * f,
      };
    },
    { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, sugar_g: 0, salt_g: 0 },
  );
}

export const METS = {
  running: 9.8,
  brisk_walk: 4.3,
  cycling: 7.5,
  swimming: 8.0,
  jump_rope: 12.3,
  hiit: 8.0,
  strength: 5.0,
  yoga: 3.0,
} as const;

export type ActivityKind = keyof typeof METS;

export function minutesToBurn(
  kcal: number,
  weightKg: number,
  activity: ActivityKind,
): number {
  const met = METS[activity];
  const kcalPerMin = (met * 3.5 * weightKg) / 200;
  return Math.round(kcal / kcalPerMin);
}

export function kcalFromActivity(
  minutes: number,
  weightKg: number,
  activity: ActivityKind,
): number {
  const met = METS[activity];
  return Math.round(((met * 3.5 * weightKg) / 200) * minutes);
}
