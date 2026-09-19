import { WorkoutExercise, Exercise, MorningBriefingData } from '../types';
import { EXERCISE_LIBRARY } from './mockData';

// Additional Exercises for Pull & Legs
export const PULL_EXERCISES: Exercise[] = [
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    targetMuscle: 'Lats & Upper Back',
    secondaryMuscles: ['Rear Delts', 'Biceps', 'Erectors'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    defaultRestSecs: 150,
    cue: {
      setup: 'Hinge at hips to 45°, overhand grip just outside knees, spine neutral.',
      execution: 'Pull bar toward lower ribs/navel, drive elbows behind torso, squeeze scapulae.',
      commonMistake: 'Jerking torso upright to cheat momentum.',
    },
    alternatives: [
      { id: 'chest-supported-row', name: 'Chest-Supported Machine Row', reason: 'Eliminates lower back fatigue.' }
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Neutral Grip Lat Pulldown',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Brachialis'],
    equipment: 'Cable Tower',
    difficulty: 'beginner',
    defaultRestSecs: 120,
    cue: {
      setup: 'Thigh pads snug. Grip neutral handles, chest proud with slight lean back.',
      execution: 'Pull through elbows down to upper chest, pause for 0.5s at peak squeeze.',
      commonMistake: 'Swinging backward excessively like a rowing machine.',
    },
    alternatives: [
      { id: 'pull-ups', name: 'Bodyweight Pull-Ups', reason: 'High threshold motor unit recruitment.' }
    ]
  },
  {
    id: 'face-pulls',
    name: 'Cable Rope Face Pull',
    targetMuscle: 'Rear Delts & Rotator Cuff',
    secondaryMuscles: ['Rhomboids', 'Mid Traps'],
    equipment: 'Cable Tower & Rope',
    difficulty: 'beginner',
    defaultRestSecs: 90,
    cue: {
      setup: 'Set pulley to eye level. Thumbs backward on rope ends.',
      execution: 'Pull hands to ears while rotating knuckles back (double bicep pose).',
      commonMistake: 'Using heavy weight and turning it into a slouching shrug.',
    },
    alternatives: []
  },
  {
    id: 'incline-db-curl',
    name: 'Incline Dumbbell Bicep Curl',
    targetMuscle: 'Biceps (Long Head)',
    secondaryMuscles: ['Forearms'],
    equipment: 'Dumbbells & Incline Bench',
    difficulty: 'beginner',
    defaultRestSecs: 90,
    cue: {
      setup: 'Set bench to 45–60°. Let arms hang completely vertical.',
      execution: 'Curl up while keeping elbows pinned back in the lengthened position.',
      commonMistake: 'Swinging elbows forward to engage front delts.',
    },
    alternatives: []
  }
];

export const LEGS_EXERCISES: Exercise[] = [
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    targetMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Adductors', 'Core', 'Hamstrings'],
    equipment: 'Barbell & Squat Rack',
    difficulty: 'intermediate',
    defaultRestSecs: 180,
    cue: {
      setup: 'Bar across upper traps. Feet shoulder-width, toes flared 20°.',
      execution: 'Sit hips down between heels until crease of hip is below knee.',
      commonMistake: 'Knees caving inward or chest dropping forward.',
    },
    alternatives: [
      { id: 'hack-squat', name: 'Machine Hack Squat', reason: 'Isolates quads without lower back load.' }
    ]
  },
  {
    id: 'romanian-deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: ['Erectors', 'Lats'],
    equipment: 'Barbell',
    difficulty: 'intermediate',
    defaultRestSecs: 150,
    cue: {
      setup: 'Stand tall with double overhand grip, slight soft bend in knees.',
      execution: 'Push hips back towards the wall behind you. Feel deep hamstring stretch.',
      commonMistake: 'Rounding lower back at the bottom.',
    },
    alternatives: [
      { id: 'seated-leg-curl', name: 'Seated Leg Curl', reason: 'Safe high-tension lengthened hamstring overload.' }
    ]
  },
  {
    id: 'leg-press',
    name: '45-Degree Leg Press',
    targetMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes'],
    equipment: 'Leg Press Machine',
    difficulty: 'beginner',
    defaultRestSecs: 120,
    cue: {
      setup: 'Feet mid-plate, hip-width apart. Lower safety handles.',
      execution: 'Lower sled deep without lower back peeling off the pad. Drive through mid-foot.',
      commonMistake: 'Locking out knees aggressively at top.',
    },
    alternatives: []
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    targetMuscle: 'Gastrocnemius',
    secondaryMuscles: ['Soleus'],
    equipment: 'Calf Machine',
    difficulty: 'beginner',
    defaultRestSecs: 75,
    cue: {
      setup: 'Balls of feet on block, balls of feet rooted, knees locked straight.',
      execution: 'Full 2-second stretch at bottom, press up onto big toes with 1s squeeze.',
      commonMistake: 'Bouncing quickly with Achilles tendon elasticity instead of muscular contraction.',
    },
    alternatives: []
  }
];

