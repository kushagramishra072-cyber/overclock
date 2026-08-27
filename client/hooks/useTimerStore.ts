import { useEffect, useState, useCallback } from "react";

export interface TimerSession {
  id: string;
  subject: string;
  mode: "normal" | "deep-work" | "crisis" | "break";
  timerType: "focus" | "break";
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  pauseCount: number;
  qualityRating?: number; // 1-5 rating of user's focus quality
  goalCompleted?: "yes" | "partial" | "no";
  notes?: string;
  startedAt: number; // timestamp
  completedAt?: number; // timestamp
  burnoutDetected: boolean;
}

export interface ActiveTimerState {
  sessionId: string;
  subject: string;
  mode: "normal" | "deep-work" | "crisis" | "break";
  timerType: "focus" | "break";
  plannedDuration: number; // minutes
  targetEndTime: number; // Unix timestamp in ms when running
  remainingSecondsWhenPaused: number; // seconds left if paused
  isPaused: boolean;
  isRunning: boolean;
  startedAt: number; // Unix timestamp in ms
  pauseCount: number;
}

export interface TimerStats {
  totalSessionsToday: number;
  totalFocusMinutes: number;
  totalBreakMinutes: number;
  averageSessionLength: number;
  pauseFrequency: number;
  peakFocusTime: string;
  burnoutRisk: "low" | "medium" | "high";
  focusStamina: number; // 0-100% capacity
  staminaExplanation: string;
}

const STORAGE_KEY = "student_survival_timer_v2";
const ACTIVE_TIMER_KEY = "student_survival_active_timer_v2";

// Web Audio API Focus Sounds Synthesizer (Ambient Background Generators)
class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private currentGain: GainNode | null = null;
  private activeSoundType: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playChime() {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const playNote = (freq: number, start: number, duration: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(523.25, now, 0.4); // C5
      playNote(659.25, now + 0.15, 0.4); // E5
      playNote(783.99, now + 0.30, 0.6); // G5
      playNote(1046.50, now + 0.45, 0.8); // C6
    } catch (e) {
      console.warn("Chime error:", e);
    }
  }

  public startSound(type: "brown" | "white" | "binaural") {
    this.stopSound();
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.activeSoundType = type;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      if (type === "brown") {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain boost
        }
      } else if (type === "white") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === "binaural") {
        // Deep focus sine wave generator with gentle modulation
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, this.ctx.currentTime); // 220Hz Alpha tone
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        this.currentSource = osc;
        this.currentGain = gain;
        return;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);

      whiteNoise.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();

      this.currentSource = whiteNoise;
      this.currentGain = gain;
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }
  }

  public stopSound() {
    if (this.currentSource) {
      try {
        if ("stop" in this.currentSource) {
          (this.currentSource as AudioBufferSourceNode).stop();
        }
        this.currentSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.currentSource = null;
    }
    this.activeSoundType = null;
  }

  public getActiveSound() {
    return this.activeSoundType;
  }
}

export const audioSynth = new AudioSynthManager();

