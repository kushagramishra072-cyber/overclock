import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useExamsStore } from "@/hooks/useExamsStore";
import { useSleepStore } from "@/hooks/useSleepStore";
import {
  calculateSurvivalScore,
  calculateCompletionRate,
  calculateDeadlineCompression,
  calculateSleepConsistency,
  countOverdueTasks,
  getTasksDueToday,
  daysUntilDate,
} from "@/lib/calculations";
import { CheckSquare2, BookOpen, Moon, Sun } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { tasks } = useTasksStore();
  const { exams } = useExamsStore();
  const { logs: sleepLogs, getAverageSleep } = useSleepStore();

  const [survivalScore, setSurvivalScore] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);

  useEffect(() => {
    const completionRate = calculateCompletionRate(tasks);
    const deadlineCompression = calculateDeadlineCompression(tasks);
    const sleepConsistency = calculateSleepConsistency(sleepLogs);

    const score = calculateSurvivalScore(
      completionRate,
      deadlineCompression,
      sleepConsistency
    );

    setSurvivalScore(score);
    setOverdueTasks(countOverdueTasks(tasks));
  }, [tasks, sleepLogs, getAverageSleep]);

  // Get today's tasks
  const todaysTasks = tasks.filter((t) => {
    const taskDate = new Date(t.deadline).toDateString();
    return taskDate === new Date().toDateString();
  });

  // Get next exam
  const nextExam = exams
    .filter((e) => new Date(e.examDate) > new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];

  const daysUntilNextExam = nextExam
    ? daysUntilDate(new Date(nextExam.examDate))
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header - Minimal */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Home</h1>
        </div>
        <button
            onClick={toggleDarkMode}
            className="p-3 rounded-xl glass hover:scale-110 transition-all duration-300"
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Content - Lots of whitespace */}
      <div className="px-6 py-8 space-y-12 max-w-2xl">
        {/* Today's Tasks Card */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Today
          </h2>

          <div
            onClick={() => navigate("/tasks")}
            className="group cursor-pointer rounded-2xl glass p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckSquare2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Tasks</h3>
              </div>
              {overdueTasks > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-status-overdue/20 text-status-overdue">
                  {overdueTasks} overdue
                </span>
              )}
            </div>

            {todaysTasks.length > 0 ? (
              <div className="space-y-2">
                {todaysTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <span
                      className={`flex-1 ${
                        task.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
                {todaysTasks.length > 3 && (
                  <p className="text-xs text-muted-foreground pt-2">
                    +{todaysTasks.length - 3} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tasks today. Nice! 🎉
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Tap to manage →
              </p>
            </div>
          </div>
        </div>

        {/* Next Exam Card */}
        {nextExam && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming
            </h2>

            <div
              onClick={() => navigate("/exams")}
              className="group cursor-pointer rounded-2xl glass p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{nextExam.subject}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {new Date(nextExam.examDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              {daysUntilNextExam !== null && (
                <div className="inline-block">
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      daysUntilNextExam <= 7
                        ? "bg-status-overdue/20 text-status-overdue"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {daysUntilNextExam === 0
                      ? "Today! 🚨"
                      : daysUntilNextExam === 1
                        ? "Tomorrow"
                        : `${daysUntilNextExam}d away`}
                  </span>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  View exam →
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Crisis Mode CTA */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Emergency
          </h2>

          <button
            onClick={() => navigate("/crisis-mode")}
            className="w-full group cursor-pointer rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-600/20 to-red-700/20 p-8 hover:shadow-lg hover:border-red-500 transition-all duration-300 text-left"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-500 mb-2">
                  Crisis Mode
                </h3>
                <p className="text-sm text-red-500/80">
                  Exam is close? Activate emergency prep.
                </p>
              </div>
              <span className="text-2xl">🚨</span>
            </div>
          </button>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
