import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthStore {
  currentUser: CurrentUser | null;
  loading: boolean;
  setCurrentUser: (user: CurrentUser | null) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (input: { email: string; password: string; fullName: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      loading: false,

      setCurrentUser: (user) => set({ currentUser: user }),

      login: async (email, password) => {
        const supabase = createClient();
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        set({ loading: false });
        if (error) return { ok: false, message: error.message };
        const user = data.user;
        set({
          currentUser: {
            id: user.id,
            email: user.email ?? '',
            fullName: user.user_metadata?.full_name ?? '',
          },
        });
        return { ok: true };
      },

      register: async ({ email, password, fullName }) => {
        const supabase = createClient();
        set({ loading: true });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        set({ loading: false });
        if (error) return { ok: false, message: error.message };
        const user = data.user;
        if (user) {
          set({
            currentUser: {
              id: user.id,
              email: user.email ?? '',
              fullName: fullName,
            },
          });
        }
        return { ok: true };
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
          set({
            currentUser: {
              id: user.id,
              email: user.email ?? '',
              fullName: user.user_metadata?.full_name ?? '',
            },
          });
        } else {
          set({ currentUser: null });
        }
      },
    }),
    {
      name: 'simba-auth',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
