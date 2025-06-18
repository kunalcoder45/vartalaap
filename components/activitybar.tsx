// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import { useAuth } from './AuthProvider'; // Adjust path if necessary
// import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal'; // Adjust path if necessary

// // Ensure these are correctly set in your .env.local file
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[]; // This will contain user IDs who viewed it
//     visibility: 'public' | 'followers';
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean; // Indicates if this user has an active status
//     activeStatus?: Status; // The actual status object (if hasActiveStatus is true)
// }

// interface ActivityBarProps {
//     userId: string | null; // This should be the MongoDB ID of the current authenticated user
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth();
//     const [currentUserData, setCurrentUserData] = useState<User | null>(null);
//     const [allConnections, setAllConnections] = useState<User[]>([]); // This will hold other users with statuses
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0); // Key to trigger re-fetches

//     // Use a ref for the default avatar URL for consistent access
//     const defaultAvatarUrl = React.useMemo(() => {
//         return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
//     }, []);

//     const getFullMediaUrl = useCallback((relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath || defaultAvatarUrl;
//         }
//         // Ensure path uses forward slashes for URLs, especially important for Windows paths from Multer
//         const cleanedPath = relativePath.replace(/\\/g, '/');
//         // Add a check to prevent double slashes if MEDIA_BASE_URL already ends with one
//         const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;
//         return `${baseUrl}/${cleanedPath}`;
//     }, [defaultAvatarUrl]);

//     // Function to fetch current user's profile and their status
//     const fetchCurrentUserDataAndStatus = useCallback(async () => {
//         console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] called. Current userId prop: ${userId}`);

