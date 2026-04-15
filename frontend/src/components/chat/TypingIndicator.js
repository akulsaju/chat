'use client';

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0].username} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
  } else {
    text = 'Several people are typing';
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 h-5">
      <span>{text}</span>
      <span className="flex items-end gap-0.5 pb-0.5">
        <span className="typing-dot w-1 h-1 bg-gray-400 rounded-full" />
        <span className="typing-dot w-1 h-1 bg-gray-400 rounded-full" />
        <span className="typing-dot w-1 h-1 bg-gray-400 rounded-full" />
      </span>
    </div>
  );
}
