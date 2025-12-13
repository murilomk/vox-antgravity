
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// Force rebuild
import { Notification as AppNotification } from './types';

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notification: AppNotification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    latestNotification: AppNotification | null; // For Toast
    setLatestNotification: (n: AppNotification | null) => void;
    requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // --- Sound Logic ---
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    // --- Permission Logic (Android/Web) ---
    const requestPermission = async () => {
        if (!("Notification" in window)) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            }
        } catch (e) {
            console.error('Permission request failed', e);
        }
    };

    useEffect(() => {
        requestPermission();
    }, []);

    // --- Actions ---

    const addNotification = (notification: AppNotification) => {
        setNotifications(prev => [notification, ...prev]);
        setLatestNotification(notification);

        playNotificationSound();

        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }

        if (document.hidden && Notification.permission === "granted") {
            new Notification("VoxNet", {
                body: notification.text,
                icon: "/icon-192.png"
            });
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
            latestNotification,
            setLatestNotification,
            requestPermission
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
