import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  endTime: number;
  onEnd?: () => void;
}

export default function Countdown({ endTime, onEnd }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);

      if (remaining === 0 && onEnd) {
        onEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const isEnding = timeLeft < 60 * 60 * 1000; // Less than 1 hour
  const isCritical = timeLeft < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={cn('glass-panel p-4', isCritical && 'ring-2 ring-red-500 animate-pulse')}>
      <div className="flex items-center gap-2 mb-3">
        {isCritical ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : (
          <Clock className="h-5 w-5 text-brand-500" />
        )}
        <h3 className="font-medium">
          {timeLeft === 0 ? 'Auction Ended' : isEnding ? 'Ending Soon!' : 'Time Remaining'}
        </h3>
      </div>

      {timeLeft > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Days', value: days },
            { label: 'Hours', value: hours },
            { label: 'Minutes', value: minutes },
            { label: 'Seconds', value: seconds },
          ].map((unit) => (
            <motion.div
              key={unit.label}
              className="text-center"
              animate={unit.label === 'Seconds' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className={cn('text-2xl font-bold', isCritical && 'text-red-500')}>
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">{unit.label}</div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Waiting for settlement...
          </div>
        </div>
      )}
    </div>
  );
}
