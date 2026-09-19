export interface LoadedPlate {
  weightKg: number;
  countPerSide: number;
  color: string;
}

export interface BarbellLoadResult {
  targetWeightKg: number;
  barWeightKg: number;
  weightPerSideKg: number;
  achievableWeightKg: number;
  platesPerSide: LoadedPlate[];
  remainderKg: number;
}

const STANDARD_METRIC_PLATES: Array<{ weightKg: number; color: string }> = [
  { weightKg: 25, color: '#dc2626' }, // Red
  { weightKg: 20, color: '#2563eb' }, // Blue
  { weightKg: 15, color: '#ca8a04' }, // Yellow
  { weightKg: 10, color: '#16a34a' }, // Green
  { weightKg: 5, color: '#f97316' },  // White / Orange
  { weightKg: 2.5, color: '#000000' }, // Black
  { weightKg: 1.25, color: '#71717a' }, // Chrome
];

export function calculateBarbellPlates(
  targetWeightKg: number,
  barWeightKg: number = 20,
  availablePlates = STANDARD_METRIC_PLATES
): BarbellLoadResult {
  if (targetWeightKg <= barWeightKg) {
    return {
      targetWeightKg,
      barWeightKg,
      weightPerSideKg: 0,
      achievableWeightKg: barWeightKg,
      platesPerSide: [],
      remainderKg: 0,
    };
  }

  let remainingPerSide = (targetWeightKg - barWeightKg) / 2;
  const platesPerSide: LoadedPlate[] = [];
  let loadedPerSide = 0;

  for (const plate of availablePlates) {
    if (remainingPerSide >= plate.weightKg) {
      const count = Math.floor(remainingPerSide / plate.weightKg);
      if (count > 0) {
        platesPerSide.push({
          weightKg: plate.weightKg,
          countPerSide: count,
          color: plate.color,
        });
        const added = count * plate.weightKg;
        loadedPerSide += added;
        remainingPerSide -= added;
      }
    }
  }

  const achievableWeight = barWeightKg + loadedPerSide * 2;
  const remainder = targetWeightKg - achievableWeight;

  return {
    targetWeightKg,
    barWeightKg,
    weightPerSideKg: loadedPerSide,
    achievableWeightKg: achievableWeight,
    platesPerSide,
    remainderKg: remainder,
  };
}
