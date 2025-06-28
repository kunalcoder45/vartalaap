// 'use client';

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { useAuth } from '../../components/AuthProvider';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import RightSidebar from '../../components/activitybar';
// import MainBar from '../../components/mainBar';
// import toast, { Toaster } from 'react-hot-toast';
// import { fetchMongoUserId } from '../../utils/userApi';
// import { BeatLoader } from "react-spinners"; // Import BeatLoader

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// export default function Dashboard() {
//     const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
//     const pathname = usePathname();

//     const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//     const [loadingGroups, setLoadingGroups] = useState(true);
//     const [groupsError, setGroupsError] = useState(null);
//     const imageInputRef = useRef(null);
//     const videoInputRef = useRef(null);

//     // --- New State for separately fetched userId ---
//     const [fetchedUserId, setFetchedUserId] = useState(null);
//     // --- End New State ---

//     const fetchUserGroups = useCallback(async () => {
//         if (!user) {
//             setUserJoinedGroups([]);
//             setLoadingGroups(false);
//             return;
//         }

//         setLoadingGroups(true);
//         setGroupsError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error("Authentication token not available.");

//             const response = await fetch(`${API_BASE_URL}/groups/joined`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 let errorMessage = 'Failed to fetch joined groups';
//                 try {
//                     const clonedResponse = response.clone();
//                     const errorData = await clonedResponse.json();
//                     errorMessage = errorData.message || errorMessage;
//                 } catch (jsonError) {
//                     try {
//                         const text = await response.text();
//                         console.error('Non-JSON error response from /groups/joined:', text);
//                         errorMessage = text || errorMessage;
//                     } catch (textError) {
//                         console.error('Error reading response text from /groups/joined:', textError);
//                     }
//                 }
//                 throw new Error(`${errorMessage} (Status: ${response.status})`);
//             }

//             const data = await response.json();
//             setUserJoinedGroups(data);
//         } catch (error) {
//             console.error("Error fetching joined groups:", error.message);
//             setGroupsError(error.message);
//             setUserJoinedGroups([]);
//             toast.error(`Error loading groups: ${error.message}`);
//         } finally {
//             setLoadingGroups(false);
//         }
//     }, [user, getIdToken]);

//     // --- New useEffect to fetch userId using the new utility function ---
//     useEffect(() => {
//         const getUserIdSeparately = async () => {
//             if (user && !authLoading) {
//                 const token = await getIdToken();
//                 if (token) {
//                     const id = await fetchMongoUserId(user.uid, token);
//                     if (id) {
//                         setFetchedUserId(id);
//                         console.log("Dashboard: Separately fetched userId:", id);
//                     } else {
//                         console.log("Dashboard: Failed to separately fetch userId.");
//                     }
//                 }
//             }
//         };

//         getUserIdSeparately();
//     }, [user, authLoading, getIdToken]);
//     // --- End New useEffect ---

//     useEffect(() => {
//         fetchUserGroups();
//     }, [fetchUserGroups]);

//     const userIdToUse = mongoUser?._id || fetchedUserId || null;

//     useEffect(() => {
//         if (authLoading) {
//             console.log("Dashboard: Auth is still loading...");
//         } else if (userIdToUse) {
//             console.log("Dashboard: Current userId for RightSidebar (from mongoUser or separate fetch):", userIdToUse);
//         } else {
//             console.log("Dashboard: Auth finished loading, but userId is null. This indicates a problem fetching/syncing mongoUser profile data.");
//         }
//     }, [userIdToUse, authLoading]);

//     // --- Loading State with Spinner ---
//     if (authLoading || (user && !userIdToUse)) { // Show spinner if auth is loading or if user exists but mongoUser isn't ready
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <BeatLoader color="#3498db" size={20} /> {/* Adjust size as needed */}
//             </div>
//         );
//     }
//     // --- End Loading State with Spinner ---

//     if (!userIdToUse && !user && !authLoading) {
//         console.log("Dashboard: Auth finished, user is not logged in or profile not found. Redirecting via ProtectedRoute.");
//         // This case should ideally be handled by ProtectedRoute, but good for logging.
//     }

