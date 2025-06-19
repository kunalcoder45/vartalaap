// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { ChevronLeft, ChevronRight, X, Eye, Clock } from 'lucide-react';

// // Define the interfaces for better type safety
// export interface Status {
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
//     user: User; // The user whose statuses are being viewed
//     statuses: Status[]; // All statuses for this user
//     currentUserData: User | null; // The currently logged-in user's data (for view logic)
//     getFullMediaUrl: (relativePath?: string) => string;
//     defaultAvatarUrl: string;
//     markAsViewed: (statusId: string) => Promise<void>; // Function to mark a status as viewed
//     fetchUserDetails: (userIds: string[]) => Promise<User[]>; // New prop to fetch user details
// }

// const StatusViewer = ({
//     isOpen,
//     onClose,
//     user,
//     statuses,
//     currentUserData,
//     getFullMediaUrl,
//     defaultAvatarUrl,
//     markAsViewed,
//     fetchUserDetails
// }: StatusViewerProps) => {
//     const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [timeRemaining, setTimeRemaining] = useState(0);
//     const [showViewedByDropdown, setShowViewedByDropdown] = useState(false);
//     const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
//     const [isLoadingViewers, setIsLoadingViewers] = useState(false); // New loading state for viewers
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const videoRef = useRef<HTMLVideoElement>(null);

//     const STORY_DURATION = 15000; // 15 seconds for images
//     const currentStatus = statuses[currentStatusIndex];

//     // Helper functions
//     const formatTime = (seconds: number) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins}:${secs.toString().padStart(2, '0')}`;
//     };

//     const getTimeAgo = (createdAt: string) => {
//         const now = new Date();
//         const created = new Date(createdAt);
//         const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

//         if (diffInMinutes < 1) return 'Just now';
//         if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//         if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
//         return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
//     };

//     // Callback functions for navigation and playback
//     const handleNext = useCallback(() => {
//         if (currentStatusIndex < statuses.length - 1) {
//             setCurrentStatusIndex(prev => prev + 1);
//         } else {
//             onClose();
//         }
//     }, [currentStatusIndex, statuses.length, onClose]);

//     const handlePrevious = useCallback(() => {
//         if (currentStatusIndex > 0) {
//             setCurrentStatusIndex(prev => prev - 1);
//         }
//     }, [currentStatusIndex]);

//     const handleStatusClick = useCallback((index: number) => {
//         setCurrentStatusIndex(index);
//     }, []);

//     const handlePlayPause = useCallback(() => {
//         if (currentStatus?.mediaType === 'video' && videoRef.current) {
//             if (isPlaying) {
//                 videoRef.current.pause();
//                 if (progressIntervalRef.current) {
//                     clearInterval(progressIntervalRef.current);
//                     progressIntervalRef.current = null;
//                 }
//             } else {
//                 videoRef.current.play();
//                 // For video, timeUpdate listener will handle progress, no need for a separate interval here
//             }
//             setIsPlaying(prev => !prev);
//         } else if (currentStatus?.mediaType === 'image') {
//             // For images, we control the progress interval
//             if (isPlaying) {
//                 if (progressIntervalRef.current) {
//                     clearInterval(progressIntervalRef.current);
//                     progressIntervalRef.current = null;
//                 }
//             } else {
//                 const remainingDuration = STORY_DURATION * (1 - progress / 100);
//                 const startTime = Date.now();
//                 progressIntervalRef.current = setInterval(() => {
//                     const elapsed = Date.now() - startTime;
//                     const newProgress = Math.min((elapsed / remainingDuration) * (100 - progress) + progress, 100);
//                     setProgress(newProgress);
//                     setTimeRemaining(Math.max(0, Math.ceil((remainingDuration - elapsed) / 1000)));
//                     if (newProgress >= 100) {
//                         handleNext();
//                     }
//                 }, 100);
//             }
//             setIsPlaying(prev => !prev);
//         }
//     }, [isPlaying, currentStatus, progress, handleNext]);

//     // Function to toggle views dropdown and fetch user details
//     const toggleViewedByDropdown = useCallback(async () => {
//         setShowViewedByDropdown(prev => !prev);
//         // Only fetch if dropdown is about to open and there are viewers
//         if (!showViewedByDropdown && currentStatus?.viewedBy && currentStatus.viewedBy.length > 0) {
//             setIsLoadingViewers(true); // Set loading true
//             try {
//                 const details = await fetchUserDetails(currentStatus.viewedBy);
//                 setViewedByUsers(details);
//             } catch (error) {
//                 console.error("Failed to fetch viewer details:", error);
//                 // Optionally handle error, e.g., show a toast message
//             } finally {
//                 setIsLoadingViewers(false); // Set loading false
//             }
//         }
//     }, [showViewedByDropdown, currentStatus?.viewedBy, fetchUserDetails]);


//     // Effect for handling progress bar, media playback, and marking as viewed
//     useEffect(() => {
//         if (!isOpen) {
//             // Reset state when modal closes
//             setCurrentStatusIndex(0);
//             setProgress(0);
//             setIsPlaying(false);
//             setTimeRemaining(0);
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }
//             if (videoRef.current) {
//                 videoRef.current.pause();
//                 videoRef.current.currentTime = 0;
//             }
//             // Close dropdown and clear viewed by users on close
//             setShowViewedByDropdown(false);
//             setViewedByUsers([]);
//             setIsLoadingViewers(false); // Reset loading state
//             return;
//         }

