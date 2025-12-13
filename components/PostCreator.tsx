
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, MapPin, Smile, Send, Loader2, Trash2 } from 'lucide-react';
import { Post } from '../types';
import { CURRENT_USER } from '../constants';

interface PostCreatorProps {
    onClose: () => void;
    onPost: (post: Post) => void;
    onUpdate?: (post: Post) => void; // New prop for editing
    initialMediaType?: 'image' | 'video' | null;
    postToEdit?: Post; // Data to pre-fill
}

const EMOJIS = ['😀', '😂', '😍', '😎', '🔥', '❤️', '🎉', '👍', '🤔', '😭', '🤯', '🚀', '👀', '💯', '✨', '🍕', '🍻', '🌴', '⚽️', '🎵', '🐶', '🐱', '🎓', '💼', '✈️', '🗺️', '🏡', '🏋️', '🧘', '🍔'];

const PostCreator: React.FC<PostCreatorProps> = ({ onClose, onPost, onUpdate, initialMediaType, postToEdit }) => {
    const [caption, setCaption] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(initialMediaType || null);
    const [isPosting, setIsPosting] = useState(false);
    
    // Feature State
    const [location, setLocation] = useState('');
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize state if editing
    useEffect(() => {
        if (postToEdit) {
            setCaption(postToEdit.caption);
            setLocation(postToEdit.location || '');
            if (postToEdit.contentUrl) {
                setMediaPreview(postToEdit.contentUrl);
                setMediaType(postToEdit.type);
            }
        }
    }, [postToEdit]);

    // Auto-open file picker if type passed AND not editing
    useEffect(() => {
        if (initialMediaType && !postToEdit && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [initialMediaType, postToEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            const url = URL.createObjectURL(file);
            setMediaPreview(url);
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleLocation = () => {
        setShowLocationInput(!showLocationInput);
        setShowEmojiPicker(false);
    };

    const toggleEmoji = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowLocationInput(false);
    };

    const addEmoji = (emoji: string) => {
        setCaption(prev => prev + emoji);
    };

    const handleSubmit = () => {
        // If creating: need caption OR media. If editing: allow keeping existing media.
        const hasMedia = mediaFile || mediaPreview;
        if (!caption && !hasMedia) return;

        setIsPosting(true);

        // Simulate Network Request
        setTimeout(() => {
            if (postToEdit && onUpdate) {
                // Handle Update
                const updatedPost: Post = {
                    ...postToEdit,
                    caption: caption,
                    location: location || undefined,
                    // If a new file was selected, use the new preview (in real app, upload new file)
                    // If no new file, keep existing contentUrl
                    contentUrl: mediaFile ? mediaPreview! : postToEdit.contentUrl,
                    type: mediaType || postToEdit.type
                };
                onUpdate(updatedPost);
            } else {
                // Handle Create
                const newPost: Post = {
                    id: `post_${Date.now()}`,
                    userId: CURRENT_USER.id,
                    type: mediaType || 'text',
                    contentUrl: mediaPreview || undefined, 
                    caption: caption,
                    location: location || undefined,
                    likes: 0,
                    comments: [],
                    timestamp: 'Just now',
                    isLiked: false,
                    isSaved: false,
                    views: 0,
                    shares: 0,
                    engagementRate: 0
                };
                onPost(newPost);
            }

            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative w-full md:w-[600px] bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                    <h3 className="font-bold text-lg dark:text-white">
                        {postToEdit ? 'Edit Post' : 'Create Post'}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition">
                        <X className="w-5 h-5 dark:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 relative">
                    <div className="flex space-x-3 mb-4">
                        <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-sm dark:text-white">{CURRENT_USER.name}</p>
                            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md w-fit mt-1">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">Public</span>
                            </div>
                        </div>
                    </div>

                    <textarea 
                        placeholder={`What's on your mind, ${CURRENT_USER.name.split(' ')[0]}?`}
                        className="w-full bg-transparent outline-none text-lg dark:text-white placeholder-gray-400 min-h-[100px] resize-none"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        autoFocus={!initialMediaType && !postToEdit}
                    />

                    {/* Active Location Display */}
                    {location && !showLocationInput && (
                        <div className="flex items-center space-x-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20 w-fit px-3 py-1 rounded-lg mb-4 text-sm font-medium">
                            <MapPin className="w-4 h-4" />
                            <span>{location}</span>
                            <button onClick={() => setLocation('')} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                        </div>
                    )}

                    {/* Media Preview */}
                    {mediaPreview && (
                        <div className="relative mt-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 group">
                            {!postToEdit && ( // Only allow removing media if creating new post, to simplify edit logic
                                <button 
                                    onClick={clearMedia}
                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-red-500 transition z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} controls className="w-full max-h-[300px] object-contain" />
                            ) : (
                                <img src={mediaPreview} className="w-full max-h-[300px] object-contain" />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Tools Area */}
                <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                    
                    {/* Expandable Tools */}
                    {showLocationInput && (
                        <div className="p-4 pb-0 animate-fade-in">
                            <div className="flex items-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2">
                                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Where are you?" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-sm dark:text-white"
                                    autoFocus
                                />
                                <button onClick={() => setShowLocationInput(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex space-x-2 mt-2 overflow-x-auto no-scrollbar">
                                {['San Francisco, CA', 'New York, NY', 'London, UK', 'Tokyo, JP'].map(loc => (
                                    <button 
                                        key={loc} 
                                        onClick={() => { setLocation(loc); setShowLocationInput(false); }}
                                        className="px-3 py-1 bg-white dark:bg-neutral-800 rounded-lg text-xs border border-gray-200 dark:border-neutral-700 whitespace-nowrap dark:text-gray-300 hover:border-primary-500"
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showEmojiPicker && (
                        <div className="p-4 pb-0 animate-fade-in">
                            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto no-scrollbar">
                                {EMOJIS.map(emoji => (
                                    <button 
                                        key={emoji} 
                                        onClick={() => addEmoji(emoji)}
                                        className="text-2xl hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg p-1 transition"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions Bar */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                                {postToEdit ? 'Edit details' : 'Add to your post'}
                            </span>
                            <div className="flex space-x-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition relative group">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition relative group">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button onClick={toggleLocation} className={`p-2 rounded-full transition relative group ${showLocationInput || location ? 'text-white bg-red-500' : 'text-red-500 hover:bg-red-500/10'}`}>
                                    <MapPin className="w-5 h-5" />
                                </button>
                                <button onClick={toggleEmoji} className={`p-2 rounded-full transition relative group ${showEmojiPicker ? 'text-white bg-yellow-500' : 'text-yellow-500 hover:bg-yellow-500/10'}`}>
                                    <Smile className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                        />

                        <button 
                            onClick={handleSubmit}
                            disabled={(!caption && !mediaFile && !mediaPreview) || isPosting}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                                (caption || mediaFile || mediaPreview) && !isPosting
                                ? 'bg-primary-600 text-white shadow-lg hover:bg-primary-700' 
                                : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            <span>{isPosting ? 'Saving...' : (postToEdit ? 'Update Post' : 'Post')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCreator;
