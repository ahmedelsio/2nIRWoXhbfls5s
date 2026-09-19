export interface ProgressionAdvice {
  action: 'increase_weight' | 'maintain_weight' | 'increase_reps' | 'deload_suggested';
  suggestedWeightKg: number;
  suggestedTargetReps: number;
  reason: string;
}

export interface SetPerformanceSnapshot {
  weightKg: number;
  reps: number;
  targetReps: number;
  rir?: number | null;
  rpe?: number | null;
}

export const ProgressionEngine = {
  /**
   * Double Progression Policy:
   * 1. Hit the target rep ceiling across all sets with RIR >= 2 -> Add load next session.
   * 2. Hit target reps but RIR < 1 -> Maintain load, build rep reserve.
   * 3. Failed to reach rep floor across 2 sessions -> Recommend deload or variation swap.
   */
  evaluateDoubleProgression(
    currentWeightKg: number,
    targetRepRange: [number, number], // e.g. [6, 8] or [8, 12]
    completedSets: SetPerformanceSnapshot[],
    isCompound: boolean = true
  ): ProgressionAdvice {
    const [minReps, maxReps] = targetRepRange;
    const increment = isCompound ? 2.5 : 1.0;

    if (completedSets.length === 0) {
      return {
        action: 'maintain_weight',
        suggestedWeightKg: currentWeightKg,
        suggestedTargetReps: minReps,
        reason: 'Establish baseline work sets.',
      };
    }

    const allHitMaxReps = completedSets.every((s) => s.reps >= maxReps);
    const averageRir =
      completedSets.reduce((acc, s) => acc + (s.rir ?? 2), 0) / completedSets.length;
    const allHitMinReps = completedSets.every((s) => s.reps >= minReps);

    if (allHitMaxReps && averageRir >= 1.5) {
      return {
        action: 'increase_weight',
        suggestedWeightKg: currentWeightKg + increment,
        suggestedTargetReps: minReps,
        reason: `All sets hit ${maxReps} reps with clean reserve (avg RIR ${averageRir.toFixed(1)}). Advance +${increment}kg next session.`,
      };
    }

    if (allHitMinReps) {
      return {
        action: 'increase_reps',
        suggestedWeightKg: currentWeightKg,
        suggestedTargetReps: Math.min(maxReps, Math.max(...completedSets.map((s) => s.reps)) + 1),
        reason: `Working within target window (${minReps}-${maxReps} reps). Hold weight and build toward rep ceiling.`,
      };
    }

    // Missed min reps
    return {
      action: 'maintain_weight',
      suggestedWeightKg: currentWeightKg,
      suggestedTargetReps: minReps,
      reason: `Missed rep floor (${minReps} reps). Consolidate technique at ${currentWeightKg}kg before advancing.`,
    };
  },
};
