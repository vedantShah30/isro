'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * ChatSection Component
 * 
 * A chat interface component with tabs for filtering by category (All, Captioning, Grounding, VQA).
 * Displays user queries (right side, blue bubbles) and AI responses (left side, dark boxes).
 * 
 * @param {Object} props - Component props
 * @param {Array} props.chatHistory - Array of chat objects: [{ id?: number, query: string, response: string, category: 'Captioning'|'Grounding'|'VQA', timestamp?: Date, coordinates?: Array }]
 * @param {Function} props.onQueryClick - Callback function when a query is clicked: (chat: Object) => void
 * @param {String} props.selectedQueryId - ID of the currently selected query
 */
export default function ChatSection({ 
  chatHistory = [],
  onQueryClick = null,
  selectedQueryId = null
}) {
  const [activeTab, setActiveTab] = useState('All');
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Hide scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .chat-messages-area::-webkit-scrollbar {
        display: none;
      }
      .chat-messages-area {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const tabs = ['All', 'Captioning', 'Grounding', 'VQA'];

  // Filter chat history based on active tab
  const filteredChatHistory = activeTab === 'All' 
    ? chatHistory 
    : chatHistory.filter(chat => chat.category === activeTab);

  const handleQueryClick = (chat) => {
    if (onQueryClick && typeof onQueryClick === 'function') {
      onQueryClick(chat);
    }
  };

  return (
    <div className="w-full h-[65vh] flex flex-col bg-[#0f1720] border border-cyan-700/10 rounded-2xl overflow-hidden min-h-[420px] shadow-lg">
      {/* Tabs Section */}
      <div className="flex items-center justify-center py-1 border-b border-cyan-700/10">
        <div className="flex space-x-4 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-2 transition-colors relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-slate-300/60 hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 chat-messages-area">
        {filteredChatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No chat history yet. Start a conversation below.
          </div>
        ) : (
          filteredChatHistory.map((chat) => (
            <div key={chat.id} className="space-y-3">
              {/* User Query - Right Side */}
              <div className="flex flex-col items-end">
                {/* Category Label */}
                <span className="text-xs text-blue-400 mb-0.5 px-2 font-medium">
                  {chat.category}
                </span>
                {/* Query Bubble */}
                <button
                  className={`bg-blue-600 text-white px-2 py-3 rounded-lg max-w-[75%] shadow-md transition-all cursor-pointer focus:outline-none ${
                    selectedQueryId === chat.id
                      ? "ring-2 ring-cyan-400 ring-offset-transparent"
                      : "hover:bg-blue-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQueryClick(chat);
                  }}
                >
                  <p className="leading-relaxed text-left">{chat.query}</p>
                </button>
              </div>

              {/* AI Response - Left Side */}
              {chat.response ? (
                <div className="flex flex-col items-start">
                  <div className="bg-black text-white px-2 py-3 rounded-lg max-w-[75%] border border-black shadow-lg">
                    <p className="leading-relaxed">{chat.response}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="bg-black text-white px-2 py-3 rounded-lg max-w-[75%] border border-black shadow-lg">
                    <div className="flex items-center space-x-2">
                      <svg>
                        <circle
                          className="opacity-25"
                          cx="14"
                          cy="14"
                          r="25"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-sm text-slate-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}