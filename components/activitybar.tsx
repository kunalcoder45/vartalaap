// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import { useAuth } from './AuthProvider'; // Adjust path if necessary
// import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal'; // Adjust path if necessary
// import StatusViewer from './StatusViewer'; // Import the new StatusViewer component
// import { User } from './StatusViewer'; // Assuming User interface is defined and exported from StatusViewer.tsx or a types file

// // Ensure these are correctly set in your .env.local file
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// // Interface for a single Status object
// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[]; // This will contain user IDs who viewed it
//     visibility: 'public' | 'followers';
// }

// // Interface for the current user's data as returned by /api/status (currentUserData property)
// interface CurrentUserActivityData {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus: boolean; // True if allActiveStatuses is not empty
//     allActiveStatuses: Status[]; // Array of all active statuses for the current user
// }

// // Interface for a connected user's data as returned by /api/status (connectionsWithStatuses array items)
// interface ConnectionActivityData {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus: boolean; // True if they have any active status
//     latestActiveStatusPreview?: { // Basic info of their latest status for the bubble
//         _id: string;
//         mediaType: 'image' | 'video';
//         mediaUrl: string;
//         createdAt: string;
//     };
// }

// interface ActivityBarProps {
//     userId: string | null; // This should be the MongoDB ID of the current authenticated user
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth(); // `authUser` might be useful for current user's Firebase UID if needed

//     // State for current user's own stories (full list)
//     const [currentUserOwnStatuses, setCurrentUserOwnStatuses] = useState<CurrentUserActivityData | null>(null);
//     // State for other connections' stories (just a preview for the bubble)
//     const [allConnections, setAllConnections] = useState<ConnectionActivityData[]>([]);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);

//     // State for viewing multiple statuses for a selected user in the modal
//     const [viewingUserStatuses, setViewingUserStatuses] = useState<{ user: CurrentUserActivityData | ConnectionActivityData; statuses: Status[] } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0); // Key to trigger re-fetches

//     // Use a memoized value for the default avatar URL for consistent access
//     const defaultAvatarUrl = React.useMemo(() => {
//         return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
//     }, []);

//     // Function to handle status deletion
//     const handleDeleteStatus = useCallback(async (statusId: string) => {
//         console.log(`[ActivityBar:handleDeleteStatus] Attempting to delete status: ${statusId}`);
//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 throw new Error('Authentication required to delete status.');
//             }

//             const response = await fetch(`${API_BASE_URL}/status/${statusId}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('[ActivityBar:handleDeleteStatus] Failed to delete status:', errorData);
//                 throw new Error(errorData.message || 'Failed to delete status.');
//             }

//             console.log(`[ActivityBar:handleDeleteStatus] Status ${statusId} deleted successfully.`);
//             // Refresh statuses after deletion
//             setStatusRefreshKey(prev => prev + 1);
//             // Close the viewer if the deleted status was the one being viewed
//             if (viewingUserStatuses) {
//                 const remainingStatuses = viewingUserStatuses.statuses.filter(s => s._id !== statusId);
//                 if (remainingStatuses.length === 0) {
//                     setViewingUserStatuses(null); // Close viewer if no statuses left
//                 } else {
//                     setViewingUserStatuses(prev => ({
//                         ...prev!,
//                         statuses: remainingStatuses,
//                     }));
//                 }
//             }
//         } catch (err) {
//             console.error('[ActivityBar:handleDeleteStatus] Error deleting status:', err);
//             setError(err instanceof Error ? err.message : 'Error deleting status.');
//         }
//     }, [getIdToken, viewingUserStatuses]);


//     // Helper function to get full URL for media (avatars, status media)
//     const getFullMediaUrl = useCallback((relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             // If avatarPath is null/undefined or already an absolute URL (e.g., Google photo)
//             return relativePath || defaultAvatarUrl;
//         }
//         // Ensure path uses forward slashes for URLs, especially important for Windows paths from Multer
//         const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;

//         // Check if the relativePath already includes 'uploads/' or 'avatars/' to avoid double adding
//         const cleanedPath = relativePath.replace(/\\/g, '/'); // Normalize slashes

//         if (cleanedPath.startsWith('uploads/') || cleanedPath.startsWith('avatars/')) {
//             return `${baseUrl}/${cleanedPath}`;
//         }
//         // Fallback for paths that might just be filenames or stored without the folder prefix
//         return `${baseUrl}/uploads/${cleanedPath}`; // Assuming most uploads go into 'uploads/'
//     }, [defaultAvatarUrl]);

