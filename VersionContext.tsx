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
        setHasUpdate(rv && rv !== (localVersion || '') ? true : false);
      } catch (e) {
        // silent fail
      }
    };

    loadRemote();
  }, [localVersion]);

  return (
    <VersionContext.Provider value={{ hasUpdate, localVersion, remoteVersion }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);
