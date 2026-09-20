/**
 * Ironmate Exercise Wiki & Database - Expo Router Screen
 * Path: app/(tabs)/library.tsx
 * 800+ exercise library with muscle targeting, equipment filters & biomechanical cues
 */
import React, { useState, useEffect, useMemo } from 'react';
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
import { ExerciseRepository, FALLBACK_EXERCISES, type Exercise } from '@/src/libs/supabase/exercise.repository';

interface ExerciseItem {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  setup: string;
  execution: string;
  mistakes: string;
  femaleNote: string;
}

function mapExerciseRow(row: Exercise): ExerciseItem {
  let mistakes = '';
  if (Array.isArray(row.common_mistakes)) {
    mistakes = row.common_mistakes.join('. ');
  } else if (typeof row.common_mistakes === 'string') {
    try {
      const parsed = JSON.parse(row.common_mistakes);
      mistakes = Array.isArray(parsed) ? parsed.join('. ') : row.common_mistakes;
    } catch {
      mistakes = row.common_mistakes;
    }
  } else if (row.common_mistakes) {
    mistakes = String(row.common_mistakes);
  }

  const formatCapitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return {
    id: row.id,
    name: row.name,
    muscle: row.primary_muscle,
    equipment: formatCapitalize(row.equipment_category || ''),
    difficulty: formatCapitalize(row.difficulty || ''),
    setup: row.setup_cue || '',
    execution: row.execution_cue || '',
    mistakes,
    femaleNote: row.female_consideration || '',
  };
}

export default function LibraryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [exercises, setExercises] = useState<ExerciseItem[]>(() =>
    FALLBACK_EXERCISES.map(mapExerciseRow)
  );
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadExercises() {
      try {
        const rows = await ExerciseRepository.list();
        if (isMounted && rows && rows.length > 0) {
          setExercises(rows.map(mapExerciseRow));
        }
      } catch (err) {
        console.warn('[LibraryScreen] Error loading exercises, using fallback:', err);
        if (isMounted) {
          setExercises(FALLBACK_EXERCISES.map(mapExerciseRow));
        }
      }
    }
    loadExercises();
    return () => {
      isMounted = false;
    };
  }, []);

  const muscleFilters = useMemo(() => {
    const unique = Array.from(new Set(exercises.map((e) => e.muscle).filter(Boolean)));
    return ['All', ...unique];
  }, [exercises]);

  const filtered = exercises.filter((e) => {
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
            {muscleFilters.map((m) => {
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
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises loaded.</Text>
            </View>
          ) : (
            filtered.map((item) => {
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
          }))}
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
      fontWeight: '700',
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
    emptyContainer: {
      paddingVertical: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
