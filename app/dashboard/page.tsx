// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '../../components/AuthProvider';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import RightSidebar from '../../components/activitybar';
// import MainBar from '../../components/mainBar';
// import toast, { Toaster } from 'react-hot-toast';
// import { BeatLoader } from "react-spinners";

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// export default function Dashboard() {
//   const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
//   const pathname = usePathname();

//   const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//   const [loadingGroups, setLoadingGroups] = useState(true);
//   const [groupsError, setGroupsError] = useState<string | null>(null);

//   const fetchUserGroups = useCallback(async () => {
//     if (!user || !mongoUser) {
//       setUserJoinedGroups([]);
//       setLoadingGroups(false);
//       return;
//     }

//     setLoadingGroups(true);
//     setGroupsError(null);

//     try {
//       const token = await getIdToken();
//       if (!token) throw new Error("Authentication token not available.");

//       const response = await fetch(`${API_BASE_URL}/groups/joined`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         const errorMessage = errorData.message || 'Failed to fetch joined groups';
//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
//       setUserJoinedGroups(data);
//     } catch (error: any) {
//       setGroupsError(error.message);
//       setUserJoinedGroups([]);
//       toast.error(`Error loading groups: ${error.message}`);
//     } finally {
//       setLoadingGroups(false);
//     }
//   }, [user, mongoUser, getIdToken]);

//   useEffect(() => {
//     if (user && mongoUser && !authLoading) {
//       fetchUserGroups();
//     }
//   }, [user, mongoUser, authLoading, fetchUserGroups]);

//   if (authLoading || (user && !mongoUser)) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <BeatLoader color="#3498db" size={20} />
//       </div>
//     );
//   }

//   if (!user || !mongoUser) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p>Authentication required. Redirecting...</p>
//       </div>
//     );
//   }

//   const userIdToUse = mongoUser._id;

//   return (
//     <div className="flex flex-col h-screen">
//       <Navbar />
//       <div className="h-auto p-4 mt-18 flex flex-grow bg-gray-50 overflow-hidden">
//         <Slidebar
//           joinedGroups={userJoinedGroups}
//           currentPath={pathname}
//           className="flex-shrink-0"
//         />
//         <MainBar className="flex-grow" />
//         <RightSidebar userId={userIdToUse} className="flex-shrink-0" />
//       </div>
//       <Toaster />
//     </div>
//   );
// }










// mobile view


'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import RightSidebar from '../../components/activitybar'; // Correct import for ActivityBar
import MainBar from '../../components/mainBar';
import toast, { Toaster } from 'react-hot-toast';
import { BeatLoader } from 'react-spinners';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

export default function Dashboard() {
  const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [userJoinedGroups, setUserJoinedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const fetchUserGroups = useCallback(async () => {
    if (!user || !mongoUser) {
      setUserJoinedGroups([]);
      setLoadingGroups(false);
      return;
    }

    setLoadingGroups(true);
    setGroupsError(null);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token not available.");

      const response = await fetch(`${API_BASE_URL}/groups/joined`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to fetch joined groups';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUserJoinedGroups(data);
    } catch (error: any) {
      setGroupsError(error.message);
      setUserJoinedGroups([]);
      toast.error(`Error loading groups: ${error.message}`);
    } finally {
      setLoadingGroups(false);
    }
  }, [user, mongoUser, getIdToken]);

  useEffect(() => {
    if (user && mongoUser && !authLoading) {
      fetchUserGroups();
    }
  }, [user, mongoUser, authLoading, fetchUserGroups]);

  // Function to close the right sidebar (ActivityBar) for mobile
  const handleCloseRightSidebar = useCallback(() => {
    setRightOpen(false);
    console.log("Right Sidebar (ActivityBar) closed.");
  }, []);

  if (authLoading || (user && !mongoUser)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#3498db" size={20} />
      </div>
    );
  }

  if (!user || !mongoUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Authentication required. Redirecting...</p>
      </div>
    );
  }

  const userIdToUse = mongoUser._id;

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* 🔵 Thin Toggle Bars (Mobile Only) */}
      <div className="md:hidden fixed left-0 py-12 px-1 top-1/2 rounded-r-md bg-blue-400 z-40 cursor-pointer" onClick={() => { setLeftOpen(true); setRightOpen(false); }} />
      <div className="md:hidden fixed right-0 px-1 py-12 top-1/2 rounded-l-md bg-blue-400 z-40 cursor-pointer" onClick={() => { setRightOpen(true); setLeftOpen(false); }} />

      {/* Overlay/Backdrop when any sidebar is open on mobile */}
      {(leftOpen || rightOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => { setLeftOpen(false); setRightOpen(false); }}
        />
      )}

      {/* Main Content Container */}
      {/* mt-[64px] added to account for Navbar height (assuming Navbar is h-16 or 64px) */}
      <div className="h-auto mt-[64px] flex flex-grow bg-gray-50 overflow-hidden relative">

        {/* Left Sidebar */}
        <div className={`
            transition-transform duration-300 ease-in-out
            fixed left-0 bg-gray-100 shadow-lg z-50
            md:relative md:translate-x-0 md:flex md:w-2/6 md:visible md:h-auto md:my-0
            ${leftOpen ? 'translate-x-0 w-4/5 top-0 h-full' : '-translate-x-full w-0 invisible top-0'}` // Adjusted top to 0 and h-full
            }>
          <Slidebar
            joinedGroups={userJoinedGroups}
            currentPath={pathname}
            className="h-full w-full"
          />
        </div>

        {/* Main Bar */}
        {/* On mobile, MainBar should always be visible, taking full width if sidebars are closed */}
        <div className="flex-grow z-10 w-full h-auto md:w-3/5"> {/* Removed md:mt-4 as Navbar handles space */}
          <MainBar className="w-full h-full overflow-auto" /> {/* Changed to h-full */}
        </div>

        {/* Right Sidebar (ActivityBar) */}
        <div className={`
            transition-transform duration-300 ease-in-out
            fixed right-0 bg-white shadow-lg z-50
            md:relative md:translate-x-0 md:flex md:w-2/6 md:visible md:h-auto md:my-0
            ${rightOpen ? 'translate-x-0 w-5/5 top-14 h-full' : 'translate-x-full w-0 invisible top-0 h-full'}` // Adjusted top to 0, width to 4/5
            }>
          <RightSidebar
            userId={userIdToUse}
            className="h-full w-full"
            onCloseMobile={handleCloseRightSidebar} // Pass the close function here!
          />
        </div>
      </div>

      <Toaster />
    </div>
  );
}