import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function BackNavigation() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/startup")}
      className="fixed top-6 left-6 z-50 p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      title="Back to home"
      aria-label="Go back to home"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}
