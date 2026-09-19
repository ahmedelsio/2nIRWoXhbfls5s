import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  LifterPersona,
  WorkoutExercise,
  MorningBriefingData,
  NightDebriefData,
  HistoricalWorkout,
  SetRecord,
  Exercise,
} from '../types';
import {
  LIFTER_PERSONAS,
  calculateSessionStats,
  generateDebriefFromSession,
} from '../data/dataFactory';
import { MOCK_NIGHT_DEBRIEF } from '../data/mockData';
import { PULL_A_SESSION, LEGS_A_SESSION, CROWDED_PUSH_EXERCISES } from '../data/routinesData';
import { useAuth } from './AuthContext';
import { WorkoutRepository, normalizeExerciseId } from '../libs/supabase/workout.repository';
import { LocalStore } from '../libs/offline/storage';

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
        },
      ],
      tomorrowPreview: {
        title: 'Recovery Walk & Rest',
        type: 'rest',
        description: 'Take a 30-minute walk. Mild muscle stiffness (DOMS) after session 1 is completely normal and healthy.',
      },
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
        },
      ],
      tomorrowPreview: {
        title: 'Heavy Lower Body (Squat & Deadlift)',
        type: 'workout',
        description: 'Session 3: 140kg Barbell Back Squats @ RPE 8 + Deficit Romanian Deadlifts. Ensure 8h sleep tonight.',
      },
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
        },
      ],
      tomorrowPreview: {
        title: 'Upper Body Pull & Core',
        type: 'workout',
        description: 'Lat pulldowns, chest-supported rows, and lateral delts. 50 minutes estimated.',
      },
    };
  }
  return MOCK_NIGHT_DEBRIEF;
};

interface DataFactoryContextType {
  activePersonaId: string;
  activePersona: LifterPersona;
  activeWorkout: WorkoutExercise[];
  activeBriefing: MorningBriefingData;
  activeSessionId: string;
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

  const [activeSessionId, setActiveSessionId] = useState<string>(() => generateSessionId());
  const activeSessionIdRef = useRef<string>(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  const baseLifter = LIFTER_PERSONAS['alex'];

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

  useEffect(() => {
    setActivePersona(dynamicPersona);
    setActivePersonaId(dynamicPersona.id);
  }, [dynamicPersona]);

  const selectPersona = (personaId: string) => {
    if (LIFTER_PERSONAS[personaId] && !user) {
      const p = LIFTER_PERSONAS[personaId];
      setActivePersona(p);
      setActivePersonaId(personaId);
    }
  };

  const resetToInitialPersona = () => {
    setActiveWorkout(JSON.parse(JSON.stringify(dynamicPersona.initialWorkout)));
    setActiveBriefing(dynamicPersona.initialBriefing);
    setLatestDebrief(null);
    setMobilityActive(false);
  };

  const persistSet = (
    exerciseIndex: number,
    setIndex: number,
    setFields: Partial<SetRecord>
  ) => {
    if (!user?.id) return;
    const targetEx = activeWorkout[exerciseIndex];
    if (!targetEx || !targetEx.sets[setIndex]) return;
    const mergedSet: SetRecord = { ...targetEx.sets[setIndex], ...setFields };
    const exerciseId = normalizeExerciseId(targetEx.exercise.id || targetEx.exercise.name || '');
    const currentSessionId = activeSessionIdRef.current;
    setTimeout(() => {
      WorkoutRepository.logSet({
        session_id: currentSessionId,
        user_id: user.id,
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
      }).catch((err) => {
        console.warn('[DataFactory] Error writing set to Supabase:', err);
      });
    }, 0);
  };

  const updateActiveWorkoutSet = (
    exerciseIndex: number,
    setIndex: number,
    setFields: Partial<SetRecord>
  ) => {
    setActiveWorkout((prev) => {
      if (!Array.isArray(prev) || !prev[exerciseIndex]) return prev;
      const copy = [...prev];
      const targetEx = { ...copy[exerciseIndex] };
      const updatedSets = [...targetEx.sets];
      if (!updatedSets[setIndex]) return prev;
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...setFields };
      targetEx.sets = updatedSets;
      copy[exerciseIndex] = targetEx;
      return copy;
    });
    persistSet(exerciseIndex, setIndex, setFields);
    setSqliteSyncStatus('queued');
    setTimeout(() => setSqliteSyncStatus('synced'), 400);
  };

