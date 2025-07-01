// // pages/reels/index.tsx OR app/reels/page.tsx
// 'use client';

// import { usePathname } from 'next/navigation';
// import Navbar from '../../components/navbar';
// import { Toaster } from 'react-hot-toast';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import Slidebar from '../../components/slidebar';
// import ReelsFeed from '../../components/Reels/ReelsFeed';
// import { useAuth } from '../../components/AuthProvider';
// import '../globals.css';

// export default function ReelsPage() {
//     const pathname = usePathname();
//     const joinedGroups = [];

//     const { user: currentUser } = useAuth(); // Destructure user as currentUser

//     return (
//         <ProtectedRoute>
//             <Navbar />
//             <div className="h-auto p-4 bg-gray-50 mt-18"> {/* This div might need adjustment too. `mt-18` could be `mt-[72px]` or similar */}
//                 <div className="flex h-auto">
//                     <Slidebar
//                         joinedGroups={joinedGroups}
//                         currentPath={pathname}
//                         className="w-3/12"
//                     />
//                     {/* Main content area. Its height (h-[86vh]) should match the ReelsFeed's outer container height */}
//                     <main className="flex-1 overflow-hidden p-0 h-[86vh] rounded-lg hide-scrollbar">
//                         <ReelsFeed currentUser={currentUser || undefined} /> {/* Pass currentUser prop */}
//                     </main>
//                 </div>
//                 <Toaster />
//             </div>
//         </ProtectedRoute>
//     );
// }





/// responsive


'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/navbar';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import Slidebar from '../../components/slidebar';
import ReelsFeed from '../../components/Reels/ReelsFeed';
import { useAuth } from '../../components/AuthProvider';
import '../globals.css';

export default function ReelsPage() {
  const pathname = usePathname();
  const joinedGroups = [];

  const { user: currentUser } = useAuth();

  const [leftOpen, setLeftOpen] = useState(false);
  const leftRef = useRef(null);

  // Click outside to close mobile sidebar
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

  return (
    <ProtectedRoute>
      <Navbar />

      {/* 🔵 Mobile Left Toggle Button */}
      <div className="md:hidden absolute top-1/2 left-0 transform -translate-y-1/2 z-30">
        <button
          onClick={() => setLeftOpen(true)}
          className="bg-blue-400 text-white px-1 py-12 rounded-r-md"
          aria-label="Open sidebar"
        />
      </div>

      {/* Mobile Slidebar Overlay with smooth slide and fade */}
      <div
        className={`fixed inset-0 mt-14 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          leftOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          ref={leftRef}
          className={`absolute top-0 left-0 h-full w-4/5 bg-white shadow-lg transform transition-transform duration-300 ${
            leftOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="h-full" />
        </div>
      </div>

      {/* 🖥️ Desktop + Main Content */}
      <div className="h-auto p-0 bg-gray-50 mt-18">
        <div className="flex gap-3 h-auto">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-3/12 h-[90vh] p-0">
            <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="h-full" />
          </div>

          {/* Reels Main Content */}
          <main className="flex-1 overflow-hidden py-2 md:pr-1 h-[89vh] md:h-[90vh] rounded-lg hide-scrollbar">
            <ReelsFeed currentUser={currentUser || undefined} />
          </main>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
