import { useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit';
import { useCallback } from 'react';
import { createCanvas, paintPixel, placeBid } from '@/lib/sui';
import { SeedPixel } from '@/lib/types';

export function useSui() {
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const handleCreateCanvas = useCallback(
    async (title: string, seeds: SeedPixel[]) => {
      if (!account) throw new Error('Wallet not connected');

      const tx = await createCanvas(title, seeds, signTransaction);
      return tx;
    },
    [account, signTransaction]
  );

  const handlePaintPixel = useCallback(
    async (canvasId: string, x: number, y: number, color: string) => {
      if (!account) throw new Error('Wallet not connected');

      const tx = await paintPixel(canvasId, x, y, color, signTransaction);
      return tx;
    },
    [account, signTransaction]
  );

  const handlePlaceBid = useCallback(
    async (canvasId: string, amount: string) => {
      if (!account) throw new Error('Wallet not connected');

      const tx = await placeBid(canvasId, amount, signTransaction);
      return tx;
    },
    [account, signTransaction]
  );

  return {
    account,
    createCanvas: handleCreateCanvas,
    paintPixel: handlePaintPixel,
    placeBid: handlePlaceBid,
  };
}
