import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, Card, Field, TextInput } from "@/components/ui";
import { api } from "@/lib/api";
import { useApp } from "@/state/AppContext";

export default function Login() {
  const nav = useNavigate();
  const { toast, refreshUser } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email || !password) {
      toast("Email va parolni kiriting", "warn");
      return;
    }
    setBusy(true);
    const res =
      mode === "login"
        ? await api.login({ email, password })
        : await api.register({ email, password });
    setBusy(false);
    if (!res.ok) {
      toast(res.error?.message ?? "Xatolik", "error");
      return;
    }
    await refreshUser();
    toast("Xush kelibsiz!", "success");
    nav("/setup");
  }

  return (
    <div className="p-4 pt-10 space-y-4">
      <div className="text-center">
        <div className="font-display text-3xl">Kaloriya</div>
        <div className="text-dim">AI fitnes va ovqatlanish murabbiyi</div>
      </div>
      <Card className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-xl font-semibold ${
              mode === "login" ? "bg-cal text-bg" : "bg-elev2 text-dim"
            }`}
          >
            Kirish
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-xl font-semibold ${
              mode === "register" ? "bg-cal text-bg" : "bg-elev2 text-dim"
            }`}
          >
            Ro'yxat
          </button>
        </div>
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="siz@misol.uz"
          />
        </Field>
        <Field label="Parol">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 8 belgi"
          />
        </Field>
        <Btn onClick={submit} disabled={busy} className="w-full">
          {busy ? "Kuting..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
        </Btn>
      </Card>
    </div>
  );
}
