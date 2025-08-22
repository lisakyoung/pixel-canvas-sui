import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Info, Palette, Sparkles } from 'lucide-react';
import { useWalletKit } from '@mysten/wallet-kit';
import { createCanvas } from '@/lib/sui';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import SeedEditor from '@/components/SeedEditor';
import { SeedPixel } from '@/lib/types';

export default function CreateCanvas() {
  const navigate = useNavigate();
  const { currentAccount } = useWalletKit();
  const [title, setTitle] = useState('');
  const [seeds, setSeeds] = useState<SeedPixel[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showSeedEditor, setShowSeedEditor] = useState(false);

  const handleCreate = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a canvas title');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createCanvas(title, seeds);
      toast.success('Canvas created successfully!');
      navigate(`/canvas/${result.canvasId}`);
    } catch (error) {
      console.error('Failed to create canvas:', error);
      toast.error('Failed to create canvas');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20">
            <Sparkles className="h-6 w-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Create New Canvas</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Start a collaborative masterpiece
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Canvas Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a creative title..."
              className={cn(
                'w-full px-4 py-3 rounded-xl',
                'bg-white/50 dark:bg-gray-800/50',
                'border border-gray-200 dark:border-gray-700',
                'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                'backdrop-blur-sm transition-all duration-200'
              )}
              maxLength={50}
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">{title.length}/50 characters</p>
              <p className="text-sm text-brand-600">Creation fee: 0.1 SUI</p>
            </div>
          </div>

          {/* Seed Pixels Section */}
          <div className="glass-panel p-6 bg-gradient-to-br from-brand-50/50 to-accent-50/50 dark:from-brand-900/20 dark:to-accent-900/20">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <Palette className="h-5 w-5 text-brand-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-brand-900 dark:text-brand-100">
                    Pre-Seed Pixels (Optional)
                  </h3>
                  <p className="text-sm text-brand-800 dark:text-brand-200 mt-1">
                    Add up to 10 hint pixels to guide the community
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSeedEditor(!showSeedEditor)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'bg-white dark:bg-gray-800',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  'transition-all duration-200'
                )}
              >
                {showSeedEditor ? 'Hide Editor' : 'Add Seeds'}
              </button>
            </div>

            {showSeedEditor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <SeedEditor
                  seeds={seeds}
                  onSeedsChange={setSeeds}
                  maxSeeds={10}
                />
              </motion.div>
            )}

            {seeds.length > 0 && (
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">{seeds.length}/10</span> seed pixels added
                </p>
              </div>
            )}
          </div>

          {/* Canvas Info */}
          <div className="glass-panel p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Canvas Details
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Size: 24×24 pixels (576 total)</li>
                  <li>• Anyone can paint unpainted pixels</li>
                  <li>• NFT minted when 100% complete</li>
                  <li>• Automatic auction starts after completion</li>
                  <li>• Revenue: 10% creator, 90% painters (pro-rata)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
            className={cn(
              'w-full py-3 rounded-xl font-medium',
              'bg-gradient-to-r from-brand-500 to-accent-500',
              'text-white shadow-lg shadow-brand-500/25',
              'hover:shadow-xl hover:shadow-brand-500/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              'flex items-center justify-center gap-2'
            )}
          >
            {isCreating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create Canvas
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}