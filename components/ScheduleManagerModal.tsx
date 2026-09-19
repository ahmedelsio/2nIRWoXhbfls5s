import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Dumbbell, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Sliders, 
  Zap, 
  RotateCcw, 
  Info,
  Clock
} from 'lucide-react';
import { PROGRAM_PRESETS, ProgramPreset } from '../data/routinesData';

interface ScheduleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkoutName: string;
  onSelectWorkout: (workoutKey: string, customName?: string) => void;
}

export const ScheduleManagerModal: React.FC<ScheduleManagerModalProps> = ({
  isOpen,
  onClose,
  currentWorkoutName,
  onSelectWorkout,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ppl-hypertrophy');
  const [activeTab, setActiveTab] = useState<'schedule' | 'how_it_works' | 'swap_today'>('schedule');
  const [weeklySchedule, setWeeklySchedule] = useState(PROGRAM_PRESETS[0].schedule);
  const [threeDayMode, setThreeDayMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPreset = PROGRAM_PRESETS.find(p => p.id === selectedPresetId) || PROGRAM_PRESETS[0];

  const handlePresetChange = (preset: ProgramPreset) => {
    setSelectedPresetId(preset.id);
    setWeeklySchedule(preset.schedule);
    setThreeDayMode(false);
  };

  const handleToggleThreeDay = () => {
    if (!threeDayMode) {
      setThreeDayMode(true);
      // Compress to 3 high-yield days
      setWeeklySchedule([
        { day: 'Mon', workoutKey: 'push_a', workoutLabel: 'Upper Body (Chest & Back focus)', isRest: false },
        { day: 'Tue', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
        { day: 'Wed', workoutKey: 'legs_a', workoutLabel: 'Lower Body (Squat & Hinge focus)', isRest: false },
        { day: 'Thu', workoutKey: 'rest', workoutLabel: 'Rest & Mobility', isRest: true },
        { day: 'Fri', workoutKey: 'push_b', workoutLabel: 'Full Body Compound Pump', isRest: false },
        { day: 'Sat', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
        { day: 'Sun', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
      ]);
    } else {
      setThreeDayMode(false);
      setWeeklySchedule(currentPreset.schedule);
    }
  };

  const handleSelectRoutineForToday = (workoutKey: string, label: string) => {
    onSelectWorkout(workoutKey, label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-main)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Training Days & Workout Engine
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Customize weekly days, program rotation, and how Ironmate determines today's session
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
            onClick={() => setActiveTab('schedule')}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === 'schedule'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            1. Weekly Schedule & Days
          </button>
          <button
            onClick={() => setActiveTab('how_it_works')}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === 'how_it_works'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            2. How Ironmate Determines Today
          </button>
          <button
            onClick={() => setActiveTab('swap_today')}
            className={`border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === 'swap_today'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            3. Swap Today Directly
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: WEEKLY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {/* Program Preset Selector */}
              <div>
                <label className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                  Active Program Split:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PROGRAM_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetChange(preset)}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        selectedPresetId === preset.id
                          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/40 shadow'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{preset.name}</span>
                        {selectedPresetId === preset.id && (
                          <Check className="h-4 w-4 text-[var(--accent)]" />
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)] line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Adaptor: "I can only train 3 days" */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Zap className="h-4 w-4" /> Time-Compressed Week Adaptor
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Busy week? Compress this week into 3 high-yield compound sessions without losing muscle frequency.
                  </p>
                </div>
                <button
                  onClick={handleToggleThreeDay}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
                    threeDayMode 
                      ? 'bg-amber-400 text-black shadow' 
                      : 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  {threeDayMode ? '3-Day Active' : 'Enable 3-Day'}
                </button>
              </div>

              {/* Monday-Sunday Matrix */}
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block mb-2">
                  Weekly Schedule Matrix:
                </span>
                <div className="space-y-1.5">
                  {weeklySchedule.map((item, idx) => {
                    const isToday = item.day === 'Tue'; // Simulated Tuesday
                    return (
                      <div
                        key={item.day}
                        className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                          isToday 
                            ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/30' 
                            : 'border-[var(--border-subtle)] bg-[var(--bg-main)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-10 text-center font-mono text-xs font-black rounded-lg py-1 ${
                            isToday ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                          }`}>
                            {item.day}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {item.workoutLabel}
                              </span>
                              {isToday && (
                                <span className="rounded bg-[var(--accent)] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[var(--accent-contrast)]">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {item.isRest ? 'Full muscle recovery & CNS down-regulation' : 'Scheduled in SQLite queue'}
                            </span>
                          </div>
                        </div>

                        {!item.isRest && (
                          <button
                            onClick={() => handleSelectRoutineForToday(item.workoutKey, item.workoutLabel)}
                            className="rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] transition"
                          >
                            Set as Today
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW IRONMATE DETERMINES TODAY */}
          {activeTab === 'how_it_works' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                  <Info className="h-4 w-4" /> The 3 Rules Behind Today's Workout ("Push A"):
                </div>
                
                <div className="space-y-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <strong className="text-[var(--text-primary)] block mb-0.5">
                      1. Program Rotation Queue (Block Progression)
                    </strong>
                    You are in Week 3 of your 6-week Hypertrophy Block. Session 1 was Pull A (completed yesterday). The next scheduled routine in your rotation queue is <strong>Push A</strong>.
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <strong className="text-[var(--text-primary)] block mb-0.5">
                      2. Muscle Stimulus & Recovery Interval
                    </strong>
                    Your Chest, Anterior Deltoids, and Triceps have had <strong>72 hours</strong> since their last session (sufficient for local muscle repair). Your back and biceps are still at 40% fatigue from yesterday's heavy rows.
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <strong className="text-[var(--text-primary)] block mb-0.5">
                      3. Wearable Readiness Modulation
                    </strong>
                    Your Apple Health / Health Connect synced <strong>6h 15m of sleep</strong> (35m short). Rather than cancelling the workout or switching exercises randomly, Ironmate keeps the compound structure but prescribes: <em>"Hold top set load at 82.5kg @ RIR 2."</em>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-emerald-400 block mb-1">
                  Evidence Over Randomness:
                </span>
                Generic fitness apps generate random "exercise soup" every day. Ironmate protects your periodization and tracks progressive overload across 4 to 6 weeks so you actually add weight to the bar.
              </div>
            </div>
          )}

          {/* TAB 3: SWAP TODAY'S SESSION DIRECTLY */}
          {activeTab === 'swap_today' && (
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] block">
                Choose Which Routine to Run Today:
              </span>

              {/* Push A */}
              <div 
                onClick={() => handleSelectRoutineForToday('push_a', 'Push A (Chest, Shoulders & Triceps)')}
                className="cursor-pointer rounded-xl border border-[var(--accent)] bg-[var(--accent-subtle)]/40 p-3.5 transition hover:opacity-90"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-[var(--text-primary)]">Upper Body Hypertrophy (Push A)</h4>
                      <span className="rounded bg-[var(--accent)] px-1.5 py-0.2 font-mono text-[9px] font-bold text-[var(--accent-contrast)]">
                        CURRENT ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Barbell Bench Press (82.5kg) • Incline DB Press • OHP • Cable Lateral Raises
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                </div>
              </div>

              {/* Pull A */}
              <div 
                onClick={() => handleSelectRoutineForToday('pull_a', 'Pull A (Back, Rear Delts & Biceps)')}
                className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3.5 transition hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[var(--text-primary)]">Back & Bicep Overload (Pull A)</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Barbell Bent-Over Row (72.5kg) • Neutral Lat Pulldown • Face Pulls • Incline DB Curls
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
              </div>

              {/* Legs A */}
              <div 
                onClick={() => handleSelectRoutineForToday('legs_a', 'Legs A (Quads, Hamstrings & Calves)')}
                className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3.5 transition hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[var(--text-primary)]">Lower Body Compound (Legs A)</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Barbell Back Squat (102.5kg) • Romanian Deadlift (RDL) • Leg Press • Standing Calves
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
              </div>

              {/* 30-Min Crowded */}
              <div 
                onClick={() => handleSelectRoutineForToday('crowded_push', '30-Min Crowded Gym Push')}
                className="cursor-pointer rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 transition hover:border-amber-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <Zap className="h-3.5 w-3.5" /> 30-Min Crowded Gym Version
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Dumbbell Flat Press • Seated DB Press • Standing Laterals (No racks or cables needed)
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-400" />
                </div>
              </div>

              {/* Rest & Mobility */}
              <div 
                onClick={() => handleSelectRoutineForToday('mobility', 'Rest & Joint Mobility Flow')}
                className="cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 transition hover:border-emerald-500"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <RotateCcw className="h-3.5 w-3.5" /> Active Rest & Joint Mobility Flow
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Hip 90/90 • Thoracic Thread • World's Greatest Stretch • Deep Squat Pry (Protects streak)
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-main)] px-6 py-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>Active: <strong>{currentWorkoutName}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-[var(--accent-contrast)] hover:opacity-90"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
