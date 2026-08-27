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
  selfAssessmentGoal?: string;
  checkpointItems?: string[];
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

export interface ChapterInput {
  name: string;
  confidence?: number; // 0-100
  difficulty?: number;
}

export function useDetailedStudyPlanner() {
  const { getChapterContent } = useChapterContentDatabase();

  const generatePlan = (
    board: string,
    classGrade: string,
    chapterOrChapters: string | ChapterInput[],
    examDate: string,
    availableHours: number,
    overallConfidenceLevel: number = 50,
    subjectName: string = ""
  ): CrisisModePlan => {
    // Normalize chapters into array
    const chapterInputs: ChapterInput[] = typeof chapterOrChapters === "string"
      ? [{ name: chapterOrChapters, confidence: overallConfidenceLevel }]
      : chapterOrChapters;

    const now = new Date();
    const exam = new Date(examDate);
    const daysUntilExam = Math.max(1, Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const availableMinutes = Math.round(availableHours * 60);

    // Calculate total expected hours and parse chapter contents
    const parsedChapters = chapterInputs.map((chInput) => {
      let content = getChapterContent(board, classGrade, chInput.name);
      if (!content) {
        content = generateRealisticChapterContent(chInput.name, classGrade, subjectName);
      }
      return {
        input: chInput,
        content,
        confidence: chInput.confidence ?? overallConfidenceLevel,
      };
    });

    const isEmergency = daysUntilExam <= 3 || availableHours <= 5;

    // Build tasks across ALL selected chapters
    const allTasks: ScheduledTask[] = [];
    let taskIdCounter = 0;

    parsedChapters.forEach(({ content, confidence }) => {
      const chapterTasks = buildTaskListForChapter(
        content,
        availableMinutes / parsedChapters.length,
        daysUntilExam,
        confidence,
        taskIdCounter,
        classGrade
      );
      taskIdCounter += chapterTasks.length;
      allTasks.push(...chapterTasks);
    });

    // Sort all tasks by priority descending
    allTasks.sort((a, b) => b.priority - a.priority);

    // Generate daily schedule respecting max hours and break limits
    const schedule = generateRealisticSchedule(
      allTasks,
      daysUntilExam,
      availableMinutes,
      isEmergency
    );

    // Calculate metrics
    const totalScheduledMinutes = schedule.days.reduce((sum, d) => sum + d.totalMinutes, 0);
    const completionProbability = Math.min(100, Math.round((totalScheduledMinutes / Math.max(1, availableMinutes)) * 100));
    
    // Overall risk calculation based on average confidence and total workload
    const avgConfidence = parsedChapters.reduce((acc, c) => acc + c.confidence, 0) / Math.max(1, parsedChapters.length);
    const riskLevel = calculateRiskLevel(daysUntilExam, availableMinutes, parsedChapters.map(p => p.content), avgConfidence);
    const warnings = generateWarnings(daysUntilExam, availableMinutes, allTasks, isEmergency);
    const topPriorities = allTasks.slice(0, 5).map((t) => `${t.title} (${t.chapter})`);

    return {
      riskLevel,
      completionProbability,
      emergencyMode: isEmergency,
      totalStudyHours: Math.round((totalScheduledMinutes / 60) * 10) / 10,
      days: schedule.days,
      warnings,
      topPriorities,
    };
  };

  const calculateRiskLevel = (
    daysUntilExam: number,
    availableMinutes: number,
    chapters: any[],
    avgConfidence: number
  ): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" => {
    const totalExpectedMinutes = chapters.reduce((sum, ch) => sum + (ch.expectedHours || 8) * 60, 0);

    if (daysUntilExam <= 1 || avgConfidence < 30) return "EXTREME";
    if (daysUntilExam <= 3 || availableMinutes < totalExpectedMinutes * 0.4) return "HIGH";
    if (availableMinutes < totalExpectedMinutes * 0.7) return "MEDIUM";
    return "LOW";
  };

  const buildTaskListForChapter = (
    chapterContent: any,
    allocatedMinutes: number,
    daysUntilExam: number,
    confidenceLevel: number,
    startTaskId: number,
    classGrade: string = "10th"
  ) => {
    const tasks: ScheduledTask[] = [];
    let taskId = startTaskId;
    const gradeNum = parseInt(classGrade) || 10;
    const terms = getExamTerms(gradeNum);

    const urgencyNorm = Math.min(1, Math.max(0, (10 - daysUntilExam) / 10));
    const confidencePenalty = (100 - confidenceLevel) / 100;
    const basePriority = Math.min(10, Math.max(4, Math.round(5 + urgencyNorm * 3 + confidencePenalty * 2)));

    // 1. Concept Target for each major topic
    (chapterContent?.majorTopics || []).forEach((topic: any) => {
      const priorityDisplay = Math.min(10, Math.max(5, basePriority + (topic.importance >= 9 ? 1 : 0)));
      const subtopicsList = Array.isArray(topic.subtopics) ? topic.subtopics : [];
      const topicName = topic.name || "Core Concept";
      const chapName = chapterContent?.name || "Chapter";
      const duration = Math.min(60, Math.max(25, Math.round((topic.timeMinutes || 45) * 0.6)));
      
      tasks.push({
        id: `task-${taskId++}`,
        title: `${topicName} (${chapName})`,
        subject: chapName,
        chapter: chapName,
        durationMinutes: duration,
        priority: priorityDisplay,
        type: "study",
        reason: subtopicsList.length > 0
          ? `Master ${subtopicsList.slice(0, 2).join(" & ")}. (Importance ${topic.importance || 8}/10)`
          : `Master key concepts of ${topicName}`,
        selfAssessmentGoal: `Explain ${topicName} without looking at notes`,
        checkpointItems: subtopicsList.length > 0
          ? subtopicsList.map((st: string) => `• ${st}`)
          : [`• Understand key principles of ${topicName}`],
      });
    });

    // 2. Single consolidated Formula & Equation Drill for the entire chapter
    if (Array.isArray(chapterContent?.formulas) && chapterContent.formulas.length > 0) {
      tasks.push({
        id: `task-${taskId++}`,
        title: `Formula & Rules Drill: ${chapterContent.name}`,
        subject: chapterContent.name,
        chapter: chapterContent.name,
        durationMinutes: Math.min(30, Math.max(15, chapterContent.formulas.length * 8)),
        priority: Math.min(10, basePriority + 1),
        type: "study",
        reason: `Memorize core equations: ${chapterContent.formulas.map((f: any) => f?.name || "Equation").join(", ")}`,
        selfAssessmentGoal: `Write down all formulas and sign conventions from memory`,
        checkpointItems: chapterContent.formulas.map((f: any) => `${f?.name || "Formula"}: ${f?.formula || ""}`),
      });
    }

    // 3. Consolidated High-Yield Practice Target
    const totalProblems = Math.max(4, Math.min(12, Math.ceil(allocatedMinutes / 25)));
    const chapTitle = chapterContent?.name || "Chapter";
    tasks.push({
      id: `task-${taskId++}`,
      title: `Practice Target: ${totalProblems} ${terms.examType} Questions on ${chapTitle}`,
      subject: chapTitle,
      chapter: chapTitle,
      durationMinutes: Math.min(60, Math.max(25, Math.round(allocatedMinutes * 0.3))),
      priority: basePriority,
      type: "practice",
      reason: `Solve ${totalProblems} ${terms.paperType} questions on ${chapTitle}`,
      selfAssessmentGoal: `Complete ${totalProblems} practice questions with ≥80% accuracy`,
      checkpointItems: [
        `Solve ${Math.ceil(totalProblems / 2)} standard 2/3-mark questions`,
        `Solve ${Math.floor(totalProblems / 2)} high-weightage 4/5-mark ${terms.examType} questions`,
        `Verify answers against step-by-step marking schemes`,
      ],
    });

    // 4. Revision & Closed-Book Self Assessment
    const revPoints = Array.isArray(chapterContent?.revisionPoints) ? chapterContent.revisionPoints : [];
    const selfTest = Array.isArray(chapterContent?.selfTestQuestions) ? chapterContent.selfTestQuestions : [];

    tasks.push({
      id: `task-${taskId++}`,
      title: `Self-Assessment Checkpoint: ${chapTitle}`,
      subject: chapTitle,
      chapter: chapTitle,
      durationMinutes: 25,
      priority: Math.max(4, basePriority - 1),
      type: "revision",
      reason: revPoints.slice(0, 2).join(". ") || `Final high-yield review of ${chapTitle}`,
      selfAssessmentGoal: `Closed-book quiz on ${chapTitle} key concepts`,
      checkpointItems: selfTest.length > 0
        ? selfTest.slice(0, 3)
        : [
            `Recall core definitions of ${chapTitle}`,
            `Solve 1 ${terms.questionType} under timed conditions`,
          ],
    });

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
    const studyDays = Math.max(1, daysUntilExam);
    const dailyBudget = Math.min(360, Math.ceil(availableMinutes / studyDays)); // Max 6 hrs/day

    let taskIndex = 0;
    const currentDate = new Date();

    for (let day = 0; day < studyDays && taskIndex < tasks.length && minutesRemaining > 0; day++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(dayDate.getDate() + day);

      const dayTasks: ScheduledTask[] = [];
      let dayMinutes = 0;

      while (taskIndex < tasks.length && dayMinutes < dailyBudget && minutesRemaining > 0) {
        const task = tasks[taskIndex];
        const timeToAdd = Math.min(
          task.durationMinutes,
          dailyBudget - dayMinutes,
          minutesRemaining
        );

        if (timeToAdd <= 0) break;

        dayTasks.push({
          ...task,
          durationMinutes: timeToAdd,
        });

        dayMinutes += timeToAdd;
        minutesRemaining -= timeToAdd;

        if (timeToAdd >= task.durationMinutes) {
          taskIndex++;
        } else {
          tasks[taskIndex] = { ...task, durationMinutes: task.durationMinutes - timeToAdd };
        }
      }

      if (dayTasks.length > 0) {
        schedule.push({
          day: day + 1,
          date: dayDate.toISOString().split("T")[0],
          totalMinutes: dayMinutes,
          tasks: dayTasks,
        });
      }
    }

    return { days: schedule };
  };

  const generateWarnings = (
    daysUntilExam: number,
    availableMinutes: number,
    tasks: ScheduledTask[],
    isEmergency: boolean
  ): string[] => {
    const warnings: string[] = [];

    if (daysUntilExam <= 1) {
      warnings.push("Exam is tomorrow or today! Emergency focus on highest-yield formulas & past paper questions.");
    } else if (daysUntilExam <= 3) {
      warnings.push("Only 3 days until exam. Emergency mode activated — priority given to weak topics & formula recall.");
    }

    const totalTaskMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    if (totalTaskMinutes > availableMinutes) {
      warnings.push(
        `Total topic workload (${Math.round(totalTaskMinutes / 60)}h) exceeds your budgeted study time (${Math.round(availableMinutes / 60)}h). Lower-priority tasks have been trimmed.`
      );
    }

    return warnings;
  };

  return {
    generatePlan,
  };
}

