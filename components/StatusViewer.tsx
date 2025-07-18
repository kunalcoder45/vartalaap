// // // // client/components/StatusViewer.tsx
// // // 'use client';

// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
// // // import Image from 'next/image';

// // // // Assuming this DeleteConfirmationModal is exactly as provided by you
// // // // client/components/DeleteConfirmationModal.tsx
// // // interface DeleteConfirmationModalProps {
// // //     message: string;
// // //     onConfirm: () => void;
// // //     onCancel: () => void;
// // //     title?: string;
// // // }

// // // const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
// // //     message,
// // //     onConfirm,
// // //     onCancel,
// // //     title = 'Confirm Deletion',
// // // }) => {
// // //     return (
// // //         // This outer div for the confirmation modal also correctly centers
// // //         <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// // //             <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden transform transition-opacity duration-300 ease-out animate-scale-in">
// // //                 {/* ... confirmation modal content ... */}
// // //                 {title && (
// // //                     <div className="px-6 py-4 text-center">
// // //                         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// // //                     </div>
// // //                 )}

// // //                 {/* Message */}
// // //                 <div className="px-6 py-2 text-center">
// // //                     <p className="text-gray-700 text-sm">{message}</p>
// // //                 </div>

// // //                 {/* Buttons */}
// // //                 <div className="mt-4 flex border-t border-gray-200">
// // //                     <button
// // //                         onClick={onCancel}
// // //                         className="flex-1 px-4 py-3 text-blue-600 font-medium text-center border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
// // //                     >
// // //                         Cancel
// // //                     </button>
// // //                     <button
// // //                         onClick={onConfirm}
// // //                         className="flex-1 px-4 py-3 text-red-600 font-medium text-center hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
// // //                     >
// // //                         Delete
// // //                     </button>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // };
// // // // END DeleteConfirmationModal component (pasted here as per your request)

// // // // Re-using interfaces from ActivityBar, or define them globally if preferred
// // // interface Status {
// // //     _id: string;
// // //     userId: string;
// // //     mediaType: 'image' | 'video';
// // //     mediaUrl: string;
// // //     createdAt: string;
// // //     viewedBy: string[];
// // //     visibility: 'public' | 'followers';
// // // }

// // // export interface User {
// // //     _id: string;
// // //     name: string;
// // //     avatarUrl?: string;
// // //     // Add other user properties you might need
// // // }

// // // interface StatusViewerProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     user: { _id: string; name: string; avatarUrl?: string };
// // //     statuses: Status[];
// // //     currentUserData: { _id: string; name: string; avatarUrl?: string; allActiveStatuses: Status[] } | null;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     markAsViewed: (statusId: string) => Promise<void>;
// // //     fetchUserDetails: (userIds: string[]) => Promise<User[]>;
// // //     onDeleteStatus: (statusId: string) => Promise<void>; // This is the prop from ActivityBar
// // // }

// // // const StatusViewer: React.FC<StatusViewerProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     user,
// // //     statuses,
// // //     currentUserData,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     markAsViewed,
// // //     fetchUserDetails,
// // //     onDeleteStatus,
// // // }) => {
// // //     const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
// // //     const [progress, setProgress] = useState(0);
// // //     const [isPlaying, setIsPlaying] = useState(true); // For pause/play functionality
// // //     const [viewedByDropdownOpen, setViewedByDropdownOpen] = useState(false);
// // //     const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
// // //     const [fetchingViewedBy, setFetchingViewedBy] = useState(false);
// // //     const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
// // //     const videoRef = useRef<HTMLVideoElement>(null);

// // //     // --- NEW: Delete Modal State ---
// // //     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
// // //     // --- END NEW ---

// // //     const currentStatus = statuses[currentStatusIndex];
// // //     // Check if the user whose status is being viewed is the current logged-in user
// // //     const isOwnerOfCurrentStatus = currentUserData?._id === user._id;

// // //     const STATUS_VIEW_DURATION_MS = 5000; // 5 seconds for images, or video duration

// // //     // Reset state when modal opens/closes or statuses change
// // //     useEffect(() => {
// // //         if (isOpen) {
// // //             setCurrentStatusIndex(0);
// // //             setProgress(0);
// // //             setIsPlaying(true);
// // //             setViewedByDropdownOpen(false);
// // //             // Mark the first status as viewed immediately IF it's NOT the current user's own status
// // //             if (statuses.length > 0 && !isOwnerOfCurrentStatus) {
// // //                 markAsViewed(statuses[0]._id);
// // //             }
// // //         }
// // //     }, [isOpen, statuses, markAsViewed, isOwnerOfCurrentStatus]);

// // //     // Progress bar and status progression logic
// // //     useEffect(() => {
// // //         if (!isOpen || !isPlaying) {
// // //             if (progressIntervalRef.current) {
// // //                 clearInterval(progressIntervalRef.current);
// // //             }
// // //             return;
// // //         }

// // //         const duration = currentStatus?.mediaType === 'video' && videoRef.current ?
// // //             videoRef.current.duration * 1000 : STATUS_VIEW_DURATION_MS;

// // //         let startTime = Date.now();
// // //         if (progressIntervalRef.current) {
// // //             clearInterval(progressIntervalRef.current);
// // //         }

// // //         progressIntervalRef.current = setInterval(() => {
// // //             const elapsed = Date.now() - startTime;
// // //             const newProgress = (elapsed / duration) * 100;
// // //             setProgress(newProgress);

// // //             if (newProgress >= 100) {
// // //                 clearInterval(progressIntervalRef.current!);
// // //                 if (currentStatusIndex < statuses.length - 1) {
// // //                     setCurrentStatusIndex(prev => prev + 1);
// // //                     setProgress(0); // Reset progress for the next status
// // //                     startTime = Date.now(); // Reset start time for next status
// // //                     // Mark as viewed only if the status is NOT owned by the current user
// // //                     if (!isOwnerOfCurrentStatus) {
// // //                         markAsViewed(statuses[currentStatusIndex + 1]._id);
// // //                     }
// // //                 } else {
// // //                     onClose(); // Close viewer when all statuses are done
// // //                 }
// // //             }
// // //         }, 50); // Update every 50ms for smooth progress bar
// // //         return () => {
// // //             if (progressIntervalRef.current) {
// // //                 clearInterval(progressIntervalRef.current);
// // //             }
// // //         };
// // //     }, [isOpen, currentStatusIndex, statuses, isPlaying, currentStatus, markAsViewed, isOwnerOfCurrentStatus]);

// // //     // Handle video play/pause and progress synchronization
// // //     useEffect(() => {
// // //         const videoElement = videoRef.current;
// // //         if (videoElement && currentStatus?.mediaType === 'video') {
// // //             if (isPlaying) {
// // //                 videoElement.play().catch(e => console.error("Video play failed:", e));
// // //             } else {
// // //                 videoElement.pause();
// // //             }

// // //             const handleTimeUpdate = () => {
// // //                 const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
// // //                 setProgress(newProgress);
// // //             };
// // //             const handleEnded = () => {
// // //                 // Manually trigger next status when video ends
// // //                 if (currentStatusIndex < statuses.length - 1) {
// // //                     setCurrentStatusIndex(prev => prev + 1);
// // //                     setProgress(0);
// // //                     // Mark as viewed only if the status is NOT owned by the current user
// // //                     if (!isOwnerOfCurrentStatus) {
// // //                         markAsViewed(statuses[currentStatusIndex + 1]._id);
// // //                     }
// // //                 } else {
// // //                     onClose();
// // //                 }
// // //             };

// // //             videoElement.addEventListener('timeupdate', handleTimeUpdate);
// // //             videoElement.addEventListener('ended', handleEnded);

// // //             return () => {
// // //                 videoElement.removeEventListener('timeupdate', handleTimeUpdate);
// // //                 videoElement.removeEventListener('ended', handleEnded);
// // //             };
// // //         }
// // //     }, [currentStatus, isPlaying, currentStatusIndex, statuses, markAsViewed, isOwnerOfCurrentStatus]);

// // //     const goToNextStatus = useCallback(() => {
// // //         if (currentStatusIndex < statuses.length - 1) {
// // //             setCurrentStatusIndex(prev => prev + 1);
// // //             setProgress(0); // Reset progress for the new status
// // //             setIsPlaying(true); // Ensure playing
// // //             // Mark as viewed only if the status is NOT owned by the current user
// // //             if (!isOwnerOfCurrentStatus) {
// // //                 markAsViewed(statuses[currentStatusIndex + 1]._id);
// // //             }
// // //         } else {
// // //             onClose(); // Close if no more statuses
// // //         }
// // //     }, [currentStatusIndex, statuses, onClose, markAsViewed, isOwnerOfCurrentStatus]);

// // //     const goToPreviousStatus = useCallback(() => {
// // //         if (currentStatusIndex > 0) {
// // //             setCurrentStatusIndex(prev => prev - 1);
// // //             setProgress(0); // Reset progress
// // //             setIsPlaying(true); // Ensure playing
// // //         }
// // //     }, [currentStatusIndex]);

// // //     const togglePlayPause = useCallback(() => {
// // //         setIsPlaying(prev => !prev);
// // //     }, []);

// // //     const toggleViewedByDropdown = useCallback(async () => {
// // //         if (!currentStatus) return;
// // //         setViewedByDropdownOpen(prev => !prev);
// // //         if (!viewedByDropdownOpen && currentStatus.viewedBy.length > 0) {
// // //             setFetchingViewedBy(true);
// // //             try {
// // //                 const users = await fetchUserDetails(currentStatus.viewedBy);
// // //                 setViewedByUsers(users);
// // //             } catch (error) {
// // //                 console.error("Failed to fetch viewed by users:", error);
// // //                 setViewedByUsers([]); // Clear on error
// // //             } finally {
// // //                 setFetchingViewedBy(false);
// // //             }
// // //         }
// // //     }, [viewedByDropdownOpen, currentStatus, fetchUserDetails]);

// // //     // --- NEW: Delete Modal Handlers (executeDelete, handleCancelDelete) ---
// // //     const handleDeleteClick = useCallback((event: React.MouseEvent) => {
// // //         event.stopPropagation(); // Prevent status viewer's own click handler
// // //         if (currentStatus) {
// // //             setShowDeleteConfirmModal(true); // Open the delete confirmation modal
// // //             setIsPlaying(false); // Pause status when modal opens
// // //         }
// // //     }, [currentStatus]);