//         // If the viewer is open and we have a current status
//         if (currentStatus) {
//             console.log(`[StatusViewer] Current status changed to index: ${currentStatusIndex}, id: ${currentStatus._id}`);
//             setProgress(0);
//             setIsPlaying(true);

//             // Clear any existing progress interval
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }

//             // Mark as viewed when a new status is displayed (only if not own status)
//             if (currentUserData && user._id !== currentUserData._id) {
//                 markAsViewed(currentStatus._id);
//             }

//             // Handle media playback and timer
//             if (currentStatus.mediaType === 'video' && videoRef.current) {
//                 const video = videoRef.current;
//                 video.load(); // Reload video source if it changes
//                 video.onloadedmetadata = () => {
//                     if (video) {
//                         setTimeRemaining(Math.ceil(video.duration));
//                         video.play().catch(e => console.error("Video autoplay failed:", e));
//                     }
//                 };
//             } else {
//                 // For images, set a fixed duration timer
//                 const startTime = Date.now();
//                 setTimeRemaining(Math.ceil(STORY_DURATION / 1000));
//                 progressIntervalRef.current = setInterval(() => {
//                     const elapsed = Date.now() - startTime;
//                     const progressPercent = Math.min((elapsed / STORY_DURATION) * 100, 100);
//                     setProgress(progressPercent);
//                     setTimeRemaining(Math.max(0, Math.ceil((STORY_DURATION - elapsed) / 1000)));

//                     if (progressPercent >= 100) {
//                         handleNext();
//                     }
//                 }, 100);
//             }
//             // Close dropdown and clear viewed by users on status change
//             setShowViewedByDropdown(false);
//             setViewedByUsers([]);
//             setIsLoadingViewers(false); // Reset loading state
//         }

//         return () => {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }
//         };
//     }, [isOpen, currentStatusIndex, currentStatus, user._id, currentUserData?._id, markAsViewed, handleNext]);


//     // Video specific event listeners
//     useEffect(() => {
//         if (currentStatus?.mediaType === 'video' && videoRef.current) {
//             const video = videoRef.current;

//             const handleLoadedMetadata = () => {
//                 setTimeRemaining(Math.ceil(video.duration));
//             };

//             const handleTimeUpdate = () => {
//                 if (video.duration) {
//                     const progressPercent = (video.currentTime / video.duration) * 100;
//                     setProgress(progressPercent);
//                     setTimeRemaining(Math.max(0, Math.ceil(video.duration - video.currentTime)));
//                 }
//             };

//             const handleEnded = () => {
//                 handleNext();
//             };

//             video.addEventListener('loadedmetadata', handleLoadedMetadata);
//             video.addEventListener('timeupdate', handleTimeUpdate);
//             video.addEventListener('ended', handleEnded);

//             return () => {
//                 video.removeEventListener('loadedmetadata', handleLoadedMetadata);
//                 video.removeEventListener('timeupdate', handleTimeUpdate);
//                 video.removeEventListener('ended', handleEnded);
//             };
//         }
//     }, [currentStatus, handleNext]);

//     // Handle click outside dropdown
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowViewedByDropdown(false);
//             }
//         };
//         if (showViewedByDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showViewedByDropdown]);


//     if (!isOpen || !currentStatus) return null;

//     return (
//         <div className="fixed inset-0 bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
//             <div className="relative w-full max-w-md mx-4 h-[85vh] top-8 max-h-[90vh] rounded-lg overflow-hidden">
//                 {/* Header with progress bars */}
//                 <div className="absolute top-0 left-0 right-0 z-20 p-4">
//                     {/* Progress bars */}
//                     <div className="flex space-x-1 mb-4">
//                         {statuses.map((_, index) => (
//                             <div
//                                 key={index}
//                                 className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
//                                 onClick={() => handleStatusClick(index)}
//                                 aria-label={`Progress for status ${index + 1}`} // Added aria-label
//                             >
//                                 <div
//                                     className="h-full bg-white transition-all duration-300 ease-linear"
//                                     style={{
//                                         width: index < currentStatusIndex ? '100%' :
//                                             index === currentStatusIndex ? `${progress}%` : '0%'
//                                     }}
//                                 />
//                             </div>
//                         ))}
//                     </div>

//                     {/* User info and controls */}
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <img
//                                 src={getFullMediaUrl(user.avatarUrl)}
//                                 alt={user.name}
//                                 className="w-10 h-10 rounded-full object-cover border-2 border-white"
//                                 onError={(e) => {
//                                     const target = e.target as HTMLImageElement;
//                                     target.src = defaultAvatarUrl;
//                                 }}
//                             />
//                             <div>
//                                 <h3 className="text-white font-semibold text-sm">{user.name}</h3>
//                                 <p className="text-gray-300 text-xs">
//                                     {getTimeAgo(currentStatus.createdAt)}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="flex items-center space-x-3">
//                             {/* Timer */}
//                             <div className="flex items-center space-x-1 text-white text-sm">
//                                 <Clock size={14} />
//                                 <span>{formatTime(timeRemaining)}</span>
//                             </div>

