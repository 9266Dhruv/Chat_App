import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, FileText, Download } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { Conversation } from '@/types';
import { useState } from 'react';

interface InfoPanelProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export function InfoPanel({ conversation, isOpen, onClose }: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'files'>('members');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="shrink-0 overflow-hidden flex flex-col"
          style={{
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="h-16 flex items-center justify-between px-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Details
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex p-2 gap-1"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setActiveTab('members')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: activeTab === 'members' ? 'var(--accent-glow)' : 'transparent',
                color: activeTab === 'members' ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Users className="w-3.5 h-3.5" /> Members
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: activeTab === 'files' ? 'var(--accent-glow)' : 'transparent',
                color: activeTab === 'files' ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <FileText className="w-3.5 h-3.5" /> Files
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'members' && (
              <div className="space-y-1">
                {conversation.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-xl"
                  >
                    <UserAvatar name={member.displayName} size="sm" online />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {member.displayName}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        @{member.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  No files shared yet
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
