import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: Error;
}

class AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!supabase) {
      return { user: null, session: null, error: new Error('Supabase client not initialized') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error: new Error(error.message) };
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    if (!supabase) {
      return { user: null, session: null, error: new Error('Supabase client not initialized') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return { user: null, session: null, error: new Error(error.message) };
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async signOut(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  }

  async getSession(): Promise<Session | null> {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return data.session;
  }

  async resetPassword(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message);
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!supabase) {
      console.warn('Supabase client not initialized - returning mock subscription');
      // Return a mock subscription object that matches the expected structure
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('Mock subscription unsubscribed');
            }
          }
        }
      };
    }

    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Get current user error:', error);
      return null;
    }

    return user;
  }
}

export const authService = new AuthService();

// Export convenience functions
export const signIn = (email: string, password: string) => authService.signIn(email, password);
export const signUp = (email: string, password: string, fullName?: string) => authService.signUp(email, password, fullName);
export const signOut = () => authService.signOut();
export const getSession = () => authService.getSession();
export const resetPassword = (email: string) => authService.resetPassword(email);
export const getCurrentUser = () => authService.getCurrentUser();