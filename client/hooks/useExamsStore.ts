import { useState, useEffect, useCallback } from "react";
import { Exam, ExamTopic, ExamColor } from "@shared/api";

const STORAGE_KEY = "student_survival_exams";

export function useExamsStore() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load exams from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as (Exam & { color?: string })[];
        // Convert date strings back to Date objects and add default color if missing
        const withDates = parsed.map((e) => ({
          ...e,
          color: (e.color || "blue") as ExamColor,
          examDate: new Date(e.examDate),
          createdAt: new Date(e.createdAt),
        }));
        setExams(withDates);
      } catch (error) {
        console.error("Failed to load exams:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist exams to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
    }
  }, [exams, isLoading]);

  const addExam = useCallback(
    (
      subject: string,
      examDate: Date,
      color: ExamColor = "blue",
      examTime?: string,
      topics?: string[],
      syllabus?: string
    ) => {
      const newExam: Exam = {
        id: crypto.randomUUID(),
        subject,
        examDate,
        color,
        examTime,
        topics: (topics || []).map((name) => ({
          id: crypto.randomUUID(),
          name,
          completed: false,
        })),
        syllabus,
        createdAt: new Date(),
      };

      setExams((prev) => [newExam, ...prev]);
      return newExam;
    },
    []
  );

  const updateExam = useCallback((id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((exam) => (exam.id === id ? { ...exam, ...updates } : exam))
    );
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => prev.filter((exam) => exam.id !== id));
  }, []);

  const addTopic = useCallback(
    (examId: string, topicName: string) => {
      setExams((prev) =>
        prev.map((exam) => {
          if (exam.id === examId) {
            return {
              ...exam,
              topics: [
                ...exam.topics,
                {
                  id: crypto.randomUUID(),
                  name: topicName,
                  completed: false,
                },
              ],
            };
          }
          return exam;
        })
      );
    },
    []
  );

  const toggleTopic = useCallback(
    (examId: string, topicId: string) => {
      setExams((prev) =>
        prev.map((exam) => {
          if (exam.id === examId) {
            return {
              ...exam,
              topics: exam.topics.map((topic) =>
                topic.id === topicId
                  ? { ...topic, completed: !topic.completed }
                  : topic
              ),
            };
          }
          return exam;
        })
      );
    },
    []
  );

  const deleteTopic = useCallback(
    (examId: string, topicId: string) => {
      setExams((prev) =>
        prev.map((exam) => {
          if (exam.id === examId) {
            return {
              ...exam,
              topics: exam.topics.filter((topic) => topic.id !== topicId),
            };
          }
          return exam;
        })
      );
    },
    []
  );

  return {
    exams,
    isLoading,
    addExam,
    updateExam,
    deleteExam,
    addTopic,
    toggleTopic,
    deleteTopic,
  };
}
