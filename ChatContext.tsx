
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Chat, Message, Group } from './types';
import { CHATS, USERS, CURRENT_USER } from './constants';
import { useAuth } from './AuthContext';

interface ChatContextType {
    chats: Chat[];
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
    sendMessage: (recipientId: string, text: string, type?: 'text' | 'image' | 'audio' | 'story_reply', storyUrl?: string) => void;
    deleteMessage: (chatId: string, messageId: string) => void;
    editMessage: (chatId: string, messageId: string, newText: string) => void;
    startChat: (userId: string) => void;
    openGroupChat: (group: Group) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>(CHATS);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    // --- Actions ---

    const sendMessage = (recipientId: string, text: string, type: 'text' | 'image' | 'audio' | 'story_reply' = 'text', storyUrl?: string) => {
        if (!user) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Find chat by UserID (DM) or by ID (Group)
        let chatId = activeChatId;
        
        if (!chatId) {
             chatId = chats.find(c => c.userId === recipientId && !c.isGroup)?.id;
        }

        let lastMsgText = text;
        if (type === 'image') lastMsgText = '📷 Photo';
        if (type === 'audio') lastMsgText = '🎤 Audio message';
        if (type === 'story_reply') lastMsgText = '💬 Replied to story';

        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: user.id,
            text: text,
            timestamp: timestamp,
            isRead: false,
            type: type === 'story_reply' ? 'text' : type,
        };

        if (type === 'story_reply' && storyUrl) {
            newMessage.text = `Replying to your story: ${text}`;
        }

        if (chatId) {
            // Update existing chat
            setChats(prev => prev.map(chat => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        lastMessage: lastMsgText,
                        timestamp: timestamp,
                        messages: [...chat.messages, newMessage],
                        unreadCount: 0
                    };
                }
                return chat;
            }).sort((a, b) => (a.id === chatId ? -1 : b.id === chatId ? 1 : 0)));
            
            setActiveChatId(chatId);
        } else {
            // Create new DM
            const newChatId = `chat_${Date.now()}`;
            const newChat: Chat = {
                id: newChatId,
                userId: recipientId,
                isGroup: false,
                lastMessage: lastMsgText,
                unreadCount: 0,
                timestamp: timestamp,
                isOnline: false,
                messages: [newMessage]
            };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChatId);
        }
    };

    const deleteMessage = (chatId: string, messageId: string) => {
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId) {
                const updatedMessages = chat.messages.filter(m => m.id !== messageId);
                const lastMsg = updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1] : null;
                return {
                    ...chat,
                    messages: updatedMessages,
                    lastMessage: lastMsg ? (lastMsg.type === 'text' ? lastMsg.text : 'Media') : ''
                };
            }
            return chat;
        }));
    };

    const editMessage = (chatId: string, messageId: string, newText: string) => {
        setChats(prev => prev.map(chat => {
            if (chat.id === chatId) {
                const updatedMessages = chat.messages.map(m => {
                    if (m.id === messageId) {
                        return { ...m, text: newText };
                    }
                    return m;
                });
                return {
                    ...chat,
                    messages: updatedMessages,
                    // Update last message preview if it was the last one
                    lastMessage: chat.messages[chat.messages.length - 1].id === messageId ? newText : chat.lastMessage
                };
            }
            return chat;
        }));
    };

    const startChat = (userId: string) => {
        const existingChat = chats.find(c => c.userId === userId && !c.isGroup);
        if (existingChat) {
            setActiveChatId(existingChat.id);
        } else {
            const newChatId = `chat_new_${userId}`;
            const newChat: Chat = {
                id: newChatId,
                userId: userId,
                isGroup: false,
                lastMessage: '',
                unreadCount: 0,
                timestamp: 'New',
                isOnline: false,
                messages: []
            };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChatId);
        }
    };

    const openGroupChat = (group: Group) => {
        const existingChat = chats.find(c => c.groupId === group.id);
        
        if (existingChat) {
            setActiveChatId(existingChat.id);
        } else {
            // Create a chat object from the Group object
            const newChat: Chat = {
                id: `group_chat_${group.id}`,
                groupId: group.id,
                userId: '', // No specific user for group
                isGroup: true,
                name: group.name,
                avatar: group.coverUrl,
                lastMessage: 'Welcome to the group!',
                unreadCount: 0,
                timestamp: 'Just now',
                isOnline: true,
                messages: [
                    {
                        id: `sys_${Date.now()}`,
                        senderId: 'system',
                        text: `Welcome to ${group.name}! ${group.description}`,
                        timestamp: 'Now',
                        isRead: true,
                        type: 'system'
                    }
                ]
            };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id);
        }
    };

    return (
        <ChatContext.Provider value={{ chats, activeChatId, setActiveChatId, sendMessage, deleteMessage, editMessage, startChat, openGroupChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
