import { ScheduleClass, DayOfWeek } from "@shared/api";
import { Trash2 } from "lucide-react";

const DAYS: { day: DayOfWeek; label: string }[] = [
  { day: "monday", label: "Mon" },
  { day: "tuesday", label: "Tue" },
  { day: "wednesday", label: "Wed" },
  { day: "thursday", label: "Thu" },
  { day: "friday", label: "Fri" },
  { day: "saturday", label: "Sat" },
  { day: "sunday", label: "Sun" },
];

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 80; // pixels

interface ScheduleTimelineProps {
  classes: ScheduleClass[];
  onDelete: (id: string) => void;
}

export function ScheduleTimeline({ classes, onDelete }: ScheduleTimelineProps) {
  const timeSlots = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  const getClassesForDay = (day: DayOfWeek) => {
    return classes.filter((c) => c.day === day);
  };

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const getBlockStyle = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    
    // Calculate top position (offset within hour)
    const topOffset = (startMin / 60) * HOUR_HEIGHT;
    
    // Calculate height
    const duration = endMinutes - startMinutes;
    const heightPercent = (duration / 60) * HOUR_HEIGHT;
    
    // Calculate which row it starts in
    const rowOffset = Math.max(0, startHour - START_HOUR) * HOUR_HEIGHT;

    return {
      top: `${rowOffset + topOffset}px`,
      height: `${Math.max(40, heightPercent)}px`,
    };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Header with day labels */}
        <div className="flex sticky top-0 bg-background z-10">
          <div className="w-16 flex-shrink-0 border-b border-border" />
          {DAYS.map(({ label }) => (
            <div
              key={label}
              className="w-40 flex-shrink-0 text-center py-3 font-semibold text-sm border-b border-border border-r"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="flex relative">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="text-right text-xs text-muted-foreground font-medium pr-2 border-b border-border"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                <div className="pt-1">{String(hour).padStart(2, "0")}:00</div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex relative">
            {DAYS.map(({ day }) => (
              <div key={day} className="w-40 flex-shrink-0 relative border-r border-border">
                {/* Hour rows background */}
                {timeSlots.map((hour) => (
                  <div
                    key={`${day}-${hour}`}
                    className="border-b border-border"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Classes overlay - absolute positioned */}
                <div className="absolute inset-0">
                  {getClassesForDay(day).map((classItem) => {
                    const style = getBlockStyle(classItem.startTime, classItem.endTime);
                    return (
                      <div
                        key={classItem.id}
                        className="absolute left-1 right-1 bg-primary/15 border border-primary/40 rounded-md p-2 text-xs flex flex-col justify-between group hover:bg-primary/25 transition-colors cursor-default"
                        style={style}
                      >
                        <div className="truncate">
                          <p className="font-semibold text-foreground truncate">
                            {classItem.subject}
                          </p>
                          <p className="text-muted-foreground text-[10px] truncate">
                            {classItem.startTime} - {classItem.endTime}
                          </p>
                          {classItem.room && (
                            <p className="text-muted-foreground text-[9px] truncate">
                              {classItem.room}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onDelete(classItem.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:opacity-70 text-[9px] flex items-center gap-0.5 mt-1 self-start"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