// // //     const handleConfirmDelete = useCallback(async () => {
// // //         if (currentStatus) {
// // //             setShowDeleteConfirmModal(false); // Close confirmation modal
// // //             // Call the onDeleteStatus prop received from ActivityBar
// // //             await onDeleteStatus(currentStatus._id);
// // //             // ActivityBar's onDeleteStatus will handle closing StatusViewer and refreshing
// // //         }
// // //     }, [currentStatus, onDeleteStatus]);

// // //     const handleCancelDelete = useCallback(() => {
// // //         setShowDeleteConfirmModal(false);
// // //         setIsPlaying(true); // Resume status if deletion cancelled
// // //     }, []);
// // //     // --- END NEW ---

// // //     if (!isOpen || !currentStatus) return null;

// // //     const userAvatar = getFullMediaUrl(user.avatarUrl);
// // //     const mediaSrc = getFullMediaUrl(currentStatus.mediaUrl);

// // //     return (
// // //         // This outer div creates the full-screen overlay and centers its content
// // //         <div className="fixed inset-0 z-40 flex items-center justify-center bg-opacity-75 backdrop-blur-sm">
// // //             {/* This inner div is the actual status viewer content */}
// // //             <div className="relative w-full h-[85vh] max-w-xl max-h-[90vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden">
// // //                 {/* Header Section */}
// // //                 <div>
// // //                     {/* Header */}
// // //                     <div className="absolute top-0 left-0 right-0 z-30 flex items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
// // //                         <img src={userAvatar} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-3" />
// // //                         <div>
// // //                             <p className="font-semibold text-white">{user.name}</p>
// // //                             <p className="text-xs text-gray-300">
// // //                                 {new Date(currentStatus.createdAt).toLocaleString()}
// // //                             </p>
// // //                         </div>
// // //                         {/* Close Button (moved directly inside header) */}
// // //                         <button
// // //                             onClick={onClose}
// // //                             className="absolute top-4 right-4 z-50 text-white p-2 rounded-full bg-zinc-900 hover:bg-gray-700 transform cursor-pointer"
// // //                         >
// // //                             <X size={24} />
// // //                         </button>
// // //                     </div>

// // //                     {/* Progress Bars */}
// // //                     <div className="absolute top-0 left-0 right-0 z-40 flex h-1 bg-gray-600 bg-opacity-50">
// // //                         {statuses.map((_, index) => (
// // //                             <div
// // //                                 key={index}
// // //                                 className="flex-1 bg-white mx-0.5 rounded-full"
// // //                                 style={{
// // //                                     transform: `scaleX(${index < currentStatusIndex ? 1 : (index === currentStatusIndex ? progress / 100 : 0)})`,
// // //                                     transformOrigin: 'left',
// // //                                     transition: index === currentStatusIndex ? 'none' : 'transform 0.1s linear',
// // //                                     backgroundColor: index <= currentStatusIndex ? 'white' : 'transparent',
// // //                                 }}
// // //                             />
// // //                         ))}
// // //                     </div>
// // //                 </div>

// // //                 {/* Media */}
// // //                 <div className="flex-1 flex items-center justify-center bg-black">
// // //                     {currentStatus.mediaType === 'image' ? (
// // //                         <Image
// // //                             src={mediaSrc}
// // //                             alt="Status media"
// // //                             fill
// // //                             style={{ objectFit: 'contain' }}
// // //                             priority
// // //                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
// // //                         />
// // //                     ) : (
// // //                         <video
// // //                             ref={videoRef}
// // //                             src={mediaSrc}
// // //                             className="max-w-full max-h-full object-contain"
// // //                             controls={false}
// // //                             autoPlay
// // //                             loop={false} // Important: set to false for progression logic
// // //                             // muted // Consider starting muted for better UX
// // //                             onLoadedMetadata={() => {
// // //                                 if (isPlaying) {
// // //                                     videoRef.current?.play();
// // //                                 }
// // //                             }}
// // //                             onClick={togglePlayPause} // Pause/play on click
// // //                         />
// // //                     )}
// // //                 </div>

// // //                 {/* Navigation Arrows */}
// // //                 {statuses.length > 1 && (
// // //                     <>
// // //                         <button
// // //                             onClick={goToPreviousStatus}
// // //                             className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-50 rounded-r-lg hover:bg-opacity-75 z-20"
// // //                             disabled={currentStatusIndex === 0}
// // //                         >
// // //                             <ChevronLeft size={24} />
// // //                         </button>
// // //                         <button
// // //                             onClick={goToNextStatus}
// // //                             className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-50 rounded-l-lg hover:bg-opacity-75 z-20"
// // //                             disabled={currentStatusIndex === statuses.length - 1}
// // //                         >
// // //                             <ChevronRight size={24} />
// // //                         </button>
// // //                     </>
// // //                 )}

// // //                 {/* Footer (Viewed By / Delete) */}
// // //                 {isOwnerOfCurrentStatus && (
// // //                     <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-center">
// // //                         <div className="relative">
// // //                             <button
// // //                                 onClick={toggleViewedByDropdown}
// // //                                 className="flex items-center text-white px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 cursor-pointer"
// // //                             >
// // //                                 <Eye size={18} className="mr-2" />
// // //                                 {currentStatus.viewedBy.length} Views
// // //                             </button>
// // //                             {viewedByDropdownOpen && (
// // //                                 <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg overflow-hidden max-h-48 overflow-y-auto p-1">
// // //                                     {fetchingViewedBy ? (
// // //                                         <div className="p-4 text-gray-600 text-sm">Loading viewers...</div>
// // //                                     ) : viewedByUsers.length > 0 ? (
// // //                                         <ul>
// // //                                             {viewedByUsers.map(viewer => (
// // //                                                 <li key={viewer._id} className="flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded-full">
// // //                                                     <img
// // //                                                         src={getFullMediaUrl(viewer.avatarUrl)}
// // //                                                         alt={viewer.name}
// // //                                                         className="w-8 h-8 rounded-full object-cover mr-2"
// // //                                                         onError={(e) => {
// // //                                                             const target = e.target as HTMLImageElement;
// // //                                                             target.src = defaultAvatarUrl;
// // //                                                         }}
// // //                                                     />
// // //                                                     <span className="text-sm text-gray-800">{viewer.name}</span>
// // //                                                 </li>
// // //                                             ))}
// // //                                         </ul>
// // //                                     ) : (
// // //                                         <div className="p-4 text-gray-600 text-sm">No views yet.</div>
// // //                                     )}
// // //                                 </div>
// // //                             )}
// // //                         </div>
// // //                         {/* Delete Button - Only for current user's own statuses */}
// // //                         <button
// // //                             onClick={handleDeleteClick}
// // //                             className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 cursor-pointer"
// // //                         >
// // //                             <Trash2 size={20} />
// // //                         </button>
// // //                     </div>
// // //                 )}
// // //             </div>

// // //             {/* --- NEW: Delete Confirmation Modal Rendering --- */}
// // //             {showDeleteConfirmModal && (
// // //                 <DeleteConfirmationModal
// // //                     title="Delete Status"
// // //                     message="Are you sure you want to permanently delete this status? This action cannot be undone."
// // //                     onConfirm={handleConfirmDelete}
// // //                     onCancel={handleCancelDelete}
// // //                 />
// // //             )}
// // //             {/* --- END NEW --- */}
// // //         </div>
// // //     );
// // // };

// // // export default StatusViewer;











// // 'use client';

// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
// // import Image from 'next/image';

// // // Assuming this DeleteConfirmationModal is exactly as provided by you
// // // client/components/DeleteConfirmationModal.tsx
// // interface DeleteConfirmationModalProps {
// //     message: string;
// //     onConfirm: () => void;
// //     onCancel: () => void;
// //     title?: string;
// // }

// // const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
// //     message,
// //     onConfirm,
// //     onCancel,
// //     title = 'Confirm Deletion',
// // }) => {
// //     return (
// //         // This outer div for the confirmation modal also correctly centers
// //         <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// //             <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden transform transition-opacity duration-300 ease-out animate-scale-in">
// //                 {/* ... confirmation modal content ... */}
// //                 {title && (
// //                     <div className="px-6 py-4 text-center">
// //                         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// //                     </div>
// //                 )}

// //                 {/* Message */}
// //                 <div className="px-6 py-2 text-center">
// //                     <p className="text-gray-700 text-sm">{message}</p>
// //                 </div>

// //                 {/* Buttons */}
// //                 <div className="mt-4 flex border-t border-gray-200">
// //                     <button
// //                         onClick={onCancel}
// //                         className="flex-1 px-4 py-3 text-blue-600 font-medium text-center border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
// //                     >
// //                         Cancel
// //                     </button>
// //                     <button
// //                         onClick={onConfirm}
// //                         className="flex-1 px-4 py-3 text-red-600 font-medium text-center hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
// //                     >
// //                         Delete
// //                     </button>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };
// // // END DeleteConfirmationModal component (pasted here as per your request)

// // // Re-using interfaces from ActivityBar, or define them globally if preferred
// // interface Status {
// //     _id: string;
// //     userId: string;
// //     mediaType: 'image' | 'video';
// //     mediaUrl: string;
// //     createdAt: string;
// //     viewedBy: string[];
// //     visibility: 'public' | 'followers';
// // }

// // export interface User {
// //     _id: string;
// //     name: string;
// //     avatarUrl?: string;
// //     // Add other user properties you might need
// // }


// // interface StatusViewerProps {
// //     isOpen: boolean;
// //     onClose: () => void;
// //     user: { _id: string; name: string; avatarUrl?: string };
// //     statuses: Status[];
// //     currentUserData: { _id: string; name: string; avatarUrl?: string; allActiveStatuses: Status[] } | null;
// //     getFullMediaUrl: (relativePath?: string) => string;
// //     defaultAvatarUrl: string;
// //     // MarkAsViewed now expects the current user's ID as well,
// //     // so the backend can verify and add it.
// //     markAsViewed: (statusId: string) => Promise<void>;
// //     fetchUserDetails: (userIds: string[]) => Promise<User[]>;
// //     onDeleteStatus: (statusId: string) => Promise<void>; // This is the prop from ActivityBar
// // }

// // const StatusViewer: React.FC<StatusViewerProps> = ({
// //     isOpen,
// //     onClose,
// //     user,
// //     statuses,
// //     currentUserData,
// //     getFullMediaUrl,
// //     defaultAvatarUrl,
// //     markAsViewed,
// //     fetchUserDetails,
// //     onDeleteStatus,
// // }) => {
// //     const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
// //     const [progress, setProgress] = useState(0);
// //     const [isPlaying, setIsPlaying] = useState(true); // For pause/play functionality
// //     const [viewedByDropdownOpen, setViewedByDropdownOpen] = useState(false);
// //     const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
// //     const [fetchingViewedBy, setFetchingViewedBy] = useState(false);
// //     const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
// //     const videoRef = useRef<HTMLVideoElement>(null);

