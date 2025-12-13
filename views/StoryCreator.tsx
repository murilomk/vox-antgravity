
import React, { useState, useRef, useEffect } from 'react';
import { 
    X, Camera, Image as ImageIcon, Zap, RotateCcw, 
    Type, Sticker, Music, ChevronRight, Send, 
    Radio, Video, Mic, CheckCircle, Loader2, Sparkles, 
    Settings, PenTool, Download, Trash2, Heart, MessageCircle, Share2,
    MoreHorizontal, Globe, Users as UsersIcon, Star, Search, ChevronLeft, Check, AlertTriangle
} from 'lucide-react';
import { Story, User } from '../types';
import { CURRENT_USER, USERS } from '../constants';

type CreatorMode = 'PHOTO' | 'VIDEO' | 'LIVE';
type CreatorStep = 'CAPTURE' | 'EDITOR' | 'POSTING' | 'LIVE_STREAM';
type VideoDuration = 15 | 30 | 60;
type StoryPrivacy = 'public' | 'followers' | 'close_friends';

interface StoryCreatorProps {
    onClose: () => void;
    onPost: (story: Story) => void;
}

// --- CONSTANTS ---
const FILTERS = [
    { name: 'Normal', class: '' },
    { name: 'Vivid', class: 'contrast-125 saturate-150' },
    { name: 'B&W', class: 'grayscale' },
    { name: 'Warm', class: 'sepia brightness-110' },
    { name: 'Cool', class: 'hue-rotate-30 saturate-80' },
    { name: 'Vintage', class: 'sepia-[.3] contrast-125 brightness-90' },
];

const STICKERS = ['🔥', '❤️', '😍', '🎉', '😎', '🌟', '🍕', '🐶'];

// --- SUB-COMPONENTS: SETTINGS ---

