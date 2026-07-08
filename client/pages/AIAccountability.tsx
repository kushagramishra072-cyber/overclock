import { useState, useEffect } from "react";
import { useAccountabilityStore } from "@/hooks/useAccountabilityStore";
import {
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Target,
  Zap,
} from "lucide-react";

export default function AIAccountability() {
  const { planDay, recordActual, getLast7Days, calculateMetrics } =
    useAccountabilityStore();

  const [plannedHours, setPlannedHours] = useState(2);
  const [plannedTasks, setPlannedTasks] = useState(3);
  const [actualHours, setActualHours] = useState(0);
  const [actualTasks, setActualTasks] = useState(0);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showActualForm, setShowActualForm] = useState(false);

  const last7Days = getLast7Days();
  const metrics = calculateMetrics();
  const today = new Date().toISOString().split("T")[0];
  const todayData = last7Days.find((d) => d.date === today);

  const handlePlanDay = () => {
    planDay(plannedHours, plannedTasks);
    setShowPlanForm(false);
  };

  const handleRecordActual = () => {
    recordActual(actualHours, actualTasks);
    setShowActualForm(false);
    setActualHours(0);
    setActualTasks(0);
  };

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-status-completed";
      case "good":
        return "text-primary";
      case "mediocre":
        return "text-status-due-soon";
      case "poor":
        return "text-status-overdue";
      default:
        return "text-status-overdue";
    }
  };

  const getPerformanceLevelIcon = (level: string) => {
    switch (level) {
      case "excellent":
        return "🏆";
      case "good":
        return "👍";
      case "mediocre":
        return "⚠️";
      case "poor":
        return "💀";
      default:
        return "💀";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">AI Accountability</h1>
          <p className="text-sm text-muted-foreground">
            No excuses. No motivation quotes. Just brutal honesty.
          </p>
        </div>

        {/* Overall Performance Score */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                OVERALL PERFORMANCE
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">
                  {metrics.overallScore}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getPerformanceLevelColor(metrics.performanceLevel)}`}>
                {getPerformanceLevelIcon(metrics.performanceLevel)}
              </p>
              <p
                className={`text-lg font-semibold capitalize ${getPerformanceLevelColor(metrics.performanceLevel)}`}
              >
                {metrics.performanceLevel.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${
                metrics.overallScore >= 85
                  ? "bg-status-completed"
                  : metrics.overallScore >= 70
                    ? "bg-primary"
                    : metrics.overallScore >= 50
                      ? "bg-status-due-soon"
                      : "bg-status-overdue"
              }`}
              style={{ width: `${metrics.overallScore}%` }}
            />
          </div>
        </div>

        {/* Last Callout */}
        {todayData && (
          <div
            className={`mb-8 rounded-lg border p-4 ${
              todayData.status === "success"
                ? "border-status-completed/30 bg-status-completed/5"
                : todayData.status === "warning"
                  ? "border-status-due-soon/30 bg-status-due-soon/5"
                  : "border-status-overdue/30 bg-status-overdue/5"
            }`}
          >
            <p className="text-sm font-medium mb-2">Today's Callout</p>
            <p className="text-sm leading-relaxed">{todayData.callout}</p>
          </div>
        )}

        {/* Today's Plan & Actual */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {/* Plan */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-3">PLANNED</p>
            {todayData && todayData.plannedHours > 0 ? (
              <>
                <p className="text-2xl font-bold mb-2">
                  {todayData.plannedHours}h {todayData.plannedTasks}t
                </p>
                <button
                  onClick={() => {
                    setPlannedHours(todayData.plannedHours);
                    setPlannedTasks(todayData.plannedTasks);
                    setShowPlanForm(true);
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Update Plan
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowPlanForm(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Plan Today
              </button>
            )}
          </div>

          {/* Actual */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-3">ACTUAL</p>
            {todayData && todayData.actualHours > 0 ? (
              <>
                <p className="text-2xl font-bold mb-2">
                  {todayData.actualHours}h {todayData.actualTasks}t
                </p>
                <p className={`text-xs font-semibold ${
                  todayData.status === "success"
                    ? "text-status-completed"
                    : todayData.status === "warning"
                      ? "text-status-due-soon"
                      : "text-status-overdue"
                }`}>
                  {todayData.performanceScore}/100
                </p>
              </>
            ) : (
              <button
                onClick={() => setShowActualForm(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Log Actual
              </button>
            )}
          </div>
        </div>

        {/* Plan Form */}
        {showPlanForm && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Plan Your Day</h2>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Study Hours
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={plannedHours}
                onChange={(e) =>
                  setPlannedHours(parseFloat(e.target.value) || 0)
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Tasks to Complete
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={plannedTasks}
                onChange={(e) =>
                  setPlannedTasks(parseInt(e.target.value) || 0)
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePlanDay}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Set Plan
              </button>
              <button
                onClick={() => setShowPlanForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actual Form */}
        {showActualForm && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">What Did You Actually Do?</h2>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Actual Study Hours
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={actualHours}
                onChange={(e) =>
                  setActualHours(parseFloat(e.target.value) || 0)
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Actual Tasks Completed
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={actualTasks}
                onChange={(e) =>
                  setActualTasks(parseInt(e.target.value) || 0)
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRecordActual}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Record
              </button>
              <button
                onClick={() => setShowActualForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Weekly Metrics */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Weekly Breakdown</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Consistency</p>
              <p className="text-2xl font-bold text-primary">
                {metrics.consistencyScore}%
              </p>
              <p className="text-xs text-muted-foreground">days tracked</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hours</p>
              <p className="text-2xl font-bold text-primary">
                {metrics.hoursScore}%
              </p>
              <p className="text-xs text-muted-foreground">planned vs actual</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Completion</p>
              <p className="text-2xl font-bold text-primary">
                {metrics.completionScore}%
              </p>
              <p className="text-xs text-muted-foreground">tasks done</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Trend</p>
              <p
                className={`text-xl font-bold ${
                  metrics.weeklyTrend === "improving"
                    ? "text-status-completed"
                    : metrics.weeklyTrend === "declining"
                      ? "text-status-overdue"
                      : "text-muted-foreground"
                }`}
              >
                {metrics.weeklyTrend === "improving"
                  ? "📈 Up"
                  : metrics.weeklyTrend === "declining"
                    ? "📉 Down"
                    : "➡️ Flat"}
              </p>
            </div>
          </div>
        </div>

        {/* Last 7 Days History */}
        {last7Days.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Last 7 Days</h2>
            <div className="space-y-3">
              {last7Days
                .slice()
                .reverse()
                .map((day) => (
                  <div
                    key={day.date}
                    className={`p-3 rounded-lg border ${
                      day.performanceScore >= 75
                        ? "bg-status-completed/5 border-status-completed/30"
                        : day.performanceScore >= 50
                          ? "bg-status-due-soon/5 border-status-due-soon/30"
                          : "bg-status-overdue/5 border-status-overdue/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          day.performanceScore >= 75
                            ? "text-status-completed"
                            : day.performanceScore >= 50
                              ? "text-status-due-soon"
                              : "text-status-overdue"
                        }`}
                      >
                        {day.performanceScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {day.actualHours}h / {day.plannedHours}h planned · {day.actualTasks}/{day.plannedTasks} tasks
                    </p>
                    <p className="text-xs leading-relaxed text-foreground/80">
                      {day.callout}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
