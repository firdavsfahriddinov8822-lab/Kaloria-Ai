import type {
  AiDailyWorkout,
  DerivedTargets,
  Profile,
  WorkoutEntry,
  WorkoutIntensity,
} from "@kaloriya/shared";
import { getAnthropic, anthropicModel } from "../_lib/anthropic.js";
import { verifyBearer } from "../_lib/supabase.js";

interface VercelReq {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}
interface VercelRes {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

type Locale = "uz" | "ru" | "en";

const LOCALE_NAME: Record<Locale, string> = {
  uz: "o'zbek",
  ru: "русском",
  en: "English",
};

interface RequestBody {
  profile: Profile;
  targets: DerivedTargets;
  date: string;
  environment?: "home" | "gym" | "outdoor";
  recentWorkouts?: WorkoutEntry[];
  locale?: string;
}

function readBody(body: unknown): Partial<RequestBody> {
  if (body && typeof body === "object") return body as Partial<RequestBody>;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Partial<RequestBody>;
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeLocale(raw: string | undefined): Locale {
  if (raw === "ru" || raw === "en") return raw;
  return "uz";
}

function systemPrompt(loc: Locale): string {
  const lang = LOCALE_NAME[loc];
  return `You are a certified strength & conditioning coach with a background in preventive medicine.
The user provides their profile, calorie/macro targets, today's date, and recent workouts.
Produce a single, safe, personally tuned day of training, written in ${lang}.

RESPOND WITH JSON ONLY — no prose, no code fences.

Schema:
{
  "date": "YYYY-MM-DD",
  "focus": "short title of today's session in ${lang}",
  "warmupMin": 5,
  "cooldownMin": 5,
  "totalMin": 40,
  "totalKcal": 300,
  "intensity": "easy" | "moderate" | "hard",
  "warmupList": ["3-5 dynamic warm-up moves in ${lang} (e.g. leg swings, hip circles, arm rotations)"],
  "exercises": [
    {
      "name": "exercise name in ${lang}",
      "sets": 3,
      "reps": "e.g. '10-12' or '30 sec'",
      "restSec": 60,
      "targetMuscle": "primary muscle group in ${lang}",
      "notes": "one-line form or safety cue in ${lang}",
      "equipment": "e.g. 'dumbbell', 'bodyweight'",
      "rpe": 7
    }
  ],
  "cooldownList": ["3-5 static stretches or breath work items in ${lang}"],
  "doctorNote": "2 sentences of clinical guidance in ${lang}: how today's session serves the goal, one recovery cue.",
  "reminders": ["2-4 short reminders in ${lang}: hydration, form, medical caveats"],
  "tomorrowHint": "one short sentence in ${lang} suggesting the focus for tomorrow"
}

CLINICAL RULES:
- Never prescribe medication or diagnose. If user reports pain in a body part (per profile), avoid loading it.
- lose-goal: mix moderate cardio (Z2) + compound strength. Higher-rep strength (8-15) to protect joints. Target RPE 6-7.
- gain-goal: emphasize progressive-overload strength, 3-5 sets, 60-90s rest, RPE 7-8. Include one core move.
- maintain: balanced strength + mobility. RPE 5-6.
- Age 50+ or activity="sedentary" → intensity NEVER "hard". Warm-up expanded. Lower impact.
- Avoid repeating the same primary muscle group heavily worked in the last 2 days (use recentWorkouts as a hint).
- Warm-up: dynamic mobility (no static holds). Cool-down: gentle stretches, breath work.
- Every human-readable field must be in ${lang}. RPE is a number 1-10.
- Reminders MUST include at least one on hydration and one on stopping if sharp pain occurs.
- Return JSON only.
`;
}

function userPrompt(body: RequestBody, loc: Locale): string {
  const recent = (body.recentWorkouts ?? [])
    .slice(-3)
    .map(
      (w) =>
        `- ${w.createdAt.slice(0, 10)}: ${w.durationMin} min, ${w.kcalBurned} kcal`,
    )
    .join("\n");
  const alrg = body.profile.allergies.length
    ? body.profile.allergies.join(", ")
    : "none";
  return `User profile:
- Name: ${body.profile.name}
- Sex: ${body.profile.sex}
- Age: ${body.profile.age}
- Height: ${body.profile.heightCm} cm
- Weight: ${body.profile.weightKg} kg
- Goal: ${body.profile.goal} (pace: ${body.profile.goalPace})
- Activity: ${body.profile.activity}
- Diet: ${body.profile.dietType}
- Allergies: ${alrg}

Daily targets:
- Calories: ${body.targets.dailyKcal} kcal
- Protein: ${body.targets.proteinG} g
- Fat: ${body.targets.fatG} g
- Carbs: ${body.targets.carbsG} g
- BMI: ${body.targets.bmi}

Today: ${body.date}
Environment: ${body.environment ?? "home"}

Recent workouts (last 3):
${recent || "(none logged)"}

Return today's plan as JSON in ${LOCALE_NAME[loc]}.`;
}

function normalizeIntensity(v: unknown): WorkoutIntensity {
  if (v === "easy" || v === "moderate" || v === "hard") return v;
  return "moderate";
}

function normalizeWorkout(parsed: unknown, fallbackDate: string): AiDailyWorkout {
  const p = (parsed ?? {}) as Partial<AiDailyWorkout>;
  const exercises = Array.isArray(p.exercises) ? p.exercises : [];
  return {
    date: p.date ?? fallbackDate,
    focus: p.focus ?? "",
    warmupMin: typeof p.warmupMin === "number" ? p.warmupMin : 5,
    cooldownMin: typeof p.cooldownMin === "number" ? p.cooldownMin : 5,
    totalMin: typeof p.totalMin === "number" ? p.totalMin : 30,
    totalKcal: typeof p.totalKcal === "number" ? p.totalKcal : 200,
    intensity: normalizeIntensity(p.intensity),
    warmupList: Array.isArray(p.warmupList) ? p.warmupList : undefined,
    exercises: exercises.map((e) => ({
      name: e.name ?? "",
      sets: typeof e.sets === "number" ? e.sets : 3,
      reps: e.reps ?? "10",
      restSec: typeof e.restSec === "number" ? e.restSec : 60,
      targetMuscle: e.targetMuscle,
      notes: e.notes,
      equipment: e.equipment,
      rpe: typeof e.rpe === "number" ? e.rpe : undefined,
    })),
    cooldownList: Array.isArray(p.cooldownList) ? p.cooldownList : undefined,
    doctorNote: p.doctorNote,
    reminders: Array.isArray(p.reminders) ? p.reminders : undefined,
    tomorrowHint: p.tomorrowHint,
  };
}

function stubWorkout(date: string, loc: Locale): AiDailyWorkout {
  const focus = loc === "ru" ? "Полный корпус" : loc === "en" ? "Full body" : "Butun tanani ishga solish";
  const note =
    loc === "ru"
      ? "AI-ключ не настроен — это пример. Настройте ANTHROPIC_API_KEY на Vercel."
      : loc === "en"
        ? "AI key not configured — sample plan. Set ANTHROPIC_API_KEY on Vercel."
        : "AI kaliti sozlanmagan — namuna. Vercel'da ANTHROPIC_API_KEY qo'shing.";
  return {
    date,
    focus,
    warmupMin: 5,
    cooldownMin: 5,
    totalMin: 30,
    totalKcal: 220,
    intensity: "moderate",
    exercises: [
      { name: "Squat", sets: 3, reps: "12", restSec: 60, targetMuscle: "quads/glutes", equipment: "bodyweight", rpe: 6 },
      { name: "Push-up", sets: 3, reps: "8-12", restSec: 60, targetMuscle: "chest/triceps", equipment: "bodyweight", rpe: 6 },
      { name: "Plank", sets: 3, reps: "30 sec", restSec: 45, targetMuscle: "core", equipment: "bodyweight", rpe: 6 },
    ],
    doctorNote: note,
    reminders: [],
  };
}

function extractJson(text: string): string {
  const s = text.trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("model returned no JSON");
  return s.slice(start, end + 1);
}

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: { code: "method_not_allowed", message: "POST only" } });
    return;
  }

  const authHeader = req.headers["authorization"];
  const auth = await verifyBearer(
    Array.isArray(authHeader) ? authHeader[0] : (authHeader as string | undefined),
  );
  if (!auth.ok && auth.reason !== "supabase_not_configured") {
    res.status(401).json({ error: { code: "unauthenticated", message: auth.reason } });
    return;
  }

  const body = readBody(req.body);
  if (!body.profile || !body.targets || !body.date) {
    res.status(400).json({
      error: { code: "invalid_body", message: "profile, targets, date required" },
    });
    return;
  }

  const loc = normalizeLocale(body.locale);
  const anthropic = getAnthropic();
  if (!anthropic) {
    res.status(200).json({ data: stubWorkout(body.date, loc) });
    return;
  }

  try {
    const msg = await anthropic.messages.create({
      model: anthropicModel(),
      max_tokens: 3000,
      system: systemPrompt(loc),
      messages: [
        {
          role: "user",
          content: userPrompt(body as RequestBody, loc),
        },
      ],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("no text response");
    }
    const parsed = normalizeWorkout(
      JSON.parse(extractJson(textBlock.text)),
      body.date,
    );
    res.status(200).json({ data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    res.status(502).json({ error: { code: "ai_failed", message } });
  }
}
