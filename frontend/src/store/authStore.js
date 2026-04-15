import { create } from 'zustand';
import { disconnect } from '@/lib/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatflow-token', token);
      localStorage.setItem('chatflow-auth', JSON.stringify({ user, token }));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatflow-token');
      localStorage.removeItem('chatflow-auth');
    }
    disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    if (typeof window !== 'undefined') {
      const token = get().token;
      localStorage.setItem('chatflow-auth', JSON.stringify({ user: updated, token }));
    }
    set({ user: updated });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('chatflow-auth');
      if (saved) {
        const { user, token } = JSON.parse(saved);
        if (user && token) {
          set({ user, token, isAuthenticated: true });
        }
      }
    } catch {}
  },
}));
