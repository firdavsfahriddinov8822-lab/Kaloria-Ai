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
import { useApp } from "@/state/AppContext";

export default function Setup() {
  const nav = useNavigate();
  const { setProfile, toast } = useApp();
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);
  const [goal, setGoal] = useState<Goal>("lose");
  const [goalPace, setGoalPace] = useState<GoalPace>("normal");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [dietType, setDietType] = useState<DietType>("halal");
  const [allergiesRaw, setAllergiesRaw] = useState("");

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
      toast("Ismingizni kiriting", "warn");
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
    toast("Profil saqlandi", "success");
    nav("/");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-4">
        <div className="font-display text-2xl">Profil sozlash</div>
        <div className="text-dim text-sm">
          Sog'lom va shaxsiy maqsad uchun bir necha savol.
        </div>
      </div>

      <Card className="space-y-3">
        <Field label="Ism">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ismingiz"
          />
        </Field>
        <Field label="Jins">
          <Segmented
            value={sex}
            onChange={setSex}
            options={[
              { value: "male", labelUz: "Erkak" },
              { value: "female", labelUz: "Ayol" },
            ]}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Yosh">
            <NumInput
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Bo'y (sm)">
            <NumInput
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Vazn (kg)">
            <NumInput
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-3">
        <Field label="Maqsad">
          <Segmented
            value={goal}
            onChange={setGoal}
            options={[
              { value: "lose", labelUz: "Ozish" },
              { value: "maintain", labelUz: "Saqlash" },
              { value: "gain", labelUz: "Qo'shish" },
            ]}
          />
        </Field>
        <Field label="Sur'at">
          <Segmented
            value={goalPace}
            onChange={setGoalPace}
            options={[
              { value: "slow", labelUz: "Sekin" },
              { value: "normal", labelUz: "Odatiy" },
              { value: "fast", labelUz: "Tez" },
            ]}
          />
        </Field>
        <Field label="Faollik">
          <Segmented
            value={activity}
            onChange={setActivity}
            options={[
              { value: "sedentary", labelUz: "Kam" },
              { value: "light", labelUz: "Yengil" },
              { value: "moderate", labelUz: "O'rta" },
              { value: "active", labelUz: "Faol" },
              { value: "very_active", labelUz: "Juda" },
            ]}
          />
        </Field>
      </Card>

      <Card className="space-y-3">
        <Field label="Ovqat turi">
          <Segmented
            value={dietType}
            onChange={setDietType}
            options={[
              { value: "regular", labelUz: "Oddiy" },
              { value: "halal", labelUz: "Halol" },
              { value: "vegetarian", labelUz: "Vegetarian" },
              { value: "vegan", labelUz: "Vegan" },
            ]}
          />
        </Field>
        <Field label="Allergiyalar (vergul bilan)">
          <TextInput
            value={allergiesRaw}
            onChange={(e) => setAllergiesRaw(e.target.value)}
            placeholder="masalan: sut, yong'oq"
          />
        </Field>
      </Card>

      <Card>
        <div className="text-dim text-sm mb-1">Taxminiy natijalar</div>
        <div className="font-display text-2xl">
          {preview.dailyKcal} <span className="text-dim text-base">kkal / kun</span>
        </div>
        <div className="text-sm text-dim mt-1">
          BMR {preview.bmr} · TDEE {preview.tdee} · BMI {preview.bmi}
        </div>
        <div className="text-sm text-dim">
          Suv: {preview.waterMl} ml · Protein: {preview.proteinG} g · Yog': {preview.fatG} g · Karbon: {preview.carbsG} g
        </div>
        {preview.guardrailNote && (
          <div className="mt-2 text-cal text-sm">{preview.guardrailNote}</div>
        )}
      </Card>

      <Btn onClick={save} className="w-full">
        Saqlash va davom etish
      </Btn>
    </div>
  );
}
