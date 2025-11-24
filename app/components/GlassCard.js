'use client';

import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      {children}
    </motion.div>
  );
}