//     // Function to fetch all activity bar data (current user's stories + connections' stories)
//     const fetchActivityBarData = useCallback(async () => {
//         console.log(`[ActivityBar:fetchActivityBarData] called. Current userId prop: ${userId}`);

//         if (!userId) {
//             console.log('[ActivityBar:fetchActivityBarData] userId prop is null/undefined. Cannot fetch activity data.');
//             // Initialize with default empty states if no user
//             setCurrentUserOwnStatuses(null);
//             setAllConnections([]);
//             setLoading(false);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 console.error('[ActivityBar:fetchActivityBarData] Authentication token not available.');
//                 setError('Authentication token not available. Please log in.');
//                 setCurrentUserOwnStatuses(null);
//                 setAllConnections([]);
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('[ActivityBar:fetchActivityBarData] Failed to fetch activity bar data:', errorData);
//                 throw new Error(errorData.message || 'Failed to fetch stories.');
//             }

//             const data = await response.json();
//             console.log('[ActivityBar:fetchActivityBarData] Fetched activity data:', data);

//             // Apply getFullMediaUrl to avatarUrl for currentUserData and connectionsWithStatuses
//             const processedCurrentUser = data.currentUserData ? {
//                 ...data.currentUserData,
//                 avatarUrl: getFullMediaUrl(data.currentUserData.avatarUrl),
//                 // Also process mediaUrl for each status if needed
//                 allActiveStatuses: data.currentUserData.allActiveStatuses.map((s: Status) => ({
//                     ...s,
//                     mediaUrl: getFullMediaUrl(s.mediaUrl)
//                 }))
//             } : null;

//             const processedConnections = data.connectionsWithStatuses.map((conn: ConnectionActivityData) => ({
//                 ...conn,
//                 avatarUrl: getFullMediaUrl(conn.avatarUrl),
//                 latestActiveStatusPreview: conn.latestActiveStatusPreview ? {
//                     ...conn.latestActiveStatusPreview,
//                     mediaUrl: getFullMediaUrl(conn.latestActiveStatusPreview.mediaUrl)
//                 } : undefined
//             }));


//             // Update states with the new response structure
//             setCurrentUserOwnStatuses(processedCurrentUser);
//             setAllConnections(processedConnections);

//         } catch (err) {
//             console.error('[ActivityBar:fetchActivityBarData] Error during data fetch:', err);
//             setError(err instanceof Error ? err.message : 'Could not load stories.');
//             setCurrentUserOwnStatuses(null);
//             setAllConnections([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [userId, getIdToken, getFullMediaUrl]);

//     // Main useEffect to orchestrate fetching
//     useEffect(() => {
//         // This effect runs on component mount and when userId or statusRefreshKey changes
//         if (userId) {
//             fetchActivityBarData();
//         } else {
//             // If userId is null (e.g., not logged in), clear states
//             setLoading(false);
//             setCurrentUserOwnStatuses(null);
//             setAllConnections([]);
//         }
//     }, [userId, statusRefreshKey, fetchActivityBarData]);


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

//             const responseData = await response.json();
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

//     // Function to fetch ALL statuses for a specific user (used when clicking a connection's story bubble)
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
//                 console.error(`[ActivityBar:fetchAllUserStatuses] Failed to fetch statuses for user ${targetUserId}:`, errorData);
//                 throw new Error(errorData.message || 'Failed to fetch user statuses.');
//             }
//             const statuses: Status[] = await response.json();
//             // Ensure media URLs are full URLs
//             return statuses.map(s => ({
//                 ...s,
//                 mediaUrl: getFullMediaUrl(s.mediaUrl)
//             }));
//         } catch (err) {
//             console.error(`[ActivityBar:fetchAllUserStatuses] Error fetching all statuses for user ${targetUserId}:`, err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses.');
//             return [];
//         }
//     }, [getIdToken, getFullMediaUrl]);

//     // Function to fetch user details for viewedBy list (for StatusViewer)
//     // This function is now correctly calling the /api/users/many endpoint
//     const fetchUserDetails = useCallback(async (userIds: string[]): Promise<User[]> => {
//         if (!userIds || userIds.length === 0) {
//             console.warn('[ActivityBar:fetchUserDetails] No user IDs provided for fetching details.');
//             return [];
//         }

