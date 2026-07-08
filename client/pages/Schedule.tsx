import { useState } from "react";
import { useScheduleStore } from "@/hooks/useScheduleStore";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import HomeButton from "@/components/HomeButton";
import { DayOfWeek } from "@shared/api";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS: { day: DayOfWeek; label: string }[] = [
  { day: "monday", label: "Mon" },
  { day: "tuesday", label: "Tue" },
  { day: "wednesday", label: "Wed" },
  { day: "thursday", label: "Thu" },
  { day: "friday", label: "Fri" },
  { day: "saturday", label: "Sat" },
  { day: "sunday", label: "Sun" },
];

export default function Schedule() {
  const { classes, addClass, deleteClass } = useScheduleStore();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    day: "monday" as DayOfWeek,
    startTime: "",
    endTime: "",
    room: "",
  });

  const addDemoClasses = () => {
    addClass("Physics", "monday", "09:00", "10:30", "A-101");
    addClass("Chemistry", "monday", "11:00", "12:30", "B-205");
    addClass("Math", "tuesday", "08:00", "09:30", "C-302");
    addClass("English", "wednesday", "10:00", "11:30", "D-101");
    addClass("History", "thursday", "13:00", "14:30", "A-205");
    addClass("Biology", "friday", "09:00", "10:30", "E-101");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.startTime || !formData.endTime) {
      return;
    }

    addClass(
      formData.subject,
      formData.day,
      formData.startTime,
      formData.endTime,
      formData.room || undefined
    );

    setFormData({
      subject: "",
      day: "monday",
      startTime: "",
      endTime: "",
      room: "",
    });
    setShowForm(false);
  };


  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-sm text-muted-foreground">
              {classes.length} classes total
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={addDemoClasses}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-subtle hover:opacity-90"
            >
              Demo Data
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Class
            </button>
            <HomeButton />
          </div>
        </div>

        {/* Add Class Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl glass p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Physics, History"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Day
              </label>
              <select
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value as DayOfWeek })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DAYS.map(({ day, label }) => (
                  <option key={day} value={day}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Room (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., A-101"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-subtle hover:opacity-90"
              >
                Add Class
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

        {/* Weekly Schedule Timeline */}
        {classes.length === 0 ? (
          <div className="rounded-lg glass p-8 text-center">
            <p className="text-sm text-muted-foreground">No classes scheduled</p>
          </div>
        ) : (
          <div className="rounded-lg glass overflow-hidden">
            <ScheduleTimeline classes={classes} onDelete={deleteClass} />
          </div>
        )}
      </div>
    </div>
  );
}
