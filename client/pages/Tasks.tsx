import { useState } from "react";
import { useTasksStore } from "@/hooks/useTasksStore";
import HomeButton from "@/components/HomeButton";
import { Task, TaskPriority } from "@shared/api";
import { Trash2, Plus, Check, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedList from "@/components/ui/AnimatedList";

type FilterStatus = "all" | "pending" | "completed" | "overdue";

const POPULAR_SUBJECTS = ["General", "Physics", "Chemistry", "Maths", "Biology", "English"];

export default function Tasks() {
  const { tasks, addTask, completeTask, uncompleteTask, deleteTask } =
    useTasksStore();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showFullForm, setShowFullForm] = useState(false);

  // Quick task state
  const [quickTitle, setQuickTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("General");
  const [customSubject, setCustomSubject] = useState("");
  const [quickDateOption, setQuickDateOption] = useState<"today" | "tomorrow" | "3days">("today");

  // Full form state
  const [formData, setFormData] = useState({
    deadlineTime: "",
    priority: "medium" as TaskPriority,
    notes: "",
  });

  const getTargetDate = (option: "today" | "tomorrow" | "3days") => {
    const d = new Date();
    if (option === "tomorrow") {
      d.setDate(d.getDate() + 1);
    } else if (option === "3days") {
      d.setDate(d.getDate() + 3);
    }
    return d;
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const subject = customSubject.trim() || selectedSubject;
    const deadline = getTargetDate(quickDateOption);

    addTask(
      quickTitle.trim(),
      subject,
      deadline,
      formData.priority,
      formData.notes.trim() || undefined,
      formData.deadlineTime || undefined
    );

    // Reset inputs
    setQuickTitle("");
    setCustomSubject("");
    setFormData({ deadlineTime: "", priority: "medium", notes: "" });
    setShowFullForm(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getTaskColor = (task: Task) => {
    if (task.status === "overdue") {
      return "border-status-overdue/30 bg-status-overdue/5";
    }
    if (task.status === "completed") {
      return "border-status-completed/30 bg-status-completed/5 opacity-60";
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 48) {
      return "border-status-due-soon/30 bg-status-due-soon/5";
    }

    return "border-border";
  };

  const getStatusBadge = (task: Task) => {
    if (task.status === "overdue") {
      return (
        <span className="text-xs font-semibold uppercase text-status-overdue">
          Overdue
        </span>
      );
    }
    if (task.status === "completed") {
      return (
        <span className="text-xs font-semibold uppercase text-status-completed">
          Completed
        </span>
      );
    }

    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysUntil = Math.ceil(hoursUntil / 24);

    if (hoursUntil < 48) {
      return (
        <span className="text-xs font-semibold uppercase text-status-due-soon">
          {daysUntil <= 0 ? "Due Today" : `${daysUntil}d left`}
        </span>
      );
    }

    return (
      <span className="text-xs font-semibold uppercase text-muted-foreground">
        {daysUntil}d away
      </span>
    );
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "text-status-overdue font-semibold";
      case "medium":
        return "text-muted-foreground";
      case "low":
        return "text-foreground/50";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Tasks</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
            </p>
          </div>
          <HomeButton />
        </div>

        {/* Quick Add Bar */}
        <div className="mb-6 rounded-2xl border border-border bg-card/80 backdrop-blur-md p-4 shadow-sm space-y-3">
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="⚡ Quick task e.g. Finish Physics Ch 3..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/90 px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </form>

          {/* Subject & Date Quick Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            {/* Subject Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-[11px] font-medium mr-1">Subject:</span>
              {POPULAR_SUBJECTS.map((subj) => (
                <button
                  type="button"
                  key={subj}
                  onClick={() => {
                    setSelectedSubject(subj);
                    setCustomSubject("");
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium transition-all text-[11px]",
                    selectedSubject === subj && !customSubject
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
                  )}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Quick Date Chips */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-medium mr-1">Due:</span>
              <button
                type="button"
                onClick={() => setQuickDateOption("today")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all",
                  quickDateOption === "today"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDateOption("tomorrow")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all",
                  quickDateOption === "tomorrow"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
                )}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDateOption("3days")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all",
                  quickDateOption === "3days"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-secondary/70 text-secondary-foreground hover:bg-secondary"
                )}
              >
                3 Days
              </button>
            </div>
          </div>

          {/* More Options Expand Toggle */}
          <div className="pt-1 border-t border-border/50 flex justify-end">
            <button
              type="button"
              onClick={() => setShowFullForm(!showFullForm)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 py-0.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{showFullForm ? "Less options" : "More details (time, notes, priority)"}</span>
              {showFullForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expanded Options */}
          {showFullForm && (
            <div className="pt-2 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Custom Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solve questions 1 to 5"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
          {(["all", "pending", "completed", "overdue"] as FilterStatus[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "No tasks yet! Type a quick task above and hit Enter."
                : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          <AnimatedList<Task>
            items={filteredTasks.slice().sort((a, b) => {
              const statusOrder: Record<string, number> = {
                overdue: 0,
                pending: 1,
                completed: 2,
              };
              const statusDiff =
                statusOrder[a.status] - statusOrder[b.status];
              if (statusDiff !== 0) return statusDiff;
              return (
                new Date(a.deadline).getTime() -
                new Date(b.deadline).getTime()
              );
            })}
            showGradients={false}
            enableArrowNavigation={true}
            displayScrollbar={true}
            renderItem={(task, _index, isSelected) => (
              <div
                className={cn(
                  "rounded-xl border bg-card/90 p-3.5 transition-all duration-150 group",
                  getTaskColor(task),
                  isSelected && "border-primary/50 ring-1 ring-primary/30",
                  task.status === "completed" && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      task.status === "completed"
                        ? uncompleteTask(task.id)
                        : completeTask(task.id);
                    }}
                    className={cn(
                      "mt-0.5 h-5 w-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all",
                      task.status === "completed"
                        ? "border-status-completed bg-status-completed"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {task.status === "completed" && (
                      <Check className="h-3.5 w-3.5 text-status-completed-foreground" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-medium text-sm text-foreground truncate",
                            task.status === "completed" &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {task.subject}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(task)}
                      </div>
                    </div>

                    {/* Deadline and Priority */}
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <span className="text-muted-foreground">
                        {new Date(task.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {task.deadlineTime && ` at ${task.deadlineTime}`}
                      </span>
                      <span
                        className={cn(
                          "uppercase text-[10px]",
                          getPriorityColor(task.priority)
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Notes */}
                    {task.notes && (
                      <p className="mt-2 text-[11px] text-muted-foreground bg-secondary/50 rounded-md px-2 py-1">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="mt-0.5 flex-shrink-0 p-1 text-muted-foreground transition-colors hover:text-status-overdue"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