//         console.log('[ActivityBar:fetchUserDetails] Fetching details for IDs:', userIds);
//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 console.error('[ActivityBar:fetchUserDetails] Authentication token not available. Cannot fetch user details.');
//                 throw new Error('Authentication required to fetch user details.');
//             }

//             const response = await fetch(`${API_BASE_URL}/users/many`, { // Correct endpoint
//                 method: 'POST', // Correct method for sending array in body
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ userIds }), // Correct body format
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'No error message from server', status: response.status }));
//                 console.error(`[ActivityBar:fetchUserDetails] Server responded with an error (${response.status}):`, errorData);
//                 throw new Error(errorData.message || `Failed to fetch user details (Status: ${response.status}).`);
//             }

//             const fetchedUsers: User[] = await response.json(); // Backend directly returns an array of User objects
//             console.log('[ActivityBar:fetchUserDetails] Successfully fetched details for users:', fetchedUsers);

//             // Apply getFullMediaUrl to each fetched user's avatarUrl
//             const formattedUsers = fetchedUsers.map(user => ({
//                 ...user,
//                 avatarUrl: getFullMediaUrl(user.avatarUrl),
//             }));

//             return formattedUsers;
//         } catch (err) {
//             console.error('[ActivityBar:fetchUserDetails] Error fetching user details:', err);
//             // Re-throw the error so the calling function (toggleViewedByDropdown) can catch it
//             throw err;
//         }
//     }, [getIdToken, getFullMediaUrl]); // Add getFullMediaUrl to dependencies


//     const handleStatusMarkAsViewed = useCallback(async (statusId: string) => {
//         if (!userId) {
//             console.warn("[ActivityBar:handleStatusMarkAsViewed] Cannot mark status as viewed: Current user's MongoDB ID not available.");
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to mark status as viewed.');

//             // Only mark as viewed if it's not your own status
//             if (viewingUserStatuses?.user._id !== userId) {
//                 console.log(`[ActivityBar:handleStatusMarkAsViewed] Marking status ${statusId} as viewed by ${userId}`);
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
//                 }
//             } else {
//                 console.log(`[ActivityBar:handleStatusMarkAsViewed] Not marking own status (${statusId}) as viewed.`);
//             }
//         } catch (err) {
//             console.error('[ActivityBar:handleStatusMarkAsViewed] Error marking status as viewed:', err);
//         }
//     }, [userId, getIdToken, viewingUserStatuses]);


//     const handleUserClickToViewStatuses = useCallback(async (userClicked: CurrentUserActivityData | ConnectionActivityData) => {
//         console.log(`[ActivityBar:handleUserClickToViewStatuses] Clicked user: ${userClicked.name} (ID: ${userClicked._id}).`);

//         let statusesToPassToViewer: Status[] = [];
//         let userForViewer: CurrentUserActivityData | ConnectionActivityData = userClicked;

//         // Determine if the clicked user is the current authenticated user
//         if (userClicked._id === userId && currentUserOwnStatuses) {
//             // If it's the current user, use the pre-fetched allActiveStatuses
//             statusesToPassToViewer = currentUserOwnStatuses.allActiveStatuses;
//             userForViewer = currentUserOwnStatuses; // Ensure it's the full CurrentUserActivityData
//             console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening YOUR statuses:`, statusesToPassToViewer);
//         } else {
//             // If it's a connection, fetch all their statuses via a separate API call
//             try {
//                 setLoading(true);
//                 statusesToPassToViewer = await fetchAllUserStatuses(userClicked._id);
//                 userForViewer = userClicked; // Use the connection data passed initially
//                 console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening ${userClicked.name}'s statuses:`, statusesToPassToViewer);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         if (statusesToPassToViewer.length > 0) {
//             setViewingUserStatuses({ user: userForViewer, statuses: statusesToPassToViewer });
//             console.log(`[ActivityBar:handleUserClickToViewStatuses] Opening StatusViewer for ${userForViewer.name} with ${statusesToPassToViewer.length} statuses.`);
//         } else {
//             alert(`No active statuses found for ${userClicked.name}.`);
//             setViewingUserStatuses(null);
//         }
//     }, [userId, currentUserOwnStatuses, fetchAllUserStatuses]);


