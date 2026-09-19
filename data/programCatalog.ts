import type { WorkoutExercise, MorningBriefingData, SetRecord, Exercise, SetType } from '../types';

export type RoutineType = 'push_a' | 'pull_a' | 'legs_a' | 'crowded_push' | 'mobility';

export interface ExercisePreview {
  name: string;
  sets: string;
  target: string;
  note: string;
  isCompound?: boolean;
}

export const ROUTINE_CONFIGS: Record<RoutineType, {
  name: string;
  displayName: string;
  badge: string;
  headline: string;
  brief: string;
  duration: string;
  primaryLift: string;
  primaryTarget: string;
  accessoryBreakdown: { muscle: string; sets: string }[];
  exercises: ExercisePreview[];
}> = {
  push_a: {
    name: 'Push A',
    displayName: 'Push A (Hypertrophy)',
    badge: 'W3 / 6 • Day 2',
    headline: 'Today is Push A',
    brief: 'Sleep was 6h 15m (35m below baseline). We capped Bench Press top set to 82.5kg at RIR 2 rather than pushing for a heavy single. High-stimulus, low systemic fatigue today.',
    duration: '62 min',
    primaryLift: 'Barbell Bench Press',
    primaryTarget: '82.5 kg × 6, 6, 6 @ RIR 2',
    accessoryBreakdown: [
      { muscle: 'Chest', sets: '6 Sets' },
      { muscle: 'Delts', sets: '6 Sets' },
      { muscle: 'Triceps', sets: '3 Sets' },
    ],
    exercises: [
      { name: 'Barbell Bench Press', sets: '4 sets × 6–8 reps', target: '82.5 kg', note: '+2.5kg overload step', isCompound: true },
      { name: 'Incline Dumbbell Press', sets: '3 sets × 8–10 reps', target: '30.0 kg/hand', note: 'Deep stretch at bottom', isCompound: true },
      { name: 'Cable Lateral Raise', sets: '4 sets × 12–15 reps', target: '7.5 kg/side', note: 'Strict scapular plane' },
      { name: 'Overhead Triceps Extension', sets: '3 sets × 10–12 reps', target: '25.0 kg', note: 'Long head stretch' },
      { name: 'Standing Calf Raise', sets: '4 sets × 12 reps', target: '70.0 kg', note: '2s bottom pause' },
    ],
  },
  pull_a: {
    name: 'Pull A',
    displayName: 'Pull A (Lat & Posterior Bias)',
    badge: 'W3 / 6 • Day 3',
    headline: 'Today is Pull A',
    brief: 'Back and posterior chain focus. Focus on initiating with elbows into hip pockets. Avoid axial lower-back fatigue by utilizing chest-supported variations.',
    duration: '58 min',
    primaryLift: 'Conventional Deadlift',
    primaryTarget: '140.0 kg × 5, 5 @ RIR 3',
    accessoryBreakdown: [
      { muscle: 'Lats', sets: '7 Sets' },
      { muscle: 'Upper Back', sets: '5 Sets' },
      { muscle: 'Biceps', sets: '4 Sets' },
    ],
    exercises: [
      { name: 'Conventional Deadlift', sets: '3 sets × 5 reps', target: '140.0 kg', note: 'Slack out, clean lockout', isCompound: true },
      { name: 'Neutral Lat Pulldown', sets: '4 sets × 8–10 reps', target: '65.0 kg', note: '1s contraction hold' },
      { name: 'Chest-Supported DB Row', sets: '3 sets × 10–12 reps', target: '26.0 kg/hand', note: 'Lead with elbows' },
      { name: 'Incline Dumbbell Curl', sets: '3 sets × 10–12 reps', target: '14.0 kg', note: 'Long head stretch' },
      { name: 'Face Pulls', sets: '3 sets × 15 reps', target: '20.0 kg', note: 'Rotator cuff health' },
    ],
  },
  legs_a: {
    name: 'Legs A',
    displayName: 'Legs A (Quad & Glute Emphasis)',
    badge: 'W3 / 6 • Day 4',
    headline: 'Today is Legs A',
    brief: 'High quad recruitment with controlled descent. Braced deep squats paired with hamstring hinge to build knee and hip resilience.',
    duration: '65 min',
    primaryLift: 'Barbell Back Squat',
    primaryTarget: '110.0 kg × 5, 5, 5 @ RIR 2',
    accessoryBreakdown: [
      { muscle: 'Quads', sets: '8 Sets' },
      { muscle: 'Glutes', sets: '6 Sets' },
      { muscle: 'Hamstrings', sets: '4 Sets' },
    ],
    exercises: [
      { name: 'Barbell Back Squat', sets: '4 sets × 5–7 reps', target: '110.0 kg', note: '3-second eccentric', isCompound: true },
      { name: 'Romanian Deadlift (RDL)', sets: '3 sets × 8–10 reps', target: '95.0 kg', note: 'Hinge back into wall', isCompound: true },
      { name: 'Bulgarian Split Squat', sets: '3 sets × 10 reps/leg', target: '20.0 kg/hand', note: 'Single-leg stability' },
      { name: 'Seated Leg Curl', sets: '3 sets × 12–15 reps', target: '50.0 kg', note: 'Peak hamstring contraction' },
    ],
  },
  crowded_push: {
    name: 'Crowded Push',
    displayName: '30-Min Crowded Gym Protocol',
    badge: 'RAPID DENSITY BLOCK',
    headline: 'Today is Crowded Push',
    brief: 'Zero machine wait times. Everything is anchored to a single adjustable bench and two pairs of dumbbells using antagonist pairing.',
    duration: '32 min',
    primaryLift: 'Dumbbell Flat Press',
    primaryTarget: '32.5 kg/hand × 8, 8, 8 @ RIR 1',
    accessoryBreakdown: [
      { muscle: 'Chest', sets: '6 Sets' },
      { muscle: 'Delts', sets: '4 Sets' },
      { muscle: 'Arms', sets: '4 Sets' },
    ],
    exercises: [
      { name: 'Flat Dumbbell Press', sets: '3 sets × 8–10 reps', target: '32.5 kg/hand', note: 'Superset with Lateral Raise', isCompound: true },
      { name: 'Standing DB Lateral Raise', sets: '3 sets × 15 reps', target: '8.0 kg/hand', note: 'Antagonist pair (0s rest)' },
      { name: 'Incline DB Crush Press', sets: '3 sets × 10–12 reps', target: '24.0 kg/hand', note: 'Upper chest & triceps' },
      { name: 'Overhead DB Triceps Ext', sets: '3 sets × 12 reps', target: '22.0 kg', note: 'Continuous tension' },
    ],
  },
  mobility: {
    name: 'Rest & Mobility',
    displayName: 'Active Recovery & Hip/Thoracic Flow',
    badge: 'RESTORE • STREAK SAFE',
    headline: 'Today is Rest & Mobility',
    brief: 'Active recovery day. Increases tissue blood flow, decompresses axial loading, and protects your 14-week consistency streak.',
    duration: '22 min',
    primaryLift: 'Thoracic Extension & Foam Roller',
    primaryTarget: '3 rounds × 90 seconds',
    accessoryBreakdown: [
      { muscle: 'Hips', sets: '3 Drills' },
      { muscle: 'Thoracic', sets: '3 Drills' },
      { muscle: 'Ankles', sets: '2 Drills' },
    ],
    exercises: [
      { name: '90/90 Hip Internal/External Flow', sets: '3 sets × 60s per side', target: 'Bodyweight', note: 'Capsular hip mobility' },
      { name: 'Thoracic Spine Foam Roller Opener', sets: '3 sets × 10 extensions', target: 'Bodyweight', note: 'Decompress overhead position' },
      { name: 'Couch Stretch (Hip Flexors)', sets: '2 sets × 90s per leg', target: 'Bodyweight', note: 'Release tight psoas' },
      { name: 'Banded Ankle Mobilization', sets: '2 sets × 15 pulses/side', target: 'Light band', note: 'Enhances squat depth' },
    ],
  },
};

