import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AiFoodAnalysis, MealType } from "@kaloriya/shared";
import { Btn, Card, Field, Segmented } from "@/components/ui";
import { analyzeFoodPhoto } from "@/lib/ai";
import { useI18n, type TranslationKey } from "@/i18n";
import { useApp } from "@/state/AppContext";

const MEAL_OPTIONS: { value: MealType; labelKey: TranslationKey }[] = [
  { value: "breakfast", labelKey: "meal_breakfast" },
  { value: "lunch", labelKey: "meal_lunch" },
  { value: "dinner", labelKey: "meal_dinner" },
  { value: "snack", labelKey: "meal_snack" },
];

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

export default function AddFood() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { addFood, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [meal, setMeal] = useState<MealType>("lunch");
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
    };
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
    const base64 = dataUrl.split(",")[1] ?? "";
    try {
      const res = await analyzeFoodPhoto(base64);
      setAnalysis(res);
    } catch (e) {
      toast(e instanceof Error ? e.message : t("addfood_ai_error"), "error");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!analysis) return;
    addFood({
      id: crypto.randomUUID(),
      name: analysis.items[0]?.name ?? t("addfood_result"),
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
            options={MEAL_OPTIONS.map((o) => ({ value: o.value, labelUz: t(o.labelKey) }))}
          />
        </Field>

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
              <div className="font-semibold">{t("addfood_result")}</div>
              <div className="text-xs text-dim">
                {t("addfood_confidence")}: {Math.round(analysis.confidence * 100)}%
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

            {analysis.noteUz && (
              <div className="text-cal text-sm bg-elev2 p-3 rounded-xl">
                💡 {analysis.noteUz}
              </div>
            )}
          </Card>

          {analysis.items.length > 0 && (
            <Card className="space-y-2">
              <div className="font-semibold text-sm">{t("addfood_items")}</div>
              <ul className="space-y-1 text-sm">
                {analysis.items.map((it, i) => {
                  const f = portion / 100;
                  return (
                    <li key={i} className="flex justify-between items-center">
                      <div>
                        <div>{it.name}</div>
                        {it.reason && (
                          <div className="text-dim text-xs">{it.reason}</div>
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