export const CROWDED_PUSH_EXERCISES: WorkoutExercise[] = [
  {
    exercise: {
      id: 'db-flat-press',
      name: 'Dumbbell Flat Bench Press',
      targetMuscle: 'Chest (Sternal)',
      secondaryMuscles: ['Triceps', 'Front Delts'],
      equipment: 'Dumbbells & Bench',
      difficulty: 'beginner',
      defaultRestSecs: 90,
      cue: {
        setup: 'Retract scapulae into bench, kick weights up with knees.',
        execution: 'Press dumbbells together in an arc, controlled 3s eccentric.',
        commonMistake: 'Flaring elbows 90 degrees.',
      },
      alternatives: []
    },
    lastPerformance: '32kg x 8, 8, 8',
    targetPerformance: '32kg x 8, 8, 8 (Crowded Quick Flow)',
    notes: 'No rack needed. High mechanical tension.',
    sets: [
      { id: 'c-set-1', setNumber: 1, type: 'working', weightKg: 32, reps: 8, targetReps: 8, rir: 2, completed: false },
      { id: 'c-set-2', setNumber: 2, type: 'working', weightKg: 32, reps: 8, targetReps: 8, rir: 2, completed: false },
      { id: 'c-set-3', setNumber: 3, type: 'working', weightKg: 32, reps: 8, targetReps: 8, rir: 1, completed: false },
    ]
  },
  {
    exercise: {
      id: 'db-seated-press',
      name: 'Seated Dumbbell Shoulder Press',
      targetMuscle: 'Front Deltoids',
      secondaryMuscles: ['Triceps', 'Upper Traps'],
      equipment: 'Dumbbells & Bench',
      difficulty: 'beginner',
      defaultRestSecs: 90,
      cue: {
        setup: 'Bench upright 75-80 degrees. Elbows slightly in front.',
        execution: 'Press overhead smoothly without clacking weights.',
        commonMistake: 'Arching back off bench.',
      },
      alternatives: []
    },
    lastPerformance: '22kg x 10, 9, 8',
    targetPerformance: '22kg x 10, 10, 10',
    notes: 'Superset with lateral raises for fast efficiency.',
    sets: [
      { id: 'c-set-4', setNumber: 1, type: 'working', weightKg: 22, reps: 10, targetReps: 10, rir: 2, completed: false },
      { id: 'c-set-5', setNumber: 2, type: 'working', weightKg: 22, reps: 10, targetReps: 10, rir: 2, completed: false },
    ]
  },
  {
    exercise: {
      id: 'db-lateral-raise',
      name: 'Standing DB Lateral Raise',
      targetMuscle: 'Lateral Deltoids',
      secondaryMuscles: ['Upper Traps'],
      equipment: 'Dumbbells',
      difficulty: 'beginner',
      defaultRestSecs: 60,
      cue: {
        setup: 'Slight hinge at hips, arms hanging in front.',
        execution: 'Raise out to sides in scapular plane with soft elbows.',
        commonMistake: 'Using leg drive or shrugging with neck.',
      },
      alternatives: []
    },
    lastPerformance: '10kg x 15, 14, 12',
    targetPerformance: '10kg x 15, 15, 15 @ RIR 0',
    notes: 'Finish with 5 partial reps from bottom.',
    sets: [
      { id: 'c-set-6', setNumber: 1, type: 'working', weightKg: 10, reps: 15, targetReps: 15, rir: 1, completed: false },
      { id: 'c-set-7', setNumber: 2, type: 'working', weightKg: 10, reps: 15, targetReps: 15, rir: 0, completed: false },
    ]
  }
];

