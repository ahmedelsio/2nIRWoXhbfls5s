/**
 * Ironmate Barbell Plate Calculator Modal - Expo Router
 * Path: app/modal/plates.tsx
 * Calibrated Olympic Barbell visualizer matching the simulator's graphical sleeve & bumper plates
 */
import React, { useState } from 'react';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Check, Calculator, Dumbbell, Sparkles } from 'lucide-react-native';
import { useDataFactory } from '@/src/context/DataFactoryContext';

const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

interface PlateVisualConfig {
  bg: string;
  border: string;
  textColor: string;
  height: number;
  width: number;
}

const PLATE_VISUAL_STYLES: Record<number, PlateVisualConfig> = {
  25: { bg: '#dc2626', border: '#ef4444', textColor: '#ffffff', height: 104, width: 28 }, // Red
  20: { bg: '#2563eb', border: '#3b82f6', textColor: '#ffffff', height: 100, width: 26 }, // Blue
  15: { bg: '#eab308', border: '#facc15', textColor: '#09090b', height: 86, width: 24 },  // Yellow
  10: { bg: '#16a34a', border: '#22c55e', textColor: '#ffffff', height: 76, width: 22 },  // Green
  5:  { bg: '#f4f4f5', border: '#e4e4e7', textColor: '#09090b', height: 60, width: 20 },  // White
  2.5:{ bg: '#3f3f46', border: '#52525b', textColor: '#ffffff', height: 48, width: 18 },  // Black
  1.25:{ bg: '#71717a', border: '#a1a1aa', textColor: '#ffffff', height: 38, width: 16 }, // Silver
};

