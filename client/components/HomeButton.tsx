import { useNavigate, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

export default function HomeButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/dashboard";

  if (isHome) return null;

  return (
    <button
      onClick={() => navigate("/")}
      className="p-2.5 rounded-lg glass hover:bg-white/10 dark:hover:bg-black/20 transition-all duration-300 hover:scale-110 active:scale-95"
      title="Back to Home"
    >
      <Home className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
    </button>
  );
}
