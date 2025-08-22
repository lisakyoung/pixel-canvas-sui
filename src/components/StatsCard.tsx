import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={cn('card-3d', className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</h3>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/20">
            <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between">
          {subtitle && <span className="text-xs text-neutral-500">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
