import React, { useState } from 'react';
import { 
  Trophy, Sparkles, Share2, Check, ArrowRight, 
  Calendar, Flame, TrendingUp, ShieldCheck, Download,
  CheckCircle2, History
} from 'lucide-react';
import { NightDebriefData } from '../types';
import { useDataFactory } from '../context/DataFactoryContext';

interface NightDebriefViewProps {
  data?: NightDebriefData;
  onRestartWorkout: () => void;
  onViewSpec: () => void;
  onGoToHistory?: () => void;
}

export const NightDebriefView: React.FC<NightDebriefViewProps> = ({
  data,
  onRestartWorkout,
  onViewSpec,
  onGoToHistory,
}) => {
  const { 
    activePersona, 
    activeDebrief, 
    isDebriefFromLiveSession, 
    quickFillAllSets, 
    finishActiveWorkout 
  } = useDataFactory();
  
  const [copiedShareCard, setCopiedShareCard] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Robust fallback resolution
  const debrief = data || activeDebrief;
  const workoutName = debrief?.workoutName || activePersona.splitName || 'Upper Body Hypertrophy';
  const completedAt = debrief?.completedAt || 'Today';
  const durationMinutes = debrief?.durationMinutes || 54;
  const totalVolumeKg = debrief?.totalVolumeKg || 0;
  const setsCompleted = debrief?.setsCompleted || 0;
  const sessionGrade = debrief?.sessionGrade || 'A';
  const gradeReason = debrief?.gradeReason || 'Volume logged cleanly according to prescribed RIR.';
  const prs = debrief?.prs || [];
  const tomorrowPreview = debrief?.tomorrowPreview || {
    title: 'Active Recovery & Mobility',
    type: 'rest',
    description: 'Scheduled intelligent rest. 8,000 steps target + 10-minute thoracic spine & hip flow. Your streak is protected.',
  };

  const topPrText = prs.length > 0 
    ? `${prs[0].exerciseName}: ${prs[0].value}`
    : 'All prescribed sets completed with clean motor control';

  const handleCopyCard = () => {
    setCopiedShareCard(true);
    navigator.clipboard?.writeText(
      `IRONMATE SESSION RECAP: ${workoutName}\nTotal Tonnage: ${(totalVolumeKg / 1000).toFixed(1)}k kg • ${setsCompleted} Sets\nTop Lift: ${topPrText}\nSession Grade: ${sessionGrade}`
    );
    setTimeout(() => setCopiedShareCard(false), 2000);
  };

  return (
    <div id="night-debrief-view" className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Informative notification when viewing debrief preview before closing today's session */}
      {!isDebriefFromLiveSession && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Viewing Baseline Debrief Preview</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
              Not Finished Yet
            </span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Today's live workout hasn't been closed out yet on the floor. Showing the baseline performance summary for <strong>{activePersona.name}</strong>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onRestartWorkout}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90 transition"
            >
              Start Live Workout
            </button>
            <button
              onClick={() => {
                quickFillAllSets();
                finishActiveWorkout();
              }}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition"
            >
              Simulate & Score Today's
            </button>
          </div>
        </div>
      )}

      {/* 1. HEADER & GRADE CARD */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
          <Sparkles className="h-3.5 w-3.5" /> {isDebriefFromLiveSession ? 'Evening Debrief Completed' : 'Session Summary'}
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Session Debrief</h1>
        <p className="text-xs text-[var(--text-secondary)]">{workoutName} • {completedAt}</p>
      </div>

      {/* SESSION GRADE CARD */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Session Grade</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-black text-[var(--accent)]">{sessionGrade}</span>
              <span className="text-xs text-emerald-400 font-semibold">High Volume Adherence</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[var(--text-muted)] uppercase font-bold">Total Tonnage</span>
            <div className="font-mono text-2xl font-black text-[var(--text-primary)]">
              {(totalVolumeKg / 1000).toFixed(1)} <span className="text-sm font-normal text-[var(--text-muted)]">tons</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)]">{setsCompleted} Sets in {durationMinutes} min</div>
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--text-secondary)] leading-relaxed">
          {gradeReason}
        </p>
      </div>

      {/* 2. AUTOMATIC PR DETECTIONS (TROPHY VAULT) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            <Trophy className="h-4 w-4" /> Personal Records Detected ({prs.length})
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">Auto-Calculated</span>
        </div>

        <div className="space-y-2.5">
          {prs.length === 0 ? (
            <div className="rounded-xl bg-[var(--bg-elevated)] p-4 border border-[var(--border-subtle)] text-center space-y-1">
              <div className="text-xs font-bold text-[var(--text-primary)]">Volume Banked • Motor Control Preserved</div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                No new max 1RM exceeded today. Prescribed mechanical tension was accumulated cleanly toward your week {activePersona.currentWeek} block progression.
              </p>
            </div>
          ) : (
            prs.map((pr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--accent-border)] shadow-inner"
              >
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{pr.exerciseName}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {pr.metric}: <span className="font-semibold text-[var(--text-primary)]">{pr.previousBest}</span> →{' '}
                    <span className="font-bold text-[var(--accent)]">{pr.value}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-md bg-[var(--accent-subtle)] px-2 py-1 text-[11px] font-mono font-bold text-[var(--accent)] border border-[var(--accent-border)]">
                    e1RM {pr.estimated1RM}kg
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. TOMORROW PREVIEW (NO GUILT, STREAK FORGIVING) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Tomorrow Preview</span>
          </div>
          <span className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-[var(--border-subtle)]">
            Intelligent Recovery
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{tomorrowPreview.title}</h4>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              {tomorrowPreview.description}
            </p>
          </div>
        </div>
      </div>

      {/* 4. VIRAL 15-SECOND SHARE CARD TRIGGER */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">15-Second Session Share Card</h4>
            <p className="text-xs text-[var(--text-secondary)]">Dignified, clean typography. No cringe or fake flexing.</p>
          </div>
          <button
            id="btn-preview-share-card"
            onClick={() => setShowShareModal(true)}
            className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition"
          >
            Preview Story
          </button>
        </div>

        {/* Minimalist Preview Box */}
        <div className="rounded-xl bg-[var(--bg-elevated)] p-4 border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--accent)] font-bold uppercase">IRONMATE • {workoutName.toUpperCase()}</div>
            <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
              {totalVolumeKg.toLocaleString()} kg Tonnage • Grade {sessionGrade}
            </div>
          </div>
          <button
            id="btn-copy-card"
            onClick={handleCopyCard}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--accent)] border border-[var(--border-color)] hover:border-[var(--accent)]"
          >
            {copiedShareCard ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            {copiedShareCard ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          id="btn-retest-session"
          onClick={onRestartWorkout}
          className="flex-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
        >
          Return to Gym Floor
        </button>

        {onGoToHistory && (
          <button
            id="btn-view-history"
            onClick={onGoToHistory}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] py-3 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition"
          >
            <History className="h-4 w-4 text-[var(--accent)]" />
            <span>View Saved History</span>
          </button>
        )}

        <button
          id="btn-debrief-view-spec"
          onClick={onViewSpec}
          className="flex-1 rounded-xl bg-[var(--accent)] py-3 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90 transition shadow-md"
        >
          View System Architecture Spec
        </button>
      </div>

      {/* 15-SECOND STORY SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 text-[var(--text-primary)] shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 rounded-full p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>

            {/* Simulated Story Card Artwork (9:16 aesthetic) */}
            <div className="aspect-[4/5] w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-widest text-[var(--accent)] uppercase font-black">
                    IRONMATE // {activePersona.avatarInitials}
                  </span>
                  <span className="rounded bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    WEEK {activePersona.currentWeek} OF {activePersona.totalWeeks}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black text-[var(--text-primary)] leading-tight">
                  {workoutName}
                </h3>
              </div>

              <div className="space-y-3 my-4">
                <div className="rounded-xl bg-[var(--bg-surface)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {prs.length > 0 ? 'Top Personal Record' : 'Volume Milestone'}
                  </span>
                  <div className="text-lg font-black text-[var(--accent)]">
                    {prs.length > 0 ? prs[0].exerciseName : 'Prescribed Work Sets'}
                  </div>
                  <div className="font-mono text-xs text-[var(--text-secondary)]">
                    {prs.length > 0 ? `${prs[0].value} (e1RM ${prs[0].estimated1RM}kg)` : `${setsCompleted} sets logged with clean form`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="rounded-xl bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase text-[var(--text-muted)]">Total Tonnage</span>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{totalVolumeKg.toLocaleString()} kg</div>
                  </div>
                  <div className="rounded-xl bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)]">
                    <span className="text-[9px] uppercase text-[var(--text-muted)]">Completed Sets</span>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{setsCompleted} Sets</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                <span>RIR ADHERENCE VERIFIED</span>
                <span className="text-[var(--accent)] font-bold">GRADE: {sessionGrade}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyCard}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90"
              >
                <Share2 className="h-4 w-4" /> Share Story Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
