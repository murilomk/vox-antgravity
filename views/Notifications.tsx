
import React, { useState } from 'react';
import {
    Bell, Check, Trash2, Settings, Info, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { Notification } from '../types';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import ActionMenu from '../components/ActionMenu';

interface NotificationsProps {
    onUserClick: (user: any) => void;
    onNavigate: (view: any) => void;
}

const Notifications: React.FC<NotificationsProps> = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const [showSettings, setShowSettings] = useState(false);
    const [actionMenuNotif, setActionMenuNotif] = useState<Notification | null>(null);

    // --- UI HELPERS ---

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: Notification['type'], read: boolean) => {
        if (read) return 'bg-white dark:bg-black';
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/10';
            case 'error': return 'bg-red-50 dark:bg-red-900/10';
            case 'warning': return 'bg-orange-50 dark:bg-orange-900/10';
            case 'info': return 'bg-blue-50 dark:bg-blue-900/10';
            default: return 'bg-gray-50 dark:bg-gray-900/10';
        }
    };

    // --- COMPONENT RENDER ---

    const NotificationItem: React.FC<{ notif: Notification }> = ({ notif }) => {
        return (
            <div
                className={`relative group flex items-start p-4 border-b border-gray-100 dark:border-white/5 transition-all duration-200 cursor-pointer ${getBgColor(notif.type, notif.read)}`}
                onClick={() => markAsRead(notif.id)}
                onContextMenu={(e) => { e.preventDefault(); setActionMenuNotif(notif); }}
            >
                {/* Icon Section */}
                <div className="mr-4 mt-1">
                    {getIcon(notif.type)}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {notif.title}
                        </h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className={`text-sm mt-0.5 ${!notif.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500'}`}>
                        {notif.message}
                    </p>
                </div>

                {/* Unread Indicator */}
                {!notif.read && (
                    <div className="absolute top-4 right-2 w-2 h-2 rounded-full bg-primary-500"></div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 relative">

            {/* --- MODALS --- */}
            {showSettings && <NotificationSettingsModal onClose={() => setShowSettings(false)} />}

            <ActionMenu
                isOpen={!!actionMenuNotif}
                onClose={() => setActionMenuNotif(null)}
                type="notification" // We might need to update ActionMenu to support this simplified type or just ignore
                isOwner={true}
                data={actionMenuNotif}
                onAction={(id, data) => {
                    if (id === 'delete' && data) {
                        deleteNotification(data.id);
                        setActionMenuNotif(null);
                    }
                }}
            />

            {/* --- HEADER --- */}
            <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-30 border-b border-gray-200 dark:border-white/10">
                <div className="px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Activity</h1>
                    <div className="flex items-center space-x-2">
                        {notifications.some(n => !n.read) && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full hover:bg-primary-100 transition"
                            >
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"
                        >
                            <Settings className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- NOTIFICATIONS LIST --- */}
            <div>
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-50">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600 stroke-1" />
                        </div>
                        <h3 className="font-bold text-lg dark:text-white">No notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">When you have activity, it will show up here.</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {notifications.map((notif) => (
                            <NotificationItem key={notif.id} notif={notif} />
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-8 text-center pb-24">
                    <button onClick={clearAll} className="text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-lg transition flex items-center justify-center mx-auto">
                        <Trash2 className="w-3 h-3 mr-2" />
                        Clear all history
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notifications;
