import { useState } from "react";
import { useSleepStore } from "@/hooks/useSleepStore";
import { SleepChart } from "@/components/SleepChart";
import HomeButton from "@/components/HomeButton";
import { Trash2, Plus } from "lucide-react";

export default function Sleep() {
  const {
    logs,
    addSleepLog,
    deleteSleepLog,
    getSleepLogsForLast7Days,
    getAverageSleep,
    getDaysBelow7Hours,
  } = useSleepStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    bedtime: "",
    wakeTime: "",
  });

  const addDemoSleepLogs = () => {
    const today = new Date();
    // Add 7 days of varied sleep data
    addSleepLog(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), "23:00", "07:30"); // 8.5h
    addSleepLog(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), "23:30", "06:30"); // 7h
    addSleepLog(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), "00:00", "05:30"); // 5.5h (below)
    addSleepLog(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), "22:30", "07:00"); // 8.5h
    addSleepLog(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), "23:00", "06:00"); // 7h
    addSleepLog(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), "23:45", "06:15"); // 6.5h (below)
    addSleepLog(today, "23:00", "07:30"); // 8.5h
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.bedtime || !formData.wakeTime) {
      return;
    }

    addSleepLog(new Date(formData.date), formData.bedtime, formData.wakeTime);

    setFormData({
      date: new Date().toISOString().split("T")[0],
      bedtime: "",
      wakeTime: "",
    });
    setShowForm(false);
  };

  const last7Logs = getSleepLogsForLast7Days();
  const avgSleep = getAverageSleep();
  const belowThreshold = getDaysBelow7Hours();
  const avgHours = Math.floor(avgSleep / 60);
  const avgMinutes = avgSleep % 60;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Sleep & Energy</h1>
            <p className="text-sm text-muted-foreground">
              {logs.length} total logs
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={addDemoSleepLogs}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:opacity-90"
            >
              Demo Data
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Log Sleep
            </button>
            <HomeButton />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg glass p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Avg Sleep
            </p>
            <p className="text-2xl font-bold">
              {avgHours}h {avgMinutes}m
            </p>
          </div>
          <div className="rounded-lg glass p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Last 7 Days
            </p>
            <p className="text-2xl font-bold">{last7Logs.length}</p>
          </div>
          <div className="rounded-lg glass p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Below 7h
            </p>
            <p className="text-2xl font-bold text-status-overdue">
              {belowThreshold}
            </p>
          </div>
        </div>

        {/* Weekly Sleep Chart */}
        <div className="mb-6">
          <SleepChart logs={logs} />
        </div>

        {/* Add Sleep Log Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl glass p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Bedtime
                </label>
                <input
                  type="time"
                  required
                  value={formData.bedtime}
                  onChange={(e) =>
                    setFormData({ ...formData, bedtime: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Wake Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.wakeTime}
                  onChange={(e) =>
                    setFormData({ ...formData, wakeTime: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Save Sleep Log
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Sleep Logs */}
        {logs.length === 0 ? (
          <div className="rounded-lg glass p-8 text-center">
            <p className="text-sm text-muted-foreground">No sleep logs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((log) => {
                const hours = Math.floor(log.durationMinutes / 60);
                const minutes = log.durationMinutes % 60;
                const isBelow7h = log.durationMinutes < 7 * 60;
                const dateStr = new Date(log.date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                );

                return (
                  <div
                    key={log.id}
                    className="rounded-lg glass p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{dateStr}</h3>
                          {isBelow7h && (
                            <span className="text-xs bg-status-overdue/20 text-status-overdue px-2 py-1 rounded">
                              Below 7h
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            {log.bedtime} → {log.wakeTime}
                          </p>
                          <p className="font-semibold text-foreground">
                            {hours}h {minutes}m sleep
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSleepLog(log.id)}
                        className="text-destructive hover:opacity-70 transition-subtle p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
