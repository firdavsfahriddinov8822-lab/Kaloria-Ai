import { useState } from "react";
import { Btn, Card, NumInput } from "@/components/ui";
import { useApp } from "@/state/AppContext";

export default function Progress() {
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
    toast("Vazn saqlandi", "success");
  }

  const latest = weights[weights.length - 1]?.weightKg ?? profile?.weightKg;

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="font-display text-2xl">Progress</div>
        <div className="text-dim text-sm">
          Sog'lom sur'atda 0.5–1% haftada.
        </div>
      </header>

      <Card>
        <div className="text-dim text-sm">Joriy vazn</div>
        <div className="font-display text-3xl tnum">
          {latest} <span className="text-dim text-base">kg</span>
        </div>
        {targets && (
          <div className="text-sm text-dim mt-2">
            BMI: <span className="tnum">{targets.bmi}</span>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="font-semibold">Yangi vazn kiriting</div>
        <NumInput
          value={w}
          onChange={(e) => setW(Number(e.target.value) || 0)}
        />
        <Btn onClick={log} className="w-full">
          Saqlash
        </Btn>
      </Card>

      <Card>
        <div className="font-semibold mb-2">Yozuvlar</div>
        {weights.length === 0 ? (
          <div className="text-dim text-sm">Hali yozuv yo'q.</div>
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
                  <span className="text-ink">{w.weightKg} kg</span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
