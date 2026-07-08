/**
 * Shared code between client and server
 * Data models for Student Survival app
 */

/* Task & Assignment System */
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed" | "overdue";

export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: Date;
  deadlineTime?: string; // HH:MM format
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

/* Color palette for exam subjects */
export type ExamColor =
  | "blue"
  | "red"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "teal"
  | "yellow";

export const EXAM_COLORS: Record<
  ExamColor,
  {
    light: string;
    dark: string;
    border: string;
    label: string;
  }
> = {
  blue: {
    light: "#E3F2FD",
    dark: "#64B5F6",
    border: "#64B5F6",
    label: "Blue",
  },
  red: {
    light: "#FFEBEE",
    dark: "#EF9A9A",
    border: "#EF9A9A",
    label: "Red",
  },
  green: {
    light: "#E8F5E9",
    dark: "#81C784",
    border: "#81C784",
    label: "Green",
  },
  purple: {
    light: "#F3E5F5",
    dark: "#CE93D8",
    border: "#CE93D8",
    label: "Purple",
  },
  orange: {
    light: "#FFF3E0",
    dark: "#FFB74D",
    border: "#FFB74D",
    label: "Orange",
  },
  pink: {
    light: "#FCE4EC",
    dark: "#F48FB1",
    border: "#F48FB1",
    label: "Pink",
  },
  teal: {
    light: "#E0F2F1",
    dark: "#80DEEA",
    border: "#80DEEA",
    label: "Teal",
  },
  yellow: {
    light: "#FFFDE7",
    dark: "#FFF176",
    border: "#FFF176",
    label: "Yellow",
  },
};

/* Test & Exam System */
export interface Exam {
  id: string;
  subject: string;
  examDate: Date;
  examTime?: string; // HH:MM format
  color: ExamColor; // Color coding for subject
  topics: ExamTopic[];
  syllabus?: string; // Optional syllabus text/notes
  createdAt: Date;
}

export interface ExamTopic {
  id: string;
  name: string;
  completed: boolean;
}

/* Class Schedule System */
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface ScheduleClass {
  id: string;
  subject: string;
  day: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  room?: string;
  createdAt: Date;
}

/* Sleep & Energy Tracking */
export interface SleepLog {
  id: string;
  date: Date;
  bedtime: string; // HH:MM format
  wakeTime: string; // HH:MM format
  durationMinutes: number;
  createdAt: Date;
}

/* Dashboard Data */
export interface DashboardStats {
  overdueTasks: number;
  tasksToday: number;
  nearestExamDaysLeft: number;
  nearestExamSubject?: string;
  averageSleep: number; // in minutes
  daysBelow7Hours: number;
  survivalScore: number; // 0-100
}

export interface SurvivalScoreFactors {
  completionRate: number; // 0-100
  deadlineCompression: number; // 0-100 (higher is worse)
  sleepConsistency: number; // 0-100
}

/* Example response type for /api/demo */
export interface DemoResponse {
  message: string;
}
