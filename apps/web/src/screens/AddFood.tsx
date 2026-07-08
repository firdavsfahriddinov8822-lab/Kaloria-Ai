import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AiFoodAnalysis, FoodMicros, MealType } from "@kaloriya/shared";
import { Btn, Card, Field, Segmented } from "@/components/ui";
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
    <div className="bg-elev2 rounded-xl p-3 flex-1">
      <div className="text-xs text-dim">{label}</div>
      <div className="font-display text-lg tnum" style={{ color }}>
        {Math.round(value * 10) / 10}
        <span className="text-dim text-xs ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

function VitaminRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <li className="flex justify-between text-sm">
      <span className="text-dim">{label}</span>
      <span className="tnum">
        {Math.round(value * 10) / 10} <span className="text-dim">{unit}</span>
      </span>
    </li>
  );
}

const MICRO_LABELS: {
  key: keyof FoodMicros;
  labelKey: TranslationKey;
  unit: "g" | "mg" | "mcg";
}[] = [
  { key: "fiber_g", labelKey: "nutr_fiber", unit: "g" },
  { key: "vitamin_a_mcg", labelKey: "nutr_vit_a", unit: "mcg" },
  { key: "vitamin_c_mg", labelKey: "nutr_vit_c", unit: "mg" },
  { key: "vitamin_d_mcg", labelKey: "nutr_vit_d", unit: "mcg" },
  { key: "vitamin_b12_mcg", labelKey: "nutr_vit_b12", unit: "mcg" },
  { key: "iron_mg", labelKey: "nutr_iron", unit: "mg" },
  { key: "calcium_mg", labelKey: "nutr_calcium", unit: "mg" },
  { key: "potassium_mg", labelKey: "nutr_potassium", unit: "mg" },
  { key: "sodium_mg", labelKey: "nutr_sodium", unit: "mg" },
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
    for (const { key } of MICRO_LABELS) {
      const v = src[key];
      if (typeof v === "number" && v > 0) out[key] = v * f;
    }
    return Object.keys(out).length > 0 ? out : null;
  }, [analysis, portion]);

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
      const res = await analyzeFoodPhoto(base64, { locale });
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

  return (
    <div className="p-4 space-y-4">
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
            {t("addfood_meal_auto", { meal: t(MEAL_OPTIONS.find((o) => o.value === meal)!.labelKey) })}
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
        <Btn onClick={() => fileRef.current?.click()} className="w-full" disabled={busy}>
          {busy
            ? t("addfood_analyzing")
            : photoDataUrl
              ? t("addfood_retake_photo")
              : t("addfood_take_photo")}
        </Btn>
      </Card>

      {analysis && scaled && (
        <>
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
                <div>
                  {t("addfood_confidence")}: {Math.round(analysis.confidence * 100)}%
                </div>
                {scaled.grams > 0 && (
                  <div className="tnum">
                    ≈ {Math.round(scaled.grams)} {t("unit_g")}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center py-2">
              <div className="font-display text-5xl tnum text-cal">
                {Math.round(scaled.kcal)}
              </div>
              <div className="text-dim text-sm">{t("unit_kcal")}</div>
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
                color="#FFB020"
              />
              <MacroChip
                label={t("home_carbs")}
                value={scaled.carbs_g}
                unit={t("unit_g")}
                color="#FF5A3C"
              />
            </div>
            <div className="flex gap-2">
              <MacroChip
                label={t("home_sugar")}
                value={scaled.sugar_g}
                unit={t("unit_g")}
                color="#EAF0FF"
              />
              <MacroChip
                label={t("home_salt")}
                value={scaled.salt_g}
                unit={t("unit_g")}
                color="#EAF0FF"
              />
            </div>

            {displayNote && (
              <div className="text-cal text-sm bg-elev2 p-3 rounded-xl">
                💡 {displayNote}
              </div>
            )}
          </Card>

          {scaledMicros && (
            <Card className="space-y-2">
              <div className="font-semibold text-sm">{t("addfood_vitamins")}</div>
              <ul className="space-y-1">
                {MICRO_LABELS.map(({ key, labelKey, unit }) => {
                  const v = scaledMicros[key];
                  if (typeof v !== "number" || v <= 0) return null;
                  return (
                    <VitaminRow
                      key={key}
                      label={t(labelKey)}
                      value={v}
                      unit={t(`unit_${unit}` as TranslationKey)}
                    />
                  );
                })}
              </ul>
            </Card>
          )}

          {analysis.items.length > 1 && (
            <Card className="space-y-2">
              <div className="font-semibold text-sm">{t("addfood_items")}</div>
              <ul className="space-y-1 text-sm">
                {analysis.items.map((it, i) => {
                  const f = portion / 100;
                  return (
                    <li key={i} className="flex justify-between items-center">
                      <div>
                        <div>
                          {it.name}
                          {it.brand ? (
                            <span className="text-dim"> · {it.brand}</span>
                          ) : null}
                        </div>
                        {it.estimatedGrams > 0 && (
                          <div className="text-dim text-xs">
                            ≈ {Math.round(it.estimatedGrams * f)} {t("unit_g")}
                          </div>
                        )}
                      </div>
                      <div className="tnum text-dim text-xs">
                        {Math.round(it.macros.kcal * f)} {t("unit_kcal")} · P{" "}
                        {Math.round(it.macros.protein_g * f)}g
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
              className="w-full accent-[#FFB020]"
            />
            <Btn onClick={save} className="w-full text-lg">
              {t("addfood_will_eat")}
            </Btn>
          </Card>
        </>
      )}
    </div>
  );
}
