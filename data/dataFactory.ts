import { 
  LifterPersona, 
  WorkoutExercise, 
  NightDebriefData, 
  HistoricalWorkout,
  Exercise 
} from '../types';
import { EXERCISE_LIBRARY } from './mockData';
import { PULL_EXERCISES, LEGS_EXERCISES } from './routinesData';

// 1. Calculation Functions for Real-Time Strength Science
export const calculate1RM = (weightKg: number, reps: number): number => {
  if (reps <= 1) return weightKg;
  // Brzycki formula: weight * (36 / (37 - reps))
  if (reps < 37) {
    const brzycki = weightKg * (36 / (37 - reps));
    return Math.round(brzycki * 10) / 10;
  }
  // Fallback to Epley
  const epley = weightKg * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
};

// Calculate real total tonnage and metrics from sets
export const calculateSessionStats = (workout: WorkoutExercise[]) => {
  let totalVolumeKg = 0;
  let setsCompleted = 0;
  let totalPrescribedSets = 0;
  let totalRir = 0;
  let rirCount = 0;

  workout.forEach(item => {
    item.sets.forEach(set => {
      totalPrescribedSets++;
      if (set.completed) {
        setsCompleted++;
        totalVolumeKg += set.weightKg * set.reps;
        if (typeof set.rir === 'number') {
          totalRir += set.rir;
          rirCount++;
        }
      }
    });
  });

  const avgRir = rirCount > 0 ? Math.round((totalRir / rirCount) * 10) / 10 : 2.0;
  const completionRate = totalPrescribedSets > 0 ? setsCompleted / totalPrescribedSets : 0;

  return {
    totalVolumeKg: Math.round(totalVolumeKg),
    setsCompleted,
    totalPrescribedSets,
    avgRir,
    completionRate,
  };
};

// Calculate Full Debrief from Workout
export const generateDebriefFromSession = (
  workoutName: string,
  workout: WorkoutExercise[],
  durationMinutes: number,
  knownPRs: Record<string, { weightKg: number; reps: number; e1RM: number; date: string }>,
  tomorrowPreviewOverride?: { title: string; type: 'rest' | 'workout'; description: string }
): { debrief: NightDebriefData; newPRs: Record<string, { weightKg: number; reps: number; e1RM: number; date: string }> } => {
  const stats = calculateSessionStats(workout);
  const detectedPRs: NightDebriefData['prs'] = [];
  const updatedPRs = { ...knownPRs };

  workout.forEach(item => {
    const exerciseName = item.exercise.name;
    const previous = knownPRs[exerciseName] || { weightKg: 0, reps: 0, e1RM: 0, date: '' };

    let bestSet = { weightKg: 0, reps: 0, e1RM: 0 };
    item.sets.forEach(set => {
      if (set.completed) {
        const e1RM = calculate1RM(set.weightKg, set.reps);
        if (e1RM > bestSet.e1RM) {
          bestSet = { weightKg: set.weightKg, reps: set.reps, e1RM };
        }
      }
    });

    if (bestSet.e1RM > previous.e1RM && bestSet.e1RM > 0) {
      detectedPRs.push({
        exerciseName,
        metric: previous.e1RM > 0 ? 'Estimated 1RM PR' : 'First Baseline Calibration PR',
        value: `${bestSet.weightKg}kg × ${bestSet.reps} reps`,
        previousBest: previous.e1RM > 0 ? `${previous.e1RM}kg e1RM` : 'None (Baseline)',
        estimated1RM: bestSet.e1RM,
      });

      updatedPRs[exerciseName] = {
        weightKg: bestSet.weightKg,
        reps: bestSet.reps,
        e1RM: bestSet.e1RM,
        date: new Date().toISOString().split('T')[0],
      };
    }
  });

  // Calculate session grade
  let sessionGrade = 'A';
  let gradeReason = 'Hit 100% of prescribed compound volume at target RIR without motor failure.';

  if (stats.completionRate < 0.5) {
    sessionGrade = 'B-';
    gradeReason = 'Ended session early with under 50% volume logged. Good choice if acute fatigue or time-constraint required cutting accessory work.';
  } else if (stats.completionRate < 0.8) {
    sessionGrade = 'B+';
    gradeReason = 'Completed primary heavy compounds; cut late accessory isolation sets to manage systemic recovery.';
  } else if (stats.avgRir < 1.0) {
    sessionGrade = 'A-';
    gradeReason = 'High mechanical fatigue detected (average RIR < 1.0). You pushed near failure; prioritize 8+ hours sleep tonight.';
  } else if (detectedPRs.length > 0) {
    sessionGrade = 'A+';
    gradeReason = `Exceptional overload! Hit ${detectedPRs.length} new Personal Record${detectedPRs.length > 1 ? 's' : ''} while respecting target RIR ${stats.avgRir}.`;
  }

  const debrief: NightDebriefData = {
    workoutName,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
    durationMinutes: durationMinutes || 52,
    totalVolumeKg: stats.totalVolumeKg,
    setsCompleted: stats.setsCompleted,
    sessionGrade,
    gradeReason,
    prs: detectedPRs,
    tomorrowPreview: tomorrowPreviewOverride || {
      title: 'Active Recovery & Mobility Flow',
      type: 'rest',
      description: 'Scheduled intelligent rest. 8,000 steps target + 10-minute thoracic spine & hip flow. Your streak is protected.',
    },
  };

  return { debrief, newPRs: updatedPRs };
};

