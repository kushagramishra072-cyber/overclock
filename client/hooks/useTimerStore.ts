import { useEffect, useState } from "react";

export interface TimerSession {
  id: string;
  subject: string;
  mode: "normal" | "deep-work" | "crisis";
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  pauseCount: number;
  pausedAt?: number; // timestamp
  completedAt?: number; // timestamp
  burnoutDetected: boolean;
}

export interface TimerStats {
  totalSessionsToday: number;
  totalFocusMinutes: number;
  averageSessionLength: number;
  pauseFrequency: number; // pauses per session
  peakFocusTime: string; // e.g., "6-8 PM"
  burnoutRisk: "low" | "medium" | "high";
}

const STORAGE_KEY = "student_survival_timer";

export const useTimerStore = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse timer sessions:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (
    subject: string,
    mode: "normal" | "deep-work" | "crisis",
    plannedDuration: number
  ) => {
    const newSession: TimerSession = {
      id: Date.now().toString(),
      subject,
      mode,
      plannedDuration,
      actualDuration: 0,
      pauseCount: 0,
      burnoutDetected: false,
    };
    setSessions([...sessions, newSession]);
    return newSession.id;
  };

  const updateSession = (
    sessionId: string,
    updates: Partial<TimerSession>
  ) => {
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const completeSession = (sessionId: string, actualDuration: number) => {
    updateSession(sessionId, {
      actualDuration,
      completedAt: Date.now(),
    });
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter((s) => {
      const sessionDate = s.completedAt
        ? new Date(s.completedAt).toDateString()
        : today;
      return sessionDate === today;
    });
  };

  const getStats = (): TimerStats => {
    const todaySessions = getTodaySessions();
    const totalSessions = todaySessions.length;
    const totalMinutes = todaySessions.reduce(
      (sum, s) => sum + s.actualDuration,
      0
    );
    const avgLength =
      totalSessions > 0 ? totalMinutes / totalSessions : 0;
    const totalPauses = todaySessions.reduce((sum, s) => sum + s.pauseCount, 0);
    const pauseFreq =
      totalSessions > 0 ? totalPauses / totalSessions : 0;

    // Detect peak focus time based on completed sessions
    const peakTimes: Record<string, number> = {};
    todaySessions.forEach((s) => {
      if (s.completedAt) {
        const hour = new Date(s.completedAt).getHours();
        const timeSlot = `${hour}-${hour + 1}`;
        peakTimes[timeSlot] = (peakTimes[timeSlot] || 0) + s.actualDuration;
      }
    });

    const peakFocusTime =
      Object.keys(peakTimes).length > 0
        ? Object.entries(peakTimes).sort((a, b) => b[1] - a[1])[0][0]
        : "Not tracked";

    // Calculate burnout risk
    const burnoutCount = todaySessions.filter((s) => s.burnoutDetected).length;
    let burnoutRisk: "low" | "medium" | "high" = "low";
    if (burnoutCount > 0 && totalSessions > 0) {
      const burnoutPercent = (burnoutCount / totalSessions) * 100;
      if (burnoutPercent > 50) burnoutRisk = "high";
      else if (burnoutPercent > 25) burnoutRisk = "medium";
    }

    return {
      totalSessionsToday: totalSessions,
      totalFocusMinutes: totalMinutes,
      averageSessionLength: avgLength,
      pauseFrequency: pauseFreq,
      peakFocusTime,
      burnoutRisk,
    };
  };

  const detectBurnout = (sessionId: string): boolean => {
    // Burnout triggers:
    // - More than 3 pauses in a session
    // - Session ends before 80% of planned time
    // - Multiple short sessions (< 20 min)
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;

    const pauseThreshold = session.pauseCount > 3;
    const incompletionThreshold = session.actualDuration < session.plannedDuration * 0.8;
    
    const recentSessions = getTodaySessions().slice(-3);
    const shortSessionThreshold =
      recentSessions.filter((s) => s.actualDuration < 20).length >= 2;

    const isBurnedOut =
      pauseThreshold || incompletionThreshold || shortSessionThreshold;

    if (isBurnedOut) {
      updateSession(sessionId, { burnoutDetected: true });
    }

    return isBurnedOut;
  };

  return {
    sessions,
    addSession,
    updateSession,
    completeSession,
    getTodaySessions,
    getStats,
    detectBurnout,
  };
};
