
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, UserPlus, Users, Share2, Smartphone, QrCode, Sparkles, UserMinus, Link as LinkIcon, Facebook, Twitter, Send as SendIcon, Loader2, AlertCircle, Check, MessageSquare, Mail } from 'lucide-react';
import { User, ViewState } from '../types';
import { useChat } from '../ChatContext';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

interface AddFriendsProps {
    onNavigate?: (view: ViewState) => void;
}

const AddFriends: React.FC<AddFriendsProps> = ({ onNavigate }) => {
    // Context
    const { startChat } = useChat();
    const { user: currentUser } = useAuth();

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
    const [followingState, setFollowingState] = useState<Record<string, boolean>>({});
    
    // Feature States
    const [showScanner, setShowScanner] = useState(false);
    const [showInviteOptions, setShowInviteOptions] = useState(false);
    const [toast, setToast] = useState<{msg: string, visible: boolean}>({ msg: '', visible: false });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // --- Actions ---

    const showToast = (msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast({ msg: '', visible: false }), 3000);
    };

    // Real Search Logic with Debounce
    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery.trim() || !currentUser) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            setErrorMsg(null);

            try {
                // Clean query (remove @ if present)
                const cleanQuery = searchQuery.replace('@', '');

                // 1. Search Profiles
                const { data: foundUsers, error } = await supabase
                    .from('profiles')
                    .select('id, username, name, avatar_url, bio, is_verified')
                    .or(`username.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%`)
                    .neq('id', currentUser.id) // Exclude self
                    .limit(20);

                if (error) {
                    // Check for table missing
                    if (error.code === '42P01' || error.message?.includes('Could not find the table')) {
                        console.warn('Profiles table missing, cannot search users.');
                        setSearchResults([]);
                        return;
                    }
                    throw error;
                }

                if (!foundUsers || foundUsers.length === 0) {
                    setSearchResults([]);
                    setIsSearching(false);
                    return;
                }

                // 2. Check Follow Status for these users
                // Wrap in try/catch to ignore if 'follows' table is missing
                try {
                    const foundIds = foundUsers.map(u => u.id);
                    const { data: follows } = await supabase
                        .from('follows')
                        .select('following_id')
                        .eq('follower_id', currentUser.id)
                        .in('following_id', foundIds);

                    // Update Follow State Map
                    const newFollowState: Record<string, boolean> = { ...followingState };
                    foundUsers.forEach(u => {
                        newFollowState[u.id] = follows?.some(f => f.following_id === u.id) || false;
                    });
                    setFollowingState(newFollowState);
                } catch (e) { /* Ignore follow check failure */ }

                // Map to User Type
                const mappedUsers: User[] = foundUsers.map((u: any) => ({
                    id: u.id,
                    name: u.name || 'Unknown',
                    handle: u.username ? `@${u.username}` : '@unknown',
                    avatar: u.avatar_url || 'https://via.placeholder.com/150',
                    bio: u.bio || '',
                    isVerified: u.is_verified || false
                }));

                setSearchResults(mappedUsers);

            } catch (err: any) {
                console.error("Search error:", err);
                setErrorMsg("Failed to search users. Please try again.");
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            if (searchQuery) performSearch();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, currentUser]);

    // Load initial recommendations (e.g., recent users or random)
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!currentUser) return;
            
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username, name, avatar_url, bio')
                    .neq('id', currentUser.id)
                    .limit(5); // Just fetch 5 random-ish users for "Suggested"

                if (error) throw error;

                if (data) {
                    const mapped: User[] = data.map((u: any) => ({
                        id: u.id,
                        name: u.name,
                        handle: `@${u.username}`,
                        avatar: u.avatar_url,
                        bio: u.bio
                    }));
                    setRecommendedUsers(mapped);
                }
            } catch (e) {
                // Ignore errors for recommendations
            }
        };
        fetchRecommendations();
    }, [currentUser]);

    // Follow / Unfollow Handler
    const handleFollowAction = async (targetUser: User, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!currentUser) return;

        const isFollowing = followingState[targetUser.id];
        
        // Optimistic Update
        setFollowingState(prev => ({ ...prev, [targetUser.id]: !isFollowing }));

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .match({ follower_id: currentUser.id, following_id: targetUser.id });
                
                if (error) throw error;
                showToast(`Unfollowed ${targetUser.name}`);
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({ follower_id: currentUser.id, following_id: targetUser.id });

                if (error) throw error;
                showToast(`Following ${targetUser.name}`);
            }
        } catch (err) {
            console.error("Follow action failed:", err);
            // Revert optimistic update
            setFollowingState(prev => ({ ...prev, [targetUser.id]: isFollowing }));
            showToast("Action failed. Check connection.");
        }
    };

    const handleSendMessage = (user: User) => {
        startChat(user.id);
        if (onNavigate) onNavigate(ViewState.MESSAGES);
    };

    // --- Invite Logic ---
    const inviteText = "Hey! Join me on VoxNet, the new social app universe.";
    const inviteUrl = "https://voxnet.social/invite"; // Real apps would use dynamic links

    const handleInvite = (platform: 'whatsapp' | 'email' | 'more') => {
        const encodedText = encodeURIComponent(inviteText + ' ' + inviteUrl);
        if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        else if (platform === 'email') window.location.href = `mailto:?subject=Join VoxNet&body=${encodedText}`;
        else setShowInviteOptions(true);
    };

    // --- Sub-Components ---

    const InviteOptionsModal = ({ onClose }: { onClose: () => void }) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}&bgcolor=ffffff`;
        const handleCopy = () => {
            navigator.clipboard.writeText(inviteUrl);
            showToast('Invite link copied!');
        };
        return (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg dark:text-white">Share Invite</h3>
                        <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <div className="flex justify-center mb-6">
                        <div className="p-2 bg-white rounded-xl shadow-lg border border-gray-100"><img src={qrUrl} alt="Invite QR" className="w-32 h-32 rounded-lg" /></div>
                    </div>
                    <div className="flex items-center bg-gray-100 dark:bg-neutral-800 p-3 rounded-xl mb-6">
                        <LinkIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <input type="text" value={inviteUrl} readOnly className="bg-transparent flex-1 text-sm text-gray-600 dark:text-gray-300 outline-none" />
                        <button onClick={handleCopy} className="text-primary-600 font-bold text-xs bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition">Copy</button>
                    </div>
                </div>
            </div>
        );
    };

    const ScannerModal = () => (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
            <button onClick={() => setShowScanner(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"><X className="w-8 h-8 text-white" /></button>
            <div className="relative w-64 h-64 border-2 border-primary-500 rounded-3xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                <div className="absolute inset-0 bg-primary-500/20 animate-pulse"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-[spin_2s_linear_infinite_reverse]" style={{ animation: 'scan 2s linear infinite' }}></div>
            </div>
            <p className="text-white mt-8 font-medium">Point camera at a VoxNet QR Code</p>
            <style>{`@keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
        </div>
    );

    const UserCard: React.FC<{ user: User, layout?: 'horizontal' | 'vertical' }> = ({ user, layout = 'horizontal' }) => {
        const isFollowing = followingState[user.id] || false;
        
        if (layout === 'vertical') {
            return (
                <div 
                    className="min-w-[150px] bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition cursor-pointer relative group animate-fade-in"
                >
                    <div className="relative mb-3">
                         <img src={user.avatar} className="w-16 h-16 rounded-full object-cover" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate w-full">{user.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 truncate w-full">{user.handle}</p>
                    <button 
                        onClick={(e) => handleFollowAction(user, e)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${!isFollowing ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400' : 'bg-gray-100 text-gray-400 dark:bg-white/5'}`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            )
        }

        return (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 transition rounded-xl animate-slide-up">
                <div className="flex items-center space-x-3 cursor-pointer">
                    <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</h4>
                        <div className="flex items-center space-x-1">
                            <p className="text-xs text-gray-500">{user.handle}</p>
                            {user.isVerified && <div className="bg-blue-500 text-white rounded-full p-[1px]"><Check className="w-2 h-2" strokeWidth={3} /></div>}
                        </div>
                        {user.bio && <p className="text-[10px] text-gray-400 truncate w-40 mt-0.5">{user.bio}</p>}
                    </div>
                </div>
                <button 
                    onClick={(e) => handleFollowAction(user, e)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                        !isFollowing 
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20' 
                        : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300'
                    }`}
                >
                    {!isFollowing && <UserPlus className="w-4 h-4 mr-1" />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
            </div>
        );
    };

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-black overflow-y-auto">
            {showScanner && <ScannerModal />}
            {showInviteOptions && <InviteOptionsModal onClose={() => setShowInviteOptions(false)} />}
            
            {/* Toast Notification */}
            <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md transition-all duration-300 z-50 pointer-events-none ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                {toast.msg}
            </div>

            {/* Sticky Search Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search name, username or @handle..." 
                        className="w-full bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white rounded-xl py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching ? (
                        <div className="absolute right-3 top-3"><Loader2 className="w-5 h-5 text-primary-500 animate-spin" /></div>
                    ) : searchQuery ? (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    ) : (
                        <QrCode onClick={() => setShowScanner(true)} className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer hover:text-primary-500 transition" />
                    )}
                </div>
            </div>

            {/* Search Results View */}
            {searchQuery ? (
                <div className="p-4 space-y-2 min-h-screen bg-white dark:bg-black">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Search Results</h3>
                    
                    {errorMsg && (
                        <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
                        </div>
                    )}

                    {searchResults.length > 0 ? (
                        searchResults.map(user => <UserCard key={user.id} user={user} />)
                    ) : !isSearching && (
                        <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">No users found</h3>
                            <p className="text-sm text-gray-500 max-w-xs mt-2">Try checking the spelling or search by full username.</p>
                        </div>
                    )}
                </div>
            ) : (
                // Default View (Suggestions)
                <div className="pb-20">
                    {/* Suggestions Carousel */}
                    {recommendedUsers.length > 0 && (
                        <div className="p-4 border-b border-gray-100 dark:border-white/5">
                             <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center space-x-2">
                                     <Sparkles className="w-4 h-4 text-yellow-500" />
                                     <h3 className="font-bold text-gray-900 dark:text-white text-sm">Suggested for You</h3>
                                 </div>
                             </div>
                             <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                                 {recommendedUsers.map(user => (
                                     <div key={user.id}>
                                         <UserCard user={user} layout="vertical" />
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    {/* Invite Links */}
                    <div className="p-4 mt-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 text-center">Invite Friends to VoxNet</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleInvite('whatsapp')} className="flex flex-col items-center justify-center p-3 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition transform hover:scale-105">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2"><MessageSquare className="w-5 h-5 text-green-600" /></div>
                                <span className="text-xs font-medium dark:text-white">WhatsApp</span>
                            </button>
                            <button onClick={() => handleInvite('email')} className="flex flex-col items-center justify-center p-3 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition transform hover:scale-105">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2"><Mail className="w-5 h-5 text-blue-600" /></div>
                                <span className="text-xs font-medium dark:text-white">Email</span>
                            </button>
                            <button onClick={() => handleInvite('more')} className="flex flex-col items-center justify-center p-3 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 transition transform hover:scale-105">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2"><Share2 className="w-5 h-5 text-purple-600" /></div>
                                <span className="text-xs font-medium dark:text-white">More</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFriends;
