'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Executive', href: '/dashboard/executive', icon: PieChart },
  { name: 'Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'Cost Control', href: '/dashboard/cost', icon: DollarSign },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Risks', href: '/dashboard/risks', icon: AlertTriangle },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">EPC Control</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
