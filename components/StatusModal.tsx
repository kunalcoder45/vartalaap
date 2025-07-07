// // client/components/StatusModal.tsx
// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import Image from 'next/image';
// import { ChevronLeft, ChevronRight, X, Trash2, Eye, Play, Pause, Volume2, VolumeX } from 'lucide-react'; // Added Play, Pause, Volume icons
// import defaultAvatar from '../app/assets/userLogo.png';
// import { useAuth } from './AuthProvider'; // To get current user ID for analytics/deletion
// import { formatDistanceToNow } from 'date-fns'; // For time formatting

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// interface Status {
//   _id: string;
//   userId: {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//   };
//   mediaType: 'image' | 'video';
//   mediaUrl: string; // Full URL from backend for display
//   viewedByCurrentUser: boolean;
//   viewCount: number; // Ensure this is present for owner analytics
//   createdAt: string;
//   expiresAt: string;
// }

// interface UserConnection {
//   _id: string;
//   name: string;
//   avatarUrl?: string;
// }

// interface StatusModalProps {
//   user: UserConnection; // The user whose statuses are being viewed
//   statuses: Status[]; // Array of their active statuses
//   onClose: () => void;
//   onStatusViewed: (statusId: string) => void; // Callback to mark status as viewed
//   currentLoggedInUserId: string; // The ID of the currently logged-in user
// }

// const StatusModal = ({ user, statuses, onClose, onStatusViewed, currentLoggedInUserId }: StatusModalProps) => {
//   const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
//   const [progress, setProgress] = useState(0); // Progress for the current status bar
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const { getIdToken } = useAuth(); // For fetching analytics/deleting
//   const [showAnalytics, setShowAnalytics] = useState(false);
//   const [analyticsData, setAnalyticsData] = useState<any>(null); // State for analytics data
//   const [analyticsLoading, setAnalyticsLoading] = useState(false);
//   const [analyticsError, setAnalyticsError] = useState<string | null>(null);
//   const [isPlaying, setIsPlaying] = useState(true); // State for video play/pause
//   const [isMuted, setIsMuted] = useState(false); // State for video mute/unmute

//   const currentStatus = statuses[currentStatusIndex];
//   const isOwner = user._id === currentLoggedInUserId;

//   const STATUS_VIEW_DURATION = 5000; // 5 seconds per image status

//   const getAvatarSrc = (userObj: { avatarUrl?: string | null; name: string }): string =>
//     typeof userObj.avatarUrl === 'string' && userObj.avatarUrl.trim() !== ''
//       ? userObj.avatarUrl
//       : defaultAvatar.src;

//   // --- Define handleNext and handlePrev BEFORE startProgress ---
//   const handleNext = useCallback(() => {
//     if (currentStatusIndex < statuses.length - 1) {
//       setCurrentStatusIndex(prev => prev + 1);
//     } else {
//       onClose(); // Close modal if last status is viewed
//     }
//   }, [currentStatusIndex, statuses.length, onClose]);

//   const handlePrev = useCallback(() => {
//     if (currentStatusIndex > 0) {
//       setCurrentStatusIndex(prev => prev - 1);
//     }
//   }, [currentStatusIndex]);


//   const startProgress = useCallback(() => {
//     setProgress(0); // Reset progress when a new status starts
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     setIsPlaying(true); // Assume playing when status starts

//     if (currentStatus.mediaType === 'video') {
//       // For video, progress is driven by video playback
//       if (videoRef.current) {
//         videoRef.current.currentTime = 0; // Ensure video starts from beginning
//         videoRef.current.play().then(() => setIsPlaying(true)).catch(e => {
//           console.error("Error playing video:", e);
//           setIsPlaying(false); // Set playing to false if autoplay fails
//         });

//         const updateProgress = () => {
//           if (videoRef.current) {
//             const { currentTime, duration } = videoRef.current;
//             if (duration > 0) {
//               setProgress((currentTime / duration) * 100);
//             }
//           }
//         };
//         videoRef.current.ontimeupdate = updateProgress;
//         videoRef.current.onended = () => {
//           handleNext(); // Call handleNext here when video ends
//         };
//       }
//     } else {
//       // For image, use a fixed timer
//       intervalRef.current = setInterval(() => {
//         setProgress(prev => {
//           const newProgress = prev + (100 / (STATUS_VIEW_DURATION / 100)); // Increment every 100ms
//           if (newProgress >= 100) {
//             clearInterval(intervalRef.current!);
//             handleNext(); // Call handleNext here when image duration is over
//             return 100;
//           }
//           return newProgress;
//         });
//       }, 100);
//     }

