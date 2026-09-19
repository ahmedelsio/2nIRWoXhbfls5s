import { useTheme } from '@/src/hooks/use-theme';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, Spacing } from '@/src/constants/theme';
import { isSupabaseConfigured, supabase } from '@/src/libs';

WebBrowser.maybeCompleteAuthSession();

/**
 * Welcome / sign-in hub.
 * PRD: Email magic link, Apple Sign-in, Google OAuth via Supabase Auth.
 * Tone: calm, adult — no hype copy.
 */
export default function AuthWelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = makeRedirectUri({
    scheme: 'ironmate',
    path: 'auth/callback',
  });

  const runOAuth = async (provider: 'apple' | 'google') => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setBusy(provider);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError) throw oauthError;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.replace(/^#/, '') || url.search);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) throw sessionError;
          router.replace('/(app)/(tabs)/(today)');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setError(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <Text style={styles.mark}>IRONMATE</Text>
        <Text style={styles.tagline}>
          The gym companion that already knows what you should do today.
        </Text>
      </View>

      <View style={styles.actions}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {Platform.OS === 'ios' ? (
          <Pressable
            onPress={() => runOAuth('apple')}
            disabled={busy !== null}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.btnPressed,
              busy !== null && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            {busy === 'apple' ? (
              <ActivityIndicator color={theme.accentContrast} />
            ) : (
              <Text style={styles.btnPrimaryText}>Continue with Apple</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => runOAuth('google')}
          disabled={busy !== null}
          style={({ pressed }) => [
            styles.btnSecondary,
            pressed && styles.btnPressed,
            busy !== null && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          {busy === 'google' ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <Text style={styles.btnSecondaryText}>Continue with Google</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/login')}
          disabled={busy !== null}
          style={({ pressed }) => [styles.btnGhost, pressed && styles.btnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Continue with email"
        >
          <Text style={styles.btnGhostText}>Continue with email</Text>
        </Pressable>
      </View>

      <Text style={styles.legal}>
        By continuing you agree to use Ironmate for personal training logs only.
        Your data stays private by default.
      </Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: Spacing.four ?? 24,
      justifyContent: 'space-between',
    },
    hero: {
      flex: 1,
      justifyContent: 'center',
      gap: 16,
    },
    mark: {
      fontFamily: Fonts?.mono ?? undefined,
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 4,
      color: theme.text,
    },
    tagline: {
      fontSize: 18,
      lineHeight: 26,
      color: theme.textSecondary,
      maxWidth: 320,
    },
    actions: {
      gap: 12,
      marginBottom: 16,
    },
    btnPrimary: {
      minHeight: 52,
      borderRadius: 12,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    btnSecondary: {
      minHeight: 52,
      borderRadius: 12,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    btnGhost: {
      minHeight: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    btnPressed: { opacity: 0.85 },
    btnDisabled: { opacity: 0.5 },
    btnPrimaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accentContrast,
    },
    btnSecondaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    btnGhostText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    error: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.danger,
      marginBottom: 4,
    },
    legal: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.textMuted,
      textAlign: 'center',
    },
  });
}