
import React, { useState, useEffect, useRef } from 'react';
import { CHATS, USERS, CURRENT_USER } from '../constants';
import { Chat as ChatType, Message } from '../types';
import { Search, Phone, Video, MoreVertical, Paperclip, Mic, Smile, Send, CheckCheck, ArrowLeft, Image as ImageIcon, Music, Clock } from 'lucide-react';

const Chat: React.FC = () => {
    // State management
    const [chats, setChats] = useState<ChatType[]>(CHATS);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Refs for auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Derived state
    const selectedChat = chats.find(c => c.id === selectedChatId) || null;
    const activeChatUser = selectedChat ? USERS.find(u => u.id === selectedChat.userId) : null;
    
    // Filter chats based on search
    const filteredChats = chats.filter(chat => {
        const user = USERS.find(u => u.id === chat.userId);
        const nameMatch = user?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const msgMatch = chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || msgMatch;
    });

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages, isTyping]);

    // Function to handle sending a message
    const handleSendMessage = (text: string, type: 'text' | 'image' | 'audio' = 'text') => {
        if (!selectedChatId) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: CURRENT_USER.id,
            text: type === 'text' ? text : (type === 'image' ? 'Sent a photo' : 'Sent an audio'),
            timestamp: timestamp,
            isRead: false,
            type: type
        };

        // Update chats state: Add message, update last message, move chat to top
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === selectedChatId) {
                    return {
                        ...chat,
                        lastMessage: type === 'text' ? text : (type === 'image' ? '📷 Photo' : '🎤 Audio message'),
                        timestamp: timestamp,
                        messages: [...chat.messages, newMessage]
                    };
                }
                return chat;
            });
            // Sort by latest interaction
            return updatedChats.sort((a, b) => {
                if (a.id === selectedChatId) return -1;
                if (b.id === selectedChatId) return 1;
                return 0;
            });
        });

        setMessageInput('');

        // Simulate auto-reply
        if (type === 'text') {
            simulateReceiveMessage(selectedChatId);
        }
    };

    const simulateReceiveMessage = (chatId: string) => {
        setIsTyping(true);
        setTimeout(() => {
            if (selectedChatId !== chatId) {
                setIsTyping(false);
                return;
            }

            const responses = [
                "That's interesting! Tell me more.",
                "Haha, totally agree with you.",
                "I'm a bit busy right now, can we talk later?",
                "Did you see the new update?",
                "Sounds like a plan! 🚀",
                "Can you send me the details?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const replyMessage: Message = {
                id: `msg_r_${Date.now()}`,
                senderId: USERS.find(u => u.id === chats.find(c => c.id === chatId)?.userId)?.id || 'unknown',
                text: randomResponse,
                timestamp: timestamp,
                isRead: true,
                type: 'text'
            };

            setChats(prevChats => prevChats.map(chat => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        lastMessage: randomResponse,
                        timestamp: timestamp,
                        messages: [...chat.messages, replyMessage]
                    };
                }
                return chat;
            }));
            
            setIsTyping(false);
        }, 2500);
    };

    const handleAttachment = () => {
        // Mock sending an image
        handleSendMessage('https://picsum.photos/400/300', 'image');
    };

    const handleMic = () => {
        // Mock sending an audio
        handleSendMessage('Audio Message (0:15)', 'audio');
    }

    // --- Chat List Component ---
    const ChatList = () => (
        <div className={`flex flex-col h-full bg-white dark:bg-black md:border-r border-gray-200 dark:border-neutral-800 ${selectedChatId ? 'hidden md:flex' : 'w-full'} md:w-80 lg:w-96 transition-colors`}>
            <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
                    <div className="bg-primary-50 dark:bg-neutral-800 p-2 rounded-full cursor-pointer hover:bg-primary-100 dark:hover:bg-neutral-700 transition">
                         <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search messages..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500 transition-shadow"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {filteredChats.map(chat => {
                    const user = USERS.find(u => u.id === chat.userId);
                    const isActive = selectedChatId === chat.id;
                    return (
                        <div 
                            key={chat.id} 
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`flex items-center p-4 cursor-pointer transition border-b border-gray-50 dark:border-neutral-900 ${
                                isActive 
                                ? 'bg-primary-50 dark:bg-neutral-800' 
                                : 'hover:bg-gray-50 dark:hover:bg-neutral-900'
                            }`}
                        >
                            <div className="relative">
                                <img src={user?.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-neutral-800" />
                                {chat.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>}
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-semibold truncate text-sm ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{user?.name}</h3>
                                    <span className={`text-[10px] ${chat.unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{chat.timestamp}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className={`text-sm truncate w-40 ${isActive ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'} ${chat.unreadCount > 0 ? 'font-semibold' : ''}`}>{chat.lastMessage}</p>
                                    {chat.unreadCount > 0 && (
                                        <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // --- Active Chat Window ---
    const ChatWindow = () => {
        if (!selectedChat || !activeChatUser) {
            return (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-black flex-col text-gray-400 dark:text-gray-500 transition-colors">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-10 h-10 text-gray-400 dark:text-gray-600 ml-1" />
                    </div>
                    <p className="text-lg font-medium">Select a chat to start messaging</p>
                    <p className="text-sm opacity-70">Messages are end-to-end encrypted.</p>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 z-40 md:static md:z-auto flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-black relative transition-colors">
                {/* Header */}
                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-3 flex items-center justify-between shadow-sm z-20 border-b border-gray-200 dark:border-neutral-800 pt-safe md:pt-3">
                    <div className="flex items-center">
                        <button onClick={() => setSelectedChatId(null)} className="md:hidden mr-2 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                             <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                        </button>
                        <div className="relative">
                             <img src={activeChatUser.avatar} className="w-10 h-10 rounded-full border border-gray-200 dark:border-neutral-700" />
                             {selectedChat.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>}
                        </div>
                        <div className="ml-3 cursor-pointer">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{activeChatUser.name}</h3>
                            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                                {isTyping ? 'typing...' : (selectedChat.isOnline ? 'Online' : 'Last seen recently')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 text-primary-600 dark:text-primary-400">
                        <Phone className="w-5 h-5 cursor-pointer hover:opacity-80 transition" />
                        <Video className="w-6 h-6 cursor-pointer hover:opacity-80 transition" />
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:opacity-80 transition" />
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-repeat bg-opacity-10 dark:bg-opacity-5">
                    {/* Date Divider */}
                    <div className="flex justify-center py-4">
                        <span className="bg-gray-200/80 dark:bg-neutral-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 text-[10px] font-bold uppercase py-1 px-3 rounded-full shadow-sm">Today</span>
                    </div>

                    {selectedChat.messages.length === 0 && (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg mx-auto max-w-xs border border-yellow-100 dark:border-yellow-900/20 shadow-sm">
                            <span className="text-xl block mb-2">🔒</span>
                             Messages are end-to-end encrypted. No one outside of this chat, not even VoxNet, can read or listen to them.
                        </div>
                    )}

                    {selectedChat.messages.map(msg => {
                        const isMe = msg.senderId === CURRENT_USER.id;
                        
                        // Render Content based on Type
                        const renderContent = () => {
                            if (msg.type === 'image') {
                                return (
                                    <div className="max-w-[200px] rounded-lg overflow-hidden mb-1">
                                        <img src={msg.text} alt="Shared" className="w-full h-auto" />
                                    </div>
                                );
                            }
                            if (msg.type === 'audio') {
                                return (
                                    <div className="flex items-center space-x-3 min-w-[150px] py-2">
                                        <div className={`p-2 rounded-full ${isMe ? 'bg-white/20' : 'bg-gray-200 dark:bg-neutral-700'}`}>
                                            <Music className="w-4 h-4" />
                                        </div>
                                        <div className="h-1 bg-current opacity-30 w-full rounded-full flex-1"></div>
                                        <span className="text-xs opacity-70">0:15</span>
                                    </div>
                                );
                            }
                            return <p className="pb-2 leading-relaxed">{msg.text}</p>;
                        };

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[75%] rounded-2xl p-2 px-3 shadow-sm relative text-sm ${
                                    isMe 
                                    ? 'bg-primary-600 text-white rounded-tr-sm' 
                                    : 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-tl-sm'
                                }`}>
                                    {renderContent()}
                                    <div className={`absolute right-2 bottom-1 flex items-center space-x-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                        <span className="text-[9px]">{msg.timestamp}</span>
                                        {isMe && <CheckCheck className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-4"></div>
                </div>

                {/* Input Area */}
                <div className="bg-gray-100 dark:bg-neutral-900 p-2 px-4 flex items-center space-x-3 border-t border-gray-200 dark:border-neutral-800 pb-safe md:pb-2">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800"><Smile className="w-6 h-6" /></button>
                    
                    <div className="flex-1 bg-white dark:bg-neutral-800 rounded-full flex items-center px-4 py-2 border border-gray-200 dark:border-neutral-700 shadow-inner">
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(messageInput)}
                        />
                         <button onClick={handleAttachment} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"><Paperclip className="w-5 h-5" /></button>
                    </div>
                    
                    <button 
                        className={`p-3 rounded-full shadow-lg transform transition active:scale-95 ${messageInput.trim() ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'}`}
                        onClick={() => messageInput.trim() ? handleSendMessage(messageInput) : handleMic()}
                    >
                        {messageInput.trim() ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            <ChatList />
            <ChatWindow />
        </div>
    );
};

export default Chat;
