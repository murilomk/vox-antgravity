
import React, { useState } from 'react';
import { X, Bell, MessageCircle, Heart, UserPlus, Shield, AtSign, Users, Zap } from 'lucide-react';

interface NotificationSettingsModalProps {
    onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ onClose }) => {
    const [settings, setSettings] = useState({
        pauseAll: false,
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        groups: true,
        system: true,
        security: true,
        email: false,
        sms: false
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const SettingItem = ({ label, icon: Icon, id, description }: { label: string, icon: any, id: keyof typeof settings, description?: string }) => (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${settings[id] ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                    {description && <p className="text-xs text-gray-500">{description}</p>}
                </div>
            </div>
            <button 
                onClick={() => toggle(id)}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${settings[id] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-neutral-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings[id] ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-10">
                    <h3 className="font-bold text-lg dark:text-white flex items-center">
                        <Bell className="w-5 h-5 mr-2" /> Notification Settings
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl mb-6">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">Pause All</span>
                            <button 
                                onClick={() => toggle('pauseAll')}
                                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${settings.pauseAll ? 'bg-red-500' : 'bg-gray-300 dark:bg-neutral-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings.pauseAll ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Temporarily pause all notifications for 1 hour.</p>
                    </div>

                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Interactions</h4>
                    <SettingItem id="likes" label="Likes" icon={Heart} />
                    <SettingItem id="comments" label="Comments" icon={MessageCircle} />
                    <SettingItem id="mentions" label="Mentions & Tags" icon={AtSign} />
                    
                    <h4 className="text-xs font-bold text-gray-500 uppercase mt-6 mb-2">Network</h4>
                    <SettingItem id="follows" label="New Followers" icon={UserPlus} />
                    <SettingItem id="groups" label="Group Activity" icon={Users} />
                    
                    <h4 className="text-xs font-bold text-gray-500 uppercase mt-6 mb-2">System</h4>
                    <SettingItem id="security" label="Security Alerts" icon={Shield} description="Login attempts, password changes" />
                    <SettingItem id="system" label="App Updates" icon={Zap} />
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-neutral-900">
                    <button onClick={onClose} className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
