import { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useExamsStore } from "@/hooks/useExamsStore";
import HomeButton from "@/components/HomeButton";
import { Moon, Sun, Download, Trash2, AlertCircle } from "lucide-react";

export default function Settings() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { tasks } = useTasksStore();
  const { exams } = useExamsStore();
  const [showReset, setShowReset] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleExportData = () => {
    const data = {
      tasks,
      exams,
      exportDate: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-survival-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (!resetConfirmed) {
      setResetConfirmed(true);
      return;
    }

    localStorage.removeItem("student_survival_tasks");
    localStorage.removeItem("student_survival_exams");

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your app preferences
            </p>
          </div>
          <HomeButton />
        </div>

        {/* Theme Settings */}
        <div className="mb-8 rounded-2xl glass p-6">
          <h2 className="font-semibold mb-4">Appearance</h2>

          <div className="space-y-3">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-black/10">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDark
                      ? "Easy on the eyes"
                      : "Bright and clean"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isDark
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {isDark ? "✓ On" : "Off"}
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-8 rounded-2xl glass p-6">
          <h2 className="font-semibold mb-4">Data</h2>

          <div className="space-y-3">
            {/* Export */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-black/10">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Export Backup</p>
                  <p className="text-xs text-muted-foreground">
                    Download your data as JSON
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl glass border-status-overdue/50 bg-status-overdue/10 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-status-overdue" />
            Danger Zone
          </h2>

          <div className="p-4 rounded-lg bg-white/5 dark:bg-black/10 border border-status-overdue/20">
            <p className="text-sm text-foreground/80 mb-4">
              Clear all your data permanently. This cannot be undone.
            </p>

            {!showReset ? (
              <button
                onClick={() => setShowReset(true)}
                className="px-4 py-2 rounded-lg border border-status-overdue/50 bg-status-overdue/10 text-status-overdue font-medium text-sm hover:bg-status-overdue/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleResetData}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    resetConfirmed
                      ? "bg-status-overdue text-status-overdue-foreground hover:opacity-90"
                      : "border border-status-overdue/50 bg-status-overdue/10 text-status-overdue hover:bg-status-overdue/20"
                  }`}
                >
                  {resetConfirmed ? "Confirm Reset" : "Are you sure?"}
                </button>
                <button
                  onClick={() => {
                    setShowReset(false);
                    setResetConfirmed(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Student Survival v1.0.0</p>
          <p>Made for students, by students.</p>
        </div>
      </div>
    </div>
  );
}
