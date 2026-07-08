import { useState } from "react";
import { useWeaknessStore } from "@/hooks/useWeaknessStore";
import { AlertTriangle, TrendingDown, Plus } from "lucide-react";

export default function WeaknessDetection() {
  const { weaknesses, trackSubject, recordTestScore, getWeakSubjects } =
    useWeaknessStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    sessionLength: 30,
    testScore: "",
  });

  const weakSubjects = getWeakSubjects();
  const allSubjects = weaknesses.sort((a, b) =>
    a.priority === b.priority ? 0 : a.priority === "high" ? -1 : 1
  );

  const handleAddTracking = () => {
    if (!formData.subject) return;

    trackSubject(formData.subject, formData.sessionLength);

    if (formData.testScore) {
      recordTestScore(formData.subject, parseInt(formData.testScore));
    }

    setFormData({ subject: "", sessionLength: 30, testScore: "" });
    setShowAddForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-status-overdue/30 bg-status-overdue/5";
      case "medium":
        return "border-status-due-soon/30 bg-status-due-soon/5";
      default:
        return "border-border bg-card";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      default:
        return "🟢";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Weakness Detection</h1>
          <p className="text-sm text-muted-foreground">
            Identify struggling subjects and get smart recommendations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Tracked Subjects</p>
            <p className="text-3xl font-bold">{weaknesses.length}</p>
          </div>
          <div className="rounded-lg border border-status-overdue/30 bg-status-overdue/5 p-4">
            <p className="text-xs text-muted-foreground mb-1">Needs Help</p>
            <p className="text-3xl font-bold text-status-overdue">
              {weakSubjects.length}
            </p>
          </div>
        </div>

        {/* Add Subject Form */}
        {showAddForm && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Track a Subject</h2>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g., Physics"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Session Length (min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={formData.sessionLength}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionLength: Math.max(5, parseInt(e.target.value) || 30),
                    })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Test Score (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={formData.testScore}
                  onChange={(e) =>
                    setFormData({ ...formData, testScore: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTracking}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Add Subject
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-8 w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-subtle hover:bg-secondary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Track New Subject
          </button>
        )}

        {/* Critical Issues Alert */}
        {weakSubjects.length > 0 && (
          <div className="mb-8 rounded-lg border border-status-overdue/30 bg-status-overdue/5 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-status-overdue flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-status-overdue mb-2">
                  {weakSubjects.length} Subject{weakSubjects.length !== 1 ? "s" : ""} Need{weakSubjects.length !== 1 ? "" : "s"} Attention
                </h2>
                <p className="text-sm text-foreground/80 mb-4">
                  Increase focus on these areas to improve overall performance.
                </p>
                <div className="space-y-2">
                  {weakSubjects.slice(0, 3).map((weakness) => (
                    <p
                      key={weakness.subject}
                      className="text-sm font-medium text-status-overdue"
                    >
                      • {weakness.subject} ({weakness.avoidanceDays}d avoided)
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Subjects */}
        {allSubjects.length > 0 ? (
          <div className="space-y-4">
            {allSubjects.map((weakness) => (
              <div
                key={weakness.subject}
                className={`rounded-lg border p-4 ${getPriorityColor(weakness.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getPriorityIcon(weakness.priority)}
                    </span>
                    <div>
                      <h3 className="font-semibold">{weakness.subject}</h3>
                      <p className="text-xs text-muted-foreground">
                        {weakness.priority === "high"
                          ? "Critical - needs immediate attention"
                          : weakness.priority === "medium"
                            ? "Medium priority"
                            : "On track"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Days Avoided</span>
                    <span className="font-semibold text-lg">
                      {weakness.avoidanceDays}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Avg Session</span>
                    <span className="font-semibold text-lg">
                      {Math.round(weakness.averageSessionLength)}m
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">
                      {weakness.testScore !== undefined
                        ? "Last Score"
                        : "Early Quits"}
                    </span>
                    <span className="font-semibold text-lg">
                      {weakness.testScore !== undefined
                        ? `${weakness.testScore}%`
                        : weakness.earlyQuitCount}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Last studied:{" "}
                    {new Date(weakness.lastStudiedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <TrendingDown className="w-12 h-12 text-primary mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold mb-2">No weaknesses detected yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your subjects to get insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
