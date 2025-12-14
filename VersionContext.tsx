import React, { createContext, useContext, useEffect, useState } from 'react';

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

    loadRemote();

    // Determine interval from localStorage (minutes). Default 10 minutes. 0 = disabled
    const getIntervalMs = () => {
      try {
        const v = parseInt(localStorage.getItem('vox_update_check_minutes') || '10', 10);
        if (Number.isNaN(v) || v <= 0) return null;
        return v * 60 * 1000;
      } catch { return 10 * 60 * 1000; }
    };

    let intervalId: any = null;
    const startInterval = () => {
      const ms = getIntervalMs();
      if (ms) {
        intervalId = setInterval(() => loadRemote(), ms);
      }
    };

    startInterval();

    // Listen to storage changes (so changing settings in another tab updates this)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'vox_update_check_minutes') {
        if (intervalId) clearInterval(intervalId);
        startInterval();
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
