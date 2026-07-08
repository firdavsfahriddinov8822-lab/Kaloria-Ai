import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card } from "@/components/ui";
import { LOCALES, useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";
import {
  clearPin,
  disableBiometric,
  enableBiometric,
  isBiometricAvailable,
  isBiometricEnabled,
  isPinEnabled,
} from "@/lib/security";
import { canInstall, isStandalone, promptInstall } from "@/lib/pwa";

export default function Settings() {
  const nav = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const { state, logout, toast } = useApp();
  const [pinOn, setPinOn] = useState(isPinEnabled());
  const [bioOn, setBioOn] = useState(isBiometricEnabled());
  const [bioAvail, setBioAvail] = useState(false);
  const [installable, setInstallable] = useState(canInstall());
  const [standalone] = useState(isStandalone());

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvail);
    const onAvail = () => setInstallable(true);
    const onDone = () => setInstallable(false);
    window.addEventListener("kaloriya:install-available", onAvail);
    window.addEventListener("kaloriya:install-done", onDone);
    return () => {
      window.removeEventListener("kaloriya:install-available", onAvail);
      window.removeEventListener("kaloriya:install-done", onDone);
    };
  }, []);

  const tier = state.user?.subscription?.tier ?? "free";
  const status = state.user?.subscription?.status ?? "none";

  async function toggleBio() {
    if (bioOn) {
      disableBiometric();
      setBioOn(false);
      return;
    }
    const email = state.user?.email ?? state.profile?.name ?? "user";
    const ok = await enableBiometric(email);
    if (ok) {
      setBioOn(true);
      toast("✓", "success");
    } else {
      toast(t("settings_biometric_unavailable"), "error");
    }
  }

  function removePin() {
    clearPin();
    setPinOn(false);
    setBioOn(false);
    toast(t("pin_removed"), "success");
  }

  async function install() {
    const outcome = await promptInstall();
    if (outcome === "accepted") toast("✓", "success");
    if (outcome === "unavailable") {
      toast(
        locale === "ru"
          ? "Установите через меню браузера → «Установить приложение»"
          : locale === "en"
            ? "Install via browser menu → 'Install app'"
            : "Brauzer menyusidan → 'Ilovani o'rnatish' ni tanlang",
        "info",
      );
    }
  }

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("settings_title")}</div>
      </header>

      <Card>
        <div className="text-dim text-sm">{t("settings_user")}</div>
        <div className="font-semibold">
          {state.user?.email ?? state.user?.phone ?? t("settings_guest")}
        </div>
        <div className="text-dim text-sm mt-1">
          {t("settings_tier")}: <span className="text-ink capitalize">{tier}</span> ({status})
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="font-semibold text-sm">{t("settings_language")}</div>
        <div className="grid grid-cols-3 gap-2">
          {LOCALES.map((L) => (
            <button
              key={L.code}
              onClick={() => setLocale(L.code)}
              className={`flex flex-col items-center py-3 rounded-xl border transition ${
                locale === L.code
                  ? "bg-cal text-bg border-cal"
                  : "bg-elev2 border-elev2"
              }`}
            >
              <span className="text-2xl">{L.flag}</span>
              <span className="text-xs font-semibold mt-1">
                {L.code.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="font-semibold text-sm">{t("settings_security")}</div>
        <div className="flex justify-between items-center">
          <div className="text-sm">{t("settings_pin")}</div>
          {pinOn ? (
            <button onClick={removePin} className="text-burn text-xs font-semibold">
              {t("settings_pin_remove")}
            </button>
          ) : (
            <button
              onClick={() => nav("/pin-setup")}
              className="text-cal text-xs font-semibold"
            >
              {t("settings_pin_setup")}
            </button>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">{t("settings_biometric")}</div>
          {!bioAvail ? (
            <span className="text-xs text-dim">
              {t("settings_biometric_unavailable")}
            </span>
          ) : !pinOn ? (
            <span className="text-xs text-dim">🔒 PIN</span>
          ) : (
            <button
              onClick={toggleBio}
              className={`text-xs font-semibold ${bioOn ? "text-burn" : "text-cal"}`}
            >
              {bioOn
                ? t("settings_biometric_disable")
                : t("settings_biometric_enable")}
            </button>
          )}
        </div>
      </Card>

      {!standalone && (
        <Card>
          <Btn onClick={install} className="w-full">
            📱{" "}
            {locale === "ru"
              ? "Установить приложение"
              : locale === "en"
                ? "Install app"
                : "Ilovani o'rnatish"}
          </Btn>
          {!installable && (
            <div className="text-dim text-xs mt-2 text-center">
              {locale === "ru"
                ? "Или через меню браузера → «Добавить на главный экран»"
                : locale === "en"
                  ? "Or via browser menu → 'Add to Home screen'"
                  : "Yoki brauzer menyusidan → 'Bosh ekranga qo'shish'"}
            </div>
          )}
        </Card>
      )}

      <Card className="space-y-2">
        <Btn variant="ghost" onClick={() => nav("/setup")} className="w-full">
          {t("settings_edit_profile")}
        </Btn>
        <Btn
          variant="danger"
          onClick={async () => {
            await logout();
            nav("/login");
          }}
          className="w-full"
        >
          {t("settings_logout")}
        </Btn>
      </Card>

      <p className="text-dim text-xs text-center">{t("disclaimer")}</p>
    </div>
  );
}
