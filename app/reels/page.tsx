// pages/reels/index.tsx OR app/reels/page.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../../components/navbar';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import Slidebar from '../../components/slidebar';
import ReelsFeed from '../../components/Reels/ReelsFeed';
import { useAuth } from '../../components/AuthProvider';

export default function ReelsPage() {
    const pathname = usePathname();
    const joinedGroups = [];

    const { user: currentUser } = useAuth(); // Destructure user as currentUser

    return (
        <ProtectedRoute>
            <Navbar />
            <div className="h-auto p-4 bg-gray-50 mt-18"> {/* This div might need adjustment too. `mt-18` could be `mt-[72px]` or similar */}
                <div className="flex h-auto">
                    <Slidebar
                        joinedGroups={joinedGroups}
                        currentPath={pathname}
                        className="w-64"
                    />
                    {/* Main content area. Its height (h-[86vh]) should match the ReelsFeed's outer container height */}
                    <main className="flex-1 overflow-hidden p-0 h-[86vh] rounded-lg">
                        <ReelsFeed currentUser={currentUser || undefined} /> {/* Pass currentUser prop */}
                    </main>
                </div>
                <Toaster />
            </div>
        </ProtectedRoute>
    );
}