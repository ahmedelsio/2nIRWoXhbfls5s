import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Database, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Flame, 
  Info,
  Smartphone,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface BlockProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
  totalWeeks: number;
}

export const BlockProgressModal: React.FC<BlockProgressModalProps> = ({
  isOpen,
  onClose,
  currentWeek,
  totalWeeks,
}) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'data_pipeline' | 'volume_landmarks'>('concept');

  if (!isOpen) return null;

  const WEEKS = [
    {
      weekNum: 1,
      name: 'Intro & Baseline Calibration',
      rir: 'RIR 3',
      goal: 'Establish baseline working weights. Low systemic fatigue. Perfect motor execution.',
      status: 'completed',
    },
    {
      weekNum: 2,
      name: 'Accumulation & Progressive Overload',
      rir: 'RIR 2',
      goal: 'Add +2.5kg to primary compounds or +1 rep on isolation accessories.',
      status: 'completed',
    },
    {
      weekNum: 3,
      name: 'Peak Hypertrophy Overload (CURRENT)',
      rir: 'RIR 1–2',
      goal: 'Push maximum adaptive volume (MAV). Target sets to stimulate deep growth.',
      status: 'current',
    },
    {
      weekNum: 4,
      name: 'Overreaching & High Tension',
      rir: 'RIR 0–1',
      goal: 'Final hard push near failure to trigger maximum mechanical tension.',
      status: 'upcoming',
    },
    {
      weekNum: 5,
      name: 'Deload & Supercompensation',
      rir: 'RIR 3–4',
      goal: 'Drop set volume by 50%, hold intensity. Shed systemic fatigue before next block.',
      status: 'upcoming',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-main)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  Block Progress & Periodization
                </h2>
                <span className="rounded bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)]">
                  Week {currentWeek} of {totalWeeks}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Scientific mesocycle periodization and how Ironmate gets your data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('concept')}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === 'concept'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            1. What Is A "Block"?
          </button>
          <button
            onClick={() => setActiveTab('data_pipeline')}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === 'data_pipeline'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            2. How Ironmate Gets Data
          </button>
          <button
            onClick={() => setActiveTab('volume_landmarks')}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === 'volume_landmarks'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            3. Muscle Volume Landmarks
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: WHAT IS A BLOCK */}
          {activeTab === 'concept' && (
            <div className="space-y-4">
              {/* Concept Explainer */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                <h3 className="text-xs font-mono font-bold uppercase text-[var(--accent)] tracking-wider mb-1">
                  Why Serious Lifters Train In Blocks (Mesocycles)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Instead of randomly jumping between workouts, a <strong>Block</strong> is a structured 4 to 6-week training cycle with progressive overload. You begin with manageable volume, progressively add weight and reps each week, and then take a planned <strong>deload</strong> before fatigue causes injury or plateaus.
                </p>
              </div>

              {/* 5-Week Roadmap */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block">
                  Your Current 5-Week Hypertrophy Mesocycle:
                </span>
                
                {WEEKS.map((w) => {
                  const isCurrent = w.status === 'current';
                  const isDone = w.status === 'completed';
                  return (
                    <div
                      key={w.weekNum}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                        isCurrent 
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/40 shadow-md ring-1 ring-[var(--accent)]' 
                          : isDone 
                          ? 'border-[var(--border-subtle)] bg-[var(--bg-main)] opacity-75' 
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)]'
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${
                        isCurrent 
                          ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' 
                          : isDone 
                          ? 'bg-emerald-500 text-black' 
                          : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                      }`}>
                        {isDone ? '✓' : `W${w.weekNum}`}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                              {w.name}
                            </span>
                            {isCurrent && (
                              <span className="rounded bg-[var(--accent)] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[var(--accent-contrast)]">
                                CURRENT WEEK
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                            {w.rir}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          {w.goal}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DATA PIPELINE */}
          {activeTab === 'data_pipeline' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-[var(--accent)] tracking-wider block">
                  Where Does The Data Come From?
                </span>

                <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                  {/* Local SQLite */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] mb-1">
                      <Database className="h-4 w-4 text-[var(--accent)]" />
                      1. Local SQLite Database (Instant & Offline)
                    </div>
                    <p className="leading-relaxed">
                      Every completed set, rep, and weight is logged directly to local tables (`sessions`, `sets`, `user_exercises`) on your device with <strong>0ms latency</strong>. Even with zero cell service in a basement gym, Ironmate computes your tonnage and block progress offline.
                    </p>
                  </div>

                  {/* Progressive Overload Formula */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] mb-1">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      2. Progressive Overload Delta Engine
                    </div>
                    <p className="leading-relaxed">
                      Ironmate compares your current session against Week 1:
                      <br />
                      <code className="bg-black/60 px-1.5 py-0.5 rounded font-mono text-[11px] text-[var(--accent)] mt-1 inline-block">
                        Overload Rule: If all sets hit target reps @ RIR ≥ 2 → suggest +2.5kg next session
                      </code>
                    </p>
                  </div>

                  {/* Wearable Sync */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] mb-1">
                      <Activity className="h-4 w-4 text-cyan-400" />
                      3. Apple Health & Health Connect Read
                    </div>
                    <p className="leading-relaxed">
                      Optionally reads <strong>Sleep Duration</strong> (last night: 6h 15m) and <strong>HRV (Heart Rate Variability)</strong> to detect nervous system recovery. If sleep is short, it alerts you in the Morning Brief to hold top loads.
                    </p>
                  </div>

                  {/* Cloud Backup */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] mb-1">
                      <ShieldCheck className="h-4 w-4 text-violet-400" />
                      4. Supabase Postgres Cloud Sync
                    </div>
                    <p className="leading-relaxed">
                      Syncs in the background when Wi-Fi returns. Your lifetime PR history and block records are preserved forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VOLUME LANDMARKS */}
          {activeTab === 'volume_landmarks' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                <h4 className="text-xs font-mono font-bold uppercase text-[var(--accent)] tracking-wider mb-1">
                  Muscle Volume Landmarks (Sets / Week)
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Based on Dr. Mike Israetel's volume science:
                  <br />
                  • <strong>MEV</strong>: Minimum Effective Volume (~8-10 sets)
                  <br />
                  • <strong>MAV</strong>: Maximum Adaptive Volume (~12-18 sets, optimal growth)
                  <br />
                  • <strong>MRV</strong>: Maximum Recoverable Volume (~20+ sets, diminishing returns)
                </p>
              </div>

              {/* Visual Bars */}
              <div className="space-y-3">
                {/* Chest */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">Chest</span>
                    <span className="font-mono text-[var(--accent)]">14 Sets / Week (Optimal MAV)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '70%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>MEV: 10 sets</span>
                    <span className="text-[var(--accent)] font-bold">Current: 14 sets</span>
                    <span>MRV: 20 sets</span>
                  </div>
                </div>

                {/* Delts */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">Side & Rear Delts</span>
                    <span className="font-mono text-[var(--accent)]">16 Sets / Week (Optimal MAV)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>MEV: 8 sets</span>
                    <span className="text-[var(--accent)] font-bold">Current: 16 sets</span>
                    <span>MRV: 22 sets</span>
                  </div>
                </div>

                {/* Back / Lats */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">Back & Lats</span>
                    <span className="font-mono text-emerald-400">12 Sets / Week (Recovering)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>MEV: 10 sets</span>
                    <span className="text-emerald-400 font-bold">Current: 12 sets</span>
                    <span>MRV: 22 sets</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-main)] px-6 py-3 text-xs text-[var(--text-muted)]">
          <span>Mesocycle Strategy: <strong>Hypertrophy Block A</strong></span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