const CloseFriendsEditor = ({ 
    currentList, 
    onSave, 
    onBack 
}: { 
    currentList: string[], 
    onSave: (list: string[]) => void, 
    onBack: () => void 
}) => {
    const [list, setList] = useState<string[]>(currentList);
    const [search, setSearch] = useState('');

    const toggleUser = (userId: string) => {
        if (list.includes(userId)) {
            setList(list.filter(id => id !== userId));
        } else {
            setList([...list, userId]);
        }
    };

    const filteredUsers = USERS.slice(1).filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.handle.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-neutral-900 animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                <button onClick={onBack}><ChevronLeft className="w-6 h-6 dark:text-white" /></button>
                <h3 className="font-bold dark:text-white">Edit Close Friends</h3>
                <button 
                    onClick={() => onSave(list)}
                    className="text-primary-500 font-bold text-sm"
                >
                    Done
                </button>
            </div>
            
            <div className="p-4">
                <div className="relative bg-gray-100 dark:bg-neutral-800 rounded-xl px-3 py-2 mb-4">
                    <Search className="w-4 h-4 text-gray-400 absolute top-3 left-3" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-transparent pl-8 outline-none text-sm dark:text-white"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">{list.length} Selected</span>
                        {list.length > 0 && <button onClick={() => setList([])} className="text-xs text-red-500 font-bold">Clear All</button>}
                    </div>
                    
                    <div className="space-y-2 h-[60vh] overflow-y-auto">
                        {filteredUsers.map(user => {
                            const isSelected = list.includes(user.id);
                            return (
                                <div key={user.id} onClick={() => toggleUser(user.id)} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.handle}</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-neutral-600'}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StorySettingsModal = ({ 
    currentPrivacy, 
    onClose, 
    onSave,
    currentCloseFriends,
    onUpdateCloseFriends
}: { 
    currentPrivacy: StoryPrivacy, 
    onClose: () => void, 
    onSave: (p: StoryPrivacy) => void,
    currentCloseFriends: string[],
    onUpdateCloseFriends: (list: string[]) => void
}) => {
    const [privacy, setPrivacy] = useState<StoryPrivacy>(currentPrivacy);
    const [isEditingFriends, setIsEditingFriends] = useState(false);

    if (isEditingFriends) {
        return (
            <CloseFriendsEditor 
                currentList={currentCloseFriends} 
                onBack={() => setIsEditingFriends(false)}
                onSave={(list) => {
                    onUpdateCloseFriends(list);
                    setIsEditingFriends(false);
                }}
            />
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-t-3xl h-[60vh] flex flex-col animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                <button onClick={onClose} className="text-gray-500">Cancel</button>
                <h3 className="font-bold text-lg dark:text-white">Story Settings</h3>
                <button onClick={() => { onSave(privacy); onClose(); }} className="text-primary-600 font-bold">Done</button>
            </div>

            <div className="p-4 space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Who can see your story?</h4>
                    
                    {/* Public */}
                    <div 
                        onClick={() => setPrivacy('public')}
                        className={`flex items-center justify-between p-4 rounded-xl border mb-2 cursor-pointer transition ${privacy === 'public' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-white/10'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                                <Globe className="w-5 h-5 text-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm dark:text-white">Public</p>
                                <p className="text-xs text-gray-500">Anyone can see your story</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${privacy === 'public' ? 'border-primary-500' : 'border-gray-300'}`}>
                            {privacy === 'public' && <div className="w-3 h-3 bg-primary-500 rounded-full" />}
                        </div>
                    </div>

                    {/* Followers */}
                    <div 
                        onClick={() => setPrivacy('followers')}
                        className={`flex items-center justify-between p-4 rounded-xl border mb-2 cursor-pointer transition ${privacy === 'followers' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-white/10'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                                <UsersIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm dark:text-white">Followers Only</p>
                                <p className="text-xs text-gray-500">Only people who follow you</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${privacy === 'followers' ? 'border-primary-500' : 'border-gray-300'}`}>
                            {privacy === 'followers' && <div className="w-3 h-3 bg-primary-500 rounded-full" />}
                        </div>
                    </div>

                    {/* Close Friends */}
                    <div 
                        onClick={() => setPrivacy('close_friends')}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${privacy === 'close_friends' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-100 dark:border-white/10'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                                <Star className="w-5 h-5 text-green-500 fill-green-500" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <p className="font-bold text-sm dark:text-white">Close Friends</p>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold">{currentCloseFriends.length} people</span>
                                </div>
                                <p className="text-xs text-gray-500">Only specific people</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsEditingFriends(true); }}
                                className="text-xs font-bold text-gray-500 hover:text-green-500 underline z-10 p-1"
                            >
                                Edit List
                            </button>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${privacy === 'close_friends' ? 'border-green-500' : 'border-gray-300'}`}>
                                {privacy === 'close_friends' && <div className="w-3 h-3 bg-green-500 rounded-full" />}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-xs text-gray-500">Your default privacy setting is currently set to <strong>{privacy === 'public' ? 'Public' : privacy === 'followers' ? 'Followers' : 'Close Friends'}</strong>. This will apply to all future stories unless changed.</p>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onPost }) => {
    // --- STATE ---
    const [mode, setMode] = useState<CreatorMode>('PHOTO');
    const [step, setStep] = useState<CreatorStep>('CAPTURE');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [cameraReady, setCameraReady] = useState(false);
    
    // Error State
    const [cameraError, setCameraError] = useState<{ type: 'permission' | 'not_found' | 'unknown'; message: string } | null>(null);
    
    // Privacy State
    const [showSettings, setShowSettings] = useState(false);
    const [privacy, setPrivacy] = useState<StoryPrivacy>('followers'); // Default
    const [closeFriendsList, setCloseFriendsList] = useState<string[]>([]); // User IDs

    // Media State
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null); // For editor base
    
    // Video State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [maxDuration, setMaxDuration] = useState<VideoDuration>(15);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    
    // Editor State
    const [caption, setCaption] = useState('');
    const [activeFilter, setActiveFilter] = useState(0);
    const [addedStickers, setAddedStickers] = useState<{id: number, emoji: string, x: number, y: number}[]>([]);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    
    // Live State
    const [liveViewers, setLiveViewers] = useState(0);
    const [liveComments, setLiveComments] = useState<{user: string, text: string}[]>([]);
    const [liveHearts, setLiveHearts] = useState<{id: number, left: number}[]>([]);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- CAMERA LIFECYCLE ---

    useEffect(() => {
        let mounted = true;
        
        const initCamera = async () => {
            if (step !== 'CAPTURE' && step !== 'LIVE_STREAM') return;
            
            setCameraError(null);

            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (mounted) setCameraError({ type: 'not_found', message: 'Camera not supported in this browser' });
                return;
            }

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(t => t.stop());
                }

                let stream: MediaStream | null = null;
                const needsAudio = mode !== 'PHOTO';

                try {
                    // Try preferred facing mode first
                    const constraints = {
                        video: { 
                            facingMode: { ideal: facingMode }, // Use 'ideal' for better fallback support
                            width: { ideal: 1080 },
                            height: { ideal: 1920 }
                        },
                        audio: needsAudio 
                    };
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (err1) {
                    // Fallback to basic video if facingMode fails
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: needsAudio });
                    } catch (err2) {
                        if (needsAudio) {
                            // Last ditch attempt without audio (sometimes audio fails permissions independently)
                            try {
                                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                            } catch (err3) {
                                throw err3;
                            }
                        } else {
                            throw err2;
                        }
                    }
                }
                
                if (mounted && stream) {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current?.play().catch(e => console.error("Play error", e));
                            setCameraReady(true);
                        };
                    }
                }
            } catch (err: any) {
                console.warn("Camera Init Error:", err.name, err.message);
                if (mounted) {
                    let type: 'permission' | 'not_found' | 'unknown' = 'unknown';
                    let message = 'Could not access camera.';

                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        type = 'permission';
                        message = 'Camera access denied. Please enable permissions.';
                    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        type = 'not_found';
                        message = 'No camera device found.';
                    }

                    setCameraError({ type, message });
                }
            }
        };

        initCamera();

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [facingMode, step, mode]);

    // --- PHOTO LOGIC ---

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            setMediaUrl(dataUrl);
            setStep('EDITOR');
        }
    };

    // --- VIDEO LOGIC ---

    const startRecording = () => {
        if (!streamRef.current) return;
        setRecordingTime(0);
        setIsRecording(true);
        chunksRef.current = [];

        try {
            const recorder = new MediaRecorder(streamRef.current);
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                setMediaUrl(url);
                setStep('EDITOR');
                setIsRecording(false);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
        } catch (e) {
            console.error("Recorder failed", e);
            setIsRecording(true); // Fallback
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        } else {
            setIsRecording(false);
            setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4');
            setStep('EDITOR');
        }
    };

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= maxDuration) {
                        stopRecording();
                        return maxDuration;
                    }
                    return prev + 0.1;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRecording, maxDuration]);

    // --- LIVE LOGIC ---

    useEffect(() => {
        let interval: any;
        if (step === 'LIVE_STREAM') {
            setLiveViewers(0);
            setLiveComments([]);
            interval = setInterval(() => {
                setLiveViewers(prev => prev + Math.floor(Math.random() * 5));
                if (Math.random() > 0.6) {
                    const randomUser = USERS[Math.floor(Math.random() * USERS.length)];
                    const comments = ["Love this! 😍", "Where are you?", "Hi!! 👋", "OMG 🔥", "Cool vibes"];
                    const text = comments[Math.floor(Math.random() * comments.length)];
                    setLiveComments(prev => [...prev.slice(-4), { user: randomUser.handle, text }]);
                }
                if (Math.random() > 0.5) {
                    setLiveHearts(prev => [...prev, { id: Date.now(), left: Math.random() * 50 + 25 }]);
                }
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [step]);

    // --- EDITOR LOGIC ---

    const addSticker = (emoji: string) => {
        setAddedStickers([...addedStickers, { id: Date.now(), emoji, x: 50, y: 50 }]);
        setShowStickerPicker(false);
    };

    const cycleFilter = () => {
        setActiveFilter((prev) => (prev + 1) % FILTERS.length);
    };

    // --- POSTING ---

    const handlePost = () => {
        setStep('POSTING');
        setTimeout(() => {
            const newStory: Story = {
                id: `story_${Date.now()}`,
                userId: CURRENT_USER.id,
                imageUrl: mode === 'VIDEO' ? 'video_thumbnail_placeholder' : (mediaUrl || ''),
                videoUrl: mode === 'VIDEO' ? (mediaUrl || undefined) : undefined,
                mediaType: mode === 'VIDEO' ? 'video' : 'image',
                timestamp: 'Just now',
                isViewed: false,
                hasMusic: false,
                // Privacy Integration
                privacy: privacy, 
                isCloseFriends: privacy === 'close_friends'
            };
            onPost(newStory);
            onClose();
        }, 1500);
    };

    // --- RENDER HELPERS ---

    const CaptureControls = () => (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-safe bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
            
            {/* Mode Selector */}
            <div className="flex items-center space-x-8 mb-8">
                {['PHOTO', 'VIDEO', 'LIVE'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m as CreatorMode)}
                        className={`text-sm font-bold tracking-widest transition-all duration-300 ${
                            mode === m 
                            ? 'text-white scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' 
                            : 'text-white/50 hover:text-white/80'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Video Duration Selector */}
            {mode === 'VIDEO' && (
                <div className="flex space-x-2 mb-6 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                    {([15, 30, 60] as VideoDuration[]).map(d => (
                        <button
                            key={d}
                            onClick={() => setMaxDuration(d)}
                            className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${maxDuration === d ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                        >
                            {d}s
                        </button>
                    ))}
                </div>
            )}

            {/* Main Action Row */}
            <div className="w-full flex items-center justify-between px-10 mb-8">
                {/* Left: Gallery */}
                <div className="w-12 flex justify-center">
                    <label className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/50 cursor-pointer active:scale-95 transition bg-black/20 backdrop-blur-sm">
                        <ImageIcon className="w-full h-full p-2 text-white/80" />
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*,video/*" 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file) {
                                    setMediaUrl(URL.createObjectURL(file));
                                    setMode(file.type.startsWith('video') ? 'VIDEO' : 'PHOTO');
                                    setStep('EDITOR');
                                }
                            }} 
                        />
                    </label>
                </div>

                {/* Center: Shutter */}
                <div className="relative flex justify-center items-center">
                    {mode === 'VIDEO' && (
                        <svg className="absolute w-24 h-24 pointer-events-none -rotate-90">
                            <circle cx="48" cy="48" r="46" stroke="white" strokeWidth="4" fill="transparent" className="opacity-30" />
                            <circle 
                                cx="48" cy="48" r="46" 
                                stroke="#ef4444" 
                                strokeWidth="4" 
                                fill="transparent" 
                                strokeDasharray={289} 
                                strokeDashoffset={289 - (289 * (recordingTime / maxDuration))}
                                className={`transition-all duration-100 ${isRecording ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </svg>
                    )}

                    <button
                        onMouseDown={mode === 'VIDEO' ? startRecording : undefined}
                        onMouseUp={mode === 'VIDEO' ? stopRecording : undefined}
                        onTouchStart={mode === 'VIDEO' ? startRecording : undefined}
                        onTouchEnd={mode === 'VIDEO' ? stopRecording : undefined}
                        onClick={mode === 'PHOTO' ? takePhoto : (mode === 'LIVE' ? () => setStep('LIVE_STREAM') : undefined)}
                        disabled={!!cameraError}
                        className={`
                            rounded-full border-4 border-white transition-all duration-200 shadow-xl
                            ${mode === 'PHOTO' ? 'w-16 h-16 bg-white active:scale-90' : ''}
                            ${mode === 'VIDEO' ? `w-20 h-20 ${isRecording ? 'bg-red-500 scale-75' : 'bg-red-500'} border-transparent` : ''}
                            ${mode === 'LIVE' ? 'w-16 h-16 bg-white border-2 border-red-500 flex items-center justify-center' : ''}
                            ${!!cameraError ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {mode === 'LIVE' && <Radio className="w-6 h-6 text-red-600" />}
                    </button>
                </div>

                {/* Right: Flip Camera */}
                <div className="w-12 flex justify-center">
                    <button 
                        onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                        className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center active:rotate-180 transition duration-500"
                    >
                        <RotateCcw className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );

    const EditorOverlay = () => (
        <div className="absolute inset-0 z-40 flex flex-col justify-between pb-safe bg-black/90">
            {/* Top Bar */}
            <div className="flex justify-between items-start p-4 pt-6">
                <button onClick={() => { setStep('CAPTURE'); setMediaUrl(null); setAddedStickers([]); setCaption(''); }} className="p-2 bg-black/20 rounded-full backdrop-blur">
                    <ChevronRight className="w-6 h-6 text-white rotate-180" />
                </button>
                
                <div className="flex space-x-4">
                    <button onClick={() => setShowStickerPicker(!showStickerPicker)} className="p-2 bg-black/20 rounded-full backdrop-blur"><Sticker className="w-6 h-6 text-white" /></button>
                    <button className="p-2 bg-black/20 rounded-full backdrop-blur"><Type className="w-6 h-6 text-white" /></button>
                    {mode === 'PHOTO' && (
                        <button onClick={cycleFilter} className="p-2 bg-black/20 rounded-full backdrop-blur flex items-center space-x-1">
                            <Sparkles className="w-6 h-6 text-white" />
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas Area (Mock) */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
                {mode === 'VIDEO' ? (
                    <video src={mediaUrl || ''} autoPlay loop playsInline className={`max-h-full w-full object-contain ${FILTERS[activeFilter].class}`} />
                ) : (
                    <img src={mediaUrl || ''} className={`max-h-full w-full object-contain ${FILTERS[activeFilter].class}`} />
                )}

                {addedStickers.map(sticker => (
                    <div key={sticker.id} className="absolute text-5xl cursor-move select-none drop-shadow-lg transform hover:scale-110 active:scale-95 transition" style={{ top: `${sticker.y}%`, left: `${sticker.x}%` }}>
                        {sticker.emoji}
                    </div>
                ))}

                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold pointer-events-none">
                    {FILTERS[activeFilter].name}
                </div>
            </div>

            {/* Sticker Picker */}
            {showStickerPicker && (
                <div className="absolute top-20 left-0 right-0 p-4 z-50">
                    <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 grid grid-cols-4 gap-4 animate-scale-up">
                        {STICKERS.map(s => (
                            <button key={s} onClick={() => addSticker(s)} className="text-4xl hover:scale-125 transition">{s}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* Caption Input */}
            <div className="px-4 py-2 bg-black/40 backdrop-blur-sm">
                <input 
                    type="text" 
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Add a caption..." 
                    className="w-full bg-transparent text-white placeholder-white/70 outline-none text-center py-2"
                />
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center p-6 pt-4">
                <div className="flex items-center space-x-2">
                    <button className="bg-white/10 px-4 py-2 rounded-full text-white text-xs font-bold backdrop-blur-md flex items-center">
                        <Download className="w-4 h-4 mr-2" /> Save
                    </button>
                    {/* Privacy Indicator Badge */}
                    <button 
                        onClick={() => setShowSettings(true)}
                        className={`bg-white/10 px-4 py-2 rounded-full text-white text-xs font-bold backdrop-blur-md flex items-center ${privacy === 'close_friends' ? 'text-green-400 border border-green-500/50' : ''}`}
                    >
                        {privacy === 'public' ? <Globe className="w-4 h-4 mr-2" /> : privacy === 'followers' ? <UsersIcon className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2 fill-green-400" />}
                        {privacy === 'public' ? 'Public' : privacy === 'followers' ? 'Followers' : 'Close Friends'}
                    </button>
                </div>
                
                <button 
                    onClick={handlePost}
                    className={`px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center space-x-2 hover:scale-105 transition ${privacy === 'close_friends' ? 'bg-green-500 text-white' : 'bg-white text-black'}`}
                >
                    <span>Your Story</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const LiveStreamView = () => (
        <div className="absolute inset-0 z-50 bg-black">
            <video ref={videoRef} className="w-full h-full object-cover opacity-80" autoPlay muted playsInline />
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex flex-col items-start">
                    <div className="bg-red-600 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center animate-pulse mb-2">
                        LIVE 00:{(recordingTime).toFixed(0).padStart(2, '0')}
                    </div>
                    <div className="flex items-center space-x-2 bg-black/40 px-2 py-1 rounded-full backdrop-blur">
                        <span className="text-white text-xs font-bold">{liveViewers} Viewers</span>
                    </div>
                </div>
                <button onClick={() => setStep('CAPTURE')} className="p-2 bg-black/20 rounded-full text-white backdrop-blur">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col justify-end z-10">
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4 mask-image-b">
                    {liveComments.map((c, i) => (
                        <div key={i} className="flex items-start space-x-2 animate-slide-up text-sm">
                            <span className="font-bold text-white/90 text-shadow-sm">{c.user}</span>
                            <span className="text-white text-shadow-sm">{c.text}</span>
                        </div>
                    ))}
                </div>
                {liveHearts.map(h => (
                    <div key={h.id} className="absolute bottom-20 text-2xl animate-float-up pointer-events-none" style={{ left: `${h.left}%` }}>❤️</div>
                ))}
                <div className="flex items-center space-x-3 pb-safe">
                    <div className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center">
                        <input type="text" placeholder="Comment..." className="bg-transparent w-full text-white placeholder-white/70 outline-none text-sm" />
                        <button className="text-white"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <button onClick={() => setLiveHearts(prev => [...prev, {id: Date.now(), left: 80}])} className="p-3 bg-red-500/80 rounded-full text-white backdrop-blur active:scale-90 transition"><Heart className="w-5 h-5 fill-white" /></button>
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    if (step === 'POSTING') {
        return (
            <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <h3 className="text-white font-bold text-lg animate-pulse">Posting Story...</h3>
            </div>
        );
    }

    if (step === 'LIVE_STREAM') {
        return <LiveStreamView />;
    }

    if (step === 'EDITOR' && mediaUrl) {
        return (
            <>
                <EditorOverlay />
                {showSettings && (
                    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center">
                        <div className="w-full md:w-[500px]">
                            <StorySettingsModal 
                                currentPrivacy={privacy} 
                                onClose={() => setShowSettings(false)}
                                onSave={setPrivacy}
                                currentCloseFriends={closeFriendsList}
                                onUpdateCloseFriends={setCloseFriendsList}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] bg-black overflow-hidden animate-fade-in">
            {/* Top Bar (Close / Settings) - FIXING Z-INDEX */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start z-50">
                <button onClick={onClose} className="p-2 bg-black/20 rounded-full backdrop-blur-md hover:bg-black/40 transition">
                    <X className="w-7 h-7 text-white" />
                </button>
                <button 
                    onClick={() => setShowSettings(true)} 
                    className="p-2 bg-black/20 rounded-full backdrop-blur-md hover:bg-black/40 transition"
                >
                    <Settings className="w-7 h-7 text-white" />
                </button>
            </div>

            {/* Camera Preview Layer (Z-0) */}
            <div className="absolute inset-0 z-0 bg-gray-900">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Fallback for Camera Errors */}
                {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-6 text-center">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            {cameraError.type === 'not_found' ? (
                                <AlertTriangle className="w-10 h-10 text-yellow-500" />
                            ) : (
                                <Camera className="w-10 h-10 text-red-500" />
                            )}
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">
                            {cameraError.type === 'not_found' ? 'No Camera Found' : 'Camera Access Denied'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
                            {cameraError.message}
                        </p>
                        
                        <div className="space-y-4 w-full max-w-xs">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition flex items-center justify-center"
                            >
                                <ImageIcon className="w-5 h-5 mr-2" />
                                Upload from Device
                            </button>
                            <button onClick={onClose} className="w-full py-3 text-gray-400 font-medium hover:text-white transition">
                                Go Back
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls (Z-30) */}
            <CaptureControls />

            {/* Settings Modal (Z-70) */}
            {showSettings && (
                <div 
                    className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in"
                    onClick={() => setShowSettings(false)}
                >
                    <div 
                        className="w-full md:w-[500px]"
                        onClick={e => e.stopPropagation()}
                    >
                        <StorySettingsModal 
                            currentPrivacy={privacy} 
                            onClose={() => setShowSettings(false)}
                            onSave={setPrivacy}
                            currentCloseFriends={closeFriendsList}
                            onUpdateCloseFriends={setCloseFriendsList}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryCreator;
