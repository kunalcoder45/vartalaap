'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { useNotifications } from '../hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import defaultUserLogo from '../app/assets/userLogo.png';

const AllNotification = () => {
  const { user, getIdToken } = useAuth();
  const { notifications, loading } = useNotifications(getIdToken, user?._id);
  const router = useRouter();

  const handleClick = (notif: any) => {
    const uid = notif.sender?.firebaseUid || notif.sender?._id || 'profile';
    router.push(`/users/${uid}`);
  };

  return (
    <div className="p-4 md:p-6 w-full h-full bg-white rounded-md shadow-md overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">All Notifications</h2>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-blue-500" size={24} />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications available.</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleClick(notif)}
                className="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Image
                    src={notif?.sender?.avatarUrl || defaultUserLogo}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover aspect-square"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt))} ago
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AllNotification;
