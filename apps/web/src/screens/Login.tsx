import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, Field, TextInput } from "@/components/ui";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";
import { shouldOfferPinSetup } from "@/lib/security";

export default function Login() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { toast, refreshUser } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email || !password) {
      toast(t("auth_missing_fields"), "warn");
      return;
    }
    setBusy(true);
    if (mode === "login") {
      const res = await api.login({ email, password });
      setBusy(false);
      if (!res.ok) {
        toast(res.error?.message ?? t("error"), "error");
        return;
      }
      await refreshUser();
      toast(t("auth_welcome"), "success");
      if (shouldOfferPinSetup()) nav("/pin-setup");
      else nav("/setup");
      return;
    }
    const res = await api.register({ email, password });
    setBusy(false);
    if (!res.ok) {
      toast(res.error?.message ?? t("error"), "error");
      return;
    }
    if (res.data?.needsEmailConfirm) {
      toast(t("auth_check_email"), "info");
      setMode("login");
      return;
    }
    await refreshUser();
    toast(t("auth_welcome"), "success");
    if (shouldOfferPinSetup()) nav("/pin-setup");
    else nav("/setup");
  }

  return (
    <div className="p-4 pt-10 space-y-4">
      <div className="text-center">
        <div className="font-display text-3xl">{t("app_name")}</div>
        <div className="text-dim">{t("app_tagline")}</div>
      </div>
      <Card className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-xl font-semibold ${
              mode === "login" ? "bg-cal text-bg" : "bg-elev2 text-dim"
            }`}
          >
            {t("auth_login")}
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-xl font-semibold ${
              mode === "register" ? "bg-cal text-bg" : "bg-elev2 text-dim"
            }`}
          >
            {t("auth_register")}
          </button>
        </div>
        <Field label={t("auth_email")}>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth_email_placeholder")}
          />
        </Field>
        <Field label={t("auth_password")}>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth_password_placeholder")}
          />
        </Field>
        <Btn onClick={submit} disabled={busy} className="w-full">
          {busy ? t("loading") : mode === "login" ? t("auth_login") : t("auth_register")}
        </Btn>
      </Card>
    </div>
  );
}
