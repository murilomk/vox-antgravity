
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Event, EventMessage } from './types';
import { EVENTS } from './constants';
import { useAuth } from './AuthContext';

interface EventContextType {
    events: Event[];
    myEvents: Event[];
    createEvent: (eventData: Partial<Event>) => Promise<void>;
    joinEvent: (eventId: string) => void;
    leaveEvent: (eventId: string) => void;
    sendMessage: (eventId: string, text: string, type: 'text' | 'image' | 'video' | 'audio') => void;
    deleteEvent: (eventId: string) => void;
    toggleSaveEvent: (eventId: string) => void;
    isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>(EVENTS);
    const [isLoading, setIsLoading] = useState(false);

    // Filter events where the current user is an attendee or organizer
    const myEvents = user ? events.filter(e => e.attendees.includes(user.id) || e.organizerId === user.id) : [];

    const createEvent = async (eventData: Partial<Event>) => {
        if (!user) return;
        setIsLoading(true);
        
        // Instant creation
        const newEvent: Event = {
            id: `evt_${Date.now()}`,
            organizerId: user.id,
            title: eventData.title || 'Untitled Event',
            description: eventData.description || '',
            date: eventData.date || new Date().toISOString().split('T')[0],
            time: eventData.time || '12:00',
            location: eventData.location || 'Online',
            imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
            category: eventData.category || 'Networking',
            attendeesCount: 1,
            attendees: [user.id], // Organizer auto-joins
            isOnline: eventData.isOnline || false,
            link: eventData.link,
            price: eventData.price,
            maxAttendees: eventData.maxAttendees,
            messages: []
        };

        setEvents(prev => [newEvent, ...prev]);
        setIsLoading(false);
    };

    const joinEvent = (eventId: string) => {
        if (!user) return;
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                if (e.attendees.includes(user.id)) return e;
                return {
                    ...e,
                    attendees: [...e.attendees, user.id],
                    attendeesCount: e.attendeesCount + 1
                };
            }
            return e;
        }));
    };

    const leaveEvent = (eventId: string) => {
        if (!user) return;
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                return {
                    ...e,
                    attendees: e.attendees.filter(id => id !== user.id),
                    attendeesCount: Math.max(0, e.attendeesCount - 1)
                };
            }
            return e;
        }));
    };

    const deleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const toggleSaveEvent = (eventId: string) => {
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                return { ...e, isSaved: !e.isSaved };
            }
            return e;
        }));
    };

    const sendMessage = (eventId: string, text: string, type: 'text' | 'image' | 'video' | 'audio') => {
        if (!user) return;
        const newMessage: EventMessage = {
            id: `msg_${Date.now()}`,
            eventId,
            senderId: user.id,
            text,
            type,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
        };

        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                return { ...e, messages: [...e.messages, newMessage] };
            }
            return e;
        }));
    };

    return (
        <EventContext.Provider value={{
            events,
            myEvents,
            createEvent,
            joinEvent,
            leaveEvent,
            sendMessage,
            deleteEvent,
            toggleSaveEvent,
            isLoading
        }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};
