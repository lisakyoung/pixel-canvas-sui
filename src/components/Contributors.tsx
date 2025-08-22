import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import { Canvas } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ContributorsProps {
  canvas: Canvas;
}

export default function Contributors({ canvas }: ContributorsProps) {
  const sortedContributors = Object.entries(canvas.contributions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topContributor = sortedContributors[0];
  const totalPixels = Object.values(canvas.contributions).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-brand-500" />
        <h3 className="font-medium">Top Contributors</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <div className="text-2xl font-bold">{Object.keys(canvas.contributions).length}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Total Painters</div>
        </div>
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <div className="text-2xl font-bold">{totalPixels}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">Pixels Painted</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {sortedContributors.map(([address, count], index) => {
          const percentage = (count / totalPixels) * 100;
          const isTop = index === 0;

          return (
            <motion.div
              key={address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative p-3 rounded-xl',
                isTop
                  ? 'bg-gradient-to-r from-brand-500/10 to-accent-500/10'
                  : 'bg-neutral-100 dark:bg-neutral-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    isTop
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  )}
                >
                  {index === 0 && <Trophy className="h-4 w-4" />}
                  {index > 0 && index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                    <span className="text-sm font-bold">{count} pixels</span>
                  </div>

                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-400 to-accent-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>

                  <div className="flex justify-between mt-1 text-xs text-neutral-500">
                    <span>{percentage.toFixed(1)}% contribution</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {(count * 0.9).toFixed(2)} SUI share
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
