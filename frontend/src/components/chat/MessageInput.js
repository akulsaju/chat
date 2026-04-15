'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PaperClipIcon, PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😢', '🤔', '👀', '✅', '🙏', '😎', '💯', '🚀', '⭐'];

export default function MessageInput({
  placeholder,
  onSend,
  onFileUpload,
  onTyping,
  onStopTyping,
  channelId,
}) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);
    adjustHeight();

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping && onTyping();
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStopTyping && onStopTyping();
    }, 2000);
  };

  const handleSend = useCallback(async () => {
    if (sending) return;

    if (selectedFile) {
      setSending(true);
      try {
        await onFileUpload(selectedFile);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } finally {
        setSending(false);
      }
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    onStopTyping && onStopTyping();

    try {
      await onSend(trimmed);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setSending(false);
    }
  }, [content, selectedFile, onSend, onFileUpload, onStopTyping, sending]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const addEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmojis(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    return () => clearTimeout(typingTimerRef.current);
  }, []);

  const canSend = content.trim().length > 0 || selectedFile;

  return (
    <div className="px-4 pb-4 flex-shrink-0">
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#222529] shadow-sm">
        {selectedFile && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
              📎 {selectedFile.name}
            </span>
            <button
              onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="text-xs text-red-500 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type a message...'}
          rows={1}
          className="w-full px-4 pt-3 pb-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none text-sm"
          style={{ maxHeight: '200px' }}
        />

        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Attach file"
            >
              <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Add emoji"
              >
                <FaceSmileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              {showEmojis && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-[#222529] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 flex flex-wrap gap-1.5 w-52 z-20">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="text-xl hover:scale-125 transition-transform p-1 leading-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            className={`p-2 rounded-lg transition-colors ${
              canSend && !sending
                ? 'bg-[#4a154b] hover:bg-[#611f69] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