export const useTimerStore = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse timer sessions:", e);
      }
    }

    const storedActive = localStorage.getItem(ACTIVE_TIMER_KEY);
    if (storedActive) {
      try {
        setActiveTimer(JSON.parse(storedActive));
      } catch (e) {
        console.error("Failed to parse active timer:", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Save active timer to localStorage
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem(ACTIVE_TIMER_KEY);
    }
  }, [activeTimer]);

  // Request browser Notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Start active timer (Focus or Break)
  const startActiveTimer = (
    subject: string,
    mode: "normal" | "deep-work" | "crisis" | "break",
    durationMinutes: number,
    timerType: "focus" | "break" = "focus"
  ) => {
    const sessionId = Date.now().toString();
    const now = Date.now();
    const targetEndTime = now + durationMinutes * 60 * 1000;

    const newActiveTimer: ActiveTimerState = {
      sessionId,
      subject,
      mode,
      timerType,
      plannedDuration: durationMinutes,
      targetEndTime,
      remainingSecondsWhenPaused: durationMinutes * 60,
      isPaused: false,
      isRunning: true,
      startedAt: now,
      pauseCount: 0,
    };

    const newSession: TimerSession = {
      id: sessionId,
      subject,
      mode,
      timerType,
      plannedDuration: durationMinutes,
      actualDuration: 0,
      pauseCount: 0,
      startedAt: now,
      burnoutDetected: false,
    };

    setSessions((prev) => [...prev, newSession]);
    setActiveTimer(newActiveTimer);
    return sessionId;
  };

  const pauseActiveTimer = () => {
    if (!activeTimer || !activeTimer.isRunning || activeTimer.isPaused) return;

    const remainingSecs = Math.max(
      0,
      Math.round((activeTimer.targetEndTime - Date.now()) / 1000)
    );

    const updated: ActiveTimerState = {
      ...activeTimer,
      isPaused: true,
      remainingSecondsWhenPaused: remainingSecs,
      pauseCount: activeTimer.pauseCount + 1,
    };

    setActiveTimer(updated);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeTimer.sessionId
          ? { ...s, pauseCount: s.pauseCount + 1 }
          : s
      )
    );
  };

  const resumeActiveTimer = () => {
    if (!activeTimer || !activeTimer.isPaused) return;

    const now = Date.now();
    const targetEndTime = now + activeTimer.remainingSecondsWhenPaused * 1000;

    setActiveTimer({
      ...activeTimer,
      isPaused: false,
      targetEndTime,
    });
  };

  const addExtraMinutes = (minutes: number) => {
    if (!activeTimer) return;

    if (activeTimer.isPaused) {
      setActiveTimer({
        ...activeTimer,
        plannedDuration: activeTimer.plannedDuration + minutes,
        remainingSecondsWhenPaused:
          activeTimer.remainingSecondsWhenPaused + minutes * 60,
      });
    } else {
      setActiveTimer({
        ...activeTimer,
        plannedDuration: activeTimer.plannedDuration + minutes,
        targetEndTime: activeTimer.targetEndTime + minutes * 60 * 1000,
      });
    }
  };

  const stopActiveTimer = (
    completed = false,
    reflection?: {
      qualityRating?: number;
      goalCompleted?: "yes" | "partial" | "no";
      notes?: string;
    }
  ) => {
    if (!activeTimer) return;

    audioSynth.stopSound();

    const now = Date.now();
    let actualMinutes = activeTimer.plannedDuration;

    if (!completed) {
      const remainingSecs = activeTimer.isPaused
        ? activeTimer.remainingSecondsWhenPaused
        : Math.max(0, Math.round((activeTimer.targetEndTime - now) / 1000));
      const elapsedSecs = activeTimer.plannedDuration * 60 - remainingSecs;
      actualMinutes = Math.max(1, Math.round(elapsedSecs / 60));
    }

    const pauseThreshold = activeTimer.pauseCount > 3;
    const incompletionThreshold = actualMinutes < activeTimer.plannedDuration * 0.8;
    const isBurnedOut =
      activeTimer.timerType === "focus" && (pauseThreshold || incompletionThreshold);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeTimer.sessionId
          ? {
              ...s,
              actualDuration: actualMinutes,
              completedAt: now,
              qualityRating: reflection?.qualityRating,
              goalCompleted: reflection?.goalCompleted,
              notes: reflection?.notes,
              burnoutDetected: isBurnedOut,
            }
          : s
      )
    );

    setActiveTimer(null);
  };

  const getTodaySessions = useCallback(() => {
    const today = new Date().toDateString();
    return sessions.filter((s) => {
      const sessionDate = s.completedAt
        ? new Date(s.completedAt).toDateString()
        : new Date(s.startedAt).toDateString();
      return sessionDate === today;
    });
  }, [sessions]);

  // Compute Focus Stamina (0 - 100%) and detailed explanation
  const getFocusStaminaInfo = useCallback(() => {
    const todaySessions = getTodaySessions();
    const focusSessions = todaySessions.filter((s) => s.timerType === "focus");
    const breakSessions = todaySessions.filter((s) => s.timerType === "break");

    const totalFocusMins = focusSessions.reduce(
      (sum, s) => sum + (s.actualDuration || s.plannedDuration),
      0
    );
    const totalBreakMins = breakSessions.reduce(
      (sum, s) => sum + (s.actualDuration || s.plannedDuration),
      0
    );
    const totalPauses = focusSessions.reduce((sum, s) => sum + s.pauseCount, 0);

    // Calculation: Base 100%, -15% per 45 mins focus, -5% per pause, +15% per 10 mins break
    let stamina = 100;
    stamina -= (totalFocusMins / 45) * 15;
    stamina -= totalPauses * 5;
    stamina += (totalBreakMins / 10) * 15;

    stamina = Math.round(Math.max(0, Math.min(100, stamina)));

    let explanation = "Optimal focus capacity. Your mind is sharp and rested!";
    if (stamina < 30) {
      explanation = `Low Stamina (${stamina}%): You've studied ${Math.floor(totalFocusMins / 60)}h ${totalFocusMins % 60}m today with ${totalPauses} pauses. High fatigue risk!`;
    } else if (stamina < 60) {
      explanation = `Moderate Fatigue (${stamina}%): ${totalFocusMins}m of study accumulated. Consider a short break soon.`;
    } else if (totalFocusMins > 0) {
      explanation = `Good Momentum (${stamina}%): ${totalFocusMins}m focused today. Great rhythm!`;
    }

    return { stamina, explanation, totalFocusMins, totalBreakMins, totalPauses };
  }, [getTodaySessions]);

  // Smart Break Duration Calculator
  const calculateSmartBreak = useCallback(
    (lastFocusDurationMinutes: number) => {
      const { stamina, totalFocusMins } = getFocusStaminaInfo();

      let breakMins = 5;
      if (lastFocusDurationMinutes >= 80) breakMins = 20;
      else if (lastFocusDurationMinutes >= 45) breakMins = 10;
      else if (lastFocusDurationMinutes >= 25) breakMins = 5;

      // Extend break if user stamina is low or heavy study day
      if (stamina < 40 || totalFocusMins > 180) {
        breakMins += 5;
      }

      return breakMins;
    },
    [getFocusStaminaInfo]
  );

  // Adaptive Recommendation Engine for Focus Sessions
  const getOptimalDuration = useCallback(
    (subjectName?: string) => {
      const { stamina } = getFocusStaminaInfo();

      const focusCompleted = sessions.filter(
        (s) => s.completedAt && s.timerType === "focus"
      );

      const filtered = subjectName
        ? focusCompleted.filter(
            (s) =>
              s.subject.toLowerCase().trim() === subjectName.toLowerCase().trim()
          )
        : focusCompleted;

      // If stamina is low, recommend shorter sprint regardless of history
      if (stamina < 35) {
        return {
          recommendedDuration: 15,
          recommendedBreak: 10,
          reason: `Stamina is low (${stamina}%). A short 15m focus session prevents fatigue and maintains consistency!`,
          confidence: "High (Fatigue Protection)",
          avgQuality: null,
        };
      }

      if (filtered.length === 0) {
        return {
          recommendedDuration: 25,
          recommendedBreak: 5,
          reason: "Standard 25m Pomodoro starting point. Will adapt as you rate sessions!",
          confidence: "Baseline Defaults",
          avgQuality: null,
        };
      }

      // Filter successful sessions (quality rating >= 4 or goalCompleted == 'yes')
      const topSessions = filtered.filter(
        (s) =>
          (s.qualityRating && s.qualityRating >= 4) ||
          s.goalCompleted === "yes" ||
          (!s.burnoutDetected && s.actualDuration >= s.plannedDuration * 0.85)
      );

      if (topSessions.length > 0) {
        const avgActual =
          topSessions.reduce((sum, s) => sum + s.actualDuration, 0) /
          topSessions.length;

        // Scale focus length gently (rounded to nearest 5)
        let rounded = Math.min(90, Math.max(15, Math.round(avgActual / 5) * 5));

        // If user consistently scores 5 stars, bump up focus time slightly by +5m
        const topFiveStar = topSessions.filter((s) => s.qualityRating === 5).length;
        if (topFiveStar >= 2 && rounded < 75) {
          rounded += 5;
        }

        const calculatedBreak = calculateSmartBreak(rounded);

        return {
          recommendedDuration: rounded,
          recommendedBreak: calculatedBreak,
          reason: subjectName
            ? `Based on ${topSessions.length} high-focus sessions in "${subjectName}", ${rounded}m focus + ${calculatedBreak}m break is your sweet spot.`
            : `Based on your top flow-state sessions, ${rounded}m focus maximizes your retention.`,
          confidence: topSessions.length > 3 ? "High (Personalized)" : "Medium",
          avgQuality: Math.round(
            (topSessions.reduce((sum, s) => sum + (s.qualityRating || 4), 0) /
              topSessions.length) *
              10
          ) / 10,
        };
      }

      // If user abandons or rates low, reduce focus time
      const avgAttempt =
        filtered.reduce((sum, s) => sum + s.actualDuration, 0) / filtered.length;
      const rounded = Math.min(30, Math.max(15, Math.round(avgAttempt / 5) * 5));
      const calculatedBreak = calculateSmartBreak(rounded);

      return {
        recommendedDuration: rounded,
        recommendedBreak: calculatedBreak,
        reason: `You tend to pause or finish around ~${Math.round(avgAttempt)}m. We recommend ${rounded}m focus sprints with a ${calculatedBreak}m break to rebuild momentum!`,
        confidence: "Medium",
        avgQuality: null,
      };
    },
    [sessions, getFocusStaminaInfo, calculateSmartBreak]
  );

  const getStats = useCallback((): TimerStats => {
    const todaySessions = getTodaySessions();
    const focusSessions = todaySessions.filter((s) => s.timerType === "focus");
    const breakSessions = todaySessions.filter((s) => s.timerType === "break");

    const totalSessions = focusSessions.filter((s) => s.completedAt).length;
    const totalFocusMinutes = focusSessions.reduce(
      (sum, s) => sum + s.actualDuration,
      0
    );
    const totalBreakMinutes = breakSessions.reduce(
      (sum, s) => sum + s.actualDuration,
      0
    );

    const avgLength = totalSessions > 0 ? totalFocusMinutes / totalSessions : 0;
    const totalPauses = focusSessions.reduce((sum, s) => sum + s.pauseCount, 0);
    const pauseFreq = totalSessions > 0 ? totalPauses / totalSessions : 0;

    const peakTimes: Record<string, number> = {};
    focusSessions.forEach((s) => {
      if (s.completedAt) {
        const hour = new Date(s.completedAt).getHours();
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const timeSlot = `${displayHour} ${ampm}`;
        peakTimes[timeSlot] = (peakTimes[timeSlot] || 0) + s.actualDuration;
      }
    });

    const peakFocusTime =
      Object.keys(peakTimes).length > 0
        ? Object.entries(peakTimes).sort((a, b) => b[1] - a[1])[0][0]
        : "Not tracked yet";

    const burnoutCount = focusSessions.filter((s) => s.burnoutDetected).length;
    let burnoutRisk: "low" | "medium" | "high" = "low";
    if (burnoutCount > 0 && totalSessions > 0) {
      const burnoutPercent = (burnoutCount / totalSessions) * 100;
      if (burnoutPercent > 50) burnoutRisk = "high";
      else if (burnoutPercent > 25) burnoutRisk = "medium";
    }

    const { stamina, explanation } = getFocusStaminaInfo();

    return {
      totalSessionsToday: totalSessions,
      totalFocusMinutes,
      totalBreakMinutes,
      averageSessionLength: Math.round(avgLength),
      pauseFrequency: Math.round(pauseFreq * 10) / 10,
      peakFocusTime,
      burnoutRisk,
      focusStamina: stamina,
      staminaExplanation: explanation,
    };
  }, [getTodaySessions, getFocusStaminaInfo]);

  return {
    sessions,
    activeTimer,
    startActiveTimer,
    pauseActiveTimer,
    resumeActiveTimer,
    addExtraMinutes,
    stopActiveTimer,
    getTodaySessions,
    getStats,
    getFocusStaminaInfo,
    calculateSmartBreak,
    getOptimalDuration,
  };
};
