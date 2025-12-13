
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera, Music2, Volume2, VolumeX, X, Send, Flag, Disc, ArrowLeft, RefreshCw, Zap, Timer, Settings2, Play, Pause } from 'lucide-react';
import { USERS, CURRENT_USER } from '../constants';
import { Reel, User } from '../types';
import { useLanguage } from '../LanguageContext';
import { useNotifications } from '../NotificationContext';
import { useContent } from '../ContentContext';
import CommentsModal from '../components/CommentsModal'; 
import ShareModal from '../components/ShareModal';       
import ActionMenu, { MenuContextType } from '../components/ActionMenu';

// --- Sub-components ---

// Camera Interface Component (Kept same as before but ensured types)
const ReelsCamera = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 pt-8 md:pt-4">
                <button onClick={onClose}><X className="w-8 h-8 text-white" /></button>
                <div className="bg-black/50 px-3 py-1 rounded-full text-white font-bold text-sm">♬ Sounds</div>
                <button><Settings2 className="w-7 h-7 text-white" /></button>
            </div>
            <div className="absolute right-4 top-20 flex flex-col space-y-6 items-center">
                <div className="flex flex-col items-center space-y-1"><RefreshCw className="w-6 h-6 text-white" /><span className="text-[10px] text-white">Flip</span></div>
                <div className="flex flex-col items-center space-y-1"><Zap className="w-6 h-6 text-white" /><span className="text-[10px] text-white">Speed</span></div>
            </div>
            <div className="flex-1 flex items-center justify-center"><p className="text-gray-500 text-sm">Camera Preview</p></div>
            <div className="pb-10 pt-4 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-around w-full px-8">
                     <div className="w-10 h-10 rounded-lg bg-gray-800 border-2 border-white"></div>
                     <button className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95">
                        <div className="w-16 h-16 bg-red-500 rounded-full"></div>
                     </button>
                     <button onClick={onClose} className="w-10 h-10 flex items-center justify-center"><X className="w-8 h-8 text-white rotate-45" /></button>
                </div>
            </div>
        </div>
    )
}

