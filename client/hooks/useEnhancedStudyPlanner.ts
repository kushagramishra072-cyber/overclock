interface StudyPlanInput {
  subject: string;
  examDate: string;
  chapters: string[];
  totalHours: number;
  currentGrade: number;
  board?: string;
  classGrade?: string;
}

interface ChapterAnalysis {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  weightage: number;
  estimatedHours: number;
  importantTopics: string[];
  resources: {
    notes: string;
    practiceProblems: number;
  };
}

interface DetailedStudyPlan {
  id: string;
  subject: string;
  chapters: ChapterAnalysis[];
  dailySchedule: DailyPlan[];
  totalEstimatedHours: number;
  revisionStrategy: string;
  expectedImprovement: number;
}

interface DailyPlan {
  day: number;
  date: string;
  chapters: ChapterAnalysis[];
  duration: number;
  sessionType: "learning" | "revision" | "practice" | "mock";
  topics: string[];
}

export function useEnhancedStudyPlanner() {
  // Estimate difficulty and weightage based on chapter names
  const analyzeChapter = (chapterName: string, index: number, total: number): ChapterAnalysis => {
    const name = chapterName.trim();
    
    // Keyword-based difficulty detection
    const hardKeywords = ["integration", "differential", "quantum", "relativity", "organic synthesis", "thermodynamics"];
    const easyKeywords = ["introduction", "basics", "overview", "definition", "chapter 1", "ch 1"];
    
    const nameLC = name.toLowerCase();
    let difficulty: "easy" | "medium" | "hard" = "medium";
    
    if (hardKeywords.some((kw) => nameLC.includes(kw))) {
      difficulty = "hard";
    } else if (easyKeywords.some((kw) => nameLC.includes(kw))) {
      difficulty = "easy";
    }

    // Weightage calculation - hard chapters get more weight
    const difficultyMultiplier = difficulty === "hard" ? 1.5 : difficulty === "easy" ? 0.7 : 1;
    const baseWeight = (1 / total) * 100;
    const weightage = Math.round(baseWeight * difficultyMultiplier);

    // Estimate hours based on difficulty
    const baseHours = 2;
    const estimatedHours = difficulty === "hard" ? 3.5 : difficulty === "easy" ? 1.5 : 2.5;

    // Extract important topics from chapter name
    const importantTopics = extractImportantTopics(name);

    return {
      name,
      difficulty,
      weightage,
      estimatedHours,
      importantTopics,
      resources: {
        notes: `${name} - Complete Notes`,
        practiceProblems: difficulty === "hard" ? 25 : difficulty === "easy" ? 10 : 15,
      },
    };
  };

  const extractImportantTopics = (chapterName: string): string[] => {
    const topics: string[] = [];
    const parts = chapterName.split(/[:-]/);

    // Take the main chapter name
    if (parts.length > 1) {
      topics.push(parts[1].trim());
    } else {
      topics.push(chapterName);
    }

    // Add common important topics based on chapter type
    const lcName = chapterName.toLowerCase();
    if (lcName.includes("derivative") || lcName.includes("differentiation")) {
      topics.push("Rules of Differentiation");
      topics.push("Applications");
    }
    if (lcName.includes("integral") || lcName.includes("integration")) {
      topics.push("Integration Methods");
      topics.push("Definite Integrals");
    }
    if (lcName.includes("thermodynamics")) {
      topics.push("Laws of Thermodynamics");
      topics.push("Entropy & Free Energy");
    }
    if (lcName.includes("organic")) {
      topics.push("Mechanisms");
      topics.push("Synthesis Routes");
    }

    return topics.slice(0, 3);
  };

  const generateDetailedPlan = (input: StudyPlanInput): DetailedStudyPlan => {
    const examDate = new Date(input.examDate);
    const today = new Date();
    const daysAvailable = Math.ceil(
      (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Analyze all chapters
    const chapters = input.chapters.map((ch, idx) =>
      analyzeChapter(ch, idx, input.chapters.length)
    );

    const totalEstimatedHours = chapters.reduce((sum, ch) => sum + ch.estimatedHours, 0);
    const scaleFactor = input.totalHours / totalEstimatedHours;

    // Scale estimated hours to match available time
    chapters.forEach((ch) => {
      ch.estimatedHours = Math.round(ch.estimatedHours * scaleFactor * 10) / 10;
    });

    // Generate daily schedule
    const dailySchedule: DailyPlan[] = [];
    let totalScheduledHours = 0;
    let chapterIndex = 0;
    let dayCounter = 0;

    for (let i = 0; i < daysAvailable && totalScheduledHours < input.totalHours; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      // Determine session type - rotate through learning, practice, revision
      let sessionType: "learning" | "revision" | "practice" | "mock" = "learning";
      if (i > 0 && i % 5 === 0) sessionType = "mock";
      else if (i > 0 && i % 4 === 0) sessionType = "revision";
      else if (i > 0 && i % 3 === 0) sessionType = "practice";

      // Select chapters for this day
      const chaptersForDay: ChapterAnalysis[] = [];
      let dayHours = 0;

      while (
        chapterIndex < chapters.length &&
        dayHours < 3 &&
        totalScheduledHours < input.totalHours
      ) {
        const ch = chapters[chapterIndex];
        if (dayHours + ch.estimatedHours <= 3.5) {
          chaptersForDay.push(ch);
          dayHours += ch.estimatedHours;
          totalScheduledHours += ch.estimatedHours;
        }
        chapterIndex++;
      }

      // If we've gone through all chapters and still have time, do revisions
      if (chapterIndex >= chapters.length && totalScheduledHours < input.totalHours) {
        sessionType = "revision";
        const revisedChapters = chapters.slice(0, Math.ceil(chapters.length / 2));
        chaptersForDay.push(...revisedChapters.slice(0, 2));
        dayHours = Math.min(2, input.totalHours - totalScheduledHours);
        totalScheduledHours += dayHours;
      }

      if (chaptersForDay.length > 0 && dayHours > 0) {
        dailySchedule.push({
          day: dayCounter + 1,
          date: dateStr,
          chapters: chaptersForDay,
          duration: dayHours,
          sessionType,
          topics: chaptersForDay.flatMap((ch) => ch.importantTopics),
        });
        dayCounter++;
      }
    }

    // Calculate expected improvement
    const gradeImprovement = Math.min(
      20,
      (100 - input.currentGrade) * (input.totalHours / 50)
    );

    // Determine revision strategy based on grade
    let revisionStrategy = "";
    if (input.currentGrade < 40) {
      revisionStrategy = "Focus on fundamentals and core concepts first. Practice heavily. Revise every 2 days.";
    } else if (input.currentGrade < 60) {
      revisionStrategy = "Balance between learning new topics and practicing. Revise every 3 days.";
    } else {
      revisionStrategy = "Focus on advanced topics and application-based questions. Revise every 4 days.";
    }

    return {
      id: `plan-${Date.now()}`,
      subject: input.subject,
      chapters: chapters.sort((a, b) => b.weightage - a.weightage),
      dailySchedule,
      totalEstimatedHours: totalScheduledHours,
      revisionStrategy,
      expectedImprovement: Math.round(gradeImprovement),
    };
  };

  return {
    generateDetailedPlan,
  };
}
