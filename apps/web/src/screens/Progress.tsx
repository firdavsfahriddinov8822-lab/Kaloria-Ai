import { useMemo, useState } from "react";
import { bmiCategory } from "@kaloriya/shared";
import {
  Btn,
  Card,
  Chip,
  HealthBadge,
  NumInput,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { WeightChart } from "@/components/charts";
import { useI18n, type TranslationKey } from "@/i18n";
import { useApp } from "@/state/AppContext";

type Range = 7 | 30 | 90;

const BMI_TONE: Record<
  ReturnType<typeof bmiCategory>,
  { tone: "warn" | "success" | "cal" | "danger"; key: TranslationKey }
> = {
  underweight: { tone: "warn", key: "bmi_underweight" },
  healthy: { tone: "success", key: "bmi_healthy" },
  overweight: { tone: "cal", key: "bmi_overweight" },
  obese: { tone: "danger", key: "bmi_obese" },
};

export default function Progress() {
  const { t } = useI18n();
  const { state, addWeight, toast } = useApp();
  const { targets, weights, profile } = state;
  const [w, setW] = useState<number>(profile?.weightKg ?? 70);
  const [range, setRange] = useState<Range>(30);

  function log() {
    if (!w) return;
    addWeight({
      id: crypto.randomUUID(),
      weightKg: w,
      createdAt: new Date().toISOString(),
    });
    toast(t("progress_weight_saved"), "success");
  }

  const sorted = useMemo(
    () =>
      [...weights].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [weights],
  );

  const chartPoints = useMemo(() => {
    const cutoff = Date.now() - range * 24 * 3600 * 1000;
    return sorted
      .filter((entry) => new Date(entry.createdAt).getTime() >= cutoff)
      .map((entry) => ({
        date: entry.createdAt.slice(0, 10),
        value: entry.weightKg,
      }));
  }, [sorted, range]);

  const latest = sorted[sorted.length - 1]?.weightKg ?? profile?.weightKg;
  const first = sorted[0]?.weightKg;
  const delta =
    typeof latest === "number" && typeof first === "number"
      ? Math.round((latest - first) * 10) / 10
      : 0;

  const currentBmi = targets?.bmi ?? (profile ? profile.weightKg / Math.pow(profile.heightCm / 100, 2) : 0);
  const category = bmiCategory(currentBmi);
  const catTone = BMI_TONE[category];

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("progress_title")}</div>
        <div className="text-dim text-sm">{t("progress_sub")}</div>
      </header>

      <Card className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-dim text-xs uppercase tracking-wide">
              {t("progress_current_weight")}
            </div>
            <div className="font-display text-4xl tnum mt-1">
              {latest ?? "—"}
              <span className="text-dim text-base ml-1">{t("unit_kg")}</span>
            </div>
          </div>
          {delta !== 0 && (
            <Chip tone={delta < 0 ? "success" : "warn"}>
              {delta > 0 ? "+" : ""}
              {delta} {t("unit_kg")}
            </Chip>
          )}
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                range === r
                  ? "bg-cal text-bg shadow-glow-cal"
                  : "bg-elev2 text-dim hover:text-ink"
              }`}
            >
              {r} {t("progress_days")}
            </button>
          ))}
        </div>
        <WeightChart
          points={chartPoints}
          targetKg={profile?.targetWeightKg}
          color="#2DD4BF"
        />
      </Card>

      <div className="flex gap-2">
        <StatTile
          label="BMI"
          value={currentBmi.toFixed(1)}
          color={
            category === "healthy"
              ? "#22C55E"
              : category === "obese"
                ? "#EF4444"
                : "#FFB020"
          }
        />
        <div className="flex-1 bg-elev2/70 border border-line/40 rounded-2xl p-3 flex flex-col justify-between">
          <div className="text-[11px] uppercase tracking-wide text-mute">
            {t("progress_bmi_status")}
          </div>
          <div className="mt-2">
            <HealthBadge
              status={
                category === "healthy"
                  ? "good"
                  : category === "obese"
                    ? "risk"
                    : "watch"
              }
              labels={{
                good: t(catTone.key),
                watch: t(catTone.key),
                risk: t(catTone.key),
              }}
            />
          </div>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="font-semibold">{t("progress_new_weight")}</div>
        <NumInput value={w} onChange={(e) => setW(Number(e.target.value) || 0)} />
        <Btn onClick={log} className="w-full" variant="gradient">
          {t("save")}
        </Btn>
      </Card>

      <SectionHeader
        title={t("progress_records")}
        subtitle={sorted.length > 0 ? `${sorted.length}` : undefined}
      />
      <Card>
        {sorted.length === 0 ? (
          <div className="text-dim text-sm">{t("progress_no_records")}</div>
        ) : (
          <ul className="text-sm space-y-1">
            {[...sorted].reverse().map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between text-dim tnum py-1"
              >
                <span>{entry.createdAt.slice(0, 10)}</span>
                <span className="text-ink">
                  {entry.weightKg} {t("unit_kg")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
