import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../libs/supabase/client';
import type { Database } from '../libs/supabase/types';
import { LocalStore } from '../libs/offline/storage';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const profileRequestId = useRef(0);
  const mounted = useRef(true);

  const clearError = useCallback(() => setAuthError(null), []);

  const getErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

  const loadProfile = useCallback(async (authUser: User | null): Promise<void> => {
    const requestId = ++profileRequestId.current;
    if (!authUser) {
      setProfile(null);
      return;
    }

    const cachedProfile = LocalStore.getProfile(authUser.id);
    if (cachedProfile) setProfile(cachedProfile);

    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        if (requestId !== profileRequestId.current || !mounted.current) return;
        setProfile(data);
        LocalStore.saveProfile(data);
      } else {
        console.warn('[Ironmate Auth] Profile row missing for authenticated user');
      }
    } catch (error) {
      console.warn('[Ironmate Auth] Profile load failed:', getErrorMessage(error, 'Unknown profile error'));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    async function initializeAuth() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted.current) {
          setSession(initialSession);
          void loadProfile(initialSession?.user ?? null);
        }
      } catch (error) {
        console.warn('[Ironmate Auth] Failed to get session:', getErrorMessage(error, 'Unknown session error'));
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted.current) return;

      setSession(currentSession);
      if (event === 'SIGNED_OUT') {
        void loadProfile(null);
      } else if (currentSession?.user) {
        setTimeout(() => void loadProfile(currentSession.user), 0);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Sign In with email & password
  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase credentials not configured in environment variables.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        void loadProfile(data.session.user);
      }

      return { success: true };
    } catch (error) {
      const msg = getErrorMessage(error, 'An unexpected error occurred during sign in.');
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Up with email, password & optional display name
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase credentials not configured in environment variables.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      const trimmedDisplayName = displayName?.trim() || email.split('@')[0];
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: trimmedDisplayName,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        void loadProfile(data.session.user);
      }

      // Check if email confirmation is required by Supabase project settings
      const requiresConfirmation = data.user && !data.session;
      const message = requiresConfirmation
        ? 'Account created! Please check your email to confirm your account, then sign in.'
        : 'Account created successfully!';

      return { success: true, message };
    } catch (error) {
      const msg = getErrorMessage(error, 'An unexpected error occurred during sign up.');
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (error) {
      console.warn('[Ironmate Auth] Sign out error:', getErrorMessage(error, 'Unknown sign out error'));
    } finally {
      setSession(null);
      LocalStore.clearProfile();
      void loadProfile(null);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { success: false, error: 'User is not authenticated' };
    }

    try {
      const profileUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      } as Database['public']['Tables']['profiles']['Update'];

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates as never)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setProfile(data);
        LocalStore.saveProfile(data);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error, 'Failed to update profile') };
    }
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  const user = session?.user ?? null;
  const isAuthenticated = Boolean(session?.user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated,
        isLoading,
        isConfigured: isSupabaseConfigured,
        authError,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
