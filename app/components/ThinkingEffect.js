"use client";

import { useEffect, useState, useRef } from "react";

// 50x5 matrix of thinking sentences - different AI processing messages
const THINKING_SENTENCES = [
  ["Initializing Qwen-VL pipeline...", "Quantizing 4-bit weights...", "Aligning visual encoders...", "Loading SkySense context...", "Synthesizing response..."],
  ["Booting YOLO11-OBB engine...", "Detecting oriented boxes...", "Filtering NMS thresholds...", "Mapping spatial coordinates...", "Finalizing object list..."],
  ["Loading LoRA adapters...", "Injecting domain weights...", "Refining attention heads...", "Adapting to SkySense logic...", "Generating output..."],
  ["Activating Qwen Vision-Language...", "Tokenizing image patches...", "Running BNB-4-bit inference...", "Cross-referencing logic...", "Compiling results..."],
  ["Initializing SkySense GPT...", "Parsing query intent...", "Retrieving visual tokens...", "Applying LoRA fine-tuning...", "Formulating answer..."],
  // Add more sentences as required
];

// Get initial random row synchronously
const getRandomRow = () => {
  const randomRowIndex = Math.floor(Math.random() * THINKING_SENTENCES.length);
  return THINKING_SENTENCES[randomRowIndex];
};

export default function ThinkingEffect({ isVisible, onComplete }) {
  const initialRow = useRef(getRandomRow());
  const [selectedRow, setSelectedRow] = useState(initialRow.current);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [fadeState, setFadeState] = useState("in");

  // Reset when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Select a new random row when thinking starts
      const newRow = getRandomRow();
      initialRow.current = newRow;
      setSelectedRow(newRow);
      setSentenceIndex(0);
      setFadeState("in");
    }
  }, [isVisible]);

  // Handle sentence cycling
  useEffect(() => {
    if (!isVisible || !selectedRow) return;

    // After showing for 700ms (sentence duration), start fade out
    const fadeOutTimer = setTimeout(() => {
      setFadeState("out");
    }, 700); // Sentence is visible for 700ms before starting fade out

    // After fade out (200ms), move to next sentence
    const nextTimer = setTimeout(() => {
      if (sentenceIndex < selectedRow.length - 1) {
        setSentenceIndex((prev) => prev + 1);
        setFadeState("in");
      } else {
        // For the last sentence, continue blinking with slower intervals
        setFadeState(fadeState === "in" ? "out" : "in");
      }
    }, 900); // 900ms gives a smooth transition before next sentence

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, selectedRow, sentenceIndex, fadeState]);

  useEffect(() => {
    if (sentenceIndex === selectedRow.length - 1 && fadeState === "out") {
      // Once last sentence starts fading out, trigger a callback or action (e.g., onComplete)
      if (onComplete) onComplete();  // You can define how to stop the fade when complete
    }
  }, [sentenceIndex, fadeState, onComplete]);

  if (!isVisible) return null;

  const currentSentence = selectedRow?.[sentenceIndex] || "Processing...";

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Animated dots */}
      <div className="flex gap-1">
        <span 
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" 
          style={{ animationDelay: "0ms", animationDuration: "0.6s" }} 
        />
        <span 
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" 
          style={{ animationDelay: "150ms", animationDuration: "0.6s" }} 
        />
        <span 
          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" 
          style={{ animationDelay: "300ms", animationDuration: "0.6s" }} 
        />
      </div>
      
      {/* Thinking sentence with fade animation */}
      <span
        className={`text-sm text-slate-400 italic transition-opacity duration-500 ${fadeState === "in" ? "opacity-70" : "opacity-0"}`}
      >
        {currentSentence}
      </span>
    </div>
  );
}
