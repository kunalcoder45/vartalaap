// 'use client';

// import { usePathname } from 'next/navigation';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import { Toaster } from 'react-hot-toast';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import PostGrid from '../../components/Explore/PostGrid'; // Import the PostGrid component
// import RightSidebar from '../../components/activitybar';
// import { useAuth } from '@/components/AuthProvider';

// export default function FavouritesPage() {
//     const { mongoUser } = useAuth();
//     const pathname = usePathname();
//     const joinedGroups = [];
//     const userIdToUse = mongoUser._id;

//     return (
//         <ProtectedRoute>
//             <Navbar />
//             <div className="h-100vh bg-gray-50 mt-18">
//                 {/* This div needs to be the flex container for the sidebar and main content */}
//                 <div className="flex h-auto w-full">
//                     {/* The Slidebar */}
//                     <Slidebar
//                         joinedGroups={joinedGroups} // Pass actual joined groups if available
//                         currentPath={pathname}
//                         className="w-3/12 h-[90vh]"
//                     />
//                     {/* The main content area. Use flex-1 to make it take all available space. */}
//                     <main className='flex-1 p-6 overflow-auto h-[90vh] w-1/2'> {/* Changed w-full back to flex-1 */}
//                         <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Posts</h1>
//                         <PostGrid /> {/* Uncomment PostGrid to render your posts */}
//                     </main>
//                     <div className="w-3/12 h-[90vh]">
//                         <RightSidebar userId={userIdToUse} className="h-full w-full" />
//                     </div>
//                 </div>
//                 <Toaster />
//             </div>
//         </ProtectedRoute>
//     );
// }








/// responsive 



// 'use client';

// import { usePathname } from 'next/navigation';
// import { useState, useRef, useEffect } from 'react';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import { Toaster } from 'react-hot-toast';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import PostGrid from '../../components/Explore/PostGrid';
// import RightSidebar from '../../components/activitybar';
// import { useAuth } from '@/components/AuthProvider';

// export default function FavouritesPage() {
//   const { mongoUser } = useAuth();
//   const pathname = usePathname();
//   const joinedGroups = [];
//   const userIdToUse = mongoUser._id;

//   const [leftOpen, setLeftOpen] = useState(false);
//   const [rightOpen, setRightOpen] = useState(false);

//   const leftRef = useRef(null);
//   const rightRef = useRef(null);

