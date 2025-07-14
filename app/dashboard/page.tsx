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

// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '../../components/AuthProvider';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import RightSidebar from '../../components/activitybar';
// import MainBar from '../../components/mainBar';
// import toast, { Toaster } from 'react-hot-toast';
// import { BeatLoader } from 'react-spinners';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// export default function Dashboard() {
//   const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
//   const pathname = usePathname();
//   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
//   const [showInstallBtn, setShowInstallBtn] = useState(false);

//   const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//   const [loadingGroups, setLoadingGroups] = useState(true);
//   const [groupsError, setGroupsError] = useState<string | null>(null);

//   const [leftOpen, setLeftOpen] = useState(false);
//   const [rightOpen, setRightOpen] = useState(false);

//   useEffect(() => {
//     const handleBeforeInstallPrompt = (e: any) => {
//       e.preventDefault();
//       setDeferredPrompt(e);
//       setShowInstallBtn(true);
//       console.log("💡 Install prompt captured.");
//     };

//     window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

//     return () => {
//       window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
//     };
//   }, []);

//   const handleInstallClick = async () => {
//     if (!deferredPrompt) return;

//     deferredPrompt.prompt();

//     const choice = await deferredPrompt.userChoice;
//     if (choice.outcome === 'accepted') {
//       console.log("✅ User accepted install prompt");
//     } else {
//       console.log("❌ User dismissed install prompt");
//     }

//     setDeferredPrompt(null);
//     setShowInstallBtn(false);
//   };

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

//   const handleCloseRightSidebar = useCallback(() => {
//     setRightOpen(false);
//     console.log("Right Sidebar (ActivityBar) closed.");
//   }, []);

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

//       {/* Mobile sidebar toggles */}
//       <div className="md:hidden fixed left-0 py-12 px-1 top-1/2 rounded-r-md bg-blue-400 z-996 cursor-pointer" onClick={() => { setLeftOpen(true); setRightOpen(false); }} />
//       <div className="md:hidden fixed right-0 px-1 py-12 top-1/2 rounded-l-md bg-blue-400 z-996 cursor-pointer" onClick={() => { setRightOpen(true); setLeftOpen(false); }} />

//       {(leftOpen || rightOpen) && (
//         <div
//           className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-996 md:hidden"
//           onClick={() => { setLeftOpen(false); setRightOpen(false); }}
//         />
//       )}

//       <div className="h-auto mt-[64px] flex flex-grow bg-gray-50 overflow-hidden relative">

//         {/* Left Sidebar */}
//         <div className={`
//           transition-transform duration-300 ease-in-out
//           fixed left-0 bg-gray-100 shadow-lg z-996
//           md:relative md:translate-x-0 md:flex md:w-2/6 md:visible md:h-auto md:my-0
//           ${leftOpen ? 'translate-x-0 w-4/5 top-14 h-full' : '-translate-x-full w-0 invisible top-0'}
//         `}>
//           <Slidebar
//             joinedGroups={userJoinedGroups}
//             currentPath={pathname}
//             className="h-full w-full"
//           />
//         </div>

//         {/* Main Bar */}
//         <div className="flex-grow z-995 w-full h-auto md:w-3/5 mt-0 md:mt-3">
//           <MainBar className="w-full h-full overflow-auto" />
//         </div>

//         {/* Right Sidebar */}
//         <div className={`
//           transition-transform duration-300 ease-in-out
//           fixed right-0 bg-white shadow-lg z-996
//           md:relative md:translate-x-0 md:flex md:w-2/6 md:visible md:h-auto md:my-0
//           ${rightOpen ? 'translate-x-0 w-5/5 top-14 h-full' : 'translate-x-full w-0 invisible top-0 h-full'}
//         `}>
//           <RightSidebar
//             userId={userIdToUse}
//             className="h-full w-full"
//             onCloseMobile={handleCloseRightSidebar}
//           />
//         </div>
//       </div>

//       {/* 🔽 Install Button (Bottom-Right) */}
//       {showInstallBtn && (
//         <div className="fixed bottom-6 right-6 z-[9999]">
//           {showInstallBtn && (
//             <button
//               onClick={handleInstallClick}
//               className="fixed bottom-6 right-6 z-996 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300"
//             >
//               Install App
//             </button>
//           )}

//         </div>
//       )}
//       <Toaster />
//     </div>
//   );
// }









'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import RightSidebar from '../../components/activitybar';
import MainBar from '../../components/mainBar';
import toast, { Toaster } from 'react-hot-toast';
import { BeatLoader } from 'react-spinners';
import ShinyText from '@/components/ShinyText';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