export const PULL_A_SESSION: WorkoutExercise[] = [
  {
    exercise: PULL_EXERCISES[0], // Barbell Row
    lastPerformance: '70kg x 8, 8, 7 @ RIR 2',
    targetPerformance: '72.5kg x 8, 8, 8 @ RIR 2',
    notes: 'Drive through elbows. Keep chest elevated.',
    sets: [
      { id: 'p-set-1', setNumber: 1, type: 'working', weightKg: 72.5, reps: 8, targetReps: 8, rir: 2, completed: false },
      { id: 'p-set-2', setNumber: 2, type: 'working', weightKg: 72.5, reps: 8, targetReps: 8, rir: 2, completed: false },
      { id: 'p-set-3', setNumber: 3, type: 'working', weightKg: 72.5, reps: 8, targetReps: 8, rir: 1, completed: false },
    ]
  },
  {
    exercise: PULL_EXERCISES[1], // Lat Pulldown
    lastPerformance: '65kg x 10, 10, 9',
    targetPerformance: '65kg x 10, 10, 10 @ RIR 2',
    notes: 'Full stretch at top of each repetition.',
    sets: [
      { id: 'p-set-4', setNumber: 1, type: 'working', weightKg: 65, reps: 10, targetReps: 10, rir: 2, completed: false },
      { id: 'p-set-5', setNumber: 2, type: 'working', weightKg: 65, reps: 10, targetReps: 10, rir: 2, completed: false },
      { id: 'p-set-6', setNumber: 3, type: 'working', weightKg: 65, reps: 10, targetReps: 10, rir: 1, completed: false },
    ]
  },
  {
    exercise: PULL_EXERCISES[2], // Face Pulls
    lastPerformance: '25kg x 15, 15, 14',
    targetPerformance: '25kg x 15, 15, 15 @ RIR 1',
    notes: 'External rotation focus.',
    sets: [
      { id: 'p-set-7', setNumber: 1, type: 'working', weightKg: 25, reps: 15, targetReps: 15, rir: 1, completed: false },
      { id: 'p-set-8', setNumber: 2, type: 'working', weightKg: 25, reps: 15, targetReps: 15, rir: 1, completed: false },
    ]
  },
  {
    exercise: PULL_EXERCISES[3], // Incline DB Curl
    lastPerformance: '14kg x 10, 10, 8',
    targetPerformance: '14kg x 10, 10, 10 @ RIR 0-1',
    notes: 'Stretch under tension.',
    sets: [
      { id: 'p-set-9', setNumber: 1, type: 'working', weightKg: 14, reps: 10, targetReps: 10, rir: 1, completed: false },
      { id: 'p-set-10', setNumber: 2, type: 'working', weightKg: 14, reps: 10, targetReps: 10, rir: 0, completed: false },
    ]
  }
];

export const LEGS_A_SESSION: WorkoutExercise[] = [
  {
    exercise: LEGS_EXERCISES[0], // Squat
    lastPerformance: '100kg x 6, 6, 5 @ RIR 2',
    targetPerformance: '102.5kg x 6, 6, 6 @ RIR 2',
    notes: 'Hit parallel depth cleanly.',
    sets: [
      { id: 'l-set-1', setNumber: 1, type: 'working', weightKg: 102.5, reps: 6, targetReps: 6, rir: 2, completed: false },
      { id: 'l-set-2', setNumber: 2, type: 'working', weightKg: 102.5, reps: 6, targetReps: 6, rir: 2, completed: false },
      { id: 'l-set-3', setNumber: 3, type: 'working', weightKg: 102.5, reps: 6, targetReps: 6, rir: 1, completed: false },
    ]
  },
  {
    exercise: LEGS_EXERCISES[1], // RDL
    lastPerformance: '90kg x 8, 8, 8',
    targetPerformance: '92.5kg x 8, 8, 8 @ RIR 2',
    notes: 'Hinge hips deep, shins vertical.',
    sets: [
      { id: 'l-set-4', setNumber: 1, type: 'working', weightKg: 92.5, reps: 8, targetReps: 8, rir: 2, completed: false },
      { id: 'l-set-5', setNumber: 2, type: 'working', weightKg: 92.5, reps: 8, targetReps: 8, rir: 2, completed: false },
      { id: 'l-set-6', setNumber: 3, type: 'working', weightKg: 92.5, reps: 8, targetReps: 8, rir: 1, completed: false },
    ]
  },
  {
    exercise: LEGS_EXERCISES[2], // Leg Press
    lastPerformance: '180kg x 12, 12, 10',
    targetPerformance: '180kg x 12, 12, 12 @ RIR 1',
    notes: 'Deep knee flexion without butt rising.',
    sets: [
      { id: 'l-set-7', setNumber: 1, type: 'working', weightKg: 180, reps: 12, targetReps: 12, rir: 1, completed: false },
      { id: 'l-set-8', setNumber: 2, type: 'working', weightKg: 180, reps: 12, targetReps: 12, rir: 1, completed: false },
    ]
  }
];

