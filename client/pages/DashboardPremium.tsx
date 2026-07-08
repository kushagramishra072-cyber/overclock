import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useExamsStore } from "@/hooks/useExamsStore";
import { useXPSystem } from "@/hooks/useXPSystem";
import {
  TrendingUp,
  Zap,
  Award,
  BookOpen,
  CheckCircle2,
  Calendar,
  Flame,
} from "lucide-react";
import { daysUntilDate } from "@/lib/calculations";

export default function DashboardPremium() {
  const navigate = useNavigate();
  const { tasks } = useTasksStore();
  const { exams } = useExamsStore();
  const { xpData, achievements, getUnlockedAchievements, getProgress } = useXPSystem();

  const [completedToday, setCompletedToday] = useState(0);
  const nextExam = exams
    .filter((e) => new Date(e.examDate) > new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];

  useEffect(() => {
    const today = new Date().toDateString();
    const count = tasks.filter(
      (t) => t.status === "completed" && new Date(t.createdAt || "").toDateString() === today
    ).length;
    setCompletedToday(count);
  }, [tasks]);

  const unlockedAchievements = getUnlockedAchievements();
  const progressPercent = getProgress();

  return (
    <div className="page-container pb-32">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
        {/* Header Section */}
        <div className="mb-12 stagger-list">
          <div className="mb-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">
              Welcome Back
            </p>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-primary bg-clip-text text-transparent">
            Keep Your Momentum
          </h1>
          <p className="text-muted-foreground mt-2">
            {xpData.currentStreak} day streak • Level {xpData.level}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 stagger-list">
          {/* Level Progress Card */}
          <div className="glass p-6 rounded-2xl col-span-1 md:col-span-2 lg:col-span-1 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Level
                  </p>
                  <p className="text-2xl font-bold">{xpData.level}</p>
                </div>
              </div>
              <p className="text-right text-xs text-muted-foreground">
                {xpData.xpThisLevel} / {xpData.xpNeeded}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Streak Card */}
          <div className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-status-overdue/20 group-hover:bg-status-overdue/30 transition-colors">
                <Flame className="w-5 h-5 text-status-overdue" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Streak
                </p>
                <p className="text-2xl font-bold">{xpData.currentStreak}d</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Best: {xpData.longestStreak} days
            </p>
          </div>

          {/* Tasks Completed Today */}
          <div className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-status-completed/20 group-hover:bg-status-completed/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-status-completed" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Today
                </p>
                <p className="text-2xl font-bold">{completedToday}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              tasks completed
            </p>
          </div>
        </div>

        {/* Next Exam & Achievements Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 stagger-list">
          {/* Next Exam */}
          {nextExam && (
            <div className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate("/exams")}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Next Exam
                    </p>
                    <p className="text-lg font-bold">{nextExam.subject}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-status-due-soon/20 text-status-due-soon text-sm font-semibold">
                  {daysUntilDate(nextExam.examDate)}d
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(nextExam.examDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                })}
              </p>
            </div>
          )}

          {/* Achievements */}
          <div className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Achievements
                </p>
                <p className="text-lg font-bold">
                  {unlockedAchievements.length} / {achievements.length}
                </p>
              </div>
            </div>

            {/* Recent achievements */}
            <div className="flex gap-2 flex-wrap">
              {unlockedAchievements.slice(-3).map((ach) => (
                <div key={ach.id} className="text-xl">
                  {ach.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass p-6 rounded-2xl mb-8 stagger-list">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/tasks")}
              className="btn-glass p-4 text-center group"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Tasks
              </p>
            </button>
            <button
              onClick={() => navigate("/adaptive-timer")}
              className="btn-glass p-4 text-center group"
            >
              <div className="text-2xl mb-2">⏱️</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Focus
              </p>
            </button>
            <button
              onClick={() => navigate("/exams")}
              className="btn-glass p-4 text-center group"
            >
              <div className="text-2xl mb-2">📚</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Exams
              </p>
            </button>
            <button
              onClick={() => navigate("/crisis-mode")}
              className="btn-glass p-4 text-center group"
            >
              <div className="text-2xl mb-2">🚨</div>
              <p className="text-xs font-medium group-hover:text-primary transition-colors">
                Crisis
              </p>
            </button>
          </div>
        </div>

        {/* Tips & Insights */}
        <div className="glass p-6 rounded-2xl stagger-list">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Insights
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-lg">💡</span>
              <p className="text-muted-foreground">
                You're most productive between 2-5 PM. Schedule important tasks then.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">⚡</span>
              <p className="text-muted-foreground">
                You've earned {xpData.totalXP} XP this month. Keep it up!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🎯</span>
              <p className="text-muted-foreground">
                {nextExam ? `${daysUntilDate(nextExam.examDate)} days until your next exam` : "No upcoming exams"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
