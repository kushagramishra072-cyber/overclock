import { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw } from "lucide-react";

interface DeepFocusProps {
  isOpen: boolean;
  onClose: () => void;
  initialDuration?: number;
}

export default function DeepFocusMode({ isOpen, onClose, initialDuration = 25 }: DeepFocusProps) {
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Session complete
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = ((initialDuration * 60 - timeLeft) / (initialDuration * 60)) * 100;

  return (
    <div className="focus-mode-overlay">
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-3 glass hover:bg-white/20 dark:hover:bg-black/40 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main focus display */}
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Countdown ring */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(220, 90%, 56%)"
              strokeWidth="8"
              strokeDasharray={`${565.48 * (progress / 100)} 565.48`}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 1s linear",
                filter: "drop-shadow(0 0 20px hsl(220, 90%, 56% / 0.6))",
              }}
            />
          </svg>

          {/* Center time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold font-mono text-white">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
              Focus Time
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/15 dark:hover:bg-black/30 transition-all hover:scale-110 active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Start
              </>
            )}
          </button>

          <button
            onClick={() => {
              setTimeLeft(initialDuration * 60);
              setIsRunning(false);
              setTotalElapsed(0);
            }}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/15 dark:hover:bg-black/30 transition-all hover:scale-110 active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
            Reset
          </button>
        </div>

        {/* Stats */}
        <div className="text-center text-muted-foreground">
          <p className="text-lg">
            {Math.floor(totalElapsed / 60)}m {totalElapsed % 60}s elapsed
          </p>
        </div>
      </div>
    </div>
  );
}