export function getExamTerms(gradeNum: number) {
  if (gradeNum === 10 || gradeNum === 12) {
    return {
      examType: "Board Exam",
      paperType: "past board paper & sample paper",
      questionType: "previous year board exam question",
      questionsPlural: "past board exam questions",
    };
  } else if (gradeNum >= 11) {
    return {
      examType: "School Final & Entrance Exam",
      paperType: "NCERT Exemplar & competitive practice paper",
      questionType: "Class 11/12 NCERT Exemplar & competitive question",
      questionsPlural: "NCERT Exemplar & competitive exam questions",
    };
  } else {
    return {
      examType: "Annual School Exam",
      paperType: "NCERT textbook & annual school exam paper",
      questionType: "NCERT exercise & annual school exam question",
      questionsPlural: "NCERT textbook & annual school exam questions",
    };
  }
}

/**
 * Generates rich, realistic, non-generic chapter content based on actual topic name keywords.
 */
export function generateRealisticChapterContent(
  chapterName: string,
  classGrade: string,
  subjectName: string = ""
): any {
  const titleLower = `${chapterName} ${subjectName}`.toLowerCase();
  const gradeNum = parseInt(classGrade) || 10;
  const terms = getExamTerms(gradeNum);
  const baseDifficulty = Math.min(9, Math.max(3, Math.ceil(gradeNum / 2)));

  // --- 1. REAL NUMBERS & NUMBER SYSTEMS ---
  if (
    titleLower.includes("real number") ||
    titleLower.includes("number system") ||
    titleLower.includes("knowing our number") ||
    titleLower.includes("whole number") ||
    titleLower.includes("rational") ||
    titleLower.includes("irrational")
  ) {
    return {
      name: chapterName,
      difficulty: 5,
      expectedHours: 6,
      majorTopics: [
        {
          name: "Fundamental Theorem of Arithmetic & Prime Factorization",
          subtopics: [
            "Prime factorization of composite numbers (N = p1^a1 · p2^a2...)",
            "Finding HCF & LCM using prime factor powers",
            "Applications in circular path & bell ringing word problems",
          ],
          timeMinutes: 45,
          importance: 10,
          difficulty: 4,
          formulasCount: 2,
        },
        {
          name: "Line-by-Line Irrationality Proofs",
          subtopics: [
            "Contradiction method: assuming √2, √3, √5 = a/b (co-prime integers)",
            "Proving composite forms like 3 + 2√5 or 1/√2 are irrational",
            "Key theorem: If prime p divides a², then p divides a",
          ],
          timeMinutes: 60,
          importance: 10,
          difficulty: 6,
          formulasCount: 0,
        },
        {
          name: "Decimal Expansions & Rational Denominator Test",
          subtopics: [
            "Terminating condition: denominator q = 2^m · 5^n",
            "Non-terminating recurring decimal identification",
            "Converting recurring decimals to p/q form",
          ],
          timeMinutes: 35,
          importance: 8,
          difficulty: 3,
          formulasCount: 1,
        },
      ],
      formulas: [
        {
          name: "HCF & LCM Fundamental Relation",
          formula: "HCF(a, b) × LCM(a, b) = a × b",
          whenToUse: "Finding LCM or HCF when two numbers and one value are given",
          commonMistakes: ["Applying this relation to 3 numbers (valid ONLY for 2 numbers)", "Calculation errors in prime factor powers"],
        },
        {
          name: "Terminating Decimal Condition",
          formula: "q = 2^m × 5^n  (where m, n are non-negative integers)",
          whenToUse: "Checking if a rational number p/q has a terminating decimal expansion without division",
          commonMistakes: ["Not simplifying p/q to simplest co-prime form first before checking denominator factors"],
        },
      ],
      revisionPoints: [
        "HCF = product of SMALLEST powers of common prime factors",
        "LCM = product of GREATEST powers of all prime factors involved",
        "In irrationality proofs, always state clearly that 'a and b are co-prime integers (HCF = 1)'",
      ],
      selfTestQuestions: [
        `Prove that √5 is irrational using the contradiction method line-by-line`,
        `Given HCF(306, 657) = 9, find LCM(306, 657) using the HCF × LCM formula`,
        `Check whether 6^n can end with the digit 0 for any natural number n`,
      ],
    };
  }

  // --- 2. ARITHMETIC PROGRESSIONS & SEQUENCES ---
  if (
    titleLower.includes("arithmetic progression") ||
    titleLower.includes("sequence") ||
    titleLower.includes("series") ||
    titleLower.includes(" ap") ||
    titleLower.startsWith("ap")
  ) {
    return {
      name: chapterName,
      difficulty: 6,
      expectedHours: 8,
      majorTopics: [
        {
          name: "General nth Term of an AP",
          subtopics: [
            "Identifying first term 'a' and common difference 'd = a2 - a1'",
            "Formula: a_n = a + (n-1)d",
            "Finding nth term from the end: a_n(end) = l - (n-1)d",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: 5,
          formulasCount: 2,
        },
        {
          name: "Sum of First n Terms of an AP",
          subtopics: [
            "Formula 1: S_n = (n/2)[2a + (n-1)d]",
            "Formula 2: S_n = (n/2)(a + l) when last term l is known",
            "Term-Sum relation: a_n = S_n - S_{n-1}",
          ],
          timeMinutes: 70,
          importance: 10,
          difficulty: 6,
          formulasCount: 3,
        },
        {
          name: "AP Real-Life Word Problems & Selection of Terms",
          subtopics: [
            "3 terms in AP: (a-d), a, (a+d) | 4 terms: (a-3d), (a-d), (a+d), (a+3d)",
            "Installment savings, row seating & ladder rung word problems",
            "Solving simultaneous equations for unknown 'a' and 'd'",
          ],
          timeMinutes: 60,
          importance: 9,
          difficulty: 7,
          formulasCount: 1,
        },
      ],
      formulas: [
        {
          name: "General nth Term Formula",
          formula: "a_n = a + (n - 1)d",
          whenToUse: "Finding any term value, term position n, first term a, or common difference d",
          commonMistakes: ["Confusing term position n (must be positive integer) with term value a_n", "Sign errors when d is negative"],
        },
        {
          name: "Sum of n Terms Formula",
          formula: "S_n = (n/2)[2a + (n - 1)d]  OR  S_n = (n/2)(a + l)",
          whenToUse: "Calculating sum of AP terms or total sum in word problems",
          commonMistakes: ["Forgetting the factor 1/2 in n/2", "Misidentifying last term l vs common difference d"],
        },
        {
          name: "Term-Sum Relationship",
          formula: "a_n = S_n - S_{n-1}",
          whenToUse: "Finding specific term a_n when a polynomial expression for S_n in terms of n is given",
          commonMistakes: ["Brackets expansion errors while evaluating S_{n-1}"],
        },
      ],
      revisionPoints: [
        "Common difference d = a2 - a1 = a3 - a2 (can be positive, zero, or negative)",
        "Number of terms n MUST ALWAYS be a positive integer (1, 2, 3...)",
        "If 3 numbers a, b, c are in AP, then middle term 2b = a + c",
      ],
      selfTestQuestions: [
        `Find the 20th term from the end of the AP: 3, 8, 13, ..., 253`,
        `If the sum of the first n terms of an AP is S_n = 3n² + 5n, find its 16th term`,
        `A manufacturer produced 600 sets in the 3rd year and 700 sets in the 7th year. Find 1st year production`,
      ],
    };
  }

  // --- 3. POLYNOMIALS ---
  if (
    titleLower.includes("polynomial")
  ) {
    return {
      name: chapterName,
      difficulty: 6,
      expectedHours: 7,
      majorTopics: [
        {
          name: "Zeroes & Geometrical Meaning of Polynomials",
          subtopics: [
            "Geometrical interpretation: number of zeroes = number of x-axis intersection points",
            "Linear, quadratic, and cubic polynomial graph shapes (parabola)",
            "Degree of polynomial and maximum possible real zeroes",
          ],
          timeMinutes: 45,
          importance: 9,
          difficulty: 4,
          formulasCount: 1,
        },
        {
          name: "Relationship between Zeroes & Coefficients",
          subtopics: [
            "Quadratic polynomial ax² + bx + c: Sum (α + β = -b/a), Product (αβ = c/a)",
            "Forming quadratic polynomial when zeroes are given: P(x) = k[x² - (α+β)x + αβ]",
            "Evaluating symmetric expressions in zeroes e.g. α² + β², 1/α + 1/β",
          ],
          timeMinutes: 65,
          importance: 10,
          difficulty: 6,
          formulasCount: 2,
        },
      ],
      formulas: [
        {
          name: "Sum & Product of Zeroes (Quadratic)",
          formula: "α + β = -b / a  |  α × β = c / a",
          whenToUse: "Verifying relationship between zeroes and coefficients of ax² + bx + c",
          commonMistakes: ["Forgetting negative sign in -b/a", "Confusing c/a with -c/a"],
        },
        {
          name: "Quadratic Polynomial Formation",
          formula: "P(x) = k · [x² - (Sum of zeroes)x + (Product of zeroes)]",
          whenToUse: "Constructing quadratic equation/polynomial given individual zeroes α, β or their sum and product",
          commonMistakes: ["Wrong sign in middle term: must be - (Sum)x"],
        },
      ],
      revisionPoints: [
        "Sum of zeroes α + β = -b/a; Product of zeroes αβ = c/a",
        "Identity trick: α² + β² = (α + β)² - 2αβ",
        "Identity trick: 1/α + 1/β = (α + β) / (αβ)",
      ],
      selfTestQuestions: [
        `Find the zeroes of 6x² - 3 - 7x and verify the relationship between zeroes and coefficients`,
        `Find a quadratic polynomial whose sum and product of zeroes are -1/4 and 1/4 respectively`,
        `If α and β are zeroes of 2x² + 5x + k such that α² + β² + αβ = 21/4, find k`,
      ],
    };
  }

  // --- 4. QUADRATIC EQUATIONS ---
  if (
    titleLower.includes("quadratic")
  ) {
    return {
      name: chapterName,
      difficulty: 7,
      expectedHours: 8,
      majorTopics: [
        {
          name: "Standard Form & Factorization (Splitting Middle Term)",
          subtopics: [
            "Standard form: ax² + bx + c = 0 (a ≠ 0)",
            "Splitting middle term bx into two terms whose product is a·c",
            "Verifying roots by direct substitution",
          ],
          timeMinutes: 50,
          importance: 9,
          difficulty: 5,
          formulasCount: 1,
        },
        {
          name: "Quadratic Formula & Discriminant Analysis",
          subtopics: [
            "Discriminant formula: D = b² - 4ac",
            "Quadratic formula: x = (-b ± √D) / (2a)",
            "Nature of roots: D > 0 (2 distinct real), D = 0 (2 equal real x = -b/2a), D < 0 (no real roots)",
          ],
          timeMinutes: 75,
          importance: 10,
          difficulty: 6,
          formulasCount: 2,
        },
        {
          name: "High-Yield Word Problems (Speed, Time, Work & Geometry)",
          subtopics: [
            "Speed-distance-time: upstream (x - y) vs downstream (x + y) boat problems",
            "Train speed & time delay equations",
            "Two water taps / pipes filling tank together",
          ],
          timeMinutes: 80,
          importance: 10,
          difficulty: 8,
          formulasCount: 1,
        },
      ],
      formulas: [
        {
          name: "Discriminant Formula",
          formula: "D = b² - 4ac",
          whenToUse: "Determining nature of roots or finding unknown k when roots are equal (D = 0)",
          commonMistakes: ["Sign errors when b or c is negative e.g. (-4)² vs -4²"],
        },
        {
          name: "Quadratic Formula (Sridharacharya Rule)",
          formula: "x = (-b ± √(b² - 4ac)) / (2a)",
          whenToUse: "Finding roots of any quadratic equation ax² + bx + c = 0 directly",
          commonMistakes: ["Dividing only √D by 2a instead of whole numerator (-b ± √D)", "Forgetting negative sign in -b"],
        },
      ],
      revisionPoints: [
        "D = b² - 4ac: D > 0 (2 real distinct), D = 0 (2 equal roots x = -b/2a), D < 0 (no real roots)",
        "In boat problems: Upstream speed = (x - y) km/h, Downstream speed = (x + y) km/h",
        "Always reject negative values for speed, age, length, or time in word problems",
      ],
      selfTestQuestions: [
        `Find the value of k for which 2x² + kx + 3 = 0 has two equal real roots`,
        `A motorboat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than to return downstream. Find speed of stream`,
        `Solve for x: 1/(x-1) - 1/(x+5) = 1/6`,
      ],
    };
  }

  // --- 5. LINEAR EQUATIONS IN TWO VARIABLES ---
  if (
    titleLower.includes("linear equation") ||
    titleLower.includes("pair of linear")
  ) {
    return {
      name: chapterName,
      difficulty: 6,
      expectedHours: 7,
      majorTopics: [
        {
          name: "Graphical Representation & Consistency Conditions",
          subtopics: [
            "a1 x + b1 y + c1 = 0 and a2 x + b2 y + c2 = 0",
            "Unique solution (Intersecting lines): a1/a2 ≠ b1/b2",
            "Infinitely many solutions (Coincident lines): a1/a2 = b1/b2 = c1/c2",
            "No solution (Parallel lines / Inconsistent): a1/a2 = b1/b2 ≠ c1/c2",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: 5,
          formulasCount: 3,
        },
        {
          name: "Algebraic Methods (Substitution & Elimination)",
          subtopics: [
            "Substitution method: expressing one variable in terms of the other",
            "Elimination method: equating coefficients by multiplication",
            "Equations reducible to linear form (1/x = u, 1/y = v)",
          ],
          timeMinutes: 70,
          importance: 10,
          difficulty: 6,
          formulasCount: 1,
        },
      ],
      formulas: [
        {
          name: "System Consistency Conditions",
          formula: "Unique: a1/a2 ≠ b1/b2  |  Infinite: a1/a2 = b1/b2 = c1/c2  |  No Solution: a1/a2 = b1/b2 ≠ c1/c2",
          whenToUse: "Determining system consistency or finding unknown parameter k",
          commonMistakes: ["Not shifting constant terms c1, c2 to the same side of equal sign before forming ratios"],
        },
      ],
      revisionPoints: [
        "Always convert equations to standard form: ax + by + c = 0 before computing ratio coefficients",
        "Two-digit number representation: Number = 10x + y; Reversed = 10y + x",
      ],
      selfTestQuestions: [
        `For what value of k will the system of equations kx + 3y = k - 3 and 12x + ky = k have infinitely many solutions?`,
        `Solve by elimination: 2/x + 3/y = 13 and 5/x - 4/y = -2`,
      ],
    };
  }

  // --- 6. COORDINATE GEOMETRY ---
  if (
    titleLower.includes("coordinate")
  ) {
    return {
      name: chapterName,
      difficulty: 6,
      expectedHours: 7,
      majorTopics: [
        {
          name: "Distance Formula & Applications",
          subtopics: [
            "Distance between P(x1,y1) and Q(x2,y2): d = √((x2-x1)² + (y2-y1)²)",
            "Distance from origin O(0,0) to P(x,y): d = √(x² + y²)",
            "Collinearity of three points & geometric shape verification (square, rhombus, right triangle)",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: 4,
          formulasCount: 2,
        },
        {
          name: "Section Formula, Midpoint & Centroid",
          subtopics: [
            "Internal division ratio m1:m2: P(x,y) = ((m1 x2 + m2 x1)/(m1+m2), (m1 y2 + m2 y1)/(m1+m2))",
            "Midpoint formula: M = ((x1+x2)/2, (y1+y2)/2)",
            "Finding ratio k:1 when division point lies on x-axis (y=0) or y-axis (x=0)",
            "Centroid of triangle: G = ((x1+x2+x3)/3, (y1+y2+y3)/3)",
          ],
          timeMinutes: 70,
          importance: 10,
          difficulty: 6,
          formulasCount: 3,
        },
      ],
      formulas: [
        {
          name: "Distance Formula",
          formula: "d = √((x2 - x1)² + (y2 - y1)²)",
          whenToUse: "Finding distance between any two coordinates or checking collinearity",
          commonMistakes: ["Minus sign errors inside brackets e.g. (x2 - (-x1)) = (x2 + x1)"],
        },
        {
          name: "Section Formula (Internal Division)",
          formula: "x = (m1 x2 + m2 x1) / (m1 + m2)  |  y = (m1 y2 + m2 y1) / (m1 + m2)",
          whenToUse: "Finding coordinates of point dividing line segment in ratio m1:m2",
          commonMistakes: ["Cross-multiplying wrong ratio parts (m1 goes with x2, m2 goes with x1)"],
        },
        {
          name: "Midpoint Formula",
          formula: "x = (x1 + x2) / 2  |  y = (y1 + y2) / 2",
          whenToUse: "Finding center of circle or diagonal midpoint of parallelogram",
          commonMistakes: ["Subtracting instead of adding coordinates"],
        },
      ],
      revisionPoints: [
        "Point on x-axis has coordinates (x, 0); Point on y-axis has coordinates (0, y)",
        "When finding unknown division ratio, always assume ratio k : 1",
        "Diagonals of a parallelogram bisect each other (Midpoint of AC = Midpoint of BD)",
      ],
      selfTestQuestions: [
        `Find a point on the x-axis which is equidistant from (2, -5) and (-2, 9)`,
        `Find the ratio in which the line segment joining A(1, -5) and B(-4, 5) is divided by the x-axis`,
      ],
    };
  }

  // --- 7. TRIGONOMETRY & HEIGHTS AND DISTANCES ---
  if (
    titleLower.includes("trig") ||
    titleLower.includes("height") ||
    titleLower.includes("distance")
  ) {
    return {
      name: chapterName,
      difficulty: 8,
      expectedHours: 10,
      majorTopics: [
        {
          name: "Trigonometric Ratios & Standard Angle Table",
          subtopics: [
            "Right triangle ratios: sinθ = P/H, cosθ = B/H, tanθ = P/B",
            "Values of 0°, 30°, 45°, 60°, 90° for sin, cos, tan",
            "Reciprocal relations: cosecθ = 1/sinθ, secθ = 1/cosθ, cotθ = 1/tanθ",
          ],
          timeMinutes: 60,
          importance: 10,
          difficulty: 5,
          formulasCount: 4,
        },
        {
          name: "Trigonometric Identities & Proofs",
          subtopics: [
            "Identity 1: sin²θ + cos²θ = 1",
            "Identity 2: 1 + tan²θ = sec²θ  (sec²θ - tan²θ = 1)",
            "Identity 3: 1 + cot²θ = cosec²θ  (cosec²θ - cot²θ = 1)",
            "Line-by-line identity proofs converting LHS to sin and cos",
          ],
          timeMinutes: 100,
          importance: 10,
          difficulty: 8,
          formulasCount: 3,
        },
        {
          name: "Applications: Heights & Distances",
          subtopics: [
            "Angle of elevation (looking up) vs Angle of depression (looking down)",
            "Single triangle problems & double right-triangle tower/building problems",
            "Calculating tower heights, river widths & shadow lengths using tanθ",
          ],
          timeMinutes: 80,
          importance: 10,
          difficulty: 7,
          formulasCount: 1,
        },
      ],
      formulas: [
        {
          name: "Primary Trigonometric Identity",
          formula: "sin²θ + cos²θ = 1",
          whenToUse: "Converting between sinθ and cosθ or simplifying identity proofs",
          commonMistakes: ["Writing sin²θ + cos²θ = 2 or confusing with sinθ + cosθ = 1"],
        },
        {
          name: "Secant-Tangent Identity",
          formula: "1 + tan²θ = sec²θ  (or sec²θ - tan²θ = 1)",
          whenToUse: "Simplifying secθ and tanθ expressions",
          commonMistakes: ["Mixing up sec²θ - tan²θ = 1 with tan²θ - sec²θ = 1"],
        },
        {
          name: "Cosecant-Cotangent Identity",
          formula: "1 + cot²θ = cosec²θ  (or cosec²θ - cot²θ = 1)",
          whenToUse: "Simplifying cosecθ and cotθ terms",
          commonMistakes: ["Transposition sign errors"],
        },
      ],
      revisionPoints: [
        "In identity proofs: when stuck, express every term in terms of sin θ and cos θ",
        "Angle of elevation equals angle of depression (alternate interior angles)",
        "Table value trick: sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, tan 30° = 1/√3, tan 60° = √3",
      ],
      selfTestQuestions: [
        `Prove that (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A`,
        `A 1.5 m tall boy stands at some distance from a 30 m building. Angle of elevation increases from 30° to 60° as he walks towards it. Find distance walked`,
      ],
    };
  }

  // --- 8. TRIANGLES, CIRCLES & GEOMETRY ---
  if (
    titleLower.includes("triangle") ||
    titleLower.includes("circle") ||
    titleLower.includes("tangent") ||
    titleLower.includes("geometry") ||
    titleLower.includes("quadrilateral")
  ) {
    return {
      name: chapterName,
      difficulty: 7,
      expectedHours: 9,
      majorTopics: [
        {
          name: "Core Theorems & Proofs (Thales / BPT & Tangent Theorems)",
          subtopics: [
            "Basic Proportionality Theorem (BPT / Thales Theorem): DE || BC ⇒ AD/DB = AE/EC",
            "Tangent theorem 1: Tangent is perpendicular to radius at point of contact (OP ⊥ AB)",
            "Tangent theorem 2: Tangents drawn from external point are equal in length (PA = PB)",
          ],
          timeMinutes: 80,
          importance: 10,
          difficulty: 7,
          formulasCount: 2,
        },
        {
          name: "Similarity Criteria & Area Ratios",
          subtopics: [
            "AAA, SSS, and SAS similarity rules for triangles",
            "Area ratio theorem: Area(ΔABC)/Area(ΔDEF) = (AB/DE)²",
            "Pythagoras Theorem: In right triangle, Hypotenuse² = Base² + Perpendicular²",
          ],
          timeMinutes: 70,
          importance: 9,
          difficulty: 7,
          formulasCount: 2,
        },
      ],
      formulas: [
        {
          name: "Basic Proportionality Theorem (BPT)",
          formula: "If DE || BC in ΔABC, then AD / DB = AE / EC",
          whenToUse: "Finding missing side lengths when a parallel line is drawn in a triangle",
          commonMistakes: ["Confusing AD/DB = AE/EC with AD/AB = DE/BC"],
        },
        {
          name: "Equal External Tangents Theorem",
          formula: "PA = PB  (where P is an external point and A, B are points of contact)",
          whenToUse: "Solving circle perimeter and side-length calculation problems",
          commonMistakes: ["Assuming tangents are perpendicular to each other unless explicitly proven"],
        },
      ],
      revisionPoints: [
        "Angle between two tangents drawn from an external point is supplementary to angle subtended by line segment joining points of contact at center",
        "BPT Converse: If a line divides two sides proportionally, it is parallel to third side",
      ],
      selfTestQuestions: [
        `Prove that the lengths of tangents drawn from an external point to a circle are equal`,
        `In ΔABC, DE || BC such that AD = x, DB = x - 2, AE = x + 2, and EC = x - 1. Find x`,
      ],
    };
  }

  // --- 9. SURFACE AREAS AND VOLUMES & MENSURATION ---
  if (
    titleLower.includes("surface area") ||
    titleLower.includes("volume") ||
    titleLower.includes("mensuration") ||
    titleLower.includes("perimeter") ||
    titleLower.includes("area")
  ) {
    return {
      name: chapterName,
      difficulty: 7,
      expectedHours: 9,
      majorTopics: [
        {
          name: "Surface Areas of Combined 3D Solids",
          subtopics: [
            "Combinations of cube, hemisphere, cylinder & cone (e.g., circus tent, capsule, toy)",
            "Curved Surface Area (CSA) vs Total Surface Area (TSA)",
            "Slant height of cone: l = √(r² + h²)",
          ],
          timeMinutes: 75,
          importance: 10,
          difficulty: 7,
          formulasCount: 4,
        },
        {
          name: "Volume of Combined Solids & Shape Conversion",
          subtopics: [
            "Volume of combined shapes (adding individual volumes)",
            "Melting and metallic recasting: Volume before = Volume after",
            "Water flow through cylindrical pipes into reservoirs (Rate = Area × Speed)",
          ],
          timeMinutes: 85,
          importance: 10,
          difficulty: 7,
          formulasCount: 4,
        },
      ],
      formulas: [
        {
          name: "Cylinder Formulas",
          formula: "Volume = πr²h  |  CSA = 2πrh  |  TSA = 2πr(h + r)",
          whenToUse: "Calculating volume, outer area, or total area of cylindrical objects",
          commonMistakes: ["Using diameter instead of radius", "Confusing CSA with TSA"],
        },
        {
          name: "Cone Formulas",
          formula: "Volume = (1/3)πr²h  |  Slant Height l = √(r² + h²)  |  CSA = πrl",
          whenToUse: "Calculating conical tent area or ice cream cone volume",
          commonMistakes: ["Using height h instead of slant height l in CSA = πrl"],
        },
        {
          name: "Sphere & Hemisphere Formulas",
          formula: "Sphere Volume = (4/3)πr³  |  Sphere Area = 4πr²  |  Hemisphere TSA = 3πr²",
          whenToUse: "Calculating spherical or hemispherical bowl dimensions",
          commonMistakes: ["Using 2πr² for hemisphere TSA instead of 3πr² (includes flat base)"],
        },
      ],
      revisionPoints: [
        "When two solids are joined (e.g. hemisphere on cylinder), TSA = CSA of hemisphere + CSA of cylinder (flat touching faces are hidden!)",
        "When a solid is melted and recast into another shape, VOLUME REMAINS CONSTANT",
      ],
      selfTestQuestions: [
        `A toy is in the form of a cone of radius 3.5 cm mounted on a hemisphere of same radius. Total height of toy is 15.5 cm. Find total surface area`,
        `Water in a canal, 6 m wide and 1.5 m deep, flows with a speed of 10 km/h. How much area will it irrigate in 30 minutes if 8 cm standing water is needed?`,
      ],
    };
  }

  // --- 10. STATISTICS & PROBABILITY ---
  if (
    titleLower.includes("statistic") ||
    titleLower.includes("probab") ||
    titleLower.includes("data handling")
  ) {
    return {
      name: chapterName,
      difficulty: 6,
      expectedHours: 7,
      majorTopics: [
        {
          name: "Mean, Mode & Median of Grouped Data",
          subtopics: [
            "Mean methods: Direct method (Σfi xi / Σfi) & Assumed Mean method",
            "Mode formula: Mode = l + [(f1 - f0)/(2f1 - f0 - f2)] × h",
            "Median formula: Median = l + [(n/2 - cf)/f] × h",
            "Empirical relationship: 3 Median = Mode + 2 Mean",
          ],
          timeMinutes: 80,
          importance: 10,
          difficulty: 6,
          formulasCount: 4,
        },
        {
          name: "Probability Calculations & Card/Dice Problems",
          subtopics: [
            "Theoretical probability: P(E) = n(E) / n(S)",
            "Complementary events: P(E) + P(not E) = 1 | 0 ≤ P(E) ≤ 1",
            "52-card deck breakdown (suits, face cards), 2 dice outcomes (36 outcomes), 3 coin tosses",
          ],
          timeMinutes: 60,
          importance: 9,
          difficulty: 4,
          formulasCount: 2,
        },
      ],
      formulas: [
        {
          name: "Empirical Relationship",
          formula: "3 × Median = Mode + 2 × Mean",
          whenToUse: "Finding one measure of central tendency when the other two are given",
          commonMistakes: ["Mixing up coefficients e.g. 2 Median = Mode + 3 Mean"],
        },
        {
          name: "Mode of Grouped Data",
          formula: "Mode = l + [(f1 - f0) / (2f1 - f0 - f2)] × h",
          whenToUse: "Calculating modal value from frequency distribution table",
          commonMistakes: ["Identifying wrong modal class (must be class with highest frequency f1)"],
        },
        {
          name: "Probability Formula",
          formula: "P(E) = Number of favorable outcomes / Total possible outcomes",
          whenToUse: "Calculating probability for cards, coins, dice, or marble selection",
          commonMistakes: ["Forgetting that total face cards in deck = 12 (4 Kings, 4 Queens, 4 Jacks)"],
        },
      ],
      revisionPoints: [
        "Modal class = class interval with MAXIMUM frequency f1",
        "Median class = class interval where cumulative frequency cf exceeds n/2",
        "Probability value MUST ALWAYS lie between 0 and 1 inclusive (0 ≤ P(E) ≤ 1)",
      ],
      selfTestQuestions: [
        `The median of the distribution is 28.5. Find missing frequencies x and y if total frequency is 60`,
        `A box contains 90 discs numbered 1 to 90. If one disc is drawn at random, find probability that it bears a two-digit number`,
      ],
    };
  }

  // --- 11. GENERAL MATHEMATICS ---
  if (
    titleLower.includes("math") ||
    titleLower.includes("algeb") ||
    titleLower.includes("calcul") ||
    titleLower.includes("vector") ||
    titleLower.includes("matrix") ||
    titleLower.includes("determinant")
  ) {
    return {
      name: chapterName,
      difficulty: baseDifficulty + 1,
      expectedHours: 10,
      majorTopics: [
        {
          name: `Core Mathematical Formulas & Algebraic Properties of ${chapterName}`,
          subtopics: [
            `Defining fundamental algebraic variables & domain boundaries of ${chapterName}`,
            "Step-by-step substitution, expansion & simplification techniques",
            "Checking dimensional & boundary constraints for validity",
          ],
          timeMinutes: 60,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 3,
        },
        {
          name: `Step-by-Step Exercise & Problem Solving Patterns`,
          subtopics: [
            "10 standard exercise question variations",
            "Avoiding algebraic sign & division-by-zero errors",
            "Verifying final numerical solutions by back-substitution",
          ],
          timeMinutes: 80,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 2,
        },
      ],
      formulas: [
        {
          name: `${chapterName} Primary Governing Formula`,
          formula: `Core Equation for ${chapterName}`,
          whenToUse: "Applying directly in standard exercise problem solving",
          commonMistakes: ["Sign errors during algebraic simplification", "Applying formula outside valid domain"],
        },
      ],
      revisionPoints: [
        "Always verify final algebraic answers by back-substituting numbers",
        "Write out every intermediate step clearly for full step-marking",
      ],
      selfTestQuestions: [
        `Solve 5 standard ${terms.questionsPlural} on ${chapterName}`,
        `Derive the core formula/theorem for ${chapterName} line-by-line without checking notes`,
      ],
    };
  }

  // --- 12. PHYSICS / LIGHT / ELECTRICITY / MOTION / FORCE ---
  if (
    titleLower.includes("physics") ||
    titleLower.includes("light") ||
    titleLower.includes("electric") ||
    titleLower.includes("motion") ||
    titleLower.includes("force") ||
    titleLower.includes("optic") ||
    titleLower.includes("magnet") ||
    titleLower.includes("gravity") ||
    titleLower.includes("sound") ||
    titleLower.includes("heat") ||
    titleLower.includes("thermo")
  ) {
    const isLight = titleLower.includes("light") || titleLower.includes("optic") || titleLower.includes("refraction") || titleLower.includes("reflection");
    const isElectricity = titleLower.includes("electric") || titleLower.includes("current") || titleLower.includes("circuit");
    const isMotion = titleLower.includes("motion") || titleLower.includes("force") || titleLower.includes("gravit");

    return {
      name: chapterName,
      difficulty: baseDifficulty,
      expectedHours: 10,
      majorTopics: [
        {
          name: `Fundamental Laws & Governing Principles of ${chapterName}`,
          subtopics: [
            "Core physical definitions, SI units & vector conventions",
            "Ray tracing / circuit schematic / free body diagram rules",
            "Deriving step-by-step governing relations",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: baseDifficulty - 1,
          formulasCount: 2,
        },
        {
          name: `High-Yield Numerical Problem Solving & Formula Applications`,
          subtopics: [
            `Solving 8 numerical questions from ${terms.paperType} line-by-line`,
            "Converting units (cm to m, mA to A, km/h to m/s)",
            "Avoiding common sign convention & algebraic traps",
          ],
          timeMinutes: 75,
          importance: 10,
          difficulty: baseDifficulty + 1,
          formulasCount: 3,
        },
      ],
      formulas: isLight
        ? [
            {
              name: "Mirror Formula",
              formula: "1/f = 1/v + 1/u  |  Magnification m = -v/u",
              whenToUse: "Calculating image position v or focal length f for spherical mirrors",
              commonMistakes: ["Forgetting that u is ALWAYS negative", "Focal length f is negative for concave, positive for convex"],
            },
            {
              name: "Lens Formula & Power",
              formula: "1/f = 1/v - 1/u  |  Power P = 1 / f(m) in Dioptres",
              whenToUse: "Calculating lens image position or power of combination P = P1 + P2",
              commonMistakes: ["Substituting f in cm into P = 1/f without converting to meters"],
            },
          ]
        : isElectricity
        ? [
            {
              name: "Ohm's Law & Resistance",
              formula: "V = I × R  |  R = ρ × L / A",
              whenToUse: "Finding voltage V, current I, resistance R or resistivity ρ",
              commonMistakes: ["Confusing series (R1+R2) and parallel (1/R1 + 1/R2) total resistance rules"],
            },
            {
              name: "Electrical Power & Heat Energy",
              formula: "P = V × I = I²R = V²/R  |  Heat H = I²R t",
              whenToUse: "Calculating electrical energy consumption or heat produced in circuit",
              commonMistakes: ["Using incorrect power formula for given series vs parallel configuration"],
            },
          ]
        : isMotion
        ? [
            {
              name: "Equations of Motion",
              formula: "v = u + at  |  s = ut + ½at²  |  v² - u² = 2as",
              whenToUse: "Solving uniformly accelerated motion problems",
              commonMistakes: ["Forgetting negative sign for deceleration/retardation (-a)"],
            },
            {
              name: "Newton's Second Law & Momentum",
              formula: "F = m × a  |  p = m × v",
              whenToUse: "Calculating force, mass, acceleration or momentum changes",
              commonMistakes: ["Not converting mass from grams to kilograms"],
            },
          ]
        : [
            {
              name: `${chapterName} Governing Physics Equation`,
              formula: "Primary Physical Relation (SI Units)",
              whenToUse: `Calculating target physical quantities in ${terms.examType} numerical questions`,
              commonMistakes: ["Forgetting SI unit conversions before calculation"],
            },
          ],
      revisionPoints: [
        "Always write given data with proper SI units first before applying formulas",
        "Draw clear, labeled diagrams (ray diagrams, circuit diagrams, or graphs) for full marks",
      ],
      selfTestQuestions: [
        `Solve 5 numerical questions from ${terms.paperType} on ${chapterName}`,
        `Draw the primary schematic or diagram for ${chapterName} from memory`,
      ],
    };
  }

  // --- 13. CHEMISTRY ---
  if (
    titleLower.includes("chem") ||
    titleLower.includes("acid") ||
    titleLower.includes("base") ||
    titleLower.includes("reaction") ||
    titleLower.includes("metal") ||
    titleLower.includes("carbon") ||
    titleLower.includes("atom") ||
    titleLower.includes("periodic")
  ) {
    const isAcid = titleLower.includes("acid") || titleLower.includes("base") || titleLower.includes("salt");
    const isCarbon = titleLower.includes("carbon") || titleLower.includes("organic");

    return {
      name: chapterName,
      difficulty: baseDifficulty,
      expectedHours: 9,
      majorTopics: [
        {
          name: `Balanced Chemical Equations & Reaction Mechanisms`,
          subtopics: [
            "Writing skeleton equations & balancing atom counts step-by-step",
            "Adding physical state symbols (s, l, g, aq) & reaction conditions",
            "Observing color changes, gas evolution & precipitate formation",
          ],
          timeMinutes: 60,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 1,
        },
        {
          name: `Key Chemical Reactions, Reagents & Industrial Applications`,
          subtopics: [
            "5 primary reaction types: Combination, Decomposition, Displacement, Double Displacement & Redox",
            "Identification of oxidizing agent & reducing agent",
            "Practical activity observation questions from NCERT",
          ],
          timeMinutes: 70,
          importance: 10,
          difficulty: baseDifficulty + 1,
          formulasCount: 1,
        },
      ],
      formulas: isAcid
        ? [
            {
              name: "Neutralization Reaction",
              formula: "Acid + Base → Salt + Water  (e.g., HCl + NaOH → NaCl + H2O)",
              whenToUse: "Writing products of acid-base neutralization reactions",
              commonMistakes: ["Forgetting water as a byproduct"],
            },
            {
              name: "pH Definition",
              formula: "pH = -log10[H+]  |  pH < 7 (Acidic), pH = 7 (Neutral), pH > 7 (Basic)",
              whenToUse: "Converting hydrogen ion concentration to pH scale",
              commonMistakes: ["Confusing pH 1 (strong acid) with pH 6 (weak acid)"],
            },
          ]
        : isCarbon
        ? [
            {
              name: "Esterification & Saponification",
              formula: "CH3COOH + C2H5OH → CH3COOC2H5 + H2O  (Esterification)",
              whenToUse: "Writing organic chemistry reactions of ethanoic acid and ethanol",
              commonMistakes: ["Forgetting concentrated H2SO4 catalyst in esterification"],
            },
          ]
        : [
            {
              name: "Stoichiometry & Mass Conservation",
              formula: "Total Mass of Reactants = Total Mass of Products",
              whenToUse: "Balancing chemical equations and quantitative mole calculations",
              commonMistakes: ["Changing subscript numbers instead of adding coefficients while balancing"],
            },
          ],
      revisionPoints: [
        "Always write balanced chemical equations with state symbols (s, l, g, aq) in written answers",
        "Memorize color changes: Blue CuSO4 turns pale green FeSO4 in iron nail displacement reaction",
      ],
      selfTestQuestions: [
        `Balance 5 chemical equations from ${chapterName}`,
        `List 3 key test observations and reagent conditions for ${chapterName}`,
      ],
    };
  }

  // --- 14. BIOLOGY ---
  if (
    titleLower.includes("bio") ||
    titleLower.includes("cell") ||
    titleLower.includes("life") ||
    titleLower.includes("tissue") ||
    titleLower.includes("organ") ||
    titleLower.includes("reproduc") ||
    titleLower.includes("heredity") ||
    titleLower.includes("gene") ||
    titleLower.includes("health") ||
    titleLower.includes("ecosystem")
  ) {
    const isLife = titleLower.includes("life") || titleLower.includes("nutrit") || titleLower.includes("respirat");
    const isHeredity = titleLower.includes("heredity") || titleLower.includes("gene");

    return {
      name: chapterName,
      difficulty: baseDifficulty,
      expectedHours: 8,
      majorTopics: [
        {
          name: `Anatomical Structures & Technical Terminology`,
          subtopics: [
            "Cellular / organ structural components & specialized organelle functions",
            "Key biological terms, definitions & flowchart mechanisms",
            "Drawing neat labeled anatomical diagrams with clear pointers",
          ],
          timeMinutes: 55,
          importance: 10,
          difficulty: baseDifficulty - 1,
          formulasCount: 0,
        },
        {
          name: `Physiological Pathways & 5-Mark Descriptive Responses`,
          subtopics: [
            "Step-by-step biological processes (e.g. Digestion, Circulation, Excretion)",
            "Enzyme involvement, hormone regulation & feedback loops",
            "Comparative tables (e.g., Aerobic vs Anaerobic respiration, Arteries vs Veins)",
          ],
          timeMinutes: 65,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
      ],
      formulas: isLife
        ? [
            {
              name: "Photosynthesis Equation",
              formula: "6CO2 + 6H2O + Sunlight → C6H12O6 + 6O2  (Chlorophyll catalyst)",
              whenToUse: "Explaining autotrophic nutrition in green plants",
              commonMistakes: ["Forgetting sunlight and chlorophyll above reaction arrow"],
            },
            {
              name: "Respiration Equations",
              formula: "Aerobic: C6H12O6 + 6O2 → 6CO2 + 6H2O + 38 ATP  |  Anaerobic: Glucose → Lactic Acid + 2 ATP",
              whenToUse: "Comparing aerobic and anaerobic energy production pathways",
              commonMistakes: ["Confusing yeast fermentation products (ethanol + CO2) with muscle fatigue (lactic acid)"],
            },
          ]
        : isHeredity
        ? [
            {
              name: "Mendelian Cross Ratios",
              formula: "Monohybrid Phenotypic Ratio = 3 : 1  |  Dihybrid Phenotypic Ratio = 9 : 3 : 3 : 1",
              whenToUse: "Predicting offspring inheritance traits in Punnett squares",
              commonMistakes: ["Confusing phenotypic ratio (observable) with genotypic ratio (1:2:1)"],
            },
          ]
        : [],
      revisionPoints: [
        "Draw diagrams using sharp pencil with label pointers aligned neatly on the right side",
        "Use bullet points and bold technical terms in 5-mark long descriptive answers",
      ],
      selfTestQuestions: [
        `Draw and label 2 primary anatomical diagrams for ${chapterName} from memory`,
        `Write a 5-mark detailed explanation for the core physiological process in ${chapterName}`,
      ],
    };
  }

  // --- 15. SOCIAL SCIENCE ---
  if (
    titleLower.includes("social") ||
    titleLower.includes("hist") ||
    titleLower.includes("geog") ||
    titleLower.includes("civic") ||
    titleLower.includes("econ") ||
    titleLower.includes("polity")
  ) {
    return {
      name: chapterName,
      difficulty: baseDifficulty,
      expectedHours: 7,
      majorTopics: [
        {
          name: `Historical Timelines, Causes & Key Events`,
          subtopics: [
            "Chronological sequence of key dates, treaties & revolutions",
            "Socio-economic & political causes behind major historical movements",
            "Key historical figures, leaders & societal impacts",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: baseDifficulty - 1,
          formulasCount: 0,
        },
        {
          name: `Geographical Distributions & Map Work`,
          subtopics: [
            "Identifying geographic locations, climate zones & soil types on maps",
            "Resource distribution, agricultural patterns & industrial belts",
            "Environmental impacts & conservation policies",
          ],
          timeMinutes: 55,
          importance: 9,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
        {
          name: `Civic Structure, Democratic Institutions & Economics`,
          subtopics: [
            "Constitutional articles, fundamental rights & duties",
            "Powers & functions of legislature, executive & judiciary",
            "Economic sectors, GDP, inflation & banking mechanisms",
          ],
          timeMinutes: 60,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
      ],
      formulas: [],
      revisionPoints: [
        "Memorize exact timeline dates & key historical terminology",
        "Practice map marking for rivers, dams, minerals & national parks",
        "Structure 5-mark answers with distinct subheadings and bullet points",
      ],
      selfTestQuestions: [
        `List 5 key causes and consequences of the major event in ${chapterName}`,
        `Explain the democratic / economic framework discussed in ${chapterName}`,
      ],
    };
  }

  // --- 16. ENGLISH LITERATURE & GRAMMAR ---
  if (
    titleLower.includes("english") ||
    titleLower.includes("lit") ||
    titleLower.includes("prose") ||
    titleLower.includes("poetry") ||
    titleLower.includes("grammar") ||
    titleLower.includes("writing")
  ) {
    return {
      name: chapterName,
      difficulty: baseDifficulty - 1,
      expectedHours: 6,
      majorTopics: [
        {
          name: `Theme, Plot Analysis & Character Sketches`,
          subtopics: [
            "Central theme, message & moral lesson of the story/poem",
            "In-depth character motivations, traits & relationships",
            "Key quotes, context-based line references & poetic devices",
          ],
          timeMinutes: 45,
          importance: 10,
          difficulty: baseDifficulty - 1,
          formulasCount: 0,
        },
        {
          name: `Grammar Rules & Technical Error Correction`,
          subtopics: [
            "Tenses, active/passive voice & reported speech transformations",
            "Subject-verb agreement & prepositions accuracy",
            "Editing, omission & sentence reordering exercises",
          ],
          timeMinutes: 50,
          importance: 9,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
        {
          name: `Creative Writing Formats & Exam Expression`,
          subtopics: [
            "Standard formats for formal letters, analytical paragraphs & reports",
            "High-scoring vocabulary, transition phrases & opening lines",
            "Time management for reading comprehension passages",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
      ],
      formulas: [],
      revisionPoints: [
        "Include exact quotes or character trait keywords in 6-mark answers",
        "Follow strict format guidelines for formal letters & analytical paragraphs",
      ],
      selfTestQuestions: [
        `Write a 100-word character sketch or theme analysis for ${chapterName}`,
        `Solve 5 context-based extract questions from ${chapterName}`,
      ],
    };
  }

  // --- 17. COMPUTER SCIENCE & CODING ---
  if (
    titleLower.includes("comp") ||
    titleLower.includes("code") ||
    titleLower.includes("python") ||
    titleLower.includes("data") ||
    titleLower.includes("network") ||
    titleLower.includes("sql")
  ) {
    return {
      name: chapterName,
      difficulty: baseDifficulty + 1,
      expectedHours: 8,
      majorTopics: [
        {
          name: `Syntax Rules, Keywords & Data Structures`,
          subtopics: [
            "Variable scopes, mutability & reserved keywords",
            "Lists, tuples, dictionaries & string manipulation functions",
            "Conditional logic, loops & error handling syntax",
          ],
          timeMinutes: 50,
          importance: 10,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
        {
          name: `Code Tracing, Output Prediction & Error Fixing`,
          subtopics: [
            "Dry-running loops & tracking variable state step-by-step",
            "Identifying syntax, runtime & logical errors in code snippets",
            "Predicting exact console output for tricky code blocks",
          ],
          timeMinutes: 65,
          importance: 10,
          difficulty: baseDifficulty + 1,
          formulasCount: 0,
        },
        {
          name: `SQL Queries, Networking & System Architecture`,
          subtopics: [
            "Writing SELECT, WHERE, GROUP BY, HAVING & JOIN queries",
            "Network topologies, OSI/TCP layers & IP protocols",
            "Cyber safety, data privacy & licensing rules",
          ],
          timeMinutes: 55,
          importance: 9,
          difficulty: baseDifficulty,
          formulasCount: 0,
        },
      ],
      formulas: [
        {
          name: "Standard SQL Query Structure",
          formula: "SELECT cols FROM table WHERE cond GROUP BY col HAVING cond ORDER BY col;",
          whenToUse: "Database query writing in exam questions",
          commonMistakes: ["Confusing WHERE and HAVING clauses", "Missing semicolons or quotes"],
        },
      ],
      revisionPoints: [
        "Check indentation and syntax carefully when writing code on paper",
        "Track variable values in a dry-run table for trace questions",
      ],
      selfTestQuestions: [
        `Write a complete code block or SQL query to solve the core problem in ${chapterName}`,
        `Trace and predict the exact console output for 3 sample code snippets in ${chapterName}`,
      ],
    };
  }

  // General default for any subject / custom topic name
  return {
    name: chapterName,
    difficulty: baseDifficulty,
    expectedHours: 8,
    majorTopics: [
      {
        name: `Core Foundations & Key Definitions of ${chapterName}`,
        subtopics: [
          `Master fundamental definitions & terminology of ${chapterName}`,
          `Understand key principles & theoretical background`,
          `Identify primary exam focus areas & high-yield concepts`,
        ],
        timeMinutes: 45,
        importance: 10,
        difficulty: baseDifficulty - 1,
        formulasCount: 1,
      },
      {
        name: `Detailed Analysis & Problem Applications`,
        subtopics: [
          `Step-by-step analysis of core case studies/examples`,
          `Solving standard textbook exercises and past exam questions`,
          `Analyzing relationships between sub-concepts`,
        ],
        timeMinutes: 65,
        importance: 10,
        difficulty: baseDifficulty,
        formulasCount: 1,
      },
      {
        name: `Exam-Style High-Yield Practice & Review`,
        subtopics: [
          `8 practice questions from ${terms.paperType} on ${chapterName}`,
          `Common student error traps & key keyword emphasis`,
          `Summary mind mapping and active recall drilling`,
        ],
        timeMinutes: 50,
        importance: 9,
        difficulty: baseDifficulty + 1,
        formulasCount: 0,
      },
    ],
    formulas: [],
    revisionPoints: [
      `Review key definitions & bullet points for ${chapterName}`,
      `Test yourself without checking notes to verify long-term memory retention`,
    ],
    selfTestQuestions: [
      `Explain the core principles of ${chapterName} in your own words`,
      `Solve 5 standard ${terms.questionsPlural} on ${chapterName}`,
    ],
  };
}
