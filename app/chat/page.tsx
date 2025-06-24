'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Navbar from '../../components/navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import Slidebar from '../../components/slidebar';
import Main from '../../components/chat/main';
import { useAuth } from '../../components/AuthProvider';
import { fetchMongoUserId } from '../../utils/userApi';

export default function ReelsPage() {
  const pathname = usePathname();
  const joinedGroups: string[] = [];

  const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      if (user && !mongoUser && !authLoading) {
        try {
          const token = await getIdToken();
          if (token) {
            const id = await fetchMongoUserId(user.uid, token);
            setFetchedUserId(id);
          }
        } catch (err) {
          console.error('Failed to fetch MongoDB user ID:', err);
          setFetchedUserId(null);
        }
      }
    };
    getUserId();
  }, [user, mongoUser, authLoading, getIdToken]);

  const userIdToUse = mongoUser?._id || fetchedUserId || null;

  if (authLoading || (user && !userIdToUse)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="h-auto p-4 bg-gray-50 mt-18">
        <div className="flex h-auto">
          <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="w-64" />
          <main className="flex-1 overflow-hidden p-0 h-[86vh] rounded-lg">
            {/* Passing the userId to Main for chat context */}
            <Main userId={userIdToUse} />
          </main>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
