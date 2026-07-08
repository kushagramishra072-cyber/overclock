import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDarkMode } from "./hooks/useDarkMode";
import BottomNav from "./components/BottomNav";
import Startup from "./pages/Startup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Exams from "./pages/Exams";
import Schedule from "./pages/Schedule";
import Sleep from "./pages/Sleep";
import Settings from "./pages/Settings";
import AdaptiveTimer from "./pages/AdaptiveTimer";
import CrisisMode from "./pages/CrisisMode";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Enable dark mode globally
  useDarkMode();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BottomNav />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/startup" element={<Startup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/adaptive-timer" element={<AdaptiveTimer />} />
            <Route path="/crisis-mode" element={<CrisisMode />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Prevent multiple root creation during HMR
if (!window.__APP_ROOT__) {
  window.__APP_ROOT__ = createRoot(document.getElementById("root")!);
}
window.__APP_ROOT__.render(<App />);
