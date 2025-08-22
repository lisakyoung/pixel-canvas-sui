import React from 'react';
import { Canvas } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MinimapProps {
  canvas: Canvas;
  viewportBounds?: { x: number; y: number; width: number; height: number };
}

export default function Minimap({ canvas, viewportBounds }: MinimapProps) {
  const scale = 4; // Each pixel is 4x4 in minimap

  return (
    <div className="glass-panel p-3">
      <h3 className="text-xs font-medium mb-2 text-neutral-600 dark:text-neutral-400">Minimap</h3>
      <div className="relative" style={{ width: 24 * scale, height: 24 * scale }}>
        {/* Grid */}
        <div className="absolute inset-0 grid grid-cols-24 grid-rows-24 gap-0 bg-neutral-100 dark:bg-neutral-800 rounded">
          {Array.from({ length: 576 }, (_, i) => {
            const x = i % 24;
            const y = Math.floor(i / 24);
            const index = y * 24 + x;
            const color = canvas.filled[index] ? canvas.colors[index] : null;

            return (
              <div
                key={i}
                className={cn('w-1 h-1', !color && 'bg-white dark:bg-neutral-900')}
                style={{
                  backgroundColor: color || undefined,
                }}
              />
            );
          })}
        </div>

        {/* Viewport indicator */}
        {viewportBounds && (
          <div
            className="absolute border-2 border-brand-500 rounded pointer-events-none"
            style={{
              left: viewportBounds.x * scale,
              top: viewportBounds.y * scale,
              width: viewportBounds.width * scale,
              height: viewportBounds.height * scale,
            }}
          />
        )}
      </div>
    </div>
  );
}
