'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  ChevronRight
} from 'lucide-react';
import type { Notification } from '@/types';
import {
  listNotifications,
  type NotificationRow,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationRow,
} from '@/lib/db/notifications';
import MLStatusIndicator from '@/components/dashboard/MLStatusIndicator';

interface HeaderProps {
  isCollapsed: boolean;
}

export default function Header({ isCollapsed }: HeaderProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
        'fixed top-0 right-0 z-30 h-16 card-glass border-b border-[var(--glass-border)]',
        'flex items-center justify-between px-6 transition-all duration-300',
        isCollapsed ? 'left-20' : 'left-[280px]'
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
          <input
            type="text"
            placeholder="Search transactions, insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
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
                {unreadCount}
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
                className="absolute right-0 top-full mt-2 w-96 card-glass rounded-2xl overflow-hidden shadow-2xl"
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

                <div className="max-h-96 overflow-y-auto">
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
                          'p-4 border-b border-[var(--glass-border)] last:border-0',
                          'hover:bg-[var(--glass-bg)] transition-colors group',
                          !notification.isRead && 'bg-indigo-500/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--glass-bg)] flex items-center justify-center shrink-0">
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

                <div className="p-3 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
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
