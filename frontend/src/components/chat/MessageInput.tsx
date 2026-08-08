import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X } from 'lucide-react';
import { generateClientMessageId } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageInputProps {
  conversationId: number;
  onSend: (content: string, clientMessageId: string, replyToId?: number | null) => void;
  onTyping: (isTyping: boolean) => void;
  onFileUpload: (file: File) => void;
  replyTo: Message | null;
  onCancelReply: () => void;
  pendingFile: File | null;
  onCancelFile: () => void;
}

export function MessageInput({
  conversationId,
  onSend,
  onTyping,
  onFileUpload,
  replyTo,
  onCancelReply,
  pendingFile,
  onCancelFile,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [content]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
  }

  function handleSend() {
    const trimmed = content.trim();
    if (!trimmed && !pendingFile) return;

    const clientMessageId = generateClientMessageId();
    onSend(trimmed || '📎 File', clientMessageId, replyTo?.id || null);
    setContent('');
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const canSend = content.trim().length > 0 || pendingFile;

  return (
    <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }} className="shrink-0">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-3 flex items-center gap-3">
              <div
                className="flex-1 pl-3 py-1.5 rounded-lg"
                style={{
                  borderLeft: '2px solid var(--accent)',
                  background: 'var(--accent-glow)',
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  Replying to {replyTo.sender?.displayName}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {replyTo.content?.substring(0, 80)}
                </p>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending file preview */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-3 flex items-center gap-3">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <Paperclip className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {pendingFile.name}
                </span>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {(pendingFile.size / 1024).toFixed(1)}KB
                </span>
              </div>
              <button
                onClick={onCancelFile}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="p-4 flex items-end gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl shrink-0 transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-4 py-2.5 text-sm resize-none outline-none rounded-xl transition-colors"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!canSend}
          className="p-2.5 rounded-xl shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: canSend ? 'var(--accent)' : 'var(--bg-elevated)',
            color: canSend ? 'var(--bg-primary)' : 'var(--text-muted)',
            boxShadow: canSend ? '0 0 20px var(--accent-glow)' : 'none',
          }}
          title="Send (Enter)"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
