
import React, { useState, useEffect, useRef } from 'react';
import { User, Story, Post as PostType, ViewState } from '../types';
import { 
    Plus, MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, MapPin, Send, X, 
    Camera, Radio, Video, Image as ImageIcon, Sparkles, Play, VolumeX, ChevronRight, Check
} from 'lucide-react';
import { USERS } from '../constants'; 
import { useLanguage } from '../LanguageContext';
import { useContent } from '../ContentContext';
import ActionMenu, { MenuContextType } from '../components/ActionMenu';
import StoryCreator from './StoryCreator';
import StoryViewer from './StoryViewer';
import CommentsModal from '../components/CommentsModal'; 
import ShareModal from '../components/ShareModal';       
import PostCreator from '../components/PostCreator'; 

interface FeedProps {
  currentUser: User;
  onNavigate: (view: ViewState) => void;
  onUserClick: (user: User) => void;
}

// --- COMPONENTS ---

const StoryCircle: React.FC<{ story?: Story, isUser?: boolean, onClick?: () => void, label?: string }> = ({ story, isUser = false, onClick, label }) => {
  const user = USERS.find(u => u.id === story?.userId); 
  const ringColor = story?.isCloseFriends ? 'from-green-400 to-emerald-600' : 'from-yellow-400 via-red-500 to-purple-600';
  const viewedClass = story?.isViewed ? 'grayscale opacity-60' : '';
  
  return (
    <div className="flex flex-col items-center space-y-1 cursor-pointer group relative" onClick={onClick}>
      <div className={`p-[3px] rounded-full transition-transform duration-300 group-hover:scale-105 ${isUser ? 'border-2 border-dashed border-gray-300 dark:border-neutral-600' : `bg-gradient-to-tr ${ringColor}`} `}>
        <div className="p-[2px] bg-white dark:bg-black rounded-full">
            <div className={`w-16 h-16 rounded-full overflow-hidden relative bg-gray-100 dark:bg-neutral-800 ${isUser ? '' : viewedClass}`}>
                {isUser ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-gray-500">
                        <Plus className="w-6 h-6 text-primary-500" />
                    </div>
                ) : (
                    <img src={story?.imageUrl} alt="story" className="w-full h-full object-cover" />
                )}
            </div>
        </div>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate w-16 text-center">{isUser ? label : (user?.name?.split(' ')[0] || 'User')}</span>
      {isUser && <div className="absolute bottom-6 right-0 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-black"><Plus className="w-3 h-3 text-white" /></div>}
    </div>
  );
};

const CreatePostBar: React.FC<{ user: User, onClick: (type?: 'image' | 'video' | 'event') => void }> = ({ user, onClick }) => (
    <div className="bg-white dark:bg-black p-4 border-b border-gray-100 dark:border-neutral-900 md:rounded-3xl md:mb-6 md:border-0 shadow-sm animate-fade-in">
        <div className="flex items-center space-x-3 mb-4">
            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-neutral-800" />
            <div 
                onClick={() => onClick()}
                className="flex-1 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 transition cursor-pointer rounded-full px-4 py-2.5"
            >
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">What's on your mind?</span>
            </div>
        </div>
        <div className="flex justify-between items-center px-2">
            <button onClick={() => onClick('image')} className="flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900 p-2 rounded-lg transition flex-1 justify-center">
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span>Photo</span>
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-neutral-800"></div>
            <button onClick={() => onClick('video')} className="flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900 p-2 rounded-lg transition flex-1 justify-center">
                <Video className="w-5 h-5 text-blue-500" />
                <span>Video</span>
            </button>
        </div>
    </div>
);

