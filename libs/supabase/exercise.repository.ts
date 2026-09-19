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
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    primary_muscle: 'Quads',
    secondary_muscles: ['Glutes', 'Adductors', 'Core'],
    movement_pattern: 'squat',
    equipment_category: 'barbell',
    difficulty: 'beginner',
    is_unilateral: false,
    setup_cue: 'Bar pinned across mid-traps or rear delts. Set stance shoulder-width with slight 15-30° toe flare.',
    execution_cue: 'Take 360° diaphragmatic breath, brace core rigid. Break at hips and knees simultaneously, driving out of the hole with an upright chest.',
    common_mistakes: ['Knees caving inward on ascent', 'Losing core brace in the hole', 'Heels lifting off the platform'],
    biomechanical_notes: 'Lifters with wider pelvises or longer femurs often benefit from a slightly wider stance to allow deep hip flexion without lumbar rounding.',
    female_consideration: 'Pelvic floor awareness: exhaling through the sticking point rather than holding maximal Valsalva minimizes intra-abdominal pressure spikes. Responds well to higher rep volumes (8-12 reps).',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000011', name: 'Leg Press', reason: 'Squat rack taken: replicates quad volume with zero axial spine fatigue.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000011'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'barbell-flat-bench-press',
    name: 'Barbell Flat Bench Press',
    primary_muscle: 'Chest',
    secondary_muscles: ['Front Delts', 'Triceps'],
    movement_pattern: 'horizontal_push',
    equipment_category: 'barbell',
    difficulty: 'beginner',
    is_unilateral: false,
    setup_cue: 'Retract and depress scapulae firmly into the bench. Plant feet flat with steady leg drive tension.',
    execution_cue: 'Unrack with stacked wrists. Lower under control to lower sternum at a 45-60° elbow tuck, press in a slight arc back over shoulders.',
    common_mistakes: ['Elbows flared perpendicular at 90°', 'Bouncing bar off sternum', 'Hips lifting off the bench'],
    biomechanical_notes: 'Scapular retraction stabilizes the glenohumeral joint and places pectoralis major in an optimal stretch-shortening cycle.',
    female_consideration: 'Lighter baseline upper body absolute loads benefit significantly from 1-1.25kg fractional plates or dumbbell variations to prevent multi-week stalls.',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000008', name: 'Incline Dumbbell Press', reason: 'Flat bench occupied: stimulates upper and mid chest with free wrist rotation.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000008'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    slug: 'barbell-conventional-deadlift',
    name: 'Conventional Deadlift',
    primary_muscle: 'Hamstrings',
    secondary_muscles: ['Glutes', 'Erectors', 'Upper Back', 'Lats'],
    movement_pattern: 'hinge',
    equipment_category: 'barbell',
    difficulty: 'intermediate',
    is_unilateral: false,
    setup_cue: 'Bar over mid-foot, 1 inch from shins. Hinge hips back to grip bar without squatting down.',
    execution_cue: 'Pull slack out of the bar until it clicks. Brace lats tight like squeezing oranges in armpits. Drive floor away through mid-foot.',
    common_mistakes: ['Jerking bar without pulling slack', 'Rounding lumbar spine under heavy load', 'Bar drifting forward away from shins'],
    biomechanical_notes: 'Keeps shear forces minimal when the barbell stays directly over the mid-foot balance point.',
    female_consideration: 'Trap bar deadlift or Romanian deadlift is often preferred on high-fatigue cycle days to reduce lumbar strain while preserving posterior chain hypertrophy stimulus.',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000006', name: 'Romanian Deadlift (RDL)', reason: 'Floor deadlift area crowded: provides identical hamstring and glute hypertrophy with less CNS fatigue.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000006'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    slug: 'overhead-barbell-press',
    name: 'Standing Overhead Press',
    primary_muscle: 'Shoulders',
    secondary_muscles: ['Triceps', 'Upper Chest', 'Core'],
    movement_pattern: 'vertical_push',
    equipment_category: 'barbell',
    difficulty: 'beginner',
    is_unilateral: false,
    setup_cue: 'Grip just outside shoulders, forearms vertical. Squeeze glutes and brace core rock solid.',
    execution_cue: 'Clear chin by leaning head back slightly, press vertically in straight line, push head forward through window at full lockout.',
    common_mistakes: ['Excessive lumbar hyperextension', 'Pressing around the face in a wide loop', 'Loose glutes and core'],
    biomechanical_notes: 'Strict vertical bar path minimizes shoulder anterior impingement and lower back torque.',
    female_consideration: 'Seated dumbbell overhead press provides superior shoulder joint alignment and allows fine-grained micro-loading when overhead barbell jumps are too large.',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000009', name: 'Cable Lateral Raise', reason: 'Shoulder press rack taken: isolates lateral deltoid heads without spinal compression.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000009'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    slug: 'incline-dumbbell-bench-press',
    name: 'Incline Dumbbell Press',
    primary_muscle: 'Chest',
    secondary_muscles: ['Front Delts', 'Triceps'],
    movement_pattern: 'horizontal_push',
    equipment_category: 'dumbbell',
    difficulty: 'beginner',
    is_unilateral: false,
    setup_cue: 'Set adjustable bench to 30 degrees. Retract shoulder blades, kick dumbbells into starting position at chest.',
    execution_cue: 'Press upward with slight natural inward convergence without clashing dumbbells. Lower under control to a deep stretch.',
    common_mistakes: ['Bench set too steep above 45°', 'Excessive elbow flaring', 'Clashing weights at top'],
    biomechanical_notes: '30° angle optimizes clavicular pectoralis activation while reducing anterior deltoid shear.',
    female_consideration: 'Independent dumbbells allow natural carrying angle and wrist rotation, ideal for lifters experiencing wrist or elbow discomfort with straight barbells.',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000002', name: 'Barbell Flat Bench Press', reason: 'Dumbbells occupied: swap to barbell bench with 10% lower total volume.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000002'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    primary_muscle: 'Hamstrings',
    secondary_muscles: ['Glutes', 'Lower Back'],
    movement_pattern: 'hinge',
    equipment_category: 'barbell',
    difficulty: 'intermediate',
    is_unilateral: false,
    setup_cue: 'Stand tall with soft, unlocked knees. Retract shoulder blades and lock lats tight.',
    execution_cue: 'Push hips straight back toward wall behind you, skimming shins with bar. Reverse immediately once hips stop moving backward.',
    common_mistakes: ['Squatting down instead of hinging hips back', 'Allowing bar to drift forward away from legs', 'Hyperextending spine at top lockout'],
    biomechanical_notes: 'Maintaining static knee flexion keeps the stretch focused on hamstring origin and gluteus maximus.',
    female_consideration: 'Premier hamstring and glute hypertrophy movement. Highly recommended for pelvic stability and hip strength without high spinal loading.',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000003', name: 'Conventional Deadlift', reason: 'Target high-load strength when platforms are open.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000003'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    slug: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    primary_muscle: 'Shoulders',
    secondary_muscles: ['Traps'],
    movement_pattern: 'isolation',
    equipment_category: 'cable',
    difficulty: 'beginner',
    is_unilateral: true,
    setup_cue: 'Set pulley to wrist or hip height. Stand tall, brace core, hold handle with slight internal lean.',
    execution_cue: 'Raise arm 30° in front of body (scapular plane) until hand reaches shoulder level. Lower with a slow 2-second eccentric.',
    common_mistakes: ['Using torso momentum or swinging', 'Shrugging traps upward to lift weight', 'Flaring arm strictly sideways into impingement plane'],
    biomechanical_notes: 'Cable provides uniform tension at bottom stretch where dumbbells produce zero lateral torque.',
    female_consideration: 'High work capacity: lateral delts recover quickly and tolerate 12-20 weekly sets across 2-3 sessions.',
    substitutes: [],
    substitute_exercise_ids: [],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    slug: 'leg-press-45',
    name: '45-Degree Leg Press',
    primary_muscle: 'Quads',
    secondary_muscles: ['Glutes'],
    movement_pattern: 'squat',
    equipment_category: 'machine',
    difficulty: 'beginner',
    is_unilateral: false,
    setup_cue: 'Position back firmly against pad. Feet shoulder-width in middle of sled.',
    execution_cue: 'Release safety, lower sled slowly until knees reach 90 degrees without lower back peeling off pad. Press through mid-foot without locking knees.',
    common_mistakes: ['Lower back rounding off backrest at bottom (butt wink)', 'Locking knees abruptly at top'],
    biomechanical_notes: 'Back support eliminates axial spine loading, allowing high-intensity quad overload to true failure.',
    female_consideration: 'Adjust foot placement higher for greater glute emphasis or lower for quad bias. Safe to train within 1-2 RIR without need for spotter.',
    substitutes: [
      { exercise_id: '00000000-0000-0000-0000-000000000001', name: 'Barbell Back Squat', reason: 'Switch to free-weight squat when rack is available.' }
    ],
    substitute_exercise_ids: ['00000000-0000-0000-0000-000000000001'],
    is_system: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const ExerciseRepository = {
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
