import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";
import { hashPin, markPinPromptShown, setPinHash, setUnlocked } from "@/lib/security";

export default function PinSetup() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { toast } = useApp();
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const pin = step === "enter" ? first : second;

  function tap(d: string) {
    if (pin.length >= 4) return;
    if (step === "enter") setFirst(first + d);
    else setSecond(second + d);
    if (pin.length + 1 === 4) setTimeout(() => proceed(pin + d), 100);
  }
  function backspace() {
    if (step === "enter") setFirst(first.slice(0, -1));
    else setSecond(second.slice(0, -1));
  }

  async function proceed(value: string) {
    if (step === "enter") {
      setStep("confirm");
      return;
    }
    if (value !== first) {
      toast(t("pin_mismatch"), "error");
      setStep("enter");
      setFirst("");
      setSecond("");
      return;
    }
    const hash = await hashPin(value);
    setPinHash(hash);
    markPinPromptShown();
    setUnlocked(true);
    toast(t("pin_saved"), "success");
    nav("/", { replace: true });
  }

  function skip() {
    markPinPromptShown();
    setUnlocked(true);
    nav("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center space-y-4">
        <div className="font-display text-xl">{t("pin_setup_title")}</div>
        <div className="text-dim text-sm">
          {step === "enter" ? t("pin_setup_sub") : t("pin_setup_confirm")}
        </div>

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
              onClick={() => tap(d)}
              className="bg-elev2 rounded-xl py-4 text-xl font-semibold hover:brightness-110 active:scale-95"
            >
              {d}
            </button>
          ))}
          <div />
          <button onClick={() => tap("0")} className="bg-elev2 rounded-xl py-4 text-xl font-semibold">
            0
          </button>
          <button onClick={backspace} className="bg-elev2 rounded-xl py-4 text-lg text-dim">
            ⌫
          </button>
        </div>

        <Btn variant="ghost" onClick={skip} className="w-full">
          {t("pin_setup_skip")}
        </Btn>
      </Card>
    </div>
  );
}
