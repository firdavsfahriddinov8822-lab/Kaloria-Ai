import { Link } from "react-router-dom";
import { sumMacros } from "@kaloriya/shared";
import { Bar, Card, Ring } from "@/components/ui";
import { useApp } from "@/state/AppContext";

export default function Home() {
  const { state } = useApp();
  const { profile, targets, today } = state;
  if (!profile || !targets) return null;

  const totals = sumMacros(
    today.foods.map((f) => ({ macros: f.macros, portionPct: f.portionPct })),
  );
  const burned = today.workouts.reduce((s, w) => s + w.kcalBurned, 0);
  const net = Math.max(0, totals.kcal - burned);
  const water = today.water.reduce((s, w) => s + w.ml, 0);

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="text-dim text-sm">Salom, {profile.name}</div>
        <div className="font-display text-2xl">Bugungi maqsad</div>
      </header>

      <Card className="flex items-center gap-4">
        <Ring
          value={net}
          max={targets.dailyKcal}
          color="#FFB020"
          label="kkal"
        />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-dim">Iste'mol</span>
            <span className="tnum">{Math.round(totals.kcal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dim">Yoqilgan</span>
            <span className="tnum">{Math.round(burned)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dim">Qolgan</span>
            <span className="tnum">
              {Math.max(0, targets.dailyKcal - net)}
            </span>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="text-sm text-dim">Makrolar</div>
        <div>
          <div className="flex justify-between text-sm">
            <span>Protein</span>
            <span className="tnum">
              {Math.round(totals.protein_g)} / {targets.proteinG} g
            </span>
          </div>
          <Bar value={totals.protein_g} max={targets.proteinG} color="#2DD4BF" />
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span>Yog'</span>
            <span className="tnum">
              {Math.round(totals.fat_g)} / {targets.fatG} g
            </span>
          </div>
          <Bar value={totals.fat_g} max={targets.fatG} color="#FFB020" />
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span>Karbon</span>
            <span className="tnum">
              {Math.round(totals.carbs_g)} / {targets.carbsG} g
            </span>
          </div>
          <Bar value={totals.carbs_g} max={targets.carbsG} color="#FF5A3C" />
        </div>
      </Card>

      <Card>
        <div className="text-sm text-dim">Suv</div>
        <div className="font-display text-xl">
          {water} <span className="text-dim text-base">/ {targets.waterMl} ml</span>
        </div>
        <Bar value={water} max={targets.waterMl} color="#2DD4BF" />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/food/add"
          className="bg-cal text-bg rounded-2xl p-4 font-semibold text-center"
        >
          + Ovqat qo'shish
        </Link>
        <Link
          to="/workouts"
          className="bg-burn text-ink rounded-2xl p-4 font-semibold text-center"
        >
          Mashqni boshlash
        </Link>
      </div>
    </div>
  );
}
