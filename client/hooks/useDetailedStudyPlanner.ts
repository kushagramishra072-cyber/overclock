import { useChapterContentDatabase } from "./useChapterContentDatabase";

export interface ScheduledTask {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  durationMinutes: number;
  priority: number;
  type: "study" | "revision" | "assignment" | "practice";
  reason: string;
}

export interface ScheduleDay {
  day: number;
  date: string;
  totalMinutes: number;
  tasks: ScheduledTask[];
}

export interface CrisisModePlan {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  completionProbability: number;
  emergencyMode: boolean;
  totalStudyHours: number;
  days: ScheduleDay[];
  warnings: string[];
  topPriorities: string[];
}

export function useDetailedStudyPlanner() {
  const { getChapterContent } = useChapterContentDatabase();

  const generatePlan = (
    board: string,
    classGrade: string,
    chapter: string,
    examDate: string,
    availableHours: number,
    confidenceLevel: number = 50
  ): CrisisModePlan => {
    let chapterContent = getChapterContent(board, classGrade, chapter);

    if (!chapterContent) {
      chapterContent = generateGenericChapterContent(chapter, classGrade);
    }

    const now = new Date();
    const exam = new Date(examDate);
    const daysUntilExam = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const availableMinutes = Math.round(availableHours * 60);

    // Calculate risk level and emergency mode
    const isEmergency = daysUntilExam <= 3 || availableHours <= 5;
    const riskLevel = calculateRiskLevel(daysUntilExam, availableMinutes, chapterContent);

    // Build task list with priority scores
    const tasks = buildTaskList(chapterContent, availableMinutes, daysUntilExam, confidenceLevel);

    // Sort by priority
    tasks.sort((a, b) => b.priority - a.priority);

    // Generate daily schedule respecting constraints
    const schedule = generateRealisticSchedule(
      tasks,
      daysUntilExam,
      availableMinutes,
      isEmergency
    );

    // Calculate metrics
    const totalScheduledMinutes = schedule.days.reduce((sum, d) => sum + d.totalMinutes, 0);
    const completionProbability = Math.min(100, Math.round((totalScheduledMinutes / availableMinutes) * 100));
    const warnings = generateWarnings(daysUntilExam, availableMinutes, tasks, isEmergency);
    const topPriorities = tasks.slice(0, 5).map(t => t.title);

    return {
      riskLevel,
      completionProbability,
      emergencyMode: isEmergency,
      totalStudyHours: Math.round(totalScheduledMinutes / 60 * 100) / 100,
      days: schedule.days,
      warnings,
      topPriorities,
    };
  };

  const calculateRiskLevel = (daysUntilExam: number, availableMinutes: number, chapterContent: any): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" => {
    const expectedMinutes = chapterContent.expectedHours * 60;
    const minutesPerDay = daysUntilExam > 0 ? availableMinutes / daysUntilExam : availableMinutes;

    if (daysUntilExam <= 1) return "EXTREME";
    if (daysUntilExam <= 3) return "HIGH";
    if (availableMinutes < expectedMinutes * 0.5) return "HIGH";
    if (availableMinutes < expectedMinutes * 0.75) return "MEDIUM";
    return "LOW";
  };

  const buildTaskList = (chapterContent: any, availableMinutes: number, daysUntilExam: number, confidenceLevel: number) => {
    const tasks: ScheduledTask[] = [];
    let taskId = 0;

    // Priority formula: (Urgency × 0.4) + (Importance × 0.3) + (Incompletion × 0.2) + (Difficulty × 0.1)
    // Results in 0-1 range, then scale to 0-10 for display
    // Urgency = days until exam (inverse, normalized 0-1)
    // Importance = topic importance from database (0-1)
    // Incompletion = 100% (0-1)
    // Difficulty = topic difficulty (0-1)

    const urgencyNorm = Math.min(1, Math.max(0, (10 - daysUntilExam) / 10));

    chapterContent.majorTopics.forEach((topic: any) => {
      const urgency = urgencyNorm * 0.4;
      const importance = (Math.min(10, topic.importance) / 10) * 0.3;
      const incompletion = 1.0 * 0.2; // 100% incomplete
      const difficulty = (Math.min(10, topic.difficulty) / 10) * 0.1;
      const priorityScore = urgency + importance + incompletion + difficulty;
      const priorityDisplay = Math.round(priorityScore * 10); // Scale 0-1 to 0-10

      // Generate specific reason based on actual topic metadata
      const keyTopics = topic.subtopics.slice(0, 2).join(" and ");
      const reason = `Master: ${keyTopics}. Difficulty ${topic.difficulty}/10, Importance ${topic.importance}/10`;

      tasks.push({
        id: `task-${taskId++}`,
        title: `Learn: ${topic.name}`,
        subject: chapterContent.name,
        chapter: chapterContent.name,
        durationMinutes: Math.ceil(topic.timeMinutes * 0.7),
        priority: priorityDisplay,
        type: "study",
        reason,
      });

      if (topic.formulasCount > 0) {
        const formulaTask = chapterContent.formulas?.slice(0, topic.formulasCount) || [];
        const formulasReason = formulaTask.length > 0
          ? `Memorize: ${formulaTask.map((f: any) => f.name).join(", ")}`
          : `Memorize ${topic.formulasCount} formulas and their applications`;

        tasks.push({
          id: `task-${taskId++}`,
          title: `Memorize formulas: ${topic.name}`,
          subject: chapterContent.name,
          chapter: chapterContent.name,
          durationMinutes: Math.ceil(topic.formulasCount * 5),
          priority: Math.round(priorityScore * 10 * 0.9),
          type: "study",
          reason: formulasReason,
        });
      }

      tasks.push({
        id: `task-${taskId++}`,
        title: `Practice: ${topic.name}`,
        subject: chapterContent.name,
        chapter: chapterContent.name,
        durationMinutes: Math.ceil(topic.timeMinutes * 0.3),
        priority: Math.round(priorityScore * 10 * 0.95),
        type: "practice",
        reason: `Solve problems: ${topic.subtopics.slice(0, 3).join(", ")}`,
      });
    });

    // Add revision tasks if days remaining > 1
    if (daysUntilExam > 1) {
      const revisionReason = chapterContent.revisionPoints?.slice(0, 3).join(". ") || "Final review before exam";

      tasks.push({
        id: `task-${taskId++}`,
        title: `Revision: ${chapterContent.name}`,
        subject: chapterContent.name,
        chapter: chapterContent.name,
        durationMinutes: Math.ceil(availableMinutes * 0.15),
        priority: 8,
        type: "revision",
        reason: revisionReason,
      });
    }

    return tasks;
  };

  const generateRealisticSchedule = (
    tasks: ScheduledTask[],
    daysUntilExam: number,
    availableMinutes: number,
    isEmergency: boolean
  ) => {
    const schedule: ScheduleDay[] = [];
    let minutesRemaining = availableMinutes;
    const studyDays = Math.max(1, daysUntilExam - (isEmergency ? 0 : 1));
    const minutesPerDay = Math.floor(availableMinutes / studyDays);

    // Quality checks
    const dailyLimit = 360; // Max 6 hours per day
    const maxConsecutive = 90; // Max 90 min without break

    let taskIndex = 0;
    const currentDate = new Date();

    for (let day = 0; day < studyDays; day++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(dayDate.getDate() + day);

      const dayTasks: ScheduledTask[] = [];
      let dayMinutes = 0;
      let consecutiveMinutes = 0;

      while (taskIndex < tasks.length && dayMinutes < dailyLimit && minutesRemaining > 0) {
        const task = tasks[taskIndex];
        const timeToAdd = Math.min(
          task.durationMinutes,
          dailyLimit - dayMinutes,
          minutesRemaining
        );

        if (consecutiveMinutes + timeToAdd > maxConsecutive) {
          // Add a 10-minute break conceptually (just break the session)
          consecutiveMinutes = 0;
          continue;
        }

        dayTasks.push({
          ...task,
          durationMinutes: timeToAdd,
        });

        dayMinutes += timeToAdd;
        consecutiveMinutes += timeToAdd;
        minutesRemaining -= timeToAdd;

        // Move to next task if current is done
        if (timeToAdd >= task.durationMinutes) {
          taskIndex++;
          consecutiveMinutes = 0;
        } else {
          // Partial task - reduce remaining time
          tasks[taskIndex] = { ...task, durationMinutes: task.durationMinutes - timeToAdd };
          consecutiveMinutes = 0;
        }

        // Break every 90 minutes
        if (consecutiveMinutes >= maxConsecutive) {
          consecutiveMinutes = 0;
        }
      }

      if (dayTasks.length > 0) {
        schedule.push({
          day: day + 1,
          date: dayDate.toISOString().split('T')[0],
          totalMinutes: dayMinutes,
          tasks: dayTasks,
        });
      }
    }

    return { days: schedule };
  };

  const generateWarnings = (daysUntilExam: number, availableMinutes: number, tasks: ScheduledTask[], isEmergency: boolean): string[] => {
    const warnings: string[] = [];

    if (daysUntilExam <= 0) {
      warnings.push("Exam is today or has already started. Focus on quick revision only.");
    } else if (daysUntilExam <= 1) {
      warnings.push("Less than 24 hours until exam. Prioritize high-weightage topics only.");
    } else if (daysUntilExam <= 3) {
      warnings.push("Only 3 days until exam. Emergency mode activated - focus on must-know topics.");
      warnings.push("Reduce sleep slightly if needed, but do not sacrifice sleep entirely.");
    }

    const totalTaskMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    if (totalTaskMinutes > availableMinutes) {
      warnings.push(`Workload exceeds available time by ${Math.round((totalTaskMinutes - availableMinutes) / 60)} hours. Lower-priority tasks will be removed.`);
    }

    if (availableMinutes < 120) {
      warnings.push("Very limited study time. Focus exclusively on highest-priority topics.");
    }

    return warnings;
  };

  const generateGenericChapterContent = (chapter: string, classGrade: string): any => {
    // Determine difficulty based on grade
    const gradeNum = parseInt(classGrade);
    const baseDifficulty = Math.min(9, 3 + Math.ceil(gradeNum / 3));

    return {
      name: chapter,
      difficulty: baseDifficulty,
      expectedHours: Math.round(10 + Math.random() * 8),
      marksWeightage: Math.round(5 + Math.random() * 5),
      conceptDensity: Math.round(4 + Math.random() * 5),
      memorizationLoad: Math.round(3 + Math.random() * 6),
      problemSolvingLoad: Math.round(4 + Math.random() * 5),
      majorTopics: [
        {
          name: `Introduction to ${chapter}`,
          subtopics: ["Key concepts", "Historical background", "Real-world applications"],
          timeMinutes: 45,
          importance: 8,
          difficulty: 2,
          formulasCount: 0,
          diagramsCount: 2,
        },
        {
          name: `Core Concepts of ${chapter}`,
          subtopics: ["Main idea 1", "Main idea 2", "Main idea 3", "Supporting concepts"],
          timeMinutes: 90,
          importance: 10,
          difficulty: baseDifficulty - 1,
          formulasCount: 2,
          diagramsCount: 5,
        },
        {
          name: `Advanced Topics in ${chapter}`,
          subtopics: ["Application 1", "Application 2", "Problem-solving techniques"],
          timeMinutes: 75,
          importance: 8,
          difficulty: baseDifficulty,
          formulasCount: 2,
          diagramsCount: 4,
        },
        {
          name: `Practice and Numerical Problems`,
          subtopics: ["Worked examples", "Practice problems", "Common mistakes"],
          timeMinutes: 60,
          importance: 9,
          difficulty: baseDifficulty - 1,
          formulasCount: 0,
          diagramsCount: 3,
        },
      ],
      formulas: [
        {
          name: `Key Formula 1`,
          formula: "Formula goes here",
          whenToUse: "Use this formula when solving problems related to main concepts",
          commonMistakes: [
            "Forgetting units",
            "Wrong sign convention",
            "Incorrect substitution",
          ],
        },
        {
          name: `Key Formula 2`,
          formula: "Another formula",
          whenToUse: "Apply this when dealing with advanced applications",
          commonMistakes: [
            "Missing intermediate steps",
            "Calculation errors",
          ],
        },
      ],
      commonMistakes: [
        "Misunderstanding the core concept",
        "Making calculation errors",
        "Forgetting important steps",
        "Not reading the question carefully",
        "Confusing similar concepts",
      ],
      previousYearTrends: [
        { topic: "Core concepts", frequency: "high", marksRange: "3-5" },
        { topic: "Problem solving", frequency: "high", marksRange: "2-4" },
        { topic: "Definitions and formulas", frequency: "medium", marksRange: "1-2" },
        { topic: "Applications", frequency: "medium", marksRange: "2-3" },
      ],
      flashcardQuestions: [
        `What is ${chapter}?`,
        `Explain the main concepts of ${chapter}`,
        `State the key formulas for ${chapter}`,
        `How do you solve a typical problem in ${chapter}?`,
        `What are the applications of ${chapter}?`,
        `List 5 important terms in ${chapter}`,
        `Draw a diagram showing the process in ${chapter}`,
        `What are common mistakes in ${chapter}?`,
        `How does ${chapter} relate to previous topics?`,
        `Solve a sample problem step by step`,
      ],
      selfTestQuestions: [
        `Solve 5 problems on the core concepts of ${chapter}`,
        `Explain each topic without referring to notes`,
        `Create a mind map of ${chapter}`,
        `Identify which formula to use in different scenarios`,
        `Solve past paper questions on ${chapter}`,
        `Compare similar concepts in ${chapter}`,
        `Derive the key formulas from first principles`,
        `Create examples showing real-world applications`,
        `Identify and correct common mistakes`,
        `Teach ${chapter} to someone else`,
      ],
      mustKnowTopics: [
        "Core concept 1",
        "Core concept 2",
        "Key formula",
        "Problem-solving method",
      ],
      shouldKnowTopics: [
        "Application 1",
        "Advanced concept",
        "Derivation",
      ],
      niceToKnowTopics: [
        "Historical background",
        "Extended applications",
        "Related fields",
      ],
      revisionPoints: [
        "Always verify your answer makes sense",
        "Check units and sign conventions",
        "Understand why a formula works, not just memorize it",
        "Practice with different problem types",
        "Connect to previous learning",
      ],
    };
  };

  return {
    generatePlan,
  };
}
