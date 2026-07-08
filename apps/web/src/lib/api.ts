import type { AiFoodAnalysis, AuthUser } from "@kaloriya/shared";
import { supabase, supabaseConfigured } from "./supabase";

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

function toAuthUser(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
} | null): AuthUser | undefined {
  if (!user) return undefined;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    displayName: typeof meta.display_name === "string" ? meta.display_name : undefined,
    createdAt: user.created_at ?? new Date().toISOString(),
    subscription: {
      tier: (meta.tier as AuthUser["subscription"]["tier"]) ?? "free",
      status:
        (meta.subscription_status as AuthUser["subscription"]["status"]) ??
        "none",
    },
  };
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (data.session?.access_token) {
    headers.set("Authorization", `Bearer ${data.session.access_token}`);
  }
  return fetch(path, { ...init, headers });
}

export const api = {
  supabaseReady(): boolean {
    return supabaseConfigured;
  },
  isAuthed(): boolean {
    return supabaseConfigured;
  },

  async register(payload: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<ApiResult<{ user: AuthUser }>> {
    if (!supabaseConfigured) {
      return {
        ok: false,
        error: { code: "supabase_missing", message: "Supabase sozlanmagan" },
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: payload.displayName ? { display_name: payload.displayName } : {},
      },
    });
    if (error) return { ok: false, error: { code: "signup_failed", message: error.message } };
    return { ok: true, data: { user: toAuthUser(data.user)! } };
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResult<{ user: AuthUser }>> {
    if (!supabaseConfigured) {
      return {
        ok: false,
        error: { code: "supabase_missing", message: "Supabase sozlanmagan" },
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) return { ok: false, error: { code: "login_failed", message: error.message } };
    return { ok: true, data: { user: toAuthUser(data.user)! } };
  },

  async logout(): Promise<ApiResult<{ ok: true }>> {
    if (!supabaseConfigured) return { ok: true, data: { ok: true } };
    const { error } = await supabase.auth.signOut();
    if (error) return { ok: false, error: { code: "logout_failed", message: error.message } };
    return { ok: true, data: { ok: true } };
  },

  async me(): Promise<ApiResult<AuthUser>> {
    if (!supabaseConfigured) {
      return { ok: false, error: { code: "supabase_missing", message: "Supabase sozlanmagan" } };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) return { ok: false, error: { code: "me_failed", message: error.message } };
    const u = toAuthUser(data.user);
    if (!u) return { ok: false, error: { code: "no_user", message: "Foydalanuvchi topilmadi" } };
    return { ok: true, data: u };
  },

  async analyzeFood(payload: {
    imageBase64: string;
    noteUz?: string;
  }): Promise<ApiResult<AiFoodAnalysis>> {
    try {
      const res = await authedFetch("/api/ai/analyze-food", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: AiFoodAnalysis;
        error?: { code: string; message: string };
      };
      if (!res.ok) {
        return {
          ok: false,
          error: json.error ?? { code: "http_" + res.status, message: res.statusText },
        };
      }
      return { ok: true, data: json.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : "network error";
      return { ok: false, error: { code: "network", message } };
    }
  },

  onAuthChange(handler: (user: AuthUser | undefined) => void): () => void {
    if (!supabaseConfigured) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      handler(toAuthUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  },
};
