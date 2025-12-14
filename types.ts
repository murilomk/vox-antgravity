export interface User {
  id: string;
  name?: string;
  handle?: string;
  avatar?: string;
  email?: string;
  isVerified?: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  postsCount?: number;
  coverUrl?: string;
  status?: string;
  reputation?: number;
  socialRating?: number;
  themeColor?: string;
  music?: {
    title: string;
    artist: string;
    previewUrl?: string;
    isAutoSync?: boolean;
  };
  skills?: string[];
  links?: { title: string; url: string }[];
  location?: string;
  joinDate?: string;
  pronouns?: string;
  profileStyle?: 'classic' | 'creator' | 'business' | 'minimal' | 'bold';
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  parentId?: string;
}

export interface Post {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text';
  contentUrl?: string;
  caption?: string;
  location?: string;
  likes?: number;
  comments?: Comment[];
  timestamp?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  views?: number;
  shares?: number;
  engagementRate?: number;
  author?: {
    name?: string;
    handle?: string;
    avatar?: string;
    isVerified?: boolean;
  };
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  videoUrl?: string;
  duration?: number;
  timestamp?: string;
  isViewed?: boolean;
  hasMusic?: boolean;
  isCloseFriends?: boolean;
  privacy?: 'public' | 'followers' | 'close_friends';
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp?: string;
  isRead?: boolean;
  type?: 'text' | 'image' | 'audio' | 'video' | 'sticker' | 'system';
}

export interface Chat {
  id: string;
  userId?: string;
  groupId?: string;
  isGroup?: boolean;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  timestamp?: string;
  isOnline?: boolean;
  messages?: Message[];
}

export interface Group {
  id: string;
  name: string;
  coverUrl?: string;
  description?: string;
  category?: string;
  membersCount?: number;
  members?: string[];
  role?: 'admin' | 'moderator' | 'member' | 'none';
  privacy?: 'public' | 'private' | 'secret';
  lastActive?: string;
}

export type EventCategory = 'Music' | 'Games' | 'Art' | 'Education' | 'Movies' | 'Networking' | 'Sports' | 'Technology';

export interface EventMessage extends Message {
  eventId?: string;
}

export interface Event {
  id: string;
  organizerId?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  category?: EventCategory;
  price?: string;
  attendeesCount?: number;
  maxAttendees?: number;
  attendees?: string[];
  isOnline?: boolean;
  link?: string;
  messages?: EventMessage[];
}

export interface MusicTrack {
  id?: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
}

export interface Reel {
  id?: string;
  userId?: string;
  videoUrl?: string;
  caption?: string;
  music?: MusicTrack;
  likes?: number;
  commentsCount?: number;
  shares?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: Comment[];
}

export interface Trend {
  id?: string;
  rank?: number;
  topic?: string;
  volume?: string;
  category?: string;
  growth?: 'explosive' | 'rising' | 'stable';
}

export interface ExploreItem {
  id?: string;
  type?: 'video' | 'image' | 'collection' | 'live';
  size?: 'small' | 'medium' | 'large' | 'tall' | 'wide';
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  aiMatchScore?: number;
  creator?: User;
}

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
};

export interface AICardData {
  id?: string;
  type?: 'daily_moment' | 'music_recommendation' | 'news_flash' | 'ai_summary';
  title?: string;
  subtitle?: string;
  data?: any;
}

export interface ReelStripData {
  id?: string;
  reels?: Reel[];
}

export type FeedItem =
  | { type: 'post'; data: Post }
  | { type: 'ai_card'; data: AICardData }
  | { type: 'reel_strip'; data: ReelStripData };

export enum ViewState {
  AUTH = 'AUTH',
  FEED = 'FEED',
  EXPLORE = 'EXPLORE',
  REELS = 'REELS',
  MESSAGES = 'MESSAGES',
  GROUPS = 'GROUPS',
  EVENTS = 'EVENTS',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  UPDATE = 'UPDATE',
  SETTINGS = 'SETTINGS',
  ADD_FRIENDS = 'ADD_FRIENDS',
  NOTIFICATIONS = 'NOTIFICATIONS',
}

export interface SettingsState {
  themeMode?: 'light' | 'dark' | 'neon';
  solarTheme?: boolean;
  emotionalTheme?: boolean;
  parallax?: boolean;
  faceId?: boolean;
  stealth?: boolean;
  intrusionDetection?: boolean;
  ghostLocation?: boolean;
  appCamouflage?: boolean;
  wellnessAwareness?: boolean;
  blueLight?: boolean;
  focusMode?: boolean;
  pushVolume?: number;
  viralContent?: number;
  closeFriends?: number;
  educational?: number;
  localEvents?: number;
  allowTraining?: boolean;
  adPersonalization?: boolean;
  updateCheckInterval?: number; // minutes, 0 = disabled
}