//                             {/* Views count (only show for own status) */}
//                             {user._id === currentUserData?._id && (
//                                 <div className="relative" ref={dropdownRef}>
//                                     <button
//                                         onClick={toggleViewedByDropdown}
//                                         className="flex items-center space-x-1 text-white text-sm hover:text-gray-300 transition-colors"
//                                         aria-label={`Viewers of this status. Currently ${currentStatus.viewedBy?.length || 0} views.`} // Added aria-label
//                                     >
//                                         <Eye size={14} />
//                                         <span>{currentStatus.viewedBy?.length || 0}</span>
//                                     </button>
//                                     {showViewedByDropdown && (
//                                         <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 max-h-48 overflow-y-auto">
//                                             {isLoadingViewers ? (
//                                                 <p className="text-gray-400 text-sm p-3">Loading views...</p>
//                                             ) : viewedByUsers.length > 0 ? (
//                                                 viewedByUsers.map((viewer) => (
//                                                     <div key={viewer._id} className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer">
//                                                         <img
//                                                             src={getFullMediaUrl(viewer.avatarUrl)}
//                                                             alt={viewer.name}
//                                                             className="w-8 h-8 rounded-full object-cover mr-2"
//                                                             onError={(e) => {
//                                                                 const target = e.target as HTMLImageElement;
//                                                                 target.src = defaultAvatarUrl;
//                                                             }}
//                                                         />
//                                                         <span className="text-white text-sm">{viewer.name}</span>
//                                                     </div>
//                                                 ))
//                                             ) : (
//                                                 <p className="text-gray-400 text-sm p-3">No views yet.</p>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Close button */}
//                             <button
//                                 onClick={onClose}
//                                 className="text-white hover:text-gray-300 transition-colors"
//                                 aria-label="Close status viewer" // Added aria-label
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Navigation buttons */}
//                 <button
//                     onClick={handlePrevious}
//                     disabled={currentStatusIndex === 0}
//                     className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
//                     aria-label="Previous status" // Added aria-label
//                 >
//                     <ChevronLeft size={24} />
//                 </button>

//                 <button
//                     onClick={handleNext}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
//                     aria-label="Next status" // Added aria-label
//                 >
//                     <ChevronRight size={24} />
//                 </button>

//                 {/* Media content */}
//                 <div
//                     className="w-full h-full flex items-center justify-center bg-black"
//                     onClick={currentStatus.mediaType === 'video' ? handlePlayPause : undefined}
//                     role={currentStatus.mediaType === 'video' ? "button" : undefined} // Indicate it's an interactive element for videos
//                     aria-label={currentStatus.mediaType === 'video' ? (isPlaying ? "Pause video" : "Play video") : undefined} // Added aria-label for video
//                 >
//                     {currentStatus.mediaType === 'video' ? (
//                         <video
//                             ref={videoRef}
//                             className="w-full h-full object-contain"
//                             autoPlay
//                             muted
//                             playsInline
//                             key={currentStatus._id}
//                         >
//                             <source
//                                 src={getFullMediaUrl(currentStatus.mediaUrl)}
//                                 type="video/mp4"
//                             />
//                             Your browser does not support the video tag.
//                         </video>
//                     ) : (
//                         <img
//                             src={getFullMediaUrl(currentStatus.mediaUrl)}
//                             alt="Status"
//                             className="w-full h-full object-contain"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = defaultAvatarUrl;
//                             }}
//                         />
//                     )}
//                 </div>

//                 {/* Bottom status indicator */}
//                 <div className="absolute bottom-4 left-4 right-4 z-20">
//                     <div className="flex justify-center space-x-2">
//                         {statuses.map((_, index) => (
//                             <button
//                                 key={index}
//                                 onClick={() => handleStatusClick(index)}
//                                 className={`w-2 h-2 rounded-full transition-all ${
//                                     index === currentStatusIndex
//                                         ? 'bg-white scale-125'
//                                         : 'bg-gray-500 hover:bg-gray-300'
//                                 }`}
//                                 aria-label={`Go to status ${index + 1}`} // Added aria-label
//                             />
//                         ))}
//                     </div>

//                     {/* Status info */}
//                     <div className="text-center mt-2">
//                         <p className="text-white text-sm">
//                             {currentStatusIndex + 1} of {statuses.length}
//                         </p>
//                         {currentStatus.visibility && (
//                             <p className="text-gray-300 text-xs mt-1 capitalize">
//                                 {currentStatus.visibility}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 {/* Play/Pause overlay for videos */}
//                 {currentStatus.mediaType === 'video' && !isPlaying && (
//                     <div className="absolute inset-0 flex items-center justify-center z-10">
//                         <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
//                             <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default StatusViewer;






// // client/components/StatusViewer.tsx
// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { ChevronLeft, ChevronRight, X, Eye, Clock, Trash2 } from 'lucide-react'; // Import Trash2 icon

// // Define the interfaces for better type safety
// export interface Status {
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
//     user: User; // The user whose statuses are being viewed
//     statuses: Status[]; // All statuses for this user
//     currentUserData: User | null; // The currently logged-in user's data (for view logic)
//     getFullMediaUrl: (relativePath?: string) => string;
//     defaultAvatarUrl: string;
//     markAsViewed: (statusId: string) => Promise<void>; // Function to mark a status as viewed
//     fetchUserDetails: (userIds: string[]) => Promise<User[]>; // New prop to fetch user details
//     // --- NEW PROP FOR DELETE ---
//     onDeleteStatus: (statusId: string) => void; // Callback to trigger delete confirmation
//     // ---------------------------
// }