export interface ExerciseSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number;
  targetReps: number;
  rir: number;
  completed: boolean;
  previous: string;
}

export interface GymExercise {
  id: string;
  name: string;
  muscle: string;
  defaultRestSec: number;
  notes: string;
  lastPerformance: string;
  targetPerformance: string;
  cues: {
    setup: string;
    execution: string;
    mistake: string;
    femaleNote?: string;
  };
  sets: ExerciseSet[];
}

export const DEFAULT_EXERCISES: GymExercise[] = [
  {
    id: 'bench',
    name: 'Barbell Bench Press',
    muscle: 'Chest (Sternal) • Triceps • Anterior Delts',
    defaultRestSec: 150,
    notes: 'Keep scapulae retracted and feet rooted. Controlled 2s eccentric.',
    lastPerformance: '80.0kg × 6, 6, 5 @ RIR 2',
    targetPerformance: '82.5kg × 6, 6, 6 @ RIR 2 (+2.5kg)',
    cues: {
      setup: 'Plant feet flat under knees. Retract and depress scapulae firmly into the pad to create a rigid thoracic shelf.',
      execution: 'Lower under control for 2–3s to mid/lower sternum with elbows tucked 45–60°. Drive through floor and press back toward pins.',
      mistake: 'Flaring elbows wide at 90° (causes subacromial shoulder impingement) or bouncing the bar off the ribcage.',
      femaleNote: 'Due to carrying angle differences, a grip half-a-finger narrower than standard male templates optimizes elbow-under-wrist leverage.',
    },
    sets: [
      { id: 'b-s1', setNumber: 1, type: 'warmup', weight: 60.0, reps: 8, targetReps: 8, rir: 4, completed: true, previous: '60.0kg × 8' },
      { id: 'b-s2', setNumber: 2, type: 'working', weight: 82.5, reps: 6, targetReps: 6, rir: 2, completed: false, previous: '80.0kg × 6 @ RIR 2' },
      { id: 'b-s3', setNumber: 3, type: 'working', weight: 82.5, reps: 6, targetReps: 6, rir: 2, completed: false, previous: '80.0kg × 6 @ RIR 2' },
      { id: 'b-s4', setNumber: 4, type: 'working', weight: 82.5, reps: 6, targetReps: 6, rir: 2, completed: false, previous: '80.0kg × 5 @ RIR 1' },
    ],
  },
  {
    id: 'incline-db',
    name: 'Incline Dumbbell Press',
    muscle: 'Upper Chest (Clavicular) • Front Deltoids',
    defaultRestSec: 120,
    notes: '30° bench incline. Deep pectoral stretch without excessive shoulder flare.',
    lastPerformance: '28.0kg × 8, 8, 7 @ RIR 2',
    targetPerformance: '30.0kg × 8, 8, 8 @ RIR 2 (+2.0kg)',
    cues: {
      setup: 'Set bench to 30° incline. Kick weights up with knees and set feet wide and rooted.',
      execution: 'Tuck elbows 45° to torso. Press dumbbells upward in a gentle converging arc without clacking at top.',
      mistake: 'Excessive lumbar arching that lifts the mid-back off the bench, turning the movement into a flat press.',
      femaleNote: 'Maintain moderate bench angle (30°). Focus on feeling clavicular pectoralis stretch during 2-second eccentric.',
    },
    sets: [
      { id: 'i-s1', setNumber: 1, type: 'working', weight: 30.0, reps: 8, targetReps: 8, rir: 2, completed: false, previous: '28.0kg × 8' },
      { id: 'i-s2', setNumber: 2, type: 'working', weight: 30.0, reps: 8, targetReps: 8, rir: 2, completed: false, previous: '28.0kg × 8' },
      { id: 'i-s3', setNumber: 3, type: 'working', weight: 30.0, reps: 8, targetReps: 8, rir: 1, completed: false, previous: '28.0kg × 7' },
    ],
  },
  {
    id: 'lat-raise',
    name: 'Cable Lateral Raise',
    muscle: 'Lateral Deltoids (Side Delts)',
    defaultRestSec: 90,
    notes: 'Lead with elbows in scapular plane. 1-second squeeze at apex.',
    lastPerformance: '7.5kg × 14, 14, 12 @ RIR 1',
    targetPerformance: '7.5kg × 15, 15, 14 @ RIR 1 (+progression)',
    cues: {
      setup: 'Set pulley height at hand/wrist level when standing. Stand tall with core lightly braced.',
      execution: 'Sweep arms out wide in the scapular plane (30° in front of torso). Lead with elbows with a 1-second squeeze.',
      mistake: 'Shrugging upper traps to yank the weight, shifting tension away from the side delts.',
      femaleNote: 'Cable provides continuous tension profile through lengthened bottom range where side delts experience optimal growth.',
    },
    sets: [
      { id: 'l-s1', setNumber: 1, type: 'working', weight: 7.5, reps: 15, targetReps: 15, rir: 2, completed: false, previous: '7.5kg × 14' },
      { id: 'l-s2', setNumber: 2, type: 'working', weight: 7.5, reps: 14, targetReps: 15, rir: 1, completed: false, previous: '7.5kg × 14' },
      { id: 'l-s3', setNumber: 3, type: 'working', weight: 7.5, reps: 12, targetReps: 15, rir: 0, completed: false, previous: '7.5kg × 12' },
    ],
  },
  {
    id: 'triceps-ext',
    name: 'Overhead Cable Triceps Extension',
    muscle: 'Triceps (Long Head)',
    defaultRestSec: 90,
    notes: 'Keep elbows tucked overhead. Full elbow extension without shoulder flexion.',
    lastPerformance: '22.5kg × 12, 11, 10 @ RIR 1',
    targetPerformance: '25.0kg × 12, 11, 10 @ RIR 1 (+2.5kg)',
    cues: {
      setup: 'Set cable rope at chest height. Step forward into a staggered stance with neutral spine.',
      execution: 'Flare elbows slightly outward. Extend forearms forward until elbows are fully locked.',
      mistake: 'Swinging torso forward and back using momentum rather than elbow flexion.',
    },
    sets: [
      { id: 't-s1', setNumber: 1, type: 'working', weight: 25.0, reps: 12, targetReps: 12, rir: 2, completed: false, previous: '22.5kg × 12' },
      { id: 't-s2', setNumber: 2, type: 'working', weight: 25.0, reps: 11, targetReps: 12, rir: 1, completed: false, previous: '22.5kg × 11' },
      { id: 't-s3', setNumber: 3, type: 'working', weight: 25.0, reps: 10, targetReps: 12, rir: 0, completed: false, previous: '22.5kg × 10' },
    ],
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    muscle: 'Gastrocnemius • Soleus',
    defaultRestSec: 75,
    notes: '2-second dead stop pause at the bottom stretch to eliminate Achilles tendon reflex.',
    lastPerformance: '70.0kg × 12, 12, 11 @ RIR 1',
    targetPerformance: '70.0kg × 12, 12, 12 @ RIR 1 (+reps)',
    cues: {
      setup: 'Balls of feet on edge of platform. Shoulders braced firmly against pads.',
      execution: 'Descend into full ankle dorsiflexion. Hold bottom stretch for 2s, then explode up onto big toes.',
      mistake: 'Bouncing at bottom utilizing elastic tendon rebound rather than muscular contraction.',
    },
    sets: [
      { id: 'c-s1', setNumber: 1, type: 'working', weight: 70.0, reps: 12, targetReps: 12, rir: 2, completed: false, previous: '70.0kg × 12' },
      { id: 'c-s2', setNumber: 2, type: 'working', weight: 70.0, reps: 12, targetReps: 12, rir: 1, completed: false, previous: '70.0kg × 12' },
      { id: 'c-s3', setNumber: 3, type: 'working', weight: 70.0, reps: 12, targetReps: 12, rir: 0, completed: false, previous: '70.0kg × 11' },
    ],
  },
];

