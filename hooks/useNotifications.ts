// src/hooks/useNotifications.ts
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    avatarUrl?: string | null;
    firebaseUid?: string;
  };
  link?: string;
  data?: {
    requestId?: string;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://vartalaap-r36o.onrender.com/api';

export const useNotifications = (
  getIdToken: () => Promise<string | null>,
  userId?: string
) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!getIdToken || !userId) return;
    try {
      const idToken = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [getIdToken, userId]);

  const markAllAsRead = useCallback(async () => {
    if (!getIdToken || !userId) return;
    try {
      const idToken = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to mark all read');
      // Refresh notifications after marking all as read
      await fetchNotifications();
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark notifications as read');
    }
  }, [getIdToken, userId, fetchNotifications]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [fetchNotifications, userId]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllAsRead,
    setNotifications,
  };
};
