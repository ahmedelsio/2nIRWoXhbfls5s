import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Code2, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useDataFactory } from '../context/DataFactoryContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { isSupabaseConfigured } from '../libs/supabase/client';
import { LocalStore } from '../libs/offline';

interface DataFactoryToolbarProps {
  onGoToNightDebrief?: () => void;
  onGoToGymMode?: () => void;
  onOpenSyncQueue?: () => void;
}

export const DataFactoryToolbar: React.FC<DataFactoryToolbarProps> = ({
  onGoToNightDebrief,
  onGoToGymMode,
  onOpenSyncQueue,
}) => {
  const {
    activePersona,
    quickFillAllSets,
    finishActiveWorkout,
    resetToInitialPersona,
    liveStats,
    sqliteSyncStatus,
    activeWorkout,
    activeBriefing,
  } = useDataFactory();

  const { user, profile, isAuthenticated, signOut } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [justSimulated, setJustSimulated] = useState(false);

  const handleSimulateFinish = () => {
    quickFillAllSets();
    setTimeout(() => {
      finishActiveWorkout(52);
      setJustSimulated(true);
      setTimeout(() => setJustSimulated(false), 2500);
      if (onGoToNightDebrief) {
        onGoToNightDebrief();
      }
    }, 150);
  };

  const queue = LocalStore.getQueue();
  const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'syncing').length;

  return (
    <>
      {/* PERSISTENT SUPABASE TEST & SYNC CONTROLLER */}
      <div 
        id="data-factory-bar"
        className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-3 py-2 text-xs shadow-sm transition-all"
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          {/* Active User Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] font-black text-[10px]">
              {activePersona.avatarInitials}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-[var(--text-primary)] truncate">
                  {isAuthenticated ? (profile?.display_name || user?.email?.split('@')[0] || 'Lifter') : 'Guest Lifter'}
                </span>
                {isAuthenticated ? (
                  <span className="hidden sm:inline-flex items-center gap-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400">
                    <ShieldCheck className="h-2.5 w-2.5" /> RLS Authed
                  </span>
                ) : (
                  <span className="hidden sm:inline rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-1.5 py-0.2 text-[9px] font-mono text-amber-400">
                    Offline Guest
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <div className="hidden sm:flex items-center gap-1 text-[var(--text-secondary)]">
              <Dumbbell className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>{liveStats.totalVolumeKg.toLocaleString()} kg</span>
            </div>

            {/* Sync status button */}
            <button
              id="btn-sync-queue-status"
              onClick={onOpenSyncQueue}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition cursor-pointer active:scale-95"
              title="Click to view Basement Sync Queue & local storage details"
            >
              <span className={`inline-block h-2 w-2 rounded-full ${
                pendingCount > 0 
                  ? 'bg-amber-400 animate-pulse' 
                  : sqliteSyncStatus === 'synced' 
                    ? 'bg-emerald-500' 
                    : 'bg-amber-500 animate-ping'
              }`} />
              <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium hidden sm:inline">
                {pendingCount > 0 ? `${pendingCount} queue` : 'Local + Cloud'}
              </span>
            </button>

            {/* Auth Button */}
            {!isAuthenticated ? (
              <button
                id="btn-open-auth-modal"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition active:scale-95"
                title="Sign in with Supabase credentials to test RLS"
              >
                <LogIn className="h-3 w-3 text-[var(--accent)]" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-rose-400 transition"
                title="Sign out of current Supabase session"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            {/* Quick Fill Session */}
            <button
              id="btn-quick-fill-session"
              onClick={handleSimulateFinish}
              className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent-contrast)] hover:opacity-90 transition active:scale-95 shadow-sm"
              title="Fill all target sets and generate instant debrief"
            >
              <Zap className="h-3 w-3" />
              <span>{justSimulated ? 'Simulated!' : 'Quick Log'}</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              title="Toggle Supabase Test Panel"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* EXPANDED TEST CONTROLS & RLS STATUS */}
        {isExpanded && (
          <div className="mx-auto mt-2 max-w-xl border-t border-[var(--border-subtle)] pt-2.5 pb-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <Database className="h-3 w-3 text-[var(--accent)]" /> Supabase RLS & Test Panel
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToInitialPersona}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Session
                </button>
                <button
                  onClick={() => setShowInspector(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)] hover:underline"
                >
                  <Code2 className="h-3 w-3" /> Inspect Database / JSON
                </button>
              </div>
            </div>

            {/* Account & RLS Status Card */}
            <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)] text-[11px] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[var(--accent)]" />
                  <span className="font-bold text-[var(--text-primary)]">
                    {isAuthenticated ? user?.email : 'No Active Supabase Session'}
                  </span>
                </div>
                {isAuthenticated ? (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">RLS ACTIVE</span>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-[10px] text-[var(--accent)] font-bold hover:underline"
                  >
                    Authenticate to test RLS &rarr;
                  </button>
                )}
              </div>

              {isAuthenticated ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                  <div>Auth UID: <span className="text-[var(--text-secondary)]">{user?.id}</span></div>
                  <div>Policy: <span className="text-emerald-400">auth.uid() = user_id</span></div>
                </div>
              ) : (
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Currently running in offline mode. Click <strong>Sign In</strong> to authenticate or test with pre-filled test credentials.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUPABASE & STATE INSPECTOR MODAL */}
      {showInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 text-[var(--text-primary)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Supabase & Offline State Inspector
                </h3>
              </div>
              <button
                onClick={() => setShowInspector(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs font-mono">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 border border-[var(--border-subtle)]">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase">Live Tonnage</span>
                  <div className="text-base font-bold text-[var(--accent)]">{liveStats.totalVolumeKg} kg</div>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 border border-[var(--border-subtle)]">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase">Sets Done</span>
                  <div className="text-base font-bold text-[var(--text-primary)]">
                    {liveStats.setsCompleted} / {liveStats.totalPrescribedSets}
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-2.5 border border-[var(--border-subtle)]">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase">Auth Status</span>
                  <div className="text-base font-bold text-emerald-400">
                    {isAuthenticated ? 'AUTHENTICATED' : 'GUEST'}
                  </div>
                </div>
              </div>

              {/* Supabase Connection Details */}
              <div className="rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--accent)] uppercase text-[10px]">Supabase Cloud Sync</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL MOCK'}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] space-y-0.5">
                  <div>User ID: {user?.id || 'None (Guest Mode)'}</div>
                  <div>Queued Offline Mutations: {queue.length}</div>
                </div>
              </div>

              {/* Raw JSON Snapshot */}
              <div>
                <span className="font-bold text-[var(--text-muted)] uppercase text-[10px]">
                  Active Workout Exercises ({activeWorkout.length} Total)
                </span>
                <pre className="mt-1.5 rounded-xl bg-black/50 p-3 text-[10px] text-emerald-400 overflow-x-auto max-h-48 border border-zinc-800">
                  {JSON.stringify(
                    activeWorkout.map(w => ({
                      exercise: w.exercise.name,
                      completedSets: w.sets.filter(s => s.completed).length,
                      totalSets: w.sets.length,
                      sets: w.sets.map(s => ({
                        set: s.setNumber,
                        weightKg: s.weightKg,
                        reps: s.reps,
                        completed: s.completed,
                        rir: s.rir,
                      })),
                    })),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-3 flex justify-end">
              <button
                onClick={() => setShowInspector(false)}
                className="rounded-xl bg-[var(--bg-elevated)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--border-color)]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
