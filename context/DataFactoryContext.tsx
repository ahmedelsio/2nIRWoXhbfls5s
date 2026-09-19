import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { 
  LifterPersona, 
  WorkoutExercise, 
  MorningBriefingData, 
  NightDebriefData, 
  HistoricalWorkout,
  SetRecord,
  Exercise
} from '../types';
import { 
  LIFTER_PERSONAS, 
  calculateSessionStats, 
  generateDebriefFromSession 
} from '../data/dataFactory';
import { MOCK_NIGHT_DEBRIEF } from '../data/mockData';
import { PULL_A_SESSION, LEGS_A_SESSION, CROWDED_PUSH_EXERCISES } from '../data/routinesData';
import { useAuth } from './AuthContext';
import { WorkoutRepository, normalizeExerciseId } from '../libs/supabase/workout.repository';
import { isSupabaseConfigured } from '../libs/supabase/client';

// Helper to provide a rich, persona-specific baseline debrief prior to today's active session
export const getPersonaDefaultDebrief = (persona: LifterPersona): NightDebriefData => {
  if (persona.id === 'sarah') {
    return {
      workoutName: 'Novice Foundation (Full Body A)',
      completedAt: 'Yesterday 6:15 PM',
      durationMinutes: 44,
      totalVolumeKg: 2160,
      setsCompleted: 9,
      sessionGrade: 'A',
      gradeReason: 'First session completed with zero ego-loading. Mastered machine setups with RIR 3 safety buffer.',
      prs: [
        {
          exerciseName: 'Dumbbell Goblet Squat',
          metric: 'Baseline Established',
          value: '16.0kg × 10 reps',
          previousBest: 'First time',
          estimated1RM: 21.3,
        }
      ],
      tomorrowPreview: {
        title: 'Recovery Walk & Rest',
        type: 'rest',
        description: 'Take a 30-minute walk. Mild muscle stiffness (DOMS) after session 1 is completely normal and healthy.',
      }
    };
  }
  if (persona.id === 'marcus') {
    return {
      workoutName: 'Heavy Upper Peaking (Day 2)',
      completedAt: 'Yesterday 8:20 PM',
      durationMinutes: 68,
      totalVolumeKg: 9480,
      setsCompleted: 15,
      sessionGrade: 'A+',
      gradeReason: 'High rate of force development. All competition bench triples logged with clean bar path and locked pauses.',
      prs: [
        {
          exerciseName: 'Competition Barbell Bench',
          metric: 'Estimated 1RM PR',
          value: '120.0kg × 3 reps',
          previousBest: '117.5kg × 3 reps',
          estimated1RM: 130.9,
        }
      ],
      tomorrowPreview: {
        title: 'Heavy Lower Body (Squat & Deadlift)',
        type: 'workout',
        description: 'Session 3: 140kg Barbell Back Squats @ RPE 8 + Deficit Romanian Deadlifts. Ensure 8h sleep tonight.',
      }
    };
  }
  if (persona.id === 'elena') {
    return {
      workoutName: 'Glute & Posterior Chain Hypertrophy',
      completedAt: 'Yesterday 7:05 PM',
      durationMinutes: 52,
      totalVolumeKg: 5820,
      setsCompleted: 14,
      sessionGrade: 'A',
      gradeReason: 'Excellent pelvic-floor bracing and depth. Follicular phase strength utilized for progressive overload.',
      prs: [
        {
          exerciseName: 'Barbell Romanian Deadlift',
          metric: 'Rep Record',
          value: '70.0kg × 8 reps',
          previousBest: '65.0kg × 8 reps',
          estimated1RM: 86.8,
        }
      ],
      tomorrowPreview: {
        title: 'Upper Body Pull & Core',
        type: 'workout',
        description: 'Lat pulldowns, chest-supported rows, and lateral delts. 50 minutes estimated.',
      }
    };
  }
  // Default Alex
  return MOCK_NIGHT_DEBRIEF;
};