export interface ProgramPreset {
  id: string;
  name: string;
  split: string;
  daysPerWeek: number;
  description: string;
  schedule: { day: string; workoutKey: string; workoutLabel: string; isRest: boolean }[];
}

export const PROGRAM_PRESETS: ProgramPreset[] = [
  {
    id: 'ppl-hypertrophy',
    name: 'Push / Pull / Legs (PPL)',
    split: 'Hypertrophy Periodization',
    daysPerWeek: 5,
    description: 'High-frequency muscle building split rotating Push, Pull, Legs with 2 planned recovery days.',
    schedule: [
      { day: 'Mon', workoutKey: 'push_a', workoutLabel: 'Push A (Chest, Delts, Triceps)', isRest: false },
      { day: 'Tue', workoutKey: 'pull_a', workoutLabel: 'Pull A (Back, Rear Delts, Biceps)', isRest: false },
      { day: 'Wed', workoutKey: 'rest', workoutLabel: 'Rest & Mobility (Active Recovery)', isRest: true },
      { day: 'Thu', workoutKey: 'legs_a', workoutLabel: 'Legs A (Quads, Hamstrings, Calves)', isRest: false },
      { day: 'Fri', workoutKey: 'push_b', workoutLabel: 'Push B (Overhead Focus & Triceps)', isRest: false },
      { day: 'Sat', workoutKey: 'pull_b', workoutLabel: 'Pull B (Upper Back & Forearms)', isRest: false },
      { day: 'Sun', workoutKey: 'rest', workoutLabel: 'Rest & Recovery Day', isRest: true },
    ]
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower (4-Day)',
    split: 'Balanced Strength & Hypertrophy',
    daysPerWeek: 4,
    description: 'Gold standard 4-day split ideal for busy professionals and intermediate lifters recovering from axial loading.',
    schedule: [
      { day: 'Mon', workoutKey: 'push_a', workoutLabel: 'Upper Body Heavy (Bench & Row)', isRest: false },
      { day: 'Tue', workoutKey: 'legs_a', workoutLabel: 'Lower Body Heavy (Squat & Calves)', isRest: false },
      { day: 'Wed', workoutKey: 'rest', workoutLabel: 'Rest / Mobility Flow', isRest: true },
      { day: 'Thu', workoutKey: 'push_b', workoutLabel: 'Upper Body Hypertrophy', isRest: false },
      { day: 'Fri', workoutKey: 'legs_b', workoutLabel: 'Lower Body Hypertrophy (RDL Focus)', isRest: false },
      { day: 'Sat', workoutKey: 'rest', workoutLabel: 'Rest Day (Walk & Relax)', isRest: true },
      { day: 'Sun', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
    ]
  },
  {
    id: 'full-body-3day',
    name: 'Full Body (3-Day)',
    split: 'Novice & Busy Lifter Frequency',
    daysPerWeek: 3,
    description: 'Hits all major muscle groups 3x/week with maximal recovery between sessions.',
    schedule: [
      { day: 'Mon', workoutKey: 'full_a', workoutLabel: 'Full Body A (Squat & Bench)', isRest: false },
      { day: 'Tue', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
      { day: 'Wed', workoutKey: 'full_b', workoutLabel: 'Full Body B (Deadlift & OHP)', isRest: false },
      { day: 'Thu', workoutKey: 'rest', workoutLabel: 'Rest & Mobility', isRest: true },
      { day: 'Fri', workoutKey: 'full_c', workoutLabel: 'Full Body C (Hack Squat & Incline)', isRest: false },
      { day: 'Sat', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
      { day: 'Sun', workoutKey: 'rest', workoutLabel: 'Rest Day', isRest: true },
    ]
  }
];
