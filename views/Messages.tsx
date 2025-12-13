
import React, { useState, useRef, useEffect } from 'react';
import { 
    Search, Plus, Settings, MoreVertical, Edit, 
    MessageSquare, Pin, Archive, BellOff, Lock, 
    Camera, Mic, Video, Image as ImageIcon, Smile,
    Check, CheckCheck, Trash2, Users, ArrowLeft,
    Phone, Paperclip, Send, Music, X, MapPin, FileText,
    BarChart2, Play, Pause, PhoneOff, MicOff, VideoOff,
    Maximize2, Minimize2, LogIn, Edit2
} from 'lucide-react';
import { USERS, CURRENT_USER } from '../constants';
import { Chat, Message, User, Group } from '../types';
import { useChat } from '../ChatContext';
import { useGroups } from '../GroupContext';
import ActionMenu from '../components/ActionMenu';
import GroupMembersModal from '../components/GroupMembersModal';

type FilterType = 'All' | 'Unread' | 'Secret' | 'Archived' | 'Groups';
type ModalType = 'none' | 'attachments' | 'emojis';
type CallStatus = 'idle' | 'calling' | 'connected';
type CallType = 'audio' | 'video';

interface MessagesProps {
    onUserClick?: (user: User) => void;
}

// --- Sub-Components ---

