
import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, MoreHorizontal, Trash2, Smile, MessageCircle, ChevronDown, Check, Loader2 } from 'lucide-react';
import { User, Comment, Post } from '../types';
import { USERS, CURRENT_USER } from '../constants';
import { useContent } from '../ContentContext';

// --- Types & Constants ---

interface CommentsModalProps {
    post: Post | any;
    onClose: () => void;
}

const EMOJI_CATEGORIES = {
    '😀 Emotions': ['😀', '😂', '😍', '😎', '😭', '😡', '🤯', '🥳', '🤔', '🥶', '🤗', '🙄'],
    '❤️ Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞'],
    '🔥 Popular': ['🔥', '✨', '💯', '🚀', '👀', '🙌', '👏', '💪', '👑', '💎', '🌈', '⚡'],
    '👍 Hand': ['👍', '👎', '👊', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '👋'],
    '🎉 Party': ['🎉', '🎊', '🎈', '🎁', '🎂', '🥂', '🍾', '🍻', '🍰', '🧁', '🍬'],
    '🐶 Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
};

// --- Sub-Components ---

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
    const [category, setCategory] = useState('😀 Emotions');
    
    return (
        <div className="bg-gray-100 dark:bg-neutral-800 rounded-xl overflow-hidden mt-2 animate-slide-up">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                {Object.keys(EMOJI_CATEGORIES).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${
                            category === cat 
                            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/10' 
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Grid */}
            <div className="p-2 grid grid-cols-8 gap-1 h-32 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-black/20">
                {(EMOJI_CATEGORIES as any)[category].map((emoji: string) => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className="text-xl hover:bg-white dark:hover:bg-neutral-700 rounded-lg p-1 transition-transform active:scale-90"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CommentInput = ({ 
    placeholder, 
    value, 
    onChange, 
    onSubmit, 
    isSubmitting, 
    autoFocus = false,
    onCancel
}: { 
    placeholder: string, 
    value: string, 
    onChange: (val: string) => void, 
    onSubmit: () => void, 
    isSubmitting: boolean,
    autoFocus?: boolean,
    onCancel?: () => void
}) => {
    const [showEmojis, setShowEmojis] = useState(false);

    return (
        <div className="flex flex-col w-full animate-fade-in">
            <div className="flex items-end space-x-2 bg-gray-100 dark:bg-neutral-800 rounded-2xl px-3 py-2 border border-transparent focus-within:border-primary-500 transition-all">
                <img src={CURRENT_USER.avatar} className="w-8 h-8 rounded-full object-cover mb-1 border border-gray-200 dark:border-neutral-700" />
                
                <div className="flex-1 flex flex-col">
                    <textarea 
                        placeholder={placeholder}
                        className="w-full bg-transparent text-sm outline-none dark:text-white placeholder-gray-500 resize-none max-h-24 min-h-[40px] py-2"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit();
                            }
                        }}
                        autoFocus={autoFocus}
                        rows={1}
                    />
                </div>

                <div className="flex items-center space-x-1 pb-1">
                    <button 
                        onClick={() => setShowEmojis(!showEmojis)}
                        className={`p-2 rounded-full transition-colors ${showEmojis ? 'text-primary-500 bg-primary-100 dark:bg-primary-900/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    <button 
                        disabled={!value.trim() || isSubmitting}
                        onClick={onSubmit}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            value.trim() && !isSubmitting
                            ? 'bg-primary-600 text-white shadow-lg hover:scale-105' 
                            : 'bg-gray-200 dark:bg-neutral-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 ml-0.5" />
                        )}
                    </button>
                </div>
            </div>
            
            {showEmojis && <EmojiPicker onSelect={(emoji) => onChange(value + emoji)} />}
            
            {onCancel && (
                <div className="flex justify-end mt-1 mr-2">
                    <button onClick={onCancel} className="text-xs font-bold text-gray-500 hover:text-red-500">Cancel Reply</button>
                </div>
            )}
        </div>
    );
};

interface CommentThreadProps { 
    comment: Comment; 
    depth: number; 
    activeReplyId: string | null; 
    onReplyClick: (id: string) => void; 
    onDelete: (id: string) => void;
    onSubmitReply: (parentId: string, text: string) => void;
}

// Recursive Comment Component
const CommentThread: React.FC<CommentThreadProps> = ({ 
    comment, 
    depth = 0, 
    activeReplyId, 
    onReplyClick, 
    onDelete, 
    onSubmitReply 
}) => {
    const author = USERS.find(u => u.id === comment.userId) || CURRENT_USER;
    const isOwner = comment.userId === CURRENT_USER.id;
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(comment.likes);
    const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand top levels
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        if (navigator.vibrate) navigator.vibrate(5);
    };

    const handleSubmit = () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        // Simulate loading
        setTimeout(() => {
            onSubmitReply(comment.id, replyText);
            setReplyText('');
            setIsSubmitting(false);
            onReplyClick(''); // Close input
            setIsExpanded(true); // Ensure replies are visible
        }, 600);
    };

    return (
        <div className={`flex flex-col ${depth > 0 ? 'mt-4' : 'mt-6'} group`}>
            <div className="flex space-x-3">
                <img 
                    src={author.avatar} 
                    className={`rounded-full object-cover border border-gray-100 dark:border-white/10 ${depth > 0 ? 'w-6 h-6' : 'w-8 h-8'}`} 
                />
                
                <div className="flex-1">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{author.handle}</span>
                        <span className="text-xs text-gray-400">{comment.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5 whitespace-pre-wrap">
                        {comment.text}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center space-x-4 mt-2">
                        <button onClick={toggleLike} className={`text-xs font-bold flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                            {isLiked ? 'Liked' : 'Like'}
                            {likesCount > 0 && <span>({likesCount})</span>}
                        </button>
                        
                        <button 
                            onClick={() => onReplyClick(activeReplyId === comment.id ? '' : comment.id)}
                            className={`text-xs font-bold transition-colors ${activeReplyId === comment.id ? 'text-primary-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                        >
                            Reply
                        </button>

                        {isOwner && (
                            <button 
                                onClick={() => onDelete(comment.id)} 
                                className="text-xs font-bold text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Inline Reply Input */}
                    {activeReplyId === comment.id && (
                        <div className="mt-3">
                            <CommentInput 
                                placeholder={`Replying to @${author.handle}...`}
                                value={replyText}
                                onChange={setReplyText}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                autoFocus={true}
                                onCancel={() => onReplyClick('')}
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center pt-1">
                    <button onClick={toggleLike} className="transition-transform active:scale-75">
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-600'}`} />
                    </button>
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="pl-9 relative">
                    {/* Visual Thread Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-neutral-800 rounded-full" />
                    
                    {isExpanded ? (
                        <div className="space-y-0">
                            {comment.replies.map(reply => (
                                <CommentThread 
                                    key={reply.id} 
                                    comment={reply} 
                                    depth={depth + 1} 
                                    activeReplyId={activeReplyId}
                                    onReplyClick={onReplyClick}
                                    onDelete={onDelete}
                                    onSubmitReply={onSubmitReply}
                                />
                            ))}
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsExpanded(true)}
                            className="mt-3 flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-primary-500 transition-colors pl-4"
                        >
                            <div className="w-8 h-0.5 bg-gray-300 dark:bg-neutral-700 mr-2"></div>
                            View {comment.replies.length} more replies
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Modal Component ---

const CommentsModal: React.FC<CommentsModalProps> = ({ post, onClose }) => {
    const { updatePostComments } = useContent(); // Access context
    const [comments, setComments] = useState<Comment[]>([]);
    const [mainCommentText, setMainCommentText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // Controls which comment shows input
    const [isSubmittingMain, setIsSubmittingMain] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with data from prop
    useEffect(() => {
        setComments(post.comments || []);
    }, [post]);

    // Save changes to Global Context whenever local comments state changes
    useEffect(() => {
        if (comments !== post.comments) {
            updatePostComments(post.id, comments);
        }
    }, [comments]);

    // Recursive function to add a reply to the correct parent in the tree
    const addReplyToTree = (nodes: Comment[], parentId: string, newReply: Comment): Comment[] => {
        return nodes.map(node => {
            if (node.id === parentId) {
                return {
                    ...node,
                    replies: [...(node.replies || []), newReply]
                };
            } else if (node.replies && node.replies.length > 0) {
                return {
                    ...node,
                    replies: addReplyToTree(node.replies, parentId, newReply)
                };
            }
            return node;
        });
    };

    // Recursive function to remove a comment
    const removeCommentFromTree = (nodes: Comment[], idToDelete: string): Comment[] => {
        return nodes.filter(node => node.id !== idToDelete).map(node => {
            if (node.replies && node.replies.length > 0) {
                return {
                    ...node,
                    replies: removeCommentFromTree(node.replies, idToDelete)
                };
            }
            return node;
        });
    };

    const handlePostMainComment = () => {
        if (!mainCommentText.trim()) return;
        setIsSubmittingMain(true);

        setTimeout(() => {
            const newComment: Comment = {
                id: `c_${Date.now()}`,
                userId: CURRENT_USER.id,
                text: mainCommentText,
                timestamp: 'Just now',
                likes: 0,
                replies: []
            };
            
            setComments(prev => {
                const updated = [...prev, newComment];
                return updated;
            });
            
            setMainCommentText('');
            setIsSubmittingMain(false);
            
            // Scroll to bottom
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            if (navigator.vibrate) navigator.vibrate(10);
        }, 600);
    };

    const handleReplySubmit = (parentId: string, text: string) => {
        const newReply: Comment = {
            id: `r_${Date.now()}`,
            userId: CURRENT_USER.id,
            parentId: parentId,
            text: text,
            timestamp: 'Just now',
            likes: 0,
            replies: []
        };

        setComments(prev => addReplyToTree(prev, parentId, newReply));
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this comment?")) {
            setComments(prev => removeCommentFromTree(prev, id));
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Content */}
            <div className="relative w-full md:w-[500px] h-[85vh] md:h-[700px] bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur z-10 sticky top-0">
                    <div className="w-8" />
                    <div className="flex flex-col items-center">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Comments</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Comment List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Context (Original Post Caption) */}
                    {post.caption && (
                        <div className="flex space-x-3 pb-6 border-b border-gray-100 dark:border-white/5 mb-2">
                            <img src={USERS.find(u => u.id === post.userId)?.avatar} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1">
                                <span className="text-sm font-bold text-gray-900 dark:text-white mr-2">
                                    {USERS.find(u => u.id === post.userId)?.handle}
                                </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {post.caption}
                                </span>
                                <div className="mt-1 text-xs text-gray-400">{post.timestamp}</div>
                            </div>
                        </div>
                    )}

                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center opacity-50">
                            <MessageCircle className="w-12 h-12 mb-3 stroke-1" />
                            <p className="text-sm">No comments yet.</p>
                            <p className="text-xs">Be the first to start the conversation.</p>
                        </div>
                    ) : (
                        <div className="pb-4">
                            {comments.map(comment => (
                                <CommentThread 
                                    key={comment.id}
                                    comment={comment}
                                    depth={0}
                                    activeReplyId={activeReplyId}
                                    onReplyClick={setActiveReplyId}
                                    onDelete={handleDelete}
                                    onSubmitReply={handleReplySubmit}
                                />
                            ))}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Main Footer Input (For top-level comments) */}
                <div className="p-3 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 pb-safe md:pb-3 z-20">
                    <CommentInput 
                        placeholder={`Add a comment as ${CURRENT_USER.handle}...`}
                        value={mainCommentText}
                        onChange={setMainCommentText}
                        onSubmit={handlePostMainComment}
                        isSubmitting={isSubmittingMain}
                        onCancel={undefined}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommentsModal;
