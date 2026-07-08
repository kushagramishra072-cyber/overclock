import { SleepLog } from "@shared/api";

interface SleepChartProps {
  logs: SleepLog[];
}

export function SleepChart({ logs }: SleepChartProps) {
  // Get last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Map logs to days
  const dataByDay = last7Days.map((date) => {
    const logForDay = logs.find(
      (log) => new Date(log.date).toDateString() === date.toDateString()
    );
    return {
      date,
      hours: logForDay ? logForDay.durationMinutes / 60 : 0,
    };
  });

  const maxHours = Math.max(...dataByDay.map((d) => d.hours), 10);
  const targetHours = 7;
  const chartHeight = 240; // pixels

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-6">Weekly Sleep Pattern</h2>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2" style={{ height: `${chartHeight}px` }}>
        {dataByDay.map((day) => {
          const barHeight = (day.hours / maxHours) * chartHeight;
          const isBelow = day.hours < targetHours && day.hours > 0;
          const isEmpty = day.hours === 0;
          
          let bgColor = "bg-border/30";
          if (!isEmpty) {
            bgColor = isBelow ? "bg-status-overdue" : "bg-status-completed";
          }

          return (
            <div 
              key={day.date.toISOString()} 
              className="flex-1 flex flex-col items-center gap-3"
            >
              {/* Bar container */}
              <div className="w-full flex items-end justify-center" style={{ height: `${chartHeight}px` }}>
                <div
                  className={`w-10 rounded-t-md transition-all ${bgColor}`}
                  style={{ height: `${barHeight}px`, minHeight: isEmpty ? "4px" : "8px" }}
                />
              </div>

              {/* Hours label */}
              <div className="text-center -mt-2">
                {day.hours > 0 ? (
                  <p className="text-xs font-semibold text-foreground">
                    {day.hours.toFixed(1)}h
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">-</p>
                )}
              </div>

              {/* Day label */}
              <p className="text-xs font-medium text-muted-foreground">
                {day.date.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border flex gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-status-completed" />
          <span className="text-xs text-muted-foreground">≥ 7 hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-status-overdue" />
          <span className="text-xs text-muted-foreground">&lt; 7 hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-border/30" />
          <span className="text-xs text-muted-foreground">No data</span>
        </div>
      </div>
    </div>
  );
}
