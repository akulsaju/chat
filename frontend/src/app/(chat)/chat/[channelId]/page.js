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
import TypingIndicator from '@/components/chat/TypingIndicator';

export default function ChannelPage() {
  const { channelId } = useParams();
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage, setActiveChannel, activeChannel, typingUsers } =
    useChatStore();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const channelMessages = messages[channelId] || [];
  const typing = typingUsers[channelId] || [];

  const fetchChannel = useCallback(async () => {
    try {
      const res = await api.get(`/channels/${channelId}`);
      setChannel(res.data.data.channel);
      setActiveChannel(res.data.data.channel);
    } catch {
      toast.error('Failed to load channel');
    }
  }, [channelId, setActiveChannel]);

  const fetchMessages = useCallback(
    async (pageNum = 1) => {
      try {
        setLoading(true);
        const res = await api.get(`/channels/${channelId}/messages?page=${pageNum}&limit=50`);
        const fetched = res.data.data.messages;
        if (pageNum === 1) {
          setMessages(channelId, fetched);
        } else {
          setMessages(channelId, [...fetched, ...(messages[channelId] || [])]);
        }
        setHasMore(fetched.length === 50);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    },
    [channelId, setMessages, messages]
  );

  useEffect(() => {
    fetchChannel();
    fetchMessages(1);
    setPage(1);

    const socket = getSocket();
    if (socket) {
      socket.emit('join-channel', channelId);
    }

    return () => {
      const s = getSocket();
      if (s) s.emit('leave-channel', channelId);
    };
  }, [channelId]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchMessages(next);
  }, [hasMore, loading, page, fetchMessages]);

  const handleSend = useCallback(
    async (content) => {
      try {
        await api.post(`/messages/channels/${channelId}`, { content });
      } catch {
        toast.error('Failed to send message');
      }
    },
    [channelId]
  );

  const handleFileUpload = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await api.post(`/messages/channels/${channelId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch {
        toast.error('Failed to upload file');
      }
    },
    [channelId]
  );

  const handleEdit = useCallback(async (messageId, content) => {
    try {
      await api.put(`/messages/${messageId}`, { content });
    } catch {
      toast.error('Failed to edit message');
    }
  }, []);

  const handleDelete = useCallback(async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch {
      toast.error('Failed to delete message');
    }
  }, []);

  const handleReact = useCallback(async (messageId, emoji) => {
    try {
      await api.post(`/messages/${messageId}/react`, { emoji });
    } catch {
      toast.error('Failed to react');
    }
  }, []);

  const handleTyping = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('typing', { channelId });
  }, [channelId]);

  const handleStopTyping = useCallback(() => {
    const socket = getSocket();
    if (socket) socket.emit('stop-typing', { channelId });
  }, [channelId]);

  return (
    <div className="flex flex-col h-full">
      <Header
        name={channel ? `#${channel.name}` : ''}
        description={channel?.topic || channel?.description || ''}
        memberCount={channel?.members?.length}
      />
      <MessageList
        messages={channelMessages}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        currentUserId={user?._id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReact={handleReact}
      />
      <div className="px-4 pb-1">
        <TypingIndicator typingUsers={typing} />
      </div>
      <MessageInput
        placeholder={channel ? `Message #${channel.name}` : 'Message'}
        onSend={handleSend}
        onFileUpload={handleFileUpload}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        channelId={channelId}
      />
    </div>
  );
}
