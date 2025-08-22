import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Share2, Info, Zap, Trophy } from 'lucide-react';
import { useWalletKit } from '@mysten/wallet-kit';
import { useCanvas } from '@/hooks/useCanvas';
import { useSui } from '@/hooks/useSui';
import { useCanvasStore } from '@/stores/canvasStore';
import PixelGrid from '@/components/PixelGrid';
import Toolbar from '@/components/Toolbar';
import Minimap from '@/components/Minimap';
import Contributors from '@/components/Contributors';
import Heatmap from '@/components/Heatmap';
import StatsCard from '@/components/StatsCard';
import { formatAddress } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function CanvasWorkbench() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAccount } = useWalletKit();
  const { canvas, isLoading, refresh } = useCanvas(id);
  const { paintPixel } = useSui();
  const { selectedColor, pendingPixels, addPendingPixel, clearPendingPixels } = useCanvasStore();

  const [showMinimap, setShowMinimap] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'paint' | 'eyedropper'>('paint');

  const handlePixelClick = async (x: number, y: number) => {
    if (!currentAccount || !canvas || !id) {
      toast.error('Please connect your wallet');
      return;
    }

    if (canvas.completed) {
      toast.error('Canvas is already completed');
      return;
    }

    // Check if pixel is already painted
    const existingPixel = canvas.pixels.find((p) => p.x === x && p.y === y);

    if (selectedTool === 'eyedropper' && existingPixel) {
      useCanvasStore.getState().setSelectedColor(existingPixel.color);
      toast.success('Color picked!');
      return;
    }

    if (existingPixel) {
      toast.error('This pixel is already painted');
      return;
    }

    if (selectedTool === 'paint') {
      // Add to pending pixels (optimistic update)
      addPendingPixel({
        x,
        y,
        color: selectedColor,
        painter: currentAccount.address,
        paintedAt: Date.now(),
      });

      try {
        await paintPixel(id, x, y, selectedColor);
        toast.success('Pixel painted!');
        refresh();
      } catch (error) {
        console.error('Failed to paint pixel:', error);
        toast.error('Failed to paint pixel');
        clearPendingPixels();
      }
    }
  };

  const handleBatchCommit = async () => {
    if (pendingPixels.length === 0) {
      toast.error('No pixels to commit');
      return;
    }

    // TODO: Implement batch commit
    toast.success(`Committing ${pendingPixels.length} pixels...`);
    clearPendingPixels();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Canvas not found</p>
        <button
          onClick={() => navigate('/canvases')}
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Canvas Area */}
      <div className="lg:col-span-3">
        <div className="glass-panel p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/canvases')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{canvas.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created by {formatAddress(canvas.proposer)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {pendingPixels.length > 0 && (
                <button
                  onClick={handleBatchCommit}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    'bg-green-600 text-white hover:bg-green-700',
                    'transition-all duration-200'
                  )}
                >
                  <Save className="h-4 w-4" />
                  Commit {pendingPixels.length}
                </button>
              )}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Canvas Toolbar */}
          <Toolbar
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            selectedColor={selectedColor}
            onColorChange={(color) => useCanvasStore.getState().setSelectedColor(color)}
            showMinimap={showMinimap}
            onToggleMinimap={() => setShowMinimap(!showMinimap)}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
          />

          {/* Main Canvas */}
          <div className="relative mt-4">
            <PixelGrid
              canvas={canvas}
              onPixelClick={handlePixelClick}
              readOnly={canvas.completed}
              showHeatmap={showHeatmap}
              highlightPending={true}
            />

            {/* Minimap Overlay */}
            <AnimatePresence>
              {showMinimap && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute bottom-4 right-4"
                >
                  <Minimap canvas={canvas} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Canvas Progress</span>
              <span className="font-medium">
                {canvas.paintedCount}/576 pixels ({Math.floor((canvas.paintedCount / 576) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-500"
                initial={{ width: 0 }}
                animate={{ width: `${(canvas.paintedCount / 576) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Canvas Stats */}
        <StatsCard
          title="Canvas Stats"
          stats={[
            { label: 'Progress', value: `${Math.floor((canvas.paintedCount / 576) * 100)}%` },
            { label: 'Pixels', value: `${canvas.paintedCount}/576` },
            { label: 'Contributors', value: canvas.contributorsCount },
            {
              label: 'Your Pixels',
              value: canvas.contributions[currentAccount?.address || ''] || 0,
            },
          ]}
        />

        {/* Top Contributors */}
        <Contributors canvas={canvas} currentUser={currentAccount?.address} />

        {/* Canvas Info */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold">Canvas Rules</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <Zap className="h-4 w-4 mt-0.5 text-yellow-500" />
              <span>Each pixel can only be painted once</span>
            </li>
            <li className="flex items-start gap-2">
              <Trophy className="h-4 w-4 mt-0.5 text-purple-500" />
              <span>NFT mints at 100% completion</span>
            </li>
            <li className="flex items-start gap-2">
              <Save className="h-4 w-4 mt-0.5 text-green-500" />
              <span>Revenue split based on contribution</span>
            </li>
          </ul>
        </div>

        {/* Completion Alert */}
        {canvas.paintedCount >= 550 && !canvas.completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Almost Complete!
              </h3>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Only {576 - canvas.paintedCount} pixels left! Be part of history.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
