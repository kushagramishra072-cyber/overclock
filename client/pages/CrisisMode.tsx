import { useState, useMemo, useEffect } from "react";
import { useExamsStore } from "@/hooks/useExamsStore";
import { useEnhancedStudyPlanner } from "@/hooks/useEnhancedStudyPlanner";
import { useResourceFetcher } from "@/hooks/useResourceFetcher";
import { useCrisisStore } from "@/hooks/useCrisisStore";
import { useSyllabusDatabase } from "@/hooks/useSyllabusDatabase";
import { useDetailedStudyPlanner, generateRealisticChapterContent } from "@/hooks/useDetailedStudyPlanner";
import { useChapterContentDatabase } from "@/hooks/useChapterContentDatabase";
import { useXPSystem } from "@/hooks/useXPSystem";
import HomeButton from "@/components/HomeButton";
import FloatingModal from "@/components/FloatingModal";
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  Lock,
  BookOpen,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Filter,
  Search,
  Target,
  Clock,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { EXAM_COLORS, ExamColor } from "@shared/api";

export default function CrisisMode() {
  const { exams, addExam } = useExamsStore();
  const { generateDetailedPlan } = useEnhancedStudyPlanner();
  const { searchResources } = useResourceFetcher();
  const { createEmergencyPlan, toggleFocusMode, getActivePlan, getMetrics } =
    useCrisisStore();
  const {
    getBoards,
    getClasses,
    getSubjects,
    getChapters,
    searchChapters,
  } = useSyllabusDatabase();
  const { generatePlan: generateDetailedStudyPlan } = useDetailedStudyPlanner();
  const { getChapterContent } = useChapterContentDatabase();
  const { addXP } = useXPSystem();

  const [expandedChapterGuide, setExpandedChapterGuide] = useState<string | null>(null);
  const [copiedFormulaText, setCopiedFormulaText] = useState<string | null>(null);

  // 3 AM Mode & Enhanced Navigation
  const [mainTab, setMainTab] = useState<"guide" | "tasks" | "flashcards">("guide");
  const [guideSearchQuery, setGuideSearchQuery] = useState("");
  const [guideCategoryFilter, setGuideCategoryFilter] = useState<"all" | "formulas" | "pitfalls" | "mustknow" | "flashcards">("all");
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<string, boolean>>({});
  const [copiedChapterCheatSheet, setCopiedChapterCheatSheet] = useState<string | null>(null);
  const [isCompactTaskView, setIsCompactTaskView] = useState(true);
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [detailedPlan, setDetailedPlan] = useState<any>(null);
  const [fetchedResources, setFetchedResources] = useState<any>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [planError, setPlanError] = useState("");
  const [chapterSearchInput, setChapterSearchInput] = useState("");
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  // Checkpoint & Task completion tracking
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // Filtering & Tab states
  const [selectedDayTab, setSelectedDayTab] = useState<number | "all">("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState<"all" | "study" | "practice" | "revision">("all");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  // Live Focus Session
  const [activeFocusTask, setActiveFocusTask] = useState<any | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const [planForm, setPlanForm] = useState({
    examId: "",
    totalHours: 12,
  });

  const [newExamForm, setNewExamForm] = useState({
    subject: "",
    examDate: "",
    examTime: "",
    color: "blue" as ExamColor,
    syllabus: "",
  });

  const [syllabusForm, setSyllabusForm] = useState({
    board: "cbse",
    classGrade: "10th",
    subject: "",
    selectedChapters: [] as string[],
    currentGrade: 60,
    studyHoursPerDay: 3,
    examDate: "",
  });

  // Focus timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (activeFocusTask) {
        addXP(25, `Completed Focus Session: ${activeFocusTask.title}`);
        setCompletedTasks((prev) => ({ ...prev, [activeFocusTask.id]: true }));
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, activeFocusTask]);

  const toggleCheckpoint = (id: string, taskTitle?: string) => {
    setCompletedCheckpoints((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        addXP(5, taskTitle ? `Verified checkpoint: ${taskTitle}` : "Completed checkpoint target");
      }
      return { ...prev, [id]: nextState };
    });
  };

  const toggleTaskCompleted = (taskId: string, title: string) => {
    setCompletedTasks((prev) => {
      const nextState = !prev[taskId];
      if (nextState) {
        addXP(20, `Ticked target: ${title}`);
      }
      return { ...prev, [taskId]: nextState };
    });
  };

  const startFocusTimerForTask = (task: any) => {
    setActiveFocusTask(task);
    setTimerSeconds((task.durationMinutes || 25) * 60);
    setIsTimerRunning(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate dynamic dropdowns based on selections
  const availableBoards = getBoards();
  const availableClasses = useMemo(
    () => getClasses(syllabusForm.board),
    [syllabusForm.board]
  );
  const availableSubjects = useMemo(
    () => getSubjects(syllabusForm.board, syllabusForm.classGrade),
    [syllabusForm.board, syllabusForm.classGrade]
  );
  const availableChapters = useMemo(
    () => getChapters(syllabusForm.board, syllabusForm.classGrade, syllabusForm.subject),
    [syllabusForm.board, syllabusForm.classGrade, syllabusForm.subject]
  );
  const filteredChapters = useMemo(
    () =>
      chapterSearchInput.trim()
        ? searchChapters(
            syllabusForm.board,
            syllabusForm.classGrade,
            syllabusForm.subject,
            chapterSearchInput
          )
        : availableChapters,
    [chapterSearchInput, availableChapters]
  );

  const metrics = getMetrics();
  const activePlan = getActivePlan();

  const upcomingExams = exams
    .filter((e) => new Date(e.examDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );

  const handleCreateNewExam = () => {
    if (!newExamForm.subject || !newExamForm.examDate) return;

    addExam(
      newExamForm.subject,
      new Date(newExamForm.examDate),
      newExamForm.color,
      newExamForm.examTime,
      [],
      newExamForm.syllabus
    );

    setNewExamForm({
      subject: "",
      examDate: "",
      examTime: "",
      color: "blue",
      syllabus: "",
    });
    setIsNewExamModalOpen(false);
  };

  const handleGeneratePlan = async () => {
    const activeSubject = isCustomSubject ? customSubjectInput.trim() : syllabusForm.subject;
    if (!activeSubject || syllabusForm.selectedChapters.length === 0 || !syllabusForm.examDate) {
      return;
    }

    setPlanError("");
    setIsLoadingResources(true);

    try {
      const daysUntilExam = Math.max(
        1,
        Math.ceil(
          (new Date(syllabusForm.examDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const totalAvailableHours = Math.max(1, daysUntilExam) * (syllabusForm.studyHoursPerDay || 3);

      const chapterInputs = syllabusForm.selectedChapters.map((chName) => ({
        name: chName,
        confidence: syllabusForm.currentGrade,
      }));

      const detailedStudyPlan = generateDetailedStudyPlan(
        syllabusForm.board,
        syllabusForm.classGrade,
        chapterInputs,
        syllabusForm.examDate,
        totalAvailableHours,
        syllabusForm.currentGrade,
        activeSubject
      );

      setDetailedPlan(detailedStudyPlan);
      setIsLoadingResources(false);
      setIsNewPlanModalOpen(false);

      // Background resource search
      try {
        const resources = await searchResources({
          grade: syllabusForm.classGrade,
          board: syllabusForm.board,
          subject: activeSubject,
          chapters: syllabusForm.selectedChapters,
        });
        setFetchedResources(resources);
      } catch (resErr) {
        console.warn("Resource search skipped or failed", resErr);
      }

      // Save plan in emergency store
      createEmergencyPlan(
        syllabusForm.examDate,
        activeSubject,
        totalAvailableHours,
        syllabusForm.selectedChapters
      );

      // Reset
      setCustomSubjectInput("");
      setIsCustomSubject(false);
    } catch (error: any) {
      setPlanError(error.message || "An error occurred while generating the study plan.");
      setDetailedPlan(null);
      setIsLoadingResources(false);
    }
  };

  const handleAddChapter = (chapter: string) => {
    if (!syllabusForm.selectedChapters.includes(chapter)) {
      setSyllabusForm({
        ...syllabusForm,
        selectedChapters: [...syllabusForm.selectedChapters, chapter],
      });
    }
    setChapterSearchInput("");
    setShowChapterDropdown(false);
  };

  const handleRemoveChapter = (chapter: string) => {
    setSyllabusForm({
      ...syllabusForm,
      selectedChapters: syllabusForm.selectedChapters.filter((ch) => ch !== chapter),
    });
  };

  const allTasks = useMemo(() => {
    if (!detailedPlan?.days) return [];
    return detailedPlan.days.flatMap((d: any) => d.tasks);
  }, [detailedPlan]);

  const totalTasksCount = allTasks.length;
  const completedTasksCount = useMemo(() => {
    return allTasks.filter((t: any) => !!completedTasks[t.id]).length;
  }, [allTasks, completedTasks]);

  const totalCheckpointsCount = useMemo(() => {
    return allTasks.reduce((acc: number, t: any) => acc + (t.checkpointItems?.length || 0), 0);
  }, [allTasks]);

  const activeChaptersGuideData = useMemo(() => {
    if (!detailedPlan?.days) return [];
    const chapterNames = Array.from(
      new Set(
        detailedPlan.days.flatMap((d: any) => (d.tasks || []).map((t: any) => t.chapter))
      )
    ) as string[];

    return chapterNames
      .map((chapName) => {
        let content = getChapterContent(syllabusForm.board || "cbse", syllabusForm.classGrade || "10th", chapName);
        if (!content) {
          content = generateRealisticChapterContent(
            chapName,
            syllabusForm.classGrade || "10th",
            syllabusForm.subject || customSubjectInput || "Subject"
          );
        }
        return {
          chapterName: chapName,
          content,
        };
      })
      .filter((item) => item && item.content) as Array<{ chapterName: string; content: any }>;
  }, [detailedPlan, syllabusForm.board, syllabusForm.classGrade, syllabusForm.subject, customSubjectInput, getChapterContent]);

  // Auto-expand first chapter when guide data is loaded
  useEffect(() => {
    if (activeChaptersGuideData.length > 0 && !expandedChapterGuide) {
      setExpandedChapterGuide(activeChaptersGuideData[0].chapterName);
    }
  }, [activeChaptersGuideData]);

  // Compiled Flashcard deck for 3 AM Memory Drill
  const allFlashcards = useMemo(() => {
    const list: Array<{ id: string; chapter: string; question: string; answer: string }> = [];
    activeChaptersGuideData.forEach(({ chapterName, content }) => {
      if (content.selfTestQuestions && Array.isArray(content.selfTestQuestions)) {
        content.selfTestQuestions.forEach((q: string, i: number) => {
          list.push({
            id: `${chapterName}-q-${i}`,
            chapter: content.name || chapterName,
            question: q,
            answer: content.formulas?.[i % (content.formulas.length || 1)]
              ? `Key Equation: ${content.formulas[i % content.formulas.length].name} (${content.formulas[i % content.formulas.length].formula}). ${content.formulas[i % content.formulas.length].whenToUse || ''}`
              : (content.revisionPoints?.[i % (content.revisionPoints.length || 1)] || "Focus on core concepts, definitions & step-by-step reasoning."),
          });
        });
      }
      if (content.mustKnowTopics && Array.isArray(content.mustKnowTopics)) {
        content.mustKnowTopics.forEach((topic: string, i: number) => {
          list.push({
            id: `${chapterName}-mk-${i}`,
            chapter: content.name || chapterName,
            question: `Core Concept Checklist: ${topic}`,
            answer: content.revisionPoints?.[i % (content.revisionPoints.length || 1)] || `Essential rule for ${topic}. Verify key assumptions & definitions.`,
          });
        });
      }
    });
    return list;
  }, [activeChaptersGuideData]);

  // Copy complete chapter cheat sheet to clipboard
  const copyChapterCheatSheet = (chapterName: string, content: any) => {
    let text = `=== ⚡ 3 AM CHEAT SHEET: ${content.name || chapterName} ===\n\n`;
    if (content.formulas && content.formulas.length > 0) {
      text += `--- KEY FORMULAS & EQUATIONS ---\n`;
      content.formulas.forEach((f: any) => {
        text += `• ${f.name}: ${f.formula}\n  When to use: ${f.whenToUse || "General application"}\n`;
      });
      text += `\n`;
    }
    if (content.mustKnowTopics && content.mustKnowTopics.length > 0) {
      text += `--- MUST-KNOW CONCEPTS ---\n`;
      content.mustKnowTopics.forEach((t: string) => {
        text += `• ${t}\n`;
      });
      text += `\n`;
    }
    if (content.commonMistakes && content.commonMistakes.length > 0) {
      text += `--- EXAM TRAPS & COMMON PITFALLS ---\n`;
      content.commonMistakes.forEach((m: string) => {
        text += `⚠️ ${m}\n`;
      });
      text += `\n`;
    }
    navigator.clipboard.writeText(text);
    setCopiedChapterCheatSheet(chapterName);
    setTimeout(() => setCopiedChapterCheatSheet(null), 2500);
  };

  const completedCheckpointsCount = useMemo(() => {
    return Object.values(completedCheckpoints).filter(Boolean).length;
  }, [completedCheckpoints]);

  const progressPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-4xl px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Crisis Mode</h1>
            <p className="text-sm text-muted-foreground">
              Emergency exam prep with AI-generated study plans
            </p>
          </div>
          <HomeButton />
        </div>

        {/* Warning Banner */}
        <div className="mb-8 rounded-2xl glass border-status-overdue/50 bg-status-overdue/10 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-status-overdue flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-status-overdue mb-1">
                Use Crisis Mode for Emergency Situations Only
              </h2>
              <p className="text-sm text-foreground/80">
                Upload your syllabus, input study hours, and get an AI-generated study plan.
                Your schedule will adapt based on your exam date and available time.
              </p>
            </div>
          </div>
        </div>

        {/* Active Focus Session Banner */}
        {activeFocusTask && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary/30 via-purple-600/30 to-blue-600/30 border border-primary/50 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ⚡ Live Focus Mode
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{activeFocusTask.chapter}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{activeFocusTask.title}</h3>
                <p className="text-xs text-foreground/80 line-clamp-1">{activeFocusTask.reason}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono text-3xl font-extrabold text-primary tracking-wider">
                    {Math.floor(timerSeconds / 60).toString().padStart(2, "0")}:
                    {(timerSeconds % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-3 rounded-xl bg-primary text-black font-bold hover:opacity-90 transition-all flex items-center justify-center shadow-lg"
                  title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds((activeFocusTask.durationMinutes || 25) * 60);
                  }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-foreground transition-all flex items-center justify-center"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    toggleTaskCompleted(activeFocusTask.id, activeFocusTask.title);
                    setActiveFocusTask(null);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Study Plan Display */}
        {detailedPlan ? (
          <div className="space-y-6">
            {/* Error message if any */}
            {planError && (
              <div className="p-4 rounded-2xl bg-status-overdue/10 border border-status-overdue/50">
                <p className="text-sm text-status-overdue">{planError}</p>
              </div>
            )}

            {/* Plan Header & Progress Dashboard */}
            <div className="glass p-6 rounded-2xl space-y-6 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
                      Active Plan
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Grade: {syllabusForm.classGrade || "Custom"} • Board: {syllabusForm.board.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {syllabusForm.subject || customSubjectInput || "Custom Subject"}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsNewPlanModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-foreground transition-all flex items-center gap-2 border border-white/10"
                  >
                    <Plus className="w-4 h-4" /> New Plan
                  </button>
                </div>
              </div>

              {/* Progress Bar & Real-time Task Counter */}
              <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Overall Target Progress
                  </span>
                  <span className="font-bold font-mono text-primary">
                    {completedTasksCount} / {totalTasksCount} Tasks ({progressPercentage}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Checkpoints Verified: {completedCheckpointsCount} / {totalCheckpointsCount}</span>
                  <span>Total Workload: {detailedPlan.totalStudyHours} Hours</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase">Risk Level</p>
                  <p className={`text-base font-bold ${
                    detailedPlan.riskLevel === 'EXTREME' ? 'text-rose-400' :
                    detailedPlan.riskLevel === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {detailedPlan.riskLevel}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase">Emergency Mode</p>
                  <p className="text-base font-bold text-foreground">
                    {detailedPlan.emergencyMode ? "⚡ Active" : "Normal"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase">Completion Prob.</p>
                  <p className="text-base font-bold text-primary">{detailedPlan.completionProbability}%</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/40">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase">Scheduled Days</p>
                  <p className="text-base font-bold text-primary">{detailedPlan.days.length} Days</p>
                </div>
              </div>
            </div>

            {/* Warnings if any */}
            {detailedPlan.warnings.length > 0 && (
              <div className="glass p-5 rounded-2xl border-amber-500/30 bg-amber-500/10 text-amber-200">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4" /> Important Execution Warnings
                </h3>
                <ul className="space-y-1 text-xs">
                  {detailedPlan.warnings.map((warning: string, idx: number) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Workspace View Switcher (3 AM Mode) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 glass">
              <button
                onClick={() => setMainTab("guide")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  mainTab === "guide"
                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>⚡ Formula Bank & Guide</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${mainTab === 'guide' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-primary'}`}>
                  {activeChaptersGuideData.length} Ch
                </span>
              </button>

              <button
                onClick={() => setMainTab("tasks")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  mainTab === "tasks"
                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>📅 Daily Study Plan</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${mainTab === 'tasks' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-primary'}`}>
                  {allTasks.length} Tasks
                </span>
              </button>

              <button
                onClick={() => setMainTab("flashcards")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  mainTab === "flashcards"
                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Target className="w-4 h-4" />
                <span>🧠 3 AM Memory Drill</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${mainTab === 'flashcards' ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-primary'}`}>
                  {allFlashcards.length} Cards
                </span>
              </button>
            </div>

            {/* VIEW TAB 1: QUICK FORMULA BANK & STUDY GUIDE */}
            {mainTab === "guide" && (
              <div className="glass p-6 rounded-2xl border border-primary/30 space-y-5 bg-gradient-to-b from-primary/5 to-transparent">
                {/* Header & Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary text-black font-extrabold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        Quick Formula Bank & Chapter Study Guide
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        3 AM Instant reference: formulas, equations, exam traps & 1-click cheat sheets.
                      </p>
                    </div>
                  </div>

                  {/* Guide Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search formulas or rules..."
                      value={guideSearchQuery}
                      onChange={(e) => setGuideSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Category Quick Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1 mr-1">
                    <Filter className="w-3 h-3" /> Filter:
                  </span>
                  {[
                    { id: "all", label: "All Items" },
                    { id: "formulas", label: "⚡ Formulas & Equations" },
                    { id: "pitfalls", label: "⚠️ Exam Traps" },
                    { id: "mustknow", label: "🎯 Must-Know Theorems" },
                    { id: "flashcards", label: "❓ Memory Flashcards" },
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setGuideCategoryFilter(pill.id as any)}
                      className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium ${
                        guideCategoryFilter === pill.id
                          ? "bg-primary text-black font-bold shadow-sm"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Chapter Accordions */}
                <div className="space-y-4">
                  {activeChaptersGuideData.map(({ chapterName, content }) => {
                    const isExpanded = expandedChapterGuide === chapterName || !!guideSearchQuery;
                    const formulasCount = content.formulas?.length || 0;

                    // Search filtering
                    const searchLower = guideSearchQuery.toLowerCase();
                    const matchingFormulas = (content.formulas || []).filter((f: any) =>
                      !guideSearchQuery ||
                      f.name.toLowerCase().includes(searchLower) ||
                      f.formula.toLowerCase().includes(searchLower) ||
                      (f.whenToUse && f.whenToUse.toLowerCase().includes(searchLower))
                    );
                    const matchingMustKnow = (content.mustKnowTopics || []).filter((t: string) =>
                      !guideSearchQuery || t.toLowerCase().includes(searchLower)
                    );
                    const matchingMistakes = (content.commonMistakes || []).filter((m: string) =>
                      !guideSearchQuery || m.toLowerCase().includes(searchLower)
                    );
                    const matchingQuestions = (content.selfTestQuestions || []).filter((q: string) =>
                      !guideSearchQuery || q.toLowerCase().includes(searchLower)
                    );

                    const showFormulas = (guideCategoryFilter === "all" || guideCategoryFilter === "formulas") && matchingFormulas.length > 0;
                    const showMustKnow = (guideCategoryFilter === "all" || guideCategoryFilter === "mustknow") && matchingMustKnow.length > 0;
                    const showMistakes = (guideCategoryFilter === "all" || guideCategoryFilter === "pitfalls") && matchingMistakes.length > 0;
                    const showQuestions = (guideCategoryFilter === "all" || guideCategoryFilter === "flashcards") && matchingQuestions.length > 0;

                    if (guideSearchQuery && !showFormulas && !showMustKnow && !showMistakes && !showQuestions) {
                      return null;
                    }

                    return (
                      <div
                        key={chapterName}
                        className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden transition-all"
                      >
                        {/* Chapter Accordion Header */}
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border-b border-white/10">
                          <button
                            onClick={() => setExpandedChapterGuide(isExpanded ? null : chapterName)}
                            className="flex items-center gap-3 text-left flex-1"
                          >
                            <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                {content.name || chapterName}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{content.majorTopics?.length || 0} Topics</span>
                                <span>•</span>
                                <span className="text-primary font-semibold">{formulasCount} Formulas</span>
                                <span>•</span>
                                <span>Weightage: {content.marksWeightage || 6} Marks</span>
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {/* Copy Cheat Sheet Button */}
                            <button
                              onClick={() => copyChapterCheatSheet(chapterName, content)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-primary hover:text-black text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 border border-white/10"
                              title="Copy full chapter formulas & rules to clipboard"
                            >
                              {copiedChapterCheatSheet === chapterName ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Cheat Sheet Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Cheat Sheet</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => setExpandedChapterGuide(isExpanded ? null : chapterName)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Chapter Content Details */}
                        {isExpanded && (
                          <div className="p-5 space-y-5 text-xs">
                            {/* Formulas Grid */}
                            {showFormulas && (
                              <div className="space-y-2">
                                <h5 className="font-bold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" /> Key Formulas & Equations
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {matchingFormulas.map((f: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 relative group hover:border-primary/40 transition-all"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-foreground text-xs">{f.name}</span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(`${f.name}: ${f.formula}`);
                                            setCopiedFormulaText(f.name);
                                            setTimeout(() => setCopiedFormulaText(null), 2000);
                                          }}
                                          className="p-1.5 rounded-lg bg-white/10 hover:bg-primary hover:text-black transition-all text-muted-foreground flex items-center gap-1 text-[10px]"
                                          title="Copy Formula"
                                        >
                                          {copiedFormulaText === f.name ? (
                                            <>
                                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" /> Copy
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <div className="p-2.5 rounded-lg bg-black/60 font-mono text-primary font-bold border border-primary/30 text-sm tracking-wide">
                                        {f.formula}
                                      </div>
                                      {f.whenToUse && (
                                        <p className="text-[11px] text-muted-foreground">
                                          <strong className="text-foreground/80">When to use:</strong> {f.whenToUse}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Revision Points & Must Know */}
                            {showMustKnow && (
                              <div className="space-y-2">
                                <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Core Must-Know Topics & Theorems
                                </h5>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {matchingMustKnow.map((pt: string, idx: number) => (
                                    <li
                                      key={idx}
                                      className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start gap-2"
                                    >
                                      <span className="text-emerald-400 font-bold">•</span>
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Common Mistakes */}
                            {showMistakes && (
                              <div className="space-y-2">
                                <h5 className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Common Exam Pitfalls & Traps
                                </h5>
                                <ul className="space-y-2">
                                  {matchingMistakes.map((m: string, idx: number) => (
                                    <li
                                      key={idx}
                                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-start gap-2.5"
                                    >
                                      <span className="text-rose-400 font-bold text-sm">⚠️</span>
                                      <span>{m}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Self Test Flashcard Questions */}
                            {showQuestions && (
                              <div className="space-y-2">
                                <h5 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5" /> Interactive 3 AM Memory Check
                                </h5>
                                <div className="space-y-2">
                                  {matchingQuestions.map((q: string, idx: number) => {
                                    const cardKey = `${chapterName}-q-${idx}`;
                                    const isRevealed = !!revealedFlashcards[cardKey];
                                    const answerFormula = content.formulas?.[idx % (content.formulas.length || 1)];

                                    return (
                                      <div
                                        key={idx}
                                        className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs space-y-2 transition-all"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <span className="font-semibold flex items-center gap-2">
                                            ❓ {q}
                                          </span>
                                          <button
                                            onClick={() =>
                                              setRevealedFlashcards((prev) => ({
                                                ...prev,
                                                [cardKey]: !prev[cardKey],
                                              }))
                                            }
                                            className="px-2.5 py-1 rounded-lg bg-cyan-400/20 hover:bg-cyan-400 hover:text-black transition-all text-[11px] font-bold text-cyan-300 flex-shrink-0"
                                          >
                                            {isRevealed ? "Hide Answer" : "Reveal Answer"}
                                          </button>
                                        </div>

                                        {isRevealed && (
                                          <div className="pt-2 border-t border-cyan-500/30 text-xs text-foreground bg-black/40 p-3 rounded-lg border border-cyan-500/20 space-y-1">
                                            <p className="font-bold text-cyan-300">💡 Solution & Key Equation:</p>
                                            {answerFormula ? (
                                              <p className="font-mono text-primary font-bold">{answerFormula.name}: {answerFormula.formula}</p>
                                            ) : (
                                              <p className="text-muted-foreground font-mono">
                                                {content.revisionPoints?.[idx % (content.revisionPoints.length || 1)] || "Recall core definition and step-by-step reasoning."}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW TAB 2: DAILY STUDY PLAN & ACTION TASKS */}
            {mainTab === "tasks" && (
              <div className="space-y-4">
                {/* Interactive Day Tabs, Filters & Compact Switcher */}
                <div className="glass p-5 rounded-2xl space-y-4 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Day Selection Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                      <button
                        onClick={() => setSelectedDayTab("all")}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                          selectedDayTab === "all"
                            ? "bg-primary text-black font-bold shadow-md"
                            : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                        }`}
                      >
                        All Days ({allTasks.length})
                      </button>
                      {detailedPlan.days.map((day: any) => (
                        <button
                          key={day.day}
                          onClick={() => setSelectedDayTab(day.day)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                            selectedDayTab === day.day
                              ? "bg-primary text-black font-bold shadow-md"
                              : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                          }`}
                        >
                          Day {day.day} ({day.tasks.length})
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Compact vs Detailed Toggle */}
                      <button
                        onClick={() => setIsCompactTaskView(!isCompactTaskView)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-foreground transition-all flex items-center gap-1.5 border border-white/10 whitespace-nowrap"
                      >
                        {isCompactTaskView ? "📋 Compact View" : "🗂️ Detailed Cards"}
                      </button>

                      {/* Task Search Bar */}
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={taskSearchQuery}
                          onChange={(e) => setTaskSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Task Type Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-white/5 text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1 mr-1">
                      <Filter className="w-3 h-3" /> Type:
                    </span>
                    {[
                      { id: "all", label: "All Tasks" },
                      { id: "study", label: "📚 Concepts" },
                      { id: "practice", label: "📝 Practice" },
                      { id: "revision", label: "🔁 Revision" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setTaskTypeFilter(pill.id as any)}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          taskTypeFilter === pill.id
                            ? "bg-white/20 text-foreground font-semibold border border-white/20"
                            : "text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task List Rendered by Day */}
                <div className="space-y-6">
                  {detailedPlan.days
                    .filter((day: any) => selectedDayTab === "all" || selectedDayTab === day.day)
                    .map((day: any) => {
                      const filteredDayTasks = day.tasks.filter((t: any) => {
                        const matchesType = taskTypeFilter === "all" || t.type === taskTypeFilter;
                        const matchesSearch =
                          !taskSearchQuery ||
                          t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                          t.chapter.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                          t.reason.toLowerCase().includes(taskSearchQuery.toLowerCase());
                        return matchesType && matchesSearch;
                      });

                      if (filteredDayTasks.length === 0) return null;

                      return (
                        <div key={day.day} className="glass p-5 rounded-2xl space-y-4 border border-white/10">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                              <span>📅</span> Day {day.day}
                              <span className="text-xs font-normal text-muted-foreground">({day.date})</span>
                            </h3>
                            <span className="text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                              {day.totalMinutes} Mins Allocated
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {filteredDayTasks.map((task: any) => {
                              const isTaskDone = !!completedTasks[task.id];

                              if (isCompactTaskView) {
                                // 3 AM Compact Checklist View
                                return (
                                  <div
                                    key={task.id}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                      isTaskDone
                                        ? "bg-emerald-950/20 border-emerald-500/30 opacity-75"
                                        : "bg-black/30 hover:bg-black/40 border-white/10 hover:border-primary/40"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <button
                                        onClick={() => toggleTaskCompleted(task.id, task.title)}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                                          isTaskDone
                                            ? "bg-emerald-500 border-emerald-400 text-black"
                                            : "border-white/30 hover:border-primary"
                                        }`}
                                      >
                                        {isTaskDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                                      </button>

                                      <div className="min-w-0 flex-1">
                                        <p className={`text-xs sm:text-sm font-semibold truncate ${isTaskDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                          {task.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                          {task.reason}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                        {task.durationMinutes}m
                                      </span>
                                      <button
                                        onClick={() => startFocusTimerForTask(task)}
                                        className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
                                        title="Start 25m Focus Timer"
                                      >
                                        <Zap className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              // Detailed Card View
                              return (
                                <div
                                  key={task.id}
                                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                                    isTaskDone
                                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-75"
                                      : "bg-black/20 hover:bg-black/30 border-white/10"
                                  }`}
                                >
                                  {/* Task Header */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={() => toggleTaskCompleted(task.id, task.title)}
                                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                          isTaskDone
                                            ? "bg-emerald-500 border-emerald-400 text-black"
                                            : "border-white/30 hover:border-primary"
                                        }`}
                                      >
                                        {isTaskDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                                      </button>

                                      <div>
                                        <h4 className={`font-semibold text-sm sm:text-base ${isTaskDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                          {task.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                          <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                            {task.chapter}
                                          </span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {task.durationMinutes} mins
                                          </span>
                                          <span>•</span>
                                          <span className="capitalize font-medium">{task.type}</span>
                                          <span>•</span>
                                          <span className="text-amber-300">P{task.priority}/10</span>
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => startFocusTimerForTask(task)}
                                      className="px-2.5 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-semibold hover:bg-primary hover:text-black transition-all flex items-center gap-1 flex-shrink-0"
                                    >
                                      <Zap className="w-3.5 h-3.5" /> Start Timer
                                    </button>
                                  </div>

                                  {/* Reason & Self Assessment */}
                                  <div className="space-y-1.5 text-xs">
                                    <p className="text-foreground/80 bg-white/5 p-2.5 rounded-lg border border-white/5 font-mono">
                                      🎯 {task.reason}
                                    </p>

                                    {task.selfAssessmentGoal && (
                                      <p className="text-amber-300/90 font-medium px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20">
                                        ⚡ Goal: {task.selfAssessmentGoal}
                                      </p>
                                    )}
                                  </div>

                                  {/* Verification Checkpoints */}
                                  {task.checkpointItems && task.checkpointItems.length > 0 && (
                                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Topic Checkpoints:
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {task.checkpointItems.map((item: string, cIdx: number) => {
                                          const key = `${task.id}-cp-${cIdx}`;
                                          const isChecked = !!completedCheckpoints[key];
                                          return (
                                            <button
                                              key={cIdx}
                                              onClick={() => toggleCheckpoint(key, task.title)}
                                              className={`text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all border ${
                                                isChecked
                                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 line-through opacity-80"
                                                  : "bg-white/5 hover:bg-white/10 text-foreground/90 border-white/10"
                                              }`}
                                            >
                                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                                isChecked ? "bg-emerald-500 text-black border-emerald-400 font-bold" : "border-white/30"
                                              }`}>
                                                {isChecked ? "✓" : ""}
                                              </span>
                                              <span className="truncate">{item}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* VIEW TAB 3: 3 AM MEMORY DRILL FLASHCARDS */}
            {mainTab === "flashcards" && (
              <div className="glass p-6 rounded-2xl border border-primary/30 space-y-6 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-400 text-black font-extrabold">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        3 AM Rapid Flashcard Active Recall
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Test memory under pressure. Click to flip cards & reveal key equations.
                      </p>
                    </div>
                  </div>

                  {allFlashcards.length > 0 && (
                    <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      Card {flashcardIndex + 1} of {allFlashcards.length}
                    </span>
                  )}
                </div>

                {allFlashcards.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground">No flashcards available for the active syllabus.</p>
                  </div>
                ) : (
                  (() => {
                    const card = allFlashcards[flashcardIndex % allFlashcards.length];
                    const isFlipped = !!revealedFlashcards[card.id];

                    return (
                      <div className="space-y-6 max-w-2xl mx-auto">
                        {/* Flashcard Box */}
                        <div
                          onClick={() =>
                            setRevealedFlashcards((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                          }
                          className="p-8 rounded-2xl bg-black/50 border-2 border-primary/40 hover:border-primary transition-all cursor-pointer min-h-[240px] flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary font-bold border border-primary/30">
                              {card.chapter}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {isFlipped ? "💡 Solution Revealed" : "👆 Click anywhere to flip card"}
                            </span>
                          </div>

                          <div className="space-y-3 my-auto">
                            <p className="text-base sm:text-lg font-bold text-foreground">
                              ❓ {card.question}
                            </p>

                            {isFlipped ? (
                              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary font-mono text-sm sm:text-base font-bold animate-in fade-in duration-200">
                                {card.answer}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground italic text-center">
                                Tap to reveal key equation & memory hint...
                              </div>
                            )}
                          </div>

                          <div className="text-center">
                            <span className="text-[11px] font-semibold text-primary/80 uppercase tracking-wider">
                              {isFlipped ? "Click to Hide Answer" : "Click to Reveal Answer"}
                            </span>
                          </div>
                        </div>

                        {/* Flashcard Controls */}
                        <div className="flex items-center justify-between gap-3">
                          <button
                            onClick={() =>
                              setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : allFlashcards.length - 1))
                            }
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-foreground border border-white/10"
                          >
                            ← Previous Card
                          </button>

                          <button
                            onClick={() => {
                              addXP(10, `Completed Flashcard: ${card.chapter}`);
                              setFlashcardIndex((prev) => (prev + 1) % allFlashcards.length);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md"
                          >
                            <span>Mark Learned (+10 XP)</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setFlashcardIndex((prev) => (prev + 1) % allFlashcards.length)
                            }
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-foreground border border-white/10"
                          >
                            Next Card →
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}


          </div>
        ) : activePlan && generatedPlan ? (
          <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Overview */}
            <div className="lg:col-span-2 glass p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">{activePlan.subject}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Exam: {new Date(activePlan.examDate).toLocaleDateString()}
              </p>

              {/* Study Sessions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Your Study Schedule
                </h3>
                {generatedPlan.dailySchedule.length > 0 ? (
                  generatedPlan.dailySchedule.slice(0, 7).map((session: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">Day {session.day} • {session.date}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {session.sessionType} • {session.duration}h
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(session.chapters || []).map((ch: any, i: number) => (
                          <div key={i} className="text-xs">
                            <p className="font-medium text-foreground">
                              {ch.name}
                              <span className="ml-2 text-muted-foreground">({ch.estimatedHours}h)</span>
                            </p>
                            <p className="text-foreground/60 mt-0.5">
                              {(ch.importantTopics || []).join(" • ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 text-center text-muted-foreground text-sm">
                    No study schedule available
                  </div>
                )}
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="glass p-6 rounded-2xl space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Total Study Hours
                </p>
                <p className="text-3xl font-bold">{generatedPlan?.totalEstimatedHours || 0}h</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Chapters by Weightage
                </p>
                <div className="space-y-2">
                  {(generatedPlan?.chapters || []).slice(0, 5).map((ch: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{ch.name}</span>
                        <span className="text-xs text-primary font-semibold">{ch.weightage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${ch.weightage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Revision Strategy
                </p>
                <p className="text-xs text-foreground/80">{generatedPlan.revisionStrategy}</p>
              </div>

              <div className="p-3 rounded-lg bg-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Expected Improvement</p>
                <p className="text-lg font-bold text-primary">+{generatedPlan.expectedImprovement}%</p>
              </div>

              <button
                onClick={() => toggleFocusMode()}
                className={`w-full px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  metrics.focusMode
                    ? "bg-status-completed text-status-completed-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {metrics.focusMode ? "✓ Focus Mode ON" : "Enable Focus Mode"}
              </button>
            </div>
          </div>

          {/* Resources Section */}
          {fetchedResources && fetchedResources.length > 0 && (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">📚 Study Resources Found</h2>
              <div className="space-y-4">
                {fetchedResources.map((chapterRes: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-semibold mb-3 text-primary">{chapterRes.chapter}</h3>

                    <div className="space-y-2 mb-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">📖 Available Materials:</p>
                      <div className="grid gap-2">
                        {chapterRes.resources.slice(0, 5).map((res: any, rIdx: number) => (
                          <div key={rIdx} className="flex items-start gap-3 text-xs p-2 rounded-lg bg-white/5">
                            <span className="inline-block w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-primary flex-shrink-0 text-[10px] font-bold">
                              {rIdx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{res.title}</p>
                              <p className="text-muted-foreground text-[11px] mt-0.5">Source: {res.source}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-medium uppercase tracking-wider">💡 Study Tips:</p>
                      <ul className="space-y-1">
                        {chapterRes.studyTips.slice(0, 2).map((tip: string, tIdx: number) => (
                          <li key={tIdx} className="text-xs text-foreground/70 pl-2">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create New Plan */}
            <button
              onClick={() => setIsNewPlanModalOpen(true)}
              className="glass p-8 rounded-2xl hover:shadow-lg transition-all group cursor-pointer text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Generate Study Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your syllabus and study hours to get a custom study plan
                  </p>
                </div>
              </div>
            </button>

            {/* Quick Add Exam */}
            <button
              onClick={() => setIsNewExamModalOpen(true)}
              className="glass p-8 rounded-2xl hover:shadow-lg transition-all group cursor-pointer text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-status-due-soon/20 group-hover:bg-status-due-soon/30 transition-colors">
                  <BookOpen className="w-6 h-6 text-status-due-soon" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Quick Add Exam</h3>
                  <p className="text-sm text-muted-foreground">
                    Forgot to add your exam? Create it here directly
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <div className="mt-8 glass p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Available Exams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingExams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => {
                    setPlanForm({ ...planForm, examId: exam.id });
                    setIsNewPlanModalOpen(true);
                  }}
                  className="p-4 rounded-xl glass hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{exam.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(exam.examDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Plan Modal */}
      <FloatingModal
        isOpen={isNewPlanModalOpen}
        onClose={() => {
          setIsNewPlanModalOpen(false);
          setShowChapterDropdown(false);
          setChapterSearchInput("");
        }}
        title="Generate Study Plan"
        size="lg"
      >
        <div className="space-y-4">
          {/* Board Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Board</label>
            <select
              value={syllabusForm.board}
              onChange={(e) =>
                setSyllabusForm({
                  ...syllabusForm,
                  board: e.target.value,
                  classGrade: "",
                  subject: "",
                  selectedChapters: [],
                })
              }
              className="w-full rounded-xl border border-white/10 bg-zinc-900 text-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="" className="bg-zinc-900 text-white">Select Board...</option>
              {availableBoards.map((board) => (
                <option key={board} value={board.toLowerCase()} className="bg-zinc-900 text-white">
                  {board}
                </option>
              ))}
            </select>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={syllabusForm.classGrade}
              onChange={(e) =>
                setSyllabusForm({
                  ...syllabusForm,
                  classGrade: e.target.value,
                  subject: "",
                  selectedChapters: [],
                })
              }
              disabled={!syllabusForm.board}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 text-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
            >
              <option value="" className="bg-zinc-900 text-white">Select Class...</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls} className="bg-zinc-900 text-white">
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection or Custom Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Subject</label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSubject(!isCustomSubject);
                  setSyllabusForm({ ...syllabusForm, subject: "", selectedChapters: [] });
                }}
                className="text-xs text-primary hover:underline"
              >
                {isCustomSubject ? "← Pick from Database" : "+ Type Custom Subject"}
              </button>
            </div>

            {isCustomSubject ? (
              <input
                type="text"
                placeholder="e.g. Quantum Physics, Organic Chemistry, World History..."
                value={customSubjectInput}
                onChange={(e) => setCustomSubjectInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 text-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            ) : (
              <select
                value={syllabusForm.subject}
                onChange={(e) =>
                  setSyllabusForm({
                    ...syllabusForm,
                    subject: e.target.value,
                    selectedChapters: [],
                  })
                }
                disabled={!syllabusForm.classGrade}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 text-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
              >
                <option value="" className="bg-zinc-900 text-white">Select Subject...</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject} className="bg-zinc-900 text-white">
                    {subject}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Chapter / Topic Selection with Search & Custom Topic Add */}
          {(syllabusForm.subject || isCustomSubject) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Topics & Chapters ({syllabusForm.selectedChapters.length} selected)
              </label>
              <div className="relative z-50 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Type or search topic name..."
                      value={chapterSearchInput}
                      onChange={(e) => setChapterSearchInput(e.target.value)}
                      onFocus={() => setShowChapterDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chapterSearchInput.trim()) {
                          e.preventDefault();
                          handleAddChapter(chapterSearchInput.trim());
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {chapterSearchInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddChapter(chapterSearchInput.trim())}
                      className="px-3 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 text-xs font-semibold hover:bg-primary/30 flex-shrink-0"
                    >
                      + Add Topic
                    </button>
                  )}
                </div>

                {/* Chapter Dropdown */}
                {showChapterDropdown && filteredChapters.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-white/20 rounded-xl backdrop-blur-xl shadow-xl z-[60] max-h-64 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {filteredChapters.map((chapter) => (
                        <button
                          key={chapter}
                          onClick={() => handleAddChapter(chapter)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors border border-transparent ${
                            syllabusForm.selectedChapters.includes(chapter)
                              ? "bg-primary/30 text-primary border-primary/50"
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="font-medium">{chapter}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showChapterDropdown && filteredChapters.length === 0 && chapterSearchInput && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-white/20 rounded-xl backdrop-blur-xl p-4 text-center text-muted-foreground text-sm z-[60]">
                    No chapters match "{chapterSearchInput}"
                  </div>
                )}
              </div>

              {/* Show all chapters if no search filter and dropdown not open */}
              {!showChapterDropdown && !chapterSearchInput && availableChapters.length > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-2">Available chapters:</p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availableChapters.map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => handleAddChapter(chapter)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          syllabusForm.selectedChapters.includes(chapter)
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Chapters Tags */}
              {syllabusForm.selectedChapters.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {syllabusForm.selectedChapters.map((chapter) => (
                    <div
                      key={chapter}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/20 border border-primary/50 text-sm"
                    >
                      <span>{chapter}</span>
                      <button
                        onClick={() => handleRemoveChapter(chapter)}
                        className="text-muted-foreground hover:text-foreground text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exam Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Exam Date</label>
            <input
              type="date"
              value={syllabusForm.examDate}
              onChange={(e) =>
                setSyllabusForm({ ...syllabusForm, examDate: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>

          {/* Study Hours Per Day */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Study Hours Per Day
            </label>
            <input
              type="number"
              min="1"
              max="12"
              step="0.5"
              value={syllabusForm.studyHoursPerDay || 3}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : 3;
                setSyllabusForm({
                  ...syllabusForm,
                  studyHoursPerDay: isNaN(val) ? 3 : val,
                });
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={() => {
              handleGeneratePlan();
              setShowChapterDropdown(false);
            }}
            disabled={
              (!isCustomSubject && !syllabusForm.subject) ||
              (isCustomSubject && !customSubjectInput.trim()) ||
              syllabusForm.selectedChapters.length === 0 ||
              !syllabusForm.examDate
            }
            className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Generate Realistic Study Plan
          </button>
        </div>
      </FloatingModal>

      {/* New Exam Modal */}
      <FloatingModal
        isOpen={isNewExamModalOpen}
        onClose={() => setIsNewExamModalOpen(false)}
        title="Quick Add Exam"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              placeholder="e.g., Physics, History"
              value={newExamForm.subject}
              onChange={(e) =>
                setNewExamForm({ ...newExamForm, subject: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={newExamForm.examDate}
                onChange={(e) =>
                  setNewExamForm({ ...newExamForm, examDate: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={newExamForm.examTime}
                onChange={(e) =>
                  setNewExamForm({ ...newExamForm, examTime: e.target.value })
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(EXAM_COLORS) as ExamColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setNewExamForm({ ...newExamForm, color })
                  }
                  className={`h-10 rounded-lg border-2 transition-all ${
                    newExamForm.color === color
                      ? "border-foreground"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor: EXAM_COLORS[color].dark,
                  }}
                  title={EXAM_COLORS[color].label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Syllabus (optional)
            </label>
            <textarea
              placeholder="Add syllabus details..."
              value={newExamForm.syllabus}
              onChange={(e) =>
                setNewExamForm({ ...newExamForm, syllabus: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleCreateNewExam}
            disabled={!newExamForm.subject || !newExamForm.examDate}
            className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Create Exam
          </button>
        </div>
      </FloatingModal>
    </div>
  );
}
