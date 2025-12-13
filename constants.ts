
import { User, Post, Story, Chat, Group, Event, Reel, ExploreItem, Trend, FeedItem, AICardData, Notification } from './types';

// App Identity
export const APP_NAME = "VoxNet";
export const APP_VERSION = "2.0.0 Pro";

// Translations
export const TRANSLATIONS = {
  en: {
    nav: { home: 'Home', explore: 'Explore', reels: 'Reels', messages: 'Messages', groups: 'Groups', events: 'Events', profile: 'Profile', settings: 'Hub', moderation: 'Moderation', add_friends: 'Add Friends' },
    settings: { 
      title: 'Control Center', 
      search_placeholder: 'Ask Nova AI to change settings...',
      trust_score: 'Trust Score',
      social_status: 'Influencer Level',
      nova_ai: {
        title: 'Nova AI™ Active',
        desc: 'Optimizing battery & privacy based on your location.',
        suggestion: 'Suggestion: Switch to "Focus Mode" - 3 meetings detected.'
      },
      categories: {
        universe: 'Your Universe',
        universe_desc: 'Themes, Avatar, UI Layout',
        security: 'Fortress',
        security_desc: 'Biometrics, Stealth, Encryption',
        wellness: 'Digital Zen',
        wellness_desc: 'Notifications, Focus, Health',
        social: 'Social Algorithm',
        social_desc: 'Control what you see',
        data: 'Neural Data',
        data_desc: 'Storage, Backup, AI Cleaning'
      },
      logout: 'Disconnect Neural Link',
      build: 'System Version'
    },
    feed: { likes: 'likes', view_comments: 'View all comments', your_story: 'Your Story' },
    profile: { posts: 'Posts', followers: 'Followers', following: 'Following', edit: 'Edit Profile', share: 'Share', follow: 'Follow', message: 'Message' },
    events: { title: 'Events', create: 'Create Event', interested: 'Interested' },
    reels: { camera: 'Camera', music: 'Music', comments: 'Comments', share: 'Share', original_audio: 'Original Audio', follow: 'Follow', following: 'Following' }
  },
  pt: {
    nav: { home: 'Início', explore: 'Explorar', reels: 'Reels', messages: 'Mensagens', groups: 'Grupos', events: 'Eventos', profile: 'Perfil', settings: 'Hub', moderation: 'Moderação', add_friends: 'Adicionar Amigos' },
    settings: { 
      title: 'Centro de Controle', 
      search_placeholder: 'Peça à Nova AI para ajustar...',
      trust_score: 'Nível de Confiança',
      social_status: 'Nível Social',
      nova_ai: {
        title: 'Nova AI™ Ativa',
        desc: 'Otimizando bateria e privacidade baseada na localização.',
        suggestion: 'Sugestão: Ativar "Modo Foco" - 3 reuniões detectadas.'
      },
      categories: {
        universe: 'Seu Universo',
        universe_desc: 'Temas, Avatar, Layout UI',
        security: 'Fortaleza',
        security_desc: 'Biometria, Stealth, Criptografia',
        wellness: 'Zen Digital',
        wellness_desc: 'Notificações, Foco, Saúde',
        social: 'Algoritmo Social',
        social_desc: 'Controle o que você vê',
        data: 'Dados Neurais',
        data_desc: 'Armazenamento, Backup, Limpeza IA'
      },
      logout: 'Desconectar Link Neural',
      build: 'Versão do Sistema'
    },
    feed: { likes: 'curtidas', view_comments: 'Ver todos os comentários', your_story: 'Seu Story' },
    profile: { posts: 'Publicações', followers: 'Seguidores', following: 'Seguindo', edit: 'Editar Perfil', share: 'Compartilhar', follow: 'Seguir', message: 'Mensagem' },
    events: { title: 'Eventos', create: 'Criar Evento', interested: 'Tenho Interesse' },
    reels: { camera: 'Câmera', music: 'Música', comments: 'Comentários', share: 'Compartilhar', original_audio: 'Áudio Original', follow: 'Seguir', following: 'Seguindo' }
  }
};

// Initial Placeholder for Auth Context fallback (Empty state)
export const CURRENT_USER: User = {
  id: '',
  name: '',
  handle: '',
  avatar: 'https://via.placeholder.com/150',
  coverUrl: '',
  bio: '',
  followers: 0,
  following: 0,
  postsCount: 0,
};

// Empty Arrays for Production State
export const USERS: User[] = [];
export const STORIES: Story[] = [];
export const POSTS: Post[] = [];
export const CHATS: Chat[] = [];
export const GROUPS: Group[] = [];
export const EVENTS: Event[] = [];
export const REELS: Reel[] = [];
export const TRENDS: Trend[] = [];
export const EXPLORE_ITEMS: ExploreItem[] = [];
export const MIXED_FEED: FeedItem[] = [];
export const NOTIFICATIONS: Notification[] = [];
