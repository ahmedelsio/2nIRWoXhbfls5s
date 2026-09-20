/**
 * Ironmate Lifter Onboarding Modal - Expo Router
 * Path: app/modal/onboarding.tsx
 * Rapid 4-step evidence-based questionnaire to establish starting loads & periodization block
 */
import React, { useState } from 'react';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Check, 
  ArrowRight, 
  Dumbbell, 
  Flame, 
  Target, 
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react-native';

const GOALS = [
  { id: 'hypertrophy', title: 'Muscle Hypertrophy', desc: 'Maximize myofibrillar cross-sectional area with volume landmark progression.' },
  { id: 'strength', title: 'Absolute Strength', desc: 'Linear compound overload peaking for Brzycki estimated 1RM milestones.' },
  { id: 'recomp', title: 'Body Recomposition', desc: 'Maintain lean mass while achieving a caloric deficit with high protein density.' },
];

const EXPERIENCE_LEVELS = [
  { id: 'novice', title: 'Beginner (0–12 Months)', desc: 'Focus on movement groove, gym etiquette, machine setups, and RIR 3 safety buffer.' },
  { id: 'intermediate', title: 'Intermediate (1–3 Years)', desc: 'Needs periodized double progression to break through plateaus without overtraining.' },
  { id: 'advanced', title: 'Advanced (3+ Years)', desc: 'Autoregulated micro-loading, fatigue index management, and MEV/MRV volume targets.' },
];

const SCHEDULES = [
  { id: '3day', title: '3 Days / Week', split: 'Full Body A/B/C', desc: 'Maximum recovery between sessions. Ideal for busy schedules.' },
  { id: '4day', title: '4 Days / Week', split: 'Upper / Lower Split', desc: 'Balanced distribution of upper body and lower body volume.' },
  { id: '5day', title: '5 Days / Week', split: 'Push / Pull / Legs (PPL)', desc: 'High-frequency muscle stimulation with 2 planned recovery days.' },
];

export default function OnboardingModal() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [step, setStep] = useState<number>(1);
  const [goal, setGoal] = useState<string>('hypertrophy');
  const [experience, setExperience] = useState<string>('intermediate');
  const [schedule, setSchedule] = useState<string>('5day');

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 3) {
      setStep(step + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.stepIndicator}>STEP {step} OF 3</Text>
          <Text style={styles.title}>
            {step === 1 && 'Primary Training Goal'}
            {step === 2 && 'Lifting Experience'}
            {step === 3 && 'Weekly Training Frequency'}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Goals */}
        {step === 1 && (
          <View style={styles.optionsList}>
            {GOALS.map((g) => {
              const active = goal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setGoal(g.id);
                  }}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{g.title}</Text>
                    {active && <Check size={18} color="#09090b" />}
                  </View>
                  <Text style={styles.cardDesc}>{g.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <View style={styles.optionsList}>
            {EXPERIENCE_LEVELS.map((e) => {
              const active = experience === e.id;
              return (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setExperience(e.id);
                  }}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardTop}>
                    <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{e.title}</Text>
                    {active && <Check size={18} color="#09090b" />}
                  </View>
                  <Text style={styles.cardDesc}>{e.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <View style={styles.optionsList}>
            {SCHEDULES.map((s) => {
              const active = schedule === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSchedule(s.id);
                  }}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{s.title}</Text>
                      <Text style={[styles.cardSplit, active && styles.cardSplitActive]}>{s.split}</Text>
                    </View>
                    {active && <Check size={18} color="#09090b" />}
                  </View>
                  <Text style={styles.cardDesc}>{s.desc}</Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.summaryBanner}>
              <Sparkles size={18} color="#ccff00" />
              <Text style={styles.summaryText}>
                We will generate a 4-week periodization block with autoregulated starter weights based on your RIR 3 baseline.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => {
              Haptics.selectionAsync();
              setStep(step - 1);
            }}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.nextBtn, step === 1 && { flex: 1 }]} 
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>
            {step === 3 ? 'Generate My Program' : 'Continue'}
          </Text>
          <ArrowRight size={18} color="#09090b" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return createThemeStyles(theme, {
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  stepIndicator: {
    fontSize: 10,
    color: '#ccff00',
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  optionsList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
  },
  cardActive: {
    backgroundColor: '#ccff00',
    borderColor: '#ccff00',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardTitleActive: {
    color: '#09090b',
  },
  cardSplit: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  cardSplitActive: {
    color: '#18181b',
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ccff0015',
    borderWidth: 1,
    borderColor: '#ccff0030',
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  summaryText: {
    flex: 1,
    color: '#d4d4d8',
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#18181b',
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#a1a1aa',
    fontWeight: '700',
    fontSize: 14,
  },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ccff00',
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#09090b',
    fontWeight: '900',
    fontSize: 15,
  },
  });
}
