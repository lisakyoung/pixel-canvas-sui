import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WalletKitProvider } from '@mysten/wallet-kit';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletKitProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WalletKitProvider>
  </React.StrictMode>
);