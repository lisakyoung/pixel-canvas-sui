import { create } from 'zustand';

interface WalletStore {
  address: string | null;
  balance: string;
  isConnecting: boolean;
  
  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  balance: '0',
  isConnecting: false,
  
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  reset: () => set({ address: null, balance: '0', isConnecting: false }),
}));