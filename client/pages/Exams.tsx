import { useState } from "react";
import { useExamsStore } from "@/hooks/useExamsStore";
import { ExamCalendar } from "@/components/ExamCalendar";
import HomeButton from "@/components/HomeButton";
import { EXAM_COLORS, ExamColor, Exam } from "@shared/api";
import {
  daysUntilDate,
  isExamPassed,
  getExamUrgency,
  calculateTopicProgress,
  getUrgencyColor,
} from "@/lib/calculations";
import { Trash2, Plus, Check, X, BookOpen, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Exams() {
  const { exams, addExam, deleteExam, addTopic, toggleTopic, deleteTopic } =
    useExamsStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [newTopicInput, setNewTopicInput] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    examDate: "",
    examTime: "",
    color: "blue" as ExamColor,
    syllabus: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.examDate) {
      return;
    }

    addExam(
      formData.subject,
      new Date(formData.examDate),
      formData.color,
      formData.examTime,
      [],
      formData.syllabus
    );

    setFormData({
      subject: "",
      examDate: "",
      examTime: "",
      color: "blue",
      syllabus: "",
    });
    setIsAddModalOpen(false);
  };

  const handleAddTopic = (examId: string) => {
    if (!newTopicInput.trim()) return;
    addTopic(examId, newTopicInput);
    setNewTopicInput("");
  };

  const handleDateClick = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, examDate: formattedDate }));
    setIsAddModalOpen(true);
  };

  const handleExamClick = (exam: Exam) => {
    setActiveExamId(exam.id);
  };

  // Find active exam for modal popup
  const activeExam = exams.find((e) => e.id === activeExamId);

  // Sort exams by date (closest first)
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Exams</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {exams.length} upcoming {exams.length === 1 ? "exam" : "exams"} tracked
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setFormData({
                  subject: "",
                  examDate: new Date().toISOString().split("T")[0],
                  examTime: "",
                  color: "blue",
                  syllabus: "",
                });
                setIsAddModalOpen(true);
              }}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Exam</span>
            </button>
            <HomeButton />
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <ExamCalendar
            exams={exams}
            onDateClick={handleDateClick}
            onExamClick={handleExamClick}
          />
        </div>

        {/* Exams List */}
        {sortedExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 p-8 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">No exams scheduled yet. Click a date on the calendar or "Add Exam" to start!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              Upcoming Schedule
            </h2>
            {sortedExams.map((exam) => {
              const daysLeft = daysUntilDate(exam.examDate);
              const isPassed = isExamPassed(exam.examDate);
              const urgency = getExamUrgency(exam.examDate);
              const topicProgress = calculateTopicProgress(exam.topics);

              return (
                <div
                  key={exam.id}
                  onClick={() => handleExamClick(exam)}
                  className={cn(
                    "cursor-pointer rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 transition-all hover:border-white/20 hover:bg-zinc-900/95 shadow-md",
                    isPassed && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          style={{
                            borderColor: EXAM_COLORS[exam.color].border,
                            backgroundColor: EXAM_COLORS[exam.color].light,
                          }}
                          className="h-3 w-3 rounded-full border shrink-0"
                        />
                        <h3 className="font-bold text-base text-foreground truncate">{exam.subject}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-zinc-500" />
                          {new Date(exam.examDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {exam.examTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {exam.examTime}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Countdown Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={cn(
                          "text-right",
                          isPassed ? "text-muted-foreground" : getUrgencyColor(urgency)
                        )}
                      >
                        <div className="text-2xl font-extrabold leading-none">
                          {isPassed ? "—" : daysLeft}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-muted-foreground">
                          {isPassed ? "Passed" : "days left"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topic Progress Bar */}
                  {exam.topics.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Topics Covered
                        </span>
                        <span className="text-[11px] font-bold text-foreground">
                          {topicProgress}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${topicProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP MODAL 1: Add Exam */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl relative my-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Add New Exam
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantum Mechanics, World History"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-input bg-zinc-950/80 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Color Tag Picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Color Tag
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {(Object.keys(EXAM_COLORS) as ExamColor[]).map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        backgroundColor: EXAM_COLORS[color].light,
                        borderColor: EXAM_COLORS[color].border,
                      }}
                      className={cn(
                        "h-8 rounded-lg border-2 transition-all flex items-center justify-center font-medium text-xs active:scale-95",
                        formData.color === color && "ring-2 ring-primary ring-offset-2 ring-offset-zinc-900"
                      )}
                      title={EXAM_COLORS[color].label}
                    >
                      {formData.color === color && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) =>
                      setFormData({ ...formData, examDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-zinc-950/80 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.examTime}
                    onChange={(e) =>
                      setFormData({ ...formData, examTime: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-zinc-950/80 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Syllabus / Topics (Optional)
                </label>
                <textarea
                  placeholder="Paste key chapters, topics, or exam outline..."
                  value={formData.syllabus}
                  onChange={(e) =>
                    setFormData({ ...formData, syllabus: e.target.value })
                  }
                  className="w-full rounded-xl border border-input bg-zinc-950/80 px-3.5 py-2.5 text-xs outline-none focus:border-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-95"
                >
                  Create Exam Entry
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Exam Entry Detail Window */}
      {activeExam && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setActiveExamId(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl relative my-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    borderColor: EXAM_COLORS[activeExam.color].border,
                    backgroundColor: EXAM_COLORS[activeExam.color].light,
                  }}
                  className="h-4 w-4 rounded-full border shrink-0 mt-0.5"
                />
                <div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {activeExam.subject}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(activeExam.examDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {activeExam.examTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeExam.examTime}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveExamId(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown Banner */}
            <div className="rounded-xl bg-zinc-950/80 border border-white/5 p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Status & Urgency
                </span>
                <span className="text-xs text-zinc-300 font-medium mt-0.5 block">
                  {isExamPassed(activeExam.examDate)
                    ? "Exam completed / passed"
                    : `${daysUntilDate(activeExam.examDate)} days remaining`}
                </span>
              </div>
              <div
                className={cn(
                  "text-2xl font-extrabold px-3 py-1 rounded-xl border",
                  isExamPassed(activeExam.examDate)
                    ? "text-muted-foreground bg-zinc-800 border-zinc-700"
                    : getUrgencyColor(getExamUrgency(activeExam.examDate))
                )}
              >
                {isExamPassed(activeExam.examDate)
                  ? "Passed"
                  : `${daysUntilDate(activeExam.examDate)}d`}
              </div>
            </div>

            {/* Syllabus Section */}
            {activeExam.syllabus && (
              <div className="space-y-1.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Syllabus
                </h3>
                <div className="rounded-xl p-3.5 bg-zinc-950/80 border border-white/5 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {activeExam.syllabus}
                </div>
              </div>
            )}

            {/* Topics Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Topics Checklist ({calculateTopicProgress(activeExam.topics)}%)
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {activeExam.topics.filter((t) => t.completed).length} of {activeExam.topics.length} completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 overflow-hidden rounded-full bg-zinc-950 border border-white/5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${calculateTopicProgress(activeExam.topics)}%` }}
                />
              </div>

              {/* Topics List */}
              {activeExam.topics.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeExam.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTopic(activeExam.id, topic.id)}
                        className={cn(
                          "flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-all",
                          topic.completed
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-zinc-700 hover:border-primary"
                        )}
                      >
                        {topic.completed && <Check className="h-3 w-3 text-black font-bold" />}
                      </button>

                      <span
                        className={cn(
                          "flex-1 text-xs font-medium text-zinc-200",
                          topic.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {topic.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteTopic(activeExam.id, topic.id)}
                        className="flex-shrink-0 p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Topic Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new topic..."
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTopic(activeExam.id);
                    }
                  }}
                  className="flex-1 rounded-xl border border-input bg-zinc-950 px-3.5 py-2 text-xs outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleAddTopic(activeExam.id)}
                  className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Footer / Delete Exam */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  deleteExam(activeExam.id);
                  setActiveExamId(null);
                }}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Delete Exam
              </button>

              <button
                type="button"
                onClick={() => setActiveExamId(null)}
                className="rounded-xl bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