// //     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

// //     const currentStatus = statuses[currentStatusIndex];
// //     // Check if the user whose status is being viewed is the current logged-in user
// //     const isOwnerOfCurrentStatus = currentUserData?._id === user._id;

// //     const STATUS_VIEW_DURATION_MS = 5000; // 5 seconds for images, or video duration

// //     // Use a ref to keep track of viewed status IDs within the current viewing session
// //     const viewedStatusIdsRef = useRef<Set<string>>(new Set());

// //     // Function to mark a status as viewed and update the ref
// //     const handleMarkAsViewed = useCallback(
// //         async (statusId: string) => {
// //             if (!isOwnerOfCurrentStatus && !viewedStatusIdsRef.current.has(statusId)) {
// //                 try {
// //                     const res = await markAsViewed(statusId); // your POST call
// //                     viewedStatusIdsRef.current.add(statusId);

// //                     // ✅ If backend returns updated status, patch the local one
// //                     const updatedStatus = res?.updatedStatus;
// //                     if (updatedStatus && updatedStatus.viewedBy) {
// //                         const updatedStatuses = [...statuses];
// //                         const index = updatedStatuses.findIndex((s) => s._id === statusId);
// //                         if (index !== -1) {
// //                             updatedStatuses[index].viewedBy = updatedStatus.viewedBy;
// //                             // 👇 This is optional — if `statuses` is in parent as state, update it there
// //                             // setStatuses(updatedStatuses);
// //                         }
// //                     } else if (currentUserData?._id) {
// //                         // fallback: manually insert currentUserId if API doesn't return updated array
// //                         const updatedStatuses = [...statuses];
// //                         const index = updatedStatuses.findIndex((s) => s._id === statusId);
// //                         if (index !== -1) {
// //                             if (!updatedStatuses[index].viewedBy.includes(currentUserData._id)) {
// //                                 updatedStatuses[index].viewedBy.push(currentUserData._id);
// //                             }
// //                             // setStatuses(updatedStatuses);
// //                         }
// //                     }
// //                 } catch (err) {
// //                     console.error('Failed to mark as viewed:', err);
// //                 }
// //             }
// //         },
// //         [markAsViewed, isOwnerOfCurrentStatus, statuses, currentUserData?._id]
// //     );



// //     // Reset state when modal opens/closes or statuses change
// //     useEffect(() => {
// //         if (isOpen) {
// //             setCurrentStatusIndex(0);
// //             setProgress(0);
// //             setIsPlaying(true);
// //             setViewedByDropdownOpen(false);
// //             viewedStatusIdsRef.current.clear(); // Clear viewed IDs on open

// //             // Mark the first status as viewed immediately (if not owner's)
// //             if (statuses.length > 0) {
// //                 handleMarkAsViewed(statuses[0]._id);
// //             }
// //         }
// //     }, [isOpen, statuses, handleMarkAsViewed]);


// //     // Progress bar and status progression logic
// //     useEffect(() => {
// //         if (!isOpen || !isPlaying) {
// //             if (progressIntervalRef.current) {
// //                 clearInterval(progressIntervalRef.current);
// //             }
// //             return;
// //         }

// //         const duration = currentStatus?.mediaType === 'video' && videoRef.current ?
// //             videoRef.current.duration * 1000 : STATUS_VIEW_DURATION_MS;

// //         let startTime = Date.now();
// //         if (progressIntervalRef.current) {
// //             clearInterval(progressIntervalRef.current);
// //         }

// //         progressIntervalRef.current = setInterval(() => {
// //             const elapsed = Date.now() - startTime;
// //             const newProgress = (elapsed / duration) * 100;
// //             setProgress(newProgress);

// //             if (newProgress >= 100) {
// //                 clearInterval(progressIntervalRef.current!);
// //                 if (currentStatusIndex < statuses.length - 1) {
// //                     const nextStatusId = statuses[currentStatusIndex + 1]._id;
// //                     setCurrentStatusIndex(prev => prev + 1);
// //                     setProgress(0); // Reset progress for the next status
// //                     startTime = Date.now(); // Reset start time for next status
// //                     handleMarkAsViewed(nextStatusId); // Mark the next status as viewed
// //                 } else {
// //                     onClose(); // Close viewer when all statuses are done
// //                 }
// //             }
// //         }, 50); // Update every 50ms for smooth progress bar
// //         return () => {
// //             if (progressIntervalRef.current) {
// //                 clearInterval(progressIntervalRef.current);
// //             }
// //         };
// //     }, [isOpen, currentStatusIndex, statuses, isPlaying, currentStatus, handleMarkAsViewed]); // Depend on handleMarkAsViewed


// //     // Handle video play/pause and progress synchronization
// //     useEffect(() => {
// //         const videoElement = videoRef.current;
// //         if (videoElement && currentStatus?.mediaType === 'video') {
// //             if (isPlaying) {
// //                 videoElement.play().catch(e => console.error("Video play failed:", e));
// //             } else {
// //                 videoElement.pause();
// //             }

// //             const handleTimeUpdate = () => {
// //                 const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
// //                 setProgress(newProgress);
// //             };
// //             const handleEnded = () => {
// //                 // Manually trigger next status when video ends
// //                 if (currentStatusIndex < statuses.length - 1) {
// //                     const nextStatusId = statuses[currentStatusIndex + 1]._id;
// //                     setCurrentStatusIndex(prev => prev + 1);
// //                     setProgress(0);
// //                     handleMarkAsViewed(nextStatusId); // Mark the next status as viewed
// //                 } else {
// //                     onClose();
// //                 }
// //             };

// //             videoElement.addEventListener('timeupdate', handleTimeUpdate);
// //             videoElement.addEventListener('ended', handleEnded);

// //             return () => {
// //                 videoElement.removeEventListener('timeupdate', handleTimeUpdate);
// //                 videoElement.removeEventListener('ended', handleEnded);
// //             };
// //         }
// //     }, [currentStatus, isPlaying, currentStatusIndex, statuses, handleMarkAsViewed]); // Depend on handleMarkAsViewed

// //     const goToNextStatus = useCallback(() => {
// //         if (currentStatusIndex < statuses.length - 1) {
// //             const nextStatusId = statuses[currentStatusIndex + 1]._id;
// //             setCurrentStatusIndex(prev => prev + 1);
// //             setProgress(0); // Reset progress for the new status
// //             setIsPlaying(true); // Ensure playing
// //             handleMarkAsViewed(nextStatusId); // Mark the next status as viewed
// //         } else {
// //             onClose(); // Close if no more statuses
// //         }
// //     }, [currentStatusIndex, statuses, onClose, handleMarkAsViewed]); // Depend on handleMarkAsViewed

// //     const goToPreviousStatus = useCallback(() => {
// //         if (currentStatusIndex > 0) {
// //             setCurrentStatusIndex(prev => prev - 1);
// //             setProgress(0); // Reset progress
// //             setIsPlaying(true); // Ensure playing
// //             // No need to call markAsViewed here, as going back doesn't constitute a "new" view
// //         }
// //     }, [currentStatusIndex]);

// //     const togglePlayPause = useCallback(() => {
// //         setIsPlaying(prev => !prev);
// //     }, []);

// //     const toggleViewedByDropdown = useCallback(async () => {
// //         if (!currentStatus) return;
// //         setViewedByDropdownOpen(prev => !prev);

// //         if (!viewedByDropdownOpen) {
// //             setFetchingViewedBy(true);
// //             try {
// //                 // ✨ Refetch the latest status data (optional but more accurate)
// //                 const res = await fetch(`/api/status/${currentStatus._id}`);
// //                 const updatedStatus = await res.json();

// //                 const users = await fetchUserDetails(updatedStatus.viewedBy);
// //                 setViewedByUsers(users);
// //             } catch (error) {
// //                 console.error("Failed to fetch viewed by users:", error);
// //                 setViewedByUsers([]);
// //             } finally {
// //                 setFetchingViewedBy(false);
// //             }
// //         }
// //     }, [viewedByDropdownOpen, currentStatus, fetchUserDetails]);


// //     const handleDeleteClick = useCallback((event: React.MouseEvent) => {
// //         event.stopPropagation(); // Prevent status viewer's own click handler
// //         if (currentStatus) {
// //             setShowDeleteConfirmModal(true); // Open the delete confirmation modal
// //             setIsPlaying(false); // Pause status when modal opens
// //         }
// //     }, [currentStatus]);

// //     const handleConfirmDelete = useCallback(async () => {
// //         if (currentStatus) {
// //             setShowDeleteConfirmModal(false); // Close confirmation modal
// //             // Call the onDeleteStatus prop received from ActivityBar
// //             await onDeleteStatus(currentStatus._id);
// //             // ActivityBar's onDeleteStatus will handle closing StatusViewer and refreshing
// //         }
// //     }, [currentStatus, onDeleteStatus]);

// //     const handleCancelDelete = useCallback(() => {
// //         setShowDeleteConfirmModal(false);
// //         setIsPlaying(true); // Resume status if deletion cancelled
// //     }, []);

// //     if (!isOpen || !currentStatus) return null;

// //     const userAvatar = getFullMediaUrl(user.avatarUrl);
// //     const mediaSrc = getFullMediaUrl(currentStatus.mediaUrl);

// //     return (
// //         // This outer div creates the full-screen overlay and centers its content
// //         <div className="fixed inset-0 z-40 flex items-center justify-center bg-opacity-75 backdrop-blur-sm">
// //             {/* This inner div is the actual status viewer content */}
// //             <div className="relative w-full h-[85vh] max-w-xl max-h-[90vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden">
// //                 {/* Header Section */}
// //                 <div>
// //                     {/* Header */}
// //                     <div className="absolute top-0 left-0 right-0 z-30 flex items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
// //                         <img src={userAvatar} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-3" />
// //                         <div>
// //                             <p className="font-semibold text-white">{user.name}</p>
// //                             <p className="text-xs text-gray-300">
// //                                 {new Date(currentStatus.createdAt).toLocaleString()}
// //                             </p>
// //                         </div>
// //                         {/* Close Button (moved directly inside header) */}
// //                         <button
// //                             onClick={onClose}
// //                             className="absolute top-4 right-4 z-50 text-white p-2 rounded-full bg-zinc-900 hover:bg-gray-700 transform cursor-pointer"
// //                         >
// //                             <X size={24} />
// //                         </button>
// //                     </div>

