
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email?: string;
  isVerified?: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  postsCount?: number;
  // New Advanced Fields
  coverUrl?: string;
  status?: string; // e.g., "🌙 Sleeping", "💻 Coding"
  reputation?: number; // 0-100 Score
  socialRating?: number; // 0-5 Stars
  themeColor?: string; // Hex code for profile accent
  music?: {
    title: string;
    artist: string;
    previewUrl?: string;
    isAutoSync?: boolean; // Toggles between manual upload vs device sync
  };
  skills?: string[]; // e.g., ["Photography", "React", "Design"]
  links?: { title: string; url: string }[];
  location?: string;
  joinDate?: string;
  // Edit Profile Extras
  pronouns?: string;
  profileStyle?: 'classic' | 'creator' | 'business' | 'minimal' | 'bold';
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean; // Track local like state
  replies: Comment[]; // Recursive structure for threading
  parentId?: string; // To identify if it's a reply
}

export interface Post {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text';
  contentUrl?: string;
  caption: string;
  location?: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
  // New fields for Insights
  views?: number;
  shares?: number;
  engagementRate?: number;
  // Joined Author Data
  author?: {
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
  };
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string; // Used for both image and video thumbnail
  mediaType: 'image' | 'video'; // New field
  videoUrl?: string; // New field for video source
  duration?: number; // Optional override (default 5000ms for images)
  timestamp: string;
  isViewed: boolean;
  hasMusic?: boolean;
  isCloseFriends?: boolean;
  privacy?: 'public' | 'followers' | 'close_friends'; // New Privacy Field
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'audio' | 'video' | 'sticker' | 'system';
}

export interface Chat {
  id: string;
  userId: string; // The other user (if direct chat)
  groupId?: string; // If group chat
  isGroup: boolean;
  name?: string; // For groups
  avatar?: string; // For groups
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  isOnline: boolean;
  messages: Message[];
  // Advanced Features
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  isSecret?: boolean;
  isFavorite?: boolean;
}

export interface Group {
  id: string;
  name: string;
  coverUrl: string;
  description: string;
  category: string;
  membersCount: number;
  members: string[]; // Array of User IDs to track membership
  role: 'admin' | 'moderator' | 'member' | 'none'; // 'none' means not joined
  privacy: 'public' | 'private' | 'secret';
  lastActive: string;
  aiEnabled: boolean;
  voiceRoomActive: boolean;
  tags: string[];
}

// --- UPDATED EVENT INTERFACES ---

export type EventCategory = 'Music' | 'Games' | 'Art' | 'Education' | 'Movies' | 'Networking' | 'Sports' | 'Technology';

export interface EventMessage extends Message {
    eventId: string;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category: EventCategory;
  price?: string;
  attendeesCount: number;
  maxAttendees?: number;
  attendees: string[]; // List of User IDs
  isOnline: boolean;
  link?: string;
  messages: EventMessage[]; // Chat functionality
  isSaved?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

export interface Reel {
  id: string;
  userId: string;
  videoUrl: string;
  caption: string;
  music: MusicTrack;
  likes: number;
  commentsCount: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
}

export interface Trend {
  id: string;
  rank: number;
  topic: string;
  volume: string;
  category: string;
  growth: 'explosive' | 'rising' | 'stable';
}

export interface ExploreItem {
  id: string;
  type: 'video' | 'image' | 'collection' | 'live';
  size: 'small' | 'medium' | 'large' | 'tall' | 'wide';
  imageUrl: string;
  title?: string;
  subtitle?: string;
  aiMatchScore?: number; // e.g., 98% match
  creator?: User;
}

// --- NEW NOTIFICATION SYSTEM TYPES ---

export type NotificationCategory = 'social' | 'system' | 'security' | 'friends' | 'groups' | 'live' | 'activity';

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'follow' 
  | 'mention' 
  | 'share' 
  | 'message' 
  | 'group_invite' 
  | 'live_start' 
  | 'system_update' 
  | 'security_alert'
  | 'repost';

export interface Notification {
  id: string;
  userId?: string; // The user who triggered it (optional for system)
  type: NotificationType;
  category: NotificationCategory;
  text: string;
  targetId?: string; // ID of post, comment, or group
  previewImage?: string; // For post previews
  timestamp: string; // ISO or relative
  isRead: boolean;
  actionUrl?: string;
}

// --- NEW TYPES FOR HYBRID FEED ---

export interface AICardData {
  id: string;
  type: 'daily_moment' | 'music_recommendation' | 'news_flash' | 'ai_summary';
  title: string;
  subtitle?: string;
  data: any; // Flexible data depending on type
}

export interface ReelStripData {
  id: string;
  reels: Reel[];
}

// Union type for the main feed
export type FeedItem = 
  | { type: 'post', data: Post }
  | { type: 'ai_card', data: AICardData }
  | { type: 'reel_strip', data: ReelStripData };

export enum ViewState {
  AUTH = 'AUTH', // Added AUTH view
  FEED = 'FEED',
  EXPLORE = 'EXPLORE',
  REELS = 'REELS',
  MESSAGES = 'MESSAGES', 
  GROUPS = 'GROUPS', 
  EVENTS = 'EVENTS',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  SETTINGS = 'SETTINGS',
  ADD_FRIENDS = 'ADD_FRIENDS',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export interface SettingsState {
    themeMode: 'light' | 'dark' | 'neon';
    solarTheme: boolean;
    emotionalTheme: boolean;
    parallax: boolean;
    faceId: boolean;
    stealth: boolean;
    intrusionDetection: boolean;
    ghostLocation: boolean;
    appCamouflage: boolean;
    wellnessAwareness: boolean;
    blueLight: boolean;
    focusMode: boolean;
    pushVolume: number;
    viralContent: number;
    closeFriends: number;
    educational: number;
    localEvents: number;
    allowTraining: boolean;
    adPersonalization: boolean;
}
