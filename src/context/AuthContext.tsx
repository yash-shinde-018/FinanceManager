'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { ensureProfile } from '@/lib/db/profiles';
import { seedWelcomeNotifications } from '@/lib/db/notifications';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let inFlight: Promise<void> | null = null;

    const load = async () => {
      if (inFlight) return inFlight;
      inFlight = (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const mappedUser: User = {
          id: user.id,
          name: (user.user_metadata?.name as string) || (user.email ? user.email.split('@')[0] : 'User'),
          email: user.email || '',
          createdAt: user.created_at ? new Date(user.created_at) : new Date(),
          financialHealthScore: 50,
          avatar: (user.user_metadata?.avatar_url as string) || (user.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` : undefined),
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }

      setIsLoading(false);
      inFlight = null;
      })();

      return inFlight;
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const mappedUser: User = {
          id: u.id,
          name: (u.user_metadata?.name as string) || (u.email ? u.email.split('@')[0] : 'User'),
          email: u.email || '',
          createdAt: u.created_at ? new Date(u.created_at) : new Date(),
          financialHealthScore: 50,
          avatar: (u.user_metadata?.avatar_url as string) || (u.email ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}` : undefined),
        };
        setUser(mappedUser);
        setIsLoading(false);
        return;
      }

      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      await load();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Supabase login error', error);
        // Check if error is due to email not being verified
        if (error.message.toLowerCase().includes('email not confirmed') || 
            error.message.toLowerCase().includes('email verification')) {
          setIsLoading(false);
          return { success: false, error: 'Please verify your email first. Check your inbox for the verification link.' };
        }
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }

      await ensureProfile();
      await seedWelcomeNotifications().catch(() => {}); // Don't block on notification seeding
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      console.error('Login error:', e);
      setIsLoading(false);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data?.user?.identities && data.user.identities.length === 0) {
        // User already exists
        setIsLoading(false);
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      localStorage.setItem('moneymind_onboarding', 'true');

      await ensureProfile();
      await seedWelcomeNotifications().catch(() => {}); // Seed welcome notifications for new users
      setIsLoading(false);
      
      return { 
        success: true, 
        message: 'A verification email has been sent to your email address. Please check your inbox and verify your email before logging in.' 
      };
    } catch (e) {
      console.error('Register error:', e);
      setIsLoading(false);
      return { success: false, error: 'An error occurred during registration. Please try again.' };
    }
  };

  const logout = () => {
    const supabase = createClient();
    supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);

    const supabase = createClient();
    supabase.auth.updateUser({
      data: {
        name: updatedUser.name,
        avatar_url: updatedUser.avatar,
      },
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
