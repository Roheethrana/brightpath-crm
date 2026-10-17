import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole } from '../types/database.types';
import { fetchUserProfile, signInWithEmail, signUpWithEmail, signOutUser } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Workshop testing helper: switch simulated role if working locally
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial fallback profile for unauthenticated demo exploration
const DEFAULT_DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000000',
  full_name: 'Demo Counsellor',
  role: 'counsellor',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demoRole, setDemoRoleState] = useState<UserRole>('counsellor');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setProfile(null);
      return;
    }

    const fetchedProfile = await fetchUserProfile(activeUser.id);
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    } else {
      // Fallback if profile row is still syncing from trigger
      const fallbackProfile: Profile = {
        id: activeUser.id,
        full_name: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'Academy Staff',
        role: (activeUser.user_metadata?.role as UserRole) || 'counsellor',
        created_at: activeUser.created_at,
        updated_at: activeUser.created_at,
      };
      setProfile(fallbackProfile);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        loadProfile(initialSession.user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadProfile(currentSession.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { user: signedInUser, error } = await signInWithEmail(email, password);
    if (signedInUser) {
      await loadProfile(signedInUser);
      setIsLoading(false);
      return { success: true, error: null };
    }
    setIsLoading(false);
    return { success: false, error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'counsellor') => {
    setIsLoading(true);
    const { user: registeredUser, error } = await signUpWithEmail(email, password, fullName, role);
    if (registeredUser) {
      await loadProfile(registeredUser);
      setIsLoading(false);
      return { success: true, error: null };
    }
    setIsLoading(false);
    return { success: false, error };
  };

  const signOut = async () => {
    setIsLoading(true);
    await signOutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  const setDemoRole = (newRole: UserRole) => {
    setDemoRoleState(newRole);
    if (!user && profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  // Active role is user's actual database profile role, or demo role if unauthenticated
  const currentRole: UserRole = profile?.role || (user ? 'counsellor' : demoRole);
  const activeProfile = profile || (user ? null : { ...DEFAULT_DEMO_PROFILE, role: demoRole });

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: activeProfile,
        session,
        role: currentRole,
        isLoading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signOut,
        refreshProfile,
        setDemoRole,
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
