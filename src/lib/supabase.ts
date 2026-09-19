import { createClient, SupabaseClient } from '@supabase/supabase-js';

// LocalStorage kalitlari (foydalanuvchi UI orqali kiritishi uchun ham)
const LS_URL_KEY = 'ecocontrol_supabase_url';
const LS_KEY_KEY = 'ecocontrol_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl =
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
    'https://vjeadggmxbpvwdpxhlid.supabase.co';
  const envKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
    (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
    'sb_publishable_I8ubHS_72c5F7in2hQGKlw_9z7OrCFM';

  const lsUrl = typeof window !== 'undefined' ? localStorage.getItem(LS_URL_KEY) || '' : '';
  const lsKey = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY_KEY) || '' : '';

  return {
    url: lsUrl.trim() || envUrl.trim(),
    anonKey: lsKey.trim() || envKey.trim(),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(LS_URL_KEY, url.trim());
    else localStorage.removeItem(LS_URL_KEY);

    if (anonKey) localStorage.setItem(LS_KEY_KEY, anonKey.trim());
    else localStorage.removeItem(LS_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Supabase client initialize xatosi:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
