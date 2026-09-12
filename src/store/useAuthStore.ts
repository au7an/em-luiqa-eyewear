import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Methods
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ user: null, session: null, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching auth session:', error);
      }

      set({
        user: session?.user ?? null,
        session: session ?? null,
        isLoading: false,
      });

      // Listen to auth state changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({
          user: newSession?.user ?? null,
          session: newSession ?? null,
          isLoading: false,
        });
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ user: null, session: null, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
      };
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      set({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    set({ user: null, session: null, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
