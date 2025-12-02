'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [localSelectedId, setLocalSelectedId] = useState(selectedQueryId);

  // Typing effect state
  const [displayedTexts, setDisplayedTexts] = useState({}); // { messageId: displayedText }
  const [typingMessageId, setTypingMessageId] = useState(null); // Currently typing message ID
  
  const lastProcessedLengthRef = useRef({}); // { messageId: lastLength }
  const charQueueRef = useRef({}); // { messageId: [characters] }
  const typingIntervalRef = useRef(null);
  const isInitializedRef = useRef({}); // Track which messages are initialized

  const typingSpeed = 45; // 45ms per character

  // Keep localSelectedId in sync with prop
  useEffect(() => {
    setLocalSelectedId(selectedQueryId);
  }, [selectedQueryId]);

  // Scroll to bottom when new messages are added or when typing updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, displayedTexts]);

  // Initial scroll to bottom when component mounts
  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Start typing animation
  const startTyping = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      // Find the first message with characters in queue
      let messageIdToType = null;
      
      for (const messageId in charQueueRef.current) {
        if (charQueueRef.current[messageId]?.length > 0) {
          messageIdToType = messageId;
          break;
        }
      }

      if (!messageIdToType) {
        // No more characters to type
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setTypingMessageId(null);
        return;
      }

      // Type one character
      const charQueue = charQueueRef.current[messageIdToType];
      if (charQueue.length > 0) {
        const nextChar = charQueue.shift();
        setTypingMessageId(Number(messageIdToType));
        setDisplayedTexts(prev => ({
          ...prev,
          [messageIdToType]: (prev[messageIdToType] || '') + nextChar
        }));
      }
    }, typingSpeed);
  }, [typingSpeed]);

  // Main typing effect logic - detect new content and add to character queue
  useEffect(() => {
    chatHistory.forEach((chat) => {
      const messageId = chat.id;
      const fullResponse = chat.response || '';

      // Skip if response is "Processing..."
      if (fullResponse === "Processing...") {
        return;
      }

      // Initialize tracking only once per message
      if (!isInitializedRef.current[messageId]) {
        lastProcessedLengthRef.current[messageId] = 0;
        charQueueRef.current[messageId] = [];
        isInitializedRef.current[messageId] = true;
        
        // Check if this is a new message (being streamed) or an old message (already complete)
        // Old messages should be shown immediately without typing effect
        const isOldMessage = fullResponse.length > 0 && !fullResponse.includes("Processing");
        
        setDisplayedTexts(prev => {
          if (prev[messageId] === undefined) {
            // If it's an old/complete message, show it immediately
            if (isOldMessage) {
              lastProcessedLengthRef.current[messageId] = fullResponse.length;
              return { ...prev, [messageId]: fullResponse };
            }
            // If it's a new message, start with empty string
            return { ...prev, [messageId]: '' };
          }
          return prev;
        });
        
        // Skip adding to queue if it's an old message
        if (isOldMessage) {
          return;
        }
      }

      const lastProcessedLength = lastProcessedLengthRef.current[messageId] || 0;

      // Check if there's new content (delta)
      if (fullResponse.length > lastProcessedLength) {
        const newDelta = fullResponse.slice(lastProcessedLength);
        
        // Add each character from the delta to the queue
        const chars = newDelta.split('');
        charQueueRef.current[messageId].push(...chars);
        
        // Update last processed length
        lastProcessedLengthRef.current[messageId] = fullResponse.length;

        // Start typing if not already typing
        if (!typingIntervalRef.current) {
          startTyping();
        }
      }
    });
  }, [chatHistory, startTyping]);

  // Handle "done" state - show full response immediately
  useEffect(() => {
    chatHistory.forEach((chat) => {
      const messageId = chat.id;
      const fullResponse = chat.response || '';
      const displayedText = displayedTexts[messageId] || '';

      // Check if this is a completed response that should be shown immediately
      // This happens when response is complete and there's a significant difference
      if (fullResponse !== "Processing..." && 
          fullResponse.length > 0 &&
          !chat.error &&
          displayedText.length < fullResponse.length &&
          charQueueRef.current[messageId]?.length === 0 &&
          typingMessageId !== messageId) {
        
        // Check if response seems complete (no more streaming expected)
        const isComplete = fullResponse.length > displayedText.length + 10;
        
        if (isComplete) {
          // Clear typing state
          if (typingIntervalRef.current && typingMessageId === messageId) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
            setTypingMessageId(null);
          }
          
          // Clear character queue
          charQueueRef.current[messageId] = [];
          
          // Show full response immediately
          setDisplayedTexts(prev => {
            if (prev[messageId] !== fullResponse) {
              return { ...prev, [messageId]: fullResponse };
            }
            return prev;
          });
          
          lastProcessedLengthRef.current[messageId] = fullResponse.length;
        }
      }
    });
  }, [chatHistory, displayedTexts, typingMessageId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
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
              className={`px-1 py-2 transition-colors relative ${activeTab === tab ? "text-white" : "text-slate-300/60 hover:text-slate-300"}`}
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
      <div
        className="flex-1 overflow-y-auto p-6 space-y-8 chat-messages-area"
        onClick={() => {
          setLocalSelectedId(null);
          if (onQueryClick && typeof onQueryClick === 'function') onQueryClick(null);
        }}
      >
        {filteredChatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No chat history yet. Start a conversation below.
          </div>
        ) : (
          filteredChatHistory.map((chat) => {
            const displayText = displayedTexts[chat.id] || '';
            const isTyping = typingMessageId === chat.id;

            return (
              <div key={chat.id} className="space-y-3">
                {/* User Query - Right Side */}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-400 mb-0.5 px-2 font-medium">
                    {chat.category}
                  </span>
                  <button
                    className={`bg-blue-600 text-white px-2 py-3 rounded-lg max-w-[75%] shadow-md transition-all cursor-pointer focus:outline-none ${
                      localSelectedId === chat.id ? "ring-2 ring-cyan-400 ring-offset-transparent" : "hover:bg-blue-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalSelectedId(chat.id);
                      handleQueryClick(chat);
                    }}
                  >
                    <p className="leading-relaxed text-left whitespace-pre-wrap break-words max-w-full">{chat.query}</p>
                  </button>
                </div>

                {/* AI Response - Left Side */}
                {chat.response && chat.response !== "Processing..." ? (
                  <div className="flex flex-col items-start">
                    <div className="bg-black text-white px-2 py-3 rounded-lg max-w-[75%] border border-black shadow-lg">
                      <p className="leading-relaxed whitespace-pre-wrap break-words max-w-full">
                        {displayText}
                        {isTyping && <span className="animate-pulse ml-1">|</span>}
                      </p>
                    </div>
                  </div>
                ) : chat.response === "Processing..." ? (
                  <div className="flex flex-col items-start">
                    <div className="bg-black text-white px-2 py-3 rounded-lg max-w-[75%] border border-black shadow-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-slate-400">Processing...</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}