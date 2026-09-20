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
import { PrimaryCard } from '@/src/components/UIElements';
import BottomSheetWrapper from '@/src/components/BottomSheetWrapper';
import { BottomSheetModal } from '@expo/ui/community/bottom-sheet';

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { user, profile, isAuthenticated } = useAuth();
  const { loadCustomRoutine, setMobilityActive } = useDataFactory();
  const [activeRoutine, setActiveRoutine] = useState<RoutineType>('push_a');

  const scheduleSheetRef = React.useRef<BottomSheetModal>(null);
  const blockModalRef = React.useRef<BottomSheetModal>(null);

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
                    scheduleSheetRef.current?.expand()
                  }}
                >
                  <RotateCcw size={12} color={theme.accent} />
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ),
      }} />
      <ScrollView contentContainerStyle={[styles.scrollContent, { gap: Spacing.two, paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
        {/* TIME-OF-DAY HERO GREETING (Exact Simulator Match) */}
        <View style={styles.heroGreeting}>
          {/* Block Progress Card Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              blockModalRef.current?.expand()
            }}
            activeOpacity={0.8}
          >
            <PrimaryCard style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
              <View style={styles.blockCardTop}>
                <Text style={styles.blockCardLabel}>BLOCK PROGRESS</Text>
                <Sparkles size={11} color={theme.accent} />
              </View>
              <Text style={styles.blockCardValue}>{current.badge}</Text>
            </PrimaryCard>
          </TouchableOpacity>
        </View>

        {/* READINESS & SLEEP INSIGHT CARD (Exact Simulator Match) */}
        <PrimaryCard>
          <View style={styles.readinessHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.moonIconBox}>
                <Moon size={22} color={theme.accent} />
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
              <Sparkles size={14} color={theme.accent} />
              <Text style={styles.coachHeading}>COACH PRESCRIPTION</Text>
            </View>
            <Text style={styles.coachBodyText}>{current.brief}</Text>
          </View>
          <View style={styles.wearableBadge}>
            <Text style={styles.wearableBadgeText}>Wearable Synced</Text>
          </View>
        </PrimaryCard>

        {/* WORKOUT BLUEPRINT AT A GLANCE (Exact Simulator Match) */}
        <PrimaryCard>
          <View style={styles.blueprintTop}>
            <Text style={styles.blueprintTitle}>SCHEDULED BLUEPRINT</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color={theme.accent} />
              <Text style={styles.blueprintDuration}>
                <Text style={{ fontWeight: '900', color: '#ffffff' }}>{current.duration}</Text> Estimated
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
              <Dumbbell size={20} color={theme.accent} />
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
        </PrimaryCard>

        {/* TODAY'S EXERCISE SEQUENCE PREVIEW */}
        <View style={styles.sequenceSection}>
          <PrimaryCard style={{ padding: 0 }}>
            <View style={[styles.sequenceHeader, { padding: 16 }]}>
              <Text style={styles.sequenceTitle}>PRESCRIBED EXERCISE SEQUENCE</Text>
              <Text style={styles.sequenceCount}>{current.exercises.length} Movements</Text>
            </View>
            {current.exercises.map((ex, idx) => (
              <View key={idx} style={[styles.sequenceItem, idx === current.exercises.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.sequenceIndex}>
                  <Text style={styles.sequenceIndexText}>0{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sequenceName}>{ex.name}</Text>
                  <Text style={styles.sequenceSets}>{ex.sets} • <Text style={{ color: theme.accent, fontWeight: '800' }}>{ex.target}</Text></Text>
                  <Text style={styles.sequenceNote}>{ex.note}</Text>
                </View>
                {ex.isCompound && (
                  <View style={styles.compoundTag}>
                    <Text style={styles.compoundTagText}>COMPOUND</Text>
                  </View>
                )}
              </View>
            ))}
          </PrimaryCard>
        </View>

        {/* ONE PRIMARY CTA + 2 REALITY ADAPTATIONS (Exact Simulator Match) */}
        <View style={styles.ctaSection}>
          {/* Main Primary CTA */}
          <TouchableOpacity
            style={styles.mainStartBtn}
            onPress={handleStartGym}
            activeOpacity={0.88}
          >
            <Play size={20} color="#000" fill="#000" />
            <Text style={styles.mainStartBtnText}>Start Gym Mode</Text>
          </TouchableOpacity>

          {/* 2 Reality Adaptations Grid */}
          <View style={styles.adaptationsGrid}>
            <TouchableOpacity
              style={[styles.adaptBtn, activeRoutine === 'crowded_push' && styles.adaptBtnActive]}
              onPress={handleSwapCrowded}
              activeOpacity={0.8}
            >
              <Zap size={16} color={theme.accent} />
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
      <BottomSheetWrapper ref={scheduleSheetRef} key="schedule-manager-sheet">
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <MaskedGlassBG />
            <View>
              <Text style={styles.modalTitle}>Weekly Schedule & Routine</Text>
              <Text style={styles.modalSub}>Select which session to load for today's brief</Text>
            </View>
          </View>

          <ScrollView style={{ flex: 1, overflow: "visible", paddingHorizontal: Spacing.three }}>
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
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleOptionName, isSelected && { color: theme.accent }]}>
                      {conf.displayName}
                    </Text>
                    <Text style={styles.scheduleOptionSub}>
                      {conf.duration} • {conf.primaryLift}
                    </Text>
                  </View>
                  {isSelected && <CheckCircle2 size={18} color={theme.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: Spacing.three }}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => { }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>Close Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetWrapper>

      {/* BLOCK PROGRESS INSPECTION MODAL blockModalRef */}
      <BottomSheetWrapper ref={blockModalRef} dynamicHeight key="block-sheet">
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <MaskedGlassBG />
            <View>
              <Text style={styles.modalTitle}>Block Periodization Status</Text>
              <Text style={styles.modalSub}>Evidence-based mesocycle progression wave</Text>
            </View>
          </View>

          <View style={[styles.blockDetailBox, { gap: Spacing.two, paddingHorizontal: Spacing.three }]}>
            <Text style={styles.blockHeading}>CURRENT PHASE: VOLUME ACCUMULATION</Text>
            <Text style={styles.blockBody}>
              You are on <Text style={{ color: theme.accent, fontWeight: '800' }}>Week 3 of a 6-week cycle</Text>.
              Sets per muscle group are ramping from MEV (Minimum Effective Volume) toward MAV (Maximum Adaptive Volume).
            </Text>

            <View style={styles.blockWaveRow}>
              <View style={{ flexDirection: "row", gap: Spacing.two }}>
                <View style={styles.waveStep}>
                  <Text style={styles.waveStepLabel}>W1–W2</Text>
                  <Text style={styles.waveStepVal}>Baseline</Text>
                </View>
                <View style={[styles.waveStep, { borderColor: theme.accent, backgroundColor: '#ccff0020' }]}>
                  <Text style={[styles.waveStepLabel, { color: theme.accent }]}>W3–W4 (Current)</Text>
                  <Text style={[styles.waveStepVal, { color: theme.accent }]}>Overload (+2.5kg)</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: Spacing.two }}>
                <View style={styles.waveStep}>
                  <Text style={styles.waveStepLabel}>W5</Text>
                  <Text style={styles.waveStepVal}>Peak Volume</Text>
                </View>
                <View style={styles.waveStep}>
                  <Text style={styles.waveStepLabel}>W6</Text>
                  <Text style={styles.waveStepVal}>Deload (-40%)</Text>
                </View>
              </View>
            </View>

            <View style={styles.deloadNote}>
              <Info size={14} color="#a1a1aa" />
              <Text style={styles.deloadNoteText}>
                Deload in Week 6 reduces systemic neural fatigue without losing any myofibrillar hypertrophy.
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: Spacing.three }}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => blockModalRef.current?.dismiss()}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetWrapper>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  const insets = useSafeAreaInsets();

  return createThemeStyles(theme, {
    container: {
      flex: 1,
      backgroundColor: theme.accent,
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
    heroGreeting: {
      // flexDirection: 'row',
      justifyContent: 'space-between',
      // alignItems: 'flex-start',
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
      backgroundColor: theme.success,
    },
    timeTagText: {
      color: theme.textMuted,
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
      color: theme.text,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    accentText: {
      color: theme.accent,
    },
    changeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    changeBtnText: {
      color: theme.text,
      fontSize: 11,
      fontWeight: '700',
    },
    rotationHint: {
      marginTop: 4,
    },
    rotationHintText: {
      color: theme.textSecondary,
      fontSize: 11,
      textAlign: "center"
    },
    blockCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    blockCardLabel: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '800',
    },
    blockCardValue: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '900',
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
      backgroundColor: theme.accent + "11",
      borderWidth: 1,
      borderColor: theme.accent + "22",
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
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    loadBadge: {
      backgroundColor: theme.accent + "11",
      borderWidth: 1,
      borderColor: theme.accent + "22",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    loadBadgeText: {
      color: theme.accent,
      fontSize: 10,
      fontWeight: '800',
    },
    coachPrescription: {
      marginTop: 14,
      backgroundColor: theme.backgroundElement,
      borderRadius: 12,
      padding: 12,
    },
    coachHeading: {
      color: theme.accent,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    coachBodyText: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    blueprintTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
    },
    blueprintTitle: {
      color: theme.textSecondary,
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
      backgroundColor: theme.backgroundElement,
      borderRadius: 14,
      padding: 12,
      marginTop: 12,
    },
    primaryLiftLabel: {
      color: theme.textSecondary,
      fontSize: 9,
      fontWeight: '800',
    },
    primaryLiftName: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '900',
      marginTop: 2,
    },
    primaryLiftTarget: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 2,
    },
    liftIconBox: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: theme.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accessoryGrid: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    accessoryCol: {
      flex: 1,
      backgroundColor: theme.backgroundElement,
      borderRadius: 10,
      padding: 8,
      alignItems: 'center',
    },
    accessoryMuscle: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },
    accessorySets: {
      color: theme.text,
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
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
    },
    sequenceCount: {
      color: '#a1a1aa',
      fontSize: 11,
    },
    sequenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 12,
    },
    sequenceIndex: {
      width: 26,
      height: 26,
      borderRadius: 8,
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sequenceIndexText: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: '800',
    },
    sequenceName: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
    },
    sequenceSets: {
      color: theme.textSecondary,
      fontSize: 11,
      marginTop: 1,
    },
    sequenceNote: {
      color: theme.text,
      fontSize: 10,
      marginTop: 2,
    },
    compoundTag: {
      backgroundColor: theme.accentSubtle,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    compoundTagText: {
      color: theme.accent,
      fontSize: 9,
      fontWeight: '700',
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
      color: "#000",
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
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
    },
    adaptBtnActive: {
      borderColor: theme.accent,
      backgroundColor: theme.bgElevated,
    },
    adaptBtnTitle: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 6,
      textAlign: 'center',
    },
    adaptBtnSub: {
      color: theme.textSecondary,
      fontSize: 10,
      marginTop: 2,
      textAlign: 'center',
    },
    modalBackdrop: {
      flex: 1,
    },
    modalContent: {
      flex: 1,
      // paddingBottom: insets.bottom / 2
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // marginBottom: 16,
      paddingVertical: Spacing.four,
      paddingHorizontal: Spacing.three, zIndex: 9
    },
    modalTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '700',
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
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      marginBottom: 8,
    },
    scheduleOptionActive: {
      borderColor: theme.accentSubtle,
      backgroundColor: theme.backgroundSelected,
    },
    scheduleOptionName: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    scheduleOptionSub: {
      color: theme.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    modalCloseBtn: {
      backgroundColor: theme.backgroundSelected,
      paddingVertical: Spacing.three,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: Spacing.three,
    },
    modalCloseBtnText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
    },
    blockDetailBox: {
      flex: 1
    },
    blockHeading: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    blockBody: {
      color: '#d4d4d8',
      fontSize: 14,
      lineHeight: 20,
    },
    blockWaveRow: {
      gap: Spacing.two,
      flexWrap: 'wrap',
      marginTop: 14,
    },
    waveStep: {
      flex: 1,
      backgroundColor: theme.backgroundElement,
      borderRadius: 8,
      padding: Spacing.three * 0.7,
      alignItems: 'center',
    },
    waveStepLabel: {
      color: theme.accent,
      fontSize: 12,
    },
    waveStepVal: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
      textAlign: 'center',
    },
    deloadNote: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      padding: 10,
      borderRadius: 10,
      marginTop: 12,
    },
    deloadNoteText: {
      flex: 1,
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
  });
}
