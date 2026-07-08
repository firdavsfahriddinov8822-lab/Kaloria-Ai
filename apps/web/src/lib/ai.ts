import type { AiFoodAnalysis } from "@kaloriya/shared";
import { api } from "./api";

export async function analyzeFoodPhoto(imageBase64: string, noteUz?: string): Promise<AiFoodAnalysis> {
  const res = await api.analyzeFood({ imageBase64, noteUz });
  if (!res.ok || !res.data) {
    throw new Error(res.error?.message ?? "AI xatolik");
  }
  return res.data;
}
