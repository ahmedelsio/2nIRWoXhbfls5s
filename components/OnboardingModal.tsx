import React, { useState } from 'react';
import { 
  Dumbbell, Target, CheckCircle, ArrowRight, ArrowLeft, 
  HelpCircle, Shield, Sparkles, Building, Home, Clock, AlertCircle, Heart
} from 'lucide-react';
import { TrainingGoal, ExperienceLevel, GymType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteOnboarding: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<number>(1);

  // User selections
  const [goal, setGoal] = useState<TrainingGoal>('hypertrophy');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [gymType, setGymType] = useState<GymType>('commercial');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [sessionMinutes, setSessionMinutes] = useState<number>(60);
  const [cycleAware, setCycleAware] = useState<boolean>(false);
  const [painFlag, setPainFlag] = useState<string>('none');

  if (!isOpen) return null;

  return (
    <div
      id="onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 text-neutral-100 shadow-2xl relative my-8">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
              Personalized Setup • Step {step} of 6
            </span>
            <h2 className="text-xl font-black text-white">Ironmate Calibration</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* SCREEN 1: GOAL */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white">What brings you to the barbell?</h3>
            <p className="text-xs text-neutral-400">
              No generic calorie-shaming or vanity promises. Just honest, evidence-based strength programming.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                {
                  id: 'hypertrophy',
                  title: 'Build Muscle & Hypertrophy',
                  desc: 'Maximize lean tissue with optimized volume landmarks (10–20 sets/muscle/week).',
                },
                {
                  id: 'strength',
                  title: 'Pure Strength & Power',
                  desc: 'Drive numbers up on Squat, Bench, Deadlift, and Overhead Press with periodized intensity.',
                },
                {
                  id: 'recomp',
                  title: 'Body Recomposition',
                  desc: 'Maintain strength while dropping body fat without sacrificing muscular density.',
                },
                {
                  id: 'general',
                  title: 'Longevity & Resilient Joints',
                  desc: 'Move without pain, build bone mineral density, and develop lifelong physical durability.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setGoal(item.id as TrainingGoal)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    goal === item.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    {goal === item.id && <CheckCircle className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 2: EXPERIENCE */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white">How comfortable are you in the gym?</h3>
            <p className="text-xs text-neutral-400">
              We match your starting cues and progression speed to your true training age.
            </p>

            <div className="space-y-3 pt-2">
              {[
                {
                  id: 'beginner',
                  title: 'New to Free Weights (0–6 months)',
                  desc: 'Intimidated by the weight room, unsure how to rack or find starting weights. Unlocks the "First Week in a Real Gym" track.',
                },
                {
                  id: 'intermediate',
                  title: 'Consistent Lifter (6–24 months)',
                  desc: 'Know the main lifts and want progressive overload, volume landmarks, and no stalling.',
                },
                {
                  id: 'advanced',
                  title: 'Experienced Lifter (2+ years)',
                  desc: 'Have a plan, want sub-second logging speed, plate calculator, and optional AI only when requested.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setExperience(item.id as ExperienceLevel)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    experience === item.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    {experience === item.id && <CheckCircle className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 3: EQUIPMENT REALITY */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white">Where do you train?</h3>
            <p className="text-xs text-neutral-400">
              We never prescribe exercises you cannot perform.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'commercial', title: 'Commercial Gym', desc: 'Barbells, cables, dumbbells to 50kg, machines' },
                { id: 'home_barbell', title: 'Garage Rack', desc: 'Power rack, barbell, plates, bench' },
                { id: 'hotel_dumbbells', title: 'Hotel / Condo Gym', desc: 'Dumbbells to 22kg, cable stack, adjustable bench' },
                { id: 'basic_machines', title: 'Basic Machine Circuit', desc: 'Fixed pin machines, dumbbells, bodyweight' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setGymType(item.id as GymType)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    gymType === item.id
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 4: SCHEDULE & TIME BUDGET */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-2xl font-black text-white">Your Training Schedule</h3>
            <p className="text-xs text-neutral-400">
              We design splits that fit your life, not an impossible fitness fantasy.
            </p>

            <div>
              <span className="text-xs font-bold uppercase text-neutral-400">Days Per Week</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDaysPerWeek(d)}
                    className={`rounded-xl py-3 text-center border font-bold transition-all ${
                      daysPerWeek === d
                        ? 'border-amber-400 bg-amber-400 text-neutral-950'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {d} Days / Wk
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">
                {daysPerWeek === 3 && 'Prescribes: Full Body A/B/C rotation.'}
                {daysPerWeek === 4 && 'Prescribes: Upper / Lower A/B split.'}
                {daysPerWeek === 5 && 'Prescribes: Push / Pull / Legs + Upper / Lower hybrid.'}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase">
                <span>Session Duration Limit</span>
                <span className="text-amber-400">{sessionMinutes} Minutes</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="15"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                className="mt-3 w-full accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>30 min (Express)</span>
                <span>45 min</span>
                <span>60 min (Standard)</span>
                <span>75+ min</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 5: PHYSIOLOGY & CYCLE-AWARE (OPT-IN) */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white">Dignified Physiology Context</h3>
            <p className="text-xs text-neutral-400">
              Optional physiological adjustments without judgment or calorie-shame UX.
            </p>

            <div className="space-y-3 pt-2">
              {/* Cycle-Aware Toggle */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-rose-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Cycle-Aware Suggestions (Opt-In)</h4>
                      <p className="text-[11px] text-neutral-400">
                        Adjusts RIR expectations during high-progesterone phases without treating you as fragile.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cycleAware}
                    onChange={(e) => setCycleAware(e.target.checked)}
                    className="h-5 w-5 rounded accent-amber-400"
                  />
                </div>
              </div>

              {/* Joint Flags */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <span className="text-xs font-bold uppercase text-neutral-400">Active Joint / Pain Flags</span>
                <p className="text-[11px] text-neutral-400 mt-1">We will swap high-shear lifts for pain-free alternatives.</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'none', label: 'None (Healthy)' },
                    { id: 'shoulder', label: 'Shoulder Impingement' },
                    { id: 'lower_back', label: 'Lower Back Sensitivity' },
                    { id: 'knee', label: 'Patellar Knee Strain' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPainFlag(p.id)}
                      className={`rounded-xl py-2 px-2 text-left border transition ${
                        painFlag === p.id
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 6: FIRST WEEK IN A REAL GYM PRIMER & PROGRAM GENERATED */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> 4-Week Block Generated
            </div>
            <h3 className="text-2xl font-black text-white">First Week in a Real Gym</h3>
            <p className="text-xs text-neutral-400">
              Three essential rules every confident lifter knows:
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3.5 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">1. The RIR 3 Rule</span>
                <p className="text-neutral-300 leading-relaxed">
                  Never lift to failure on Week 1. Choose a weight where you can perform the required reps with at least 3 clean reps still in reserve.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3.5 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">2. Asking to 'Work In'</span>
                <p className="text-neutral-300 leading-relaxed">
                  If someone is using a rack, asking "Mind if I work in between your sets?" is standard gym etiquette. People are happy to share.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3.5 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">3. Racking & Wiping Down</span>
                <p className="text-neutral-300 leading-relaxed">
                  Return plates to the tree. Take 5 seconds to wipe down the bench pad when finished. That's all it takes to earn respect on the floor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-5">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-neutral-950 hover:bg-amber-300 shadow-md"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              id="btn-complete-onboarding"
              onClick={() => {
                onCompleteOnboarding();
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-black text-neutral-950 hover:bg-amber-300 shadow-xl"
            >
              Commit to 4-Week Block <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