// const StatusViewer = ({
//     isOpen,
//     onClose,
//     user,
//     statuses,
//     currentUserData,
//     getFullMediaUrl,
//     defaultAvatarUrl,
//     markAsViewed,
//     fetchUserDetails,
//     // --- NEW PROP DESTRUCTURING ---
//     onDeleteStatus
//     // ------------------------------
// }: StatusViewerProps) => {
//     const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [timeRemaining, setTimeRemaining] = useState(0);
//     const [showViewedByDropdown, setShowViewedByDropdown] = useState(false);
//     const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
//     const [isLoadingViewers, setIsLoadingViewers] = useState(false); // New loading state for viewers
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
//     const videoRef = useRef<HTMLVideoElement>(null);

//     const STORY_DURATION = 15000; // 15 seconds for images
//     const currentStatus = statuses[currentStatusIndex];

//     // Helper functions
//     const formatTime = (seconds: number) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins}:${secs.toString().padStart(2, '0')}`;
//     };

//     const getTimeAgo = (createdAt: string) => {
//         const now = new Date();
//         const created = new Date(createdAt);
//         const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

//         if (diffInMinutes < 1) return 'Just now';
//         if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
//         if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
//         return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
//     };

//     // Callback functions for navigation and playback
//     const handleNext = useCallback(() => {
//         if (currentStatusIndex < statuses.length - 1) {
//             setCurrentStatusIndex(prev => prev + 1);
//         } else {
//             onClose();
//         }
//     }, [currentStatusIndex, statuses.length, onClose]);

//     const handlePrevious = useCallback(() => {
//         if (currentStatusIndex > 0) {
//             setCurrentStatusIndex(prev => prev - 1);
//         }
//     }, [currentStatusIndex]);

//     const handleStatusClick = useCallback((index: number) => {
//         setCurrentStatusIndex(index);
//     }, []);

//     const handlePlayPause = useCallback(() => {
//         if (currentStatus?.mediaType === 'video' && videoRef.current) {
//             if (isPlaying) {
//                 videoRef.current.pause();
//                 if (progressIntervalRef.current) {
//                     clearInterval(progressIntervalRef.current);
//                     progressIntervalRef.current = null;
//                 }
//             } else {
//                 videoRef.current.play();
//                 // For video, timeUpdate listener will handle progress, no need for a separate interval here
//             }
//             setIsPlaying(prev => !prev);
//         } else if (currentStatus?.mediaType === 'image') {
//             // For images, we control the progress interval
//             if (isPlaying) {
//                 if (progressIntervalRef.current) {
//                     clearInterval(progressIntervalRef.current);
//                     progressIntervalRef.current = null;
//                 }
//             } else {
//                 const remainingDuration = STORY_DURATION * (1 - progress / 100);
//                 const startTime = Date.now();
//                 progressIntervalRef.current = setInterval(() => {
//                     const elapsed = Date.now() - startTime;
//                     const newProgress = Math.min((elapsed / remainingDuration) * (100 - progress) + progress, 100);
//                     setProgress(newProgress);
//                     setTimeRemaining(Math.max(0, Math.ceil((remainingDuration - elapsed) / 1000)));
//                     if (newProgress >= 100) {
//                         handleNext();
//                     }
//                 }, 100);
//             }
//             setIsPlaying(prev => !prev);
//         }
//     }, [isPlaying, currentStatus, progress, handleNext]);

//     // Function to toggle views dropdown and fetch user details
//     const toggleViewedByDropdown = useCallback(async () => {
//         setShowViewedByDropdown(prev => !prev);
//         // Only fetch if dropdown is about to open and there are viewers
//         if (!showViewedByDropdown && currentStatus?.viewedBy && currentStatus.viewedBy.length > 0) {
//             setIsLoadingViewers(true); // Set loading true
//             try {
//                 const details = await fetchUserDetails(currentStatus.viewedBy);
//                 // Filter out the owner of the status from the viewedBy list
//                 const filteredDetails = details.filter(viewer => viewer._id !== user._id);
//                 setViewedByUsers(filteredDetails);
//             } catch (error) {
//                 console.error("Failed to fetch viewer details:", error);
//                 // Optionally handle error, e.g., show a toast message
//             } finally {
//                 setIsLoadingViewers(false); // Set loading false
//             }
//         }
//     }, [showViewedByDropdown, currentStatus?.viewedBy, fetchUserDetails, user._id]); // Added user._id to dependencies

//     // --- New handler for delete icon click ---
//     const handleDeleteIconClick = useCallback((event: React.MouseEvent) => {
//         event.stopPropagation(); // Prevent status viewer's own click handler
//         if (currentStatus) {
//             onDeleteStatus(currentStatus._id); // Call the prop function
//             onClose(); // Close the viewer after initiating delete (modal will appear in ActivityBar)
//         }
//     }, [currentStatus, onDeleteStatus, onClose]);
//     // ------------------------------------------

//     // Effect for handling progress bar, media playback, and marking as viewed
//     useEffect(() => {
//         if (!isOpen) {
//             // Reset state when modal closes
//             setCurrentStatusIndex(0);
//             setProgress(0);
//             setIsPlaying(false);
//             setTimeRemaining(0);
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }
//             if (videoRef.current) {
//                 videoRef.current.pause();
//                 videoRef.current.currentTime = 0;
//             }
//             // Close dropdown and clear viewed by users on close
//             setShowViewedByDropdown(false);
//             setViewedByUsers([]);
//             setIsLoadingViewers(false); // Reset loading state
//             return;
//         }

//         // If the viewer is open and we have a current status
//         if (currentStatus) {
//             console.log(`[StatusViewer] Current status changed to index: ${currentStatusIndex}, id: ${currentStatus._id}`);
//             setProgress(0);
//             setIsPlaying(true);

//             // Clear any existing progress interval
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }

