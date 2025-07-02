// 'use client';

// import React, { useEffect, useState, useCallback } from 'react';
// import { useAuth } from './AuthProvider'; // Adjust path if necessary
// import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus, X } from 'lucide-react'; // X icon import kiya hai
// import UploadModal from './UploadModal'; // Adjust path if necessary
// import StatusViewer from './StatusViewer'; // Import the new StatusViewer component
// import { User } from './StatusViewer'; // Assuming User interface is defined and exported from StatusViewer.tsx or a types file
// import ChatList from './ChatList'; // Import the new ChatList component
// import ChatWindow from './ChatWindow'; // Import the new ChatWindow component


// // Ensure these are correctly set in your .env.local file
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'https://vartalaap-r36o.onrender.com';

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

// // Interface for a current user's data as returned by /api/status (currentUserData property)
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
//     className?: string; // Add this line to accept className
//     onCloseMobile?: () => void; // New prop: A function to call when the close button is clicked
// }

// const ActivityBar = ({ userId, className, onCloseMobile }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth();
//     const [isClosing, setIsClosing] = useState(false);

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

//     // --- New Chat States ---
//     const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
//     const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
//     const [chatRefreshKey, setChatRefreshKey] = useState(0); // Key to trigger chat list refresh
//     // --- End New Chat States ---


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


//     // Helper function to get full URL for media (avatars, status media, chat media)
//     const getFullMediaUrl = useCallback((relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath || defaultAvatarUrl;
//         }

//         const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;

//         const normalizedPath = relativePath.replace(/\\/g, '/');

//         const pathSegments = normalizedPath.split('/').map(segment => encodeURIComponent(segment));

//         let finalPath = pathSegments.join('/');
//         if (!finalPath.startsWith('/')) {
//             finalPath = `/${finalPath}`;
//         }

//         // Uncomment if you want debug logs here:
//         // console.log(`[getFullMediaUrl] Original: ${relativePath}, Encoded: ${finalPath}, Full: ${baseUrl}${finalPath}`);

//         return `${baseUrl}${finalPath}`;
//     }, [defaultAvatarUrl]);


//     // Function to fetch all activity bar data (current user's stories + connections' stories)
//     const fetchActivityBarData = useCallback(async () => {
//         // console.log(`[ActivityBar:fetchActivityBarData] called. Current userId prop: ${userId}`);

//         if (!userId) {
//             // console.log('[ActivityBar:fetchActivityBarData] userId prop is null/undefined. Cannot fetch activity data.');
//             setCurrentUserOwnStatuses(null);
//             setAllConnections([]);
//             setLoading(false);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
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
//                 throw new Error(errorData.message || 'Failed to fetch stories.');
//             }

//             const data = await response.json();

//             const processedCurrentUser = data.currentUserData ? {
//                 ...data.currentUserData,
//                 avatarUrl: getFullMediaUrl(data.currentUserData.avatarUrl),
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

//             setCurrentUserOwnStatuses(processedCurrentUser);
//             setAllConnections(processedConnections);

//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Could not load stories.');
//             setCurrentUserOwnStatuses(null);
//             setAllConnections([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [userId, getIdToken, getFullMediaUrl]);

//     // Main useEffect to orchestrate fetching
//     useEffect(() => {
//         if (userId) {
//             fetchActivityBarData();
//         } else {
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
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1); // Trigger re-fetch of all statuses to show the new one
//         } catch (err) {
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
//                 throw new Error(errorData.message || 'Failed to fetch user statuses.');
//             }
//             const statuses: Status[] = await response.json();
//             return statuses.map(s => ({
//                 ...s,
//                 mediaUrl: getFullMediaUrl(s.mediaUrl)
//             }));
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses.');
//             return [];
//         }
//     }, [getIdToken, getFullMediaUrl]);

//     // Function to fetch user details for viewedBy list (for StatusViewer)
//     const fetchUserDetails = useCallback(async (userIds: string[]): Promise<User[]> => {
//         if (!userIds || userIds.length === 0) {
//             // Avoid fetch if no user IDs given
//             return [];
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to fetch user details.');

//             const response = await fetch(`${API_BASE_URL}/users/many`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ userIds }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch user details.');
//             }

