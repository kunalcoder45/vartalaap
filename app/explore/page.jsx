'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import PostGrid from '../../components/Explore/PostGrid'; // Import the PostGrid component

export default function FavouritesPage() {
    const pathname = usePathname();
    const joinedGroups = []; // Assuming this will be populated dynamically if needed elsewhere

    return (
        <ProtectedRoute>
            <Navbar />
            <div className="h-auto p-4 bg-gray-50 mt-18">
                {/* This div needs to be the flex container for the sidebar and main content */}
                <div className="flex h-auto">
                    {/* The Slidebar */}
                    <Slidebar
                        joinedGroups={joinedGroups} // Pass actual joined groups if available
                        currentPath={pathname}
                        className="w-64"
                    />
                    {/* The main content area. Use flex-1 to make it take all available space. */}
                    <main className='flex-1 p-6 overflow-auto h-[85vh]'> {/* Changed w-full back to flex-1 */}
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Posts</h1>
                        <PostGrid /> {/* Uncomment PostGrid to render your posts */}
                    </main>
                </div>
                <Toaster />
            </div>
        </ProtectedRoute>
    );
}