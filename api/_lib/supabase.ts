import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | undefined;

export function serverSupabase(): SupabaseClient | undefined {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return undefined;
  if (!cached) {
    cached = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export async function verifyBearer(
  authHeader: string | undefined,
): Promise<{ ok: true; userId: string } | { ok: false; reason: string }> {
  const client = serverSupabase();
  if (!client) return { ok: false, reason: "supabase_not_configured" };
  if (!authHeader?.startsWith("Bearer ")) return { ok: false, reason: "missing_token" };
  const token = authHeader.slice("Bearer ".length);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return { ok: false, reason: error?.message ?? "invalid_token" };
  return { ok: true, userId: data.user.id };
}
