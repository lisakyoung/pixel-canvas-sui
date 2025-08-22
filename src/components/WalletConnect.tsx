import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function WalletConnect() {
  const account = useCurrentAccount();

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">{account.address.slice(0, 6)}...{account.address.slice(-4)}</div>
          <div className="text-neutral-500 dark:text-neutral-400">Connected</div>
        </div>
        <ConnectButton className="btn-glass px-3 py-2" />
      </div>
    );
  }

  return (
    <ConnectButton className="btn-primary flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </ConnectButton>
  );
}