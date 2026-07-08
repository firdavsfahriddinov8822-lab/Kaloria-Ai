import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  ActivityLevel,
  DietType,
  Goal,
  GoalPace,
  Profile,
  Sex,
} from "@kaloriya/shared";
import { deriveTargets } from "@kaloriya/shared";
import { Btn, Card, Field, NumInput, Segmented, TextInput } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";
import { shouldOfferPinSetup } from "@/lib/security";

export default function Setup() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { state, setProfile, toast } = useApp();
  const existing = state.profile;
  const [name, setName] = useState(existing?.name ?? "");
  const [sex, setSex] = useState<Sex>(existing?.sex ?? "male");
  const [age, setAge] = useState(existing?.age ?? 28);
  const [heightCm, setHeightCm] = useState(existing?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(existing?.weightKg ?? 72);
  const [goal, setGoal] = useState<Goal>(existing?.goal ?? "lose");
  const [goalPace, setGoalPace] = useState<GoalPace>(existing?.goalPace ?? "normal");
  const [activity, setActivity] = useState<ActivityLevel>(existing?.activity ?? "moderate");
  const [dietType, setDietType] = useState<DietType>(existing?.dietType ?? "halal");
  const [allergiesRaw, setAllergiesRaw] = useState(existing?.allergies.join(", ") ?? "");

  const preview = useMemo(
    () =>
      deriveTargets({
        name,
        sex,
        age,
        heightCm,
        weightKg,
        goal,
        goalPace,
        activity,
        dietType,
        allergies: [],
      }),
    [name, sex, age, heightCm, weightKg, goal, goalPace, activity, dietType],
  );

  function save() {
    if (!name) {
      toast(t("setup_need_name"), "warn");
      return;
    }
    const p: Profile = {
      name,
      sex,
      age,
      heightCm,
      weightKg,
      goal,
      goalPace,
      activity,
      dietType,
      allergies: allergiesRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    setProfile(p);
    toast(t("setup_saved"), "success");
    if (shouldOfferPinSetup()) nav("/pin-setup");
    else nav("/");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-4">
        <div className="font-display text-2xl">{t("setup_title")}</div>
        <div className="text-dim text-sm">{t("setup_sub")}</div>
      </div>

      <Card className="space-y-3">
        <Field label={t("field_name")}>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("field_name_placeholder")}
          />
        </Field>
        <Field label={t("field_sex")}>
          <Segmented
            value={sex}
            onChange={setSex}
            options={[
              { value: "male", labelUz: t("sex_male") },
              { value: "female", labelUz: t("sex_female") },
            ]}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t("field_age")}>
            <NumInput value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} />
          </Field>
          <Field label={t("field_height")}>
            <NumInput value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value) || 0)} />
          </Field>
          <Field label={t("field_weight")}>
            <NumInput value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value) || 0)} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-3">
        <Field label={t("field_goal")}>
          <Segmented
            value={goal}
            onChange={setGoal}
            options={[
              { value: "lose", labelUz: t("goal_lose") },
              { value: "maintain", labelUz: t("goal_maintain") },
              { value: "gain", labelUz: t("goal_gain") },
            ]}
          />
        </Field>
        <Field label={t("field_pace")}>
          <Segmented
            value={goalPace}
            onChange={setGoalPace}
            options={[
              { value: "slow", labelUz: t("pace_slow") },
              { value: "normal", labelUz: t("pace_normal") },
              { value: "fast", labelUz: t("pace_fast") },
            ]}
          />
        </Field>
        <Field label={t("field_activity")}>
          <Segmented
            value={activity}
            onChange={setActivity}
            options={[
              { value: "sedentary", labelUz: t("activity_sedentary") },
              { value: "light", labelUz: t("activity_light") },
              { value: "moderate", labelUz: t("activity_moderate") },
              { value: "active", labelUz: t("activity_active") },
              { value: "very_active", labelUz: t("activity_very") },
            ]}
          />
        </Field>
      </Card>

      <Card className="space-y-3">
        <Field label={t("field_diet")}>
          <Segmented
            value={dietType}
            onChange={setDietType}
            options={[
              { value: "regular", labelUz: t("diet_regular") },
              { value: "halal", labelUz: t("diet_halal") },
              { value: "vegetarian", labelUz: t("diet_vegetarian") },
              { value: "vegan", labelUz: t("diet_vegan") },
            ]}
          />
        </Field>
        <Field label={t("field_allergies")}>
          <TextInput
            value={allergiesRaw}
            onChange={(e) => setAllergiesRaw(e.target.value)}
            placeholder={t("field_allergies_placeholder")}
          />
        </Field>
      </Card>

      <Card>
        <div className="text-dim text-sm mb-1">{t("preview_title")}</div>
        <div className="font-display text-2xl">
          {preview.dailyKcal} <span className="text-dim text-base">{t("preview_kcal_day")}</span>
        </div>
        <div className="text-sm text-dim mt-1 tnum">
          BMR {preview.bmr} · TDEE {preview.tdee} · BMI {preview.bmi}
        </div>
        <div className="text-sm text-dim tnum">
          {t("home_water")}: {preview.waterMl} {t("unit_ml")} · {t("home_protein")}:{" "}
          {preview.proteinG} {t("unit_g")} · {t("home_fat")}: {preview.fatG} {t("unit_g")} ·{" "}
          {t("home_carbs")}: {preview.carbsG} {t("unit_g")}
        </div>
        {preview.guardrailNote && (
          <div className="mt-2 text-cal text-sm">{preview.guardrailNote}</div>
        )}
      </Card>

      <Btn onClick={save} className="w-full">
        {t("setup_save")}
      </Btn>
    </div>
  );
}
