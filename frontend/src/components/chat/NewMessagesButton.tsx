import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface NewMessagesButtonProps {
  count: number;
  visible: boolean;
  onClick: () => void;
}

export function NewMessagesButton({ count, visible, onClick }: NewMessagesButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onClick}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full z-20 transition-colors"
          style={{
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            boxShadow: '0 4px 20px var(--accent-glow-strong)',
          }}
        >
          <ChevronDown className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {count} new message{count > 1 ? 's' : ''}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
