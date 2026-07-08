import { useState, useMemo } from "react";
import { Exam, EXAM_COLORS } from "@shared/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExamUrgency } from "@/lib/calculations";

interface ExamCalendarProps {
  exams: Exam[];
  onDateClick?: (date: Date) => void;
}

export function ExamCalendar({ exams, onDateClick }: ExamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create exam map by date for quick lookup
  const examsByDate = useMemo(() => {
    const map = new Map<string, Exam[]>();
    exams.forEach((exam) => {
      const examDate = new Date(exam.examDate);
      const dateKey = `${examDate.getFullYear()}-${examDate.getMonth()}-${examDate.getDate()}`;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(exam);
    });
    return map;
  }, [exams]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [startingDayOfWeek, daysInMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getExamsForDay = (day: number): Exam[] => {
    const dateKey = `${year}-${month}-${day}`;
    return examsByDate.get(dateKey) || [];
  };

  const getDayExam = (day: number): Exam | null => {
    const dayExams = getExamsForDay(day);
    if (dayExams.length === 0) return null;

    // Get most urgent exam on this day - use that exam's color
    const urgencies = dayExams.map((e) => ({
      exam: e,
      urgency: getExamUrgency(e.examDate),
    }));

    const critical = urgencies.find((u) => u.urgency === "critical");
    const urgent = urgencies.find((u) => u.urgency === "urgent");
    return critical?.exam || urgent?.exam || dayExams[0];
  };

  const monthName = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-secondary rounded-md transition-subtle"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2 py-1 text-xs font-medium border border-border rounded-md hover:bg-secondary transition-subtle"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-secondary rounded-md transition-subtle"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayExams = getExamsForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();
          const mainExam = dayExams.length > 0 ? dayExams[0] : null;

          return (
            <button
              key={day}
              onClick={() => {
                if (onDateClick) {
                  onDateClick(new Date(year, month, day));
                }
              }}
              style={
                mainExam
                  ? {
                      backgroundColor: EXAM_COLORS[mainExam.color].light,
                      borderColor: EXAM_COLORS[mainExam.color].border,
                      color: EXAM_COLORS[mainExam.color].dark,
                    }
                  : undefined
              }
              className={cn(
                "aspect-square rounded-md border transition-subtle flex flex-col items-center justify-center p-1 hover:opacity-85 cursor-pointer relative overflow-hidden",
                mainExam
                  ? "border-2"
                  : cn(
                      "border-border hover:border-primary/50",
                      isToday ? "bg-primary/5 border-primary" : ""
                    )
              )}
              title={dayExams.map((e) => e.subject).join(", ")}
            >
              {dayExams.length === 0 ? (
                <span className={cn("text-xs font-medium", isToday && "font-semibold")}>
                  {day}
                </span>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-0.5 text-center">
                  <span className="text-xs font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-semibold leading-tight truncate w-full px-0.5">
                    {dayExams[0].subject}
                  </span>
                  {dayExams.length > 1 && (
                    <span className="text-[9px] leading-none">+{dayExams.length - 1}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">Subject colors</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(EXAM_COLORS) as Array<keyof typeof EXAM_COLORS>).map(
            (color) => (
              <div
                key={color}
                style={{
                  backgroundColor: EXAM_COLORS[color].light,
                  borderColor: EXAM_COLORS[color].border,
                  color: EXAM_COLORS[color].dark,
                }}
                className="p-2 rounded-md text-xs font-semibold text-center border-2"
              >
                {EXAM_COLORS[color].label}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