//         if (!userId) {
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] userId prop is null/undefined. Initializing currentUserData with Firebase authUser if available.');
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid, // This is Firebase UID here, will be updated to Mongo ID if /profile succeeds
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             } else {
//                 setCurrentUserData(null);
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Authentication token not available. Cannot fetch current user data and status.');
//                 setError('Authentication token not available. Please log in.');
//                 setCurrentUserData(null);
//                 return;
//             }

//             // 1. Fetch current user's profile to get their accurate MongoDB ID and latest profile info
//             const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userProfileResponse.ok) {
//                 const errorData = await userProfileResponse.json().catch(() => ({}));
//                 console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch current user profile:', errorData);
//                 throw new Error(errorData.message || 'Failed to fetch your profile data.');
//             }
//             const userProfile = await userProfileResponse.json();
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Profile (MongoDB ID):', userProfile._id);

//             // 2. Fetch current user's statuses using the *obtained MongoDB ID*
//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userProfile._id}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatus: Status | undefined = undefined;
//             if (userStatusResponse.ok) {
//                 const userStatuses: Status[] = await userStatusResponse.json();
//                 console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Statuses for '${userProfile.name}' (ID: ${userProfile._id}):`, userStatuses);

//                 if (userStatuses && userStatuses.length > 0) {
//                     activeUserStatus = userStatuses[0]; // Assuming you only want to display the first active status
//                     console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Active status found for current user:', activeUserStatus);
//                 } else {
//                     console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] No active status found for current user '${userProfile.name}' (ID: ${userProfile._id}).`);
//                 }
//             } else {
//                 const errorData = await userStatusResponse.json().catch(() => ({}));
//                 console.warn(`[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch active status for current user (${userProfile._id}). Status: ${userStatusResponse.status}, Error: ${errorData.message || 'Unknown'}`);
//             }

//             const newCurrentUserData = {
//                 _id: userProfile._id, // IMPORTANT: Use the MongoDB ID from the profile fetch
//                 name: userProfile.name,
//                 avatarUrl: userProfile.avatarUrl,
//                 hasActiveStatus: !!activeUserStatus, // Set to true if activeUserStatus object exists
//                 activeStatus: activeUserStatus
//             };
//             setCurrentUserData(newCurrentUserData);
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Updated currentUserData state:', newCurrentUserData);

//         } catch (err) {
//             console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Error:', err);
//             setError(err instanceof Error ? err.message : 'Could not load your stories.');
//             // Fallback for currentUserData on error (important to set something for UI)
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid, // Fallback to Firebase UID if MongoDB ID not available from profile
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             } else {
//                 setCurrentUserData(null);
//             }
//         }
//     }, [userId, authUser, defaultAvatarUrl, getIdToken]); // Dependencies for useCallback

//     // Function to fetch statuses for connections (followers/following)
//     const fetchStatusesForConnections = useCallback(async () => {
//         if (!userId) return; // Only fetch if current user's MongoDB ID is available

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, { // This endpoint gets statuses for connections
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses for connections.');
//             }

//             const statuses: User[] = await response.json(); // Backend now sends already formatted User[] with activeStatus
//             console.log('[ActivityBar:fetchStatusesForConnections] Fetched connections with statuses:', statuses);

//             // Filter out the current user's own entry if it somehow appears here (it shouldn't based on backend change)
//             const filteredConnections = statuses.filter(conn => conn._id !== userId);
//             setAllConnections(filteredConnections);

//         } catch (err) {
//             console.error('[ActivityBar:fetchStatusesForConnections] Error fetching statuses for connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections statuses.');
//         }
//     }, [userId, getIdToken]); // Dependencies for useCallback


//     // Main useEffect to orchestrate fetching
//     useEffect(() => {
//         const loadAllData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 // Fetch current user's data and status first
//                 await fetchCurrentUserDataAndStatus();
//                 // Then fetch statuses for connections
//                 await fetchStatusesForConnections();
//             } catch (err) {
//                 console.error('[ActivityBar:useEffect] Error during overall data fetch:', err);
//                 // Errors already handled within individual fetch functions
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (userId) { // Only start fetching if we have a MongoDB userId
//             loadAllData();
//         } else {
//             // If userId is null (e.g., not logged in or MongoDB ID not synced yet)
//             setLoading(false);
//             setCurrentUserData(null);
//             setAllConnections([]);
//         }
//     }, [userId, statusRefreshKey, fetchCurrentUserDataAndStatus, fetchStatusesForConnections]); // Dependencies


//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('[ActivityBar:handleUpload] Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             const responseData = await response.json(); // Get the response data
//             console.log('[ActivityBar:handleUpload] Status uploaded successfully:', responseData);

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1); // Trigger re-fetch of all statuses to show the new one
//         } catch (err) {
//             console.error('[ActivityBar:handleUpload] Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleStatusView = async (userToView: User) => {
//         if (!userToView.hasActiveStatus || !userToView.activeStatus) {
//             console.warn(`[ActivityBar:handleStatusView] Attempted to view status for ${userToView.name} but no active status found.`);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to view status.');

//             // Only mark as viewed if it's not your own status
//             if (userToView._id !== userId) {
//                 // currentUserData?._id should now always be the MongoDB ID
//                 if (currentUserData?._id) {
//                     console.log(`[ActivityBar:handleStatusView] Marking status ${userToView.activeStatus._id} as viewed by ${currentUserData._id}`);
//                     const response = await fetch(`${API_BASE_URL}/status/view/${userToView.activeStatus._id}`, {
//                         method: 'POST',
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json',
//                         },
//                     });

//                     if (!response.ok) {
//                         console.error('[ActivityBar:handleStatusView] Failed to mark status as viewed:', await response.json());
//                     } else {
//                         console.log('[ActivityBar:handleStatusView] Status marked as viewed successfully.');
//                         // Refresh to reflect the 'viewed' state if needed, though typically not for self-view
//                         // setStatusRefreshKey(prev => prev + 1); // This might cause UI flicker
//                     }
//                 } else {
//                     console.warn("[ActivityBar:handleStatusView] Cannot mark status as viewed: Current user's MongoDB ID not available in currentUserData.");
//                 }
//             } else {
//                 console.log(`[ActivityBar:handleStatusView] Viewing own status for ${userToView.name}. No 'viewed' request sent.`);
//             }

//             // Always set viewingStatus to display the modal
//             setViewingStatus({ user: userToView, status: userToView.activeStatus });
//             console.log('[ActivityBar:handleStatusView] ViewingStatus modal opened for:', { user: userToView.name, statusId: userToView.activeStatus?._id });

//         } catch (err) {
//             console.error('[ActivityBar:handleStatusView] Error handling status view:', err);
//             setError(err instanceof Error ? err.message : 'Failed to display status.');
//         }
//     };

//     const renderUserItem = (user: User) => {
//         const isCurrentUser = user._id === userId;
//         return (
//             <li
//                 key={user._id}
//                 className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//                 onClick={() => {
//                     console.log(`[ActivityBar:renderUserItem] Clicked on user: ${user.name} (ID: ${user._id}). hasActiveStatus: ${user.hasActiveStatus}`);
//                     if (user.hasActiveStatus && user.activeStatus) {
//                         handleStatusView(user);
//                     } else {
//                         console.log(`[ActivityBar:renderUserItem] ${user.name} does not have an active status or status object is missing. Not opening.`);
//                         // Optional: You could show a small toast notification here
//                         // alert(`No active status available for ${user.name}.`);
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                             }`}
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl;
//                         }}
//                     />
//                     {user.hasActiveStatus && (
//                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                     )}
//                 </div>
//                 <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                     {isCurrentUser ? 'You' : user.name} {/* Display 'You' for own profile */}
//                 </span>
//             </li>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {/* Render current user's status first IF currentUserData exists and has an active status */}
//                     {currentUserData && renderUserItem(currentUserData)}
//                     {/* Then render other connections */}
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             {/* Upload Modal */}
//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {/* Status Viewing Modal */}
//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b flex justify-between items-center">
//                             <div className="flex items-center">
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.user.avatarUrl)}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     autoPlay
//                                     // Add a key to force re-render if video source changes, important for video playback
//                                     key={viewingStatus.status.mediaUrl}
//                                 >
//                                     <source
//                                         src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                         type="video/mp4"
//                                     />
//                                     Your browser does not support the video tag.
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     onError={(e) => {
//                                         const target = e.target as HTMLImageElement;
//                                         target.src = defaultAvatarUrl;
//                                     }}
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t flex justify-end">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;



// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import { useAuth } from './AuthProvider'; // Adjust path if necessary
// import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal'; // Adjust path if necessary
// import StatusViewer from './StatusViewer'; // Import the new StatusViewer component

// // Ensure these are correctly set in your .env.local file
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[]; // This will contain user IDs who viewed it
//     visibility: 'public' | 'followers';
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean; // Indicates if this user has an active status
//     activeStatus?: Status; // The actual status object (if hasActiveStatus is true)
// }

// interface ActivityBarProps {
//     userId: string | null; // This should be the MongoDB ID of the current authenticated user
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth();
//     const [currentUserData, setCurrentUserData] = useState<User | null>(null);
//     const [allConnections, setAllConnections] = useState<User[]>([]); // This will hold other users with statuses
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
    
//     // State for viewing multiple statuses for a selected user
//     const [viewingUserStatuses, setViewingUserStatuses] = useState<{ user: User; statuses: Status[] } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0); // Key to trigger re-fetches

//     // Use a ref for the default avatar URL for consistent access
//     const defaultAvatarUrl = React.useMemo(() => {
//         return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
//     }, []);

//     const getFullMediaUrl = useCallback((relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath || defaultAvatarUrl;
//         }
//         // Ensure path uses forward slashes for URLs, especially important for Windows paths from Multer
//         const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;
//         return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`; // Ensure forward slashes
//     }, [defaultAvatarUrl]);

//     // Function to fetch current user's profile and their status
//     const fetchCurrentUserDataAndStatus = useCallback(async () => {
//         console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] called. Current userId prop: ${userId}`);

//         if (!userId) {
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] userId prop is null/undefined. Initializing currentUserData with Firebase authUser if available.');
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid, // This is Firebase UID here, will be updated to Mongo ID if /profile succeeds
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl, // Use avatarUrl from Firebase authUser
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             } else {
//                 setCurrentUserData(null);
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Authentication token not available. Cannot fetch current user data and status.');
//                 setError('Authentication token not available. Please log in.');
//                 setCurrentUserData(null);
//                 return;
//             }

//             // 1. Fetch current user's profile to get their accurate MongoDB ID and latest profile info
//             const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userProfileResponse.ok) {
//                 const errorData = await userProfileResponse.json().catch(() => ({}));
//                 console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch current user profile:', errorData);
//                 throw new Error(errorData.message || 'Failed to fetch your profile data.');
//             }
//             const userProfile = await userProfileResponse.json();
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Profile (MongoDB ID):', userProfile._id);

//             // 2. Fetch current user's statuses using the *obtained MongoDB ID*
//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userProfile._id}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatus: Status | undefined = undefined; // Initialize as undefined
//             if (userStatusResponse.ok) {
//                 const userStatuses: Status[] = await userStatusResponse.json();
//                 console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Statuses for '${userProfile.name}' (ID: ${userProfile._id}):`, userStatuses);

//                 if (userStatuses && userStatuses.length > 0) {
//                     // For the current user's display in ActivityBar, we still show if they have *any* active status
//                     activeUserStatus = userStatuses[0]; // Just need one to indicate presence
//                     console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Active status found for current user:', activeUserStatus);
//                 } else {
//                     console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] No active status found for current user '${userProfile.name}' (ID: ${userProfile._id}).`);
//                 }
//             } else {
//                 const errorData = await userStatusResponse.json().catch(() => ({}));
//                 console.warn(`[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch active status for current user (${userProfile._id}). Status: ${userStatusResponse.status}, Error: ${errorData.message || 'Unknown'}`);
//             }

//             const newCurrentUserData = {
//                 _id: userProfile._id, // IMPORTANT: Use the MongoDB ID from the profile fetch
//                 name: userProfile.name,
//                 avatarUrl: userProfile.avatarUrl,
//                 hasActiveStatus: !!activeUserStatus, // Set to true if activeUserStatus object exists
//                 activeStatus: activeUserStatus
//             };
//             setCurrentUserData(newCurrentUserData);
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Updated currentUserData state:', newCurrentUserData);

//         } catch (err) {
//             console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Error:', err);
//             setError(err instanceof Error ? err.message : 'Could not load your stories.');
//             // Fallback for currentUserData on error (important to set something for UI)
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid, // Fallback to Firebase UID if MongoDB ID not available from profile
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             } else {
//                 setCurrentUserData(null);
//             }
//         }
//     }, [userId, authUser, defaultAvatarUrl, getIdToken]); // Dependencies for useCallback

//     // Function to fetch statuses for connections (followers/following)
//     const fetchStatusesForConnections = useCallback(async () => {
//         if (!userId) return; // Only fetch if current user's MongoDB ID is available

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, { // This endpoint gets statuses for connections
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses for connections.');
//             }

//             const statuses: User[] = await response.json(); // Backend now sends already formatted User[] with activeStatus
//             console.log('[ActivityBar:fetchStatusesForConnections] Fetched connections with statuses:', statuses);

//             // Filter out the current user's own entry if it somehow appears here (it shouldn't based on backend change)
//             const filteredConnections = statuses.filter(conn => conn._id !== userId);
//             setAllConnections(filteredConnections);

//         } catch (err) {
//             console.error('[ActivityBar:fetchStatusesForConnections] Error fetching statuses for connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections statuses.');
//         }
//     }, [userId, getIdToken]);


//     // Main useEffect to orchestrate fetching
//     useEffect(() => {
//         const loadAllData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 // Fetch current user's data and status first
//                 await fetchCurrentUserDataAndStatus();
//                 // Then fetch statuses for connections
//                 await fetchStatusesForConnections();
//             } catch (err) {
//                 console.error('[ActivityBar:useEffect] Error during overall data fetch:', err);
//                 // Errors already handled within individual fetch functions
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (userId) { // Only start fetching if we have a MongoDB userId
//             loadAllData();
//         } else {
//             // If userId is null (e.g., not logged in or MongoDB ID not synced yet)
//             setLoading(false);
//             setCurrentUserData(null);
//             setAllConnections([]);
//         }
//     }, [userId, statusRefreshKey, fetchCurrentUserDataAndStatus, fetchStatusesForConnections]);


//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('[ActivityBar:handleUpload] Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             const responseData = await response.json(); // Get the response data
//             console.log('[ActivityBar:handleUpload] Status uploaded successfully:', responseData);

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1); // Trigger re-fetch of all statuses to show the new one
//         } catch (err) {
//             console.error('[ActivityBar:handleUpload] Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     // New function to fetch ALL statuses for a specific user
//     const fetchAllUserStatuses = useCallback(async (targetUserId: string): Promise<Status[]> => {
//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to fetch statuses.');

//             const response = await fetch(`${API_BASE_URL}/status/user/${targetUserId}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch user statuses.');
//             }
//             return await response.json();
//         } catch (err) {
//             console.error(`[ActivityBar:fetchAllUserStatuses] Error fetching all statuses for user ${targetUserId}:`, err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses.');
//             return [];
//         }
//     }, [getIdToken]);


//     const handleStatusMarkAsViewed = useCallback(async (statusId: string) => {
//         if (!userId) { // Current authenticated user's MongoDB ID
//             console.warn("[ActivityBar:handleStatusMarkAsViewed] Cannot mark status as viewed: Current user's MongoDB ID not available.");
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to mark status as viewed.');

//             // Check if the current user is not the owner of the status
//             // This check needs to be more robust, ideally done on backend or by checking `viewingUserStatuses.user._id`
//             // For now, let's assume we call this only when it's not the current user's own status
//             if (viewingUserStatuses?.user._id !== userId) {
//                  console.log(`[ActivityBar:handleStatusMarkAsViewed] Marking status ${statusId} as viewed by ${userId}`);
//                 const response = await fetch(`${API_BASE_URL}/status/view/${statusId}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({}));
//                     console.error('[ActivityBar:handleStatusMarkAsViewed] Failed to mark status as viewed:', errorData);
//                 } else {
//                     console.log('[ActivityBar:handleStatusMarkAsViewed] Status marked as viewed successfully.');
//                     // Optionally, trigger a refresh for all connections to update 'viewed' state if needed
//                     // setStatusRefreshKey(prev => prev + 1); 
//                 }
//             } else {
//                 console.log(`[ActivityBar:handleStatusMarkAsViewed] Not marking own status (${statusId}) as viewed.`);
//             }
           
//         } catch (err) {
//             console.error('[ActivityBar:handleStatusMarkAsViewed] Error marking status as viewed:', err);
//             // Don't set global error, as it's an internal update
//         }
//     }, [userId, getIdToken, viewingUserStatuses]);


//     const handleUserClickToViewStatuses = useCallback(async (userToView: User) => {
//         console.log(`[ActivityBar:handleUserClickToViewStatuses] Clicked user: ${userToView.name} (ID: ${userToView._id}).`);

//         // If the clicked user is the current authenticated user (userId from props/state)
//         // We need to use currentUserData._id as the source of truth for the logged-in user's MongoDB ID
//         const targetUserId = userToView._id;

//         try {
//             setLoading(true); // Show loading while fetching all statuses for the selected user
//             const allStatuses = await fetchAllUserStatuses(targetUserId);
            
//             if (allStatuses.length > 0) {
//                 setViewingUserStatuses({ user: userToView, statuses: allStatuses });
//                 console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening StatusViewer for ${userToView.name} with ${allStatuses.length} statuses.`);
//             } else {
//                 alert(`No active statuses found for ${userToView.name}.`);
//                 setViewingUserStatuses(null);
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [fetchAllUserStatuses]);


//     const renderUserItem = (user: User) => {
//         const isCurrentUser = user._id === userId; // Use the userId prop, which should be the Mongo ID
//         return (
//             <li
//                 key={user._id}
//                 className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//                 onClick={() => {
//                     handleUserClickToViewStatuses(user);
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                             }`}
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl;
//                         }}
//                     />
//                     {user.hasActiveStatus && (
//                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                     )}
//                 </div>
//                 <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                     {isCurrentUser ? 'You' : user.name} {/* Display 'You' for own profile */}
//                 </span>
//             </li>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {/* Render current user's status first IF currentUserData exists */}
//                     {currentUserData && renderUserItem(currentUserData)}
//                     {/* Then render other connections */}
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             {/* Upload Modal */}
//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {/* Status Viewing Modal - Now uses the dedicated StatusViewer component */}
//             {viewingUserStatuses && (
//                 <StatusViewer
//                     isOpen={!!viewingUserStatuses}
//                     onClose={() => {
//                         setViewingUserStatuses(null);
//                         setStatusRefreshKey(prev => prev + 1); // Refresh all statuses after closing viewer
//                     }}
//                     user={viewingUserStatuses.user}
//                     statuses={viewingUserStatuses.statuses}
//                     currentUserData={currentUserData} // Pass current user's data for comparison (to not mark own status as viewed)
//                     getFullMediaUrl={getFullMediaUrl}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     markAsViewed={handleStatusMarkAsViewed}
//                 />
//             )}
//         </div>
//     );
// };

// export default ActivityBar;









// // client/components/ActivityBar.tsx
// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';
// import { useAuth } from './AuthProvider';
// import toast from 'react-hot-toast';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// export interface Status {
//     _id: string;
//     userId: string;
//     mediaUrl: string; // Ensure this is always a string, even if empty initially
//     mediaType: 'image' | 'video';
//     caption?: string;
//     createdAt: string;
//     expiresAt: string;
//     viewedBy: string[];
// }

// export interface UserWithStatuses {
//     _id: string;
//     name: string;
//     avatarUrl?: string | null; // Can be null or undefined
//     statuses: Status[];
//     isOwnProfile?: boolean;
// }

// interface ActivityBarProps {}

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // IMPORTANT: Ensure this variable is set correctly in your .env.local
// // It should be the base URL where your media files are served, e.g., http://localhost:5001
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL;

// // Make sure this path is correct and the image exists in your public/images folder
// const defaultAvatarPath = '/images/userLogo.png';


// const ActivityBar: React.FC<ActivityBarProps> = () => {
//     const { getIdToken, user: authFirebaseUser, mongoUser, loading: authLoading } = useAuth();
//     const currentMongoUserId = mongoUser?._id || null;

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [currentUserData, setCurrentUserData] = useState<UserWithStatuses | null>(null);
//     const [allConnections, setAllConnections] = useState<UserWithStatuses[]>([]);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);

//     const [isViewingStatus, setIsViewingStatus] = useState(false);
//     const [selectedUserForViewing, setSelectedUserForViewing] = useState<UserWithStatuses | null>(null);

//     // Helper to construct full media URL
//     const getFullMediaUrl = useCallback((relativePath: string | null | undefined): string => {
//         // If relativePath is null, undefined, or an empty string, return default avatar
//         if (!relativePath || relativePath.trim() === '') {
//             console.warn(`[getFullMediaUrl] Invalid relativePath received: "${relativePath}". Returning default avatar.`);
//             return defaultAvatarPath;
//         }

//         // If it's already a full URL, return it as is
//         if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath;
//         }

//         // Check and use MEDIA_BASE_URL
//         if (!MEDIA_BASE_URL) {
//             console.error("[getFullMediaUrl] NEXT_PUBLIC_BACKEND_MEDIA_URL is not set. Cannot construct full media URL for relative path:", relativePath);
//             // Fallback to default if media base URL is not configured
//             return defaultAvatarPath;
//         }

//         // Clean relative path: replace backslashes, ensure it doesn't start with a slash if base already has one
//         const cleanedPath = relativePath.replace(/\\/g, '/').replace(/^\//, ''); // Remove leading slash if present

//         // Ensure MEDIA_BASE_URL has a trailing slash for correct concatenation
//         const baseUrlWithSlash = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`;

