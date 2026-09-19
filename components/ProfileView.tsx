import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Flame, 
  Database, 
  Moon, 
  Heart, 
  Sparkles, 
  Smartphone, 
  Palette, 
  Lock,
  ChevronRight,
  Activity,
  History,
  Trophy,
  Dumbbell,
  LogIn,
  LogOut,
  Copy,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useDataFactory } from '../context/DataFactoryContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface ProfileViewProps {
  onOpenDesignSystem: () => void;
  onOpenAICoach: () => void;
  onOpenOnboarding: () => void;
  onOpenExpoModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenDesignSystem,
  onOpenAICoach,
  onOpenOnboarding,
  onOpenExpoModal,
}) => {
  const { activeOption } = useTheme();
  const { 
    activePersona, 
    history, 
    sqliteSyncStatus,
    knownPRs
  } = useDataFactory();

  const { user, profile, isAuthenticated, signOut, updateProfile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const [useKg, setUseKg] = useState(profile?.preferred_units !== 'imperial');
  const [cycleAware, setCycleAware] = useState(profile?.cycle_tracking_enabled || false);
  const [healthSync, setHealthSync] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard?.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Profile Header */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] font-black text-lg shadow-md">
          {activePersona.avatarInitials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">{activePersona.name}</h2>
            <span className="rounded bg-[var(--accent-subtle)] border border-[var(--accent-border)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)]">
              {activePersona.experience.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{activePersona.roleTitle} • {activePersona.splitName}</p>
        </div>
      </div>

      {/* 2. Supabase Auth & RLS Status Controller */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" /> Supabase Cloud Identity & RLS
          </span>
          {isAuthenticated ? (
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              RLS Authenticated
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              Guest Mode (Offline)
            </span>
          )}
        </div>

        {isAuthenticated ? (
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--border-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{user?.email}</div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1 mt-0.5">
                  <span>ID: {user?.id.slice(0, 16)}...</span>
                  <button
                    onClick={handleCopyId}
                    className="text-[var(--accent)] hover:underline flex items-center gap-0.5 ml-1"
                    title="Copy full Auth UID"
                  >
                    {copiedId ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                    {copiedId ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 rounded-lg px-2.5 py-1.5 border border-rose-500/20 bg-rose-500/10 transition"
              >
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>

            <div className="text-[10px] font-mono text-[var(--text-muted)] bg-black/20 p-2 rounded-lg border border-[var(--border-subtle)] space-y-0.5">
              <div className="text-emerald-400 font-semibold">Row-Level Security Active:</div>
              <div>• profiles: auth.uid() = id</div>
              <div>• sessions: auth.uid() = user_id</div>
              <div>• sets: auth.uid() = user_id</div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3.5 border border-[var(--border-subtle)] space-y-2 text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              You are currently using Ironmate in offline mode. Sign in with your Supabase credentials to sync workouts and verify RLS policies.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90 transition active:scale-95 shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In / Create Account
            </button>
          </div>
        )}
      </div>

      {/* 3. Consistency & Rest Forgiveness Card */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <Flame className="h-4 w-4" /> {activePersona.streakWeeks}-Week Consistency Protected
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Ironmate recognizes smart recovery. Deloads, travel, and rest days never break your streak—intelligent lifters rest when recovery demands it.
        </p>
      </div>

      {/* 4. LOCAL SQLITE WORKOUT HISTORY */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">Local SQLite Workout History</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">{history.length} Sessions Logged</span>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl bg-[var(--bg-elevated)] p-4 text-center border border-[var(--border-subtle)]">
            <Dumbbell className="mx-auto h-6 w-6 text-[var(--text-muted)] mb-1" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">First session ready to be logged</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Complete your first workout in Gym Mode to record your first verified session.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3 border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {workout.workoutName}
                    </span>
                    <span className="rounded bg-[var(--accent-subtle)] px-1.5 py-0.2 text-[9px] font-mono font-bold text-[var(--accent)] border border-[var(--accent-border)]">
                      Grade {workout.sessionGrade}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {workout.keyLift}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">
                    {workout.date} • {workout.durationMinutes} min • {workout.setsCount} sets
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-[var(--accent)]">
                    {(workout.totalVolumeKg / 1000).toFixed(1)}k kg
                  </div>
                  {workout.prsDetected > 0 && (
                    <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-amber-400 mt-0.5">
                      <Trophy className="h-3 w-3" />
                      <span>{workout.prsDetected} PR{workout.prsDetected > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Mobile Hardware & Settings */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Training Preferences & Sensors
        </span>

        {/* Units Switcher */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)]">Unit System</span>
            <p className="text-[11px] text-[var(--text-muted)]">{useKg ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}</p>
          </div>
          <button
            onClick={() => setUseKg(!useKg)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1 font-mono text-xs font-bold text-[var(--accent)] hover:border-[var(--accent)]"
          >
            {useKg ? 'KG' : 'LB'}
          </button>
        </div>

        <div className="h-[1px] bg-[var(--border-subtle)]" />

        {/* Design System & Aesthetic Theme */}
        <div 
          onClick={onOpenDesignSystem}
          className="flex cursor-pointer items-center justify-between py-1 hover:opacity-80"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Gym Display Theme</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Active: {activeOption.name}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </div>

        <div className="h-[1px] bg-[var(--border-subtle)]" />

        {/* Cycle-Aware Training (Opt-in) */}
        <div className="flex items-center justify-between py-1">
          <div className="pr-4">
            <span className="text-xs font-bold text-[var(--text-primary)]">Cycle-Aware Suggestions (Opt-in)</span>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Educational training notes across menstrual phases. Never deterministic.
            </p>
          </div>
          <input
            type="checkbox"
            checked={cycleAware}
            onChange={(e) => setCycleAware(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)] rounded cursor-pointer"
          />
        </div>

        <div className="h-[1px] bg-[var(--border-subtle)]" />

        {/* Apple Health / Wearable Sync */}
        <div className="flex items-center justify-between py-1">
          <div className="pr-4">
            <span className="text-xs font-bold text-[var(--text-primary)]">Apple Health / Health Connect</span>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Imports sleep duration & HRV to modulate morning volume targets.
            </p>
          </div>
          <input
            type="checkbox"
            checked={healthSync}
            onChange={(e) => setHealthSync(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)] rounded cursor-pointer"
          />
        </div>

        <div className="h-[1px] bg-[var(--border-subtle)]" />

        {/* Offline SQLite Engine */}
        <div className="flex items-center justify-between py-1">
          <div className="pr-4">
            <span className="text-xs font-bold text-[var(--text-primary)]">Offline SQLite Vault</span>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Instant set logging with zero lag in basement gym dead zones.
            </p>
          </div>
          <input
            type="checkbox"
            checked={offlineSync}
            onChange={(e) => setOfflineSync(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Quick Modals & Tools */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Dev & Companion Tools
        </span>

        <button
          onClick={onOpenExpoModal}
          className="w-full flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3 text-left hover:border-[var(--accent)] border border-[var(--border-subtle)] transition"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)]">Expo SDK 57 Code Explorer</span>
              <p className="text-[10px] text-[var(--text-muted)]">Inspect app.json, app/_layout.tsx, and CLI instructions</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </button>

        <button
          onClick={onOpenAICoach}
          className="w-full flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3 text-left hover:border-[var(--accent)] border border-[var(--border-subtle)] transition"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)]">AI Floor Coach Guardrails</span>
              <p className="text-[10px] text-[var(--text-muted)]">Evidence-based adjustments & confidence scoring</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </button>

        <button
          onClick={onOpenOnboarding}
          className="w-full flex items-center justify-between rounded-xl bg-[var(--bg-elevated)] p-3 text-left hover:border-[var(--accent)] border border-[var(--border-subtle)] transition"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)]">First Week Gym Onboarding Track</span>
              <p className="text-[10px] text-[var(--text-muted)]">Gym etiquette, RIR 3 method, machine vs barbell</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* 5. Evidence & Privacy Commitment */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-4 text-[11px] text-[var(--text-muted)] leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
          <Lock className="h-3.5 w-3.5 text-[var(--accent)]" /> Privacy-First Architecture
        </div>
        <p>• Zero calorie-shaming. No public body-fat leaderboards.</p>
        <p>• Progress photos encrypted on-device; never sent to public feeds.</p>
        <p>• Offline-first SQLite database syncing with Supabase Auth & Storage.</p>
      </div>

      {/* Auth Modal for Sign In / Sign Up */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
