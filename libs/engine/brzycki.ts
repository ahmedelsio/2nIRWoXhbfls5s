/**
 * Biomechanical 1RM & e1RM Estimation Formulas.
 * Pure mathematical functions (Zero UI dependencies).
 */

export const OneRepMaxEngine = {
  /**
   * Brzycki Formula: e1RM = weight / (1.0278 - (0.0278 * reps))
   * Validated for 1 to 10 repetitions.
   */
  brzycki(weightKg: number, reps: number): number {
    if (reps <= 0 || weightKg <= 0) return 0;
    if (reps === 1) return weightKg;
    if (reps > 12) {
      // Degrade to Epley beyond 12 reps to prevent denominator asymptote
      return this.epley(weightKg, reps);
    }
    const e1rm = weightKg / (1.0278 - 0.0278 * reps);
    return Math.round(e1rm * 10) / 10;
  },

  /**
   * Epley Formula: e1RM = weight * (1 + reps / 30)
   */
  epley(weightKg: number, reps: number): number {
    if (reps <= 0 || weightKg <= 0) return 0;
    if (reps === 1) return weightKg;
    const e1rm = weightKg * (1 + reps / 30);
    return Math.round(e1rm * 10) / 10;
  },

  /**
   * Calculate target weight for a given target rep range and RIR.
   * e.g., estimate what 8 reps @ RIR 2 (effective 10 reps) should be given current e1RM.
   */
  estimateTargetWeight(e1rmKg: number, targetReps: number, targetRir: number = 2): number {
    const effectiveReps = targetReps + targetRir;
    // Invert Brzycki: weight = e1rm * (1.0278 - 0.0278 * effectiveReps)
    const factor = Math.max(0.5, 1.0278 - 0.0278 * effectiveReps);
    const rawWeight = e1rmKg * factor;
    // Round to standard 2.5kg plate jump
    return Math.round(rawWeight / 2.5) * 2.5;
  },
};
