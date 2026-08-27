import { useState, useEffect } from "react";
import { useTimerStore, audioSynth } from "@/hooks/useTimerStore";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useExamsStore } from "@/hooks/useExamsStore";
import HomeButton from "@/components/HomeButton";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Sparkles,
  Zap,
  Brain,
  AlertTriangle,
  Clock,
  Star,
  CheckCircle2,
  Flame,
  BookOpen,
  CheckSquare2,
  Volume2,
  VolumeX,
  Coffee,
  Battery,
  ChevronDown,
  ChevronUp,
  Sliders,
  History,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdaptiveTimer() {
  const {
    activeTimer,
    startActiveTimer,
    pauseActiveTimer,
    resumeActiveTimer,
    addExtraMinutes,
    stopActiveTimer,
    getTodaySessions,
    getStats,
    getFocusStaminaInfo,
    calculateSmartBreak,
    getOptimalDuration,
  } = useTimerStore();

  const { tasks } = useTasksStore();
  const { exams } = useExamsStore();

  const [subjectInput, setSubjectInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<"normal" | "deep-work" | "crisis">("normal");
  const [durationInput, setDurationInput] = useState(25);
  const [activeSound, setActiveSound] = useState<"off" | "brown" | "white" | "binaural">("off");

  // Collapsible sections state for zero clutter
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Post-Session Reflection Modal State
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [lastFinishedInfo, setLastFinishedInfo] = useState<{
    subject: string;
    duration: number;
    timerType: "focus" | "break";
  } | null>(null);

  const [starRating, setStarRating] = useState(5);
  const [goalCompleted, setGoalCompleted] = useState<"yes" | "partial" | "no">("yes");
  const [reflectionNotes, setReflectionNotes] = useState("");

  // Live countdown state
  const [secondsLeft, setSecondsLeft] = useState(0);

  const stats = getStats();
  const todaySessions = getTodaySessions();
  const staminaInfo = getFocusStaminaInfo();
  const optimalInfo = getOptimalDuration(subjectInput);

  // Sync initial duration with AI recommendation on subject change or mount
  useEffect(() => {
    if (!activeTimer && durationInput === 25) {
      setDurationInput(optimalInfo.recommendedDuration);
    }
  }, [subjectInput, optimalInfo.recommendedDuration, activeTimer]);

  // Background-aware live clock ticker
  useEffect(() => {
    if (!activeTimer) {
      setSecondsLeft(0);
      document.title = "Overclock";
      return;
    }

    const updateRemaining = () => {
      let secs = 0;
      if (activeTimer.isPaused) {
        secs = activeTimer.remainingSecondsWhenPaused;
      } else {
        const now = Date.now();
        secs = Math.max(0, Math.round((activeTimer.targetEndTime - now) / 1000));
      }

      setSecondsLeft(secs);

      // Update Browser Tab Title
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      const formatted = `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      const prefix = activeTimer.timerType === "break" ? "☕ Break" : "🎯 Focus";
      document.title = `(${formatted}) ${prefix} - ${activeTimer.subject}`;

      // Handle Timer Completion
      if (secs === 0 && !activeTimer.isPaused && activeTimer.isRunning) {
        audioSynth.playChime();

        // Browser Desktop Notification
        if ("Notification" in window && Notification.permission === "granted") {
          const title =
            activeTimer.timerType === "break"
              ? "☕ Break Time Completed!"
              : "🎯 Focus Session Complete!";
          const body =
            activeTimer.timerType === "break"
              ? "Feeling refreshed? Ready for your next focus session."
              : `Great work on ${activeTimer.subject}! Time for a well-earned break.`;

          new Notification(title, { body });
        }

        setLastFinishedInfo({
          subject: activeTimer.subject,
          duration: activeTimer.plannedDuration,
          timerType: activeTimer.timerType,
        });

        stopActiveTimer(true);

        if (activeTimer.timerType === "focus") {
          setShowReflectionModal(true);
        }
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => {
      clearInterval(interval);
      document.title = "Overclock";
    };
  }, [activeTimer, stopActiveTimer]);

  // Handle ambient sound toggle
  const toggleAmbientSound = (sound: "off" | "brown" | "white" | "binaural") => {
    setActiveSound(sound);
    if (sound === "off") {
      audioSynth.stopSound();
    } else {
      audioSynth.startSound(sound);
    }
  };

  // Start Focus Session
  const handleStartFocus = (customDuration?: number) => {
    const subj = subjectInput.trim() || "General Study";
    const dur = customDuration || durationInput || 25;
    startActiveTimer(subj, selectedMode, dur, "focus");
  };

  // Start Break Session
  const handleStartBreak = (breakMinutes?: number) => {
    const brk = breakMinutes || calculateSmartBreak(durationInput);
    startActiveTimer("Rest & Recovery", "break", brk, "break");
  };

  // Submit Post-Session Reflection
  const handleReflectionSubmit = (andStartBreak = false) => {
    setShowReflectionModal(false);

    if (andStartBreak && lastFinishedInfo) {
      const breakMins = calculateSmartBreak(lastFinishedInfo.duration);
      handleStartBreak(breakMins);
    }

    // Reset reflection form
    setStarRating(5);
    setGoalCompleted("yes");
    setReflectionNotes("");
    setLastFinishedInfo(null);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalPlannedSecs = activeTimer ? activeTimer.plannedDuration * 60 : 1;
  const progressPercent = activeTimer
    ? Math.min(100, Math.max(0, ((totalPlannedSecs - secondsLeft) / totalPlannedSecs) * 100))
    : 0;

  const uncompletedTasks = tasks.filter((t) => t.status !== "completed").slice(0, 3);
  const upcomingExams = exams.slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto max-w-xl px-4 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                AI Study Coach
              </h1>
              <p className="text-xs text-muted-foreground">
                Smart adaptive focus & break intervals
              </p>
            </div>
          </div>
          <HomeButton />
        </div>

        {/* COMPACT AI COACH BANNER */}
        <div className="rounded-2xl border border-primary/20 bg-zinc-900/90 backdrop-blur-xl p-3.5 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-bold text-foreground">AI Coach Recommendation: </span>
              <span className="text-muted-foreground truncate">
                {optimalInfo.recommendedDuration}m Focus ({optimalInfo.recommendedBreak}m Break)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0 border border-amber-400/20">
            <Battery className="w-3.5 h-3.5" />
            <span>{staminaInfo.stamina}%</span>
          </div>
        </div>

        {/* ACTIVE TIMER RUNNING VIEW */}
        {activeTimer ? (
          <div
            className={cn(
              "rounded-3xl border backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6 transition-all",
              activeTimer.timerType === "break"
                ? "border-emerald-500/30 bg-emerald-950/20"
                : activeTimer.mode === "crisis"
                ? "border-rose-500/30 bg-rose-950/20"
                : activeTimer.mode === "deep-work"
                ? "border-amber-500/30 bg-amber-950/20"
                : "border-primary/30 bg-zinc-900/90"
            )}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                  activeTimer.timerType === "break"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : activeTimer.mode === "crisis"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : activeTimer.mode === "deep-work"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-primary/10 border-primary/30 text-primary"
                )}
              >
                {activeTimer.timerType === "break" ? (
                  <>
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Smart Recovery</span>
                  </>
                ) : activeTimer.mode === "crisis" ? (
                  <>
                    <Flame className="w-3.5 h-3.5" />
                    <span>Crisis Sprint</span>
                  </>
                ) : activeTimer.mode === "deep-work" ? (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    <span>Deep Flow</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Focus Session</span>
                  </>
                )}
              </span>

              {activeTimer.isPaused && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Paused
                </span>
              )}
            </div>

            {/* Subject Title */}
            <div>
              <h2 className="text-2xl font-black text-foreground truncate px-2">
                {activeTimer.subject}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Planned {activeTimer.plannedDuration} min session
              </p>
            </div>

            {/* CIRCULAR TIMER DISPLAY */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-zinc-800"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={cn(
                    "transition-all duration-1000 ease-linear",
                    activeTimer.timerType === "break"
                      ? "stroke-emerald-400"
                      : activeTimer.mode === "crisis"
                      ? "stroke-rose-500"
                      : activeTimer.mode === "deep-work"
                      ? "stroke-amber-400"
                      : "stroke-primary"
                  )}
                  strokeWidth="7"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {Math.round(progressPercent)}% complete
                </span>
              </div>
            </div>

            {/* AMBIENT FOCUS SOUND GENERATOR */}
            {activeTimer.timerType === "focus" && (
              <div className="pt-1">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {[
                    { id: "off", label: "Mute", icon: VolumeX },
                    { id: "brown", label: "Brown Noise", icon: Volume2 },
                    { id: "white", label: "White Noise", icon: Volume2 },
                    { id: "binaural", label: "Alpha Waves", icon: Zap },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleAmbientSound(s.id as any)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-all flex items-center gap-1 active:scale-95",
                        activeSound === s.id
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-white/10 bg-zinc-950 text-zinc-400 hover:text-white"
                      )}
                    >
                      <s.icon className="w-3 h-3" />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TIMER CONTROLS */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeTimer.isPaused ? (
                <button
                  onClick={resumeActiveTimer}
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseActiveTimer}
                  className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => addExtraMinutes(5)}
                className="rounded-2xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-foreground px-4 py-3 font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                title="Add 5 minutes to timer"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>+5m</span>
              </button>

              <button
                onClick={() => stopActiveTimer(false)}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-3 font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          /* UNCLUTTERED, ULTRA-SIMPLE SETUP CARD */
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Subject Input / Quick Picker */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                What are you studying?
              </label>
              <input
                type="text"
                placeholder="e.g., Quantum Physics, Calculus..."
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                className="w-full rounded-2xl border border-input bg-zinc-950 px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
              />

              {/* Quick Pickers */}
              {(uncompletedTasks.length > 0 || upcomingExams.length > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {upcomingExams.map((exam) => (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => {
                        setSubjectInput(exam.subject);
                        const opt = getOptimalDuration(exam.subject);
                        setDurationInput(opt.recommendedDuration);
                      }}
                      className="px-2.5 py-1 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium transition-all flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{exam.subject}</span>
                    </button>
                  ))}

                  {uncompletedTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setSubjectInput(task.title);
                        const opt = getOptimalDuration(task.title);
                        setDurationInput(opt.recommendedDuration);
                      }}
                      className="px-2.5 py-1 rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-all flex items-center gap-1"
                    >
                      <CheckSquare2 className="w-3 h-3 text-primary" />
                      <span className="truncate max-w-[130px]">{task.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DURATION SELECTION CHIPS */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Focus Duration
                </label>
                <span className="text-xs font-bold text-primary">
                  {durationInput} Minutes
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { mins: 15, label: "15m Sprint" },
                  { mins: optimalInfo.recommendedDuration, label: `${optimalInfo.recommendedDuration}m AI`, isOptimal: true },
                  { mins: 45, label: "45m Deep" },
                  { mins: 60, label: "60m Flow" },
                ].map((item) => (
                  <button
                    key={item.mins}
                    type="button"
                    onClick={() => setDurationInput(item.mins)}
                    className={cn(
                      "py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 text-center flex flex-col items-center justify-center gap-0.5",
                      durationInput === item.mins
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : item.isOptimal
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "border-white/10 bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                    )}
                  >
                    <span>{item.mins}m</span>
                    <span className="text-[9px] opacity-80 font-normal">
                      {item.isOptimal ? "★ Optimal" : item.label.split(" ")[1] || ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* PRIMARY ONE-CLICK ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleStartFocus()}
                className="rounded-2xl bg-primary hover:opacity-95 text-primary-foreground py-3.5 font-extrabold text-sm transition-all shadow-lg shadow-primary/20 active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartBreak()}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 py-3.5 font-bold text-sm transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Take Rest ({calculateSmartBreak(durationInput)}m)</span>
              </button>
            </div>

            {/* TOGGLE ADVANCED SETTINGS */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Intensity Mode & Custom Slider</span>
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="pt-3 space-y-4 animate-in fade-in duration-200">
                  {/* Intensity selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Session Mode
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "normal", label: "Normal", icon: Zap },
                        { id: "deep-work", label: "Deep Flow", icon: Brain },
                        { id: "crisis", label: "Crisis Push", icon: Flame },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMode(m.id as any)}
                          className={cn(
                            "p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            selectedMode === m.id
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/5 bg-zinc-950 text-muted-foreground"
                          )}
                        >
                          <m.icon className="w-3.5 h-3.5" />
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase">
                      <span>Exact Minutes</span>
                      <span>{durationInput}m</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={durationInput}
                      onChange={(e) => setDurationInput(parseInt(e.target.value) || 25)}
                      className="w-full accent-primary h-2 bg-zinc-950 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COLLAPSIBLE ANALYTICS & HISTORY LOG */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-5 shadow-xl space-y-3">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-sm font-bold text-foreground"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Daily Stats & History Log ({stats.totalSessionsToday} Done)</span>
            </span>
            {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {showHistory && (
            <div className="pt-2 space-y-4 animate-in fade-in duration-200">
              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-white/5">
                  <span className="text-[10px] text-muted-foreground font-bold block uppercase">Focus</span>
                  <span className="text-base font-black text-foreground">{stats.totalFocusMinutes} min</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-white/5">
                  <span className="text-[10px] text-muted-foreground font-bold block uppercase">Rest</span>
                  <span className="text-base font-black text-emerald-400">{stats.totalBreakMinutes} min</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-white/5">
                  <span className="text-[10px] text-muted-foreground font-bold block uppercase">Peak Hour</span>
                  <span className="text-base font-black text-primary truncate block">{stats.peakFocusTime}</span>
                </div>
              </div>

              {/* History sessions list */}
              {todaySessions.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {todaySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-zinc-950"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="font-bold text-xs text-foreground truncate">{session.subject}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {session.timerType === "break" ? "Rest Break" : session.mode}
                          </span>
                          {session.qualityRating && (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {session.qualityRating}/5
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-foreground shrink-0">
                        {session.actualDuration || session.plannedDuration}m
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No completed sessions today yet. Start your first sprint above!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POST-SESSION REFLECTION MODAL */}
      {showReflectionModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowReflectionModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl p-6 shadow-2xl space-y-5 text-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-black text-foreground">Session Reflection</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {lastFinishedInfo?.subject} ({lastFinishedInfo?.duration}m Focus)
              </p>
            </div>

            {/* Quality Rating Stars */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                How focused were you?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setStarRating(star)}
                    className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        star <= starRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-zinc-700"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-medium text-amber-300">
                {starRating === 5
                  ? "🔥 Pure Flow State!"
                  : starRating === 4
                  ? "⚡ Highly Productive"
                  : starRating === 3
                  ? "👍 Moderate Focus"
                  : starRating === 2
                  ? "😐 Minor Distractions"
                  : "😴 Low Energy"}
              </p>
            </div>

            {/* Goal completed */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Did you complete your goal?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "yes", label: "Yes", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
                  { id: "partial", label: "Partial", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
                  { id: "no", label: "No", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
                ].map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setGoalCompleted(g.id as any)}
                    className={cn(
                      "py-2 rounded-xl border text-xs font-bold transition-all",
                      goalCompleted === g.id
                        ? g.color
                        : "border-white/10 bg-zinc-950 text-zinc-400 hover:text-white"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1 text-left">
              <input
                type="text"
                placeholder="Optional notes (distractions/successes)..."
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                className="w-full rounded-xl border border-input bg-zinc-950 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleReflectionSubmit(true)}
                className="w-full rounded-2xl bg-emerald-500 text-black py-3 font-extrabold text-xs hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Coffee className="w-4 h-4" />
                <span>
                  Start Smart Break ({lastFinishedInfo ? calculateSmartBreak(lastFinishedInfo.duration) : 5}m)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleReflectionSubmit(false)}
                className="w-full rounded-2xl border border-white/10 bg-zinc-800 py-2.5 font-semibold text-xs text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                Save Reflection & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
