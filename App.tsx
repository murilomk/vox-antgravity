
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ViewState, SettingsState, User } from './types';
import { CURRENT_USER } from './constants';
import Layout from './components/Layout';
import Auth from './views/Auth';
import { LanguageProvider } from './LanguageContext';
import { NotificationProvider } from './NotificationContext';
import { ChatProvider } from './ChatContext';
import { GroupProvider } from './GroupContext';
import { AuthProvider, useAuth } from './AuthContext';
import { EventProvider } from './EventContext';
import { ContentProvider } from './ContentContext';
import { Loader2 } from 'lucide-react';
import RuntimeCheck from './runtimeCheck';
import { VersionProvider } from './VersionContext';

// Lazy Load Views for Performance Optimization
const Feed = lazy(() => import('./views/Feed'));
const Messages = lazy(() => import('./views/Messages'));
const Groups = lazy(() => import('./views/Groups'));
const Profile = lazy(() => import('./views/Profile'));
const Events = lazy(() => import('./views/Events'));
const Admin = lazy(() => import('./views/Admin'));
const Settings = lazy(() => import('./views/Settings'));
const Reels = lazy(() => import('./views/Reels'));
const Explore = lazy(() => import('./views/Explore'));
const AddFriends = lazy(() => import('./views/AddFriends'));
const Notifications = lazy(() => import('./views/Notifications'));

const DEFAULT_SETTINGS: SettingsState = {
    themeMode: 'dark',
    solarTheme: true,
    emotionalTheme: false,
    parallax: true,
    faceId: true,
    stealth: false,
    intrusionDetection: true,
    ghostLocation: false,
    appCamouflage: false,
    wellnessAwareness: true,
    blueLight: true,
    focusMode: false,
    pushVolume: 30,
    viralContent: 20,
    closeFriends: 90,
    educational: 65,
    localEvents: 40,
    allowTraining: false,
    adPersonalization: true
};

const LoadingScreen = () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
);

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.FEED);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);

  // Global Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.themeMode === 'dark') {
        root.classList.add('dark');
        // Set Android Status Bar Color via Meta Tag dynamically
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if(metaTheme) metaTheme.setAttribute('content', '#000000');
    } else {
        root.classList.remove('dark');
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if(metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
  }, [settings.themeMode]);

  if (isLoading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#050505]">
              <div className="w-12 h-12 bg-primary-500 rounded-xl animate-spin"></div>
          </div>
      );
  }

  if (!isAuthenticated || !user) {
      return <Auth />;
  }

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNavigateProfile = (user: User) => {
      setViewingProfile(user);
      setCurrentView(ViewState.PROFILE);
  };

  const renderView = () => {
    return (
        <Suspense fallback={<LoadingScreen />}>
            {(() => {
                switch (currentView) {
                    case ViewState.FEED:
                        return <Feed currentUser={user} onNavigate={setCurrentView} onUserClick={handleNavigateProfile} />;
                    case ViewState.MESSAGES:
                        return <Messages onUserClick={handleNavigateProfile} />;
                    case ViewState.GROUPS:
                        return <Groups onNavigate={setCurrentView} onUserClick={handleNavigateProfile} />;
                    case ViewState.REELS:
                        return <Reels onUserClick={handleNavigateProfile} />;
                    case ViewState.PROFILE:
                        return <Profile user={viewingProfile || user} onNavigate={setCurrentView} />;
                    case ViewState.EVENTS:
                        return <Events />;
                    case ViewState.ADMIN:
                        return <Admin />;
                    case ViewState.EXPLORE:
                        return <Explore onNavigate={setCurrentView} onUserClick={handleNavigateProfile} />;
                    case ViewState.ADD_FRIENDS:
                        return <AddFriends onNavigate={setCurrentView} />;
                    case ViewState.NOTIFICATIONS:
                        return <Notifications onUserClick={handleNavigateProfile} onNavigate={setCurrentView} />;
                    case ViewState.SETTINGS:
                        return <Settings settings={settings} updateSetting={updateSetting} />;
                    default:
                        return <Feed currentUser={user} onNavigate={setCurrentView} onUserClick={handleNavigateProfile} />;
                }
            })()}
        </Suspense>
    );
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={(view) => {
          setCurrentView(view);
          if (view === ViewState.PROFILE) setViewingProfile(null);
      }}
      currentUser={user}
    >
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
        <AuthProvider>
            <RuntimeCheck />
            <VersionProvider>
                <LanguageProvider>
                    <ChatProvider>
                        <NotificationProvider>
                        <GroupProvider>
                        <EventProvider>
                        <ContentProvider>
                                <AppContent />
                        </ContentProvider>
                        </EventProvider>
                        </GroupProvider>
                        </NotificationProvider>
                </ChatProvider>
                </LanguageProvider>
            </VersionProvider>
        </AuthProvider>
  );
};

export default App;
