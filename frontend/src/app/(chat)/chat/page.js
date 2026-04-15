'use client';

export default function ChatWelcomePage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#1a1d21]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#4a154b] rounded-3xl mb-6 shadow-lg">
          <span className="text-white text-4xl font-bold">CF</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to ChatFlow
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Select a channel from the sidebar or start a direct conversation with a teammate.
        </p>
      </div>
    </div>
  );
}