const PostCard: React.FC<{ 
    post: PostType, 
    currentUser: User, 
    onMenuClick: (post: PostType) => void,
    onMapClick: (location: string) => void,
    onCommentClick: (post: PostType) => void,
    onShareClick: (post: PostType) => void,
    onUserClick: (user: User) => void
}> = ({ post, currentUser, onMenuClick, onMapClick, onCommentClick, onShareClick, onUserClick }) => {
  const { t } = useLanguage();
  const { toggleLikePost, toggleSavePost } = useContent();
  
  const [showHeart, setShowHeart] = useState(false);
  
  // Use author data if available, fallback to basic user construction
  const authorData = post.author || {
      name: 'Unknown User',
      handle: '@unknown',
      avatar: 'https://via.placeholder.com/150',
      isVerified: false
  };

  // Construct a user object compatible with onUserClick
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
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLike = () => {
    toggleLikePost(post.id);
    if (!post.isLiked) {
        triggerHeartAnimation();
    }
  };

  const handleSave = () => {
      toggleSavePost(post.id);
  }

  const triggerHeartAnimation = () => {
      setShowHeart(true);
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => setShowHeart(false), 800);
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!post.isLiked) {
          handleLike();
      } else {
          triggerHeartAnimation();
      }
  };

  const toggleVideo = () => {
      if (videoRef.current) {
          if (isPlaying) videoRef.current.pause();
          else videoRef.current.play();
          setIsPlaying(!isPlaying);
      }
  };

  return (
    <div className="bg-white dark:bg-black md:rounded-3xl shadow-sm md:shadow-none border-b border-gray-100 dark:border-neutral-900 mb-2 md:mb-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onUserClick(user)}>
          <div className="relative">
            <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full border border-gray-100 dark:border-neutral-800" />
            {user?.isVerified && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white dark:border-black"><Radio className="w-2 h-2" /></div>}
          </div>
          <div>
            <div className="flex items-center space-x-1">
                <h3 className="font-bold text-sm dark:text-white hover:underline">{user?.name}</h3>
                {user?.isVerified && <span className="text-blue-500"><Sparkles className="w-3 h-3 fill-blue-500" /></span>}
            </div>
            {post.location && (
                <div onClick={(e) => { e.stopPropagation(); onMapClick(post.location || '')}} className="text-xs text-gray-500 dark:text-gray-400 flex items-center hover:text-primary-500 transition cursor-pointer">
                    {post.location} <ChevronRight className="w-3 h-3" />
                </div>
            )}
          </div>
        </div>
        <button onClick={() => onMenuClick(post)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {post.contentUrl ? (
          <div className="relative w-full aspect-square md:aspect-[4/5] bg-gray-100 dark:bg-neutral-900 overflow-hidden cursor-pointer" onDoubleClick={handleDoubleTap}>
            {isVideo ? (
                <>
                    <video 
                        ref={videoRef}
                        src={post.contentUrl} 
                        className="w-full h-full object-cover" 
                        loop 
                        playsInline
                        onClick={toggleVideo}
                    />
                    {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"><Play className="w-12 h-12 text-white fill-white opacity-80" /></div>}
                    <div className="absolute bottom-3 right-3 bg-black/50 p-1.5 rounded-full"><VolumeX className="w-4 h-4 text-white" /></div>
                </>
            ) : (
                <img src={post.contentUrl} alt="Post content" className="w-full h-full object-cover" />
            )}
            
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl animate-scale-up" />
                </div>
            )}
          </div>
      ) : (
          /* Text Only Post Support */
          <div className="px-4 py-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-900/50 cursor-pointer" onDoubleClick={handleDoubleTap}>
              <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed text-center">{post.caption}</p>
              {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl animate-scale-up" />
                </div>
            )}
          </div>
      )}

      {/* Actions */}
      <div className="p-3 md:px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button onClick={handleLike} className="group transition-transform active:scale-125">
              <Heart className={`w-7 h-7 transition-colors ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900 dark:text-white group-hover:text-gray-500'}`} />
            </button>
            <button onClick={() => onCommentClick(post)} className="group transition-transform active:scale-125">
              <MessageCircle className="w-7 h-7 text-gray-900 dark:text-white group-hover:text-gray-500 -rotate-90" />
            </button>
            <button onClick={() => onShareClick(post)} className="group transition-transform active:scale-125">
              <Send className="w-7 h-7 text-gray-900 dark:text-white group-hover:text-gray-500 rotate-12" />
            </button>
          </div>
          <button onClick={handleSave} className="group transition-transform active:scale-125">
            <Bookmark className={`w-7 h-7 transition-colors ${post.isSaved ? 'fill-gray-900 dark:fill-white text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white group-hover:text-gray-500'}`} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="mb-2">
            <span className="font-bold text-sm dark:text-white cursor-pointer hover:underline">{post.likes.toLocaleString()} {t.feed.likes}</span>
        </div>

        {/* Caption */}
        {post.contentUrl && post.caption && (
            <div className="mb-2">
            <span onClick={() => onUserClick(user)} className="font-bold text-sm mr-2 dark:text-white hover:underline cursor-pointer">{user?.handle}</span>
            <span className="text-sm dark:text-gray-300 leading-relaxed">{post.caption}</span>
            </div>
        )}

        <button onClick={() => onCommentClick(post)} className="text-gray-500 text-sm mb-2 hover:text-gray-900 dark:hover:text-gray-300 transition">{t.feed.view_comments}</button>
        
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{post.timestamp}</p>
      </div>
    </div>
  );
};

