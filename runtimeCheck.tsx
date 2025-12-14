import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';

const mask = (s?: string) => {
  if (!s) return 'MISSING';
  if (s.length <= 12) return s.replace(/.(?=.{4})/g, '*');
  return `${s.slice(0,6)}...${s.slice(-4)}`;
};

const RuntimeCheck: React.FC = () => {
  useEffect(() => {
    const url = (import.meta.env.VITE_SUPABASE_URL as string) || undefined;
    const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || undefined;

    // Log masked values so it's visible in browser console without exposing secrets
    console.info('[RuntimeCheck] VITE_SUPABASE_URL:', url ?? 'MISSING');
    console.info('[RuntimeCheck] VITE_SUPABASE_ANON_KEY:', key ? mask(key) : 'MISSING');

    if (!url || !key) {
      console.warn('[RuntimeCheck] Supabase environment variables are not set. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');
      return;
    }

    // Lightweight test: try a harmless read from `profiles` to validate anon key works.
    (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.error('[RuntimeCheck] Supabase test read failed:', error);
        } else {
          console.info('[RuntimeCheck] Supabase test read OK (profiles returned):', Array.isArray(data) ? data.length : data);
        }
      } catch (err) {
        console.error('[RuntimeCheck] Supabase test threw an exception:', err);
      }
    })();
  }, []);

  return null;
};

export default RuntimeCheck;
