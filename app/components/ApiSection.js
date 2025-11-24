'use client';

import { useState } from 'react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';

export default function ApiSection({ title, description, apiEndpoint, placeholder }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      
      const data = await response.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-gray-300 mb-4">{description}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg bg-linear-to-r from-indigo-500 to-pink-500 text-white font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Submit'}
        </motion.button>
        
        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-lg bg-black/30 border border-white/10"
          >
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Response:</h3>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {output}
            </pre>
          </motion.div>
        )}
      </form>
    </GlassCard>
  );
}
