
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Group } from './types';
import { GROUPS } from './constants';
import { useAuth } from './AuthContext';

interface GroupContextType {
    allGroups: Group[];
    myGroups: Group[];
    publicGroups: Group[];
    createGroup: (groupData: Partial<Group>) => Promise<void>;
    joinGroup: (groupId: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
    isLoading: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [allGroups, setAllGroups] = useState<Group[]>(GROUPS); // Start with seed data
    const [isLoading, setIsLoading] = useState(false);

    // Derived states
    const myGroups = user ? allGroups.filter(g => g.members.includes(user.id)) : [];
    const publicGroups = user ? allGroups.filter(g => !g.members.includes(user.id) && g.privacy !== 'secret') : [];

    const createGroup = async (groupData: Partial<Group>) => {
        if (!user) return;
        setIsLoading(true);
        
        // Instant creation (removed setTimeout)
        const newGroup: Group = {
            id: `g_${Date.now()}`,
            name: groupData.name || 'Untitled Group',
            description: groupData.description || '',
            category: groupData.category || 'General',
            coverUrl: groupData.coverUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
            membersCount: 1,
            members: [user.id], // Creator is first member
            role: 'admin', // Creator is admin
            privacy: groupData.privacy || 'public',
            lastActive: 'Just now',
            aiEnabled: groupData.aiEnabled || false,
            voiceRoomActive: groupData.voiceRoomActive || false,
            tags: groupData.tags || ['New']
        };

        setAllGroups(prev => [newGroup, ...prev]);
        setIsLoading(false);
    };

    const joinGroup = async (groupId: string) => {
        if (!user) return;
        setAllGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    members: [...g.members, user.id],
                    membersCount: g.membersCount + 1,
                    role: 'member'
                };
            }
            return g;
        }));
    };

    const leaveGroup = async (groupId: string) => {
        if (!user) return;
        setAllGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    members: g.members.filter(id => id !== user.id),
                    membersCount: Math.max(0, g.membersCount - 1),
                    role: 'none'
                };
            }
            return g;
        }));
    };

    return (
        <GroupContext.Provider value={{
            allGroups,
            myGroups,
            publicGroups,
            createGroup,
            joinGroup,
            leaveGroup,
            isLoading
        }}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroups = () => {
    const context = useContext(GroupContext);
    if (!context) {
        throw new Error('useGroups must be used within a GroupProvider');
    }
    return context;
};
