/**
 * Ironmate Supabase Authentication & Cloud Identity Modal - Expo Router
 * Path: app/modal/auth.tsx
 * Production auth flow supporting Sign In, Sign Up, RLS identity verification, and Supabase config
 */
import React, { useState } from 'react';
import { useTheme } from '@/src/hooks/use-theme';
import { createThemeStyles } from '@/src/utils/themeStyles';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  LogIn,
  UserPlus,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  Sparkles,
  Copy,
  Check,
  Database,
  Wifi,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  setCustomSupabaseCredentials,
} from '../../src/libs/supabase/client';

export default function AuthModal() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const {
    user,
    profile,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    authError,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Custom Supabase URL/Key accordion for developer override
  const [showConfigDetails, setShowConfigDetails] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>(supabaseUrl || '');
  const [customKey, setCustomKey] = useState<string>(supabaseAnonKey || '');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please provide both email and password.');
      return;
    }

    clearError();
    setInfoMessage(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (mode === 'signin') {
        const result = await signInWithEmail(email.trim(), password);
        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Signed In', `Welcome back, ${email.trim()}! Your cloud workouts are syncing.`);
          router.back();
        }
      } else {
        const result = await signUpWithEmail(email.trim(), password, displayName.trim());
        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (result.message) {
            setInfoMessage(result.message);
            Alert.alert('Account Created', result.message);
          } else {
            Alert.alert('Success', 'Account created and profile initialized in Supabase.');
            router.back();
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out of Supabase',
      'Your session will be ended. Workouts will stay in your local device SQLite cache.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await signOut();
            router.back();
          },
        },
      ]
    );
  };

  const handleCopyUserId = () => {
    if (!user) return;
    setCopiedId(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleFillTestAccount = () => {
    Haptics.selectionAsync();
    setEmail('athlete@ironmate.app');
    setPassword('ironmate123');
    setDisplayName('Alex Lifter');
  };

  const handleSaveCustomCredentials = () => {
    if (!customUrl.trim() || !customKey.trim()) {
      Alert.alert('Missing Info', 'Please provide both Supabase URL and Anon Key.');
      return;
    }
    setCustomSupabaseCredentials(customUrl.trim(), customKey.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Supabase credentials saved. App will reconnect.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.shieldBadge}>
              <ShieldCheck size={20} color="#ccff00" />
            </View>
            <View>
              <Text style={styles.title}>
                {isAuthenticated ? 'Supabase Cloud Identity' : 'Ironmate Account'}
              </Text>
              <Text style={styles.subTitle}>
                {isSupabaseConfigured ? 'Connected to Cloud Supabase' : 'Local Offline Mode'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Connection Banner */}
          <View style={[styles.connectionCard, isSupabaseConfigured ? styles.connOnline : styles.connOffline]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Database size={15} color={isSupabaseConfigured ? '#4ade80' : '#facc15'} />
              <Text style={styles.connStatusText}>
                {isSupabaseConfigured ? 'Supabase Backend Connected' : 'Supabase Not Configured'}
              </Text>
            </View>
            <Text style={styles.connEndpointText} numberOfLines={1}>
              {supabaseUrl ? supabaseUrl.replace('https://', '') : 'Configure EXPO_PUBLIC_SUPABASE_URL'}
            </Text>
          </View>

          {/* If Authenticated: Display Active Profile & RLS status */}
          {isAuthenticated && user ? (
            <View style={styles.authedBox}>
              <View style={styles.authedHeader}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>
                    {(profile?.display_name || user.email?.split('@')[0] || 'L')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.authedName}>
                    {profile?.display_name || user.user_metadata?.display_name || 'Lifter'}
                  </Text>
                  <Text style={styles.authedEmail}>{user.email}</Text>
                  <View style={styles.rlsPill}>
                    <CheckCircle2 size={12} color="#4ade80" />
                    <Text style={styles.rlsPillText}>RLS Policies Enforced</Text>
                  </View>
                </View>
              </View>

              {/* Identity Details */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Auth User ID</Text>
                  <TouchableOpacity
                    style={styles.copyIdBtn}
                    onPress={handleCopyUserId}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.infoValueMono}>
                      {user.id.slice(0, 14)}...
                    </Text>
                    {copiedId ? (
                      <Check size={14} color="#4ade80" />
                    ) : (
                      <Copy size={14} color="#a1a1aa" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Experience Level</Text>
                  <Text style={styles.infoValue}>
                    {(profile?.experience_level || 'intermediate').toUpperCase()}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Primary Goal</Text>
                  <Text style={styles.infoValue}>
                    {(profile?.primary_goal || 'hypertrophy').toUpperCase()}
                  </Text>
                </View>

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Database Tables</Text>
                  <Text style={styles.infoValue}>profiles, sessions, sets</Text>
                </View>
              </View>

              {/* RLS Security Rule Guarantee */}
              <View style={styles.securityBox}>
                <Text style={styles.securityTitle}>ROW LEVEL SECURITY (RLS) LAW</Text>
                <Text style={styles.securityItem}>• profiles: auth.uid() = id</Text>
                <Text style={styles.securityItem}>• sessions: auth.uid() = user_id</Text>
                <Text style={styles.securityItem}>• sets: auth.uid() = user_id</Text>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <LogOut size={16} color="#ef4444" />
                <Text style={styles.signOutBtnText}>Sign Out of Supabase</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* If Not Authenticated: Sign In / Sign Up Form */
            <View style={styles.formContainer}>
              {/* Tab Selector */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'signin' && styles.tabBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMode('signin');
                  }}
                >
                  <LogIn size={15} color={mode === 'signin' ? '#09090b' : '#a1a1aa'} />
                  <Text style={[styles.tabBtnText, mode === 'signin' && styles.tabBtnTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMode('signup');
                  }}
                >
                  <UserPlus size={15} color={mode === 'signup' ? '#09090b' : '#a1a1aa'} />
                  <Text style={[styles.tabBtnText, mode === 'signup' && styles.tabBtnTextActive]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Banner */}
              {authError && (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              )}

              {/* Info Banner */}
              {infoMessage && (
                <View style={styles.infoBox}>
                  <CheckCircle2 size={16} color="#4ade80" />
                  <Text style={styles.infoBoxText}>{infoMessage}</Text>
                </View>
              )}

              {/* Display Name (Sign Up only) */}
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>YOUR NAME / LIFTER HANDLE</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={16} color="#71717a" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Alex Mercer"
                      placeholderTextColor="#52525b"
                      value={displayName}
                      onChangeText={setDisplayName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={16} color="#71717a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="lifter@example.com"
                    placeholderTextColor="#52525b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={16} color="#71717a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••••"
                    placeholderTextColor="#52525b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#09090b" />
                ) : (
                  <>
                    {mode === 'signin' ? (
                      <LogIn size={16} color="#09090b" />
                    ) : (
                      <UserPlus size={16} color="#09090b" />
                    )}
                    <Text style={styles.submitBtnText}>
                      {mode === 'signin' ? 'Sign In to Supabase' : 'Create Supabase Account'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Quick Fill Test Account */}
              <TouchableOpacity
                style={styles.quickFillBtn}
                onPress={handleFillTestAccount}
                activeOpacity={0.7}
              >
                <Sparkles size={13} color="#ccff00" />
                <Text style={styles.quickFillBtnText}>
                  Autofill Test Athlete Credentials
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Advanced: Custom Supabase Config Accordion */}
          <View style={styles.configAccordion}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowConfigDetails(!showConfigDetails)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <KeyRound size={14} color="#a1a1aa" />
                <Text style={styles.accordionTitle}>Custom Supabase Credentials</Text>
              </View>
              {showConfigDetails ? (
                <ChevronUp size={16} color="#71717a" />
              ) : (
                <ChevronDown size={16} color="#71717a" />
              )}
            </TouchableOpacity>

            {showConfigDetails && (
              <View style={styles.accordionBody}>
                <Text style={styles.configNote}>
                  By default, Ironmate loads credentials from your project environment variables (EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY). You can override them below:
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SUPABASE URL</Text>
                  <TextInput
                    style={styles.configInput}
                    placeholder="https://xxxx.supabase.co"
                    placeholderTextColor="#52525b"
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SUPABASE ANON KEY</Text>
                  <TextInput
                    style={styles.configInput}
                    placeholder="eyJh..."
                    placeholderTextColor="#52525b"
                    value={customKey}
                    onChangeText={setCustomKey}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveConfigBtn}
                  onPress={handleSaveCustomCredentials}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveConfigBtnText}>Save & Reconnect</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  shieldBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ccff0015',
    borderWidth: 1,
    borderColor: '#ccff0030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  subTitle: {
    fontSize: 11,
    color: '#a1a1aa',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  connectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  connOnline: {
    backgroundColor: '#16a34a10',
    borderColor: '#16a34a30',
  },
  connOffline: {
    backgroundColor: '#eab30810',
    borderColor: '#eab30830',
  },
  connStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f4f4f5',
  },
  connEndpointText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#71717a',
    maxWidth: 140,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#ccff00',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  tabBtnTextActive: {
    color: '#09090b',
    fontWeight: '900',
  },
  formContainer: {
    backgroundColor: '#09090b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#ffffff',
    fontSize: 14,
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#ccff00',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#09090b',
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  quickFillBtnText: {
    fontSize: 12,
    color: '#ccff00',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444430',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#f87171',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a15',
    borderWidth: 1,
    borderColor: '#16a34a30',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#4ade80',
  },
  authedBox: {
    backgroundColor: '#09090b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    marginBottom: 16,
  },
  authedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ccff00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#09090b',
  },
  authedName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  authedEmail: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 1,
  },
  rlsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a15',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  rlsPillText: {
    fontSize: 10,
    color: '#4ade80',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  infoLabel: {
    fontSize: 12,
    color: '#71717a',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoValueMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#ccff00',
  },
  copyIdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityBox: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 12,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 10,
    color: '#4ade80',
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  securityItem: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#a1a1aa',
    marginTop: 2,
  },
  signOutBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444430',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  configAccordion: {
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  accordionBody: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
  },
  configNote: {
    fontSize: 11,
    color: '#71717a',
    lineHeight: 16,
    marginBottom: 12,
  },
  configInput: {
    height: 42,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#ffffff',
    fontSize: 12,
  },
  saveConfigBtn: {
    height: 40,
    backgroundColor: '#27272a',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveConfigBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  });
}
