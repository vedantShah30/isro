"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaveRoutineModal({
  open,
  onClose,
  onSave,
  promptCount = 0,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Routine name is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSave(title.trim(), description.trim());
      setTitle("");
      setDescription("");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save routine");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setTitle("");
      setDescription("");
      setError("");
      onClose?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0f1720] to-[#0a0f19] border border-cyan-500/20 shadow-2xl overflow-hidden"
          >
            {/* Header with gradient accent */}
            <div className="relative pt-8 pb-4 px-8">
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1" />

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Save Routine
                </h2>
                <p className="text-slate-400 text-sm">
                  Save your current chat as a reusable routine with{" "}
                  <span className="text-cyan-400 font-semibold">
                    {promptCount}
                  </span>{" "}
                  prompt{promptCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-4">
              {/* Routine Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Routine Name
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Urban Analysis Workflow"
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Description
                  <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what this routine does..."
                  disabled={isSaving}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5 text-red-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-blue-300 text-xs">
                  You can edit and re-use this routine anytime by opening the
                  routines panel
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-black/20 flex items-center justify-end gap-3 border-t border-slate-700/50">
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || isSaving}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Save Routine
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
