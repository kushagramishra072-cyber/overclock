import { useState, useEffect } from "react";
import { useTimerStore } from "@/hooks/useTimerStore";
import HomeButton from "@/components/HomeButton";
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  TrendingDown,
  Clock,
} from "lucide-react";

export default function AdaptiveTimer() {
  const { addSession, updateSession, completeSession, getTodaySessions, getStats, detectBurnout } =
    useTimerStore();

  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<"normal" | "deep-work" | "crisis">("normal");
  const [plannedDuration, setPlannedDuration] = useState(25);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [showForm, setShowForm] = useState(true);

  const stats = getStats();
  const todaySessions = getTodaySessions();
  const activeSessions = todaySessions.filter((s) => !s.completedAt);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || !activeSessionId) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          completeSession(activeSessionId, plannedDuration);
          setActiveSessionId(null);
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, activeSessionId, plannedDuration, completeSession]);

  const handleStartSession = () => {
    if (!subject || plannedDuration <= 0) return;

    const sessionId = addSession(subject, mode, plannedDuration);
    setActiveSessionId(sessionId);
    setTimeLeft(plannedDuration * 60);
    setTotalElapsed(0);
    setShowForm(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
    if (!isRunning && activeSessionId) {
      updateSession(activeSessionId, {
        pauseCount: (todaySessions.find((s) => s.id === activeSessionId)?.pauseCount || 0) + 1,
      });
    }
  };

  const handleStop = () => {
    if (activeSessionId) {
      const actualMinutes = Math.round(totalElapsed / 60);
      completeSession(activeSessionId, actualMinutes);

      // Check for burnout
      const isBurned = detectBurnout(activeSessionId);
      if (isBurned) {
        alert(
          "⚠️ Burnout detected! Take a longer break before your next session."
        );
      }
    }
    setIsRunning(false);
    setActiveSessionId(null);
    setTimeLeft(0);
    setTotalElapsed(0);
    setShowForm(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const modeDescriptions = {
    normal: "Standard focus with natural breaks",
    "deep-work": "No interruptions allowed, strict focus",
    crisis: "Maximum intensity, exam-prep mode",
  };

  const getModeColor = (m: string) => {
    switch (m) {
      case "deep-work":
        return "from-red-600 to-red-700";
      case "crisis":
        return "from-orange-600 to-orange-700";
      default:
        return "from-blue-600 to-blue-700";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header with Home Button */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Adaptive Timer</h1>
            <p className="text-sm text-muted-foreground">
              A timer that adapts to your rhythm
            </p>
          </div>
          <HomeButton />
        </div>

        {/* Active Session Display */}
        {activeSessionId && (
          <div className={`mb-8 rounded-2xl bg-gradient-to-br ${getModeColor(mode)} text-white p-8 text-center transition-all duration-500 hover:shadow-2xl`}>
            <p className="text-sm opacity-90 mb-2">Current Session</p>
            <div className="text-6xl font-bold mb-4 font-mono">
              {formatTime(timeLeft)}
            </div>
            <p className="text-lg mb-6 opacity-90">{subject}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                )}
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                End Session
              </button>
            </div>

            {stats.burnoutRisk !== "low" && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-left">
                  <p className="font-semibold">Burnout Risk: {stats.burnoutRisk}</p>
                  <p className="opacity-90">Consider taking a longer break soon</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Form */}
        {showForm && !activeSessionId && (
          <div className="mb-8 rounded-2xl glass p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Subject/Topic
              </label>
              <input
                type="text"
                placeholder="e.g., Physics Chapter 3"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={plannedDuration}
                  onChange={(e) =>
                    setPlannedDuration(Math.max(5, parseInt(e.target.value) || 25))
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) =>
                    setMode(e.target.value as "normal" | "deep-work" | "crisis")
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="normal">Normal</option>
                  <option value="deep-work">Deep Work</option>
                  <option value="crisis">Crisis</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {modeDescriptions[mode]}
            </p>

            <button
              onClick={handleStartSession}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
            >
              Start Session
            </button>
          </div>
        )}

        {/* Today's Stats */}
        <div className="mb-8 rounded-2xl glass p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sessions</p>
              <p className="text-2xl font-bold">{stats.totalSessionsToday}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Focus</p>
              <p className="text-2xl font-bold">{stats.totalFocusMinutes} min</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Session</p>
              <p className="text-2xl font-bold">
                {Math.round(stats.averageSessionLength)} min
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Peak Time</p>
              <p className="text-2xl font-bold text-primary">
                {stats.peakFocusTime}
              </p>
            </div>
          </div>

          {stats.burnoutRisk !== "low" && (
            <div className="mt-4 p-3 bg-status-overdue/10 border border-status-overdue/30 rounded-lg flex items-start gap-2">
              <TrendingDown className="w-4 h-4 text-status-overdue flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">
                <span className="font-semibold">⚠️ Burnout Risk: {stats.burnoutRisk}</span>
                <br />
                Take a break or switch to an easier task
              </p>
            </div>
          )}
        </div>

        {/* Session History */}
        {todaySessions.length > 0 && (
          <div className="rounded-2xl glass p-6">
            <h2 className="font-semibold mb-4">Today's Sessions</h2>
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.mode === "crisis"
                        ? "🔴 Crisis Mode"
                        : session.mode === "deep-work"
                          ? "🟠 Deep Work"
                          : "🔵 Normal"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {session.actualDuration
                        ? `${session.actualDuration}/${session.plannedDuration} min`
                        : `${session.plannedDuration} min`}
                    </p>
                    {session.burnoutDetected && (
                      <p className="text-xs text-status-overdue">Burnout</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
