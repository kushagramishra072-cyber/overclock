import { useState } from "react";
import { useSubjectStore } from "@/hooks/useSubjectStore";
import { BookOpen, Plus, Trash2, AlertCircle } from "lucide-react";

export default function SubjectDashboard() {
  const {
    subjects,
    addSubject,
    toggleChapter,
    addWeakTopic,
    removeWeakTopic,
    deleteSubject,
  } = useSubjectStore();

  const [showForm, setShowForm] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    chapters: "",
    examDate: "",
  });

  const [weakTopicForm, setWeakTopicForm] = useState<Record<string, string>>({});

  const handleAddSubject = () => {
    if (!formData.subject) return;

    const chapters = formData.chapters
      .split("\n")
      .map((ch) => ch.trim())
      .filter((ch) => ch.length > 0);

    addSubject(
      formData.subject,
      chapters.length > 0 ? chapters : ["Chapter 1"],
      formData.examDate || undefined
    );

    setFormData({ subject: "", chapters: "", examDate: "" });
    setShowForm(false);
  };

  const handleAddWeakTopic = (subjectId: string) => {
    const topic = weakTopicForm[subjectId];
    if (topic) {
      addWeakTopic(subjectId, topic);
      setWeakTopicForm({ ...weakTopicForm, [subjectId]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Subject Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track syllabus completion and weak topics
          </p>
        </div>

        {/* Add Subject Form */}
        {showForm && (
          <div className="mb-8 rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Add New Subject</h2>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g., Physics"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Chapters (one per line)
              </label>
              <textarea
                placeholder="Chapter 1&#10;Chapter 2&#10;Chapter 3..."
                value={formData.chapters}
                onChange={(e) =>
                  setFormData({ ...formData, chapters: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Exam Date (optional)
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) =>
                  setFormData({ ...formData, examDate: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddSubject}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Add Subject
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-subtle hover:bg-secondary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        )}

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold mb-2">No subjects yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first subject and start tracking your syllabus
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* Subject Header */}
                <button
                  onClick={() =>
                    setExpandedSubject(
                      expandedSubject === subject.id ? null : subject.id
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-lg">{subject.subject}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {subject.completionPercent}% Complete
                      </span>
                      {subject.examDate && (
                        <span className="text-muted-foreground">
                          Exam: {new Date(subject.examDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {subject.totalStudyHours}h studied
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${subject.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {subject.completionPercent}%
                    </span>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedSubject === subject.id && (
                  <div className="border-t border-border px-6 py-4 space-y-6">
                    {/* Chapters */}
                    {subject.chapters.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Chapters</h4>
                        <div className="space-y-2">
                          {subject.chapters.map((chapter) => (
                            <button
                              key={chapter.id}
                              onClick={() =>
                                toggleChapter(subject.id, chapter.id)
                              }
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                chapter.completed
                                  ? "bg-status-completed/10 border-status-completed/30"
                                  : "bg-secondary/50 border-border hover:bg-secondary"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={chapter.completed}
                                onChange={() => {}}
                                className="rounded"
                              />
                              <span
                                className={chapter.completed ? "line-through text-muted-foreground" : ""}
                              >
                                {chapter.name}
                              </span>
                              <span className="ml-auto text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {chapter.difficulty}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weak Topics */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-status-overdue" />
                        Weak Topics
                      </h4>

                      {subject.weakTopics && subject.weakTopics.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {subject.weakTopics.map((topic) => (
                            <div
                              key={topic}
                              className="flex items-center justify-between p-2 bg-status-overdue/10 border border-status-overdue/30 rounded-lg"
                            >
                              <span className="text-sm">{topic}</span>
                              <button
                                onClick={() =>
                                  removeWeakTopic(subject.id, topic)
                                }
                                className="text-status-overdue hover:text-status-overdue/70"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-4">
                          No weak topics identified yet
                        </p>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add weak topic..."
                          value={weakTopicForm[subject.id] || ""}
                          onChange={(e) =>
                            setWeakTopicForm({
                              ...weakTopicForm,
                              [subject.id]: e.target.value,
                            })
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddWeakTopic(subject.id);
                            }
                          }}
                          className="flex-1 rounded-md border border-input bg-input px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button
                          onClick={() => handleAddWeakTopic(subject.id)}
                          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-subtle hover:opacity-90"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                      <p>
                        Last revised:{" "}
                        {new Date(subject.lastRevisedDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="w-full rounded-md border border-status-overdue/30 bg-status-overdue/5 px-4 py-2 text-sm font-medium text-status-overdue transition-subtle hover:bg-status-overdue/10"
                    >
                      Delete Subject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
