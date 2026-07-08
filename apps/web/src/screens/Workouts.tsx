import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WORKOUT_PLANS, type AiDailyWorkout } from "@kaloriya/shared";
import { Btn, Card, Chip, SectionHeader, SkeletonCard } from "@/components/ui";
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

const INTENSITY_STYLE: Record<
  AiDailyWorkout["intensity"],
  { color: string; tone: "success" | "cal" | "danger" }
> = {
  easy: { color: "#22C55E", tone: "success" },
  moderate: { color: "#FFB020", tone: "cal" },
  hard: { color: "#EF4444", tone: "danger" },
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
      const res = await generateDailyWorkout({
        profile: state.profile,
        targets: state.targets,
        date,
        environment: "home",
        recentWorkouts: state.today.workouts,
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
    <div className="p-4 space-y-3 animate-fade-in">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("workouts_title")}</div>
        <div className="text-dim text-sm">{t("workouts_sub")}</div>
      </header>

      <Card className="space-y-3 overflow-hidden relative">
        {plan && (
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-3xl"
            style={{ background: INTENSITY_STYLE[plan.intensity].color }}
          />
        )}
        <div className="flex items-center justify-between relative">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <span>🩺</span>
              <span>{t("workouts_today")}</span>
            </div>
            <div className="text-dim text-xs mt-0.5">{t("workouts_today_sub")}</div>
          </div>
          {plan && (
            <Chip tone={INTENSITY_STYLE[plan.intensity].tone}>
              {t(`intensity_${plan.intensity}`)}
            </Chip>
          )}
        </div>

        {!plan && !busy && (
          <Btn variant="gradient" onClick={() => generate(false)} className="w-full">
            {t("workouts_generate")}
          </Btn>
        )}

        {busy && (
          <div className="space-y-2">
            <SkeletonCard height={40} />
            <SkeletonCard height={140} />
          </div>
        )}

        {plan && !busy && (
          <div className="space-y-3 relative">
            <div className="text-cal font-display text-lg">{plan.focus}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-elev2 rounded-xl p-2">
                <div className="text-[10px] uppercase tracking-wide text-mute">
                  {t("workouts_duration")}
                </div>
                <div className="tnum font-semibold">
                  {plan.totalMin} {t("unit_min")}
                </div>
              </div>
              <div className="bg-elev2 rounded-xl p-2">
                <div className="text-[10px] uppercase tracking-wide text-mute">
                  {t("workouts_kcal")}
                </div>
                <div className="tnum font-semibold text-burn">
                  {plan.totalKcal}
                </div>
              </div>
              <div className="bg-elev2 rounded-xl p-2">
                <div className="text-[10px] uppercase tracking-wide text-mute">
                  {t("workouts_warmup")}
                </div>
                <div className="tnum font-semibold">
                  {plan.warmupMin}+{plan.cooldownMin}
                </div>
              </div>
            </div>

            {plan.warmupList && plan.warmupList.length > 0 && (
              <div className="bg-elev2/60 border border-line/40 rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-wide text-mute mb-1">
                  {t("workouts_warmup_list")}
                </div>
                <ul className="text-sm space-y-0.5">
                  {plan.warmupList.map((w, i) => (
                    <li key={i} className="text-dim">
                      • {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ol className="space-y-2">
              {plan.exercises.map((ex, i) => (
                <li
                  key={i}
                  className="bg-elev2/60 border border-line/40 rounded-xl p-3 space-y-1 animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
                >
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="font-semibold flex items-center gap-2">
                      <span className="text-mute tnum text-xs">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {typeof ex.rpe === "number" && (
                        <Chip
                          tone={
                            ex.rpe >= 8 ? "danger" : ex.rpe >= 6 ? "cal" : "success"
                          }
                        >
                          RPE {ex.rpe}
                        </Chip>
                      )}
                      <div className="text-xs text-dim tnum">
                        {ex.sets}×{ex.reps} · {ex.restSec}s
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ex.targetMuscle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-body/15 text-body">
                        {ex.targetMuscle}
                      </span>
                    )}
                    {ex.equipment && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-elev3 text-dim">
                        {ex.equipment}
                      </span>
                    )}
                  </div>
                  {ex.notes && <div className="text-xs text-ink mt-1">💡 {ex.notes}</div>}
                </li>
              ))}
            </ol>

            {plan.cooldownList && plan.cooldownList.length > 0 && (
              <div className="bg-elev2/60 border border-line/40 rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-wide text-mute mb-1">
                  {t("workouts_cooldown_list")}
                </div>
                <ul className="text-sm space-y-0.5">
                  {plan.cooldownList.map((w, i) => (
                    <li key={i} className="text-dim">
                      • {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.doctorNote && (
              <div className="bg-cal/10 border border-cal/30 rounded-xl p-3">
                <div className="text-xs text-cal font-semibold mb-1">
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

            {plan.tomorrowHint && (
              <div className="text-mute text-xs italic">
                ⇢ {t("workouts_tomorrow")}: {plan.tomorrowHint}
              </div>
            )}

            <Btn
              variant="ghost"
              onClick={() => generate(true)}
              disabled={busy}
              className="w-full"
            >
              {t("workouts_regenerate")}
            </Btn>
          </div>
        )}
      </Card>

      <SectionHeader title={t("workouts_ready_plans")} />
      {WORKOUT_PLANS.map((p) => (
        <Link key={p.id} to={`/workouts/${p.id}`} className="block">
          <Card className="hover:border-cal transition">
            <div className="flex justify-between items-baseline">
              <div className="font-semibold">{p.nameUz}</div>
              <div className="text-dim text-sm tnum">
                {p.durationMin} {t("unit_min")}
              </div>
            </div>
            <div className="text-dim text-sm mt-1">{p.descriptionUz}</div>
            <div className="text-xs text-mute mt-2">
              {p.home ? t("workouts_home") : t("workouts_gym")} ·{" "}
              {t("workouts_exercises_count", { n: p.exerciseIds.length })}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
