import { useEffect, useState } from "react";

export interface FocusDay {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessionCount: number;
  subjectBreakdown: Record<string, number>; // subject -> minutes
  peakHour: number; // 0-23
  consistency: number; // 0-100
}

export interface FocusPattern {
  weeklyAverage: number;
  longestStreak: number; // consecutive days with focus
  weakestDay: string; // day of week
  strongestDay: string; // day of week
  subjectRanking: { subject: string; minutes: number }[];
}

const STORAGE_KEY = "student_survival_focus";

export const useFocusStore = () => {
  const [focusDays, setFocusDays] = useState<FocusDay[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFocusDays(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse focus days:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(focusDays));
  }, [focusDays]);

  const recordFocus = (
    subject: string,
    minutes: number,
    date: string = new Date().toISOString().split("T")[0]
  ) => {
    const existingDay = focusDays.find((d) => d.date === date);

    if (existingDay) {
      const updated = {
        ...existingDay,
        totalMinutes: existingDay.totalMinutes + minutes,
        sessionCount: existingDay.sessionCount + 1,
        subjectBreakdown: {
          ...existingDay.subjectBreakdown,
          [subject]:
            (existingDay.subjectBreakdown[subject] || 0) + minutes,
        },
      };
      setFocusDays(
        focusDays.map((d) => (d.date === date ? updated : d))
      );
    } else {
      const newDay: FocusDay = {
        date,
        totalMinutes: minutes,
        sessionCount: 1,
        subjectBreakdown: { [subject]: minutes },
        peakHour: new Date().getHours(),
        consistency: 100,
      };
      setFocusDays([...focusDays, newDay]);
    }
  };

  const getLast7Days = (): FocusDay[] => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = focusDays.find((d) => d.date === dateStr);
      if (found) {
        last7.push(found);
      } else {
        last7.push({
          date: dateStr,
          totalMinutes: 0,
          sessionCount: 0,
          subjectBreakdown: {},
          peakHour: 0,
          consistency: 0,
        });
      }
    }
    return last7;
  };

  const getPatterns = (): FocusPattern => {
    const last7 = getLast7Days();
    const weeklyTotal = last7.reduce((sum, d) => sum + d.totalMinutes, 0);
    const weeklyAverage = weeklyTotal / 7;

    // Calculate streak
    let longestStreak = 0;
    let currentStreak = 0;
    last7.forEach((day) => {
      if (day.totalMinutes > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // Day of week analysis
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayTotals: Record<string, number> = {};

    focusDays.forEach((day) => {
      const date = new Date(day.date);
      const dayName = dayNames[date.getDay()];
      dayTotals[dayName] = (dayTotals[dayName] || 0) + day.totalMinutes;
    });

    const sortedDays = Object.entries(dayTotals).sort((a, b) => a[1] - b[1]);
    const weakestDay = sortedDays[0]?.[0] || "Unknown";
    const strongestDay =
      sortedDays[sortedDays.length - 1]?.[0] || "Unknown";

    // Subject ranking
    const subjectTotals: Record<string, number> = {};
    focusDays.forEach((day) => {
      Object.entries(day.subjectBreakdown).forEach(([subject, minutes]) => {
        subjectTotals[subject] = (subjectTotals[subject] || 0) + minutes;
      });
    });

    const subjectRanking = Object.entries(subjectTotals)
      .map(([subject, minutes]) => ({ subject, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      weeklyAverage,
      longestStreak,
      weakestDay,
      strongestDay,
      subjectRanking,
    };
  };

  return {
    focusDays,
    recordFocus,
    getLast7Days,
    getPatterns,
  };
};
