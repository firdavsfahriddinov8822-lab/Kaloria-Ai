import type {
  AiDailyWorkout,
  AiFoodAnalysis,
  DerivedTargets,
  Profile,
  WorkoutEntry,
} from "@kaloriya/shared";
import { api } from "./api";

export async function analyzeFoodPhoto(
  imageBase64: string,
  opts?: { noteUz?: string; locale?: string },
): Promise<AiFoodAnalysis> {
  const res = await api.analyzeFood({ imageBase64, ...opts });
  if (!res.ok || !res.data) {
    throw new Error(res.error?.message ?? "AI xatolik");
  }
  return res.data;
}

export async function generateDailyWorkout(input: {
  profile: Profile;
  targets: DerivedTargets;
  date: string;
  environment?: "home" | "gym" | "outdoor";
  recentWorkouts?: WorkoutEntry[];
  locale?: string;
}): Promise<AiDailyWorkout> {
  const res = await api.dailyWorkout(input);
  if (!res.ok || !res.data) {
    throw new Error(res.error?.message ?? "AI xatolik");
  }
  return res.data;
}