//     return (
//         <ProtectedRoute>
//             <Navbar />
//             <div className="h-auto p-4 bg-gray-50 mt-18">
//                 <div className="flex h-auto">
//                     <div className="flex-shrink-0">
//                         <Slidebar
//                             joinedGroups={userJoinedGroups}
//                             currentPath={pathname}
//                             className=""
//                         />
//                     </div>
//                     <MainBar />
//                     <div className="flex-shrink-0">
//                         <RightSidebar userId={userIdToUse} />
//                     </div>
//                 </div>
//                 <Toaster />
//             </div>
//         </ProtectedRoute>
//     );
// }   


// cleanup code




// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import ProtectedRoute from '../../components/ProtectedRoute'; // Assumes this handles redirection if no user
// import { useAuth } from '../../components/AuthProvider';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import RightSidebar from '../../components/activitybar';
// import MainBar from '../../components/mainBar';
// import toast, { Toaster } from 'react-hot-toast';
// import { fetchMongoUserId } from '../../utils/userApi'; // Utility to fetch MongoDB user ID
// import { BeatLoader } from "react-spinners";

// // Base URL for your backend API
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// export default function Dashboard() {
//     // Destructure user, mongoUser, getIdToken, and authLoading from the AuthProvider context
//     const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
//     const pathname = usePathname(); // Get the current URL path

//     // State for user's joined groups
//     const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//     const [loadingGroups, setLoadingGroups] = useState(true);
//     const [groupsError, setGroupsError] = useState(null);

//     // State for separately fetched MongoDB user ID (if mongoUser from context is not immediately available)
//     const [fetchedUserId, setFetchedUserId] = useState(null);

//     /**
//      * Fetches the groups the current user has joined from the backend.
//      * This function is memoized with useCallback.
//      */
//     const fetchUserGroups = useCallback(async () => {
//         // If no user is logged in, reset groups state and stop loading
//         if (!user) {
//             setUserJoinedGroups([]);
//             setLoadingGroups(false);
//             return;
//         }

//         setLoadingGroups(true); // Start loading state
//         setGroupsError(null); // Clear any previous errors

//         try {
//             const token = await getIdToken(); // Get the authentication token
//             if (!token) throw new Error("Authentication token not available.");

//             // Make API request to fetch joined groups
//             const response = await fetch(`${API_BASE_URL}/groups/joined`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`, // Include the auth token
//                     'Content-Type': 'application/json',
//                 },
//             });

//             // Handle non-OK HTTP responses
//             if (!response.ok) {
//                 let errorMessage = 'Failed to fetch joined groups';
//                 try {
//                     const clonedResponse = response.clone();
//                     const errorData = await clonedResponse.json();
//                     errorMessage = errorData.message || errorMessage; // Use backend's error message if available
//                 } catch (jsonError) {
//                     try {
//                         const text = await response.text();
//                         console.error('Non-JSON error response from /groups/joined:', text);
//                         errorMessage = text || errorMessage;
//                     } catch (textError) {
//                         console.error('Error reading response text from /groups/joined:', textError);
//                     }
//                 }
//                 throw new Error(`${errorMessage} (Status: ${response.status})`);
//             }

//             const data = await response.json(); // Parse JSON response
//             setUserJoinedGroups(data); // Set the fetched groups
//         } catch (error: any) { // Catch any errors during the fetch operation
//             console.error("Error fetching joined groups:", error.message);
//             setGroupsError(error.message); // Set error state
//             setUserJoinedGroups([]); // Clear groups on error
//             toast.error(`Error loading groups: ${error.message}`); // Show a toast notification
//         } finally {
//             setLoadingGroups(false); // Stop loading state regardless of success or failure
//         }
//     }, [user, getIdToken]); // Dependencies for useCallback

//     /**
//      * Effect hook to fetch the MongoDB user ID separately.
//      * This is useful if `mongoUser` from AuthProvider is asynchronously populated.
//      */
//     useEffect(() => {
//         const getUserIdSeparately = async () => {
//             // Only fetch if user exists and auth is not loading
//             if (user && !authLoading) {
//                 const token = await getIdToken();
//                 if (token) {
//                     // Call the utility function to get the MongoDB user ID
//                     const id = await fetchMongoUserId(user.uid, token);
//                     if (id) {
//                         setFetchedUserId(id);
//                         console.log("Dashboard: Separately fetched userId:", id);
//                     } else {
//                         console.log("Dashboard: Failed to separately fetch userId.");
//                     }
//                 }
//             }
//         };