//         const fullUrl = `${baseUrlWithSlash}${cleanedPath}`;
//         // console.log(`[getFullMediaUrl] Transformed "${relativePath}" to "${fullUrl}"`); // For debugging
//         return fullUrl;
//     }, []);


//     // --- Data Fetching Functions ---

//     const fetchCurrentUserDataAndStatus = useCallback(async () => {
//         console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] called. Current mongoUser ID: ${currentMongoUserId}`);

//         if (!currentMongoUserId) {
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] currentMongoUserId is null/undefined. Initializing currentUserData fallback.');
//             if (authFirebaseUser) {
//                 setCurrentUserData({
//                     _id: authFirebaseUser.uid,
//                     name: authFirebaseUser.displayName || authFirebaseUser.email?.split('@')[0] || 'You',
//                     avatarUrl: authFirebaseUser.avatarUrl || defaultAvatarPath,
//                     statuses: [],
//                     isOwnProfile: true,
//                 });
//             } else {
//                 setCurrentUserData(null);
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError("Authentication token not available. Please log in.");
//                 setCurrentUserData(null);
//                 return;
//             }

//             if (!mongoUser || !mongoUser._id || !mongoUser.name) {
//                 console.error("[ActivityBar:fetchCurrentUserDataAndStatus] mongoUser from AuthProvider is incomplete or missing essential fields (ID/Name).");
//                 setError("Your profile data is incomplete. Please try again or refresh.");
//                 setCurrentUserData(null);
//                 return;
//             }

