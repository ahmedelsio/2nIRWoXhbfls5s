/**
 * Ironmate Smart Exercise Substitution Modal - Expo Router
 * Path: app/modal/swap-exercise.tsx
 * Evidence-based movement pattern matching (e.g., Crowded rack, shoulder pinch, missing machine)
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
  ArrowLeftRight, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Dumbbell,
  CheckCircle2
} from 'lucide-react-native';
import { EXERCISE_LIBRARY } from '@/src/data/mockData';

const PRIMARY_SUBSTITUTIONS = [
  {
    id: 'db-incline-press',
    name: 'Incline Dumbbell Press',
    muscle: 'Upper Chest & Front Delts',
    equipment: 'Dumbbells & Incline Bench',
    stimulusMatch: '95% Pectoral & Tricep Overload',
    reason: 'Ideal when flat barbells are occupied. Converging dumbbell arc is gentler on anterior shoulder capsule.',
    badge: 'CROWDED GYM BEST',
  },
  {
    id: 'machine-chest-press',
    name: 'Seated Chest Press Machine',
    muscle: 'Mid & Lower Pectorals',
    equipment: 'Selectorized Machine',
    stimulusMatch: '98% Strict Hypertrophy',
    reason: 'Zero stabilizer fatigue. Allows training to true 0 RIR failure without needing a human spotter.',
    badge: 'SAFE TO FAILURE',
  },
  {
    id: 'weighted-dips',
    name: 'Parallel Bar Dips',
    muscle: 'Lower Pecs & Triceps',
    equipment: 'Dip Station / Belt',
    stimulusMatch: '90% Mechanical Tension',
    reason: 'Compound bodyweight/plate overload. High motor unit recruitment for clavicular and sternal heads.',
    badge: 'BODYWEIGHT ALTERNATIVE',
  },
  {
    id: 'db-flat-press',
    name: 'Flat Dumbbell Bench Press',
    muscle: 'Chest (Sternal)',
    equipment: 'Dumbbells & Flat Bench',
    stimulusMatch: '100% Pattern Match',
    reason: 'Exact same horizontal pressing vector. Independent arm loading addresses bilateral strength deficits.',
    badge: 'BILATERAL BALANCE',
  },
];

export default function SwapExerciseModal() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedId, setSelectedId] = useState<string>('db-incline-press');

  const handleConfirmSwap = (item: typeof PRIMARY_SUBSTITUTIONS[0]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In real app, passes selected exercise to parent via query params or Global Store
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ArrowLeftRight size={16} color="#ccff00" />
            <Text style={styles.category}>SMART MOVEMENT SUBSTITUTION</Text>
          </View>
          <Text style={styles.title}>Swap Barbell Bench Press</Text>
          <Text style={styles.subtitle}>
            Preserves horizontal pressing volume without sacrificing progressive overload.
          </Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <ShieldCheck size={18} color="#38bdf8" />
          <Text style={styles.bannerText}>
            Substitutions preserve target stimulus, joint angle, and weekly MEV volume landmarks.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>RECOMMENDED EVIDENCE-BASED ALTERNATIVES</Text>

        {PRIMARY_SUBSTITUTIONS.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedId(item.id);
              }}
              activeOpacity={0.88}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
                <Text style={styles.stimulusMatch}>{item.stimulusMatch}</Text>
              </View>

              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.muscle} • {item.equipment}</Text>
              <Text style={styles.cardReason}>{item.reason}</Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.swapBtn, isSelected && styles.swapBtnActive]}
                  onPress={() => handleConfirmSwap(item)}
                >
                  <Check size={16} color={isSelected ? '#09090b' : '#ccff00'} />
                  <Text style={[styles.swapBtnText, isSelected && styles.swapBtnTextActive]}>
                    {isSelected ? 'Substitute into Today’s Session' : 'Select Movement'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  category: {
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
  subtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 4,
    lineHeight: 16,
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#38bdf815',
    borderWidth: 1,
    borderColor: '#38bdf835',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
    color: '#bae6fd',
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#ccff00',
    backgroundColor: '#1c1f13',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: '#ccff0020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ccff00',
    fontSize: 10,
    fontWeight: '900',
  },
  stimulusMatch: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardMeta: {
    color: '#71717a',
    fontSize: 12,
    marginBottom: 8,
  },
  cardReason: {
    color: '#d4d4d8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#ccff00',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  swapBtnActive: {
    backgroundColor: '#ccff00',
    borderColor: '#ccff00',
  },
  swapBtnText: {
    color: '#ccff00',
    fontSize: 12,
    fontWeight: '800',
  },
  swapBtnTextActive: {
    color: '#09090b',
  },
  });
}