//         getUserIdSeparately(); // Execute the async function
//     }, [user, authLoading, getIdToken]); // Dependencies for useEffect

//     // Effect hook to trigger fetching user groups when `fetchUserGroups` changes (which it won't, due to useCallback)
//     useEffect(() => {
//         fetchUserGroups();
//     }, [fetchUserGroups]); // Dependency on the memoized function

//     // Determine which user ID to use: prefer mongoUser._id, then fetchedUserId, otherwise null
//     const userIdToUse = mongoUser?._id || fetchedUserId || null;

//     /**
//      * Effect hook for logging the state of user ID and authentication loading.
//      */
//     useEffect(() => {
//         if (authLoading) {
//             console.log("Dashboard: Auth is still loading...");
//         } else if (userIdToUse) {
//             console.log("Dashboard: Current userId for RightSidebar (from mongoUser or separate fetch):", userIdToUse);
//         } else {
//             console.log("Dashboard: Auth finished loading, but userId is null. This indicates a problem fetching/syncing mongoUser profile data.");
//         }
//     }, [userIdToUse, authLoading]); // Dependencies for logging

//     // Conditional rendering: Show a loading spinner if authentication is in progress
//     // or if a Firebase user exists but the MongoDB user ID is not yet available.
//     if (authLoading || (user && !userIdToUse)) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <BeatLoader color="#3498db" size={20} />
//             </div>
//         );
//     }

//     // Log if authentication finished but no user ID is available,
//     // assuming ProtectedRoute will handle the actual redirection.
//     if (!userIdToUse && !user && !authLoading) {
//         console.log("Dashboard: Auth finished, user is not logged in or profile not found. Redirecting via ProtectedRoute.");
//     }

//     // Main dashboard layout
//     return (
//         <ProtectedRoute> {/* Ensures only authenticated users can access this page */}
//             <Navbar /> {/* Top navigation bar */}
//             <div className="h-auto p-4 bg-gray-50 mt-18"> {/* Main content wrapper */}
//                 <div className="flex h-auto">
//                     <div className="flex-shrink-0">
//                         <Slidebar // Left sidebar with user's joined groups
//                             joinedGroups={userJoinedGroups}
//                             currentPath={pathname}
//                             className=""
//                         />
//                     </div>
//                     <MainBar /> {/* Central main content area */}
//                     <div className="flex-shrink-0">
//                         <RightSidebar userId={userIdToUse} /> {/* Right sidebar displaying user-related info */}
//                     </div>
//                 </div>
//                 <Toaster /> {/* To display toast notifications */}
//             </div>
//         </ProtectedRoute>
//     );
// }








// // client/app/dashboard/page.tsx
// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// // import ProtectedRoute from '../../components/ProtectedRoute'; // This might be redundant now, depending on AppClientWrapper's role
// import { useAuth } from '../../components/AuthProvider'; // Ensure this path is correct
// import Navbar from '../../components/navbar'; // Ensure this path is correct
// import Slidebar from '../../components/slidebar'; // Ensure this path is correct
// import RightSidebar from '../../components/activitybar'; // Ensure this path is correct
// import MainBar from '../../components/mainBar'; // Ensure this path is correct
// import toast, { Toaster } from 'react-hot-toast';
// import { BeatLoader } from "react-spinners";

// // Base URL for your backend API
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// export default function Dashboard() {
//     const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
//     const pathname = usePathname();

//     const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//     const [loadingGroups, setLoadingGroups] = useState(true);
//     const [groupsError, setGroupsError] = useState<string | null>(null); // Type explicitly to string | null

//     /**
//      * Fetches the groups the current user has joined from the backend.
//      */
//     const fetchUserGroups = useCallback(async () => {
//         // Only fetch if user and mongoUser are available
//         if (!user || !mongoUser) {
//             console.log("Dashboard: Not fetching groups. User or mongoUser not available yet.");
//             setUserJoinedGroups([]);
//             setLoadingGroups(false);
//             return;
//         }

//         setLoadingGroups(true);
//         setGroupsError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error("Authentication token not available.");

