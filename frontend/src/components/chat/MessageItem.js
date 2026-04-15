'use client';

import { useState, useCallback } from 'react';
import { formatDistanceToNow, format, isAfter, subDays } from 'date-fns';
import {
  PencilIcon,
  TrashIcon,
  FaceSmileIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '😢', '🤔', '👀'];

function UserAvatar({ user }) {
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
  const colors = ['bg-purple-600', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];
  const color = colors[(user?.username?.charCodeAt(0) || 0) % colors.length];
  if (user?.avatar) {
    return (
      <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-lg object-cover" />
    );
  }
  return (
    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function formatTime(date) {
  const d = new Date(date);
  const recent = isAfter(d, subDays(new Date(), 1));
  if (recent) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, 'MMM d, yyyy h:mm a');
}

export default function MessageItem({ message, isConsecutive, isOwn, onEdit, onDelete, onReact }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSaveEdit = useCallback(async () => {
    if (editContent.trim() && onEdit) {
      await onEdit(message._id, editContent.trim());
    }
    setEditing(false);
  }, [editContent, message._id, onEdit]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditContent(message.content || '');
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  return (
    <div
      className={`group relative flex gap-3 px-4 py-1 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
        isConsecutive ? 'mt-0.5' : 'mt-3'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar or spacer */}
      <div className="w-9 flex-shrink-0 pt-0.5">
        {!isConsecutive ? (
          <UserAvatar user={message.sender} />
        ) : (
          <span className="block w-9" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {!isConsecutive && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              {message.sender?.username || 'Unknown'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(message.createdAt)}
            </span>
            {message.updatedAt !== message.createdAt && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}
          </div>
        )}

        {editing ? (
          <div className="flex flex-col gap-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full rounded border border-purple-500 bg-white dark:bg-[#222529] text-gray-900 dark:text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
            <div className="flex gap-2 text-xs">
              <button
                onClick={handleSaveEdit}
                className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setEditContent(message.content || ''); }}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.type === 'file' ? (
              <div className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#222529] w-fit">
                <DocumentIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <a
                  href={`${apiBase}${message.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-400 underline"
                >
                  {message.fileName || 'Download file'}
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words message-content">
                {message.content}
              </p>
            )}
          </>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact && onReact(message._id, r.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#222529] hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
              >
                <span>{r.emoji}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {hovered && !editing && (
        <div className="absolute right-4 top-0 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-[#222529] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-1 py-1 z-10">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="React"
            >
              <FaceSmileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            {showEmojiPicker && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#222529] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 flex gap-1 z-20">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => { onReact && onReact(message._id, emoji); setShowEmojiPicker(false); }}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isOwn && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => onDelete && onDelete(message._id)}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
