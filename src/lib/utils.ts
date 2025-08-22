import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatSui(amount: string | number): string {
  const value = typeof amount === 'string' ? parseInt(amount) : amount;
  const sui = value / 1_000_000_000;
  return `${sui.toFixed(3)} SUI`;
}

export function calculateMinBid(current: string): string {
  const currentValue = parseInt(current);
  
  if (currentValue === 0) {
    return '100000000'; // 0.1 SUI
  } else if (currentValue <= 10_000_000_000) { // ≤ 10 SUI
    return String(currentValue + 100_000_000); // +0.1 SUI
  } else if (currentValue <= 100_000_000_000) { // ≤ 100 SUI
    return String(currentValue + 1_000_000_000); // +1 SUI
  } else if (currentValue <= 1000_000_000_000) { // ≤ 1000 SUI
    return String(currentValue + 5_000_000_000); // +5 SUI
  } else {
    return String(currentValue + 10_000_000_000); // +10 SUI
  }
}

export function getRemainingTime(endTime: number): string {
  const now = Date.now();
  const remaining = endTime - now;
  
  if (remaining <= 0) return 'Ended';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getPixelIndex(x: number, y: number): number {
  return y * 24 + x;
}

export function getPixelCoords(index: number): [number, number] {
  const x = index % 24;
  const y = Math.floor(index / 24);
  return [x, y];
}