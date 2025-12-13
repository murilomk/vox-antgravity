
import React, { useState, useRef, useEffect } from 'react';
import { 
    Calendar, MapPin, Users, Plus, Search, Filter, 
    Share2, Bookmark, MessageCircle, ChevronLeft, 
    Clock, Globe, Image as ImageIcon, Check, X,
    MoreHorizontal, Send, Mic, Paperclip, Smile,
    Trash2, Edit3, Heart, Video, Play, Phone
} from 'lucide-react';
import { useEvents } from '../EventContext';
import { Event, EventCategory, EventMessage, User } from '../types';
import { CURRENT_USER, USERS } from '../constants';

type EventSubView = 'HOME' | 'DETAILS' | 'CREATE' | 'CHAT' | 'EDIT';

const CATEGORIES: EventCategory[] = ['Music', 'Games', 'Art', 'Education', 'Movies', 'Networking', 'Sports', 'Technology'];

const Events: React.FC = () => {
    const { events, createEvent, joinEvent, leaveEvent, sendMessage, toggleSaveEvent, deleteEvent } = useEvents();
    
    // Internal Navigation State
    const [subView, setSubView] = useState<EventSubView>('HOME');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    // Create Form State
    const [formData, setFormData] = useState<Partial<Event>>({});
    const [formImage, setFormImage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat State
    const [chatInput, setChatInput] = useState('');
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // --- NAVIGATION HELPERS ---
    const goToHome = () => {
        setSubView('HOME');
        setSelectedEvent(null);
    };

    const goToDetails = (event: Event) => {
        setSelectedEvent(event);
        setSubView('DETAILS');
    };

    const goToCreate = () => {
        setFormData({});
        setFormImage('');
        setSubView('CREATE');
    };

    const goToChat = (event: Event) => {
        setSelectedEvent(event);
        setSubView('CHAT');
    };

    // --- CREATE LOGIC ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormImage(url);
            setFormData(prev => ({ ...prev, imageUrl: url }));
        }
    };

    const handleSubmitCreate = async () => {
        if (!formData.title || !formData.date || !formData.location) return;
        await createEvent({
            ...formData,
            imageUrl: formImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1000&q=80',
            category: (formData.category as EventCategory) || 'Networking',
            isOnline: formData.location.toLowerCase() === 'online'
        });
        goToHome();
    };

    // --- CHAT LOGIC ---
    const handleSendChat = () => {
        if (!chatInput.trim() || !selectedEvent) return;
        sendMessage(selectedEvent.id, chatInput, 'text');
        setChatInput('');
    };

    useEffect(() => {
        if (subView === 'CHAT' && chatScrollRef.current) {
            chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedEvent?.messages, subView]);


    // --- RENDERERS ---

    const renderEventCard = (event: Event) => {
        const isJoined = event.attendees.includes(CURRENT_USER.id);
        const organizer = USERS.find(u => u.id === event.organizerId);

        return (
            <div 
                key={event.id} 
                onClick={() => goToDetails(event)}
                className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md transition group"
            >
                <div className="relative h-40 overflow-hidden">
                    <img src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-center shadow-sm">
                        <span className="block text-xs font-bold text-red-500 uppercase">{new Date(event.date).toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="block text-xl font-black text-gray-900 dark:text-white leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    {isJoined && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg dark:text-white line-clamp-1">{event.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" /> {event.location}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex -space-x-2">
                            {event.attendees.slice(0, 3).map((uid, i) => {
                                const user = USERS.find(u => u.id === uid);
                                return (
                                    <img key={i} src={user?.avatar || 'https://via.placeholder.com/30'} className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900" />
                                )
                            })}
                            {event.attendeesCount > 3 && (
                                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-gray-500">
                                    +{event.attendeesCount - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">
                            {event.category}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // --- VIEW: HOME ---
    if (subView === 'HOME') {
        const filteredEvents = events.filter(e => {
            const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = activeCategory === 'All' || e.category === activeCategory;
            return matchSearch && matchCat;
        });

        return (
            <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto pb-24">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Events</h1>
                        <button onClick={goToCreate} className="bg-primary-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary-600/30 flex items-center hover:scale-105 transition">
                            <Plus className="w-4 h-4 mr-1" /> Create
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Find concerts, workshops..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-neutral-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                        />
                    </div>
                    {/* Categories */}
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                        <button 
                            onClick={() => setActiveCategory('All')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${activeCategory === 'All' ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-800'}`}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${activeCategory === cat ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-800'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map(renderEventCard)
                    ) : (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-bold">No events found</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW: CREATE ---
    if (subView === 'CREATE') {
        return (
            <div className="h-full bg-white dark:bg-black overflow-y-auto pb-24">
                <div className="sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-neutral-800 flex items-center">
                    <button onClick={goToHome} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition">
                        <ChevronLeft className="w-6 h-6 dark:text-white" />
                    </button>
                    <h1 className="text-xl font-bold ml-2 dark:text-white">Create Event</h1>
                </div>

                <div className="p-6 space-y-6 max-w-lg mx-auto">
                    {/* Image Upload */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 bg-gray-100 dark:bg-neutral-900 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition relative overflow-hidden"
                    >
                        {formImage ? (
                            <img src={formImage} className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 font-medium">Upload Cover Image</span>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Event Name</label>
                            <input 
                                type="text" 
                                value={formData.title || ''}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                placeholder="e.g. Summer Music Festival"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Date</label>
                                <input 
                                    type="date" 
                                    value={formData.date || ''}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Time</label>
                                <input 
                                    type="time" 
                                    value={formData.time || ''}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={formData.location || ''}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                                    placeholder="Add location or 'Online'"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Category</label>
                            <select 
                                value={formData.category || 'Networking'}
                                onChange={e => setFormData({...formData, category: e.target.value as EventCategory})}
                                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Description</label>
                            <textarea 
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 mt-1 h-32 resize-none"
                                placeholder="Tell people what this event is about..."
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmitCreate}
                        disabled={!formData.title || !formData.date}
                        className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Publish Event
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: DETAILS ---
    if (subView === 'DETAILS' && selectedEvent) {
        const isJoined = selectedEvent.attendees.includes(CURRENT_USER.id);
        const isOwner = selectedEvent.organizerId === CURRENT_USER.id;
        const organizer = USERS.find(u => u.id === selectedEvent.organizerId);

        return (
            <div className="h-full bg-white dark:bg-black overflow-y-auto pb-24 relative">
                {/* Hero Image */}
                <div className="relative h-64 md:h-80 w-full group">
                    <img src={selectedEvent.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    
                    <button onClick={goToHome} className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition z-10">
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="absolute top-4 right-4 flex space-x-2 z-10">
                        <button onClick={() => toggleSaveEvent(selectedEvent.id)} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition">
                            <Bookmark className={`w-5 h-5 ${selectedEvent.isSaved ? 'fill-white' : ''}`} />
                        </button>
                        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                        {isOwner && (
                            <button onClick={() => deleteEvent(selectedEvent.id)} className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-4 right-4 text-white">
                        <span className="bg-primary-600 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block shadow-sm">
                            {selectedEvent.category}
                        </span>
                        <h1 className="text-3xl font-black leading-tight mb-2 drop-shadow-md">{selectedEvent.title}</h1>
                        <div className="flex flex-wrap gap-4 text-sm font-medium opacity-90">
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {selectedEvent.date}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {selectedEvent.time}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedEvent.location}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 animate-slide-up">
                    
                    {/* Action Bar */}
                    <div className="flex space-x-3">
                        {isJoined ? (
                            <>
                                <button onClick={() => goToChat(selectedEvent)} className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-600/30 hover:scale-[1.02] transition flex justify-center items-center">
                                    <MessageCircle className="w-5 h-5 mr-2" /> Open Chat
                                </button>
                                <button onClick={() => leaveEvent(selectedEvent.id)} className="px-4 py-3.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-200 transition">
                                    Leave
                                </button>
                            </>
                        ) : (
                            <button onClick={() => joinEvent(selectedEvent.id)} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold shadow-xl hover:scale-[1.02] transition flex justify-center items-center">
                                Join Event
                            </button>
                        )}
                    </div>

                    {/* Attendees Preview */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-900 dark:text-white">Attendees ({selectedEvent.attendeesCount})</h3>
                            <button className="text-primary-600 text-xs font-bold">See All</button>
                        </div>
                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-neutral-900 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                            <div className="flex -space-x-3">
                                {selectedEvent.attendees.slice(0, 5).map((uid, i) => {
                                    const user = USERS.find(u => u.id === uid);
                                    return <img key={i} src={user?.avatar} className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-900 object-cover" />
                                })}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                {isJoined ? 'You and ' : ''}{selectedEvent.attendeesCount - (isJoined ? 1 : 0)} others are going
                            </p>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">About Event</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {selectedEvent.description}
                        </p>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <img src={organizer?.avatar} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Organizer</p>
                                <h4 className="font-bold text-gray-900 dark:text-white">{organizer?.name}</h4>
                            </div>
                        </div>
                        <button className="bg-gray-100 dark:bg-neutral-800 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
                            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Location Map Placeholder */}
                    <div className="rounded-xl overflow-hidden h-48 bg-gray-200 dark:bg-neutral-800 relative flex items-center justify-center group cursor-pointer">
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20"></div>
                        <div className="z-10 flex flex-col items-center text-gray-500">
                            <MapPin className="w-8 h-8 mb-2 text-primary-500 animate-bounce" />
                            <span className="font-bold text-sm">Open in Maps</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: CHAT ---
    if (subView === 'CHAT' && selectedEvent) {
        return (
            <div className="h-full flex flex-col bg-[#efeae2] dark:bg-black relative">
                {/* Chat Header */}
                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm z-30 border-b border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center">
                        <button onClick={() => goToDetails(selectedEvent)} className="mr-2 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                             <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <div className="relative">
                             <img src={selectedEvent.imageUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-700" />
                             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>
                        </div>
                        <div className="ml-3 cursor-pointer" onClick={() => goToDetails(selectedEvent)}>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{selectedEvent.title}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                {selectedEvent.attendeesCount} members
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400">
                        <Video className="w-5 h-5" />
                        <Phone className="w-5 h-5" />
                        <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-repeat bg-opacity-10 dark:bg-opacity-5">
                    {/* Welcome System Message */}
                    <div className="flex justify-center my-6">
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs px-4 py-2 rounded-lg text-center shadow-sm max-w-xs">
                            👋 Welcome to the event chat! Be respectful and have fun.
                        </div>
                    </div>

                    {selectedEvent.messages.map(msg => {
                        const isMe = msg.senderId === CURRENT_USER.id;
                        const sender = USERS.find(u => u.id === msg.senderId);

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                {!isMe && (
                                    <img src={sender?.avatar} className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1" />
                                )}
                                <div className="max-w-[70%]">
                                    {!isMe && <p className="text-[10px] text-gray-500 ml-1 mb-0.5">{sender?.name}</p>}
                                    <div className={`rounded-2xl p-3 px-4 shadow-sm relative text-sm ${
                                        isMe 
                                        ? 'bg-primary-600 text-white rounded-tr-sm' 
                                        : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-tl-sm'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <div className={`text-[9px] text-right mt-1 opacity-70 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={chatScrollRef}></div>
                </div>

                {/* Input Area */}
                <div className="bg-gray-100 dark:bg-neutral-900 p-2 px-4 flex items-center space-x-2 border-t border-gray-200 dark:border-neutral-800 pb-safe md:pb-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full"><Plus className="w-5 h-5" /></button>
                    
                    <div className="flex-1 bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 border border-gray-200 dark:border-neutral-700 shadow-sm focus-within:border-primary-500 transition">
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                            placeholder="Message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        />
                        <button className="ml-2 text-gray-400 hover:text-gray-600"><Paperclip className="w-4 h-4" /></button>
                        <button className="ml-2 text-gray-400 hover:text-gray-600"><Smile className="w-4 h-4" /></button>
                    </div>
                    
                    {chatInput.trim() ? (
                        <button onClick={handleSendChat} className="p-3 bg-primary-600 text-white rounded-full shadow-lg hover:scale-105 transition transform">
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    ) : (
                        <button className="p-3 bg-primary-600 text-white rounded-full shadow-lg hover:scale-105 transition transform">
                            <Mic className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null; // Should not reach here
};

export default Events;
