export interface VolumeLandmark {
  muscle: string;
  mv: number;   // Maintenance Volume (sets/week)
  mev: number;  // Minimum Effective Volume (sets/week)
  mavMin: number; // Maximum Adaptive Volume min (sets/week)
  mavMax: number; // Maximum Adaptive Volume max (sets/week)
  mrv: number;  // Maximum Recoverable Volume (sets/week)
}

export type VolumeStatus = 'below_mev' | 'optimal_mav' | 'approaching_mrv' | 'junk_or_overtraining';

export const VOLUME_LANDMARKS_DATA: Record<string, VolumeLandmark> = {
  Chest: { muscle: 'Chest', mv: 6, mev: 10, mavMin: 12, mavMax: 20, mrv: 22 },
  Back: { muscle: 'Back', mv: 8, mev: 10, mavMin: 14, mavMax: 22, mrv: 25 },
  Quads: { muscle: 'Quads', mv: 6, mev: 8, mavMin: 12, mavMax: 18, mrv: 20 },
  Hamstrings: { muscle: 'Hamstrings', mv: 4, mev: 6, mavMin: 10, mavMax: 16, mrv: 18 },
  Shoulders: { muscle: 'Shoulders', mv: 6, mev: 8, mavMin: 12, mavMax: 20, mrv: 24 },
  Triceps: { muscle: 'Triceps', mv: 4, mev: 6, mavMin: 10, mavMax: 14, mrv: 18 },
  Biceps: { muscle: 'Biceps', mv: 4, mev: 6, mavMin: 10, mavMax: 14, mrv: 18 },
  Glutes: { muscle: 'Glutes', mv: 0, mev: 4, mavMin: 8, mavMax: 16, mrv: 18 },
  Calves: { muscle: 'Calves', mv: 4, mev: 6, mavMin: 10, mavMax: 16, mrv: 20 },
};

export const VolumeLandmarksEngine = {
  getLandmark(muscle: string): VolumeLandmark {
    return (
      VOLUME_LANDMARKS_DATA[muscle] || {
        muscle,
        mv: 4,
        mev: 8,
        mavMin: 10,
        mavMax: 18,
        mrv: 20,
      }
    );
  },

  evaluateVolumeStatus(muscle: string, weeklyCompletedSets: number): {
    status: VolumeStatus;
    label: string;
    description: string;
  } {
    const landmark = this.getLandmark(muscle);

    if (weeklyCompletedSets < landmark.mev) {
      return {
        status: 'below_mev',
        label: 'Under-Stimulated',
        description: `${weeklyCompletedSets} sets/wk is below Minimum Effective Volume (${landmark.mev} sets). Add 2-3 work sets for growth.`,
      };
    }

    if (weeklyCompletedSets <= landmark.mavMax) {
      return {
        status: 'optimal_mav',
        label: 'Optimal Hypertrophy',
        description: `${weeklyCompletedSets} sets/wk sits cleanly in your Maximum Adaptive Volume (${landmark.mavMin}-${landmark.mavMax} sets). Maintain progression.`,
      };
    }

    if (weeklyCompletedSets <= landmark.mrv) {
      return {
        status: 'approaching_mrv',
        label: 'Near Fatigue Ceiling',
        description: `${weeklyCompletedSets} sets/wk approaches Maximum Recoverable Volume (${landmark.mrv} sets). Monitor joint soreness and sleep quality.`,
      };
    }

    return {
      status: 'junk_or_overtraining',
      label: 'Diminishing Returns',
      description: `${weeklyCompletedSets} sets/wk exceeds MRV (${landmark.mrv} sets). High risk of systemic fatigue without additional hypertrophy.`,
    };
  },
};
