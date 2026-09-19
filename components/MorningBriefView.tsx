import React from 'react';
import { 
  Play, Sparkles, Moon, Clock, Flame, ShieldCheck, 
  RotateCcw, Coffee, Dumbbell, Zap
} from 'lucide-react';
import { MorningBriefingData } from '../types';

interface MorningBriefViewProps {
  data: MorningBriefingData;
  onStartGymMode: () => void;
  onSwapCrowdedGym: () => void;
  onSelectRestMobility: () => void;
  onOpenBlockProgress: () => void;
  onOpenScheduleManager: () => void;
}

export const MorningBriefView: React.FC<MorningBriefViewProps> = ({
  data,
  onStartGymMode,
  onSwapCrowdedGym,
  onSelectRestMobility,
  onOpenBlockProgress,
  onOpenScheduleManager,
}) => {
  return (
    <div id="morning-brief-view" className="space-y-6 max-w-xl mx-auto pb-12">
      {/* TIME-OF-DAY HERO GREETING */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">07:15 AM • Morning Briefing</span>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
              Today is <span className="text-[var(--accent)]">{data.workoutName.includes('Push') ? 'Push A' : data.workoutName}</span>
            </h1>
            <button
              onClick={onOpenScheduleManager}
              className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)] hover:border-[var(--accent)] transition"
              title="Change today's workout or customize weekly schedule"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Change</span>
            </button>
          </div>
          <button
            onClick={onOpenScheduleManager}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1 mt-0.5"
          >
            <span>Determined by your 5-day PPL rotation • <span className="underline decoration-dotted">View or edit schedule</span></span>
          </button>
        </div>

        <div className="text-right">
          <button
            onClick={onOpenBlockProgress}
            className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent)] p-2 text-right transition cursor-pointer"
            title="Click to see what Block Progress is and how Ironmate gets its data"
          >
            <div className="flex items-center justify-end gap-1 text-[10px] uppercase font-bold text-[var(--text-muted)] group-hover:text-[var(--accent)]">
              <span>Block Progress</span>
              <Sparkles className="h-3 w-3 text-[var(--accent)]" />
            </div>
            <div className="font-mono text-xs font-bold text-[var(--accent)]">
              W{data.cycleWeek} / {data.cycleTotalWeeks} • Day 2
            </div>
            <span className="text-[9px] text-[var(--text-muted)] block">Tap to inspect</span>
          </button>
        </div>
      </div>

      {/* READINESS & SLEEP INSIGHT CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]">
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Readiness Score: {data.readinessScore}%</h3>
                <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  Wearable Synced
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Sleep: 6h 15m (35m below 7h baseline)</p>
            </div>
          </div>

          <span className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)] border border-[var(--accent-border)]">
            Hold Top Load
          </span>
        </div>

        <div className="mt-4 rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Coach Prescription
          </div>
          <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            {data.recoveryNote}
          </p>
        </div>
      </div>

      {/* WORKOUT BLUEPRINT AT A GLANCE */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Scheduled Blueprint</span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Clock className="h-4 w-4 text-[var(--accent)]" />
            <span className="font-mono font-bold text-[var(--text-primary)]">{data.estimatedMinutes} min</span> estimated
          </div>
        </div>

        {/* Primary Lift Focus */}
        <div className="flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--border-subtle)]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Primary Compound Lift</span>
            <div className="text-sm font-black text-[var(--text-primary)]">{data.primaryLift}</div>
            <div className="mt-0.5 text-xs font-mono text-[var(--accent)]">{data.primaryTarget}</div>
          </div>
          <div className="rounded-lg bg-[var(--bg-surface)] p-2 text-[var(--accent)] border border-[var(--border-color)]">
            <Dumbbell className="h-5 w-5" />
          </div>
        </div>

        {/* Accessory Muscle Targets */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)]">Chest</span>
            <div className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">6 Sets</div>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)]">Delts</span>
            <div className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">6 Sets</div>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)]">Triceps</span>
            <div className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">3 Sets</div>
          </div>
        </div>
      </div>

      {/* ONE PRIMARY CTA + 2 REALITY ADAPTATIONS */}
      <div className="space-y-3 pt-2">
        {/* Main CTA */}
        <button
          id="btn-start-gym-mode"
          onClick={onStartGymMode}
          className="w-full min-h-[58px] rounded-2xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] flex items-center justify-center gap-3 text-base font-black tracking-wide uppercase shadow-2xl transition transform active:scale-98"
        >
          <Play className="h-5 w-5 fill-current" />
          Start When I Get To The Gym (Floor Mode)
        </button>

        {/* Adaptation Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-swap-crowded"
            onClick={onSwapCrowdedGym}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 text-center text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
          >
            <Zap className="h-4 w-4 text-[var(--accent)]" />
            <span>30-Min Crowded Gym</span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal">Dumbbell superset version</span>
          </button>

          <button
            id="btn-select-mobility"
            onClick={onSelectRestMobility}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-3.5 text-center text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Switch to Rest / Mobility</span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal">Protects your streak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
