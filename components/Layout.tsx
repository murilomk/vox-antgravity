
import React, { useEffect, useState } from 'react';
import { ViewState, User } from '../types';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Users, 
  Calendar, 
  User as UserIcon, 
  Settings, 
  ShieldAlert,
  Menu,
  Bell,
  Film,
  UserPlus
  ,RefreshCw
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { useLanguage } from '../LanguageContext';
import { useNotifications } from '../NotificationContext';
import { USERS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  currentUser: User;
}

// Global Toast Component
const NotificationToast = () => {
    const { latestNotification, setLatestNotification } = useNotifications();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (latestNotification) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(() => setLatestNotification(null), 300); // Wait for anim
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [latestNotification]);

    if (!latestNotification) return null;

    const user = USERS.find(u => u.id === latestNotification.userId);

    return (
        <div 
            className={`fixed top-4 left-4 right-4 md:left-1/2 md:w-96 md:-translate-x-1/2 z-[60] transform transition-all duration-300 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
            onClick={() => setVisible(false)}
        >
            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 cursor-pointer hover:scale-[1.02] transition">
                <div className="relative">
                    <img src={user?.avatar || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 bg-primary-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                        <Bell className="w-2 h-2 text-white" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user ? user.name : 'System'}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {latestNotification.text}
                    </p>
                </div>
                <span className="text-[10px] text-gray-400">now</span>
            </div>
        </div>
    )
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, currentUser }) => {
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group w-full ${
          isActive 
            ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-neutral-800 dark:text-primary-400' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
        }`}
      >
        <div className="relative">
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            {/* Specific badge logic for nav items if needed */}
        </div>
        <span className="hidden lg:block text-sm">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
      
      <NotificationToast />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-neutral-800 h-full transition-colors duration-300">
        <div className="p-6 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="hidden lg:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 tracking-tight">
                {APP_NAME}
            </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem view={ViewState.FEED} icon={Home} label={t.nav.home} />
          <NavItem view={ViewState.EXPLORE} icon={Search} label={t.nav.explore} />
          <NavItem view={ViewState.REELS} icon={Film} label={t.nav.reels} />
          <NavItem view={ViewState.MESSAGES} icon={MessageSquare} label={t.nav.messages} />
          <NavItem view={ViewState.GROUPS} icon={Users} label={t.nav.groups} />
          <NavItem view={ViewState.ADD_FRIENDS} icon={UserPlus} label={t.nav.add_friends} />
          <NavItem view={ViewState.EVENTS} icon={Calendar} label={t.nav.events} />
          
          <button
            onClick={() => onChangeView(ViewState.NOTIFICATIONS)}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group w-full ${
              currentView === ViewState.NOTIFICATIONS
                ? 'bg-primary-50 text-primary-600 font-semibold dark:bg-neutral-800 dark:text-primary-400' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="relative">
                <Bell className={`w-6 h-6 ${currentView === ViewState.NOTIFICATIONS ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
                )}
            </div>
            <span className="hidden lg:block text-sm">Notifications</span>
          </button>

          <NavItem view={ViewState.PROFILE} icon={UserIcon} label={t.nav.profile} />
          <NavItem view={ViewState.SETTINGS} icon={Settings} label={t.nav.settings} />
          <NavItem view={ViewState.UPDATE} icon={RefreshCw} label={"Atualizações"} />
          
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-neutral-800">
             <NavItem view={ViewState.ADMIN} icon={ShieldAlert} label={t.nav.moderation} />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
            <button onClick={() => onChangeView(ViewState.PROFILE)} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-50 dark:hover:bg-neutral-900 rounded-lg transition">
                <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.handle}</p>
                </div>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50 dark:bg-black transition-colors duration-300">
        {/* Mobile Header (Hidden on Reels view for immersion) */}
        {currentView !== ViewState.REELS && (
            <header className="md:hidden bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800 h-14 flex items-center justify-between px-4 z-20 pt-safe transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">V</span>
                </div>
                <div className="flex space-x-4">
                     {/* Add Friends shortcut on Mobile Header */}
                    <button onClick={() => onChangeView(ViewState.ADD_FRIENDS)}>
                        <UserPlus className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                  <button onClick={() => onChangeView(ViewState.UPDATE)}>
                    <RefreshCw className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                    
                    <button className="relative" onClick={() => onChangeView(ViewState.NOTIFICATIONS)}>
                        <Bell className={`w-6 h-6 ${currentView === ViewState.NOTIFICATIONS ? 'text-primary-600 fill-primary-100' : 'text-gray-700 dark:text-gray-300'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
                        )}
                    </button>
                    
                     <button onClick={() => onChangeView(ViewState.PROFILE)}>
                        <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    </button>
                </div>
            </header>
        )}
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar">
             {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-white/90 dark:bg-black/90 backdrop-blur-md border-t border-gray-200 dark:border-neutral-800 h-16 px-6 flex justify-between items-center z-30 pb-safe">
          <button onClick={() => onChangeView(ViewState.FEED)} className={`p-2 ${currentView === ViewState.FEED ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <Home className={`w-6 h-6 ${currentView === ViewState.FEED ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => onChangeView(ViewState.EXPLORE)} className={`p-2 ${currentView === ViewState.EXPLORE ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <Search className={`w-6 h-6 ${currentView === ViewState.EXPLORE ? 'stroke-[3px]' : ''}`} />
          </button>
          <button onClick={() => onChangeView(ViewState.REELS)} className={`p-2 ${currentView === ViewState.REELS ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <Film className={`w-6 h-6 ${currentView === ViewState.REELS ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => onChangeView(ViewState.MESSAGES)} className={`p-2 ${currentView === ViewState.MESSAGES ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <MessageSquare className={`w-6 h-6 ${currentView === ViewState.MESSAGES ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => onChangeView(ViewState.PROFILE)} className={`p-2 ${currentView === ViewState.PROFILE ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
            <UserIcon className={`w-6 h-6 ${currentView === ViewState.PROFILE ? 'fill-current' : ''}`} />
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
