import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Smile, Trash2, Copy, Check, CheckCheck, FileText, Download } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { cn, formatTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isGrouped: boolean;
  currentUserId: number;
  onReply: (message: Message) => void;
  onDelete: (messageId: number) => void;
  onReact: (messageId: number, emoji: string) => void;
  onScrollToMessage?: (messageId: number) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '🔥'];

export function MessageBubble({
  message,
  isOwn,
  isGrouped,
  currentUserId,
  onReply,
  onDelete,
  onReact,
  onScrollToMessage,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number } | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setShowContextMenu({ x: e.clientX, y: e.clientY });
  }

  function handleCopyText() {
    navigator.clipboard.writeText(message.content);
    setShowContextMenu(null);
  }

  function handleReplyClick() {
    onReply(message);
    setShowContextMenu(null);
    setShowActions(false);
  }

  function handleReplyToClick() {
    if (message.replyTo?.id && onScrollToMessage) {
      onScrollToMessage(message.replyTo.id);
    }
  }

  function renderStatus() {
    if (!isOwn) return null;
    const s = message.status;
    if (s === 'SENDING') return <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--text-muted)' }} />;
    if (s === 'READ') return <CheckCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />;
    if (s === 'DELIVERED') return <CheckCheck className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />;
    return <Check className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 px-5 group relative',
        isOwn ? 'justify-end' : 'justify-start',
        isGrouped ? 'mt-0.5' : 'mt-4'
      )}
      data-message-id={message.id}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
      onContextMenu={handleContextMenu}
    >
      {/* Avatar (others only) */}
      {!isOwn && (
        <div className="w-8 shrink-0">
          {!isGrouped && (
            <UserAvatar name={message.sender?.displayName || 'User'} size="sm" className="mt-1" />
          )}
        </div>
      )}

      <div className={cn('relative max-w-[65%]', isOwn && 'ml-auto')}>
        {/* Sender name */}
        {!isOwn && !isGrouped && (
          <p className="text-xs font-medium mb-1 ml-1" style={{ color: 'var(--text-secondary)' }}>
            {message.sender?.displayName}
          </p>
        )}

        {/* Bubble */}
        <div
          ref={bubbleRef}
          className={cn(
            'px-4 py-3 text-sm relative',
            isOwn
              ? 'rounded-2xl rounded-tr-md'
              : 'rounded-2xl rounded-tl-md'
          )}
          style={{
            background: isOwn ? 'var(--bubble-own)' : 'var(--bubble-other)',
            border: `1px solid ${isOwn ? 'var(--bubble-own-border)' : 'var(--bubble-other-border)'}`,
          }}
        >
          {/* Reply preview */}
          {message.replyTo && (
            <div
              className="pl-3 mb-2 cursor-pointer hover:opacity-80 rounded-lg py-1.5"
              style={{
                borderLeft: '2px solid var(--accent)',
                background: 'rgba(0, 229, 160, 0.05)',
              }}
              onClick={handleReplyToClick}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                {message.replyTo.sender?.displayName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {message.replyTo.content?.substring(0, 60)}
              </p>
            </div>
          )}

          {/* Content */}
          <p className="whitespace-pre-wrap break-words" style={{ color: 'var(--text-primary)' }}>
            {message.content}
          </p>

          {/* File attachment */}
          {message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors"
              style={{
                background: 'rgba(0,229,160,0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(0,229,160,0.15)',
              }}
            >
              <FileText className="w-4 h-4" />
              <span className="flex-1 truncate">Attachment</span>
              <Download className="w-3 h-3" />
            </a>
          )}

          {/* Time + status */}
          <div className={cn('flex items-center gap-1.5 mt-1.5', isOwn ? 'justify-end' : 'justify-start')}>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {formatTime(message.createdAt)}
            </span>
            {renderStatus()}
          </div>
        </div>

        {/* Reactions row */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {message.reactions.map((r) => (
              <motion.button
                key={r.emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => onReact(message.id, r.emoji)}
                className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1 transition-colors"
                style={{
                  background: r.userIds.includes(currentUserId)
                    ? 'var(--accent-glow)'
                    : 'var(--bg-elevated)',
                  border: `1px solid ${r.userIds.includes(currentUserId) ? 'rgba(0,229,160,0.3)' : 'var(--border)'}`,
                  color: r.userIds.includes(currentUserId) ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {r.emoji} {r.count}
              </motion.button>
            ))}
          </div>
        )}

        {/* Hover action bar */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className={cn(
                'absolute -top-9 flex p-1 gap-0.5 z-20 rounded-xl',
                isOwn ? 'right-0' : 'left-0'
              )}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={handleReplyClick}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {isOwn && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--danger)' }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji picker popup */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'absolute -top-[72px] p-2 flex gap-1 z-30 rounded-xl',
                isOwn ? 'right-0' : 'left-0'
              )}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReact(message.id, emoji); setShowEmojiPicker(false); }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-base"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="fixed py-2 min-w-[180px] z-50 rounded-xl"
              style={{
                top: showContextMenu.y,
                left: showContextMenu.x,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={handleReplyClick}
                className="px-4 h-9 w-full flex items-center gap-3 text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Reply className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> Reply
              </button>
              <button
                onClick={handleCopyText}
                className="px-4 h-9 w-full flex items-center gap-3 text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Copy className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> Copy Text
              </button>
              <button
                onClick={() => { setShowEmojiPicker(true); setShowContextMenu(null); setShowActions(true); }}
                className="px-4 h-9 w-full flex items-center gap-3 text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Smile className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> React
              </button>
              {isOwn && (
                <>
                  <div className="mx-3 my-1" style={{ height: '1px', background: 'var(--border)' }} />
                  <button
                    onClick={() => { onDelete(message.id); setShowContextMenu(null); }}
                    className="px-4 h-9 w-full flex items-center gap-3 text-sm transition-colors"
                    style={{ color: 'var(--danger)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
