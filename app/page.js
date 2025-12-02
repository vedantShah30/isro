'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Oswald } from 'next/font/google';
import Image from 'next/image';
import { motion, px } from 'framer-motion';
import { useState } from 'react';
import { Scan, MessageSquare, Box, Globe, ChevronRight, Activity } from 'lucide-react';

// Load your Scene3D as before
const Scene3D = dynamic(() => import('./components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-[#050510]" />
}); 

// Load a Google font for headings (Oswald). Change to another Google font if you prefer.
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      signIn('google');
    }
  };

  const features = [
    {
      title: "AI Captioning",
      desc: "Generate comprehensive descriptions of satellite imagery",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-cyan-400 to-blue-500"
    },
    {
      title: "Object Grounding",
      desc: "Localize and identify objects with precise oriented bounding boxes.",
      icon: <Scan className="w-6 h-6" />,
      color: "from-emerald-400 to-teal-500"
    },
    {
      title: "Visual Q&A",
      desc: "Answer complex questions about geometric and semantic attributes.",
      icon: <svg
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
                    </svg>,
      color: "from-violet-400 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none brightness-100 contrast-150" />
      <Scene3D />

      {/* Grid Overlay for "Tech" feel */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] z-0 pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10  backdrop-blur-xl"
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

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 pt-12 md:pt-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* LEFT: Typography & Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-10"
          >
            <div className="space-y-4">
              <h1
                className={`text-10xl md:text-9xl mt-8 font-bold text-white leading-tight ${oswald.className}`}
              >
                Deciphering <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600  mb-2">
                  Earth From Above
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-lg leading-relaxed  border-cyan-500/30 pl-1">
                Transforming High-Resolution Satellite Images into Actionable
                Insights
              </p>
            </div>

            {/* Interactive Feature List */}
          </motion.div>

          {/* RIGHT: The Holographic Scanner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative group">
              {/* Glowing backdrops */}
              {/* <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" /> */}

              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                {/* Header of the Scanner UI */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-20">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400/70">
                    IMG_SAT_V8.22 // LAT: 23.0225° N
                  </div>
                </div>
 
                <img
                  src="/runway.jpg"
                  alt="Satellite Analysis"
                  className=" w-full h-[500px] object-cover opacity-80"
                />

                {/* Scanning Animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent z-10 pointer-events-none"
                  initial={{ top: "-100%" }}
                  animate={{ top: "200%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ height: "50%" }}
                >
                  <div className="absolute bottom-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]" />
                </motion.div>

                {/* Targeting HUD Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-lg z-10">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

                  {/* Data Tag Floating near Object */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute -right-24 top-0 bg-black/80 backdrop-blur border border-cyan-500/30 p-2 rounded text-xs font-mono text-cyan-300"
                  >
                    TYPE: RUNWAY
                    <br />
                    CONF: 0.9
                  </motion.div>
                </div>

                {/* Bottom Stats Grid */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-black/80 backdrop-blur-md border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 z-20">
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Object Detected
                    </span>
                    <span className="text-sm font-mono text-white">
                      Aeroplane
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center pt-1.5">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Object Count
                    </span>
                    <span className="text-lg font-mono text-cyan-400">4</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Status
                    </span>
                    <span className="text-sm font-mono text-green-400 bg-green-900/20 px-2 py-0.5 rounded">
                      LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}