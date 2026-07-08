import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WORKOUT_PLANS, type AiDailyWorkout } from "@kaloriya/shared";
import { Btn, Card } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";
import { generateDailyWorkout } from "@/lib/ai";
import { storageGet, storageSet } from "@/lib/storage";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function cacheKey(uid: string, date: string): string {
  return `u:${uid}:workout:${date}`;
}

const INTENSITY_COLOR: Record<AiDailyWorkout["intensity"], string> = {
  easy: "#2DD4BF",
  moderate: "#FFB020",
  hard: "#FF5A3C",
};

export default function Workouts() {
  const { t, locale } = useI18n();
  const { state, toast } = useApp();
  const uid = state.user?.id ?? "_local";
  const date = todayIso();
  const [plan, setPlan] = useState<AiDailyWorkout | undefined>(() =>
    storageGet<AiDailyWorkout | undefined>(cacheKey(uid, date), undefined),
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPlan(storageGet<AiDailyWorkout | undefined>(cacheKey(uid, date), undefined));
  }, [uid, date]);

  async function generate(force = false) {
    if (!state.profile || !state.targets) {
      toast(t("workouts_need_profile"), "warn");
      return;
    }
    if (!force) {
      const cached = storageGet<AiDailyWorkout | undefined>(cacheKey(uid, date), undefined);
      if (cached) {
        setPlan(cached);
        return;
      }
    }
    setBusy(true);
    try {
      const recentWorkouts = state.today.workouts;
      const res = await generateDailyWorkout({
        profile: state.profile,
        targets: state.targets,
        date,
        environment: "home",
        recentWorkouts,
        locale,
      });
      setPlan(res);
      storageSet(cacheKey(uid, date), res);
    } catch (e) {
      toast(e instanceof Error ? e.message : t("addfood_ai_error"), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 space-y-3">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("workouts_title")}</div>
        <div className="text-dim text-sm">{t("workouts_sub")}</div>
      </header>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{t("workouts_today")}</div>
            <div className="text-dim text-xs">{t("workouts_today_sub")}</div>
          </div>
          {plan && (
            <div
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                background: INTENSITY_COLOR[plan.intensity] + "20",
                color: INTENSITY_COLOR[plan.intensity],
              }}
            >
              {t(`intensity_${plan.intensity}`)}
            </div>
          )}
        </div>

        {!plan && (
          <Btn onClick={() => generate(false)} disabled={busy} className="w-full">
            {busy ? t("workouts_generating") : t("workouts_generate")}
          </Btn>
        )}

        {plan && (
          <div className="space-y-3">
            <div className="text-cal font-display text-lg">{plan.focus}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-elev2 rounded-xl p-2">
                <div className="text-xs text-dim">{t("workouts_duration")}</div>
                <div className="tnum font-semibold">
                  {plan.totalMin} {t("unit_min")}
                </div>
              </div>
              <div className="bg-elev2 rounded-xl p-2">
                <div className="text-xs text-dim">{t("workouts_kcal")}</div>
                <div className="tnum font-semibold text-burn">
                  {plan.totalKcal}
                </div>
              </div>
              <div className="bg-elev2 rounded-xl p-2">
                <div className="text-xs text-dim">{t("workouts_warmup")}</div>
                <div className="tnum font-semibold">
                  {plan.warmupMin}+{plan.cooldownMin}
                </div>
              </div>
            </div>

            <ol className="space-y-2">
              {plan.exercises.map((ex, i) => (
                <li key={i} className="bg-elev2 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold">
                      {i + 1}. {ex.name}
                    </div>
                    <div className="text-xs text-dim tnum">
                      {ex.sets} × {ex.reps} · {ex.restSec}s
                    </div>
                  </div>
                  {ex.targetMuscle && (
                    <div className="text-xs text-dim">
                      {t("workouts_target")}: {ex.targetMuscle}
                    </div>
                  )}
                  {ex.equipment && (
                    <div className="text-xs text-dim">
                      {t("workouts_equipment")}: {ex.equipment}
                    </div>
                  )}
                  {ex.notes && <div className="text-xs text-ink">💡 {ex.notes}</div>}
                </li>
              ))}
            </ol>

            {plan.doctorNote && (
              <div className="bg-elev2 rounded-xl p-3">
                <div className="text-xs text-dim mb-1">
                  🩺 {t("workouts_doctor_note")}
                </div>
                <div className="text-sm">{plan.doctorNote}</div>
              </div>
            )}

            {plan.reminders && plan.reminders.length > 0 && (
              <ul className="space-y-1 text-xs text-dim">
                {plan.reminders.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            )}

            <Btn
              variant="ghost"
              onClick={() => generate(true)}
              disabled={busy}
              className="w-full"
            >
              {busy ? t("workouts_generating") : t("workouts_regenerate")}
            </Btn>
          </div>
        )}
      </Card>

      <div className="text-dim text-xs pt-2 pb-1 uppercase tracking-wide">
        {t("workouts_ready_plans")}
      </div>
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
