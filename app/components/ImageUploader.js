'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ImageUploader({ onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect?.(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-slate-200">Upload Satellite Image</h2>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-slate-300">{selectedImage?.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
                setPreview(null);
                onImageSelect?.(null, null);
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Change Image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <svg
              className="w-12 h-12 mx-auto text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <p className="text-slate-300 mb-1">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-slate-500">
                PNG or JPG (Max 2K×2K, 0.5-10m/pixel)
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-slate-400">
        <p className="font-medium mb-2">Image Requirements:</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>L1/L2 processed satellite imagery</li>
          <li>Converted to 0-255 value range</li>
          <li>RGB natural color composite</li>
          <li>Resolution: 0.5m to 10m per pixel</li>
        </ul>
      </div>
    </motion.div>
  );
}