//             const fetchedUsers: User[] = await response.json();
//             // Apply full media URL to avatars
//             return fetchedUsers.map(user => ({
//                 ...user,
//                 avatarUrl: getFullMediaUrl(user.avatarUrl),
//             }));
//         } catch (err) {
//             throw err;
//         }
//     }, [getIdToken, getFullMediaUrl]);


//     const handleStatusMarkAsViewed = useCallback(async (statusId: string) => {
//         if (!userId) return;

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to mark status as viewed.');

//             // Only mark as viewed if it's not your own status
//             if (viewingUserStatuses?.user._id !== userId) {
//                 const response = await fetch(`${API_BASE_URL}/status/view/${statusId}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!response.ok) {
//                     const errorText = await response.text();
//                     throw new Error(`Failed to mark status as viewed: ${errorText}`);
//                 }

//                 const data = await response.json();
//                 return data; // ✅ FIXED
//             }
//         } catch (err) {
//             console.error('Error marking status as viewed:', err);
//             return null;
//         }
//     }, [userId, getIdToken, viewingUserStatuses]);



//     // Handle user clicking on a user bubble to view statuses
//     const handleUserClickToViewStatuses = useCallback(async (userClicked: CurrentUserActivityData | ConnectionActivityData) => {
//         let statusesToPassToViewer: Status[] = [];
//         let userForViewer: CurrentUserActivityData | ConnectionActivityData = userClicked;

//         if (userClicked._id === userId && currentUserOwnStatuses) {
//             statusesToPassToViewer = currentUserOwnStatuses.allActiveStatuses;
//             userForViewer = currentUserOwnStatuses;
//         } else {
//             setLoading(true);
//             statusesToPassToViewer = await fetchAllUserStatuses(userClicked._id);
//             setLoading(false);
//         }

//         if (statusesToPassToViewer.length > 0) {
//             setViewingUserStatuses({ user: userForViewer, statuses: statusesToPassToViewer });
//         } else {
//             alert(`No active statuses found for ${userClicked.name}.`);
//             setViewingUserStatuses(null);
//         }
//     }, [userId, currentUserOwnStatuses, fetchAllUserStatuses]);



//     // --- Below is the renderUserItem function ---
//     const renderUserItem = (user: CurrentUserActivityData | ConnectionActivityData) => {
//         const hasActiveStatus = user.hasActiveStatus;

