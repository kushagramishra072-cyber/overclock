import { useState } from "react";
import { useBurnoutStore } from "@/hooks/useBurnoutStore";
import { AlertTriangle, TrendingUp, Heart, Cloud } from "lucide-react";

export default function BurnoutAnalysis() {
  const { recordDay, getLast7Days, calculateMetrics } = useBurnoutStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stressLevel: 50,
    focusQuality: 70,
    sleepHours: 7,
    tasksCompleted: 3,
    breaksTaken: 2,
    moodScore: 7,
  });

  const last7Days = getLast7Days();
  const metrics = calculateMetrics();

  const handleSubmitDay = () => {
    recordDay({
      stressLevel: formData.stressLevel,
      focusQuality: formData.focusQuality,
      sleepHours: formData.sleepHours,
      tasksCompleted: formData.tasksCompleted,
      breaksTaken: formData.breaksTaken,
      moodScore: formData.moodScore,
    });
    setShowForm(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "border-status-overdue/50 bg-status-overdue/10";
      case "high":
        return "border-status-due-soon/50 bg-status-due-soon/10";
      case "medium":
        return "border-primary/50 bg-primary/10";
      default:
        return "border-status-completed/50 bg-status-completed/10";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      default:
        return "🟢";
    }
  };

  const maxStress = Math.max(...last7Days.map((d) => d.stressLevel), 100);
  const chartHeight = 200;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Burnout Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your stress levels
          </p>
        </div>

        {/* Current Risk Status */}
        <div className={`mb-8 rounded-lg border p-6 ${getRiskColor(metrics.riskLevel)}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Risk Level</p>
              <p className="text-4xl font-bold">
                {metrics.currentLevel}
                <span className="text-lg">/100</span>
              </p>
              <p className="text-lg font-semibold mt-2">
                {getRiskIcon(metrics.riskLevel)} {metrics.riskLevel.toUpperCase()}
              </p>
            </div>
            <Heart className="w-12 h-12 opacity-40" />
          </div>

          {metrics.riskLevel === "critical" && (
            <div className="p-4 bg-status-overdue/20 border border-status-overdue/50 rounded-lg">
              <p className="text-sm font-semibold text-status-overdue">
                ⚠️ Crisis Mode Recommended
              </p>
              <p className="text-xs text-foreground/80 mt-1">
                Activate Emergency Exam Plan to focus on essentials only.
              </p>
            </div>
          )}
        </div>

        {/* Add Daily Record */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 w-full rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-subtle hover:bg-secondary"
          >
            Log Today's Wellness
          </button>
        )}

        {showForm && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Today's Wellness Check</h2>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Stress Level: {formData.stressLevel}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.stressLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stressLevel: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = Relaxed, 100 = Extremely Stressed
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Focus Quality: {formData.focusQuality}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.focusQuality}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    focusQuality: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = Scattered, 100 = Laser Focused
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Sleep (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sleepHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Mood (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.moodScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      moodScore: Math.max(1, parseInt(e.target.value)),
                    })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Tasks Completed
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.tasksCompleted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tasksCompleted: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Breaks Taken
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.breaksTaken}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breaksTaken: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitDay}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Log Day
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Trend Info */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Trend
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Escalation Rate
              </p>
              <p className="text-2xl font-bold">
                {metrics.escalationRate > 0 ? "+" : ""}
                {metrics.escalationRate} pts/day
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="text-xl font-bold capitalize">
                {metrics.trend === "declining"
                  ? "📈 Increasing"
                  : metrics.trend === "improving"
                    ? "📉 Improving"
                    : "➡️ Stable"}
              </p>
            </div>
          </div>

          {metrics.trend === "declining" && (
            <div className="mt-4 p-3 bg-status-overdue/10 border border-status-overdue/30 rounded-lg">
              <p className="text-sm font-semibold text-status-overdue">
                Stress is increasing. Days until crisis: {metrics.daysUntilCrisis}
              </p>
            </div>
          )}
        </div>

        {/* Stress Chart */}
        {last7Days.length > 0 && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Stress Levels (Last 7 Days)</h2>
            <div
              className="flex items-end justify-between gap-1"
              style={{ height: `${chartHeight}px` }}
            >
              {last7Days.map((day) => {
                const barHeight = (day.stressLevel / 100) * chartHeight;
                const isHigh = day.stressLevel >= 70;
                const isMedium = day.stressLevel >= 40;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isHigh
                          ? "bg-status-overdue"
                          : isMedium
                            ? "bg-status-due-soon"
                            : "bg-status-completed"
                      }`}
                      style={{ height: `${barHeight}px`, minHeight: "4px" }}
                      title={`${day.stressLevel}% stress`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Recommendations
            </h2>
            <ul className="space-y-2">
              {metrics.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <span className="font-semibold flex-shrink-0">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
