
import React, { useState } from 'react';
import { 
    Bell, Heart, MessageCircle, UserPlus, AtSign, Share2, 
    Shield, Radio, Info, Check, Trash2, Settings, Zap, ArrowLeft, MoreHorizontal
} from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { USERS, POSTS } from '../constants';
import { NotificationCategory, NotificationType, ViewState, User, Notification, Post } from '../types';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import CommentsModal from '../components/CommentsModal';
import ActionMenu from '../components/ActionMenu';

interface NotificationsProps {
    onUserClick: (user: User) => void;
    onNavigate: (view: ViewState) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onUserClick, onNavigate }) => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
    const [activeFilter, setActiveFilter] = useState<'All' | NotificationCategory>('All');
    const [showSettings, setShowSettings] = useState(false);
    
    // Interaction States
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
    const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
    const [actionMenuNotif, setActionMenuNotif] = useState<Notification | null>(null);

    // --- LOGIC ---

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'All') return true;
        return n.category === activeFilter;
    });

    const handleFollowBack = (userId: string) => {
        setFollowedUsers(prev => new Set(prev).add(userId));
        // In a real app, this would trigger an API call
    };

    const handleNotificationClick = (notif: Notification) => {
        markAsRead(notif.id);

        const user = USERS.find(u => u.id === notif.userId);
        
        // Contextual Navigation
        switch(notif.type) {
            case 'follow':
                if (user) onUserClick(user);
                break;
            case 'like':
            case 'comment':
            case 'mention':
                // Try to find a related post (Mock logic: usually notification has postId)
                // For demo, we try to match targetId if it exists, else open first post
                const post = POSTS.find(p => p.id === notif.targetId) || POSTS[0]; 
                if (notif.type === 'comment' || notif.type === 'mention') {
                    setActiveCommentPost(post);
                } else {
                    // Navigate to feed or specific post view (Simulated by going to Feed)
                    onNavigate(ViewState.FEED);
                }
                break;
            case 'message':
                onNavigate(ViewState.MESSAGES);
                break;
            case 'group_invite':
                onNavigate(ViewState.GROUPS);
                break;
            case 'security_alert':
                onNavigate(ViewState.SETTINGS);
                break;
            default:
                break;
        }
    };

    const handleDelete = (id: string) => {
        deleteNotification(id);
        setActionMenuNotif(null);
    };

    // --- UI HELPERS ---

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'like': return <Heart className="w-3.5 h-3.5 text-white fill-white" />;
            case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-white -rotate-90" />;
            case 'follow': return <UserPlus className="w-3.5 h-3.5 text-white" />;
            case 'mention': return <AtSign className="w-3.5 h-3.5 text-white" />;
            case 'system_update': return <Zap className="w-3.5 h-3.5 text-white" />;
            case 'security_alert': return <Shield className="w-3.5 h-3.5 text-white" />;
            case 'live_start': return <Radio className="w-3.5 h-3.5 text-white" />;
            default: return <Bell className="w-3.5 h-3.5 text-white" />;
        }
    };

    const getIconBg = (type: NotificationType) => {
        switch (type) {
            case 'like': return 'bg-red-500';
            case 'comment': return 'bg-blue-500';
            case 'follow': return 'bg-purple-500';
            case 'mention': return 'bg-orange-500';
            case 'security_alert': return 'bg-red-600';
            case 'system_update': return 'bg-black dark:bg-white dark:text-black';
            case 'live_start': return 'bg-pink-500';
            default: return 'bg-gray-500';
        }
    };

    // --- COMPONENT RENDER ---

    const NotificationItem: React.FC<{ notif: Notification }> = ({ notif }) => {
        const user = USERS.find(u => u.id === notif.userId);
        const isFollowing = user ? followedUsers.has(user.id) : false;

        return (
            <div 
                className={`relative group flex items-start p-4 border-b border-gray-50 dark:border-white/5 transition-all duration-300 ${!notif.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                onClick={() => handleNotificationClick(notif)}
                onContextMenu={(e) => { e.preventDefault(); setActionMenuNotif(notif); }} // Right click / Long press sim
            >
                {/* Avatar Section */}
                <div className="relative mr-3 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); if(user) onUserClick(user); }}>
                    {user ? (
                        <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-white/10" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-gray-500" />
                        </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-black ${getIconBg(notif.type)} shadow-sm`}>
                        {getIcon(notif.type)}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm text-gray-900 dark:text-white leading-snug">
                        {user && <span className="font-bold mr-1 hover:underline cursor-pointer" onClick={(e) => {e.stopPropagation(); onUserClick(user)}}>{user.name}</span>}
                        <span className="text-gray-600 dark:text-gray-300">{notif.text}</span>
                        {/* Time & Read Status */}
                        <div className="mt-1 flex items-center space-x-2">
                            <span className={`text-xs ${!notif.isRead ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>{notif.timestamp}</span>
                            {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>}
                        </div>
                    </div>
                    
                    {/* Action Buttons (Follow Back) */}
                    {notif.type === 'follow' && user && user.id !== 'u1' && (
                        <div className="mt-3 flex space-x-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleFollowBack(user.id); }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition shadow-sm ${
                                    isFollowing 
                                    ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300' 
                                    : 'bg-primary-600 text-white hover:bg-primary-700'
                                }`}
                            >
                                {isFollowing ? 'Following' : 'Follow Back'}
                            </button>
                        </div>
                    )}

                    {/* Comment Reply Action */}
                    {notif.type === 'comment' && (
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const post = POSTS.find(p => p.id === notif.targetId) || POSTS[0];
                                setActiveCommentPost(post);
                            }}
                            className="mt-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center"
                        >
                            <MessageCircle className="w-3 h-3 mr-1" /> Reply
                        </button>
                    )}
                </div>

                {/* Right Side: Media Preview or Menu */}
                <div className="flex flex-col items-end space-y-2 ml-2">
                    {notif.previewImage ? (
                        <img src={notif.previewImage} className="w-11 h-11 rounded-lg object-cover border border-gray-100 dark:border-white/10" />
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setActionMenuNotif(notif); }}
                            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-white dark:bg-black overflow-y-auto pb-20 relative">
            
            {/* --- MODALS --- */}
            {showSettings && <NotificationSettingsModal onClose={() => setShowSettings(false)} />}
            {activeCommentPost && <CommentsModal post={activeCommentPost} onClose={() => setActiveCommentPost(null)} />}
            <ActionMenu 
                isOpen={!!actionMenuNotif}
                onClose={() => setActionMenuNotif(null)}
                type="notification"
                isOwner={true}
                data={actionMenuNotif}
                onAction={(id, data) => {
                    if (id === 'delete' && data) handleDelete(data.id);
                    if (id === 'mute' && data) handleNotificationClick(data); // Simulating view
                }}
            />

            {/* --- HEADER --- */}
            <div className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-30 border-b border-gray-200 dark:border-white/10">
                <div className="px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Activity</h1>
                    <div className="flex items-center space-x-2">
                        {notifications.some(n => !n.isRead) && (
                            <button 
                                onClick={markAllAsRead} 
                                className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full hover:bg-primary-100 transition"
                            >
                                Mark read
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

                {/* --- FILTERS --- */}
                <div className="px-4 pb-3 flex space-x-2 overflow-x-auto no-scrollbar">
                    {['All', 'social', 'friends', 'system', 'security'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat as any)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all border ${
                                activeFilter === cat 
                                ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-md' 
                                : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                        >
                            {cat === 'social' ? 'Likes & Comments' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- NOTIFICATIONS LIST --- */}
            <div>
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-50">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-10 h-10 text-gray-400 dark:text-gray-600 stroke-1" />
                        </div>
                        <h3 className="font-bold text-lg dark:text-white">No notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">When you have activity, it will show up here.</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* New / Today / Earlier separators could be added here based on timestamp */}
                        {filteredNotifications.map((notif) => (
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
