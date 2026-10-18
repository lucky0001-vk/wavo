'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error?: string; message?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  loginAsGuest: (nickname?: string) => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'cinemood_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  // Restore session on mount
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const supabase = getSupabaseClient();
        if (supabase && isConfigured) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email,
              displayName: profile?.display_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Cinephile',
              username: profile?.username || session.user.email?.split('@')[0],
              avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
              isGuest: false,
              preferredMoods: profile?.preferred_moods || [],
              preferredGenres: profile?.preferred_genres || [],
              preferredStreamingServices: profile?.preferred_streaming_services || [],
            });
            setLoading(false);
            return;
          }
        }

        // Check local storage for guest or demo user
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (stored && mounted) {
            setUser(JSON.parse(stored));
          } else if (mounted) {
            // Automatically initialize a friendly default guest user so user is never blocked
            const guestId = `guest_${Math.random().toString(36).substring(2, 8)}`;
            const guestUser: UserProfile = {
              id: guestId,
              displayName: 'Night Owl',
              username: 'guest_cinephile',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
              isGuest: true,
              preferredMoods: ['happy', 'curious'],
              preferredGenres: ['Sci-Fi', 'Comedy'],
              preferredStreamingServices: ['Netflix', 'Max'],
            };
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestUser));
            setUser(guestUser);
          }
        }
      } catch (err) {
        console.warn('Session restoration notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    // Listen for auth state changes if Supabase is connected
    const supabase = getSupabaseClient();
    if (supabase && isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Cinephile',
            username: session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
            isGuest: false,
            preferredMoods: [],
            preferredGenres: [],
            preferredStreamingServices: [],
          });
        }
      });
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: 'Please enter both email and password.' };
    }

    const supabase = getSupabaseClient();
    if (supabase && isConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data.user) {
        const loggedUser: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Member',
          username: data.user.email?.split('@')[0],
          isGuest: false,
          preferredMoods: [],
          preferredGenres: [],
          preferredStreamingServices: [],
        };
        setUser(loggedUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedUser));
      }
      return {};
    }

    // Demo/offline simulated sign-in
    const demoUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email,
      displayName: email.split('@')[0],
      username: email.split('@')[0].toLowerCase(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      isGuest: false,
      preferredMoods: ['adventurous', 'inspired'],
      preferredGenres: ['Drama', 'Sci-Fi'],
      preferredStreamingServices: ['Netflix', 'Prime Video'],
    };
    setUser(demoUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    return {};
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!email || !password) {
      return { error: 'Please provide email and password.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const supabase = getSupabaseClient();
    if (supabase && isConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName },
        },
      });
      if (error) return { error: error.message };

      if (data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          displayName: displayName || email.split('@')[0],
          username: email.split('@')[0],
          isGuest: false,
          preferredMoods: [],
          preferredGenres: [],
          preferredStreamingServices: [],
        };
        setUser(newUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
        return { message: 'Account created! Please check your email to verify.' };
      }
      return {};
    }

    // Demo mode signup
    const demoUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email,
      displayName: displayName || email.split('@')[0],
      username: email.split('@')[0].toLowerCase(),
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
      isGuest: false,
      preferredMoods: ['happy', 'romantic'],
      preferredGenres: ['Comedy', 'Animation'],
      preferredStreamingServices: ['Max', 'Apple TV'],
    };
    setUser(demoUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    return { message: 'Welcome to Wavo! Account created.' };
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/discover` : undefined,
        },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Demo Google login
    const googleDemoUser: UserProfile = {
      id: 'google-usr-9921',
      email: 'alex.rivera@cinema.org',
      displayName: 'Alex Rivera',
      username: 'arivera',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      isGuest: false,
      preferredMoods: ['nostalgic', 'curious'],
      preferredGenres: ['Mystery', 'Drama'],
      preferredStreamingServices: ['Netflix', 'Criterion Channel'],
    };
    setUser(googleDemoUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(googleDemoUser));
    return {};
  };

  const loginAsGuest = (nickname?: string) => {
    const guestUser: UserProfile = {
      id: `guest_${Math.random().toString(36).substring(2, 8)}`,
      displayName: nickname?.trim() || `MovieLover_${Math.floor(100 + Math.random() * 900)}`,
      isGuest: true,
      preferredMoods: ['happy', 'bored'],
      preferredGenres: ['Action', 'Comedy'],
      preferredStreamingServices: ['Netflix'],
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestUser));
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    loginAsGuest(); // fallback to guest so user can still browse freely
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No active session' };

    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase && isConfigured && !user.isGuest) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: updated.displayName,
            username: updated.username,
            avatar_url: updated.avatarUrl,
            preferred_moods: updated.preferredMoods,
            preferred_genres: updated.preferredGenres,
            preferred_streaming_services: updated.preferredStreamingServices,
            updated_at: new Date().toISOString(),
          });
      } catch (err: any) {
        console.warn('Profile sync error:', err);
      }
    }

    return {};
  };

  const resetPassword = async (email: string) => {
    if (!email) return { error: 'Please enter your email.' };

    const supabase = getSupabaseClient();
    if (supabase && isConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/preferences` : undefined,
      });
      if (error) return { error: error.message };
      return { message: 'Password reset link sent to your email.' };
    }

    return { message: 'Demo mode: In production, password reset instructions are sent to your email.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsGuest,
        signOut,
        updateProfile,
        resetPassword,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