// //                     {/* Progress Bars */}
// //                     <div className="absolute top-0 left-0 right-0 z-40 flex h-1 bg-gray-600 bg-opacity-50">
// //                         {statuses.map((_, index) => (
// //                             <div
// //                                 key={index}
// //                                 className="flex-1 bg-white mx-0.5 rounded-full"
// //                                 style={{
// //                                     transform: `scaleX(${index < currentStatusIndex ? 1 : (index === currentStatusIndex ? progress / 100 : 0)})`,
// //                                     transformOrigin: 'left',
// //                                     transition: index === currentStatusIndex ? 'none' : 'transform 0.1s linear',
// //                                     backgroundColor: index <= currentStatusIndex ? 'white' : 'transparent',
// //                                 }}
// //                             />
// //                         ))}
// //                     </div>
// //                 </div>

// //                 {/* Media */}
// //                 <div className="flex-1 flex items-center justify-center bg-black">
// //                     {currentStatus.mediaType === 'image' ? (
// //                         <Image
// //                             src={mediaSrc}
// //                             alt="Status media"
// //                             fill
// //                             style={{ objectFit: 'contain' }}
// //                             priority
// //                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
// //                             onError={(e) => {
// //                                 const target = e.target as HTMLImageElement;
// //                                 target.src = '/fallback.jpg'; // optional fallback
// //                             }}
// //                         />
// //                     ) : (
// //                         <video
// //                             ref={videoRef}
// //                             src={mediaSrc}
// //                             className="max-w-full max-h-full object-contain"
// //                             controls={false}
// //                             autoPlay
// //                             loop={false}
// //                             onLoadedMetadata={() => {
// //                                 if (isPlaying) {
// //                                     videoRef.current?.play();
// //                                 }
// //                             }}
// //                             onClick={togglePlayPause}
// //                         />
// //                     )}
// //                 </div>

// //                 {/* Navigation Arrows */}
// //                 {statuses.length > 1 && (
// //                     <>
// //                         <button
// //                             onClick={goToPreviousStatus}
// //                             className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-50 rounded-r-lg hover:bg-opacity-75 z-20"
// //                             disabled={currentStatusIndex === 0}
// //                         >
// //                             <ChevronLeft size={24} />
// //                         </button>
// //                         <button
// //                             onClick={goToNextStatus}
// //                             className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-50 rounded-l-lg hover:bg-opacity-75 z-20"
// //                             disabled={currentStatusIndex === statuses.length - 1}
// //                         >
// //                             <ChevronRight size={24} />
// //                         </button>
// //                     </>
// //                 )}

// //                 {/* Footer (Viewed By / Delete) */}
// //                 {isOwnerOfCurrentStatus && (
// //                     <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-center">
// //                         <div className="relative">
// //                             <button
// //                                 onClick={toggleViewedByDropdown}
// //                                 className="flex items-center text-white px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 cursor-pointer"
// //                             >
// //                                 <Eye size={18} className="mr-2" />
// //                                 {currentStatus.viewedBy.length} Views
// //                             </button>
// //                             {viewedByDropdownOpen && (
// //                                 <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg overflow-hidden max-h-48 overflow-y-auto p-1">
// //                                     {fetchingViewedBy ? (
// //                                         <div className="p-4 text-gray-600 text-sm">Loading viewers...</div>
// //                                     ) : viewedByUsers.length > 0 ? (
// //                                         <ul>
// //                                             {viewedByUsers.map(viewer => (
// //                                                 <li key={viewer._id} className="flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded-full">
// //                                                     <img
// //                                                         src={getFullMediaUrl(viewer.avatarUrl)}
// //                                                         alt={viewer.name}
// //                                                         className="w-8 h-8 rounded-full object-cover mr-2"
// //                                                         onError={(e) => {
// //                                                             const target = e.target as HTMLImageElement;
// //                                                             target.src = defaultAvatarUrl;
// //                                                         }}
// //                                                     />
// //                                                     <span className="text-sm text-gray-800">{viewer.name}</span>
// //                                                 </li>
// //                                             ))}
// //                                         </ul>
// //                                     ) : (
// //                                         <div className="p-4 text-gray-600 text-sm">No views yet.</div>
// //                                     )}
// //                                 </div>
// //                             )}
// //                         </div>
// //                         {/* Delete Button - Only for current user's own statuses */}
// //                         <button
// //                             onClick={handleDeleteClick}
// //                             className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 cursor-pointer"
// //                         >
// //                             <Trash2 size={20} />
// //                         </button>
// //                     </div>
// //                 )}
// //             </div>

// //             {/* --- NEW: Delete Confirmation Modal Rendering --- */}
// //             {showDeleteConfirmModal && (
// //                 <DeleteConfirmationModal
// //                     title="Delete Status"
// //                     message="Are you sure you want to permanently delete this status? This action cannot be undone."
// //                     onConfirm={handleConfirmDelete}
// //                     onCancel={handleCancelDelete}
// //                 />
// //             )}
// //             {/* --- END NEW --- */}
// //         </div>
// //     );
// // };

// // export default StatusViewer;
















// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { X, ChevronLeft, ChevronRight, Eye, Trash2, Play } from 'lucide-react';
// import Image from 'next/image';

// interface DeleteConfirmationModalProps {
//     message: string;
//     onConfirm: () => void;
//     onCancel: () => void;
//     title?: string;
// }

// const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
//     message,
//     onConfirm,
//     onCancel,
//     title = 'Confirm Deletion',
// }) => {
//     return (
//         <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden transform transition-opacity duration-300 ease-out animate-scale-in">
//                 {title && (
//                     <div className="px-6 py-4 text-center">
//                         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//                     </div>
//                 )}

//                 <div className="px-6 py-2 text-center">
//                     <p className="text-gray-700 text-sm">{message}</p>
//                 </div>

//                 <div className="mt-4 flex border-t border-gray-200">
//                     <button
//                         onClick={onCancel}
//                         className="flex-1 px-4 py-3 text-blue-600 font-medium text-center border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={onConfirm}
//                         className="flex-1 px-4 py-3 text-red-600 font-medium text-center hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
//                     >
//                         Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
//     visibility: 'public' | 'followers';
// }

// export interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
// }

// interface StatusViewerProps {
//     isOpen: boolean;
//     onClose: () => void;
//     user: { _id: string; name: string; avatarUrl?: string };
//     statuses: Status[];
//     currentUserData: { _id: string; name: string; avatarUrl?: string; allActiveStatuses: Status[] } | null;
//     getFullMediaUrl: (relativePath?: string) => string;
//     defaultAvatarUrl: string;
//     markAsViewed: (statusId: string) => Promise<any>; // ✅ FIXED: Return type updated
//     fetchUserDetails: (userIds: string[]) => Promise<User[]>;
//     onDeleteStatus: (statusId: string) => Promise<void>;
// }

// const StatusViewer: React.FC<StatusViewerProps> = ({
//     isOpen,
//     onClose,
//     user,
//     statuses: initialStatuses, // ✅ FIXED: Renamed to show it's initial
//     currentUserData,
//     getFullMediaUrl,
//     defaultAvatarUrl,
//     markAsViewed,
//     fetchUserDetails,
//     onDeleteStatus,
// }) => {
//     // ✅ FIXED: Local state for statuses to handle real-time updates
//     const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
//     const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(true);
//     const [viewedByDropdownOpen, setViewedByDropdownOpen] = useState(false);
//     const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
//     const [fetchingViewedBy, setFetchingViewedBy] = useState(false);
//     const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     const currentStatus = statuses[currentStatusIndex];
//     const isOwnerOfCurrentStatus = currentUserData?._id === user._id;

//     const STATUS_VIEW_DURATION_MS = 5000;
//     const viewedStatusIdsRef = useRef<Set<string>>(new Set());

//     // ✅ FIXED: Update local statuses when prop changes
//     useEffect(() => {
//         setStatuses(initialStatuses);
//     }, [initialStatuses]);

//     // ✅ FIXED: Function to update status views locally
//     const updateStatusViewsLocally = useCallback((statusId: string, newViewedBy: string[]) => {
//         setStatuses(prevStatuses =>
//             prevStatuses.map(status =>
//                 status._id === statusId
//                     ? { ...status, viewedBy: newViewedBy }
//                     : status
//             )
//         );
//     }, []);

//     const handleMarkAsViewed = useCallback(
//         async (statusId: string) => {
//             if (!isOwnerOfCurrentStatus && !viewedStatusIdsRef.current.has(statusId)) {
//                 try {
//                     const response = await markAsViewed(statusId);
//                     viewedStatusIdsRef.current.add(statusId);

//                     // ✅ FIXED: Update local state with new viewedBy array
//                     if (response?.updatedStatus?.viewedBy) {
//                         updateStatusViewsLocally(statusId, response.updatedStatus.viewedBy);
//                     } else if (currentUserData?._id) {
//                         // Fallback: manually add current user ID
//                         const currentStatusInState = statuses.find(s => s._id === statusId);
//                         if (currentStatusInState && !currentStatusInState.viewedBy.includes(currentUserData._id)) {
//                             const newViewedBy = [...currentStatusInState.viewedBy, currentUserData._id];
//                             updateStatusViewsLocally(statusId, newViewedBy);
//                         }
//                     }
//                 } catch (err) {
//                     console.error('Failed to mark as viewed:', err);
//                 }
//             }
//         },
//         [markAsViewed, isOwnerOfCurrentStatus, statuses, currentUserData?._id, updateStatusViewsLocally]
//     );

//     useEffect(() => {
//         if (isOpen) {
//             setCurrentStatusIndex(0);
//             setProgress(0);
//             setIsPlaying(true);
//             setViewedByDropdownOpen(false);
//             viewedStatusIdsRef.current.clear();

//             if (statuses.length > 0) {
//                 handleMarkAsViewed(statuses[0]._id);
//             }
//         }
//     }, [isOpen, statuses.length, handleMarkAsViewed]);

//     useEffect(() => {
//         if (!isOpen || !isPlaying) {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }
//             return;
//         }

//         const duration = currentStatus?.mediaType === 'video' && videoRef.current ?
//             videoRef.current.duration * 1000 : STATUS_VIEW_DURATION_MS;

//         let startTime = Date.now();
//         if (progressIntervalRef.current) {
//             clearInterval(progressIntervalRef.current);
//         }

//         progressIntervalRef.current = setInterval(() => {
//             const elapsed = Date.now() - startTime;
//             const newProgress = (elapsed / duration) * 100;
//             setProgress(newProgress);

