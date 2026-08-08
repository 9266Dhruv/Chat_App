// ── Core Types ──────────────────────────────────────────────

export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string | null;
  members: User[];
  lastMessage: Message | null;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: User;
  content: string;
  fileUrl: string | null;
  replyTo: Message | null;
  status: MessageStatus;
  clientMessageId: string;
  createdAt: string;
  reactions: ReactionGroup[];
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  userIds: number[];
}

// ── Request/Response Types ──────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface MessageRequest {
  content: string;
  clientMessageId: string;
  replyToId: number | null;
}

export interface TypingEvent {
  conversationId: number;
  userId: number;
  username: string;
  typing: boolean;
}

export interface CreateConversationRequest {
  title: string;
  memberIds: number[];
}

// ── WebSocket Event Types ───────────────────────────────────

export interface WsMessageEvent extends Message {
  type?: 'MESSAGE_DELETED';
  messageId?: number;
}