//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${mongoUser._id}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatuses: Status[] = [];
//             if (userStatusResponse.ok) {
//                 activeUserStatuses = await userStatusResponse.json();
//                 console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Statuses for '${mongoUser.name}' (ID: ${mongoUser._id}):`, activeUserStatuses);
//             } else if (userStatusResponse.status !== 404) {
//                 const errorData = await userStatusResponse.json().catch(() => ({ message: 'Unknown error fetching user statuses' }));
//                 console.error(`[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch user statuses: ${errorData.message}`);
//                 toast.error(`Failed to load your statuses: ${errorData.message}`);
//             }

//             const newCurrentUserData: UserWithStatuses = {
//                 _id: mongoUser._id,
//                 name: mongoUser.name,
//                 // Ensure avatarUrl is always processed by getFullMediaUrl for consistency
//                 avatarUrl: mongoUser.avatarUrl || defaultAvatarPath,
//                 statuses: activeUserStatuses,
//                 isOwnProfile: true,
//             };
//             setCurrentUserData(newCurrentUserData);
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Updated currentUserData state:', newCurrentUserData);

//         } catch (err) {
//             console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Error during fetch:', err);
//             setError(`Failed to load your data: ${err instanceof Error ? err.message : String(err)}`);
//             setCurrentUserData(null);
//         }
//     }, [currentMongoUserId, authFirebaseUser, getIdToken, mongoUser]); // getFullMediaUrl is internal to rendering, not needed in dependency array here