//             if (newProgress >= 100) {
//                 clearInterval(progressIntervalRef.current!);
//                 if (currentStatusIndex < statuses.length - 1) {
//                     const nextStatusId = statuses[currentStatusIndex + 1]._id;
//                     setCurrentStatusIndex(prev => prev + 1);
//                     setProgress(0);
//                     startTime = Date.now();
//                     handleMarkAsViewed(nextStatusId);
//                 } else {
//                     onClose();
//                 }
//             }
//         }, 50);

//         return () => {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }
//         };
//     }, [isOpen, currentStatus, currentStatusIndex, statuses.length, isPlaying, onClose, handleMarkAsViewed]);

//     const handleNextStatus = useCallback(() => {
//         setIsPlaying(false); // Pause current status for smooth transition
//         if (currentStatusIndex < statuses.length - 1) {
//             const nextStatusId = statuses[currentStatusIndex + 1]._id;
//             setCurrentStatusIndex(prev => prev + 1);
//             setProgress(0);
//             setIsPlaying(true);
//             handleMarkAsViewed(nextStatusId);
//         } else {
//             onClose();
//         }
//     }, [currentStatusIndex, statuses, onClose, handleMarkAsViewed]);

//     const handlePrevStatus = useCallback(() => {
//         setIsPlaying(false); // Pause current status
//         if (currentStatusIndex > 0) {
//             setCurrentStatusIndex(prev => prev - 1);
//             setProgress(0);
//             setIsPlaying(true);
//             // No need to mark as viewed when going back
//         }
//     }, [currentStatusIndex]);

//     const togglePlayPause = useCallback(() => {
//         setIsPlaying(prev => !prev);
//     }, []);

//     const handleVideoProgress = useCallback(() => {
//         if (videoRef.current && currentStatus?.mediaType === 'video') {
//             const videoDuration = videoRef.current.duration;
//             const videoCurrentTime = videoRef.current.currentTime;
//             const newProgress = (videoCurrentTime / videoDuration) * 100;
//             setProgress(newProgress);

//             if (videoCurrentTime >= videoDuration && currentStatusIndex < statuses.length - 1) {
//                 // Video ended, move to next status
//                 handleNextStatus();
//             } else if (videoCurrentTime >= videoDuration && currentStatusIndex === statuses.length - 1) {
//                 // Last video ended, close viewer
//                 onClose();
//             }
//         }
//     }, [currentStatus, currentStatusIndex, statuses.length, handleNextStatus, onClose]);

//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (!isOpen) return;
//             if (e.key === 'ArrowRight') {
//                 handleNextStatus();
//             } else if (e.key === 'ArrowLeft') {
//                 handlePrevStatus();
//             } else if (e.key === 'Escape') {
//                 onClose();
//             } else if (e.key === ' ') { // Spacebar to play/pause
//                 e.preventDefault();
//                 togglePlayPause();
//             }
//         };

//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [isOpen, handleNextStatus, handlePrevStatus, onClose, togglePlayPause]);

//     useEffect(() => {
//         if (videoRef.current) {
//             if (isPlaying) {
//                 videoRef.current.play().catch(e => console.error("Error playing video:", e));
//             } else {
//                 videoRef.current.pause();
//             }
//         }
//     }, [isPlaying, currentStatus]); // Re-evaluate when playing state or currentStatus changes

//     const handleMediaLoaded = useCallback(() => {
//         setIsPlaying(true);
//         if (currentStatus?.mediaType === 'image') {
//             setProgress(0); // Reset progress for image
//         } else if (videoRef.current) {
//             videoRef.current.currentTime = 0; // Reset video to start
//             videoRef.current.play().catch(e => console.error("Error playing video on load:", e));
//         }
//     }, [currentStatus]);

//     const fetchViewedByUsers = useCallback(async () => {
//         if (!currentStatus || currentStatus.viewedBy.length === 0) {
//             setViewedByUsers([]);
//             return;
//         }
//         setFetchingViewedBy(true);
//         try {
//             const users = await fetchUserDetails(currentStatus.viewedBy);
//             setViewedByUsers(users);
//         } catch (error) {
//             console.error("Failed to fetch 'viewed by' users:", error);
//             setViewedByUsers([]);
//         } finally {
//             setFetchingViewedBy(false);
//         }
//     }, [currentStatus, fetchUserDetails]);

//     useEffect(() => {
//         if (viewedByDropdownOpen) {
//             fetchViewedByUsers();
//         }
//     }, [viewedByDropdownOpen, fetchViewedByUsers]);

//     const confirmDelete = useCallback(() => {
//         setShowDeleteConfirmModal(true);
//         setIsPlaying(false); // Pause playback when confirmation modal is open
//     }, []);

//     const executeDelete = useCallback(async () => {
//         if (currentStatus) {
//             try {
//                 await onDeleteStatus(currentStatus._id);
//                 setShowDeleteConfirmModal(false);
//                 // After deletion, re-evaluate status display
//                 // If there are more statuses for the user, advance, otherwise close
//                 const remainingStatuses = statuses.filter(s => s._id !== currentStatus._id);
//                 if (remainingStatuses.length > 0) {
//                     const newIndex = currentStatusIndex < remainingStatuses.length ? currentStatusIndex : remainingStatuses.length - 1;
//                     setStatuses(remainingStatuses);
//                     setCurrentStatusIndex(newIndex);
//                     setProgress(0);
//                     setIsPlaying(true);
//                     handleMarkAsViewed(remainingStatuses[newIndex]._id);
//                 } else {
//                     onClose();
//                 }
//             } catch (error) {
//                 console.error("Error deleting status:", error);
//                 alert("Failed to delete status. Please try again.");
//                 setShowDeleteConfirmModal(false);
//                 setIsPlaying(true); // Resume playback if deletion fails
//             }
//         }
//     }, [currentStatus, onDeleteStatus, statuses, currentStatusIndex, handleMarkAsViewed, onClose]);

//     if (!isOpen || !currentStatus) return null;

//     return (
//         <div className="fixed inset-0 bg-opacity-90 backdrop-blur-sm flex items-center mb-14 md:mb-0 justify-center z-40 p-1 md:p-4">
//             <div className="relative w-full max-w-2xl h-full max-h-[85vh] bg-gray-900 rounded-lg flex flex-col overflow-hidden">
//                 {/* Close Button */}
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 cursor-pointer hover:bg-gray-50 hover:text-black right-4 z-50 p-2 rounded-full bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
//                     aria-label="Close status viewer"
//                 >
//                     <X size={24} />
//                 </button>

//                 {/* User Info */}
//                 <div className="absolute top-4 left-4 z-50 flex items-center space-x-3">
//                     <img
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className="w-10 h-10 rounded-full object-cover border-2 border-white"
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl;
//                         }}
//                     />
//                     <span className="text-white font-semibold">{user.name}</span>
//                     <span className="text-gray-400 text-sm">
//                         {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </span>
//                 </div>

//                 {/* Delete Button (only for owner) */}
//                 {isOwnerOfCurrentStatus && (
//                     <button
//                         onClick={confirmDelete}
//                         className="absolute cursor-pointer bottom-4 right-4 z-50 p-2 rounded-full bg-red-600 bg-opacity-70 text-white hover:bg-red-700 transition-colors"
//                         aria-label="Delete status"
//                     >
//                         <Trash2 size={18} />
//                     </button>
//                 )}


//                 {/* Progress Bars */}
//                 <div className="absolute top-0 left-0 right-0 z-30 flex space-x-1 px-4 pt-2">
//                     {statuses.map((_, index) => (
//                         <div key={index} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
//                             <div
//                                 className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
//                                 style={{
//                                     width: `${index < currentStatusIndex ? 100 : index === currentStatusIndex ? progress : 0}%`,
//                                 }}
//                             ></div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Main Media Content */}
//                 <div className="flex-1 flex items-center justify-center w-full h-full relative" onClick={togglePlayPause}>
//                     {currentStatus.mediaType === 'image' ? (
//                         <Image
//                             src={currentStatus.mediaUrl}
//                             alt="Status image"
//                             fill
//                             className="object-contain"
//                             onLoadingComplete={handleMediaLoaded}
//                             priority
//                         />
//                     ) : (
//                         <video
//                             ref={videoRef}
//                             src={currentStatus.mediaUrl}
//                             className="object-contain w-full h-full"
//                             onLoadedData={handleMediaLoaded}
//                             onTimeUpdate={handleVideoProgress}
//                             onEnded={handleNextStatus}
//                             autoPlay
//                             playsInline
//                             preload="auto"
//                         />
//                     )}
//                     {!isPlaying && (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <button
//                                 className="p-2 cursor-pointer rounded-full bg-gray-50 bg-opacity-50 text-black hover:bg-opacity-75"
//                                 onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
//                                 aria-label={isPlaying ? "Pause" : "Play"}
//                             >
//                                 {isPlaying ? (
//                                     <Play size={15} />
//                                 ) : (
//                                     <Play size={15}/>
//                                 )}
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Navigation Arrows */}
//                 {currentStatusIndex > 0 && (
//                     <button
//                         onClick={(e) => { e.stopPropagation(); handlePrevStatus(); }}
//                         className="absolute cursor-pointer left-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-50 bg-opacity-50 text-black hover:bg-opacity-75 transition-colors z-40"
//                         aria-label="Previous status"
//                     >
//                         <ChevronLeft size={24} />
//                     </button>
//                 )}
//                 {currentStatusIndex < statuses.length - 1 && (
//                     <button
//                         onClick={(e) => { e.stopPropagation(); handleNextStatus(); }}
//                         className="absolute right-1 top-1/2 cursor-pointer -translate-y-1/2 p-2 rounded-full bg-gray-50 bg-opacity-50 text-black hover:bg-opacity-75 transition-colors z-40"
//                         aria-label="Next status"
//                     >
//                         <ChevronRight size={24} />
//                     </button>
//                 )}

//                 {/* Viewed By Section (only for owner) */}
//                 {isOwnerOfCurrentStatus && (
//                     <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
//                         <button
//                             onClick={() => {
//                                 setViewedByDropdownOpen(prev => !prev);
//                                 setIsPlaying(false); // Pause playback when dropdown is open
//                             }}
//                             className="flex items-center cursor-pointer space-x-1 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-75 transition-colors"
//                         >
//                             <Eye size={20} />
//                             <span>{currentStatus.viewedBy.length} Views</span>
//                         </button>

