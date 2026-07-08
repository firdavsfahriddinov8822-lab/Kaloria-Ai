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
  return `You are a certified fitness coach and preventive-medicine physician.
The user gives you their profile, calorie/macro targets, today's date, and their recent workouts.
Produce a single-day workout plan, written in ${lang}, that is safe, realistic, and aligned with the stated goal.

RESPOND WITH JSON ONLY. Schema:
{
  "date": "YYYY-MM-DD",
  "focus": "short title of today's session in ${lang} (e.g. 'Upper body — push day', 'Kardio va yadro')",
  "warmupMin": 5,
  "cooldownMin": 5,
  "totalMin": 40,
  "totalKcal": 300,
  "intensity": "easy" | "moderate" | "hard",
  "exercises": [
    {
      "name": "exercise name in ${lang}",
      "sets": 3,
      "reps": "e.g. '10-12' or '30 sec'",
      "restSec": 60,
      "targetMuscle": "primary muscle group in ${lang}",
      "notes": "one short cue about form or safety, in ${lang}",
      "equipment": "e.g. 'dumbbell', 'bodyweight', 'yoga mat'"
    }
  ],
  "doctorNote": "2 sentences of doctor-style guidance in ${lang} — connect today's plan to the user's goal, mention hydration or recovery.",
  "reminders": ["2-4 short reminders in ${lang}: hydration, form, medical caveats"]
}

CLINICAL RULES:
- Never prescribe medication or diagnose. Encourage seeing a doctor if the user has heart, joint, or chronic conditions.
- For lose-weight goal: mix moderate cardio and full-body strength. Prefer compound movements.
- For gain-weight goal: emphasize progressive-overload strength, 3-5 sets, longer rest, protein reminder.
- For maintain: balanced strength + mobility.
- Adjust intensity down for age 50+ or activity="sedentary". Never mark "hard" for those users.
- Avoid duplicating the same primary muscle group hit hard in the last 2 days (use recentWorkouts as a hint if provided).
- Choose exercises appropriate to the environment (default: home, no equipment).
- All human-readable text (focus, name, targetMuscle, notes, doctorNote, reminders) must be in ${lang}.
- Return JSON only. No prose. No code fences.
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
  return `User profile:
- Name: ${body.profile.name}
- Sex: ${body.profile.sex}
- Age: ${body.profile.age}
- Height: ${body.profile.heightCm} cm
- Weight: ${body.profile.weightKg} kg
- Goal: ${body.profile.goal} (pace: ${body.profile.goalPace})
- Activity level: ${body.profile.activity}
- Diet: ${body.profile.dietType}
- Allergies: ${body.profile.allergies.join(", ") || "none"}

Daily targets:
- Calories: ${body.targets.dailyKcal} kcal
- Protein: ${body.targets.proteinG} g
- Fat: ${body.targets.fatG} g
- Carbs: ${body.targets.carbsG} g

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
    exercises: exercises.map((e) => ({
      name: e.name ?? "",
      sets: typeof e.sets === "number" ? e.sets : 3,
      reps: e.reps ?? "10",
      restSec: typeof e.restSec === "number" ? e.restSec : 60,
      targetMuscle: e.targetMuscle,
      notes: e.notes,
      equipment: e.equipment,
    })),
    doctorNote: p.doctorNote,
    reminders: Array.isArray(p.reminders) ? p.reminders : undefined,
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
      { name: "Squat", sets: 3, reps: "12", restSec: 60, targetMuscle: "quads/glutes", equipment: "bodyweight" },
      { name: "Push-up", sets: 3, reps: "8-12", restSec: 60, targetMuscle: "chest/triceps", equipment: "bodyweight" },
      { name: "Plank", sets: 3, reps: "30 sec", restSec: 45, targetMuscle: "core", equipment: "bodyweight" },
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
      max_tokens: 2500,
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