//     const fetchStatusesForConnections = useCallback(async () => {
//         console.log(`[ActivityBar:fetchStatusesForConnections] called. Current mongoUser ID: ${currentMongoUserId}`);
//         if (!currentMongoUserId) {
//             setAllConnections([]);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError("Authentication token not available. Please log in.");
//                 setAllConnections([]);
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (response.ok) {
//                 const data: UserWithStatuses[] = await response.json();
//                 const filteredConnections = data
//                     .filter(u => u._id !== currentMongoUserId)
//                     .map(u => ({
//                         ...u,
//                         // Ensure avatarUrl is always processed by getFullMediaUrl for consistency
//                         avatarUrl: u.avatarUrl || defaultAvatarPath,
//                         statuses: u.statuses, // Keep existing statuses
//                         isOwnProfile: false
//                     }));
//                 setAllConnections(filteredConnections);
//                 console.log("[ActivityBar] Fetched all connections with statuses:", filteredConnections);
//             } else {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error fetching connections statuses' }));
//                 console.error(`[ActivityBar] Failed to fetch connections statuses: ${errorData.message}`);
//                 toast.error(`Failed to load connections' statuses: ${errorData.message}`);
//                 setAllConnections([]);
//             }
//         } catch (err) {
//             console.error('[ActivityBar] Error fetching connections statuses:', err);
//             setError(`Failed to load connections: ${err instanceof Error ? err.message : String(err)}`);
//             setAllConnections([]);
//         }
//     }, [currentMongoUserId, getIdToken]); // getFullMediaUrl is internal to rendering, not needed in dependency array here


//     useEffect(() => {
//         const loadAllData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 if (!authLoading && currentMongoUserId) {
//                     await Promise.all([
//                         fetchCurrentUserDataAndStatus(),
//                         fetchStatusesForConnections()
//                     ]);
//                 } else if (!authLoading && !currentMongoUserId) {
//                     setCurrentUserData(null);
//                     setAllConnections([]);
//                 }
//             } catch (err) {
//                 console.error("[ActivityBar] Error during overall data fetch:", err);
//                 setError("Failed to load data. Please try refreshing.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadAllData();
//     }, [currentMongoUserId, statusRefreshKey, fetchCurrentUserDataAndStatus, fetchStatusesForConnections, authLoading]);


//     // --- Event Handlers ---

//     const handleUpload = async () => {
//         if (!selectedFile) {
//             toast.error("Please select a file to upload.");
//             return;
//         }
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('[ActivityBar:handleUpload] Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             const responseData = await response.json();
//             console.log('[ActivityBar:handleUpload] Status uploaded successfully:', responseData);

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1);
//             toast.success('Your story has been uploaded!');
//         } catch (err) {
//             console.error('[ActivityBar:handleUpload] Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//             toast.error(err instanceof Error ? err.message : 'Upload failed!');
//         } finally {
//             setUploading(false);
//         }
//     };


//     const handleStatusView = useCallback((userToView: UserWithStatuses) => {
//         if (userToView.statuses && userToView.statuses.length > 0) {
//             setSelectedUserForViewing(userToView);
//             setIsViewingStatus(true);
//             console.log('[ActivityBar:handleStatusView] Opening status modal for:', userToView.name, userToView.statuses.length, 'statuses');
//         } else {
//             toast(`No active stories for ${userToView.name}.`);
//             console.warn(`[ActivityBar:handleStatusView] Attempted to view status for ${userToView.name} but no active status found.`);
//         }
//     }, []);

//     const handleCloseStatusViewer = useCallback(() => {
//         setIsViewingStatus(false);
//         setSelectedUserForViewing(null);
//         setStatusRefreshKey(prev => prev + 1);
//     }, []);

//     const handleStatusUpdate = useCallback((updatedStatus: Status) => {
//         console.log("Status updated from viewer:", updatedStatus);
//         setStatusRefreshKey(prev => prev + 1);
//     }, []);

//     const handleReportStatus = useCallback(async (statusId: string, reportedUserId: string) => {
//         if (!currentMongoUserId) {
//             toast.error("Please log in to report a status.");
//             return;
//         }
//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error("Authentication required.");

//             const response = await fetch(`${API_BASE_URL}/status/report`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ statusId, reportedBy: currentMongoUserId, reportedUserId }),
//             });

//             if (response.ok) {
//                 toast.success("Status reported successfully!");
//             } else {
//                 const errorData = await response.json().catch(() => ({}));
//                 toast.error(`Failed to report status: ${errorData.message || 'Unknown error'}`);
//             }
//         } catch (error) {
//             console.error("Error reporting status:", error);
//             toast.error(`Error reporting status: ${error instanceof Error ? error.message : String(error)}`);
//         }
//     }, [currentMongoUserId, getIdToken]);

//     // --- Render Helper Function for User Items ---

//     const renderUserItem = useCallback((userItem: UserWithStatuses) => {
//         const isCurrentUser = userItem._id === currentMongoUserId;
//         const hasUnviewedStatuses = (userItem.statuses || []).some(
//             status => !status.viewedBy.includes(currentMongoUserId || '')
//         );
//         const ringColor = hasUnviewedStatuses ? 'border-blue-500' : 'border-gray-400';

//         // Log the input to getFullMediaUrl for debugging
//         console.log(`[ActivityBar:renderUserItem] Processing avatar for user: ${userItem.name}, avatarUrl input: "${userItem.avatarUrl}"`);
//         const avatarSrc = getFullMediaUrl(userItem.avatarUrl);
//         console.log(`[ActivityBar:renderUserItem] Final avatarSrc for ${userItem.name}: "${avatarSrc}"`);


//         return (
//             <div
//                 key={userItem._id}
//                 className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
//                 onClick={() => handleStatusView(userItem)}
//                 title={userItem.name}
//             >
//                 <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${ringColor} flex items-center justify-center`}>
//                     <Image
//                         src={avatarSrc}
//                         alt={userItem.name}
//                         width={60}
//                         height={60}
//                         className="object-cover rounded-full"
//                         // next/image will handle its own error reporting if src is truly invalid
//                     />
//                 </div>
//                 <p className="text-xs mt-1 text-center font-medium truncate w-16">
//                     {isCurrentUser ? 'My Story' : userItem.name.split(' ')[0]}
//                 </p>
//             </div>
//         );
//     }, [currentMongoUserId, handleStatusView, getFullMediaUrl]);


//     if (loading) {
//         return (
//             <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto min-h-[200px] flex flex-col justify-center items-center">
//                 <p className="text-gray-600 mb-4">Loading stories...</p>
//                 <div className="flex space-x-4">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto min-h-[200px] flex flex-col justify-center items-center text-red-500">
//                 <p>{error}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto">
//             <h2 className="text-lg font-semibold mb-4 text-gray-800">Stories</h2>

//             <div className="space-y-4">
//                 {/* My Story Section */}
//                 {currentUserData && (
//                     <div className="border-b pb-4 mb-4">
//                         <h3 className="text-md font-medium mb-2 text-gray-700">My Story</h3>
//                         <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
//                             {renderUserItem(currentUserData)}
//                             <div className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setIsUploadModalOpen(true)} title="Add New Story">
//                                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-3xl">
//                                     <Plus size={24} />
//                                 </div>
//                                 <p className="text-xs mt-1 text-center font-medium text-gray-600 w-16">Add Story</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Connections' Stories Section */}
//                 <h3 className="text-md font-medium mb-2 text-gray-700">Connections' Stories</h3>
//                 {allConnections.length > 0 ? (
//                     <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
//                         {allConnections.map(renderUserItem)}
//                     </div>
//                 ) : (
//                     <p className="text-sm text-gray-500">No new stories from your connections.</p>
//                 )}
//             </div>

//             {/* Upload Modal */}
//             {isUploadModalOpen && (
//                 <UploadModal
//                     isOpen={isUploadModalOpen}
//                     onClose={() => setIsUploadModalOpen(false)}
//                     onFileSelected={setSelectedFile}
//                     selectedFile={selectedFile}
//                     visibility={visibility}
//                     setVisibility={setVisibility}
//                     onUpload={handleUpload}
//                     uploading={uploading}
//                     error={uploadError}
//                 />
//             )}

//             {/* Viewing Status Modal (separate component) */}
//             {isViewingStatus && selectedUserForViewing && (
//                 <ViewingStatus
//                     user={selectedUserForViewing}
//                     onClose={handleCloseStatusViewer}
//                     onStatusUpdate={handleStatusUpdate}
//                     onReportStatus={handleReportStatus}
//                 />
//             )}
//         </div>
//     );
// };

// export default ActivityBar;

// import ViewingStatus from './ViewingStatus';








// // client/components/ActivityBar.tsx
// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';
// import { useAuth } from './AuthProvider';
// import toast from 'react-hot-toast';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// export interface Status {
//     _id: string;
//     userId: string;
//     mediaUrl: string;
//     mediaType: 'image' | 'video';
//     caption?: string;
//     createdAt: string;
//     expiresAt: string;
//     viewedBy: string[];
// }

// export interface UserWithStatuses {
//     _id: string;
//     name: string;
//     avatarUrl?: string | null;
//     statuses: Status[];
//     isOwnProfile?: boolean;
// }

// interface ActivityBarProps {}

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL;

// const defaultAvatarPath = '/images/userLogo.png';


// const ActivityBar: React.FC<ActivityBarProps> = () => {
//     const { getIdToken, user: authFirebaseUser, mongoUser, loading: authLoading } = useAuth();
//     const currentMongoUserId = mongoUser?._id || null;

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [currentUserData, setCurrentUserData] = useState<UserWithStatuses | null>(null);
//     const [allConnections, setAllConnections] = useState<UserWithStatuses[]>([]);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);

//     const [isViewingStatus, setIsViewingStatus] = useState(false);
//     const [selectedUserForViewing, setSelectedUserForViewing] = useState<UserWithStatuses | null>(null);

//     // Helper to construct full media URL
//     const getFullMediaUrl = useCallback((relativePath: string | null | undefined): string => {
//         if (!relativePath || relativePath.trim() === '') {
//             return defaultAvatarPath;
//         }

//         if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath;
//         }

//         if (!MEDIA_BASE_URL) {
//             console.error("[getFullMediaUrl] NEXT_PUBLIC_BACKEND_MEDIA_URL is not set. Cannot construct full media URL for relative path:", relativePath);
//             return defaultAvatarPath;
//         }

//         const cleanedPath = relativePath.replace(/\\/g, '/').replace(/^\//, '');
//         const baseUrlWithSlash = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL : `${MEDIA_BASE_URL}/`;

//         const fullUrl = `${baseUrlWithSlash}${cleanedPath}`;
//         return fullUrl;
//     }, []);


//     // --- Data Fetching Functions ---

//     const fetchCurrentUserDataAndStatus = useCallback(async () => {
//         console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] called. Current mongoUser ID: ${currentMongoUserId}`);

//         if (!currentMongoUserId) {
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] currentMongoUserId is null/undefined. Initializing currentUserData fallback.');
//             if (authFirebaseUser) {
//                 setCurrentUserData({
//                     _id: authFirebaseUser.uid,
//                     name: authFirebaseUser.displayName || authFirebaseUser.email?.split('@')[0] || 'You',
//                     avatarUrl: authFirebaseUser.avatarUrl || defaultAvatarPath,
//                     statuses: [],
//                     isOwnProfile: true,
//                 });
//             } else {
//                 setCurrentUserData(null);
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError("Authentication token not available. Please log in.");
//                 setCurrentUserData(null);
//                 return;
//             }

//             if (!mongoUser || !mongoUser._id || !mongoUser.name) {
//                 console.error("[ActivityBar:fetchCurrentUserDataAndStatus] mongoUser from AuthProvider is incomplete or missing essential fields (ID/Name).");
//                 setError("Your profile data is incomplete. Please try again or refresh.");
//                 setCurrentUserData(null);
//                 return;
//             }

//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${mongoUser._id}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatuses: Status[] = [];
//             if (userStatusResponse.ok) {
//                 activeUserStatuses = await userStatusResponse.json();
//                 console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Statuses for '${mongoUser.name}' (ID: ${mongoUser._id}):`, activeUserStatuses);
//             } else if (userStatusResponse.status !== 404) {
//                 const errorData = await userStatusResponse.json().catch(() => ({ message: 'Unknown error fetching user statuses' }));
//                 console.error(`[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch user statuses: ${errorData.message}`);
//                 toast.error(`Failed to load your statuses: ${errorData.message}`);
//             }

