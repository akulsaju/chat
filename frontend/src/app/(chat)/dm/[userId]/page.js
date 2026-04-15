'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import Header from '@/components/layout/Header';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

export default function DMPage() {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const { dmConversations, setDMMessages, addDMMessage } = useChatStore();
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const dmMessages = dmConversations[userId] || [];

  const fetchRecipient = useCallback(async () => {
    try {
      const res = await api.get(`/users/${userId}`);
      setRecipient(res.data.data.user);
    } catch {
      toast.error('Failed to load user');
    }
  }, [userId]);

  const fetchMessages = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}/dm?page=${pageNum}&limit=50`);
        const fetched = res.data.data.messages;
        if (pageNum === 1) {
          setDMMessages(userId, fetched);
        } else {
          setDMMessages(userId, [...fetched, ...(dmConversations[userId] || [])]);
        }
        setHasMore(fetched.length === 50);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    },
    [userId, setDMMessages, dmConversations]
  );

  useEffect(() => {
    fetchRecipient();
    fetchMessages(1);
    setPage(1);
  }, [userId]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchMessages(next);
  }, [hasMore, loading, page, fetchMessages]);

  const handleSend = useCallback(
    async (content) => {
      try {
        await api.post(`/users/${userId}/dm`, { content });
      } catch {
        toast.error('Failed to send message');
      }
    },
    [userId]
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        name={recipient ? `@${recipient.username}` : ''}
        description={`Direct message with ${recipient?.username || '...'}`}
        isDM
        recipientStatus={recipient?.status}
      />
      <MessageList
        messages={dmMessages}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        currentUserId={user?._id}
        isDM
      />
      <MessageInput
        placeholder={recipient ? `Message @${recipient.username}` : 'Message'}
        onSend={handleSend}
        onTyping={() => {}}
        onStopTyping={() => {}}
      />
    </div>
  );
}
