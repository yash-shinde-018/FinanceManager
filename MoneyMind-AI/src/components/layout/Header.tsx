'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Bell,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Trash2,
  ChevronRight,
  ArrowRight,
  Plus,
  Wallet,
  PieChart,
  Target,
  Settings,
  User,
  HelpCircle,
  Command
} from 'lucide-react';
import type { Notification } from '@/types';
import {
  listNotifications,
  type NotificationRow,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationRow,
} from '@/lib/db/notifications';
import { searchTransactions, type TransactionRow } from '@/lib/db/transactions';
import MLStatusIndicator from '@/components/dashboard/MLStatusIndicator';

// Searchable features/settings for command palette
const searchableItems = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, path: '/dashboard', keywords: 'home overview main' },
  { id: 'transactions', label: 'Transactions', icon: TrendingUp, path: '/dashboard/transactions', keywords: 'expenses income history' },
  { id: 'add-transaction', label: 'Add Transaction', icon: Plus, path: '/dashboard/transactions', keywords: 'new expense income create' },
  { id: 'accounts', label: 'Accounts', icon: Wallet, path: '/dashboard/accounts', keywords: 'bank cards balance' },
  { id: 'link-account', label: 'Link Account', icon: Plus, path: '/dashboard/accounts', keywords: 'add bank connect card' },
  { id: 'budgets', label: 'Budgets', icon: PieChart, path: '/dashboard/budgets', keywords: 'spending limits' },
  { id: 'goals', label: 'Goals', icon: Target, path: '/dashboard/goals', keywords: 'savings targets' },
  { id: 'insights', label: 'Insights', icon: Sparkles, path: '/dashboard/insights', keywords: 'analytics reports ai' },
  { id: 'investments', label: 'Investments', icon: TrendingUp, path: '/dashboard/investments', keywords: 'stocks portfolio' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications', keywords: 'alerts messages' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings', keywords: 'preferences config' },
  { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/settings', keywords: 'account user' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/dashboard/help', keywords: 'support faq documentation' },
];

interface HeaderProps {
  isCollapsed: boolean;
}

export default function Header({ isCollapsed }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TransactionRow[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredItems, setFilteredItems] = useState<typeof searchableItems>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const rows = await listNotifications(50);
        const mapped: Notification[] = rows.map((n: NotificationRow) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type as any,
          isRead: n.is_read,
          createdAt: new Date(n.created_at),
          link: n.link ?? undefined,
        }));
        setNotifications(mapped);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setNotifications([]);
      }
    };

    if (user) {
      load();
    }
  }, [user]);

  // Search functionality - Command Palette style
  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      const query = searchQuery.toLowerCase();
      const filtered = searchableItems.filter(item => 
        item.label.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query)
      );
      setFilteredItems(filtered);
      setShowSearch(true);
      setSelectedIndex(0);
    } else {
      setShowSearch(false);
      setFilteredItems([]);
    }
  }, [searchQuery]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
    markNotificationRead(id);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    markAllNotificationsRead();
  };

  const handleItemClick = (item: typeof searchableItems[0]) => {
    setShowSearch(false);
    setSearchQuery('');
    router.push(item.path);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    deleteNotificationRow(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'goal':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'transaction':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--muted-text)]" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <header
      className={cn(
        'fixed top-2 z-30 h-16 card-glass border border-[var(--glass-border)] rounded-2xl shadow-lg',
        'flex items-center justify-between px-6 transition-all duration-300 mx-4',
        isCollapsed ? 'left-[calc(5rem+0.5rem)] right-4' : 'left-[calc(264px+0.5rem)] right-4'
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md relative z-40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
          <input
            type="text"
            placeholder="Search features and settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full pl-12 pr-10 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearch(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--glass-bg)]"
            >
              <X className="w-4 h-4 text-[var(--muted-text)]" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearch && filteredItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl z-50"
            >
              <div className="p-3 border-b border-[var(--glass-border)]">
                <p className="text-sm font-medium">Quick Access</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "w-full p-3 border-b border-[var(--glass-border)] last:border-0 hover:bg-[#252545] transition-colors text-left flex items-center gap-3",
                        index === selectedIndex && "bg-[#252545]"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-[var(--muted-text)] capitalize">
                          {item.keywords}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--muted-text)]" />
                    </button>
                  );
                })}
              </div>
              <div className="p-2 border-t border-[var(--glass-border)] bg-[#1a1a2e]">
                <p className="text-center text-xs text-[var(--muted-text)]">
                  Press Enter to select
                </p>
              </div>
            </motion.div>
          )}
          {showSearch && searchQuery.trim().length >= 1 && filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl z-50 p-8 text-center"
            >
              <Search className="w-12 h-12 text-[var(--muted-text)] mx-auto mb-3" />
              <p className="text-[var(--muted-text)]">No features found</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside to close search */}
        {showSearch && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowSearch(false)}
          />
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* ML Status Indicator */}
        <MLStatusIndicator />

        {/* Notifications */}
        <div className="relative z-30">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-[var(--glass-bg)] transition-colors"
          >
            <Bell className="w-5 h-5 text-[var(--muted-text)]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                {unreadCount > 10 ? '10+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-96 bg-[#1a1a2e] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl z-50"
              >
                <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto bg-[#1a1a2e]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-[var(--muted-text)] mx-auto mb-3" />
                      <p className="text-[var(--muted-text)]">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-[var(--glass-border)] last:border-0 bg-[#1a1a2e]',
                          'hover:bg-[#252545] transition-colors group',
                          !notification.isRead && 'bg-[#1e1e3a]'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#252545] flex items-center justify-center shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                'font-medium text-sm',
                                !notification.isRead && 'text-indigo-400'
                              )}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-[var(--muted-text)] shrink-0">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--muted-text)] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {notification.link && (
                                <Link
                                  href={notification.link}
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                >
                                  View details
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-emerald-400 hover:text-emerald-300"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-[var(--glass-border)] bg-[#1a1a2e]">
                  <Link
                    href="/dashboard/notifications"
                    className="block text-center text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Click outside to close notifications */}
        {showNotifications && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowNotifications(false)}
          />
        )}
      </div>
    </header>
  );
}
