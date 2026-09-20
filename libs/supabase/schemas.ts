import { z } from 'zod';

export const SetTypeSchema = z.enum(['warmup', 'working', 'drop', 'failure', 'cluster', 'rest_pause']);
export const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'elite']);
export const GoalTypeSchema = z.enum(['hypertrophy', 'strength', 'recomp', 'fat_loss', 'general_fitness']);
export const UnitSystemSchema = z.enum(['metric', 'imperial']);

export const SetInsertSchema = z.object({
  id: z.string().optional(),
  session_id: z.string().min(1),
  user_id: z.string().min(1),
  exercise_id: z.string().min(1),
  set_number: z.number().int().positive(),
  set_type: SetTypeSchema.default('working'),
  weight_kg: z.number().min(0).max(1000),
  reps: z.number().int().min(0).max(200),
  target_reps: z.number().int().min(0).max(200).nullable().optional(),
  target_weight_kg: z.number().min(0).max(1000).nullable().optional(),
  tempo: z.string().max(20).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  rir: z.number().int().min(0).max(10).nullable().optional(),
  rest_time_seconds: z.number().int().min(0).max(1800).nullable().optional(),
  is_completed: z.boolean().default(true),
  is_pr: z.boolean().default(false),
});

export const SetUpdateSchema = SetInsertSchema.partial().omit({
  id: true,
  session_id: true,
  user_id: true,
});

export const SessionInsertSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1),
  program_id: z.string().min(1).nullable().optional(),
  program_day_id: z.string().min(1).nullable().optional(),
  name: z.string().max(120).optional().default('Untitled session'),
  status: z.enum(['in_progress', 'completed', 'abandoned', 'active_rest']).default('in_progress'),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  duration_seconds: z.number().int().min(0).nullable().optional(),
  total_tonnage_kg: z.number().min(0).optional(),
  readiness_score_at_start: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  is_timeboxed: z.boolean().default(false),
  is_crowded_gym_mode: z.boolean().default(false),
});

export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(2).max(60).optional(),
  experience_level: ExperienceLevelSchema.optional(),
  primary_goal: GoalTypeSchema.optional(),
  preferred_units: UnitSystemSchema.optional(),
  default_bar_weight_kg: z.number().min(0).max(50).optional(),
  default_rest_seconds: z.number().int().min(15).max(600).optional(),
  cycle_tracking_enabled: z.boolean().optional(),
});

export const ExerciseSubstituteSchema = z.object({
  id: z.string().uuid().optional(),
  exercise_id: z.string().uuid(),
  substitute_id: z.string().uuid(),
  reason: z.string().min(1),
  stimulus_match_rating: z.number().min(0).max(1).default(1.0),
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  primary_muscle: z.string(),
  secondary_muscles: z.array(z.string()).default([]),
  movement_pattern: z.string(),
  equipment_category: z.string(),
  difficulty: ExperienceLevelSchema,
  is_unilateral: z.boolean().default(false),
  setup_cue: z.string(),
  execution_cue: z.string(),
  common_mistakes: z.array(z.string()).default([]),
  biomechanical_notes: z.string().nullable().optional(),
  female_consideration: z.string().nullable().optional(),
  is_system: z.boolean().default(true),
  created_at: z.string().optional(),
});

export const ExerciseFilterSchema = z.object({
  muscle: z.string().optional(),
  movement_pattern: z.string().optional(),
  equipment: z.string().optional(),
  difficulty: ExperienceLevelSchema.optional(),
  query: z.string().optional(),
});

export type ValidatedSetInsert = z.input<typeof SetInsertSchema>;
export type ValidatedSetUpdate = z.input<typeof SetUpdateSchema>;
export type ValidatedSessionInsert = z.input<typeof SessionInsertSchema>;
export type ValidatedProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type ValidatedExerciseSubstitute = z.infer<typeof ExerciseSubstituteSchema>;
export type ValidatedExercise = z.infer<typeof ExerciseSchema>;
export type ValidatedExerciseFilter = z.infer<typeof ExerciseFilterSchema>;
