"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ImageUploader({ onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
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
      className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 rounded-lg p-4"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative text-center cursor-pointer transition-all duration-300 rounded-lg
          ${
            !preview
              ? isDragging
                ? "border-2 border-dashed border-blue-500 bg-blue-500/10 p-12"
                : "border-2 border-dashed border-slate-600 hover:border-slate-500 bg-slate-800/30 p-12"
              : "border-none bg-transparent p-0"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          onChange={(e)=>{
            const file = e.target.files[0];
            handleFileSelect(file);
            e.target.value = "";
          }}
          className="hidden"
        />

        {preview ? (
          <div>
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
                setPreview(null);
                onImageSelect?.(null, null);
                fileInputRef.current?.click();
              }}
              className="text-sm mt-2 text-blue-400 hover:text-blue-300"
            >
              Change Image
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <svg
                className="w-12 h-12 mx-auto text-[#242424] bg-slate-500/50 rounded-lg p-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                fill="none"
              >
                <path
                  d="M6.5 12.25V16H16.7145C17.046 16 17.3639 15.8683 17.5983 15.6339L20.9822 12.25L17.5983 8.86612C17.3639 8.6317 17.046 8.5 16.7145 8.5H10.25C8.17893 8.5 6.5 10.1789 6.5 12.25ZM4 12.25C4 8.79822 6.79822 6 10.25 6H16.7145C17.709 6 18.6629 6.39509 19.3661 7.09835L23.2678 11H37.75C41.2018 11 44 13.7982 44 17.25V34.75C44 38.2018 41.2018 41 37.75 41H10.25C6.79822 41 4 38.2018 4 34.75V12.25ZM6.5 18.5V34.75C6.5 36.8211 8.17893 38.5 10.25 38.5H37.75C39.8211 38.5 41.5 36.8211 41.5 34.75V17.25C41.5 15.1789 39.8211 13.5 37.75 13.5H23.2678L19.3661 17.4017C18.6629 18.1049 17.709 18.5 16.7145 18.5H6.5Z"
                  fill="#242424"
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

            <div className="mt-6 text-xs text-slate-400">
              <div>supports: text/cc</div>
              <div className="mt-1">maximum file size of 10mb</div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