//     // Mark status as viewed (only if not the owner and not already viewed)
//     if (!isOwner && !currentStatus.viewedByCurrentUser) {
//       onStatusViewed(currentStatus._id);
//     }
//   }, [currentStatus, isOwner, onStatusViewed, handleNext]); // Depend on handleNext too

//   const deleteStatus = async (statusId: string) => {
//     if (!window.confirm('Are you sure you want to delete this status?')) {
//       return;
//     }
//     try {
//       const token = await getIdToken();
//       if (!token) throw new Error('No auth token');

//       const res = await fetch(`${API_BASE_URL}/status/${statusId}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || 'Failed to delete status');
//       }

//       // Instead of filtering, which creates a new array for this modal,
//       // it's better to tell the parent (ActivityBar) to refetch/update.
//       // For now, we'll just close the modal and let ActivityBar handle the re-render.
//       onClose();
//       // A more robust solution would be to pass a specific `onStatusDeleted` callback
//       // to ActivityBar, which would then update its state.
//     } catch (err: any) {
//       console.error('Error deleting status:', err);
//       alert(`Error deleting status: ${err.message}`);
//     }
//   };

//   const fetchAnalytics = useCallback(async (statusId: string) => {
//     setAnalyticsLoading(true);
//     setAnalyticsError(null);
//     try {
//       const token = await getIdToken();
//       if (!token) throw new Error('No auth token');

//       const res = await fetch(`${API_BASE_URL}/status/analytics/${statusId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || 'Failed to fetch analytics');
//       }

//       const data = await res.json();
//       setAnalyticsData(data);
//       setShowAnalytics(true);
//     } catch (err: any) {
//       setAnalyticsError(err.message || 'Failed to fetch analytics');
//     } finally {
//       setAnalyticsLoading(false);
//     }
//   }, [getIdToken]);


//   // Effect to manage progress and auto-advance
//   useEffect(() => {
//     if (!currentStatus) {
//       onClose(); // Close modal if no current status (e.g., all deleted)
//       return;
//     }
//     startProgress();