  const addSetToExercise = (exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev[exerciseIndex]) return prev;
      const copy = [...prev];
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

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev[exerciseIndex]) return prev;
      const copy = [...prev];
      const targetEx = { ...copy[exerciseIndex] };
      if (targetEx.sets.length <= 1) return prev;
      targetEx.sets = targetEx.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      copy[exerciseIndex] = targetEx;
      return copy;
    });
  };

  const swapActiveExercise = (exerciseIndex: number, newExercise: Exercise) => {
    setActiveWorkout((prev) => {
      if (!prev[exerciseIndex]) return prev;
      const copy = [...prev];
      const original = copy[exerciseIndex];
      copy[exerciseIndex] = {
        exercise: newExercise,
        lastPerformance: 'First session with substitution',
        targetPerformance: 'Target: 3 sets @ RIR 2',
        notes: `Substituted for ${original.exercise.name} (${newExercise.equipment})`,
        sets: original.sets.map((s) => ({
          ...s,
          completed: false,
          weightKg: Math.max(10, Math.round(s.weightKg * 0.7)),
        })),
      };
      return copy;
    });
  };

  const quickFillAllSets = () => {
    const setsToPersist: Array<{ exerciseId: string; setNumber: number; filled: SetRecord }> = [];
    setActiveWorkout((prev) =>
      prev.map((item) => ({
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
            exerciseId: item.exercise.id || item.exercise.name || 'bench',
            setNumber: sIdx + 1,
            filled,
          });
          return filled;
        }),
      }))
    );

    if (!user?.id) return;
    const currentSessionId = activeSessionIdRef.current;
    setTimeout(() => {
      for (const item of setsToPersist) {
        WorkoutRepository.logSet({
          session_id: currentSessionId,
          user_id: user.id,
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
  };

  const startSession = (workout: WorkoutExercise[], briefing: MorningBriefingData) => {
    const clonedWorkout: WorkoutExercise[] = JSON.parse(JSON.stringify(workout));
    clonedWorkout.forEach((item) => {
      item.sets = item.sets.map((s) => ({ ...s, completed: false }));
    });
    setActiveWorkout(clonedWorkout);
    setActiveBriefing(briefing);
    setLatestDebrief(null);

    const newSessionId = generateSessionId();
    activeSessionIdRef.current = newSessionId;
    setActiveSessionId(newSessionId);

    if (!user?.id) return;
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
  };

  const loadCustomRoutine = (workout: WorkoutExercise[], briefing: MorningBriefingData) => {
    startSession(workout, briefing);
  };

  const finishActiveWorkout = (durationMinutes: number = 54): NightDebriefData => {
    const { debrief, newPRs } = generateDebriefFromSession(
      activeBriefing.workoutName,
      activeWorkout,
      durationMinutes,
      knownPRs
    );

    setLatestDebrief(debrief);
    setKnownPRs(newPRs);

    setHistory((prev) => [
      {
        id: 'hist-' + Date.now(),
        workoutName: debrief.workoutName,
        date: 'Today, ' + debrief.completedAt,
        durationMinutes: debrief.durationMinutes,
        totalVolumeKg: debrief.totalVolumeKg,
        setsCount: debrief.setsCompleted,
        sessionGrade: debrief.sessionGrade,
        keyLift:
          debrief.prs.length > 0
            ? `${debrief.prs[0].exerciseName} (${debrief.prs[0].value})`
            : `${activeWorkout[0]?.exercise.name || 'Workout'} Completed`,
        prsDetected: debrief.prs.length,
      },
      ...prev,
    ]);

    const finishingSessionId = activeSessionIdRef.current;

    if (user?.id) {
      const alreadyLoggedSets = LocalStore.getSets(finishingSessionId);
      for (const item of activeWorkout) {
        const normalizedExId = normalizeExerciseId(item.exercise.id || item.exercise.name || '');
        item.sets.forEach((set, idx) => {
          if (!set.completed) return;
          const setNumber = set.setNumber || idx + 1;
          const alreadyExists = alreadyLoggedSets.some(
            (s) => s.exercise_id === normalizedExId && s.set_number === setNumber
          );
          if (alreadyExists) return;
          WorkoutRepository.logSet({
            session_id: finishingSessionId,
            user_id: user.id,
            exercise_id: normalizedExId,
            set_number: setNumber,
            set_type: (set.type as any) || 'working',
            weight_kg: set.weightKg,
            reps: set.reps,
            rir: typeof set.rir === 'number' ? Math.round(set.rir) : 2,
            rpe: typeof set.rpe === 'number' ? set.rpe : 8,
            is_completed: true,
          }).catch((err) => {
            console.warn('[DataFactory] Error logging set on finish:', err);
          });
        });
      }

      WorkoutRepository.completeSession(finishingSessionId, durationMinutes, debrief.gradeReason, {
        total_volume_kg: debrief.totalVolumeKg,
        total_sets_completed: debrief.setsCompleted,
        session_grade: debrief.sessionGrade,
      }).catch((err) => {
        console.warn('[DataFactory] Error completing session:', err);
      });
    }

    setSqliteSyncStatus('syncing');
    setTimeout(() => setSqliteSyncStatus('synced'), 600);
    return debrief;
  };

  const switchRoutine = (workoutKey: string, customName?: string) => {
    if (workoutKey === 'pull_a') {
      startSession(JSON.parse(JSON.stringify(PULL_A_SESSION)), {
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
    } else if (workoutKey === 'legs_a') {
      startSession(JSON.parse(JSON.stringify(LEGS_A_SESSION)), {
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
    } else if (workoutKey === 'crowded_push') {
      startSession(JSON.parse(JSON.stringify(CROWDED_PUSH_EXERCISES)), {
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
    } else {
      startSession(
        JSON.parse(JSON.stringify(activePersona.initialWorkout)),
        activePersona.initialBriefing
      );
    }
  };

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
        activeSessionId,
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