import { UserAvatar } from '@/components/ui/UserAvatar';

interface TypingIndicatorProps {
  username: string;
}

export function TypingIndicator({ username }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-2">
      <UserAvatar name={username} size="sm" />
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {username} is typing
        </span>
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce-dot animate-bounce-dot-1"
            style={{ background: 'var(--accent)' }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce-dot animate-bounce-dot-2"
            style={{ background: 'var(--accent)' }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full animate-bounce-dot animate-bounce-dot-3"
            style={{ background: 'var(--accent)' }}
          />
        </div>
      </div>
    </div>
  );
}
