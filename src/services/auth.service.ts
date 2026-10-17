import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole } from '../types/database.types';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole;
}

/**
 * Fetch profile for a given user ID from public.profiles table
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching user profile:', error.message);
      return null;
    }

    return data as Profile;
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: 'Supabase client is not configured. Please add your credentials in .env first.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication network failure';
    return { user: null, session: null, error: message };
  }
}

/**
 * Sign up a new user with full name and optional role
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'counsellor'
): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: 'Supabase client is not configured. Please add your credentials in .env first.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign up network failure';
    return { user: null, session: null, error: message };
  }
}

/**
 * Sign out current session
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  if (!supabase) return { error: null };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign out error';
    return { error: message };
  }
}
