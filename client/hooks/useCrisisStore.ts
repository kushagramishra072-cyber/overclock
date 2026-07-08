import { useEffect, useState } from "react";

export interface CrisisPlan {
  id: string;
  examDate: string;
  subject: string;
  priorityChapters: string[];
  essentialTopics: string[];
  estimatedHours: number;
  startDate: string;
  status: "active" | "completed" | "paused";
  dailySchedule: {
    date: string;
    hoursRequired: number;
    topicsToStudy: string[];
    completed: boolean;
  }[];
}

export interface CrisisMetrics {
  isActivated: boolean;
  activePlan: CrisisPlan | null;
  studyHoursToday: number;
  completedToday: number;
  sessionStreak: number;
  sleepWarning: boolean;
  focusMode: boolean;
}

const STORAGE_KEY = "student_survival_crisis";

export const useCrisisStore = () => {
  const [plans, setPlans] = useState<CrisisPlan[]>([]);
  const [focusMode, setFocusMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPlans(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse crisis plans:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  const createEmergencyPlan = (
    examDate: string,
    subject: string,
    totalHours: number,
    chapters: string[]
  ): CrisisPlan => {
    // Calculate daily requirement
    const today = new Date();
    const exam = new Date(examDate);
    const daysAvailable = Math.ceil(
      (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const hoursPerDay = Math.ceil(totalHours / Math.max(daysAvailable, 1));

    // Prioritize chapters (assume first 60% are most critical)
    const criticalCount = Math.ceil(chapters.length * 0.6);
    const priorityChapters = chapters.slice(0, criticalCount);
    const essentialTopics = chapters.slice(0, Math.ceil(chapters.length * 0.3));

    // Generate daily schedule
    const dailySchedule = [];
    let remainingHours = totalHours;

    for (let i = 0; i < daysAvailable && remainingHours > 0; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const hoursForDay = Math.min(hoursPerDay, remainingHours);
      dailySchedule.push({
        date: dateStr,
        hoursRequired: hoursForDay,
        topicsToStudy: essentialTopics.slice(
          0,
          Math.ceil(essentialTopics.length / daysAvailable)
        ),
        completed: false,
      });
      remainingHours -= hoursForDay;
    }

    const plan: CrisisPlan = {
      id: Date.now().toString(),
      examDate,
      subject,
      priorityChapters,
      essentialTopics,
      estimatedHours: totalHours,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
      dailySchedule,
    };

    setPlans([...plans, plan]);
    return plan;
  };

  const completeDailyGoal = (planId: string, date: string) => {
    setPlans(
      plans.map((plan) => {
        if (plan.id === planId) {
          const updated = {
            ...plan,
            dailySchedule: plan.dailySchedule.map((day) =>
              day.date === date ? { ...day, completed: true } : day
            ),
          };

          // Auto-complete plan if all days done
          const allComplete = updated.dailySchedule.every((d) => d.completed);
          if (allComplete) {
            updated.status = "completed";
          }

          return updated;
        }
        return plan;
      })
    );
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const getActivePlan = (): CrisisPlan | null => {
    return plans.find((p) => p.status === "active") || null;
  };

  const getMetrics = (): CrisisMetrics => {
    const activePlan = getActivePlan();
    const today = new Date().toISOString().split("T")[0];

    let studyHoursToday = 0;
    let completedToday = false;

    if (activePlan) {
      const todaySchedule = activePlan.dailySchedule.find(
        (d) => d.date === today
      );
      if (todaySchedule) {
        studyHoursToday = todaySchedule.hoursRequired;
        completedToday = todaySchedule.completed;
      }
    }

    // Calculate session streak (consecutive days with completion)
    let sessionStreak = 0;
    if (activePlan) {
      const sortedDays = [...activePlan.dailySchedule].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (const day of sortedDays) {
        if (day.completed) {
          sessionStreak++;
        } else {
          break;
        }
      }
    }

    return {
      isActivated: !!activePlan,
      activePlan,
      studyHoursToday,
      completedToday: completedToday ? studyHoursToday : 0,
      sessionStreak,
      sleepWarning: studyHoursToday > 6, // Alert if studying > 6 hours
      focusMode,
    };
  };

  const pausePlan = (planId: string) => {
    setPlans(
      plans.map((p) =>
        p.id === planId ? { ...p, status: "paused" } : p
      )
    );
  };

  const resumePlan = (planId: string) => {
    setPlans(
      plans.map((p) =>
        p.id === planId ? { ...p, status: "active" } : p
      )
    );
  };

  return {
    plans,
    focusMode,
    createEmergencyPlan,
    completeDailyGoal,
    toggleFocusMode,
    getActivePlan,
    getMetrics,
    pausePlan,
    resumePlan,
  };
};