const CallOverlay = ({ 
    user, 
    type, 
    status, 
    onEnd 
}: { 
    user: { name: string, avatar: string }, 
    type: CallType, 
    status: CallStatus, 
    onEnd: () => void 
}) => {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        let interval: any;
        if (status === 'connected') {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-8 animate-fade-in">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl" style={{ backgroundImage: `url(${user.avatar})` }}></div>
            
            <div className="relative z-10 flex flex-col items-center mt-12 space-y-4">
                <div className="relative">
                    <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl animate-pulse" />
                    {type === 'video' && !isVideoOff && (
                        <div className="absolute -bottom-2 -right-2 bg-black/50 p-2 rounded-full border border-white/20">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                    <p className="text-white/70 font-medium">
                        {status === 'calling' ? 'Calling...' : formatTime(duration)}
                    </p>
                </div>
            </div>

            {/* Video Call Preview (Self) */}
            {type === 'video' && status === 'connected' && (
                <div className="absolute top-8 right-8 w-32 h-48 bg-black/50 rounded-xl border border-white/20 overflow-hidden shadow-lg z-20">
                    <img src={CURRENT_USER.avatar} className="w-full h-full object-cover opacity-80" />
                </div>
            )}

            <div className="relative z-10 w-full max-w-sm">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 flex justify-around items-center">
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    
                    <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-4 rounded-full transition ${isVideoOff ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>

                    <button onClick={onEnd} className="p-5 bg-red-500 rounded-full text-white shadow-lg shadow-red-500/30 hover:scale-110 transition-transform">
                        <PhoneOff className="w-8 h-8 fill-white" />
                    </button>
                </div>
            </div>
        </div>
    )
};

const AttachmentMenu = ({ onSelect, onClose }: { onSelect: (type: string) => void, onClose: () => void }) => {
    const options = [
        { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'bg-purple-500' },
        { id: 'camera', label: 'Camera', icon: Camera, color: 'bg-red-500' },
        { id: 'location', label: 'Location', icon: MapPin, color: 'bg-green-500' },
        { id: 'document', label: 'Document', icon: FileText, color: 'bg-blue-500' },
        { id: 'poll', label: 'Poll', icon: BarChart2, color: 'bg-yellow-500' },
        { id: 'music', label: 'Audio', icon: Music, color: 'bg-orange-500' },
    ];

    return (
        <div className="absolute bottom-20 left-4 md:left-auto md:w-80 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 z-50 animate-scale-up grid grid-cols-3 gap-4">
            {options.map(opt => (
                <button 
                    key={opt.id}
                    onClick={() => { onSelect(opt.id); onClose(); }}
                    className="flex flex-col items-center space-y-2 group"
                >
                    <div className={`${opt.color} p-3 rounded-full text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <opt.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{opt.label}</span>
                </button>
            ))}
        </div>
    );
};

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const categories = {
        'Recent': ['😀', '😂', '😍', '👍', '🔥', '❤️'],
        'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
        'People': ['👶', '👦', '👧', '👨', '👩', '👱', '👮', '👳', '👲', '🧔'],
        'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
        'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈'],
        'Activity': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸'],
    };

    return (
        <div className="h-64 bg-gray-100 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 animate-slide-up flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {Object.entries(categories).map(([cat, emojis]) => (
                    <div key={cat} className="mb-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 px-2">{cat}</h4>
                        <div className="grid grid-cols-8 gap-1">
                            {emojis.map(e => (
                                <button 
                                    key={e} 
                                    onClick={() => onSelect(e)}
                                    className="text-2xl p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition"
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Messages: React.FC<MessagesProps> = ({ onUserClick }) => {
    // --- Context ---
    const { chats, activeChatId, setActiveChatId, sendMessage, deleteMessage, editMessage } = useChat();
    const { myGroups, joinGroup, allGroups } = useGroups();

    // --- List State ---
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // --- Chat Window State ---
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>('none');
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    
    // --- Audio Recording State ---
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    
    // --- Call State ---
    const [activeCall, setActiveCall] = useState<{status: CallStatus, type: CallType} | null>(null);
    
    // --- Menu State ---
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [actionMenuMessage, setActionMenuMessage] = useState<Message | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recordingInterval = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Derived State ---
    const activeChat = chats.find(c => c.id === activeChatId);
    
    // Determine Chat Meta Data (Name, Avatar, Type)
    let chatName = '';
    let chatAvatar = '';
    let isGroup = false;
    let groupData: Group | undefined = undefined;
    let isMember = true; // Default true for DMs
    let dmUser: User | undefined = undefined;

    if (activeChat) {
        if (activeChat.isGroup) {
            isGroup = true;
            // Get updated group data from Context source of truth
            groupData = allGroups.find(g => g.id === activeChat.groupId);
            chatName = activeChat.name || groupData?.name || 'Group Chat';
            chatAvatar = activeChat.avatar || groupData?.coverUrl || '';
            // Check if user is member of this group
            if (activeChat.groupId) {
                isMember = myGroups.some(g => g.id === activeChat.groupId);
            }
        } else {
            dmUser = USERS.find(u => u.id === activeChat.userId);
            chatName = dmUser?.name || 'Unknown';
            chatAvatar = dmUser?.avatar || '';
        }
    }

    // --- Effects ---
    
    // Auto-scroll to bottom
    useEffect(() => {
        if (activeChatId && !editingMessageId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChat?.messages, activeChatId, isTyping, activeModal, editingMessageId]);

    // Cleanup recording timer
    useEffect(() => {
        return () => {
            if (recordingInterval.current) clearInterval(recordingInterval.current);
        };
    }, []);

    // --- Logic ---

    const filteredChats = chats.filter(chat => {
        let name = '';
        if(chat.isGroup) {
            name = chat.name || '';
        } else {
            const u = USERS.find(user => user.id === chat.userId);
            name = u?.name || '';
        }

        const matchesSearch = 
            name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        switch (activeFilter) {
            case 'Unread': return chat.unreadCount > 0;
            case 'Secret': return chat.isSecret;
            case 'Archived': return chat.isArchived;
            case 'Groups': return chat.isGroup;
            default: return !chat.isArchived;
        }
    });

    const handleSendMessage = (text: string, type: 'text' | 'image' | 'audio' = 'text') => {
        if (!activeChatId || !activeChat) return;
        
        if (editingMessageId) {
            editMessage(activeChatId, editingMessageId, text);
            setEditingMessageId(null);
        } else {
            // Pass group ID logic or user ID logic handled in Context
            sendMessage(activeChat.isGroup ? activeChat.groupId || '' : activeChat.userId, text, type);
            if (!activeChat.isGroup && type === 'text') simulateReply(activeChatId);
        }
        
        setMessageInput('');
        setActiveModal('none'); // Close emojis if open
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setMessageInput('');
    };

    const simulateReply = (chatId: string) => {
        setIsTyping(true);
        setTimeout(() => {
            if (activeChatId !== chatId) {
                setIsTyping(false);
                return;
            }
            setIsTyping(false);
        }, 2000);
    };

    const handleMessageAction = (actionId: string, message: Message) => {
        if (!activeChatId) return;

        if (actionId === 'delete') {
            deleteMessage(activeChatId, message.id);
        } else if (actionId === 'edit') {
            setEditingMessageId(message.id);
            setMessageInput(message.text);
        }
        setActionMenuMessage(null);
    };

    // --- Attachment Logic ---
    const handleAttachment = (type: string) => {
        if (type === 'gallery') {
            fileInputRef.current?.click();
        }
        else if (type === 'location') handleSendMessage('📍 Shared Location', 'text');
        else if (type === 'music') handleSendMessage('Sent a song', 'audio');
        else handleSendMessage(`Sent a ${type}`, 'text');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            handleSendMessage(url, 'image');
        }
        // Reset the input so the same file can be selected again
        e.target.value = '';
    };

    // --- Audio Logic ---
    const startRecording = () => {
        setIsRecording(true);
        setRecordingDuration(0);
        if (navigator.vibrate) navigator.vibrate(50);
        recordingInterval.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = (send: boolean) => {
        if (recordingInterval.current) clearInterval(recordingInterval.current);
        setIsRecording(false);
        if (send) {
            handleSendMessage(`Audio (${formatTime(recordingDuration)})`, 'audio');
        }
        setRecordingDuration(0);
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- Call Logic ---
    const startCall = (type: CallType) => {
        setActiveCall({ status: 'calling', type });
        setTimeout(() => {
            setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
        }, 2000);
    };

    const endCall = () => {
        setActiveCall(null);
    };

    const handleJoinGroup = async () => {
        if(activeChat?.groupId) {
            await joinGroup(activeChat.groupId);
        }
    }

    const handleHeaderClick = () => {
        if (isGroup && groupData) {
            setShowGroupInfo(true);
        } else if (dmUser && onUserClick) {
            onUserClick(dmUser);
        }
    };

    // --- Render ---

    const ChatItem: React.FC<{ chat: Chat }> = ({ chat }) => {
        const isActive = activeChatId === chat.id;
        
        let name = '';
        let avatar = '';
        
        if (chat.isGroup) {
            name = chat.name || 'Group';
            avatar = chat.avatar || 'https://via.placeholder.com/150';
        } else {
            const u = USERS.find(user => user.id === chat.userId);
            name = u?.name || 'User';
            avatar = u?.avatar || '';
        }

        return (
            <div 
                className={`flex items-center p-3 rounded-2xl mb-1 transition-all cursor-pointer border border-transparent ${
                    isActive 
                        ? 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-900'
                }`}
                onClick={() => setActiveChatId(chat.id)}
            >
                <div className="relative">
                    <img src={avatar} className="w-12 h-12 rounded-full object-cover" />
                    {chat.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{name}</h3>
                        <span className={`text-[10px] ${chat.unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>{chat.timestamp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-xs truncate w-4/5 ${chat.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                            <div className="min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                {chat.unreadCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="h-full flex bg-white dark:bg-black overflow-hidden relative">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
            
            {/* --- CALL OVERLAY --- */}
            {activeCall && activeChat && (
                <CallOverlay 
                    user={{ name: chatName, avatar: chatAvatar }} 
                    type={activeCall.type} 
                    status={activeCall.status} 
                    onEnd={endCall} 
                />
            )}

            {/* --- GROUP DETAILS MODAL --- */}
            {showGroupInfo && groupData && onUserClick && (
                <GroupMembersModal 
                    group={groupData} 
                    onClose={() => setShowGroupInfo(false)} 
                    onUserClick={onUserClick}
                />
            )}

            {/* --- LIST SIDEBAR --- */}
            <aside className={`flex-col w-full md:w-80 lg:w-96 bg-white dark:bg-black border-r border-gray-200 dark:border-neutral-800 transition-transform duration-300 absolute md:relative z-10 h-full ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <header className="px-4 py-3 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-20 border-b border-gray-100 dark:border-neutral-800 h-[60px]">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Messages</h1>
                    <button className="p-2 bg-primary-500 rounded-full text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition"><Plus className="w-5 h-5" /></button>
                </header>

                <div className="flex-1 overflow-y-auto pb-20">
                    <div className="px-4 py-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full bg-gray-100 dark:bg-neutral-900 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="px-3">
                         {filteredChats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
                    </div>
                </div>
            </aside>

            {/* --- CHAT WINDOW --- */}
            <main className={`flex-1 flex flex-col h-full bg-white dark:bg-black transition-transform duration-300 absolute md:relative w-full z-20 ${activeChatId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm z-30 border-b border-gray-200 dark:border-neutral-800 h-[60px]">
                            <div className="flex items-center">
                                <button onClick={() => setActiveChatId(null)} className="md:hidden mr-2 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                                     <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                                </button>
                                <div className="relative cursor-pointer" onClick={handleHeaderClick}>
                                     <img src={chatAvatar} className="w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-700" />
                                     {activeChat.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>}
                                </div>
                                <div className="ml-3 cursor-pointer" onClick={handleHeaderClick}>
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:underline">{chatName}</h3>
                                    <p className="text-[10px] font-medium text-green-600 dark:text-green-400">
                                        {isGroup 
                                            ? `${groupData?.membersCount || 2} members • ${Math.floor(Math.random() * 5) + 1} online` 
                                            : (isTyping ? 'typing...' : (activeChat.isOnline ? 'Online' : 'Last seen recently'))
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                                <button onClick={() => startCall('audio')} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition"><Phone className="w-5 h-5" /></button>
                                <button onClick={() => startCall('video')} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition"><Video className="w-6 h-6" /></button>
                                <button onClick={() => setShowChatMenu(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black" onClick={() => setActiveModal('none')}>
                            {activeChat.messages.map((msg, index) => {
                                const isMe = msg.senderId === CURRENT_USER.id;
                                const isSystem = msg.type === 'system';
                                const sender = USERS.find(u => u.id === msg.senderId);
                                const showAvatar = isGroup && !isMe && !isSystem && (index === 0 || activeChat.messages[index - 1].senderId !== msg.senderId);

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-4 animate-fade-in">
                                            <span className="bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full font-medium">
                                                {msg.text}
                                            </span>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                                        
                                        {/* Avatar for Groups */}
                                        {isGroup && !isMe && (
                                            <div 
                                                className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end cursor-pointer"
                                                onClick={() => onUserClick && sender && onUserClick(sender)}
                                            >
                                                {showAvatar && (
                                                    <img src={sender?.avatar || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded-full object-cover" title={sender?.name} />
                                                )}
                                            </div>
                                        )}

                                        <div className="max-w-[75%]">
                                            {/* Name for Groups */}
                                            {showAvatar && (
                                                <span 
                                                    className="text-[10px] text-gray-500 ml-1 mb-1 block cursor-pointer hover:underline"
                                                    onClick={() => onUserClick && sender && onUserClick(sender)}
                                                >
                                                    {sender?.name}
                                                </span>
                                            )}

                                            <div 
                                                onContextMenu={(e) => { e.preventDefault(); setActionMenuMessage(msg); }}
                                                className={`rounded-2xl p-3 shadow-sm relative text-sm group cursor-pointer ${
                                                isMe 
                                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                                : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-tl-sm'
                                            }`}>
                                                {msg.type === 'image' ? (
                                                    <div className="max-w-[200px] rounded-lg overflow-hidden mb-1"><img src={msg.text} alt="Shared" className="w-full h-auto" /></div>
                                                ) : msg.type === 'audio' ? (
                                                    <div className="flex items-center space-x-3 min-w-[150px] py-1">
                                                        <div className={`p-2 rounded-full ${isMe ? 'bg-white/20' : 'bg-gray-200 dark:bg-neutral-700'}`}><Play className="w-4 h-4 fill-current" /></div>
                                                        <div className="flex-1 h-1 bg-current opacity-30 rounded-full"></div>
                                                        <span className="text-xs opacity-70">0:15</span>
                                                    </div>
                                                ) : (
                                                    <p className="pb-2 leading-relaxed">{msg.text}</p>
                                                )}
                                                
                                                <div className={`absolute right-2 bottom-1 flex items-center space-x-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                    <span className="text-[9px]">{msg.timestamp}</span>
                                                    {isMe && <CheckCheck className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} className="h-4"></div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 pb-safe z-40 relative">
                            {/* Attachment Menu Popup */}
                            {activeModal === 'attachments' && (
                                <AttachmentMenu onSelect={handleAttachment} onClose={() => setActiveModal('none')} />
                            )}

                            {/* Editing State Indicator */}
                            {editingMessageId && (
                                <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 flex justify-between items-center text-xs border-b border-primary-100 dark:border-white/5">
                                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-bold">
                                        <Edit2 className="w-3 h-3 mr-2" />
                                        Editing Message...
                                    </div>
                                    <button onClick={cancelEdit} className="text-gray-500 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {isMember ? (
                                <div className="p-2 px-4 flex items-end space-x-2 md:pb-3">
                                    {isRecording ? (
                                        // Recording UI
                                        <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-full px-4 py-3 animate-pulse">
                                            <div className="flex items-center space-x-2 text-red-500">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                                <span className="font-mono font-bold">{formatTime(recordingDuration)}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">Recording... Click Check to send</span>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => stopRecording(false)} className="p-2 bg-gray-200 dark:bg-neutral-800 rounded-full text-gray-600 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                                <button onClick={() => stopRecording(true)} className="p-2 bg-primary-600 rounded-full text-white"><Check className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Standard Input UI
                                        <>
                                            <button 
                                                onClick={() => setActiveModal(activeModal === 'emojis' ? 'none' : 'emojis')}
                                                className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition ${activeModal === 'emojis' ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}
                                            >
                                                <Smile className="w-6 h-6" />
                                            </button>
                                            
                                            <div className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl flex items-end px-4 py-2 border border-transparent focus-within:border-primary-500 transition-all">
                                                <textarea 
                                                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none max-h-24 min-h-[24px] py-1"
                                                    placeholder="Message..."
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault(); 
                                                            handleSendMessage(messageInput);
                                                        }
                                                    }}
                                                    rows={1}
                                                />
                                                <button 
                                                    onClick={() => setActiveModal(activeModal === 'attachments' ? 'none' : 'attachments')}
                                                    className={`ml-2 p-1 rounded-full transition ${activeModal === 'attachments' ? 'text-primary-500 rotate-45' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    <Paperclip className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <button 
                                                className={`p-3 rounded-full shadow-lg transform transition active:scale-95 ${
                                                    messageInput.trim() 
                                                    ? 'bg-primary-600 text-white' 
                                                    : 'bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'
                                                }`}
                                                onClick={() => messageInput.trim() ? handleSendMessage(messageInput) : startRecording()}
                                            >
                                                {editingMessageId ? <Check className="w-5 h-5 ml-0.5" /> : (messageInput.trim() ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-5 h-5" />)}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // Not a Member State
                                <div className="p-4 flex items-center justify-center space-x-3 bg-gray-50 dark:bg-neutral-900">
                                    <span className="text-sm text-gray-500">You are viewing a preview of this group.</span>
                                    <button onClick={handleJoinGroup} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-xs flex items-center">
                                        <LogIn className="w-3 h-3 mr-2" />
                                        Join to Chat
                                    </button>
                                </div>
                            )}

                            {/* Emoji Drawer */}
                            {activeModal === 'emojis' && (
                                <EmojiPicker onSelect={(emoji) => setMessageInput(prev => prev + emoji)} />
                            )}
                        </div>
                    </>
                ) : (
                    // --- EMPTY STATE ---
                    <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-black flex-col text-gray-400 dark:text-gray-500 transition-colors">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Send className="w-10 h-10 text-gray-400 dark:text-gray-600 ml-1" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">Select a chat to start messaging</p>
                        <p className="text-sm opacity-70 mt-1">Send photos, voice messages and more securely.</p>
                    </div>
                )}
            </main>

            {/* Chat Options Menu */}
            <ActionMenu 
                isOpen={showChatMenu} 
                onClose={() => setShowChatMenu(false)} 
                type="chat" 
                isOwner={true} 
                data={activeChat}
                onAction={(id) => console.log('Action:', id)}
            />

            {/* Message Action Menu */}
            <ActionMenu
                isOpen={!!actionMenuMessage}
                onClose={() => setActionMenuMessage(null)}
                type="message"
                isOwner={actionMenuMessage?.senderId === CURRENT_USER.id}
                data={actionMenuMessage}
                onAction={(id) => actionMenuMessage && handleMessageAction(id, actionMenuMessage)}
            />
        </div>
    );
};

export default Messages;
