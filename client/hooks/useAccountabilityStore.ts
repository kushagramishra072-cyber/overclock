import { useEffect, useState } from "react";

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  plannedHours: number;
  plannedTasks: number;
  actualHours: number;
  actualTasks: number;
  performanceScore: number; // 0-100
  callout: string;
  status: "success" | "warning" | "critical";
}

export interface PerformanceMetrics {
  overallScore: number; // 0-100: brutally honest
  consistencyScore: number;
  hoursScore: number;
  completionScore: number;
  weeklyTrend: "improving" | "stable" | "declining";
  lastCallout: string;
  performanceLevel: "excellent" | "good" | "mediocre" | "poor" | "failing";
}

const STORAGE_KEY = "student_survival_accountability";

export const useAccountabilityStore = () => {
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDailyPlans(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse accountability data:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyPlans));
  }, [dailyPlans]);

  const planDay = (plannedHours: number, plannedTasks: number) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = dailyPlans.find((p) => p.date === today);

    if (existing) {
      setDailyPlans(
        dailyPlans.map((p) =>
          p.date === today
            ? {
                ...p,
                plannedHours,
                plannedTasks,
              }
            : p
        )
      );
    } else {
      setDailyPlans([
        ...dailyPlans,
        {
          date: today,
          plannedHours,
          plannedTasks,
          actualHours: 0,
          actualTasks: 0,
          performanceScore: 0,
          callout: "",
          status: "warning",
        },
      ]);
    }
  };

  const recordActual = (actualHours: number, actualTasks: number) => {
    const today = new Date().toISOString().split("T")[0];

    setDailyPlans(
      dailyPlans.map((p) => {
        if (p.date === today) {
          const performanceScore = calculatePerformanceScore(
            p.plannedHours,
            actualHours,
            p.plannedTasks,
            actualTasks
          );
          const callout = generateCallout(
            p.plannedHours,
            actualHours,
            p.plannedTasks,
            actualTasks,
            performanceScore
          );
          const status = getStatus(performanceScore);

          return {
            ...p,
            actualHours,
            actualTasks,
            performanceScore,
            callout,
            status,
          };
        }
        return p;
      })
    );
  };

  const calculatePerformanceScore = (
    plannedHours: number,
    actualHours: number,
    plannedTasks: number,
    actualTasks: number
  ): number => {
    let score = 100;

    // Hours score (60 points max)
    const hourRatio = actualHours / Math.max(plannedHours, 0.1);
    if (hourRatio < 0.5) score -= 60;
    else if (hourRatio < 0.8) score -= 30;
    else if (hourRatio > 1.2) score -= 10; // Over-planning
    else score -= 0;

    // Tasks score (40 points max)
    const taskRatio = actualTasks / Math.max(plannedTasks, 1);
    if (taskRatio < 0.5) score -= 40;
    else if (taskRatio < 0.8) score -= 20;
    else if (taskRatio > 1.1) score -= 5;
    else score -= 0;

    return Math.max(0, Math.min(100, score));
  };

  const generateCallout = (
    plannedHours: number,
    actualHours: number,
    plannedTasks: number,
    actualTasks: number,
    score: number
  ): string => {
    // Honest, no-BS callouts
    const hourGap = plannedHours - actualHours;
    const taskGap = plannedTasks - actualTasks;

    if (score >= 90) {
      return `✅ Crushed it! Planned ${plannedHours}h, did ${actualHours}h. Solid execution.`;
    }

    if (score >= 75) {
      return `👍 Good work. Planned ${plannedHours}h, did ${actualHours}h. Keep it up.`;
    }

    if (score >= 50) {
      if (hourGap > 1) {
        return `⚠️ You planned ${plannedHours}h but only did ${actualHours}h. That's ${Math.round((hourGap / plannedHours) * 100)}% short. Scale back your plans or focus better tomorrow.`;
      }
      if (taskGap > 0) {
        return `⚠️ Missed ${taskGap} task${taskGap > 1 ? "s" : ""}. You completed ${actualTasks}/${plannedTasks}. Stop overcommitting.`;
      }
      return `⚠️ Underperformed. You planned better than you executed. Debug what happened.`;
    }

    if (score >= 25) {
      return `🚨 Big gap: Planned ${plannedHours}h, did ${actualHours}h. Only ${actualTasks}/${plannedTasks} tasks done. Something's blocking you. Time to troubleshoot.`;
    }

    return `💀 You ghosted your plan. Planned ${plannedHours}h + ${plannedTasks} tasks, did ${actualHours}h + ${actualTasks} tasks. Figure out why before tomorrow.`;
  };

  const getStatus = (score: number): "success" | "warning" | "critical" => {
    if (score >= 75) return "success";
    if (score >= 50) return "warning";
    return "critical";
  };

  const getLast7Days = (): DailyPlan[] => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = dailyPlans.find((p) => p.date === dateStr);
      if (found) {
        last7.push(found);
      }
    }
    return last7;
  };

  const calculateMetrics = (): PerformanceMetrics => {
    const last7 = getLast7Days();

    if (last7.length === 0) {
      return {
        overallScore: 0,
        consistencyScore: 0,
        hoursScore: 0,
        completionScore: 0,
        weeklyTrend: "stable",
        lastCallout: "Start planning and tracking your days",
        performanceLevel: "failing",
      };
    }

    // Overall score (average of last 7 days)
    const overallScore = Math.round(
      last7.reduce((sum, p) => sum + p.performanceScore, 0) / last7.length
    );

    // Consistency score (how many days you planned and tracked)
    const trackedDays = last7.filter(
      (p) => p.plannedHours > 0 && p.actualHours > 0
    ).length;
    const consistencyScore = Math.round((trackedDays / last7.length) * 100);

    // Hours score (total planned vs actual)
    const totalPlanned = last7.reduce((sum, p) => sum + p.plannedHours, 0);
    const totalActual = last7.reduce((sum, p) => sum + p.actualHours, 0);
    const hoursScore =
      totalPlanned > 0
        ? Math.min(100, Math.round((totalActual / totalPlanned) * 100))
        : 0;

    // Completion score (tasks)
    const totalPlannedTasks = last7.reduce((sum, p) => sum + p.plannedTasks, 0);
    const totalCompletedTasks = last7.reduce(
      (sum, p) => sum + p.actualTasks,
      0
    );
    const completionScore =
      totalPlannedTasks > 0
        ? Math.min(100, Math.round((totalCompletedTasks / totalPlannedTasks) * 100))
        : 0;

    // Trend detection
    const first3Avg =
      last7
        .slice(0, 3)
        .reduce((sum, p) => sum + p.performanceScore, 0) / 3;
    const last3Avg =
      last7
        .slice(-3)
        .reduce((sum, p) => sum + p.performanceScore, 0) / 3;
    const weeklyTrend: "improving" | "stable" | "declining" =
      last3Avg > first3Avg + 5
        ? "improving"
        : last3Avg < first3Avg - 5
          ? "declining"
          : "stable";

    // Performance level
    let performanceLevel: "excellent" | "good" | "mediocre" | "poor" | "failing";
    if (overallScore >= 85) performanceLevel = "excellent";
    else if (overallScore >= 70) performanceLevel = "good";
    else if (overallScore >= 50) performanceLevel = "mediocre";
    else if (overallScore >= 25) performanceLevel = "poor";
    else performanceLevel = "failing";

    // Last callout
    const lastTracked = last7[last7.length - 1];
    const lastCallout =
      lastTracked?.callout || "Start tracking your performance";

    return {
      overallScore,
      consistencyScore,
      hoursScore,
      completionScore,
      weeklyTrend,
      lastCallout,
      performanceLevel,
    };
  };

  return {
    dailyPlans,
    planDay,
    recordActual,
    getLast7Days,
    calculateMetrics,
  };
};
