import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Plus,
  Gavel,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Palette,
  Grid3x3,
} from 'lucide-react';
import WalletConnect from './WalletConnect';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Create', href: '/create', icon: Plus },
  { name: 'Auctions', href: '/auctions', icon: Gavel },
  { name: 'My Collection', href: '/me', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden"
      >
        <div className="h-full glass-panel rounded-none">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-8 w-8 text-brand-500" />
                <span className="text-xl font-bold text-gradient">Pixel Canvas</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                    location.pathname === item.href
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-30">
        <div className="h-full glass-panel rounded-none border-r border-neutral-200 dark:border-neutral-800">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Grid3x3 className="h-8 w-8 text-brand-500" />
              <span className="text-2xl font-bold text-gradient">Pixel Canvas</span>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                    location.pathname === item.href
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-20 glass-panel rounded-none border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}