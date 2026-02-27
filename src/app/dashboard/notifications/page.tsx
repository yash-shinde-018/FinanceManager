'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Trash2,
  ArrowLeft,
  Inbox,
} from 'lucide-react';
import type { Notification } from '@/types';
import {
  listNotifications,
  type NotificationRow,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationRow,
} from '@/lib/db/notifications';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const rows = await listNotifications(100);
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
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      load();
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotificationRow(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'goal':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'transaction':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-[var(--muted-text)]" />;
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
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl hover:bg-[var(--glass-bg)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--muted-text)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-[var(--muted-text)]">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-glass overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-[var(--muted-text)] mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--glass-bg)] flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-[var(--muted-text)]" />
            </div>
            <h3 className="font-semibold mb-2">No notifications yet</h3>
            <p className="text-[var(--muted-text)] max-w-sm mx-auto">
              You will see notifications here when there are updates about your finances, goals, or important alerts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--glass-border)]">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  'p-4 sm:p-6 hover:bg-[var(--glass-bg)] transition-colors group',
                  !notification.isRead && 'bg-indigo-500/5'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] flex items-center justify-center shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={cn(
                          'font-semibold',
                          !notification.isRead && 'text-indigo-400'
                        )}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-sm text-[var(--muted-text)] shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-[var(--muted-text)] mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View details →
                        </Link>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