interface DataFactoryContextType {
  activePersonaId: string;
  activePersona: LifterPersona;
  activeWorkout: WorkoutExercise[];
  activeBriefing: MorningBriefingData;
  history: HistoricalWorkout[];
  knownPRs: Record<string, { weightKg: number; reps: number; e1RM: number; date: string }>;
  latestDebrief: NightDebriefData | null;
  activeDebrief: NightDebriefData;
  isDebriefFromLiveSession: boolean;
  isMobilityActive: boolean;
  sqliteSyncStatus: 'synced' | 'syncing' | 'queued';
  liveStats: {
    totalVolumeKg: number;
    setsCompleted: number;
    totalPrescribedSets: number;
    avgRir: number;
    completionRate: number;
  };
  selectPersona: (personaId: string) => void;
  updateActiveWorkoutSet: (exerciseIndex: number, setIndex: number, setFields: Partial<SetRecord>) => void;
  swapActiveExercise: (exerciseIndex: number, newExercise: Exercise) => void;
  swapExerciseInWorkout: (exerciseIndex: number, newExercise: Exercise) => void;
  switchRoutine: (workoutKey: string, customName?: string) => void;
  quickFillAllSets: () => void;
  finishActiveWorkout: (durationMinutes?: number) => NightDebriefData;
  resetToInitialPersona: () => void;
  setMobilityActive: (active: boolean) => void;
  loadCustomRoutine: (workout: WorkoutExercise[], briefing: MorningBriefingData) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
}

const DataFactoryContext = createContext<DataFactoryContextType | undefined>(undefined);

