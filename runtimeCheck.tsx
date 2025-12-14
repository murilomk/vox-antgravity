import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const mask = (s?: string) => {
  if (!s) return 'MISSING';
  if (s.length <= 12) return s.replace(/.(?=.{4})/g, '*');
  return `${s.slice(0,6)}...${s.slice(-4)}`;
};

type Status = 'pending' | 'ok' | 'missing' | 'error';

const RuntimeCheck: React.FC = () => {
  const [status, setStatus] = useState<Status>('pending');
  const [message, setMessage] = useState<string>('Checking...');
  const [maskedKey, setMaskedKey] = useState<string>('');

  useEffect(() => {
    const url = (import.meta.env.VITE_SUPABASE_URL as string) || undefined;
    const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || undefined;

    setMaskedKey(key ? mask(key) : 'MISSING');

    console.info('[RuntimeCheck] VITE_SUPABASE_URL:', url ?? 'MISSING');
    console.info('[RuntimeCheck] VITE_SUPABASE_ANON_KEY:', key ? mask(key) : 'MISSING');

    if (!url || !key) {
      setStatus('missing');
      setMessage('Missing Supabase env vars');
      console.warn('[RuntimeCheck] Supabase environment variables are not set. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          setStatus('error');
          setMessage('Supabase read failed');
          console.error('[RuntimeCheck] Supabase test read failed:', error);
        } else {
          setStatus('ok');
          setMessage(`OK (${Array.isArray(data) ? data.length : 0})`);
          console.info('[RuntimeCheck] Supabase test read OK (profiles returned):', Array.isArray(data) ? data.length : data);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Supabase exception');
        console.error('[RuntimeCheck] Supabase test threw an exception:', err);
      }
    })();
  }, []);

  // Small banner UI
  const bg = status === 'ok' ? 'bg-emerald-600' : status === 'missing' ? 'bg-yellow-600' : status === 'error' ? 'bg-red-600' : 'bg-slate-500';

  return (
    <>
      {/* Desktop / large screens: small top-right banner */}
      <div aria-hidden className="hidden md:block" style={{position: 'fixed', right: 12, top: 12, zIndex: 9999}}>
        <div className={`${bg} text-white text-xs font-medium px-3 py-1 rounded-md shadow-lg flex items-center space-x-2`}>
          <span>{status === 'ok' ? 'Supabase: OK' : status === 'missing' ? 'Supabase: Missing' : status === 'error' ? 'Supabase: Error' : 'Supabase: Checking'}</span>
          <span className="opacity-80">•</span>
          <span className="opacity-90">{message}</span>
          <span className="opacity-60 ml-2">{maskedKey}</span>
        </div>
      </div>

      {/* Mobile: prominent bottom banner with dismiss */}
      <MobileBanner status={status} message={message} maskedKey={maskedKey} />
    </>
  );
};

export default RuntimeCheck;

const MobileBanner: React.FC<{status: Status; message: string; maskedKey: string}> = ({ status, message, maskedKey }) => {
  const [visible, setVisible] = React.useState(true);

  // Auto-hide after 6 seconds to avoid blocking UX (still shows in console)
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const bg = status === 'ok' ? 'bg-emerald-600' : status === 'missing' ? 'bg-yellow-600' : status === 'error' ? 'bg-red-600' : 'bg-slate-500';

  return (
    <div className={`md:hidden fixed left-1/2 transform -translate-x-1/2 bottom-4 z-50 w-[calc(100%-32px)] max-w-md`}>
      <div className={`${bg} text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="text-sm">{status === 'ok' ? 'Supabase connected' : status === 'missing' ? 'Supabase missing' : status === 'error' ? 'Supabase error' : 'Checking...'}</div>
          <div className="text-xs opacity-80">{message}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs opacity-60">{maskedKey}</div>
          <button aria-label="close banner" onClick={() => setVisible(false)} className="text-white opacity-90 hover:opacity-100 text-sm px-2 py-1">✕</button>
        </div>
      </div>
    </div>
  );
};
