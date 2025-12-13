
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Post, Reel, Comment } from './types';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

interface ContentContextType {
    posts: Post[];
    reels: Reel[];
    loading: boolean;
    refreshContent: () => Promise<void>;
    toggleSavePost: (id: string) => Promise<void>;
    toggleLikePost: (id: string) => void;
    toggleSaveReel: (id: string) => void;
    toggleLikeReel: (id: string) => void;
    addPost: (post: Post) => void;
    editPost: (post: Post) => Promise<void>;
    updatePostComments: (postId: string, comments: Comment[]) => void;
    deletePost: (postId: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // Fetch posts with author details using the correct join syntax
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id, 
                    user_id, 
                    caption, 
                    content_url, 
                    type, 
                    location, 
                    created_at,
                    profiles (id, username, avatar_url, name, is_verified)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Pre-fetch likes and saves for the current user to set initial state
                let userLikes: string[] = [];
                let userSaves: string[] = [];

                if (user) {
                    const { data: likes } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
                    const { data: saves } = await supabase.from('saved_posts').select('post_id').eq('user_id', user.id);
                    if (likes) userLikes = likes.map(l => l.post_id);
                    if (saves) userSaves = saves.map(s => s.post_id);
                }

                const formattedPosts: Post[] = await Promise.all(data.map(async (p: any) => {
                    // Get total likes count (in a real app, maybe store count on post table or use aggregate)
                    const { count } = await supabase
                        .from('likes')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', p.id);
                    
                    const authorData = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                    
                    return {
                        id: p.id,
                        userId: p.user_id,
                        type: p.type || 'image',
                        contentUrl: p.content_url,
                        caption: p.caption,
                        location: p.location,
                        likes: count || 0,
                        comments: [], // Comments loaded lazily usually
                        timestamp: new Date(p.created_at).toLocaleDateString(),
                        isLiked: userLikes.includes(p.id),
                        isSaved: userSaves.includes(p.id),
                        views: 0,
                        shares: 0,
                        engagementRate: 0,
                        author: authorData ? {
                            name: authorData.name || 'Unknown',
                            handle: authorData.username || '@unknown',
                            avatar: authorData.avatar_url || 'https://via.placeholder.com/150',
                            isVerified: authorData.is_verified || false
                        } : undefined
                    };
                }));
                setPosts(formattedPosts);
            }
        } catch (err: any) {
            if (err.code === '42P01' || err.message?.includes('Could not find the table')) {
                console.warn('Database tables missing. Using local state.');
            } else {
                console.error('Error fetching posts:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [user]);

    const toggleSavePost = async (id: string) => {
        if (!user) return;

        // Optimistic UI Update
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) return;
        const isSaved = posts[postIndex].isSaved;

        setPosts(prev => prev.map(post => 
            post.id === id ? { ...post, isSaved: !post.isSaved } : post
        ));

        try {
            if (isSaved) {
                // Unsave
                await supabase.from('saved_posts').delete().match({ user_id: user.id, post_id: id });
            } else {
                // Save
                await supabase.from('saved_posts').insert({ user_id: user.id, post_id: id });
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            // Revert on error
            setPosts(prev => prev.map(post => 
                post.id === id ? { ...post, isSaved: isSaved } : post
            ));
        }
    };

    const toggleLikePost = async (id: string) => {
        if (!user) return;

        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) return;
        const post = posts[postIndex];
        const newIsLiked = !post.isLiked;
        
        setPosts(prev => prev.map(p => 
            p.id === id ? { 
                ...p, 
                isLiked: newIsLiked,
                likes: newIsLiked ? p.likes + 1 : p.likes - 1 
            } : p
        ));

        try {
            if (newIsLiked) {
                await supabase.from('likes').insert({ user_id: user.id, post_id: id });
            } else {
                await supabase.from('likes').delete().match({ user_id: user.id, post_id: id });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const toggleSaveReel = (id: string) => {
        setReels(prev => prev.map(reel => 
            reel.id === id ? { ...reel, isSaved: !reel.isSaved } : reel
        ));
    };

    const toggleLikeReel = (id: string) => {
        setReels(prev => prev.map(reel => 
            reel.id === id ? { 
                ...reel, 
                isLiked: !reel.isLiked,
                likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 
            } : reel
        ));
    };

    const addPost = (post: Post) => {
        setPosts(prev => [post, ...prev]);
    };

    const editPost = async (updatedPost: Post) => {
        // Optimistic UI
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        
        try {
            const { error } = await supabase
                .from('posts')
                .update({ 
                    caption: updatedPost.caption, 
                    location: updatedPost.location 
                })
                .eq('id', updatedPost.id);
                
            if (error) throw error;
        } catch (err: any) {
            console.error("Error updating post:", err);
            // In a real app, revert logic would go here
        }
    };

    const updatePostComments = (postId: string, comments: Comment[]) => {
        setPosts(prev => prev.map(post => 
            post.id === postId ? { ...post, comments: comments } : post
        ));
    };

    const deletePost = async (postId: string) => {
        // Optimistic UI
        setPosts(prev => prev.filter(p => p.id !== postId));
        
        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            
            // Also cleanup saved posts if cascading delete isn't set up in DB
            await supabase.from('saved_posts').delete().eq('post_id', postId);
            await supabase.from('likes').delete().eq('post_id', postId);
            
        } catch (err) {
            console.error("Error deleting post:", err);
            // Fetch posts again to revert state if failed
            fetchPosts();
        }
    };

    return (
        <ContentContext.Provider value={{
            posts,
            reels,
            loading,
            refreshContent: fetchPosts,
            toggleSavePost,
            toggleLikePost,
            toggleSaveReel,
            toggleLikeReel,
            addPost,
            editPost,
            updatePostComments,
            deletePost
        }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};
