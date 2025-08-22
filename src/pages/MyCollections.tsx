import React, { useState } from 'react';
import { useWalletKit } from '@mysten/wallet-kit';
import { motion } from 'framer-motion';
import { User, Image, Palette, Trophy, DollarSign, TrendingUp } from 'lucide-react';
import { useMyCanvases, useMyNFTs, useMyRevenue } from '@/hooks/useMyAssets';
import { formatAddress, formatSui } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function MyCollections() {
  const { currentAccount } = useWalletKit();
  const [activeTab, setActiveTab] = useState<'contributions' | 'nfts' | 'revenue'>('contributions');

  const { canvases: myContributions, isLoading: loadingContributions } = useMyCanvases(
    currentAccount?.address
  );
  const { nfts: myNFTs, isLoading: loadingNFTs } = useMyNFTs(currentAccount?.address);
  const {
    revenues: myRevenues,
    total: totalRevenue,
    isLoading: loadingRevenue,
  } = useMyRevenue(currentAccount?.address);

  if (!currentAccount) {
    return (
      <div className="text-center py-16">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          Connect your wallet to view your collections
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'contributions',
      label: 'My Contributions',
      icon: Palette,
      count: myContributions.length,
    },
    { id: 'nfts', label: 'My NFTs', icon: Image, count: myNFTs.length },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, count: myRevenues.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">My Collections</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Your pixel art journey on Sui</p>
      </div>

      {/* User Stats */}
      <div className="glass-panel p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20">
            <User className="h-8 w-8 text-brand-500" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Wallet Address</p>
            <p className="font-mono text-lg">{formatAddress(currentAccount.address)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-900 dark:text-blue-100">Total Pixels</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {myContributions.reduce((sum, c) => sum + (c.myPixels || 0), 0)}
            </p>
          </div>

          <div className="glass-panel p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-purple-900 dark:text-purple-100">NFTs Owned</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{myNFTs.length}</p>
          </div>

          <div className="glass-panel p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-900 dark:text-green-100">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatSui(totalRevenue.toString())}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                'transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'contributions' && (
          <div>
            {loadingContributions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-panel p-6 animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : myContributions.length === 0 ? (
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't contributed to any canvases yet
                </p>
                <Link
                  to="/canvases"
                  className="text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block"
                >
                  Explore Canvases →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myContributions.map((canvas, index) => (
                  <motion.div
                    key={canvas.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/canvas/${canvas.id}`}>
                      <div className="glass-panel p-6 hover:shadow-xl transition-all duration-300">
                        <h3 className="font-bold text-lg mb-2">{canvas.title}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">My Pixels</span>
                            <span className="font-medium">{canvas.myPixels || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Contribution</span>
                            <span className="font-medium">
                              {(((canvas.myPixels || 0) / canvas.paintedCount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                            <span
                              className={cn(
                                'font-medium',
                                canvas.completed ? 'text-green-600' : 'text-blue-600'
                              )}
                            >
                              {canvas.completed ? 'Completed' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nfts' && (
          <div>
            {loadingNFTs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-panel p-6 animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : myNFTs.length === 0 ? (
              <div className="text-center py-12">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  You don't own any pixel canvas NFTs yet
                </p>
                <Link
                  to="/auctions"
                  className="text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block"
                >
                  Browse Auctions →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-panel p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4">
                      {/* NFT image would go here */}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{nft.title}</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Token ID: {nft.id.slice(0, 8)}...</p>
                      <p>Acquired: {new Date(nft.acquiredAt).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            {loadingRevenue ? (
              <div className="glass-panel p-6 animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ) : myRevenues.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No revenue to claim yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRevenues.map((revenue, index) => (
                  <motion.div
                    key={revenue.poolId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-panel p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-2">{revenue.canvasTitle}</h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>Pool ID: {formatAddress(revenue.poolId)}</p>
                          <p>Your Share: {revenue.sharePercentage.toFixed(2)}%</p>
                          <p>Status: {revenue.claimed ? 'Claimed' : 'Unclaimed'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold gradient-text">
                          {formatSui(revenue.amount.toString())}
                        </p>
                        {!revenue.claimed && (
                          <button
                            className={cn(
                              'mt-2 px-4 py-2 rounded-lg text-sm font-medium',
                              'bg-gradient-to-r from-brand-500 to-accent-500',
                              'text-white hover:shadow-lg',
                              'transition-all duration-200'
                            )}
                          >
                            Claim
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
