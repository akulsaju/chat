'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, HashtagIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function JoinChannelModal({ open, onClose, currentChannels, onJoined }) {
  const [allChannels, setAllChannels] = useState([]);
  const [search, setSearch] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api
        .get('/channels')
        .then((res) => setAllChannels(res.data.data.channels))
        .catch(() => toast.error('Failed to load channels'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const filtered = allChannels.filter(
    (ch) =>
      !ch.isPrivate &&
      ch.name.toLowerCase().includes(search.toLowerCase())
  );

  const isJoined = (channelId) =>
    currentChannels.some((c) => c._id === channelId);

  const handleJoin = async (channelId, name) => {
    setJoiningId(channelId);
    try {
      await api.post(`/channels/${channelId}/join`);
      toast.success(`Joined #${name}!`);
      onJoined && onJoined();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join channel');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-[#222529] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                  Browse channels
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search channels..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1d21] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm">No channels found</div>
                )}
                {filtered.map((ch) => {
                  const joined = isJoined(ch._id);
                  return (
                    <div
                      key={ch._id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <HashtagIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ch.name}</p>
                        {ch.description && (
                          <p className="text-xs text-gray-400 truncate">{ch.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <UserGroupIcon className="w-3.5 h-3.5" />
                          {ch.members?.length || 0}
                        </span>
                        {joined ? (
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                            Joined
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoin(ch._id, ch.name)}
                            disabled={joiningId === ch._id}
                            className="text-xs px-3 py-1 bg-[#4a154b] hover:bg-[#611f69] text-white rounded-full transition-colors disabled:opacity-60 font-medium"
                          >
                            {joiningId === ch._id ? 'Joining...' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