interface ReelItemProps {
    reel: Reel;
    isActive: boolean;
    isMuted: boolean;
    toggleMute: () => void;
    onCommentClick: (reel: Reel) => void;
    onShareClick: (reel: Reel) => void;
    onMenuClick: (reel: Reel) => void;
    onUserClick: (user: User) => void;
    t: any;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, isMuted, toggleMute, onCommentClick, onShareClick, onMenuClick, onUserClick, t }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const author = USERS.find(u => u.id === reel.userId) || CURRENT_USER;
    const { addNotification } = useNotifications();
    const { toggleLikeReel } = useContent();
    
    // States
    const [isFollowing, setIsFollowing] = useState(false); // Simulation
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [lastTap, setLastTap] = useState<number>(0);
    const [progress, setProgress] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Initialize Follow State based on dummy data logic (random for demo)
    useEffect(() => {
        // In a real app, check backend. Here, we just default to false unless it's current user
        setIsFollowing(author.id === CURRENT_USER.id); 
    }, [author.id]);

    // Handle Play/Pause & Intersection
    useEffect(() => {
        if (isActive) {
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsVideoPlaying(true)).catch(e => console.log("Autoplay blocked:", e));
            }
        } else {
            videoRef.current?.pause();
            setIsVideoPlaying(false);
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [isActive]);

    // Mute Handling
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Progress Bar Logic
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            const currentTime = videoRef.current.currentTime;
            if (duration > 0) {
                setProgress((currentTime / duration) * 100);
            }
        }
    };

    // Interaction Handlers
    const handleDoubleTap = (e: React.MouseEvent) => {
        e.stopPropagation();
        const now = Date.now();
        if (now - lastTap < 300) {
            if (!reel.isLiked) {
                toggleLikeReel(reel.id);
                if (navigator.vibrate) navigator.vibrate(50);
            }
            setShowHeartOverlay(true);
            setTimeout(() => setShowHeartOverlay(false), 1000);
        } else {
            if (videoRef.current?.paused) {
                videoRef.current?.play();
                setIsVideoPlaying(true);
            } else {
                videoRef.current?.pause();
                setIsVideoPlaying(false);
            }
        }
        setLastTap(now);
    }

    const toggleLike = () => {
        toggleLikeReel(reel.id);
        if (!reel.isLiked && navigator.vibrate) navigator.vibrate(20);
    };

    const toggleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        
        if (newStatus) {
            if (navigator.vibrate) navigator.vibrate([30, 30]);
            // Trigger Notification
            addNotification({
                id: `follow_${Date.now()}`,
                userId: author.id,
                type: 'follow',
                category: 'friends',
                text: `You started following ${author.name}`,
                timestamp: 'Now',
                isRead: false
            });
        }
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent video pause
        onUserClick(author);
    };

    return (
        <div className="relative w-full h-full flex-shrink-0 snap-start bg-black overflow-hidden select-none">
            {/* Video Layer */}
            <video
                ref={videoRef}
                src={reel.videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={handleDoubleTap}
                onTimeUpdate={handleTimeUpdate}
            />

            {/* Play/Pause Icon Overlay */}
            {!isVideoPlaying && isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/10">
                    <Play className="w-16 h-16 text-white/50 fill-white/50" />
                </div>
            )}

            {/* Big Heart Animation Layer */}
            {showHeartOverlay && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                     <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl animate-bounce-custom opacity-90" />
                 </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10" />

            {/* Progress Bar (Top) */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-40">
                 <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pb-20 md:pb-4">
                
                {/* Top Bar */}
                <div className="flex justify-between items-start pt-safe">
                    <h2 className="text-lg font-bold text-white drop-shadow-md">Reels</h2>
                    <button onClick={toggleMute} className="bg-black/30 p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition">
                        {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex items-end justify-between mb-4">
                    {/* Left Info (User, Caption, Music) */}
                    <div className="flex-1 mr-12 text-white">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="relative cursor-pointer" onClick={handleProfileClick}>
                                <img src={author?.avatar} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                    <span 
                                        className="font-bold text-sm shadow-black drop-shadow-md cursor-pointer hover:underline"
                                        onClick={handleProfileClick}
                                    >
                                        {author?.handle}
                                    </span>
                                    {author.id !== CURRENT_USER.id && (
                                        <button 
                                            onClick={toggleFollow}
                                            className={`
                                                border px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-sm transition-all
                                                ${isFollowing 
                                                    ? 'border-white/50 text-white/80 bg-transparent' 
                                                    : 'border-blue-500 bg-blue-500/80 text-white'}
                                            `}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-sm mb-3 line-clamp-2 drop-shadow-md leading-relaxed">
                            {reel.caption} <span className="font-bold cursor-pointer">...more</span>
                        </p>
                        
                        <div className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                            <div className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center space-x-1 hover:bg-white/30 transition">
                                <Music2 className="w-3 h-3" />
                                <span className="max-w-[150px] truncate">{reel.music.title} • {reel.music.artist}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Actions (Sidebar) */}
                    <div className="flex flex-col items-center space-y-5 min-w-[50px]">
                        <div className="flex flex-col items-center space-y-1">
                            <button onClick={toggleLike} className="transition-transform active:scale-75 p-2">
                                <Heart className={`w-8 h-8 ${reel.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} strokeWidth={2} />
                            </button>
                            <span className="text-xs font-bold text-white drop-shadow-md">{reel.likes > 1000 ? (reel.likes/1000).toFixed(1) + 'k' : reel.likes}</span>
                        </div>

                        <div className="flex flex-col items-center space-y-1">
                            <button onClick={() => onCommentClick(reel)} className="transition-transform active:scale-75 p-2">
                                <MessageCircle className="w-8 h-8 text-white -rotate-90" strokeWidth={2} />
                            </button>
                            <span className="text-xs font-bold text-white drop-shadow-md">{reel.commentsCount}</span>
                        </div>

                        <div className="flex flex-col items-center space-y-1">
                            <button onClick={() => onShareClick(reel)} className="transition-transform active:scale-75 p-2">
                                <Share2 className="w-8 h-8 text-white" strokeWidth={2} />
                            </button>
                            <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
                        </div>

                        {/* THREE DOTS MENU TRIGGER */}
                        <button onClick={() => onMenuClick(reel)} className="p-2 transition-opacity hover:opacity-80 active:scale-90">
                            <MoreHorizontal className="w-7 h-7 text-white" />
                        </button>

                        <div className="mt-4 relative cursor-pointer">
                            <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-800 animate-spin-slow">
                                <img src={reel.music.coverUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -right-2 -bottom-2">
                                <Music2 className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Main Component ---

interface ReelsProps {
    onUserClick: (user: User) => void;
}

const Reels: React.FC<ReelsProps> = ({ onUserClick }) => {
    const { t } = useLanguage();
    const { reels, toggleSaveReel } = useContent(); // Use Context
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false); // Default unmuted for better UX
    const [showCamera, setShowCamera] = useState(false);
    
    // Modal States
    const [activeCommentReel, setActiveCommentReel] = useState<Reel | null>(null);
    const [activeShareReel, setActiveShareReel] = useState<Reel | null>(null);
    
    // Menu State
    const [menuState, setMenuState] = useState<{
        isOpen: boolean;
        reel: Reel | null;
    }>({
        isOpen: false,
        reel: null
    });

    // Intersection Observer to detect active video
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActiveIndex(index);
                    }
                });
            },
            { threshold: 0.6 }
        );

        const children = containerRef.current?.children;
        if (children) {
            Array.from(children).forEach((child) => observer.observe(child as Element));
        }

        return () => observer.disconnect();
    }, [reels]);

    const toggleMute = () => setIsMuted(!isMuted);

    const handleMenuAction = (actionId: string, data: any) => {
        if (actionId === 'save' && data) {
            toggleSaveReel(data.id);
        }
        if (actionId === 'share') setActiveShareReel(data);
    };

    return (
        <div className="relative h-full w-full bg-black">
            {showCamera && <ReelsCamera onClose={() => setShowCamera(false)} />}
            
            {/* Camera Trigger */}
            <button 
                onClick={() => setShowCamera(true)}
                className="absolute top-4 right-4 z-40 p-2 bg-white/10 rounded-full backdrop-blur-md md:right-8 md:top-8 hover:bg-white/20 transition"
            >
                <Camera className="w-6 h-6 text-white" />
            </button>

            {/* Main Scroll Container */}
            <div 
                ref={containerRef}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
            >
                {reels.map((reel, index) => (
                    <div key={reel.id} className="h-full w-full snap-start" data-index={index}>
                         <ReelItem 
                            reel={reel} 
                            isActive={activeIndex === index} 
                            isMuted={isMuted}
                            toggleMute={toggleMute}
                            onCommentClick={setActiveCommentReel}
                            onShareClick={setActiveShareReel}
                            onMenuClick={(r) => setMenuState({ isOpen: true, reel: r })}
                            onUserClick={onUserClick}
                            t={t}
                        />
                    </div>
                ))}
            </div>

            {/* Reusable Modals */}
            {activeCommentReel && (
                <CommentsModal 
                    post={activeCommentReel} 
                    onClose={() => setActiveCommentReel(null)} 
                />
            )}

            {activeShareReel && (
                <ShareModal 
                    post={activeShareReel} 
                    onClose={() => setActiveShareReel(null)} 
                />
            )}

            {/* The Three Dots Menu */}
            <ActionMenu 
                isOpen={menuState.isOpen}
                onClose={() => setMenuState({ isOpen: false, reel: null })}
                type="reel"
                isOwner={menuState.reel?.userId === CURRENT_USER.id}
                data={menuState.reel}
                onAction={handleMenuAction}
            />
        </div>
    );
};

export default Reels;
