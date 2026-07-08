const NAMESPACE = "kaloriya:";

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NAMESPACE + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  } catch {
    // storage full or blocked — silently ignore
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(NAMESPACE + key);
}

export function storageKey(k: string): string {
  return NAMESPACE + k;
}
