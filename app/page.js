'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const Scene3D = dynamic(() => import('./components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      signIn('google');
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Scene3D />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-cyan-500/20 backdrop-blur-xl bg-black/30"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-10 h-10 text-cyan-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path
                  d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                  strokeWidth="2"
                />
                <path d="M2 12h20" strokeWidth="2" />
              </svg>
              <div>
                <h1 className="text-xl font-bold text-white">SAC - ISRO</h1>
                <p className="text-xs text-slate-400">
                  Satellite Imagery Analysis
                </p>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/25"
            >
              {status === "loading"
                ? "Loading..."
                : session
                ? "Dashboard"
                : "Sign In"}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4">
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
              Satellite Imagery Analysis
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Powered by Advanced AI Models for Image Captioning, Object
              Grounding, and Visual Q&A
            </p>
          </motion.div>

          {/* Features Grid with Image Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col md:flex-row items-start md:items-stretch gap-24 mt-10"
          >
            {/* Left side – Features List */}
            <div className="flex flex-col flex-1">
              {/* Image Captioning */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl mb-4 p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Captioning
                  </h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Generate comprehensive descriptions of satellite imagery
                </p>
              </div>

              {/* Object Grounding */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl mb-4 p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Grounding
                  </h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Localize and identify objects with precise oriented bounding
                  boxes
                </p>
              </div>

              {/* Visual Q&A */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-6 hover:scale-105 transition-all">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Visual Q&A
                  </h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Answer complex questions about geometric and semantic
                  attributes
                </p>
              </div>
            </div>

            {/* Right side – Image Box */}
            <div className="flex h-96">
              <div className="rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-xl shadow-xl">
                <img
                  src="/runway.jpg"
                  alt="Preview"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