//             const response = await fetch(`${API_BASE_URL}/groups/joined`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 let errorMessage = 'Failed to fetch joined groups';
//                 try {
//                     const errorData = await response.clone().json();
//                     errorMessage = errorData.message || errorMessage;
//                 } catch (jsonError) {
//                     try {
//                         const text = await response.text();
//                         console.error('Non-JSON error response from /groups/joined:', text);
//                         errorMessage = text || errorMessage;
//                     } catch (textError) {
//                         console.error('Error reading response text from /groups/joined:', textError);
//                     }
//                 }
//                 throw new Error(`${errorMessage} (Status: ${response.status})`);
//             }

//             const data = await response.json();
//             setUserJoinedGroups(data);
//         } catch (error: any) {
//             console.error("Dashboard: Error fetching joined groups:", error.message);
//             setGroupsError(error.message);
//             setUserJoinedGroups([]);
//             toast.error(`Error loading groups: ${error.message}`);
//         } finally {
//             setLoadingGroups(false);
//         }
//     }, [user, mongoUser, getIdToken, API_BASE_URL]); // Added API_BASE_URL to dependencies

//     // Effect to trigger fetching user groups when `user` or `mongoUser` becomes available
//     useEffect(() => {
//         if (user && mongoUser && !authLoading) { // Ensure both user and mongoUser are present and auth is done loading
//             fetchUserGroups();
//         }
//     }, [user, mongoUser, authLoading, fetchUserGroups]);

//     const userIdToUse = mongoUser?._id || null;

//     useEffect(() => {
//         console.log("Dashboard Render State: authLoading=", authLoading, "user=", user ? 'present' : 'null', "mongoUser=", mongoUser ? 'present' : 'null', "userIdToUse=", userIdToUse);
//     }, [authLoading, user, mongoUser, userIdToUse]);


//     // Conditional rendering: Show a loading spinner if authentication is in progress
//     // or if a Firebase user exists but the MongoDB user ID is not yet available.
//     // This will now rely almost solely on AuthProvider's `loading` and `mongoUser` state
//     if (authLoading || (user && !mongoUser)) {
//         console.log("Dashboard: Showing loading spinner due to authLoading or missing mongoUser.");
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <BeatLoader color="#3498db" size={20} />
//             </div>
//         );
//     }

//     // This ensures that the dashboard components only render if mongoUser._id is available
//     if (!userIdToUse) {
//         console.error("Dashboard: userIdToUse is null. This indicates a problem in AuthProvider or a very fast redirect.");
//         // This case should ideally be handled by AppClientWrapper redirecting to login.
//         // As a fallback, show a message or redirect.
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <p>Authentication required. Redirecting...</p>
//                 {/* You might want a small delay and then router.push('/auth/login') here as a last resort fallback */}
//             </div>
//         );
//     }

//     return (
//         // ProtectedRoute is commented out, assuming AppClientWrapper handles global redirection
//         <div className="flex flex-col h-screen"> {/* Adjusted to full height layout */}
//             <Navbar /> {/* Top navigation bar */}
//             <div className="h-auto p-4 mt-18 flex flex-grow bg-gray-50 overflow-hidden"> {/* Main content wrapper, grows to fill remaining space */}
//                 <Slidebar
//                     joinedGroups={userJoinedGroups}
//                     currentPath={pathname}
//                     className="flex-shrink-0" // This prop is now correctly passed
//                 />
//                 <MainBar className="flex-grow" /> {/* Central main content area, grows to fill space, this prop is now correctly passed */}
//                 <RightSidebar userId={userIdToUse} className="flex-shrink-0" /> {/* Right sidebar, this prop is now correctly passed */}
//             </div>
//             <Toaster /> {/* To display toast notifications */}
//         </div>
//     );
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
import { BeatLoader } from "react-spinners";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

export default function Dashboard() {
  const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [userJoinedGroups, setUserJoinedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

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
      <div className="h-auto p-4 mt-18 flex flex-grow bg-gray-50 overflow-hidden">
        <Slidebar
          joinedGroups={userJoinedGroups}
          currentPath={pathname}
          className="flex-shrink-0"
        />
        <MainBar className="flex-grow" />
        <RightSidebar userId={userIdToUse} className="flex-shrink-0" />
      </div>
      <Toaster />
    </div>
  );
}
