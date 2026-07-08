import { useEffect, useState } from "react";

export interface SubjectWeakness {
  subject: string;
  avoidanceDays: number; // consecutive days not studied
  earlyQuitCount: number; // sessions quit early
  averageSessionLength: number;
  lastStudiedDate: string;
  testScore?: number; // manual input
  priority: "low" | "medium" | "high";
}

const STORAGE_KEY = "student_survival_weakness";

export const useWeaknessStore = () => {
  const [weaknesses, setWeaknesses] = useState<SubjectWeakness[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWeaknesses(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse weaknesses:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weaknesses));
  }, [weaknesses]);

  const trackSubject = (
    subject: string,
    sessionLength: number,
    quitEarly: boolean = false
  ) => {
    const existing = weaknesses.find((w) => w.subject === subject);
    const today = new Date().toISOString().split("T")[0];

    if (existing) {
      const updated = {
        ...existing,
        lastStudiedDate: today,
        averageSessionLength:
          (existing.averageSessionLength + sessionLength) / 2,
        earlyQuitCount: existing.earlyQuitCount + (quitEarly ? 1 : 0),
        avoidanceDays: 0, // Reset on study
      };

      // Auto-adjust priority based on performance
      updated.priority = calculatePriority(updated);

      setWeaknesses(
        weaknesses.map((w) => (w.subject === subject ? updated : w))
      );
    } else {
      const newWeakness: SubjectWeakness = {
        subject,
        avoidanceDays: 0,
        earlyQuitCount: quitEarly ? 1 : 0,
        averageSessionLength: sessionLength,
        lastStudiedDate: today,
        priority: "low",
      };
      setWeaknesses([...weaknesses, newWeakness]);
    }
  };

  const markAvoidance = (subject: string) => {
    const existing = weaknesses.find((w) => w.subject === subject);
    if (existing) {
      const updated = {
        ...existing,
        avoidanceDays: existing.avoidanceDays + 1,
      };
      updated.priority = calculatePriority(updated);

      setWeaknesses(
        weaknesses.map((w) => (w.subject === subject ? updated : w))
      );
    }
  };

  const recordTestScore = (subject: string, score: number) => {
    const existing = weaknesses.find((w) => w.subject === subject);
    if (existing) {
      const updated = {
        ...existing,
        testScore: score,
      };
      updated.priority = calculatePriority(updated);

      setWeaknesses(
        weaknesses.map((w) => (w.subject === subject ? updated : w))
      );
    }
  };

  const getWeakSubjects = (): SubjectWeakness[] => {
    return weaknesses
      .filter((w) => w.priority === "high" || w.priority === "medium")
      .sort((a, b) => {
        // High priority first, then by avoidance days
        if (a.priority !== b.priority) {
          return a.priority === "high" ? -1 : 1;
        }
        return b.avoidanceDays - a.avoidanceDays;
      });
  };

  const calculatePriority = (weakness: SubjectWeakness): "low" | "medium" | "high" => {
    let score = 0;

    // Avoidance scoring (max 40)
    score += Math.min(weakness.avoidanceDays * 5, 40);

    // Early quit scoring (max 30)
    score += Math.min(weakness.earlyQuitCount * 5, 30);

    // Low session length scoring (max 20)
    if (weakness.averageSessionLength < 30) {
      score += 20;
    } else if (weakness.averageSessionLength < 45) {
      score += 10;
    }

    // Test score scoring (max 20)
    if (weakness.testScore !== undefined) {
      if (weakness.testScore < 50) score += 20;
      else if (weakness.testScore < 70) score += 10;
    }

    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  };

  return {
    weaknesses,
    trackSubject,
    markAvoidance,
    recordTestScore,
    getWeakSubjects,
  };
};
