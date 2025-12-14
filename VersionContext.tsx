import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

const GITHUB_RAW_METADATA = 'https://raw.githubusercontent.com/murilomk/vox-antgravity/main/metadata.json';

interface VersionContextType {
  hasUpdate: boolean;
  localVersion: string | null;
  remoteVersion: string | null;
}

const VersionContext = createContext<VersionContextType>({ hasUpdate: false, localVersion: null, remoteVersion: null });

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localVersion, setLocalVersion] = useState<string | null>(null);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // load local metadata
    fetch('/metadata.json')
      .then(r => r.json())
      .then(j => setLocalVersion(String(j?.version || j?.v || '')))
      .catch(() => setLocalVersion(null));

    // load remote metadata
    const loadRemote = async () => {
      try {
        const res = await fetch(GITHUB_RAW_METADATA + '?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const j = await res.json();
        const rv = String(j?.version || j?.v || '');
        setRemoteVersion(rv);
        // Compare with the current localVersion state
        setHasUpdate(rv && rv !== (localVersion || '') ? true : false);
      } catch (e) {
        // silent fail
      }
    };
    // If user is logged in, prefer interval stored in profile (column: update_check_interval)
    const getIntervalMinutes = async () => {
      // 1) try backend (profiles)
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('update_check_interval')
            .eq('id', user.id)
            .single();
          if (!error && data && data.update_check_interval !== undefined && data.update_check_interval !== null) {
            const v = parseInt(String(data.update_check_interval), 10);
            if (!Number.isNaN(v)) return v;
          }
        } catch (e) {
          // ignore backend fetch errors and fall back to localStorage/default
        }
      }

      // 2) fallback to localStorage
      try {
        const v = parseInt(localStorage.getItem('vox_update_check_minutes') || '10', 10);
        if (Number.isNaN(v)) return 10;
        return v;
      } catch {
        return 10;
      }
    };

    let intervalId: any = null;

    const startPolling = async () => {
      const minutes = await getIntervalMinutes();
      // if 0 or negative: disabled
      if (!minutes || minutes <= 0) return;
      const ms = minutes * 60 * 1000;
      // run initial check
      loadRemote();
      // clear previous if any
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => loadRemote(), ms);
    };

    startPolling();

    // Listen to storage changes and also react when profile preference might change (we rely on storage key as well)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'vox_update_check_minutes') {
        if (intervalId) clearInterval(intervalId);
        startPolling();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('storage', onStorage);
    };
  }, [localVersion]);

  return (
    <VersionContext.Provider value={{ hasUpdate, localVersion, remoteVersion }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);
