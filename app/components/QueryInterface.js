'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function QueryInterface({ selectedImage, onAnalysisStart, onAnalysisComplete }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedType, setDetectedType] = useState(null);

  const modes = [
    {
      id: 'captioning',
      name: 'Image Captioning',
      description: 'Generate comprehensive descriptions of satellite imagery',
      placeholder: 'Automatically generate caption for the uploaded image...',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'grounding',
      name: 'Object Grounding',
      description: 'Localize objects with oriented bounding boxes',
      placeholder: 'e.g., "Locate all buildings in the image"',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'vqa',
      name: 'Visual Q&A',
      description: 'Answer questions about image attributes',
      placeholder: 'e.g., "How many vehicles are visible?" or "What is the dominant land use?"',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      alert('Please upload an image first');
      return;
    }
    
    setLoading(true);
    setDetectedType(null);
    onAnalysisStart?.();
    
    try {
      // Step 1: Analyze query to determine type
      const formData = new FormData();
      formData.append('query', query);
      
      const analyzeResponse = await fetch('/api/analyze-query', {
        method: 'POST',
        body: formData,
      });
      
      const analyzeData = await analyzeResponse.json();
      setDetectedType(analyzeData.queryType);
      
      // Wait a moment to show the detected type
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Send to appropriate model based on detected type
      const processFormData = new FormData();
      processFormData.append('image', selectedImage);
      processFormData.append('query', query);
      processFormData.append('queryType', analyzeData.queryType);
      
      const processResponse = await fetch('/api/process', {
        method: 'POST',
        body: processFormData,
      });
      
      const result = await processResponse.json();
      onAnalysisComplete?.(result);
      
    } catch (error) {
      console.error('Error:', error);
      onAnalysisComplete?.({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-slate-200">Query Analysis</h2>
      
      {/* Detection Status */}
      {detectedType && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-300">Query Type Detected</p>
              <p className="text-xs text-slate-400 mt-1">
                {detectedType === 'captioning' && 'Image Captioning - Generating comprehensive description'}
                {detectedType === 'grounding' && 'Object Grounding - Localizing objects with bounding boxes'}
                {detectedType === 'vqa' && 'Visual Q&A - Answering your question about the image'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Supported Query Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="p-4 rounded-lg border border-slate-700 bg-slate-800/30"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-slate-500">
                {mode.icon}
              </div>
              <h3 className="font-medium text-sm text-slate-200">{mode.name}</h3>
            </div>
            <p className="text-xs text-slate-400">{mode.description}</p>
          </div>
        ))}
      </div>

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Natural Language Query
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Describe this image', 'Find all buildings', 'How many vehicles are visible?'"
            className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-2">
            Enter any query - our system will automatically detect whether it's captioning, grounding, or Q&A
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex-1 py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{detectedType ? 'Processing...' : 'Analyzing Query...'}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Analyze & Process</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => { setQuery(''); setDetectedType(null); }}
            disabled={loading}
            className="py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
