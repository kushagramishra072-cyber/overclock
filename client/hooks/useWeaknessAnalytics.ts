import { useState, useEffect } from "react";
import { useTimerStore } from "./useTimerStore";
import { useTasksStore } from "./useTasksStore";

interface WeakSubject {
  subject: string;
  failureRate: number;
  lastReviewDate: string;
  reviewCount: number;
  estimatedReadiness: number;
}

interface StudyPattern {
  bestHours: number[];
  procrastinationSpikes: string[];
  consistencyScore: number;
  burnoutRiskLevel: "low" | "medium" | "high";
  recommendedBreakTime: number;
}

export function useWeaknessAnalytics() {
  const { getTodaySessions } = useTimerStore();
  const { tasks } = useTasksStore();
  const [weaknesses, setWeaknesses] = useState<WeakSubject[]>([]);
  const [patterns, setPatterns] = useState<StudyPattern>({
    bestHours: [],
    procrastinationSpikes: [],
    consistencyScore: 0,
    burnoutRiskLevel: "low",
    recommendedBreakTime: 5,
  });

  // Analyze weakness patterns
  useEffect(() => {
    analyzeWeaknesses();
    analyzePatterns();
  }, [tasks]);

  const analyzeWeaknesses = () => {
    const subjectStats: Record<string, { failures: number; reviews: number; lastReview: string }> = {};

    tasks.forEach((task) => {
      const subject = task.subject || "General";
      if (!subjectStats[subject]) {
        subjectStats[subject] = { failures: 0, reviews: 0, lastReview: "" };
      }

      subjectStats[subject].reviews++;
      if (task.status === "overdue" || task.priority === "high") {
        subjectStats[subject].failures++;
      }
      subjectStats[subject].lastReview = new Date(task.deadline).toISOString();
    });

    const weakSubjects: WeakSubject[] = Object.entries(subjectStats).map(
      ([subject, stats]) => ({
        subject,
        failureRate: (stats.failures / stats.reviews) * 100,
        lastReviewDate: stats.lastReview,
        reviewCount: stats.reviews,
        estimatedReadiness: 100 - (stats.failures / stats.reviews) * 100,
      })
    );

    setWeaknesses(weakSubjects.sort((a, b) => b.failureRate - a.failureRate));
  };

  const analyzePatterns = () => {
    const todaySessions = getTodaySessions();
    const hours = todaySessions.map((s) => new Date(((s as any).createdAt || s.completedAt || Date.now())).getHours());
    const hourCounts: Record<number, number> = {};

    hours.forEach((h) => {
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });

    const bestHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => parseInt(entry[0]));

    // Calculate consistency
    const last7Days = tasks.filter((t) => {
      const date = new Date(t.deadline);
      const now = new Date();
      const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    const consistencyScore = Math.min(100, (last7Days / 7) * 20);

    // Detect procrastination spikes
    const lastTaskDates = tasks
      .filter((t) => t.status === "completed")
      .map((t) => new Date(t.deadline).getTime())
      .sort((a, b) => b - a);

    const avgGap =
      lastTaskDates.length > 1
        ? (lastTaskDates[0] - lastTaskDates[lastTaskDates.length - 1]) / lastTaskDates.length
        : 0;

    const procrastinationSpikes: string[] = [];
    for (let i = 0; i < lastTaskDates.length - 1; i++) {
      const gap = lastTaskDates[i] - lastTaskDates[i + 1];
      if (gap > avgGap * 2) {
        procrastinationSpikes.push(new Date(lastTaskDates[i]).toLocaleDateString());
      }
    }

    // Calculate burnout risk
    const sessionsLastWeek = todaySessions.length;
    const burnoutRiskLevel = sessionsLastWeek > 35 ? "high" : sessionsLastWeek > 20 ? "medium" : "low";

    setPatterns({
      bestHours,
      procrastinationSpikes: procrastinationSpikes.slice(0, 3),
      consistencyScore,
      burnoutRiskLevel,
      recommendedBreakTime: burnoutRiskLevel === "high" ? 15 : burnoutRiskLevel === "medium" ? 10 : 5,
    });
  };

  return {
    weaknesses,
    patterns,
    analyzeWeaknesses,
    analyzePatterns,
  };
}