export const DataFactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  
  // RFC4122 compliant v4 Session ID generator
  const generateSessionId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const activeSessionIdRef = useRef<string>(generateSessionId());

  // Base profile fallback
  const baseLifter = LIFTER_PERSONAS['alex'];

  // Dynamically derive active lifter persona from authenticated user and profile
  const dynamicPersona = useMemo<LifterPersona>(() => {
    if (user) {
      const name = profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Lifter';
      const initials = (name.replace(/[^a-zA-Z]/g, '').slice(0, 2) || 'IM').toUpperCase();
      const exp = profile?.experience_level || 'intermediate';
      const goal = profile?.primary_goal || 'hypertrophy';
      const streak = Math.max(1, Math.floor((profile?.current_streak_days || 14) / 7));

      return {
        id: user.id,
        name,
        roleTitle: `${exp.toUpperCase()} • ${goal.toUpperCase()}`,
        avatarInitials: initials,
        experience: exp as any,
        goal: goal as any,
        splitName: 'Push / Pull / Legs (Periodized)',
        currentWeek: 3,
        totalWeeks: 8,
        streakWeeks: streak,
        bio: `Authenticated lifter (${user.email}). Direct Supabase cloud sync & RLS enabled.`,
        todayWorkoutKey: 'push_a',
        initialWorkout: baseLifter.initialWorkout,
        initialBriefing: {
          ...baseLifter.initialBriefing,
          workoutName: 'Upper Body Push (Chest & Shoulders)',
        },
        recentHistory: baseLifter.recentHistory,
        knownPRs: baseLifter.knownPRs,
      };
    }

    return {
      ...baseLifter,
      id: 'guest',
      name: 'Guest Lifter',
      roleTitle: 'OFFLINE MODE • SIGN IN FOR CLOUD SYNC',
      avatarInitials: 'GL',
      bio: 'Running in local offline mode. Sign in to your Supabase account to sync workouts and verify Row Level Security.',
    };
  }, [user, profile]);

  const [activePersonaId, setActivePersonaId] = useState<string>('auth-user');
  const [activePersona, setActivePersona] = useState<LifterPersona>(dynamicPersona);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutExercise[]>(baseLifter.initialWorkout);
  const [activeBriefing, setActiveBriefing] = useState<MorningBriefingData>(baseLifter.initialBriefing);
  const [history, setHistory] = useState<HistoricalWorkout[]>(baseLifter.recentHistory);
  const [knownPRs, setKnownPRs] = useState<Record<string, { weightKg: number; reps: number; e1RM: number; date: string }>>(
    baseLifter.knownPRs
  );
  const [latestDebrief, setLatestDebrief] = useState<NightDebriefData | null>(null);
  const [isMobilityActive, setMobilityActive] = useState<boolean>(false);
  const [sqliteSyncStatus, setSqliteSyncStatus] = useState<'synced' | 'syncing' | 'queued'>('synced');

  // Keep persona synced with auth
  useEffect(() => {
    setActivePersona(dynamicPersona);
    setActivePersonaId(dynamicPersona.id);
  }, [dynamicPersona]);

  // Compatibility switcher (no-op for demo personas)
  const selectPersona = (personaId: string) => {
    if (LIFTER_PERSONAS[personaId] && !user) {
      const p = LIFTER_PERSONAS[personaId];
      setActivePersona(p);
      setActivePersonaId(personaId);
    }
  };

  // Reset current state to clean initial defaults
  const resetToInitialPersona = () => {
    setActiveWorkout(JSON.parse(JSON.stringify(dynamicPersona.initialWorkout)));
    setActiveBriefing(dynamicPersona.initialBriefing);
    setLatestDebrief(null);
    setMobilityActive(false);
  };

  // Update a single set in active workout
  const updateActiveWorkoutSet = (
    exerciseIndex: number, 
    setIndex: number, 
    setFields: Partial<SetRecord>
  ) => {
    setActiveWorkout(prev => {
      const copy = [...prev];
      if (!copy[exerciseIndex]) return prev;
      const targetEx = { ...copy[exerciseIndex] };
      const updatedSets = [...targetEx.sets];
      if (!updatedSets[setIndex]) return prev;

      const mergedSet: SetRecord = {
        ...updatedSets[setIndex],
        ...setFields,
      };

      updatedSets[setIndex] = mergedSet;
      targetEx.sets = updatedSets;
      copy[exerciseIndex] = targetEx;
      return copy;
    });

    // Write to WorkoutRepository outside React render phase
    if (user?.id) {
      const targetEx = activeWorkout[exerciseIndex];
      if (targetEx && targetEx.sets[setIndex]) {
        const mergedSet: SetRecord = {
          ...targetEx.sets[setIndex],
          ...setFields,
        };
        const rawExerciseId = targetEx.exercise.id || targetEx.exercise.name || '';
        const exerciseId = normalizeExerciseId(rawExerciseId);
        const targetUserId = user.id;
        setTimeout(() => {
          WorkoutRepository.logSet({
            session_id: activeSessionIdRef.current,
            user_id: targetUserId,
            exercise_id: exerciseId,
            set_number: setIndex + 1,
            set_type: (mergedSet.type as any) || 'working',
            weight_kg: mergedSet.weightKg,
            reps: mergedSet.reps,
            target_reps: mergedSet.targetReps ?? mergedSet.reps,
            target_weight_kg: mergedSet.weightKg,
            rir: mergedSet.rir ?? 2,
            rpe: mergedSet.rpe ?? 8,
            is_completed: Boolean(mergedSet.completed),
          }).catch(err => {
            console.warn('[DataFactory] Error writing set to Supabase:', err);
          });
        }, 0);
      }
    }

    // Mark as locally queued in offline sync
    setSqliteSyncStatus('queued');
    setTimeout(() => setSqliteSyncStatus('synced'), 400);
  };

  // Add an extra set to an exercise in active workout
  const addSetToExercise = (exerciseIndex: number) => {
    setActiveWorkout(prev => {
      const copy = [...prev];
      if (!copy[exerciseIndex]) return prev;
      const targetEx = { ...copy[exerciseIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSetNumber = targetEx.sets.length + 1;
      const newSet: SetRecord = {
        id: `set-new-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        type: 'working',
        weightKg: lastSet ? lastSet.weightKg : 60,
        reps: lastSet ? lastSet.reps : 8,
        targetReps: lastSet?.targetReps ?? (lastSet ? lastSet.reps : 8),
        targetWeightKg: lastSet?.targetWeightKg ?? (lastSet ? lastSet.weightKg : 60),
        rir: 2,
        rpe: 8,
        completed: false,
      };
      targetEx.sets = [...targetEx.sets, newSet];
      copy[exerciseIndex] = targetEx;
      return copy;
    });
  };

  // Remove a set from an exercise in active workout
  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    setActiveWorkout(prev => {
      const copy = [...prev];
      if (!copy[exerciseIndex]) return prev;
      const targetEx = { ...copy[exerciseIndex] };
      if (targetEx.sets.length <= 1) return prev; // Keep at least one set
      targetEx.sets = targetEx.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      copy[exerciseIndex] = targetEx;
      return copy;
    });
  };

  // Swap an exercise in active workout (e.g. crowded gym substitution)
  const swapActiveExercise = (exerciseIndex: number, newExercise: Exercise) => {
    setActiveWorkout(prev => {
      const copy = [...prev];
      if (!copy[exerciseIndex]) return prev;
      const original = copy[exerciseIndex];

      copy[exerciseIndex] = {
        exercise: newExercise,
        lastPerformance: 'First session with substitution',
        targetPerformance: `Target: 3 sets @ RIR 2`,
        notes: `Substituted for ${original.exercise.name} (${newExercise.equipment})`,
        sets: original.sets.map((s) => ({
          ...s,
          completed: false,
          weightKg: Math.max(10, Math.round(s.weightKg * 0.7)), // safe starting load
        })),
      };
      return copy;
    });
  };

  // Quick fill all sets (great for testing full loop without manually tapping 15 times)
  const quickFillAllSets = () => {
    const setsToPersist: Array<{
      exerciseId: string;
      setNumber: number;
      filled: SetRecord;
    }> = [];

    setActiveWorkout(prev => {
      return prev.map((item) => ({
        ...item,
        sets: item.sets.map((s, sIdx) => {
          const filled = {
            ...s,
            completed: true,
            reps: s.targetReps || s.reps,
            weightKg: s.weightKg,
            rir: typeof s.rir === 'number' ? s.rir : 2,
            rpe: typeof s.rir === 'number' ? 10 - s.rir : 8,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setsToPersist.push({
            exerciseId: item.exercise.id || '00000000-0000-0000-0000-000000000002',
            setNumber: sIdx + 1,
            filled,
          });

          return filled;
        }),
      }));
    });

    // Write all sets asynchronously outside React render
    if (user?.id) {
      const targetUserId = user.id;
      setTimeout(() => {
        for (const item of setsToPersist) {
          WorkoutRepository.logSet({
            session_id: activeSessionIdRef.current,
            user_id: targetUserId,
            exercise_id: normalizeExerciseId(item.exerciseId),
            set_number: item.setNumber,
            set_type: (item.filled.type as any) || 'working',
            weight_kg: item.filled.weightKg,
            reps: item.filled.reps,
            target_reps: item.filled.targetReps ?? item.filled.reps,
            target_weight_kg: item.filled.weightKg,
            rir: item.filled.rir,
            rpe: item.filled.rpe,
            is_completed: true,
          }).catch(() => {});
        }
      }, 0);
    }
  };

  // Load custom routine (e.g. from Schedule Modal or Routine Swapper)
  const loadCustomRoutine = (workout: WorkoutExercise[], briefing: MorningBriefingData) => {
    const clonedWorkout: WorkoutExercise[] = JSON.parse(JSON.stringify(workout));
    setActiveWorkout(clonedWorkout);
    setActiveBriefing(briefing);
    setLatestDebrief(null);
    const newSessionId = generateSessionId();
    activeSessionIdRef.current = newSessionId;

    if (user?.id) {
      WorkoutRepository.createSession({
        id: newSessionId,
        user_id: user.id,
        name: briefing.workoutName,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        is_timeboxed: false,
        is_crowded_gym_mode: false,
      }).catch((err) => {
        console.warn('[DataFactory] Error creating session on start:', err);
      });
    }
  };

  // Finish active workout and calculate real Night Debrief
  const finishActiveWorkout = (durationMinutes: number = 54): NightDebriefData => {
    const { debrief, newPRs } = generateDebriefFromSession(
      activeBriefing.workoutName,
      activeWorkout,
      durationMinutes,
      knownPRs
    );

    setLatestDebrief(debrief);
    setKnownPRs(newPRs);

    // Save to historical workouts list
    const newHistoryRecord: HistoricalWorkout = {
      id: 'hist-' + Date.now(),
      workoutName: debrief.workoutName,
      date: 'Today, ' + debrief.completedAt,
      durationMinutes: debrief.durationMinutes,
      totalVolumeKg: debrief.totalVolumeKg,
      setsCount: debrief.setsCompleted,
      sessionGrade: debrief.sessionGrade,
      keyLift: debrief.prs.length > 0 
        ? `${debrief.prs[0].exerciseName} (${debrief.prs[0].value})` 
        : `${activeWorkout[0]?.exercise.name || 'Workout'} Completed`,
      prsDetected: debrief.prs.length,
    };

    setHistory(prev => [newHistoryRecord, ...prev]);

    if (!user?.id) {
      // Prepare a new session ID for next workout
      activeSessionIdRef.current = generateSessionId();
      return debrief;
    }

    // Persist completed session to LocalStore and sync queue
    const sessionId = activeSessionIdRef.current;
    WorkoutRepository.createSession({
      id: sessionId,
      user_id: user.id,
      name: debrief.workoutName,
      status: 'completed',
      started_at: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
      is_timeboxed: false,
      is_crowded_gym_mode: false,
      notes: debrief.gradeReason,
    }).then(() => {
      return WorkoutRepository.completeSession(sessionId, durationMinutes, debrief.gradeReason);
    }).then(() => {
      for (const item of activeWorkout) {
        const rawExerciseId = item.exercise.id || item.exercise.name || '';
        const normalizedExId = normalizeExerciseId(rawExerciseId);
        item.sets.forEach((set, idx) => {
          if (set.completed) {
            WorkoutRepository.logSet({
              session_id: sessionId,
              user_id: user.id,
              exercise_id: normalizedExId,
              set_number: set.setNumber || idx + 1,
              set_type: (set.type as any) || 'working',
              weight_kg: set.weightKg,
              reps: set.reps,
              rir: typeof set.rir === 'number' ? Math.round(set.rir) : 2,
              rpe: typeof set.rpe === 'number' ? set.rpe : (typeof set.rir === 'number' ? 10 - set.rir : 8),
              is_completed: true,
            }).catch(err => {
              console.warn('[DataFactory] Error logging set on finish:', err);
            });
          }
        });
      }
    }).catch(err => {
      console.warn('[DataFactory] Error persisting completed session to Supabase:', err);
    });

    // Prepare a new session ID for next workout
    activeSessionIdRef.current = generateSessionId();

    setSqliteSyncStatus('syncing');
    setTimeout(() => setSqliteSyncStatus('synced'), 600);

    return debrief;
  };

  // Routine switcher
  const switchRoutine = (workoutKey: string, customName?: string) => {
    if (workoutKey === 'pull_a') {
      const cloned = JSON.parse(JSON.stringify(PULL_A_SESSION));
      setActiveWorkout(cloned);
      setActiveBriefing({
        workoutName: customName || 'Back & Bicep Overload (Pull A)',
        splitDay: 'Day 3 • Pull Focus',
        estimatedMinutes: 55,
        cycleWeek: activePersona.currentWeek,
        cycleTotalWeeks: activePersona.totalWeeks,
        recoveryNote: 'Lats and upper back ready. Maintain neutral spine on rows.',
        readinessScore: 88,
        recommendedAdjustment: 'Keep heavy compound rows; RIR 2 baseline.',
        primaryLift: 'Barbell Bent-Over Row',
        primaryTarget: '72.5kg for 3 sets of 8 reps @ RIR 2',
      });
      setLatestDebrief(null);
    } else if (workoutKey === 'legs_a') {
      const cloned = JSON.parse(JSON.stringify(LEGS_A_SESSION));
      setActiveWorkout(cloned);
      setActiveBriefing({
        workoutName: customName || 'Lower Body Compound (Legs A)',
        splitDay: 'Day 4 • Legs Focus',
        estimatedMinutes: 65,
        cycleWeek: activePersona.currentWeek,
        cycleTotalWeeks: activePersona.totalWeeks,
        recoveryNote: 'High neurological demand. Warm up hip capsules before squatting.',
        readinessScore: 86,
        recommendedAdjustment: 'Rest 2.5-3 minutes on heavy squats.',
        primaryLift: 'Barbell Back Squat',
        primaryTarget: '102.5kg for 3 sets of 6 reps @ RIR 2',
      });
      setLatestDebrief(null);
    } else if (workoutKey === 'crowded_push') {
      const cloned = JSON.parse(JSON.stringify(CROWDED_PUSH_EXERCISES));
      setActiveWorkout(cloned);
      setActiveBriefing({
        workoutName: customName || '30-Min Crowded Gym Push',
        splitDay: 'Time-Boxed Emergency Split',
        estimatedMinutes: 30,
        cycleWeek: activePersona.currentWeek,
        cycleTotalWeeks: activePersona.totalWeeks,
        recoveryNote: 'Gym is crowded. Dumbbell & push-up circuit keeps stimulus high without waiting for racks.',
        readinessScore: 80,
        recommendedAdjustment: 'No wait times: superset DB bench with incline pushups.',
        primaryLift: 'Dumbbell Flat Bench Press',
        primaryTarget: '32.0kg for 3 sets of 8 reps',
      });
      setLatestDebrief(null);
    } else {
      const cloned = JSON.parse(JSON.stringify(activePersona.initialWorkout));
      setActiveWorkout(cloned);
      setActiveBriefing(activePersona.initialBriefing);
      setLatestDebrief(null);
    }
  };

  // Active debrief: If latest session has finished, use it; otherwise compute a rich persona-calibrated debrief
  const activeDebrief = useMemo<NightDebriefData>(() => {
    if (latestDebrief) return latestDebrief;
    return getPersonaDefaultDebrief(activePersona);
  }, [latestDebrief, activePersona]);

  const isDebriefFromLiveSession = latestDebrief !== null;

  const liveStats = calculateSessionStats(activeWorkout);

  return (
    <DataFactoryContext.Provider
      value={{
        activePersonaId,
        activePersona,
        activeWorkout,
        activeBriefing,
        history,
        knownPRs,
        latestDebrief,
        activeDebrief,
        isDebriefFromLiveSession,
        isMobilityActive,
        sqliteSyncStatus,
        liveStats,
        selectPersona,
        updateActiveWorkoutSet,
        swapActiveExercise,
        swapExerciseInWorkout: swapActiveExercise,
        switchRoutine,
        quickFillAllSets,
        finishActiveWorkout,
        resetToInitialPersona,
        setMobilityActive,
        loadCustomRoutine,
        addSetToExercise,
        removeSetFromExercise,
      }}
    >
      {children}
    </DataFactoryContext.Provider>
  );
};

export const useDataFactory = () => {
  const context = useContext(DataFactoryContext);
  if (!context) {
    throw new Error('useDataFactory must be used within a DataFactoryProvider');
  }
  return context;
};