export default function PlateCalculatorModal() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const params = useLocalSearchParams<{ weight?: string; exerciseIndex?: string; setIndex?: string }>();
  const { updateActiveWorkoutSet, activeWorkout } = useDataFactory();

  const initialWeight = params.weight ? parseFloat(params.weight) : 82.5;
  const [targetWeight, setTargetWeight] = useState<number>(!isNaN(initialWeight) ? initialWeight : 82.5);
  const [barWeight, setBarWeight] = useState<number>(20);

  // Calculate plates used per side
  const calculatePlates = (totalKg: number, barKg: number) => {
    let remainderPerSide = Math.max(0, (totalKg - barKg) / 2);
    const platesUsed: { weight: number; count: number }[] = [];

    for (const plate of STANDARD_PLATES) {
      const count = Math.floor(remainderPerSide / plate);
      if (count > 0) {
        platesUsed.push({ weight: plate, count });
        remainderPerSide = Number((remainderPerSide - count * plate).toFixed(3));
      }
    }

    return { platesUsed, unachieved: remainderPerSide * 2 };
  };

  const { platesUsed, unachieved } = calculatePlates(targetWeight, barWeight);
  const loadPerSide = Math.max(0, (targetWeight - barWeight) / 2);

  // Flattened array of each individual plate on the sleeve
  const sleevePlates: number[] = platesUsed.flatMap((p) =>
    Array.from({ length: p.count }, () => p.weight)
  );

  const adjustWeight = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTargetWeight((prev) => Math.max(barWeight, Number((prev + delta).toFixed(2))));
  };

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exIdx = params.exerciseIndex !== undefined ? parseInt(params.exerciseIndex, 10) : 0;
    const setIdx = params.setIndex !== undefined ? parseInt(params.setIndex, 10) : 0;

    try {
      updateActiveWorkoutSet(isNaN(exIdx) ? 0 : exIdx, isNaN(setIdx) ? 0 : setIdx, {
        weightKg: targetWeight,
      });
    } catch (err) {
      console.warn('Failed to update active workout set from plates modal:', err);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('ironmate_applied_weight', JSON.stringify({
          weight: targetWeight,
          exerciseIndex: isNaN(exIdx) ? 0 : exIdx,
          setIndex: isNaN(setIdx) ? 0 : setIdx,
          timestamp: Date.now(),
        }));
        window.dispatchEvent(new CustomEvent('ironmate:weight-applied', {
          detail: { weight: targetWeight, exerciseIndex: exIdx, setIndex: setIdx }
        }));
      } catch {}
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Plate Calculator</Text>
          <Text style={styles.subTitle}>Calibrated Olympic Barbell Breakdown</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeBtn} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Total Barbell Load Display & Bar Selector */}
        <View style={styles.topCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.loadLabel}>TOTAL BARBELL LOAD</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.loadValue}>{targetWeight.toFixed(1)}</Text>
              <Text style={styles.loadUnit}>kg</Text>
            </View>
            <Text style={styles.loadSub}>
              Each side: {loadPerSide.toFixed(2)} kg
            </Text>
          </View>

          {/* Bar Selector */}
          <View style={styles.barSelector}>
            <TouchableOpacity
              style={[styles.barBtn, barWeight === 20 && styles.barBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setBarWeight(20);
                if (targetWeight < 20) setTargetWeight(20);
              }}
            >
              <Text style={[styles.barBtnText, barWeight === 20 && styles.barBtnTextActive]}>
                20kg Bar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.barBtn, barWeight === 15 && styles.barBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setBarWeight(15);
                if (targetWeight < 15) setTargetWeight(15);
              }}
            >
              <Text style={[styles.barBtnText, barWeight === 15 && styles.barBtnTextActive]}>
                15kg Bar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Graphical Barbell Visualizer (Exact Simulator Match) */}
        <View style={styles.visualizerCard}>
          <Text style={styles.visualizerLabel}>EACH SIDE REQUIRES:</Text>

          {/* Barbell Sleeve & Standing Plates Graphic */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sleeveContainer}
          >
            {/* Inside Collar / Sleeve Stopper Bushing */}
            <View style={styles.collarBushing}>
              <View style={styles.collarRing} />
              <Text style={styles.collarText}>COLLAR</Text>
            </View>

            {/* Render Plates Side-by-Side along the Sleeve */}
            {sleevePlates.length === 0 ? (
              <View style={styles.emptySleeveBox}>
                <Text style={styles.emptySleeveText}>Empty bar (no plates needed)</Text>
              </View>
            ) : (
              sleevePlates.map((weight, idx) => {
                const cfg = PLATE_VISUAL_STYLES[weight] || {
                  bg: '#3f3f46',
                  border: '#52525b',
                  textColor: '#ffffff',
                  height: 50,
                  width: 20,
                };
                return (
                  <View
                    key={`${weight}-${idx}`}
                    style={[
                      styles.plateBumper,
                      {
                        height: cfg.height,
                        width: cfg.width,
                        backgroundColor: cfg.bg,
                        borderColor: cfg.border,
                      }
                    ]}
                  >
                    {/* Weight Number on Plate */}
                    <Text 
                      style={[
                        styles.plateText, 
                        { color: cfg.textColor },
                        weight < 5 && { fontSize: 8 }
                      ]}
                      numberOfLines={1}
                    >
                      {weight}
                    </Text>
                  </View>
                );
              })
            )}

            {/* Barbell Steel Shaft End Extension */}
            <View style={styles.sleeveShaftEnd}>
              <View style={styles.sleeveCap} />
            </View>
          </ScrollView>

          {/* Clean Chip Breakdown Below Graphic */}
          <View style={styles.breakdownList}>
            {platesUsed.length === 0 ? (
              <Text style={styles.emptyNote}>Only standard {barWeight}kg barbell required.</Text>
            ) : (
              platesUsed.map((p) => (
                <View key={p.weight} style={styles.breakdownChip}>
                  <Text style={styles.breakdownChipText}>
                    {p.count}× {p.weight}kg plate
                  </Text>
                </View>
              ))
            )}
          </View>

          {unachieved > 0.05 && (
            <Text style={styles.granularityWarning}>
              Note: {unachieved.toFixed(2)}kg difference due to 1.25kg plate granularity.
            </Text>
          )}
        </View>

        {/* Quick Increment adjustments */}
        <Text style={styles.sectionTitle}>QUICK LOAD ADJUSTMENTS</Text>
        <View style={styles.stepperGrid}>
          <TouchableOpacity 
            style={styles.stepBtn} 
            onPress={() => adjustWeight(-5)}
          >
            <Text style={styles.stepBtnText}>-5 kg</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.stepBtn} 
            onPress={() => adjustWeight(-2.5)}
          >
            <Text style={styles.stepBtnText}>-2.5 kg</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.stepBtn, styles.stepBtnAdd]} 
            onPress={() => adjustWeight(2.5)}
          >
            <Text style={[styles.stepBtnText, styles.stepBtnAddText]}>+2.5 kg</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.stepBtn, styles.stepBtnAdd]} 
            onPress={() => adjustWeight(5)}
          >
            <Text style={[styles.stepBtnText, styles.stepBtnAddText]}>+5.0 kg</Text>
          </TouchableOpacity>
        </View>

        {/* Common Barbell Milestone Presets */}
        <Text style={styles.sectionTitle}>COMMON BARBELL MILESTONES</Text>
        <View style={styles.milestoneRow}>
          {[
            { label: '60 kg (1 plate)', val: 60 },
            { label: '80 kg', val: 80 },
            { label: '100 kg (2 plates)', val: 100 },
            { label: '140 kg (3 plates)', val: 140 },
          ].map((m) => {
            const isCurrent = Math.abs(targetWeight - m.val) < 0.1;
            return (
              <TouchableOpacity
                key={m.val}
                style={[styles.milestoneBtn, isCurrent && styles.milestoneBtnActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTargetWeight(m.val);
                }}
              >
                <Text style={[styles.milestoneText, isCurrent && styles.milestoneTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apply Button */}
        <TouchableOpacity 
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.88}
        >
          <Check size={18} color="#09090b" />
          <Text style={styles.applyBtnText}>
            Apply {targetWeight.toFixed(1)}kg to Current Set
          </Text>
        </TouchableOpacity>

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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  subTitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  topCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  loadLabel: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 1,
  },
  loadValue: {
    fontSize: 34,
    color: '#ccff00',
    fontWeight: '900',
  },
  loadUnit: {
    fontSize: 18,
    color: '#71717a',
    fontWeight: '800',
  },
  loadSub: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 2,
  },
  barSelector: {
    gap: 6,
  },
  barBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  barBtnActive: {
    backgroundColor: '#ccff00',
    borderColor: '#ccff00',
  },
  barBtnText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '700',
  },
  barBtnTextActive: {
    color: '#09090b',
    fontWeight: '900',
  },
  visualizerCard: {
    backgroundColor: '#09090b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  visualizerLabel: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  sleeveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    minHeight: 130,
  },
  collarBushing: {
    width: 22,
    height: 64,
    backgroundColor: '#3f3f46',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#52525b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  collarRing: {
    width: 6,
    height: 70,
    backgroundColor: '#71717a',
    borderRadius: 3,
    position: 'absolute',
    left: -3,
  },
  collarText: {
    fontSize: 6,
    color: '#a1a1aa',
    fontWeight: '900',
    transform: [{ rotate: '-90deg' }],
  },
  emptySleeveBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptySleeveText: {
    color: '#71717a',
    fontSize: 13,
    fontStyle: 'italic',
  },
  plateBumper: {
    borderRadius: 4,
    borderWidth: 1.5,
    marginHorizontal: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  plateText: {
    fontWeight: '900',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  sleeveShaftEnd: {
    width: 44,
    height: 22,
    backgroundColor: '#71717a',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#a1a1aa',
    marginLeft: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  sleeveCap: {
    width: 6,
    height: 24,
    backgroundColor: '#27272a',
    borderRadius: 2,
  },
  breakdownList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  breakdownChip: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  breakdownChipText: {
    color: '#d4d4d8',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyNote: {
    color: '#71717a',
    fontSize: 12,
  },
  granularityWarning: {
    color: '#facc15',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  stepperGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  stepBtnAdd: {
    backgroundColor: '#ccff0015',
    borderColor: '#ccff0030',
  },
  stepBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  stepBtnAddText: {
    color: '#ccff00',
  },
  milestoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  milestoneBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  milestoneBtnActive: {
    backgroundColor: '#ccff0020',
    borderColor: '#ccff00',
  },
  milestoneText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '700',
  },
  milestoneTextActive: {
    color: '#ccff00',
    fontWeight: '800',
  },
  applyBtn: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#ccff00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#ccff00',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  applyBtnText: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: '900',
  },
  });
}
