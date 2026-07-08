import { Link } from "react-router-dom";
import { WORKOUT_PLANS } from "@kaloriya/shared";
import { Card } from "@/components/ui";
import { useI18n } from "@/i18n";

export default function Workouts() {
  const { t } = useI18n();
  return (
    <div className="p-4 space-y-3">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("workouts_title")}</div>
        <div className="text-dim text-sm">{t("workouts_sub")}</div>
      </header>
      {WORKOUT_PLANS.map((p) => (
        <Link key={p.id} to={`/workouts/${p.id}`} className="block">
          <Card className="hover:border-cal">
            <div className="flex justify-between items-baseline">
              <div className="font-semibold">{p.nameUz}</div>
              <div className="text-dim text-sm tnum">
                {p.durationMin} {t("unit_min")}
              </div>
            </div>
            <div className="text-dim text-sm mt-1">{p.descriptionUz}</div>
            <div className="text-xs text-dim mt-2">
              {p.home ? t("workouts_home") : t("workouts_gym")} ·{" "}
              {t("workouts_exercises_count", { n: p.exerciseIds.length })}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
