import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Wifi, WifiOff, CheckCircle, ArrowRight, 
  Layers, Zap, Cpu, Server, X, Copy, Check, BarChart3, AlertCircle,
  Download, ShieldAlert, Info, ShieldCheck
} from 'lucide-react';
import { useNetworkStatus, LocalStore, markAllAsLocalSynced, clearOfflineQueue } from '../libs/offline';
import { isSupabaseConfigured } from '../libs/supabase/client';
import { queryClient } from '../libs/tanstack/queryClient';
import { OneRepMaxEngine } from '../libs/engine/brzycki';
import { calculateBarbellPlates } from '../libs/engine/plateMath';
import { ProgressionEngine } from '../libs/engine/progression';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'architecture' | 'offline_queue' | 'engine_tester';
  onOpenAuth?: () => void;
}

export function SupabaseDataLayerModal({ isOpen, onClose, initialTab = 'architecture', onOpenAuth }: Props) {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, triggerSync } = useNetworkStatus();
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'offline_queue' | 'engine_tester'>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Engine tester interactive state
  const [testWeight, setTestWeight] = useState<number>(100);
  const [testReps, setTestReps] = useState<number>(6);
  const [testBarWeight, setTestBarWeight] = useState<number>(20);

  if (!isOpen) return null;

  const queue = LocalStore.getQueue();
  const e1rm = OneRepMaxEngine.brzycki(testWeight, testReps);
  const platePlan = calculateBarbellPlates(testWeight, testBarWeight);
  const progressionAdvice = ProgressionEngine.evaluateDoubleProgression(
    testWeight,
    [6, 8],
    [
      { weightKg: testWeight, reps: testReps, targetReps: 8, rir: 2 },
      { weightKg: testWeight, reps: testReps, targetReps: 8, rir: 2 },
    ],
    true
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportQueue = () => {
    const dataStr = JSON.stringify(queue, null, 2);
    copyToClipboard(dataStr, 'queue_json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Supabase + TanStack + Offline Architecture</h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Production Layer Active
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Wired in <code className="text-neutral-200">/src/libs/&#123;supabase, tanstack, offline, engine&#125;</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-neutral-800 bg-neutral-900/30 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'architecture'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Data Flow & Status
          </button>
          <button
            onClick={() => setActiveSubTab('offline_queue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'offline_queue'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Basement Sync Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('engine_tester')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'engine_tester'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Biomechanical Engine
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSubTab === 'architecture' && (
            <div className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span>Supabase Backend</span>
                    <Server className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'}`} />
                    {isSupabaseConfigured ? 'Connected (Cloud)' : 'Offline Local Fallback'}
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400 font-mono truncate">
                    {isSupabaseConfigured ? 'PostgreSQL 15 + RLS' : 'Storage Engine: LocalStore v1'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span>TanStack Query v5</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Offline-First Mode
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400 font-mono">
                    Stale: 5m | GC: 24h | Optimistic &lt;16ms
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span>Device Connectivity</span>
                    {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    {isOnline ? 'Online (Basement Clear)' : 'Basement Dead Zone'}
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400 font-mono">
                    Pending Queue: {pendingCount} mutations
                  </div>
                </div>
              </div>

              {/* Tiered Architecture Card */}
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Wired Architecture Layers
                </h3>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold">1. /src/libs/supabase/</span>
                      <div className="text-neutral-400 text-[11px] mt-0.5">
                        <code>client.ts</code>, <code>schemas.ts</code>, <code>workout.repository.ts</code>, <code>exercise.repository.ts</code>, <code>profile.repository.ts</code>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                      Zod + RLS Safe
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-amber-400 font-bold">2. /src/libs/tanstack/</span>
                      <div className="text-neutral-400 text-[11px] mt-0.5">
                        <code>queryClient.ts</code>, <code>keys.ts</code>, <code>useWorkouts.ts</code>, <code>useExercises.ts</code>, <code>useProfile.ts</code>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px]">
                      Optimistic &lt;16ms
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-sky-400 font-bold">3. /src/libs/offline/</span>
                      <div className="text-neutral-400 text-[11px] mt-0.5">
                        <code>storage.ts</code>, <code>syncWorker.ts</code>, <code>useNetworkStatus.ts</code>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px]">
                      Idempotent UUIDs
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-purple-400 font-bold">4. /src/libs/engine/</span>
                      <div className="text-neutral-400 text-[11px] mt-0.5">
                        <code>brzycki.ts</code>, <code>plateMath.ts</code>, <code>progression.ts</code>, <code>volumeLandmarks.ts</code>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px]">
                      Pure Math & Cues
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'offline_queue' && (
            <div className="space-y-4">
              {/* Header and Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Basement Sync Queue</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300">
                      {queue.length} {queue.length === 1 ? 'item' : 'items'}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Offline-first mutation buffer with idempotent UUID reconciliation.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => triggerSync()}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50 active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                  {queue.length > 0 && (
                    <>
                      <button
                        onClick={() => markAllAsLocalSynced()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 transition active:scale-95"
                        title="Mark all pending sets as saved to on-device storage"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark Local Saved</span>
                      </button>
                      <button
                        onClick={handleExportQueue}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono border border-neutral-800 transition"
                        title="Copy raw queue JSON to clipboard"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{copiedKey === 'queue_json' ? 'Copied!' : 'Export JSON'}</span>
                      </button>
                      <button
                        onClick={() => clearOfflineQueue()}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-900/50 transition"
                        title="Clear completed or stuck items"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Explanatory Timeline: When does it sync? */}
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span>When Does Ironmate Sync Your Workout?</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-neutral-400 pt-1">
                  <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                    <span className="font-bold text-emerald-400 block mb-0.5">1. Real-Time (Gym Floor)</span>
                    When online & authenticated, each set logs to Supabase immediately (&lt;16ms optimistic UI).
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                    <span className="font-bold text-amber-400 block mb-0.5">2. Wi-Fi Reconnection</span>
                    Basement dead-zones store sets locally. Once signal returns, the worker drains the queue automatically.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                    <span className="font-bold text-sky-400 block mb-0.5">3. User Sign-In Handshake</span>
                    Sets logged in Guest mode remain locally safe. Signing in transfers and flushes them to your cloud profile.
                  </div>
                </div>
              </div>

              {/* Status Notice if items in queue */}
              {queue.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-300">
                      {queue.length} {queue.length === 1 ? 'mutation is' : 'mutations are'} buffered in on-device storage.
                    </p>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      Your workout data is 100% saved locally in your browser's persistent cache.
                      {!isSupabaseConfigured ? (
                        ' The app is currently operating in Standalone Local Offline Mode (Supabase URL not configured).'
                      ) : (
                        ' Writes to Supabase require an authenticated account under Row-Level Security (RLS).'
                      )}
                      {' '}Click <strong>Mark Local Saved</strong> to acknowledge local storage, or sign in to push directly to Supabase.
                    </p>
                    {onOpenAuth && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuth();
                        }}
                        className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-400 hover:underline"
                      >
                        Sign in to Supabase &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

              {queue.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-neutral-900/40 border border-neutral-800">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-white">Queue Settled (0 Pending)</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    All sets, workouts, and profile updates are synchronized with on-device storage and remote database.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {queue.map((mutation) => {
                    const payload = mutation.payload as Record<string, any> || {};
                    return (
                      <div
                        key={mutation.id}
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 font-bold uppercase text-[11px]">
                              {mutation.mutationType}
                            </span>
                            <span className="text-neutral-500 font-mono text-[10px]">[{mutation.table}]</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded font-mono font-semibold ${
                              mutation.status === 'synced'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : mutation.status === 'failed'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {mutation.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {new Date(mutation.clientTimestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Payload Summary (e.g. Set details) */}
                        {payload.weight_kg !== undefined && (
                          <div className="text-[11px] font-mono text-neutral-300">
                            Set #{payload.set_number}: {payload.weight_kg}kg × {payload.reps} reps (RIR {payload.rir ?? '-'})
                          </div>
                        )}

                        {mutation.lastError && (
                          <div className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{mutation.lastError}</span>
                          </div>
                        )}

                        <div className="text-[10px] font-mono text-neutral-500 truncate">
                          idempotency_key: {mutation.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'engine_tester' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Biomechanical & Math Engine Tester</h3>
                <p className="text-xs text-neutral-400">
                  Pure mathematical calculations (no UI dependencies) living in <code className="text-neutral-200">/src/libs/engine/</code>.
                </p>
              </div>

              {/* Input controls */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Load (kg)</label>
                  <input
                    type="number"
                    value={testWeight}
                    onChange={(e) => setTestWeight(Number(e.target.value))}
                    step={2.5}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Completed Reps</label>
                  <input
                    type="number"
                    value={testReps}
                    onChange={(e) => setTestReps(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Bar Weight (kg)</label>
                  <input
                    type="number"
                    value={testBarWeight}
                    onChange={(e) => setTestBarWeight(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Calculations Result */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1RM & Progression Card */}
                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Brzycki Estimated 1RM</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">{e1rm}</span>
                    <span className="text-xs text-neutral-400 font-semibold">kg</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-300">
                    <span className="font-semibold text-emerald-400">Overload Rule: </span>
                    {progressionAdvice.reason}
                  </div>
                </div>

                {/* Plate Calculator Card */}
                <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span>Barbell Plate Loading (Per Side)</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    Load per side: <span className="text-white font-mono font-bold">{platePlan.weightPerSideKg} kg</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {platePlan.platesPerSide.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic">Empty bar</span>
                    ) : (
                      platePlan.platesPerSide.map((p, idx) => (
                        <span
                          key={idx}
                          style={{ backgroundColor: p.color }}
                          className="px-2.5 py-1 rounded text-xs font-black text-white shadow-sm font-mono"
                        >
                          {p.countPerSide}x {p.weightKg}kg
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
