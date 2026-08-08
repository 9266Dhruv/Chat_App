import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
          style={{
            background: 'var(--accent-glow)',
            border: '1px solid rgba(0,229,160,0.2)',
          }}
        >
          <MessageSquare className="w-7 h-7" style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Select a conversation
        </h3>
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
          Choose a conversation from the sidebar or press <kbd
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >Ctrl+K</kbd> to search
        </p>
      </motion.div>
    </div>
  );
}
