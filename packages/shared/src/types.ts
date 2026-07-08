export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "lose" | "maintain" | "gain";

export type GoalPace = "slow" | "normal" | "fast";

export type DietType = "regular" | "halal" | "vegetarian" | "vegan";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type SubscriptionTier = "free" | "basic" | "plus" | "pro";

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export interface Macros {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  sugar_g?: number;
  salt_g?: number;
}

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  goalPace: GoalPace;
  activity: ActivityLevel;
  dietType: DietType;
  allergies: string[];
  targetWeightKg?: number;
}

export interface DerivedTargets {
  bmr: number;
  tdee: number;
  dailyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterMl: number;
  bmi: number;
  isSafeGoal: boolean;
  guardrailNote?: string;
}

export interface FoodEntry {
  id: string;
  name: string;
  meal: MealType;
  portionPct: number;
  macros: Macros;
  photoUri?: string;
  confidence?: number;
  createdAt: string;
  source: "ai" | "manual";
}

export interface WaterEntry {
  id: string;
  ml: number;
  createdAt: string;
}

export interface WorkoutEntry {
  id: string;
  exerciseIds: string[];
  planId?: string;
  kcalBurned: number;
  durationMin: number;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  createdAt: string;
}

export interface DayLog {
  date: string;
  foods: FoodEntry[];
  water: WaterEntry[];
  workouts: WorkoutEntry[];
  sleepHours?: number;
}

export interface DaySummary {
  date: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterMl: number;
  workoutsCount: number;
  weightKg?: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  displayName?: string;
  createdAt: string;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface FoodMicros {
  fiber_g?: number;
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  vitamin_d_mcg?: number;
  vitamin_b12_mcg?: number;
  iron_mg?: number;
  calcium_mg?: number;
  potassium_mg?: number;
  sodium_mg?: number;
}

export interface AiAnalyzedItem {
  name: string;
  brand?: string;
  estimatedGrams: number;
  macros: Macros;
  micros?: FoodMicros;
  portionPctSuggested: number;
  reason?: string;
  allergens?: string[];
  dietFlags?: string[];
}

export interface AiFoodAnalysis {
  isFood: boolean;
  items: AiAnalyzedItem[];
  totals: Macros;
  totalGrams?: number;
  micros?: FoodMicros;
  confidence: number;
  note?: string;
  noteUz?: string;
  notFoodReason?: string;
  allergenHits?: string[];
  dietWarnings?: string[];
  healthWarnings?: string[];
}

export type WorkoutIntensity = "easy" | "moderate" | "hard";

export interface AiWorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  targetMuscle?: string;
  notes?: string;
  equipment?: string;
  rpe?: number;
}

export interface AiDailyWorkout {
  date: string;
  focus: string;
  warmupMin: number;
  cooldownMin: number;
  totalMin: number;
  totalKcal: number;
  intensity: WorkoutIntensity;
  exercises: AiWorkoutExercise[];
  warmupList?: string[];
  cooldownList?: string[];
  doctorNote?: string;
  reminders?: string[];
  tomorrowHint?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
