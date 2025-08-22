export interface SeedPixel {
    x: number;
    y: number;
    color: string;
  }
  
  export interface Pixel {
    x: number;
    y: number;
    color: string;
    painter: string;
  }
  
  export interface Canvas {
    id: string;
    title: string;
    proposer: string;
    colors: string[];
    filled: boolean[];
    totalPainted: number;
    completed: boolean;
    contributions: Record<string, number>;
    auctionRunning: boolean;
    auctionEndTime: number;
    highestBid: string;
    highestBidder: string;
    settled: boolean;
    saleAmount: string;
  }
  
  export interface Auction {
    canvasId: string;
    endTime: number;
    highestBid: string;
    highestBidder: string;
    bidCount: number;
  }
  
  export interface NFT {
    id: string;
    canvasId: string;
    title: string;
    artworkHash: string;
    owner: string;
  }
  
  export const COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FF8800', '#8800FF', '#00FF88', '#FF0088',
    '#888888', '#4444FF', '#FF4444', '#44FF44', '#FFD700', '#8B4513',
    '#800080', '#FFA500', '#A52A2A', '#000080', '#008080', '#808000',
  ];
  
  export const CANVAS_SIZE = 24;
  export const TOTAL_PIXELS = 576;
  export const SEED_MAX = 10;
  export const COOLDOWN_MS = 10000;
  export const MAX_CONTRIBUTION = 50;