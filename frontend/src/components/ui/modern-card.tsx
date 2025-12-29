'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: 'blue' | 'green' | 'orange' | 'purple' | 'pink';
  className?: string;
}

const gradients = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-teal-500',
  orange: 'from-orange-500 to-red-500',
  purple: 'from-purple-500 to-pink-500',
  pink: 'from-pink-500 to-rose-500',
};

const iconColors = {
  blue: 'text-blue-600',
  green: 'text-emerald-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  pink: 'text-pink-600',
};

export function ModernCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = 'blue',
  className,
}: ModernCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100',
        className
      )}
    >
      {/* Gradient background on hover */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
        gradients[gradient]
      )} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <motion.h3
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              {value}
            </motion.h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>

          {Icon && (
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                gradients[gradient]
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex items-center gap-1"
          >
            <span
              className={cn(
                'text-xs font-semibold',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-xs text-gray-500">from last period</span>
          </motion.div>
        )}
      </div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r origin-left',
          gradients[gradient]
        )}
      />
    </motion.div>
  );
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'glass rounded-2xl p-6 backdrop-blur-xl',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: 'blue' | 'green' | 'orange' | 'purple' | 'pink';
  className?: string;
}

export function GradientCard({ children, gradient = 'blue', className }: GradientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-2xl p-6 text-white shadow-2xl',
        'bg-gradient-to-br',
        gradients[gradient],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
