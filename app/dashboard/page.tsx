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

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

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

'use client';

import { useEffect, useState, useCallback } from 'react'; // Removed useRef
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import RightSidebar from '../../components/activitybar';
import MainBar from '../../components/mainBar';
import toast, { Toaster } from 'react-hot-toast';
import { fetchMongoUserId } from '../../utils/userApi';
import { BeatLoader } from "react-spinners";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

export default function Dashboard() {
    const { user, mongoUser, getIdToken, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const [userJoinedGroups, setUserJoinedGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState(null);

    // --- State for separately fetched userId ---
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

    // --- useEffect to fetch userId using the new utility function ---
    useEffect(() => {
        const getUserIdSeparately = async () => {
            if (user && !authLoading) {
                const token = await getIdToken();
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
    }, [user, authLoading, getIdToken]);
    // --- End New useEffect ---

    useEffect(() => {
        fetchUserGroups();
    }, [fetchUserGroups]);

    // Choose which userId to use. mongoUser?._id is generally preferred
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

    // Loading State with Spinner
    if (authLoading || (user && !userIdToUse)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <BeatLoader color="#3498db" size={20} />
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
                        <RightSidebar userId={userIdToUse} />
                    </div>
                </div>
                <Toaster />
            </div>
        </ProtectedRoute>
    );
}