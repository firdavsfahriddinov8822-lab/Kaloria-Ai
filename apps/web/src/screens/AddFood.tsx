import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AiFoodAnalysis, MealType } from "@kaloriya/shared";
import { Btn, Card, Field, NumInput, Segmented } from "@/components/ui";
import { analyzeFoodPhoto } from "@/lib/ai";
import { useApp } from "@/state/AppContext";

const MEAL_OPTIONS: { value: MealType; labelUz: string }[] = [
  { value: "breakfast", labelUz: "Nonushta" },
  { value: "lunch", labelUz: "Tushlik" },
  { value: "dinner", labelUz: "Kechki" },
  { value: "snack", labelUz: "Snak" },
];

export default function AddFood() {
  const nav = useNavigate();
  const { addFood, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [meal, setMeal] = useState<MealType>("lunch");
  const [analysis, setAnalysis] = useState<AiFoodAnalysis | undefined>();
  const [portion, setPortion] = useState(100);
  const [busy, setBusy] = useState(false);

  async function onPick(file: File) {
    setBusy(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read fail"));
      r.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1] ?? "";
    try {
      const res = await analyzeFoodPhoto(base64);
      setAnalysis(res);
    } catch (e) {
      toast(e instanceof Error ? e.message : "AI xatolik", "error");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!analysis) return;
    addFood({
      id: crypto.randomUUID(),
      name: analysis.items[0]?.name ?? "Ovqat",
      meal,
      portionPct: portion,
      macros: analysis.totals,
      confidence: analysis.confidence,
      createdAt: new Date().toISOString(),
      source: "ai",
    });
    toast("Ovqat qo'shildi", "success");
    nav("/food");
  }

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="font-display text-2xl">Ovqat qo'shish</div>
        <div className="text-dim text-sm">
          Rasmga oling — AI kaloriya va makrolarni hisoblaydi.
        </div>
      </header>

      <Card className="space-y-3">
        <Field label="Ovqat turi">
          <Segmented value={meal} onChange={setMeal} options={MEAL_OPTIONS} />
        </Field>
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
        <Btn onClick={() => fileRef.current?.click()} className="w-full">
          {busy ? "Tahlil qilinmoqda..." : "Rasm olish"}
        </Btn>
      </Card>

      {analysis && (
        <Card className="space-y-3">
          <div className="font-semibold">Tahlil natijasi</div>
          <ul className="text-sm space-y-1">
            {analysis.items.map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>{it.name}</span>
                <span className="tnum text-dim">
                  {Math.round(it.macros.kcal)} kkal
                </span>
              </li>
            ))}
          </ul>
          <div className="text-sm text-dim tnum">
            Jami: {Math.round(analysis.totals.kcal)} kkal · P{" "}
            {Math.round(analysis.totals.protein_g)}g · Y{" "}
            {Math.round(analysis.totals.fat_g)}g · K{" "}
            {Math.round(analysis.totals.carbs_g)}g
          </div>
          {analysis.noteUz && (
            <div className="text-cal text-sm">{analysis.noteUz}</div>
          )}
          <Field label={`Porsiya: ${portion}%`}>
            <NumInput
              type="range"
              min={10}
              max={150}
              step={5}
              value={portion}
              onChange={(e) => setPortion(Number(e.target.value))}
            />
          </Field>
          <Btn onClick={save} className="w-full">
            Saqlash
          </Btn>
        </Card>
      )}
    </div>
  );
}
