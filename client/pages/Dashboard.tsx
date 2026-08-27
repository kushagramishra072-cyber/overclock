import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useExamsStore } from "@/hooks/useExamsStore";
import { useTimerStore } from "@/hooks/useTimerStore";
import FeedbackModal from "@/components/FeedbackModal";
import {
  Clock,
  BookOpen,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { daysUntilDate } from "@/lib/calculations";

export default function Dashboard() {
  const navigate = useNavigate();
  const { tasks, completeTask, uncompleteTask } = useTasksStore();
  const { exams } = useExamsStore();
  const { getTodaySessions, getStats } = useTimerStore();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Calculate stats directly without useEffect to avoid infinite loops
  const today = new Date().toDateString();
  const todaysTasks = tasks.filter(
    (t) => new Date(t.deadline).toDateString() === today
  );
  const completedToday = todaysTasks.filter(
    (t) => t.status === "completed"
  ).length;

  const todaySessions = getTodaySessions();
  const focusHours = todaySessions.reduce((sum, s) => sum + s.actualDuration, 0) / 60;
  const timerStats = getStats();

  const stats = {
    tasksToday: todaysTasks.length,
    completedToday,
    focusHoursToday: Math.round(focusHours * 10) / 10,
    streakDays: timerStats.totalSessionsToday,
  };

  // Get next exam
  const nextExam = exams
    .filter((e) => new Date(e.examDate) > new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];

  const daysToNextExam = nextExam ? daysUntilDate(nextExam.examDate) : null;

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    if (currentStatus === "completed") {
      uncompleteTask(taskId);
    } else {
      completeTask(taskId);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Today's Focus</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Tasks Card */}
          <div
            className="glass p-4 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/tasks")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">
                {stats.completedToday}/{stats.tasksToday}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>

          {/* Focus Time */}
          <div
            className="glass p-4 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/adaptive-timer")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-semibold text-accent">
                {stats.focusHoursToday}h
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Focus Time</p>
          </div>

          {/* Exams */}
          <div
            className="glass p-4 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/exams")}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-status-due-soon/10">
                <BookOpen className="w-4 h-4 text-status-due-soon" />
              </div>
              <span className="text-sm font-semibold text-status-due-soon">
                {daysToNextExam !== null ? `${daysToNextExam}d` : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Next Exam</p>
          </div>

          {/* Productivity */}
          <div className="glass p-4 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-status-completed/10">
                <TrendingUp className="w-4 h-4 text-status-completed" />
              </div>
              <span className="text-sm font-semibold text-status-completed">
                {Math.round((stats.completedToday / Math.max(stats.tasksToday, 1)) * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
        </div>

        {/* Main Content - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Tasks - Left Column */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Today's Tasks
            </h2>

            {stats.tasksToday === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks today. You're all set!</p>
            ) : (
              <div className="space-y-2">
                {tasks
                  .filter((t) => new Date(t.deadline).toDateString() === new Date().toDateString())
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleToggleTask(task.id, task.status)}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        className="mt-1 w-4 h-4 rounded cursor-pointer accent-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            task.status === "completed"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.subject}
                        </p>
                      </div>
                    </div>
                  ))}
                {stats.tasksToday > 5 && (
                  <p className="text-xs text-muted-foreground pt-2">
                    +{stats.tasksToday - 5} more tasks
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Next Exam - Right Column */}
          {nextExam && (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Next Exam
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{nextExam.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(nextExam.examDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-muted-foreground">Days left</span>
                  <span className="text-2xl font-bold text-primary">
                    {daysToNextExam}
                  </span>
                </div>

                {nextExam.topics && nextExam.topics.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      Topics ({nextExam.topics.length})
                    </p>
                    <div className="space-y-1">
                      {nextExam.topics.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className="text-xs flex items-center gap-2 text-foreground/70"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {t.name}
                        </div>
                      ))}
                      {nextExam.topics.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{nextExam.topics.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass p-6 rounded-2xl mb-8">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => navigate("/adaptive-timer")}
              className="p-4 rounded-xl hover:bg-white/10 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">⏱️</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Start Focus
              </p>
            </button>
            <button
              onClick={() => navigate("/tasks")}
              className="p-4 rounded-xl hover:bg-white/10 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Tasks
              </p>
            </button>
            <button
              onClick={() => navigate("/exams")}
              className="p-4 rounded-xl hover:bg-white/10 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">📚</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Exams
              </p>
            </button>
            <button
              onClick={() => navigate("/crisis-mode")}
              className="p-4 rounded-xl hover:bg-white/10 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">🚨</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Emergency
              </p>
            </button>
            <button
              onClick={() => navigate("/about")}
              className="p-4 rounded-xl hover:bg-white/10 transition-colors text-center group"
            >
              <div className="text-2xl mb-2">ℹ️</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                About
              </p>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="glass p-6 rounded-2xl border-primary/30 bg-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold mb-1">Built with care for students</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Overclock v1.0 • Created by Kushagra
              </p>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer"
              >
                💌 Send feedback
              </button>
            </div>
          </div>
        </div>

        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
      </div>
    </div>
  );
}