//   // Click outside to close sidebars
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (leftRef.current && !(leftRef.current as any).contains(event.target)) {
//         setLeftOpen(false);
//       }
//       if (rightRef.current && !(rightRef.current as any).contains(event.target)) {
//         setRightOpen(false);
//       }
//     };
//     if (leftOpen || rightOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [leftOpen, rightOpen]);

//   return (
//     <ProtectedRoute>
//       <Navbar />
//       <div className="h-100vh bg-gray-50 mt-18 relative overflow-hidden">
//         {/* Mobile toggle bars */}
//         <div className="md:hidden absolute top-1/2 left-0 transform -translate-y-1/2 z-30">
//           <button
//             onClick={() => setLeftOpen(true)}
//             className="bg-blue-400 text-white px-1 py-12 rounded-r-md"
//           />
//         </div>
//         <div className="md:hidden absolute top-1/2 right-0 transform -translate-y-1/2 z-30">
//           <button
//             onClick={() => setRightOpen(true)}
//             className="bg-blue-400 text-white px-1 py-12 rounded-l-md"
//           />
//         </div>

//         {/* Left Sidebar (Mobile Slide In) */}
//         {leftOpen && (
//           <div className="fixed inset-0 mt-14 z-40 bg-opacity-30 backdrop-blur-sm md:hidden">
//             <div
//               ref={leftRef}
//               className="absolute top-0 left-0 h-full w-4/5 bg-white shadow-lg transition-transform duration-300"
//             >
//               <Slidebar
//                 joinedGroups={joinedGroups}
//                 currentPath={pathname}
//                 className="h-full"
//               />
//             </div>
//           </div>
//         )}

//         {/* Right Sidebar (Mobile Slide In) */}
//         {rightOpen && (
//           <div className="fixed inset-0 mt-14 z-40 bg-opacity-30 backdrop-blur-sm md:hidden">
//             <div
//               ref={rightRef}
//               className="absolute top-0 right-0 h-full w-4/5 bg-white shadow-lg transition-transform duration-300"
//             >
//               <RightSidebar userId={userIdToUse} className="h-full w-full" />
//             </div>
//           </div>
//         )}

//         {/* Main Content - always visible */}
//         <div className="flex h-auto w-full">
//           {/* Desktop Left Sidebar */}
//           <div className="hidden md:block w-3/12 h-[90vh]">
//             <Slidebar
//               joinedGroups={joinedGroups}
//               currentPath={pathname}
//               className="h-full"
//             />
//           </div>

//           {/* Main Section */}
//           <main className="flex-1 p-6 overflow-auto h-[90vh] w-full md:w-1/2">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Posts</h1>
//             <PostGrid />
//           </main>

//           {/* Desktop Right Sidebar */}
//           <div className="hidden md:block w-3/12 h-[90vh]">
//             <RightSidebar userId={userIdToUse} className="h-full w-full" />
//           </div>
//         </div>

//         <Toaster />
//       </div>
//     </ProtectedRoute>
//   );
// }



/// 

'use client';

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import PostGrid from '../../components/Explore/PostGrid';
import RightSidebar from '../../components/activitybar';
import { useAuth } from '@/components/AuthProvider';
import { MessageSquare } from 'lucide-react';

export default function FavouritesPage() {
  const { mongoUser } = useAuth();
  const pathname = usePathname();
  const joinedGroups = [];
  const userIdToUse = mongoUser._id;

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false); // shared for both desktop toggle & mobile

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Click outside to close sidebars
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (leftRef.current && !(leftRef.current as any).contains(event.target)) {
        setLeftOpen(false);
      }
      if (rightRef.current && !(rightRef.current as any).contains(event.target)) {
        setRightOpen(false);
      }
    };
    if (leftOpen || rightOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leftOpen, rightOpen]);

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="h-100vh bg-gray-50 mt-18 relative overflow-hidden">
        {/* Mobile toggle bars */}
        <div className="md:hidden absolute top-1/2 left-0 transform -translate-y-1/2 z-30">
          <button
            onClick={() => setLeftOpen(true)}
            className="bg-blue-400 text-white px-1 py-12 rounded-r-md"
          />
        </div>
        <div className="md:hidden absolute top-1/2 right-0 transform -translate-y-1/2 z-30">
          <button
            onClick={() => setRightOpen(true)}
            className="bg-blue-400 text-white px-1 py-12 rounded-l-md"
          />
        </div>

        {/* Left Sidebar (Mobile Slide In) */}
        {leftOpen && (
          <div className="fixed inset-0 mt-14 z-40 bg-opacity-30 backdrop-blur-sm md:hidden">
            <div
              ref={leftRef}
              className="absolute top-0 left-0 h-full w-4/5 bg-white shadow-lg transition-transform duration-300"
            >
              <Slidebar
                joinedGroups={joinedGroups}
                currentPath={pathname}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Right Sidebar (Mobile Slide In) */}
        {rightOpen && (
          <div className="fixed inset-0 mt-14 z-40 bg-opacity-30 backdrop-blur-sm md:hidden">
            <div
              ref={rightRef}
              className="absolute top-0 right-0 h-full w-4/5 bg-white shadow-lg transition-transform duration-300"
            >
              <RightSidebar userId={userIdToUse} className="h-full w-full" />
            </div>
          </div>
        )}

        {/* Desktop Right Sidebar (Slide-In) */}
        {rightOpen && (
          <div className="hidden md:block fixed top-16 right-0 z-40 w-[24rem] h-[calc(100vh-4rem)] bg-white shadow-lg transition-transform duration-300" ref={rightRef}>
            <RightSidebar userId={userIdToUse} className="h-full w-full" />
          </div>
        )}

        {/* Desktop Right Sidebar Toggle Button */}
        {!rightOpen && (
          <div className="hidden md:flex fixed top-1/2 right-0 transform -translate-y-1/2 z-30">
            <button
              onClick={() => setRightOpen(true)}
              className="flex flex-col items-center gap-2 bg-blue-500 text-white px-1 py-12 rounded-l-md shadow-md hover:bg-blue-600 cursor-pointer"
            >
              <MessageSquare size={18} />
              <span
                className="text-sm"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(360deg)' }}
              >
                Messages
              </span>
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="flex h-auto w-full">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block w-3/12 h-[90vh]">
            <Slidebar
              joinedGroups={joinedGroups}
              currentPath={pathname}
              className="h-full"
            />
          </div>

          {/* Main Section */}
          <main className="flex-1 p-6 overflow-auto h-[90vh] w-full md:w-9/12">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Posts</h1>
            <PostGrid />
          </main>
        </div>

        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
