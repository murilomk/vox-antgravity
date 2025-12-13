
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Shield, Palette, Smartphone, 
  Activity, Database, LogOut, Search, 
  ChevronRight, Lock, Eye, EyeOff, Zap, 
  Moon, Sun, Globe, Wifi, Fingerprint,
  Ghost, Cpu, Sliders, Layers, UserCircle,
  Check, Loader2
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { CURRENT_USER, APP_NAME } from '../constants';
import { SettingsState } from '../types';

// --- Types & Data ---

type SettingCategory = 'dashboard' | 'universe' | 'security' | 'wellness' | 'social' | 'data';

// --- Components ---

const GlassCard = ({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:bg-white dark:hover:bg-neutral-800/80' : ''} ${className}`}
  >
    {children}
  </div>
);

const TogglePill = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
    <div className="flex items-center justify-between py-2 group">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</span>
        <button 
            onClick={(e) => { e.stopPropagation(); onChange(); }}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${checked ? 'bg-primary-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-gray-300 dark:bg-neutral-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SmartSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <div className="py-3">
        <div className="flex justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-xs font-bold text-primary-500">{value}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
            <div 
                className="h-full bg-gradient-to-r from-primary-600 to-secondary-500 transition-all duration-300 ease-out" 
                style={{ width: `${value}%` }}
            />
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={value} 
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    </div>
);

const Toast = ({ message, show }: { message: string, show: boolean }) => (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 dark:bg-white/90 text-white dark:text-black px-6 py-3 rounded-full shadow-2xl backdrop-blur-md z-50 transition-all duration-300 flex items-center space-x-2 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <Check className="w-4 h-4" />
        <span className="text-sm font-bold">{message}</span>
    </div>
);

interface SettingsProps {
    settings: SettingsState;
    updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, updateSetting }) => {
  const { language, setLanguage, t } = useLanguage();
  const { logout, user } = useAuth();
  const [activeView, setActiveView] = useState<SettingCategory>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [trustScore, setTrustScore] = useState(0);

  // UI States
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    // Animate Trust Score on mount
    const timer = setTimeout(() => setTrustScore(98), 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
    showToast(language === 'en' ? 'Idioma alterado para Português' : 'Language switched to English');
  };

  const showToast = (msg: string) => {
      setToast({ show: true, message: msg });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleExport = () => {
      showToast('Export link sent to secure email');
  };

  // --- Sub-Views ---

  const renderDashboard = () => (
    <div className="animate-slide-up space-y-6 pb-20">
        {/* Header Profile Cluster */}
        <div className="flex flex-col items-center justify-center py-6 relative">
            <div className={`absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl pointer-events-none transition-opacity duration-700 ${settings.stealth ? 'opacity-0' : 'opacity-100'}`} />
            
            <div className="relative mb-4">
                <div className={`w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-green-400 via-primary-500 to-blue-500 ${settings.stealth ? '' : 'animate-spin-slow'}`}>
                    <img 
                        src={user?.avatar || CURRENT_USER.avatar} 
                        className={`w-full h-full rounded-full object-cover border-4 border-white dark:border-black transition-all duration-500 ${settings.stealth ? 'blur-md grayscale' : ''}`} 
                    />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {settings.stealth ? 'Unknown User' : (user?.name || 'User')}
            </h2>
            <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                   {t.settings.trust_score} {trustScore}%
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                   {t.settings.social_status}: Creator
                </span>
            </div>
        </div>

        {/* AI Search */}
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-xl flex items-center px-4 py-3">
                <Sparkles className="w-5 h-5 text-primary-500 mr-3 animate-pulse" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.settings.search_placeholder}
                    className="bg-transparent w-full outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
            </div>
            {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl shadow-xl z-20 p-2 animate-slide-up">
                    <div className="p-2 text-xs text-gray-400 uppercase font-bold">Nova AI Suggestions</div>
                    <div onClick={() => { setActiveView('wellness'); setSearchQuery(''); }} className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg cursor-pointer flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm dark:text-white">Activate Focus Mode</span>
                    </div>
                     <div onClick={() => { setActiveView('security'); setSearchQuery(''); }} className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg cursor-pointer flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm dark:text-white">Check Security Logs</span>
                    </div>
                </div>
            )}
        </div>

        {/* Nova AI Card */}
        <GlassCard className="p-4 border-l-4 border-l-primary-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full" />
            <div className="flex items-start space-x-4 relative z-10">
                <div className="p-3 bg-primary-500/10 rounded-lg">
                    <Cpu className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{t.settings.nova_ai.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.settings.nova_ai.desc}</p>
                    <div 
                        onClick={() => { updateSetting('focusMode', true); showToast('Focus Mode Activated by Nova'); }}
                        className="mt-3 bg-white/50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5 flex items-center space-x-2 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition"
                    >
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 italic">{t.settings.nova_ai.suggestion}</span>
                    </div>
                </div>
            </div>
        </GlassCard>

        {/* Bento Grid Menu */}
        <div className="grid grid-cols-2 gap-3">
            <GlassCard onClick={() => setActiveView('universe')} className="p-4 flex flex-col items-center text-center hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10">
                <Palette className="w-8 h-8 text-blue-500 mb-2" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">{t.settings.categories.universe}</span>
                <span className="text-[10px] text-gray-500">{t.settings.categories.universe_desc}</span>
            </GlassCard>
            
            <GlassCard onClick={() => setActiveView('security')} className="p-4 flex flex-col items-center text-center hover:bg-gradient-to-br hover:from-green-500/10 hover:to-emerald-500/10">
                <Shield className="w-8 h-8 text-green-500 mb-2" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">{t.settings.categories.security}</span>
                <span className="text-[10px] text-gray-500">{t.settings.categories.security_desc}</span>
            </GlassCard>

            <GlassCard onClick={() => setActiveView('wellness')} className="p-4 flex flex-col items-center text-center hover:bg-gradient-to-br hover:from-orange-500/10 hover:to-yellow-500/10">
                <Activity className="w-8 h-8 text-orange-500 mb-2" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">{t.settings.categories.wellness}</span>
                <span className="text-[10px] text-gray-500">{t.settings.categories.wellness_desc}</span>
            </GlassCard>

            <GlassCard onClick={() => setActiveView('social')} className="p-4 flex flex-col items-center text-center hover:bg-gradient-to-br hover:from-pink-500/10 hover:to-rose-500/10">
                <Sliders className="w-8 h-8 text-pink-500 mb-2" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">{t.settings.categories.social}</span>
                <span className="text-[10px] text-gray-500">{t.settings.categories.social_desc}</span>
            </GlassCard>

             <GlassCard onClick={() => setActiveView('data')} className="col-span-2 p-4 flex flex-row items-center justify-between hover:bg-gradient-to-r hover:from-gray-500/10 hover:to-slate-500/10">
                <div className="flex items-center space-x-3">
                    <Database className="w-6 h-6 text-gray-500" />
                    <div className="text-left">
                        <span className="block font-bold text-sm text-gray-900 dark:text-white">{t.settings.categories.data}</span>
                        <span className="block text-[10px] text-gray-500">2.4GB Used • Auto-Cleaning Active</span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </GlassCard>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col space-y-2 pt-4">
             <button onClick={toggleLanguage} className="flex items-center justify-center space-x-2 py-3 bg-gray-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 transition text-gray-700 dark:text-gray-300">
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'Switch to Português' : 'Mudar para English'}</span>
            </button>
             <button onClick={logout} className="flex items-center justify-center space-x-2 py-3 bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition text-red-500">
                <LogOut className="w-4 h-4" />
                <span>DISCONNECT</span>
            </button>
             <div className="text-center pt-2 pb-8">
                <p className="text-[10px] text-gray-400 font-mono">{APP_NAME} OS v2.0.4 // BUILD 9928</p>
            </div>
        </div>
    </div>
  );

  const renderDetailHeader = (title: string, icon: any) => (
      <div className="flex items-center space-x-4 mb-6 sticky top-0 bg-gray-50/90 dark:bg-black/90 backdrop-blur-md z-30 py-4 -mx-4 px-4 border-b border-gray-100 dark:border-neutral-800">
          <button onClick={() => setActiveView('dashboard')} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition">
              <ChevronRight className="w-5 h-5 rotate-180 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center space-x-2">
              {icon}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
      </div>
  );

  const renderUniverse = () => (
      <div className="animate-slide-up pb-20">
          {renderDetailHeader(t.settings.categories.universe, <Palette className="w-6 h-6 text-blue-500"/>)}
          
          <GlassCard className="p-5 mb-4">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-4">Smart Themes</h3>
              <div className="grid grid-cols-3 gap-3">
                   <div 
                        onClick={() => updateSetting('themeMode', 'light')}
                        className={`h-24 rounded-xl bg-gradient-to-br from-white to-gray-200 relative cursor-pointer shadow-md transition-all ${settings.themeMode === 'light' ? 'ring-2 ring-primary-500 scale-105' : 'opacity-70'}`}
                   >
                       <span className="absolute bottom-2 left-2 text-[10px] font-bold text-black">Light</span>
                       {settings.themeMode === 'light' && <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />}
                   </div>
                   <div 
                        onClick={() => updateSetting('themeMode', 'dark')}
                        className={`h-24 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-700 cursor-pointer transition-all ${settings.themeMode === 'dark' ? 'ring-2 ring-primary-500 scale-105' : 'opacity-70'}`}
                    >
                       <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white">Dark</span>
                       {settings.themeMode === 'dark' && <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />}
                   </div>
                   <div 
                        onClick={() => updateSetting('themeMode', 'neon')}
                        className={`h-24 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border border-transparent cursor-pointer transition-all ${settings.themeMode === 'neon' ? 'ring-2 ring-white scale-105' : 'opacity-70'}`}
                    >
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white">Neon</span>
                        {settings.themeMode === 'neon' && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />}
                   </div>
              </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-4">
               <h3 className="text-xs font-bold uppercase text-gray-500">Interface</h3>
               <TogglePill label="Solar Theme (Auto-Switch)" checked={settings.solarTheme} onChange={() => updateSetting('solarTheme', !settings.solarTheme)} />
               <TogglePill label="Emotional Theme (AI Detected)" checked={settings.emotionalTheme} onChange={() => updateSetting('emotionalTheme', !settings.emotionalTheme)} />
               <TogglePill label="3D Parallax Effects" checked={settings.parallax} onChange={() => updateSetting('parallax', !settings.parallax)} />
          </GlassCard>

          <GlassCard className="p-5 mt-4 space-y-4">
               <h3 className="text-xs font-bold uppercase text-gray-500">Identity</h3>
               <div className="flex items-center justify-between">
                   <span className="text-sm font-medium dark:text-gray-300">Avatar 3D</span>
                   <button onClick={() => showToast('Avatar Creator Opening...')} className="px-3 py-1 bg-primary-500/20 text-primary-500 text-xs font-bold rounded-lg hover:bg-primary-500/30">Create</button>
               </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium dark:text-gray-300">Profile Cover</span>
                   <button className="px-3 py-1 bg-white/10 text-gray-400 text-xs font-bold rounded-lg hover:bg-white/20">Edit</button>
               </div>
          </GlassCard>
      </div>
  );

  const renderSecurity = () => (
      <div className="animate-slide-up pb-20">
           {renderDetailHeader(t.settings.categories.security, <Shield className="w-6 h-6 text-green-500"/>)}
           
           <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center space-x-3">
               <Shield className="w-8 h-8 text-green-500" />
               <div>
                   <h3 className="font-bold text-green-600 dark:text-green-400 text-sm">System Secure</h3>
                   <p className="text-[10px] text-green-600/70 dark:text-green-400/70">No intrusions detected in the last 30 days.</p>
               </div>
           </div>

           <GlassCard className="p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-500">Biometrics & Access</h3>
                <div className="flex items-center justify-between py-2 group">
                    <div className="flex items-center space-x-3">
                        <Fingerprint className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium dark:text-gray-300">FaceID Login</span>
                    </div>
                    <button 
                        onClick={() => updateSetting('faceId', !settings.faceId)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.faceId ? 'bg-primary-500' : 'bg-gray-700'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.faceId ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>
                <div className="flex items-center justify-between py-2 group">
                    <div className="flex items-center space-x-3">
                        <Ghost className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium dark:text-gray-300">Stealth Mode</span>
                    </div>
                    <button onClick={() => updateSetting('stealth', !settings.stealth)} className={`w-12 h-6 rounded-full relative transition-colors ${settings.stealth ? 'bg-primary-500' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.stealth ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>
           </GlassCard>

           <GlassCard className="p-5 mt-4 space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-500">Proactive Defense</h3>
                 <TogglePill label="Intrusion Detection AI" checked={settings.intrusionDetection} onChange={() => updateSetting('intrusionDetection', !settings.intrusionDetection)} />
                 <TogglePill label="Ghost Locations" checked={settings.ghostLocation} onChange={() => updateSetting('ghostLocation', !settings.ghostLocation)} />
                 <TogglePill label="App Camouflage (Change Icon)" checked={settings.appCamouflage} onChange={() => updateSetting('appCamouflage', !settings.appCamouflage)} />
           </GlassCard>
      </div>
  );

  const renderSocial = () => (
      <div className="animate-slide-up pb-20">
          {renderDetailHeader(t.settings.categories.social, <Sliders className="w-6 h-6 text-pink-500"/>)}

          <GlassCard className="p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase text-gray-500">The Algorithm Control</h3>
                  <div className="bg-pink-500/10 text-pink-500 text-[10px] px-2 py-1 rounded font-bold">YOU ARE IN CHARGE</div>
              </div>
              <p className="text-xs text-gray-400 mb-6">Adjust what the Nova AI shows you in your feed.</p>
              
              <SmartSlider label="Viral Content" value={settings.viralContent} onChange={(v) => updateSetting('viralContent', v)} />
              <SmartSlider label="Close Friends" value={settings.closeFriends} onChange={(v) => updateSetting('closeFriends', v)} />
              <SmartSlider label="Educational / Tech" value={settings.educational} onChange={(v) => updateSetting('educational', v)} />
              <SmartSlider label="Local Events" value={settings.localEvents} onChange={(v) => updateSetting('localEvents', v)} />
          </GlassCard>

           <GlassCard className="p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-500">Community Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer">
                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">884</span>
                        <span className="text-[10px] text-gray-500 uppercase">Interactions</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer">
                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">Top 5%</span>
                        <span className="text-[10px] text-gray-500 uppercase">Reputation</span>
                    </div>
                </div>
           </GlassCard>
      </div>
  )

  const renderWellness = () => (
      <div className="animate-slide-up pb-20">
          {renderDetailHeader(t.settings.categories.wellness, <Activity className="w-6 h-6 text-orange-500"/>)}
           <GlassCard className="p-5 space-y-4">
                 <h3 className="text-xs font-bold uppercase text-gray-500">Digital Zen</h3>
                 <TogglePill label="Wellness Awareness (Stress Detect)" checked={settings.wellnessAwareness} onChange={() => updateSetting('wellnessAwareness', !settings.wellnessAwareness)} />
                 <TogglePill label="Blue Light Filter Sync" checked={settings.blueLight} onChange={() => updateSetting('blueLight', !settings.blueLight)} />
                 <TogglePill label="Focus Mode (Only Urgent Chats)" checked={settings.focusMode} onChange={() => updateSetting('focusMode', !settings.focusMode)} />
           </GlassCard>

           <GlassCard className="p-5 mt-4">
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Notification Intensity</h3>
                <SmartSlider label="Push Volume" value={settings.pushVolume} onChange={(v) => updateSetting('pushVolume', v)} />
           </GlassCard>
      </div>
  );

    const renderData = () => (
      <div className="animate-slide-up pb-20">
          {renderDetailHeader(t.settings.categories.data, <Database className="w-6 h-6 text-gray-500"/>)}
           <GlassCard className="p-5 space-y-4">
                 <h3 className="text-xs font-bold uppercase text-gray-500">Neural Storage</h3>
                 <div className="w-full h-4 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                     <div className="w-[40%] bg-blue-500 animate-pulse" />
                     <div className="w-[20%] bg-green-500 animate-pulse" />
                     <div className="w-[10%] bg-yellow-500 animate-pulse" />
                 </div>
                 <div className="flex justify-between text-[10px] text-gray-400">
                     <span>Photos (40%)</span>
                     <span>Videos (20%)</span>
                     <span>Cache (10%)</span>
                 </div>
                 <button 
                    onClick={() => showToast('AI Cleaner initiated. Running in background.')}
                    className="w-full py-2 bg-gray-100 dark:bg-white/10 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 flex justify-center items-center space-x-2 hover:bg-gray-200 dark:hover:bg-white/20 transition disabled:opacity-50"
                 >
                    <Database className="w-4 h-4" />
                    <span>Run AI Cleaner</span>
                 </button>
           </GlassCard>

           <GlassCard className="p-5 mt-4 space-y-4">
                 <h3 className="text-xs font-bold uppercase text-gray-500">Data Rights</h3>
                 <TogglePill label="Allow AI Training" checked={settings.allowTraining} onChange={() => updateSetting('allowTraining', !settings.allowTraining)} />
                 <TogglePill label="Ad Personalization" checked={settings.adPersonalization} onChange={() => updateSetting('adPersonalization', !settings.adPersonalization)} />
                 <button onClick={handleExport} className="w-full py-2 border border-red-500/50 text-red-500 rounded-lg text-xs font-bold mt-2 hover:bg-red-500/10 transition">
                     Export My Persona
                 </button>
           </GlassCard>
      </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen">
        <Toast show={toast.show} message={toast.message} />
        
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'universe' && renderUniverse()}
        {activeView === 'security' && renderSecurity()}
        {activeView === 'social' && renderSocial()}
        {activeView === 'wellness' && renderWellness()}
        {activeView === 'data' && renderData()}
    </div>
  );
};

export default Settings;
