'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/navbar';
import ProtectedRoute from '../../components/ProtectedRoute';
import Slidebar from '../../components/slidebar';
import Main from '../../components/chat/main';
import { useAuth } from '../../components/AuthProvider';
import { fetchMongoUserId } from '../../utils/userApi';

export default function ChatPage() {
  const pathname = usePathname();
  const joinedGroups: { id: string; name: string; avatar?: string }[] = [];

  const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const leftRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (leftRef.current && !(leftRef.current as any).contains(event.target)) {
        setLeftOpen(false);
      }
    };
    if (leftOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leftOpen]);

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
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 flex overflow-hidden mt-18">
          {/* Mobile Toggle Button */}
          <div className="md:hidden absolute top-1/2 left-0 transform -translate-y-1/2 z-30">
            <button
              onClick={() => setLeftOpen(true)}
              className="bg-blue-400 text-white px-1 py-12 rounded-r-md"
              aria-label="Open sidebar"
            />
          </div>

          {/* Mobile Sidebar Slide-in */}
          <div
            className={`fixed inset-0 z-40 bg-black/30 mt-14 backdrop-blur-sm md:hidden transition-opacity duration-300 ${leftOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
          >
            <div
              ref={leftRef}
              className={`absolute top-0 left-0 h-full w-4/5 bg-white shadow-lg transform transition-transform duration-300 ${leftOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="h-full" />
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:flex w-3/12 h-full">
            <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="h-full w-full" />
          </div>

          {/* Chat Main Component */}
          <main className="flex-1 h-full overflow-hidden">
            <Main userId={userIdToUse} />
          </main>
        </div>

        <Toaster />
      </div>
    </ProtectedRoute>
  );
}