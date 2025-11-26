"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";
import ResultsDisplay from "../components/ResultsDisplay";
import QueryInterface from "../components/QueryInterface";
import ChatSection from '../components/ChatSection';
const Scene3D = dynamic(() => import("../components/Scene3D"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />,
});

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Captioning');

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    const category = selectedCategory;

    // Add user query to chat history
    const newChat = {
      id: Date.now(),
      query: message,
      response: '', // Will be updated when AI responds
      category: category,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newChat]);
    setInputMessage('');

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === newChat.id 
            ? { ...chat, response: `This is a simulated response for "${message}" in ${category} mode. Replace this with actual API response.` }
            : chat
        )
      );
    }, 1000);
  };


  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const handleImageSelect = (file, preview) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };
  

  return (
    <div className="min-h-screen text-white overflow-hidden bg-black">
      <Scene3D />

      {/* Left vertical sidebar with SVG icons */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-[#0b1116] border-r border-cyan-600/10 flex flex-col items-center py-6 space-y-6 z-30">
        <div className="w-10 h-10 rounded-lg bg-cyan-900/10 flex items-center justify-center">
          {/* globe svg */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-cyan-400"
          >
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12h20M12 2c2.5 3 2.5 9 0 14M12 2c-2.5 3-2.5 9 0 14"
              stroke="#0ea5b5"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button className="w-10 h-10 rounded-lg hover:bg-white/2 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 34 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7.5C4 5.01472 6.01472 3 8.5 3H25.5C27.9853 3 30 5.01472 30 7.5V24.5C30 26.9853 27.9853 29 25.5 29H8.5C6.01472 29 4 26.9853 4 24.5V7.5ZM8.5 5C7.11929 5 6 6.11929 6 7.5V24.5C6 25.8807 7.11929 27 8.5 27H25.5C26.8807 27 28 25.8807 28 24.5V7.5C28 6.11929 26.8807 5 25.5 5H8.5ZM17 8C17.5523 8 18 8.44772 18 9V15H24C24.5523 15 25 15.4477 25 16C25 16.5523 24.5523 17 24 17H18V23C18 23.5523 17.5523 24 17 24C16.4477 24 16 23.5523 16 23V17H10C9.44772 17 9 16.5523 9 16C9 15.4477 9.44771 15 10 15H16V9C16 8.44772 16.4477 8 17 8Z"
              fill="white"
              stroke="#0A0F19"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <button className="w-10 h-10 rounded-lg hover:bg-white/2 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.70711 3.29289C9.09763 3.68342 9.09763 4.31658 8.70711 4.70711L5.41421 8H17.5C23.299 8 28 12.701 28 18.5C28 24.299 23.299 29 17.5 29C11.701 29 7 24.299 7 18.5C7 17.9477 7.44772 17.5 8 17.5C8.55228 17.5 9 17.9477 9 18.5C9 23.1944 12.8056 27 17.5 27C22.1944 27 26 23.1944 26 18.5C26 13.8056 22.1944 10 17.5 10H5.41421L8.70711 13.2929C9.09763 13.6834 9.09763 14.3166 8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L2.29289 9.70711C1.90237 9.31658 1.90237 8.68342 2.29289 8.29289L7.29289 3.29289C7.68342 2.90237 8.31658 2.90237 8.70711 3.29289Z"
              fill="white"
              stroke="#0A0F19"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button className="w-10 h-10 rounded-lg hover:bg-white/2 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 34 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 9C15 8.44772 15.4477 8 16 8C16.5523 8 17 8.44772 17 9V16H21C21.5523 16 22 16.4477 22 17C22 17.5523 21.5523 18 21 18H16C15.4477 18 15 17.5523 15 17V9ZM17 30C24.732 30 31 23.732 31 16C31 8.26801 24.732 2 17 2C9.26801 2 3 8.26801 3 16C3 23.732 9.26801 30 17 30ZM17 28C10.3726 28 5 22.6274 5 16C5 9.37258 10.3726 4 17 4C23.6274 4 29 9.37258 29 16C29 22.6274 23.6274 28 17 28Z"
              fill="white"
              stroke="#0A0F19"
            />
          </svg>
        </button>

        <div className="mt-auto w-10 h-10 rounded-lg bg-cyan-900/10 flex items-center justify-center">
          {/* user svg */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12a4 4 0 100-8 4 4 0 000 8z"
              stroke="#60a5fa"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 20a8 8 0 0116 0"
              stroke="#60a5fa"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </aside>

      {/* Main content area */}
      <main className="relative z-20 ml-20">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - big upload card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-[#0f1720] border border-cyan-700/10 p-8 min-h-[420px] shadow-lg"
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  {/* If ImageUploader has its own UI, we slot it here. Otherwise it will render its dropzone. */}
                  <div className="w-full max-w-[520px]">
                    <ImageUploader onImageSelect={handleImageSelect} />
                  </div>
                </div>

                <div className="mt-6 text-xs text-slate-400">
                  <div>supports: text/cc</div>
                  <div className="mt-1">maximum file size of 20mb</div>
                </div>
              </div>
            </motion.div>

            {/* Right - results / tabs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="rounded-2xl bg-[#0f1720] border border-cyan-700/10 p-6 min-h-[420px] shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex space-x-6 text-sm text-slate-300">
                  <button className="px-1 py-2 text-slate-300/80">All</button>
                  <button className="px-1 py-2 text-slate-300/60">
                    Captioning
                  </button>
                  <button className="px-1 py-2 text-slate-300/60">
                    Grounding
                  </button>
                  <button className="px-1 py-2 text-slate-300/60">VQNA</button>
                </div>
                <div className="text-xs text-slate-500">&nbsp;</div>
              </div>

              <div className="mt-6 h-[330px] overflow-auto text-slate-300">
                {!results && (
                  <div className="flex items-start">
                    <div className="px-3 py-2 rounded bg-slate-800/60 text-slate-300">
                      Upload the image for getting quality insights
                    </div>
                  </div>
                )}

                {results && (
                  <ResultsDisplay
                    results={results}
                    isAnalyzing={isAnalyzing}
                    imagePreview={imagePreview}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom centered query input */}
          <div className="mt-12 flex flex-col items-center">
            <div className="flex space-x-6 text-sm text-slate-300 mb-4">
              <span>Captioning</span>
              <span>Grounding</span>
              <span>VQNA</span>
            </div>

            <div className="w-full max-w-2xl">
              <QueryInterface
                selectedImage={selectedImage}
                onAnalysisStart={() => {
                  setIsAnalyzing(true);
                  setResults(null);
                }}
                onAnalysisComplete={(data) => {
                  setResults(data);
                  setIsAnalyzing(false);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 mt-16 border-t border-cyan-500/20 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-300">
          <p>
            Space Applications Centre (SAC) - ISRO | Satellite Imagery Analysis
            Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
