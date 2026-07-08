import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { storageGet, storageSet } from "@/lib/storage";
import { translations, type Locale, type TranslationKey } from "./translations";

export type { Locale, TranslationKey } from "./translations";

export const LOCALES: { code: Locale; nameUz: string; nameEn: string; nameRu: string; flag: string }[] = [
  { code: "uz", nameUz: "O'zbek", nameEn: "Uzbek", nameRu: "Узбекский", flag: "🇺🇿" },
  { code: "ru", nameUz: "Rus", nameEn: "Russian", nameRu: "Русский", flag: "🇷🇺" },
  { code: "en", nameUz: "Ingliz", nameEn: "English", nameRu: "Английский", flag: "🇬🇧" },
];

interface I18nApi {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nCtx = createContext<I18nApi | undefined>(undefined);

function detectInitialLocale(): Locale {
  const stored = storageGet<Locale | undefined>("locale", undefined);
  if (stored && (stored === "uz" || stored === "ru" || stored === "en")) return stored;
  const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "uz";
  if (nav.startsWith("ru")) return "ru";
  if (nav.startsWith("en")) return "en";
  return "uz";
}

function format(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return Object.keys(vars).reduce(
    (acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k])),
    str,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale());

  useEffect(() => {
    storageSet("locale", locale);
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const row = translations[key];
      const raw = row?.[locale] ?? row?.uz ?? key;
      return format(raw, vars);
    },
    [locale],
  );

  return <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n(): I18nApi {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useI18n must be used within I18nProvider");
  return v;
}