//     // Cleanup on unmount or status change
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       if (videoRef.current) {
//         videoRef.current.ontimeupdate = null; // Clear event listener
//         videoRef.current.onended = null;     // Clear event listener
//         videoRef.current.pause();
//         videoRef.current.currentTime = 0;    // Reset video position
//       }
//     };
//   }, [currentStatusIndex, statuses, onClose, currentStatus, startProgress]); // Depend on startProgress

//   // Pause/Play functionality for both image and video
//   const togglePlayPause = useCallback(() => {
//     if (currentStatus.mediaType === 'video' && videoRef.current) {
//       if (videoRef.current.paused) {
//         videoRef.current.play();
//       } else {
//         videoRef.current.pause();
//       }
//       setIsPlaying(videoRef.current.paused); // Update state based on actual video state
//     } else if (currentStatus.mediaType === 'image') {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//         setIsPlaying(false);
//       } else {
//         startProgress(); // Resume progress
//         setIsPlaying(true);
//       }
//     }
//   }, [currentStatus, startProgress]);

//   const toggleMute = useCallback(() => {
//     if (videoRef.current) {
//       videoRef.current.muted = !videoRef.current.muted;
//       setIsMuted(videoRef.current.muted);
//     }
//   }, []);

//   if (!currentStatus) return null; // Should not happen if `statuses` is valid

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4"
//       onClick={(e) => {
//         // Close modal when clicking on backdrop, but not on content
//         if (e.target === e.currentTarget) {
//           onClose();
//         }
//       }}
//     >
//       <div className="relative w-full max-w-xl h-4/5 md:h-[90vh] bg-gray-900 rounded-lg shadow-2xl flex flex-col overflow-hidden">
//         {/* Top bar with progress indicators and user info */}
//         <div className="absolute top-0 left-0 right-0 z-10 p-2 flex flex-col">
//           <div className="flex space-x-1 mb-2">
//             {statuses.map((_, idx) => (
//               <div key={idx} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-white transition-all duration-100 ease-linear"
//                   style={{ width: `${idx < currentStatusIndex ? 100 : idx === currentStatusIndex ? progress : 0}%` }}
//                 ></div>
//               </div>
//             ))}
//           </div>
//           <div className="flex items-center justify-between p-2">
//             <div className="flex items-center space-x-3">
//               <Image
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 width={40}
//                 height={40}
//                 className="w-10 h-10 rounded-full object-cover border-2 border-white"
//               />
//               <span className="text-white font-semibold text-lg">{user.name}</span>
//               <span className="text-gray-400 text-sm ml-2">
//                 {formatDistanceToNow(new Date(currentStatus.createdAt), { addSuffix: true })}
//               </span>
//             </div>
//             <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-gray-700 transition">
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* Media content */}
//         <div className="flex-grow flex items-center justify-center bg-black" onClick={togglePlayPause}>
//           {currentStatus.mediaType === 'video' ? (
//             <video
//               ref={videoRef}
//               src={currentStatus.mediaUrl}
//               className="max-w-full max-h-full object-contain"
//               preload="auto"
//               playsInline
//               onLoadedMetadata={() => {
//                 if (videoRef.current && isPlaying) videoRef.current.play(); // Only autoplay if isPlaying is true
//               }}
//               onError={(e) => console.error('Video error:', e)}
//             />
//           ) : (
//             <Image
//               src={currentStatus.mediaUrl}
//               alt="Status content"
//               fill
//               objectFit="contain"
//               className="max-w-full max-h-full"
//               onError={(e) => console.error('Image error:', e)}
//             />
//           )}
//            {currentStatus.mediaType === 'video' && (
//             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
//               <button
//                 onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
//                 className="text-white text-2xl p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
//               >
//                 {isPlaying ? <Pause /> : <Play />}
//               </button>
//               <button
//                 onClick={(e) => { e.stopPropagation(); toggleMute(); }}
//                 className="text-white text-2xl p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 transition-colors"
//               >
//                 {isMuted ? <VolumeX /> : <Volume2 />}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Navigation Arrows */}
//         {statuses.length > 1 && (
//           <>
//             <button
//               onClick={(e) => { e.stopPropagation(); handlePrev(); }}
//               className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed z-20"
//               disabled={currentStatusIndex === 0}
//             >
//               <ChevronLeft size={32} />
//             </button>
//             <button
//               onClick={(e) => { e.stopPropagation(); handleNext(); }}
//               className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition disabled:opacity-50 disabled:cursor-not-allowed z-20"
//               disabled={currentStatusIndex === statuses.length - 1}
//             >
//               <ChevronRight size={32} />
//             </button>
//           </>
//         )}

//         {/* Bottom bar for owner with analytics and delete */}
//         {isOwner && (
//           <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gray-900 bg-opacity-70">
//             <button
//               onClick={() => fetchAnalytics(currentStatus._id)}
//               className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
//             >
//               <Eye size={20} />
//               <span>{currentStatus.viewCount} Views</span>
//             </button>
//             <button
//               onClick={() => deleteStatus(currentStatus._id)}
//               className="flex items-center space-x-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition"
//             >
//               <Trash2 size={20} />
//               <span>Delete</span>
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Analytics Modal */}
//       {showAnalytics && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[101]">
//           <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center relative">
//             <button onClick={() => setShowAnalytics(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
//               <X size={24} />
//             </button>
//             <h3 className="text-xl font-bold mb-4">Viewers</h3>
//             {analyticsLoading ? (
//               <p>Loading analytics...</p>
//             ) : analyticsError ? (
//               <p className="text-red-500">{analyticsError}</p>
//             ) : analyticsData && analyticsData.viewedBy.length > 0 ? (
//               <ul className="max-h-60 overflow-y-auto custom-scrollbar">
//                 {analyticsData.viewedBy.map((viewer: any) => (
//                   <li key={viewer._id} className="flex items-center space-x-3 py-2 border-b last:border-b-0">
//                     <Image
//                       src={getAvatarSrc(viewer)}
//                       alt={viewer.name}
//                       width={32}
//                       height={32}
//                       className="w-8 h-8 rounded-full object-cover"
//                     />
//                     <span className="font-medium">{viewer.name}</span>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No one has viewed this status yet.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StatusModal;

import React from 'react'

const StatusModal = () => {
  return (
    <div>StatusModal</div>
  )
}

export default StatusModal