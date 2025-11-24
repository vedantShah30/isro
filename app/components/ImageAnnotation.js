'use client';

import { useRef, useEffect } from 'react';

export default function ImageAnnotation({ imageUrl, boundingBoxes }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !boundingBoxes || boundingBoxes.length === 0) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');

    const drawAnnotations = () => {
      // Set canvas size to match image
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Calculate scale factors
      const scaleX = canvas.width / image.naturalWidth;
      const scaleY = canvas.height / image.naturalHeight;

      // Draw bounding boxes
      boundingBoxes.forEach((box, index) => {
        const x1 = box.x1 * scaleX;
        const y1 = box.y1 * scaleY;
        const x2 = box.x2 * scaleX;
        const y2 = box.y2 * scaleY;
        const width = x2 - x1;
        const height = y2 - y1;

        // Different colors for different boxes
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const color = colors[index % colors.length];

        // Draw rectangle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Draw filled rectangle with transparency
        ctx.fillStyle = color + '20';
        ctx.fillRect(x1, y1, width, height);

        // Draw label background
        const label = `${box.label || 'Object'} ${Math.round(box.confidence * 100)}%`;
        ctx.font = '14px sans-serif';
        const textMetrics = ctx.measureText(label);
        const textHeight = 20;
        const padding = 4;

        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - textHeight - padding, textMetrics.width + padding * 2, textHeight);

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x1 + padding, y1 - padding - 4);
      });
    };

    // Draw when image loads
    if (image.complete) {
      drawAnnotations();
    } else {
      image.onload = drawAnnotations;
    }

    // Redraw on window resize
    const handleResize = () => {
      if (image.complete) {
        drawAnnotations();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl, boundingBoxes]);

  if (!imageUrl) return null;

  return (
    <div className="relative w-full">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Satellite imagery"
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg border border-slate-700"
      />
    </div>
  );
}
