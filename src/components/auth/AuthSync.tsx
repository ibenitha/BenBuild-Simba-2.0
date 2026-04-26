'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';

export default function AuthSync() {
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);

  useEffect(() => {
    const supabase = createClient();

    // Initial check — also fetches role from profiles table
    void refreshUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        return;
      }

      // On sign-in or token refresh, do a full refresh to get role
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void refreshUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser, setCurrentUser]);

  return null;
}