//             // Mark as viewed when a new status is displayed (only if not own status)
//             if (currentUserData && user._id !== currentUserData._id) {
//                 markAsViewed(currentStatus._id);
//             }

//             // Handle media playback and timer
//             if (currentStatus.mediaType === 'video' && videoRef.current) {
//                 const video = videoRef.current;
//                 video.load(); // Reload video source if it changes
//                 video.onloadedmetadata = () => {
//                     if (video) {
//                         setTimeRemaining(Math.ceil(video.duration));
//                         video.play().catch(e => console.error("Video autoplay failed:", e));
//                     }
//                 };
//             } else {
//                 // For images, set a fixed duration timer
//                 const startTime = Date.now();
//                 setTimeRemaining(Math.ceil(STORY_DURATION / 1000));
//                 progressIntervalRef.current = setInterval(() => {
//                     const elapsed = Date.now() - startTime;
//                     const progressPercent = Math.min((elapsed / STORY_DURATION) * 100, 100);
//                     setProgress(progressPercent);
//                     setTimeRemaining(Math.max(0, Math.ceil((STORY_DURATION - elapsed) / 1000)));

//                     if (progressPercent >= 100) {
//                         handleNext();
//                     }
//                 }, 100);
//             }
//             // Close dropdown and clear viewed by users on status change
//             setShowViewedByDropdown(false);
//             setViewedByUsers([]);
//             setIsLoadingViewers(false); // Reset loading state
//         }

//         return () => {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current);
//             }
//         };
//     }, [isOpen, currentStatusIndex, currentStatus, user._id, currentUserData?._id, markAsViewed, handleNext]);


//     // Video specific event listeners
//     useEffect(() => {
//         if (currentStatus?.mediaType === 'video' && videoRef.current) {
//             const video = videoRef.current;

//             const handleLoadedMetadata = () => {
//                 setTimeRemaining(Math.ceil(video.duration));
//             };

//             const handleTimeUpdate = () => {
//                 if (video.duration) {
//                     const progressPercent = (video.currentTime / video.duration) * 100;
//                     setProgress(progressPercent);
//                     setTimeRemaining(Math.max(0, Math.ceil(video.duration - video.currentTime)));
//                 }
//             };

//             const handleEnded = () => {
//                 handleNext();
//             };

//             video.addEventListener('loadedmetadata', handleLoadedMetadata);
//             video.addEventListener('timeupdate', handleTimeUpdate);
//             video.addEventListener('ended', handleEnded);

//             return () => {
//                 video.removeEventListener('loadedmetadata', handleLoadedMetadata);
//                 video.removeEventListener('timeupdate', handleTimeUpdate);
//                 video.removeEventListener('ended', handleEnded);
//             };
//         }
//     }, [currentStatus, handleNext]);

//     // Handle click outside dropdown
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowViewedByDropdown(false);
//             }
//         };
//         if (showViewedByDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }
//     }, [showViewedByDropdown]);


//     if (!isOpen || !currentStatus) return null;

//     // Check if the current user is the owner of the status being viewed
//     const isOwnerOfStatus = currentUserData?._id === user._id;

//     return (
//         <div className="fixed inset-0 bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
//             <div className="relative w-full max-w-md mx-4 h-[85vh] top-8 max-h-[90vh] rounded-lg overflow-hidden">
//                 {/* Header with progress bars */}
//                 <div className="absolute top-0 left-0 right-0 z-20 p-4">
//                     {/* Progress bars */}
//                     <div className="flex space-x-1 mb-4">
//                         {statuses.map((_, index) => (
//                             <div
//                                 key={index}
//                                 className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
//                                 onClick={() => handleStatusClick(index)}
//                                 aria-label={`Progress for status ${index + 1}`}
//                             >
//                                 <div
//                                     className="h-full bg-white transition-all duration-300 ease-linear"
//                                     style={{
//                                         width: index < currentStatusIndex ? '100%' :
//                                             index === currentStatusIndex ? `${progress}%` : '0%'
//                                     }}
//                                 />
//                             </div>
//                         ))}
//                     </div>

//                     {/* User info and controls */}
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <img
//                                 src={getFullMediaUrl(user.avatarUrl)}
//                                 alt={user.name}
//                                 className="w-10 h-10 rounded-full object-cover border-2 border-white"
//                                 onError={(e) => {
//                                     const target = e.target as HTMLImageElement;
//                                     target.src = defaultAvatarUrl;
//                                 }}
//                             />
//                             <div>
//                                 <h3 className="text-white font-semibold text-sm">{user.name}</h3>
//                                 <p className="text-gray-300 text-xs">
//                                     {getTimeAgo(currentStatus.createdAt)}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="flex items-center space-x-3">
//                             {/* Timer */}
//                             <div className="flex items-center space-x-1 text-white text-sm">
//                                 <Clock size={14} />
//                                 <span>{formatTime(timeRemaining)}</span>
//                             </div>

