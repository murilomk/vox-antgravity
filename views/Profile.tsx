
import React, { useState, useEffect, useRef } from 'react';
import { User, Post, Reel, ViewState } from '../types';
import { CURRENT_USER } from '../constants';
import {
    Settings, Grid, Bookmark, Users, Film, Edit3, MapPin,
    Link as LinkIcon, X, Check, Camera, Heart, MessageCircle,
    Send, Play, Pause, Music, QrCode, Share2, MoreHorizontal,
    Shield, Star, Zap, BarChart3, Lock, Trophy, Calendar, Archive,
    ShoppingBag, ChevronRight, Eye, TrendingUp, DollarSign, UserPlus, UserMinus, Search, Copy, CheckCircle, Smartphone, Facebook, Twitter, Instagram, Linkedin, Briefcase, AtSign, Globe, Palette, Loader2, Upload, Trash2, SmartphoneCharging, Layout, Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useContent } from '../ContentContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import PostViewer from '../components/PostViewer';
import UserListModal from '../components/UserListModal';

// --- TYPES ---
type TabType = 'posts' | 'reels' | 'saved';
type ModalType = 'none' | 'followers' | 'following' | 'edit_profile' | 'share_profile';

// --- SUB-COMPONENTS ---

// 1. EDIT PROFILE MODAL
const EditProfileModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (u: User) => Promise<void> }) => {
    const [formData, setFormData] = useState<User>({ ...user });
    const [isSaving, setIsSaving] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    // File Inputs Refs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const result = URL.createObjectURL(file);
            if (type === 'avatar') {
                setPreviewAvatar(result);
                setAvatarFile(file);
            } else {
                setPreviewBanner(result);
                setBannerFile(file);
            }
        }
    };

    const uploadImage = async (file: File, bucket: 'avatars' | 'banners'): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                if (uploadError.message.includes('bucket not found') || (uploadError as any).code === '42P01') {
                    console.warn(`Storage bucket '${bucket}' missing. Skipping upload.`);
                    return null;
                }
                console.error(`Error uploading ${bucket}:`, uploadError);
                return null;
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return data.publicUrl;
        } catch (err) {
            console.error("Upload exception:", err);
            return null;
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let avatarUrl = formData.avatar;
            let bannerUrl = formData.coverUrl;

            if (avatarFile) {
                const url = await uploadImage(avatarFile, 'avatars');
                if (url) avatarUrl = url;
            }
            if (bannerFile) {
                const url = await uploadImage(bannerFile, 'banners');
                if (url) bannerUrl = url;
            }

            const updatedUser = {
                ...formData,
                avatar: avatarUrl,
                coverUrl: bannerUrl
            };

            await onSave(updatedUser);
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to update profile. Database might not be ready.");
        } finally {
            setIsSaving(false);
        }
    };

    const ColorPicker = () => (
        <div className="flex flex-wrap gap-3 py-2">
            {['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#000000'].map(c => (
                <button
                    key={c}
                    onClick={() => setFormData({ ...formData, themeColor: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform shadow-sm ${formData.themeColor === c ? 'scale-110 border-white ring-2 ring-black dark:ring-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col animate-slide-up">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-black sticky top-0 z-10">
                <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition font-medium">Cancel</button>
                <h3 className="font-bold text-lg dark:text-white">Edit Profile</h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-primary-600 font-bold disabled:opacity-50 flex items-center"
                >
                    {isSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Save
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-black p-4 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Cover Image</label>
                        <div
                            className="relative h-32 rounded-xl overflow-hidden bg-gray-200 dark:bg-neutral-800 border-2 border-dashed border-gray-300 dark:border-neutral-700 cursor-pointer group"
                            onClick={() => bannerInputRef.current?.click()}
                        >
                            <img src={previewBanner || formData.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div
                            className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-black shadow-lg cursor-pointer group"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            <img src={previewAvatar || formData.avatar} className="w-full h-full object-cover group-hover:opacity-60 transition" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
                        <div className="relative mt-1">
                            <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.handle.replace('@', '')}
                                onChange={e => setFormData({ ...formData, handle: '@' + e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Theme Color</label>
                        <ColorPicker />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. PROFILE SHARE SHEET
const ProfileShareSheet = ({ user, onClose, onNavigate }: { user: User, onClose: () => void, onNavigate?: (view: ViewState) => void }) => {
    const [copied, setCopied] = useState(false);
    const profileUrl = `https://voxnet.social/@${user.handle.replace('@', '')}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff`;

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        if (navigator.vibrate) navigator.vibrate(20);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendDM = () => {
        if (onNavigate) {
            onNavigate(ViewState.MESSAGES);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1 bg-gray-300 dark:bg-neutral-700 rounded-full mx-auto mb-6" />

                <div className="flex flex-col items-center mb-8">
                    <div className="p-1.5 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-xl" style={{ backgroundImage: `linear-gradient(to top right, ${user.themeColor || '#8b5cf6'}, #d946ef)` }}>
                        <div className="bg-white rounded-xl overflow-hidden">
                            <img src={qrUrl} alt="Profile QR Code" className="w-40 h-40" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">{user.name}</h3>
                    <p className="text-gray-500 mb-2">{user.handle}</p>
                    <p className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">{profileUrl}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition ${copied ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-white'}`}
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <button
                        onClick={handleSendDM}
                        className="flex items-center justify-center space-x-2 py-3 rounded-xl font-bold bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition"
                        style={{ backgroundColor: user.themeColor || '#8b5cf6' }}
                    >
                        <Send className="w-5 h-5 rotate-12" />
                        <span>Send in DM</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const Profile: React.FC<{ user?: User, onNavigate?: (view: ViewState) => void }> = ({ user: propUser, onNavigate }) => {
    // --- STATE ---
    const { user: authUser, refreshProfile } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [activeModal, setActiveModal] = useState<ModalType>('none');
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);

    // Determines if viewing own profile
    const isOwner = authUser && user && authUser.id === user.id;

    // --- FETCH DATA --- (Handled in useEffect below)

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!isMounted) return;

            setIsLoading(true);
            const targetUser = propUser || authUser;

            if (!targetUser) {
                if (isMounted) {
                    setIsLoading(false);
                }
                return;
            }

            // Default / Fallback State
            let finalUser: User = { ...targetUser };
            let finalPosts: Post[] = [];
            let finalStats = { followers: 0, following: 0 };
            let finalIsFollowing = false;

            try {
                // 1. Fetch Profile Info
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUser.id)
                    .single();

                if (!isMounted) return;

                if (!profileError && profileData) {
                    finalUser = {
                        ...targetUser,
                        name: profileData.name || targetUser.name,
                        handle: profileData.username || targetUser.handle,
                        bio: profileData.bio || '',
                        avatar: profileData.avatar_url || targetUser.avatar,
                        coverUrl: profileData.banner_url || targetUser.coverUrl
                    };
                }

                // 2. Fetch Posts OR Saved Posts depending on tab
                let postsData: any[] = [];

                try {
                    if (activeTab === 'posts') {
                        const { data, error } = await supabase
                            .from('posts')
                            .select('*')
                            .eq('user_id', targetUser.id)
                            .order('created_at', { ascending: false });
                        if (data && isMounted) postsData = data;
                    } else if (activeTab === 'saved' && isOwner) {
                        // Join saved_posts with posts
                        const { data, error } = await supabase
                            .from('saved_posts')
                            .select('post_id, posts(*)')
                            .eq('user_id', targetUser.id)
                            .order('created_at', { ascending: false });

                        if (data && isMounted) {
                            postsData = data.map((item: any) => item.posts).filter((p: any) => p !== null);
                        }
                    }

                    if (postsData.length > 0 && isMounted) {
                        // Need to check saved status for each post if we are owner
                        let savedIds: string[] = [];
                        if (isOwner && authUser) {
                            const { data: saves } = await supabase.from('saved_posts').select('post_id').eq('user_id', authUser.id);
                            if (saves) savedIds = saves.map(s => s.post_id);
                        }

                        finalPosts = postsData.map((p: any) => ({
                            id: p.id,
                            userId: p.user_id,
                            caption: p.caption,
                            contentUrl: p.content_url,
                            type: p.type || 'image',
                            likes: 0,
                            comments: [],
                            timestamp: new Date(p.created_at).toLocaleDateString(),
                            isLiked: false,
                            isSaved: isOwner ? savedIds.includes(p.id) : false
                        }));
                    }
                } catch (err) { /* Ignore post fetch errors */ }

                // 3. Fetch Follow Counts
                try {
                    const { count: followersCount } = await supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', targetUser.id);

                    const { count: followingCount } = await supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('follower_id', targetUser.id);

                    if (isMounted) {
                        finalStats = {
                            followers: followersCount || 0,
                            following: followingCount || 0
                        };

                        // Check following status
                        if (authUser && authUser.id !== targetUser.id) {
                            const { data: followData } = await supabase
                                .from('follows')
                                .select('*')
                                .eq('follower_id', authUser.id)
                                .eq('following_id', targetUser.id)
                                .single();
                            finalIsFollowing = !!followData;
                        }
                    }
                } catch (err) { /* Ignore follow stats error */ }

            } catch (error: any) {
                if (error.code === '42P01') {
                    console.warn('DB tables missing, using local data.');
                }
            } finally {
                if (isMounted) {
                    setUser(finalUser);
                    setStats(finalStats);
                    setPosts(finalPosts);
                    setIsFollowing(finalIsFollowing);
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [propUser, authUser, activeTab]);

    // --- ACTIONS ---

    const handleUpdateUser = async (updatedUser: User) => {
        if (!authUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: updatedUser.name,
                    username: updatedUser.handle.replace('@', ''),
                    bio: updatedUser.bio,
                    avatar_url: updatedUser.avatar,
                    banner_url: updatedUser.coverUrl
                })
                .eq('id', authUser.id);

            if (error) throw error;

            setUser(updatedUser);
            refreshProfile(); // Sync AuthContext
        } catch (e: any) {
            console.error("Update failed", e);
            if (e.code === '42P01') {
                alert("Database tables missing. Changes saved locally only.");
                setUser(updatedUser); // Optimistic update
            } else {
                alert("Failed to save changes.");
            }
        }
    };

    const handleFollowToggle = async () => {
        if (!authUser || !user) return;

        // Optimistic UI
        const prevFollowing = isFollowing;
        const prevStats = { ...stats };

        setIsFollowing(!isFollowing);
        setStats(prev => ({
            ...prev,
            followers: isFollowing ? prev.followers - 1 : prev.followers + 1
        }));

        try {
            if (prevFollowing) {
                await supabase.from('follows').delete().match({ follower_id: authUser.id, following_id: user.id });
            } else {
                await supabase.from('follows').insert({ follower_id: authUser.id, following_id: user.id });
            }
        } catch (err) {
            console.error("Follow action failed:", err);
            setIsFollowing(prevFollowing);
            setStats(prevStats);
        }
    };

    const handleSettingsClick = () => {
        if (onNavigate) {
            onNavigate(ViewState.SETTINGS);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-black">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-black">
                <p className="text-gray-500">User not found.</p>
            </div>
        );
    }

    const bgThemeStyle = { backgroundColor: user.themeColor || '#8b5cf6' };
    const textThemeStyle = { color: user.themeColor || '#8b5cf6' };

    return (
        <div className="h-full w-full overflow-y-auto bg-white dark:bg-black pb-20 relative font-sans">

            {/* --- MODALS --- */}
            {activeModal === 'edit_profile' && <EditProfileModal user={user} onClose={() => setActiveModal('none')} onSave={handleUpdateUser} />}
            {activeModal === 'share_profile' && <ProfileShareSheet user={user} onClose={() => setActiveModal('none')} onNavigate={onNavigate} />}
            {viewingPost && <PostViewer post={viewingPost} onClose={() => setViewingPost(null)} onUserClick={() => { }} />}

            {(activeModal === 'followers' || activeModal === 'following') && (
                <UserListModal
                    type={activeModal === 'followers' ? 'Followers' : 'Following'}
                    onClose={() => setActiveModal('none')}
                    onUserClick={(u) => { setActiveModal('none'); /* Navigate logic */ }}
                />
            )}

            {/* --- COVER IMAGE --- */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden group">
                <img
                    src={user.coverUrl || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1600&q=80"}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Top Action Bar */}
                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                    <button
                        onClick={handleSettingsClick}
                        className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition"
                    >
                        {isOwner ? <Settings className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* --- PROFILE HEADER --- */}
            <div className="px-4 relative -mt-16">

                {/* Avatar & Quick Actions Row */}
                <div className="flex items-end justify-between mb-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-black shadow-xl">
                            <img src={user.avatar || 'https://via.placeholder.com/150'} className="w-full h-full object-cover rounded-full" />
                        </div>
                        {isOwner && (
                            <button
                                onClick={() => setActiveModal('edit_profile')}
                                className="absolute bottom-2 right-2 bg-primary-500 text-white p-1.5 rounded-full shadow-md hover:bg-primary-600 transition"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 mb-2">
                        {isOwner ? (
                            <>
                                <button
                                    onClick={() => setActiveModal('edit_profile')}
                                    className="px-4 py-2 bg-white dark:bg-white/10 text-black dark:text-white rounded-xl font-bold text-sm hover:bg-gray-100 transition border border-gray-200 dark:border-transparent shadow-sm"
                                >
                                    Edit Profile
                                </button>
                                <button onClick={() => setActiveModal('share_profile')} className="p-2 bg-white dark:bg-white/10 rounded-xl border border-gray-200 dark:border-transparent shadow-sm">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`px-6 py-2 rounded-xl font-bold text-sm shadow-lg transition ${isFollowing ? 'bg-gray-200 text-gray-900' : 'text-white'}`}
                                    style={!isFollowing ? bgThemeStyle : {}}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="mb-6 animate-slide-up">
                    <div className="flex flex-col mb-3">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user.name}</h1>
                            {user.isVerified && <CheckCircle className="w-5 h-5" style={textThemeStyle} />}
                        </div>
                        <p className="text-gray-500 font-medium">{user.handle}</p>
                    </div>

                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-4 max-w-md">
                        {user.bio || "No bio yet."}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {user.location && (
                            <div className="flex items-center text-xs text-gray-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 mr-1" /> {user.location}
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="flex mt-6 justify-between max-w-sm border-t border-b border-gray-100 dark:border-white/5 py-4">
                        <div className="text-center cursor-pointer hover:opacity-70 transition">
                            <div className="text-xl font-black dark:text-white">{activeTab === 'saved' ? posts.length : posts.length}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Posts</div>
                        </div>
                        <div
                            className="text-center cursor-pointer hover:opacity-70 transition"
                            onClick={() => setActiveModal('followers')}
                        >
                            <div className="text-xl font-black dark:text-white">{stats.followers}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Followers</div>
                        </div>
                        <div
                            className="text-center cursor-pointer hover:opacity-70 transition"
                            onClick={() => setActiveModal('following')}
                        >
                            <div className="text-xl font-black dark:text-white">{stats.following}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Following</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT TABS --- */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
                <div className="flex justify-around">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 flex justify-center relative transition-colors ${activeTab === 'posts' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                    >
                        <Grid className={`w-6 h-6 ${activeTab === 'posts' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                        {activeTab === 'posts' && <div className="absolute bottom-0 w-12 h-0.5 bg-black dark:bg-white rounded-t-full"></div>}
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex-1 py-3 flex justify-center relative transition-colors ${activeTab === 'saved' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                        >
                            <Bookmark className={`w-6 h-6 ${activeTab === 'saved' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            {activeTab === 'saved' && <div className="absolute bottom-0 w-12 h-0.5 bg-black dark:bg-white rounded-t-full"></div>}
                        </button>
                    )}
                </div>
            </div>

            {/* --- GRID CONTENT --- */}
            <div className="min-h-[300px] animate-fade-in p-0.5 pb-24">
                {activeTab === 'posts' && (
                    posts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => setViewingPost(post)}
                                    className="relative aspect-square bg-gray-100 dark:bg-neutral-900 cursor-pointer group overflow-hidden"
                                >
                                    <img src={post.contentUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                    {post.type === 'video' && <div className="absolute top-2 right-2"><Play className="w-5 h-5 text-white drop-shadow-md fill-white" /></div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <ImageIcon className="w-12 h-12 mb-2 stroke-1" />
                            <p className="text-sm font-bold">No posts yet</p>
                        </div>
                    )
                )}

                {activeTab === 'saved' && (
                    posts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => setViewingPost(post)}
                                    className="relative aspect-square bg-gray-100 dark:bg-neutral-900 cursor-pointer group overflow-hidden"
                                >
                                    <img src={post.contentUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                    {post.type === 'video' && <div className="absolute top-2 right-2"><Play className="w-5 h-5 text-white drop-shadow-md fill-white" /></div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <Bookmark className="w-12 h-12 mb-2 stroke-1" />
                            <p className="text-sm font-bold">Nothing saved yet</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Profile;
