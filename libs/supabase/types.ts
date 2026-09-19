/**
 * IRONMATE SUPABASE DATABASE TYPES
 * Self-contained typed schema definition for Expo React Native and Web.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type GoalType = 'hypertrophy' | 'strength' | 'recomp' | 'fat_loss' | 'general_fitness';
export type UnitSystem = 'metric' | 'imperial';
export type EquipmentType = 'commercial_gym' | 'home_barbell' | 'dumbbells_only' | 'hotel_minimalist' | 'calisthenics';
export type SetType = 'warmup' | 'working' | 'drop' | 'failure' | 'cluster' | 'rest_pause';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned' | 'active_rest';
export type SessionGrade = 'A_plus' | 'A' | 'B_plus' | 'B' | 'C' | 'deload';
export type PrType = 'weight_pr' | 'rep_pr' | 'e1rm_pr' | 'volume_pr';
export type ChallengeType = 'coop_tonnage' | 'weekly_consistency' | 'streak_milestone';
export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_annual' | 'pro_lifetime';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string;
          avatar_url: string | null;
          experience_level: ExperienceLevel;
          primary_goal: GoalType;
          preferred_units: UnitSystem;
          default_bar_weight_kg: number;
          default_rest_seconds: number;
          cycle_tracking_enabled: boolean;
          cycle_phase: string | null;
          current_streak_days: number;
          longest_streak_days: number;
          last_active_date: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name: string;
          avatar_url?: string | null;
          experience_level?: ExperienceLevel;
          primary_goal?: GoalType;
          preferred_units?: UnitSystem;
          default_bar_weight_kg?: number;
          default_rest_seconds?: number;
          cycle_tracking_enabled?: boolean;
          cycle_phase?: string | null;
          current_streak_days?: number;
          longest_streak_days?: number;
          last_active_date?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          experience_level?: ExperienceLevel;
          primary_goal?: GoalType;
          preferred_units?: UnitSystem;
          default_bar_weight_kg?: number;
          default_rest_seconds?: number;
          cycle_tracking_enabled?: boolean;
          cycle_phase?: string | null;
          current_streak_days?: number;
          longest_streak_days?: number;
          last_active_date?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      equipment_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          equipment_type: EquipmentType;
          available_plates: number[];
          has_barbells: boolean;
          has_dumbbells: boolean;
          max_dumbbell_weight_kg: number;
          has_cables: boolean;
          has_machines: boolean;
          has_squat_rack: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          equipment_type?: EquipmentType;
          available_plates?: number[];
          has_barbells?: boolean;
          has_dumbbells?: boolean;
          max_dumbbell_weight_kg?: number;
          has_cables?: boolean;
          has_machines?: boolean;
          has_squat_rack?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          equipment_type?: EquipmentType;
          available_plates?: number[];
          has_barbells?: boolean;
          has_dumbbells?: boolean;
          max_dumbbell_weight_kg?: number;
          has_cables?: boolean;
          has_machines?: boolean;
          has_squat_rack?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          slug: string;
          name: string;
          primary_muscle: string;
          secondary_muscles: string[];
          movement_pattern: string;
          equipment_category: string;
          difficulty: ExperienceLevel;
          is_unilateral: boolean;
          setup_cue: string;
          execution_cue: string;
          common_mistakes: Json;
          biomechanical_notes: string | null;
          female_consideration: string | null;
          substitutes: Json;
          substitute_exercise_ids: string[] | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          primary_muscle: string;
          secondary_muscles?: string[];
          movement_pattern: string;
          equipment_category: string;
          difficulty?: ExperienceLevel;
          is_unilateral?: boolean;
          setup_cue?: string;
          execution_cue?: string;
          common_mistakes?: Json;
          biomechanical_notes?: string | null;
          female_consideration?: string | null;
          substitutes?: Json;
          substitute_exercise_ids?: string[] | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          primary_muscle?: string;
          secondary_muscles?: string[];
          movement_pattern?: string;
          equipment_category?: string;
          difficulty?: ExperienceLevel;
          is_unilateral?: boolean;
          setup_cue?: string;
          execution_cue?: string;
          common_mistakes?: Json;
          biomechanical_notes?: string | null;
          female_consideration?: string | null;
          substitutes?: Json;
          substitute_exercise_ids?: string[] | null;
          is_system?: boolean;
          created_at?: string;
        };
      };
      exercise_substitutes: {
        Row: {
          id: string;
          exercise_id: string;
          substitute_id: string;
          reason: string;
          stimulus_match_rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          exercise_id: string;
          substitute_id: string;
          reason: string;
          stimulus_match_rating?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          exercise_id?: string;
          substitute_id?: string;
          reason?: string;
          stimulus_match_rating?: number;
          created_at?: string;
        };
      };
      exercise_videos: {
        Row: {
          id: string;
          exercise_id: string;
          demonstrator_gender: string;
          video_url: string;
          thumbnail_url: string | null;
          aspect_ratio: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          exercise_id: string;
          demonstrator_gender?: string;
          video_url: string;
          thumbnail_url?: string | null;
          aspect_ratio?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          exercise_id?: string;
          demonstrator_gender?: string;
          video_url?: string;
          thumbnail_url?: string | null;
          aspect_ratio?: string;
          created_at?: string;
        };
      };
      programs: {
        Row: {
          id: string;
          creator_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          target_goal: GoalType;
          days_per_week: number;
          split_type: string;
          experience_level: ExperienceLevel;
          total_weeks: number;
          is_public: boolean;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          target_goal?: GoalType;
          days_per_week: number;
          split_type: string;
          experience_level?: ExperienceLevel;
          total_weeks?: number;
          is_public?: boolean;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          target_goal?: GoalType;
          days_per_week?: number;
          split_type?: string;
          experience_level?: ExperienceLevel;
          total_weeks?: number;
          is_public?: boolean;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          program_id: string | null;
          program_day_id: string | null;
          name: string;
          status: SessionStatus;
          started_at: string;
          completed_at: string | null;
          duration_minutes: number | null;
          total_volume_kg: number;
          total_sets_completed: number;
          session_grade: SessionGrade | null;
          grade_reason: string | null;
          readiness_score: number | null;
          notes: string | null;
          is_timeboxed: boolean;
          is_crowded_gym_mode: boolean;
          created_at: string;
          updated_at: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          total_tonnage_kg?: number;
          readiness_score_at_start?: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id?: string | null;
          program_day_id?: string | null;
          name: string;
          status?: SessionStatus;
          started_at?: string;
          completed_at?: string | null;
          duration_minutes?: number | null;
          total_volume_kg?: number;
          total_sets_completed?: number;
          session_grade?: SessionGrade | null;
          grade_reason?: string | null;
          readiness_score?: number | null;
          notes?: string | null;
          is_timeboxed?: boolean;
          is_crowded_gym_mode?: boolean;
          created_at?: string;
          updated_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          total_tonnage_kg?: number;
          readiness_score_at_start?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_id?: string | null;
          program_day_id?: string | null;
          name?: string;
          status?: SessionStatus;
          started_at?: string;
          ended_at?: string | null;
          completed_at?: string | null;
          duration_seconds?: number | null;
          duration_minutes?: number | null;
          total_tonnage_kg?: number;
          total_volume_kg?: number | null;
          total_sets_completed?: number;
          session_grade?: SessionGrade | null;
          grade_reason?: string | null;
          readiness_score_at_start?: number | null;
          readiness_score?: number | null;
          notes?: string | null;
          is_timeboxed?: boolean;
          is_crowded_gym_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sets: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          exercise_id: string;
          set_number: number;
          set_type: SetType;
          weight_kg: number;
          reps: number;
          target_reps: number | null;
          target_weight_kg: number | null;
          rpe: number | null;
          rir: number | null;
          rest_time_seconds: number | null;
          is_completed: boolean;
          is_pr: boolean;
          tempo: string | null;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          exercise_id: string;
          set_number: number;
          set_type?: SetType;
          weight_kg: number;
          reps: number;
          target_reps?: number | null;
          target_weight_kg?: number | null;
          rpe?: number | null;
          rir?: number | null;
          rest_time_seconds?: number | null;
          is_completed?: boolean;
          is_pr?: boolean;
          tempo?: string | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          exercise_id?: string;
          set_number?: number;
          set_type?: SetType;
          weight_kg?: number;
          reps?: number;
          target_reps?: number | null;
          target_weight_kg?: number | null;
          rpe?: number | null;
          rir?: number | null;
          rest_time_seconds?: number | null;
          is_completed?: boolean;
          is_pr?: boolean;
          tempo?: string | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prs: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          set_id: string | null;
          pr_type: PrType;
          value: number;
          previous_value: number | null;
          reps_at_weight: number | null;
          achieved_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          set_id?: string | null;
          pr_type: PrType;
          value: number;
          previous_value?: number | null;
          reps_at_weight?: number | null;
          achieved_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          set_id?: string | null;
          pr_type?: PrType;
          value?: number;
          previous_value?: number | null;
          reps_at_weight?: number | null;
          achieved_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
