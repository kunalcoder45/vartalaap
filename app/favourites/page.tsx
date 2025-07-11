'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';

export default function FavouritesPage() {
    const pathname = usePathname(); 
    const joinedGroups = [];

    return (
        <div>
            <Navbar />
            <div className="flex-grow p-6 bg-gray-50 flex space-x-6 justify-center">
                <Slidebar joinedGroups={joinedGroups} currentPath={pathname}  className="" />
                <main className="flex-1 p-6">
                    <h1>Your Favourites</h1>
                </main>
            </div>
        </div>
    );
}