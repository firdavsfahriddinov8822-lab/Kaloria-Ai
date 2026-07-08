export const APP_NAME = "Kaloriya";

export const CALORIE_FLOOR_MALE = 1500;
export const CALORIE_FLOOR_FEMALE = 1200;

export const MAX_DEFICIT_PCT = 0.25;
export const MAX_SURPLUS_PCT = 0.20;

export const MAX_WEEKLY_LOSS_PCT_OF_BODYWEIGHT = 0.01;
export const MAX_WEEKLY_LOSS_KG_SOFT_CAP = 1.0;

export const KCAL_PER_KG_FAT = 7700;

export const WATER_ML_PER_KG = 33;

export const HEALTHY_BMI_MIN = 18.5;
export const HEALTHY_BMI_MAX = 24.9;

export const MEAL_SPLIT = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.30,
  snack: 0.10,
} as const;

export const DEFAULT_MEAL_TIMES = {
  breakfast: "08:00",
  lunch: "13:00",
  dinner: "19:00",
  snack: "16:00",
} as const;
