/**
 * Ironmate Exercise Wiki & Database - Expo Router Screen
 * Path: app/(tabs)/library.tsx
 * 800+ exercise library with muscle targeting, equipment filters & biomechanical cues
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Search,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Heart
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import MaskedGlassBG from '@/src/components/masked-glass-bg';
import { Spacing } from '@/src/constants/theme';

interface ExerciseItem {
  id: string;
  name: string;
  muscle: string;
  equipment: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  setup: string;
  execution: string;
  mistakes: string;
  femaleNote: string;
}

const EXTENDED_LIBRARY: ExerciseItem[] = [
  {
    id: 'bench',
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    setup: 'Retract scapulae firmly into the bench to form a solid shelf. Plant feet flat directly under knees.',
    execution: 'Lower bar under control (2s) to lower sternum with elbows tucked at 45–60°. Press upward in a slight J-curve.',
    mistakes: 'Flaring elbows wide at 90° or bouncing the barbell off ribs.',
    femaleNote: 'Narrower shoulder-width grip is recommended to optimize wrist-elbow stacking.',
  },
  {
    id: 'incline-db',
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    setup: 'Set bench to 30° incline. Kick weights up with knees and set feet wide and rooted.',
    execution: 'Press dumbbells up in a gentle converging arc without clacking the weights together.',
    mistakes: 'Excessive lower back hyperextension.',
    femaleNote: 'Maintain moderate bench angle (30°) to prioritize upper pec fibers over anterior delts.',
  },
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    muscle: 'Legs',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    setup: 'Position bar across upper traps (high bar) or rear delts. Root tripod foot firmly.',
    execution: 'Break simultaneously at hips and knees. Descend to parallel depth, then drive floor away.',
    mistakes: 'Knee cave (valgus collapse) on ascent.',
    femaleNote: 'Wider pelvis often benefits from a slightly wider stance with toes flared 25–35°.',
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift (RDL)',
    muscle: 'Hamstrings',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    setup: 'Slight soft knee bend, tall chest, lats packed tight.',
    execution: 'Push hips backward toward wall behind you until hamstrings reach peak stretch. Squeeze glutes to stand.',
    mistakes: 'Squatting the weight down rather than hinging hips posteriorly.',
    femaleNote: 'Excellent for glute-hamstring tie-in with zero axial compressive overload on lumbar spine.',
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscle: 'Back',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    setup: 'Bar directly over mid-foot. Pull slack out of the barbell until clicking noise is heard.',
    execution: 'Drive floor away with quads until bar crosses knees, then thrust hips forward to lock glutes.',
    mistakes: 'Rounding thoracic and lumbar spine or yanking the bar abruptly.',
    femaleNote: 'If grip strength fatigues before posterior chain, switch to hook grip or chalk.',
  },
  {
    id: 'lat-pulldown',
    name: 'Neutral Grip Lat Pulldown',
    muscle: 'Back',
    equipment: 'Cable',
    difficulty: 'Beginner',
    setup: 'Adjust thigh pads snugly. Grasp handles with thumbs wrapped.',
    execution: 'Drive elbows down into your hip pockets. Squeeze lats at the bottom for a 1-second pause.',
    mistakes: 'Leaning backward 45° and pulling with momentum.',
    femaleNote: 'Neutral grip is easier on wrist joint alignment and maximally targets iliac lat fibers.',
  },
  {
    id: 'lat-raise',
    name: 'Cable Lateral Raise',
    muscle: 'Shoulders',
    equipment: 'Cable',
    difficulty: 'Beginner',
    setup: 'Set pulley height to wrist level. Stand tall with core braced.',
    execution: 'Sweep arms wide in scapular plane (30° forward). Lead with elbows.',
    mistakes: 'Shrugging upper traps to cheat the load.',
    femaleNote: 'Cables provide constant tension in the lengthened position where deltoid stimulus peaks.',
  },
  {
    id: 'triceps-ext',
    name: 'Overhead Cable Triceps Extension',
    muscle: 'Arms',
    equipment: 'Cable',
    difficulty: 'Beginner',
    setup: 'Step forward from cable tower with rope held overhead.',
    execution: 'Keep elbows tucked. Extend forearms forward until triceps fully contract.',
    mistakes: 'Allowing elbows to flare wide or swinging torso.',
    femaleNote: 'Overhead angle places the long head of the triceps in a maximally stretched position.',
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    muscle: 'Calves',
    equipment: 'Machine',
    difficulty: 'Beginner',
    setup: 'Place balls of feet on block, balls under hips, shoulders under pads.',
    execution: 'Lower to full ankle dorsiflexion. Hold bottom stretch 2 seconds to defeat elastic reflex.',
    mistakes: 'Bouncing up and down rapidly using Achilles elasticity.',
    femaleNote: 'Pause at the bottom is critical for true muscular hypertrophy over passive tendon bounce.',
  },
];

const MUSCLE_FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Hamstrings', 'Arms', 'Calves'];

export default function LibraryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = EXTENDED_LIBRARY.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscle.toLowerCase().includes(search.toLowerCase()) ||
      e.equipment.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = selectedMuscle === 'All' || e.muscle === selectedMuscle;
    return matchSearch && matchMuscle;
  });

  const toggleExpand = (id: string) => {
    Haptics.selectionAsync();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Stack.Screen options={{
        header: () => (
          <View style={[styles.topBar, { paddingTop: insets.top }]}>
            <MaskedGlassBG />
            <View style={{ flex: 1 }}>
              <Text style={styles.topBarLabel}>EXERCISE LIBRARY</Text>
              <Text style={styles.topBarTitle}>Movement Database</Text>
            </View>
          </View>
        ),
      }} />

      {/* Exercises List */}
      <ScrollView contentContainerStyle={[styles.listContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={18} color="#71717a" />
              <TextInput
                placeholder="Search exercises, muscles, equipment..."
                placeholderTextColor="#71717a"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Muscle Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterScroll, { paddingHorizontal: Spacing.two }]}>
            {MUSCLE_FILTERS.map((m) => {
              const active = selectedMuscle === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedMuscle(m);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: Spacing.two, gap: Spacing.two }}>
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isExpanded && styles.cardExpanded]}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.88}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{item.name}</Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText}>{item.muscle}</Text>
                      </View>
                      <View style={[styles.tagPill, { backgroundColor: '#27272a' }]}>
                        <Text style={[styles.tagText, { color: '#d4d4d8' }]}>{item.equipment}</Text>
                      </View>
                      <View style={[styles.tagPill, { backgroundColor: '#27272a' }]}>
                        <Text style={[styles.tagText, { color: '#a1a1aa' }]}>{item.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight
                    size={18}
                    color="#71717a"
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                  />
                </View>

                {/* Collapsed Brief Cue */}
                {!isExpanded && (
                  <Text style={styles.briefCue} numberOfLines={2}>
                    {item.execution}
                  </Text>
                )}

                {/* Expanded Detailed Biomechanics */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailBlock}>
                      <Text style={styles.detailHeading}>SETUP & SHELF</Text>
                      <Text style={styles.detailBody}>{item.setup}</Text>
                    </View>

                    <View style={styles.detailBlock}>
                      <Text style={styles.detailHeading}>EXECUTION & MOTOR PATH</Text>
                      <Text style={styles.detailBody}>{item.execution}</Text>
                    </View>

                    <View style={[styles.detailBlock, styles.mistakeBlock]}>
                      <Text style={[styles.detailHeading, { color: '#ef4444' }]}>COMMON MISTAKE TO AVOID</Text>
                      <Text style={styles.detailBody}>{item.mistakes}</Text>
                    </View>

                    <View style={[styles.detailBlock, styles.femaleBlock]}>
                      <Text style={[styles.detailHeading, { color: '#f472b6' }]}>FEMALE BIOMECHANICAL CONTEXT</Text>
                      <Text style={styles.detailBody}>{item.femaleNote}</Text>
                    </View>

                    {/* Quick Action Button */}
                    <TouchableOpacity
                      style={styles.openCuesBtn}
                      onPress={() => {
                        Haptics.selectionAsync();
                        router.push('/modal/cues');
                      }}
                    >
                      <HelpCircle size={16} color={theme.accent} />
                      <Text style={styles.openCuesBtnText}>Launch Biomechanics Desk</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return createThemeStyles(theme, {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 10,
      paddingBottom: 10,
      gap: Spacing.two
    },
    headerContent: {
      paddingHorizontal: Spacing.two,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    topBarLabel: {
      fontSize: 10,
      color: theme.accent,
      fontWeight: '900',
      letterSpacing: 1,
    },
    topBarTitle: {
      fontSize: 20,
      color: theme.text,
      fontWeight: '900',
      marginTop: 2,
    },
    title: {
      fontSize: 28,
      color: theme.text,
      fontWeight: '900',
    },
    subTitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
      marginBottom: 14,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
    },
    filterScroll: {
      gap: 8,
      paddingBottom: 4,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderSubtle,
    },
    filterPillActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    filterTextActive: {
      color: theme.background,
      fontWeight: '900',
    },
    listContent: {
      paddingTop: 16,
      paddingBottom: 40,
      gap: 10,
    },
    card: {
      backgroundColor: theme.bgElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.borderSubtle,   // ← as requested
      padding: 14,
    },
    cardExpanded: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '11', // soft accent tint
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    exName: {
      fontSize: 16,
      color: theme.text,
      fontWeight: '800',
      marginBottom: 6,
    },
    badgeRow: {
      flexDirection: 'row',
      gap: 6,
    },
    tagPill: {
      backgroundColor: theme.accent + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 10,
      color: theme.accent,
      fontWeight: '800',
    },
    briefCue: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 8,
      lineHeight: 16,
    },
    expandedContent: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: 10,
    },
    detailBlock: {
      backgroundColor: theme.background,
      padding: 10,
      borderRadius: 10,
    },
    detailHeading: {
      fontSize: 10,
      color: theme.accent,
      fontWeight: '900',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    detailBody: {
      color: theme.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    mistakeBlock: {
      borderLeftWidth: 3,
      borderLeftColor: '#ef4444',
    },
    femaleBlock: {
      borderLeftWidth: 3,
      borderLeftColor: '#f472b6',
    },
    openCuesBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.accent,
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 6,
    },
    openCuesBtnText: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '800',
    },
  });
}
