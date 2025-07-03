'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import { motion, AnimatePresence } from 'framer-motion';
import RequestsPage from '../dashboard/requests/page';
import AllNotification from '@/components/allNotification';

export default function FavouritesPage() {
    const pathname = usePathname();
    const joinedGroups = [];
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState<'notification' | 'request'>('notification');

    return (
        <div className="h-[92vh] w-full">
            <Navbar />

            {/* Mobile Left Handle */}
            <div className="md:hidden">
                <div
                    className="fixed top-1/2 left-0 rounded-r-2xl px-1 py-12 bg-blue-500 z-[180]"
                    onClick={() => setIsMobileSidebarOpen(true)}
                ></div>
            </div>

            {/* Slidebar for Mobile */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <motion.div
                        className="fixed top-0 left-0 w-full h-screen z-[200] flex"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="w-4/5 h-screen bg-gray-800 shadow-lg"
                        >
                            <Slidebar
                                joinedGroups={joinedGroups}
                                currentPath={pathname}
                                className="text-white h-full mt-12"
                            />
                        </motion.div>

                        <div
                            className="w-1/5 h-screen backdrop-blur-sm bg-black/50"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        ></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layout */}
            <div className="flex h-full mt-14 bg-gray-50 w-full">
                {/* Desktop Sidebar */}
                <div className="hidden md:block w-3/12 bg-white shadow">
                    <Slidebar
                        joinedGroups={joinedGroups}
                        currentPath={pathname}
                        className="text-gray-800 h-full"
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-2 overflow-y-auto w-full">
                    {/* Toggle Buttons */}
                    <div className="flex gap-4 mb-4 mt-2 md:mt-4">
                        <button
                            className={`px-4 py-2 rounded-full font-medium cursor-pointer ${
                                activeView === 'notification'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                            onClick={() => setActiveView('notification')}
                        >
                            All Notification
                        </button>
                        <button
                            className={`px-4 py-2 rounded-full font-medium cursor-pointer ${
                                activeView === 'request'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                            onClick={() => setActiveView('request')}
                        >
                            Requests
                        </button>
                    </div>

                    {/* Show one component only */}
                    <div className="w-full">
                        {activeView === 'notification' && <AllNotification />}
                        {activeView === 'request' && <RequestsPage />}
                    </div>
                </main>
            </div>
        </div>
    );
}
