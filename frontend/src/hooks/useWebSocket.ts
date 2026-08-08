import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/stores/authStore';
import type { Message, TypingEvent, WsMessageEvent } from '@/types';

type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export function useWebSocket(
  onMessage: (msg: Message) => void,
  onTyping: (event: TypingEvent) => void,
  onMessageDeleted: (messageId: number) => void
) {
  const clientRef = useRef<Client | null>(null);
  const subscribedConvs = useRef<Set<number>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const accessToken = useAuthStore((s) => s.accessToken);
  const reconnectAttemptsRef = useRef(0);

  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);
  const onMessageDeletedRef = useRef(onMessageDeleted);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onTypingRef.current = onTyping;
    onMessageDeletedRef.current = onMessageDeleted;
  }, [onMessage, onTyping, onMessageDeleted]);

  // Connect
  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`/ws?token=${accessToken}`),
      reconnectDelay: 0, // We handle reconnection ourselves
      onConnect: () => {
        setConnectionStatus('CONNECTED');
        reconnectAttemptsRef.current = 0;
        // Resubscribe to all previously subscribed conversations
        subscribedConvs.current.forEach((convId) => {
          subscribeToConversation(client, convId);
        });
      },
      onDisconnect: () => {
        setConnectionStatus('DISCONNECTED');
      },
      onStompError: () => {
        setConnectionStatus('DISCONNECTED');
        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;
        setTimeout(() => {
          if (clientRef.current) {
            setConnectionStatus('CONNECTING');
            clientRef.current.activate();
          }
        }, delay);
      },
    });

    clientRef.current = client;
    setConnectionStatus('CONNECTING');
    client.activate();

    return () => {
      subscribedConvs.current.clear();
      client.deactivate();
    };
  }, [accessToken]);

  function subscribeToConversation(client: Client, conversationId: number) {
    // Messages
    client.subscribe(`/topic/conv/${conversationId}`, (msg) => {
      const data: WsMessageEvent = JSON.parse(msg.body);
      if (data.type === 'MESSAGE_DELETED' && data.messageId) {
        onMessageDeletedRef.current(data.messageId);
      } else {
        onMessageRef.current(data as Message);
      }
    });

    // Typing
    client.subscribe(`/topic/conv/${conversationId}/typing`, (msg) => {
      const data: TypingEvent = JSON.parse(msg.body);
      onTypingRef.current(data);
    });
  }

  const subscribe = useCallback((conversationId: number) => {
    subscribedConvs.current.add(conversationId);
    if (clientRef.current?.connected) {
      subscribeToConversation(clientRef.current, conversationId);
    }
  }, []);

  const unsubscribe = useCallback((conversationId: number) => {
    subscribedConvs.current.delete(conversationId);
  }, []);

  const sendMessage = useCallback((
    conversationId: number,
    content: string,
    clientMessageId: string,
    replyToId?: number | null
  ) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content, clientMessageId, replyToId }),
    });
  }, []);

  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (!clientRef.current?.connected) return;
    const user = useAuthStore.getState().user;
    if (!user) return;
    clientRef.current.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        conversationId,
        userId: user.id,
        username: user.displayName,
        typing: isTyping,
      }),
    });
  }, []);

  return {
    connectionStatus,
    subscribe,
    unsubscribe,
    sendMessage,
    sendTyping,
  };
}
