import { Task, Exam, SleepLog } from "@shared/api";

/**
 * Calculate task completion rate (0-100)
 */
export function calculateCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 100;

  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Calculate deadline compression (how many tasks are urgent)
 * Lower score is better (0-100, where 0 = no urgency, 100 = critical)
 */
export function calculateDeadlineCompression(tasks: Task[]): number {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  if (pendingTasks.length === 0) return 0;

  const now = new Date();
  const urgentCount = pendingTasks.filter((t) => {
    const deadline = new Date(t.deadline);
    const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil < 48;
  }).length;

  const overdueCount = tasks.filter((t) => t.status === "overdue").length;

  // Calculate pressure score: more urgent tasks = higher pressure
  const pressureScore =
    (urgentCount * 30 + overdueCount * 70) / Math.max(pendingTasks.length, 1);
  return Math.min(100, pressureScore);
}

/**
 * Calculate sleep consistency (0-100)
 * Based on how many nights in last 7 days had >= 7 hours of sleep
 */
export function calculateSleepConsistency(sleepLogs: SleepLog[]): number {
  if (sleepLogs.length === 0) return 50; // Default if no data

  const lastWeek = sleepLogs.filter((log) => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  if (lastWeek.length === 0) return 50;

  const goodSleep = lastWeek.filter((log) => log.durationMinutes >= 420).length; // 7 hours = 420 minutes
  return Math.round((goodSleep / 7) * 100); // Divide by 7 for full week
}

/**
 * Calculate Survival Score (0-100)
 * Weighted calculation:
 * - Task completion: 40%
 * - Deadline compression (inverted): 35%
 * - Sleep consistency: 25%
 */
export function calculateSurvivalScore(
  completionRate: number,
  deadlineCompression: number,
  sleepConsistency: number
): number {
  const score =
    completionRate * 0.4 +
    (100 - deadlineCompression) * 0.35 +
    sleepConsistency * 0.25;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate days until nearest exam
 */
export function daysUntilExam(exams: Exam[]): number | null {
  if (exams.length === 0) return null;

  const now = new Date();
  const futureExams = exams.filter((e) => new Date(e.examDate) > now);

  if (futureExams.length === 0) return null;

  const nearest = futureExams.reduce((prev, current) => {
    const prevDate = new Date(prev.examDate);
    const currentDate = new Date(current.examDate);
    return currentDate < prevDate ? current : prev;
  });

  const examDate = new Date(nearest.examDate);
  const diffMs = examDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Get the nearest exam subject
 */
export function getNearestExamSubject(exams: Exam[]): string | null {
  if (exams.length === 0) return null;

  const now = new Date();
  const futureExams = exams.filter((e) => new Date(e.examDate) > now);

  if (futureExams.length === 0) return null;

  const nearest = futureExams.reduce((prev, current) => {
    const prevDate = new Date(prev.examDate);
    const currentDate = new Date(current.examDate);
    return currentDate < prevDate ? current : prev;
  });

  return nearest.subject;
}

/**
 * Calculate average sleep duration in minutes from last 7 days
 */
export function calculateAverageSleep(sleepLogs: SleepLog[]): number {
  const lastWeek = sleepLogs.filter((log) => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  if (lastWeek.length === 0) return 0;

  const totalMinutes = lastWeek.reduce((sum, log) => sum + log.durationMinutes, 0);
  return totalMinutes / lastWeek.length;
}

/**
 * Count days with less than 7 hours of sleep in last 7 days
 */
export function countDaysBelow7Hours(sleepLogs: SleepLog[]): number {
  const lastWeek = sleepLogs.filter((log) => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  return lastWeek.filter((log) => log.durationMinutes < 420).length; // 7 hours = 420 minutes
}

/**
 * Format minutes to HH:MM string
 */
export function minutesToHHMM(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Count overdue tasks
 */
export function countOverdueTasks(tasks: Task[]): number {
  return tasks.filter((t) => t.status === "overdue").length;
}

/**
 * Get tasks due today
 */
export function getTasksDueToday(tasks: Task[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tasks.filter((t) => {
    const deadline = new Date(t.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() === today.getTime() && t.status !== "completed";
  }).length;
}

/**
 * Calculate days until an exam
 */
export function daysUntilDate(date: Date): number {
  const now = new Date();
  const examDate = new Date(date);
  const diffMs = examDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Check if exam is passed
 */
export function isExamPassed(date: Date): boolean {
  const now = new Date();
  return new Date(date) < now;
}

/**
 * Get urgency level based on days until exam
 * Returns: "critical" (0-3 days), "urgent" (4-7 days), "normal" (8+)
 */
export function getExamUrgency(date: Date): "critical" | "urgent" | "normal" {
  const days = daysUntilDate(date);
  if (days <= 3) return "critical";
  if (days <= 7) return "urgent";
  return "normal";
}

/**
 * Calculate topic progress percentage for an exam
 */
export function calculateTopicProgress(topics: Array<{ completed: boolean }>): number {
  if (topics.length === 0) return 0;
  const completed = topics.filter((t) => t.completed).length;
  return Math.round((completed / topics.length) * 100);
}

/**
 * Get color for urgency level
 */
export function getUrgencyColor(
  urgency: "critical" | "urgent" | "normal"
): string {
  switch (urgency) {
    case "critical":
      return "text-status-overdue";
    case "urgent":
      return "text-status-due-soon";
    case "normal":
      return "text-foreground";
  }
}

/**
 * Get background color for urgency level
 */
export function getUrgencyBgColor(
  urgency: "critical" | "urgent" | "normal"
): string {
  switch (urgency) {
    case "critical":
      return "border-status-overdue/30 bg-status-overdue/5";
    case "urgent":
      return "border-status-due-soon/30 bg-status-due-soon/5";
    case "normal":
      return "border-border bg-card";
  }
}
