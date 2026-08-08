import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

// Generate a consistent hue from the name string
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function UserAvatar({ name, size = 'md', online, className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hue = nameToHue(name);

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold',
          sizeMap[size]
        )}
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 60%, 25%), hsl(${hue}, 70%, 35%))`,
          color: `hsl(${hue}, 80%, 80%)`,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <div
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2',
          )}
          style={{
            background: online ? 'var(--accent)' : 'var(--text-muted)',
            borderColor: 'var(--bg-surface)',
          }}
        />
      )}
    </div>
  );
}
