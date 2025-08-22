cat > README.md << 'EOF'
# 🎨 Sui Pixel Canvas

> Collaborative pixel art NFT platform built on Sui blockchain for Blockthon 2025

[![Deploy Status](https://img.shields.io/badge/deploy-live-green)](https://pixel-canvas.vercel.app)
[![Sui Testnet](https://img.shields.io/badge/network-testnet-blue)](https://suiexplorer.com)

## 🌟 Features

- **Collaborative Canvas**: 24×24 pixel grid for community art
- **Real-time Updates**: WebSocket + polling for live collaboration
- **NFT Minting**: Automatic NFT creation on completion
- **Fair Auctions**: Step-based bidding with anti-snipe
- **Revenue Sharing**: 10% creator, 90% contributors

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Sui CLI
- Test SUI tokens

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/pixel-canvas-sui
cd pixel-canvas-sui
npm install
cp .env.example .env
# Edit .env with your contract IDs
npm run dev