import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Clock, Users, TrendingUp, Plus, Filter, Search } from 'lucide-react';
import { useCanvases } from '@/hooks/useCanvas';
import { Canvas } from '@/lib/types';
import { formatAddress, formatTimestamp } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CanvasDashboard() {
  const { canvases, isLoading, refresh } = useCanvases();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'completion'>('recent');

  const filteredCanvases = canvases
    .filter((canvas) => {
      if (filter === 'active') return !canvas.completed;
      if (filter === 'completed') return canvas.completed;
      return true;
    })
    .filter((canvas) =>
      canvas.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') return b.createdAt - a.createdAt;
      if (sortBy === 'popular') return b.contributorsCount - a.contributorsCount;
      if (sortBy === 'completion') return b.paintedCount - a.paintedCount;
      return 0;
    });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Canvas Gallery</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore and contribute to collaborative pixel art
          </p>
        </div>
        <Link
          to="/create"
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl',
            'bg-gradient-to-r from-brand-500 to-accent-500',
            'text-white font-medium shadow-lg',
            'hover:shadow-xl hover:scale-105',
            'transition-all duration-200'
          )}
        >
          <Plus className="h-5 w-5" />
          Create Canvas
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search canvases..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg',
                  'bg-white/50 dark:bg-gray-800/50',
                  'border border-gray-200 dark:border-gray-700',
                  'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium capitalize',
                  'transition-all duration-200',
                  filter === tab
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={cn(
              'px-4 py-2 rounded-lg',
              'bg-white/50 dark:bg-gray-800/50',
              'border border-gray-200 dark:border-gray-700',
              'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'transition-all duration-200'
            )}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="completion">Near Completion</option>
          </select>
        </div>
      </div>

      {/* Canvas Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-panel p-6 animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredCanvases.length === 0 ? (
        <div className="text-center py-16">
          <Grid3x3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'No canvases found matching your search' : 'No canvases found'}
          </p>
          <Link
            to="/create"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCanvases.map((canvas, index) => (
              <motion.div
                key={canvas.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/canvas/${canvas.id}`}>
                  <div className="glass-panel p-6 hover:shadow-xl transition-all duration-300 h-full">
                    {/* Canvas Preview */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl mb-4 relative overflow-hidden">
                      {/* Pixel Grid Preview */}
                      <div className="absolute inset-0 p-2">
                        <div className="w-full h-full grid grid-cols-24 grid-rows-24 gap-px">
                          {canvas.pixels.slice(0, 100).map((pixel) => (
                            <div
                              key={`${pixel.x}-${pixel.y}`}
                              className="pixel-preview"
                              style={{
                                backgroundColor: pixel.color,
                                gridColumn: pixel.x + 1,
                                gridRow: pixel.y + 1,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Progress Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-3">
                        <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-brand-400 to-accent-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(canvas.paintedCount / 576) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-white text-xs mt-1 text-center">
                          {Math.floor((canvas.paintedCount / 576) * 100)}% Complete
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {canvas.completed ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500 text-white shadow-lg">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white shadow-lg animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Canvas Info */}
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{canvas.title}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{canvas.contributorsCount} painters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>{canvas.paintedCount}/576 pixels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimestamp(canvas.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}