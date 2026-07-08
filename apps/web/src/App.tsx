import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  UtensilsCrossed,
  Dumbbell,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { Toasts } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useI18n } from "@/i18n";
import { storageGet } from "@/lib/storage";
import { isPinEnabled, isUnlocked, setUnlocked, subscribeLock } from "@/lib/security";
import Setup from "@/screens/Setup";
import Home from "@/screens/Home";
import Food from "@/screens/Food";
import AddFood from "@/screens/AddFood";
import Workouts from "@/screens/Workouts";
import Session from "@/screens/Session";
import Progress from "@/screens/Progress";
import Settings from "@/screens/Settings";
import Login from "@/screens/Login";
import LanguagePick from "@/screens/LanguagePick";
import PinSetup from "@/screens/PinSetup";
import Lock from "@/screens/Lock";

function TabBar() {
  const { t } = useI18n();
  const tabs = [
    { to: "/", labelKey: "tab_home" as const, Icon: HomeIcon },
    { to: "/food", labelKey: "tab_food" as const, Icon: UtensilsCrossed },
    { to: "/workouts", labelKey: "tab_workouts" as const, Icon: Dumbbell },
    { to: "/progress", labelKey: "tab_progress" as const, Icon: BarChart3 },
    { to: "/settings", labelKey: "tab_settings" as const, Icon: SettingsIcon },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-elev/95 backdrop-blur-md border-t border-line/60 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {tabs.map(({ to, labelKey, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-xs transition relative ${
                isActive ? "text-cal" : "text-mute hover:text-dim"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cal rounded-full shadow-glow-cal" />
                )}
                <Icon size={22} />
                <span className="mt-0.5 font-medium">{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const { state } = useApp();
  const location = useLocation();
  const [unlocked, setUnlockedState] = useState(isUnlocked());

  useEffect(() => subscribeLock(setUnlockedState), []);

  // On boot: if a PIN is set, boot locked. Otherwise auto-unlock.
  useEffect(() => {
    if (!isPinEnabled()) setUnlocked(true);
  }, []);

  const localePicked = storageGet<boolean>("locale:picked", false);
  const publicPaths = ["/language", "/login", "/setup", "/pin-setup"];
  const isPublic = publicPaths.includes(location.pathname);

  if (!localePicked && location.pathname !== "/language") {
    return <Navigate to="/language" replace />;
  }

  if (isPinEnabled() && !unlocked && location.pathname !== "/language") {
    return <Lock />;
  }

  if (!state.user && !state.profile && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  const showTabs = !!state.profile && !isPublic;

  return (
    <div className="min-h-full pb-20 max-w-md mx-auto">
      <Toasts />
      <Routes>
        <Route path="/language" element={<LanguagePick />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/pin-setup" element={<PinSetup />} />
        <Route
          path="/"
          element={state.profile ? <Home /> : <Navigate to="/setup" replace />}
        />
        <Route path="/food" element={<Food />} />
        <Route path="/food/add" element={<AddFood />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:planId" element={<Session />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTabs && <TabBar />}
    </div>
  );
}
