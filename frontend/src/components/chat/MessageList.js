'use client';

import { useEffect, useRef, useCallback } from 'react';
import MessageItem from './MessageItem';
import { format, isSameDay } from 'date-fns';

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
        {format(new Date(date), 'MMMM d, yyyy')}
      </span>
      <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
    </div>
  );
}

export default function MessageList({
  messages,
  loading,
  onLoadMore,
  hasMore,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  isDM,
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevScrollHeight = useRef(0);

  useEffect(() => {
    if (bottomRef.current && containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isNearBottom) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    if (scrollTop < 100 && hasMore && !loading) {
      prevScrollHeight.current = containerRef.current.scrollHeight;
      onLoadMore && onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    if (containerRef.current && prevScrollHeight.current) {
      const diff = containerRef.current.scrollHeight - prevScrollHeight.current;
      containerRef.current.scrollTop += diff;
      prevScrollHeight.current = 0;
    }
  }, [messages]);

  const grouped = messages.reduce((acc, msg, idx) => {
    const prev = messages[idx - 1];
    const isConsecutive =
      prev &&
      prev.sender?._id === msg.sender?._id &&
      new Date(msg.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000;
    acc.push({ message: msg, isConsecutive, showDate: !prev || !isSameDay(new Date(prev.createdAt), new Date(msg.createdAt)) });
    return acc;
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-0 py-2 flex flex-col"
    >
      {loading && messages.length === 0 && (
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            className="text-xs text-purple-500 hover:text-purple-400 transition-colors"
          >
            Load more messages
          </button>
        </div>
      )}

      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {grouped.map(({ message, isConsecutive, showDate }) => (
        <div key={message._id}>
          {showDate && <DateDivider date={message.createdAt} />}
          <MessageItem
            message={message}
            isConsecutive={isConsecutive}
            isOwn={message.sender?._id === currentUserId || message.sender === currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
          />
        </div>
      ))}

      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
