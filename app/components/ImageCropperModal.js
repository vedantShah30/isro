"use client";

import React, { useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { motion } from "framer-motion";

export default function ImageCropperModal({
  open,
  onClose,
  imageSrc,
  onCropComplete,
}) {
  const cropperRef = useRef(null);

  const handleCrop = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedImage = canvas.toDataURL();
      onCropComplete?.(croppedImage);
      onClose?.();
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f1720] border border-cyan-700/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Crop Image</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cropper Container */}
        <div className="mb-6 bg-slate-900/50 rounded-lg p-4 flex justify-center">
          <div className="w-full max-w-[600px]">
            <Cropper
              src={imageSrc}
              ref={cropperRef}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={1}
              preview=".img-preview"
              viewMode={1}
              guides={true}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              checkOrientation={false}
              autoCropArea={1}
              lineWidth={2}
              lineDash={[5, 5]}
              guideLineDash={[5, 5]}
              cropBoxMovable={true}
              cropBoxResizable={true}
              toggleDragModeOnDblclick={true}
              modal={true}
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="px-6 py-2 rounded-lg bg-[#0468F9] hover:bg-[#044ab3] text-white transition-colors font-medium"
          >
            Crop Image
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
