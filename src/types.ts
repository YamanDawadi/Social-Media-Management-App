export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter';

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

export interface PostComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  sentiment?: FeedbackSentiment;
  reply?: string;
  isCustom?: boolean;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  author: string;
  avatar: string;
  content: string;
  mediaUrl?: string;
  mediaType: 'image' | 'text';
  timestamp: string;
  likes: number;
  commentsCount: number;
  shares: number;
  views: number;
  comments: PostComment[];
  tags: string[];
}

export interface StoryReaction {
  emoji: string;
  count: number;
}

export interface SocialStory {
  id: string;
  platform: SocialPlatform;
  author: string;
  avatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  views: number;
  reactions: StoryReaction[];
  replies: PostComment[];
}

export interface Message {
  id: string;
  sender: 'user' | 'contact';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  platform: SocialPlatform;
  contactName: string;
  contactHandle: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
  context?: {
    type: 'post' | 'story';
    id: string;
    title: string;
    previewUrl?: string;
  };
}

export interface AICopilotTone {
  id: string;
  name: string;
  emoji: string;
  instruction: string;
}

export interface SentimentAnalysisResponse {
  sentiment: FeedbackSentiment;
  score: number; // 0 to 100
  reason: string;
}

export interface ReplyResponse {
  reply: string;
  explanation: string;
}

export interface InsightSummaryResponse {
  summary: string;
  painPoints: { issue: string; frequency: string; solution: string }[];
  contentIdeas: { title: string; type: 'post' | 'story'; platform: string; concept: string }[];
}

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: SocialPlatform[];
  scheduledTime: string; // ISO date string (YYYY-MM-DDTHH:mm)
  mediaUrl?: string;
  mediaType: 'image' | 'text';
  status: 'scheduled' | 'published';
  tags: string[];
}

