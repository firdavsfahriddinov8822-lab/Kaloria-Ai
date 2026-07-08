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
  return { date: today(), foods: [], water: [], workouts: [] };
}

const GUEST_UID = "_local";

interface UserData {
  uid: string;
  profile?: Profile;
  day: DayLog;
  weights: WeightEntry[];
}

function loadUserData(uid: string): UserData {
  return {
    uid,
    profile: storageGet<Profile | undefined>(`u:${uid}:profile`, undefined),
    day: storageGet<DayLog>(`u:${uid}:day`, emptyDay()),
    weights: storageGet<WeightEntry[]>(`u:${uid}:weights`, []),
  };
}

function saveUserData(data: UserData): void {
  storageSet(`u:${data.uid}:profile`, data.profile);
  storageSet(`u:${data.uid}:day`, data.day);
  storageSet(`u:${data.uid}:weights`, data.weights);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>(() =>
    storageGet<AuthUser | undefined>("user", undefined),
  );
  const uid = user?.id ?? GUEST_UID;

  const [data, setData] = useState<UserData>(() => loadUserData(uid));
  const [toasts, setToasts] = useState<Toast[]>([]);

  // When the signed-in user changes, atomically reload their notebook so
  // logging in as a different account never shows another user's data,
  // and re-logging in restores what was saved for that account.
  useEffect(() => {
    if (data.uid !== uid) setData(loadUserData(uid));
  }, [uid, data.uid]);

  // Roll over to a new day at midnight.
  useEffect(() => {
    if (data.day.date !== today()) {
      setData((d) => ({ ...d, day: emptyDay() }));
    }
  }, [data.day.date]);

  // Persist the device-level "last signed in" pointer.
  useEffect(() => {
    storageSet("user", user);
  }, [user]);

  // Persist per-user data, but only when data belongs to the current uid.
  // Skips the transient render where uid changed but data still holds the
  // previous user's values.
  useEffect(() => {
    if (data.uid === uid) saveUserData(data);
  }, [uid, data]);

  const targets = useMemo(
    () => (data.profile ? deriveTargets(data.profile) : undefined),
    [data.profile],
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
    // uid → GUEST_UID; the reload effect swaps `data` to the guest notebook,
    // leaving the signed-out user's data untouched under `u:{uid}:*`.
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
