/**
 * Ironmate Today / Morning Brief - Expo Router Screen
 * Path: app/(tabs)/index.tsx
 * Time-of-day greeting, Block Progress inspection, Wearable Readiness, Blueprint breakdown & Reality Adaptations
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet
} from 'react-native';
import { router, Stack, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Sun,
  Play,
  Clock,
  TrendingUp,
  BatteryMedium,
  AlertCircle,
  Dumbbell,
  Users,
  Sparkles,
  Layers,
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Moon,
  RotateCcw,
  Zap,
  Calendar,
  X,
  Info
} from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useDataFactory } from '@/src/context/DataFactoryContext';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import MaskedGlassBG from '@/src/components/masked-glass-bg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/theme';
import {
  ROUTINE_CONFIGS,
  type RoutineType,
  type ExercisePreview,
  getRoutineSession,
} from '@/src/data/programCatalog';

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { user, profile, isAuthenticated } = useAuth();
  const { loadCustomRoutine, setMobilityActive } = useDataFactory();
  const [activeRoutine, setActiveRoutine] = useState<RoutineType>('push_a');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const current = ROUTINE_CONFIGS[activeRoutine];

  const commitRoutine = (key: RoutineType) => {
    setActiveRoutine(key);
    setMobilityActive(key === 'mobility');
    const session = getRoutineSession(key);
    loadCustomRoutine(session.workout, session.briefing);
  };

  const handleStartGym = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    commitRoutine(activeRoutine);
    router.push('/(app)/(tabs)/(gym)/gym' as Href);
  };

  const handleSwapCrowded = () => {
    Haptics.selectionAsync();
    commitRoutine('crowded_push');
  };

  const handleSelectMobility = () => {
    Haptics.selectionAsync();
    commitRoutine('mobility');
  };

  const lifterName = profile?.display_name || user?.user_metadata?.display_name || (user?.email ? user.email.split('@')[0] : 'Lifter');

  return (
    <>
      <Stack.Screen options={{
        header: () => (
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <MaskedGlassBG />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={styles.timeTagRow}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.timeTagText}>07:15 AM • MORNING BRIEFING</Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push('/modal/auth');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    backgroundColor: isAuthenticated ? '#16a34a15' : '#eab30815',
                    borderWidth: 1,
                    borderColor: isAuthenticated ? '#16a34a30' : '#eab30830',
                  }}
                >
                  <ShieldCheck size={11} color={isAuthenticated ? '#4ade80' : '#facc15'} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isAuthenticated ? '#4ade80' : '#facc15', fontFamily: 'monospace' }}>
                    {isAuthenticated ? lifterName : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.titleRow}>
                <Text style={styles.headlineTitle}>
                  Today is <Text style={styles.accentText}>{current.name}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowScheduleModal(true);
                  }}
                >
                  <RotateCcw size={12} color="#ccff00" />
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ),
      }} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        {/* TIME-OF-DAY HERO GREETING (Exact Simulator Match) */}
        <View style={styles.heroGreeting}>
          {/* Block Progress Card Button */}
          <TouchableOpacity
            style={styles.blockCard}
            onPress={() => {
              Haptics.selectionAsync();
              setShowBlockModal(true);
            }}
          >
            <View style={styles.blockCardTop}>
              <Text style={styles.blockCardLabel}>BLOCK PROGRESS</Text>
              <Sparkles size={11} color="#ccff00" />
            </View>
            <Text style={styles.blockCardValue}>{current.badge}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowScheduleModal(true);
            }}
            style={styles.rotationHint}
          >
            <Text style={styles.rotationHintText}>
              Determined by your 5-day PPL rotation • <Text style={{ textDecorationLine: 'underline' }}>View or edit schedule</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* READINESS & SLEEP INSIGHT CARD (Exact Simulator Match) */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.moonIconBox}>
                <Moon size={22} color="#ccff00" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.readinessScoreText}>Readiness Score: 85%</Text>
                </View>
                <Text style={styles.sleepSubText}>Sleep: 6h 15m (35m below 7h baseline)</Text>
              </View>
            </View>

            <View style={styles.loadBadge}>
              <Text style={styles.loadBadgeText}>Hold Top Load</Text>
            </View>
          </View>

          {/* Coach Prescription Bubble */}
          <View style={styles.coachPrescription}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#ccff00" />
              <Text style={styles.coachHeading}>COACH PRESCRIPTION</Text>
            </View>
            <Text style={styles.coachBodyText}>{current.brief}</Text>
          </View>
          <View style={styles.wearableBadge}>
            <Text style={styles.wearableBadgeText}>Wearable Synced</Text>
          </View>
        </View>

        {/* WORKOUT BLUEPRINT AT A GLANCE (Exact Simulator Match) */}
        <View style={styles.blueprintCard}>
          <View style={styles.blueprintTop}>
            <Text style={styles.blueprintTitle}>SCHEDULED BLUEPRINT</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color="#ccff00" />
              <Text style={styles.blueprintDuration}>
                <Text style={{ fontWeight: '900', color: '#ffffff' }}>{current.duration}</Text> estimated
              </Text>
            </View>
          </View>

          {/* Primary Lift Focus */}
          <View style={styles.primaryLiftBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryLiftLabel}>PRIMARY COMPOUND LIFT</Text>
              <Text style={styles.primaryLiftName}>{current.primaryLift}</Text>
              <Text style={styles.primaryLiftTarget}>{current.primaryTarget}</Text>
            </View>
            <View style={styles.liftIconBox}>
              <Dumbbell size={20} color="#ccff00" />
            </View>
          </View>

          {/* Accessory Muscle Targets Grid */}
          <View style={styles.accessoryGrid}>
            {current.accessoryBreakdown.map((item, idx) => (
              <View key={idx} style={styles.accessoryCol}>
                <Text style={styles.accessoryMuscle}>{item.muscle}</Text>
                <Text style={styles.accessorySets}>{item.sets}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TODAY'S EXERCISE SEQUENCE PREVIEW */}
        <View style={styles.sequenceSection}>
          <View style={styles.sequenceHeader}>
            <Text style={styles.sequenceTitle}>PRESCRIBED EXERCISE SEQUENCE</Text>
            <Text style={styles.sequenceCount}>{current.exercises.length} Movements</Text>
          </View>

          <View style={styles.sequenceList}>
            {current.exercises.map((ex, idx) => (
              <View key={idx} style={styles.sequenceItem}>
                <View style={styles.sequenceIndex}>
                  <Text style={styles.sequenceIndexText}>0{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sequenceName}>{ex.name}</Text>
                  <Text style={styles.sequenceSets}>{ex.sets} • <Text style={{ color: '#ccff00', fontWeight: '800' }}>{ex.target}</Text></Text>
                  <Text style={styles.sequenceNote}>{ex.note}</Text>
                </View>
                {ex.isCompound && (
                  <View style={styles.compoundTag}>
                    <Text style={styles.compoundTagText}>COMPOUND</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ONE PRIMARY CTA + 2 REALITY ADAPTATIONS (Exact Simulator Match) */}
        <View style={styles.ctaSection}>
          {/* Main Primary CTA */}
          <TouchableOpacity
            style={styles.mainStartBtn}
            onPress={handleStartGym}
            activeOpacity={0.88}
          >
            <Play size={20} color="#09090b" fill="#09090b" />
            <Text style={styles.mainStartBtnText}>Start Gym Mode</Text>
          </TouchableOpacity>

          {/* 2 Reality Adaptations Grid */}
          <View style={styles.adaptationsGrid}>
            <TouchableOpacity
              style={[styles.adaptBtn, activeRoutine === 'crowded_push' && styles.adaptBtnActive]}
              onPress={handleSwapCrowded}
              activeOpacity={0.8}
            >
              <Zap size={16} color="#ccff00" />
              <Text style={styles.adaptBtnTitle}>30-Min Crowded Gym</Text>
              <Text style={styles.adaptBtnSub}>Dumbbell superset version</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adaptBtn, activeRoutine === 'mobility' && styles.adaptBtnActive]}
              onPress={handleSelectMobility}
              activeOpacity={0.8}
            >
              <ShieldCheck size={16} color="#4ade80" />
              <Text style={styles.adaptBtnTitle}>Switch to Rest / Mobility</Text>
              <Text style={styles.adaptBtnSub}>Protects your streak</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* SCHEDULE MANAGER MODAL (Change Today's Session) */}
      <Modal visible={showScheduleModal} presentationStyle='formSheet' allowSwipeDismissal animationType='slide' onRequestClose={() => setShowScheduleModal(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Weekly Schedule & Routine</Text>
              <Text style={styles.modalSub}>Select which session to load for today's brief</Text>
            </View>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {(Object.keys(ROUTINE_CONFIGS) as RoutineType[]).map((key) => {
              const conf = ROUTINE_CONFIGS[key];
              const isSelected = activeRoutine === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.scheduleOption, isSelected && styles.scheduleOptionActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    commitRoutine(key);
                    setShowScheduleModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleOptionName, isSelected && { color: '#ccff00' }]}>
                      {conf.displayName}
                    </Text>
                    <Text style={styles.scheduleOptionSub}>
                      {conf.duration} • {conf.primaryLift}
                    </Text>
                  </View>
                  {isSelected && <CheckCircle2 size={18} color="#ccff00" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setShowScheduleModal(false)}
          >
            <Text style={styles.modalCloseBtnText}>Close Schedule</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* BLOCK PROGRESS INSPECTION MODAL */}
      <Modal visible={showBlockModal} presentationStyle='formSheet' allowSwipeDismissal animationType='slide' onRequestClose={() => setShowBlockModal(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Block Periodization Status</Text>
              <Text style={styles.modalSub}>Evidence-based mesocycle progression wave</Text>
            </View>
            <TouchableOpacity onPress={() => setShowBlockModal(false)}>
              <X size={20} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <View style={styles.blockDetailBox}>
            <Text style={styles.blockHeading}>CURRENT PHASE: VOLUME ACCUMULATION</Text>
            <Text style={styles.blockBody}>
              You are on <Text style={{ color: '#ccff00', fontWeight: '800' }}>Week 3 of a 6-week cycle</Text>.
              Sets per muscle group are ramping from MEV (Minimum Effective Volume) toward MAV (Maximum Adaptive Volume).
            </Text>

            <View style={styles.blockWaveRow}>
              <View style={styles.waveStep}>
                <Text style={styles.waveStepLabel}>W1–W2</Text>
                <Text style={styles.waveStepVal}>Baseline</Text>
              </View>
              <View style={[styles.waveStep, { borderColor: '#ccff00', backgroundColor: '#ccff0020' }]}>
                <Text style={[styles.waveStepLabel, { color: '#ccff00' }]}>W3–W4 (Current)</Text>
                <Text style={[styles.waveStepVal, { color: '#ccff00' }]}>Overload (+2.5kg)</Text>
              </View>
              <View style={styles.waveStep}>
                <Text style={styles.waveStepLabel}>W5</Text>
                <Text style={styles.waveStepVal}>Peak Volume</Text>
              </View>
              <View style={styles.waveStep}>
                <Text style={styles.waveStepLabel}>W6</Text>
                <Text style={styles.waveStepVal}>Deload (-40%)</Text>
              </View>
            </View>

            <View style={styles.deloadNote}>
              <Info size={14} color="#a1a1aa" />
              <Text style={styles.deloadNoteText}>
                Deload in Week 6 reduces systemic neural fatigue without losing any myofibrillar hypertrophy.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setShowBlockModal(false)}
          >
            <Text style={styles.modalCloseBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    heroGreeting: {
      // flexDirection: 'row',
      justifyContent: 'space-between',
      // alignItems: 'flex-start',
      marginBottom: 16,
    },
    timeTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#4ade80',
    },
    timeTagText: {
      color: '#71717a',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    headlineTitle: {
      fontSize: 24,
      color: '#ffffff',
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    accentText: {
      color: '#ccff00',
    },
    changeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#18181b',
      borderWidth: 1,
      borderColor: '#27272a',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    changeBtnText: {
      color: '#ccff00',
      fontSize: 11,
      fontWeight: '700',
    },
    rotationHint: {
      marginTop: 4,
    },
    rotationHintText: {
      color: '#71717a',
      fontSize: 11,
    },
    blockCard: {
      flexDirection: 'row',
      backgroundColor: '#18181b',
      borderWidth: 1,
      borderColor: '#27272a',
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: "space-between",
    },
    blockCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    blockCardLabel: {
      color: '#71717a',
      fontSize: 9,
      fontWeight: '800',
    },
    blockCardValue: {
      color: '#ccff00',
      fontSize: 12,
      fontWeight: '900',
    },
    blockCardSub: {
      color: '#52525b',
      fontSize: 9,
      marginTop: 1,
    },
    readinessCard: {
      backgroundColor: '#18181b',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#27272a',
      padding: 16,
      marginBottom: 16,
    },
    readinessHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    moonIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#ccff0015',
      borderWidth: 1,
      borderColor: '#ccff0030',
      alignItems: 'center',
      justifyContent: 'center',
    },
    readinessScoreText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
    },
    wearableBadge: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
      marginTop: 8,
      marginBottom: -6
    },
    wearableBadgeText: {
      color: '#a1a1aa',
      fontSize: 9,
      fontWeight: '700',
      textAlign: 'center'
    },
    sleepSubText: {
      color: '#a1a1aa',
      fontSize: 12,
      marginTop: 2,
    },
    loadBadge: {
      backgroundColor: '#ccff0020',
      borderWidth: 1,
      borderColor: '#ccff0040',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    loadBadgeText: {
      color: '#ccff00',
      fontSize: 10,
      fontWeight: '800',
    },
    coachPrescription: {
      marginTop: 14,
      backgroundColor: '#09090b',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: '#27272a',
    },
    coachHeading: {
      color: '#ccff00',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    coachBodyText: {
      color: '#d4d4d8',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    blueprintCard: {
      backgroundColor: '#18181b',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#27272a',
      padding: 16,
      marginBottom: 16,
    },
    blueprintTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#27272a',
    },
    blueprintTitle: {
      color: '#71717a',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    blueprintDuration: {
      color: '#a1a1aa',
      fontSize: 12,
    },
    primaryLiftBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#09090b',
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#27272a',
      marginTop: 12,
    },
    primaryLiftLabel: {
      color: '#71717a',
      fontSize: 9,
      fontWeight: '800',
    },
    primaryLiftName: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '900',
      marginTop: 2,
    },
    primaryLiftTarget: {
      color: '#ccff00',
      fontSize: 12,
      fontWeight: '800',
      marginTop: 2,
    },
    liftIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#18181b',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#27272a',
    },
    accessoryGrid: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    accessoryCol: {
      flex: 1,
      backgroundColor: '#09090b',
      borderRadius: 10,
      padding: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#27272a',
    },
    accessoryMuscle: {
      color: '#71717a',
      fontSize: 10,
      fontWeight: '700',
    },
    accessorySets: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
      marginTop: 2,
    },
    sequenceSection: {
      marginBottom: 16,
    },
    sequenceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sequenceTitle: {
      color: '#71717a',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    sequenceCount: {
      color: '#a1a1aa',
      fontSize: 11,
    },
    sequenceList: {
      backgroundColor: '#18181b',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#27272a',
      overflow: 'hidden',
    },
    sequenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#27272a',
      gap: 12,
    },
    sequenceIndex: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: '#09090b',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sequenceIndexText: {
      color: '#71717a',
      fontSize: 10,
      fontWeight: '800',
    },
    sequenceName: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '800',
    },
    sequenceSets: {
      color: '#a1a1aa',
      fontSize: 11,
      marginTop: 1,
    },
    sequenceNote: {
      color: '#71717a',
      fontSize: 10,
      marginTop: 2,
    },
    compoundTag: {
      backgroundColor: '#ccff0015',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    compoundTagText: {
      color: '#ccff00',
      fontSize: 8,
      fontWeight: '900',
    },
    ctaSection: {
      gap: 16,
      marginTop: 4,
    },
    mainStartBtn: {
      minHeight: 56,
      borderRadius: 16,
      backgroundColor: theme.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: theme.accent,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    mainStartBtnText: {
      color: '#09090b',
      fontSize: 14,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    adaptationsGrid: {
      flexDirection: 'row',
      gap: 16,
    },
    adaptBtn: {
      flex: 1,
      backgroundColor: '#18181b',
      borderWidth: 1,
      borderColor: '#27272a',
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
    },
    adaptBtnActive: {
      borderColor: '#ccff00',
      backgroundColor: '#1a1d13',
    },
    adaptBtnTitle: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
      marginTop: 6,
      textAlign: 'center',
    },
    adaptBtnSub: {
      color: '#71717a',
      fontSize: 10,
      marginTop: 2,
      textAlign: 'center',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      flex: 1,
      backgroundColor: '#18181b',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: '#27272a',
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    modalTitle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '900',
    },
    modalSub: {
      color: '#a1a1aa',
      fontSize: 12,
      marginTop: 2,
    },
    scheduleOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#09090b',
      borderWidth: 1,
      borderColor: '#27272a',
      marginBottom: 8,
    },
    scheduleOptionActive: {
      borderColor: '#ccff00',
      backgroundColor: '#1a1d13',
    },
    scheduleOptionName: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
    },
    scheduleOptionSub: {
      color: '#71717a',
      fontSize: 11,
      marginTop: 2,
    },
    modalCloseBtn: {
      backgroundColor: '#27272a',
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    modalCloseBtnText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '800',
    },
    blockDetailBox: {
      backgroundColor: '#09090b',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#27272a',
      marginBottom: 10,
    },
    blockHeading: {
      color: '#ccff00',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    blockBody: {
      color: '#d4d4d8',
      fontSize: 13,
      lineHeight: 18,
    },
    blockWaveRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 14,
    },
    waveStep: {
      flex: 1,
      backgroundColor: '#18181b',
      borderWidth: 1,
      borderColor: '#27272a',
      borderRadius: 10,
      padding: 8,
      alignItems: 'center',
    },
    waveStepLabel: {
      color: '#71717a',
      fontSize: 9,
      fontWeight: '800',
    },
    waveStepVal: {
      color: '#a1a1aa',
      fontSize: 10,
      fontWeight: '700',
      marginTop: 2,
      textAlign: 'center',
    },
    deloadNote: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      backgroundColor: '#18181b',
      padding: 10,
      borderRadius: 10,
      marginTop: 12,
    },
    deloadNoteText: {
      flex: 1,
      color: '#a1a1aa',
      fontSize: 11,
      lineHeight: 15,
    },
  });
}
