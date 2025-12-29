'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Folder,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  AlertTriangle,
  BarChart3,
  PieChart,
  Settings,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Executive', href: '/dashboard/executive', icon: PieChart, badge: null },
  { name: 'Projects', href: '/dashboard/projects', icon: Folder, badge: null },
  { name: 'Cost Control', href: '/dashboard/cost', icon: DollarSign, badge: null },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar, badge: null },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp, badge: null },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText, badge: null },
  { name: 'Risks', href: '/dashboard/risks', icon: AlertTriangle, badge: null },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, badge: null },
];

export function ModernSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-accent-600/20 animate-gradient opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-center border-b border-white/10 backdrop-blur-sm">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                EPC Control
              </h1>
              <p className="text-[10px] text-blue-300 font-medium tracking-wider">
                PROJECT MANAGEMENT
              </p>
            </div>
          </motion.div>
        </div>

        {/* User Profile */}
        {session?.user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-3 my-4 rounded-xl bg-white/5 backdrop-blur-sm p-4 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-white font-semibold text-sm shadow-accent">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session.user.name || 'User'}
                </p>
                <p className="text-xs text-blue-300 truncate">
                  {session.user.role?.replace('_', ' ') || 'User'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-3 flex-1">
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-transform duration-200',
                        isActive && 'scale-110',
                        hoveredItem === item.name && !isActive && 'scale-110'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className="relative z-10 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {item.badge}
                    </span>
                  )}

                  {/* Hover arrow */}
                  {hoveredItem === item.name && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-t border-white/10 p-3"
        >
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    </motion.div>
  );
}