// 2. Sarah's Beginner Exercises
const SARAH_EXERCISES: WorkoutExercise[] = [
  {
    exercise: {
      id: 'goblet-squat',
      name: 'Dumbbell Goblet Squat',
      targetMuscle: 'Quadriceps & Glutes',
      secondaryMuscles: ['Core', 'Adductors'],
      equipment: 'Dumbbell',
      difficulty: 'beginner',
      defaultRestSecs: 90,
      cue: {
        setup: 'Cup dumbbell head under chin with both palms, feet shoulder-width, toes turned out 15°.',
        execution: 'Sit hips down between knees until elbows touch inside thighs, stand up driving heels into floor.',
        commonMistake: 'Letting weight pull chest down forward into a spinal bend.',
        femaleConsideration: 'Excellent primer for deep squat depth without spinal loading of a barbell.',
      },
      alternatives: [
        { id: 'leg-press', name: 'Machine 45° Leg Press', reason: 'Zero balance requirement.' },
      ],
    },
    lastPerformance: 'First session calibration',
    targetPerformance: '16.0kg x 10, 10, 10 @ RIR 3',
    notes: 'Week 1 Focus: Learn depth and knee tracking. Do not rush the descent.',
    sets: [
      { id: 'sarah-set-1', setNumber: 1, type: 'working', weightKg: 16.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-2', setNumber: 2, type: 'working', weightKg: 16.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-3', setNumber: 3, type: 'working', weightKg: 16.0, reps: 10, targetReps: 10, rir: 3, rpe: 7.5, completed: false },
    ],
  },
  {
    exercise: {
      id: 'machine-chest-press',
      name: 'Seated Chest Press Machine',
      targetMuscle: 'Chest (Pectoralis Major)',
      secondaryMuscles: ['Triceps', 'Front Delts'],
      equipment: 'Pin-Selected Machine',
      difficulty: 'beginner',
      defaultRestSecs: 90,
      cue: {
        setup: 'Adjust seat so handles align with mid-chest. Back flat against backrest.',
        execution: 'Press forward until arms are almost straight (do not lock elbows violently), return smoothly in 2s.',
        commonMistake: 'Shoulders hunching forward at lockout.',
      },
      alternatives: [
        { id: 'pushups', name: 'Incline Push-Ups', reason: 'Bodyweight alternative.' },
      ],
    },
    lastPerformance: 'First session calibration',
    targetPerformance: '25.0kg x 10, 10, 10 @ RIR 3',
    notes: 'Safe machine path allows learning chest push mechanics without spotter anxiety.',
    sets: [
      { id: 'sarah-set-4', setNumber: 1, type: 'working', weightKg: 25.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-5', setNumber: 2, type: 'working', weightKg: 25.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-6', setNumber: 3, type: 'working', weightKg: 25.0, reps: 10, targetReps: 10, rir: 3, rpe: 7.5, completed: false },
    ],
  },
  {
    exercise: PULL_EXERCISES[1], // Lat Pulldown
    lastPerformance: 'First session calibration',
    targetPerformance: '30.0kg x 10, 10, 10 @ RIR 3',
    notes: 'Pull to collarbone, feel back muscles engaging.',
    sets: [
      { id: 'sarah-set-7', setNumber: 1, type: 'working', weightKg: 30.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-8', setNumber: 2, type: 'working', weightKg: 30.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-9', setNumber: 3, type: 'working', weightKg: 30.0, reps: 10, targetReps: 10, rir: 3, rpe: 7.5, completed: false },
    ],
  },
  {
    exercise: {
      id: 'db-rdl-beginner',
      name: 'Dumbbell Romanian Deadlift (RDL)',
      targetMuscle: 'Hamstrings & Glutes',
      secondaryMuscles: ['Lower Back', 'Forearms'],
      equipment: 'Dumbbells',
      difficulty: 'beginner',
      defaultRestSecs: 90,
      cue: {
        setup: 'Hold dumbbells against front thighs. Soft bend in knees.',
        execution: 'Push butt back toward wall behind you until weights pass knees, then squeeze glutes to stand tall.',
        commonMistake: 'Squatting with knees rather than hinging back at hips.',
        femaleConsideration: 'Posterior chain builder with zero axial spine compression.',
      },
      alternatives: [
        { id: 'seated-leg-curl', name: 'Seated Leg Curl Machine', reason: 'Direct hamstring isolation.' },
      ],
    },
    lastPerformance: 'First session calibration',
    targetPerformance: '14.0kg x 10, 10, 10 @ RIR 3',
    notes: 'Feel stretch in hamstrings at bottom.',
    sets: [
      { id: 'sarah-set-10', setNumber: 1, type: 'working', weightKg: 14.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-11', setNumber: 2, type: 'working', weightKg: 14.0, reps: 10, targetReps: 10, rir: 3, rpe: 7, completed: false },
      { id: 'sarah-set-12', setNumber: 3, type: 'working', weightKg: 14.0, reps: 10, targetReps: 10, rir: 3, rpe: 7.5, completed: false },
    ],
  },
];

// 3. Marcus's Heavy Strength Peaking Exercises
const MARCUS_EXERCISES: WorkoutExercise[] = [
  {
    exercise: EXERCISE_LIBRARY[0], // Barbell Bench Press
    lastPerformance: '117.5kg x 3, 3, 3 @ RPE 8',
    targetPerformance: '120.0kg x 3, 3, 3 @ RPE 8.5 (Peaking Wave)',
    notes: 'Competition pause on chest. Full arch and leg drive locked.',
    sets: [
      { id: 'marcus-set-1', setNumber: 1, type: 'working', weightKg: 120.0, reps: 3, targetReps: 3, rir: 1, rpe: 8.5, completed: false },
      { id: 'marcus-set-2', setNumber: 2, type: 'working', weightKg: 120.0, reps: 3, targetReps: 3, rir: 1, rpe: 8.5, completed: false },
      { id: 'marcus-set-3', setNumber: 3, type: 'working', weightKg: 120.0, reps: 3, targetReps: 3, rir: 1, rpe: 9.0, completed: false },
    ],
  },
  {
    exercise: PULL_EXERCISES[0], // Barbell Bent-Over Row
    lastPerformance: '97.5kg x 5, 5, 5 @ RPE 8',
    targetPerformance: '100.0kg x 5, 5, 5 @ RPE 8.5',
    notes: 'Pendlay style off dead stop. Explosive lat drive.',
    sets: [
      { id: 'marcus-set-4', setNumber: 1, type: 'working', weightKg: 100.0, reps: 5, targetReps: 5, rir: 1, rpe: 8.5, completed: false },
      { id: 'marcus-set-5', setNumber: 2, type: 'working', weightKg: 100.0, reps: 5, targetReps: 5, rir: 1, rpe: 8.5, completed: false },
      { id: 'marcus-set-6', setNumber: 3, type: 'working', weightKg: 100.0, reps: 5, targetReps: 5, rir: 1, rpe: 9.0, completed: false },
    ],
  },
  {
    exercise: {
      id: 'weighted-dips',
      name: 'Weighted Parallel Bar Dips',
      targetMuscle: 'Triceps & Lower Chest',
      secondaryMuscles: ['Front Delts'],
      equipment: 'Dip Belt & Parallel Bars',
      difficulty: 'advanced',
      defaultRestSecs: 180,
      cue: {
        setup: 'Attach plate belt securely. Grip bars with knuckles over top, lean torso forward 20°.',
        execution: 'Lower until upper arms are parallel to floor, push through palms to full lockout.',
        commonMistake: 'Dropping into extreme shoulder hyperextension.',
      },
      alternatives: [
        { id: 'close-grip-bench', name: 'Close-Grip Barbell Bench', reason: 'High tricep overload with barbell safety.' },
      ],
    },
    lastPerformance: '+22.5kg x 6, 6, 6 @ RPE 8',
    targetPerformance: '+25.0kg x 6, 6, 6 @ RPE 8.5',
    notes: 'Heavy compound accessory to overload lockout triceps.',
    sets: [
      { id: 'marcus-set-7', setNumber: 1, type: 'working', weightKg: 25.0, reps: 6, targetReps: 6, rir: 1, rpe: 8.5, completed: false },
      { id: 'marcus-set-8', setNumber: 2, type: 'working', weightKg: 25.0, reps: 6, targetReps: 6, rir: 1, rpe: 8.5, completed: false },
      { id: 'marcus-set-9', setNumber: 3, type: 'working', weightKg: 25.0, reps: 6, targetReps: 6, rir: 1, rpe: 9.0, completed: false },
    ],
  },
];

// 4. Elena's Cycle-Aware Lower Body
const ELENA_EXERCISES: WorkoutExercise[] = [
  {
    exercise: LEGS_EXERCISES[0], // Barbell Back Squat
    lastPerformance: '72.5kg x 8, 8, 8 @ RIR 2',
    targetPerformance: '75.0kg x 8, 8, 8 @ RIR 2',
    notes: 'Late Luteal Phase: Core bracing is crucial due to slight ligament laxity. Keep reps crisp.',
    sets: [
      { id: 'elena-set-1', setNumber: 1, type: 'working', weightKg: 75.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
      { id: 'elena-set-2', setNumber: 2, type: 'working', weightKg: 75.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
      { id: 'elena-set-3', setNumber: 3, type: 'working', weightKg: 75.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
    ],
  },
  {
    exercise: {
      id: 'barbell-hip-thrust',
      name: 'Barbell Hip Thrust',
      targetMuscle: 'Gluteus Maximus',
      secondaryMuscles: ['Hamstrings', 'Adductors'],
      equipment: 'Barbell, Bench & Pad',
      difficulty: 'intermediate',
      defaultRestSecs: 150,
      cue: {
        setup: 'Upper back against bench edge, bar padded directly over hip crease. Shins vertical at top.',
        execution: 'Drive hips up to full extension, chin tucked forward looking at knees, squeeze glutes hard for 1s.',
        commonMistake: 'Hyperextending lumbar spine instead of pivoting at hips.',
        femaleConsideration: 'Highest glute peak contraction tension with zero axial spinal compression.',
      },
      alternatives: [
        { id: 'kas-glute-bridge', name: 'KAS Glute Bridge', reason: 'Shorter range of motion for isolated glute fatigue.' },
      ],
    },
    lastPerformance: '105.0kg x 10, 10, 10 @ RIR 2',
    targetPerformance: '110.0kg x 10, 10, 10 @ RIR 2',
    notes: 'Pause at lockout. Glutes must do the work, not the lower back.',
    sets: [
      { id: 'elena-set-4', setNumber: 1, type: 'working', weightKg: 110.0, reps: 10, targetReps: 10, rir: 2, rpe: 8, completed: false },
      { id: 'elena-set-5', setNumber: 2, type: 'working', weightKg: 110.0, reps: 10, targetReps: 10, rir: 2, rpe: 8, completed: false },
      { id: 'elena-set-6', setNumber: 3, type: 'working', weightKg: 110.0, reps: 10, targetReps: 10, rir: 2, rpe: 8.5, completed: false },
    ],
  },
  {
    exercise: LEGS_EXERCISES[1], // Barbell Romanian Deadlift
    lastPerformance: '77.5kg x 8, 8, 8 @ RIR 2',
    targetPerformance: '80.0kg x 8, 8, 8 @ RIR 2',
    notes: 'Deep hamstring stretch at bottom. Keep bar tracing against shins.',
    sets: [
      { id: 'elena-set-7', setNumber: 1, type: 'working', weightKg: 80.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
      { id: 'elena-set-8', setNumber: 2, type: 'working', weightKg: 80.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
      { id: 'elena-set-9', setNumber: 3, type: 'working', weightKg: 80.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
    ],
  },
];

// 5. Alex's Default Push A
const ALEX_EXERCISES: WorkoutExercise[] = [
  {
    exercise: EXERCISE_LIBRARY[0], // Barbell Bench Press
    lastPerformance: '80.0kg x 6, 6, 5 @ RPE 8',
    targetPerformance: '82.5kg x 6, 6, 6 @ RIR 2 (Overload Check)',
    notes: 'Keep shoulder blades depressed into the pad. Pause first rep for 0.5s.',
    sets: [
      { id: 'set-1', setNumber: 1, type: 'working', weightKg: 82.5, reps: 6, targetReps: 6, rir: 2, rpe: 8, completed: false },
      { id: 'set-2', setNumber: 2, type: 'working', weightKg: 82.5, reps: 6, targetReps: 6, rir: 2, rpe: 8, completed: false },
      { id: 'set-3', setNumber: 3, type: 'working', weightKg: 82.5, reps: 6, targetReps: 6, rir: 2, rpe: 8.5, completed: false },
    ],
  },
  {
    exercise: EXERCISE_LIBRARY[1], // Incline Dumbbell Press
    lastPerformance: '28.0kg x 10, 9, 8 @ RIR 1',
    targetPerformance: '30.0kg x 8, 8, 8 @ RIR 2',
    notes: 'Bench at 30 degrees. Control the bottom stretch.',
    sets: [
      { id: 'set-4', setNumber: 1, type: 'working', weightKg: 30.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
      { id: 'set-5', setNumber: 2, type: 'working', weightKg: 30.0, reps: 8, targetReps: 8, rir: 2, rpe: 8, completed: false },
      { id: 'set-6', setNumber: 3, type: 'working', weightKg: 30.0, reps: 8, targetReps: 8, rir: 1, rpe: 9, completed: false },
    ],
  },
  {
    exercise: EXERCISE_LIBRARY[2], // Standing Overhead Press
    lastPerformance: '50.0kg x 8, 7, 7 @ RPE 8',
    targetPerformance: '52.5kg x 7, 7, 6 @ RIR 2',
    notes: 'Squeeze glutes to protect lower spine.',
    sets: [
      { id: 'set-7', setNumber: 1, type: 'working', weightKg: 52.5, reps: 7, targetReps: 7, rir: 2, rpe: 8, completed: false },
      { id: 'set-8', setNumber: 2, type: 'working', weightKg: 52.5, reps: 7, targetReps: 7, rir: 2, rpe: 8, completed: false },
      { id: 'set-9', setNumber: 3, type: 'working', weightKg: 52.5, reps: 6, targetReps: 6, rir: 1, rpe: 9, completed: false },
    ],
  },
  {
    exercise: EXERCISE_LIBRARY[3], // Cable Lateral Raise
    lastPerformance: '10.0kg x 15, 14, 12 @ RIR 1',
    targetPerformance: '10.0kg x 15, 15, 15 @ RIR 0-1',
    notes: 'Lead with elbows. Slow eccentric.',
    sets: [
      { id: 'set-10', setNumber: 1, type: 'working', weightKg: 10.0, reps: 15, targetReps: 15, rir: 1, rpe: 9, completed: false },
      { id: 'set-11', setNumber: 2, type: 'working', weightKg: 10.0, reps: 15, targetReps: 15, rir: 1, rpe: 9, completed: false },
      { id: 'set-12', setNumber: 3, type: 'drop', weightKg: 7.5, reps: 18, targetReps: 15, rir: 0, rpe: 10, completed: false },
    ],
  },
];

// 6. ALL 4 CORE LIFTER PERSONAS
export const LIFTER_PERSONAS: Record<string, LifterPersona> = {
  alex: {
    id: 'alex',
    name: 'Alex Mercer',
    roleTitle: 'Intermediate Lifter',
    avatarInitials: 'AM',
    experience: 'intermediate',
    goal: 'hypertrophy',
    splitName: 'Hypertrophy PPL Block (6-Day)',
    currentWeek: 3,
    totalWeeks: 6,
    streakWeeks: 14,
    bio: 'Wants progressive overload, PRs, consistency, and volume landmarks without stalling.',
    todayWorkoutKey: 'push_a',
    initialWorkout: ALEX_EXERCISES,
    initialBriefing: {
      workoutName: 'Upper Body Hypertrophy (Push A)',
      splitDay: 'Day 2 • Push Focus',
      estimatedMinutes: 62,
      cycleWeek: 3,
      cycleTotalWeeks: 6,
      recoveryNote: 'Sleep was 6h 15m (35m below baseline). HRV stable. Suggestion: keep work sets clean at RIR 2; drop top set by 2.5kg if warmup bar speed feels sluggish.',
      readinessScore: 84,
      recommendedAdjustment: 'Keep primary compound volume; drop 1 accessory set if time-compressed.',
      primaryLift: 'Barbell Bench Press',
      primaryTarget: '82.5kg for 3 sets of 6 reps @ RIR 2',
    },
    recentHistory: [
      {
        id: 'hist-1',
        workoutName: 'Pull A (Back & Biceps)',
        date: 'Yesterday',
        durationMinutes: 55,
        totalVolumeKg: 6840,
        setsCount: 14,
        sessionGrade: 'A',
        keyLift: 'Barbell Row 72.5kg × 8',
        prsDetected: 1,
      },
      {
        id: 'hist-2',
        workoutName: 'Legs A (Squat & Hinge)',
        date: '3 Days Ago',
        durationMinutes: 64,
        totalVolumeKg: 8920,
        setsCount: 16,
        sessionGrade: 'A+',
        keyLift: 'Back Squat 102.5kg × 6',
        prsDetected: 2,
      },
      {
        id: 'hist-3',
        workoutName: 'Push A (Week 2)',
        date: '6 Days Ago',
        durationMinutes: 58,
        totalVolumeKg: 6150,
        setsCount: 14,
        sessionGrade: 'A',
        keyLift: 'Barbell Bench 80.0kg × 6',
        prsDetected: 1,
      },
    ],
    knownPRs: {
      'Barbell Bench Press': { weightKg: 80.0, reps: 6, e1RM: 96.2, date: '2026-03-08' },
      'Incline Dumbbell Press': { weightKg: 28.0, reps: 10, e1RM: 37.3, date: '2026-03-08' },
      'Overhead Press (OHP)': { weightKg: 50.0, reps: 8, e1RM: 62.1, date: '2026-03-08' },
      'Barbell Bent-Over Row': { weightKg: 72.5, reps: 8, e1RM: 90.0, date: '2026-03-14' },
      'Barbell Back Squat': { weightKg: 102.5, reps: 6, e1RM: 123.3, date: '2026-03-11' },
    },
  },

  sarah: {
    id: 'sarah',
    name: 'Sarah Chen',
    roleTitle: 'Beginner (First Week in Gym)',
    avatarInitials: 'SC',
    experience: 'beginner',
    goal: 'general',
    splitName: 'Novice Full Body Foundation (3-Day)',
    currentWeek: 1,
    totalWeeks: 4,
    streakWeeks: 1,
    bio: 'Scared of looking stupid, doesnt know gym etiquette or starting weight. Needs high guidance and clear cues.',
    todayWorkoutKey: 'full_body_starter',
    initialWorkout: SARAH_EXERCISES,
    initialBriefing: {
      workoutName: 'Novice Foundation (Full Body A)',
      splitDay: 'Session 1 • Welcome to the Floor',
      estimatedMinutes: 45,
      cycleWeek: 1,
      cycleTotalWeeks: 4,
      recoveryNote: 'First week in a real gym track! Objective: master the room, learn starting weights with RIR 3, zero ego-lifting.',
      readinessScore: 95,
      recommendedAdjustment: 'Keep all sets at comfortable RIR 3. Test weights conservatively.',
      primaryLift: 'Dumbbell Goblet Squat',
      primaryTarget: '16.0kg for 3 sets of 10 reps @ RIR 3',
    },
    recentHistory: [],
    knownPRs: {},
  },

  marcus: {
    id: 'marcus',
    name: 'Marcus Vance',
    roleTitle: 'Strength Peaking Athlete',
    avatarInitials: 'MV',
    experience: 'advanced',
    goal: 'strength',
    splitName: '4-Day Heavy Barbell Peaking',
    currentWeek: 4,
    totalWeeks: 5,
    streakWeeks: 26,
    bio: 'Already has a plan, wants the fastest logger, volume landmarks, fatigue awareness, and high-load calculations.',
    todayWorkoutKey: 'strength_upper_heavy',
    initialWorkout: MARCUS_EXERCISES,
    initialBriefing: {
      workoutName: 'Heavy Upper Peaking (Day 2)',
      splitDay: 'Week 4 • Maximum Tension',
      estimatedMinutes: 70,
      cycleWeek: 4,
      cycleTotalWeeks: 5,
      recoveryNote: 'Sleep 8h 10m. Readiness high (92). Peak week before next deload: target 120kg Barbell Bench for 3 triples.',
      readinessScore: 92,
      recommendedAdjustment: 'High neurological demand: ensure 3-minute rest timers on all primary work sets.',
      primaryLift: 'Competition Barbell Bench',
      primaryTarget: '120.0kg for 3 sets of 3 reps @ RPE 8.5',
    },
    recentHistory: [
      {
        id: 'hist-m1',
        workoutName: 'Heavy Squat Peaking',
        date: '2 Days Ago',
        durationMinutes: 75,
        totalVolumeKg: 9400,
        setsCount: 12,
        sessionGrade: 'A+',
        keyLift: 'Squat 175kg × 3',
        prsDetected: 1,
      },
    ],
    knownPRs: {
      'Barbell Bench Press': { weightKg: 117.5, reps: 3, e1RM: 128.2, date: '2026-03-05' },
      'Barbell Bent-Over Row': { weightKg: 97.5, reps: 5, e1RM: 112.5, date: '2026-03-05' },
    },
  },

  elena: {
    id: 'elena',
    name: 'Elena Rostova',
    roleTitle: 'Hypertrophy • Cycle-Aware Track',
    avatarInitials: 'ER',
    experience: 'intermediate',
    goal: 'hypertrophy',
    splitName: 'Lower/Upper Glute Specialization',
    currentWeek: 3,
    totalWeeks: 6,
    streakWeeks: 18,
    bio: 'Empowered female lifter following evidence-based progressive overload with opt-in cycle awareness.',
    todayWorkoutKey: 'glute_lower_a',
    initialWorkout: ELENA_EXERCISES,
    initialBriefing: {
      workoutName: 'Lower Body & Glute Overload (Legs A)',
      splitDay: 'Day 3 • Posterior Chain',
      estimatedMinutes: 58,
      cycleWeek: 3,
      cycleTotalWeeks: 6,
      recoveryNote: 'Late luteal phase (opt-in): core temperature is slightly higher; RPE may feel 0.5 points heavier than normal. Keep work sets solid, skip grinding failure reps.',
      readinessScore: 82,
      recommendedAdjustment: 'Prioritize hip thrust pause and squat depth. Hold rest timers to 2:30.',
      primaryLift: 'Barbell Hip Thrust',
      primaryTarget: '110.0kg for 3 sets of 10 reps @ RIR 2',
    },
    recentHistory: [
      {
        id: 'hist-e1',
        workoutName: 'Upper & Core Hypertrophy',
        date: 'Yesterday',
        durationMinutes: 52,
        totalVolumeKg: 5800,
        setsCount: 14,
        sessionGrade: 'A',
        keyLift: 'Incline DB Press 22kg × 10',
        prsDetected: 1,
      },
    ],
    knownPRs: {
      'Barbell Back Squat': { weightKg: 72.5, reps: 8, e1RM: 89.4, date: '2026-03-07' },
      'Barbell Hip Thrust': { weightKg: 105.0, reps: 10, e1RM: 140.0, date: '2026-03-07' },
      'Barbell Romanian Deadlift': { weightKg: 77.5, reps: 8, e1RM: 95.5, date: '2026-03-07' },
    },
  },
};
