'use client';

import { BellIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Header({ name, description, memberCount, isDM, recipientStatus }) {
  const statusColor =
    recipientStatus === 'online'
      ? 'bg-green-400'
      : recipientStatus === 'away'
      ? 'bg-yellow-400'
      : 'bg-gray-400';

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#363636] bg-white dark:bg-[#1a1d21] flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 dark:text-white truncate text-base">{name}</h2>
            {isDM && recipientStatus && (
              <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor}`} />
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        {memberCount !== undefined && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
            <UserGroupIcon className="w-4 h-4" />
            <span>{memberCount}</span>
          </div>
        )}
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <BellIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
