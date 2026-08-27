import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare2,
  BookOpen,
  Clock,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Skiper43Taskbar, Skiper43NavItem } from "@/components/ui/skiper43";

const navItems: Skiper43NavItem[] = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "tasks", label: "Tasks", icon: CheckSquare2, path: "/tasks" },
  { id: "exams", label: "Exams", icon: BookOpen, path: "/exams" },
  { id: "focus", label: "Focus Timer", icon: Clock, path: "/adaptive-timer" },
  { id: "crisis", label: "Crisis Mode", icon: AlertCircle, path: "/crisis-mode", highlight: true },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Skiper43Taskbar
      items={navItems}
      activePath={location.pathname}
      onSelect={(item) => navigate(item.path)}
    />
  );
}