export default function Dashboard() {
  const {
    user,
    mongoUser,
    getIdToken,
    loading: authLoading,
    setMongoUser
  } = useAuth();

  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [userJoinedGroups, setUserJoinedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallBtn(false);

    if (choice.outcome === 'accepted') {
      console.log("✅ User accepted install prompt");
    } else {
      console.log("❌ User dismissed install prompt");
    }
  };

  // ✅ Sync user's profile from backend if not already fetched
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error("No auth token");

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch profile');
      }

      const profileData = await res.json();
      console.log('✅ Profile fetched:', profileData);
      setMongoUser(profileData);
    } catch (error: any) {
      toast.error(`Failed to fetch profile: ${error.message}`);
      console.error('❌ Profile fetch error:', error);
    }
  }, [getIdToken, setMongoUser]);

  useEffect(() => {
    if (user && !authLoading && !mongoUser) {
      fetchUserProfile();
    }
  }, [user, authLoading, mongoUser, fetchUserProfile]);

  // 📦 Fetch groups the user has joined
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

      const res = await fetch(`${API_BASE_URL}/groups/joined`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch joined groups');
      }

      const data = await res.json();
      setUserJoinedGroups(data);
    } catch (error: any) {
      setGroupsError(error.message);
      toast.error(`Error loading groups: ${error.message}`);
      setUserJoinedGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, [user, mongoUser, getIdToken]);

  useEffect(() => {
    if (user && mongoUser && !authLoading) {
      fetchUserGroups();
    }
  }, [user, mongoUser, authLoading, fetchUserGroups]);

  const handleCloseRightSidebar = useCallback(() => {
    setRightOpen(false);
    console.log("Right Sidebar (ActivityBar) closed.");
  }, []);

  // 🔄 Loading state until profile is ready
  if (authLoading || (user && !mongoUser)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#3498db" size={20} />
      </div>
    );
  }

  // 🔐 Fallback if user not authenticated
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

      {/* Mobile sidebar toggles */}
      <div className="md:hidden fixed left-0 py-12 px-1 top-1/2 rounded-r-md bg-blue-400 z-996 cursor-pointer" onClick={() => { setLeftOpen(true); setRightOpen(false); }} />
      <div className="md:hidden fixed right-0 px-1 py-12 top-1/2 rounded-l-md bg-blue-400 z-996 cursor-pointer" onClick={() => { setRightOpen(true); setLeftOpen(false); }} />

      {(leftOpen || rightOpen) && (
        <div
          className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-996 md:hidden"
          onClick={() => { setLeftOpen(false); setRightOpen(false); }}
        />
      )}

      <div className="h-auto mt-[64px] flex flex-grow bg-gray-50 overflow-hidden relative">
        {/* Left Sidebar */}
        <div className={`
          transition-transform duration-300 ease-in-out
          fixed left-0 bg-gray-100 shadow-lg z-996
          md:relative md:translate-x-0 md:flex md:w-2/6 md:visible md:h-auto md:my-0
          ${leftOpen ? 'translate-x-0 w-4/5 top-14 h-full' : '-translate-x-full w-0 invisible top-0'}
        `}>
          <Slidebar
            joinedGroups={userJoinedGroups}
            currentPath={pathname}
            className="h-full w-full"
          />
        </div>

        {/* Main Bar */}
        <div className="flex-grow z-995 w-full h-auto md:w-3/5 mt-0 md:mt-3">
          <MainBar className="w-full h-full overflow-auto" />
        </div>

        {/* Right Sidebar */}
        <div className={`
          transition-transform duration-300 ease-in-out
          fixed right-0 bg-white shadow-lg z-996
          md:relative md:translate-x-0 md:flex md:w-2/6 md:visible md:h-auto md:my-0
          ${rightOpen ? 'translate-x-0 w-5/5 top-14 h-full' : 'translate-x-full w-0 invisible top-0 h-full'}
        `}>
          <RightSidebar
            userId={userIdToUse}
            className="h-full w-full"
            onCloseMobile={handleCloseRightSidebar}
          />
        </div>
      </div>

      {/* PWA Install Button */}
      {showInstallBtn && (
        <div className="fixed bottom-3 right-3 z-[9999]">
          <button className="cursor-pointer group flex h-10 items-center gap-2 rounded-full bg-black pl-3 pr-4 transition-all duration-300 ease-in-out hover:bg-black hover:pl-2 hover:text-white active:bg-neutral-700"
            onClick={handleInstallClick}>
            <span className="rounded-full bg-white p-1 text-sm transition-colors duration-300 group-hover:bg-white">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="-translate-x-[200%] text-[0px] transition-all duration-300 group-hover:translate-x-0 group-hover:text-lg group-hover:text-black group-active:-rotate-45"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <ShinyText text="Install App" disabled={false} speed={3} className='custom-class' />
          </button>
        </div>
      )}

      <Toaster />
    </div>
  );
}