//             const newCurrentUserData: UserWithStatuses = {
//                 _id: mongoUser._id,
//                 name: mongoUser.name,
//                 avatarUrl: mongoUser.avatarUrl || defaultAvatarPath,
//                 statuses: activeUserStatuses,
//                 isOwnProfile: true,
//             };
//             setCurrentUserData(newCurrentUserData);
//             console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Updated currentUserData state:', newCurrentUserData);

//         } catch (err) {
//             console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Error during fetch:', err);
//             setError(`Failed to load your data: ${err instanceof Error ? err.message : String(err)}`);
//             setCurrentUserData(null);
//         }
//     }, [currentMongoUserId, authFirebaseUser, getIdToken, mongoUser]);


//     const fetchStatusesForConnections = useCallback(async () => {
//         console.log(`[ActivityBar:fetchStatusesForConnections] called. Current mongoUser ID: ${currentMongoUserId}`);
//         if (!currentMongoUserId) {
//             console.log('[ActivityBar:fetchStatusesForConnections] currentMongoUserId is null/undefined. Cannot fetch connections statuses.');
//             setAllConnections([]);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError("Authentication token not available. Please log in.");
//                 setAllConnections([]);
//                 return;
//             }

//             console.log(`[ActivityBar:fetchStatusesForConnections] Fetching from: ${API_BASE_URL}/status`);
//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (response.ok) {
//                 const data: UserWithStatuses[] = await response.json();
//                 console.log("[ActivityBar:fetchStatusesForConnections] Raw API response data:", data);

//                 const filteredConnections = data
//                     .filter(u => u._id !== currentMongoUserId)
//                     .map(u => ({
//                         ...u,
//                         avatarUrl: u.avatarUrl || defaultAvatarPath,
//                         statuses: u.statuses,
//                         isOwnProfile: false
//                     }));
//                 setAllConnections(filteredConnections);
//                 console.log("[ActivityBar:fetchStatusesForConnections] Filtered connections with statuses (assigned to state):", filteredConnections);
//                 if (filteredConnections.length === 0) {
//                     console.log("[ActivityBar:fetchStatusesForConnections] No connections with active stories found after filtering.");
//                 } else {
//                     filteredConnections.forEach(conn => {
//                         console.log(`  - Connection: ${conn.name}, Statuses count: ${conn.statuses.length}`);
//                         if (conn.statuses.length > 0) {
//                             conn.statuses.forEach(status => {
//                                 console.log(`    - Status ID: ${status._id}, Media URL: ${status.mediaUrl}, Type: ${status.mediaType}, Viewed By: ${status.viewedBy.length}`);
//                             });
//                         }
//                     });
//                 }

//             } else {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error fetching connections statuses' }));
//                 console.error(`[ActivityBar:fetchStatusesForConnections] Failed to fetch connections statuses (Status: ${response.status}): ${errorData.message}`);
//                 toast.error(`Failed to load connections' statuses: ${errorData.message}`);
//                 setAllConnections([]);
//             }
//         } catch (err) {
//             console.error('[ActivityBar:fetchStatusesForConnections] Error fetching connections statuses:', err);
//             setError(`Failed to load connections: ${err instanceof Error ? err.message : String(err)}`);
//             setAllConnections([]);
//         }
//     }, [currentMongoUserId, getIdToken]);


//     useEffect(() => {
//         const loadAllData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 if (!authLoading && currentMongoUserId) {
//                     await Promise.all([
//                         fetchCurrentUserDataAndStatus(),
//                         fetchStatusesForConnections()
//                     ]);
//                 } else if (!authLoading && !currentMongoUserId) {
//                     setCurrentUserData(null);
//                     setAllConnections([]);
//                     console.log("[ActivityBar:useEffect] Auth loading finished, but no current Mongo User ID. Clearing data.");
//                 } else {
//                     console.log("[ActivityBar:useEffect] Still loading auth or currentMongoUserId not yet available. Waiting...");
//                 }
//             } catch (err) {
//                 console.error("[ActivityBar] Error during overall data fetch:", err);
//                 setError("Failed to load data. Please try refreshing.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadAllData();
//         console.log(`[ActivityBar:useEffect] Running effect. statusRefreshKey: ${statusRefreshKey}, authLoading: ${authLoading}, currentMongoUserId: ${currentMongoUserId}`);
//     }, [currentMongoUserId, statusRefreshKey, fetchCurrentUserDataAndStatus, fetchStatusesForConnections, authLoading]);


//     // --- Event Handlers ---

//     const handleUpload = async () => {
//         if (!selectedFile) {
//             toast.error("Please select a file to upload.");
//             return;
//         }
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('[ActivityBar:handleUpload] Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             const responseData = await response.json();
//             console.log('[ActivityBar:handleUpload] Status uploaded successfully:', responseData);

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1);
//             toast.success('Your story has been uploaded!');
//         } catch (err) {
//             console.error('[ActivityBar:handleUpload] Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//             toast.error(err instanceof Error ? err.message : 'Upload failed!');
//         } finally {
//             setUploading(false);
//         }
//     };


//     const handleStatusView = useCallback((userToView: UserWithStatuses) => {
//         console.log(`[ActivityBar:handleStatusView] Attempting to view stories for: ${userToView.name}, total statuses: ${userToView.statuses.length}`);
//         if (userToView.statuses && userToView.statuses.length > 0) {
//             setSelectedUserForViewing(userToView);
//             setIsViewingStatus(true);
//             console.log('[ActivityBar:handleStatusView] Opening status modal for:', userToView.name, userToView.statuses.length, 'statuses');
//         } else {
//             toast(`No active stories for ${userToView.name}.`);
//             console.warn(`[ActivityBar:handleStatusView] Attempted to view status for ${userToView.name} but no active status found.`);
//         }
//     }, []);

//     const handleCloseStatusViewer = useCallback(() => {
//         setIsViewingStatus(false);
//         setSelectedUserForViewing(null);
//         setStatusRefreshKey(prev => prev + 1);
//         console.log('[ActivityBar:handleCloseStatusViewer] Status viewer closed. Refreshing ActivityBar data.');
//     }, []);

//     const handleStatusUpdate = useCallback((updatedStatus: Status) => {
//         console.log("Status updated from viewer:", updatedStatus);
//         setStatusRefreshKey(prev => prev + 1);
//     }, []);

//     const handleReportStatus = useCallback(async (statusId: string, reportedUserId: string) => {
//         if (!currentMongoUserId) {
//             toast.error("Please log in to report a status.");
//             return;
//         }
//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error("Authentication required.");

//             const response = await fetch(`${API_BASE_URL}/status/report`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ statusId, reportedBy: currentMongoUserId, reportedUserId }),
//             });

//             if (response.ok) {
//                 toast.success("Status reported successfully!");
//             } else {
//                 const errorData = await response.json().catch(() => ({}));
//                 toast.error(`Failed to report status: ${errorData.message || 'Unknown error'}`);
//             }
//         } catch (error) {
//             console.error("Error reporting status:", error);
//             toast.error(`Error reporting status: ${error instanceof Error ? error.message : String(error)}`);
//         }
//     }, [currentMongoUserId, getIdToken]);

//     // --- Render Helper Function for User Items ---

//     const renderUserItem = useCallback((userItem: UserWithStatuses) => {
//         const isCurrentUser = userItem._id === currentMongoUserId;
//         const hasUnviewedStatuses = (userItem.statuses || []).some(
//             status => !status.viewedBy.includes(currentMongoUserId || '')
//         );
//         const ringColor = hasUnviewedStatuses ? 'border-blue-500' : 'border-gray-400';

//         const avatarSrc = getFullMediaUrl(userItem.avatarUrl);

//         console.log(`[ActivityBar:renderUserItem] Rendering user: ${userItem.name}, ID: ${userItem._id}, Avatar SRC: ${avatarSrc}, Statuses count: ${userItem.statuses?.length || 0}`);

