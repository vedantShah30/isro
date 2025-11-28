'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Scene3D = dynamic(() => import('../components/Scene3D'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
});

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    const abortCtrl = new AbortController();

    async function loadUserData() {
      try {
        setLoading(true);

        if (!session) return;

        // Fetch chats from your server route
        const res = await fetch('/api/chats/get', {
          method: 'GET',
          signal: abortCtrl.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          // credentials are included by browser by default on same-origin requests
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setChats(data.chats || []);
          console.log(chats);
        } else {
          console.error('Failed to load chats:', data?.error || res.statusText);
        }

        // TODO: fetch routines similarly when you have a routines endpoint
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();

    return () => abortCtrl.abort();
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <Scene3D />
      
      {/* Header */}
      <nav className="relative z-10 border-b border-cyan-500/20 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
                <path d="M2 12h20" strokeWidth="2"/>
              </svg>
              <div>
                <h1 className="text-xl font-bold text-white">SAC - ISRO</h1>
                <p className="text-xs text-slate-400">Satellite Imagery Analysis</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                href="/test"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Speed Test
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 text-sm font-medium rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={session?.user?.avatar || session?.user?.image || '/default-avatar.png'}
                alt={session?.user?.name}
                className="w-16 h-16 rounded-full border-2 border-cyan-500/50"
                onError={(e) => e.target.src = '/default-avatar.png'}
              />
              <div>
                <h2 className="text-2xl font-bold text-white">{session?.user?.name}</h2>
                <p className="text-sm text-slate-400">{session?.user?.email}</p>
              </div>
            </div>
            
            <Link
              href="/chat"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-cyan-500/25 hover:scale-105"
            >
              + New Chat
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Chats</p>
                <p className="text-3xl font-bold text-white mt-1">{chats.length}</p>
              </div>
              <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Saved Routines</p>
                <p className="text-3xl font-bold text-white mt-1">{routines.length}</p>
              </div>
              <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Images Analyzed</p>
                <p className="text-3xl font-bold text-white mt-1">{chats.reduce((acc, chat) => acc + (chat.responses?.length || 0), 0)}</p>
              </div>
              <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Chats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Chats</h3>
            
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-slate-400 mb-4">No chats yet</p>
                <Link
                  href="/chat"
                  className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Start Your First Chat
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat, index) => (
                  <div
                    key={chat._id || index}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={chat.imageUrl} alt="Chat" className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{chat.title || 'Untitled Chat'}</p>
                        <p className="text-sm text-slate-400 truncate" style={{ opacity: 0.7 }}>{chat.responses?.[0]?.prompt || 'Untitled Chat'}{chat.responses?.[0]?.prompt?.length > 30 ? '...' : ''}</p>
                        {/* <p className="text-xs text-slate-400">{new Date(chat.createdAt).toLocaleDateString()}</p> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Saved Routines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/30 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Saved Routines</h3>
            
            {routines.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-slate-400 mb-2">No routines saved</p>
                <p className="text-xs text-slate-500">Create routines to automate your analysis workflow</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routines.map((routine, index) => (
                  <div
                    key={routine._id || index}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{routine.title}</p>
                        <p className="text-xs text-slate-400">{routine.prompts?.length || 0} prompts</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${routine.isActive ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-slate-600/20 text-slate-400 border border-slate-500/30'}`}>
                        {routine.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
