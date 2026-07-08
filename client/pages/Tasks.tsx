import { useState, useEffect } from "react";
import { useTasksStore } from "@/hooks/useTasksStore";
import HomeButton from "@/components/HomeButton";
import { Task, TaskPriority } from "@shared/api";
import { Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "completed" | "overdue";

export default function Tasks() {
  const { tasks, addTask, completeTask, uncompleteTask, deleteTask } =
    useTasksStore();

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    deadline: "",
    deadlineTime: "",
    priority: "medium" as TaskPriority,
    notes: "",
  });

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.deadline) {
      return;
    }

    addTask(
      formData.title,
      formData.subject,
      new Date(formData.deadline),
      formData.priority,
      formData.notes,
      formData.deadlineTime
    );

    setFormData({
      title: "",
      subject: "",
      deadline: "",
      deadlineTime: "",
      priority: "medium",
      notes: "",
    });
    setShowForm(false);
  };

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
          {daysUntil}d left
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
        return "text-status-overdue";
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
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {tasks.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
            <HomeButton />
          </div>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl glass p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="Task title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mathematics"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
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
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
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
                  value={formData.deadlineTime}
                  onChange={(e) =>
                    setFormData({ ...formData, deadlineTime: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Notes (optional)
              </label>
              <textarea
                placeholder="Add any notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Create Task
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

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {(["all", "pending", "completed", "overdue"] as FilterStatus[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-subtle",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:bg-secondary"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-lg glass p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No {filter !== "all" ? filter : ""} tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks
              .sort((a, b) => {
                // Sort by status (overdue first, then due soon, then pending, then completed)
                const statusOrder: Record<string, number> = {
                  overdue: 0,
                  pending: 1,
                  completed: 2,
                };
                const statusDiff =
                  statusOrder[a.status] - statusOrder[b.status];
                if (statusDiff !== 0) return statusDiff;

                // Then by deadline
                return (
                  new Date(a.deadline).getTime() -
                  new Date(b.deadline).getTime()
                );
              })
              .map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "rounded-2xl glass p-4 transition-all duration-300 hover:shadow-lg group",
                    getTaskColor(task),
                    task.status === "completed" && "pointer-events-none opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        task.status === "completed"
                          ? uncompleteTask(task.id)
                          : completeTask(task.id)
                      }
                      className={cn(
                        "mt-1 h-6 w-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-subtle",
                        task.status === "completed"
                          ? "border-status-completed bg-status-completed"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {task.status === "completed" && (
                        <Check className="h-4 w-4 text-status-completed-foreground" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className={cn(
                              "font-semibold",
                              task.status === "completed" &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {task.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.subject}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(task)}
                        </div>
                      </div>

                      {/* Deadline and Priority */}
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">
                          {new Date(task.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {task.deadlineTime && ` at ${task.deadlineTime}`}
                        </span>
                        <span
                          className={cn(
                            "font-medium uppercase",
                            getPriorityColor(task.priority)
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Notes */}
                      {task.notes && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {task.notes}
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="mt-1 flex-shrink-0 p-1 text-muted-foreground transition-subtle hover:text-status-overdue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
