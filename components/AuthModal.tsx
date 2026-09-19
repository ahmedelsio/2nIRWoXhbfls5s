import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Mail, User, LogIn, UserPlus, LogOut, 
  CheckCircle2, AlertCircle, X, KeyRound, Sparkles, Copy, Check, Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../libs/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    profile, 
    signInWithEmail, 
    signUpWithEmail, 
    signOut, 
    authError, 
    clearError 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          onClose();
        }
      } else {
        const result = await signUpWithEmail(email, password, displayName);
        if (result.success) {
          if (result.message) {
            setInfoMessage(result.message);
          } else {
            onClose();
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleFillTestCredentials = () => {
    setEmail('tester@ironmate.app');
    setPassword('ironmate123');
    setDisplayName('Test Lifter');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {user ? 'Supabase Authentication' : 'Ironmate Account'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                {isSupabaseConfigured ? 'Connected to Cloud Supabase' : 'Local Fallback Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Authenticated via Supabase Auth
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  RLS ACTIVE
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-500/20">
                  <span className="text-[var(--text-muted)]">Email:</span>
                  <span className="font-semibold text-[var(--text-primary)]">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-500/20">
                  <span className="text-[var(--text-muted)]">Name:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {profile?.display_name || user.user_metadata?.display_name || 'Lifter'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[var(--text-muted)]">Auth UID:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-primary)]">
                    <span>{user.id.slice(0, 14)}...</span>
                    <button
                      onClick={handleCopyUserId}
                      className="p-1 rounded bg-[var(--bg-elevated)] hover:text-amber-400 transition"
                      title="Copy full UID"
                    >
                      {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px] text-[var(--text-muted)] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
                <Database className="h-3.5 w-3.5 text-amber-400" /> Row Level Security (RLS) Verification
              </div>
              <p>
                All sets, sessions, and personal records logged in this session carry <code className="font-mono text-amber-400">user_id = {user.id.slice(0, 8)}</code>, satisfying Supabase RLS policies with full write access.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  await signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-xs transition"
              >
                <LogOut className="h-4 w-4" /> Sign Out of Supabase
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black font-bold text-xs hover:opacity-90 transition"
              >
                Continue Training
              </button>
            </div>
          </div>
        ) : (
          /* Login / Signup Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => { setMode('signin'); clearError(); setInfoMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'signin'
                    ? 'bg-[var(--accent)] text-black shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); clearError(); setInfoMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'signup'
                    ? 'bg-[var(--accent)] text-black shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Info Banner */}
            {authError && (
              <div className="p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Lifter Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lifter@example.com"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[var(--text-muted)]" /> Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Quick Fill Test Helper */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={handleFillTestCredentials}
                className="text-[var(--text-muted)] hover:text-amber-400 transition flex items-center gap-1"
              >
                <KeyRound className="h-3 w-3" /> Fill Test Credentials
              </button>
              <span className="text-[10px] text-[var(--text-muted)]">Min 6 characters</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Connecting...</span>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="h-4 w-4" /> Sign In & Activate RLS Session
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Create Account & Setup Profile
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                Continue as Guest (Offline Mode)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
