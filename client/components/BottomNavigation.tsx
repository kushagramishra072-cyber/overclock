import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare2,
  BookOpen,
  Calendar,
  Moon,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CheckSquare2, label: "Tasks", path: "/tasks" },
  { icon: BookOpen, label: "Exams", path: "/exams" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: Moon, label: "Sleep", path: "/sleep" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-subtle",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
