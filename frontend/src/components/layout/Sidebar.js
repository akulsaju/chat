'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  HashtagIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import CreateChannelModal from '@/components/modals/CreateChannelModal';
import JoinChannelModal from '@/components/modals/JoinChannelModal';

function StatusDot({ status }) {
  const color =
    status === 'online' ? 'bg-green-400' : status === 'away' ? 'bg-yellow-400' : 'bg-gray-400';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color} border-2 border-[#19171d]`} />;
}

function UserAvatar({ user, size = 8 }) {
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
  const colors = ['bg-purple-600', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];
  const color = colors[(user?.username?.charCodeAt(0) || 0) % colors.length];
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className={`w-${size} h-${size} rounded-lg object-cover`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-lg ${color} flex items-center justify-center text-white text-xs font-bold`}
    >
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { channels, setChannels, addChannel, isDarkMode, toggleDarkMode, onlineUsers } =
    useChatStore();

  const [search, setSearch] = useState('');
  const [dmUsers, setDmUsers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await api.get('/channels');
      setChannels(res.data.data.channels);
    } catch {
      toast.error('Failed to load channels');
    }
  }, [setChannels]);

  const fetchDMUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setDmUsers(res.data.data.users.filter((u) => u._id !== user?._id));
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchChannels();
    fetchDMUsers();
  }, [fetchChannels, fetchDMUsers]);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = dmUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full bg-[#19171d] text-gray-300 border-r border-[#362c37]">
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-[#362c37] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4a154b] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">CF</span>
          </div>
          <span className="font-bold text-white text-sm">ChatFlow</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
        >
          {isDarkMode ? (
            <SunIcon className="w-4 h-4 text-gray-300" />
          ) : (
            <MoonIcon className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>

      {/* Current user */}
      {user && (
        <div className="px-3 py-2 border-b border-[#362c37] flex items-center gap-2">
          <div className="relative">
            <UserAvatar user={user} size={8} />
            <span className="absolute -bottom-0.5 -right-0.5">
              <StatusDot status={user.status || 'online'} />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 bg-[#2a2535] rounded px-2 py-1.5">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none w-full"
          />
        </div>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Channels */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Channels
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setJoinOpen(true)}
                title="Browse channels"
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                title="Create channel"
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
          {filteredChannels.map((ch) => {
            const isActive = pathname === `/chat/${ch._id}`;
            return (
              <Link
                key={ch._id}
                href={`/chat/${ch._id}`}
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#4a154b] text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <HashtagIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{ch.name}</span>
              </Link>
            );
          })}
          {filteredChannels.length === 0 && search && (
            <p className="px-2 py-1 text-xs text-gray-500">No channels found</p>
          )}
        </div>

        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Direct Messages
            </span>
          </div>
          {filteredUsers.map((u) => {
            const isActive = pathname === `/dm/${u._id}`;
            const isOnline = onlineUsers[u._id] === 'online' || u.status === 'online';
            return (
              <Link
                key={u._id}
                href={`/dm/${u._id}`}
                className={`flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#4a154b] text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar user={u} size={5} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#19171d] ${
                      isOnline ? 'bg-green-400' : 'bg-gray-500'
                    }`}
                  />
                </div>
                <span className="truncate">{u.username}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-3 py-3 border-t border-[#362c37] flex items-center gap-2">
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Logout</span>
        </button>
        <div className="flex-1" />
        <button title="Settings" className="p-1 rounded hover:bg-white/10 transition-colors">
          <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <CreateChannelModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(ch) => {
          addChannel(ch);
          setCreateOpen(false);
          router.push(`/chat/${ch._id}`);
        }}
      />
      <JoinChannelModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        currentChannels={channels}
        onJoined={fetchChannels}
      />
    </div>
  );
}
