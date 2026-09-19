import React, { useState } from 'react';
import { Search, Filter, HelpCircle, ArrowLeftRight, Calculator, ChevronRight } from 'lucide-react';
import { EXERCISE_LIBRARY } from '../data/mockData';
import { Exercise } from '../types';
import { PlateCalculatorModal } from './PlateCalculatorModal';

export const ExerciseLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [showPlateCalc, setShowPlateCalc] = useState<boolean>(false);

  const muscles = ['all', 'Chest', 'Deltoids', 'Triceps', 'Quadriceps', 'Hamstrings'];

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle =
      selectedMuscle === 'all' || ex.targetMuscle.toLowerCase().includes(selectedMuscle.toLowerCase());
    return matchesSearch && matchesMuscle;
  });

  return (
    <div id="exercise-library-view" className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">Exercise Knowledge Base</h1>
        <p className="text-xs text-neutral-400">
          800+ biomechanically vetted movements with plain-English cues and equipment substitutions.
        </p>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercise, muscle, or equipment..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-4 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                selectedMuscle === m
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* EXERCISE LIST */}
      <div className="space-y-2.5">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setActiveExercise(exercise)}
            className="cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 hover:bg-neutral-800/50 transition flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{exercise.name}</span>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                  {exercise.difficulty}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                <span>{exercise.targetMuscle}</span>
                <span>•</span>
                <span>{exercise.equipment}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </div>
        ))}
      </div>

      {/* EXERCISE DETAIL MODAL */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  {activeExercise.equipment} • {activeExercise.difficulty}
                </span>
                <h3 className="text-xl font-black text-white">{activeExercise.name}</h3>
                <p className="text-xs text-neutral-400">Prime Mover: {activeExercise.targetMuscle}</p>
              </div>
              <button
                onClick={() => setActiveExercise(null)}
                className="rounded-full p-1.5 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Cues */}
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-neutral-950 p-3.5 border border-neutral-800">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Setup Cue</span>
                <p className="mt-1 text-neutral-300 leading-relaxed">{activeExercise.cue.setup}</p>
              </div>

              <div className="rounded-xl bg-neutral-950 p-3.5 border border-neutral-800">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Execution Cue</span>
                <p className="mt-1 text-neutral-300 leading-relaxed">{activeExercise.cue.execution}</p>
              </div>

              <div className="rounded-xl bg-neutral-950 p-3.5 border border-neutral-800">
                <span className="font-bold text-red-400 uppercase tracking-wider text-[10px]">Common Mistake to Avoid</span>
                <p className="mt-1 text-neutral-300 leading-relaxed">{activeExercise.cue.commonMistake}</p>
              </div>

              {activeExercise.cue.femaleConsideration && (
                <div className="rounded-xl bg-neutral-950 p-3.5 border border-purple-900/40">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">Biomechanical Note</span>
                  <p className="mt-1 text-neutral-300 leading-relaxed">{activeExercise.cue.femaleConsideration}</p>
                </div>
              )}
            </div>

            {/* Alternatives */}
            {activeExercise.alternatives.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Instant Stimulus-Preserving Substitutions
                </span>
                <div className="mt-2 space-y-2">
                  {activeExercise.alternatives.map((alt) => (
                    <div key={alt.id} className="rounded-xl bg-neutral-950 p-3 border border-neutral-800 text-xs">
                      <div className="font-bold text-white">{alt.name}</div>
                      <div className="text-neutral-400 text-[11px] mt-0.5">{alt.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setShowPlateCalc(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-800 py-3 text-xs font-bold text-neutral-200 hover:bg-neutral-700"
              >
                <Calculator className="h-4 w-4 text-amber-400" /> Plate Breakdown
              </button>
              <button
                onClick={() => setActiveExercise(null)}
                className="flex-1 rounded-xl bg-amber-400 py-3 text-xs font-bold text-neutral-950 hover:bg-amber-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PlateCalculatorModal
        isOpen={showPlateCalc}
        onClose={() => setShowPlateCalc(false)}
        targetWeightKg={80}
      />
    </div>
  );
};
