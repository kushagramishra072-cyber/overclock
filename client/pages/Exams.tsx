import { useState } from "react";
import { useExamsStore } from "@/hooks/useExamsStore";
import { ExamCalendar } from "@/components/ExamCalendar";
import HomeButton from "@/components/HomeButton";
import { EXAM_COLORS, ExamColor } from "@shared/api";
import {
  daysUntilDate,
  isExamPassed,
  getExamUrgency,
  calculateTopicProgress,
  getUrgencyColor,
  getUrgencyBgColor,
} from "@/lib/calculations";
import { Trash2, Plus, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Exams() {
  const { exams, addExam, deleteExam, addTopic, toggleTopic, deleteTopic } =
    useExamsStore();

  const [showForm, setShowForm] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [newTopicInput, setNewTopicInput] = useState<Record<string, string>>({});

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
    setShowForm(false);
  };

  const handleAddTopic = (examId: string, topicName: string) => {
    if (!topicName.trim()) return;
    addTopic(examId, topicName);
    setNewTopicInput({ ...newTopicInput, [examId]: "" });
  };

  // Sort exams by date (closest first)
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Exams</h1>
            <p className="text-sm text-muted-foreground">{exams.length} total</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Exam
            </button>
            <HomeButton />
          </div>
        </div>

        {/* Calendar */}
        <ExamCalendar exams={exams} />

        {/* Add Exam Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl glass p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Physics, History"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(EXAM_COLORS) as ExamColor[]).map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    style={{
                      backgroundColor: EXAM_COLORS[color].light,
                      borderColor: EXAM_COLORS[color].border,
                    }}
                    className={cn(
                      "aspect-square rounded-md border-2 transition-all flex items-center justify-center font-medium text-xs",
                      formData.color === color && "ring-2 ring-primary"
                    )}
                    title={EXAM_COLORS[color].label}
                  >
                    {formData.color === color && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Exam Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData({ ...formData, examDate: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={formData.examTime}
                  onChange={(e) =>
                    setFormData({ ...formData, examTime: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Syllabus (optional)
              </label>
              <textarea
                placeholder="Paste your syllabus, topic list, or exam details..."
                value={formData.syllabus}
                onChange={(e) =>
                  setFormData({ ...formData, syllabus: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Create Exam
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Exams List */}
        {sortedExams.length === 0 ? (
          <div className="rounded-lg glass p-8 text-center">
            <p className="text-sm text-muted-foreground">No exams scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExams.map((exam) => {
              const daysLeft = daysUntilDate(exam.examDate);
              const isPassed = isExamPassed(exam.examDate);
              const urgency = getExamUrgency(exam.examDate);
              const topicProgress = calculateTopicProgress(exam.topics);
              const isExpanded = expandedExamId === exam.id;

              return (
                <div
                  key={exam.id}
                  className={cn(
                    "rounded-lg glass border transition-subtle",
                    isPassed
                      ? "opacity-60"
                      : ""
                  )}
                >
                  {/* Exam Header - Clickable to expand */}
                  <button
                    onClick={() =>
                      setExpandedExamId(
                        isExpanded ? null : exam.id
                      )
                    }
                    className="w-full p-4 text-left hover:bg-black/2 transition-subtle"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            style={{
                              borderColor: EXAM_COLORS[exam.color].border,
                            }}
                            className="h-3 w-3 rounded-full border-2"
                          />
                          <h3 className="font-semibold text-lg">{exam.subject}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(exam.examDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                          {exam.examTime && ` at ${exam.examTime}`}
                        </p>
                      </div>

                      {/* Countdown - Large Number */}
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={cn(
                            "text-right",
                            isPassed
                              ? "text-muted-foreground"
                              : getUrgencyColor(urgency)
                          )}
                        >
                          <div
                            className={cn(
                              "text-4xl font-bold leading-none",
                              isPassed && "opacity-50"
                            )}
                          >
                            {isPassed ? "—" : daysLeft}
                          </div>
                          <div className="text-xs font-medium uppercase tracking-wider mt-1">
                            {isPassed ? "Passed" : "days left"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Topic Progress Bar */}
                    {exam.topics.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Topics
                          </span>
                          <span className="text-xs font-semibold">
                            {topicProgress}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-status-completed transition-all duration-300"
                            style={{ width: `${topicProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {exam.topics.length} topic
                        {exam.topics.length !== 1 ? "s" : ""}
                        {exam.syllabus && " • Syllabus"}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/10 p-4 space-y-4">
                      {/* Syllabus Section */}
                      {exam.syllabus && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Syllabus
                          </h4>
                          <div className="rounded-md p-3 glass text-xs text-foreground whitespace-pre-wrap overflow-auto max-h-48 text-sm leading-relaxed">
                            {exam.syllabus}
                          </div>
                        </div>
                      )}

                      {/* Topics Section */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Topics</h4>

                        {exam.topics.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {exam.topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="flex items-center gap-3 p-2 rounded-md glass hover:bg-white/10 dark:hover:bg-black/20 transition-subtle"
                              >
                                <button
                                  onClick={() =>
                                    toggleTopic(exam.id, topic.id)
                                  }
                                  className={cn(
                                    "flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-subtle",
                                    topic.completed
                                      ? "border-status-completed bg-status-completed"
                                      : "border-border hover:border-primary"
                                  )}
                                >
                                  {topic.completed && (
                                    <Check className="h-3 w-3 text-status-completed-foreground" />
                                  )}
                                </button>

                                <span
                                  className={cn(
                                    "flex-1 text-sm",
                                    topic.completed &&
                                      "line-through text-muted-foreground"
                                  )}
                                >
                                  {topic.name}
                                </span>

                                <button
                                  onClick={() =>
                                    deleteTopic(exam.id, topic.id)
                                  }
                                  className="flex-shrink-0 p-1 text-muted-foreground hover:text-status-overdue transition-subtle"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Topic Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add topic..."
                            value={newTopicInput[exam.id] || ""}
                            onChange={(e) =>
                              setNewTopicInput({
                                ...newTopicInput,
                                [exam.id]: e.target.value,
                              })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddTopic(
                                  exam.id,
                                  newTopicInput[exam.id] || ""
                                );
                              }
                            }}
                            className="flex-1 rounded-md border border-input bg-input px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <button
                            onClick={() =>
                              handleAddTopic(
                                exam.id,
                                newTopicInput[exam.id] || ""
                              )
                            }
                            className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-subtle hover:opacity-90"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="pt-2 border-t border-border flex justify-end">
                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="rounded-md px-3 py-2 text-xs font-medium text-status-overdue hover:bg-status-overdue/10 transition-subtle flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete Exam
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