//     // Renders a single user's story bubble
//     const renderUserItem = (user: CurrentUserActivityData | ConnectionActivityData) => {
//         // Use `hasActiveStatus` property to determine if the border should be blue (active)
//         const hasActiveStatus = user.hasActiveStatus;

//         return (
//             <li
//                 key={user._id}
//                 className="flex flex-col items-center space-y-1 ml-1 w-auto cursor-pointer hide-scrollbar"
//                 onClick={() => handleUserClickToViewStatuses(user)}
//             >
//                 <div className="relative">
//                     <img
//                         // For current user, use their avatarUrl directly. For connections, it's also available.
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className={`w-14 h-14 rounded-full object-cover border-2 ${hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                             }`}
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl; // Fallback to default avatar
//                         }}
//                     />
//                     {hasActiveStatus && (
//                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                     )}
//                 </div>
//                 <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                     {user._id === userId ? 'You' : user.name}
//                 </span>
//             </li>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-[50vh] bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-2">
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
//                     {[1, 2, 3, 4, 5].map(i => ( // Show more skeletons for better loading visual
//                         <div key={i} className="flex flex-col items-center space-y-1 min-w-[80px]">
//                             <Skeleton circle width={56} height={56} />
//                             <Skeleton width={40} height={10} />
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2 hide-scrollbar"> {/* Added hide-scrollbar for cleaner look */}
//                     {/* Render current user's status first IF currentUserOwnStatuses exists and has any active status */}
//                     {currentUserOwnStatuses && currentUserOwnStatuses.hasActiveStatus && renderUserItem(currentUserOwnStatuses)}

//                     {/* Then render other connections who have active statuses */}
//                     {allConnections.filter(conn => conn.hasActiveStatus).map(renderUserItem)}
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
//                     currentUserData={currentUserOwnStatuses} // Pass current user's full data for comparison
//                     getFullMediaUrl={getFullMediaUrl}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     markAsViewed={handleStatusMarkAsViewed}
//                     fetchUserDetails={fetchUserDetails}
//                     onDeleteStatus={handleDeleteStatus}
//                 />
//             )} 
//             <hr className='text-gray-300'/>
//             {/* chat section */}
//             <div>

//             </div>
//         </div>
//     );
// };

// export default ActivityBar;





// client/components/ActivityBar.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthProvider'; // Adjust path if necessary
import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plus } from 'lucide-react';
import UploadModal from './UploadModal'; // Adjust path if necessary
import StatusViewer from './StatusViewer'; // Import the new StatusViewer component
import { User } from './StatusViewer'; // Assuming User interface is defined and exported from StatusViewer.tsx or a types file
import ChatList from './ChatList'; // Import the new ChatList component
import ChatWindow from './ChatWindow'; // Import the new ChatWindow component


