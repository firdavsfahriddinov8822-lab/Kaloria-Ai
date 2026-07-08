import { useEffect, useState } from "react";
import { Btn, Card } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";
import {
  hashPin,
  getPinHash,
  isBiometricAvailable,
  isBiometricEnabled,
  setUnlocked,
  verifyBiometric,
} from "@/lib/security";

export default function Lock() {
  const { t } = useI18n();
  const { toast } = useApp();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [bioAvail, setBioAvail] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!isBiometricEnabled()) return;
      const avail = await isBiometricAvailable();
      setBioAvail(avail);
      if (avail) tryBiometric();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitPin() {
    if (pin.length !== 4) return;
    setBusy(true);
    const stored = getPinHash();
    const h = await hashPin(pin);
    setBusy(false);
    if (stored && h === stored) {
      setUnlocked(true);
    } else {
      toast(t("pin_wrong"), "error");
      setPin("");
    }
  }

  async function tryBiometric() {
    setBusy(true);
    const ok = await verifyBiometric();
    setBusy(false);
    if (ok) setUnlocked(true);
    else toast(t("lock_biometric_failed"), "warn");
  }

  function tapDigit(d: string) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) setTimeout(() => submitPinWith(next), 100);
  }
  function backspace() {
    setPin((p) => p.slice(0, -1));
  }
  async function submitPinWith(value: string) {
    const stored = getPinHash();
    const h = await hashPin(value);
    if (stored && h === stored) setUnlocked(true);
    else {
      toast(t("pin_wrong"), "error");
      setPin("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center space-y-4">
        <div className="font-display text-2xl">{t("lock_title")}</div>
        <div className="text-dim text-sm">{t("lock_enter_pin")}</div>

        <div className="flex justify-center gap-3 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 ${
                pin.length > i ? "bg-cal border-cal" : "border-dim"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => tapDigit(d)}
              disabled={busy}
              className="bg-elev2 rounded-xl py-4 text-xl font-semibold hover:brightness-110 active:scale-95"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => tapDigit("0")}
            disabled={busy}
            className="bg-elev2 rounded-xl py-4 text-xl font-semibold"
          >
            0
          </button>
          <button
            onClick={backspace}
            className="bg-elev2 rounded-xl py-4 text-lg text-dim"
          >
            ⌫
          </button>
        </div>

        {isBiometricEnabled() && bioAvail && (
          <Btn variant="ghost" onClick={tryBiometric} className="w-full">
            👆 {t("lock_use_fingerprint")}
          </Btn>
        )}
      </Card>
    </div>
  );
}
