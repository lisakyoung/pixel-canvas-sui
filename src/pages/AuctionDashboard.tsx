import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel, Clock, TrendingUp, Filter } from 'lucide-react';
import { useAuctions } from '@/hooks/useAuction';
import { formatSui, getRemainingTime, formatAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AuctionDashboard() {
  const { auctions, isLoading } = useAuctions();
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [sortBy, setSortBy] = useState<'ending' | 'price' | 'bids'>('ending');

  const filteredAuctions = auctions
    .filter((auction) => {
      const isEnded = Date.now() > auction.endTime;
      if (filter === 'active') return !isEnded;
      if (filter === 'ended') return isEnded;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'ending') return a.endTime - b.endTime;
      if (sortBy === 'price') {
        const aPrice = a.currentBid ? parseFloat(a.currentBid.amount) : 0;
        const bPrice = b.currentBid ? parseFloat(b.currentBid.amount) : 0;
        return bPrice - aPrice;
      }
      if (sortBy === 'bids') return b.bidCount - a.bidCount;
      return 0;
    });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Live Auctions</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Bid on completed collaborative NFTs</p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'ended'] as const).map((tab) => (
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
            <option value="ending">Ending Soon</option>
            <option value="price">Highest Price</option>
            <option value="bids">Most Bids</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel p-6 animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="text-center py-16">
          <Gavel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">No auctions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction, index) => {
            const isEnded = Date.now() > auction.endTime;

            return (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/auction/${auction.id}`}>
                  <div className="glass-panel p-6 hover:shadow-xl transition-all duration-300 h-full">
                    {/* NFT Preview */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4 relative">
                      {/* Canvas preview would go here */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Gavel className="h-12 w-12 text-gray-400" />
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isEnded ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500 text-white">
                            Ended
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500 text-white animate-pulse">
                            Live
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Auction Info */}
                    <h3 className="font-bold text-lg mb-2">{auction.canvasTitle}</h3>

                    <div className="space-y-2 text-sm">
                      {/* Current Bid */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Current Bid</span>
                        <span className="font-bold gradient-text">
                          {auction.currentBid
                            ? formatSui(auction.currentBid.amount)
                            : formatSui(auction.minBid)}
                        </span>
                      </div>

                      {/* Time Remaining */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Time
                        </span>
                        <span
                          className={cn(
                            'font-medium',
                            isEnded ? 'text-gray-500' : 'text-orange-600 dark:text-orange-400'
                          )}
                        >
                          {getRemainingTime(auction.endTime)}
                        </span>
                      </div>

                      {/* Bid Count */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          <TrendingUp className="inline h-3 w-3 mr-1" />
                          Bids
                        </span>
                        <span className="font-medium">{auction.bidCount}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className={cn(
                        'w-full mt-4 py-2 rounded-lg font-medium',
                        'transition-all duration-200',
                        isEnded
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-lg'
                      )}
                    >
                      {isEnded ? 'View Results' : 'Place Bid'}
                    </button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
