import { useState, useEffect } from "react";
import { ScheduleClass, DayOfWeek } from "@shared/api";

const SCHEDULE_STORAGE_KEY = "student_survival_schedule";

export function useScheduleStore() {
  const [classes, setClasses] = useState<ScheduleClass[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClasses(parsed);
      } catch {
        setClasses([]);
      }
    }
  }, []);

  // Save to localStorage whenever classes change
  useEffect(() => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(classes));
  }, [classes]);

  const addClass = (
    subject: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    room?: string
  ) => {
    const newClass: ScheduleClass = {
      id: Date.now().toString(),
      subject,
      day,
      startTime,
      endTime,
      room,
      createdAt: new Date(),
    };
    setClasses([...classes, newClass]);
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter((c) => c.id !== id));
  };

  const updateClass = (
    id: string,
    subject: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    room?: string
  ) => {
    setClasses(
      classes.map((c) =>
        c.id === id
          ? { ...c, subject, day, startTime, endTime, room: room || c.room }
          : c
      )
    );
  };

  return {
    classes,
    addClass,
    deleteClass,
    updateClass,
  };
}
