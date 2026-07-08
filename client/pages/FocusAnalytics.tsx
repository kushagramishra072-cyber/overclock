import { useFocusStore } from "@/hooks/useFocusStore";
import { TrendingUp, Award, Target } from "lucide-react";

export default function FocusAnalytics() {
  const { getLast7Days, getPatterns } = useFocusStore();

  const last7Days = getLast7Days();
  const patterns = getPatterns();

  const maxMinutes = Math.max(...last7Days.map((d) => d.totalMinutes), 180);
  const chartHeight = 200;

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Focus Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Your focus patterns and productivity insights
          </p>
        </div>

        {/* Weekly Average */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Weekly Average
              </label>
              <p className="text-4xl font-bold">
                {Math.round(patterns.weeklyAverage)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">minutes/day</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Focus Time (Last 7 Days)</h2>
          <div className="flex items-end justify-between gap-1" style={{ height: `${chartHeight}px` }}>
            {last7Days.map((day, idx) => {
              const barHeight = (day.totalMinutes / maxMinutes) * chartHeight;
              const isEmpty = day.totalMinutes === 0;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t-md transition-all hover:opacity-80"
                    style={{
                      height: `${barHeight}px`,
                      minHeight: isEmpty ? "4px" : "8px",
                      opacity: isEmpty ? 0.3 : 1,
                    }}
                    title={`${day.totalMinutes} minutes`}
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    {dayLabels[new Date(day.date).getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>0 min</span>
            <span>{Math.round(maxMinutes)} min</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {/* Longest Streak */}
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Longest Streak
            </label>
            <p className="text-3xl font-bold">{patterns.longestStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">consecutive days</p>
          </div>

          {/* Subject Count */}
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Subjects
            </label>
            <p className="text-3xl font-bold">
              {patterns.subjectRanking.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">tracked</p>
          </div>
        </div>

        {/* Strongest & Weakest Days */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Your Focus Patterns
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Strongest Day</span>
              <span className="font-semibold text-primary">
                {patterns.strongestDay}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Needs Improvement
              </span>
              <span className="font-semibold text-status-due-soon">
                {patterns.weakestDay}
              </span>
            </div>
          </div>
        </div>

        {/* Subject Ranking */}
        {patterns.subjectRanking.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Top Subjects by Focus
            </h2>
            <div className="space-y-3">
              {patterns.subjectRanking.slice(0, 5).map((subject, idx) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-semibold text-muted-foreground w-6">
                      #{idx + 1}
                    </span>
                    <span className="font-medium">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(subject.minutes / patterns.subjectRanking[0].minutes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {subject.minutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
