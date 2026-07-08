import { useState, useMemo } from "react";
import { useExamsStore } from "@/hooks/useExamsStore";
import { useEnhancedStudyPlanner } from "@/hooks/useEnhancedStudyPlanner";
import { useResourceFetcher } from "@/hooks/useResourceFetcher";
import { useCrisisStore } from "@/hooks/useCrisisStore";
import { useSyllabusDatabase } from "@/hooks/useSyllabusDatabase";
import { useDetailedStudyPlanner } from "@/hooks/useDetailedStudyPlanner";
import HomeButton from "@/components/HomeButton";
import FloatingModal from "@/components/FloatingModal";
import { AlertTriangle, Zap, CheckCircle2, Lock, BookOpen, Plus, Download, ChevronDown, TrendingUp } from "lucide-react";
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

  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [detailedPlan, setDetailedPlan] = useState<any>(null);
  const [fetchedResources, setFetchedResources] = useState<any>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [planError, setPlanError] = useState("");
  const [chapterSearchInput, setChapterSearchInput] = useState("");
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

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
    if (!syllabusForm.subject || syllabusForm.selectedChapters.length === 0 || !syllabusForm.examDate) {
      return;
    }

    setPlanError("");
    setIsLoadingResources(true);

    try {
      // For now, we'll generate a detailed plan for each selected chapter
      const daysUntilExam = Math.ceil(
        (new Date(syllabusForm.examDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const totalAvailableHours = Math.max(1, daysUntilExam) * syllabusForm.studyHoursPerDay;
      const hoursPerChapter = totalAvailableHours / syllabusForm.selectedChapters.length;

      // Generate detailed study plans for the first selected chapter
      // (in a full implementation, you'd generate for all chapters)
      const chapterToAnalyze = syllabusForm.selectedChapters[0];

      try {
        const detailedStudyPlan = generateDetailedStudyPlan(
          syllabusForm.board,
          syllabusForm.classGrade,
          chapterToAnalyze,
          syllabusForm.examDate,
          hoursPerChapter,
          syllabusForm.currentGrade
        );

        setDetailedPlan(detailedStudyPlan);
        setIsLoadingResources(false);
        setIsNewPlanModalOpen(false);

        // Also fetch resources (in background after closing modal)
        const resources = await searchResources({
          grade: syllabusForm.classGrade,
          board: syllabusForm.board,
          subject: syllabusForm.subject,
          chapters: syllabusForm.selectedChapters,
        });

        setFetchedResources(resources);

        // Create emergency plan in crisis store
        createEmergencyPlan(
          syllabusForm.examDate,
          syllabusForm.subject,
          totalAvailableHours,
          syllabusForm.selectedChapters
        );

        // Reset forms after successful generation
        setSyllabusForm({
          board: "cbse",
          classGrade: "10th",
          subject: "",
          selectedChapters: [],
          currentGrade: 60,
          studyHoursPerDay: 3,
          examDate: "",
        });
      } catch (error: any) {
        setPlanError(error.message || "Unable to generate detailed study plan for this chapter. Content database may not have this chapter yet.");
        setDetailedPlan(null);
        setIsLoadingResources(false);
        console.error("Plan generation error:", error);
      }
    } catch (error) {
      setPlanError("An error occurred while generating the study plan. Please try again.");
      setDetailedPlan(null);
      setIsLoadingResources(false);
      console.error("Unexpected error:", error);
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

        {/* Detailed Study Plan Display */}
        {detailedPlan ? (
          <div className="space-y-6">
            {/* Error message if any */}
            {planError && (
              <div className="p-4 rounded-2xl bg-status-overdue/10 border border-status-overdue/50">
                <p className="text-sm text-status-overdue">{planError}</p>
              </div>
            )}

            {/* Plan Header */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Study Plan Ready</h2>
                  <p className="text-sm text-muted-foreground">
                    Total Study Time: {detailedPlan.totalStudyHours}h • Risk Level: {detailedPlan.riskLevel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Completion Probability</p>
                  <p className="text-3xl font-bold text-primary">{detailedPlan.completionProbability}%</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className="text-lg font-bold">{detailedPlan.riskLevel}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground">Emergency Mode</p>
                  <p className="text-lg font-bold">{detailedPlan.emergencyMode ? "YES" : "NO"}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground">Study Days</p>
                  <p className="text-lg font-bold">{detailedPlan.days.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/50">
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="text-lg font-bold text-primary">{detailedPlan.totalStudyHours}h</p>
                </div>
              </div>

              {/* Top Priorities */}
              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase">Top Priorities</p>
                <ul className="space-y-1">
                  {detailedPlan.topPriorities.map((priority: string, idx: number) => (
                    <li key={idx} className="text-sm text-foreground">
                      <span className="font-semibold">{idx + 1}.</span> {priority}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warnings */}
            {detailedPlan.warnings.length > 0 && (
              <div className="glass p-6 rounded-2xl border-status-overdue/50 bg-status-overdue/10">
                <h3 className="text-lg font-bold mb-3 text-status-overdue flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Important Warnings
                </h3>
                <ul className="space-y-2">
                  {detailedPlan.warnings.map((warning: string, idx: number) => (
                    <li key={idx} className="text-sm text-foreground/90">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daily Schedule */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">📅 Your Study Schedule</h3>
              <div className="space-y-4">
                {detailedPlan.days.map((day: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">Day {day.day}</h4>
                        <p className="text-xs text-muted-foreground">{day.date}</p>
                      </div>
                      <span className="text-sm bg-primary/20 px-3 py-1 rounded-full font-semibold">{day.totalMinutes} min</span>
                    </div>

                    <div className="space-y-2">
                      {day.tasks.map((task: any, tIdx: number) => (
                        <div key={tIdx} className="text-sm">
                          <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                              task.type === 'study' ? 'bg-primary' :
                              task.type === 'practice' ? 'bg-status-active' :
                              task.type === 'revision' ? 'bg-status-due-soon' :
                              'bg-muted-foreground'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {task.durationMinutes} min • {task.type} • Priority: {task.priority}/10
                              </p>
                              <p className="text-xs text-foreground/70 mt-1">{task.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                        {session.chapters.map((ch: any, i: number) => (
                          <div key={i} className="text-xs">
                            <p className="font-medium text-foreground">
                              {ch.name}
                              <span className="ml-2 text-muted-foreground">({ch.estimatedHours}h)</span>
                            </p>
                            <p className="text-foreground/60 mt-0.5">
                              {ch.importantTopics.join(" • ")}
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
                <p className="text-3xl font-bold">{generatedPlan.totalEstimatedHours}h</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Chapters by Weightage
                </p>
                <div className="space-y-2">
                  {generatedPlan.chapters.slice(0, 5).map((ch: any, idx: number) => (
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="">Select Board...</option>
              {availableBoards.map((board) => (
                <option key={board} value={board.toLowerCase()}>
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
            >
              <option value="">Select Class...</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
            >
              <option value="">Select Subject...</option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Selection with Search */}
          {syllabusForm.subject && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Chapters ({syllabusForm.selectedChapters.length} selected)
              </label>
              <div className="relative z-50">
                <input
                  type="text"
                  placeholder="Search or click to select chapters..."
                  value={chapterSearchInput}
                  onChange={(e) => setChapterSearchInput(e.target.value)}
                  onFocus={() => setShowChapterDropdown(true)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                {/* Chapter Dropdown - Always visible when focused */}
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

          {/* Current Grade/Confidence */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Current Grade/Confidence (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={syllabusForm.currentGrade || 60}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : 60;
                setSyllabusForm({
                  ...syllabusForm,
                  currentGrade: isNaN(val) ? 60 : val,
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
              !syllabusForm.subject ||
              syllabusForm.selectedChapters.length === 0 ||
              !syllabusForm.examDate
            }
            className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Generate Study Plan
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
