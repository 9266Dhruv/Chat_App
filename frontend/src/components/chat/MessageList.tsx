import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { NewMessagesButton } from './NewMessagesButton';
import { isSameDay, isWithinMinutes, formatDate } from '@/lib/utils';
import type { Message, TypingEvent } from '@/types';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  typingUsers: TypingEvent[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onReply: (message: Message) => void;
  onDelete: (messageId: number) => void;
  onReact: (messageId: number, emoji: string) => void;
  onFileDrop: (file: File) => void;
}

export function MessageList({
  messages,
  currentUserId,
  typingUsers,
  isLoading,
  hasMore,
  onLoadMore,
  onReply,
  onDelete,
  onReact,
  onFileDrop,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessagesLenRef = useRef(messages.length);
  const [isDragOver, setIsDragOver] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMessageCount(0);

    if (el.scrollTop < 50 && hasMore && !isLoading) {
      onLoadMore();
    }
  }

  useEffect(() => {
    const newLen = messages.length;
    const prevLen = prevMessagesLenRef.current;
    if (newLen > prevLen) {
      const addedCount = newLen - prevLen;
      if (isAtBottom) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setNewMessageCount((c) => c + addedCount);
      }
    }
    prevMessagesLenRef.current = newLen;
  }, [messages.length, isAtBottom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessageCount(0);
  }

  function scrollToMessage(messageId: number) {
    const el = containerRef.current?.querySelector(`[data-message-id="${messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(messageId);
      setTimeout(() => setHighlightedId(null), 1500);
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileDrop(file);
  }, [onFileDrop]);

  function shouldGroup(msg: Message, prevMsg: Message | null): boolean {
    if (!prevMsg) return false;
    if (msg.sender?.id !== prevMsg.sender?.id) return false;
    return isWithinMinutes(msg.createdAt, prevMsg.createdAt, 5);
  }

  const displayMessages = [...messages].reverse();

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto relative"
      style={{ background: 'var(--bg-primary)' }}
      onScroll={handleScroll}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="log"
      aria-live="polite"
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'justify-end'}`}>
              {i % 2 === 0 && <div className="w-8 h-8 rounded-full skeleton shrink-0" />}
              <div className={`space-y-1 ${i % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
                <div className="h-3 w-20 skeleton" />
                <div className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-36'} skeleton rounded-2xl`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !isLoading && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            className="text-xs font-medium px-4 py-2 rounded-full transition-colors"
            style={{
              color: 'var(--accent)',
              background: 'var(--accent-glow)',
              border: '1px solid rgba(0,229,160,0.2)',
            }}
          >
            Load older messages
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="pb-3 pt-3">
        {displayMessages.map((msg, i) => {
          const prevMsg = i > 0 ? displayMessages[i - 1] : null;
          const isGrouped = shouldGroup(msg, prevMsg);
          const showDateSep = !prevMsg || !isSameDay(msg.createdAt, prevMsg.createdAt);

          return (
            <div key={msg.id || msg.clientMessageId}>
              {showDateSep && (
                <div className="flex items-center justify-center my-5">
                  <span
                    className="text-xs px-4 py-1.5 rounded-full font-medium"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}

              <div
                className="transition-colors duration-700 rounded-xl"
                style={{
                  background: highlightedId === msg.id ? 'var(--accent-glow)' : 'transparent',
                }}
              >
                <MessageBubble
                  message={msg}
                  isOwn={msg.sender?.id === currentUserId}
                  isGrouped={isGrouped}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  onReact={onReact}
                  onScrollToMessage={scrollToMessage}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicators */}
      {typingUsers.filter(t => t.typing && t.userId !== currentUserId).map((t) => (
        <TypingIndicator key={t.userId} username={t.username} />
      ))}

      <div ref={bottomRef} />

      <NewMessagesButton
        count={newMessageCount}
        visible={newMessageCount > 0 && !isAtBottom}
        onClick={scrollToBottom}
      />

      {/* Drag & drop overlay */}
      {isDragOver && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center rounded-xl"
          style={{
            background: 'rgba(0, 229, 160, 0.05)',
            border: '3px dashed var(--accent)',
          }}
        >
          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>Drop file here</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Max 10MB • Images, PDFs, Text</p>
          </div>
        </div>
      )}
    </div>
  );
}
