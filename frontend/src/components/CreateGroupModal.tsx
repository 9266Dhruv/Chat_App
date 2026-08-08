import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { searchUsers, createConversation } from '@/api/chatApi';
import type { User } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: number) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSelectConversation }: CreateGroupModalProps) {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const me = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search users
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      searchUsers(query)
        .then((users) => {
          // Filter out ourselves AND users already selected
          const selectedIds = new Set(selectedUsers.map(u => u.id));
          setSearchResults(users.filter((u) => u.id !== me?.id && !selectedIds.has(u.id)));
        })
        .catch(console.error)
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [query, me, selectedUsers]);

  const toggleUser = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
      setQuery('');
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || selectedUsers.length === 0) return;
    
    setIsCreating(true);
    try {
      // API expects memberIds (the backend adds the creator automatically)
      const memberIds = selectedUsers.map(u => u.id);
      const conv = await createConversation(title.trim(), memberIds);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onSelectConversation(conv.id);
      onClose();
    } catch (err) {
      console.error('Failed to create group', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              maxHeight: '85vh'
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-primary)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Create Group
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              {/* Group Name Input */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  GROUP NAME
                </label>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Engineering Team"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{ 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)' 
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(u => (
                    <div 
                      key={u.id}
                      className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'var(--accent-glow)', border: `1px solid var(--accent)`, color: 'var(--accent)' }}
                    >
                      {u.username}
                      <button 
                        onClick={() => toggleUser(u)}
                        className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* User Search Input */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  ADD MEMBERS
                </label>
                <div 
                  className="flex items-center gap-2 px-3 h-10 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Search Results */}
              {query.trim().length >= 2 && (
                <div className="flex flex-col gap-1 mt-1">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => toggleUser(u)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">{u.username}</span>
                        <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{u.displayName}</span>
                      </div>
                    </button>
                  ))}
                  {searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleCreate}
                disabled={isCreating || !title.trim() || selectedUsers.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  boxShadow: (!title.trim() || selectedUsers.length === 0) ? 'none' : '0 0 20px var(--accent-glow)'
                }}
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Group
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
