import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useWalletKit } from '@mysten/wallet-kit';
import { getAuction, getCanvas } from '@/lib/sui';
import { useSui } from '@/hooks/useSui';
import { Auction, Canvas } from '@/lib/types';
import BidPanel from '@/components/BidPanel';
import Countdown from '@/components/Countdown';
import { formatAddress, formatSui, getRemainingTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AuctionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAccount } = useWalletKit();
  const { placeBid } = useSui();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  useEffect(() => {
    if (id) {
      loadAuctionData();
      const interval = setInterval(loadAuctionData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [id]);

  const loadAuctionData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const auctionData = await getAuction(id);
      setAuction(auctionData);

      if (auctionData?.canvasId) {
        const canvasData = await getCanvas(auctionData.canvasId);
        setCanvas(canvasData);
      }
    } catch (error) {
      console.error('Failed to load auction:', error);
      toast.error('Failed to load auction data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!currentAccount || !auction || !bidAmount) {
      toast.error('Please connect wallet and enter bid amount');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minBid = auction.currentBid
      ? parseFloat(auction.currentBid.amount) * 1.1 // 10% increment
      : parseFloat(auction.minBid);

    if (bidValue < minBid) {
      toast.error(`Minimum bid is ${formatSui(minBid.toString())}`);
      return;
    }

    setIsPlacingBid(true);
    try {
      await placeBid(id!, (bidValue * 1_000_000_000).toString());
      toast.success('Bid placed successfully!');
      setBidAmount('');
      loadAuctionData();
    } catch (error) {
      console.error('Failed to place bid:', error);
      toast.error('Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!auction || !canvas) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Auction not found</p>
        <button
          onClick={() => navigate('/auctions')}
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          Back to Auctions
        </button>
      </div>
    );
  }

  const isAuctionEnded = Date.now() > auction.endTime;
  const canBid = !isAuctionEnded && !auction.finalized;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/auctions')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Auction: {canvas.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">Collaborative NFT Auction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NFT Preview */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">NFT Preview</h2>

            {/* Canvas Grid */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
              <div className="w-full h-full grid grid-cols-24 grid-rows-24 gap-px bg-gray-300 dark:bg-gray-600 p-1 rounded">
                {canvas.pixels.map((pixel) => (
                  <div
                    key={`${pixel.x}-${pixel.y}`}
                    style={{
                      backgroundColor: pixel.color,
                      gridColumn: pixel.x + 1,
                      gridRow: pixel.y + 1,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* NFT Details */}
            <div className="mt-6 space-y-4">
              <div className="glass-panel p-4 bg-gradient-to-br from-brand-50/50 to-accent-50/50 dark:from-brand-900/20 dark:to-accent-900/20">
                <h3 className="font-semibold mb-3">NFT Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Pixels</p>
                    <p className="font-medium">576</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Contributors</p>
                    <p className="font-medium">{canvas.contributorsCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Created By</p>
                    <p className="font-medium">{formatAddress(canvas.proposer)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Completed At</p>
                    <p className="font-medium">
                      {canvas.completedAt
                        ? new Date(canvas.completedAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Revenue Distribution Info */}
              <div className="glass-panel p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Revenue Distribution
                    </p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• 10% to canvas creator</li>
                      <li>• 90% distributed to all pixel painters</li>
                      <li>• Distribution based on pixel contribution</li>
                      <li>• Automatic payout after auction ends</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auction Panel */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          <Countdown endTime={auction.endTime} />

          {/* Current Bid */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="h-5 w-5 text-brand-600" />
              <h3 className="text-lg font-semibold">Current Bid</h3>
            </div>

            {auction.currentBid ? (
              <div>
                <p className="text-3xl font-bold gradient-text mb-2">
                  {formatSui(auction.currentBid.amount)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {formatAddress(auction.currentBid.bidder)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(auction.currentBid.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-gray-400 mb-2">No bids yet</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimum bid: {formatSui(auction.minBid)}
                </p>
              </div>
            )}
          </div>

          {/* Place Bid */}
          {canBid && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bid Amount (SUI)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={
                      auction.currentBid
                        ? `Min: ${formatSui((parseFloat(auction.currentBid.amount) * 1.1).toString())}`
                        : `Min: ${formatSui(auction.minBid)}`
                    }
                    className={cn(
                      'w-full px-4 py-2 rounded-lg',
                      'bg-white/50 dark:bg-gray-800/50',
                      'border border-gray-200 dark:border-gray-700',
                      'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                      'transition-all duration-200'
                    )}
                    step="0.1"
                    min="0"
                  />
                </div>

                <button
                  onClick={handlePlaceBid}
                  disabled={isPlacingBid || !bidAmount}
                  className={cn(
                    'w-full py-3 rounded-lg font-medium',
                    'bg-gradient-to-r from-brand-500 to-accent-500',
                    'text-white shadow-lg',
                    'hover:shadow-xl',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  {isPlacingBid ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Gavel className="h-5 w-5" />
                      Place Bid
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">10% minimum increment required</p>
              </div>
            </div>
          )}

          {/* Auction Status */}
          {isAuctionEnded && (
            <div className="glass-panel p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">Auction Ended</h3>
              </div>
              {auction.currentBid && (
                <div>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Winner: {formatAddress(auction.currentBid.bidder)}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatSui(auction.currentBid.amount)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bid History */}
          <BidPanel auctionId={id!} />
        </div>
      </div>
    </div>
  );
}
