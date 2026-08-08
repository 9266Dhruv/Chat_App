import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, LogOut, Command } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { searchUsers, createConversation } from '@/api/chatApi';
import type { Conversation, User } from '@/types';
import { UserPlus } from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: number) => void;
}

export function CommandPalette({ isOpen, onClose, conversations, onSelectConversation }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((s) => s.logout);
  const me = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (query.trim().length >= 2) {
      searchUsers(query).then(users => {
        // Filter out ourselves
        setGlobalUsers(users.filter(u => u.id !== me?.id));
      }).catch(console.error);
    } else {
      setGlobalUsers([]);
    }
  }, [query, me]);

  const filteredConversations = conversations.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.members?.some((m) => m.displayName?.toLowerCase().includes(q) || m.username.toLowerCase().includes(q))
    );
  });

  const actions = [
    ...filteredConversations.map((c) => ({
      id: `conv-${c.id}`,
      label: c.title || c.members?.filter(m => m.id !== me?.id).map((m) => m.username).join(', ') || 'Saved Messages',
      icon: 'conversation' as const,
      action: () => onSelectConversation(c.id),
    })),
    ...globalUsers.map((u) => ({
      id: `user-${u.id}`,
      label: `Start chat with ${u.username} (${u.displayName})`,
      icon: 'user' as const,
      action: async () => {
        try {
          const conv = await createConversation('', [u.id]);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          onSelectConversation(conv.id);
        } catch (err) {
          console.error(err);
        }
      },
    })),
    {
      id: 'logout',
      label: 'Logout',
      icon: 'logout' as const,
      action: () => { logout(); onClose(); },
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, actions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      actions[selectedIndex]?.action();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [actions, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 h-14"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search conversations or actions..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
              <kbd
                className="px-2 py-1 rounded text-[10px] font-mono"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto p-2">
              {actions.map((action, i) => (
                <button
                  key={action.id}
                  onClick={() => { action.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                  style={{
                    background: i === selectedIndex ? 'var(--bg-hover)' : 'transparent',
                    color: action.icon === 'logout' ? 'var(--danger)' : 'var(--text-primary)',
                  }}
                >
                  {action.icon === 'conversation' ? (
                    <MessageSquare className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  ) : action.icon === 'user' ? (
                    <UserPlus className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                  ) : (
                    <LogOut className="w-4 h-4 shrink-0" style={{ color: 'var(--danger)' }} />
                  )}
                  <span className="truncate">{action.label}</span>
                  {i === selectedIndex && (
                    <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>↵</span>
                  )}
                </button>
              ))}
              {actions.length === 0 && (
                <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No results found
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 flex items-center gap-4 text-[10px]"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>esc</kbd>
                close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
