import { useEffect, useState } from "react";

export interface SubjectSyllabus {
  id: string;
  subject: string;
  chapters: {
    id: string;
    name: string;
    completed: boolean;
    difficulty: "easy" | "medium" | "hard";
  }[];
  completionPercent: number;
  weakTopics: string[];
  lastRevisedDate: string;
  totalStudyHours: number;
  examDate?: string;
  color?: string;
}

const STORAGE_KEY = "student_survival_subjects";

export const useSubjectStore = () => {
  const [subjects, setSubjects] = useState<SubjectSyllabus[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSubjects(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse subjects:", e);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = (
    subject: string,
    chapters: string[] = [],
    examDate?: string,
    color?: string
  ) => {
    const newSubject: SubjectSyllabus = {
      id: Date.now().toString(),
      subject,
      chapters: chapters.map((ch, idx) => ({
        id: `ch_${idx}`,
        name: ch,
        completed: false,
        difficulty: "medium",
      })),
      completionPercent: 0,
      weakTopics: [],
      lastRevisedDate: new Date().toISOString().split("T")[0],
      totalStudyHours: 0,
      examDate,
      color,
    };
    setSubjects([...subjects, newSubject]);
    return newSubject.id;
  };

  const toggleChapter = (subjectId: string, chapterId: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          const updated = {
            ...s,
            chapters: s.chapters.map((ch) =>
              ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
            ),
          };
          // Recalculate completion percent
          const completed = updated.chapters.filter((ch) => ch.completed).length;
          updated.completionPercent = Math.round(
            (completed / updated.chapters.length) * 100
          );
          updated.lastRevisedDate = new Date().toISOString().split("T")[0];
          return updated;
        }
        return s;
      })
    );
  };

  const addWeakTopic = (subjectId: string, topic: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          const weakTopics = [...(s.weakTopics || [])];
          if (!weakTopics.includes(topic)) {
            weakTopics.push(topic);
          }
          return { ...s, weakTopics };
        }
        return s;
      })
    );
  };

  const removeWeakTopic = (subjectId: string, topic: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            weakTopics: s.weakTopics.filter((t) => t !== topic),
          };
        }
        return s;
      })
    );
  };

  const updateStudyHours = (subjectId: string, hours: number) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            totalStudyHours: s.totalStudyHours + hours,
            lastRevisedDate: new Date().toISOString().split("T")[0],
          };
        }
        return s;
      })
    );
  };

  const getSubjectProgress = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return null;

    const completed = subject.chapters.filter((ch) => ch.completed).length;
    const total = subject.chapters.length;

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      weakTopics: subject.weakTopics || [],
      lastRevised: subject.lastRevisedDate,
      totalHours: subject.totalStudyHours,
    };
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter((s) => s.id !== subjectId));
  };

  return {
    subjects,
    addSubject,
    toggleChapter,
    addWeakTopic,
    removeWeakTopic,
    updateStudyHours,
    getSubjectProgress,
    deleteSubject,
  };
};
