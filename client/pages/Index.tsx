import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useExamsStore } from "@/hooks/useExamsStore";
import {
  calculateSurvivalScore,
  calculateCompletionRate,
  calculateDeadlineCompression,
  countOverdueTasks,
  daysUntilDate,
} from "@/lib/calculations";
import { CheckSquare2, BookOpen, Moon, Sun, Flame, Sparkles, ArrowRight, AlertTriangle } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const { tasks, completeTask, uncompleteTask } = useTasksStore();
  const { exams } = useExamsStore();

  const [survivalScore, setSurvivalScore] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);

  useEffect(() => {
    const completionRate = calculateCompletionRate(tasks);
    const deadlineCompression = calculateDeadlineCompression(tasks);

    const score = calculateSurvivalScore(
      completionRate,
      deadlineCompression
    );

    setSurvivalScore(score);
    setOverdueTasks(countOverdueTasks(tasks));
  }, [tasks]);

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
      {/* Header - Minimal & High Contrast */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Overclock</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/20 text-primary border border-primary/30">
              v2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your high-performance study dashboard
          </p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all duration-150 transform-gpu active:scale-95 shadow-sm"
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 space-y-6">
        
        {/* Quick Survival Score Bar */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 backdrop-blur-xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Academic Readiness
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {survivalScore}% Readiness Index
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Overdue Tasks</span>
            <span
              className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                overdueTasks > 0
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {overdueTasks > 0 ? `${overdueTasks} pending` : "All clear! ✨"}
            </span>
          </div>
        </div>

        {/* Today's Tasks Card */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Today's Overview
            </h2>
            <button
              onClick={() => navigate("/tasks")}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              Manage Tasks <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => navigate("/tasks")}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-5 hover:border-white/20 hover:bg-zinc-900/95 transition-all duration-150 transform-gpu shadow-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <CheckSquare2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Tasks Due Today</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {todaysTasks.length} {todaysTasks.length === 1 ? "task" : "tasks"} scheduled
                  </p>
                </div>
              </div>

              {overdueTasks > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {overdueTasks} overdue
                </span>
              )}
            </div>

            {todaysTasks.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {todaysTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      task.status === "completed"
                        ? uncompleteTask(task.id)
                        : completeTask(task.id);
                    }}
                    className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 hover:border-white/15 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => {}}
                      className="rounded border-zinc-700 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span
                      className={`flex-1 font-medium truncate ${
                        task.status === "completed"
                          ? "line-through text-muted-foreground"
                          : "text-zinc-200"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/5">
                      {task.subject}
                    </span>
                  </div>
                ))}
                {todaysTasks.length > 3 && (
                  <p className="text-[11px] text-muted-foreground pt-1.5 text-center">
                    +{todaysTasks.length - 3} more tasks
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-zinc-950/40 border border-white/5">
                <p className="text-xs text-zinc-400 font-medium">
                  No tasks due today. You're completely caught up! 🎉
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exam Card */}
        {nextExam && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Next Milestone
              </h2>
              <button
                onClick={() => navigate("/exams")}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                All Exams <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div
              onClick={() => navigate("/exams")}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-5 hover:border-white/20 hover:bg-zinc-900/95 transition-all duration-150 transform-gpu shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{nextExam.subject}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(nextExam.examDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {daysUntilNextExam !== null && (
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      daysUntilNextExam <= 3
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        : daysUntilNextExam <= 7
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    }`}
                  >
                    {daysUntilNextExam === 0
                      ? "Exam Today! 🚨"
                      : daysUntilNextExam === 1
                      ? "Tomorrow"
                      : `${daysUntilNextExam} days left`}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency / Crisis Mode CTA */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Emergency Prep
          </h2>

          <button
            onClick={() => navigate("/crisis-mode")}
            className="w-full cursor-pointer rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-zinc-900/90 to-zinc-950/90 backdrop-blur-xl p-5 hover:border-rose-500/60 transition-all duration-150 transform-gpu active:scale-98 text-left shadow-lg flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-rose-400">
                  Crisis Mode
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Exam approaching? Generate an emergency rapid study roadmap now.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
