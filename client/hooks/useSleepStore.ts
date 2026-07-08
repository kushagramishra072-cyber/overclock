import { useState, useEffect } from "react";
import { SleepLog } from "@shared/api";

const SLEEP_STORAGE_KEY = "student_survival_sleep";

export function useSleepStore() {
  const [logs, setLogs] = useState<SleepLog[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SLEEP_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLogs(
          parsed.map((log: any) => ({
            ...log,
            date: new Date(log.date),
            createdAt: new Date(log.createdAt),
          }))
        );
      } catch {
        setLogs([]);
      }
    }
  }, []);

  // Save to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addSleepLog = (
    date: Date,
    bedtime: string,
    wakeTime: string
  ) => {
    // Calculate duration in minutes
    const [bedHour, bedMin] = bedtime.split(":").map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

    let durationMinutes =
      (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);

    // If wake time is next day (e.g., bed at 23:00, wake at 07:00)
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    // Check if log for this date already exists
    const existingIndex = logs.findIndex(
      (log) =>
        log.date.toDateString() === date.toDateString()
    );

    const newLog: SleepLog = {
      id: Date.now().toString(),
      date,
      bedtime,
      wakeTime,
      durationMinutes,
      createdAt: new Date(),
    };

    if (existingIndex >= 0) {
      // Update existing log
      const updated = [...logs];
      updated[existingIndex] = newLog;
      setLogs(updated);
    } else {
      // Add new log
      setLogs([...logs, newLog]);
    }
  };

  const deleteSleepLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const getSleepLogsForLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= sevenDaysAgo && logDate <= today;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAverageSleep = () => {
    const last7 = getSleepLogsForLast7Days();
    if (last7.length === 0) return 0;
    const total = last7.reduce((sum, log) => sum + log.durationMinutes, 0);
    return Math.round(total / last7.length);
  };

  const getDaysBelow7Hours = () => {
    const last7 = getSleepLogsForLast7Days();
    return last7.filter((log) => log.durationMinutes < 7 * 60).length;
  };

  return {
    logs,
    addSleepLog,
    deleteSleepLog,
    getSleepLogsForLast7Days,
    getAverageSleep,
    getDaysBelow7Hours,
  };
}
