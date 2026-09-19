import { Spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/hooks/use-theme';
import { isSupabaseConfigured, supabase } from '@/src/libs';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
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

/**
 * Enter the 6-digit OTP from the email.
 * verifyOtp establishes the session in-app — no localhost redirect, no deep link.
 */
export default function AuthVerifyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const verifyCode = async () => {
    setError(null);
    setMessage(null);

    const token = code.replace(/\s/g, '');
    if (!email) {
      setError('No email on file. Go back and enter it again.');
      return;
    }
    if (token.length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }

    setBusy(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      if (!data.session) throw new Error('No session returned');

      // AuthProvider onAuthStateChange will set user/profile;
      // navigate into the app immediately.
      router.replace('/(app)/(tabs)/(today)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email || !isSupabaseConfigured) return;
    setResending(true);
    setError(null);
    setMessage(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (otpError) throw otpError;
      setMessage('New code sent. Check your inbox.');
      setCode('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
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
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.subtitle}>
          {email
            ? `We sent a 6-digit code to ${email}.`
            : 'Enter the 6-digit code from your email.'}
        </Text>

        <Text style={styles.label}>Code</Text>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^\d]/g, '').slice(0, 8))}
          placeholder="000000"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={8}
          returnKeyType="done"
          onSubmitEditing={verifyCode}
          editable={!busy}
          style={styles.input}
          accessibilityLabel="Verification code"
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={verifyCode}
          disabled={busy}
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
            busy && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Verify code"
        >
          {busy ? (
            <ActivityIndicator color={theme.accentContrast} />
          ) : (
            <Text style={styles.btnText}>Verify and continue</Text>
          )}
        </Pressable>

        <Pressable
          onPress={resend}
          disabled={resending || !email}
          style={styles.linkBtn}
          accessibilityRole="button"
          accessibilityLabel="Resend code"
        >
          {resending ? (
            <ActivityIndicator color={theme.textSecondary} />
          ) : (
            <Text style={styles.linkText}>Resend code</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={styles.linkBtn}
          accessibilityRole="button"
          accessibilityLabel="Use a different email"
        >
          <Text style={styles.linkText}>Use a different email</Text>
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
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textSecondary,
      marginBottom: 8,
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
      fontSize: 22,
      letterSpacing: 8,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: theme.success,
    },
    error: {
      fontSize: 14,
      color: theme.danger,
    },
    btn: {
      minHeight: 52,
      marginTop: 8,
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
    linkBtn: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkText: {
      fontSize: 15,
      color: theme.textSecondary,
    },
  });
}