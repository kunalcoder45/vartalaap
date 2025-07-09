// // components/ConnectionsModal.tsx
// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import Link from 'next/link'; // Still useful if we want to link to individual user profiles from the modal
// import { useAuth } from '@/components/AuthProvider'; // Assuming AuthProvider is correctly aliased
// import { fetchMongoUserId } from '@/utils/userApi'; // Assuming userApi is correctly aliased
// import userLogo from '../app/assets/userLogo.png'; // Adjust path based on your project structure

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// interface User {
//     _id: string;
//     name: string;
//     username?: string;
//     avatarUrl?: string | null;
//     firebaseUid?: string; // Add firebaseUid here if you use it for direct profile links
// }

// interface ConnectionsModalProps {
//     firebaseUid: string; // The firebaseUid of the profile whose connections we are viewing
//     isOpen: boolean;
//     onClose: () => void;
// }

// type ActiveTab = 'followers' | 'following';

// export default function ConnectionsModal({ firebaseUid, isOpen, onClose }: ConnectionsModalProps) {
//     const { getIdToken } = useAuth();

//     const [activeTab, setActiveTab] = useState<ActiveTab>('followers');
//     const [users, setUsers] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [mongoId, setMongoId] = useState<string | null>(null);

//     // Reset state when modal opens/closes or firebaseUid changes
//     useEffect(() => {
//         if (isOpen) {
//             setActiveTab('followers'); // Reset to followers every time it opens
//             setUsers([]);
//             setLoading(true);
//             setError(null);
//             // Fetch mongoId for the target firebaseUid
//             const getTargetMongoId = async () => {
//                 if (!firebaseUid) return;
//                 try {
//                     const token = await getIdToken();
//                     if (!token) throw new Error('Auth token missing');
//                     const id = await fetchMongoUserId(firebaseUid, token);
//                     setMongoId(id);
//                 } catch (err) {
//                     console.error("Error fetching target user's mongoId:", err);
//                     setError("Could not load user's information.");
//                 }
//             };
//             getTargetMongoId();
//         }
//     }, [isOpen, firebaseUid, getIdToken]);


//     // --- Helper function for avatar URL ---
//     const getAvatarUrl = useCallback((avatarUrl?: string | null) => {
//         if (!avatarUrl || avatarUrl.trim() === '') {
//             return userLogo.src;
//         }
//         if (avatarUrl.startsWith('http')) {
//             return avatarUrl;
//         }
//         return `${process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || ''}${avatarUrl}`;
//     }, []);

//     // --- Fetch users based on active tab and mongoId ---
//     useEffect(() => {
//         const fetchUsers = async () => {
//             if (!isOpen || !mongoId) { // Only fetch if modal is open and mongoId is available
//                 setLoading(false);
//                 return;
//             }

//             setLoading(true);
//             setError(null);
//             setUsers([]); // Clear previous list

//             try {
//                 const token = await getIdToken();
//                 if (!token) throw new Error('Authentication token missing. Please log in.');

//                 const endpoint = activeTab === 'followers'
//                     ? `${API_BASE_URL}/users/${mongoId}/followers`
//                     : `${API_BASE_URL}/users/${mongoId}/following`;

//                 const res = await fetch(endpoint, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to fetch ${activeTab} (Status: ${res.status})`);
//                 }

//                 const data: User[] = await res.json();
//                 setUsers(data);

//             } catch (err: any) {
//                 console.error(`Error fetching ${activeTab}:`, err);
//                 setError(err.message || `Failed to load ${activeTab}.`);
//                 setUsers([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsers();
//     }, [isOpen, activeTab, mongoId, getIdToken, getAvatarUrl]);


//     if (!isOpen) return null;

//     return (
//         <div
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto"
//             onClick={onClose} // Close modal when clicking outside
//         >
//             <div
//                 className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto p-6 md:p-8 relative transform transition-all duration-300 ease-out scale-100 opacity-100"
//                 onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
//             >
//                 <button
//                     onClick={onClose}
//                     className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200"
//                     aria-label="Close"
//                 >
//                     &times;
//                 </button>

//                 <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Connections</h2>

//                 <div className="flex justify-around border-b border-gray-200 mb-6">
//                     <button
//                         onClick={() => setActiveTab('followers')}
//                         className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
//                             activeTab === 'followers'
//                                 ? 'text-blue-600 border-b-2 border-blue-600'
//                                 : 'text-gray-500 hover:text-gray-700'
//                         }`}
//                     >
//                         Followers
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('following')}
//                         className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
//                             activeTab === 'following'
//                                 ? 'text-blue-600 border-b-2 border-blue-600'
//                                 : 'text-gray-500 hover:text-gray-700'
//                         }`}
//                     >
//                         Following
//                     </button>
//                 </div>

