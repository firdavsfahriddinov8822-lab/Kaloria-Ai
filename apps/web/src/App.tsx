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
import Setup from "@/screens/Setup";
import Home from "@/screens/Home";
import Food from "@/screens/Food";
import AddFood from "@/screens/AddFood";
import Workouts from "@/screens/Workouts";
import Session from "@/screens/Session";
import Progress from "@/screens/Progress";
import Settings from "@/screens/Settings";
import Login from "@/screens/Login";

function TabBar() {
  const tabs = [
    { to: "/", labelUz: "Bosh", Icon: HomeIcon },
    { to: "/food", labelUz: "Ovqat", Icon: UtensilsCrossed },
    { to: "/workouts", labelUz: "Mashq", Icon: Dumbbell },
    { to: "/progress", labelUz: "Progress", Icon: BarChart3 },
    { to: "/settings", labelUz: "Sozlash", Icon: SettingsIcon },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-elev border-t border-elev2 safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {tabs.map(({ to, labelUz, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-xs ${
                isActive ? "text-cal" : "text-dim"
              }`
            }
          >
            <Icon size={22} />
            <span className="mt-0.5">{labelUz}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const { state } = useApp();
  const location = useLocation();
  const showTabs =
    !!state.profile &&
    !["/setup", "/login"].includes(location.pathname);

  if (!state.user && !state.profile) {
    if (location.pathname !== "/login" && location.pathname !== "/setup") {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <div className="min-h-full pb-20 max-w-md mx-auto">
      <Toasts />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
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
