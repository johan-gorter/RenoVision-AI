import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolMode } from '../types';

interface CanvasEditorProps {
  backgroundImage: string;
  mode: ToolMode;
  brushSize: number;
  onMaskChange: (maskBase64: string | null) => void;
  width?: number;
  height?: number;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  backgroundImage,
  mode,
  brushSize,
  onMaskChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // Initialize canvas with image
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      // Calculate aspect ratio fit within container
      const container = containerRef.current;
      if (!container) return;

      const maxWidth = container.clientWidth;
      const maxHeight = 600; // Max height constraint

      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * scale;
      const height = img.height * scale;

      setImgSize({ width, height });

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           // Clear and redraw logic managed by separate layers usually, 
           // but here we draw mask ON TOP of clear canvas for export, 
           // and we need to show the image behind it.
           // Actually, we need to export ONLY the mask. 
           // So the canvas should be transparent, sitting on top of an <img> tag?
           // Yes, that's better for performance and clean mask export.
           ctx.clearRect(0, 0, width, height);
        }
      }
    };
  }, [backgroundImage]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === 'view') return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = mode === 'eraser' ? 'rgba(0,0,0,0)' : 'rgba(255, 0, 0, 0.5)';
      // For eraser to work on a single canvas layer, we need globalCompositeOperation
      ctx.globalCompositeOperation = mode === 'eraser' ? 'destination-out' : 'source-over';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode === 'view') return;
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        // Create a black and white mask for export
        // The current canvas has Red transparent strokes. 
        // We need to convert this to a binary mask (Black background, White shapes) for Gemini.
        
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        
        if (exportCtx) {
            exportCtx.fillStyle = 'black';
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            exportCtx.drawImage(canvas, 0, 0);
            // Now assume non-transparent pixels on source are the mask. 
            // We can compose: Source Over.
            // But the source is semi-transparent red.
            // Let's iterate pixels or just draw white where alpha > 0.
            
            // Simpler approach for export:
            // 1. Draw Black rect.
            // 2. Draw the 'mask' canvas on top using a style that turns it white?
            // GlobalCompositeOperation 'source-in' keeps source where dest exists.
            
            // Reliable way: Get image data.
            const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
            if (imageData) {
                const exportData = exportCtx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const outData = exportData.data;
                for(let i = 0; i < data.length; i += 4) {
                    const alpha = data[i+3];
                    if (alpha > 0) {
                        outData[i] = 255;   // R
                        outData[i+1] = 255; // G
                        outData[i+2] = 255; // B
                    } else {
                        // Keep black (already filled)
                        outData[i] = 0;
                        outData[i+1] = 0;
                        outData[i+2] = 0;
                    }
                    outData[i+3] = 255; // Full opacity
                }
                exportCtx.putImageData(exportData, 0, 0);
                onMaskChange(exportCanvas.toDataURL('image/png'));
            }
        }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex justify-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
       {/* Background Image Layer */}
       {backgroundImage && (
           <img 
            src={backgroundImage} 
            alt="Workspace"
            style={{ width: imgSize.width, height: imgSize.height }}
            className="absolute top-0 left-auto select-none pointer-events-none"
           />
       )}
       
       {/* Drawing Canvas Layer */}
       <canvas
         ref={canvasRef}
         onMouseDown={startDrawing}
         onMouseMove={draw}
         onMouseUp={stopDrawing}
         onMouseLeave={stopDrawing}
         onTouchStart={startDrawing}
         onTouchMove={draw}
         onTouchEnd={stopDrawing}
         className={`relative z-10 touch-none ${mode === 'view' ? 'cursor-default' : 'cursor-crosshair'}`}
         style={{ width: imgSize.width, height: imgSize.height }}
       />
    </div>
  );
};