//         return (
//             <div
//                 key={userItem._id}
//                 className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
//                 onClick={() => handleStatusView(userItem)}
//                 title={userItem.name}
//             >
//                 <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${ringColor} flex items-center justify-center`}>
//                     <Image
//                         src={avatarSrc}
//                         alt={userItem.name}
//                         width={60}
//                         height={60}
//                         className="object-cover rounded-full"
//                     />
//                 </div>
//                 <p className="text-xs mt-1 text-center font-medium truncate w-16">
//                     {isCurrentUser ? 'My Story' : userItem.name.split(' ')[0]}
//                 </p>
//             </div>
//         );
//     }, [currentMongoUserId, handleStatusView, getFullMediaUrl]);


//     if (loading) {
//         return (
//             <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto min-h-[200px] flex flex-col justify-center items-center">
//                 <p className="text-gray-600 mb-4">Loading stories...</p>
//                 <div className="flex space-x-4">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto min-h-[200px] flex flex-col justify-center items-center text-red-500">
//                 <p>{error}</p>
//             </div>
//         );
//     }

//     console.log(`[ActivityBar:Render] Current User Data exists: ${!!currentUserData}, Connections count: ${allConnections.length}`);

//     return (
//         <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto">
//             <h2 className="text-lg font-semibold mb-4 text-gray-800">Stories</h2>

//             <div className="space-y-4">
//                 {/* My Story Section */}
//                 {currentUserData && (
//                     <div className="border-b pb-4 mb-4">
//                         <h3 className="text-md font-medium mb-2 text-gray-700">My Story</h3>
//                         <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
//                             {renderUserItem(currentUserData)}
//                             <div className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setIsUploadModalOpen(true)} title="Add New Story">
//                                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-3xl">
//                                     <Plus size={24} />
//                                 </div>
//                                 <p className="text-xs mt-1 text-center font-medium text-gray-600 w-16">Add Story</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Connections' Stories Section */}
//                 <h3 className="text-md font-medium mb-2 text-gray-700">Connections' Stories</h3>
//                 {allConnections.length > 0 ? (
//                     <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
//                         {allConnections.map(renderUserItem)}
//                     </div>
//                 ) : (
//                     <p className="text-sm text-gray-500">No new stories from your connections.</p>
//                 )}
//             </div>

//             {/* Upload Modal */}
//             {isUploadModalOpen && (
//                 <UploadModal
//                     isOpen={isUploadModalOpen}
//                     onClose={() => setIsUploadModalOpen(false)}
//                     onFileSelected={setSelectedFile}
//                     selectedFile={selectedFile}
//                     visibility={visibility}
//                     setVisibility={setVisibility}
//                     onUpload={handleUpload}
//                     uploading={uploading}
//                     error={uploadError}
//                 />
//             )}

//             {/* Viewing Status Modal (separate component) */}
//             {isViewingStatus && selectedUserForViewing && (
//                 <ViewingStatus
//                     user={selectedUserForViewing}
//                     onClose={handleCloseStatusViewer}
//                     onStatusUpdate={handleStatusUpdate}
//                     onReportStatus={handleReportStatus}
//                 />
//             )}
//         </div>
//     );
// };

// export default ActivityBar;

// import ViewingStatus from './ViewingStatus';





'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthProvider'; // Adjust path if necessary
import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plus } from 'lucide-react';
import UploadModal from './UploadModal'; // Adjust path if necessary
import StatusViewer from './StatusViewer'; // Import the new StatusViewer component
import { User } from './StatusViewer';

// Ensure these are correctly set in your .env.local file
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// Interface for a single Status object
interface Status {
    _id: string;
    userId: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    viewedBy: string[]; // This will contain user IDs who viewed it
    visibility: 'public' | 'followers';
}

// Interface for the current user's data as returned by /api/status (currentUserData property)
interface CurrentUserActivityData {
    _id: string;
    name: string;
    avatarUrl?: string;
    hasActiveStatus: boolean; // True if allActiveStatuses is not empty
    allActiveStatuses: Status[]; // Array of all active statuses for the current user
}

// Interface for a connected user's data as returned by /api/status (connectionsWithStatuses array items)
interface ConnectionActivityData {
    _id: string;
    name: string;
    avatarUrl?: string;
    hasActiveStatus: boolean; // True if they have any active status
    latestActiveStatusPreview?: { // Basic info of their latest status for the bubble
        _id: string;
        mediaType: 'image' | 'video';
        mediaUrl: string;
        createdAt: string;
    };
}

interface ActivityBarProps {
    userId: string | null; // This should be the MongoDB ID of the current authenticated user
}

