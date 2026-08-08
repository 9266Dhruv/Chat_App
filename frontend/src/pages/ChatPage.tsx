import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import * as chatApi from '@/api/chatApi';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useSound } from '@/hooks/useSound';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import type { Message, TypingEvent, Conversation } from '@/types';
import { generateClientMessageId } from '@/lib/utils';

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingEvent[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [inputText, setInputText] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});
  const typingThrottleRef = useRef<NodeJS.Timeout | null>(null);

  const { playMessageSent, playMessageReceived } = useSound();
  const { isOpen: isPaletteOpen, close: closePalette, toggle: togglePalette } = useCommandPalette();

  // Keyboard shortcut for ? and Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') {
        setShowShortcuts((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.fetchConversations,
    refetchInterval: 30000,
  });

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // WebSocket handlers
  const handleIncomingMessage = useCallback((msg: Message) => {
    if (msg.conversationId === activeConversationId) {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => (m.id && m.id === msg.id) ||
                 (m.clientMessageId && m.clientMessageId === msg.clientMessageId)
        );
        if (exists) {
          return prev.map((m) =>
            (m.clientMessageId === msg.clientMessageId || m.id === msg.id) ? msg : m
          );
        }
        return [...prev, msg];
      });

      if (msg.sender?.id !== user?.id) {
        playMessageReceived();
      }
    }
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [activeConversationId, user?.id, playMessageReceived, queryClient]);

  const handleTyping = useCallback((event: TypingEvent) => {
    if (event.conversationId !== activeConversationId) return;
    
    if (typingTimeoutsRef.current[event.userId]) {
      clearTimeout(typingTimeoutsRef.current[event.userId]);
    }

    if (!event.typing) {
      setTypingUsers((prev) => prev.filter((t) => t.userId !== event.userId));
      return;
    }

    setTypingUsers((prev) => {
      const existing = prev.find((t) => t.userId === event.userId);
      if (existing) {
        return prev.map((t) => t.userId === event.userId ? event : t);
      }
      return [...prev, event];
    });
    
    typingTimeoutsRef.current[event.userId] = setTimeout(() => {
      setTypingUsers((prev) => prev.filter((t) => t.userId !== event.userId));
    }, 3000);
  }, [activeConversationId]);

  const handleMessageDeleted = useCallback((messageId: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const { sendMessage, sendTyping, connectionStatus, subscribe, unsubscribe } = useWebSocket(
    handleIncomingMessage,
    handleTyping,
    handleMessageDeleted
  );

  // Subscribe when conversation changes
  const prevConversationIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevConversationIdRef.current !== null) {
      unsubscribe(prevConversationIdRef.current);
    }
    if (activeConversationId !== null && connectionStatus === 'CONNECTED') {
      subscribe(activeConversationId);
    }
    prevConversationIdRef.current = activeConversationId;
  }, [activeConversationId, connectionStatus, subscribe, unsubscribe]);

  // Subscribe to all conversations for unread counts
  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      conversations.forEach((c) => subscribe(c.id));
    }
  }, [connectionStatus, conversations, subscribe]);

  // Load messages on conversation change
  useEffect(() => {
    if (activeConversationId === null) return;
    setMessages([]);
    setReplyTo(null);
    setTypingUsers([]);

    chatApi.fetchMessages(activeConversationId)
      .then((msgs) => {
        setMessages(msgs.reverse());
      })
      .catch(console.error);
  }, [activeConversationId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = () => {
    if (!activeConversationId || !user || !inputText.trim()) return;

    const content = inputText.trim();
    const clientMessageId = generateClientMessageId();

    const optimisticMsg: Message = {
      id: -Date.now(),
      conversationId: activeConversationId,
      sender: user,
      content,
      fileUrl: null,
      replyTo: replyTo,
      status: 'SENDING',
      clientMessageId,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setReplyTo(null);
    playMessageSent();

    chatApi.sendMessageRest(activeConversationId, {
      content,
      clientMessageId,
      replyToId: replyTo?.id || null,
    }).catch(console.error);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (activeConversationId) {
      if (!typingThrottleRef.current) {
        sendTyping(activeConversationId, true);
        typingThrottleRef.current = setTimeout(() => {
          typingThrottleRef.current = null;
        }, 2000);
      }
    }
  };

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  };

  const formatTimeStr = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <style>{`
        .chat-wrapper {
          margin: 0;
          width: 100vw;
          height: 100vh;
          background: #030405;
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #e9edf2;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .chat-wrapper * {
          box-sizing: border-box;
        }
        .chat-wrapper .app {
          width: 100vw;
          height: 100vh;
          max-width: none;
          min-height: 560px;
          border: none;
          border-radius: 0;
          background: #08090b;
          overflow: hidden;
          display: grid;
          grid-template-columns: 307px minmax(0, 1fr);
        }
        .chat-wrapper .sidebar {
          background: #0c0d10;
          border-right: 1px solid #181b20;
          display: flex;
          flex-direction: column;
        }
        .chat-wrapper .search {
          height: 35px;
          margin: 18px 21px 19px;
          border: 1px solid #262a30;
          border-radius: 11px;
          background: #17191d;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 11px;
          color: #666b73;
          font-size: 12px;
          cursor: pointer;
        }
        .chat-wrapper .search svg {
          width: 13px;
        }
        .chat-wrapper .chats {
          padding: 0 10px;
          overflow-y: auto;
          flex: 1;
        }
        .chat-wrapper .chats::-webkit-scrollbar { display: none; }
        .chat-wrapper .chat {
          height: 67px;
          border-radius: 15px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 11px;
          position: relative;
          color: #a7abb2;
          cursor: pointer;
          margin-bottom: 4px;
        }
        .chat-wrapper .chat:hover {
          background: rgba(16, 28, 37, 0.5);
        }
        .chat-wrapper .chat.active {
          background: #101c25;
          border: 1px solid #06425b;
          color: #eef4f7;
        }
        .chat-wrapper .chat.active:before {
          content: "";
          position: absolute;
          left: -1px;
          top: 13px;
          bottom: 13px;
          width: 4px;
          background: #16b5e9;
          border-radius: 0 4px 4px 0;
        }
        .chat-wrapper .avatar {
          width: 35px;
          height: 35px;
          flex: none;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #7a8dff, #3bc9ec);
          border: 1px solid #222b36;
        }
        .chat-wrapper .avatar.dark { background: #2b2e33; }
        .chat-wrapper .avatar.photo { background: linear-gradient(135deg, #754e2f, #171b20); }
        .chat-wrapper .chattext { min-width: 0; flex: 1; }
        .chat-wrapper .chatname { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-wrapper .preview { font-size: 11px; color: #6d727a; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-wrapper .time { font-size: 9px; color: #6d727a; align-self: flex-start; margin-top: 4px; }
        .chat-wrapper .me {
          margin-top: auto;
          border-top: 1px solid #171a1e;
          height: 66px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-wrapper .me .avatar {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #e1d7c8, #56758c);
        }
        .chat-wrapper .mename { font-size: 12px; font-weight: 700; }
        .chat-wrapper .role { font-size: 10px; color: #777c84; margin-top: 3px; }
        .chat-wrapper .gear { margin-left: auto; color: #71767e; cursor: pointer; }
        .chat-wrapper .gear svg { width: 15px; }

        .chat-wrapper .main {
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-rows: 72px minmax(0, 1fr) 72px;
          background: #070809;
        }
        .chat-wrapper .header {
          border-bottom: 1px solid #181b20;
          padding: 0 21px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .chat-wrapper .title { font-size: 18px; font-weight: 750; letter-spacing: -.5px; }
        .chat-wrapper .meta { font-size: 11px; color: #70757d; margin-top: 6px; }
        .chat-wrapper .internal {
          font-size: 10px;
          color: #7c8189;
          border: 1px solid #30343a;
          background: #17191d;
          border-radius: 15px;
          padding: 6px 10px;
          margin-left: 8px;
        }
        .chat-wrapper .headleft { display: flex; align-items: center; }
        .chat-wrapper .actions { display: flex; gap: 18px; color: #7c8188; align-items: center; }
        .chat-wrapper .actions svg { width: 16px; cursor: pointer; }
        .chat-wrapper .split {
          width: 36px;
          height: 36px;
          border: 1px solid #343940;
          background: #17191d;
          border-radius: 11px;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .chat-wrapper .messages {
          padding: 39px 29px 18px;
          overflow: auto;
          position: relative;
          min-height: 0;
          scrollbar-width: none;
        }
        .chat-wrapper .messages::-webkit-scrollbar { display: none; }
        .chat-wrapper .day {
          height: 1px;
          background: #111419;
          position: relative;
          margin-bottom: 45px;
        }
        .chat-wrapper .day span {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #070809;
          padding: 0 14px;
          color: #454a52;
          font-size: 10px;
        }
        .chat-wrapper .msg {
          display: flex;
          gap: 14px;
          margin-bottom: 34px;
          min-width: 0;
        }
        .chat-wrapper .msg.me-msg {
          flex-direction: row-reverse;
        }
        .chat-wrapper .msg .avatar { width: 35px; height: 35px; }
        .chat-wrapper .body {
          max-width: min(550px, calc(100% - 50px));
          min-width: 0;
        }
        .chat-wrapper .msg.me-msg .body {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .chat-wrapper .meta2 {
          display: flex;
          gap: 8px;
          align-items: center;
          margin: 1px 0 9px;
        }
        .chat-wrapper .msg.me-msg .meta2 {
          flex-direction: row-reverse;
        }
        .chat-wrapper .name { font-size: 12px; font-weight: 700; }
        .chat-wrapper .tm { font-size: 10px; color: #666b73; }
        .chat-wrapper .bubble {
          background: #111316;
          border: 1px solid #20242a;
          border-radius: 13px;
          padding: 15px 14px;
          font-size: 12px;
          line-height: 1.55;
          color: #d2d6db;
          box-shadow: inset 0 1px rgba(255,255,255,.015);
          overflow-wrap: anywhere;
        }
        .chat-wrapper .msg.me-msg .bubble {
          background: #061c25;
          border: 1px solid #06455a;
          color: #d5e7ec;
          box-shadow: 0 8px 28px rgba(0,105,145,.09);
        }
        .chat-wrapper .replyref {
          height: 50px;
          background: #121417;
          border: 1px solid #20252a;
          border-radius: 10px 10px 3px 10px;
          padding: 9px 13px;
          color: #666d75;
          font-size: 10px;
          cursor: pointer;
          margin-bottom: 5px;
          width: fit-content;
        }
        .chat-wrapper .replyref strong {
          display: block;
          color: #10a8dc;
          font-size: 10px;
          margin-bottom: 5px;
        }
        .chat-wrapper .typing {
          display: flex;
          align-items: center;
          gap: 13px;
          color: #4f555d;
          font-size: 10px;
          margin-top: 2px;
          padding-left: 0;
        }
        .chat-wrapper .typing .mini { width: 20px; height: 20px; }
        .chat-wrapper .dots {
          background: #111419;
          border: 1px solid #1d2126;
          border-radius: 10px;
          padding: 5px 10px;
          display: flex;
          gap: 3px;
        }
        .chat-wrapper .dots i {
          width: 3px;
          height: 3px;
          background: #70757c;
          border-radius: 50%;
          animation: dot 1.2s infinite;
        }
        .chat-wrapper .dots i:nth-child(2) { animation-delay: .15s; }
        .chat-wrapper .dots i:nth-child(3) { animation-delay: .3s; }
        @keyframes dot {
          50% { transform: translateY(-2px); opacity: .5; }
        }
        .chat-wrapper .composer {
          border-top: 1px solid #15181d;
          padding: 11px 28px;
          min-width: 0;
          position: relative;
          z-index: 5;
          background: #070809;
        }
        .chat-wrapper .messages-inner {
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }
        .chat-wrapper .composer-inner {
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chat-wrapper .input {
          height: 55px;
          border: 1px solid #22262c;
          border-radius: 17px;
          background: #0b0d10;
          display: flex;
          align-items: center;
          flex: 1;
          padding: 0 16px;
          color: #555b64;
          font-size: 12px;
        }
        .chat-wrapper .input input {
          background: transparent;
          border: none;
          outline: none;
          color: #d2d6db;
          width: 100%;
        }
        .chat-wrapper .input input::placeholder {
          color: #555b64;
        }
        .chat-wrapper .plus {
          font-size: 25px;
          color: #777d84;
          margin-right: 18px;
          font-weight: 300;
          cursor: pointer;
        }
        .chat-wrapper .send {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 11px;
          background: #11a9df;
          color: white;
          display: grid;
          place-items: center;
          box-shadow: 0 0 22px rgba(17,169,223,.25);
          cursor: pointer;
        }
        .chat-wrapper .send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-wrapper .send svg { width: 18px; }
      `}</style>

      <div className="chat-wrapper">
        <div className="app">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div style={{ display: 'flex', gap: '8px', padding: '18px 21px 19px' }}>
              <div className="search" style={{ margin: 0, flex: 1 }} onClick={togglePalette}>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Search
              </div>
              <button 
                onClick={togglePalette}
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '11px',
                  background: 'var(--accent)',
                  color: 'white',
                  display: 'grid',
                  placeItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(22, 183, 232, 0.2)'
                }}
                title="New Chat"
              >
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '18px' }}>
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="chats">
              {conversations.map((c) => {
                const isGroup = c.members?.length > 2;
                const convName = c.title || c.members?.filter(m => m.id !== user?.id).map(m => m.username).join(', ') || 'Saved Messages';
                
                return (
                <div 
                  key={c.id} 
                  className={`chat ${c.id === activeConversationId ? 'active' : ''}`}
                  onClick={() => setActiveConversationId(c.id)}
                >
                  <div className={`avatar ${isGroup ? 'dark' : ''}`}>
                    {getInitials(convName)}
                  </div>
                  <div className="chattext">
                    <div className="chatname">{convName}</div>
                    <div className="preview">{c.lastMessage?.content || 'No messages yet'}</div>
                  </div>
                  <div>
                    {c.lastMessage && (
                      <div className="time" style={c.id === activeConversationId ? { color: '#16b7e8' } : {}}>
                        {formatTimeStr(c.lastMessage.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>

            <div className="me">
              <div className="avatar">{getInitials(user?.username)}</div>
              <div>
                <div className="mename">{user?.username}</div>
                <div className="role">Online</div>
              </div>
              <div className="gear" onClick={logout}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1A1.7 1.7 0 0 0 6.2 12a1.7 1.7 0 0 0-1.2-2.9h-.2a1.7 1.7 0 0 1 0-3.4H5a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1A1.7 1.7 0 0 0 11.5 1h.2a1.7 1.7 0 0 1 3.4 0v.2A1.7 1.7 0 0 0 18 2.4l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1A1.7 1.7 0 0 0 21.6 8h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </aside>

          {/* MAIN CHAT */}
          <main className="main">
            {activeConversation ? (() => {
              const isActiveGroup = activeConversation.members?.length > 2;
              const activeConvName = activeConversation.title || activeConversation.members?.filter(m => m.id !== user?.id).map(m => m.username).join(', ') || 'Saved Messages';
              
              return (
              <>
                <header className="header">
                  <div className="headleft">
                    <div>
                      <div className="title">
                        {activeConvName} 
                        {isActiveGroup && <span className="internal">Internal</span>}
                      </div>
                      <div className="meta">
                        {isActiveGroup ? `${activeConversation.members?.length || 0} members` : 'Direct Message'}
                      </div>
                    </div>
                  </div>
                  <div className="actions">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.4 2.1L8.1 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.4 1.7.6 2.6.7A2 2 0 0 1 22 16.9Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <div className="split">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 5v14" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </header>

                <section className="messages">
                  <div className="messages-inner">
                    <div className="day">
                      <span>Chat History</span>
                    </div>

                  {messages.map((msg) => {
                    const isMe = msg.sender?.id === user?.id;
                    return (
                      <div key={msg.clientMessageId || msg.id} className={`msg ${isMe ? 'me-msg' : ''}`}>
                        <div className="avatar">{getInitials(msg.sender?.username)}</div>
                        <div className="body">
                          <div className="meta2">
                            <span className="name" style={isMe ? { color: '#15b8eb' } : {}}>{msg.sender?.username}</span>
                            <span className="tm">{formatTimeStr(msg.createdAt)}</span>
                          </div>
                          
                          {msg.replyTo && (
                            <div className="replyref">
                              <strong>Replying to {msg.replyTo.sender?.username}</strong>
                              {msg.replyTo.content.substring(0, 30)}...
                            </div>
                          )}

                          <div className="bubble">
                            {msg.fileUrl && (
                              <div style={{ marginBottom: '8px' }}>
                                {msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                  <img src={msg.fileUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                ) : (
                                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#10a8dc', textDecoration: 'underline' }}>
                                    📎 Download Attachment
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {typingUsers.filter(t => t.userId !== user?.id).map((t) => (
                    <div key={t.userId} className="typing">
                      <div className="avatar mini">{getInitials(t.username)}</div>
                      <div className="dots"><i></i><i></i><i></i></div>
                      <span>{t.username} is typing...</span>
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef} />
                  </div>
                </section>

                <footer className="composer">
                  <div className="composer-inner">
                    <div className="input">
                      <span className="plus" onClick={() => document.getElementById('file-upload')?.click()}>+</span>
                      <input 
                        id="file-upload"
                        type="file" 
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !activeConversationId || !user) return;
                          
                          // Optimistic message for file
                          const clientMessageId = generateClientMessageId();
                          const optimisticMsg: Message = {
                            id: -Date.now(),
                            conversationId: activeConversationId,
                            sender: user,
                            content: `📎 ${file.name}`,
                            fileUrl: null,
                            replyTo: null,
                            status: 'SENDING',
                            clientMessageId,
                            createdAt: new Date().toISOString(),
                            reactions: [],
                          };
                          
                          setMessages(prev => [...prev, optimisticMsg]);
                          e.target.value = ''; // Reset input
                          
                          try {
                            const result = await chatApi.uploadFile(file);
                            await chatApi.sendMessageRest(activeConversationId, {
                              content: `📎 ${file.name}`,
                              clientMessageId,
                              replyToId: null,
                              fileUrl: result.fileUrl
                            });
                          } catch (err) {
                            console.error('File upload failed:', err);
                          }
                        }}
                      />
                      <input 
                        type="text"
                        placeholder="Type a message... (Press ? for shortcuts)"
                        value={inputText}
                        onChange={handleTypingInput}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <button className="send" onClick={handleSend} disabled={!inputText.trim()}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="m4 12 16-8-4 16-4-6-8-2Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </footer>
              </>
            )})() : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#454a52' }}>
                Select a conversation to start messaging
              </div>
            )}
          </main>
        </div>
      </div>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={closePalette}
        conversations={conversations}
        onSelectConversation={(id) => { setActiveConversationId(id); closePalette(); }}
      />
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
}
