import { useState, useEffect } from "react";

interface XPData {
  totalXP: number;
  level: number;
  xpThisLevel: number;
  xpNeeded: number;
  dailyXP: number;
  currentStreak: number;
  longestStreak: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const XP_PER_TASK = 10;
const XP_PER_HOUR_FOCUS = 25;
const XP_PER_EXAM = 100;
const XP_PER_STREAK_DAY = 5;
const XP_PER_LEVEL = 500;

const ACHIEVEMENTS: Achievement[] = [
  { id: "first-task", name: "Getting Started", description: "Complete your first task", icon: "🎯", rarity: "common" },
  { id: "focus-master", name: "Focus Warrior", description: "Complete 5 focus sessions", icon: "⚡", rarity: "rare" },
  { id: "week-streak", name: "Unstoppable", description: "Maintain a 7-day study streak", icon: "🔥", rarity: "epic" },
  { id: "exam-ready", name: "Exam Slayer", description: "Complete 3 exams", icon: "🎓", rarity: "rare" },
  { id: "night-owl", name: "Night Owl", description: "Study past midnight 10 times", icon: "🌙", rarity: "common" },
  { id: "perfect-day", name: "Perfect Day", description: "Complete all tasks in a single day", icon: "✨", rarity: "epic" },
  { id: "marathon", name: "Marathon Runner", description: "Complete 20 hours of focused study", icon: "🏃", rarity: "legendary" },
  { id: "crisis-survivor", name: "Crisis Master", description: "Complete a crisis mode plan", icon: "🚨", rarity: "legendary" },
];

export function useXPSystem() {
  const [xpData, setXPData] = useState<XPData>(() => {
    const stored = localStorage.getItem("student_survival_xp");
    if (stored) return JSON.parse(stored);
    return {
      totalXP: 0,
      level: 1,
      xpThisLevel: 0,
      xpNeeded: XP_PER_LEVEL,
      dailyXP: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const stored = localStorage.getItem("student_survival_achievements");
    if (stored) return JSON.parse(stored);
    return ACHIEVEMENTS;
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem("student_survival_xp", JSON.stringify(xpData));
  }, [xpData]);

  useEffect(() => {
    localStorage.setItem("student_survival_achievements", JSON.stringify(achievements));
  }, [achievements]);

  const addXP = (amount: number, reason: string) => {
    setXPData((prev) => {
      let newXP = prev.xpThisLevel + amount;
      let newLevel = prev.level;
      let newXPNeeded = prev.xpNeeded;

      // Level up logic
      while (newXP >= newXPNeeded) {
        newXP -= newXPNeeded;
        newLevel += 1;
        newXPNeeded = XP_PER_LEVEL * newLevel;
      }

      const today = new Date().toDateString();
      const lastXPDate = localStorage.getItem("student_survival_xp_date");
      const dailyXP = lastXPDate === today ? prev.dailyXP + amount : amount;

      if (lastXPDate !== today) {
        localStorage.setItem("student_survival_xp_date", today);
      }

      return {
        ...prev,
        totalXP: prev.totalXP + amount,
        level: newLevel,
        xpThisLevel: newXP,
        xpNeeded: newXPNeeded,
        dailyXP,
      };
    });
  };

  const addTaskXP = () => addXP(XP_PER_TASK, "task-completed");
  const addFocusXP = (hours: number) => addXP(Math.round(XP_PER_HOUR_FOCUS * hours), "focus-session");
  const addExamXP = () => addXP(XP_PER_EXAM, "exam-completed");

  const updateStreak = (completed: boolean) => {
    setXPData((prev) => {
      if (!completed) {
        return { ...prev, currentStreak: 0 };
      }

      const newStreak = prev.currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, prev.longestStreak);

      // Add streak XP
      addXP(XP_PER_STREAK_DAY, "streak-bonus");

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
      };
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((ach) =>
        ach.id === achievementId && !ach.unlockedAt
          ? { ...ach, unlockedAt: new Date().toISOString() }
          : ach
      )
    );
  };

  const getUnlockedAchievements = () => achievements.filter((a) => a.unlockedAt);
  const getProgress = () => (xpData.xpThisLevel / xpData.xpNeeded) * 100;

  return {
    xpData,
    achievements,
    addXP,
    addTaskXP,
    addFocusXP,
    addExamXP,
    updateStreak,
    unlockAchievement,
    getUnlockedAchievements,
    getProgress,
  };
}
