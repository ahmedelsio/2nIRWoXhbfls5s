/**
 * Ironmate Gym Floor Mode - Expo Router Screen
 * Path: app/(tabs)/gym.tsx
 * Sub-2-tap sweaty-finger logging, evidence-based comparisons, form cues,
 * calibrated plate calculator, and rock-solid number pickers.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView
} from 'react-native';
import { router, Stack, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Check,
  CheckCircle2,
  Plus,
  Minus,
  Clock,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowLeftRight,
  Sparkles,
  Play,
  Pause,
  FastForward,
  Flag,
  FileText,
  Dumbbell,
  Trash2,
  X,
  Info,
  AlertTriangle,
  BookOpen
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import MaskedGlassBG from '@/src/components/masked-glass-bg';
import { useDataFactory } from '@/src/context/DataFactoryContext';
import type { SetType } from '@/src/types';
import { Spacing } from '@/src/constants/theme';
import {
  DEFAULT_EXERCISES,
  type GymExercise,
  type ExerciseSet,
  workoutToGym,
} from '@/src/data/programCatalog';

export type { GymExercise, ExerciseSet };

const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_VISUAL_STYLES: Record<number, { bg: string; border: string; textColor: string; height: number; width: number }> = {
  25: { bg: '#dc2626', border: '#ef4444', textColor: '#ffffff', height: 96, width: 26 },
  20: { bg: '#2563eb', border: '#3b82f6', textColor: '#ffffff', height: 90, width: 24 },
  15: { bg: '#eab308', border: '#facc15', textColor: '#09090b', height: 80, width: 22 },
  10: { bg: '#16a34a', border: '#22c55e', textColor: '#ffffff', height: 70, width: 20 },
  5: { bg: '#f4f4f5', border: '#e4e4e7', textColor: '#09090b', height: 56, width: 18 },
  2.5: { bg: '#3f3f46', border: '#52525b', textColor: '#ffffff', height: 44, width: 16 },
  1.25: { bg: '#71717a', border: '#a1a1aa', textColor: '#ffffff', height: 36, width: 14 },
};

const COMMON_WEIGHT_PRESETS = [40, 50, 60, 70, 80, 82.5, 85, 90, 100, 110, 120, 140];

export default function GymModeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  // Global Context Integration
  const {
    activeSessionId,
    activeWorkout,
    activeBriefing,
    isSessionActive,
    latestDebrief,
    liveStats,
    loadCustomRoutine,
    updateActiveWorkoutSet,
    addSetToExercise,
    removeSetFromExercise,
    finishActiveWorkout,
  } = useDataFactory();

  // Initialize local exercises from context if available, fallback to empty array
  const [exercises, setExercises] = useState<GymExercise[]>(() => {
    if (activeWorkout && activeWorkout.length > 0) {
      return workoutToGym(activeWorkout);
    }
    return [];
  });

  const exerciseNames = activeWorkout?.map((w) => w.exercise.name).join(',') || '';
  const currentRoutineKey = `${activeSessionId}|${activeBriefing?.workoutName || ''}|${exerciseNames}`;

  const loadedWorkoutKeyRef = useRef<string>(
    activeWorkout && activeWorkout.length > 0 ? currentRoutineKey : ''
  );
  const sessionStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isSessionActive) return;
    if (activeWorkout && activeWorkout.length > 0) {
      const reloadKey = `${activeSessionId}|${activeBriefing?.workoutName || ''}|${exerciseNames}`;
      if (loadedWorkoutKeyRef.current !== reloadKey) {
        loadedWorkoutKeyRef.current = reloadKey;
        sessionStartedAtRef.current = Date.now();
        setExercises(workoutToGym(activeWorkout));
        setCurrentExIndex(0);
        setActiveSetIndex(0);
      }
    }
  }, [activeSessionId, activeBriefing?.workoutName, exerciseNames, activeWorkout]);

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);

  // Modals & Expanders State
  const [showCues, setShowCues] = useState(false);
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // Plate Calculator State inside modal
  const [plateTargetWeight, setPlateTargetWeight] = useState<number>(82.5);
  const [plateBarWeight, setPlateBarWeight] = useState<number>(20);

  // Rest Timer State
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [justCompletedSetId, setJustCompletedSetId] = useState<string | null>(null);

  const currentExercise = exercises[currentExIndex] || exercises[0] || DEFAULT_EXERCISES[0];
  const safeSetIdx = Math.min(activeSetIndex, Math.max(0, currentExercise.sets.length - 1));
  const activeSet = currentExercise.sets[safeSetIdx] || currentExercise.sets[0];

  // Sync plateTargetWeight when active set weight changes
  useEffect(() => {
    if (activeSet) {
      setPlateTargetWeight(activeSet.weight);
    }
  }, [activeSet?.weight, safeSetIdx, currentExIndex]);

  // Rest Timer countdown tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && restRemaining !== null && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsTimerRunning(false);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, restRemaining]);

  // Format MM:SS for Rest Timer
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Adjust Weight in Stepper
  const handleAdjustWeight = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const targetSet = currentExercise.sets[safeSetIdx];
    const currentWeight = targetSet ? targetSet.weight : 0;
    const newWeight = Math.max(0, Number((currentWeight + delta).toFixed(2)));

    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      const updatedSets = [...targetEx.sets];
      const current = updatedSets[safeSetIdx];
      updatedSets[safeSetIdx] = {
        ...current,
        weight: newWeight,
      };
      targetEx.sets = updatedSets;
      updated[currentExIndex] = targetEx;
      return updated;
    });

    // Sync to Context
    try {
      updateActiveWorkoutSet(currentExIndex, safeSetIdx, { weightKg: newWeight });
    } catch { }
  };

  // Direct Weight Application (from Plates or Presets)
  const handleApplyWeightDirectly = (newWeight: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const formattedWeight = Number(newWeight.toFixed(2));
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      const updatedSets = [...targetEx.sets];
      const current = updatedSets[safeSetIdx];
      updatedSets[safeSetIdx] = {
        ...current,
        weight: formattedWeight,
      };
      targetEx.sets = updatedSets;
      updated[currentExIndex] = targetEx;
      return updated;
    });

    try {
      updateActiveWorkoutSet(currentExIndex, safeSetIdx, { weightKg: formattedWeight });
    } catch { }
  };

  // Adjust Reps in Stepper
  const handleAdjustReps = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const targetSet = currentExercise.sets[safeSetIdx];
    const currentReps = targetSet ? targetSet.reps : 1;
    const newReps = Math.max(1, currentReps + delta);

    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      const updatedSets = [...targetEx.sets];
      const current = updatedSets[safeSetIdx];
      updatedSets[safeSetIdx] = {
        ...current,
        reps: newReps,
      };
      targetEx.sets = updatedSets;
      updated[currentExIndex] = targetEx;
      return updated;
    });

    try {
      updateActiveWorkoutSet(currentExIndex, safeSetIdx, { reps: newReps });
    } catch { }
  };

  // Set RIR in Stepper
  const handleSelectRIR = (rir: number) => {
    Haptics.selectionAsync();
    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      const updatedSets = [...targetEx.sets];
      const current = updatedSets[safeSetIdx];
      updatedSets[safeSetIdx] = {
        ...current,
        rir,
      };
      targetEx.sets = updatedSets;
      updated[currentExIndex] = targetEx;
      return updated;
    });

    try {
      updateActiveWorkoutSet(currentExIndex, safeSetIdx, { rir, rpe: 10 - rir });
    } catch { }
  };

  // 1-Tap Toggle Set Completed Status (Direct from table row checkmark)
  const handleToggleSetComplete = (setIdx: number) => {
    const targetSet = currentExercise.sets[setIdx];
    if (!targetSet) return;

    const isNowCompleted = !targetSet.completed;

    if (isNowCompleted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setJustCompletedSetId(targetSet.id);
      setTimeout(() => setJustCompletedSetId(null), 1000);

      // Start Rest Timer
      setRestRemaining(currentExercise.defaultRestSec);
      setIsTimerRunning(true);
    } else {
      Haptics.selectionAsync();
    }

    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      const updatedSets = [...targetEx.sets];
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        completed: isNowCompleted,
      };
      targetEx.sets = updatedSets;
      updated[currentExIndex] = targetEx;
      return updated;
    });

    try {
      updateActiveWorkoutSet(currentExIndex, setIdx, {
        completed: isNowCompleted,
        weightKg: targetSet.weight,
        reps: targetSet.reps,
        rir: targetSet.rir,
      });
    } catch { }

    // Advance focus to next uncompleted set
    if (isNowCompleted) {
      const nextUncompleted = currentExercise.sets.findIndex((s, idx) => !s.completed && idx > setIdx);
      if (nextUncompleted !== -1) {
        setActiveSetIndex(nextUncompleted);
      } else {
        const anyUncompleted = currentExercise.sets.findIndex((s) => !s.completed);
        if (anyUncompleted !== -1) {
          setActiveSetIndex(anyUncompleted);
        }
      }
    } else {
      setActiveSetIndex(setIdx);
    }
  };

  // Add Set to Current Exercise
  const handleAddSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
    const newSetNum = currentExercise.sets.length + 1;
    const newSet: ExerciseSet = {
      id: `custom-s-${currentExIndex}-${Date.now()}`,
      setNumber: newSetNum,
      type: 'working',
      weight: lastSet ? lastSet.weight : 82.5,
      reps: lastSet ? lastSet.reps : 6,
      targetReps: lastSet ? lastSet.targetReps : 6,
      rir: 2,
      completed: false,
      previous: lastSet ? `${lastSet.weight}kg × ${lastSet.reps}` : 'Target RIR 2',
    };

    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      targetEx.sets = [...targetEx.sets, newSet];
      updated[currentExIndex] = targetEx;
      return updated;
    });

    try {
      addSetToExercise(currentExIndex);
    } catch { }

    // Focus the newly created set
    setActiveSetIndex(currentExercise.sets.length);
  };

  // Remove Last Set from Current Exercise
  const handleRemoveLastSet = () => {
    if (currentExercise.sets.length <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const removeIdx = currentExercise.sets.length - 1;

    setExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[currentExIndex] };
      targetEx.sets = targetEx.sets.slice(0, -1);
      updated[currentExIndex] = targetEx;
      return updated;
    });

    try {
      removeSetFromExercise(currentExIndex, removeIdx);
    } catch { }

    if (safeSetIdx >= removeIdx) {
      setActiveSetIndex(Math.max(0, removeIdx - 1));
    }
  };

  // Complete Active Set CTA
  const handleCompleteActiveSet = () => {
    handleToggleSetComplete(safeSetIdx);
  };

  // Finish Entire Workout
  const handleFinishWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const minutes = Math.max(1, Math.round((Date.now() - sessionStartedAtRef.current) / 60000));
    try {
      finishActiveWorkout(minutes);
    } catch { }
    router.push('/(app)/(tabs)/(debrief)/debrief' as Href);
  };

  // Plate Calculations for Modal
  const calculatePlates = (totalKg: number, barKg: number) => {
    let remainderPerSide = Math.max(0, (totalKg - barKg) / 2);
    const platesUsed: { weight: number; count: number }[] = [];

    for (const plate of STANDARD_PLATES) {
      const count = Math.floor(remainderPerSide / plate);
      if (count > 0) {
        platesUsed.push({ weight: plate, count });
        remainderPerSide = Number((remainderPerSide - count * plate).toFixed(3));
      }
    }
    return { platesUsed, unachieved: remainderPerSide * 2 };
  };

  const { platesUsed, unachieved } = calculatePlates(plateTargetWeight, plateBarWeight);
  const loadPerSide = Math.max(0, (plateTargetWeight - plateBarWeight) / 2);
  const sleevePlates: number[] = platesUsed.flatMap((p) =>
    Array.from({ length: p.count }, () => p.weight)
  );

  if (!isSessionActive) {
    const finished = latestDebrief;
    return (
      <>
        <Stack.Screen options={{
          header: () => (
            <View style={[styles.topBar, { paddingTop: insets.top }]}>
              <MaskedGlassBG />
              <View>
                <Text style={styles.subtext}>GYM FLOOR MODE</Text>
                <Text style={styles.workoutTitle}>
                  {finished ? 'Session closed' : 'No active session'}
                </Text>
              </View>
            </View>
          ),
        }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#09090b' }}>
          {finished ? (
            <>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 }}>
                {finished.workoutName}
              </Text>
              <Text style={{ color: '#a1a1aa', marginBottom: 20 }}>
                {finished.setsCompleted} sets · {finished.totalVolumeKg.toLocaleString()} kg · {finished.durationMinutes} min
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(app)/(tabs)/(debrief)/debrief' as Href)}
                style={{ backgroundColor: '#27272a', padding: 16, borderRadius: 14, marginBottom: 12 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Open Debrief</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: '#a1a1aa', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
              Start from Today to open the floor logger.
            </Text>
          )}
          <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/(today)' as Href)}
            style={{
              backgroundColor: theme.accent,
              paddingHorizontal: 20,
              paddingVertical: Spacing.three,
              borderRadius: 12,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#09090b', fontWeight: '800', textAlign: 'center' }}>
              {finished ? 'Start another from Today' : 'Go to Today'}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{
        header: () => (
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <MaskedGlassBG />
            <View>
              <Text style={styles.subtext}>
                {activeBriefing?.splitDay
                  ? `${activeBriefing.splitDay} • ${activeBriefing.workoutName.toUpperCase()}`
                  : 'SESSION 1 OF 3 • PUSH A'}
              </Text>
              <Text style={styles.workoutTitle}>Gym Floor Mode</Text>
            </View>
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={handleFinishWorkout}
              activeOpacity={0.8}
            >
              <Flag size={15} color="#09090b" strokeWidth={2.5} />
              <Text style={styles.finishBtnText}>Finish</Text>
            </TouchableOpacity>
          </View>
        )
      }} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { gap: Spacing.two, paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HORIZONTAL EXERCISE CAROUSEL CHIPS */}
        <View style={styles.exerciseNavContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.two, gap: 8 }}
          >
            {exercises.map((ex, idx) => {
              const active = idx === currentExIndex;
              const allDone = ex.sets.every((s) => s.completed);
              const doneCount = ex.sets.filter((s) => s.completed).length;

              return (
                <TouchableOpacity
                  key={ex.id}
                  style={[
                    styles.navChip,
                    active && styles.navChipActive,
                    allDone && styles.navChipDone,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCurrentExIndex(idx);
                    setActiveSetIndex(0);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {allDone ? (
                      <Check size={13} color="#22c55e" strokeWidth={3} />
                    ) : (
                      <Text style={[styles.chipIdxText, active && styles.chipIdxTextActive]}>
                        {idx + 1}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.navChipText,
                        active && styles.navChipTextActive,
                        allDone && { color: '#22c55e' },
                      ]}
                      numberOfLines={1}
                    >
                      {ex.name}
                    </Text>
                    <Text style={styles.chipCounter}>
                      ({doneCount}/{ex.sets.length})
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: Spacing.two }}>
          {/* 1. REST TIMER BANNER */}
          {isTimerRunning && restRemaining !== null && (
            <View style={styles.restTimerCard}>
              <View>
                <Text style={styles.restTitle}>REST RUNNING</Text>
                <Text style={styles.restDigits}>{formatTimer(restRemaining)}</Text>
              </View>
              <View style={styles.restControls}>
                <TouchableOpacity
                  style={styles.restActionBtn}
                  onPress={() => setRestRemaining((s) => Math.max(0, (s || 0) - 15))}
                >
                  <Text style={styles.restActionText}>-15s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.restActionBtn}
                  onPress={() => setRestRemaining((s) => (s || 0) + 30)}
                >
                  <Text style={styles.restActionText}>+30s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.restActionBtn, { backgroundColor: '#27272a' }]}
                  onPress={() => {
                    setIsTimerRunning(false);
                    setRestRemaining(0);
                  }}
                >
                  <Text style={[styles.restActionText, { color: '#ffffff' }]}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 2. EXERCISE TITLE & BIOMECHANICS HEADER */}
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <View style={styles.exerciseBadge}>
                    <Text style={styles.exerciseBadgeText}>
                      {currentExIndex + 1} / {exercises.length}
                    </Text>
                  </View>
                  <Text style={styles.muscleText} numberOfLines={1}>
                    {currentExercise.muscle}
                  </Text>
                </View>
                <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
              </View>

              {/* Form Cues Drawer Trigger */}
              <TouchableOpacity
                style={[styles.cuesTriggerBtn, showCues && styles.cuesTriggerBtnActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowCues(!showCues);
                }}
                activeOpacity={0.75}
              >
                <HelpCircle size={16} color={showCues ? '#ccff00' : '#38bdf8'} />
                <Text style={[styles.cuesTriggerText, showCues && { color: '#ccff00' }]}>
                  {showCues ? 'Hide Cues' : 'Cues'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CRITICAL GAP FIX 1: HISTORICAL VS TODAY TARGET COMPARISON CARDS */}
            <View style={styles.comparisonGrid}>
              {/* Last Session Card */}
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonLabel}>LAST SESSION</Text>
                <Text style={styles.comparisonValue} numberOfLines={1}>
                  {currentExercise.lastPerformance}
                </Text>
              </View>

              {/* Today's Target Card */}
              <View style={[styles.comparisonCard, styles.targetCard]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.comparisonLabel, { color: '#ccff00' }]}>TODAY'S TARGET</Text>
                  <Sparkles size={12} color={theme.accent} />
                </View>
                <Text style={[styles.comparisonValue, { color: '#ccff00' }]} numberOfLines={1}>
                  {currentExercise.targetPerformance}
                </Text>
              </View>
            </View>

            {/* EXPANDABLE EVIDENCE-BASED FORM CUES DRAWER */}
            {showCues && (
              <View style={styles.cuesDrawer}>
                <View style={styles.cueRow}>
                  <Text style={styles.cueLabel}>SETUP</Text>
                  <Text style={styles.cueBody}>{currentExercise.cues.setup}</Text>
                </View>

                <View style={styles.cueRow}>
                  <Text style={styles.cueLabel}>EXECUTION</Text>
                  <Text style={styles.cueBody}>{currentExercise.cues.execution}</Text>
                </View>

                <View style={styles.cueRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={11} color="#f59e0b" />
                    <Text style={[styles.cueLabel, { color: '#f59e0b' }]}>COMMON MISTAKE</Text>
                  </View>
                  <Text style={[styles.cueBody, { color: '#fbbf24' }]}>{currentExercise.cues.mistake}</Text>
                </View>

                {currentExercise.cues.femaleNote && (
                  <View style={[styles.cueRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={[styles.cueLabel, { color: '#f472b6' }]}>FEMALE BIOMECHANICS</Text>
                    <Text style={[styles.cueBody, { color: '#f9a8d4' }]}>
                      {currentExercise.cues.femaleNote}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.openCuesModalBtn}
                  onPress={() => router.push('/modal/cues' as Href)}
                >
                  <BookOpen size={13} color="#a1a1aa" />
                  <Text style={styles.openCuesModalText}>Open Full Library Cues Modal</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* CRITICAL GAP FIX 2: LOGGED SETS TABLE WITH PERFECT ALIGNMENT & ADD/REMOVE SETS */}
          <View style={styles.setTableCard}>
            {/* Table Header with Add Set CTA */}
            <View style={styles.tableHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.tableTitle}>LOGGED SETS</Text>
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>
                      {currentExercise.sets.filter((s) => s.completed).length} / {currentExercise.sets.length}
                    </Text>
                  </View>
                </View>
                <Text style={styles.tableSubtitle}>Tap row to focus • Tap ✓ to log</Text>
              </View>

              <TouchableOpacity
                style={styles.addSetBtn}
                onPress={handleAddSet}
                activeOpacity={0.8}
              >
                <Plus size={14} color="#09090b" strokeWidth={3} />
                <Text style={styles.addSetBtnText}>Add Set</Text>
              </TouchableOpacity>
            </View>

            {/* Column Labels */}
            <View style={styles.columnLabelsRow}>
              <Text style={[styles.colHeader, { width: 44, textAlign: 'center' }]}>SET</Text>
              <Text style={[styles.colHeader, { flex: 1, paddingLeft: 4 }]}>PREVIOUS / TARGET</Text>
              <Text style={[styles.colHeader, { width: 72, textAlign: 'center' }]}>WEIGHT</Text>
              <Text style={[styles.colHeader, { width: 50, textAlign: 'center' }]}>REPS</Text>
              <Text style={[styles.colHeader, { width: 52, textAlign: 'center' }]}>DONE</Text>
            </View>

            {/* Set Rows */}
            <View style={{ gap: 6 }}>
              {currentExercise.sets.map((set, idx) => {
                const isFocused = idx === safeSetIdx;
                const isCompleted = set.completed;
                const isJustDone = justCompletedSetId === set.id;

                return (
                  <TouchableOpacity
                    key={set.id}
                    style={[
                      styles.setRowItem,
                      isFocused && styles.setRowItemFocused,
                      isCompleted && styles.setRowItemCompleted,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActiveSetIndex(idx);
                    }}
                    activeOpacity={0.85}
                  >
                    {/* Set Number Pill */}
                    <View style={{ width: 44, alignItems: 'center' }}>
                      <View
                        style={[
                          styles.setNumberBadge,
                          isCompleted && styles.setNumberBadgeCompleted,
                          isFocused && !isCompleted && styles.setNumberBadgeFocused,
                        ]}
                      >
                        <Text
                          style={[
                            styles.setNumberText,
                            isCompleted && styles.setNumberTextCompleted,
                            isFocused && !isCompleted && styles.setNumberTextFocused,
                          ]}
                        >
                          {set.type === 'warmup' ? 'W' : set.setNumber}
                        </Text>
                      </View>
                    </View>

                    {/* Previous / Target info */}
                    <View style={{ flex: 1, paddingLeft: 4 }}>
                      <Text style={styles.previousText} numberOfLines={1}>
                        {set.previous}
                      </Text>
                      <Text style={styles.targetRirText}>
                        RIR {set.rir} {isCompleted ? '• Logged' : '• Target'}
                      </Text>
                    </View>

                    {/* Weight (kg) */}
                    <View style={{ width: 72, alignItems: 'center' }}>
                      <Text style={styles.weightCellText}>
                        {set.weight.toFixed(1)}
                        <Text style={styles.unitSmall}> kg</Text>
                      </Text>
                    </View>

                    {/* Reps */}
                    <View style={{ width: 50, alignItems: 'center' }}>
                      <Text style={styles.repsCellText}>{set.reps}</Text>
                    </View>

                    {/* 1-Tap Log / Toggle Button (44×44px touch target) */}
                    <View style={{ width: 52, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={[
                          styles.logSetBtn,
                          isCompleted && styles.logSetBtnDone,
                          isJustDone && styles.logSetBtnJustDone,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleSetComplete(idx);
                        }}
                        activeOpacity={0.8}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isCompleted ? (
                          <Check size={19} color="#09090b" strokeWidth={3} />
                        ) : (
                          <CheckCircle2 size={19} color="#71717a" strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Remove Last Set Button if multiple sets exist */}
            {currentExercise.sets.length > 1 && (
              <View style={styles.removeSetRow}>
                <TouchableOpacity
                  style={styles.removeSetBtn}
                  onPress={handleRemoveLastSet}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color="#71717a" />
                  <Text style={styles.removeSetText}>
                    Remove Set {currentExercise.sets.length}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* CRITICAL GAP FIX 4: ROCK-SOLID, RELIABLE NUMBER PICKERS (SWEATY-FINGER UX) */}
          <View style={styles.stepperSection}>
            <View style={styles.stepperHeaderRow}>
              <View>
                <Text style={styles.stepperSectionTitle}>
                  EDITING SET {activeSet.setNumber} OF {currentExercise.sets.length}
                </Text>
                <Text style={styles.stepperSectionSub}>
                  {currentExercise.notes}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.plateTriggerBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowPlateModal(true);
                }}
              >
                <Calculator size={14} color={theme.accent} />
                <Text style={styles.plateTriggerText}>Plates</Text>
              </TouchableOpacity>
            </View>

            {/* Steppers Grid */}
            <View style={styles.steppersGrid}>
              {/* 1. WEIGHT STEPPER */}
              <View style={styles.stepperCard}>
                <View style={styles.stepperTopLine}>
                  <Text style={styles.stepperCardLabel}>WEIGHT</Text>
                  <TouchableOpacity
                    onPress={() => setShowPresetPicker(true)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.presetsLink}>Presets</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.mainControlsRow}>
                  {/* Minus Button: Chunky 52×52 Touch Target */}
                  <TouchableOpacity
                    style={styles.chunkyBtn}
                    onPress={() => handleAdjustWeight(-2.5)}
                    activeOpacity={0.75}
                  >
                    <Minus size={22} color="#ffffff" strokeWidth={2.5} />
                  </TouchableOpacity>

                  {/* Digital Readout - Tap to Open Presets */}
                  <TouchableOpacity
                    style={styles.digitalDisplayBox}
                    onPress={() => setShowPresetPicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.digitalReadout}>{activeSet.weight.toFixed(1)}</Text>
                    <Text style={styles.digitalUnit}>kg</Text>
                  </TouchableOpacity>

                  {/* Plus Button: Chunky 52×52 Touch Target */}
                  <TouchableOpacity
                    style={[styles.chunkyBtn, styles.chunkyBtnAdd]}
                    onPress={() => handleAdjustWeight(2.5)}
                    activeOpacity={0.75}
                  >
                    <Plus size={22} color="#09090b" strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                {/* Micro-Adjustment Chips */}
                <View style={styles.microChipsRow}>
                  <TouchableOpacity
                    style={styles.microChip}
                    onPress={() => handleAdjustWeight(-1.25)}
                  >
                    <Text style={styles.microChipText}>-1.25</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.microChip}
                    onPress={() => handleAdjustWeight(1.25)}
                  >
                    <Text style={[styles.microChipText, { color: '#ccff00' }]}>+1.25</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.microChip}
                    onPress={() => handleAdjustWeight(5.0)}
                  >
                    <Text style={[styles.microChipText, { color: '#ccff00' }]}>+5.0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.microChip, { backgroundColor: '#27272a' }]}
                    onPress={() => handleApplyWeightDirectly(20)}
                  >
                    <Text style={[styles.microChipText, { color: '#d4d4d8' }]}>Bar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. REPS STEPPER */}
              <View style={styles.stepperCard}>
                <View style={styles.stepperTopLine}>
                  <Text style={styles.stepperCardLabel}>REPS</Text>
                  <Text style={styles.targetRepsTag}>Target: {activeSet.targetReps}</Text>
                </View>

                <View style={styles.mainControlsRow}>
                  {/* Minus Button: Chunky 52×52 Touch Target */}
                  <TouchableOpacity
                    style={styles.chunkyBtn}
                    onPress={() => handleAdjustReps(-1)}
                    activeOpacity={0.75}
                  >
                    <Minus size={22} color="#ffffff" strokeWidth={2.5} />
                  </TouchableOpacity>

                  {/* Digital Readout */}
                  <View style={styles.digitalDisplayBox}>
                    <Text style={styles.digitalReadout}>{activeSet.reps}</Text>
                    <Text style={styles.digitalUnit}>reps</Text>
                  </View>

                  {/* Plus Button: Chunky 52×52 Touch Target */}
                  <TouchableOpacity
                    style={[styles.chunkyBtn, styles.chunkyBtnAdd]}
                    onPress={() => handleAdjustReps(1)}
                    activeOpacity={0.75}
                  >
                    <Plus size={22} color="#09090b" strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                {/* Micro-Adjustment Chips */}
                <View style={styles.microChipsRow}>
                  <TouchableOpacity
                    style={styles.microChip}
                    onPress={() => handleAdjustReps(-2)}
                  >
                    <Text style={styles.microChipText}>-2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.microChip}
                    onPress={() => handleAdjustReps(2)}
                  >
                    <Text style={[styles.microChipText, { color: '#ccff00' }]}>+2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.microChip, { flex: 1.5 }]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      handleAdjustReps(activeSet.targetReps - activeSet.reps);
                    }}
                  >
                    <Text style={[styles.microChipText, { color: '#38bdf8' }]}>Match Target</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* RIR EFFORT SELECTION (SPACIOUS 4-CARD GRID) */}
            <Text style={styles.rirHeading}>EFFORT (REPS IN RESERVE)</Text>
            <View style={styles.rirGrid}>
              {[
                { val: 0, label: '0 RIR', desc: 'Muscular Failure' },
                { val: 1, label: '1 RIR', desc: '1 rep left in tank' },
                { val: 2, label: '2 RIR', desc: 'Target Overload' },
                { val: 3, label: '3+ RIR', desc: 'Warmup / Submax' },
              ].map((r) => {
                const active = activeSet.rir === r.val;
                return (
                  <TouchableOpacity
                    key={r.val}
                    style={[styles.rirCard, active && styles.rirCardActive]}
                    onPress={() => handleSelectRIR(r.val)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.rirValText, active && styles.rirValTextActive]}>
                        {r.label}
                      </Text>
                      {active && <Check size={14} color={theme.accent} strokeWidth={3} />}
                    </View>
                    <Text style={[styles.rirDescText, active && styles.rirDescTextActive]}>
                      {r.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SUB-2-TAP COMPLETION BUTTON */}
            <TouchableOpacity
              style={[styles.completeBtn, activeSet.completed && styles.completeBtnDone]}
              onPress={handleCompleteActiveSet}
              activeOpacity={0.85}
            >
              <Check size={22} color="#09090b" strokeWidth={3} />
              <Text style={styles.completeBtnText}>
                {activeSet.completed
                  ? `Set ${activeSet.setNumber} Logged (Tap to Unlog)`
                  : `Complete Set ${activeSet.setNumber} & Rest (${currentExercise.defaultRestSec}s)`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4. FLOOR TOOLS BAR */}
          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setShowPlateModal(true);
              }}
            >
              <Calculator size={18} color={theme.accent} />
              <Text style={styles.toolBtnText}>Plates</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setShowCues(!showCues);
              }}
            >
              <HelpCircle size={18} color="#38bdf8" />
              <Text style={styles.toolBtnText}>Form Cues</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/modal/swap-exercise' as Href);
              }}
            >
              <ArrowLeftRight size={18} color="#a1a1aa" />
              <Text style={styles.toolBtnText}>Swap Machine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/modal/ai-coach' as Href);
              }}
            >
              <Sparkles size={18} color="#f472b6" />
              <Text style={styles.toolBtnText}>Ask Coach</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CRITICAL GAP FIX 3: INTEGRATED OLYMPIC BARBELL PLATE CALCULATOR MODAL */}
      <Modal
        visible={showPlateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.plateModalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Plate Calculator</Text>
                <Text style={styles.modalSubtitle}>Calibrated Olympic Barbell Breakdown</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowPlateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Total Barbell Weight Readout & Bar Toggle */}
              <View style={styles.plateReadoutCard}>
                <View>
                  <Text style={styles.plateReadoutLabel}>TOTAL BARBELL LOAD</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={styles.plateReadoutNumber}>{plateTargetWeight.toFixed(1)}</Text>
                    <Text style={styles.plateReadoutUnit}>kg</Text>
                  </View>
                  <Text style={styles.plateReadoutSide}>
                    Each side: {loadPerSide.toFixed(2)} kg
                  </Text>
                </View>

                {/* 20kg / 15kg Bar Selection */}
                <View style={styles.barToggleGroup}>
                  <TouchableOpacity
                    style={[styles.barToggleBtn, plateBarWeight === 20 && styles.barToggleBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setPlateBarWeight(20);
                      if (plateTargetWeight < 20) setPlateTargetWeight(20);
                    }}
                  >
                    <Text style={[styles.barToggleText, plateBarWeight === 20 && styles.barToggleTextActive]}>
                      20kg Bar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.barToggleBtn, plateBarWeight === 15 && styles.barToggleBtnActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setPlateBarWeight(15);
                      if (plateTargetWeight < 15) setPlateTargetWeight(15);
                    }}
                  >
                    <Text style={[styles.barToggleText, plateBarWeight === 15 && styles.barToggleTextActive]}>
                      15kg Bar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* GRAPHICAL BARBELL SLEEVE VISUALIZER */}
              <View style={styles.sleeveCard}>
                <Text style={styles.sleeveLabel}>EACH SLEEVE REQUIRES:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sleeveGraphicScroll}
                >
                  {/* Collar Bushing */}
                  <View style={styles.collarBushing}>
                    <View style={styles.collarRing} />
                    <Text style={styles.collarText}>COLLAR</Text>
                  </View>

                  {/* Plates rendered along the sleeve */}
                  {sleevePlates.length === 0 ? (
                    <View style={styles.emptySleeveBox}>
                      <Text style={styles.emptySleeveText}>Empty Bar ({plateBarWeight}kg)</Text>
                    </View>
                  ) : (
                    sleevePlates.map((weight, pIdx) => {
                      const cfg = PLATE_VISUAL_STYLES[weight] || {
                        bg: '#3f3f46',
                        border: '#52525b',
                        textColor: '#ffffff',
                        height: 50,
                        width: 20,
                      };
                      return (
                        <View
                          key={`${weight}-${pIdx}`}
                          style={[
                            styles.plateGraphic,
                            {
                              height: cfg.height,
                              width: cfg.width,
                              backgroundColor: cfg.bg,
                              borderColor: cfg.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.plateGraphicText,
                              { color: cfg.textColor },
                              weight < 5 && { fontSize: 8 },
                            ]}
                            numberOfLines={1}
                          >
                            {weight}
                          </Text>
                        </View>
                      );
                    })
                  )}

                  {/* Barbell Sleeve Cap */}
                  <View style={styles.sleeveCap}>
                    <View style={styles.sleeveCapPin} />
                  </View>
                </ScrollView>

                {/* Breakdown Text Chips */}
                <View style={styles.breakdownRow}>
                  {platesUsed.length === 0 ? (
                    <Text style={styles.breakdownEmptyText}>No plates needed. Just standard barbell.</Text>
                  ) : (
                    platesUsed.map((p) => (
                      <View key={p.weight} style={styles.breakdownChip}>
                        <Text style={styles.breakdownChipText}>
                          {p.count}× {p.weight}kg plate
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* Quick Increment adjustments */}
              <View style={styles.quickAdjustGrid}>
                <TouchableOpacity
                  style={styles.quickAdjustBtn}
                  onPress={() => setPlateTargetWeight((w) => Math.max(plateBarWeight, Number((w - 5).toFixed(2))))}
                >
                  <Text style={styles.quickAdjustText}>-5 kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAdjustBtn}
                  onPress={() => setPlateTargetWeight((w) => Math.max(plateBarWeight, Number((w - 2.5).toFixed(2))))}
                >
                  <Text style={styles.quickAdjustText}>-2.5 kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAdjustBtn, styles.quickAdjustBtnAdd]}
                  onPress={() => setPlateTargetWeight((w) => Number((w + 2.5).toFixed(2)))}
                >
                  <Text style={[styles.quickAdjustText, { color: '#ccff00' }]}>+2.5 kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAdjustBtn, styles.quickAdjustBtnAdd]}
                  onPress={() => setPlateTargetWeight((w) => Number((w + 5).toFixed(2)))}
                >
                  <Text style={[styles.quickAdjustText, { color: '#ccff00' }]}>+5.0 kg</Text>
                </TouchableOpacity>
              </View>

              {/* Common Barbell Milestone Chips */}
              <Text style={styles.milestoneHeading}>BARBELL MILESTONES</Text>
              <View style={styles.milestoneGrid}>
                {[
                  { label: '60 kg (1 plate)', val: 60 },
                  { label: '80 kg', val: 80 },
                  { label: '100 kg (2 plates)', val: 100 },
                  { label: '140 kg (3 plates)', val: 140 },
                ].map((m) => {
                  const isCur = Math.abs(plateTargetWeight - m.val) < 0.1;
                  return (
                    <TouchableOpacity
                      key={m.val}
                      style={[styles.milestoneBtn, isCur && styles.milestoneBtnActive]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setPlateTargetWeight(m.val);
                      }}
                    >
                      <Text style={[styles.milestoneText, isCur && styles.milestoneTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* APPLY BUTTON - CRITICAL GAP FIX: APPLIES TO CURRENT SET */}
              <TouchableOpacity
                style={styles.applyPlateBtn}
                onPress={() => {
                  handleApplyWeightDirectly(plateTargetWeight);
                  setShowPlateModal(false);
                }}
                activeOpacity={0.85}
              >
                <Check size={18} color="#09090b" strokeWidth={3} />
                <Text style={styles.applyPlateBtnText}>
                  Apply {plateTargetWeight.toFixed(1)}kg to Current Set
                </Text>
              </TouchableOpacity>

              {/* Open Full Screen Modal Route option */}
              <TouchableOpacity
                style={styles.openFullScreenPlateBtn}
                onPress={() => {
                  setShowPlateModal(false);
                  router.push(
                    `/modal/plates?weight=${encodeURIComponent(plateTargetWeight)}&exerciseIndex=${encodeURIComponent(currentExIndex)}&setIndex=${encodeURIComponent(safeSetIdx)}` as Href
                  );
                }}
              >
                <Text style={styles.openFullScreenPlateText}>Open Full Screen Plate Modal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* QUICK WEIGHT PRESET PICKER MODAL */}
      <Modal
        visible={showPresetPicker}
        presentationStyle="pageSheet"
        animationType='slide'
        onRequestClose={() => setShowPresetPicker(false)}
        allowSwipeDismissal
      >
        <View style={styles.presetModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Weight Preset</Text>
            <TouchableOpacity onPress={() => setShowPresetPicker(false)}>
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 12 }}>
            Tap to immediately jump to standard barbell / dumbbell weight:
          </Text>

          <View style={styles.presetGrid}>
            {COMMON_WEIGHT_PRESETS.map((p) => {
              const isCurrent = Math.abs(activeSet.weight - p) < 0.1;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetBtn, isCurrent && styles.presetBtnActive]}
                  onPress={() => {
                    handleApplyWeightDirectly(p);
                    setShowPresetPicker(false);
                  }}
                >
                  <Text style={[styles.presetBtnText, isCurrent && styles.presetBtnTextActive]}>
                    {p} kg
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return createThemeStyles(theme, {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    subtext: {
      fontSize: 10,
      color: theme.accent,
      fontWeight: '900',
      letterSpacing: 1,
    },
    workoutTitle: {
      fontSize: 20,
      color: theme.text,
      fontWeight: '900',
      marginTop: 2,
    },
    finishBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.accent,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
    },
    finishBtnText: {
      color: theme.background,
      fontSize: 12,
      fontWeight: '900',
    },

    // ── Exercise Navigation ─────────────────────────
    exerciseNavContainer: {
      paddingVertical: 8,
      marginBottom: 12,
    },
    navChip: {
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
    },
    navChipActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '18',
    },
    navChipDone: {
      borderColor: theme.success + '40',
      backgroundColor: theme.success + '10',
    },
    chipIdxText: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '900',
      fontFamily: 'monospace',
    },
    chipIdxTextActive: {
      color: theme.accent,
    },
    navChipText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    navChipTextActive: {
      color: theme.accent,
      fontWeight: '800',
    },
    chipCounter: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '600',
    },

    scrollContent: {
      paddingBottom: 16,
    },

    // ── Rest Timer ──────────────────────────────────
    restTimerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.accent + '11',
      borderWidth: 1,
      borderColor: theme.accent,
      borderRadius: 16,
      padding: 12,
      marginTop: 12,
    },
    restTitle: {
      color: theme.accent,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    restDigits: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '900',
      fontFamily: 'monospace',
    },
    restControls: {
      flexDirection: 'row',
      gap: 6,
    },
    restActionBtn: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    restActionText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },

    // ── Exercise Card ───────────────────────────────
    exerciseCard: {
      backgroundColor: theme.bgElevated,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.borderSubtle, // ← main cards
      padding: 14,
      marginBottom: 14,
    },
    exerciseHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    exerciseBadge: {
      backgroundColor: theme.backgroundElement,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    exerciseBadgeText: {
      color: theme.accent,
      fontSize: 10,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    muscleText: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    exerciseTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: -0.3,
      marginTop: 2,
    },
    cuesTriggerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    cuesTriggerBtnActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '15',
    },
    cuesTriggerText: {
      color: '#38bdf8', // keep sky blue for cues
      fontSize: 11,
      fontWeight: '700',
    },

    // ── Comparison Grid ─────────────────────────────
    comparisonGrid: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    comparisonCard: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      padding: 10,
    },
    targetCard: {
      borderColor: theme.accent + '40',
      backgroundColor: theme.accent + '08',
    },
    comparisonLabel: {
      color: theme.textMuted,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 3,
    },
    comparisonValue: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '800',
      fontFamily: 'monospace',
    },

    // ── Cues Drawer ─────────────────────────────────
    cuesDrawer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    cueRow: {
      paddingBottom: 8,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + '40',
    },
    cueLabel: {
      color: theme.textMuted,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    cueBody: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    openCuesModalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingTop: 6,
    },
    openCuesModalText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },

    // ── Set Table ───────────────────────────────────
    setTableCard: {
      backgroundColor: theme.bgElevated,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.borderSubtle, // ← main cards
      padding: 14,
      marginBottom: 14,
    },
    tableHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    tableTitle: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },
    completedPill: {
      backgroundColor: theme.backgroundElement,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 6,
    },
    completedPillText: {
      color: theme.accent,
      fontSize: 10,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    tableSubtitle: {
      color: theme.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    addSetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.accent,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    addSetBtnText: {
      color: theme.background,
      fontSize: 11,
      fontWeight: '900',
    },
    columnLabelsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginBottom: 6,
    },
    colHeader: {
      fontSize: 9,
      color: theme.textMuted,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    setRowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: theme.background,
    },
    setRowItemFocused: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '0c',
    },
    setRowItemCompleted: {
      opacity: 0.85,
      backgroundColor: theme.background + '80',
    },
    setNumberBadge: {
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setNumberBadgeFocused: {
      backgroundColor: theme.accent,
    },
    setNumberBadgeCompleted: {
      backgroundColor: theme.success + '20',
      borderWidth: 1,
      borderColor: theme.success + '50',
    },
    setNumberText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    setNumberTextFocused: {
      color: theme.background,
      fontWeight: '900',
    },
    setNumberTextCompleted: {
      color: theme.success,
    },
    previousText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      fontFamily: 'monospace',
    },
    targetRirText: {
      color: theme.textMuted,
      fontSize: 10,
      marginTop: 1,
    },
    weightCellText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    unitSmall: {
      color: theme.textMuted,
      fontSize: 9,
      fontWeight: '600',
    },
    repsCellText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    logSetBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logSetBtnDone: {
      backgroundColor: theme.success,
      borderColor: theme.success,
    },
    logSetBtnJustDone: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    removeSetRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 8,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: theme.border + '40',
    },
    removeSetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    removeSetText: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },

    // ── Stepper Section ─────────────────────────────
    stepperSection: {
      backgroundColor: theme.bgElevated,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.borderSubtle, // ← main cards
      padding: 16,
      marginBottom: 14,
    },
    stepperHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    stepperSectionTitle: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1,
    },
    stepperSectionSub: {
      color: theme.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    plateTriggerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.accent + '40',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    plateTriggerText: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '800',
    },
    steppersGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    stepperCard: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      padding: 12,
    },
    stepperTopLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    stepperCardLabel: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    presetsLink: {
      color: '#38bdf8',
      fontSize: 10,
      fontWeight: '700',
    },
    targetRepsTag: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '700',
    },
    mainControlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    chunkyBtn: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chunkyBtnAdd: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    digitalDisplayBox: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 64,
    },
    digitalReadout: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '900',
      fontFamily: 'monospace',
      letterSpacing: -0.5,
    },
    digitalUnit: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    microChipsRow: {
      flexDirection: 'row',
      gap: 4,
    },
    microChip: {
      flex: 1,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingVertical: 5,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    microChipText: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: '800',
      fontFamily: 'monospace',
    },

    // ── RIR ─────────────────────────────────────────
    rirHeading: {
      fontSize: 10,
      color: theme.textMuted,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 8,
    },
    rirGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    rirCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      borderRadius: 12,
      padding: 10,
    },
    rirCardActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '12',
    },
    rirValText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '800',
    },
    rirValTextActive: {
      color: theme.accent,
      fontWeight: '900',
    },
    rirDescText: {
      color: theme.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    rirDescTextActive: {
      color: theme.text,
    },

    // ── Complete + Tools ────────────────────────────
    completeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 15,
    },
    completeBtnDone: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
    },
    completeBtnText: {
      color: theme.background,
      fontSize: 13,
      fontWeight: '900',
    },
    toolsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    toolBtn: {
      flex: 1,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    toolBtnText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },

    // ── Modals ──────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: '#000000a0',
      justifyContent: 'flex-end',
    },
    plateModalContainer: {
      backgroundColor: theme.bgElevated,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderColor: theme.border,
      padding: 18,
      maxHeight: '90%',
    },
    presetModalContainer: {
      margin: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 12,
      marginBottom: 14,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '900',
    },
    modalSubtitle: {
      color: theme.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    modalCloseBtn: {
      padding: 4,
    },

    // Plate Calculator
    plateReadoutCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      padding: 14,
      marginBottom: 12,
    },
    plateReadoutLabel: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    plateReadoutNumber: {
      color: theme.text,
      fontSize: 32,
      fontWeight: '900',
      fontFamily: 'monospace',
    },
    plateReadoutUnit: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '800',
    },
    plateReadoutSide: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    barToggleGroup: {
      gap: 6,
    },
    barToggleBtn: {
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    barToggleBtnActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '18',
    },
    barToggleText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    barToggleTextActive: {
      color: theme.accent,
      fontWeight: '800',
    },
    sleeveCard: {
      backgroundColor: theme.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      padding: 14,
      marginBottom: 12,
    },
    sleeveLabel: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    sleeveGraphicScroll: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      minHeight: 120,
    },
    collarBushing: {
      width: 28,
      height: 70,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    },
    collarRing: {
      width: 6,
      height: 50,
      backgroundColor: '#52525b',
      borderRadius: 2,
    },
    collarText: {
      position: 'absolute',
      fontSize: 7,
      color: theme.textMuted,
      fontWeight: '800',
      transform: [{ rotate: '-90deg' }],
    },
    plateGraphic: {
      borderRadius: 4,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 3,
    },
    plateGraphicText: {
      fontSize: 10,
      fontWeight: '900',
      fontFamily: 'monospace',
    },
    sleeveCap: {
      width: 32,
      height: 28,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
      justifyContent: 'center',
      paddingLeft: 6,
    },
    sleeveCapPin: {
      width: 4,
      height: 16,
      backgroundColor: theme.textMuted,
      borderRadius: 2,
    },
    emptySleeveBox: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    emptySleeveText: {
      color: theme.textMuted,
      fontSize: 12,
      fontStyle: 'italic',
    },
    breakdownRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 10,
    },
    breakdownChip: {
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    breakdownChipText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    breakdownEmptyText: {
      color: theme.textMuted,
      fontSize: 11,
      fontStyle: 'italic',
    },
    quickAdjustGrid: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 12,
    },
    quickAdjustBtn: {
      flex: 1,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    quickAdjustBtnAdd: {
      borderColor: theme.accent + '40',
    },
    quickAdjustText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    milestoneHeading: {
      color: theme.textMuted,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    milestoneGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 16,
    },
    milestoneBtn: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    milestoneBtnActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '15',
    },
    milestoneText: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    milestoneTextActive: {
      color: theme.accent,
      fontWeight: '800',
    },
    applyPlateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.accent,
      paddingVertical: 14,
      borderRadius: 12,
      marginBottom: 8,
    },
    applyPlateBtnText: {
      color: theme.background,
      fontSize: 13,
      fontWeight: '900',
    },
    openFullScreenPlateBtn: {
      alignItems: 'center',
      paddingVertical: 6,
    },
    openFullScreenPlateText: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },

    // Presets
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    presetBtn: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    presetBtnActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '18',
    },
    presetBtnText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
      fontFamily: 'monospace',
    },
    presetBtnTextActive: {
      color: theme.accent,
      fontWeight: '900',
    },
  });
}