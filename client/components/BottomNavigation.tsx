import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare2,
  BookOpen,
  Calendar,
  Moon,
  Settings,
} from "lucide-react";
import { Skiper43Taskbar, Skiper43NavItem } from "@/components/ui/skiper43";

const NAV_ITEMS: Skiper43NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "tasks", label: "Tasks", icon: CheckSquare2, path: "/tasks" },
  { id: "exams", label: "Exams", icon: BookOpen, path: "/exams" },
  { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
  { id: "sleep", label: "Sleep", icon: Moon, path: "/sleep" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Skiper43Taskbar
      items={NAV_ITEMS}
      activePath={location.pathname}
      onSelect={(item) => navigate(item.path)}
    />
  );
}