// --- MAIN FEED COMPONENT ---

const Feed: React.FC<FeedProps> = ({ currentUser, onNavigate, onUserClick }) => {
    const { t } = useLanguage();
    const { posts, addPost, toggleSavePost, deletePost, editPost } = useContent();
    const [stories, setStories] = useState<Story[]>([]);
    const [storiesScroll, setStoriesScroll] = useState(0);
    const storiesRef = useRef<HTMLDivElement>(null);
    const [showMap, setShowMap] = useState<string | null>(null);
    
    // UI State for Story Creator & Viewer
    const [isCreatingStory, setIsCreatingStory] = useState(false);
    const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);

    // Post Creation & Editing State
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [editingPost, setEditingPost] = useState<PostType | undefined>(undefined);
    const [initialMediaType, setInitialMediaType] = useState<'image' | 'video' | null>(null);

    // Modal States
    const [activeCommentPost, setActiveCommentPost] = useState<PostType | null>(null);
    const [activeSharePost, setActiveSharePost] = useState<PostType | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Menu State
    const [menuState, setMenuState] = useState<{
        isOpen: boolean;
        type: MenuContextType;
        data?: any;
        isOwner: boolean;
    }>({
        isOpen: false,
        type: 'post',
        isOwner: false
    });

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const openMenu = (type: MenuContextType, data: any) => {
        let isOwner = false;
        if (type === 'post') isOwner = data.userId === currentUser.id;
        if (type === 'story') isOwner = data.userId === currentUser.id;
        
        setMenuState({
            isOpen: true,
            type,
            data,
            isOwner
        });
    };

    const handleMenuAction = async (actionId: string, data: any) => {
        if (!data) return;

        switch (actionId) {
            case 'share':
                setActiveSharePost(data);
                break;
            case 'save':
                toggleSavePost(data.id);
                showToast(data.isSaved ? "Removed from Saved" : "Saved to Profile");
                break;
            case 'delete':
                if(confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                    await deletePost(data.id);
                    showToast("Post deleted");
                }
                break;
            case 'edit':
                setEditingPost(data);
                setIsCreatingPost(true);
                break;
            case 'copy_link': // For 'link' id in ActionMenu
            case 'link':
                try {
                    await navigator.clipboard.writeText(`https://voxnet.social/post/${data.id}`);
                    showToast("Link copied to clipboard");
                } catch (err) {
                    showToast("Failed to copy link");
                }
                break;
            case 'report':
                showToast("Thanks for reporting. We will review this post.");
                break;
            default:
                break;
        }
    };

    const handleStoryPosted = (newStory: Story) => {
        setStories(prev => [newStory, ...prev]);
        setIsCreatingStory(false);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (storiesRef.current) {
            storiesRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const handleNewPost = (newPost: PostType) => {
        addPost(newPost);
        if (navigator.vibrate) navigator.vibrate([50, 100]);
    };

    const handleEditPost = (updatedPost: PostType) => {
        editPost(updatedPost);
        setEditingPost(undefined);
        showToast("Post updated successfully");
    }

    const openPostCreator = (type?: 'image' | 'video' | 'event') => {
        if (type === 'event') {
             setInitialMediaType(null);
        } else {
             setInitialMediaType(type || null);
        }
        setEditingPost(undefined); // Ensure clean state
        setIsCreatingPost(true);
    };

    const groupedStories = Array.from(new Set(stories.map(s => s.userId))).map(userId => {
        return stories.filter(s => s.userId === userId)[0]; 
    });

    return (
        <div className="max-w-xl mx-auto pb-20 md:pb-0 relative">
            
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold z-[100] animate-fade-in flex items-center shadow-lg backdrop-blur-md">
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    {toastMessage}
                </div>
            )}

            {/* Story Creator Overlay */}
            {isCreatingStory && (
                <StoryCreator 
                    onClose={() => setIsCreatingStory(false)} 
                    onPost={handleStoryPosted}
                />
            )}

            {/* Post Creator Overlay (Also handles editing) */}
            {isCreatingPost && (
                <PostCreator 
                    onClose={() => { setIsCreatingPost(false); setEditingPost(undefined); }}
                    onPost={handleNewPost}
                    onUpdate={handleEditPost}
                    initialMediaType={editingPost ? (editingPost.type === 'video' ? 'video' : 'image') : initialMediaType}
                    postToEdit={editingPost}
                />
            )}

            {/* Story Viewer Overlay */}
            {viewingStoryId && (
                <StoryViewer 
                    stories={stories} 
                    initialStoryId={viewingStoryId}
                    onClose={() => setViewingStoryId(null)}
                    onNavigate={onNavigate}
                />
            )}

            {/* Modals */}
            {activeCommentPost && <CommentsModal post={activeCommentPost} onClose={() => setActiveCommentPost(null)} />}
            {activeSharePost && <ShareModal post={activeSharePost} onClose={() => setActiveSharePost(null)} />}

            {/* Action Menu */}
            <ActionMenu 
                isOpen={menuState.isOpen}
                onClose={() => setMenuState(prev => ({ ...prev, isOpen: false }))}
                type={menuState.type}
                isOwner={menuState.isOwner}
                data={menuState.data}
                onAction={handleMenuAction}
            />

            {/* Stories Rail */}
            <div className="relative group">
                <div 
                    ref={storiesRef}
                    className="flex space-x-4 overflow-x-auto no-scrollbar p-4 bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-900 md:rounded-3xl md:mb-4 md:border-0"
                    onScroll={(e) => setStoriesScroll(e.currentTarget.scrollLeft)}
                >
                    <StoryCircle isUser label={t.feed.your_story} onClick={() => setIsCreatingStory(true)} />
                    {groupedStories.map(story => (
                        <StoryCircle key={story.id} story={story} onClick={() => setViewingStoryId(story.id)} />
                    ))}
                </div>
            </div>

            {/* Create Post Bar */}
            <CreatePostBar user={currentUser} onClick={openPostCreator} />

            {/* Feed Items */}
            <div className="md:space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={currentUser}
                            onMenuClick={(post) => openMenu('post', post)}
                            onMapClick={(loc) => setShowMap(loc)}
                            onCommentClick={(post) => setActiveCommentPost(post)} 
                            onShareClick={(post) => setActiveSharePost(post)}
                            onUserClick={onUserClick}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <Sparkles className="w-16 h-16 text-gray-300 dark:text-neutral-700 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Welcome to VoxNet</h3>
                        <p className="text-sm text-gray-500 max-w-xs mt-2">Your feed is empty. Be the first to post something amazing or find friends to follow!</p>
                        <button onClick={() => openPostCreator()} className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition">
                            Create First Post
                        </button>
                    </div>
                )}
            </div>

            {/* Map Popup */}
            {showMap && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowMap(null)}>
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="h-48 bg-gray-200 dark:bg-neutral-800 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-20"></div>
                            <MapPin className="w-10 h-10 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold dark:text-white mb-2">{showMap}</h3>
                            <button className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 mt-4">
                                <MapPin className="w-5 h-5" />
                                <span>Open in Maps</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed;
