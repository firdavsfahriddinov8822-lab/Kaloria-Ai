import { Link } from "react-router-dom";
import type { MealType } from "@kaloriya/shared";
import { mealBudget, sumMacros } from "@kaloriya/shared";
import { Card } from "@/components/ui";
import { useApp } from "@/state/AppContext";

const MEALS: { key: MealType; labelUz: string }[] = [
  { key: "breakfast", labelUz: "Nonushta" },
  { key: "lunch", labelUz: "Tushlik" },
  { key: "dinner", labelUz: "Kechki ovqat" },
  { key: "snack", labelUz: "Snak" },
];

export default function Food() {
  const { state, removeFood } = useApp();
  const { targets, today } = state;
  if (!targets) return null;

  return (
    <div className="p-4 space-y-3">
      <header className="pt-4 flex justify-between items-center">
        <div className="font-display text-2xl">Ovqat</div>
        <Link
          to="/food/add"
          className="bg-cal text-bg px-3 py-2 rounded-xl font-semibold"
        >
          + Qo'shish
        </Link>
      </header>

      {MEALS.map((m) => {
        const items = today.foods.filter((f) => f.meal === m.key);
        const totals = sumMacros(
          items.map((f) => ({ macros: f.macros, portionPct: f.portionPct })),
        );
        const budget = mealBudget(targets.dailyKcal, m.key);
        return (
          <Card key={m.key}>
            <div className="flex justify-between items-baseline">
              <div className="font-semibold">{m.labelUz}</div>
              <div className="text-dim text-sm tnum">
                {Math.round(totals.kcal)} / {budget} kkal
              </div>
            </div>
            {items.length === 0 ? (
              <div className="text-dim text-sm mt-2">Hozircha bo'sh</div>
            ) : (
              <ul className="mt-2 space-y-1">
                {items.map((f) => (
                  <li
                    key={f.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>
                      {f.name}{" "}
                      <span className="text-dim">({f.portionPct}%)</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="tnum text-dim">
                        {Math.round((f.macros.kcal * f.portionPct) / 100)} kkal
                      </span>
                      <button
                        onClick={() => removeFood(f.id)}
                        className="text-burn text-xs"
                      >
                        o'chirish
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}
