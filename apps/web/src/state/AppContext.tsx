import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AuthUser,
  DayLog,
  DaySummary,
  DerivedTargets,
  FoodEntry,
  Profile,
  WaterEntry,
  WeightEntry,
  WorkoutEntry,
} from "@kaloriya/shared";
import { deriveTargets, sumMacros } from "@kaloriya/shared";
import { api } from "@/lib/api";
import { storageGet, storageSet } from "@/lib/storage";

interface Toast {
  id: string;
  message: string;
  kind: "info" | "success" | "warn" | "error";
}

interface AppState {
  user?: AuthUser;
  profile?: Profile;
  targets?: DerivedTargets;
  today: DayLog;
  weights: WeightEntry[];
  history: DaySummary[];
  streak: number;
  toasts: Toast[];
}

interface AppApi {
  state: AppState;
  setProfile: (p: Profile) => void;
  addFood: (f: FoodEntry) => void;
  removeFood: (id: string) => void;
  addWater: (w: WaterEntry) => void;
  addWorkout: (w: WorkoutEntry) => void;
  addWeight: (w: WeightEntry) => void;
  toast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: string) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppCtx = createContext<AppApi | undefined>(undefined);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyDay(): DayLog {
  return { date: today(), foods: [], water: [], workouts: [] };
}

const GUEST_UID = "_local";
const HISTORY_CAP = 90;

interface UserData {
  uid: string;
  profile?: Profile;
  day: DayLog;
  weights: WeightEntry[];
  history: DaySummary[];
}

function summarizeDay(day: DayLog, weightKg?: number): DaySummary {
  const totals = sumMacros(
    day.foods.map((f) => ({ macros: f.macros, portionPct: f.portionPct })),
  );
  const water = day.water.reduce((s, w) => s + w.ml, 0);
  return {
    date: day.date,
    kcal: Math.round(totals.kcal),
    proteinG: Math.round(totals.protein_g),
    fatG: Math.round(totals.fat_g),
    carbsG: Math.round(totals.carbs_g),
    waterMl: water,
    workoutsCount: day.workouts.length,
    weightKg,
  };
}

function isActiveDay(s: DaySummary): boolean {
  return s.kcal > 0 || s.workoutsCount > 0 || s.waterMl > 0;
}

function computeStreak(history: DaySummary[], today: DaySummary): number {
  const map = new Map<string, DaySummary>();
  history.forEach((h) => map.set(h.date, h));
  map.set(today.date, today);

  let streak = 0;
  const cursor = new Date(today.date + "T00:00:00");
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    const entry = map.get(key);
    if (!entry || !isActiveDay(entry)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function loadUserData(uid: string): UserData {
  return {
    uid,
    profile: storageGet<Profile | undefined>(`u:${uid}:profile`, undefined),
    day: storageGet<DayLog>(`u:${uid}:day`, emptyDay()),
    weights: storageGet<WeightEntry[]>(`u:${uid}:weights`, []),
    history: storageGet<DaySummary[]>(`u:${uid}:history`, []),
  };
}

function saveUserData(data: UserData): void {
  storageSet(`u:${data.uid}:profile`, data.profile);
  storageSet(`u:${data.uid}:day`, data.day);
  storageSet(`u:${data.uid}:weights`, data.weights);
  storageSet(`u:${data.uid}:history`, data.history);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>(() =>
    storageGet<AuthUser | undefined>("user", undefined),
  );
  const uid = user?.id ?? GUEST_UID;

  const [data, setData] = useState<UserData>(() => loadUserData(uid));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (data.uid !== uid) setData(loadUserData(uid));
  }, [uid, data.uid]);

  // On day rollover, archive yesterday's summary into history.
  useEffect(() => {
    if (data.day.date !== today()) {
      setData((d) => {
        const latestWeight = d.weights[d.weights.length - 1]?.weightKg;
        const summary = summarizeDay(d.day, latestWeight);
        const filtered = d.history.filter((h) => h.date !== summary.date);
        const nextHistory = isActiveDay(summary)
          ? [...filtered, summary]
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-HISTORY_CAP)
          : filtered;
        return { ...d, day: emptyDay(), history: nextHistory };
      });
    }
  }, [data.day.date]);

  useEffect(() => {
    storageSet("user", user);
  }, [user]);

  useEffect(() => {
    if (data.uid === uid) saveUserData(data);
  }, [uid, data]);

  const targets = useMemo(
    () => (data.profile ? deriveTargets(data.profile) : undefined),
    [data.profile],
  );

  const currentSummary = useMemo(
    () => summarizeDay(data.day, data.weights[data.weights.length - 1]?.weightKg),
    [data.day, data.weights],
  );

  const streak = useMemo(
    () => computeStreak(data.history, currentSummary),
    [data.history, currentSummary],
  );

  const toast = useCallback((message: string, kind: Toast["kind"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  const dismissToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const setProfile = useCallback(
    (p: Profile) => setData((d) => ({ ...d, profile: p })),
    [],
  );

  const addFood = useCallback(
    (f: FoodEntry) =>
      setData((d) => ({ ...d, day: { ...d.day, foods: [...d.day.foods, f] } })),
    [],
  );
  const removeFood = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        day: { ...d.day, foods: d.day.foods.filter((f) => f.id !== id) },
      })),
    [],
  );
  const addWater = useCallback(
    (w: WaterEntry) =>
      setData((d) => ({ ...d, day: { ...d.day, water: [...d.day.water, w] } })),
    [],
  );
  const addWorkout = useCallback(
    (w: WorkoutEntry) =>
      setData((d) => ({
        ...d,
        day: { ...d.day, workouts: [...d.day.workouts, w] },
      })),
    [],
  );
  const addWeight = useCallback(
    (w: WeightEntry) => setData((d) => ({ ...d, weights: [...d.weights, w] })),
    [],
  );

  const refreshUser = useCallback(async () => {
    if (!api.supabaseReady()) return;
    const res = await api.me();
    if (res.ok && res.data) setUser(res.data);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(undefined);
  }, []);

  useEffect(() => {
    void refreshUser();
    const unsub = api.onAuthChange((u) => setUser(u));
    return unsub;
  }, [refreshUser]);

  const value: AppApi = {
    state: {
      user,
      profile: data.profile,
      targets,
      today: data.day,
      weights: data.weights,
      history: data.history,
      streak,
      toasts,
    },
    setProfile,
    addFood,
    removeFood,
    addWater,
    addWorkout,
    addWeight,
    toast,
    dismissToast,
    refreshUser,
    logout,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppApi {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
