
import React, { useState } from 'react';
import { X, Search, Link as LinkIcon, Copy, Plus, Send, Check, Share2, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { USERS, CURRENT_USER } from '../constants';
import { Post, User } from '../types';

interface ShareModalProps {
    post: Post | any;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isSent, setIsSent] = useState(false);
    const [copied, setCopied] = useState(false);

    // Filter users (excluding current user)
    const filteredUsers = USERS.slice(1).filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    const handleSend = () => {
        setIsSent(true);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://nexus.social/p/${post.id}`);
        setCopied(true);
        if (navigator.vibrate) navigator.vibrate(20);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full md:w-[450px] h-[65vh] md:h-[550px] bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                
                {/* Search Header */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-xl px-3 py-2">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search people..." 
                            className="bg-transparent w-full outline-none text-sm dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content Area */}
                {isSent ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-scale-up">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                            <Check className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Sent!</h3>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Quick Grid (Recent) */}
                        {!searchQuery && (
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {/* Add to Story */}
                                <div className="flex flex-col items-center space-y-2 cursor-pointer group">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-600 group-hover:border-primary-500 transition">
                                        <Plus className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-primary-500" />
                                    </div>
                                    <span className="text-[10px] text-center font-medium dark:text-gray-300">Add to Story</span>
                                </div>
                                {filteredUsers.slice(0, 7).map(user => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    return (
                                        <div key={user.id} onClick={() => toggleUser(user.id)} className="flex flex-col items-center space-y-2 cursor-pointer group">
                                            <div className="relative">
                                                <img src={user.avatar} className={`w-14 h-14 rounded-full object-cover border-2 transition ${isSelected ? 'border-primary-500 scale-105' : 'border-transparent group-hover:scale-105'}`} />
                                                {isSelected && (
                                                    <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-0.5 border-2 border-white dark:border-black animate-scale-up">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-center font-medium truncate w-16 dark:text-gray-300">{user.name.split(' ')[0]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* List View (for search or more) */}
                        {searchQuery && (
                            <div className="space-y-2">
                                {filteredUsers.map(user => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    return (
                                        <div key={user.id} onClick={() => toggleUser(user.id)} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                                            <div className="flex items-center space-x-3">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <p className="text-sm font-bold dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-500">@{user.handle}</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-neutral-600'}`}>
                                                {isSelected && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar mb-4">
                        <button 
                            onClick={handleCopyLink}
                            className={`flex flex-col items-center justify-center min-w-[70px] space-y-1 transition ${copied ? 'text-green-500' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <div className={`p-3 rounded-full bg-gray-200 dark:bg-neutral-800 ${copied ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                                {copied ? <Check className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                            </div>
                            <span className="text-[10px] font-bold">{copied ? 'Copied' : 'Copy link'}</span>
                        </button>
                        <button className="flex flex-col items-center justify-center min-w-[70px] space-y-1 text-gray-600 dark:text-gray-300">
                            <div className="p-3 rounded-full bg-gray-200 dark:bg-neutral-800">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold">Share via...</span>
                        </button>
                        <button className="flex flex-col items-center justify-center min-w-[70px] space-y-1 text-gray-600 dark:text-gray-300">
                            <div className="p-3 rounded-full bg-gray-200 dark:bg-neutral-800">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold">SMS</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={selectedUsers.length === 0}
                        className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
                    >
                        Send {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
