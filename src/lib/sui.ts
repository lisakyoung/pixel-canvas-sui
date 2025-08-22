import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Canvas, Auction, SeedPixel } from './types';

const NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet';
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';
const FACTORY_ID = import.meta.env.VITE_FACTORY_ID || '0x0';

export const suiClient = new SuiClient({
  url: `https://fullnode.${NETWORK}.sui.io:443`,
});

export async function createCanvas(
  title: string,
  seeds: SeedPixel[],
  signer: any
) {
  const tx = new Transaction();
  
  // Create payment
  const [payment] = tx.splitCoins(tx.gas, [100_000_000]); // 0.1 SUI
  
  // Convert seeds to Move format
  const moveSeeds = seeds.map(s => ({
    x: s.x,
    y: s.y,
    color: parseInt(s.color.replace('#', '0x'), 16),
  }));
  
  tx.moveCall({
    target: `${PACKAGE_ID}::factory::create_canvas`,
    arguments: [
      tx.object(FACTORY_ID),
      tx.pure.string(title),
      payment,
      tx.pure(moveSeeds),
    ],
  });

  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });
}

export async function paintPixel(
  canvasId: string,
  x: number,
  y: number,
  color: string,
  signer: any
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::canvas::paint_pixel`,
    arguments: [
      tx.object(canvasId),
      tx.pure.u32(x),
      tx.pure.u32(y),
      tx.pure.u32(parseInt(color.replace('#', '0x'), 16)),
      tx.object('0x6'), // Clock
    ],
  });

  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });
}

export async function placeBid(
  canvasId: string,
  amount: string,
  signer: any
) {
  const tx = new Transaction();
  
  const [bid] = tx.splitCoins(tx.gas, [parseInt(amount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::auction::place_bid`,
    arguments: [
      tx.object(canvasId),
      tx.object('0x6'), // Clock
      bid,
    ],
  });

  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });
}

export async function settleAuction(
  canvasId: string,
  name: string,
  signer: any
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::auction::settle_auction`,
    arguments: [
      tx.object(canvasId),
      tx.object('0x6'), // Clock
      tx.pure.string(name),
    ],
  });

  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });
}

export async function getCanvas(canvasId: string): Promise<Canvas | null> {
  try {
    const object = await suiClient.getObject({
      id: canvasId,
      options: {
        showContent: true,
      },
    });

    if (!object.data || !object.data.content) return null;

    const fields = (object.data.content as any).fields;
    
    return {
      id: canvasId,
      title: fields.title,
      proposer: fields.proposer,
      colors: fields.colors.map((c: number) => `#${c.toString(16).padStart(6, '0')}`),
      filled: fields.filled.map((f: number) => f === 1),
      totalPainted: fields.total_painted,
      completed: fields.completed,
      contributions: {}, // TODO: Parse table
      auctionRunning: fields.auction_running,
      auctionEndTime: fields.auction_end_time,
      highestBid: fields.highest_bid,
      highestBidder: fields.highest_bidder,
      settled: fields.settled,
      saleAmount: fields.sale_amount,
    };
  } catch (error) {
    console.error('Error fetching canvas:', error);
    return null;
  }
}

export async function listCanvases(): Promise<Canvas[]> {
  // TODO: Implement fetching all canvases
  return [];
}

export async function listAuctions(): Promise<Auction[]> {
  // TODO: Implement fetching active auctions
  return [];
}