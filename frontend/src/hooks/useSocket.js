'use client';

import { useEffect } from 'react';
import { connect, disconnect, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export default function useSocket() {
  const { token, isAuthenticated, hydrate } = useAuthStore();
  const {
    addMessage,
    updateMessage,
    deleteMessage,
    addDMMessage,
    setTypingUser,
    removeTypingUser,
    setUserOnline,
    setUserOffline,
  } = useChatStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedToken = token || localStorage.getItem('chatflow-token');
    if (!savedToken) return;

    const socket = connect(savedToken);
    if (!socket) return;

    const onNewMessage = ({ data }) => {
      if (data?.message) {
        const msg = data.message;
        const channelId = msg.channel?._id || msg.channel;
        if (channelId) addMessage(channelId, msg);
      }
    };

    const onMessageUpdated = ({ data }) => {
      if (data?.message) {
        const msg = data.message;
        const channelId = msg.channel?._id || msg.channel;
        if (channelId) updateMessage(channelId, msg);
      }
    };

    const onMessageDeleted = ({ data }) => {
      if (data?.messageId && data?.channelId) {
        deleteMessage(data.channelId, data.messageId);
      }
    };

    const onUserTyping = ({ userId, username, channelId }) => {
      setTypingUser(channelId, { userId, username });
    };

    const onUserStopTyping = ({ userId, channelId }) => {
      removeTypingUser(channelId, userId);
    };

    const onUserStatus = ({ userId, status }) => {
      if (status === 'online') setUserOnline(userId);
      else setUserOffline(userId);
    };

    const onNewDM = ({ data }) => {
      if (data?.message) {
        const msg = data.message;
        const senderId = msg.sender?._id || msg.sender;
        const recipientId = msg.recipient?._id || msg.recipient;
        const myId = localStorage.getItem('chatflow-auth')
          ? JSON.parse(localStorage.getItem('chatflow-auth'))?.user?._id
          : null;

        const otherUserId = senderId === myId ? recipientId : senderId;
        if (otherUserId) addDMMessage(otherUserId, msg);
      }
    };

    socket.on('new-message', onNewMessage);
    socket.on('message-updated', onMessageUpdated);
    socket.on('message-deleted', onMessageDeleted);
    socket.on('user-typing', onUserTyping);
    socket.on('user-stop-typing', onUserStopTyping);
    socket.on('user-status', onUserStatus);
    socket.on('new-dm', onNewDM);

    return () => {
      socket.off('new-message', onNewMessage);
      socket.off('message-updated', onMessageUpdated);
      socket.off('message-deleted', onMessageDeleted);
      socket.off('user-typing', onUserTyping);
      socket.off('user-stop-typing', onUserStopTyping);
      socket.off('user-status', onUserStatus);
      socket.off('new-dm', onNewDM);
    };
  }, [token, addMessage, updateMessage, deleteMessage, addDMMessage, setTypingUser, removeTypingUser, setUserOnline, setUserOffline]);
}
