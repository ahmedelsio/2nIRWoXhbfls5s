/**
 * Ironmate Biomechanics & Form Cues Modal - Expo Router
 * Path: app/modal/cues.tsx
 * Evidence-based floor cues & female biomechanical context
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
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  Heart,
  Dumbbell
} from 'lucide-react-native';

const CUE_ITEMS = [
  {
    id: 'bench',
    name: 'Barbell Bench Press',
    muscle: 'Chest (Sternal) • Triceps • Anterior Delts',
    setup: 'Plant feet flat directly under knees. Retract and depress scapulae firmly into the pad to create a stable thoracic shelf. Eyes directly under racked barbell.',
    execution: 'Lower under control for 2–3s to mid/lower sternum with elbows tucked at 45–60°. Drive feet into the floor and press up and slightly back toward the rack pins.',
    mistake: 'Flaring elbows wide at 90° (causes subacromial shoulder impingement) or bouncing the barbell off the ribcage.',
    femaleNote: 'Due to wider pelvic carrying angle and Q-angle, a grip half-a-finger narrower than standard male templates usually optimizes elbow-under-wrist leverage.',
  },
  {
    id: 'incline-db',
    name: 'Incline Dumbbell Press',
    muscle: 'Upper Chest (Clavicular) • Front Deltoids',
    setup: 'Set bench to 30° incline (higher shifts stimulus to anterior delts). Kick weights up with knees and set feet wide and rooted.',
    execution: 'Tuck elbows 45° to torso. Press dumbbells upward in a gentle converging arc without clacking the weights together at lockout.',
    mistake: 'Excessive lumbar arching that lifts the mid-back off the bench, turning the movement back into a flat press.',
    femaleNote: 'Maintain moderate bench angle (30°). Focus on feeling clavicular pectoralis stretch during 2-second eccentric phase.',
  },
  {
    id: 'lat-raise',
    name: 'Cable Lateral Raise',
    muscle: 'Lateral Deltoids (Side Delts)',
    setup: 'Set cable pulley height at hand/wrist level when standing. Stand tall with core lightly braced.',
    execution: 'Sweep arms out wide in the scapular plane (30° in front of coronal plane). Lead with elbows, lifting to shoulder height with a 1-second pause.',
    mistake: 'Shrugging upper traps to yank the weight, shifting tension away from the side deltoid head.',
    femaleNote: 'Cable provides consistent resistance profile throughout the lengthened bottom range where side delts experience optimal growth stimulus.',
  },
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    muscle: 'Quadriceps • Glutes • Adductors',
    setup: 'Position bar across upper traps (high bar) or rear delts (low bar). Root tripod foot (big toe, pinky toe, heel). 360° intra-abdominal brace.',
    execution: 'Break simultaneously at hips and knees. Descend until hip crease is at or below parallel. Drive floor away through mid-foot while keeping chest proud.',
    mistake: 'Knee cave (valgus collapse) on the ascent or letting hips shoot up early ("good morning" squat).',
    femaleNote: 'Wider pelvis often requires a slightly wider stance with toes flared 25–35° to allow deep pelvic floor clearance without lumbar flexion (butt wink).',
  },
];

export default function FormCuesModal() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('bench');

  const activeCue = CUE_ITEMS.find((c) => c.id === selectedExerciseId) || CUE_ITEMS[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BookOpen size={16} color="#ccff00" />
            <Text style={styles.category}>BIOMECHANICS & MOVEMENT CUES</Text>
          </View>
          <Text style={styles.title}>{activeCue.name}</Text>
          <Text style={styles.muscleTarget}>{activeCue.muscle}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      {/* Exercise Selector Chips */}
      <View style={styles.selectorBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CUE_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, selectedExerciseId === item.id && styles.chipActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedExerciseId(item.id);
              }}
            >
              <Text style={[styles.chipText, selectedExerciseId === item.id && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Setup Cue */}
        <View style={styles.cueCard}>
          <View style={styles.badgeRow}>
            <Sparkles size={16} color="#ccff00" />
            <Text style={styles.cueBadgeSetup}>1. SETUP & STABILITY</Text>
          </View>
          <Text style={styles.cueBody}>{activeCue.setup}</Text>
        </View>

        {/* Execution Cue */}
        <View style={styles.cueCard}>
          <View style={styles.badgeRow}>
            <CheckCircle size={16} color="#38bdf8" />
            <Text style={styles.cueBadgeExec}>2. EXECUTION & BAR PATH</Text>
          </View>
          <Text style={styles.cueBody}>{activeCue.execution}</Text>
        </View>

        {/* Common Mistake to Avoid */}
        <View style={[styles.cueCard, styles.cueCardMistake]}>
          <View style={styles.badgeRow}>
            <AlertTriangle size={16} color="#ef4444" />
            <Text style={styles.cueBadgeMistake}>3. COMMON MISTAKE TO AVOID</Text>
          </View>
          <Text style={styles.cueBody}>{activeCue.mistake}</Text>
        </View>

        {/* Female Biomechanical Note */}
        <View style={[styles.cueCard, styles.cueCardFemale]}>
          <View style={styles.badgeRow}>
            <Heart size={16} color="#f472b6" />
            <Text style={styles.cueBadgeFemale}>FEMALE BIOMECHANICAL CONTEXT</Text>
          </View>
          <Text style={styles.cueBody}>{activeCue.femaleNote}</Text>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneBtn} 
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.doneBtnText}>Return to Gym Floor</Text>
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
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
  muscleTarget: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  selectorBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  chip: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#ccff0020',
    borderColor: '#ccff00',
  },
  chipText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#ccff00',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  cueCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cueBadgeSetup: {
    fontSize: 11,
    color: '#ccff00',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cueBadgeExec: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cueCardMistake: {
    borderColor: '#ef444440',
    backgroundColor: '#1f1315',
  },
  cueBadgeMistake: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cueCardFemale: {
    borderColor: '#f472b640',
    backgroundColor: '#1c1318',
  },
  cueBadgeFemale: {
    fontSize: 11,
    color: '#f472b6',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cueBody: {
    fontSize: 13,
    color: '#d4d4d8',
    lineHeight: 19,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#18181b',
  },
  doneBtn: {
    backgroundColor: '#ccff00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#09090b',
    fontSize: 15,
    fontWeight: '900',
  },
  });
}
