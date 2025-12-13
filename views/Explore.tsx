
import React, { useState, useEffect } from 'react';
import { 
    Sparkles, Search, TrendingUp, Users, Play, 
    Radio, MapPin, Music, Heart, Loader2
} from 'lucide-react';
import { ExploreItem, User, Post, ViewState } from '../types';
import PostViewer from '../components/PostViewer';
import { USERS } from '../constants'; // Just for fallback types

interface ExploreProps {
    onNavigate: (view: ViewState) => void;
    onUserClick: (user: User) => void;
}

type Tab = 'foryou' | 'trends' | 'geo' | 'creators' | 'music' | 'live';

const itemToPost = (item: ExploreItem): Post => {
    return {
        id: item.id,
        userId: item.creator?.id || 'unknown',
        type: item.type === 'video' || item.type === 'live' ? 'video' : 'image',
        contentUrl: item.imageUrl,
        caption: item.title || 'Explore content',
        likes: 0,
        comments: [],
        timestamp: 'Just now',
        isLiked: false,
        isSaved: false,
        location: 'Explore Feed',
        views: 0
    };
};

const Explore: React.FC<ExploreProps> = ({ onNavigate, onUserClick }) => {
    const [activeTab, setActiveTab] = useState<Tab>('foryou');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // No automatic loading
    const [items, setItems] = useState<ExploreItem[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearching(!!query);
    };

    const SearchHeader = () => (
        <div className={`sticky top-0 z-30 pt-4 pb-2 px-4 transition-all duration-300 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-transparent ${isSearching ? 'border-gray-200 dark:border-white/10' : ''}`}>
            <div className="relative group">
                <div className="relative bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center p-2.5 shadow-sm">
                    <Search className="w-5 h-5 text-gray-400 ml-2" />
                    <input 
                        type="text"
                        placeholder="Search users, hashtags, trends..."
                        className="w-full bg-transparent outline-none px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        onFocus={() => setIsSearching(true)}
                    />
                </div>
            </div>

            {!isSearching && (
                <div className="flex items-center justify-between mt-4 pb-2">
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar w-full py-1">
                        {[
                            { id: 'foryou', label: 'For You', icon: Sparkles },
                            { id: 'trends', label: 'Trending', icon: TrendingUp },
                            { id: 'live', label: 'Live', icon: Radio },
                            { id: 'geo', label: 'Nearby', icon: MapPin },
                            { id: 'music', label: 'Music', icon: Music },
                            { id: 'creators', label: 'Creators', icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap text-xs font-bold border ${
                                    activeTab === tab.id 
                                    ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg scale-105' 
                                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-violet-500 dark:hover:border-violet-500'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full w-full bg-white dark:bg-black overflow-y-auto no-scrollbar relative">
            <SearchHeader />

            {selectedPost && (
                <PostViewer 
                    post={selectedPost} 
                    onClose={() => setSelectedPost(null)} 
                    onUserClick={(user) => { setSelectedPost(null); onUserClick(user); }}
                />
            )}

            <div className="flex flex-col items-center justify-center py-32 text-center opacity-60 px-6">
                <Sparkles className="w-16 h-16 text-gray-300 dark:text-neutral-700 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Explore the Universe</h3>
                <p className="text-sm text-gray-500 max-w-xs mt-2">
                    Search for users or content to see results here. The explore feed will populate as the community grows.
                </p>
            </div>
        </div>
    );
};

export default Explore;
