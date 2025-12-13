
import React, { useState } from 'react';
import { X, Search, UserPlus, UserCheck } from 'lucide-react';
import { User } from '../types';
import { USERS, CURRENT_USER } from '../constants';

interface UserListModalProps {
    type: 'Followers' | 'Following';
    users?: User[]; // Optional override
    onClose: () => void;
    onUserClick: (user: User) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ type, users, onClose, onUserClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    // Mock local state for following status to simulate interaction
    const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

    // If users not provided, generate mock list based on USERS constant for demo
    // In a real app, this would be passed as a prop based on the profile ID
    const displayUsers = users || USERS.slice(1); 

    const filteredUsers = displayUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFollow = (userId: string) => {
        setFollowingState(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
        if (navigator.vibrate) navigator.vibrate(20);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-neutral-900 w-full md:w-[450px] h-[80vh] md:h-[600px] rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="w-8" /> {/* Spacer */}
                    <h3 className="font-bold text-lg dark:text-white">{type}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                        <X className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative bg-gray-100 dark:bg-neutral-800 rounded-xl px-3 py-2 flex items-center">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder={`Search ${type}...`} 
                            className="bg-transparent w-full outline-none text-sm dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <p className="text-sm">No users found.</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                            // Default follow state logic: In "Following" list everyone is followed, else check local state
                            const isFollowing = type === 'Following' 
                                ? !followingState[user.id] // If in following list, default true, toggle makes false
                                : followingState[user.id]; // In followers list, default false, toggle makes true

                            return (
                                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition cursor-pointer" onClick={() => onUserClick(user)}>
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</h4>
                                            <p className="text-xs text-gray-500">{user.handle}</p>
                                        </div>
                                    </div>
                                    {user.id !== CURRENT_USER.id && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleFollow(user.id); }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                                                isFollowing
                                                ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white'
                                                : 'bg-primary-600 text-white'
                                            }`}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
