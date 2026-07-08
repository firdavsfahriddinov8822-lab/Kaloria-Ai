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

const SYSTEM_PROMPT = `Sen o'zbek tilida javob beradigan ovqatlanish tahlilchisisan.
Foydalanuvchi ovqat rasmini beradi. Sen JSON qaytarishing kerak:
{
  "items": [{ "name": "...", "macros": { "kcal": 0, "protein_g": 0, "fat_g": 0, "carbs_g": 0, "sugar_g": 0, "salt_g": 0 }, "portionPctSuggested": 100, "reason": "..." }],
  "totals": { "kcal": 0, "protein_g": 0, "fat_g": 0, "carbs_g": 0, "sugar_g": 0, "salt_g": 0 },
  "confidence": 0.0,
  "noteUz": "Foydalanuvchiga bir jumlalik maslahat, o'zbek tilida."
}
Faqat JSON qaytar. Boshqa hech qanday matn qo'shma.`;

function readBody(body: unknown): { imageBase64?: string; noteUz?: string } {
  if (body && typeof body === "object") return body as { imageBase64?: string; noteUz?: string };
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as { imageBase64?: string; noteUz?: string };
    } catch {
      return {};
    }
  }
  return {};
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
    items: [
      {
        name: "Namuna ovqat",
        macros,
        portionPctSuggested: 100,
        reason: "AI kaliti sozlanmagan — namuna qiymatlar.",
      },
    ],
    totals: macros,
    confidence: 0.4,
    noteUz: "AI kaliti sozlanmagan. Vercel'da ANTHROPIC_API_KEY ni qo'shing.",
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

  const { imageBase64, noteUz } = readBody(req.body);
  if (!imageBase64) {
    res.status(400).json({
      error: { code: "invalid_body", message: "imageBase64 talab qilinadi" },
    });
    return;
  }

  const anthropic = getAnthropic();
  if (!anthropic) {
    res.status(200).json({ data: stubAnalysis() });
    return;
  }

  try {
    const msg = await anthropic.messages.create({
      model: anthropicModel(),
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: noteUz
                ? `Foydalanuvchi izohi: ${noteUz}. Rasmni tahlil qil.`
                : "Rasmni tahlil qil.",
            },
          ],
        },
      ],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("no text response");
    }
    const parsed = JSON.parse(extractJson(textBlock.text)) as AiFoodAnalysis;
    res.status(200).json({ data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    res
      .status(502)
      .json({ error: { code: "ai_failed", message: `AI xatolik: ${message}` } });
  }
}