//                             {/* Views count (only show for own status) */}
//                             {isOwnerOfStatus && ( // Use the new isOwnerOfStatus variable
//                                 <div className="relative" ref={dropdownRef}>
//                                     <button
//                                         onClick={toggleViewedByDropdown}
//                                         className="flex items-center space-x-1 text-white text-sm hover:text-gray-300 transition-colors"
//                                         aria-label={`Viewers of this status. Currently ${currentStatus.viewedBy?.length || 0} views.`}
//                                     >
//                                         <Eye size={14} />
//                                         <span>{currentStatus.viewedBy?.filter(viewerId => viewerId !== user._id).length || 0}</span> {/* Filter owner's view here too for display */}
//                                     </button>
//                                     {showViewedByDropdown && (
//                                         <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 max-h-48 overflow-y-auto">
//                                             {isLoadingViewers ? (
//                                                 <p className="text-gray-400 text-sm p-3">Loading views...</p>
//                                             ) : viewedByUsers.length > 0 ? (
//                                                 viewedByUsers.map((viewer) => (
//                                                     <div key={viewer._id} className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer">
//                                                         <img
//                                                             src={getFullMediaUrl(viewer.avatarUrl)}
//                                                             alt={viewer.name}
//                                                             className="w-8 h-8 rounded-full object-cover mr-2"
//                                                             onError={(e) => {
//                                                                 const target = e.target as HTMLImageElement;
//                                                                 target.src = defaultAvatarUrl;
//                                                             }}
//                                                         />
//                                                         <span className="text-white text-sm">{viewer.name}</span>
//                                                     </div>
//                                                 ))
//                                             ) : (
//                                                 <p className="text-gray-400 text-sm p-3">No views yet.</p>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* --- DELETE ICON ADDED HERE --- */}
//                             {isOwnerOfStatus && ( // Only show delete for owner of the status
//                                 <button
//                                     onClick={handleDeleteIconClick}
//                                     className="text-white hover:text-red-400 transition-colors"
//                                     aria-label="Delete this status"
//                                 >
//                                     <Trash2 size={20} /> {/* Increased size for better visibility */}
//                                 </button>
//                             )}
//                             {/* ------------------------------- */}

//                             {/* Close button */}
//                             <button
//                                 onClick={onClose}
//                                 className="text-white hover:text-gray-300 transition-colors"
//                                 aria-label="Close status viewer"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Navigation buttons */}
//                 <button
//                     onClick={handlePrevious}
//                     disabled={currentStatusIndex === 0}
//                     className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
//                     aria-label="Previous status"
//                 >
//                     <ChevronLeft size={24} />
//                 </button>

//                 <button
//                     onClick={handleNext}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
//                     aria-label="Next status"
//                 >
//                     <ChevronRight size={24} />
//                 </button>

//                 {/* Media content */}
//                 <div
//                     className="w-full h-full flex items-center justify-center bg-black"
//                     onClick={currentStatus.mediaType === 'video' ? handlePlayPause : undefined}
//                     role={currentStatus.mediaType === 'video' ? "button" : undefined}
//                     aria-label={currentStatus.mediaType === 'video' ? (isPlaying ? "Pause video" : "Play video") : undefined}
//                 >
//                     {currentStatus.mediaType === 'video' ? (
//                         <video
//                             ref={videoRef}
//                             className="w-full h-full object-contain"
//                             autoPlay
//                             muted
//                             playsInline
//                             key={currentStatus._id}
//                         >
//                             <source
//                                 src={getFullMediaUrl(currentStatus.mediaUrl)}
//                                 type="video/mp4"
//                             />
//                             Your browser does not support the video tag.
//                         </video>
//                     ) : (
//                         <img
//                             src={getFullMediaUrl(currentStatus.mediaUrl)}
//                             alt="Status"
//                             className="w-full h-full object-contain"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = defaultAvatarUrl;
//                             }}
//                         />
//                     )}
//                 </div>

//                 {/* Bottom status indicator */}
//                 <div className="absolute bottom-4 left-4 right-4 z-20">
//                     <div className="flex justify-center space-x-2">
//                         {statuses.map((_, index) => (
//                             <button
//                                 key={index}
//                                 onClick={() => handleStatusClick(index)}
//                                 className={`w-2 h-2 rounded-full transition-all ${
//                                     index === currentStatusIndex
//                                         ? 'bg-white scale-125'
//                                         : 'bg-gray-500 hover:bg-gray-300'
//                                 }`}
//                                 aria-label={`Go to status ${index + 1}`}
//                             />
//                         ))}
//                     </div>

//                     {/* Status info */}
//                     <div className="text-center mt-2">
//                         <p className="text-white text-sm">
//                             {currentStatusIndex + 1} of {statuses.length}
//                         </p>
//                         {currentStatus.visibility && (
//                             <p className="text-gray-300 text-xs mt-1 capitalize">
//                                 {currentStatus.visibility}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 {/* Play/Pause overlay for videos */}
//                 {currentStatus.mediaType === 'video' && !isPlaying && (
//                     <div className="absolute inset-0 flex items-center justify-center z-10">
//                         <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
//                             <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default StatusViewer;





// client/components/StatusViewer.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import Image from 'next/image';

