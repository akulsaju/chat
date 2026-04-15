import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  channels: [],
  activeChannel: null,
  messages: {},
  dmConversations: {},
  typingUsers: {},
  onlineUsers: {},
  isDarkMode: false,

  setChannels: (channels) => set({ channels }),

  addChannel: (channel) =>
    set((state) => ({
      channels: [...state.channels.filter((c) => c._id !== channel._id), channel],
    })),

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: messages },
    })),

  addMessage: (channelId, message) =>
    set((state) => {
      const existing = state.messages[channelId] || [];
      const deduped = existing.filter((m) => m._id !== message._id);
      return { messages: { ...state.messages, [channelId]: [...deduped, message] } };
    }),

  updateMessage: (channelId, message) =>
    set((state) => {
      const existing = state.messages[channelId] || [];
      return {
        messages: {
          ...state.messages,
          [channelId]: existing.map((m) => (m._id === message._id ? message : m)),
        },
      };
    }),

  deleteMessage: (channelId, messageId) =>
    set((state) => {
      const existing = state.messages[channelId] || [];
      return {
        messages: {
          ...state.messages,
          [channelId]: existing.filter((m) => m._id !== messageId),
        },
      };
    }),

  setDMMessages: (userId, messages) =>
    set((state) => ({
      dmConversations: { ...state.dmConversations, [userId]: messages },
    })),

  addDMMessage: (userId, message) =>
    set((state) => {
      const existing = state.dmConversations[userId] || [];
      const deduped = existing.filter((m) => m._id !== message._id);
      return {
        dmConversations: { ...state.dmConversations, [userId]: [...deduped, message] },
      };
    }),

  setTypingUser: (channelId, user) =>
    set((state) => {
      const existing = (state.typingUsers[channelId] || []).filter(
        (u) => u.userId !== user.userId
      );
      return {
        typingUsers: { ...state.typingUsers, [channelId]: [...existing, user] },
      };
    }),

  removeTypingUser: (channelId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [channelId]: (state.typingUsers[channelId] || []).filter((u) => u.userId !== userId),
      },
    })),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: 'online' },
    })),

  setUserOffline: (userId) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: 'offline' },
    })),

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    if (typeof document !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatflow-dark-mode', String(next));
    }
    set({ isDarkMode: next });
  },
}));