//                         {viewedByDropdownOpen && (
//                             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg p-3">
//                                 <h4 className="text-gray-800 font-semibold mb-2 border-b pb-1">Viewed By:</h4>
//                                 {fetchingViewedBy ? (
//                                     <p className="text-gray-600 text-sm">Loading...</p>
//                                 ) : viewedByUsers.length > 0 ? (
//                                     <ul>
//                                         {viewedByUsers.map(viewer => (
//                                             <li key={viewer._id} className="flex items-center space-x-2 py-1">
//                                                 <img
//                                                     src={getFullMediaUrl(viewer.avatarUrl)}
//                                                     alt={viewer.name}
//                                                     className="w-8 h-8 rounded-full object-cover"
//                                                     onError={(e) => {
//                                                         const target = e.target as HTMLImageElement;
//                                                         target.src = defaultAvatarUrl;
//                                                     }}
//                                                 />
//                                                 <span className="text-gray-700 text-sm truncate">{viewer.name}</span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="text-gray-600 text-sm">No views yet.</p>
//                                 )}
//                                 <button
//                                     onClick={() => {
//                                         setViewedByDropdownOpen(false);
//                                         setIsPlaying(true); // Resume playback when dropdown is closed
//                                     }}
//                                     className="mt-2 cursor-pointer text-blue-600 text-sm w-full text-center hover:underline"
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {showDeleteConfirmModal && (
//                 <DeleteConfirmationModal
//                     message="Are you sure you want to delete this status? This action cannot be undone."
//                     onConfirm={executeDelete}
//                     onCancel={() => {
//                         setShowDeleteConfirmModal(false);
//                         setIsPlaying(true); // Resume playback if cancel delete
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default StatusViewer;



// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { X, ChevronLeft, ChevronRight, Eye, Trash2, Play, Pause } from 'lucide-react';
// import Image from 'next/image';
// import {
//     Status,
//     CurrentUserActivityData,
//     ConnectionActivityData,
//     User
// } from '../types/activity';
// import DeleteConfirmationModal from './DeleteConfirmationModal';

// import { fetchUserDetails, markStatusAsViewed, deleteStatus } from '@/utils/api';

// interface DeleteConfirmationModalProps {
//     message: string;
//     onConfirm: () => void;
//     onCancel: () => void;
//     title?: string;
// }

// interface StatusViewerProps {
//     isOpen: boolean;
//     onClose: () => void;
//     user: any; // Or proper type
//     statuses: Status[];
//     currentUserData: CurrentUserActivityData | null;
//     getFullMediaUrl: (url?: string) => string;
//     defaultAvatarUrl: string;
//     markAsViewed: (statusId: string) => void; // ✅ Add this line
//     fetchUserDetails: (userIds: string[]) => Promise<User[]>;
//     onDeleteStatus: (statusId: string) => Promise<void>;
// }

// const StatusViewer: React.FC<StatusViewerProps> = ({
//     isOpen,
//     onClose,
//     user,
//     statuses: initialStatuses,
//     currentUserData,
//     getFullMediaUrl,
//     defaultAvatarUrl,
// }) => {
//     const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
//     const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(true);
//     const [viewedByDropdownOpen, setViewedByDropdownOpen] = useState(false);
//     const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
//     const [fetchingViewedBy, setFetchingViewedBy] = useState(false);
//     const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     const currentStatus = statuses[currentStatusIndex];
//     const isOwnerOfCurrentStatus = currentUserData?._id === user._id;

//     const viewedStatusIdsRef = useRef<Set<string>>(new Set());

//     // Reset statuses when prop changes
//     useEffect(() => {
//         setStatuses(initialStatuses);
//         setCurrentStatusIndex(0);
//         setProgress(0);
//         viewedStatusIdsRef.current.clear();
//         setIsPlaying(true);
//     }, [initialStatuses]);

//     // Update status viewedBy locally
//     const updateStatusViewsLocally = useCallback((statusId: string, newViewedBy: string[]) => {
//         setStatuses((prev) =>
//             prev.map((status) =>
//                 status._id === statusId ? { ...status, viewedBy: newViewedBy } : status
//             )
//         );
//     }, []);

//     // Mark status as viewed on backend + update local state
//     const handleMarkAsViewed = useCallback(
//         async (statusId: string) => {
//             if (isOwnerOfCurrentStatus || viewedStatusIdsRef.current.has(statusId)) return;

//             try {
//                 const response = await markStatusAsViewed(statusId);
//                 viewedStatusIdsRef.current.add(statusId);

//                 if (response?.updatedStatus) {
//                     const updatedStatus = response.updatedStatus;
//                     const newViewedBy = (updatedStatus.viewedBy || []).map((id: any) =>
//                         typeof id === 'object' && id.$oid ? id.$oid : String(id)
//                     );
//                     updateStatusViewsLocally(statusId, newViewedBy);
//                 }
//             } catch (err) {
//                 console.error('Failed to mark as viewed:', err);
//             }
//         },
//         [isOwnerOfCurrentStatus, updateStatusViewsLocally]
//     );

//     // On open, mark first status viewed
//     useEffect(() => {
//         if (isOpen && statuses.length) {
//             setCurrentStatusIndex(0);
//             setProgress(0);
//             setIsPlaying(true);
//             setViewedByDropdownOpen(false);
//             viewedStatusIdsRef.current.clear();

//             setTimeout(() => {
//                 handleMarkAsViewed(statuses[0]._id);
//             }, 100);
//         }
//     }, [isOpen, statuses, handleMarkAsViewed]);

//     // Progress interval for auto advancing statuses
//     useEffect(() => {
//         if (!isOpen || !isPlaying || !currentStatus) {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//                 progressIntervalRef.current = null;
//             }
//             return;
//         }

//         const duration =
//             currentStatus.mediaType === 'video' && videoRef.current && !isNaN(videoRef.current.duration)
//                 ? videoRef.current.duration * 1000
//                 : 5000;

//         if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
//         const startTime = Date.now() - (progress / 100) * duration;

//         progressIntervalRef.current = setInterval(() => {
//             const elapsed = Date.now() - startTime;
//             const newProgress = (elapsed / duration) * 100;
//             setProgress(newProgress);

//             if (newProgress >= 100) {
//                 clearInterval(progressIntervalRef.current!);
//                 progressIntervalRef.current = null;

//                 if (currentStatusIndex < statuses.length - 1) {
//                     setCurrentStatusIndex((i) => i + 1);
//                     setProgress(0);
//                     setIsPlaying(true);
//                     handleMarkAsViewed(statuses[currentStatusIndex + 1]._id);
//                 } else {
//                     // Don't auto-close. Instead, stop at the last status.
//                     setIsPlaying(false);
//                     setProgress(100);
//                 }
//             }
//         }, 50);

//         return () => {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//                 progressIntervalRef.current = null;
//             }
//         };
//     }, [isOpen, isPlaying, currentStatus, currentStatusIndex, statuses, onClose, progress, handleMarkAsViewed]);

//     // Navigation handlers
//     const handleNextStatus = useCallback(() => {
//         setIsPlaying(false);
//         if (currentStatusIndex < statuses.length - 1) {
//             setCurrentStatusIndex((i) => i + 1);
//             setProgress(0);
//             setIsPlaying(true);
//             handleMarkAsViewed(statuses[currentStatusIndex + 1]._id);
//         } else {
//             onClose();
//         }
//     }, [currentStatusIndex, statuses, onClose, handleMarkAsViewed]);

//     const handlePrevStatus = useCallback(() => {
//         setIsPlaying(false);
//         if (currentStatusIndex > 0) {
//             setCurrentStatusIndex((i) => i - 1);
//             setProgress(0);
//             setIsPlaying(true);
//         }
//     }, [currentStatusIndex]);

//     const togglePlayPause = useCallback(() => setIsPlaying((p) => !p), []);

//     // For video progress updates
//     const handleVideoProgress = useCallback(() => {
//         if (!videoRef.current || currentStatus?.mediaType !== 'video') return;

//         const videoDuration = videoRef.current.duration;
//         const videoCurrentTime = videoRef.current.currentTime;
//         const newProgress = (videoCurrentTime / videoDuration) * 100;
//         setProgress(newProgress);

//         if (videoCurrentTime >= videoDuration) {
//             if (currentStatusIndex < statuses.length - 1) {
//                 handleNextStatus();
//             } else {
//                 onClose();
//             }
//         }
//     }, [currentStatus, currentStatusIndex, statuses.length, handleNextStatus, onClose]);

//     // Keyboard navigation
//     useEffect(() => {
//         const handler = (e: KeyboardEvent) => {
//             if (!isOpen) return;

//             switch (e.key) {
//                 case 'ArrowRight':
//                     handleNextStatus();
//                     break;
//                 case 'ArrowLeft':
//                     handlePrevStatus();
//                     break;
//                 case 'Escape':
//                     onClose();
//                     break;
//                 case ' ':
//                     e.preventDefault();
//                     togglePlayPause();
//                     break;
//             }
//         };

//         window.addEventListener('keydown', handler);
//         return () => window.removeEventListener('keydown', handler);
//     }, [isOpen, handleNextStatus, handlePrevStatus, onClose, togglePlayPause]);

//     // Play/pause video on isPlaying change
//     useEffect(() => {
//         if (!videoRef.current) return;
//         if (isPlaying) {
//             videoRef.current.play().catch(() => { });
//         } else {
//             videoRef.current.pause();
//         }
//     }, [isPlaying, currentStatus]);

//     const handleMediaLoaded = useCallback(() => {
//         setIsPlaying(true);
//         if (currentStatus?.mediaType === 'image') {
//             setProgress(0);
//         } else if (videoRef.current) {
//             videoRef.current.currentTime = 0;
//             videoRef.current.play().catch(() => { });
//         }
//     }, [currentStatus]);

//     // Fetch viewedBy users for dropdown
//     const fetchViewedByUsers = useCallback(async () => {
//         if (!currentStatus?.viewedBy || currentStatus.viewedBy.length === 0) {
//             setViewedByUsers([]);
//             return;
//         }

//         setFetchingViewedBy(true);
//         try {
//             const res = await fetchUserDetails(currentStatus.viewedBy);
//             if (res.success && Array.isArray(res.users)) {
//                 setViewedByUsers(res.users);
//             } else {
//                 setViewedByUsers([]);
//             }
//         } catch (e) {
//             console.error("Error fetching viewedBy users:", e);
//             setViewedByUsers([]);
//         } finally {
//             setFetchingViewedBy(false);
//         }
//     }, [currentStatus]);

//     useEffect(() => {
//         if (viewedByDropdownOpen && currentStatus) {
//             fetchViewedByUsers();
//             setIsPlaying(false);
//         } else {
//             setViewedByUsers([]);
//             setIsPlaying(true);
//         }
//     }, [viewedByDropdownOpen, currentStatus, fetchViewedByUsers]);

//     // Delete modal controls
//     const confirmDelete = useCallback(() => {
//         setShowDeleteConfirmModal(true);
//         setIsPlaying(false);
//     }, []);

//     const executeDelete = useCallback(async () => {
//         if (!currentStatus) return;

//         try {
//             await deleteStatus(currentStatus._id);
//             setShowDeleteConfirmModal(false);

//             const filtered = statuses.filter((s) => s._id !== currentStatus._id);

//             if (filtered.length > 0) {
//                 const newIndex = currentStatusIndex >= filtered.length ? filtered.length - 1 : currentStatusIndex;
//                 setStatuses(filtered);
//                 setCurrentStatusIndex(newIndex);
//                 setProgress(0);
//                 setIsPlaying(true);
//                 handleMarkAsViewed(filtered[newIndex]._id);
//             } else {
//                 onClose();
//             }
//         } catch (e) {
//             console.error("Delete error:", e);
//             alert("Failed to delete status. Try again.");
//             setShowDeleteConfirmModal(false);
//             setIsPlaying(true);
//         }
//     }, [currentStatus, statuses, currentStatusIndex, handleMarkAsViewed, onClose]);

//     if (!isOpen || !currentStatus) return null;

//     return (
//         <>
//             <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-40 p-1 md:p-4">
//                 <div className="relative w-full max-w-2xl h-full max-h-[85vh] bg-gray-900 rounded-lg flex flex-col overflow-hidden">

//                     {/* Close button */}
//                     <button
//                         onClick={onClose}
//                         aria-label="Close status viewer"
//                         className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-gray-700 transition-colors"
//                     >
//                         <X size={24} />
//                     </button>

//                     {/* User Info */}
//                     <div className="absolute top-4 left-4 z-50 flex items-center space-x-3">
//                         <img
//                             src={getFullMediaUrl(user.avatarUrl)}
//                             alt={user.name}
//                             className="w-10 h-10 rounded-full object-cover border-2 border-white"
//                             onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatarUrl; }}
//                         />
//                         <span className="text-white font-semibold">{user.name}</span>
//                         <span className="text-gray-400 text-sm">
//                             {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </span>
//                     </div>

//                     {/* Delete button for owner */}
//                     {isOwnerOfCurrentStatus && (
//                         <button
//                             onClick={confirmDelete}
//                             aria-label="Delete status"
//                             className="absolute bottom-4 right-4 z-50 p-2 rounded-full bg-red-600 bg-opacity-70 text-white hover:bg-red-700 transition-colors"
//                         >
//                             <Trash2 size={18} />
//                         </button>
//                     )}

//                     {/* Progress bars */}
//                     <div className="absolute top-0 left-0 right-0 z-30 flex space-x-1 px-4 pt-2">
//                         {statuses.map((_, idx) => (
//                             <div key={idx} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
//                                 <div
//                                     className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
//                                     style={{
//                                         width: idx < currentStatusIndex ? '100%' : idx === currentStatusIndex ? `${progress}%` : '0%',
//                                     }}
//                                 />
//                             </div>
//                         ))}
//                     </div>

//                     {/* Media content */}
//                     <div className="flex-1 flex items-center justify-center w-full h-full relative cursor-pointer" onClick={togglePlayPause}>
//                         {currentStatus.mediaType === 'image' ? (
//                             <Image
//                                 src={currentStatus.mediaUrl}
//                                 alt="Status image"
//                                 fill
//                                 className="object-contain"
//                                 onLoadingComplete={handleMediaLoaded}
//                                 priority
//                             />
//                         ) : (
//                             <video
//                                 ref={videoRef}
//                                 src={currentStatus.mediaUrl}
//                                 className="object-contain w-full h-full"
//                                 onLoadedData={handleMediaLoaded}
//                                 onTimeUpdate={handleVideoProgress}
//                                 onEnded={handleNextStatus}
//                                 autoPlay
//                                 playsInline
//                                 preload="auto"
//                             />
//                         )}

//                         {!isPlaying && (
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <button
//                                     onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
//                                     aria-label={isPlaying ? 'Pause' : 'Play'}
//                                     className="p-4 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors cursor-pointer"
//                                 >
//                                     <Play size={24} />
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {/* Navigation arrows */}
//                     {currentStatusIndex > 0 && (
//                         <button
//                             onClick={(e) => { e.stopPropagation(); handlePrevStatus(); }}
//                             aria-label="Previous status"
//                             className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors z-40"
//                         >
//                             <ChevronLeft size={24} />
//                         </button>
//                     )}
//                     {currentStatusIndex < statuses.length - 1 && (
//                         <button
//                             onClick={(e) => { e.stopPropagation(); handleNextStatus(); }}
//                             aria-label="Next status"
//                             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors z-40"
//                         >
//                             <ChevronRight size={24} />
//                         </button>
//                     )}

//                     {/* Viewed By (owner only) */}
//                     {/* {isOwnerOfCurrentStatus && (
//                         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
//                             <button
//                                 onClick={() => setViewedByDropdownOpen((v) => !v)}
//                                 className="flex items-center space-x-2 cursor-pointer text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-75 transition-colors"
//                             >
//                                 <Eye size={16} />
//                                 <span className="text-sm">{currentStatus.viewedBy.length} Views</span>
//                             </button>

//                             {viewedByDropdownOpen && (
//                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg border">
//                                     <div className="p-3 border-b bg-gray-50">
//                                         <h4 className="text-gray-800 font-semibold text-sm">Viewed By ({currentStatus.viewedBy.length})</h4>
//                                     </div>
//                                     <div className="p-2">
//                                         {fetchingViewedBy ? (
//                                             <div className="flex items-center justify-center py-4">
//                                                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
//                                                 <span className="ml-2 text-gray-600 text-sm">Loading...</span>
//                                             </div>
//                                         ) : viewedByUsers.length > 0 ? (
//                                             viewedByUsers.map((viewer) => (
//                                                 <div
//                                                     key={viewer._id}
//                                                     className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                                                 >
//                                                     <img
//                                                         src={getFullMediaUrl(viewer.avatarUrl)}
//                                                         alt={viewer.name}
//                                                         className="w-8 h-8 rounded-full object-cover"
//                                                         onError={(e) => {
//                                                             (e.target as HTMLImageElement).src = defaultAvatarUrl;
//                                                         }}
//                                                     />
//                                                     <span className="text-gray-700 text-sm">{viewer.name}</span>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <p className="text-gray-500 text-center py-4 text-sm">No views yet.</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )} */}
//                 </div>
//             </div>

//             {/* Delete Confirmation Modal */}
//             {showDeleteConfirmModal && (
//                 <DeleteConfirmationModal
//                     message="Are you sure you want to delete this status? This action cannot be undone."
//                     onConfirm={executeDelete}
//                     onCancel={() => {
//                         setShowDeleteConfirmModal(false);
//                         setIsPlaying(true);
//                     }}
//                 />
//             )}
//         </>
//     );
// };

// export default StatusViewer;

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Trash2, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import {
    Status,
    User
} from '../types/activity'; // Ensure this path is correct for your types

// Import the DeleteConfirmationModal component
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Adjust path if necessary

import { fetchUserDetails, markStatusAsViewed } from '@/utils/api';
import toast from 'react-hot-toast';

interface StatusViewerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // Or proper type for the user whose statuses are being viewed
    statuses: Status[]; // These are the statuses belonging to the 'user' prop
    currentUserData: { _id: string; name: string; avatarUrl?: string; allActiveStatuses: Status[] } | null; // This is the currently logged-in user
    getFullMediaUrl: (url?: string) => string;
    defaultAvatarUrl: string;
    onDeleteStatus: (statusId: string) => Promise<void>;
}

const StatusViewer: React.FC<StatusViewerProps> = ({
    isOpen,
    onClose,
    user,
    statuses: initialStatuses,
    currentUserData,
    getFullMediaUrl,
    defaultAvatarUrl,
    onDeleteStatus,
}) => {
    const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [viewedByDropdownOpen, setViewedByDropdownOpen] = useState(false);
    const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
    const [fetchingViewedBy, setFetchingViewedBy] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    // New state for controlling the visibility of the play/pause button
    const [showPlayPauseButton, setShowPlayPauseButton] = useState(true);
    const playPauseButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    const currentStatus = statuses[currentStatusIndex];
    const isOwnerOfCurrentStatus = currentUserData?._id === user._id;

    const viewedStatusIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        setStatuses(initialStatuses);
        setCurrentStatusIndex(0);
        setProgress(0);
        viewedStatusIdsRef.current.clear();
        setIsPlaying(true);
        setViewedByDropdownOpen(false);
        setShowPlayPauseButton(true); // Ensure button is visible when opening for a new set of statuses
    }, [initialStatuses]);

    const updateStatusViewsLocally = useCallback((statusId: string, newViewedBy: string[]) => {
        setStatuses((prev) =>
            prev.map((status) =>
                status._id === statusId ? { ...status, viewedBy: newViewedBy } : status
            )
        );
    }, []);

    const handleMarkAsViewed = useCallback(
        async (statusId: string) => {
            if (isOwnerOfCurrentStatus || viewedStatusIdsRef.current.has(statusId)) return;

            try {
                const response = await markStatusAsViewed(statusId);
                viewedStatusIdsRef.current.add(statusId);

                if (response?.updatedStatus) {
                    const updatedStatus = response.updatedStatus;
                    const newViewedBy = (updatedStatus.viewedBy || []).map((id: any) =>
                        typeof id === 'object' && id.$oid ? id.$oid : String(id)
                    );
                    updateStatusViewsLocally(statusId, newViewedBy);
                }
            } catch (err) {
                console.error('Failed to mark as viewed:', err);
            }
        },
        [isOwnerOfCurrentStatus, updateStatusViewsLocally]
    );

    useEffect(() => {
        if (isOpen && statuses.length) {
            setCurrentStatusIndex(0);
            setProgress(0);
            setIsPlaying(true);
            setViewedByDropdownOpen(false);
            viewedStatusIdsRef.current.clear();
            setShowPlayPauseButton(true); // Start visible for a new session

            setTimeout(() => {
                handleMarkAsViewed(statuses[0]._id);
            }, 100);
        }
    }, [isOpen, statuses, handleMarkAsViewed]);

    // Progress interval for auto advancing statuses
    useEffect(() => {
        if (!isOpen || !isPlaying || !currentStatus) {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            return;
        }

        const duration =
            currentStatus.mediaType === 'video' && videoRef.current && !isNaN(videoRef.current.duration)
                ? videoRef.current.duration * 1000
                : 5000;

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        const startTime = Date.now() - (progress / 100) * duration;

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = (elapsed / duration) * 100;
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(progressIntervalRef.current!);
                progressIntervalRef.current = null;

                if (currentStatusIndex < statuses.length - 1) {
                    setCurrentStatusIndex((i) => i + 1);
                    setProgress(0);
                    setIsPlaying(true);
                    handleMarkAsViewed(statuses[currentStatusIndex + 1]._id);
                } else {
                    setIsPlaying(false);
                    setProgress(100);
                }
            }
        }, 50);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        };
    }, [isOpen, isPlaying, currentStatus, currentStatusIndex, statuses, progress, handleMarkAsViewed]);

    const handleNextStatus = useCallback(() => {
        setIsPlaying(false); // Pause current status playback temporarily
        if (currentStatusIndex < statuses.length - 1) {
            setCurrentStatusIndex((i) => i + 1);
            setProgress(0);
            setIsPlaying(true); // Start playing the new status
            setShowPlayPauseButton(true); // Show button for new status
            handleMarkAsViewed(statuses[currentStatusIndex + 1]._id);
        } else {
            onClose();
        }
    }, [currentStatusIndex, statuses, onClose, handleMarkAsViewed]);

    const handlePrevStatus = useCallback(() => {
        setIsPlaying(false); // Pause current status playback temporarily
        if (currentStatusIndex > 0) {
            setCurrentStatusIndex((i) => i - 1);
            setProgress(0);
            setIsPlaying(true); // Start playing the new status
            setShowPlayPauseButton(true); // Show button for new status
        }
    }, [currentStatusIndex]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((p) => !p);
        setShowPlayPauseButton(true); // Always show button immediately on toggle
        // Clear any existing timeout for auto-hide
        if (playPauseButtonTimeoutRef.current) {
            clearTimeout(playPauseButtonTimeoutRef.current);
            playPauseButtonTimeoutRef.current = null;
        }
    }, []);

    const handleVideoProgress = useCallback(() => {
        if (!videoRef.current || currentStatus?.mediaType !== 'video') return;

        const videoDuration = videoRef.current.duration;
        const videoCurrentTime = videoRef.current.currentTime;
        const newProgress = (videoCurrentTime / videoDuration) * 100;
        setProgress(newProgress);
    }, [currentStatus]);

    const handleVideoEnded = useCallback(() => {
        if (currentStatusIndex < statuses.length - 1) {
            handleNextStatus();
        } else {
            onClose();
        }
    }, [currentStatusIndex, statuses.length, handleNextStatus, onClose]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowRight':
                    handleNextStatus();
                    break;
                case 'ArrowLeft':
                    handlePrevStatus();
                    break;
                case 'Escape':
                    onClose();
                    break;
                case ' ': // Spacebar for play/pause
                    e.preventDefault();
                    togglePlayPause();
                    break;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, handleNextStatus, handlePrevStatus, onClose, togglePlayPause]);

    // Play/pause video when isPlaying state changes
    useEffect(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.play().catch((e) => console.error("Video play error:", e));
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying, currentStatus, currentStatusIndex]);

    // Handle media (image/video) loaded event
    const handleMediaLoaded = useCallback(() => {
        setIsPlaying(true);
        setProgress(0);

        if (currentStatus?.mediaType === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch((e) => console.error("Video play error on load:", e));
        }
        setShowPlayPauseButton(true); // Show button when new media loads
    }, [currentStatus]);

    // Fetch viewedBy users for dropdown (only if current user is owner)
    const fetchViewedByUsers = useCallback(async () => {
        if (!currentStatus?.viewedBy || currentStatus.viewedBy.length === 0) {
            setViewedByUsers([]);
            return;
        }

        setFetchingViewedBy(true);
        try {
            const users = await fetchUserDetails(currentStatus.viewedBy);
            if (Array.isArray(users)) {
                setViewedByUsers(users);
            } else {
                setViewedByUsers([]);
            }
        } catch (e) {
            console.error("Error fetching viewedBy users:", e);
            setViewedByUsers([]);
        } finally {
            setFetchingViewedBy(false);
        }
    }, [currentStatus]);

    useEffect(() => {
        if (viewedByDropdownOpen && currentStatus) {
            fetchViewedByUsers();
            setIsPlaying(false);
        } else {
            setViewedByUsers([]);
            if (!showDeleteConfirmModal) {
                setIsPlaying(true);
            }
        }
    }, [viewedByDropdownOpen, currentStatus, fetchViewedByUsers, showDeleteConfirmModal]);

    // Auto-hide Play/Pause button logic
    useEffect(() => {
        if (isPlaying && showPlayPauseButton) {
            if (playPauseButtonTimeoutRef.current) {
                clearTimeout(playPauseButtonTimeoutRef.current);
            }
            playPauseButtonTimeoutRef.current = setTimeout(() => {
                setShowPlayPauseButton(false);
            }, 2000); // Hide after 2 seconds of playing
        } else if (!isPlaying) {
            // If paused, always show the button
            setShowPlayPauseButton(true);
            if (playPauseButtonTimeoutRef.current) {
                clearTimeout(playPauseButtonTimeoutRef.current);
                playPauseButtonTimeoutRef.current = null;
            }
        }
    }, [isPlaying, showPlayPauseButton, currentStatusIndex]); // Re-evaluate when status changes

    // Mouse movement to show play/pause button
    const handleMouseMove = useCallback(() => {
        if (!isPlaying) return; // Only apply if playing

        setShowPlayPauseButton(true);
        if (playPauseButtonTimeoutRef.current) {
            clearTimeout(playPauseButtonTimeoutRef.current);
        }
        playPauseButtonTimeoutRef.current = setTimeout(() => {
            setShowPlayPauseButton(false);
        }, 2000); // Re-hide after 2 seconds of no activity
    }, [isPlaying]);


    const handleDeleteClick = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        if (currentStatus) {
            setShowDeleteConfirmModal(true);
            setIsPlaying(false);
        }
    }, [currentStatus]);

    const handleConfirmDelete = useCallback(async () => {
        if (currentStatus) {
            setShowDeleteConfirmModal(false);
            await onDeleteStatus(currentStatus._id);
            toast.success('Status will be deleted.')
        } else {
            toast.error('Status not be deleted due to some reasons.')
        }
    }, [currentStatus, onDeleteStatus]);

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirmModal(false);
        setIsPlaying(true);
    }, []);

    if (!isOpen || !currentStatus) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-40 p-1 md:p-4"
                onMouseMove={handleMouseMove} // Add mouse move listener to show button
                onClick={togglePlayPause} // Toggle play/pause on click
            >
                <div className="relative w-full max-w-2xl h-full max-h-[85vh] bg-black rounded-lg flex flex-col overflow-hidden">

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        aria-label="Close status viewer"
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* User Info */}
                    <div className="absolute top-4 left-4 z-50 flex items-center space-x-3">
                        <img
                            src={getFullMediaUrl(user.avatarUrl)}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatarUrl; }}
                        />
                        <span className="text-white font-semibold">{user.name}</span>
                        <span className="text-gray-400 text-sm">
                            {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Delete button for owner */}
                    {isOwnerOfCurrentStatus && (
                        <button
                            onClick={handleDeleteClick}
                            aria-label="Delete status"
                            className="absolute cursor-pointer bottom-4 left-1/2 z-50 p-2 rounded-full bg-red-600 bg-opacity-70 text-white hover:bg-red-700 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}

                    {/* Play/Pause Button - Conditionally Rendered and Positioned */}
                    {showPlayPauseButton && ( // Only render if showPlayPauseButton is true
                        <div className="absolute left-7/9 top-9 -translate-x-1/2 -translate-y-1/2 z-50">
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                className="p-3 rounded-full text-white hover:bg-opacity-75 transition-opacity duration-200"
                            >
                                {/* Corrected icon logic: if playing show Pause, otherwise show Play */}
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                        </div>
                    )}


                    {/* Progress bars */}
                    <div className="absolute top-0 left-0 right-0 z-30 flex space-x-1 px-4 pt-2">
                        {statuses.map((_, idx) => (
                            <div key={idx} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
                                    style={{
                                        width: idx < currentStatusIndex ? '100%' : idx === currentStatusIndex ? `${progress}%` : '0%',
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Media content */}
                    <div className="flex-1 flex items-center justify-center w-full h-full relative"> {/* Removed onClick from here as it's now on the parent div */}
                        {currentStatus.mediaType === 'image' ? (
                            <Image
                                src={getFullMediaUrl(currentStatus.mediaUrl)}
                                alt="Status image"
                                fill
                                className="object-contain"
                                onLoadingComplete={handleMediaLoaded}
                                priority
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                src={getFullMediaUrl(currentStatus.mediaUrl)}
                                className="object-contain w-full h-full"
                                onLoadedData={handleMediaLoaded}
                                onTimeUpdate={handleVideoProgress}
                                onEnded={handleVideoEnded}
                                autoPlay={isPlaying} // Control autoplay based on isPlaying state
                                playsInline
                                preload="auto"
                            />
                        )}
                    </div>

                    {/* Navigation arrows */}
                    {currentStatusIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrevStatus(); }}
                            aria-label="Previous status"
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors z-40"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    {currentStatusIndex < statuses.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNextStatus(); }}
                            aria-label="Next status"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors z-40"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Viewed By (owner only) */}
                    {/* {isOwnerOfCurrentStatus && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewedByDropdownOpen((v) => !v); }}
                                className="flex items-center space-x-2 cursor-pointer text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-75 transition-colors"
                            >
                                <Eye size={16} />
                                <span className="text-sm">{currentStatus.viewedBy.length} Views</span>
                            </button>

                            {viewedByDropdownOpen && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg border">
                                    <div className="p-3 border-b bg-gray-50">
                                        <h4 className="text-gray-800 font-semibold text-sm">Viewed By ({currentStatus.viewedBy.length})</h4>
                                    </div>
                                    <div className="p-2">
                                        {fetchingViewedBy ? (
                                            <div className="flex items-center justify-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                                                <span className="ml-2 text-gray-600 text-sm">Loading...</span>
                                            </div>
                                        ) : viewedByUsers.length > 0 ? (
                                            viewedByUsers.map((viewer) => (
                                                <div
                                                    key={viewer._id}
                                                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                                >
                                                    <img
                                                        src={getFullMediaUrl(viewer.avatarUrl)}
                                                        alt={viewer.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = defaultAvatarUrl;
                                                        }}
                                                    />
                                                    <span className="text-gray-700 text-sm">{viewer.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4 text-sm">No views yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )} */}
                </div>
            </div>

            {showDeleteConfirmModal && (
                <DeleteConfirmationModal
                    title="Delete Status"
                    message="Are you sure you want to permanently delete this status? This action cannot be undone."
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </>
    );
};

export default StatusViewer;