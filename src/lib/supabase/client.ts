import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Supabase environment variables are missing. Auth features will be disabled.');
    return createBrowserClient(
      url || 'https://placeholder.supabase.co', 
      anonKey || 'placeholder'
    );
  }

  return createBrowserClient(url, anonKey);
}
