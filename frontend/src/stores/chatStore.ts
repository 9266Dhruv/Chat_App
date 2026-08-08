import { create } from 'zustand';
import type { TypingEvent } from '@/types';

interface ChatState {
  activeConversationId: number | null;
  setActiveConversation: (id: number | null) => void;
  typingUsers: Map<number, TypingEvent[]>;
  setTypingUsers: (conversationId: number, events: TypingEvent[]) => void;
  addTypingUser: (event: TypingEvent) => void;
  removeTypingUser: (conversationId: number, userId: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  typingUsers: new Map(),
  setTypingUsers: (conversationId, events) =>
    set((state) => {
      const next = new Map(state.typingUsers);
      next.set(conversationId, events);
      return { typingUsers: next };
    }),
  addTypingUser: (event) =>
    set((state) => {
      const next = new Map(state.typingUsers);
      const current = next.get(event.conversationId) || [];
      const exists = current.some((t) => t.userId === event.userId);
      if (!exists) {
        next.set(event.conversationId, [...current, event]);
      }
      return { typingUsers: next };
    }),
  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const next = new Map(state.typingUsers);
      const current = next.get(conversationId) || [];
      next.set(conversationId, current.filter((t) => t.userId !== userId));
      return { typingUsers: next };
    }),
}));
