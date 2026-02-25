'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { listNotifications } from '@/lib/db/notifications';
import {
  Brain,
  LayoutDashboard,
  Wallet,
  PieChart,
  Target,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  User,
  TrendingUp,
  Building2,
  DollarSign
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Wallet },
  { name: 'Insights', href: '/dashboard/insights', icon: Sparkles },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Budgets', href: '/dashboard/budgets', icon: DollarSign },
  { name: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Building2 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
];

const bottomItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const rows = await listNotifications(50);
        const unread = rows.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch {
        setUnreadCount(0);
      }
    };

    if (user) {
      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 264 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-2 top-2 bottom-2 z-40 card-glass border border-[var(--glass-border)] rounded-2xl shadow-lg',
          'flex flex-col py-6 overflow-hidden'
        )}
      >
        {/* Logo - Clickable to toggle sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'flex items-center px-6 mb-8 w-full',
            isCollapsed && 'justify-center px-4'
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3" onClick={(e) => e.preventDefault()}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold text-gradient whitespace-nowrap">
                MoneyMind AI
              </span>
            )}
          </Link>
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-[var(--muted-text)] hover:bg-[var(--glass-bg)] hover:text-[var(--foreground)]',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 shrink-0',
                  isActive && 'animate-pulse'
                )} />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-4 space-y-1 mt-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
              'text-[var(--muted-text)] hover:bg-[var(--glass-bg)] hover:text-[var(--foreground)]',
              isCollapsed && 'justify-center px-2'
            )}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 shrink-0" />
            )}
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">
                {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {bottomItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                'text-[var(--muted-text)] hover:bg-[var(--glass-bg)] hover:text-[var(--foreground)]',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5 shrink-0" />
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadCount > 10 ? '10+' : unreadCount}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
              'text-[var(--muted-text)] hover:bg-red-500/10 hover:text-red-400',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">Logout</span>
            )}
          </button>

          {/* User Profile */}
          <div className={cn(
            'mt-4 pt-4 border-t border-[var(--glass-border)]',
            isCollapsed ? 'px-2' : 'px-3'
          )}>
            <Link href="/dashboard/settings" className={cn(
              'flex items-center gap-3',
              isCollapsed && 'justify-center'
            )}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-indigo-500/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-[var(--muted-text)] truncate">{user?.email}</p>
                </div>
              )}
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-glass p-6 rounded-2xl max-w-sm w-full"
            >
              <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>
              <p className="text-[var(--muted-text)] mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your dashboard.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 btn-primary bg-gradient-to-r from-red-500 to-red-600"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
