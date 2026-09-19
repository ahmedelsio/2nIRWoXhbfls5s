import { Exercise, MorningBriefingData, NightDebriefData, WorkoutExercise } from '../types';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    targetMuscle: 'Chest (Sternal)',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Barbell & Bench',
    difficulty: 'intermediate',
    defaultRestSecs: 150,
    cue: {
      setup: 'Eyes under bar, shoulder blades pinned down and together into the bench pad, feet rooted.',
      execution: 'Lower under control to mid-sternum with forearms vertical at bottom. Drive feet into floor and press slightly back toward rack pins.',
      commonMistake: 'Flaring elbows out at 90 degrees or bouncing bar off the sternum.',
      femaleConsideration: 'Wider grip relative to shoulder width may improve leverage; ensure micro-loading (1.25kg / 2.5lb plates) is available for linear progression.',
    },
    alternatives: [
      { id: 'db-incline-press', name: 'Incline Dumbbell Press', reason: 'Crowded flat bench; keeps upper pectoral recruitment high with safer shoulder path.' },
      { id: 'machine-chest-press', name: 'Seated Chest Press Machine', reason: 'No spotter available; isolates pecs safely with zero stabilizer fatigue.' },
      { id: 'weighted-dips', name: 'Parallel Bar Dips', reason: 'Plate-loaded alternative with intense lower chest and tricep stimulus.' },
    ],
  },
  {
    id: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    targetMuscle: 'Upper Chest (Clavicular)',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    equipment: 'Dumbbells & Incline Bench',
    difficulty: 'beginner',
    defaultRestSecs: 120,
    cue: {
      setup: 'Set bench to 30° angle (higher shifts load to shoulders). Kick dumbbells up with knees.',
      execution: 'Tuck elbows 45° to torso, press up in a gentle arc without clacking weights at top.',
      commonMistake: 'Arching lower back excessively off the bench, turning it back into a flat press.',
    },
    alternatives: [
      { id: 'incline-smith-press', name: 'Incline Smith Machine Press', reason: 'Fixed path allows pure failure tracking without dumbbell setup fatigue.' },
      { id: 'low-to-high-cable-fly', name: 'Low-to-High Cable Fly', reason: 'Joint-friendly clavicular tension across peak contraction.' },
    ],
  },
  {
    id: 'standing-overhead-press',
    name: 'Overhead Press (OHP)',
    targetMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Traps', 'Core'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    defaultRestSecs: 150,
    cue: {
      setup: 'Grip just outside shoulders, squeeze glutes and brace abs like taking a punch.',
      execution: 'Move head back slightly to clear the chin, press straight up, push head through "window" at lockout.',
      commonMistake: 'Leaning backward into excessive lumbar hyperextension.',
    },
    alternatives: [
      { id: 'seated-db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', reason: 'Back support removes core stability requirement if lower back is fatigued.' },
      { id: 'machine-shoulder-press', name: 'Neutral Grip Machine Press', reason: 'Extremely shoulder-friendly for impinging or sensitive rotator cuffs.' },
    ],
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    targetMuscle: 'Lateral Deltoids',
    secondaryMuscles: ['Upper Traps'],
    equipment: 'Cable Tower',
    difficulty: 'beginner',
    defaultRestSecs: 90,
    cue: {
      setup: 'Set pulley to wrist height. Stand tall, grip cuff or handle behind back or across front.',
      execution: 'Lead with elbow in the scapular plane (30° forward), pause at shoulder height for 0.5s.',
      commonMistake: 'Shrugging with upper traps rather than initiating movement with the side delt.',
    },
    alternatives: [
      { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise', reason: 'Available anywhere without waiting for cable stack.' },
      { id: 'leaning-db-lateral', name: 'Leaning Cable/Dumbbell Lateral', reason: 'Alters resistance curve to maximize stretch tension at bottom.' },
    ],
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Cable Overhead Triceps Extension',
    targetMuscle: 'Triceps (Long Head)',
    secondaryMuscles: ['Anconeus'],
    equipment: 'Cable Tower & Rope',
    difficulty: 'beginner',
    defaultRestSecs: 90,
    cue: {
      setup: 'Stagger stance for balance. Lean forward 30 degrees, elbows pinned in place next to ears.',
      execution: 'Extend forearms forward, flaring rope ends apart at peak extension.',
      commonMistake: 'Moving elbows forward and back, turning an extension into a press.',
    },
    alternatives: [
      { id: 'tricep-pushdown', name: 'Cable Rope Pushdown', reason: 'Easier on elbows if overhead extension causes impingement.' },
      { id: 'skull-crushers', name: 'EZ Bar Skull Crushers', reason: 'Free weight barbell overload option for long head mass.' },
    ],
  },
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    targetMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Adductors', 'Erectors', 'Hamstrings'],
    equipment: 'Barbell & Squat Rack',
    difficulty: 'intermediate',
    defaultRestSecs: 180,
    cue: {
      setup: 'Bar resting on upper traps (high bar) or rear delts (low bar). Feet shoulder width, toes flared 15–30°.',
      execution: 'Hips and knees break simultaneously. Descend to parallel while maintaining mid-foot pressure.',
      commonMistake: 'Knees caving inward on ascent or heels lifting off the floor.',
      femaleConsideration: 'Wider pelvis often benefits from a slightly wider stance with greater toe flare to achieve comfortable hip depth without pelvic pinch.',
    },
    alternatives: [
      { id: 'hack-squat', name: 'Machine Hack Squat', reason: 'Safely takes spinal loading away while smashing quads to failure.' },
      { id: 'leg-press', name: '45-Degree Leg Press', reason: 'Allows heavy lower-body volume when back or core is fatigued.' },
      { id: 'goblet-squat', name: 'Dumbbell Goblet Squat', reason: 'Ideal for beginners mastering depth and torso uprightness.' },
    ],
  },
  {
    id: 'romanian-deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: ['Erectors', 'Lats', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    defaultRestSecs: 150,
    cue: {
      setup: 'Stand tall with double overhand grip, slight soft bend in knees.',
      execution: 'Push hips back towards the wall behind you as if closing a car door with your glutes. Shave thighs with the bar.',
      commonMistake: 'Bending knees into a conventional squat or rounding lumbar spine at bottom.',
    },
    alternatives: [
      { id: 'db-rdl', name: 'Dumbbell RDL', reason: 'Allows hands to track alongside thighs, reducing lower-back shear.' },
      { id: 'seated-leg-curl', name: 'Seated Leg Curl', reason: 'Tolerates pure hamstring overload in the lengthened position without axial fatigue.' },
    ],
  },
];

