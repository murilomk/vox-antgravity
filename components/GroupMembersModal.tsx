
import React from 'react';
import { X, Crown } from 'lucide-react';
import { Group, User } from '../types';
import { USERS } from '../constants';

interface GroupMembersModalProps {
    group: Group;
    onClose: () => void;
    onUserClick: (user: User) => void;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ group, onClose, onUserClick }) => {
    // Filter users based on group member IDs
    const members = USERS.filter(u => group.members.includes(u.id));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">{group.name}</h3>
                        <p className="text-xs text-gray-500">{members.length} members</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {members.map(user => (
                        <div 
                            key={user.id} 
                            onClick={() => { onUserClick(user); onClose(); }}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition group"
                        >
                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                            <div className="ml-3 flex-1">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{user.name}</h4>
                                <p className="text-xs text-gray-500">{user.handle}</p>
                            </div>
                            {/* Simple logic: First member in list is visually treated as admin for this demo */}
                            {group.members[0] === user.id && (
                                <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                                    <Crown className="w-3 h-3 mr-1" /> Admin
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupMembersModal;
