import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Move, Grid, Maximize2 } from 'lucide-react';
import { Canvas, Pixel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/canvasStore';

interface PixelGridProps {
  canvas: Canvas;
  onPixelClick?: (x: number, y: number) => void;
  readOnly?: boolean;
}

export default function PixelGrid({ canvas, onPixelClick, readOnly = false }: PixelGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  
  const { selectedColor, pendingPixels } = useCanvasStore();

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePixelClick = useCallback((x: number, y: number) => {
    if (readOnly || isDragging) return;
    onPixelClick?.(x, y);
  }, [readOnly, isDragging, onPixelClick]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    
    grid.addEventListener('wheel', handleWheel, { passive: false });
    return () => grid.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const getPixelColor = (x: number, y: number): string | null => {
    const index = y * 24 + x;
    if (canvas.filled[index]) {
      return canvas.colors[index];
    }
    const pending = pendingPixels.find(p => p.x === x && p.y === y);
    return pending ? pending.color : null;
  };

  return (
    <div className="relative w-full h-[600px] glass-panel overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(5, prev + 0.25))}
          className="btn-glass p-2"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
          className="btn-glass p-2"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="btn-glass p-2"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Grid container */}
      <div
        ref={gridRef}
        className="w-full h-full flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          className="relative"
        >
          {/* Grid background */}
          <div className="absolute inset-0 grid-pattern rounded-lg" />
          
          {/* Pixels */}
          <div className="grid grid-cols-24 gap-px p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            {Array.from({ length: 576 }, (_, i) => {
              const x = i % 24;
              const y = Math.floor(i / 24);
              const color = getPixelColor(x, y);
              const isPending = pendingPixels.some(p => p.x === x && p.y === y);
              const isHovered = hoveredPixel?.x === x && hoveredPixel?.y === y;
              
              return (
                <motion.button
                  key={i}
                  onClick={() => handlePixelClick(x, y)}
                  onMouseEnter={() => setHoveredPixel({ x, y })}
                  onMouseLeave={() => setHoveredPixel(null)}
                  whileHover={!readOnly ? { scale: 1.2, zIndex: 10 } : {}}
                  whileTap={!readOnly ? { scale: 0.95 } : {}}
                  className={cn(
                    'aspect-square rounded-sm transition-all duration-150',
                    color ? 'pixel-cell-painted' : 'bg-white dark:bg-neutral-900',
                    !readOnly && !color && 'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                    isPending && 'animate-pulse ring-2 ring-brand-400',
                    isHovered && !readOnly && 'ring-2 ring-brand-500'
                  )}
                  style={{
                    backgroundColor: color || undefined,
                    width: '20px',
                    height: '20px',
                  }}
                  disabled={readOnly}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Coordinates display */}
      {hoveredPixel && (
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 text-sm">
          Position: ({hoveredPixel.x}, {hoveredPixel.y})
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-4 right-4 glass-panel px-4 py-2">
        <div className="text-sm mb-1">
          Progress: {canvas.totalPainted}/576 ({Math.floor((canvas.totalPainted / 576) * 100)}%)
        </div>
        <div className="w-48 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-400 to-accent-400"
            initial={{ width: 0 }}
            animate={{ width: `${(canvas.totalPainted / 576) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}