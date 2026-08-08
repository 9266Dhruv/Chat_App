import apiClient from './client';
import type { Conversation, Message, MessageRequest, User } from '@/types';

export async function searchUsers(query: string): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users/search', { params: { q: query } });
  return response.data;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await apiClient.get<Conversation[]>('/conversations');
  return response.data;
}

export async function fetchMessages(
  conversationId: number,
  beforeId?: number
): Promise<Message[]> {
  const params: Record<string, string | number> = { limit: 50 };
  if (beforeId) params.beforeId = beforeId;
  const response = await apiClient.get<Message[]>(
    `/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
}

export async function sendMessageRest(
  conversationId: number,
  data: MessageRequest
): Promise<Message> {
  const response = await apiClient.post<Message>(
    `/conversations/${conversationId}/messages`,
    data
  );
  return response.data;
}

export async function deleteMessage(messageId: number): Promise<void> {
  await apiClient.delete(`/messages/${messageId}`);
}

export async function toggleReaction(
  messageId: number,
  emoji: string
): Promise<Message> {
  const response = await apiClient.post<Message>(
    `/messages/${messageId}/reactions`,
    { emoji }
  );
  return response.data;
}

export async function markAsRead(messageId: number): Promise<void> {
  await apiClient.post(`/messages/${messageId}/read`);
}

export async function uploadFile(file: File): Promise<{
  fileUrl: string;
  filename: string;
  size: string;
  type: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function createConversation(
  title: string,
  memberIds: number[]
): Promise<Conversation> {
  const response = await apiClient.post<Conversation>('/conversations', {
    title,
    memberIds,
  });
  return response.data;
}