//                 {error ? (
//                     <p className="text-center text-red-600 py-4">{error}</p>
//                 ) : loading ? (
//                     <div className="space-y-4">
//                         {Array(3).fill(0).map((_, i) => (
//                             <div key={i} className="flex items-center space-x-4 animate-pulse">
//                                 <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
//                                 <div className="flex-1 space-y-2">
//                                     <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//                                     <div className="h-3 bg-gray-300 rounded w-1/2"></div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : users.length === 0 ? (
//                     <p className="text-center text-gray-500 py-8">
//                         {activeTab === 'followers'
//                             ? 'This user has no followers yet.'
//                             : 'This user is not following anyone yet.'}
//                     </p>
//                 ) : (
//                     <ul className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2 hide-scrollbar"> {/* Added max-height and overflow */}
//                         {users.map((user) => (
//                             <li key={user._id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-150">
//                                 {/* Link to user's profile - decide if this should close the modal or navigate */}
//                                 <Link
//                                     href={`/users/${firebaseUid}`} // Use firebaseUid if available, fallback to mongoId
//                                     className="flex items-center space-x-4 flex-grow"
//                                     onClick={onClose} // Close modal when clicking on a user link
//                                 >
//                                     <img
//                                         src={getAvatarUrl(user.avatarUrl)}
//                                         alt={user.name}
//                                         className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
//                                         onError={(e) => { e.currentTarget.src = userLogo.src; }}
//                                     />
//                                     <div>
//                                         <p className="font-semibold text-gray-900">{user.name}</p>
//                                         {user.username && <p className="text-sm text-gray-600">@{user.username}</p>}
//                                     </div>
//                                 </Link>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// }
// // components/ConnectionsModal.tsx
// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import Link from 'next/link'; // Still useful if we want to link to individual user profiles from the modal
// import { useAuth } from '@/components/AuthProvider'; // Assuming AuthProvider is correctly aliased
// import { fetchMongoUserId } from '@/utils/userApi'; // Assuming userApi is correctly aliased
// import userLogo from '../app/assets/userLogo.png'; // Adjust path based on your project structure

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// interface User {
//     _id: string;
//     name: string;
//     username?: string;
//     avatarUrl?: string | null;
//     firebaseUid?: string; // Add firebaseUid here if you use it for direct profile links
// }

// interface ConnectionsModalProps {
//     firebaseUid: string; // The firebaseUid of the profile whose connections we are viewing
//     isOpen: boolean;
//     onClose: () => void;
// }

// type ActiveTab = 'followers' | 'following';

// export default function ConnectionsModal({ firebaseUid, isOpen, onClose }: ConnectionsModalProps) {
//     const { getIdToken } = useAuth();

//     const [activeTab, setActiveTab] = useState<ActiveTab>('followers');
//     const [users, setUsers] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [mongoId, setMongoId] = useState<string | null>(null);

//     // Reset state when modal opens/closes or firebaseUid changes
//     useEffect(() => {
//         if (isOpen) {
//             setActiveTab('followers'); // Reset to followers every time it opens
//             setUsers([]);
//             setLoading(true);
//             setError(null);
//             // Fetch mongoId for the target firebaseUid
//             const getTargetMongoId = async () => {
//                 if (!firebaseUid) return;
//                 try {
//                     const token = await getIdToken();
//                     if (!token) throw new Error('Auth token missing');
//                     const id = await fetchMongoUserId(firebaseUid, token);
//                     setMongoId(id);
//                 } catch (err) {
//                     console.error("Error fetching target user's mongoId:", err);
//                     setError("Could not load user's information.");
//                 }
//             };
//             getTargetMongoId();
//         }
//     }, [isOpen, firebaseUid, getIdToken]);


//     // --- Helper function for avatar URL ---
//     const getAvatarUrl = useCallback((avatarUrl?: string | null) => {
//         if (!avatarUrl || avatarUrl.trim() === '') {
//             return userLogo.src;
//         }
//         if (avatarUrl.startsWith('http')) {
//             return avatarUrl;
//         }
//         return `${process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || ''}${avatarUrl}`;
//     }, []);

