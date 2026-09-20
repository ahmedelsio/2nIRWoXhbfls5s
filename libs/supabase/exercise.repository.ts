import { supabase, isSupabaseConfigured } from './client';
import { onlineManager } from '@tanstack/react-query';
import { ExerciseFilterSchema } from './schemas';
import type { Database } from './types';
import type { ValidatedExerciseFilter } from './schemas';

export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type ExerciseSubstituteRelation = Database['public']['Tables']['exercise_substitutes']['Row'];

export interface EnrichedSubstitute {
  id: string;
  substitute_id: string;
  name: string;
  primary_muscle: string;
  movement_pattern: string;
  equipment_category: string;
  reason: string;
  stimulus_match_rating: number;
}

// Canonical fallback exercise library for instant offline access and tests
export const FALLBACK_EXERCISES: Exercise[] = [
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "slug": "barbell-back-squat",
    "name": "Barbell Back Squat",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Glutes",
      "Adductors",
      "Core"
    ],
    "movement_pattern": "squat",
    "equipment_category": "barbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Bar pinned across mid-traps. Stance shoulder-width with 15-30 degree toe flare. Deep 360 diaphragmatic brace.",
    "execution_cue": "Break at hips and knees simultaneously. Push floor away through mid-foot while keeping knees tracking over toes.",
    "common_mistakes": [
      "Knees collapsing inward on ascent",
      "Losing abdominal brace in the hole",
      "Heels lifting off platform"
    ],
    "biomechanical_notes": "Wider pelvic structures and longer femurs benefit from a slightly wider stance with moderate toe-out to permit depth without lumbar flexion.",
    "female_consideration": "Exhaling steadily through the sticking point rather than an excessive closed-glottis Valsalva reduces unnecessary pelvic floor strain.",
    "substitutes": [
      {
        "slug": "45-degree-leg-press",
        "reason": "Rack occupied: replicates quad volume with zero spinal axial loading"
      },
      {
        "slug": "barbell-front-squat",
        "reason": "Upper back and anterior core emphasis with more upright torso"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000011",
      "00000000-0000-0000-0000-000000000013"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000002",
    "slug": "barbell-flat-bench-press",
    "name": "Barbell Flat Bench Press",
    "primary_muscle": "Chest",
    "secondary_muscles": [
      "Front Delts",
      "Triceps"
    ],
    "movement_pattern": "horizontal_push",
    "equipment_category": "barbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Eyes under bar. Retract and depress scapulae firmly into the pad. Plant feet flat with steady leg drive tension.",
    "execution_cue": "Unrack with stacked wrists. Lower under control to mid/lower sternum with elbows tucked 45-60 degrees. Press back toward rack pins.",
    "common_mistakes": [
      "Flaring elbows perpendicular at 90 degrees",
      "Bouncing bar violently off sternum",
      "Hips lifting off bench pad"
    ],
    "biomechanical_notes": "Scapular retraction stabilizes the glenohumeral joint and places the sternal pectoral fibers under optimal active mechanical stretch.",
    "female_consideration": "A grip half-a-finger narrower than standard bar markings aligns elbow and wrist joints comfortably for narrower biacromial shoulders.",
    "substitutes": [
      {
        "slug": "incline-dumbbell-press",
        "reason": "Flat bench taken: free wrist rotation with clavicular and sternal pectoral recruitment"
      },
      {
        "slug": "dumbbell-flat-press",
        "reason": "No spotter: allows safe failure tracking and deeper eccentric stretch"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000008",
      "00000000-0000-0000-0000-000000000016"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000003",
    "slug": "barbell-conventional-deadlift",
    "name": "Barbell Conventional Deadlift",
    "primary_muscle": "Hamstrings",
    "secondary_muscles": [
      "Glutes",
      "Lower Back",
      "Upper Back",
      "Lats"
    ],
    "movement_pattern": "hinge",
    "equipment_category": "barbell",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Bar over mid-foot, one inch from shins. Hinge hips back until hands meet bar without squatting down.",
    "execution_cue": "Pull slack out of bar until clicks. Lock lats tight like squeezing oranges in armpits. Drive floor away through full foot.",
    "common_mistakes": [
      "Jerking bar abruptly without pulling slack",
      "Rounding lumbar spine under load",
      "Bar drifting forward away from shins"
    ],
    "biomechanical_notes": "Keeping the barbell path strictly vertical over the mid-foot minimizes spinal moment arm and shear forces.",
    "female_consideration": "Romanian or trap bar deadlifts provide a lower-fatigue alternative on days requiring reduced lumbar spinal loading.",
    "substitutes": [
      {
        "slug": "romanian-deadlift",
        "reason": "Platform occupied: isolates hamstring and glute stretch without floor reset fatigue"
      },
      {
        "slug": "trap-bar-deadlift",
        "reason": "Neutral grip distributes load across quads and posterior chain with reduced lumbar moment"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000006",
      "00000000-0000-0000-0000-000000000014"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000004",
    "slug": "standing-overhead-press",
    "name": "Standing Overhead Press",
    "primary_muscle": "Shoulders",
    "secondary_muscles": [
      "Triceps",
      "Upper Chest",
      "Core"
    ],
    "movement_pattern": "vertical_push",
    "equipment_category": "barbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Grip just outside shoulders with vertical forearms. Squeeze glutes and brace core rock solid.",
    "execution_cue": "Tilt head back slightly to clear chin. Press bar straight vertically, then push head forward through window at full lockout.",
    "common_mistakes": [
      "Excessive lumbar hyperextension to compensate",
      "Pressing around face in an inefficient arc",
      "Loose glutes and soft knees"
    ],
    "biomechanical_notes": "Strict vertical bar path directly over the cervical spine minimizes shoulder impingement and lower back torque.",
    "female_consideration": "Seated dumbbell overhead press accommodates individual carrying angles and allows micro-loading when barbell jumps are too large.",
    "substitutes": [
      {
        "slug": "cable-lateral-raise",
        "reason": "Rack busy: directly overloads lateral deltoids with zero spinal compression"
      },
      {
        "slug": "dumbbell-lateral-raise",
        "reason": "Quick dumbbell substitute for shoulder hypertrophy"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000009",
      "00000000-0000-0000-0000-000000000022"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000005",
    "slug": "barbell-bent-over-row",
    "name": "Barbell Bent-Over Row",
    "primary_muscle": "Upper Back",
    "secondary_muscles": [
      "Lats",
      "Biceps",
      "Rear Delts",
      "Lower Back"
    ],
    "movement_pattern": "horizontal_pull",
    "equipment_category": "barbell",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Hinge forward at hips to a 45-degree torso angle. Soft knees, neutral spine, overhand grip just outside knees.",
    "execution_cue": "Pull barbell toward lower ribcage by driving elbows back. Squeeze shoulder blades together at apex for one second.",
    "common_mistakes": [
      "Using torso momentum to yank the bar upward",
      "Allowing shoulders to roll forward at full hang",
      "Excessive standing up between reps"
    ],
    "biomechanical_notes": "Torso angle determines lat versus rhomboid recruitment; 45 degrees balances latissimus and mid-trapezius mechanical loading.",
    "female_consideration": "If lower back fatigue is present, chest-supported or seated cable row variations maintain back volume without erector fatigue.",
    "substitutes": [
      {
        "slug": "chest-supported-row",
        "reason": "Lower back fatigued: chest support eliminates spinal erector strain"
      },
      {
        "slug": "seated-cable-row",
        "reason": "Constant cable tension and upright posture for mid-back thickness"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000018",
      "00000000-0000-0000-0000-000000000019"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000006",
    "slug": "romanian-deadlift",
    "name": "Romanian Deadlift (RDL)",
    "primary_muscle": "Hamstrings",
    "secondary_muscles": [
      "Glutes",
      "Lower Back"
    ],
    "movement_pattern": "hinge",
    "equipment_category": "barbell",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Stand tall with feet hip-width apart. Soft, unlocked knees. Retract shoulder blades and lock lats tight.",
    "execution_cue": "Push hips straight backward as if tapping a wall behind you, keeping bar skimming thighs and shins. Reverse when hips stop traveling back.",
    "common_mistakes": [
      "Squatting down instead of hinging hips backward",
      "Letting bar drift forward away from legs",
      "Hyperextending lower back at top lockout"
    ],
    "biomechanical_notes": "Maintaining fixed knee angle isolates hamstring tendon stretch and gluteus maximus without quadriceps interference.",
    "female_consideration": "Outstanding movement for posterior chain resilience and pelvic balance; maintain neutral cervical alignment throughout.",
    "substitutes": [
      {
        "slug": "seated-leg-curl",
        "reason": "Hamstrings isolation with zero axial spine fatigue"
      },
      {
        "slug": "barbell-conventional-deadlift",
        "reason": "Full pull from floor for overall posterior chain strength"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000029",
      "00000000-0000-0000-0000-000000000003"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000007",
    "slug": "pull-up",
    "name": "Pull-Up",
    "primary_muscle": "Lats",
    "secondary_muscles": [
      "Biceps",
      "Upper Back",
      "Core"
    ],
    "movement_pattern": "vertical_pull",
    "equipment_category": "bodyweight",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Full grip slightly wider than shoulders. Hang with straight arms, engage core, and depress scapulae down.",
    "execution_cue": "Pull chest toward bar by driving elbows down into ribs. Clear chin over bar with control; lower to full stretch.",
    "common_mistakes": [
      "Kicking legs or kipping for momentum",
      "Cutting range of motion short at bottom stretch",
      "Shrugging shoulders into ears at top"
    ],
    "biomechanical_notes": "Full eccentric stretch down to active dead-hang stretches the latissimus dorsi under tension for superior hypertrophy.",
    "female_consideration": "Neutral-grip or resistance band assisted pull-ups provide joint-friendly options for elbow comfort.",
    "substitutes": [
      {
        "slug": "lat-pulldown",
        "reason": "Allows calibrated progressive loading or higher rep volume"
      },
      {
        "slug": "seated-cable-row",
        "reason": "Horizontal pull variation targeting lats and upper back"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000020",
      "00000000-0000-0000-0000-000000000019"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000008",
    "slug": "incline-dumbbell-press",
    "name": "Incline Dumbbell Press",
    "primary_muscle": "Chest",
    "secondary_muscles": [
      "Front Delts",
      "Triceps"
    ],
    "movement_pattern": "horizontal_push",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Set bench to 30-degree incline. Retract shoulder blades, kick dumbbells into starting position at upper chest.",
    "execution_cue": "Press upward in a gentle converging arc without clattering weights. Lower under control to a deep pectoral stretch.",
    "common_mistakes": [
      "Setting bench angle too steep above 45 degrees",
      "Flaring elbows wide perpendicular to torso",
      "Bouncing out of bottom stretch"
    ],
    "biomechanical_notes": "A 30-degree angle optimizes clavicular upper pectoral fiber recruitment while minimizing anterior deltoid sheer.",
    "female_consideration": "Independent dumbbells allow natural carrying angle and wrist rotation, avoiding wrist strain common with rigid barbells.",
    "substitutes": [
      {
        "slug": "incline-barbell-bench-press",
        "reason": "Fixed bar path for heavier top sets and progressive overload"
      },
      {
        "slug": "dumbbell-flat-press",
        "reason": "Adjustable benches occupied: flat press preserves chest stimulus"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000015",
      "00000000-0000-0000-0000-000000000016"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000009",
    "slug": "cable-lateral-raise",
    "name": "Cable Lateral Raise",
    "primary_muscle": "Shoulders",
    "secondary_muscles": [
      "Traps"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "cable",
    "difficulty": "beginner",
    "is_unilateral": true,
    "setup_cue": "Set pulley to wrist height. Stand tall with light core brace, holding cuff or handle across body.",
    "execution_cue": "Raise arm 30 degrees in front of torso in scapular plane until hand reaches shoulder level. Squeeze one second at apex.",
    "common_mistakes": [
      "Swinging torso backward for momentum",
      "Shrugging upper traps upward to heave weight",
      "Raising strictly sideways in coronal plane"
    ],
    "biomechanical_notes": "Cables maintain consistent tension throughout the lengthened starting position where dumbbells provide zero lateral load.",
    "female_consideration": "Side delts recover quickly from high frequency; responds well to 12-20 weekly sets split across push and upper sessions.",
    "substitutes": [
      {
        "slug": "dumbbell-lateral-raise",
        "reason": "Cables busy: quick free-weight alternative for lateral delts"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000022"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000010",
    "slug": "cable-tricep-pushdown",
    "name": "Cable Tricep Pushdown",
    "primary_muscle": "Triceps",
    "secondary_muscles": [
      "Forearms"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "cable",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Attach straight bar or rope at top pulley. Pin elbows tight against ribcage and lean forward slightly at hips.",
    "execution_cue": "Extend forearms downward by contracting triceps until arms are fully locked. Control the return to 90 degrees.",
    "common_mistakes": [
      "Letting elbows drift forward and backward during reps",
      "Using bodyweight to lean over the bar",
      "Cutting bottom lockout short"
    ],
    "biomechanical_notes": "Keeping upper arms stationary isolates the lateral and medial heads of the triceps brachii with zero shoulder involvement.",
    "female_consideration": "Neutral rope grip reduces wrist torque and permits a slight spread at lockout for peak triceps contraction.",
    "substitutes": [
      {
        "slug": "overhead-cable-triceps-extension",
        "reason": "Shifts emphasis to the long head of the triceps in a stretched position"
      },
      {
        "slug": "barbell-skull-crusher",
        "reason": "Free-weight compound triceps overload on flat bench"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000024",
      "00000000-0000-0000-0000-000000000025"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000011",
    "slug": "45-degree-leg-press",
    "name": "45-Degree Leg Press",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Glutes"
    ],
    "movement_pattern": "squat",
    "equipment_category": "machine",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Back and pelvis firmly against pads. Place feet shoulder-width in middle of sled platform.",
    "execution_cue": "Disengage safety, lower sled with control until knees reach 90 degrees without lower back rounding. Press through mid-foot.",
    "common_mistakes": [
      "Pelvis curling off backrest at bottom (butt wink)",
      "Locking knees with sudden hyperextension at top",
      "Placing feet too low causing heel lift"
    ],
    "biomechanical_notes": "Back support removes axial spinal compressive load, allowing lifters to train quads to high proximity to failure safely.",
    "female_consideration": "Higher foot placement increases glute recruitment, while lower platform placement emphasizes knee extension and quad growth.",
    "substitutes": [
      {
        "slug": "barbell-back-squat",
        "reason": "Free-weight compound alternative when racks become available"
      },
      {
        "slug": "leg-extension",
        "reason": "Isolates quads at knee extension with zero hip flexion"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000030"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000012",
    "slug": "standing-calf-raise",
    "name": "Standing Calf Raise",
    "primary_muscle": "Calves",
    "secondary_muscles": [
      "Ankles"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "machine",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Balls of feet on edge of platform. Shoulders braced firmly against pads, knees soft and unlocked.",
    "execution_cue": "Descend into full ankle dorsiflexion. Pause 2 seconds at bottom dead stop to eliminate Achilles elastic rebound, then press up onto big toes.",
    "common_mistakes": [
      "Bouncing quickly out of bottom stretch",
      "Bending and straightening knees to assist reps",
      "Cutting top contraction short"
    ],
    "biomechanical_notes": "A 2-second dead stop at maximum stretch dissipates passive elastic tendon energy and forces gastrocnemius muscle fibers to generate force.",
    "female_consideration": "Focus on pressing through the first metatarsal (big toe) for balanced calf and ankle alignment.",
    "substitutes": [
      {
        "slug": "45-degree-leg-press",
        "reason": "Perform calf presses on leg press sled when calf block is taken"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000011"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000013",
    "slug": "barbell-front-squat",
    "name": "Barbell Front Squat",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Glutes",
      "Upper Back",
      "Core"
    ],
    "movement_pattern": "squat",
    "equipment_category": "barbell",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Bar resting on anterior deltoids, fingertips supporting bar with high elbows parallel to floor.",
    "execution_cue": "Descend between hips with upright torso. Drive out of the hole keeping elbows pointing forward.",
    "common_mistakes": [
      "Dropping elbows forward causing bar to roll",
      "Rounding thoracic spine under front load",
      "Shifting weight onto toes"
    ],
    "biomechanical_notes": "Anterior bar placement enforces a vertical torso and produces high quadriceps recruitment with reduced lumbar spine flexion moment.",
    "female_consideration": "Cross-arm grip or wrist straps around bar accommodate lifters with tight wrist or forearm mobility.",
    "substitutes": [
      {
        "slug": "barbell-back-squat",
        "reason": "Back squat permits higher absolute loads with identical quad recruitment"
      },
      {
        "slug": "45-degree-leg-press",
        "reason": "Sled quad volume without thoracic fatigue"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000011"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000014",
    "slug": "trap-bar-deadlift",
    "name": "Trap-Bar Deadlift",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Hamstrings",
      "Glutes",
      "Lower Back",
      "Traps"
    ],
    "movement_pattern": "hinge",
    "equipment_category": "barbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Stand inside hex frame with feet hip-width. Grip neutral handles firmly, pull chest up, brace core.",
    "execution_cue": "Push floor away through mid-foot. Hips and knees extend together to stand erect with tall posture.",
    "common_mistakes": [
      "Squatting too low into knee-forward position",
      "Rounding upper spine on initial drive",
      "Leaning back excessively at lockout"
    ],
    "biomechanical_notes": "Neutral grip and central load alignment reduce lumbar shear stress while allowing high mechanical loading for strength and hypertrophy.",
    "female_consideration": "High handle orientation is accessible for lifters with limited hamstring flexibility or hip mobility.",
    "substitutes": [
      {
        "slug": "barbell-conventional-deadlift",
        "reason": "Standard straight barbell pull from floor"
      },
      {
        "slug": "romanian-deadlift",
        "reason": "Upper hamstring and glute emphasis without floor setup"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000003",
      "00000000-0000-0000-0000-000000000006"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000015",
    "slug": "incline-barbell-bench-press",
    "name": "Incline Barbell Bench Press",
    "primary_muscle": "Chest",
    "secondary_muscles": [
      "Front Delts",
      "Triceps"
    ],
    "movement_pattern": "horizontal_push",
    "equipment_category": "barbell",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Bench at 30 degrees. Retract shoulder blades, grip slightly wider than shoulders, plant feet flat.",
    "execution_cue": "Lower bar with control to upper chest collarbone line. Press upward and back slightly over shoulders.",
    "common_mistakes": [
      "Setting incline above 45 degrees shifting stress to delts",
      "Bouncing bar off clavicles",
      "Flaring elbows 90 degrees outward"
    ],
    "biomechanical_notes": "Targeted loading for the clavicular head of the pectoralis major; lower angles (30 degrees) preserve chest dominance over shoulders.",
    "female_consideration": "If shoulder impingement occurs, switch to neutral-grip dumbbells or a shallower 15-20 degree bench angle.",
    "substitutes": [
      {
        "slug": "incline-dumbbell-press",
        "reason": "Independent arms allow customized wrist angle and shoulder comfort"
      },
      {
        "slug": "barbell-flat-bench-press",
        "reason": "Flat bench for overall pectoral mechanical tension"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000008",
      "00000000-0000-0000-0000-000000000002"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000016",
    "slug": "dumbbell-flat-press",
    "name": "Dumbbell Flat Press",
    "primary_muscle": "Chest",
    "secondary_muscles": [
      "Front Delts",
      "Triceps"
    ],
    "movement_pattern": "horizontal_push",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Lie flat on bench, retract scapulae, kick dumbbells to chest, plant feet wide and rooted on floor.",
    "execution_cue": "Lower dumbbells with control until weights reach chest level at 45-degree elbow tuck. Press up smoothly.",
    "common_mistakes": [
      "Clashing dumbbells together loudly at apex",
      "Flaring elbows wide at right angles",
      "Excessive arch lifting hips off bench"
    ],
    "biomechanical_notes": "Free dumbbell pathway allows natural wrist articulation and deeper active eccentric stretch than fixed barbell.",
    "female_consideration": "Dumbbells offer micro-increments and eliminate strength imbalances between dominant and non-dominant sides.",
    "substitutes": [
      {
        "slug": "barbell-flat-bench-press",
        "reason": "Allows heavier incremental barbell micro-loading"
      },
      {
        "slug": "push-up",
        "reason": "Floor bodyweight press when all dumbbells are occupied"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000002",
      "00000000-0000-0000-0000-000000000017"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000017",
    "slug": "push-up",
    "name": "Push-Up",
    "primary_muscle": "Chest",
    "secondary_muscles": [
      "Front Delts",
      "Triceps",
      "Core"
    ],
    "movement_pattern": "horizontal_push",
    "equipment_category": "bodyweight",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Hands under shoulders, fingers spread. Body in straight rigid plank from head to heels, glutes squeezed.",
    "execution_cue": "Lower chest to one inch above floor with elbows tucked 45 degrees. Push floor away to return to top plank.",
    "common_mistakes": [
      "Sagging hips and overarching lower spine",
      "Piking hips into an inverted V",
      "Half reps without chest reaching floor"
    ],
    "biomechanical_notes": "Closed kinetic chain horizontal pressing movement that integrates scapular protraction and serratus anterior activation.",
    "female_consideration": "Elevating hands on a bench or bar modifies resistance progressively while maintaining ideal plank alignment.",
    "substitutes": [
      {
        "slug": "barbell-flat-bench-press",
        "reason": "Weighted barbell progression"
      },
      {
        "slug": "dumbbell-flat-press",
        "reason": "Scalable dumbbell loading"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000002",
      "00000000-0000-0000-0000-000000000016"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000018",
    "slug": "chest-supported-row",
    "name": "Chest-Supported Row",
    "primary_muscle": "Upper Back",
    "secondary_muscles": [
      "Lats",
      "Rear Delts",
      "Biceps"
    ],
    "movement_pattern": "horizontal_pull",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Set bench to 30 degrees. Lie chest down on pad with feet anchored, holding dumbbells with neutral grip.",
    "execution_cue": "Drive elbows back past torso, retracting shoulder blades firmly. Hold peak contraction for one second before lowering.",
    "common_mistakes": [
      "Lifting chest off pad to cheat momentum",
      "Shrugging shoulders into ears",
      "Rushing the negative without stretch"
    ],
    "biomechanical_notes": "Bench eliminates axial lower back loading, isolating thoracic mid-back musculature with zero stabilizer fatigue.",
    "female_consideration": "Permits strict failure training for upper back and rhomboids without taxing systemic recovery capacity.",
    "substitutes": [
      {
        "slug": "seated-cable-row",
        "reason": "Cable alternative maintaining upright torso"
      },
      {
        "slug": "barbell-bent-over-row",
        "reason": "Free-weight barbell pull for whole back recruitment"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000019",
      "00000000-0000-0000-0000-000000000005"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000019",
    "slug": "seated-cable-row",
    "name": "Seated Cable Row",
    "primary_muscle": "Upper Back",
    "secondary_muscles": [
      "Lats",
      "Biceps",
      "Erectors"
    ],
    "movement_pattern": "horizontal_pull",
    "equipment_category": "cable",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Sit tall with knees slightly bent. Grasp V-handle with chest upright and shoulders down and back.",
    "execution_cue": "Pull handle toward lower abdomen by leading with elbows. Squeeze shoulder blades together; return with control.",
    "common_mistakes": [
      "Swinging torso excessively forward and back",
      "Rounding lower back at full forward stretch",
      "Shrugging traps during the pull"
    ],
    "biomechanical_notes": "Constant cable tension throughout horizontal pulling trajectory allows precise target volume for mid-back thickness.",
    "female_consideration": "Maintain a steady upright spine angle; resist excessive torso momentum to keep tension on the latissimus and rhomboids.",
    "substitutes": [
      {
        "slug": "chest-supported-row",
        "reason": "Dumbbell variation anchored to incline bench"
      },
      {
        "slug": "lat-pulldown",
        "reason": "Vertical pulling angle to target lat width"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000018",
      "00000000-0000-0000-0000-000000000020"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000020",
    "slug": "lat-pulldown",
    "name": "Lat Pulldown",
    "primary_muscle": "Lats",
    "secondary_muscles": [
      "Biceps",
      "Upper Back"
    ],
    "movement_pattern": "vertical_pull",
    "equipment_category": "cable",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Adjust thigh pads snug. Grip bar slightly wider than shoulder-width with overhand or neutral grip.",
    "execution_cue": "Pull bar down to upper sternum by driving elbows toward back pockets. Squeeze lats; return under control.",
    "common_mistakes": [
      "Leaning back 45 degrees turning pulldown into a row",
      "Bouncing weight stack at the bottom",
      "Pulling bar down behind neck"
    ],
    "biomechanical_notes": "Slight 10-15 degree backward lean aligns cable trajectory with latissimus dorsi muscle fiber orientation.",
    "female_consideration": "Neutral close-grip attachment is gentle on wrist and elbow joints and allows full active lat recruitment.",
    "substitutes": [
      {
        "slug": "pull-up",
        "reason": "Bodyweight closed-chain vertical pull"
      },
      {
        "slug": "seated-cable-row",
        "reason": "Cable horizontal pull when lat station is taken"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000007",
      "00000000-0000-0000-0000-000000000019"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000021",
    "slug": "cable-face-pull",
    "name": "Cable Face Pull",
    "primary_muscle": "Shoulders",
    "secondary_muscles": [
      "Upper Back",
      "Rotator Cuff"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "cable",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Set cable pulley to eye height with rope attachment. Grip rope ends with thumbs pointing backward.",
    "execution_cue": "Pull rope toward bridge of nose, spreading ends apart as elbows flare high and back. Squeeze rear delts.",
    "common_mistakes": [
      "Using heavy momentum to lean body back",
      "Pulling downward toward chin instead of eye level",
      "Dropping elbows below wrist level"
    ],
    "biomechanical_notes": "Combines horizontal abduction and external rotation to restore scapular balance and rotator cuff health.",
    "female_consideration": "Perform with light loads and high repetitions (12-20 reps) to build postural endurance and rear shoulder stability.",
    "substitutes": [
      {
        "slug": "rear-delt-fly",
        "reason": "Dumbbell alternative for posterior deltoid and external rotation"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000023"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000022",
    "slug": "dumbbell-lateral-raise",
    "name": "Dumbbell Lateral Raise",
    "primary_muscle": "Shoulders",
    "secondary_muscles": [
      "Traps"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Stand tall with dumbbells at sides, slight hinge at hips, knees soft, core lightly engaged.",
    "execution_cue": "Raise dumbbells out in scapular plane (30 degrees forward) until hands reach shoulder height. Lower with control.",
    "common_mistakes": [
      "Using hip thrust or knee bounce to launch weights",
      "Shrugging upper traps to raise arms",
      "Rotating pinkies high into internal impingement"
    ],
    "biomechanical_notes": "Lifting in the scapular plane prevents subacromial impingement and optimizes lateral deltoid mechanical alignment.",
    "female_consideration": "Use moderate loads where form remains strict; side delts respond best to clean execution and controlled eccentrics.",
    "substitutes": [
      {
        "slug": "cable-lateral-raise",
        "reason": "Cables offer continuous resistance profile through the lengthened range"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000009"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000023",
    "slug": "rear-delt-fly",
    "name": "Rear Delt Fly",
    "primary_muscle": "Shoulders",
    "secondary_muscles": [
      "Upper Back"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Hinge forward at hips with flat back parallel to floor, or lie chest-down on an incline bench.",
    "execution_cue": "Raise dumbbells out to sides with soft elbows, leading with pinkies. Squeeze rear deltoids at top.",
    "common_mistakes": [
      "Swinging weights upward with torso extension",
      "Bending elbows past 90 degrees turning fly into a row",
      "Dropping head and rounding spine"
    ],
    "biomechanical_notes": "Transverse abduction of the shoulder joint directly targets the posterior deltoid head.",
    "female_consideration": "Keep resistance light to prevent larger rhomboids and traps from taking over the movement.",
    "substitutes": [
      {
        "slug": "cable-face-pull",
        "reason": "Cable rope attachment hits rear delts and rotator cuff with smooth resistance"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000021"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000024",
    "slug": "overhead-cable-triceps-extension",
    "name": "Overhead Cable Triceps Extension",
    "primary_muscle": "Triceps",
    "secondary_muscles": [
      "Forearms"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "cable",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Attach rope at chest height. Face away from cable in staggered stance with neutral braced spine.",
    "execution_cue": "Keep upper arms stable overhead. Extend forearms forward and flare rope ends out at full extension.",
    "common_mistakes": [
      "Swinging torso forward and back using momentum",
      "Flaring elbows excessively wide",
      "Arching lumbar spine to complete reps"
    ],
    "biomechanical_notes": "Placing the shoulder in flexion stretches the long head of the triceps brachii for enhanced stretch-mediated hypertrophy.",
    "female_consideration": "Staggered stance provides a stable pelvic base and prevents unwanted lower back extension under load.",
    "substitutes": [
      {
        "slug": "cable-tricep-pushdown",
        "reason": "Standard pushdown when overhead position causes shoulder stiffness"
      },
      {
        "slug": "overhead-dumbbell-triceps-extension",
        "reason": "Single dumbbell alternative when cable towers are full"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000010",
      "00000000-0000-0000-0000-000000000033"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000025",
    "slug": "barbell-skull-crusher",
    "name": "Barbell Skull Crusher",
    "primary_muscle": "Triceps",
    "secondary_muscles": [
      "Forearms"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "barbell",
    "difficulty": "intermediate",
    "is_unilateral": false,
    "setup_cue": "Lie flat on bench holding EZ-curl bar with narrow grip, arms angled slightly backward over head.",
    "execution_cue": "Lower bar toward crown of head or bench top by flexing elbows. Extend forearms back to starting angle.",
    "common_mistakes": [
      "Allowing elbows to flare outward away from shoulders",
      "Lowering bar directly to nose or teeth",
      "Dropping upper arms during repetition"
    ],
    "biomechanical_notes": "Angling upper arms slightly back maintains continuous tension on the triceps at the lockout position.",
    "female_consideration": "Using an EZ-curl bar reduces forearm pronation stress and protects the wrists and medial elbow tendons.",
    "substitutes": [
      {
        "slug": "cable-tricep-pushdown",
        "reason": "Cable pushdown is gentler on distal triceps tendon and elbow joint"
      },
      {
        "slug": "overhead-cable-triceps-extension",
        "reason": "Overhead extension emphasizes long head stretch"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000010",
      "00000000-0000-0000-0000-000000000024"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000026",
    "slug": "incline-dumbbell-curl",
    "name": "Incline Dumbbell Curl",
    "primary_muscle": "Biceps",
    "secondary_muscles": [
      "Forearms"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Set bench to 45-60 degrees. Sit back with shoulders against pad and arms hanging straight down.",
    "execution_cue": "Curl dumbbells upward while supinating wrists, keeping elbows pinned back. Lower slowly to full hang stretch.",
    "common_mistakes": [
      "Swinging upper arms forward to assist lift",
      "Lifting shoulders off bench pad",
      "Cutting the bottom eccentric stretch short"
    ],
    "biomechanical_notes": "Shoulder extension at the bench angle places the long head of the biceps under maximum active stretch.",
    "female_consideration": "Deep eccentric stretch delivers potent hypertrophy stimulus; keep weight manageable to prevent anterior shoulder strain.",
    "substitutes": [
      {
        "slug": "dumbbell-hammer-curl",
        "reason": "Neutral grip targets brachialis and reduces biceps tendon strain"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000027"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000027",
    "slug": "dumbbell-hammer-curl",
    "name": "Dumbbell Hammer Curl",
    "primary_muscle": "Biceps",
    "secondary_muscles": [
      "Forearms"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Stand tall with dumbbells at sides, palms facing each other in neutral grip, elbows tucked to ribs.",
    "execution_cue": "Curl weights upward keeping palms facing each other. Squeeze at top; lower with a slow 2-second eccentric.",
    "common_mistakes": [
      "Using torso sway to heave dumbbells",
      "Allowing elbows to drift forward excessively",
      "Rushing down through the eccentric phase"
    ],
    "biomechanical_notes": "Neutral forearm positioning shifts mechanical advantage toward the brachialis and brachioradialis.",
    "female_consideration": "Excellent for building arm thickness and elbow tendon resilience without wrist pronation stress.",
    "substitutes": [
      {
        "slug": "incline-dumbbell-curl",
        "reason": "Incline bench angle places long head of biceps under maximal stretch"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000026"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000028",
    "slug": "bulgarian-split-squat",
    "name": "Bulgarian Split Squat",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Glutes",
      "Hamstrings",
      "Core"
    ],
    "movement_pattern": "lunge",
    "equipment_category": "dumbbell",
    "difficulty": "intermediate",
    "is_unilateral": true,
    "setup_cue": "Place laces of rear foot on bench behind you. Front foot forward enough so shin stays nearly vertical at bottom.",
    "execution_cue": "Lower hips straight down until back knee hovers above floor. Drive through front heel to stand.",
    "common_mistakes": [
      "Front foot placed too close causing excessive heel lift",
      "Collapsing torso forward over thigh",
      "Allowing front knee to cave inward"
    ],
    "biomechanical_notes": "Unilateral stance resolves quad and glute imbalances while challenging pelvic and hip stabilizer musculature.",
    "female_consideration": "Slight forward torso lean shifts emphasis onto gluteus maximus, while upright torso loads quadriceps.",
    "substitutes": [
      {
        "slug": "dumbbell-walking-lunge",
        "reason": "Dynamic unilateral alternative with active hip drive"
      },
      {
        "slug": "45-degree-leg-press",
        "reason": "Bilateral machine option when balance or stabilizer fatigue is limiting"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000031",
      "00000000-0000-0000-0000-000000000011"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000029",
    "slug": "seated-leg-curl",
    "name": "Seated Leg Curl",
    "primary_muscle": "Hamstrings",
    "secondary_muscles": [
      "Calves"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "machine",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Knee axis aligned with machine pivot. Thigh pad locked firmly over lower quads, ankle pad resting above heels.",
    "execution_cue": "Curl heels down and back under seat by contracting hamstrings. Pause 1 second at peak contraction; return smoothly.",
    "common_mistakes": [
      "Thigh pad loose allowing hips to lift",
      "Kicking heels violently with momentum",
      "Cutting the top stretch short"
    ],
    "biomechanical_notes": "Seated hip flexion stretches the biarticular hamstring heads, generating superior hypertrophy compared to lying leg curls.",
    "female_consideration": "Lean slightly forward at the hips to place hamstrings under greater stretch throughout full range of motion.",
    "substitutes": [
      {
        "slug": "romanian-deadlift",
        "reason": "Compound hinge stretch for hamstrings and glutes"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000006"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000030",
    "slug": "leg-extension",
    "name": "Leg Extension",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Ankles"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "machine",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Back against pad with knee joint aligned with machine pivot point. Ankle pad resting on lower shins.",
    "execution_cue": "Extend legs upward until knees are fully extended without slamming machine. Pause 1 second; lower under control.",
    "common_mistakes": [
      "Swinging weight stack with hip thrusting",
      "Butt peeling off seat during concentric",
      "Dropping weights rapidly without negative control"
    ],
    "biomechanical_notes": "The only movement that heavily loads the rectus femoris in shortened position without hip flexion involvement.",
    "female_consideration": "Hold top contraction for 1 second; avoids shearing stress by using controlled, steady tempo over explosive kicks.",
    "substitutes": [
      {
        "slug": "45-degree-leg-press",
        "reason": "Compound quad leg press with zero lower back strain"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000011"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000031",
    "slug": "dumbbell-walking-lunge",
    "name": "Dumbbell Walking Lunge",
    "primary_muscle": "Quads",
    "secondary_muscles": [
      "Glutes",
      "Hamstrings",
      "Calves",
      "Core"
    ],
    "movement_pattern": "lunge",
    "equipment_category": "dumbbell",
    "difficulty": "intermediate",
    "is_unilateral": true,
    "setup_cue": "Hold dumbbells at sides with tall posture, chest up, and core braced.",
    "execution_cue": "Step forward into a long stride, lowering back knee toward floor. Drive through front heel to step smoothly into next stride.",
    "common_mistakes": [
      "Short stride causing front heel to peel up",
      "Letting front knee collapse inward",
      "Hunching upper back forward"
    ],
    "biomechanical_notes": "Dynamic deceleration and unilateral hip extension build functional knee stability and glute strength.",
    "female_consideration": "Focus on smooth forward momentum and stable foot tracking; adjust stride length to emphasize quad versus glute recruitment.",
    "substitutes": [
      {
        "slug": "bulgarian-split-squat",
        "reason": "Stationary rear-foot elevated split squat on bench"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000028"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000032",
    "slug": "incline-dumbbell-crush-press",
    "name": "Incline DB Crush Press",
    "primary_muscle": "Chest",
    "secondary_muscles": [
      "Triceps",
      "Front Delts"
    ],
    "movement_pattern": "horizontal_push",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Set bench to 30 degrees. Hold dumbbells pressed together directly over chest with neutral grip.",
    "execution_cue": "Maintain continuous inward pressure squeezing dumbbells together while lowering to chest and pressing back up.",
    "common_mistakes": [
      "Separating dumbbells during the rep",
      "Flaring elbows wide",
      "Releasing inward squeezing tension"
    ],
    "biomechanical_notes": "Constant adduction force increases pectoral inner fiber recruitment throughout the entire range of motion.",
    "female_consideration": "Gentle on shoulder joints due to neutral grip and sustained isometric adduction.",
    "substitutes": [
      {
        "slug": "incline-dumbbell-press",
        "reason": "Standard dumbbell press with standard neutral or pronated grip"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000008"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000033",
    "slug": "overhead-dumbbell-triceps-extension",
    "name": "Overhead DB Triceps Ext",
    "primary_muscle": "Triceps",
    "secondary_muscles": [
      "Forearms"
    ],
    "movement_pattern": "isolation",
    "equipment_category": "dumbbell",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Sit tall or stand with one dumbbell held vertically with both hands forming a diamond under the top weight plate.",
    "execution_cue": "Lower dumbbell behind head by flexing elbows, keeping upper arms vertical. Extend forearms to press weight back overhead.",
    "common_mistakes": [
      "Flaring elbows outward away from head",
      "Hyperextending lower spine under weight",
      "Dropping dumbbell too fast behind neck"
    ],
    "biomechanical_notes": "Two-handed dumbbell grip allows stable overhead triceps extension with minimal equipment during peak gym hours.",
    "female_consideration": "Perform seated with back support if maintaining lumbar neutral while standing is challenging.",
    "substitutes": [
      {
        "slug": "overhead-cable-triceps-extension",
        "reason": "Cable rope alternative offering consistent tension through full ROM"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000024"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000034",
    "slug": "90-90-hip-flow",
    "name": "90/90 Hip Flow",
    "primary_muscle": "Hips",
    "secondary_muscles": [
      "Glutes",
      "Core"
    ],
    "movement_pattern": "mobility",
    "equipment_category": "bodyweight",
    "difficulty": "beginner",
    "is_unilateral": true,
    "setup_cue": "Sit on floor with lead leg bent 90 degrees in front and trail leg bent 90 degrees to side.",
    "execution_cue": "Sit tall, hinging forward over front shin for stretch, then rotate through center into opposite 90/90 position.",
    "common_mistakes": [
      "Slouching spine instead of hinging from hips",
      "Forcing internal rotation through knee discomfort",
      "Holding breath"
    ],
    "biomechanical_notes": "Active hip capsular mobility drill improving internal and external rotation without joint impingement.",
    "female_consideration": "Excellent warm-up or recovery flow to open hip capsule prior to squatting or deadlifting.",
    "substitutes": [
      {
        "slug": "couch-stretch",
        "reason": "Target anterior hip flexor and psoas release"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000036"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000035",
    "slug": "thoracic-spine-foam-roller-opener",
    "name": "Thoracic Spine Foam Roller Opener",
    "primary_muscle": "Thoracic",
    "secondary_muscles": [
      "Upper Back",
      "Chest"
    ],
    "movement_pattern": "mobility",
    "equipment_category": "bodyweight",
    "difficulty": "beginner",
    "is_unilateral": false,
    "setup_cue": "Lie with foam roller across upper-mid back, hands supporting head, hips resting on floor.",
    "execution_cue": "Gently extend upper spine back over roller on an exhale. Hold 2 seconds, then return to neutral.",
    "common_mistakes": [
      "Hyperextending lumbar spine instead of upper back",
      "Pulling violently on neck with hands",
      "Rolling onto lower back"
    ],
    "biomechanical_notes": "Fosters thoracic extension necessary for safe overhead pressing and deep barbell back squat posture.",
    "female_consideration": "Keep hips grounded and support head gently to ensure mobility occurs across thoracic segments only.",
    "substitutes": [
      {
        "slug": "90-90-hip-flow",
        "reason": "Active restorative mobility drill"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000034"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000036",
    "slug": "couch-stretch",
    "name": "Couch Stretch (Hip Flexors)",
    "primary_muscle": "Hips",
    "secondary_muscles": [
      "Quads",
      "Core"
    ],
    "movement_pattern": "mobility",
    "equipment_category": "bodyweight",
    "difficulty": "beginner",
    "is_unilateral": true,
    "setup_cue": "Back knee against wall or bench with shin vertical. Step front leg forward into a 90-degree lunge.",
    "execution_cue": "Squeeze glute on trailing leg and gently drive hip forward with upright torso. Breathe deeply.",
    "common_mistakes": [
      "Hyperextending lower back to fake hip extension",
      "Relaxing trail glute",
      "Pushing through sharp knee pain"
    ],
    "biomechanical_notes": "Mobilizes psoas and rectus femoris, relieving anterior pelvic tilt and hip tightness from sedentary periods.",
    "female_consideration": "Place a soft mat under the knee; engage trailing glute to ensure genuine hip flexor stretch.",
    "substitutes": [
      {
        "slug": "90-90-hip-flow",
        "reason": "Restorative hip rotational capsule flow"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000034"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000037",
    "slug": "banded-ankle-mobilization",
    "name": "Banded Ankle Mobilization",
    "primary_muscle": "Ankles",
    "secondary_muscles": [
      "Calves"
    ],
    "movement_pattern": "mobility",
    "equipment_category": "band",
    "difficulty": "beginner",
    "is_unilateral": true,
    "setup_cue": "Loop thick resistance band around talus bone below ankle joint, anchored behind you. Foot on elevated box or floor.",
    "execution_cue": "Drive knee forward over mid-toes against band tension while keeping heel firmly pinned to surface.",
    "common_mistakes": [
      "Letting heel peel up off surface",
      "Placing band too high on shin bone",
      "Knee caving inward during lunge"
    ],
    "biomechanical_notes": "Posterior glide of the talus bone directly increases active ankle dorsiflexion, facilitating deeper, upright squats.",
    "female_consideration": "Ideal warm-up primer for lifters with limited ankle dorsiflexion or tight calves.",
    "substitutes": [
      {
        "slug": "standing-calf-raise",
        "reason": "Eccentric calf lower to lengthen Achilles tendon and improve dorsiflexion"
      }
    ],
    "substitute_exercise_ids": [
      "00000000-0000-0000-0000-000000000012"
    ],
    "is_system": true,
    "created_at": "2026-01-01T00:00:00Z"
  }
];

export const ExerciseRepository = {
  /**
   * List all exercises (alias for getExercises).
   */
  async list(rawFilter?: ValidatedExerciseFilter): Promise<Exercise[]> {
    return this.getExercises(rawFilter);
  },

  /**
   * Fetch exercises with optional muscle, equipment, or text filter.
   */
  async getExercises(rawFilter?: ValidatedExerciseFilter): Promise<Exercise[]> {
    const filter = rawFilter ? ExerciseFilterSchema.parse(rawFilter) : undefined;

    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        let query = supabase.from('exercises').select('*').order('name', { ascending: true });

        if (filter?.muscle) {
          query = query.eq('primary_muscle', filter.muscle);
        }
        if (filter?.movement_pattern) {
          query = query.eq('movement_pattern', filter.movement_pattern);
        }
        if (filter?.equipment) {
          query = query.eq('equipment_category', filter.equipment);
        }
        if (filter?.query) {
          query = query.ilike('name', `%${filter.query}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[ExerciseRepository.getExercises] Falling back to local library:', err);
      }
    }

    // Filter fallback library in-memory
    return FALLBACK_EXERCISES.filter((ex) => {
      if (filter?.muscle && ex.primary_muscle.toLowerCase() !== filter.muscle.toLowerCase()) {
        return false;
      }
      if (filter?.movement_pattern && ex.movement_pattern !== filter.movement_pattern) {
        return false;
      }
      if (filter?.equipment && ex.equipment_category !== filter.equipment) {
        return false;
      }
      if (filter?.query && !ex.name.toLowerCase().includes(filter.query.toLowerCase())) {
        return false;
      }
      return true;
    });
  },

  /**
   * Get exercise detail by ID or Slug.
   */
  async getExerciseById(idOrSlug: string): Promise<Exercise | null> {
    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[ExerciseRepository.getExerciseById] Falling back:', err);
      }
    }

    return (
      FALLBACK_EXERCISES.find((ex) => ex.id === idOrSlug || ex.slug === idOrSlug) || null
    );
  },

  /**
   * Relational Exercise Substitutes:
   * Queries the dedicated `exercise_substitutes` has-many relational table
   * joining the related substitute exercises and coaches reasons.
   */
  async getRelationalSubstitutes(exerciseId: string): Promise<EnrichedSubstitute[]> {
    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        // Query the has-many relation with joined substitute exercise row
        const { data, error } = await supabase
          .from('exercise_substitutes')
          .select(`
            id,
            substitute_id,
            reason,
            stimulus_match_rating,
            substitute:exercises!substitute_id (
              id,
              name,
              primary_muscle,
              movement_pattern,
              equipment_category
            )
          `)
          .eq('exercise_id', exerciseId);

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            substitute_id: item.substitute_id,
            name: item.substitute?.name || 'Alternative Exercise',
            primary_muscle: item.substitute?.primary_muscle || '',
            movement_pattern: item.substitute?.movement_pattern || '',
            equipment_category: item.substitute?.equipment_category || '',
            reason: item.reason,
            stimulus_match_rating: item.stimulus_match_rating ?? 1.0,
          }));
        }
      } catch (err) {
        console.warn('[ExerciseRepository.getRelationalSubstitutes] Falling back to schema/movement matching:', err);
      }
    }

    // Fallback: Check in-memory exercise substitute mapping or matching movement pattern
    const original = await this.getExerciseById(exerciseId);
    if (!original) return [];

    const enriched: EnrichedSubstitute[] = [];

    // Check JSON/Array substitutes if present
    if (Array.isArray(original.substitutes)) {
      for (const sub of original.substitutes as any[]) {
        if (sub?.name || sub?.exercise_id) {
          enriched.push({
            id: sub.exercise_id || sub.id || 'fallback-sub',
            substitute_id: sub.exercise_id || sub.id || 'fallback-sub',
            name: sub.name,
            primary_muscle: original.primary_muscle,
            movement_pattern: original.movement_pattern,
            equipment_category: 'alternative',
            reason: sub.reason || 'Stimulus-equivalent alternative',
            stimulus_match_rating: 0.95,
          });
        }
      }
    }

    // If none found in array, match exercises with the same movement pattern & primary muscle
    if (enriched.length === 0) {
      const all = await this.getExercises();
      const matching = all.filter(
        (c) =>
          c.id !== original.id &&
          c.movement_pattern === original.movement_pattern &&
          c.primary_muscle === original.primary_muscle
      );

      for (const match of matching) {
        enriched.push({
          id: match.id,
          substitute_id: match.id,
          name: match.name,
          primary_muscle: match.primary_muscle,
          movement_pattern: match.movement_pattern,
          equipment_category: match.equipment_category,
          reason: `Matches ${original.movement_pattern} pattern with ${match.equipment_category} equipment.`,
          stimulus_match_rating: 0.9,
        });
      }
    }

    return enriched;
  },

  /**
   * Gym Floor quick substitution: returns substitute exercise records directly.
   */
  async getSubstitutes(exerciseId: string): Promise<Exercise[]> {
    const relational = await this.getRelationalSubstitutes(exerciseId);
    if (relational.length > 0) {
      const ids = relational.map((r) => r.substitute_id);
      const all = await this.getExercises();
      const direct = all.filter((e) => ids.includes(e.id));
      if (direct.length > 0) return direct;
    }

    const original = await this.getExerciseById(exerciseId);
    if (!original) return [];

    const all = await this.getExercises();
    return all.filter(
      (candidate) =>
        candidate.id !== original.id &&
        candidate.movement_pattern === original.movement_pattern &&
        candidate.primary_muscle === original.primary_muscle
    );
  },

  /**
   * Add a new relational substitute to the database (has-many relation).
   */
  async addSubstituteRelation(params: {
    exercise_id: string;
    substitute_id: string;
    reason: string;
    stimulus_match_rating?: number;
  }): Promise<ExerciseSubstituteRelation | null> {
    if (isSupabaseConfigured && onlineManager.isOnline()) {
      try {
        const { data, error } = await (supabase
          .from('exercise_substitutes') as any)
          .upsert({
            exercise_id: params.exercise_id,
            substitute_id: params.substitute_id,
            reason: params.reason,
            stimulus_match_rating: params.stimulus_match_rating ?? 1.0,
          })
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[ExerciseRepository.addSubstituteRelation] Error:', err);
      }
    }
    return null;
  },
};

export const listExercises = (rawFilter?: ValidatedExerciseFilter) => ExerciseRepository.getExercises(rawFilter);
