import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Palette, RefreshCw } from 'lucide-react';
import { SeedPixel, COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SeedEditorProps {
  maxSeeds: number;
  onSeedsChange: (seeds: SeedPixel[]) => void;
}

export default function SeedEditor({ maxSeeds = 10, onSeedsChange }: SeedEditorProps) {
  const [seeds, setSeeds] = useState<SeedPixel[]>([]);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const togglePixel = (x: number, y: number) => {
    const existingIndex = seeds.findIndex((s) => s.x === x && s.y === y);

    if (existingIndex !== -1) {
      // Remove seed
      const newSeeds = seeds.filter((_, i) => i !== existingIndex);
      setSeeds(newSeeds);
      onSeedsChange(newSeeds);
    } else if (seeds.length < maxSeeds) {
      // Add seed
      const newSeeds = [...seeds, { x, y, color: selectedColor }];
      setSeeds(newSeeds);
      onSeedsChange(newSeeds);
    }
  };

  const clearSeeds = () => {
    setSeeds([]);
    onSeedsChange([]);
  };

  const getSeedAt = (x: number, y: number) => {
    return seeds.find((s) => s.x === x && s.y === y);
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass-panel p-4 bg-brand-50/50 dark:bg-brand-900/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-brand-900 dark:text-brand-100">Pre-Seed Your Canvas</p>
            <p className="text-sm text-brand-700 dark:text-brand-300 mt-1">
              Paint up to {maxSeeds} pixels to hint at your intended concept. These will guide other
              participants.
            </p>
            <p className="text-sm font-medium text-brand-800 dark:text-brand-200 mt-2">
              Seeds placed: {seeds.length}/{maxSeeds}
            </p>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Select Color
          </h3>
          <button
            onClick={clearSeeds}
            className="btn-glass px-3 py-1 text-sm flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((color) => (
            <motion.button
              key={color}
              onClick={() => setSelectedColor(color)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'aspect-square rounded-lg border-2 transition-all',
                selectedColor === color
                  ? 'border-brand-500 shadow-lg scale-110'
                  : 'border-neutral-200 dark:border-neutral-700'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Mini Grid */}
      <div className="glass-panel p-6">
        <h3 className="font-medium mb-4">Click to Place Seeds</h3>

        <div className="relative mx-auto" style={{ width: 'fit-content' }}>
          {/* Grid background */}
          <div className="absolute inset-0 grid-pattern rounded-lg opacity-30" />

          {/* Interactive grid */}
          <div className="relative grid grid-cols-24 gap-px p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            {Array.from({ length: 576 }, (_, i) => {
              const x = i % 24;
              const y = Math.floor(i / 24);
              const seed = getSeedAt(x, y);
              const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

              return (
                <motion.button
                  key={i}
                  onClick={() => togglePixel(x, y)}
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onMouseLeave={() => setHoveredCell(null)}
                  whileHover={{ scale: 1.5, zIndex: 10 }}
                  className={cn(
                    'aspect-square rounded-sm transition-all duration-150',
                    seed
                      ? 'pixel-cell-seed shadow-md'
                      : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                    isHovered && !seed && 'ring-2 ring-brand-400'
                  )}
                  style={{
                    backgroundColor: seed ? seed.color : undefined,
                    width: '16px',
                    height: '16px',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Coordinates display */}
        {hoveredCell && (
          <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Hovering: ({hoveredCell.x}, {hoveredCell.y})
          </div>
        )}
      </div>
    </div>
  );
}
