
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Heart, Send, MoreHorizontal, Volume2, VolumeX, ChevronLeft, ChevronRight, Pause, Play, AlertCircle } from 'lucide-react';
import { Story, User, ViewState } from '../types';
import { USERS } from '../constants';
import { useChat } from '../ChatContext';

interface StoryViewerProps {
    stories: Story[];
    initialStoryId?: string; // If null, starts from first story of first user
    onClose: () => void;
    onNavigate: (view: ViewState) => void;
}

// Helper to group stories by user
interface UserStoryBucket {
    user: User;
    stories: Story[];
}

const groupStoriesByUser = (stories: Story[]): UserStoryBucket[] => {
    const map = new Map<string, UserStoryBucket>();
    
    // Sort stories by timestamp if needed, but assuming input is sorted or we respect order
    stories.forEach(story => {
        if (!map.has(story.userId)) {
            const user = USERS.find(u => u.id === story.userId);
            if (user) {
                map.set(story.userId, { user, stories: [] });
            }
        }
        if (map.has(story.userId)) {
            map.get(story.userId)!.stories.push(story);
        }
    });
    
    return Array.from(map.values());
};

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialStoryId, onClose, onNavigate }) => {
    // --- Context ---
    const { sendMessage } = useChat();

    // --- Data Prep ---
    const buckets = useRef(groupStoriesByUser(stories)).current;
    
    // --- State ---
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [mediaError, setMediaError] = useState(false);
    
    // Like State
    const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const pausedAtRef = useRef<number>(0);

    // Derived
    const currentBucket = buckets[currentUserIndex];
    const currentStory = currentBucket?.stories[currentStoryIndex];
    const currentUser = currentBucket?.user;
    const isLiked = currentStory ? likedStories.has(currentStory.id) : false;

    // --- Initialization Logic ---
    useEffect(() => {
        if (initialStoryId) {
            // Find which bucket and story index contains the initial ID
            for (let i = 0; i < buckets.length; i++) {
                const sIndex = buckets[i].stories.findIndex(s => s.id === initialStoryId);
                if (sIndex !== -1) {
                    setCurrentUserIndex(i);
                    setCurrentStoryIndex(sIndex);
                    break;
                }
            }
        }
    }, [initialStoryId]);

    // --- Navigation Logic ---

    const nextStory = useCallback(() => {
        // Reset state for next slide
        setProgress(0);
        setVideoDuration(null);
        setIsImageLoaded(false);
        setMediaError(false);
        pausedAtRef.current = 0;

        if (currentStoryIndex < currentBucket.stories.length - 1) {
            // Next story in same bucket
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentUserIndex < buckets.length - 1) {
            // Next user bucket
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            // End of all stories
            onClose();
        }
    }, [currentStoryIndex, currentBucket, currentUserIndex, buckets, onClose]);

    const prevStory = useCallback(() => {
        setProgress(0);
        setVideoDuration(null);
        setIsImageLoaded(false);
        setMediaError(false);
        pausedAtRef.current = 0;

        if (currentStoryIndex > 0) {
            // Previous story in same bucket
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentUserIndex > 0) {
            // Previous user bucket (go to their last story)
            const prevBucketIndex = currentUserIndex - 1;
            setCurrentUserIndex(prevBucketIndex);
            setCurrentStoryIndex(buckets[prevBucketIndex].stories.length - 1);
        } else {
            // Start of all stories (Close or stay?) -> Let's close for now or just stay
            // onClose(); 
        }
    }, [currentStoryIndex, currentUserIndex, buckets]);

    // --- Timer Engine ---

    useEffect(() => {
        if (!currentStory) return;
        if (isPaused) {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
            return;
        }

        // Duration: Video duration (if ready) OR Default (5s)
        const duration = currentStory.mediaType === 'video' 
            ? (videoDuration ? videoDuration * 1000 : 15000) // Fallback 15s if duration unknown yet
            : (currentStory.duration || 5000);

        // If it's an image, wait for it to load before starting timer
        // If media error, we can either skip or hold. Let's just start timer to skip.
        if (currentStory.mediaType === 'image' && !isImageLoaded && !mediaError) return;

        let start = Date.now() - pausedAtRef.current; // Adjust start time by how much we already played

        const animate = () => {
            const now = Date.now();
            const elapsed = now - start;
            const percentage = Math.min((elapsed / duration) * 100, 100);

            setProgress(percentage);
            pausedAtRef.current = elapsed; // Track elapsed in case we pause

            if (percentage < 100) {
                timerRef.current = requestAnimationFrame(animate);
            } else {
                nextStory();
            }
        };

        timerRef.current = requestAnimationFrame(animate);

        return () => {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
        };
    }, [currentStory, isPaused, videoDuration, isImageLoaded, mediaError, nextStory]);


    // --- Media Handlers ---

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
            videoRef.current.play().catch(e => console.log("Autoplay failed", e));
        }
    };

    const handleMediaError = () => {
        console.error("Media failed to load:", currentStory?.mediaType, currentStory?.mediaType === 'video' ? currentStory?.videoUrl : currentStory?.imageUrl);
        setMediaError(true);
        setVideoDuration(5); // Treat as 5s slide to auto-skip
    };

    const togglePause = (shouldPause: boolean) => {
        setIsPaused(shouldPause);
        if (videoRef.current && !mediaError) {
            if (shouldPause) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const toggleLike = () => {
        if (!currentStory) return;
        
        setLikedStories(prev => {
            const next = new Set(prev);
            if (next.has(currentStory.id)) {
                next.delete(currentStory.id);
            } else {
                next.add(currentStory.id);
                setShowLikeAnimation(true);
                setTimeout(() => setShowLikeAnimation(false), 800);
            }
            return next;
        });
    };

    const handleSendMessage = () => {
        if (!inputValue.trim() || !currentUser || !currentStory) return;
        
        // 1. Send Message via Context
        sendMessage(currentUser.id, inputValue, 'story_reply', currentStory.imageUrl);
        
        // 2. Clear input
        setInputValue('');
        
        // 3. Close Story Viewer
        onClose();

        // 4. Navigate to Messages
        onNavigate(ViewState.MESSAGES);
    };

    // --- Keyboard Support ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextStory();
            if (e.key === 'ArrowLeft') prevStory();
            if (e.key === 'Escape') onClose();
            if (e.key === ' ' && !inputValue) togglePause(!isPaused); // Don't pause if typing
            if (e.key === 'Enter' && inputValue) handleSendMessage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextStory, prevStory, onClose, isPaused, inputValue]);


    if (!currentStory || !currentUser) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in touch-none">
            
            {/* --- Safe Area / Mobile Viewport --- */}
            <div className="relative w-full h-full md:w-[400px] md:h-[90vh] md:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
                
                {/* --- Header / Progress Bars --- */}
                <div className="absolute top-0 left-0 right-0 z-30 pt-4 pb-2 px-2 bg-gradient-to-b from-black/60 to-transparent">
                    {/* Progress Bars Container */}
                    <div className="flex space-x-1 mb-3">
                        {currentBucket.stories.map((s, idx) => (
                            <div key={s.id} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white transition-all ease-linear"
                                    style={{ 
                                        width: idx < currentStoryIndex ? '100%' : 
                                               idx === currentStoryIndex ? `${progress}%` : '0%',
                                        transitionDuration: idx === currentStoryIndex ? '0ms' : '0ms' // Managed by JS animation frame
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* User Info */}
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center space-x-2">
                             <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-white/50" />
                             <div>
                                 <span className="text-white text-sm font-bold shadow-black drop-shadow-md block leading-none">{currentUser.name}</span>
                                 <div className="flex items-center space-x-2">
                                     <span className="text-white/70 text-xs font-medium shadow-black drop-shadow-md">{currentStory.timestamp}</span>
                                     {currentStory.privacy === 'close_friends' && (
                                         <span className="bg-green-500/80 text-white text-[9px] px-1.5 rounded font-bold backdrop-blur-sm">Close Friends</span>
                                     )}
                                 </div>
                             </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => togglePause(!isPaused)}>
                                {isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
                            </button>
                            <button onClick={onClose}>
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Area (Hit Targets) --- */}
                <div 
                    className="absolute inset-0 z-10 flex"
                    onMouseDown={() => togglePause(true)}
                    onMouseUp={() => togglePause(false)}
                    onTouchStart={() => togglePause(true)}
                    onTouchEnd={() => togglePause(false)}
                >
                    {/* Previous Tap Area (30% width) */}
                    <div className="w-[30%] h-full" onClick={(e) => { e.stopPropagation(); prevStory(); }}></div>
                    {/* Next Tap Area (70% width) */}
                    <div className="w-[70%] h-full" onClick={(e) => { e.stopPropagation(); nextStory(); }}></div>
                </div>

                {/* --- Media Rendering --- */}
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                    {/* Like Animation Overlay */}
                    {showLikeAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <Heart className="w-32 h-32 text-red-500 fill-red-500 animate-bounce drop-shadow-2xl" />
                        </div>
                    )}

                    {mediaError ? (
                        <div className="text-white flex flex-col items-center">
                            <AlertCircle className="w-10 h-10 mb-2 text-red-500" />
                            <p className="text-sm">Media unavailable</p>
                        </div>
                    ) : currentStory.mediaType === 'video' ? (
                        <video
                            ref={videoRef}
                            src={currentStory.videoUrl}
                            className="w-full h-full object-cover"
                            playsInline
                            muted={isMuted}
                            onLoadedMetadata={handleVideoLoaded}
                            onWaiting={() => setIsPaused(true)}
                            onPlaying={() => setIsPaused(false)}
                            onError={handleMediaError}
                        />
                    ) : (
                        <img 
                            src={currentStory.imageUrl} 
                            className="w-full h-full object-cover animate-scale-up"
                            onLoad={() => setIsImageLoaded(true)}
                            onError={handleMediaError}
                            style={{ animationDuration: '10s' }} // Slow zoom effect
                        />
                    )}
                </div>
                
                {/* --- Loading Spinner --- */}
                {!mediaError && ((currentStory.mediaType === 'image' && !isImageLoaded) || (currentStory.mediaType === 'video' && !videoDuration)) && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}

                {/* --- Bottom Interactions --- */}
                <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder={`Send message to ${currentUser.handle}...`}
                            className="w-full bg-transparent border border-white/50 rounded-full py-2.5 px-4 text-white placeholder-white/70 outline-none focus:border-white transition backdrop-blur-sm"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onFocus={() => togglePause(true)}
                            onBlur={() => togglePause(false)}
                        />
                    </div>
                    {inputValue ? (
                        <button className="text-white font-bold text-sm" onClick={handleSendMessage}>Send</button>
                    ) : (
                        <>
                            <button className="p-1" onClick={() => setIsMuted(!isMuted)}>
                                {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                            </button>
                            <button className="p-1 transition-transform active:scale-125" onClick={toggleLike}>
                                <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                            </button>
                            <button className="p-1">
                                <Send className="w-6 h-6 text-white rotate-12" />
                            </button>
                        </>
                    )}
                </div>

            </div>

            {/* Desktop Navigation Arrows (Outside phone frame) */}
            <button 
                className="hidden md:flex absolute left-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition"
                onClick={prevStory}
            >
                <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button 
                className="hidden md:flex absolute right-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition"
                onClick={nextStory}
            >
                <ChevronRight className="w-8 h-8 text-white" />
            </button>
        </div>
    );
};

export default StoryViewer;
