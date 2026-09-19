import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Timer, Plus, Minus, ArrowLeftRight, SkipForward, FileText, 
  HelpCircle, CheckCircle2, ChevronRight, Calculator,
  Volume2, VolumeX, Sparkles, Check, Palette, Dumbbell, Zap, Trash2
} from 'lucide-react';
import { WorkoutExercise, Exercise } from '../types';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { DesignSystemModal } from './DesignSystemModal';
import { useTheme } from '../context/ThemeContext';
import { useDataFactory } from '../context/DataFactoryContext';

interface GymModeViewProps {
  workout: WorkoutExercise[];
  onFinishWorkout: (completedWorkout?: WorkoutExercise[]) => void;
  onExitGymMode: () => void;
  onSwapExercise: (exerciseIndex: number, newExercise: Exercise) => void;
}

export const GymModeView: React.FC<GymModeViewProps> = ({
  workout,
  onFinishWorkout,
  onExitGymMode,
  onSwapExercise,
}) => {
  const { activeOption } = useTheme();
  const { 
    updateActiveWorkoutSet, 
    quickFillAllSets, 
    finishActiveWorkout, 
    activePersona,
    addSetToExercise,
    removeSetFromExercise,
  } = useDataFactory();
  const [showDesignModal, setShowDesignModal] = useState<boolean>(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);

  // Active workout exercises state
  const [exercisesState, setExercisesState] = useState<WorkoutExercise[]>(workout);

  // Compute a structural signature of the workout so that set completions don't reset the current index
  const workoutRoutineSignature = useMemo(() => {
    return workout.map(w => `${w.exercise.id}_${w.sets.length}`).join('::');
  }, [workout]);

  const prevRoutineSignatureRef = useRef<string>(workoutRoutineSignature);

  // Sync state when external workout changes, but ONLY reset indices if the routine structure itself changed
  useEffect(() => {
    setExercisesState(workout);
    if (prevRoutineSignatureRef.current !== workoutRoutineSignature) {
      prevRoutineSignatureRef.current = workoutRoutineSignature;
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
    }
  }, [workout, workoutRoutineSignature]);

  // Active exercise & set (guaranteed bounds safe)
  const safeExerciseIndex = Math.min(currentExerciseIndex, Math.max(0, exercisesState.length - 1));
  const activeExerciseData = exercisesState[safeExerciseIndex] || exercisesState[0];
  const safeSetIndex = Math.min(currentSetIndex, Math.max(0, (activeExerciseData?.sets?.length || 1) - 1));
  const activeSet = activeExerciseData?.sets[safeSetIndex] || activeExerciseData?.sets[0];

  // Editable set values
  const [weightKg, setWeightKg] = useState<number>(activeSet?.weightKg || 82.5);
  const [reps, setReps] = useState<number>(activeSet?.reps || 6);
  const [rir, setRir] = useState<number>(activeSet?.rir ?? 2);
  const [notes, setNotes] = useState<string>(activeExerciseData?.notes || '');
  const [showNotesInput, setShowNotesInput] = useState<boolean>(false);

  // Modals & Drawers
  const [showPlateCalc, setShowPlateCalc] = useState<boolean>(false);
  const [showSwapDrawer, setShowSwapDrawer] = useState<boolean>(false);
  const [showCueDrawer, setShowCueDrawer] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Set completion celebration feedback
  const [justCompletedSetId, setJustCompletedSetId] = useState<string | null>(null);

  // Sync state when exercise or set index changes
  useEffect(() => {
    if (activeSet) {
      setWeightKg(activeSet.weightKg);
      setReps(activeSet.reps);
      setRir(activeSet.rir ?? 2);
    }
    if (activeExerciseData) {
      setNotes(activeExerciseData.notes || '');
    }
  }, [safeExerciseIndex, safeSetIndex, activeSet?.id]);

  // Rest Timer countdown effect
  useEffect(() => {
    if (isRestTimerActive && restSecondsRemaining > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired
            if (soundEnabled) {
              playBeepSound();
            }
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRestTimerActive, restSecondsRemaining, soundEnabled]);

  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio context may be restricted before user interaction
    }
  };

  const startRestTimer = (seconds: number) => {
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
  };

  const handleCompleteSet = (targetSetIdx: number = safeSetIndex) => {
    if (!activeExerciseData) return;
    const targetSet = activeExerciseData.sets[targetSetIdx];
    if (!targetSet) return;

    // Use current stepper values if completing the currently focused set; otherwise use that set's current values
    const logWeight = targetSetIdx === safeSetIndex ? weightKg : targetSet.weightKg;
    const logReps = targetSetIdx === safeSetIndex ? reps : targetSet.reps;
    const logRir = targetSetIdx === safeSetIndex ? rir : (targetSet.rir ?? 2);
    const logRpe = 10 - logRir;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update active set in state
    const updatedExercises = [...exercisesState];
    const targetExercise = { ...updatedExercises[safeExerciseIndex] };
    const updatedSets = [...targetExercise.sets];

    updatedSets[targetSetIdx] = {
      ...updatedSets[targetSetIdx],
      weightKg: logWeight,
      reps: logReps,
      rir: logRir,
      rpe: logRpe,
      completed: true,
      timestamp: nowTime,
    };

    targetExercise.sets = updatedSets;
    updatedExercises[safeExerciseIndex] = targetExercise;
    setExercisesState(updatedExercises);

    // Sync to DataFactory context
    updateActiveWorkoutSet(safeExerciseIndex, targetSetIdx, {
      weightKg: logWeight,
      reps: logReps,
      rir: logRir,
      rpe: logRpe,
      completed: true,
      timestamp: nowTime,
    });

    // Audio/visual feedback
    if (soundEnabled) playBeepSound();
    setJustCompletedSetId(targetSet.id);
    setTimeout(() => setJustCompletedSetId(null), 1200);

    // Auto-start rest timer
    const restTime = activeExerciseData.exercise.defaultRestSecs || 120;
    startRestTimer(restTime);

    // Advance to next uncompleted set in this exercise
    const nextUncompletedInExercise = updatedSets.findIndex((s, idx) => !s.completed && idx > targetSetIdx);
    if (nextUncompletedInExercise !== -1) {
      setCurrentSetIndex(nextUncompletedInExercise);
    } else {
      // Check if any prior set in this exercise is uncompleted
      const anyUncompletedInExercise = updatedSets.findIndex((s) => !s.completed);
      if (anyUncompletedInExercise !== -1) {
        setCurrentSetIndex(anyUncompletedInExercise);
      } else if (safeExerciseIndex < exercisesState.length - 1) {
        // Move to next exercise!
        setCurrentExerciseIndex(safeExerciseIndex + 1);
        setCurrentSetIndex(0);
      } else {
        // Check if all exercises are completed
        const allCompleted = updatedExercises.every(ex => ex.sets.every(s => s.completed));
        if (allCompleted) {
          onFinishWorkout(updatedExercises);
        }
      }
    }
  };

  const handleToggleSetComplete = (setIdx: number) => {
    if (!activeExerciseData) return;
    const targetSet = activeExerciseData.sets[setIdx];
    if (!targetSet) return;

    if (targetSet.completed) {
      // Un-complete it to allow editing
      const updatedExercises = [...exercisesState];
      const targetExercise = { ...updatedExercises[safeExerciseIndex] };
      const updatedSets = [...targetExercise.sets];
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        completed: false,
      };
      targetExercise.sets = updatedSets;
      updatedExercises[safeExerciseIndex] = targetExercise;
      setExercisesState(updatedExercises);

      updateActiveWorkoutSet(safeExerciseIndex, setIdx, {
        completed: false,
      });
      setCurrentSetIndex(setIdx);
    } else {
      handleCompleteSet(setIdx);
    }
  };

  const handleQuickFillAndFinish = () => {
    const filledExercises = exercisesState.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({
        ...s,
        completed: true,
        reps: s.targetReps || s.reps,
        weightKg: s.weightKg,
        rir: typeof s.rir === 'number' ? s.rir : 2,
        rpe: typeof s.rir === 'number' ? 10 - s.rir : 8,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
    }));
    setExercisesState(filledExercises);
    quickFillAllSets();
    onFinishWorkout(filledExercises);
  };

  const handleFinishEarly = () => {
    onFinishWorkout(exercisesState);
  };

  const handleSkipSet = () => {
    if (currentSetIndex < activeExerciseData.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else if (currentExerciseIndex < exercisesState.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSets = exercisesState.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercisesState.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const liveTonnageKg = exercisesState.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + s.weightKg * s.reps, 0),
    0
  );

  return (
    <div
      id="gym-mode-container"
      className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]"
    >
      {/* 1. TOP HEADER: Status, Timer & Quick Quit */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-main)]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button
            id="btn-exit-gym-mode"
            onClick={onExitGymMode}
            className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            Leave Floor
          </button>

          <div className="text-center">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-muted)]">
              {activePersona.splitName.split(' ')[0]} • Set {completedSets} of {totalSets} Done
            </span>
            <div className="text-xs font-semibold text-[var(--accent)] flex items-center justify-center gap-1">
              <Dumbbell className="h-3 w-3" />
              <span>{Math.round(liveTonnageKg).toLocaleString()} kg Logged</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-gym-quick-fill"
              onClick={handleQuickFillAndFinish}
              className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2 py-1.5 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90 transition shadow-sm"
              title="Quick-fill all remaining sets and calculate debrief"
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Quick Fill</span>
            </button>
            <button
              id="btn-gym-design-system"
              onClick={() => setShowDesignModal(true)}
              className="flex items-center gap-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition"
              title="Change Design System"
            >
              <Palette className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline text-[10px] font-mono">{activeOption.name.split(' ')[0]}</span>
            </button>

            <button
              id="btn-toggle-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition"
              title={soundEnabled ? 'Mute Haptics/Beep' : 'Unmute Beep'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* REST TIMER BAR (Readable from 1 meter away on rack mount) */}
        {restSecondsRemaining > 0 ? (
          <div
            id="rest-timer-banner"
            className="mx-auto mt-2 flex max-w-lg items-center justify-between rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-4 py-2.5 shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-[var(--accent)] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Rest Timer:</span>
              <span className="font-mono text-2xl font-black text-[var(--accent)]">
                {formatTimer(restSecondsRemaining)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-timer-sub-15"
                onClick={() => setRestSecondsRemaining((s) => Math.max(0, s - 15))}
                className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              >
                -15s
              </button>
              <button
                id="btn-timer-add-30"
                onClick={() => setRestSecondsRemaining((s) => s + 30)}
                className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              >
                +30s
              </button>
              <button
                id="btn-timer-skip"
                onClick={() => setRestSecondsRemaining(0)}
                className="rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-1 flex max-w-lg items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span>Ready for Set {currentSetIndex + 1}</span>
            <button
              id="btn-manual-rest-timer"
              onClick={() => startRestTimer(activeExerciseData.exercise.defaultRestSecs)}
              className="text-[var(--text-secondary)] hover:text-[var(--accent)] underline decoration-dotted"
            >
              Start Rest Timer ({formatTimer(activeExerciseData.exercise.defaultRestSecs)})
            </button>
          </div>
        )}
      </header>

      {/* 2. EXERCISE TITLE & HISTORICAL CONTEXT */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 space-y-4">
        {/* Exercise Header Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--accent)]">
                  {currentExerciseIndex + 1} / {exercisesState.length}
                </span>
                <span className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  {activeExerciseData.exercise.targetMuscle}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text-primary)]">
                {activeExerciseData.exercise.name}
              </h1>
            </div>

            <button
              id="btn-open-cues"
              onClick={() => setShowCueDrawer(true)}
              className="flex items-center gap-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <HelpCircle className="h-4 w-4 text-[var(--accent)]" /> Cues
            </button>
          </div>

          {/* Historical vs Today Target Cards (Evidence-based comparison) */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Last Session</span>
              <div className="mt-1 font-mono text-sm font-semibold text-[var(--text-primary)]">
                {activeExerciseData.lastPerformance}
              </div>
            </div>

            <div className="rounded-xl bg-[var(--accent-subtle)] p-3 border border-[var(--accent-border)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Today's Target</span>
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-[var(--accent)]">
                {activeExerciseData.targetPerformance}
              </div>
            </div>
          </div>
        </div>

        {/* SET ROWS TABLE (Sub-2-tap floor logging & full overview of all sets) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Logged Sets ({activeExerciseData.sets.filter((s) => s.completed).length}/{activeExerciseData.sets.length})
              </span>
              <span className="text-[10px] text-[var(--accent)] font-semibold hidden sm:inline">
                Tap row to edit • Tap ✓ to log
              </span>
            </div>
            <button
              id="btn-add-set"
              onClick={() => addSetToExercise(safeExerciseIndex)}
              className="flex items-center gap-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition"
            >
              <Plus className="h-3.5 w-3.5 text-[var(--accent)]" /> Add Set
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <div className="col-span-2 text-center">Set</div>
            <div className="col-span-3 text-left">Previous</div>
            <div className="col-span-3 text-center">Weight</div>
            <div className="col-span-2 text-center">Reps</div>
            <div className="col-span-2 text-center">Log</div>
          </div>

          {/* Set Rows */}
          <div className="space-y-1.5">
            {activeExerciseData.sets.map((set, idx) => {
              const isFocused = idx === safeSetIndex;
              const isCompleted = set.completed;
              const isJustCompleted = justCompletedSetId === set.id;

              return (
                <div
                  key={set.id}
                  id={`set-row-${idx + 1}`}
                  onClick={() => setCurrentSetIndex(idx)}
                  className={`grid grid-cols-12 gap-1 items-center rounded-xl p-2 cursor-pointer transition-all ${
                    isFocused
                      ? 'bg-[var(--bg-elevated)] border-2 border-[var(--accent)] shadow-sm'
                      : isCompleted
                      ? 'bg-[var(--bg-elevated)]/60 border border-[var(--border-subtle)] opacity-90'
                      : 'bg-[var(--bg-elevated)]/30 border border-transparent hover:border-[var(--border-subtle)]'
                  }`}
                >
                  {/* Set Number & Type */}
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isFocused
                          ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {set.type === 'warmup' ? 'W' : idx + 1}
                    </span>
                    {set.type !== 'working' && (
                      <span className="text-[9px] uppercase text-[var(--text-muted)] mt-0.5">
                        {set.type}
                      </span>
                    )}
                  </div>

                  {/* Previous / Target info */}
                  <div className="col-span-3 text-left">
                    <span className="font-mono text-xs text-[var(--text-secondary)] font-medium block truncate">
                      {idx === 0 ? activeExerciseData.lastPerformance : `${set.targetWeightKg || set.weightKg}kg × ${set.targetReps || set.reps}`}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block truncate">
                      Target RIR {set.rir ?? 2}
                    </span>
                  </div>

                  {/* Weight column */}
                  <div className="col-span-3 text-center">
                    <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                      {set.weightKg} <span className="text-[10px] font-normal text-[var(--text-muted)]">kg</span>
                    </span>
                  </div>

                  {/* Reps column */}
                  <div className="col-span-2 text-center">
                    <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
                      {set.reps}
                    </span>
                  </div>

                  {/* 1-Tap Log / Toggle Button (44x44px touch target) */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      id={`btn-row-toggle-set-${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSetComplete(idx);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 ${
                        isJustCompleted
                          ? 'bg-emerald-500 text-neutral-950 scale-105 shadow-md'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                          : isFocused
                          ? 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-sm'
                          : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                      }`}
                      title={isCompleted ? 'Mark incomplete / edit' : 'Complete set'}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 stroke-[2.5]" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delete Set option if multiple sets */}
          {activeExerciseData.sets.length > 1 && (
            <div className="flex justify-end pt-1">
              <button
                id="btn-remove-last-set"
                onClick={() => removeSetFromExercise(safeExerciseIndex, activeExerciseData.sets.length - 1)}
                className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-red-400 transition"
              >
                <Trash2 className="h-3 w-3" /> Remove Set {activeExerciseData.sets.length}
              </button>
            </div>
          )}
        </div>

        {/* 3. SET STEPPER & LOGGING INTERFACE (SWEATY-FINGER UX) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-4 shadow-xl">
          {/* Set Tracker Dots */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Set {safeSetIndex + 1} of {activeExerciseData.sets.length}
              </span>
              <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] uppercase border border-[var(--border-subtle)]">
                {activeSet.type} Set
              </span>
            </div>

            {/* Set progression dots */}
            <div className="flex gap-1.5">
              {activeExerciseData.sets.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSetIndex(idx)}
                  className={`h-3 w-7 rounded-full transition-all ${
                    s.completed
                      ? 'bg-emerald-500'
                      : idx === safeSetIndex
                      ? 'bg-[var(--text-primary)] ring-2 ring-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)]'
                  }`}
                  title={`Jump to Set ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Stepper Inputs: Weight and Reps (Chunky 48px+ tap targets) */}
          <div className="grid grid-cols-2 gap-3">
            {/* WEIGHT STEPPER */}
            <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-bold uppercase tracking-wider">Weight (kg)</span>
                <button
                  id="btn-open-plate-calc-icon"
                  onClick={() => setShowPlateCalc(true)}
                  className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
                >
                  <Calculator className="h-3.5 w-3.5" /> Plates
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <button
                  id="btn-sub-weight"
                  onClick={() => setWeightKg((w) => Math.max(0, Number((w - 2.5).toFixed(2))))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-lg font-black text-[var(--text-primary)] hover:bg-[var(--bg-main)] active:scale-95 transition"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <span className="font-mono text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    {weightKg.toFixed(1)}
                  </span>
                </div>
                <button
                  id="btn-add-weight"
                  onClick={() => setWeightKg((w) => Number((w + 2.5).toFixed(2)))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-lg font-black text-[var(--text-primary)] hover:bg-[var(--bg-main)] active:scale-95 transition"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Quick micro-adjustments for calibrated plates */}
              <div className="mt-3 flex justify-between gap-1 text-[11px] font-mono">
                <button
                  onClick={() => setWeightKg((w) => Math.max(0, Number((w - 1.25).toFixed(2))))}
                  className="rounded-md bg-[var(--bg-surface)] px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                >
                  -1.25
                </button>
                <button
                  onClick={() => setWeightKg((w) => Number((w + 1.25).toFixed(2)))}
                  className="rounded-md bg-[var(--bg-surface)] px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                >
                  +1.25
                </button>
                <button
                  onClick={() => setWeightKg((w) => Number((w + 5.0).toFixed(2)))}
                  className="rounded-md bg-[var(--bg-surface)] px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                >
                  +5.0
                </button>
              </div>
            </div>

            {/* REPS STEPPER */}
            <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="font-bold uppercase tracking-wider">Reps Done</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Target: {activeSet.targetReps}</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <button
                  id="btn-sub-reps"
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-lg font-black text-[var(--text-primary)] hover:bg-[var(--bg-main)] active:scale-95 transition"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <span className="font-mono text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    {reps}
                  </span>
                </div>
                <button
                  id="btn-add-reps"
                  onClick={() => setReps((r) => r + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-lg font-black text-[var(--text-primary)] hover:bg-[var(--bg-main)] active:scale-95 transition"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex justify-center gap-2 text-[11px]">
                <span className="text-[var(--text-muted)]">Auto-progression active</span>
              </div>
            </div>
          </div>

          {/* RPE / RIR SELECTOR (Evidence-based effort rating) */}
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
              <span className="font-bold uppercase tracking-wider">Effort / Reps In Reserve (RIR)</span>
              <span className="font-mono text-[11px] text-[var(--accent)] font-semibold">
                {rir === 0 ? 'RPE 10 (Failure)' : `RPE ${10 - rir} (RIR ${rir})`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { r: 3, label: 'RIR 3', sub: 'Easy' },
                { r: 2, label: 'RIR 2', sub: 'Target' },
                { r: 1, label: 'RIR 1', sub: 'Hard' },
                { r: 0, label: 'RIR 0', sub: 'Failure' },
              ].map((item) => (
                <button
                  key={item.r}
                  onClick={() => setRir(item.r)}
                  className={`rounded-xl py-2 px-1 text-center transition-all ${
                    rir === item.r
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-md ring-2 ring-[var(--accent)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="text-xs font-extrabold">{item.label}</div>
                  <div className="text-[10px] opacity-80">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* GIANT COMPLETE SET BUTTON (Sweaty-finger, 56px height, high contrast) */}
          <button
            id="btn-complete-set"
            onClick={() => handleCompleteSet(safeSetIndex)}
            className={`w-full min-h-[56px] rounded-2xl flex items-center justify-center gap-3 text-base font-black tracking-wide uppercase transition-all transform active:scale-98 shadow-2xl ${
              justCompletedSetId
                ? 'bg-emerald-500 text-neutral-950'
                : 'bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)]'
            }`}
          >
            {justCompletedSetId ? (
              <>
                <Check className="h-6 w-6 stroke-[3]" /> Set Logged! Next set ready
              </>
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" /> Complete Set {safeSetIndex + 1} ({weightKg}kg × {reps})
              </>
            )}
          </button>
        </div>

        {/* 4. SECONDARY FLOOR UTILITIES BAR */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            id="btn-swap-exercise"
            onClick={() => setShowSwapDrawer(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
          >
            <ArrowLeftRight className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-[11px] font-semibold">Swap Lift</span>
          </button>

          <button
            id="btn-skip-set"
            onClick={handleSkipSet}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
          >
            <SkipForward className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-[11px] font-semibold">Skip Set</span>
          </button>

          <button
            id="btn-toggle-notes"
            onClick={() => setShowNotesInput(!showNotesInput)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
          >
            <FileText className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-[11px] font-semibold">Note</span>
          </button>

          <button
            id="btn-open-plate-calc"
            onClick={() => setShowPlateCalc(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
          >
            <Calculator className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-[11px] font-semibold">Plates</span>
          </button>
        </div>

        {/* Notes input drawer */}
        {showNotesInput && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Set / Technique Notes</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. slight right wrist tweak, moved grip 1cm narrower..."
              className="mt-1.5 w-full rounded-lg bg-[var(--bg-main)] px-3 py-2 text-xs text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        {/* EXERCISE JUMP LIST (Quick scroll through workout) */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Workout Outline</span>
          <div className="mt-2 space-y-1">
            {exercisesState.map((ex, idx) => {
              const allDone = ex.sets.every((s) => s.completed);
              const isActive = idx === currentExerciseIndex;

              return (
                <button
                  key={ex.exercise.id}
                  onClick={() => {
                    setCurrentExerciseIndex(idx);
                    setCurrentSetIndex(0);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-[var(--accent)]">{idx + 1}.</span>
                    <span className="truncate">{ex.exercise.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span>
                      {ex.sets.filter((s) => s.completed).length}/{ex.sets.length}
                    </span>
                    {allDone && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Finish & Early End Actions */}
          <div className="mt-3 flex gap-2 pt-1 border-t border-[var(--border-subtle)]">
            <button
              id="btn-finish-early"
              onClick={handleFinishEarly}
              className="flex-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition"
            >
              End Session & Debrief
            </button>
            <button
              id="btn-outline-quick-fill"
              onClick={handleQuickFillAndFinish}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90 transition shadow-sm"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Quick Complete (Test)</span>
            </button>
          </div>
        </div>
      </main>

      {/* 5. FINISH WORKOUT BUTTON (Bottom Dock) */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-main)] p-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <button
            id="btn-finish-workout-early"
            onClick={() => onFinishWorkout(exercisesState)}
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
          >
            Finish Workout & Generate Debrief
          </button>
        </div>
      </footer>

      {/* 6. MODALS & DRAWERS */}
      {/* Design System Studio Modal */}
      <DesignSystemModal
        isOpen={showDesignModal}
        onClose={() => setShowDesignModal(false)}
      />

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        isOpen={showPlateCalc}
        onClose={() => setShowPlateCalc(false)}
        targetWeightKg={weightKg}
        onApplyWeight={(w) => setWeightKg(w)}
      />

      {/* SWAP EXERCISE DRAWER (Stimulus preservation) */}
      {showSwapDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 text-[var(--text-primary)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Substitute Exercise</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Replacing <span className="text-[var(--accent)]">{activeExerciseData.exercise.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowSwapDrawer(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                Stimulus-Preserving Alternatives
              </span>
              {activeExerciseData.exercise.alternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => {
                    const newEx: Exercise = {
                      id: alt.id,
                      name: alt.name,
                      targetMuscle: activeExerciseData.exercise.targetMuscle,
                      secondaryMuscles: activeExerciseData.exercise.secondaryMuscles,
                      equipment: alt.name.includes('Dumbbell') ? 'Dumbbells' : 'Machine',
                      difficulty: 'intermediate',
                      defaultRestSecs: 120,
                      cue: {
                        setup: 'Adjust height and position to match chest line.',
                        execution: 'Drive handles forward with 2-second eccentric phase.',
                        commonMistake: 'Letting elbows flare excessively.',
                      },
                      alternatives: [],
                    };
                    onSwapExercise(currentExerciseIndex, newEx);
                    setShowSwapDrawer(false);
                  }}
                  className="cursor-pointer rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--border-subtle)] hover:border-[var(--accent)] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{alt.name}</span>
                    <ChevronRight className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{alt.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FORM CUES DRAWER */}
      {showCueDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 text-[var(--text-primary)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{activeExerciseData.exercise.name}</h3>
                <p className="text-xs text-[var(--accent)]">Biomechanics & Floor Cues</p>
              </div>
              <button
                onClick={() => setShowCueDrawer(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--accent)] uppercase tracking-wider text-[10px]">Setup</span>
                <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">{activeExerciseData.exercise.cue.setup}</p>
              </div>

              <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)]">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Execution</span>
                <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">{activeExerciseData.exercise.cue.execution}</p>
              </div>

              <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)]">
                <span className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Common Mistake to Avoid</span>
                <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">{activeExerciseData.exercise.cue.commonMistake}</p>
              </div>

              {activeExerciseData.exercise.cue.femaleConsideration && (
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-purple-900/40">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                    Biomechanical Note
                  </span>
                  <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">
                    {activeExerciseData.exercise.cue.femaleConsideration}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCueDrawer(false)}
              className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              Back to Floor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
