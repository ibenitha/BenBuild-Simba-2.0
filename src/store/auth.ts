import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import type { CurrentUser, UserRole, AuthResult } from '@/types';

interface AuthStore {
  currentUser: CurrentUser | null;
  loading: boolean;
  initialized: boolean;
  setCurrentUser: (user: CurrentUser | null) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: { email: string; password: string; fullName: string }) => Promise<AuthResult>;
  loginWithGoogle: (locale: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string, locale: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Role helpers
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isManager: () => boolean;
  hasStaffAccess: () => boolean; // staff | manager | admin
}

/** Fetch the user's role from the profiles table */
async function fetchUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', userId)
      .single();
    return (data?.role as UserRole) ?? 'customer';
  } catch {
    return 'customer';
  }
}

/** Fetch the user's full profile (role + branch) — gracefully handles missing columns */
async function fetchUserProfile(userId: string): Promise<{ role: UserRole; branchId?: string; avatarUrl?: string }> {
  try {
    const supabase = createClient();
    // Only select columns that are guaranteed to exist (role added by migration)
    const { data, error } = await supabase
      .from('profiles')
      .select('role, branch_id, avatar_url')
      .eq('id', userId)
      .maybeSingle(); // maybeSingle returns null instead of error when no row found

    if (error) {
      // If columns don't exist yet, fall back gracefully
      console.warn('fetchUserProfile error (non-fatal):', error.message);
      return { role: 'customer' };
    }

    return {
      role: (data?.role as UserRole) ?? 'customer',
      branchId: data?.branch_id ?? undefined,
      avatarUrl: data?.avatar_url ?? undefined,
    };
  } catch {
    return { role: 'customer' };
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      loading: false,
      initialized: false,

      setCurrentUser: (user) => set({ currentUser: user, initialized: true }),

      login: async (email, password) => {
        const supabase = createClient();
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });

          if (error) {
            set({ loading: false });
            return { ok: false, message: getAuthErrorMessage(error.message) };
          }

          const user = data.user;
          const profile = await fetchUserProfile(user.id);

          set({
            loading: false,
            currentUser: {
              id: user.id,
              email: user.email ?? '',
              fullName: user.user_metadata?.full_name ?? '',
              role: profile.role,
              branchId: profile.branchId,
              avatarUrl: profile.avatarUrl,
            },
          });

          return { ok: true };
        } catch {
          set({ loading: false });
          return { ok: false, message: 'An unexpected error occurred.' };
        }
      },

      register: async ({ email, password, fullName }) => {
        const supabase = createClient();
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });

          if (error) {
            set({ loading: false });
            return { ok: false, message: getAuthErrorMessage(error.message) };
          }

          const user = data.user;

          if (user) {
            set({
              loading: false,
              currentUser: {
                id: user.id,
                email: user.email ?? '',
                fullName,
                role: 'customer', // New registrations are always customers
              },
            });
          } else {
            set({ loading: false });
          }

          return { ok: true };
        } catch {
          set({ loading: false });
          return { ok: false, message: 'An unexpected error occurred.' };
        }
      },

      loginWithGoogle: async (locale) => {
        const supabase = createClient();
        set({ loading: true });

        try {
          const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}`;
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo,
              queryParams: { prompt: 'select_account' },
            },
          });

          set({ loading: false });

          if (error) {
            return { ok: false, message: getAuthErrorMessage(error.message) };
          }

          return { ok: true };
        } catch {
          set({ loading: false });
          return { ok: false, message: 'An unexpected error occurred.' };
        }
      },

      sendPasswordReset: async (email, locale) => {
        const supabase = createClient();
        set({ loading: true });

        try {
          const redirectTo = `${window.location.origin}/${locale}/auth/reset-password`;
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

          set({ loading: false });

          if (error) {
            return { ok: false, message: getAuthErrorMessage(error.message) };
          }

          return { ok: true };
        } catch {
          set({ loading: false });
          return { ok: false, message: 'An unexpected error occurred.' };
        }
      },

      logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ currentUser: null });
      },

      refreshUser: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const profile = await fetchUserProfile(user.id);
          set({
            currentUser: {
              id: user.id,
              email: user.email ?? '',
              fullName: user.user_metadata?.full_name ?? '',
              role: profile.role,
              branchId: profile.branchId,
              avatarUrl: profile.avatarUrl,
            },
            initialized: true,
          });
        } else {
          set({ currentUser: null, initialized: true });
        }
      },

      // ── Role helpers ──────────────────────────────────────────
      isAdmin: () => get().currentUser?.role === 'admin',
      isManager: () => get().currentUser?.role === 'manager',
      isStaff: () => get().currentUser?.role === 'staff',
      hasStaffAccess: () => {
        const role = get().currentUser?.role;
        return role === 'staff' || role === 'manager' || role === 'admin';
      },
    }),
    {
      name: 'simba-auth',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);

// Re-export CurrentUser for convenience
export type { CurrentUser };