// Assuming this DeleteConfirmationModal is exactly as provided by you
// client/components/DeleteConfirmationModal.tsx
interface DeleteConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    message,
    onConfirm,
    onCancel,
    title = 'Confirm Deletion',
}) => {
    return (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden transform transition-opacity duration-300 ease-out animate-scale-in">
                {/* Optional Title */}
                {title && (
                    <div className="px-6 py-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                )}

                {/* Message */}
                <div className="px-6 py-2 text-center">
                    <p className="text-gray-700 text-sm">{message}</p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 text-blue-600 font-medium text-center border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 text-red-600 font-medium text-center hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
// END DeleteConfirmationModal component (pasted here as per your request)

// Re-using interfaces from ActivityBar, or define them globally if preferred
interface Status {
    _id: string;
    userId: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    viewedBy: string[];
    visibility: 'public' | 'followers';
}

export interface User {
    _id: string;
    name: string;
    avatarUrl?: string;
    // Add other user properties you might need
}

interface StatusViewerProps {
    isOpen: boolean;
    onClose: () => void;
    user: { _id: string; name: string; avatarUrl?: string };
    statuses: Status[];
    currentUserData: { _id: string; name: string; avatarUrl?: string; allActiveStatuses: Status[] } | null;
    getFullMediaUrl: (relativePath?: string) => string;
    defaultAvatarUrl: string;
    markAsViewed: (statusId: string) => Promise<void>;
    fetchUserDetails: (userIds: string[]) => Promise<User[]>;
    onDeleteStatus: (statusId: string) => Promise<void>; // This is the prop from ActivityBar
}

const StatusViewer: React.FC<StatusViewerProps> = ({
    isOpen,
    onClose,
    user,
    statuses,
    currentUserData,
    getFullMediaUrl,
    defaultAvatarUrl,
    markAsViewed,
    fetchUserDetails,
    onDeleteStatus,
}) => {
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true); // For pause/play functionality
    const [viewedByDropdownOpen, setViewedByDropdownOpen] = useState(false);
    const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
    const [fetchingViewedBy, setFetchingViewedBy] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // --- NEW: Delete Modal State ---
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    // --- END NEW ---

    const currentStatus = statuses[currentStatusIndex];
    // Check if the user whose status is being viewed is the current logged-in user
    const isOwnerOfCurrentStatus = currentUserData?._id === user._id;

    const STATUS_VIEW_DURATION_MS = 5000; // 5 seconds for images, or video duration

    // Reset state when modal opens/closes or statuses change
    useEffect(() => {
        if (isOpen) {
            setCurrentStatusIndex(0);
            setProgress(0);
            setIsPlaying(true);
            setViewedByDropdownOpen(false);
            // Mark the first status as viewed immediately IF it's NOT the current user's own status
            if (statuses.length > 0 && !isOwnerOfCurrentStatus) {
                markAsViewed(statuses[0]._id);
            }
        }
    }, [isOpen, statuses, markAsViewed, isOwnerOfCurrentStatus]);

    // Progress bar and status progression logic
    useEffect(() => {
        if (!isOpen || !isPlaying) {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            return;
        }

        const duration = currentStatus?.mediaType === 'video' && videoRef.current ?
            videoRef.current.duration * 1000 : STATUS_VIEW_DURATION_MS;

        let startTime = Date.now();
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = (elapsed / duration) * 100;
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(progressIntervalRef.current!);
                if (currentStatusIndex < statuses.length - 1) {
                    setCurrentStatusIndex(prev => prev + 1);
                    setProgress(0); // Reset progress for the next status
                    startTime = Date.now(); // Reset start time for next status
                    // Mark as viewed only if the status is NOT owned by the current user
                    if (!isOwnerOfCurrentStatus) {
                        markAsViewed(statuses[currentStatusIndex + 1]._id);
                    }
                } else {
                    onClose(); // Close viewer when all statuses are done
                }
            }
        }, 50); // Update every 50ms for smooth progress bar
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [isOpen, currentStatusIndex, statuses, isPlaying, currentStatus, markAsViewed, isOwnerOfCurrentStatus]);

    // Handle video play/pause and progress synchronization
    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && currentStatus?.mediaType === 'video') {
            if (isPlaying) {
                videoElement.play().catch(e => console.error("Video play failed:", e));
            } else {
                videoElement.pause();
            }

            const handleTimeUpdate = () => {
                const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
                setProgress(newProgress);
            };
            const handleEnded = () => {
                // Manually trigger next status when video ends
                if (currentStatusIndex < statuses.length - 1) {
                    setCurrentStatusIndex(prev => prev + 1);
                    setProgress(0);
                    // Mark as viewed only if the status is NOT owned by the current user
                    if (!isOwnerOfCurrentStatus) {
                        markAsViewed(statuses[currentStatusIndex + 1]._id);
                    }
                } else {
                    onClose();
                }
            };

            videoElement.addEventListener('timeupdate', handleTimeUpdate);
            videoElement.addEventListener('ended', handleEnded);

            return () => {
                videoElement.removeEventListener('timeupdate', handleTimeUpdate);
                videoElement.removeEventListener('ended', handleEnded);
            };
        }
    }, [currentStatus, isPlaying, currentStatusIndex, statuses, markAsViewed, isOwnerOfCurrentStatus]);

    const goToNextStatus = useCallback(() => {
        if (currentStatusIndex < statuses.length - 1) {
            setCurrentStatusIndex(prev => prev + 1);
            setProgress(0); // Reset progress for the new status
            setIsPlaying(true); // Ensure playing
            // Mark as viewed only if the status is NOT owned by the current user
            if (!isOwnerOfCurrentStatus) {
                markAsViewed(statuses[currentStatusIndex + 1]._id);
            }
        } else {
            onClose(); // Close if no more statuses
        }
    }, [currentStatusIndex, statuses, onClose, markAsViewed, isOwnerOfCurrentStatus]);

    const goToPreviousStatus = useCallback(() => {
        if (currentStatusIndex > 0) {
            setCurrentStatusIndex(prev => prev - 1);
            setProgress(0); // Reset progress
            setIsPlaying(true); // Ensure playing
        }
    }, [currentStatusIndex]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const toggleViewedByDropdown = useCallback(async () => {
        if (!currentStatus) return;
        setViewedByDropdownOpen(prev => !prev);
        if (!viewedByDropdownOpen && currentStatus.viewedBy.length > 0) {
            setFetchingViewedBy(true);
            try {
                const users = await fetchUserDetails(currentStatus.viewedBy);
                setViewedByUsers(users);
            } catch (error) {
                console.error("Failed to fetch viewed by users:", error);
                setViewedByUsers([]); // Clear on error
            } finally {
                setFetchingViewedBy(false);
            }
        }
    }, [viewedByDropdownOpen, currentStatus, fetchUserDetails]);

    // --- NEW: Delete Modal Handlers (executeDelete, handleCancelDelete) ---
    const handleDeleteClick = useCallback((event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent status viewer's own click handler
        if (currentStatus) {
            setShowDeleteConfirmModal(true); // Open the delete confirmation modal
            setIsPlaying(false); // Pause status when modal opens
        }
    }, [currentStatus]);

    const handleConfirmDelete = useCallback(async () => {
        if (currentStatus) {
            setShowDeleteConfirmModal(false); // Close confirmation modal
            // Call the onDeleteStatus prop received from ActivityBar
            await onDeleteStatus(currentStatus._id);
            // ActivityBar's onDeleteStatus will handle closing StatusViewer and refreshing
        }
    }, [currentStatus, onDeleteStatus]);

    const handleCancelDelete = useCallback(() => {
        setShowDeleteConfirmModal(false);
        setIsPlaying(true); // Resume status if deletion cancelled
    }, []);
    // --- END NEW ---

    if (!isOpen || !currentStatus) return null;

    const userAvatar = getFullMediaUrl(user.avatarUrl);
    const mediaSrc = getFullMediaUrl(currentStatus.mediaUrl);

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-opacity-75 backdrop-blur-sm">
            <div className="relative w-full h-[85vh] top-8 max-w-xl max-h-[90vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden">
                {/* Header Section */}
                <div>
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-30 flex items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
                        <img src={userAvatar} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                        <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-gray-300">
                                {new Date(currentStatus.createdAt).toLocaleString()}
                            </p>
                        </div>
                        {/* Close Button (moved directly inside header) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 text-white p-2 rounded-full bg-zinc-900 hover:bg-gray-700 transform cursor-pointer"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Bars */}
                    <div className="absolute top-0 left-0 right-0 z-40 flex h-1 bg-gray-600 bg-opacity-50">
                        {statuses.map((_, index) => (
                            <div
                                key={index}
                                className="flex-1 bg-white mx-0.5 rounded-full"
                                style={{
                                    transform: `scaleX(${index < currentStatusIndex ? 1 : (index === currentStatusIndex ? progress / 100 : 0)})`,
                                    transformOrigin: 'left',
                                    transition: index === currentStatusIndex ? 'none' : 'transform 0.1s linear',
                                    backgroundColor: index <= currentStatusIndex ? 'white' : 'transparent',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Media */}
                <div className="flex-1 flex items-center justify-center bg-black">
                    {currentStatus.mediaType === 'image' ? (
                        <Image
                            src={mediaSrc}
                            alt="Status media"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={mediaSrc}
                            className="max-w-full max-h-full object-contain"
                            controls={false}
                            autoPlay
                            loop={false} // Important: set to false for progression logic
                            // muted // Consider starting muted for better UX
                            onLoadedMetadata={() => {
                                if (isPlaying) {
                                    videoRef.current?.play();
                                }
                            }}
                            onClick={togglePlayPause} // Pause/play on click
                        />
                    )}
                </div>

                {/* Navigation Arrows */}
                {statuses.length > 1 && (
                    <>
                        <button
                            onClick={goToPreviousStatus}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-50 rounded-r-lg hover:bg-opacity-75 z-20"
                            disabled={currentStatusIndex === 0}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={goToNextStatus}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-50 rounded-l-lg hover:bg-opacity-75 z-20"
                            disabled={currentStatusIndex === statuses.length - 1}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Footer (Viewed By / Delete) */}
                {isOwnerOfCurrentStatus && (
                    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/70 to-transparent p-4 flex justify-between items-center">
                        <div className="relative">
                            <button
                                onClick={toggleViewedByDropdown}
                                className="flex items-center text-white px-3 py-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 cursor-pointer"
                            >
                                <Eye size={18} className="mr-2" />
                                {currentStatus.viewedBy.length} Views
                            </button>
                            {viewedByDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg overflow-hidden max-h-48 overflow-y-auto p-1">
                                    {fetchingViewedBy ? (
                                        <div className="p-4 text-gray-600 text-sm">Loading viewers...</div>
                                    ) : viewedByUsers.length > 0 ? (
                                        <ul>
                                            {viewedByUsers.map(viewer => (
                                                <li key={viewer._id} className="flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded-full">
                                                    <img
                                                        src={getFullMediaUrl(viewer.avatarUrl)}
                                                        alt={viewer.name}
                                                        className="w-8 h-8 rounded-full object-cover mr-2"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = defaultAvatarUrl;
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-800">{viewer.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-gray-600 text-sm">No views yet.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Delete Button - Only for current user's own statuses */}
                        <button
                            onClick={handleDeleteClick}
                            className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* --- NEW: Delete Confirmation Modal Rendering --- */}
            {showDeleteConfirmModal && (
                <DeleteConfirmationModal
                    title="Delete Status"
                    message="Are you sure you want to permanently delete this status? This action cannot be undone."
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
            {/* --- END NEW --- */}
        </div>
    );
};

export default StatusViewer;