import { useState, useMemo } from 'react';
import { Search, LogOut, Volume2, VolumeX, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationItem } from './ConversationItem';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useSound } from '@/hooks/useSound';
import type { Conversation } from '@/types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export function Sidebar({ conversations, activeId, onSelect, isLoading }: SidebarProps) {
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { isMuted, toggleMute } = useSound();

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.members?.some((m) => m.displayName?.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  return (
    <div
      className="w-80 flex flex-col shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#060b11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Nexus</span>
        </div>
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div
          className="h-10 rounded-xl px-3 flex items-center gap-2"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            id="sidebar-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 px-3 flex items-center gap-3 rounded-xl">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 skeleton" />
                  <div className="h-3 w-36 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === activeId}
                onClick={() => onSelect(conv.id)}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* User profile bar */}
      {user && (
        <div
          className="p-3 flex items-center gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <UserAvatar name={user.displayName} size="md" online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {user.displayName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--danger)' }}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