//         return (
//             <li
//                 key={user._id}
//                 className="flex flex-col items-center space-y-1 ml-1 w-auto cursor-pointer hide-scrollbar"
//                 onClick={() => handleUserClickToViewStatuses(user)}
//             >
//                 <div className="relative">
//                     <img
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className={`w-14 h-14 rounded-full object-cover border-2 ${hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl;
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

//     // Chat related handlers
//     const handleSelectChatUser = useCallback((user: User) => {
//         setSelectedChatUser(user);
//         setIsChatWindowOpen(true);
//     }, []);

//     const handleCloseChatWindow = useCallback(() => {
//         setIsChatWindowOpen(false);
//         setSelectedChatUser(null);
//         setChatRefreshKey(prev => prev + 1);
//     }, []);

//     const handleChatActivity = useCallback(() => {
//         setChatRefreshKey(prev => prev + 1);
//     }, []);

//     const handleCloseClick = () => {
//         setIsClosing(true);
//         setTimeout(() => {
//             onCloseMobile?.();
//         }, 300);
//     };

//     return (
//         <div
//             className={`flex flex-col flex-shrink-0 w-[50vh] bg-white rounded-lg shadow-md p-4 h-full transition-transform duration-300 ${isClosing ? 'slide-down' : 'slide-down'} ${className || ''}`}
//         >
//             <div className="flex items-center justify-end mb-2 relative">
//                 <h2 className="text-lg font-semibold absolute left-0">Stories</h2>
//                 <div className="flex items-center space-x-2">
//                     <button
//                         onClick={() => setIsUploadModalOpen(true)}
//                         className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
//                         aria-label="Add new status"
//                     >
//                         <Plus size={20} />
//                     </button>
//                     <button
//                         onClick={handleCloseClick}
//                         className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer lg:hidden slide-down"
//                         aria-label="Close activity bar"
//                     >
//                         <X size={20} />
//                     </button>
//                 </div>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     <strong>Error:</strong> {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2 hide-scrollbar">
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
//             {/* Chat section - flex-1 takes remaining vertical space, min-h-0 allows shrinking */}
//             <div className="flex-1 min-h-0 flex flex-col">
//                 {/* Chat List Component */}
//                 {userId && ( // Only render chat list if userId is available
//                     // This div will make the ChatList scrollable if its content exceeds its height
//                     <div className="h-full overflow-y-auto pr-2 hide-scrollbar">
//                         <ChatList
//                             userId={userId}
//                             getFullMediaUrl={getFullMediaUrl}
//                             defaultAvatarUrl={defaultAvatarUrl}
//                             onSelectChat={handleSelectChatUser}
//                             currentSelectedChatUser={selectedChatUser}
//                         />
//                     </div>
//                 )}
//             </div>

//             {/* Chat Window Modal */}
//             {isChatWindowOpen && selectedChatUser && userId && (
//                 <ChatWindow
//                     isOpen={isChatWindowOpen}
//                     onClose={handleCloseChatWindow}
//                     chatUser={selectedChatUser}
//                     currentUserId={userId}
//                     getFullMediaUrl={getFullMediaUrl}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     onMessageSent={handleChatActivity}
//                 />
//             )}
//         </div>
//     );
// };

// export default ActivityBar;





'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import defaultAvatar from '../app/assets/userLogo.png';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plus, X } from 'lucide-react';
import UploadModal from './UploadModal';
import StatusViewer from './StatusViewer';
import { User } from './StatusViewer';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'https://vartalaap-r36o.onrender.com';

interface Status {
    _id: string;
    userId: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    viewedBy: string[];
    visibility: 'public' | 'followers';
}

interface CurrentUserActivityData {
    _id: string;
    name: string;
    avatarUrl?: string;
    hasActiveStatus: boolean;
    allActiveStatuses: Status[];
}

interface ConnectionActivityData {
    _id: string;
    name: string;
    avatarUrl?: string;
    hasActiveStatus: boolean;
    latestActiveStatusPreview?: {
        _id: string;
        mediaType: 'image' | 'video';
        mediaUrl: string;
        createdAt: string;
    };
}

interface ActivityBarProps {
    userId: string | null;
    className?: string;
    onCloseMobile?: () => void;
}

const ActivityBar = ({ userId, className, onCloseMobile }: ActivityBarProps) => {
    const { getIdToken, user: authUser } = useAuth();
    const [isClosing, setIsClosing] = useState(false);

    const [currentUserOwnStatuses, setCurrentUserOwnStatuses] = useState<CurrentUserActivityData | null>(null);
    const [allConnections, setAllConnections] = useState<ConnectionActivityData[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const [viewingUserStatuses, setViewingUserStatuses] = useState<{ user: CurrentUserActivityData | ConnectionActivityData; statuses: Status[] } | null>(null);
    const [statusRefreshKey, setStatusRefreshKey] = useState(0);

    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
    const [chatRefreshKey, setChatRefreshKey] = useState(0);

    const defaultAvatarUrl = React.useMemo(() => {
        return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
    }, []);

    // ✅ FIXED: Function to update local status views
    const updateStatusViews = useCallback((statusId: string, newViewedBy: string[]) => {
        // Update currentUserOwnStatuses if it contains the status
        setCurrentUserOwnStatuses(prev => {
            if (!prev) return prev;
            
            const updatedStatuses = prev.allActiveStatuses.map(status => 
                status._id === statusId 
                    ? { ...status, viewedBy: newViewedBy }
                    : status
            );
            
            return { ...prev, allActiveStatuses: updatedStatuses };
        });

        // Update viewingUserStatuses if it contains the status
        setViewingUserStatuses(prev => {
            if (!prev) return prev;
            
            const updatedStatuses = prev.statuses.map(status =>
                status._id === statusId
                    ? { ...status, viewedBy: newViewedBy }
                    : status
            );
            
            return { ...prev, statuses: updatedStatuses };
        });
    }, []);

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
            setStatusRefreshKey(prev => prev + 1);
            
            if (viewingUserStatuses) {
                const remainingStatuses = viewingUserStatuses.statuses.filter(s => s._id !== statusId);
                if (remainingStatuses.length === 0) {
                    setViewingUserStatuses(null);
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

    const getFullMediaUrl = useCallback((relativePath?: string): string => {
        if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath || defaultAvatarUrl;
        }

        const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;
        const normalizedPath = relativePath.replace(/\\/g, '/');
        const pathSegments = normalizedPath.split('/').map(segment => encodeURIComponent(segment));
        let finalPath = pathSegments.join('/');
        if (!finalPath.startsWith('/')) {
            finalPath = `/${finalPath}`;
        }

        return `${baseUrl}${finalPath}`;
    }, [defaultAvatarUrl]);

    const fetchActivityBarData = useCallback(async () => {
        if (!userId) {
            setCurrentUserOwnStatuses(null);
            setAllConnections([]);
            setLoading(false);
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
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
                throw new Error(errorData.message || 'Failed to fetch stories.');
            }

            const data = await response.json();

            const processedCurrentUser = data.currentUserData ? {
                ...data.currentUserData,
                avatarUrl: getFullMediaUrl(data.currentUserData.avatarUrl),
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

            setCurrentUserOwnStatuses(processedCurrentUser);
            setAllConnections(processedConnections);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load stories.');
            setCurrentUserOwnStatuses(null);
            setAllConnections([]);
        } finally {
            setLoading(false);
        }
    }, [userId, getIdToken, getFullMediaUrl]);

    useEffect(() => {
        if (userId) {
            fetchActivityBarData();
        } else {
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
                throw new Error(errorData.message || 'Status upload failed.');
            }

            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setVisibility('public');
            setStatusRefreshKey(prev => prev + 1);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

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
                throw new Error(errorData.message || 'Failed to fetch user statuses.');
            }
            const statuses: Status[] = await response.json();
            return statuses.map(s => ({
                ...s,
                mediaUrl: getFullMediaUrl(s.mediaUrl)
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch statuses.');
            return [];
        }
    }, [getIdToken, getFullMediaUrl]);

    const fetchUserDetails = useCallback(async (userIds: string[]): Promise<User[]> => {
        if (!userIds || userIds.length === 0) {
            return [];
        }

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required to fetch user details.');

            const response = await fetch(`${API_BASE_URL}/users/many`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch user details.');
            }

            const fetchedUsers: User[] = await response.json();
            return fetchedUsers.map(user => ({
                ...user,
                avatarUrl: getFullMediaUrl(user.avatarUrl),
            }));
        } catch (err) {
            throw err;
        }
    }, [getIdToken, getFullMediaUrl]);

    // ✅ FIXED: Updated handleStatusMarkAsViewed to update local state
    const handleStatusMarkAsViewed = useCallback(async (statusId: string) => {
        if (!userId) return;

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required to mark status as viewed.');

            // Only mark as viewed if it's not your own status
            if (viewingUserStatuses?.user._id !== userId) {
                const response = await fetch(`${API_BASE_URL}/status/view/${statusId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to mark status as viewed: ${errorText}`);
                }

                const data = await response.json();
                
                // ✅ FIXED: Update local state with new viewedBy array
                if (data.updatedStatus && data.updatedStatus.viewedBy) {
                    updateStatusViews(statusId, data.updatedStatus.viewedBy);
                }
                
                return data;
            }
        } catch (err) {
            console.error('Error marking status as viewed:', err);
            return null;
        }
    }, [userId, getIdToken, viewingUserStatuses, updateStatusViews]);

    const handleUserClickToViewStatuses = useCallback(async (userClicked: CurrentUserActivityData | ConnectionActivityData) => {
        let statusesToPassToViewer: Status[] = [];
        let userForViewer: CurrentUserActivityData | ConnectionActivityData = userClicked;

        if (userClicked._id === userId && currentUserOwnStatuses) {
            statusesToPassToViewer = currentUserOwnStatuses.allActiveStatuses;
            userForViewer = currentUserOwnStatuses;
        } else {
            setLoading(true);
            statusesToPassToViewer = await fetchAllUserStatuses(userClicked._id);
            setLoading(false);
        }

        if (statusesToPassToViewer.length > 0) {
            setViewingUserStatuses({ user: userForViewer, statuses: statusesToPassToViewer });
        } else {
            alert(`No active statuses found for ${userClicked.name}.`);
            setViewingUserStatuses(null);
        }
    }, [userId, currentUserOwnStatuses, fetchAllUserStatuses]);

    const renderUserItem = (user: CurrentUserActivityData | ConnectionActivityData) => {
        const hasActiveStatus = user.hasActiveStatus;

        return (
            <li
                key={user._id}
                className="flex flex-col items-center space-y-1 ml-1 w-auto cursor-pointer hide-scrollbar"
                onClick={() => handleUserClickToViewStatuses(user)}
            >
                <div className="relative">
                    <img
                        src={getFullMediaUrl(user.avatarUrl)}
                        alt={user.name}
                        className={`w-14 h-14 rounded-full object-cover border-2 ${hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatarUrl;
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

    const handleSelectChatUser = useCallback((user: User) => {
        setSelectedChatUser(user);
        setIsChatWindowOpen(true);
    }, []);

    const handleCloseChatWindow = useCallback(() => {
        setIsChatWindowOpen(false);
        setSelectedChatUser(null);
        setChatRefreshKey(prev => prev + 1);
    }, []);

    const handleChatActivity = useCallback(() => {
        setChatRefreshKey(prev => prev + 1);
    }, []);

    const handleCloseClick = () => {
        setIsClosing(true);
        setTimeout(() => {
            onCloseMobile?.();
        }, 300);
    };

    return (
        <div
            className={`flex flex-col flex-shrink-0 w-[50vh] bg-white rounded-lg shadow-md p-4 h-full transition-transform duration-300 ${isClosing ? 'slide-down' : 'slide-down'} ${className || ''}`}
        >
            <div className="flex items-center justify-end mb-2 relative">
                <h2 className="text-lg font-semibold absolute left-0">Stories</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        aria-label="Add new status"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={handleCloseClick}
                        className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer lg:hidden slide-down"
                        aria-label="Close activity bar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading ? (
                <div className="flex space-x-4 overflow-x-auto py-2 hide-scrollbar">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col items-center space-y-1 min-w-[80px]">
                            <Skeleton circle width={56} height={56} />
                            <Skeleton width={40} height={10} />
                        </div>
                    ))}
                </div>
            ) : (
                <ul className="flex space-x-4 overflow-x-auto py-2 hide-scrollbar">
                    {currentUserOwnStatuses && currentUserOwnStatuses.hasActiveStatus && renderUserItem(currentUserOwnStatuses)}
                    {allConnections.filter(conn => conn.hasActiveStatus).map(renderUserItem)}
                </ul>
            )}

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

            {viewingUserStatuses && (
                <StatusViewer
                    isOpen={!!viewingUserStatuses}
                    onClose={() => {
                        setViewingUserStatuses(null);
                        // ✅ FIXED: Refresh data when closing viewer to ensure latest view counts
                        setStatusRefreshKey(prev => prev + 1);
                    }}
                    user={viewingUserStatuses.user}
                    statuses={viewingUserStatuses.statuses}
                    currentUserData={currentUserOwnStatuses}
                    getFullMediaUrl={getFullMediaUrl}
                    defaultAvatarUrl={defaultAvatarUrl}
                    markAsViewed={handleStatusMarkAsViewed}
                    fetchUserDetails={fetchUserDetails}
                    onDeleteStatus={handleDeleteStatus}
                />
            )}

            <div className="flex-1 min-h-0 flex flex-col">
                {userId && (
                    <div className="h-full overflow-y-auto pr-2 hide-scrollbar">
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

            {isChatWindowOpen && selectedChatUser && userId && (
                <ChatWindow
                    isOpen={isChatWindowOpen}
                    onClose={handleCloseChatWindow}
                    chatUser={selectedChatUser}
                    currentUserId={userId}
                    getFullMediaUrl={getFullMediaUrl}
                    defaultAvatarUrl={defaultAvatarUrl}
                    onMessageSent={handleChatActivity}
                />
            )}
        </div>
    );
};

export default ActivityBar;