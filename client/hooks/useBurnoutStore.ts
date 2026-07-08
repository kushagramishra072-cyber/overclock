import { useEffect, useState } from "react";

export interface BurnoutDay {
  date: string; // YYYY-MM-DD
  stressLevel: number; // 0-100
  focusQuality: number; // 0-100 (declining with burnout)
  sleepHours: number;
  tasksCompleted: number;
  breaksTaken: number;
  moodScore: number; // 1-10
}

export interface BurnoutMetrics {
  currentLevel: number; // 0-100
  trend: "improving" | "stable" | "declining";
  riskLevel: "low" | "medium" | "high" | "critical";
  escalationRate: number; // points per day
  daysUntilCrisis: number; // estimated
  recommendations: string[];
}

const STORAGE_KEY = "student_survival_burnout";

export const useBurnoutStore = () => {
  const [burnoutDays, setBurnoutDays] = useState<BurnoutDay[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBurnoutDays(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse burnout data:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(burnoutDays));
  }, [burnoutDays]);

  const recordDay = (metrics: Omit<BurnoutDay, "date">) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = burnoutDays.find((d) => d.date === today);

    const newData = {
      ...metrics,
      date: today,
    };

    if (existing) {
      setBurnoutDays(
        burnoutDays.map((d) => (d.date === today ? newData : d))
      );
    } else {
      setBurnoutDays([...burnoutDays, newData]);
    }
  };

  const getLast7Days = (): BurnoutDay[] => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = burnoutDays.find((d) => d.date === dateStr);
      if (found) {
        last7.push(found);
      }
    }
    return last7;
  };

  const calculateMetrics = (): BurnoutMetrics => {
    const last7 = getLast7Days();
    if (last7.length === 0) {
      return {
        currentLevel: 0,
        trend: "stable",
        riskLevel: "low",
        escalationRate: 0,
        daysUntilCrisis: 999,
        recommendations: [
          "Start tracking your stress levels to get personalized insights",
        ],
      };
    }

    // Calculate current level (weighted average of recent days)
    const weights = [1, 1, 1, 1, 1, 2, 3]; // More recent days weighted higher
    let weightedSum = 0;
    let weightSum = 0;
    last7.forEach((day, idx) => {
      weightedSum += day.stressLevel * weights[idx];
      weightSum += weights[idx];
    });
    const currentLevel = Math.round(weightedSum / weightSum);

    // Calculate trend
    const first3Avg =
      last7.slice(0, 3).reduce((sum, d) => sum + d.stressLevel, 0) / 3;
    const last3Avg =
      last7.slice(-3).reduce((sum, d) => sum + d.stressLevel, 0) / 3;
    const escalationRate = last3Avg - first3Avg;

    let trend: "improving" | "stable" | "declining" = "stable";
    if (escalationRate > 5) trend = "declining";
    else if (escalationRate < -5) trend = "improving";

    // Calculate risk level
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (currentLevel >= 80) riskLevel = "critical";
    else if (currentLevel >= 60) riskLevel = "high";
    else if (currentLevel >= 40) riskLevel = "medium";

    // Estimate days until crisis (score 80+)
    const daysUntilCrisis =
      escalationRate > 0
        ? Math.ceil((80 - currentLevel) / escalationRate)
        : 999;

    // Generate recommendations
    const recommendations: string[] = [];

    if (riskLevel === "critical" || riskLevel === "high") {
      recommendations.push("⚠️ Activate Crisis Mode immediately");
    }

    if (last7[last7.length - 1]?.sleepHours < 7) {
      recommendations.push("Prioritize sleep - aim for 7-9 hours tonight");
    }

    if (last7[last7.length - 1]?.focusQuality < 50) {
      recommendations.push("Take a longer break - focus quality is declining");
    }

    if (
      last7[last7.length - 1]?.breaksTaken < 3 &&
      currentLevel > 50
    ) {
      recommendations.push("Take more frequent breaks (3+ per day)");
    }

    if (trend === "declining" && daysUntilCrisis < 7) {
      recommendations.push("Schedule deep rest day within 2-3 days");
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep up the current pace - you're managing well!");
    }

    return {
      currentLevel,
      trend,
      riskLevel,
      escalationRate: Math.round(escalationRate * 10) / 10,
      daysUntilCrisis: Math.max(daysUntilCrisis, 1),
      recommendations,
    };
  };

  return {
    burnoutDays,
    recordDay,
    getLast7Days,
    calculateMetrics,
  };
};
