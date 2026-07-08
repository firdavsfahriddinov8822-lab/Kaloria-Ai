import { useState } from "react";
import { Btn, Card, NumInput } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useApp } from "@/state/AppContext";

export default function Progress() {
  const { t } = useI18n();
  const { state, addWeight, toast } = useApp();
  const { targets, weights, profile } = state;
  const [w, setW] = useState<number>(profile?.weightKg ?? 70);

  function log() {
    if (!w) return;
    addWeight({
      id: crypto.randomUUID(),
      weightKg: w,
      createdAt: new Date().toISOString(),
    });
    toast(t("progress_weight_saved"), "success");
  }

  const latest = weights[weights.length - 1]?.weightKg ?? profile?.weightKg;

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="font-display text-2xl">{t("progress_title")}</div>
        <div className="text-dim text-sm">{t("progress_sub")}</div>
      </header>

      <Card>
        <div className="text-dim text-sm">{t("progress_current_weight")}</div>
        <div className="font-display text-3xl tnum">
          {latest} <span className="text-dim text-base">{t("unit_kg")}</span>
        </div>
        {targets && (
          <div className="text-sm text-dim mt-2 tnum">
            BMI: <span>{targets.bmi}</span>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="font-semibold">{t("progress_new_weight")}</div>
        <NumInput
          value={w}
          onChange={(e) => setW(Number(e.target.value) || 0)}
        />
        <Btn onClick={log} className="w-full">
          {t("save")}
        </Btn>
      </Card>

      <Card>
        <div className="font-semibold mb-2">{t("progress_records")}</div>
        {weights.length === 0 ? (
          <div className="text-dim text-sm">{t("progress_no_records")}</div>
        ) : (
          <ul className="text-sm space-y-1">
            {weights
              .slice()
              .reverse()
              .map((w) => (
                <li
                  key={w.id}
                  className="flex justify-between text-dim tnum"
                >
                  <span>{w.createdAt.slice(0, 10)}</span>
                  <span className="text-ink">
                    {w.weightKg} {t("unit_kg")}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
