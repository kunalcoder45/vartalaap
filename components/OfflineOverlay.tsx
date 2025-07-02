'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const OfflineOverlay = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check on mount
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center px-6"
      >
        <WifiOff className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-semibold mb-2">Oops! You're offline</h2>
        <p className="text-lg mb-4">It seems your internet connection has been lost.</p>
        <p className="text-sm text-gray-300">Please check your connection and try again.</p>
      </motion.div>
    </div>
  );
};

export default OfflineOverlay;
