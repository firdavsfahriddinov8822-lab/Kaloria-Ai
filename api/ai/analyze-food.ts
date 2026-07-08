import type { AiFoodAnalysis, Macros } from "@kaloriya/shared";
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

function systemPrompt(locale: Locale): string {
  const lang = LOCALE_NAME[locale];
  return `You are a certified clinical nutritionist and food label analyst preparing a report a user will act on.
The user sends any image. Identify the food(s), brand (only if a label is CLEARLY readable), realistic weight in grams, full nutrition, allergens, dietary compatibility, and clinical risk flags for the user profile provided.

RESPOND WITH JSON ONLY — no prose, no code fences.

If the image is NOT food or drink:
{
  "isFood": false,
  "items": [],
  "totals": { "kcal": 0, "protein_g": 0, "fat_g": 0, "carbs_g": 0 },
  "confidence": 0,
  "notFoodReason": "one sentence in ${lang} describing what is in the image"
}

Otherwise:
{
  "isFood": true,
  "items": [
    {
      "name": "specific dish or product name in ${lang}",
      "brand": "exact brand ONLY if label is clearly visible; otherwise omit or null. NEVER invent.",
      "estimatedGrams": 150,
      "macros": { "kcal": 0, "protein_g": 0, "fat_g": 0, "carbs_g": 0, "sugar_g": 0, "salt_g": 0 },
      "micros": {
        "fiber_g": null, "vitamin_a_mcg": null, "vitamin_c_mg": null,
        "vitamin_d_mcg": null, "vitamin_b12_mcg": null, "iron_mg": null,
        "calcium_mg": null, "potassium_mg": null, "sodium_mg": null
      },
      "portionPctSuggested": 100,
      "reason": "one short sentence in ${lang} explaining a right-sized portion for the user's goal",
      "allergens": ["e.g. milk, wheat, egg, peanut, tree_nut, soy, fish, shellfish, sesame — English keywords only"],
      "dietFlags": ["e.g. not_halal, not_vegetarian, not_vegan — English keywords only"]
    }
  ],
  "totals": { sums of macros },
  "totalGrams": 150,
  "micros": { sums of micros },
  "confidence": 0.85,
  "note": "one sentence of doctor-style advice in ${lang} tuned to the user's goal",
  "allergenHits": ["human-readable list in ${lang} of allergens that match the user's known allergies; empty if none"],
  "dietWarnings": ["human-readable list in ${lang} of conflicts with the user's diet (halal, vegetarian, vegan); empty if none"],
  "healthWarnings": ["human-readable list in ${lang} of clinical risk flags: high sodium (>800mg per portion), high added sugar (>25g), ultra-processed, fried in trans-fat oil, alcohol; empty if none"]
}

RULES:
- Weights use realistic visual references. macros/micros correspond to the shown estimatedGrams.
- Use USDA/EU nutrition-label averages. If unknown, put null. NEVER invent numbers.
- Brand: only from a clearly readable label.
- Every human-readable field (name, reason, note, notFoodReason, allergenHits, dietWarnings, healthWarnings) must be in ${lang}. Machine keywords (allergens, dietFlags) stay in English.
- If multiple items are visible, list each separately in items[] and sum in totals/micros.
- Do not add caveats about consulting a doctor inside note — reminders are handled elsewhere.
`;
}

