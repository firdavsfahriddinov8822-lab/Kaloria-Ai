import type { DaySummary, DerivedTargets, Profile } from "@kaloriya/shared";
import { proteinPerKg, scoreDay } from "@kaloriya/shared";
import { useI18n, type Locale } from "@/i18n";

interface TipSpec {
  uz: string;
  ru: string;
  en: string;
  tone: "cal" | "info" | "warn" | "danger";
}

function pick(spec: TipSpec, locale: Locale): string {
  return spec[locale];
}

export interface CoachBriefProps {
  profile: Profile;
  targets: DerivedTargets;
  today: DaySummary;
}

function buildTips(p: CoachBriefProps): TipSpec[] {
  const { profile, targets, today } = p;
  const flags = scoreDay({
    kcalConsumed: today.kcal,
    kcalTarget: targets.dailyKcal,
    proteinG: today.proteinG,
    proteinTargetG: targets.proteinG,
    fiberG: 0,
    fiberTargetG: 25,
    sodiumMg: 0,
    sugarG: 0,
    waterMl: today.waterMl,
    waterTargetMl: targets.waterMl,
  });

  const tips: TipSpec[] = [];
  const remaining = targets.dailyKcal - today.kcal;
  const proteinDelta = Math.round(profile.weightKg * proteinPerKg(profile.goal)) - today.proteinG;

  if (flags.find((f) => f.kind === "calorie_over" && f.severity === "risk")) {
    tips.push({
      uz: `Bugungi kaloriya me'yordan ${today.kcal - targets.dailyKcal} kkal ko'p. Bugun qo'shimcha yurish yoki yengil kardio foydali.`,
      ru: `Сегодняшние калории на ${today.kcal - targets.dailyKcal} ккал выше нормы. Добавьте прогулку или лёгкое кардио.`,
      en: `You are ${today.kcal - targets.dailyKcal} kcal over target. Add a walk or light cardio today.`,
      tone: "warn",
    });
  } else if (remaining > 0 && today.kcal > 0) {
    tips.push({
      uz: `Yana ${remaining} kkalga joyingiz bor — kechki ovqatga oqsilga boy taom tanlang.`,
      ru: `Осталось ${remaining} ккал — на ужин выберите блюдо с высоким содержанием белка.`,
      en: `${remaining} kcal budget remaining — pick a protein-forward dinner.`,
      tone: "info",
    });
  }

  if (proteinDelta > 20) {
    tips.push({
      uz: `Oqsil me'yorigacha ${proteinDelta} g qoldi. Tuxum, tovuq yoki tvorog — eng oson yordamchi.`,
      ru: `Осталось ${proteinDelta} г белка. Яйца, курица или творог — лучший выбор.`,
      en: `${proteinDelta} g of protein still to go — eggs, chicken or Greek yogurt help.`,
      tone: "cal",
    });
  }

  const waterPct = targets.waterMl > 0 ? today.waterMl / targets.waterMl : 0;
  if (waterPct < 0.5) {
    tips.push({
      uz: `Suv ichishni oshiring — hozircha ${today.waterMl} ml / ${targets.waterMl} ml.`,
      ru: `Пейте больше воды — сейчас ${today.waterMl} мл из ${targets.waterMl} мл.`,
      en: `Drink more water — currently ${today.waterMl} ml of ${targets.waterMl} ml.`,
      tone: "info",
    });
  }

  if (today.workoutsCount === 0 && new Date().getHours() >= 17) {
    tips.push({
      uz: `Bugun mashq qilinmadi. Kechga qadar 20-30 daq harakat sog'liq va uyquga foyda.`,
      ru: `Сегодня без тренировки. 20-30 минут движения к вечеру улучшат сон.`,
      en: `No workout logged today. A 20-30 min session before evening improves sleep quality.`,
      tone: "cal",
    });
  }

  if (tips.length === 0) {
    tips.push({
      uz: `Boshlanish yaxshi. Har ovqatdan keyin 5 daqiqa yurish — hazm uchun eng kuchli odat.`,
      ru: `Хорошее начало. 5-минутная прогулка после еды — самая полезная привычка для пищеварения.`,
      en: `Good start. A 5-minute walk after each meal is the strongest habit for digestion.`,
      tone: "info",
    });
  }

  return tips.slice(0, 2);
}

export function CoachBrief(props: CoachBriefProps) {
  const { locale, t } = useI18n();
  const tips = buildTips(props);

  return (
    <div className="bg-elev/80 card-glass hairline border border-line/60 rounded-2xl p-4 shadow-card space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">🩺</span>
        <div className="font-display text-sm">{t("home_doctor_brief")}</div>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => {
          const border = {
            cal: "border-cal/40 bg-cal/10 text-cal",
            info: "border-info/40 bg-info/10 text-info",
            warn: "border-warn/40 bg-warn/10 text-warn",
            danger: "border-danger/40 bg-danger/10 text-danger",
          }[tip.tone];
          return (
            <li
              key={i}
              className={`text-sm border rounded-xl px-3 py-2 ${border}`}
            >
              {pick(tip, locale)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
