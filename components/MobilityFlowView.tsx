import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Heart, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { useDataFactory } from '../context/DataFactoryContext';

interface MobilityFlowViewProps {
  onCompleteMobility: () => void;
  onReturnToLifting: () => void;
}

interface MobilityExercise {
  id: string;
  name: string;
  targetArea: string;
  durationSeconds: number;
  sets: string;
  instructions: string;
  breathingCue: string;
}

const MOBILITY_ROUTINE: MobilityExercise[] = [
  {
    id: 'hip-90-90',
    name: '90/90 Hip Switches with Forward Hinge',
    targetArea: 'Hip Internal & External Rotation',
    durationSeconds: 90,
    sets: '2 sets × 8 switches',
    instructions: 'Sit on floor with both knees at 90-degree angles. Rotate knees smoothly across without lifting hands if possible, then hinge chest forward over the front shin.',
    breathingCue: 'Exhale as you hinge over the front hip to down-regulate muscle guarding.'
  },
  {
    id: 'thoracic-thread',
    name: 'Quadruped Thoracic Thread-the-Needle',
    targetArea: 'Thoracic Spine & Posterior Shoulder',
    durationSeconds: 90,
    sets: '2 sets × 6 reps / side',
    instructions: 'On all fours, slide one arm underneath your chest toward the opposite wall, dropping shoulder to floor, then open chest upward toward the ceiling.',
    breathingCue: 'Deep inhale as you reach toward ceiling, long slow exhale through mouth as you thread under.'
  },
  {
    id: 'worlds-greatest',
    name: "World's Greatest Stretch & Thoracic Reach",
    targetArea: 'Hip Flexors, Hamstrings, Adductors & T-Spine',
    durationSeconds: 120,
    sets: '2 sets × 5 reps / side',
    instructions: 'Step into a deep lunge. Place both hands inside the front foot. Drop back knee slightly, rotate inside arm up to the sky, then shift back to stretch the front hamstring.',
    breathingCue: 'Hold 2 full breaths in the extended twist position.'
  },
  {
    id: 'deep-squat-pry',
    name: 'Deep Squat Pry & Ankle Dorsiflexion',
    targetArea: 'Ankles, Adductors & Deep Pelvic Floor',
    durationSeconds: 60,
    sets: '2 sets × 45-60s hold',
    instructions: 'Descend into a deep bottom squat. Use elbows to gently press knees outward. Shift weight gently from left heel to right heel to mobilize ankle dorsiflexion.',
    breathingCue: 'Slow diaphragmatic belly breathing. Let pelvic floor release completely on every exhale.'
  },
  {
    id: 'cat-cow-breath',
    name: 'Cat-Cow Diaphragmatic Breath Cycles',
    targetArea: 'Spine Articulation & Parasympathetic Reset',
    durationSeconds: 60,
    sets: '2 sets × 8 slow cycles',
    instructions: 'Inhale while arching spine gently (Cow). Exhale slowly through pursed lips while tucking tailbone and rounding thoracic spine upward (Cat).',
    breathingCue: 'Inhale 4s through nose into ribs, exhale 6s into floor.'
  }
];

export const MobilityFlowView: React.FC<MobilityFlowViewProps> = ({
  onCompleteMobility,
  onReturnToLifting
}) => {
  const { activePersona } = useDataFactory();
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [completedMoves, setCompletedMoves] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(MOBILITY_ROUTINE[0].durationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const currentMove = MOBILITY_ROUTINE[currentMoveIndex];

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Mark current as completed
      setCompletedMoves((prev) => ({ ...prev, [currentMove.id]: true }));
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining, currentMove.id]);

  const handleSelectMove = (index: number) => {
    setCurrentMoveIndex(index);
    setSecondsRemaining(MOBILITY_ROUTINE[index].durationSeconds);
    setIsTimerRunning(false);
  };

  const handleNextMove = () => {
    setCompletedMoves((prev) => ({ ...prev, [currentMove.id]: true }));
    if (currentMoveIndex < MOBILITY_ROUTINE.length - 1) {
      const nextIdx = currentMoveIndex + 1;
      setCurrentMoveIndex(nextIdx);
      setSecondsRemaining(MOBILITY_ROUTINE[nextIdx].durationSeconds);
      setIsTimerRunning(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const completedCount = Object.values(completedMoves).filter(Boolean).length;

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header with Streak Protection Badge */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>Active Rest & Mobility Day</span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
            Streak Protected
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
          Intelligent rest preserves strength adaptations. Completing this 15–20 min joint flow counts as a full training check-in for your 14-week consistency record.
        </p>
      </div>

      {/* 2. Active Movement Player Card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--accent)] tracking-wider">
              Move {currentMoveIndex + 1} of {MOBILITY_ROUTINE.length}
            </span>
            <h2 className="text-base font-black text-[var(--text-primary)] mt-0.5">
              {currentMove.name}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{currentMove.targetArea} • {currentMove.sets}</p>
          </div>

          {/* Timer Display */}
          <div className="text-right">
            <div className="font-mono text-2xl font-black text-[var(--accent)]">
              {formatTime(secondsRemaining)}
            </div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Timer</span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-xs uppercase tracking-wider transition ${
              isTimerRunning
                ? 'bg-amber-500 text-black shadow'
                : 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg'
            }`}
          >
            {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            {isTimerRunning ? 'Pause Timer' : 'Start Countdown'}
          </button>

          <button
            onClick={() => {
              setIsTimerRunning(false);
              setSecondsRemaining(currentMove.durationSeconds);
            }}
            className="flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={handleNextMove}
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-xs text-black hover:opacity-90 transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Mark Done</span>
          </button>
        </div>

        {/* Instructions & Breathing Cue */}
        <div className="mt-4 space-y-2.5 rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--border-subtle)] text-xs">
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-1">Execution Cue:</span>
            <p className="text-[var(--text-secondary)] leading-relaxed">{currentMove.instructions}</p>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-2 flex items-start gap-1.5 text-emerald-400">
            <Heart className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              <strong className="text-emerald-400">Breathing Cue:</strong> {currentMove.breathingCue}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Flow Checklist */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <span className="text-xs font-bold text-[var(--text-primary)]">
            Mobility Circuit Progress ({completedCount}/{MOBILITY_ROUTINE.length})
          </span>
          <span className="font-mono text-xs font-bold text-[var(--accent)]">
            ~15 Min Total
          </span>
        </div>

        <div className="space-y-1.5">
          {MOBILITY_ROUTINE.map((move, idx) => {
            const isCurrent = idx === currentMoveIndex;
            const isDone = completedMoves[move.id];
            return (
              <div
                key={move.id}
                onClick={() => handleSelectMove(idx)}
                className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition border ${
                  isCurrent 
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/40' 
                    : 'border-transparent bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isDone 
                      ? 'bg-emerald-500 text-black' 
                      : isCurrent 
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' 
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                      {move.name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)]">{move.targetArea}</p>
                  </div>
                </div>

                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  {Math.round(move.durationSeconds / 60)}m
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Complete Session or Return to Weightlifting */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onCompleteMobility}
          className="w-full min-h-[50px] rounded-2xl bg-emerald-500 hover:opacity-90 text-black flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider shadow-lg transition"
        >
          <ShieldCheck className="h-5 w-5" />
          Finish & Log Active Rest Day (Protect Streak)
        </button>

        <button
          onClick={onReturnToLifting}
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-center text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          Nevermind, I feel good — return to {activePersona.splitName.split(' ')[0]} workout
        </button>
      </div>
    </div>
  );
};
