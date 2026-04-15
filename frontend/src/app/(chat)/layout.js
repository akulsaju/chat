'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/authStore';
import useSocket from '@/hooks/useSocket';

export default function ChatLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useSocket();

  useEffect(() => {
    const token = localStorage.getItem('chatflow-token');
    if (!token && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('chatflow-token')) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1a1d21]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
