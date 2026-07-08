import { Link } from "react-router-dom";
import type { WaterEntry } from "@kaloriya/shared";
import { sumMacros } from "@kaloriya/shared";
import {
  Bar,
  Btn,
  Card,
  Chip,
  GradientRing,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { CoachBrief } from "@/components/CoachBrief";
import { useApp } from "@/state/AppContext";
import { useI18n } from "@/i18n";

function todayLabel(locale: string, now = new Date()): string {
  try {
    return now.toLocaleDateString(
      locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US",
      { weekday: "long", day: "numeric", month: "long" },
    );
  } catch {
    return now.toDateString();
  }
}

function TrendStrip({
  labels,
  history,
  targetKcal,
}: {
  labels: { title: string; kcal: string; workouts: string };
  history: { date: string; kcal: number; workoutsCount: number }[];
  targetKcal: number;
}) {
  const last7 = history.slice(-7);
  const kcalSeries = last7.map((h) => h.kcal);
  const workouts = last7.reduce((s, h) => s + h.workoutsCount, 0);
  const avg =
    kcalSeries.length > 0
      ? Math.round(kcalSeries.reduce((s, v) => s + v, 0) / kcalSeries.length)
      : 0;
  return (
    <Card className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-dim text-xs uppercase tracking-wide">
            {labels.title}
          </div>
          <div className="font-display text-lg tnum mt-0.5">
            {avg}{" "}
            <span className="text-dim text-xs">{labels.kcal}</span>
          </div>
        </div>
        <div className="text-dim text-xs text-right">
          <div className="tnum text-ink">
            {workouts} <span className="text-dim">{labels.workouts}</span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <Sparkline
          data={kcalSeries.length > 0 ? kcalSeries : [0, 0]}
          color="#FFB020"
          width={200}
          height={40}
        />
        <div className="text-mute text-[10px] tnum text-right">
          target
          <div className="text-cal">{targetKcal}</div>
        </div>
      </div>
    </Card>
  );
}

function WaterCard() {
  const { t } = useI18n();
  const { state, addWater } = useApp();
  const { today, targets } = state;
  const total = today.water.reduce((s, w) => s + w.ml, 0);
  const target = targets?.waterMl ?? 2500;
  const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0;

  function add(ml: number) {
    const entry: WaterEntry = {
      id: crypto.randomUUID(),
      ml,
      createdAt: new Date().toISOString(),
    };
    addWater(entry);
  }

  const cups = [200, 300, 500];

  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-dim text-xs uppercase tracking-wide">
            {t("home_water")}
          </div>
          <div className="font-display text-2xl tnum mt-0.5">
            {total}
            <span className="text-dim text-sm ml-1">
              / {target} {t("unit_ml")}
            </span>
          </div>
        </div>
        <Chip tone={pct >= 100 ? "success" : pct >= 60 ? "info" : "warn"}>
          {Math.round(pct)}%
        </Chip>
      </div>
      <Bar value={total} max={target} color="#38BDF8" height={6} />
      <div className="flex gap-2">
        {cups.map((c) => (
          <button
            key={c}
            onClick={() => add(c)}
            className="flex-1 bg-water/15 text-water border border-water/30 rounded-xl py-2 text-sm font-semibold hover:bg-water/25 active:scale-[0.98] transition"
          >
            +{c} {t("unit_ml")}
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function Home() {
  const { state } = useApp();
  const { t, locale } = useI18n();
  const { profile, targets, today, history, streak } = state;
  if (!profile || !targets) return null;

  const totals = sumMacros(
    today.foods.map((f) => ({ macros: f.macros, portionPct: f.portionPct })),
  );
  const burned = today.workouts.reduce((s, w) => s + w.kcalBurned, 0);
  const net = Math.max(0, totals.kcal - burned);
  const remaining = Math.max(0, targets.dailyKcal - net);
  const over = Math.max(0, net - targets.dailyKcal);
  const ratio = net / Math.max(1, targets.dailyKcal);

  const gradient: [string, string] =
    ratio < 0.85
      ? ["#FFB020", "#FF5A3C"]
      : ratio < 1.05
        ? ["#22C55E", "#2DD4BF"]
        : ["#F97316", "#EF4444"];
  const glowClass =
    ratio < 1.05 ? "shadow-glow-cal" : "shadow-glow-burn";

  const daySummary = {
    date: today.date,
    kcal: Math.round(totals.kcal),
    proteinG: Math.round(totals.protein_g),
    fatG: Math.round(totals.fat_g),
    carbsG: Math.round(totals.carbs_g),
    waterMl: today.water.reduce((s, w) => s + w.ml, 0),
    workoutsCount: today.workouts.length,
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="pt-4 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-dim text-xs uppercase tracking-wide">
              {todayLabel(locale)}
            </div>
            <div className="font-display text-2xl mt-0.5">
              {t("home_hello", { name: profile.name })}
            </div>
          </div>
          {streak > 0 && (
            <Chip tone="cal">
              🔥 <span className="tnum">{streak}</span> {t("home_streak")}
            </Chip>
          )}
        </div>
      </header>

      <div className="relative flex justify-center">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none rounded-full" />
        <GradientRing
          value={net}
          max={targets.dailyKcal}
          size={240}
          thickness={18}
          gradient={gradient}
          glowClass={glowClass}
          centerLabel={
            <span className="tnum" style={{ color: "#EAF0FF" }}>
              {Math.round(net)}
            </span>
          }
          centerSub={t("unit_kcal")}
        />
      </div>

      <Card className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-dim">{t("home_consumed")}</span>
          <span className="tnum">
            {Math.round(totals.kcal)} {t("unit_kcal")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-dim">{t("home_burned")}</span>
          <span className="tnum text-burn">
            −{Math.round(burned)} {t("unit_kcal")}
          </span>
        </div>
        <div className="border-t border-line/40 pt-2 flex justify-between text-sm">
          <span className="text-dim">
            {over > 0 ? t("home_over") : t("home_remaining")}
          </span>
          <span
            className={`tnum font-semibold ${over > 0 ? "text-burn" : "text-cal"}`}
          >
            {over > 0 ? `+${over}` : remaining} {t("unit_kcal")}
          </span>
        </div>
      </Card>

      <div className="flex gap-2">
        <StatTile
          label={t("home_protein")}
          value={Math.round(totals.protein_g)}
          unit={`/ ${targets.proteinG}${t("unit_g")}`}
          color="#2DD4BF"
          bar={{ value: totals.protein_g, max: targets.proteinG }}
        />
        <StatTile
          label={t("home_fat")}
          value={Math.round(totals.fat_g)}
          unit={`/ ${targets.fatG}${t("unit_g")}`}
          color="#F59E0B"
          bar={{ value: totals.fat_g, max: targets.fatG }}
        />
        <StatTile
          label={t("home_carbs")}
          value={Math.round(totals.carbs_g)}
          unit={`/ ${targets.carbsG}${t("unit_g")}`}
          color="#F97316"
          bar={{ value: totals.carbs_g, max: targets.carbsG }}
        />
      </div>

      <WaterCard />

      <CoachBrief profile={profile} targets={targets} today={daySummary} />

      <SectionHeader
        title={t("home_trend")}
        subtitle={t("home_trend_sub")}
      />
      <TrendStrip
        labels={{
          title: t("home_trend_7d"),
          kcal: t("unit_kcal"),
          workouts: t("home_trend_workouts"),
        }}
        history={history}
        targetKcal={targets.dailyKcal}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/food/add"
          className="bg-cal-gradient text-bg rounded-2xl p-4 font-semibold text-center shadow-glow-cal active:scale-[0.98] transition"
        >
          {t("home_add_food")}
        </Link>
        <Link
          to="/workouts"
          className="bg-burn-gradient text-ink rounded-2xl p-4 font-semibold text-center shadow-glow-burn active:scale-[0.98] transition"
        >
          {t("home_start_workout")}
        </Link>
      </div>
    </div>
  );
}