function readBody(body: unknown): {
  imageBase64?: string;
  noteUz?: string;
  locale?: string;
  allergies?: string[];
  dietType?: string;
  goal?: string;
} {
  if (body && typeof body === "object") {
    return body as {
      imageBase64?: string;
      noteUz?: string;
      locale?: string;
      allergies?: string[];
      dietType?: string;
      goal?: string;
    };
  }
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as never;
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

function stubAnalysis(): AiFoodAnalysis {
  const macros: Macros = {
    kcal: 420,
    protein_g: 22,
    fat_g: 14,
    carbs_g: 48,
    sugar_g: 6,
    salt_g: 1.2,
  };
  return {
    isFood: true,
    items: [
      {
        name: "Namuna ovqat",
        estimatedGrams: 250,
        macros,
        portionPctSuggested: 100,
        reason: "AI kaliti sozlanmagan — namuna qiymatlar.",
      },
    ],
    totals: macros,
    totalGrams: 250,
    confidence: 0.4,
    note: "AI kaliti sozlanmagan. Vercel'da ANTHROPIC_API_KEY ni qo'shing.",
    noteUz: "AI kaliti sozlanmagan. Vercel'da ANTHROPIC_API_KEY ni qo'shing.",
  };
}

function normalizeAnalysis(parsed: unknown): AiFoodAnalysis {
  const p = (parsed ?? {}) as Partial<AiFoodAnalysis>;
  const items = Array.isArray(p.items) ? p.items : [];
  return {
    isFood: p.isFood ?? items.length > 0,
    items: items.map((it) => ({
      name: it.name ?? "?",
      brand: it.brand ?? undefined,
      estimatedGrams: typeof it.estimatedGrams === "number" ? it.estimatedGrams : 0,
      macros: it.macros ?? { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0 },
      micros: it.micros ?? undefined,
      portionPctSuggested: it.portionPctSuggested ?? 100,
      reason: it.reason,
      allergens: Array.isArray(it.allergens) ? it.allergens : undefined,
      dietFlags: Array.isArray(it.dietFlags) ? it.dietFlags : undefined,
    })),
    totals: p.totals ?? { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0 },
    totalGrams: p.totalGrams,
    micros: p.micros,
    confidence: typeof p.confidence === "number" ? p.confidence : 0,
    note: p.note ?? p.noteUz,
    noteUz: p.noteUz ?? p.note,
    notFoodReason: p.notFoodReason,
    allergenHits: Array.isArray(p.allergenHits) ? p.allergenHits : undefined,
    dietWarnings: Array.isArray(p.dietWarnings) ? p.dietWarnings : undefined,
    healthWarnings: Array.isArray(p.healthWarnings) ? p.healthWarnings : undefined,
  };
}

function extractJson(text: string): string {
  const s = text.trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("model returned no JSON");
  return s.slice(start, end + 1);
}

function detectMediaType(base64: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0")) return "image/png";
  if (base64.startsWith("UklGR")) return "image/webp";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  return "image/jpeg";
}

function userHint(input: {
  noteUz?: string;
  allergies?: string[];
  dietType?: string;
  goal?: string;
}): string {
  const lines: string[] = [];
  if (input.allergies?.length) {
    lines.push(`User's known allergies (be strict): ${input.allergies.join(", ")}`);
  }
  if (input.dietType) {
    lines.push(`User's diet: ${input.dietType} — flag any conflicts.`);
  }
  if (input.goal) {
    lines.push(`User's goal: ${input.goal} — tune portion suggestion accordingly.`);
  }
  if (input.noteUz) {
    lines.push(`User hint: ${input.noteUz}`);
  }
  lines.push("Analyze the image now and return the JSON.");
  return lines.join("\n");
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

  const { imageBase64, noteUz, locale, allergies, dietType, goal } = readBody(req.body);
  if (!imageBase64) {
    res.status(400).json({
      error: { code: "invalid_body", message: "imageBase64 talab qilinadi" },
    });
    return;
  }

  const loc = normalizeLocale(locale);
  const anthropic = getAnthropic();
  if (!anthropic) {
    res.status(200).json({ data: stubAnalysis() });
    return;
  }

  try {
    const msg = await anthropic.messages.create({
      model: anthropicModel(),
      max_tokens: 2400,
      system: systemPrompt(loc),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: detectMediaType(imageBase64),
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: userHint({ noteUz, allergies, dietType, goal }),
            },
          ],
        },
      ],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("no text response");
    }
    const parsed = normalizeAnalysis(JSON.parse(extractJson(textBlock.text)));
    res.status(200).json({ data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    res
      .status(502)
      .json({ error: { code: "ai_failed", message: `AI xatolik: ${message}` } });
  }
}
