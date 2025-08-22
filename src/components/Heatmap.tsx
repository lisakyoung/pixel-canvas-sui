import React from 'react';
import { Canvas } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  canvas: Canvas;
  showOverlay?: boolean;
}

export default function Heatmap({ canvas, showOverlay = false }: HeatmapProps) {
  const getContributionIntensity = (address: string): number => {
    const contribution = canvas.contributions[address] || 0;
    const maxContribution = Math.max(...Object.values(canvas.contributions));
    return maxContribution > 0 ? contribution / maxContribution : 0;
  };

  const getHeatmapColor = (intensity: number): string => {
    const hue = 240 - intensity * 240; // Blue to red
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (showOverlay) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="grid grid-cols-24 grid-rows-24 gap-px opacity-50">
          {Array.from({ length: 576 }, (_, i) => {
            const x = i % 24;
            const y = Math.floor(i / 24);
            const index = y * 24 + x;

            // Find painter from events or contributions
            const intensity = Math.random(); // TODO: Get actual painter intensity

            return (
              <div
                key={i}
                className="w-full h-full"
                style={{
                  backgroundColor: canvas.filled[index]
                    ? getHeatmapColor(intensity)
                    : 'transparent',
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-medium mb-3">Activity Heatmap</h3>

      <div className="space-y-2">
        {Object.entries(canvas.contributions)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([address, count]) => {
            const intensity = getContributionIntensity(address);

            return (
              <div key={address} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getHeatmapColor(intensity) }}
                />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="text-xs font-medium ml-auto">{count}</span>
              </div>
            );
          })}
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Low Activity</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div
                key={intensity}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getHeatmapColor(intensity) }}
              />
            ))}
          </div>
          <span className="text-neutral-500">High Activity</span>
        </div>
      </div>
    </div>
  );
}
