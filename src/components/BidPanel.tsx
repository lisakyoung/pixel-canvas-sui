import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Auction } from '@/lib/types';
import { cn, formatSui, calculateMinBid } from '@/lib/utils';

interface BidPanelProps {
  auction: Auction;
  onPlaceBid: (amount: string) => void;
}

export default function BidPanel({ auction, onPlaceBid }: BidPanelProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  
  const minBid = calculateMinBid(auction.highestBid);
  const isValidBid = bidAmount && parseFloat(bidAmount) >= parseFloat(minBid);

  const handlePlaceBid = async () => {
    if (!isValidBid) return;
    
    setIsPlacing(true);
    try {
      await onPlaceBid(bidAmount);
      setBidAmount('');
    } catch (error) {
      console.error('Failed to place bid:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-brand-500" />
        <h3 className="text-lg font-semibold">Place Your Bid</h3>
      </div>

      {/* Current bid info */}
      <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Current Highest Bid</span>
          <span className="text-2xl font-bold text-gradient">{formatSui(auction.highestBid)}</span>
        </div>
        {auction.highestBidder && (
          <div className="text-xs text-neutral-500">
            by {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
          </div>
        )}
      </div>

      {/* Bid input */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Your Bid Amount (SUI)</label>
          <div className="relative">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={minBid}
              className={cn(
                'input-field pr-12',
                !isValidBid && bidAmount && 'border-red-500 focus:ring-red-500'
              )}
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
              SUI
            </span>
          </div>
        </div>

        {/* Min bid info */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <AlertCircle className="h-4 w-4" />
          <span>Minimum bid: {formatSui(minBid)}</span>
        </div>

        {/* Bid steps info */}
        <div className="p-3 rounded-lg bg-brand-50/50 dark:bg-brand-900/20 text-xs">
          <div className="font-medium mb-1">Bid Increments:</div>
          <div className="space-y-0.5 text-neutral-600 dark:text-neutral-400">
            <div>• 0-10 SUI: +0.1 SUI</div>
            <div>• 10-100 SUI: +1 SUI</div>
            <div>• 100-1000 SUI: +5 SUI</div>
            <div>• >1000 SUI: +10 SUI</div>
          </div>
        </div>

        {/* Place bid button */}
        <button
          onClick={handlePlaceBid}
          disabled={!isValidBid || isPlacing}
          className={cn(
            'btn-primary w-full',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isPlacing ? 'Placing Bid...' : 'Place Bid'}
        </button>
      </div>
    </div>
  );
}