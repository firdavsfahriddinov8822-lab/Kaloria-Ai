import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AiFoodAnalysis, FoodMicros, MealType } from "@kaloriya/shared";
import { rdiFor, rdiPercent } from "@kaloriya/shared";
import {
  Btn,
  Card,
  Chip,
  DangerBanner,
  Field,
  InfoBanner,
  SectionHeader,
  Segmented,
  SkeletonCard,
} from "@/components/ui";
import { analyzeFoodPhoto } from "@/lib/ai";
import { useI18n, type TranslationKey } from "@/i18n";
import { useApp } from "@/state/AppContext";

const MEAL_OPTIONS: { value: MealType; labelKey: TranslationKey }[] = [
  { value: "breakfast", labelKey: "meal_breakfast" },
  { value: "lunch", labelKey: "meal_lunch" },
  { value: "snack", labelKey: "meal_snack" },
  { value: "dinner", labelKey: "meal_dinner" },
];

function detectCurrentMeal(now: Date): MealType {
  const h = now.getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}

function firstUnusedMeal(preferred: MealType, used: Set<MealType>): MealType {
  if (!used.has(preferred)) return preferred;
  for (const o of MEAL_OPTIONS) {
    if (!used.has(o.value)) return o.value;
  }
  return preferred;
}

function MacroChip({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-elev2/70 border border-line/40 rounded-xl p-3 flex-1">
      <div className="text-[11px] uppercase tracking-wide text-mute">
        {label}
      </div>
      <div className="font-display text-lg tnum" style={{ color }}>
        {Math.round(value * 10) / 10}
        <span className="text-dim text-xs ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

interface MicroRowSpec {
  key: keyof FoodMicros;
  labelKey: TranslationKey;
  unit: "g" | "mg" | "mcg";
  rdiKey: keyof ReturnType<typeof rdiFor>;
}

const MICRO_ROWS: MicroRowSpec[] = [
  { key: "fiber_g", labelKey: "nutr_fiber", unit: "g", rdiKey: "fiber_g" },
  { key: "vitamin_a_mcg", labelKey: "nutr_vit_a", unit: "mcg", rdiKey: "vitamin_a_mcg" },
  { key: "vitamin_c_mg", labelKey: "nutr_vit_c", unit: "mg", rdiKey: "vitamin_c_mg" },
  { key: "vitamin_d_mcg", labelKey: "nutr_vit_d", unit: "mcg", rdiKey: "vitamin_d_mcg" },
  { key: "vitamin_b12_mcg", labelKey: "nutr_vit_b12", unit: "mcg", rdiKey: "vitamin_b12_mcg" },
  { key: "iron_mg", labelKey: "nutr_iron", unit: "mg", rdiKey: "iron_mg" },
  { key: "calcium_mg", labelKey: "nutr_calcium", unit: "mg", rdiKey: "calcium_mg" },
  { key: "potassium_mg", labelKey: "nutr_potassium", unit: "mg", rdiKey: "potassium_mg" },
  { key: "sodium_mg", labelKey: "nutr_sodium", unit: "mg", rdiKey: "sodium_mg" },
];

export default function AddFood() {
  const nav = useNavigate();
  const { t, locale } = useI18n();
  const { state, addFood, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const usedMeals = useMemo(
    () => new Set<MealType>(state.today.foods.map((f) => f.meal)),
    [state.today.foods],
  );
  const [meal, setMeal] = useState<MealType>(() =>
    firstUnusedMeal(detectCurrentMeal(new Date()), usedMeals),
  );
  const [analysis, setAnalysis] = useState<AiFoodAnalysis | undefined>();
  const [portion, setPortion] = useState(100);
  const [busy, setBusy] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();

  useEffect(() => {
    if (analysis) {
      const rec = analysis.items[0]?.portionPctSuggested;
      if (rec && rec > 0 && rec <= 200) setPortion(rec);
    }
  }, [analysis]);

  const scaled = useMemo(() => {
    if (!analysis) return null;
    const f = portion / 100;
    const m = analysis.totals;
    return {
      kcal: m.kcal * f,
      protein_g: m.protein_g * f,
      fat_g: m.fat_g * f,
      carbs_g: m.carbs_g * f,
      sugar_g: (m.sugar_g ?? 0) * f,
      salt_g: (m.salt_g ?? 0) * f,
      grams: (analysis.totalGrams ?? 0) * f,
    };
  }, [analysis, portion]);

  const scaledMicros = useMemo(() => {
    if (!analysis?.micros) return null;
    const f = portion / 100;
    const src = analysis.micros;
    const out: FoodMicros = {};
    for (const { key } of MICRO_ROWS) {
      const v = src[key];
      if (typeof v === "number" && v > 0) out[key] = v * f;
    }
    return Object.keys(out).length > 0 ? out : null;
  }, [analysis, portion]);

  const rdi = state.profile ? rdiFor(state.profile.sex) : null;

  async function onPick(file: File) {
    setBusy(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read fail"));
      r.readAsDataURL(file);
    });
    setPhotoDataUrl(dataUrl);
    setAnalysis(undefined);
    const base64 = dataUrl.split(",")[1] ?? "";
    try {
      const res = await analyzeFoodPhoto(base64, {
        locale,
        allergies: state.profile?.allergies,
        dietType: state.profile?.dietType,
        goal: state.profile?.goal,
      });
      if (!res.isFood) {
        const reason = res.notFoodReason ? ` (${res.notFoodReason})` : "";
        toast(t("addfood_not_food") + reason, "warn");
        return;
      }
      setAnalysis(res);
    } catch (e) {
      toast(e instanceof Error ? e.message : t("addfood_ai_error"), "error");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!analysis) return;
    const firstItem = analysis.items[0];
    addFood({
      id: crypto.randomUUID(),
      name: firstItem?.name ?? t("addfood_result"),
      meal,
      portionPct: portion,
      macros: analysis.totals,
      photoUri: photoDataUrl,
      confidence: analysis.confidence,
      createdAt: new Date().toISOString(),
      source: "ai",
    });
    toast(t("addfood_added"), "success");
    nav("/food");
  }

  const displayNote = analysis?.note ?? analysis?.noteUz;
  const allergenHits = analysis?.allergenHits ?? [];
  const dietWarnings = analysis?.dietWarnings ?? [];
  const healthWarnings = analysis?.healthWarnings ?? [];

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("addfood_title")}</div>
        <div className="text-dim text-sm">{t("addfood_sub")}</div>
      </header>

      <Card className="space-y-3">
        <Field label={t("addfood_meal_type")}>
          <Segmented
            value={meal}
            onChange={setMeal}
            options={MEAL_OPTIONS.map((o) => ({
              value: o.value,
              labelUz: t(o.labelKey),
              disabled: usedMeals.has(o.value) && o.value !== meal,
              hint: usedMeals.has(o.value) ? t("addfood_meal_done") : undefined,
            }))}
          />
        </Field>
        {usedMeals.size > 0 && (
          <div className="text-dim text-xs">
            {t("addfood_meal_auto", {
              meal: t(MEAL_OPTIONS.find((o) => o.value === meal)!.labelKey),
            })}
          </div>
        )}

        {photoDataUrl && (
          <div className="rounded-xl overflow-hidden bg-elev2">
            <img src={photoDataUrl} alt="" className="w-full max-h-64 object-cover" />
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onPick(f);
          }}
        />
        <Btn
          variant="gradient"
          onClick={() => fileRef.current?.click()}
          className="w-full"
          disabled={busy}
        >
          {busy
            ? t("addfood_analyzing")
            : photoDataUrl
              ? t("addfood_retake_photo")
              : t("addfood_take_photo")}
        </Btn>
      </Card>

      {busy && (
        <div className="space-y-2 animate-fade-in">
          <SkeletonCard height={180} />
          <SkeletonCard height={100} />
        </div>
      )}

      {analysis && scaled && !busy && (
        <>
          {allergenHits.length > 0 && (
            <DangerBanner>
              <div className="font-semibold mb-0.5">
                ⚠ {t("addfood_allergen_hit")}
              </div>
              <div>{allergenHits.join(", ")}</div>
            </DangerBanner>
          )}

          {dietWarnings.length > 0 && (
            <InfoBanner tone="warn">
              <div className="font-semibold mb-0.5">
                {t("addfood_diet_warning")}
              </div>
              <div>{dietWarnings.join(", ")}</div>
            </InfoBanner>
          )}

          {healthWarnings.length > 0 && (
            <InfoBanner tone="cal">
              <div className="font-semibold mb-0.5">
                {t("addfood_health_flag")}
              </div>
              <ul className="list-disc list-inside">
                {healthWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </InfoBanner>
          )}

          <Card className="space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <div className="font-semibold">
                  {analysis.items[0]?.name ?? t("addfood_result")}
                </div>
                {analysis.items[0]?.brand && (
                  <div className="text-dim text-xs">
                    {t("addfood_brand")}: {analysis.items[0].brand}
                  </div>
                )}
              </div>
              <div className="text-xs text-dim text-right">
                <Chip
                  tone={
                    analysis.confidence > 0.75
                      ? "success"
                      : analysis.confidence > 0.5
                        ? "info"
                        : "warn"
                  }
                >
                  {Math.round(analysis.confidence * 100)}%
                </Chip>
                {scaled.grams > 0 && (
                  <div className="tnum mt-1">
                    ≈ {Math.round(scaled.grams)} {t("unit_g")}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center py-2">
              <div className="font-display text-5xl tnum text-cal">
                {Math.round(scaled.kcal)}
              </div>
              <div className="text-dim text-xs uppercase tracking-wide">
                {t("unit_kcal")}
              </div>
            </div>

            <div className="flex gap-2">
              <MacroChip
                label={t("home_protein")}
                value={scaled.protein_g}
                unit={t("unit_g")}
                color="#2DD4BF"
              />
              <MacroChip
                label={t("home_fat")}
                value={scaled.fat_g}
                unit={t("unit_g")}
                color="#F59E0B"
              />
              <MacroChip
                label={t("home_carbs")}
                value={scaled.carbs_g}
                unit={t("unit_g")}
                color="#F97316"
              />
            </div>
            <div className="flex gap-2">
              <MacroChip
                label={t("home_sugar")}
                value={scaled.sugar_g}
                unit={t("unit_g")}
                color="#EC4899"
              />
              <MacroChip
                label={t("home_salt")}
                value={scaled.salt_g}
                unit={t("unit_g")}
                color="#A78BFA"
              />
            </div>

            {displayNote && (
              <div className="text-cal text-sm bg-cal/10 border border-cal/30 p-3 rounded-xl">
                💡 {displayNote}
              </div>
            )}
          </Card>

          {scaledMicros && rdi && (
            <Card className="space-y-2">
              <div className="font-semibold text-sm">
                {t("addfood_vitamins")}
              </div>
              <ul className="space-y-1.5">
                {MICRO_ROWS.map(({ key, labelKey, unit, rdiKey }) => {
                  const v = scaledMicros[key];
                  if (typeof v !== "number" || v <= 0) return null;
                  const target = rdi[rdiKey];
                  const pct = rdiPercent(v, target);
                  const barColor =
                    pct >= 100 ? "#22C55E" : pct >= 40 ? "#38BDF8" : "#5A6788";
                  return (
                    <li key={key}>
                      <div className="flex justify-between text-sm">
                        <span className="text-dim">{t(labelKey)}</span>
                        <span className="tnum">
                          {Math.round(v * 10) / 10}{" "}
                          <span className="text-dim">
                            {t(`unit_${unit}` as TranslationKey)}
                          </span>
                          <span className="text-mute ml-1 tnum">· {pct}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-elev2 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            background: barColor,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="text-mute text-[10px] mt-2">
                {t("addfood_rdi_note")}
              </div>
            </Card>
          )}

          {analysis.items.length > 1 && (
            <Card className="space-y-2">
              <SectionHeader title={t("addfood_items")} />
              <ul className="space-y-1 text-sm">
                {analysis.items.map((it, i) => {
                  const f = portion / 100;
                  return (
                    <li key={i} className="flex justify-between items-center">
                      <div>
                        <div>
                          {it.name}
                          {it.brand && (
                            <span className="text-dim"> · {it.brand}</span>
                          )}
                        </div>
                        {it.estimatedGrams > 0 && (
                          <div className="text-dim text-xs">
                            ≈ {Math.round(it.estimatedGrams * f)} {t("unit_g")}
                          </div>
                        )}
                      </div>
                      <div className="tnum text-dim text-xs">
                        {Math.round(it.macros.kcal * f)} {t("unit_kcal")}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          <Card className="space-y-3">
            <div className="flex justify-between items-baseline">
              <div className="text-sm">
                {t("addfood_portion")}:{" "}
                <span className="tnum font-semibold text-cal">{portion}%</span>
              </div>
              <div className="text-xs text-dim">{t("addfood_portion_hint")}</div>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={portion}
              onChange={(e) => setPortion(Number(e.target.value))}
              className="w-full"
            />
            <Btn onClick={save} variant="gradient" size="lg" className="w-full">
              {t("addfood_will_eat")}
            </Btn>
          </Card>
        </>
      )}
    </div>
  );
}
