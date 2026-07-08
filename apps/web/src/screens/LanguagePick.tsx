import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui";
import { LOCALES, useI18n } from "@/i18n";
import { storageSet } from "@/lib/storage";

export default function LanguagePick() {
  const nav = useNavigate();
  const { t, setLocale, locale } = useI18n();

  function pick(code: (typeof LOCALES)[number]["code"]) {
    setLocale(code);
    storageSet("locale:picked", true);
    nav("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="font-display text-3xl">{t("app_name")}</div>
          <div className="text-dim mt-1">{t("app_tagline")}</div>
        </div>

        <Card className="space-y-3">
          <div className="font-semibold text-lg text-center">
            {t("lang_pick_title")}
          </div>
          <div className="text-dim text-sm text-center">
            {t("lang_pick_sub")}
          </div>

          <div className="space-y-2 pt-2">
            {LOCALES.map((L) => (
              <button
                key={L.code}
                onClick={() => pick(L.code)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                  locale === L.code
                    ? "bg-cal text-bg border-cal"
                    : "bg-elev2 border-elev2 hover:border-cal"
                }`}
              >
                <span className="text-2xl">{L.flag}</span>
                <span className="font-semibold">
                  {L.code === "uz" ? L.nameUz : L.code === "ru" ? L.nameRu : L.nameEn}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
