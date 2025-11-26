"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Header from "../components/Header";
import ImageUploader from "../components/ImageUploader";
import ResultsDisplay from "../components/ResultsDisplay";
import QueryInterface from "../components/QueryInterface";
import RoutinesModal from "../components/RoutinesModal";

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
  const [isRoutinesOpen, setIsRoutinesOpen] = useState(false);
  const [routines, setRoutines] = useState([]);

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
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-[#0b1116] border-r border-cyan-600/10 flex flex-col items-center justify-between py-6 space-y-6 z-30">
        <div className="space-y-5">
          <Link href="/">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            {/* globe svg */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0ZM20 37.5C21.3044 37.5 23.1582 36.3776 24.835 33.0241C25.4832 31.7276 26.0432 30.2024 26.4802 28.5H13.5198C13.9568 30.2024 14.5168 31.7276 15.165 33.0241C16.8418 36.3776 18.6956 37.5 20 37.5ZM12.9908 26H27.0092C27.3247 24.1367 27.5 22.1193 27.5 20C27.5 18.0689 27.3545 16.2224 27.0899 14.5H12.9101C12.6455 16.2224 12.5 18.0689 12.5 20C12.5 22.1193 12.6753 24.1367 12.9908 26ZM29.0545 28.5C28.2829 31.7823 27.0781 34.5769 25.5876 36.589C29.7423 35.1901 33.1995 32.2743 35.3007 28.5H29.0545ZM36.4444 26C37.1274 24.1286 37.5 22.1078 37.5 20C37.5 18.0786 37.1904 16.2296 36.6182 14.5H29.6171C29.8665 16.2474 30 18.0925 30 20C30 22.0904 29.8396 24.1059 29.5422 26H36.4444ZM10.4578 26C10.1604 24.1059 10 22.0904 10 20C10 18.0925 10.1335 16.2474 10.3829 14.5H3.38176C2.80965 16.2296 2.5 18.0786 2.5 20C2.5 22.1078 2.87265 24.1286 3.55565 26H10.4578ZM4.6993 28.5C6.80052 32.2743 10.2577 35.1901 14.4124 36.589C12.9219 34.5769 11.7171 31.7823 10.9455 28.5H4.6993ZM13.3962 12H26.6038C26.151 10.0955 25.5461 8.39804 24.835 6.9759C23.1582 3.62237 21.3044 2.5 20 2.5C18.6956 2.5 16.8418 3.62237 15.165 6.9759C14.4539 8.39804 13.849 10.0955 13.3962 12ZM29.1679 12H35.5685C33.5005 7.98363 29.9239 4.87103 25.5876 3.411C27.1533 5.52456 28.4036 8.50135 29.1679 12ZM14.4124 3.411C10.0761 4.87103 6.4995 7.98363 4.43149 12H10.8321C11.5964 8.50135 12.8467 5.52456 14.4124 3.411Z"
                fill="#0468F9"
              />
            </svg>
          </div>
        </Link>

        <button 
          onClick={() => setIsRoutinesOpen(true)}
          className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 34 32"
            fill="none"
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
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
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
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 29 29"
            fill="none"
          >
            <path
              d="M12.5 7.5C12.5 6.94772 12.9477 6.5 13.5 6.5C14.0523 6.5 14.5 6.94772 14.5 7.5V14.5H18.5C19.0523 14.5 19.5 14.9477 19.5 15.5C19.5 16.0523 19.0523 16.5 18.5 16.5H13.5C12.9477 16.5 12.5 16.0523 12.5 15.5V7.5ZM14.5 28.5C22.232 28.5 28.5 22.232 28.5 14.5C28.5 6.76801 22.232 0.5 14.5 0.5C6.76801 0.5 0.5 6.76801 0.5 14.5C0.5 22.232 6.76801 28.5 14.5 28.5ZM14.5 26.5C7.87258 26.5 2.5 21.1274 2.5 14.5C2.5 7.87258 7.87258 2.5 14.5 2.5C21.1274 2.5 26.5 7.87258 26.5 14.5C26.5 21.1274 21.1274 26.5 14.5 26.5Z"
              fill="white"
              stroke="#0A0F19"
            />
          </svg>
        </button>
        </div>

        <div className="mt-auto w-10 h-10 rounded-lg  flex items-center justify-center">
          {/* user svg */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M23 8.99998C23 12.866 19.866 16 16 16C12.134 16 9 12.866 9 8.99998C9 5.134 12.134 2 16 2C19.866 2 23 5.134 23 8.99998ZM21 8.99998C21 6.23857 18.7614 4 16 4C13.2386 4 11 6.23857 11 8.99998C11 11.7614 13.2386 14 16 14C18.7614 14 21 11.7614 21 8.99998ZM7.5 18C5.56696 18 3.99994 19.567 4 21.5001L4.00001 22C4.00003 24.3935 5.52264 26.4174 7.68492 27.7934C9.85906 29.177 12.8015 30 15.9999 30C19.1983 30 22.1408 29.177 24.315 27.7934C26.4773 26.4174 28 24.3935 28 22V21.5C28 19.567 26.433 18 24.5 18H7.5ZM6 21.5C5.99998 20.6716 6.67156 20 7.5 20H24.5C25.3284 20 26 20.6715 26 21.5V22C26 23.4725 25.0602 24.9486 23.2413 26.1061C21.4342 27.256 18.8767 28 15.9999 28C13.1232 28 10.5657 27.256 8.75867 26.1061C6.93978 24.9486 6.00001 23.4725 6.00001 22L6 21.5Z"
              fill="#0468F9"
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
          {/* <div className="mt-12 flex flex-col items-center">
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
          </div> */}
        </div>
      </main>

      <footer className="absolute bottom-0 mx-auto w-full z-20 mt-16 border-t border-cyan-500/20 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-300">
          <p>
            Space Applications Centre (SAC) - ISRO | Satellite Imagery Analysis
            Platform
          </p>
        </div>
      </footer>

      {/* Routines Modal */}
      <RoutinesModal
        open={isRoutinesOpen}
        onClose={() => setIsRoutinesOpen(false)}
      />
    </div>
  );
}
