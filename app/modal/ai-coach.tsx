/**
 * Ironmate Bounded AI Strength Coach Modal - Expo Router
 * Path: app/modal/ai-coach.tsx
 * Evidence-based coaching with strict guardrails (Zero bro-science, zero injury diagnosis)
 */
import React, { useState } from 'react';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  BookOpen, 
  TrendingUp, 
  Dumbbell, 
  Users,
  RotateCcw,
  CheckCircle2
} from 'lucide-react-native';

interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  evidence?: string;
}

const COACH_PRESETS = [
  {
    title: 'Crowded Gym Floor',
    prompt: 'Every barbell rack is taken. How do I adapt today’s Push session in 35 minutes?',
    response: 'Swap Barbell Bench Press for Dumbbell Flat Bench (32kg/hand × 8 reps) and Incline Dumbbell Press. Follow with a Giant Set of Cable Lateral Raises and Overhead Rope Extensions. You preserve 100% of pectoral and tricep mechanical tension with zero rack waiting.',
    evidence: 'Autoregulated density protocol; preserves target motor unit recruitment (Schoenfeld, 2018).',
  },
  {
    title: 'Overload Load Check',
    prompt: 'I hit 82.5kg for 6, 6, 6 at RIR 2 on Bench. Should I add weight next week?',
    response: 'Yes. Double progression rule satisfied: all 3 working sets achieved target reps with ≥2 Reps in Reserve. Increase barbell load by +2.5kg (to 85.0kg) next session for 4–6 reps.',
    evidence: 'Double progression method for compound movements (Helms, The Muscle & Strength Pyramid).',
  },
  {
    title: 'Short Sleep & Fatigue',
    prompt: 'I only slept 5.5 hours last night. Should I skip the workout or adjust?',
    response: 'Do not skip unless feeling systemic illness. Cap top sets at RIR 3 instead of RIR 1-2, drop optional isolation volume by 1 set per exercise, and focus strictly on clean bar path. Preserves neural adaptation without excessive systemic cortisol.',
    evidence: 'Volume autoregulation under acute sleep restriction (Knowles et al., Sports Medicine 2018).',
  },
  {
    title: 'Form & Elbow Pinch',
    prompt: 'My elbows flare out wide on Bench Press. How do I correct this cue?',
    response: 'Think of "bending the bar in half" with your pinkies to engage your lats. Tuck elbows to ~45–60° from torso during descent, touching the lower sternum rather than the upper collarbone.',
    evidence: 'Glenohumeral biomechanics and subacromial space preservation during horizontal pressing.',
  },
];

export default function AICoachModal() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'init',
      sender: 'coach',
      text: 'Good morning. I’m reviewing your Push session targets. Last week you logged 80.0kg × 6, 6, 5 at RIR 2 on Bench Press. Today’s prescribed target is 82.5kg × 6 reps with a 2-rep safety buffer. How can I help you execute today?',
      evidence: 'Autoregulated linear progression based on your last 3 sessions.',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: CoachMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
    };

    // Find preset match or generate evidence-based response
    const matchedPreset = COACH_PRESETS.find((p) => p.prompt.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(p.title.toLowerCase()));

    const coachReplyText = matchedPreset 
      ? matchedPreset.response 
      : `Acknowledged: "${query}". Based on your current 4-week block, maintain RIR 2 on compound lifts and autoregulate load. If technical bar speed degrades, hold current load rather than forcing an ego jump.`;

    const coachEvidence = matchedPreset
      ? matchedPreset.evidence
      : 'Evidence-based strength coaching principles (Zourdos / Schoenfeld / Helms).';

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: String(Date.now() + 1),
        sender: 'coach',
        text: coachReplyText,
        evidence: coachEvidence,
      },
    ]);

    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#ccff00" />
              <Text style={styles.badgeText}>EVIDENCE-BASED AI COACH</Text>
            </View>
            <Text style={styles.title}>Strength & Form Desk</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        {/* Safety Guardrail Banner */}
        <View style={styles.guardrailBanner}>
          <ShieldAlert size={16} color="#38bdf8" />
          <Text style={styles.guardrailText}>
            Trained on peer-reviewed exercise science. No bro-science, no crash diet claims, no injury diagnosis.
          </Text>
        </View>

        {/* Chat / Message Stream */}
        <ScrollView 
          contentContainerStyle={styles.chatScroll} 
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View 
              key={m.id} 
              style={[
                styles.messageRow, 
                m.sender === 'user' ? styles.userRow : styles.coachRow
              ]}
            >
              <View 
                style={[
                  styles.bubble, 
                  m.sender === 'user' ? styles.userBubble : styles.coachBubble
                ]}
              >
                <Text 
                  style={[
                    styles.messageText, 
                    m.sender === 'user' ? styles.userText : styles.coachText
                  ]}
                >
                  {m.text}
                </Text>
                {m.evidence && (
                  <View style={styles.evidenceBox}>
                    <BookOpen size={12} color="#ccff00" />
                    <Text style={styles.evidenceText}>{m.evidence}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Quick Preset Buttons */}
          <Text style={styles.presetsLabel}>QUICK EVIDENCE-BASED PROMPTS</Text>
          <View style={styles.presetsGrid}>
            {COACH_PRESETS.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetChip}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleSendMessage(p.prompt);
                }}
              >
                <Text style={styles.presetChipTitle}>{p.title}</Text>
                <Text style={styles.presetChipSub} numberOfLines={1}>{p.prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about load, cues, or crowded gyms..."
            placeholderTextColor="#71717a"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim()}
          >
            <Send size={18} color={inputText.trim() ? '#09090b' : '#71717a'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  badgeText: {
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
  guardrailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#38bdf815',
    borderBottomWidth: 1,
    borderBottomColor: '#38bdf830',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  guardrailText: {
    flex: 1,
    color: '#bae6fd',
    fontSize: 11,
    lineHeight: 15,
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    marginBottom: 14,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  coachRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 18,
    padding: 14,
  },
  coachBubble: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#ccff00',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  coachText: {
    color: '#ffffff',
  },
  userText: {
    color: '#09090b',
    fontWeight: '700',
  },
  evidenceBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  evidenceText: {
    flex: 1,
    color: '#a1a1aa',
    fontSize: 11,
    fontStyle: 'italic',
  },
  presetsLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  presetsGrid: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 12,
  },
  presetChipTitle: {
    color: '#ccff00',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  presetChipSub: {
    color: '#a1a1aa',
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ccff00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#27272a',
  },
  });
}
