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
  DerivedTargets,
  FoodEntry,
  Profile,
  WaterEntry,
  WeightEntry,
  WorkoutEntry,
} from "@kaloriya/shared";
import { deriveTargets } from "@kaloriya/shared";
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
  return {
    date: today(),
    foods: [],
    water: [],
    workouts: [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>(
    storageGet<AuthUser | undefined>("user", undefined),
  );
  const [profile, setProfileState] = useState<Profile | undefined>(
    storageGet<Profile | undefined>("profile", undefined),
  );
  const [day, setDay] = useState<DayLog>(storageGet<DayLog>("day", emptyDay()));
  const [weights, setWeights] = useState<WeightEntry[]>(
    storageGet<WeightEntry[]>("weights", []),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (day.date !== today()) setDay(emptyDay());
  }, [day.date]);

  useEffect(() => storageSet("user", user), [user]);
  useEffect(() => storageSet("profile", profile), [profile]);
  useEffect(() => storageSet("day", day), [day]);
  useEffect(() => storageSet("weights", weights), [weights]);

  const targets = useMemo(
    () => (profile ? deriveTargets(profile) : undefined),
    [profile],
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

  const setProfile = useCallback((p: Profile) => setProfileState(p), []);

  const addFood = useCallback(
    (f: FoodEntry) => setDay((d) => ({ ...d, foods: [...d.foods, f] })),
    [],
  );
  const removeFood = useCallback(
    (id: string) =>
      setDay((d) => ({ ...d, foods: d.foods.filter((f) => f.id !== id) })),
    [],
  );
  const addWater = useCallback(
    (w: WaterEntry) => setDay((d) => ({ ...d, water: [...d.water, w] })),
    [],
  );
  const addWorkout = useCallback(
    (w: WorkoutEntry) => setDay((d) => ({ ...d, workouts: [...d.workouts, w] })),
    [],
  );
  const addWeight = useCallback(
    (w: WeightEntry) => setWeights((prev) => [...prev, w]),
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
    state: { user, profile, targets, today: day, weights, toasts },
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
