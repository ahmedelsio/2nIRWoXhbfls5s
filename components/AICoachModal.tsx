import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, ShieldAlert, CheckCircle, Dumbbell, CornerDownLeft } from 'lucide-react';
import { useDataFactory } from '../context/DataFactoryContext';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CoachResponse {
  query: string;
  response: string;
  action?: string;
  evidence: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({ isOpen, onClose }) => {
  const { activePersona, activeBriefing, activeWorkout } = useDataFactory();
  const [customQuery, setCustomQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<CoachResponse[]>([
    {
      query: 'Initial Floor Briefing Context',
      response: `Lifter: ${activePersona.name} (${activePersona.experience}). Active Plan: ${activeBriefing.workoutName}. Today's priority compound is ${activeBriefing.primaryLift}. Target: ${activeBriefing.primaryTarget}. Readiness is ${activeBriefing.readinessScore}/100. ${activeBriefing.recommendedAdjustment}`,
      evidence: 'Autoregulated volume and progressive overload landmarks (Schoenfeld / Helms).',
    },
  ]);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Equipment is taken',
      query: `${activeBriefing.primaryLift} station is occupied. What is the fastest clean substitute?`,
      answer: `Swap to the Dumbbell or Plate-Loaded Machine variation for ${activeBriefing.primaryLift}. Match the working sets and target RIR 2. This preserves the primary agonist motor-unit recruitment without standing around waiting for a station.`,
      evidence: 'Preserves mechanical tension and target muscle activation pattern.',
    },
    {
      title: 'Explain RIR 2 simply',
      query: 'What does RIR 2 actually feel like on my work set?',
      answer: 'RIR 2 (Reps In Reserve 2) means terminating the set when you are certain you could perform exactly two more clean reps with proper form before technical failure. Bar speed decelerates noticeably on the final two reps, but torso and joint mechanics stay crisp with zero breakdown.',
      evidence: 'Helms et al. (2016) - Rating of perceived exertion and reps in reserve validity.',
    },
    {
      title: 'How should I warm up?',
      query: `What is the optimal warmup ramp for ${activeBriefing.primaryLift}?`,
      answer: `Perform 4 progressive non-fatiguing ramp sets before work sets: 1) Empty bar × 10 reps, 2) 50% target × 5 reps, 3) 70% target × 3 reps, 4) 85% target × 1 rep (potentiate nervous system, do not exhaust ATP-CP). Rest 90s, then start set 1.`,
      evidence: 'Post-activation potentiation protocols without lactate accumulation.',
    },
    {
      title: 'Joint feels pinched',
      query: 'I feel a sharp pinch or ache during the movement setup.',
      answer: 'Stop the exercise immediately. Sharp, acute joint pinches indicate tissue impingement or compromised joint alignment. Do not push through sharp pain. Switch to a neutral-grip dumbbell variation or safe machine track. If discomfort persists, consult a licensed sports physical therapist.',
      evidence: 'Safety mandate: Immediate cessation of impinged range of motion.',
    },
  ];

  const handleAsk = (q: string, a: string, ev: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        query: q,
        response: a,
        evidence: ev,
      },
    ]);
    setCustomQuery('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryTrimmed = customQuery.trim();
    if (!queryTrimmed) return;

    const lower = queryTrimmed.toLowerCase();
    let responseText = '';
    let evidenceText = '';

    if (lower.includes('pain') || lower.includes('hurt') || lower.includes('sharp') || lower.includes('tweak') || lower.includes('injury')) {
      responseText = `Safety alert: If you are experiencing sharp, sudden, or shooting pain, stop the lift immediately. Do not test 1RM or train through acute joint pain. Regress to a neutral-grip dumbbell alternative or machine movement with pain-free range of motion. Ironmate AI does not provide medical diagnoses; consult a sports PT if pain persists.`;
      evidenceText = 'Safety Protocol: Joint load cessation and conservative regression.';
    } else if (lower.includes('warm') || lower.includes('ramp')) {
      responseText = `For ${activeBriefing.primaryLift}, do not waste energy on high-rep warmups. Recommended ramp: 1) 10 reps with empty bar/light load, 2) 5 reps at 50% of working weight, 3) 3 reps at 75%, 4) 1 crisp rep at 90%. Rest 2 minutes and proceed to Set 1.`;
      evidenceText = 'Potentiation without metabolic byproduct accumulation.';
    } else if (lower.includes('taken') || lower.includes('busy') || lower.includes('crowded') || lower.includes('swap') || lower.includes('substitute')) {
      responseText = `For ${activeBriefing.workoutName}, you can tap 'Swap' on any exercise card in Gym Mode to pick a cable, dumbbell, or machine alternative that matches the target muscle group. Dumbbells or unilateral setups are ideal during peak hours because they require zero rack waiting.`;
      evidenceText = 'Biomechanic substitution preserving agonist stimulus.';
    } else if (lower.includes('sleep') || lower.includes('tired') || lower.includes('fatigue') || lower.includes('sore')) {
      responseText = `When fatigue is elevated, protect your primary compound lift (${activeBriefing.primaryLift}) at RIR 2-3, but consider dropping the final set of your secondary isolation movements. This retains 85%+ of the hypertrophy stimulus while reducing systemic fatigue accumulation by ~35%.`;
      evidenceText = 'Dose-response curve of training volume (Schoenfeld et al.).';
    } else if (lower.includes('rir') || lower.includes('rpe') || lower.includes('failure')) {
      responseText = `Training to absolute technical failure every set increases joint wear and recovery time without superior hypertrophy compared to RIR 1-2. Keep your compound lifts at RIR 2 (2 reps left in the tank), and save RIR 0-1 for the final set of isolation movements.`;
      evidenceText = 'Helms & Zourdos: Proximity to failure and fatigue management.';
    } else {
      responseText = `Regarding "${queryTrimmed}": Keep progressive overload systematic. Focus on consistent bar path, standardized range of motion, and 2-3 minute rest periods on multi-joint lifts like ${activeBriefing.primaryLift}. Log every completed set cleanly in Gym Mode to let the progressive overload engine calculate your next session targets.`;
      evidenceText = 'Evidence-based progressive overload & motor pattern consistency.';
    }

    handleAsk(queryTrimmed, responseText, evidenceText);
  };

  return (
    <div
      id="ai-coach-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
    >
      <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-950 p-6 text-neutral-100 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Evidence-Based Floor Coach
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Ironmate Companion Desk</h3>
            <p className="text-xs text-neutral-400">
              Calm, adult guidance. No TikTok bro-science or medical diagnosis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {chatHistory.map((item, idx) => (
            <div key={idx} className="space-y-2 text-xs">
              {idx > 0 && (
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-none bg-amber-400/20 border border-amber-400/30 px-3.5 py-2 text-amber-200 max-w-[85%] font-medium">
                    {item.query}
                  </div>
                </div>
              )}

              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-none bg-neutral-900 border border-neutral-800 p-4 text-neutral-200 max-w-[95%] space-y-2 shadow-sm">
                  <p className="leading-relaxed">{item.response}</p>
                  <div className="border-t border-neutral-800/80 pt-2 text-[10px] text-neutral-400 flex items-center justify-between">
                    <span>Citation / Basis: {item.evidence}</span>
                    <span className="text-amber-400 font-bold">Suggestion</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preset Quick Inquiries */}
        <div className="border-t border-neutral-800 pt-3 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Quick Floor Scenarios:
            </span>
            <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAsk(p.query, p.answer, p.evidence)}
                  className="whitespace-nowrap rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Query Input Bar */}
          <form onSubmit={handleCustomSubmit} className="relative flex items-center">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder={`Ask coach about ${activeBriefing.primaryLift}, warmups, pain, fatigue...`}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 pr-10 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customQuery.trim()}
              className="absolute right-2 p-1.5 rounded-lg text-amber-400 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="text-[10px] text-neutral-500 text-center">
            Ironmate AI references {activePersona.name}'s active training log. Grounded in peer-reviewed exercise science.
          </div>
        </div>
      </div>
    </div>
  );
};
