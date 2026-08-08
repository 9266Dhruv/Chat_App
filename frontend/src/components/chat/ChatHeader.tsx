import { Search, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { Conversation } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface ChatHeaderProps {
  conversation: Conversation;
  showInfoPanel: boolean;
  onToggleInfoPanel: () => void;
}

export function ChatHeader({ conversation, showInfoPanel, onToggleInfoPanel }: ChatHeaderProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const displayName = conversation.title || conversation.members
    ?.filter((m) => m.id !== currentUserId)
    .map((m) => m.displayName)
    .join(', ') || 'Conversation';

  const memberCount = conversation.members?.length || 0;

  return (
    <div
      className="h-16 flex items-center justify-between px-5 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar name={displayName} size="md" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {displayName}
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''} • <span style={{ color: 'var(--accent)' }}>● online</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Search messages"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleInfoPanel}
          className="p-2 rounded-lg transition-colors"
          style={{ color: showInfoPanel ? 'var(--accent)' : 'var(--text-muted)' }}
          aria-label="Toggle info panel"
        >
          {showInfoPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
