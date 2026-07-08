import { useNavigate } from "react-router-dom";
import {
  CheckSquare2,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  Settings,
} from "lucide-react";

const features = [
  {
    id: "tasks",
    name: "Tasks",
    icon: <CheckSquare2 className="w-8 h-8" />,
    path: "/tasks",
    gradient: "from-blue-500/40 via-blue-500/20 to-transparent",
    borderColor: "border-blue-400/30",
    hoverColor: "hover:border-blue-400/60 hover:shadow-blue-500/20",
  },
  {
    id: "schedule",
    name: "Schedule",
    icon: <Calendar className="w-8 h-8" />,
    path: "/schedule",
    gradient: "from-emerald-500/40 via-emerald-500/20 to-transparent",
    borderColor: "border-emerald-400/30",
    hoverColor: "hover:border-emerald-400/60 hover:shadow-emerald-500/20",
  },
  {
    id: "exams",
    name: "Exams",
    icon: <BookOpen className="w-8 h-8" />,
    path: "/exams",
    gradient: "from-purple-500/40 via-purple-500/20 to-transparent",
    borderColor: "border-purple-400/30",
    hoverColor: "hover:border-purple-400/60 hover:shadow-purple-500/20",
  },
  {
    id: "timer",
    name: "Focus",
    icon: <Clock className="w-8 h-8" />,
    path: "/adaptive-timer",
    gradient: "from-cyan-500/40 via-cyan-500/20 to-transparent",
    borderColor: "border-cyan-400/30",
    hoverColor: "hover:border-cyan-400/60 hover:shadow-cyan-500/20",
  },
  {
    id: "crisis",
    name: "Crisis",
    icon: <AlertCircle className="w-8 h-8" />,
    path: "/crisis-mode",
    gradient: "from-red-500/40 via-red-500/20 to-transparent",
    borderColor: "border-red-400/30",
    hoverColor: "hover:border-red-400/60 hover:shadow-red-500/20",
  },
  {
    id: "settings",
    name: "Settings",
    icon: <Settings className="w-8 h-8" />,
    path: "/settings",
    gradient: "from-orange-500/40 via-orange-500/20 to-transparent",
    borderColor: "border-orange-400/30",
    hoverColor: "hover:border-orange-400/60 hover:shadow-orange-500/20",
  },
];

export default function Startup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Student Survival</h1>
        <p className="text-muted-foreground">Select what you need</p>
      </div>

      {/* Feature Grid */}
      <div className="px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => navigate(feature.path)}
              className={`group relative rounded-2xl border ${feature.borderColor} bg-gradient-to-br ${feature.gradient} backdrop-blur-md p-6 overflow-hidden transition-all duration-500 ${feature.hoverColor} hover:shadow-2xl`}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h2 className="text-lg font-semibold text-center">
                  {feature.name}
                </h2>
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute -inset-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent group-hover:animate-pulse" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 mt-12 text-center text-sm text-muted-foreground">
        <p>Tap any section to begin.</p>
      </div>
    </div>
  );
}