export function getGymExercisesForRoutine(routine: RoutineType): GymExercise[] {
  if (routine === 'push_a') {
    return JSON.parse(JSON.stringify(DEFAULT_EXERCISES));
  }

  const conf = ROUTINE_CONFIGS[routine];
  if (!conf) {
    return JSON.parse(JSON.stringify(DEFAULT_EXERCISES));
  }

  return conf.exercises.map((p, idx) => {
    // Parse weight from target (e.g. '140.0 kg', '30.0 kg/hand', 'Bodyweight')
    const weightMatch = p.target.match(/([\d.]+)\s*kg/i);
    const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;

    // Parse set count from sets (e.g. '3 sets × 5 reps', '4 sets × 8–10 reps', '3 rounds × 90 seconds')
    const setsMatch = p.sets.match(/(\d+)\s*(?:sets?|rounds?)/i);
    const setCount = setsMatch ? parseInt(setsMatch[1], 10) : 3;

    // Parse target reps from sets
    const repsMatch = p.sets.match(/[×x]\s*(\d+)/i) || p.sets.match(/(\d+)\s*reps?/i);
    const targetReps = repsMatch ? parseInt(repsMatch[1], 10) : 8;

    const sets: ExerciseSet[] = [];
    for (let s = 1; s <= setCount; s++) {
      sets.push({
        id: `${routine}-ex${idx}-s${s}`,
        setNumber: s,
        type: 'working',
        weight: weight,
        reps: targetReps,
        targetReps: targetReps,
        rir: 2,
        completed: false,
        previous: weight > 0 ? `${weight}kg × ${targetReps}` : `${targetReps} reps`,
      });
    }

    const rawSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let exId = rawSlug;
    if (rawSlug === 'barbell-bench-press' || rawSlug === 'bench-press' || rawSlug === 'bench') {
      exId = 'bench';
    } else if (rawSlug === 'conventional-deadlift' || rawSlug === 'barbell-conventional-deadlift' || rawSlug === 'deadlift') {
      exId = 'deadlift';
    } else if (rawSlug === 'barbell-back-squat' || rawSlug === 'squat') {
      exId = 'squat';
    } else if (rawSlug === 'incline-dumbbell-press' || rawSlug === 'incline-db-press') {
      exId = 'incline-db';
    } else if (rawSlug === 'cable-lateral-raise') {
      exId = 'lat-raise';
    } else if (rawSlug === 'overhead-triceps-extension' || rawSlug === 'overhead-cable-triceps-extension') {
      exId = 'triceps-ext';
    } else if (rawSlug === 'standing-calf-raise') {
      exId = 'calf-raise';
    } else if (rawSlug === 'neutral-lat-pulldown') {
      exId = 'lat-pulldown';
    } else if (rawSlug === 'chest-supported-db-row') {
      exId = 'chest-supported-row';
    } else if (rawSlug === 'incline-dumbbell-curl') {
      exId = 'incline-curl';
    } else if (rawSlug === 'face-pulls') {
      exId = 'face-pull';
    } else if (rawSlug === 'romanian-deadlift-rdl' || rawSlug === 'romanian-deadlift') {
      exId = 'rdl';
    } else if (rawSlug === 'flat-dumbbell-press') {
      exId = 'db-flat-press';
    } else if (rawSlug === 'standing-db-lateral-raise') {
      exId = 'db-lateral-raise';
    } else if (rawSlug === '90-90-hip-internal-external-flow') {
      exId = '90-90-hip-flow';
    } else if (rawSlug === 'couch-stretch-hip-flexors') {
      exId = 'couch-stretch';
    }

    return {
      id: exId || `ex-${idx}`,
      name: p.name,
      muscle: conf.name,
      defaultRestSec: p.isCompound ? 120 : 90,
      notes: p.note || 'Focus on controlled eccentric and solid position.',
      lastPerformance: weight > 0 ? `${weight}kg × ${targetReps} @ RIR 2` : `${p.sets} @ Target`,
      targetPerformance: `${p.target} (${p.sets})`,
      cues: {
        setup: `Set up with stable footing and strong brace for ${p.name}.`,
        execution: 'Controlled eccentric, smooth acceleration, full range of motion.',
        mistake: 'Rushing the cadence or compromising joint alignment.',
        femaleNote: 'Maintain structural brace and keep tempo strictly uniform.',
      },
      sets,
    };
  });
}

