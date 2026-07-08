interface StudyPlanInput {
  subject: string;
  examDate: string;
  syllabus: string;
  totalHours: number;
  currentGrade: number; // 0-100
  chapters: string[];
  pdfUrl?: string;
}

interface StudySession {
  day: number;
  date: string;
  duration: number;
  topics: string[];
  focusLevel: "low" | "medium" | "high";
  sessionType: "learning" | "revision" | "practice";
}

interface StudyPlan {
  id: string;
  subject: string;
  examDate: string;
  totalHours: number;
  sessions: StudySession[];
  schedule: StudySession[];
  weakChapters: string[];
  focusAreas: string[];
  revisionDays: string[];
  createdAt: string;
}

export function useStudyPlanGenerator() {
  const generatePlan = (input: StudyPlanInput): StudyPlan => {
    const examDate = new Date(input.examDate);
    const today = new Date();
    const daysAvailable = Math.ceil(
      (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Parse syllabus into topics
    const topics = input.syllabus
      .split("\n")
      .filter((t) => t.trim().length > 0)
      .slice(0, 20);

    // Prioritize based on grade and chapter count
    const hoursPerDay = input.totalHours / Math.max(daysAvailable, 1);
    const isIntensive = hoursPerDay > 4;
    const weakChapters = topics.slice(0, Math.ceil(topics.length * 0.3));
    const focusAreas = weakChapters;

    // Generate daily schedule
    const schedule: StudySession[] = [];
    let totalScheduledHours = 0;
    let dayCounter = 0;

    for (let i = 0; i < daysAvailable && totalScheduledHours < input.totalHours; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      // Alternate session types
      const isRevisionDay = i > 0 && i % 4 === 0;
      const isPracticeDay = i > 0 && i % 5 === 0;

      // Calculate duration - heavier on weak chapters
      let duration = 2; // Base 2 hours
      if (isIntensive) duration = 4;
      if (isRevisionDay) duration = 3;
      if (isPracticeDay) duration = 2.5;

      // Don't exceed total hours
      if (totalScheduledHours + duration > input.totalHours) {
        duration = input.totalHours - totalScheduledHours;
      }

      if (duration > 0) {
        // Select topics for this day - rotate through all topics, prioritize weak ones first
        const topicsForDay = [];
        const topicCount = Math.ceil(topics.length / daysAvailable);
        for (let j = 0; j < topicCount && i * topicCount + j < topics.length; j++) {
          topicsForDay.push(topics[i * topicCount + j]);
        }

        schedule.push({
          day: dayCounter + 1,
          date: dateStr,
          duration,
          topics: topicsForDay,
          focusLevel: isRevisionDay ? "high" : "medium",
          sessionType: isPracticeDay ? "practice" : isRevisionDay ? "revision" : "learning",
        });

        totalScheduledHours += duration;
        dayCounter++;
      }
    }

    // Calculate revision days (every 4-5 days)
    const revisionDays = schedule
      .filter((s) => s.sessionType === "revision")
      .map((s) => s.date);

    return {
      id: `plan-${Date.now()}`,
      subject: input.subject,
      examDate: input.examDate,
      totalHours: input.totalHours,
      sessions: schedule,
      schedule,
      weakChapters,
      focusAreas,
      revisionDays,
      createdAt: new Date().toISOString(),
    };
  };

  return {
    generatePlan,
  };
}