const ActivityBar = ({ userId }: ActivityBarProps) => {
    const { getIdToken, user: authUser } = useAuth();

    // State for current user's own stories (full list)
    const [currentUserOwnStatuses, setCurrentUserOwnStatuses] = useState<CurrentUserActivityData | null>(null);
    // State for other connections' stories (just a preview for the bubble)
    const [allConnections, setAllConnections] = useState<ConnectionActivityData[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // State for viewing multiple statuses for a selected user in the modal
    const [viewingUserStatuses, setViewingUserStatuses] = useState<{ user: CurrentUserActivityData | ConnectionActivityData; statuses: Status[] } | null>(null);
    const [statusRefreshKey, setStatusRefreshKey] = useState(0); // Key to trigger re-fetches

    // Use a ref for the default avatar URL for consistent access
    const defaultAvatarUrl = React.useMemo(() => {
        return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
    }, []);

    const getFullMediaUrl = useCallback((relativePath?: string): string => {
        if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath || defaultAvatarUrl;
        }
        // Ensure path uses forward slashes for URLs, especially important for Windows paths from Multer
        const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;
        // Check if the relativePath already includes 'uploads/' to avoid double adding
        const cleanedPath = relativePath.replace(/\\/g, '/');
        if (cleanedPath.startsWith('uploads/') || cleanedPath.startsWith('avatars/')) {
            return `${baseUrl}/${cleanedPath}`;
        }
        // Fallback or if no specific folder is in the path
        return `${baseUrl}/uploads/${cleanedPath}`; // Assuming most uploads go into 'uploads/'
    }, [defaultAvatarUrl]);

    // Function to fetch all activity bar data (current user's stories + connections' stories)
    const fetchActivityBarData = useCallback(async () => {
        console.log(`[ActivityBar:fetchActivityBarData] called. Current userId prop: ${userId}`);

        if (!userId) {
            console.log('[ActivityBar:fetchActivityBarData] userId prop is null/undefined. Cannot fetch activity data.');
            // Initialize with default empty states if no user
            setCurrentUserOwnStatuses(null);
            setAllConnections([]);
            setLoading(false);
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
                console.error('[ActivityBar:fetchActivityBarData] Authentication token not available.');
                setError('Authentication token not available. Please log in.');
                setCurrentUserOwnStatuses(null);
                setAllConnections([]);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/status`, { 
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[ActivityBar:fetchActivityBarData] Failed to fetch activity bar data:', errorData);
                throw new Error(errorData.message || 'Failed to fetch stories.');
            }

            const data = await response.json();
            console.log('[ActivityBar:fetchActivityBarData] Fetched activity data:', data);

            // Update states with the new response structure
            setCurrentUserOwnStatuses(data.currentUserData);
            setAllConnections(data.connectionsWithStatuses);

        } catch (err) {
            console.error('[ActivityBar:fetchActivityBarData] Error during data fetch:', err);
            setError(err instanceof Error ? err.message : 'Could not load stories.');
            setCurrentUserOwnStatuses(null);
            setAllConnections([]);
        } finally {
            setLoading(false);
        }
    }, [userId, getIdToken]); 


    // Main useEffect to orchestrate fetching
    useEffect(() => {
        // This effect runs on component mount and when userId or statusRefreshKey changes
        if (userId) { 
            fetchActivityBarData();
        } else {
            // If userId is null (e.g., not logged in), clear states
            setLoading(false);
            setCurrentUserOwnStatuses(null);
            setAllConnections([]);
        }
    }, [userId, statusRefreshKey, fetchActivityBarData]);


    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadError(null);

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            const formData = new FormData();
            formData.append('media', selectedFile);
            formData.append('visibility', visibility);

            const response = await fetch(`${API_BASE_URL}/status/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[ActivityBar:handleUpload] Server responded with an error during upload:', errorData);
                throw new Error(errorData.message || 'Status upload failed.');
            }

            const responseData = await response.json(); 
            console.log('[ActivityBar:handleUpload] Status uploaded successfully:', responseData);

            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setVisibility('public');
            setStatusRefreshKey(prev => prev + 1); // Trigger re-fetch of all statuses to show the new one
        } catch (err) {
            console.error('[ActivityBar:handleUpload] Error during status upload:', err);
            setUploadError(err instanceof Error ? err.message : 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    // Function to fetch ALL statuses for a specific user (used when clicking a connection's story bubble)
    const fetchAllUserStatuses = useCallback(async (targetUserId: string): Promise<Status[]> => {
        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required to fetch statuses.');

            const response = await fetch(`${API_BASE_URL}/status/user/${targetUserId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[ActivityBar:fetchAllUserStatuses] Failed to fetch statuses for user ${targetUserId}:`, errorData);
                throw new Error(errorData.message || 'Failed to fetch user statuses.');
            }
            return await response.json();
        } catch (err) {
            console.error(`[ActivityBar:fetchAllUserStatuses] Error fetching all statuses for user ${targetUserId}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to fetch statuses.');
            return [];
        }
    }, [getIdToken]);

    // Function to fetch user details for viewedBy list (for StatusViewer)
    const fetchUserDetails = useCallback(async (userIds: string[]): Promise<User[]> => {
        if (userIds.length === 0) return [];
        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required to fetch user details.');

            // This hits your /api/users/details endpoint
            const response = await fetch(`${API_BASE_URL}/users/details`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[ActivityBar:fetchUserDetails] Server responded with an error fetching user details:', errorData);
                throw new Error(errorData.message || 'Failed to fetch user details.');
            }
            return await response.json(); 
        } catch (err) {
            console.error('[ActivityBar:fetchUserDetails] Error fetching user details:', err);
            return [];
        }
    }, [getIdToken]);


    const handleStatusMarkAsViewed = useCallback(async (statusId: string) => {
        if (!userId) { 
            console.warn("[ActivityBar:handleStatusMarkAsViewed] Cannot mark status as viewed: Current user's MongoDB ID not available.");
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required to mark status as viewed.');

            // Only mark as viewed if it's not your own status
            if (viewingUserStatuses?.user._id !== userId) {
                console.log(`[ActivityBar:handleStatusMarkAsViewed] Marking status ${statusId} as viewed by ${userId}`);
                const response = await fetch(`${API_BASE_URL}/status/view/${statusId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('[ActivityBar:handleStatusMarkAsViewed] Failed to mark status as viewed:', errorData);
                } else {
                    console.log('[ActivityBar:handleStatusMarkAsViewed] Status marked as viewed successfully.');
                }
            } else {
                console.log(`[ActivityBar:handleStatusMarkAsViewed] Not marking own status (${statusId}) as viewed.`);
            }
        } catch (err) {
            console.error('[ActivityBar:handleStatusMarkAsViewed] Error marking status as viewed:', err);
        }
    }, [userId, getIdToken, viewingUserStatuses]);


    const handleUserClickToViewStatuses = useCallback(async (userClicked: CurrentUserActivityData | ConnectionActivityData) => {
        console.log(`[ActivityBar:handleUserClickToViewStatuses] Clicked user: ${userClicked.name} (ID: ${userClicked._id}).`);

        let statusesToPassToViewer: Status[] = [];
        let userForViewer: CurrentUserActivityData | ConnectionActivityData = userClicked;

        // Determine if the clicked user is the current authenticated user
        if (userClicked._id === userId && currentUserOwnStatuses) {
            // If it's the current user, use the pre-fetched allActiveStatuses
            statusesToPassToViewer = currentUserOwnStatuses.allActiveStatuses;
            userForViewer = currentUserOwnStatuses; // Ensure it's the full CurrentUserActivityData
            console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening YOUR statuses:`, statusesToPassToViewer);
        } else {
            // If it's a connection, fetch all their statuses via a separate API call
            try {
                setLoading(true); 
                statusesToPassToViewer = await fetchAllUserStatuses(userClicked._id);
                console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening ${userClicked.name}'s statuses:`, statusesToPassToViewer);
            } finally {
                setLoading(false);
            }
        }
        
        if (statusesToPassToViewer.length > 0) {
            setViewingUserStatuses({ user: userForViewer, statuses: statusesToPassToViewer });
            console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening StatusViewer for ${userForViewer.name} with ${statusesToPassToViewer.length} statuses.`);
        } else {
            alert(`No active statuses found for ${userClicked.name}.`);
            setViewingUserStatuses(null);
        }
    }, [userId, currentUserOwnStatuses, fetchAllUserStatuses]);


    // Renders a single user's story bubble
    const renderUserItem = (user: CurrentUserActivityData | ConnectionActivityData) => {
        // Use `hasActiveStatus` property to determine if the border should be blue (active)
        const hasActiveStatus = user.hasActiveStatus;

        return (
            <li
                key={user._id}
                className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
                onClick={() => handleUserClickToViewStatuses(user)}
            >
                <div className="relative">
                    <img
                        // For current user, use their avatarUrl directly. For connections, it's also available.
                        src={getFullMediaUrl(user.avatarUrl)} 
                        alt={user.name}
                        className={`w-14 h-14 rounded-full object-cover border-2 ${hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                            }`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatarUrl; // Fallback to default avatar
                        }}
                    />
                    {hasActiveStatus && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                </div>
                <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
                    {user._id === userId ? 'You' : user.name} 
                </span>
            </li>
        );
    };

    return (
        <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stories</h2>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                >
                    <Plus size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex space-x-4 overflow-x-auto py-2">
                    {[1, 2, 3, 4, 5].map(i => ( // Show more skeletons for better loading visual
                        <div key={i} className="flex flex-col items-center space-y-1 min-w-[80px]">
                            <Skeleton circle width={56} height={56} />
                            <Skeleton width={40} height={10} />
                        </div>
                    ))}
                </div>
            ) : (
                <ul className="flex space-x-4 overflow-x-auto py-2 hide-scrollbar"> {/* Added hide-scrollbar for cleaner look */}
                    {/* Render current user's status first IF currentUserOwnStatuses exists and has any active status */}
                    {currentUserOwnStatuses && currentUserOwnStatuses.hasActiveStatus && renderUserItem(currentUserOwnStatuses)}
                    
                    {/* Then render other connections who have active statuses */}
                    {allConnections.filter(conn => conn.hasActiveStatus).map(renderUserItem)}
                </ul>
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
                visibility={visibility}
                setVisibility={setVisibility}
                onUpload={handleUpload}
                uploading={uploading}
                error={uploadError}
            />

            {/* Status Viewing Modal - Now uses the dedicated StatusViewer component */}
            {viewingUserStatuses && (
                <StatusViewer
                    isOpen={!!viewingUserStatuses}
                    onClose={() => {
                        setViewingUserStatuses(null);
                        setStatusRefreshKey(prev => prev + 1); // Refresh all statuses after closing viewer
                    }}
                    user={viewingUserStatuses.user}
                    statuses={viewingUserStatuses.statuses}
                    currentUserData={currentUserOwnStatuses} // Pass current user's full data for comparison
                    getFullMediaUrl={getFullMediaUrl}
                    defaultAvatarUrl={defaultAvatarUrl}
                    markAsViewed={handleStatusMarkAsViewed}
                    fetchUserDetails={fetchUserDetails} 
                />
            )}
        </div>
    );
};

export default ActivityBar;