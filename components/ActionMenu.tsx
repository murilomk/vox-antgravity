
import React, { useEffect, useState } from 'react';
import { 
    Share2, Link as LinkIcon, Bookmark, Flag, EyeOff, UserMinus, 
    Trash2, Edit3, BarChart2, MessageCircleOff, Languages, Pin, 
    VolumeX, AlertTriangle, Copy, CornerUpLeft, Star, Download, 
    Layers, UserPlus, LogOut, Shield, MicOff, X, Zap, Info, Repeat, Slash, Ban,
    Search, Image as ImageIcon, Smartphone, FileText, BellOff
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export type MenuContextType = 'post' | 'story' | 'reel' | 'profile' | 'chat' | 'group' | 'message' | 'notification' | 'comment';

interface ActionMenuProps {
    isOpen: boolean;
    onClose: () => void;
    type: MenuContextType;
    isOwner: boolean; // Is the current user the author/admin?
    data?: any; // The object being acted upon (Post, User, Message)
    onAction?: (actionId: string, data?: any) => void;
}

interface MenuAction {
    id: string;
    label: string;
    icon: any;
    variant?: 'default' | 'danger' | 'warning' | 'accent';
    isQuick?: boolean; // Show in the top horizontal row
}

const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, type, isOwner, data, onAction }) => {
    const [animate, setAnimate] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
            // Haptic feedback on open
            if (navigator.vibrate) navigator.vibrate(10);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    const handleAction = (actionId: string) => {
        if (navigator.vibrate) navigator.vibrate(15);
        if (onAction) onAction(actionId, data);
        onClose();
    };

    // --- Action Definitions ---

    const getActions = (): MenuAction[] => {
        const commonQuick: MenuAction[] = [
            { id: 'share', label: 'Share', icon: Share2, isQuick: true },
            { id: 'link', label: 'Link', icon: LinkIcon, isQuick: true },
        ];

        switch (type) {
            case 'post':
                if (isOwner) {
                    return [
                        ...commonQuick,
                        { id: 'save', label: 'Save', icon: Bookmark, isQuick: true },
                        { id: 'archive', label: 'Archive', icon: Layers, isQuick: true },
                        
                        { id: 'insights', label: 'View Insights', icon: BarChart2 },
                        { id: 'edit', label: 'Edit Post', icon: Edit3 },
                        { id: 'pin', label: 'Pin to Profile', icon: Pin },
                        { id: 'comments_off', label: 'Turn off commenting', icon: MessageCircleOff },
                        { id: 'delete', label: 'Delete', icon: Trash2, variant: 'danger' },
                    ];
                } else {
                    return [
                        ...commonQuick,
                        { id: 'save', label: 'Save', icon: Bookmark, isQuick: true },
                        { id: 'remix', label: 'Remix', icon: Zap, isQuick: true },

                        { id: 'not_interested', label: 'Not Interested', icon: EyeOff },
                        { id: 'unfollow', label: 'Unfollow', icon: UserMinus },
                        { id: 'mute', label: 'Mute', icon: VolumeX },
                        { id: 'translate', label: 'Translate', icon: Languages },
                        { id: 'report', label: 'Report', icon: Flag, variant: 'danger' },
                    ];
                }

            case 'reel':
                return [
                    { id: 'repost', label: 'Repost', icon: Repeat, isQuick: true },
                    { id: 'save', label: 'Save', icon: Bookmark, isQuick: true },
                    { id: 'copy_link', label: 'Copy Link', icon: LinkIcon, isQuick: true },
                    { id: 'share_via', label: 'Share via...', icon: Share2, isQuick: true },
                    
                    { id: 'not_interested', label: 'Not interested', icon: EyeOff },
                    { id: 'remix', label: 'Remix this Reel', icon: Layers },
                    { id: 'about_account', label: 'About this account', icon: Info },
                    { id: 'mute_user', label: 'Mute updates', icon: VolumeX },
                    { id: 'unfollow', label: 'Unfollow user', icon: UserMinus },
                    { id: 'block', label: 'Block user', icon: Ban, variant: 'danger' },
                    { id: 'report', label: 'Report', icon: Flag, variant: 'danger' },
                ];

            case 'profile':
                if (isOwner) {
                    return [
                        { id: 'share_profile', label: 'Share Profile', icon: Share2, isQuick: true },
                        { id: 'qr', label: 'QR Code', icon: LinkIcon, isQuick: true },
                        { id: 'settings', label: 'Settings', icon: Edit3 },
                        { id: 'archive', label: 'Archive', icon: Layers },
                        { id: 'saved', label: 'Saved', icon: Bookmark },
                    ];
                } else {
                    return [
                        { id: 'share_profile', label: 'Share Profile', icon: Share2, isQuick: true },
                        { id: 'copy_url', label: 'Copy URL', icon: LinkIcon, isQuick: true },
                        { id: 'message', label: 'Message', icon: UserPlus },
                        
                        { id: 'restrict', label: 'Restrict', icon: AlertTriangle },
                        { id: 'block', label: 'Block', icon: Shield, variant: 'danger' },
                        { id: 'report', label: 'Report', icon: Flag, variant: 'danger' },
                    ];
                }

            case 'chat':
                return [
                     // Quick Actions
                     { id: 'view_profile', label: 'Profile', icon: UserPlus, isQuick: true },
                     { id: 'mute', label: 'Mute', icon: BellOff, isQuick: true },
                     { id: 'search', label: 'Search', icon: Search, isQuick: true },
                     { id: 'pin', label: 'Pin', icon: Pin, isQuick: true },
                     
                     // List Actions
                     { id: 'theme', label: 'Change Theme', icon: ImageIcon },
                     { id: 'archive', label: 'Archive Chat', icon: Layers },
                     { id: 'export', label: 'Export Chat (.txt)', icon: FileText },
                     { id: 'add_shortcut', label: 'Add to Home Screen', icon: Smartphone },
                     { id: 'clear', label: 'Clear History', icon: Trash2, variant: 'warning' },
                     { id: 'block', label: 'Block User', icon: Ban, variant: 'danger' },
                     { id: 'report', label: 'Report', icon: Flag, variant: 'danger' },
                ];
            
            case 'message':
                 return [
                     { id: 'reply', label: 'Reply', icon: CornerUpLeft, isQuick: true },
                     { id: 'copy', label: 'Copy', icon: Copy, isQuick: true },
                     { id: 'forward', label: 'Forward', icon: Share2, isQuick: true },
                     
                     ...(isOwner ? [{ id: 'edit', label: 'Edit', icon: Edit3 }] : []),
                     { id: 'star', label: 'Star Message', icon: Star },
                     ...(isOwner 
                        ? [{ id: 'delete', label: 'Unsend', icon: Trash2, variant: 'danger' as const }] 
                        : [{ id: 'report', label: 'Report', icon: Flag, variant: 'danger' as const }]
                    ),
                 ];

            default:
                return commonQuick;
        }
    };

    const actions = getActions();
    const quickActions = actions.filter(a => a.isQuick);
    const listActions = actions.filter(a => !a.isQuick);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center">
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose}
            />

            {/* Modal Sheet */}
            <div 
                className={`
                    w-full md:w-[400px] bg-white dark:bg-neutral-900 backdrop-blur-xl 
                    rounded-t-3xl md:rounded-3xl border-t border-white/10 shadow-2xl 
                    transform transition-transform duration-300 ease-out overflow-hidden
                    ${animate ? 'translate-y-0 md:scale-100' : 'translate-y-full md:scale-95'}
                `}
            >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onTouchStart={onClose}>
                    <div className="w-10 h-1 bg-gray-300 dark:bg-neutral-700 rounded-full" />
                </div>

                {/* Optional Header (based on data) */}
                {data && (
                    <div className="px-6 pb-4 border-b border-gray-100 dark:border-white/5 text-center">
                         {type === 'post' && <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Selected Post</p>}
                         {type === 'reel' && <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Options</p>}
                         {type === 'chat' && <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chat Settings</p>}
                         {type === 'message' && <p className="text-xs text-gray-500 truncate">"{data.text || 'Message'}"</p>}
                    </div>
                )}

                <div className="p-4 space-y-4">
                    {/* Quick Actions Row */}
                    {quickActions.length > 0 && (
                        <div className="flex justify-around items-start pb-4 border-b border-gray-100 dark:border-white/5">
                            {quickActions.map(action => (
                                <button 
                                    key={action.id}
                                    onClick={() => handleAction(action.id)}
                                    className="flex flex-col items-center space-y-2 group w-1/4"
                                >
                                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-transparent group-hover:border-primary-500 transition-all duration-200 group-active:scale-95">
                                        <action.icon className="w-6 h-6 text-gray-900 dark:text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* List Actions */}
                    <div className="flex flex-col space-y-1 h-[40vh] md:h-auto overflow-y-auto">
                        {listActions.map(action => (
                            <button
                                key={action.id}
                                onClick={() => handleAction(action.id)}
                                className={`
                                    w-full flex items-center space-x-4 p-3.5 rounded-xl transition-colors duration-200
                                    ${action.variant === 'danger' 
                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' 
                                        : action.variant === 'warning'
                                            ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10'
                                            : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
                                `}
                            >
                                <action.icon className={`w-5 h-5 ${action.variant === 'danger' ? 'text-red-500' : action.variant === 'warning' ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`} />
                                <span className="font-semibold text-sm">{action.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Cancel Button */}
                    <button 
                        onClick={onClose}
                        className="w-full py-3 mt-2 font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionMenu;