// Ensure these are correctly set in your .env.local file
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// Using process.env.NEXT_PUBLIC_BACKEND_URL for media as well,
// as your backend serves static files directly from the base URL + /uploads or /avatars
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
    const { getIdToken, user: authUser } = useAuth(); // `authUser` might be useful for current user's Firebase UID if needed

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

    // --- New Chat States ---
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
    const [chatRefreshKey, setChatRefreshKey] = useState(0); // Key to trigger chat list refresh
    // --- End New Chat States ---


    // Use a memoized value for the default avatar URL for consistent access
    const defaultAvatarUrl = React.useMemo(() => {
        // Adjust this path based on where your default userLogo.png is publicly accessible
        // If it's in public/images or public/avatars, use /images/userLogo.png or /avatars/userLogo.png
        // If it's directly from 'defaultAvatar', then `defaultAvatar.src` is correct for Next.js image imports.
        return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
    }, []);

    // Function to handle status deletion
    const handleDeleteStatus = useCallback(async (statusId: string) => {
        console.log(`[ActivityBar:handleDeleteStatus] Attempting to delete status: ${statusId}`);
        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error('Authentication required to delete status.');
            }

            const response = await fetch(`${API_BASE_URL}/status/${statusId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[ActivityBar:handleDeleteStatus] Failed to delete status:', errorData);
                throw new Error(errorData.message || 'Failed to delete status.');
            }

            console.log(`[ActivityBar:handleDeleteStatus] Status ${statusId} deleted successfully.`);
            // Refresh statuses after deletion
            setStatusRefreshKey(prev => prev + 1);
            // Close the viewer if the deleted status was the one being viewed
            if (viewingUserStatuses) {
                const remainingStatuses = viewingUserStatuses.statuses.filter(s => s._id !== statusId);
                if (remainingStatuses.length === 0) {
                    setViewingUserStatuses(null); // Close viewer if no statuses left
                } else {
                    setViewingUserStatuses(prev => ({
                        ...prev!,
                        statuses: remainingStatuses,
                    }));
                }
            }
        } catch (err) {
            console.error('[ActivityBar:handleDeleteStatus] Error deleting status:', err);
            setError(err instanceof Error ? err.message : 'Error deleting status.');
        }
    }, [getIdToken, viewingUserStatuses]);


    // Helper function to get full URL for media (avatars, status media, chat media)
    const getFullMediaUrl = useCallback((relativePath?: string): string => {
        if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            // If relativePath is null/undefined or already an absolute URL (e.g., Google photo)
            return relativePath || defaultAvatarUrl;
        }

        // Ensure MEDIA_BASE_URL does not have a trailing slash
        const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;

        // Normalize slashes to forward slashes (important for Windows paths)
        const normalizedPath = relativePath.replace(/\\/g, '/');

        // *** THE CRUCIAL CHANGE FOR URL ENCODING ***
        // We need to encode the path *segment* that might contain special characters (like spaces).
        // `encodeURIComponent` is generally safer for path segments.
        // We'll split the path, encode each segment, then rejoin.
        const pathSegments = normalizedPath.split('/').map(segment => encodeURIComponent(segment));

        // Rejoin and ensure a leading slash if it's a relative path from root
        let finalPath = pathSegments.join('/');
        if (!finalPath.startsWith('/')) {
            finalPath = `/${finalPath}`;
        }
        
        // This log helps debug the constructed URL
        console.log(`[getFullMediaUrl] Original: ${relativePath}, Encoded: ${finalPath}, Full: ${baseUrl}${finalPath}`);

        return `${baseUrl}${finalPath}`;
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

            // Apply getFullMediaUrl to avatarUrl for currentUserData and connectionsWithStatuses
            const processedCurrentUser = data.currentUserData ? {
                ...data.currentUserData,
                avatarUrl: getFullMediaUrl(data.currentUserData.avatarUrl),
                // Also process mediaUrl for each status if needed
                allActiveStatuses: data.currentUserData.allActiveStatuses.map((s: Status) => ({
                    ...s,
                    mediaUrl: getFullMediaUrl(s.mediaUrl)
                }))
            } : null;

            const processedConnections = data.connectionsWithStatuses.map((conn: ConnectionActivityData) => ({
                ...conn,
                avatarUrl: getFullMediaUrl(conn.avatarUrl),
                latestActiveStatusPreview: conn.latestActiveStatusPreview ? {
                    ...conn.latestActiveStatusPreview,
                    mediaUrl: getFullMediaUrl(conn.latestActiveStatusPreview.mediaUrl)
                } : undefined
            }));


            // Update states with the new response structure
            setCurrentUserOwnStatuses(processedCurrentUser);
            setAllConnections(processedConnections);

        } catch (err) {
            console.error('[ActivityBar:fetchActivityBarData] Error during data fetch:', err);
            setError(err instanceof Error ? err.message : 'Could not load stories.');
            setCurrentUserOwnStatuses(null);
            setAllConnections([]);
        } finally {
            setLoading(false);
        }
    }, [userId, getIdToken, getFullMediaUrl]);

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
            const statuses: Status[] = await response.json();
            // Ensure media URLs are full URLs
            return statuses.map(s => ({
                ...s,
                mediaUrl: getFullMediaUrl(s.mediaUrl)
            }));
        } catch (err) {
            console.error(`[ActivityBar:fetchAllUserStatuses] Error fetching all statuses for user ${targetUserId}:`, err);
            setError(err instanceof Error ? err.message : 'Failed to fetch statuses.');
            return [];
        }
    }, [getIdToken, getFullMediaUrl]);

    // Function to fetch user details for viewedBy list (for StatusViewer)
    // This function is now correctly calling the /api/users/many endpoint
    const fetchUserDetails = useCallback(async (userIds: string[]): Promise<User[]> => {
        if (!userIds || userIds.length === 0) {
            console.warn('[ActivityBar:fetchUserDetails] No user IDs provided for fetching details.');
            return [];
        }

        console.log('[ActivityBar:fetchUserDetails] Fetching details for IDs:', userIds);
        try {
            const token = await getIdToken();
            if (!token) {
                console.error('[ActivityBar:fetchUserDetails] Authentication token not available. Cannot fetch user details.');
                throw new Error('Authentication required to fetch user details.');
            }

            const response = await fetch(`${API_BASE_URL}/users/many`, { // Correct endpoint
                method: 'POST', // Correct method for sending array in body
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds }), // Correct body format
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'No error message from server', status: response.status }));
                console.error(`[ActivityBar:fetchUserDetails] Server responded with an error (${response.status}):`, errorData);
                throw new Error(errorData.message || `Failed to fetch user details (Status: ${response.status}).`);
            }

            const fetchedUsers: User[] = await response.json(); // Backend directly returns an array of User objects
            console.log('[ActivityBar:fetchUserDetails] Successfully fetched details for users:', fetchedUsers);

            // Apply getFullMediaUrl to each fetched user's avatarUrl
            const formattedUsers = fetchedUsers.map(user => ({
                ...user,
                avatarUrl: getFullMediaUrl(user.avatarUrl),
            }));

            return formattedUsers;
        } catch (err) {
            console.error('[ActivityBar:fetchUserDetails] Error fetching user details:', err);
            // Re-throw the error so the calling function (toggleViewedByDropdown) can catch it
            throw err;
        }
    }, [getIdToken, getFullMediaUrl]); // Add getFullMediaUrl to dependencies


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
                userForViewer = userClicked; // Use the connection data passed initially
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
                className="flex flex-col items-center space-y-1 ml-1 w-auto cursor-pointer hide-scrollbar"
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

    // --- Chat related handlers ---
    const handleSelectChatUser = useCallback((user: User) => {
        setSelectedChatUser(user);
        setIsChatWindowOpen(true);
        console.log(`[ActivityBar] Selected chat user: ${user.name} (ID: ${user._id})`);
    }, []);

    const handleCloseChatWindow = useCallback(() => {
        setIsChatWindowOpen(false);
        setSelectedChatUser(null);
        setChatRefreshKey(prev => prev + 1); // Refresh chat list after closing window
    }, []);

    // This callback is passed to ChatWindow and called when a message is sent
    const handleChatActivity = useCallback(() => {
        setChatRefreshKey(prev => prev + 1); // Trigger ChatList to re-fetch conversations
    }, []);
    // --- End Chat related handlers ---

    return (
        // Added flex flex-col and h-full to make ActivityBar take full height
        // and allow its children to grow/shrink with flex properties.
        <div className="flex flex-col flex-shrink-0 w-[50vh] bg-white rounded-lg shadow-md p-4 h-full">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Stories</h2>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
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
                <div className="flex space-x-4 overflow-x-auto py-2 hide-scrollbar">
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
                    onDeleteStatus={handleDeleteStatus}
                />
            )}
            {/* Chat section - Made this div flex-1 to take remaining vertical space */}
            <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for flex items to shrink */}
                {/* Chat List Component */}
                {userId && ( // Only render chat list if userId is available
                    // This div will make the ChatList scrollable if its content exceeds its height
                    <div className="h-full overflow-y-auto pr-2 hide-scrollbar"> {/* Added custom-scrollbar for better aesthetics */}
                        <ChatList
                            userId={userId}
                            getFullMediaUrl={getFullMediaUrl}
                            defaultAvatarUrl={defaultAvatarUrl}
                            onSelectChat={handleSelectChatUser}
                            currentSelectedChatUser={selectedChatUser}
                        />
                    </div>
                )}
            </div>

            {/* Chat Window Modal */}
            {isChatWindowOpen && selectedChatUser && userId && (
                <ChatWindow
                    isOpen={isChatWindowOpen}
                    onClose={handleCloseChatWindow}
                    chatUser={selectedChatUser}
                    currentUserId={userId}
                    getFullMediaUrl={getFullMediaUrl}
                    defaultAvatarUrl={defaultAvatarUrl}
                    onMessageSent={handleChatActivity} // Prop to refresh chat list after sending
                    // socket={socket}
                />
            )}
        </div>
    );
};

export default ActivityBar;