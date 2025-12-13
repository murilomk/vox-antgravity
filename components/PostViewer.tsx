
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause, Music2, Share2, MapPin, Check } from 'lucide-react';
import { Post, User, Comment } from '../types';
import { USERS, CURRENT_USER } from '../constants';
import { useContent } from '../ContentContext';
import CommentsModal from './CommentsModal';

interface PostViewerProps {
    post: Post;
    onClose: () => void;
    onUserClick: (user: User) => void;
}

const PostViewer: React.FC<PostViewerProps> = ({ post, onClose, onUserClick }) => {
    // --- Context ---
    const { toggleLikePost, toggleSavePost } = useContent();

    // --- State ---
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [isSaved, setIsSaved] = useState(post.isSaved);
    
    const [isPlaying, setIsPlaying] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    
    // User data from post.author or fallback
    const authorData = post.author || {
        name: 'Unknown User',
        handle: '@unknown',
        avatar: 'https://via.placeholder.com/150',
        isVerified: false
    };

    const user: User = {
        id: post.userId,
        ...authorData,
        bio: '',
        followers: 0,
        following: 0,
        postsCount: 0
    };

    const isVideo = post.type === 'video';
    const videoRef = useRef<HTMLVideoElement>(null);

    // Sync state if prop changes
    useEffect(() => {
        setIsLiked(post.isLiked);
        setLikesCount(post.likes);
        setIsSaved(post.isSaved);
    }, [post]);

    // Auto-play video on mount
    useEffect(() => {
        if (isVideo && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay failed", e));
        }
    }, [isVideo]);

    const handleLike = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        // Optimistic UI
        if (isLiked) {
            setLikesCount(prev => prev - 1);
            setIsLiked(false);
        } else {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
            triggerHeartAnimation();
        }
        // Actual Context Update
        toggleLikePost(post.id);
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toggleSavePost(post.id);
    };

    const triggerHeartAnimation = () => {
        setShowHeartAnimation(true);
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setShowHeartAnimation(false), 800);
    };

    const handleDoubleTap = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLiked) {
            handleLike();
        } else {
            triggerHeartAnimation();
        }
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isVideo && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex justify-center items-center animate-fade-in">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Comments Modal Overlay */}
            {showComments && (
                <CommentsModal post={post} onClose={() => setShowComments(false)} />
            )}

            <div className="flex w-full h-full md:max-w-6xl md:max-h-[85vh] bg-black md:bg-neutral-900 md:rounded-2xl overflow-hidden shadow-2xl">
                
                {/* Media Section */}
                <div 
                    className="flex-1 bg-black flex items-center justify-center relative group cursor-pointer"
                    onDoubleClick={handleDoubleTap}
                    onClick={togglePlay}
                >
                    {isVideo ? (
                        <>
                            <video 
                                ref={videoRef}
                                src={post.contentUrl} 
                                className="max-w-full max-h-full object-contain" 
                                loop 
                                playsInline
                            />
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Play className="w-16 h-16 text-white/80 fill-white" />
                                </div>
                            )}
                        </>
                    ) : (
                        <img src={post.contentUrl} className="max-w-full max-h-full object-contain" />
                    )}

                    {/* Double Tap Heart Animation */}
                    {showHeartAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl animate-scale-up" />
                        </div>
                    )}
                </div>

                {/* Details Section (Sidebar on Desktop) */}
                <div className="hidden md:flex w-[400px] flex-col bg-white dark:bg-neutral-900 border-l border-gray-100 dark:border-white/10">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { onClose(); onUserClick(user); }}>
                            <div className="relative">
                                <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10" />
                                {user.isVerified && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5"><Check className="w-2 h-2" strokeWidth={3} /></div>}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm dark:text-white hover:underline">{user.name}</h4>
                                {post.location && (
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> {post.location}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    {/* Content & Comments */}
                    <div className="flex-1 overflow-y-auto relative">
                        {/* Caption */}
                        <div className="p-4 pb-2">
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                <span className="font-bold mr-2">{user.handle}</span>
                                {post.caption}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 uppercase">{post.timestamp}</p>
                        </div>

                        {/* Comments Preview */}
                        <div className="p-4 border-t border-gray-100 dark:border-white/5">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Comments</h4>
                            {post.comments && post.comments.length > 0 ? (
                                <div className="space-y-4">
                                    {post.comments.map(comment => (
                                        <div key={comment.id} className="flex space-x-3">
                                            {/* Note: Comment author lookup still depends on USERS, ideally should join as well */}
                                            <img src={USERS.find(u => u.id === comment.userId)?.avatar || 'https://via.placeholder.com/30'} className="w-8 h-8 rounded-full" />
                                            <div>
                                                <div className="bg-gray-50 dark:bg-neutral-800 rounded-2xl px-3 py-2">
                                                    <span className="font-bold text-xs dark:text-white mr-2">{USERS.find(u => u.id === comment.userId)?.handle || 'User'}</span>
                                                    <span className="text-xs dark:text-gray-300">{comment.text}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No comments yet. Be the first!</p>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-neutral-900 z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                                <button onClick={handleLike} className="group transition-transform active:scale-125">
                                    <Heart className={`w-7 h-7 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900 dark:text-white group-hover:text-gray-500'}`} />
                                </button>
                                <button onClick={() => setShowComments(true)} className="group transition-transform active:scale-125">
                                    <MessageCircle className="w-7 h-7 text-gray-900 dark:text-white group-hover:text-gray-500 -rotate-90" />
                                </button>
                                <button className="group transition-transform active:scale-125">
                                    <Share2 className="w-7 h-7 text-gray-900 dark:text-white group-hover:text-gray-500" />
                                </button>
                            </div>
                            <button onClick={handleSave} className="transition-transform active:scale-125">
                                <Bookmark className={`w-7 h-7 ${isSaved ? 'fill-black dark:fill-white' : 'text-gray-900 dark:text-white'}`} />
                            </button>
                        </div>
                        <div className="font-bold text-sm dark:text-white mb-1">{likesCount.toLocaleString()} likes</div>
                    </div>
                </div>
            </div>
            
            {/* Mobile Footer Overlay */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pb-8 text-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        <button onClick={handleLike}><Heart className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} /></button>
                        <button onClick={() => setShowComments(true)}><MessageCircle className="w-8 h-8 -rotate-90" /></button>
                        <button><Share2 className="w-8 h-8" /></button>
                    </div>
                    <button onClick={handleSave}><Bookmark className={`w-8 h-8 ${isSaved ? 'fill-white' : ''}`} /></button>
                </div>
                <p className="font-bold text-sm">{likesCount.toLocaleString()} Likes</p>
                <p className="text-sm mt-1 line-clamp-2"><span className="font-bold mr-2">{user.handle}</span>{post.caption}</p>
            </div>
        </div>
    );
};

export default PostViewer;
