import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DemoUser {
  email: string;
  password: string;
  fullName: string;
}

interface AuthStore {
  users: DemoUser[];
  currentUser: DemoUser | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  register: (input: DemoUser) => { ok: boolean; message?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      login: (email, password) => {
        const user = get().users.find(
          (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
        );
        if (!user) {
          return { ok: false, message: 'Invalid email or password.' };
        }
        set({ currentUser: user });
        return { ok: true };
      },
      register: (input) => {
        const exists = get().users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase());
        if (exists) {
          return { ok: false, message: 'An account with this email already exists.' };
        }
        set({ users: [...get().users, input], currentUser: input });
        return { ok: true };
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: 'simba-auth' }
  )
);