//     // --- Fetch users based on active tab and mongoId ---
//     useEffect(() => {
//         const fetchUsers = async () => {
//             if (!isOpen || !mongoId) { // Only fetch if modal is open and mongoId is available
//                 setLoading(false);
//                 return;
//             }

//             setLoading(true);
//             setError(null);
//             setUsers([]); // Clear previous list

//             try {
//                 const token = await getIdToken();
//                 if (!token) throw new Error('Authentication token missing. Please log in.');

//                 const endpoint = activeTab === 'followers'
//                     ? `${API_BASE_URL}/users/${mongoId}/followers`
//                     : `${API_BASE_URL}/users/${mongoId}/following`;

//                 const res = await fetch(endpoint, {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to fetch ${activeTab} (Status: ${res.status})`);
//                 }

//                 const data: User[] = await res.json();
//                 setUsers(data);

//             } catch (err: any) {
//                 console.error(`Error fetching ${activeTab}:`, err);
//                 setError(err.message || `Failed to load ${activeTab}.`);
//                 setUsers([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsers();
//     }, [isOpen, activeTab, mongoId, getIdToken, getAvatarUrl]);


//     if (!isOpen) return null;

//     return (
//         <div
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto"
//             onClick={onClose} // Close modal when clicking outside
//         >
//             <div
//                 className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto p-6 md:p-8 relative transform transition-all duration-300 ease-out scale-100 opacity-100"
//                 onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
//             >
//                 <button
//                     onClick={onClose}
//                     className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-200"
//                     aria-label="Close"
//                 >
//                     &times;
//                 </button>

//                 <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Connections</h2>

//                 <div className="flex justify-around border-b border-gray-200 mb-6">
//                     <button
//                         onClick={() => setActiveTab('followers')}
//                         className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
//                             activeTab === 'followers'
//                                 ? 'text-blue-600 border-b-2 border-blue-600'
//                                 : 'text-gray-500 hover:text-gray-700'
//                         }`}
//                     >
//                         Followers
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('following')}
//                         className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
//                             activeTab === 'following'
//                                 ? 'text-blue-600 border-b-2 border-blue-600'
//                                 : 'text-gray-500 hover:text-gray-700'
//                         }`}
//                     >
//                         Following
//                     </button>
//                 </div>

//                 {error ? (
//                     <p className="text-center text-red-600 py-4">{error}</p>
//                 ) : loading ? (
//                     <div className="space-y-4">
//                         {Array(3).fill(0).map((_, i) => (
//                             <div key={i} className="flex items-center space-x-4 animate-pulse">
//                                 <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
//                                 <div className="flex-1 space-y-2">
//                                     <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//                                     <div className="h-3 bg-gray-300 rounded w-1/2"></div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : users.length === 0 ? (
//                     <p className="text-center text-gray-500 py-8">
//                         {activeTab === 'followers'
//                             ? 'This user has no followers yet.'
//                             : 'This user is not following anyone yet.'}
//                     </p>
//                 ) : (
//                     <ul className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2 hide-scrollbar"> {/* Added max-height and overflow */}
//                         {users.map((user) => (
//                             <li key={user._id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-150">
//                                 {/* Link to user's profile - decide if this should close the modal or navigate */}
//                                 <Link
//                                     href={`/users/${firebaseUid}`} // Use firebaseUid if available, fallback to mongoId
//                                     className="flex items-center space-x-4 flex-grow"
//                                     onClick={onClose} // Close modal when clicking on a user link
//                                 >
//                                     <img
//                                         src={getAvatarUrl(user.avatarUrl)}
//                                         alt={user.name}
//                                         className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
//                                         onError={(e) => { e.currentTarget.src = userLogo.src; }}
//                                     />
//                                     <div>
//                                         <p className="font-semibold text-gray-900">{user.name}</p>
//                                         {user.username && <p className="text-sm text-gray-600">@{user.username}</p>}
//                                     </div>
//                                 </Link>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// }

// components/ConnectionsModal.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider'; // AuthProvider se firebaseUid uthayenge
import { fetchMongoUserId } from '@/utils/userApi';
import userLogo from '../app/assets/userLogo.png';
import { X } from 'lucide-react';


const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

interface User {
    _id: string;
    name: string;
    username?: string;
    avatarUrl?: string | null;
    firebaseUid?: string; // Add firebaseUid here if you use it for direct profile links
}

interface ConnectionsModalProps {
    firebaseUid: string; // The firebaseUid of the profile whose connections we are viewing
    isOpen: boolean;
    onClose: () => void;
}