export function gymToWorkout(exercises: GymExercise[]): WorkoutExercise[] {
  return exercises.map((item, exIdx) => {
    const exercise: Exercise = {
      id: item.id || `ex-${exIdx}`,
      name: item.name,
      targetMuscle: item.muscle,
      secondaryMuscles: [],
      equipment: 'barbell_or_dumbbell',
      difficulty: 'intermediate',
      cue: {
        setup: item.cues.setup,
        execution: item.cues.execution,
        commonMistake: item.cues.mistake,
        femaleConsideration: item.cues.femaleNote,
      },
      defaultRestSecs: item.defaultRestSec,
      alternatives: [],
    };

    const sets: SetRecord[] = item.sets.map((s, sIdx) => ({
      id: s.id || `set-${exIdx}-${sIdx}`,
      setNumber: s.setNumber,
      type: s.type,
      weightKg: s.weight,
      reps: s.reps,
      targetReps: s.targetReps,
      targetWeightKg: s.weight,
      rir: s.rir,
      rpe: 10 - s.rir,
      completed: s.completed,
    }));

    return {
      exercise,
      lastPerformance: item.lastPerformance,
      targetPerformance: item.targetPerformance,
      notes: item.notes,
      sets,
    };
  });
}

export function workoutToGym(workout: WorkoutExercise[]): GymExercise[] {
  return workout.map((item, exIdx) => ({
    id: item.exercise.id || `ex-${exIdx}`,
    name: item.exercise.name,
    muscle: item.exercise.targetMuscle || 'Target Muscle',
    defaultRestSec: item.exercise.defaultRestSecs || 120,
    notes: item.notes || 'Focus on controlled eccentric and clean lockout.',
    lastPerformance: item.lastPerformance || 'Baseline',
    targetPerformance: item.targetPerformance || 'Target',
    cues: {
      setup: item.exercise.cue?.setup || 'Set base and brace firmly.',
      execution: item.exercise.cue?.execution || 'Controlled 2s eccentric, drive smoothly.',
      mistake: item.exercise.cue?.commonMistake || 'Avoid bouncing or losing core tension.',
      femaleNote: item.exercise.cue?.femaleConsideration,
    },
    sets: item.sets.map((s, sIdx) => ({
      id: s.id || `s-${exIdx}-${sIdx}`,
      setNumber: s.setNumber || sIdx + 1,
      type: s.type || 'working',
      weight: s.weightKg,
      reps: s.reps,
      targetReps: s.targetReps || s.reps,
      rir: typeof s.rir === 'number' ? s.rir : 2,
      completed: s.completed,
      previous: `${s.weightKg}kg × ${s.reps}`,
    })),
  }));
}

export function briefingFromRoutine(routine: RoutineType): MorningBriefingData {
  const c = ROUTINE_CONFIGS[routine] || ROUTINE_CONFIGS.push_a;
  return {
    workoutName: c.displayName,
    splitDay: c.badge,
    estimatedMinutes: parseInt(c.duration, 10) || 45,
    cycleWeek: 3,
    cycleTotalWeeks: 6,
    recoveryNote: c.brief,
    readinessScore: 85,
    recommendedAdjustment: c.brief,
    primaryLift: c.primaryLift,
    primaryTarget: c.primaryTarget,
  };
}

export function getRoutineSession(routine: RoutineType) {
  return {
    workout: gymToWorkout(getGymExercisesForRoutine(routine)),
    briefing: briefingFromRoutine(routine),
  };
}
