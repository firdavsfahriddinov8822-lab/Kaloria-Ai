import { Link } from "react-router-dom";
import { WORKOUT_PLANS } from "@kaloriya/shared";
import { Card } from "@/components/ui";

export default function Workouts() {
  return (
    <div className="p-4 space-y-3">
      <header className="pt-4">
        <div className="font-display text-2xl">Mashqlar</div>
        <div className="text-dim text-sm">
          Tayyor dasturlar — uy yoki zal uchun.
        </div>
      </header>
      {WORKOUT_PLANS.map((p) => (
        <Link key={p.id} to={`/workouts/${p.id}`} className="block">
          <Card className="hover:border-cal">
            <div className="flex justify-between items-baseline">
              <div className="font-semibold">{p.nameUz}</div>
              <div className="text-dim text-sm tnum">
                {p.durationMin} daq
              </div>
            </div>
            <div className="text-dim text-sm mt-1">{p.descriptionUz}</div>
            <div className="text-xs text-dim mt-2">
              {p.home ? "Uy" : "Sport zali"} · {p.exerciseIds.length} mashq
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