export const INITIAL_WORKOUT_SESSION: WorkoutExercise[] = [
  {
    exercise: EXERCISE_LIBRARY[0], // Barbell Bench Press
    lastPerformance: '80.0kg x 6, 6, 5 @ RPE 8.5',
    targetPerformance: '82.5kg x 6, 6, 6 @ RIR 2',
    notes: 'Keep shoulder blades depressed into the pad. Pause first rep for 0.5s.',
    sets: [
      { id: 'set-1', setNumber: 1, type: 'working', weightKg: 82.5, reps: 6, targetReps: 6, rir: 2, rpe: 8, completed: true, timestamp: '14:22' },
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
      { id: 'set-10', setNumber: 1, type: 'working', weightKg: 10.0, reps: 15, targetReps: 15, rir: 1, completed: false },
      { id: 'set-11', setNumber: 2, type: 'working', weightKg: 10.0, reps: 15, targetReps: 15, rir: 1, completed: false },
      { id: 'set-12', setNumber: 3, type: 'drop', weightKg: 7.5, reps: 18, targetReps: 15, rir: 0, completed: false },
    ],
  },
];

export const MOCK_MORNING_BRIEF: MorningBriefingData = {
  workoutName: 'Upper Body Hypertrophy (Push A)',
  splitDay: 'Day 2 • Upper Body',
  estimatedMinutes: 62,
  cycleWeek: 3,
  cycleTotalWeeks: 6,
  recoveryNote: 'Sleep was 6h 15m (35m below baseline). Heart rate variability stable. Suggestion: keep work sets clean at RIR 2; drop top set by 2.5kg if warmup bar speed feels sluggish.',
  readinessScore: 84,
  recommendedAdjustment: 'Keep primary compound volume; drop 1 accessory set if time-compressed.',
  primaryLift: 'Barbell Bench Press',
  primaryTarget: '82.5kg for 3 sets of 6 reps (Progression check)',
};

export const MOCK_NIGHT_DEBRIEF: NightDebriefData = {
  workoutName: 'Upper Body Hypertrophy (Push A)',
  completedAt: '7:42 PM Today',
  durationMinutes: 58,
  totalVolumeKg: 6420,
  setsCompleted: 15,
  sessionGrade: 'A',
  gradeReason: 'Hit 100% of prescribed compound volume at target RIR without form breakdown. Progressive overload successful on 2 exercises.',
  prs: [
    {
      exerciseName: 'Barbell Bench Press',
      metric: 'Estimated 1RM PR',
      value: '99.5 kg',
      previousBest: '96.2 kg',
      estimated1RM: 99.5,
    },
    {
      exerciseName: 'Incline Dumbbell Press',
      metric: 'Rep Record',
      value: '30.0kg × 8 reps',
      previousBest: '28.0kg × 10 reps',
      estimated1RM: 37.2,
    },
  ],
  tomorrowPreview: {
    title: 'Active Recovery & Mobility',
    type: 'rest',
    description: 'Scheduled intelligent rest. 8,000 steps target + 10-minute thoracic spine & hip flow. Your streak is protected.',
  },
};
