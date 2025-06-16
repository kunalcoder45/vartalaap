// 'use client';

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { useAuth } from '../../components/AuthProvider';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import RightSidebar from '../../components/activitybar'; // Your ActivityBar component
// import MainBar from '../../components/mainBar';
// import toast, { Toaster } from 'react-hot-toast';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// /**
//  * Dashboard component: The main social media feed page.
//  * Handles group fetching, post creation, and overall layout.
//  */
// export default function Dashboard() {
//     const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
//     const pathname = usePathname();

//     const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//     const [loadingGroups, setLoadingGroups] = useState(true);
//     const [groupsError, setGroupsError] = useState(null);
//     const imageInputRef = useRef<HTMLInputElement>(null);
//     const videoInputRef = useRef<HTMLInputElement>(null);

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
//         } catch (error: any) {
//             console.error("Error fetching joined groups:", error.message);
//             setGroupsError(error.message);
//             setUserJoinedGroups([]);
//             toast.error(`Error loading groups: ${error.message}`);
//         } finally {
//             setLoadingGroups(false);
//         }
//     }, [user, getIdToken]);

//     useEffect(() => {
//         fetchUserGroups();
//     }, [fetchUserGroups]);
    
//     const userId = mongoUser?._id || null;

//     useEffect(() => {
//         if (authLoading) {
//             console.log("Dashboard: Auth is still loading...");
//         } else if (userId) {
//             console.log("Dashboard: Current userId for RightSidebar (populated):", userId);
//         } else {
//             console.log("Dashboard: Auth finished loading, but userId is null. This indicates a problem fetching/syncing mongoUser profile data.");
//         }
//     }, [userId, authLoading]);

//     if (authLoading) {
//         return (
//             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
//                 Loading Dashboard (Waiting for user data)...
//             </div>
//         );
//     }
//     if (!userId && !user && !authLoading) {
//         console.log("Dashboard: Auth finished, user is not logged in or profile not found. Redirecting via ProtectedRoute.");
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
//                         <RightSidebar userId={userId} />
//                     </div>
//                 </div>
//                 <Toaster />
//             </div>
//         </ProtectedRoute>
//     );
// }






// pages/dashboard.js (your existing Dashboard component)

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import RightSidebar from '../../components/activitybar';
import MainBar from '../../components/mainBar';
import toast, { Toaster } from 'react-hot-toast';
import { fetchMongoUserId } from '../../utils/userApi'; // Import the new function

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

export default function Dashboard() {
    const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const [userJoinedGroups, setUserJoinedGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // --- New State for separately fetched userId ---
    const [fetchedUserId, setFetchedUserId] = useState(null);
    // --- End New State ---

    const fetchUserGroups = useCallback(async () => {
        if (!user) {
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
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch joined groups';
                try {
                    const clonedResponse = response.clone();
                    const errorData = await clonedResponse.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    try {
                        const text = await response.text();
                        console.error('Non-JSON error response from /groups/joined:', text);
                        errorMessage = text || errorMessage;
                    } catch (textError) {
                        console.error('Error reading response text from /groups/joined:', textError);
                    }
                }
                throw new Error(`${errorMessage} (Status: ${response.status})`);
            }

            const data = await response.json();
            setUserJoinedGroups(data);
        } catch (error) {
            console.error("Error fetching joined groups:", error.message);
            setGroupsError(error.message);
            setUserJoinedGroups([]);
            toast.error(`Error loading groups: ${error.message}`);
        } finally {
            setLoadingGroups(false);
        }
    }, [user, getIdToken]);

    // --- New useEffect to fetch userId using the new utility function ---
    useEffect(() => {
        const getUserIdSeparately = async () => {
            if (user && !authLoading) { // Ensure Firebase user is available and auth is not loading
                const token = await getIdToken(); // Get the ID token for authentication
                if (token) {
                    const id = await fetchMongoUserId(user.uid, token);
                    if (id) {
                        setFetchedUserId(id);
                        console.log("Dashboard: Separately fetched userId:", id);
                    } else {
                        console.log("Dashboard: Failed to separately fetch userId.");
                    }
                }
            }
        };

        getUserIdSeparately();
    }, [user, authLoading, getIdToken]); // Depend on user and authLoading to trigger fetch
    // --- End New useEffect ---

    useEffect(() => {
        fetchUserGroups();
    }, [fetchUserGroups]);

    // You can choose which userId to use. mongoUser?._id is generally preferred
    // as it's already handled by your AuthProvider and likely available earlier.
    const userIdToUse = mongoUser?._id || fetchedUserId || null;

    useEffect(() => {
        if (authLoading) {
            console.log("Dashboard: Auth is still loading...");
        } else if (userIdToUse) {
            console.log("Dashboard: Current userId for RightSidebar (from mongoUser or separate fetch):", userIdToUse);
        } else {
            console.log("Dashboard: Auth finished loading, but userId is null. This indicates a problem fetching/syncing mongoUser profile data.");
        }
    }, [userIdToUse, authLoading]);


    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
                Loading Dashboard (Waiting for user data)...
            </div>
        );
    }
    if (!userIdToUse && !user && !authLoading) {
        console.log("Dashboard: Auth finished, user is not logged in or profile not found. Redirecting via ProtectedRoute.");
    }

    return (
        <ProtectedRoute>
            <Navbar />
            <div className="h-auto p-4 bg-gray-50 mt-18">
                <div className="flex h-auto">
                    <div className="flex-shrink-0">
                        <Slidebar
                            joinedGroups={userJoinedGroups}
                            currentPath={pathname}
                            className=""
                        />
                    </div>
                    <MainBar />
                    <div className="flex-shrink-0">
                        <RightSidebar userId={userIdToUse} /> {/* Using the consolidated userId */}
                    </div>
                </div>
                <Toaster />
            </div>
        </ProtectedRoute>
    );
}