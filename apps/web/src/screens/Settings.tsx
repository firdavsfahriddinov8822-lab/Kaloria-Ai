import { useNavigate } from "react-router-dom";
import { Btn, Card } from "@/components/ui";
import { useApp } from "@/state/AppContext";

export default function Settings() {
  const nav = useNavigate();
  const { state, logout } = useApp();
  const tier = state.user?.subscription?.tier ?? "free";
  const status = state.user?.subscription?.status ?? "none";

  return (
    <div className="p-4 space-y-4">
      <header className="pt-4">
        <div className="font-display text-2xl">Sozlash</div>
      </header>

      <Card>
        <div className="text-dim text-sm">Foydalanuvchi</div>
        <div className="font-semibold">
          {state.user?.email ?? state.user?.phone ?? "Mehmon"}
        </div>
        <div className="text-dim text-sm mt-1">
          Tarif: <span className="text-ink capitalize">{tier}</span> ({status})
        </div>
      </Card>

      <Card className="space-y-2">
        <Btn variant="ghost" onClick={() => nav("/setup")} className="w-full">
          Profilni tahrirlash
        </Btn>
        <Btn
          variant="danger"
          onClick={async () => {
            await logout();
            nav("/login");
          }}
          className="w-full"
        >
          Chiqish
        </Btn>
      </Card>

      <p className="text-dim text-xs text-center">
        Kaloriya tibbiy maslahat emas. Sog'lig'ingiz uchun mutaxassis bilan
        maslahatlashing.
      </p>
    </div>
  );
}
