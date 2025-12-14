import React, { useEffect, useState } from 'react';
import { ViewState } from '../types';

// Simple Update tab: compares local metadata.json with GitHub main raw metadata
// and shows a prompt if a newer version is available. Also exposes an APK link
// (assumes you upload an APK to GitHub Releases at the provided URL).

const GITHUB_RAW_METADATA = 'https://raw.githubusercontent.com/murilomk/vox-antgravity/main/metadata.json';
const GITHUB_RELEASE_APK = 'https://github.com/murilomk/vox-antgravity/releases/latest/download/app.apk';

const Update: React.FC<{ onNavigate?: (v: ViewState) => void }> = ({ onNavigate }) => {
  const [localMeta, setLocalMeta] = useState<any | null>(null);
  const [remoteMeta, setRemoteMeta] = useState<any | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // load local metadata (served with the app)
    fetch('/metadata.json')
      .then(r => r.json())
      .then(j => setLocalMeta(j))
      .catch(() => setLocalMeta(null));

    // fetch remote metadata from GitHub raw to detect new versions
    const loadRemote = async () => {
      setChecking(true);
      setError(null);
      try {
        const res = await fetch(GITHUB_RAW_METADATA + '?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        setRemoteMeta(j);
      } catch (e: any) {
        setError(`Falha ao buscar meta remota: ${e?.message || String(e)}`);
      } finally {
        setChecking(false);
      }
    };

    loadRemote();
  }, []);

  const isNewer = () => {
    if (!localMeta || !remoteMeta) return false;
    try {
      const lv = String(localMeta.version || localMeta.v || '').trim();
      const rv = String(remoteMeta.version || remoteMeta.v || '').trim();
      if (!lv || !rv) return false;
      return rv !== lv;
    } catch {
      return false;
    }
  };

  const handleApplyUpdate = () => {
    if (isNewer()) {
      const wantApk = confirm('Há uma nova versão disponível. Deseja baixar o APK agora? (Se preferir, escolha Cancel para apenas recarregar a webapp)');
      if (wantApk) {
        window.open(GITHUB_RELEASE_APK, '_blank');
      } else {
        if (confirm('Deseja recarregar a aplicação web para aplicar a atualização agora?')) {
          window.location.reload();
        }
      }
    } else {
      alert('Nenhuma atualização disponível no momento.');
    }
  };

  return (
    <div className="h-full w-full p-6 bg-gray-50 dark:bg-black">
      <h2 className="text-lg font-bold mb-4">Atualizações</h2>

      <div className="mb-4 p-4 bg-white dark:bg-neutral-900 border rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Versão local:</p>
        <pre className="text-xs bg-gray-100 dark:bg-neutral-800 p-3 rounded">{JSON.stringify(localMeta || { version: 'desconhecido' }, null, 2)}</pre>
      </div>

      <div className="mb-4 p-4 bg-white dark:bg-neutral-900 border rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Versão remota (GitHub):</p>
        {checking ? (
          <p>Verificando versão remota...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <pre className="text-xs bg-gray-100 dark:bg-neutral-800 p-3 rounded">{JSON.stringify(remoteMeta || { version: 'indisponivel' }, null, 2)}</pre>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={handleApplyUpdate} className="px-4 py-2 rounded-lg bg-primary-600 text-white">Verificar / Aplicar atualização</button>
        <a href={GITHUB_RELEASE_APK} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border">Baixar APK (releases)</a>
        <button onClick={() => { if (onNavigate) onNavigate(ViewState.SETTINGS); }} className="px-3 py-2 rounded-lg border">Ir para Configurações</button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Instruções para gerar um APK sincronizado:</p>
        <ol className="list-decimal list-inside mt-2">
          <li>Garanta que o repositório esteja atualizado em main.</li>
          <li>Build da web: npm run build.</li>
          <li>Empacotar como PWA/Android usando Capacitor ou TWA.</li>
        </ol>
        <div className="text-xs bg-gray-100 dark:bg-neutral-800 p-3 rounded mt-2">
          <div>Exemplo mínimo de comandos:</div>
          <div style={{whiteSpace: 'pre-wrap'}}>
            npm install @capacitor/core @capacitor/cli
            npx cap init voxnet com.yourcompany.voxnet
            npm run build
            npx cap add android
            npx cap copy android
            npx cap open android
          </div>
        </div>
      </div>
    </div>
  );
};

export default Update;
