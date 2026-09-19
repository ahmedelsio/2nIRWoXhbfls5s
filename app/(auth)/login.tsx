import { Spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/hooks/use-theme';
import { isSupabaseConfigured, supabase } from '@/src/libs';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email OTP sign-in (mobile + local dev friendly).
 *
 * Sends a 6-digit code via Supabase. User enters the code on the verify screen.
 * No deep link / localhost redirect required — works on device, simulator, and Expo Go.
 */
export default function AuthLoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();

    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }

    setBusy(true);
    try {
      // OTP email — user types the code in-app. No redirect URL needed.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          shouldCreateUser: true,
        },
      });
      if (otpError) throw otpError;

      router.push({
        pathname: '/(auth)/verify',
        params: { email: trimmed },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.title}>Sign in with email</Text>
        <Text style={styles.subtitle}>
          We will email a 6-digit code. Enter it on the next screen — no password, no browser redirect.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={theme.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={sendCode}
          editable={!busy}
          style={styles.input}
          accessibilityLabel="Email address"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={sendCode}
          disabled={busy}
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
            busy && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send code"
        >
          {busy ? (
            <ActivityIndicator color={theme.accentContrast} />
          ) : (
            <Text style={styles.btnText}>Send code</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: Spacing.four ?? 24,
    },
    back: {
      minHeight: 44,
      justifyContent: 'center',
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    backText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    body: {
      flex: 1,
      paddingTop: 24,
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textMuted,
      marginBottom: 4,
    },
    input: {
      minHeight: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.bgElevated,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.text,
    },
    error: {
      fontSize: 14,
      color: theme.danger,
      marginTop: 4,
    },
    btn: {
      minHeight: 52,
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPressed: { opacity: 0.85 },
    btnDisabled: { opacity: 0.5 },
    btnText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accentContrast,
    },
  });
}