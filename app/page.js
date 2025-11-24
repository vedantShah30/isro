'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import QueryInterface from './components/QueryInterface';
import ResultsDisplay from './components/ResultsDisplay';

// Dynamically import Scene3D to avoid SSR issues with Three.js
const Scene3D = dynamic(() => import('./components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = (file, preview) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Scene3D />
      
      {/* Header */}
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image Upload & Info */}
          <div className="lg:col-span-1 space-y-6">
            <ImageUploader onImageSelect={handleImageSelect} />
            
            {/* Capabilities Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="backdrop-blur-xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-500/10"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Platform Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300">Image Captioning</h4>
                    <p className="text-xs text-slate-400 mt-1">Generate comprehensive descriptions of satellite imagery</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300">Object Grounding</h4>
                    <p className="text-xs text-slate-400 mt-1">Localize objects with oriented bounding boxes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300">Visual Q&A</h4>
                    <p className="text-xs text-slate-400 mt-1">Answer questions about geometric and semantic attributes</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-cyan-500/20">
                <h4 className="text-sm font-medium text-white mb-3">Supported Formats</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 rounded text-xs text-cyan-200">PNG</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 rounded text-xs text-cyan-200">JPG</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 rounded text-xs text-cyan-200">Up to 2K×2K</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 rounded text-xs text-cyan-200">0.5-10m/px</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Query Interface & Results */}
          <div className="lg:col-span-2 space-y-6">
            <QueryInterface
              selectedImage={selectedImage}
              onAnalysisStart={() => { setIsAnalyzing(true); setResults(null); }}
              onAnalysisComplete={(data) => { setResults(data); setIsAnalyzing(false); }}
            />
            <ResultsDisplay results={results} isAnalyzing={isAnalyzing} imagePreview={imagePreview} />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-cyan-500/20 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-300">
          <p>Space Applications Centre (SAC) - ISRO | Satellite Imagery Analysis Platform</p>
        </div>
      </footer>
    </div>
  );
}
