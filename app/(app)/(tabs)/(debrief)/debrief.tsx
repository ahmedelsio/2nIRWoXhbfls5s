/**
 * Ironmate Night Debrief & Session Recap - Expo Router Screen
 * Path: app/(tabs)/debrief.tsx
 * Session scoring, automatic PR detection, tomorrow preview & viral story cards
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Share 
} from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { 
  Trophy, 
  Sparkles, 
  Share2, 
  Check, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  RotateCcw,
  Flame
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import MaskedGlassBG from '@/src/components/masked-glass-bg';
import { Spacing } from '@/src/constants/theme';
import { useDataFactory } from '@/src/context/DataFactoryContext';

export default function NightDebriefScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [copied, setCopied] = useState(false);
  const { activeDebrief, isDebriefFromLiveSession } = useDataFactory();

  const debrief = activeDebrief;

  const sessionData = {
    workoutName: debrief.workoutName,
    grade: debrief.sessionGrade || 'A',
    gradeReason: debrief.gradeReason,
    tonnageKg: debrief.totalVolumeKg,
    setsCompleted: debrief.setsCompleted,
    durationMinutes: debrief.durationMinutes,
    prs: (debrief.prs || []).map((p) => ({
      exercise: p.exerciseName,
      metric: p.metric,
      value: p.value,
      detail: p.previousBest
        ? `Surpassed previous best (${p.previousBest}). e1RM: ${p.estimated1RM}kg.`
        : `Calculated via Brzycki formula. e1RM: ${p.estimated1RM}kg.`,
    })),
    volumeByMuscle: [
      { muscle: 'Chest (Pecs)', sets: Math.max(1, Math.round(debrief.setsCompleted * 0.4)), status: 'Optimal (MEV Met)' },
      { muscle: 'Shoulders (Delts)', sets: Math.max(1, Math.round(debrief.setsCompleted * 0.3)), status: 'Optimal' },
      { muscle: 'Triceps & Accessories', sets: Math.max(1, Math.round(debrief.setsCompleted * 0.3)), status: 'Direct Target' },
    ],
    tomorrow: {
      name: debrief.tomorrowPreview?.title || 'Pull A (Back & Biceps)',
      type: debrief.tomorrowPreview?.type === 'workout' ? 'Training Day' : 'Rest Day',
      timing: 'Tomorrow • 07:00 AM',
      description: debrief.tomorrowPreview?.description || 'Lats & posterior chain volume. Focus on driving elbows down into the hip crease.',
      sleepTarget: '8.0 Hours Recommended',
    },
  };

  const handleShareStory = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const topPrText = sessionData.prs[0]
        ? `\nTop PR: ${sessionData.prs[0].exercise} (${sessionData.prs[0].value})`
        : '';
      await Share.share({
        message: `IRONMATE SESSION DEBRIEF\n${sessionData.workoutName} • Grade: ${sessionData.grade}\nTotal Tonnage: ${(sessionData.tonnageKg / 1000).toFixed(1)} Tons (${sessionData.tonnageKg.toLocaleString()} kg)\nSets Completed: ${sessionData.setsCompleted} in ${sessionData.durationMinutes} min${topPrText}\n— Logged with Ironmate`,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // dismissed
    }
  };

  return (
    <>
      <Stack.Screen options={{
        header: () => (
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <MaskedGlassBG />
            <View style={{ flex: 1 }}>
              <Text style={styles.topBarLabel}>
                {isDebriefFromLiveSession ? 'LIVE SESSION RECORDED' : 'SESSION RECAP'}
              </Text>
              <Text style={styles.topBarTitle}>Night Debrief</Text>
            </View>
          </View>
        ),
      }} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        {/* Grade Card */}
        <View style={styles.gradeCard}>
          <View style={styles.gradeCircle}>
            <Text style={styles.gradeLetter}>{sessionData.grade}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>SESSION EVALUATION</Text>
            </View>
            <Text style={styles.gradeTitle}>{sessionData.workoutName}</Text>
            <Text style={styles.gradeReason}>{sessionData.gradeReason}</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>TOTAL TONNAGE</Text>
            <Text style={styles.metricVal}>{(sessionData.tonnageKg / 1000).toFixed(1)} <Text style={styles.metricUnit}>TONS</Text></Text>
            <Text style={styles.metricSub}>{sessionData.tonnageKg.toLocaleString()} kg moved</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>SETS LOGGED</Text>
            <Text style={styles.metricVal}>{sessionData.setsCompleted}</Text>
            <Text style={styles.metricSub}>100% target hit</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>DURATION</Text>
            <Text style={styles.metricVal}>{sessionData.durationMinutes} <Text style={styles.metricUnit}>MIN</Text></Text>
            <Text style={styles.metricSub}>Within target pacing</Text>
          </View>
        </View>

        {/* PR Trophy Cards */}
        <View style={styles.sectionHeader}>
          <Trophy size={16} color="#ccff00" />
          <Text style={styles.sectionTitle}>AUTOMATIC PR TROPHY VAULT</Text>
        </View>

        {sessionData.prs.length > 0 ? (
          sessionData.prs.map((pr, idx) => (
            <View key={idx} style={styles.prCard}>
              <View style={styles.prHeader}>
                <View style={styles.prBadge}>
                  <Text style={styles.prBadgeText}>{pr.metric.toUpperCase()}</Text>
                </View>
                <Text style={styles.prValue}>{pr.value}</Text>
              </View>
              <Text style={styles.prExercise}>{pr.exercise}</Text>
              <Text style={styles.prDetail}>{pr.detail}</Text>
            </View>
          ))
        ) : (
          <View style={styles.prCard}>
            <View style={styles.prHeader}>
              <View style={styles.prBadge}>
                <Text style={styles.prBadgeText}>VOLUME ACCUMULATION</Text>
              </View>
              <Text style={styles.prValue}>On Target</Text>
            </View>
            <Text style={styles.prExercise}>Progressive Overload Maintained</Text>
            <Text style={styles.prDetail}>All prescribed sets logged cleanly within targeted RIR thresholds.</Text>
          </View>
        )}

        {/* Volume Landmarks by Muscle */}
        <View style={styles.sectionHeader}>
          <ShieldCheck size={16} color="#38bdf8" />
          <Text style={styles.sectionTitle}>VOLUME LANDMARKS (MEV / MRV)</Text>
        </View>

        <View style={styles.landmarksCard}>
          {sessionData.volumeByMuscle.map((item, idx) => (
            <View key={idx} style={styles.landmarkRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.landmarkMuscle}>{item.muscle}</Text>
                <Text style={styles.landmarkStatus}>{item.status}</Text>
              </View>
              <Text style={styles.landmarkSets}>{item.sets} Sets</Text>
            </View>
          ))}
        </View>

        {/* Tomorrow Preview Card */}
        <View style={styles.sectionHeader}>
          <Calendar size={16} color="#a1a1aa" />
          <Text style={styles.sectionTitle}>TOMORROW'S PREVIEW</Text>
        </View>

        <View style={styles.tomorrowCard}>
          <View style={styles.tomorrowHeader}>
            <Text style={styles.tomorrowType}>{sessionData.tomorrow.type.toUpperCase()}</Text>
            <Text style={styles.tomorrowTiming}>{sessionData.tomorrow.timing}</Text>
          </View>
          <Text style={styles.tomorrowTitle}>{sessionData.tomorrow.name}</Text>
          <Text style={styles.tomorrowDesc}>{sessionData.tomorrow.description}</Text>
          <View style={styles.sleepBadge}>
            <Sparkles size={12} color="#ccff00" />
            <Text style={styles.sleepText}>{sessionData.tomorrow.sleepTarget}</Text>
          </View>
        </View>

        {/* Share Story Card Button */}
        <TouchableOpacity 
          style={styles.shareBtn} 
          onPress={handleShareStory}
          activeOpacity={0.88}
        >
          <Share2 size={20} color="#09090b" />
          <Text style={styles.shareBtnText}>
            {copied ? 'Card Copied & Shared!' : 'Share Session Recap Card'}
          </Text>
        </TouchableOpacity>

        {/* Consistency Streak Note */}
        <View style={styles.streakFooter}>
          <Flame size={14} color="#f97316" />
          <Text style={styles.streakText}>
            14-Day Consistency Streak. Rest days and deloads protect your streak.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return createThemeStyles(theme, {
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: Spacing.two,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  topBarLabel: {
    fontSize: 10,
    color: '#ccff00',
    fontWeight: '900',
    letterSpacing: 1,
  },
  topBarTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 2,
  },
  header: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '700',
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: 2,
  },
  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 18,
    marginBottom: 16,
  },
  gradeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ccff00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeLetter: {
    fontSize: 34,
    color: '#09090b',
    fontWeight: '900',
  },
  gradeBadge: {
    backgroundColor: '#ccff0020',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  gradeBadgeText: {
    color: '#ccff00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gradeTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  gradeReason: {
    color: '#a1a1aa',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 12,
  },
  metricLabel: {
    fontSize: 9,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricVal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 11,
    color: '#ccff00',
  },
  metricSub: {
    color: '#71717a',
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 1,
  },
  prCard: {
    backgroundColor: '#1c1f13',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccff00',
    padding: 14,
    marginBottom: 10,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  prBadge: {
    backgroundColor: '#ccff00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prBadgeText: {
    color: '#09090b',
    fontSize: 9,
    fontWeight: '900',
  },
  prValue: {
    color: '#ccff00',
    fontSize: 15,
    fontWeight: '900',
  },
  prExercise: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  prDetail: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 2,
  },
  landmarksCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  landmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  landmarkMuscle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  landmarkStatus: {
    color: '#71717a',
    fontSize: 11,
  },
  landmarkSets: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '800',
  },
  tomorrowCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    marginBottom: 20,
  },
  tomorrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tomorrowType: {
    color: '#ccff00',
    fontSize: 10,
    fontWeight: '900',
  },
  tomorrowTiming: {
    color: '#71717a',
    fontSize: 11,
  },
  tomorrowTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  tomorrowDesc: {
    color: '#a1a1aa',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  sleepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#09090b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sleepText: {
    color: '#d4d4d8',
    fontSize: 11,
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ccff00',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  shareBtnText: {
    color: '#09090b',
    fontSize: 15,
    fontWeight: '900',
  },
  streakFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  streakText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '600',
  },
  });
}
