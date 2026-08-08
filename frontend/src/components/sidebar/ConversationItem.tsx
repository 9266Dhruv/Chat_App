import { motion } from 'framer-motion';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserId?: number;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
  currentUserId,
}: ConversationItemProps) {
  const displayName = conversation.title || conversation.members
    ?.filter((m) => m.id !== currentUserId)
    .map((m) => m.displayName)
    .join(', ') || 'Conversation';

  const lastMsg = conversation.lastMessage;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'h-16 px-3 flex items-center gap-3 cursor-pointer rounded-xl relative transition-colors mb-0.5'
      )}
      style={{
        background: isSelected ? 'var(--bg-hover)' : 'transparent',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Selection indicator */}
      <motion.div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
        style={{ background: 'var(--accent)' }}
        initial={false}
        animate={{ scaleX: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      <UserAvatar name={displayName} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium truncate"
            style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)' }}
          >
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {lastMsg.sender?.displayName ? `${lastMsg.sender.displayName}: ` : ''}
            {lastMsg.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}
