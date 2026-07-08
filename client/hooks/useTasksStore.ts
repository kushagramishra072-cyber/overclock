import { useState, useEffect, useCallback } from "react";
import { Task, TaskPriority, TaskStatus } from "@shared/api";

const STORAGE_KEY = "student_survival_tasks";

export function useTasksStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Task[];
        // Convert date strings back to Date objects
        const withDates = parsed.map((t) => ({
          ...t,
          deadline: new Date(t.deadline),
          createdAt: new Date(t.createdAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        }));
        setTasks(withDates);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  // Auto-delete completed tasks after 1 hour
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour in milliseconds

      setTasks((prev) => {
        const tasksToKeep = prev.filter((task) => {
          // Keep non-completed tasks
          if (task.status !== "completed") {
            return true;
          }

          // Keep completed tasks that were completed less than 1 hour ago
          if (!task.completedAt) {
            return true;
          }

          const completedTime = new Date(task.completedAt);
          return completedTime > oneHourAgo;
        });

        // If any tasks were removed, log it (for debugging)
        if (tasksToKeep.length < prev.length) {
          const deletedCount = prev.length - tasksToKeep.length;
          console.info(
            `Auto-deleted ${deletedCount} completed task${deletedCount !== 1 ? "s" : ""}`
          );
        }

        return tasksToKeep;
      });
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  // Update task status based on deadline
  const updateTaskStatus = useCallback((task: Task): TaskStatus => {
    if (task.status === "completed") return "completed";

    const now = new Date();
    const deadlineDate = new Date(task.deadline);

    if (deadlineDate < now) {
      return "overdue";
    }
    return "pending";
  }, []);

  const addTask = useCallback(
    (
      title: string,
      subject: string,
      deadline: Date,
      priority: TaskPriority,
      notes?: string,
      deadlineTime?: string
    ) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        subject,
        deadline,
        deadlineTime,
        priority,
        status: updateTaskStatus({ deadline } as Task),
        notes,
        createdAt: new Date(),
      };

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [updateTaskStatus]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            const updated = { ...task, ...updates };
            // Recalculate status based on deadline
            if (updates.deadline || updates.status) {
              updated.status = updateTaskStatus(updated);
            }
            return updated;
          }
          return task;
        })
      );
    },
    [updateTaskStatus]
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: "completed" as TaskStatus,
            completedAt: new Date(),
          };
        }
        return task;
      })
    );
  }, []);

  const uncompleteTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status: updateTaskStatus(task),
            completedAt: undefined,
          };
        }
        return task;
      })
    );
  }, [updateTaskStatus]);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
  };
}
