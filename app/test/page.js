'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('../components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

export default function TestPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [typingTime, setTypingTime] = useState(null);
  const [typingSpeed, setTypingSpeed] = useState(30); // milliseconds per character

  // Typing effect
  useEffect(() => {
    if (!response || isProcessing) {
      setDisplayedResponse('');
      return;
    }

    setIsTyping(true);
    setDisplayedResponse('');
    setTypingTime(null);
    let index = 0;

    const typingStartTime = performance.now();

    const typingInterval = setInterval(() => {
      if (index < response.length) {
        setDisplayedResponse(response.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        const typingEndTime = performance.now();
        const typingDuration = ((typingEndTime - typingStartTime) / 1000).toFixed(2);
        setTypingTime(typingDuration);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [response, typingSpeed, isProcessing]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTest = async (e) => {
    e.preventDefault();
    
    if (!selectedImage || !query.trim()) {
      alert('Please provide both an image and a query');
      return;
    }

    setIsProcessing(true);
    setResponse('');
    setDisplayedResponse('');
    setProcessingTime(null);
    setTypingTime(null);
    setIsTyping(false);

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('query', query);

    const startTime = performance.now();

    try {
      const res = await fetch('/api/testimage', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const endTime = performance.now();
      
      setIsProcessing(false);
      setResponse(data.response || data.error || 'No response');
      
      // Start timing for typing effect
      const typingStartTime = performance.now();
      
      // Wait for typing to complete, then calculate total time
      const responseLength = (data.response || data.error || 'No response').length;
      const typingDuration = (responseLength * typingSpeed) / 1000;
      
      setTimeout(() => {
        const typingEndTime = performance.now();
        const totalDuration = ((typingEndTime - startTime) / 1000).toFixed(2);
        setProcessingTime(totalDuration);
      }, responseLength * typingSpeed);

    } catch (error) {
      const endTime = performance.now();
      
      setIsProcessing(false);
      setResponse(`Error: ${error.message}`);
      
      // Calculate time including typing effect for error
      const responseLength = `Error: ${error.message}`.length;
      setTimeout(() => {
        const totalDuration = ((endTime - startTime + (responseLength * typingSpeed)) / 1000).toFixed(2);
        setProcessingTime(totalDuration);
      }, responseLength * typingSpeed);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Scene3D />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Gemini Speed Test</h1>
            <a
              href="/"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 hover:border-cyan-500/60 rounded-lg text-sm transition-all text-cyan-200"
            >
              ← Back to Home
            </a>
          </div>
          <p className="text-slate-400">
            Test Gemini's image processing speed with custom queries
          </p>
        </motion.div>

        {/* Main Test Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Image Upload */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-500/10">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Upload Image</h2>
              
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageSelect}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:cursor-pointer cursor-pointer"
              />

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Query Input */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-500/10">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Query</h2>
              
              <form onSubmit={handleTest} className="space-y-4">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'Describe this satellite image in 3-4 lines'"
                  className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  disabled={isProcessing || isTyping}
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Typing Speed: {typingSpeed}ms/char
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={typingSpeed}
                    onChange={(e) => setTypingSpeed(Number(e.target.value))}
                    disabled={isProcessing || isTyping}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Fast (10ms)</span>
                    <span>Slow (100ms)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || isTyping || !selectedImage || !query.trim()}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-medium transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : isTyping ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Typing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Test Gemini Speed</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Timer Display */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-500/10">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Processing Time</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {isProcessing || isTyping ? (
                      <span className="animate-pulse">...</span>
                    ) : processingTime ? (
                      `${processingTime}s`
                    ) : (
                      '--'
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Total Time
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {isTyping ? (
                      <span className="animate-pulse">...</span>
                    ) : typingTime ? (
                      `${typingTime}s`
                    ) : (
                      '--'
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Typing Duration
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                  {isProcessing ? 'Processing API request...' : isTyping ? 'Typing response...' : 'Complete'}
                </p>
              </div>
            </div>

            {/* Response Display */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-500/10">
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Gemini Response</h2>
              
              {isProcessing ? (
                <div className="text-center py-8">
                  <svg className="animate-spin w-8 h-8 mx-auto text-blue-500 mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-400 text-sm">Waiting for response...</p>
                </div>
              ) : displayedResponse ? (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {displayedResponse}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-slate-400 text-sm">No response yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-500/10"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Test Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div>
              <span className="font-medium text-slate-300">Model:</span> Gemini Pro Vision
            </div>
            <div>
              <span className="font-medium text-slate-300">Purpose:</span> Speed & Quality Testing
            </div>
            <div>
              <span className="font-medium text-slate-300">Response Length:</span> 3-4 lines
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
