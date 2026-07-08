import { useNavigate, useLocation } from "react-router-dom";
import { Home, CheckSquare2, Clock, AlertCircle, BookOpen } from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "tasks", label: "Tasks", icon: CheckSquare2, path: "/tasks" },
  { id: "exams", label: "Exams", icon: BookOpen, path: "/exams" },
  { id: "focus", label: "Focus", icon: Clock, path: "/adaptive-timer" },
  { id: "crisis", label: "Crisis", icon: AlertCircle, path: "/crisis-mode" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-end justify-center pb-6 z-40 pointer-events-none">
      {/* macOS Dock Background */}
      <nav className="flex items-center justify-center gap-2 px-6 py-3 rounded-full glass-lg pointer-events-auto shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (item.path === "/" && currentPath === "/dashboard");

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-black/20 active:scale-90 ${
                isActive
                  ? "bg-white/15 dark:bg-black/30 text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-125" : ""}`} />
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
