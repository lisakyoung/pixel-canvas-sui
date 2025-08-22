import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import CreateCanvas from './pages/CreateCanvas';
import CanvasDashboard from './pages/CanvasDashboard';
import CanvasWorkbench from './pages/CanvasWorkbench';
import AuctionPage from './pages/AuctionPage';
import AuctionDashboard from './pages/AuctionDashboard';
import MyCollections from './pages/MyCollections';

function App() {
  // Initialize theme
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Layout>
        <Routes>
          <Route path="/" element={<CanvasDashboard />} />
          <Route path="/create" element={<CreateCanvas />} />
          <Route path="/canvases" element={<CanvasDashboard />} />
          <Route path="/canvas/:id" element={<CanvasWorkbench />} />
          <Route path="/auction/:id" element={<AuctionPage />} />
          <Route path="/auctions" element={<AuctionDashboard />} />
          <Route path="/me" element={<MyCollections />} />
        </Routes>
      </Layout>
    </AnimatePresence>
  );
}

export default App;