type ActiveTab = 'followers' | 'following';

export default function ConnectionsModal({ firebaseUid, isOpen, onClose }: ConnectionsModalProps) {
    // AuthProvider se current user ka data le rahe hain
    const { getIdToken, user: authUser } = useAuth(); // AuthProvider se current logged-in user ka data uthaya

    const [activeTab, setActiveTab] = useState<ActiveTab>('followers');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mongoId, setMongoId] = useState<string | null>(null);

    // Ye console log dikhayega ki modal ko kis firebaseUid ke liye khola gaya hai
    useEffect(() => {
        console.log("ConnectionsModal received firebaseUid prop for THIS profile:", firebaseUid);
    }, [firebaseUid]);


    // Reset state when modal opens/closes or firebaseUid changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab('followers'); // Reset to followers every time it opens
            setUsers([]);
            setLoading(true);
            setError(null);
            // Fetch mongoId for the target firebaseUid
            const getTargetMongoId = async () => {
                if (!firebaseUid) return;
                try {
                    const token = await getIdToken();
                    if (!token) throw new Error('Auth token missing');
                    const id = await fetchMongoUserId(firebaseUid, token);
                    setMongoId(id);
                } catch (err) {
                    console.error("Error fetching target user's mongoId:", err);
                    setError("Could not load user's information.");
                }
            };
            getTargetMongoId();
        }
    }, [isOpen, firebaseUid, getIdToken]);


    // --- Helper function for avatar URL ---
    const getAvatarUrl = useCallback((avatarUrl?: string | null) => {
        if (!avatarUrl || avatarUrl.trim() === '') {
            return userLogo.src;
        }
        if (avatarUrl.startsWith('http')) {
            return avatarUrl;
        }
        return `${process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || ''}${avatarUrl}`;
    }, []);

    // --- Fetch users based on active tab and mongoId ---
    useEffect(() => {
        const fetchUsers = async () => {
            if (!isOpen || !mongoId) { // Only fetch if modal is open and mongoId is available
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setUsers([]); // Clear previous list

            try {
                const token = await getIdToken();
                if (!token) throw new Error('Authentication token missing. Please log in.');

                const endpoint = activeTab === 'followers'
                    ? `${API_BASE_URL}/users/${mongoId}/followers`
                    : `${API_BASE_URL}/users/${mongoId}/following`;

                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || `Failed to fetch ${activeTab} (Status: ${res.status})`);
                }

                const data: User[] = await res.json();
                setUsers(data);

            } catch (err: any) {
                console.error(`Error fetching ${activeTab}:`, err);
                setError(err.message || `Failed to load ${activeTab}.`);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isOpen, activeTab, mongoId, getIdToken, getAvatarUrl]);


    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose} // Close modal when clicking outside
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto p-6 md:p-8 relative transform transition-all duration-300 ease-out scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 p-1 right-3 text-gray-500 text-2xl font-bold transition-colors cursor-pointer hover:bg-gray-800 rounded-full hover:text-white duration-200"
                    aria-label="Close"
                >
                    <X size={19}/>
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Connections</h2>

                <div className="flex justify-around border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
                            activeTab === 'followers'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
                            activeTab === 'following'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Following
                    </button>
                </div>

                {error ? (
                    <p className="text-center text-red-600 py-4">{error}</p>
                ) : loading ? (
                    <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        {activeTab === 'followers'
                            ? 'This user has no followers yet.'
                            : 'This user is not following anyone yet.'}
                    </p>
                ) : (
                    <ul className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2 hide-scrollbar">
                        {users.map((user) => {
                            // Backend se mila hua firebaseUid (preferable)
                            // Agar nahi mila, toh currently authenticated user ka firebaseUid use karo
                            const targetFirebaseUid = user.firebaseUid || authUser?.uid;

                            console.log(`User ID: ${user._id}, User Name: ${user.name}, firebaseUid for Link:`, targetFirebaseUid);

                            return (
                                <li key={user._id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                                    <Link
                                        href={`/users/${targetFirebaseUid}`} // Use the determined firebaseUid
                                        className="flex items-center space-x-4 flex-grow"
                                        onClick={onClose}
                                    >
                                        <img
                                            src={getAvatarUrl(user.avatarUrl)}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => { e.currentTarget.src = userLogo.src; }}
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            {user.username && <p className="text-sm text-gray-600">@{user.username}</p>}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}