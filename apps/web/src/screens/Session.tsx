import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EXERCISES, WORKOUT_PLANS } from "@kaloriya/shared";
import { Btn, Card } from "@/components/ui";
import { useApp } from "@/state/AppContext";

export default function Session() {
  const { planId } = useParams();
  const nav = useNavigate();
  const { state, addWorkout, toast } = useApp();
  const [idx, setIdx] = useState(0);

  const plan = useMemo(
    () => WORKOUT_PLANS.find((p) => p.id === planId),
    [planId],
  );
  const exercises = useMemo(
    () =>
      plan
        ? plan.exerciseIds
            .map((id) => EXERCISES.find((e) => e.id === id))
            .filter(Boolean)
        : [],
    [plan],
  );

  if (!plan) return <div className="p-4">Dastur topilmadi.</div>;

  const totalKcal = exercises.reduce(
    (s, e) => s + (e?.kcalPerSet ?? 0) * (e?.defaultSets ?? 0),
    0,
  );

  function finish() {
    addWorkout({
      id: crypto.randomUUID(),
      exerciseIds: plan!.exerciseIds,
      planId: plan!.id,
      kcalBurned: totalKcal,
      durationMin: plan!.durationMin,
      createdAt: new Date().toISOString(),
    });
    toast("Yakunlandi! Zo'r ish.", "success");
    nav("/");
  }

  const cur = exercises[idx];

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="text-dim text-sm">
          {state.profile?.name} · {plan.nameUz}
        </div>
        <div className="font-display text-2xl">
          {idx + 1} / {exercises.length}
        </div>
      </header>

      {cur && (
        <Card className="space-y-3">
          <div className="font-semibold text-lg">{cur.nameUz}</div>
          <div className="text-dim text-sm">{cur.instructionsUz}</div>
          <div className="grid grid-cols-3 text-sm">
            <div>
              <div className="text-dim">Set</div>
              <div className="tnum">{cur.defaultSets}</div>
            </div>
            <div>
              <div className="text-dim">Reps</div>
              <div className="tnum">{cur.defaultReps}</div>
            </div>
            <div>
              <div className="text-dim">Dam</div>
              <div className="tnum">{cur.restSec}s</div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        {idx > 0 && (
          <Btn variant="ghost" onClick={() => setIdx(idx - 1)} className="flex-1">
            Oldingi
          </Btn>
        )}
        {idx < exercises.length - 1 ? (
          <Btn onClick={() => setIdx(idx + 1)} className="flex-1">
            Keyingi
          </Btn>
        ) : (
          <Btn onClick={finish} className="flex-1">
            Yakunlash
          </Btn>
        )}
      </div>
    </div>
  );
}
