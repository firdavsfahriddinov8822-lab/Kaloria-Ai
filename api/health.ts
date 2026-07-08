interface VercelReq {
  method?: string;
}
interface VercelRes {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
}

export default function handler(_req: VercelReq, res: VercelRes): void {
  res.status(200).json({
    data: {
      status: "ok",
      ts: Date.now(),
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
      hasSupabaseUrl: Boolean(
        process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL,
      ),
    },
  });
}
