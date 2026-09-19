import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeightKg: number;
  onApplyWeight?: (weight: number) => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  targetWeightKg,
  onApplyWeight,
}) => {
  const [barWeight, setBarWeight] = useState<number>(20); // 20kg standard Olympic bar or 15kg
  const [customWeight, setCustomWeight] = useState<number>(targetWeightKg);

  if (!isOpen) return null;

  // Available standard plates in kg
  const plateDenominations = [25, 20, 15, 10, 5, 2.5, 1.25];

  // Calculate plates per side
  const calculatePlates = (totalKg: number, barKg: number) => {
    let remainderPerSide = Math.max(0, (totalKg - barKg) / 2);
    const platesUsed: { weight: number; count: number; color: string }[] = [];

    const plateColors: Record<number, string> = {
      25: 'bg-red-600 border-red-500 text-white',
      20: 'bg-blue-600 border-blue-500 text-white',
      15: 'bg-yellow-500 border-yellow-400 text-black',
      10: 'bg-emerald-600 border-emerald-500 text-white',
      5: 'bg-neutral-100 border-neutral-300 text-black',
      2.5: 'bg-neutral-700 border-neutral-600 text-white',
      1.25: 'bg-neutral-500 border-neutral-400 text-white',
    };

    for (const plate of plateDenominations) {
      const count = Math.floor(remainderPerSide / plate);
      if (count > 0) {
        platesUsed.push({
          weight: plate,
          count,
          color: plateColors[plate] || 'bg-neutral-600',
        });
        remainderPerSide -= count * plate;
      }
    }

    return { platesUsed, unachieved: remainderPerSide * 2 };
  };

  const { platesUsed, unachieved } = calculatePlates(customWeight, barWeight);

  return (
    <div
      id="plate-calculator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Plate Calculator</h3>
            <p className="text-xs text-neutral-400">Calibrated Olympic Barbell Breakdown</p>
          </div>
          <button
            id="btn-close-plate-calc"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target Weight Display & Bar Selector */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-neutral-950 p-4 border border-neutral-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400">Total Barbell Load</span>
              <div className="text-3xl font-extrabold text-amber-400">{customWeight.toFixed(1)} <span className="text-lg text-neutral-400">kg</span></div>
            </div>
            <div className="flex gap-2">
              <button
                id="btn-bar-20kg"
                onClick={() => setBarWeight(20)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  barWeight === 20 ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                20kg Bar
              </button>
              <button
                id="btn-bar-15kg"
                onClick={() => setBarWeight(15)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  barWeight === 15 ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                15kg Bar
              </button>
            </div>
          </div>

          {/* Graphical Barbell Visualizer */}
          <div className="relative flex flex-col items-center justify-center rounded-xl bg-neutral-950 p-6 border border-neutral-800">
            <span className="mb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">Each Side Requires:</span>
            
            {/* Visual Bar Sleeve */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-3">
              <div className="h-14 w-4 rounded-l bg-neutral-600 border border-neutral-500 flex items-center justify-center text-[10px] text-neutral-200">
                Sleeve
              </div>
              {platesUsed.length === 0 ? (
                <div className="py-2 text-sm text-neutral-400 italic">Empty bar (no plates needed)</div>
              ) : (
                platesUsed.flatMap((p) =>
                  Array.from({ length: p.count }).map((_, idx) => (
                    <div
                      key={`${p.weight}-${idx}`}
                      className={`flex flex-col items-center justify-center rounded border font-mono font-bold shadow ${p.color} ${
                        p.weight >= 20
                          ? 'h-24 w-7 text-xs'
                          : p.weight >= 10
                          ? 'h-20 w-6 text-xs'
                          : 'h-14 w-5 text-[10px]'
                      }`}
                      title={`${p.weight} kg`}
                    >
                      <span>{p.weight}</span>
                    </div>
                  ))
                )
              )}
              <div className="h-6 w-16 bg-neutral-400 rounded-r border-y border-r border-neutral-300"></div>
            </div>

            {/* List breakdown */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {platesUsed.map((p) => (
                <span
                  key={p.weight}
                  className="rounded-md bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-200 border border-neutral-700"
                >
                  {p.count}× {p.weight}kg plate
                </span>
              ))}
            </div>

            {unachieved > 0.1 && (
              <p className="mt-2 text-xs text-amber-300">
                Note: {unachieved.toFixed(2)}kg difference due to 1.25kg plate granularity.
              </p>
            )}
          </div>

          {/* Quick Increment adjustments */}
          <div className="flex gap-2">
            <button
              id="btn-sub-2-5"
              onClick={() => setCustomWeight((w) => Math.max(barWeight, w - 2.5))}
              className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold hover:bg-neutral-700 active:scale-95 transition"
            >
              -2.5 kg
            </button>
            <button
              id="btn-add-2-5"
              onClick={() => setCustomWeight((w) => w + 2.5)}
              className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold hover:bg-neutral-700 active:scale-95 transition"
            >
              +2.5 kg
            </button>
            <button
              id="btn-add-5-0"
              onClick={() => setCustomWeight((w) => w + 5)}
              className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold hover:bg-neutral-700 active:scale-95 transition"
            >
              +5.0 kg
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            id="btn-apply-plate-weight"
            onClick={() => {
              if (onApplyWeight) onApplyWeight(customWeight);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-bold text-neutral-950 transition hover:bg-amber-300 active:scale-98 shadow-md"
          >
            <Check className="h-4 w-4" /> Apply {customWeight}kg to Current Set
          </button>
        </div>
      </div>
    </div>
  );
};
