// 'use client';

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useAuth } from '../AuthProvider';
// import { MoonLoader } from 'react-spinners';
// import { toast } from 'react-hot-toast';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import defaultUserLogo from '../../app/assets/userLogo.png'; // Correct import for default user logo
// import { Volume2, VolumeOff, ArrowUp, ArrowDown, Play, Pause } from 'lucide-react'; // Added Play, Pause icons

// // Define the interface for the post data (reels are essentially video posts)
// interface ReelPost {
//     _id: string;
//     text?: string;
//     mediaUrl?: string;
//     mediaType?: 'image' | 'video';
//     author: {
//         _id: string;
//         name: string;
//         avatarUrl?: string; // We will explicitly fetch and use this
//         firebaseUid: string;
//     };
//     likes: string[];
//     comments: any[];
//     createdAt: string;
// }

// // Define interface for the currentUser prop
// interface CurrentUser {
//     avatarUrl?: string;
//     // Add other user properties if needed, e.g., name, _id, etc.
// }

// interface ReelsFeedProps {
//     currentUser?: CurrentUser; // Define currentUser as an optional prop
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';
// const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'https://vartalaap-r36o.onrender.com';

// const ReelsFeed: React.FC<ReelsFeedProps> = ({ currentUser }) => { // Accept currentUser as a prop
//     const { user, getIdToken, loading: authLoading } = useAuth();
//     const [reels, setReels] = useState<ReelPost[]>([]);
//     const [currentReelIndex, setCurrentReelIndex] = useState(0);
//     const [loadingReels, setLoadingReels] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
//     const [isMuted, setIsMuted] = useState(true); // State to control mute/unmute
//     const [videoProgress, setVideoProgress] = useState(0); // State for video progress (0-100)
//     const [isPaused, setIsPaused] = useState(false); // NEW STATE for play/pause functionality
//     const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(true); // NEW STATE: Controls visibility of play/pause icon

//     const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
//     const containerRef = useRef<HTMLDivElement>(null);

//     const fetchReels = useCallback(async () => {
//         if (!user || authLoading) {
//             if (!authLoading) {
//                 console.warn("User not authenticated for reels. Skipping fetch.");
//                 setLoadingReels(false);
//             }
//             return;
//         }

//         setLoadingReels(true);
//         setError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 throw new Error("Authentication token not available. Please log in.");
//             }

//             const response = await fetch(`${API_BASE_URL}/posts/videos`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to fetch reels');
//             }

//             const data: ReelPost[] = await response.json();
//             const videoReels = data.filter(post => post.mediaType === 'video' && post.mediaUrl);
//             setReels(videoReels);
//             setLoadingReels(false);

//             if (videoReels.length > 0) {
//                 setPlayingVideoId(videoReels[0]._id);
//                 setIsPaused(false); // Ensure it starts playing and not paused initially
//                 setShowPlayPauseIcon(true); // Show icon briefly on first load
//             } else {
//                 setPlayingVideoId(null);
//                 setIsPaused(true); // If no videos, consider it paused
//                 setShowPlayPauseIcon(true); // Show icon if no video to play
//             }
//         } catch (err: any) {
//             console.error("Error fetching reels:", err);
//             setError(err.message || 'An unexpected error occurred.');
//             toast.error(err.message || 'Failed to load reels.');
//             setLoadingReels(false);
//         }
//     }, [user, authLoading, getIdToken]);

//     useEffect(() => {
//         if (!authLoading && user) {
//             fetchReels();
//         }
//     }, [authLoading, user, fetchReels]);

//     // Handle video playback and mute state based on playingVideoId and isPaused
//     useEffect(() => {
//         // Pause all videos and reset their time when current reel changes
//         videoRefs.current.forEach((video, id) => {
//             if (id !== playingVideoId && !video.paused) {
//                 video.pause();
//                 video.currentTime = 0; // Reset only non-playing videos
//             }
//         });

//         if (playingVideoId) {
//             const currentVideo = videoRefs.current.get(playingVideoId);
//             if (currentVideo) {
//                 currentVideo.muted = isMuted; // Apply current mute state
//                 if (!isPaused) { // Only play if not intentionally paused
//                     currentVideo.play().catch(e => console.error("Video play failed:", e));
//                     setShowPlayPauseIcon(true); // Show icon briefly on new reel autoplay
//                 } else {
//                     currentVideo.pause();
//                     setShowPlayPauseIcon(true); // Keep icon visible if it was manually paused
//                 }
//             }
//         }
//         // Reset progress when a new video starts playing
//         setVideoProgress(0);
//     }, [playingVideoId, reels, isMuted, isPaused]); // Added isMuted and isPaused dependencies

//     // Effect to auto-hide the play/pause icon after a delay when playing
//     useEffect(() => {
//         let timeoutId: NodeJS.Timeout | null = null;
//         if (!isPaused && playingVideoId) { // Only auto-hide if playing a video
//             timeoutId = setTimeout(() => {
//                 setShowPlayPauseIcon(false);
//             }, 1000); // Hide after 1 second (adjust as needed)
//         } else {
//             // If it's paused or no video playing, make sure icon is visible
//             setShowPlayPauseIcon(true);
//         }

//         return () => {
//             if (timeoutId) {
//                 clearTimeout(timeoutId);
//             }
//         };
//     }, [isPaused, playingVideoId, currentReelIndex]); // Added currentReelIndex to re-evaluate on reel change


//     // Handle scrolling and update current reel index
//     useEffect(() => {
//         const container = containerRef.current;
//         if (!container) return;

//         let scrollTimeout: NodeJS.Timeout | null = null;

//         const handleScroll = () => {
//             if (scrollTimeout) {
//                 clearTimeout(scrollTimeout);
//             }
//             scrollTimeout = setTimeout(() => {
//                 const viewportHeight = container.clientHeight;
//                 const reelElements = Array.from(container.children) as HTMLElement[];

//                 let newIndex = currentReelIndex;
//                 for (let i = 0; i < reelElements.length; i++) {
//                     const rect = reelElements[i].getBoundingClientRect();
//                     // Check if the reel is mostly in view (e.g., more than 50% visible)
//                     if (Math.abs(rect.top) < (viewportHeight * 0.5)) { // Simplified: if top is within 50% of viewport
//                         newIndex = i;
//                         break;
//                     }
//                 }

//                 if (newIndex !== currentReelIndex) {
//                     setCurrentReelIndex(newIndex);
//                     if (reels[newIndex]) {
//                         setPlayingVideoId(reels[newIndex]._id);
//                         setIsPaused(false); // Automatically play new reel on scroll
//                     } else {
//                         setPlayingVideoId(null);
//                         setIsPaused(true);
//                     }
//                 }
//             }, 150); // Debounce scroll
//         };

//         container.addEventListener('scroll', handleScroll);

//         return () => {
//             container.removeEventListener('scroll', handleScroll);
//             if (scrollTimeout) {
//                 clearTimeout(scrollTimeout);
//             }
//         };
//     }, [reels, currentReelIndex]);

//     // Manual navigation (buttons & keyboard)
//     const navigateReels = useCallback((direction: 'up' | 'down') => {
//         if (reels.length === 0) return;

//         let newIndex = currentReelIndex;
//         if (direction === 'down') {
//             newIndex = (currentReelIndex + 1) % reels.length;
//         } else { // 'up'
//             newIndex = (currentReelIndex - 1 + reels.length) % reels.length;
//             if (newIndex < 0) newIndex = reels.length - 1;
//         }

//         setCurrentReelIndex(newIndex);
//         if (reels[newIndex]) {
//             setPlayingVideoId(reels[newIndex]._id);
//             setIsPaused(false); // Automatically play on manual navigation
//             if (containerRef.current) {
//                 const targetDiv = containerRef.current.children[newIndex] as HTMLElement;
//                 if (targetDiv) {
//                     targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                 }
//             }
//         }
//     }, [currentReelIndex, reels.length, reels]);

//     // Keyboard navigation
//     useEffect(() => {
//         const handleKeyDown = (event: KeyboardEvent) => {
//             if (event.key === 'ArrowDown') {
//                 event.preventDefault();
//                 navigateReels('down');
//             } else if (event.key === 'ArrowUp') {
//                 event.preventDefault();
//                 navigateReels('up');
//             }
//         };

//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [navigateReels]);

//     // Helper to get full media URL
//     const getFullMediaUrl = (url: string | undefined) => {
//         if (!url) return '';
//         // If the URL already starts with http/https or is a data URL, return as is
//         // Otherwise, prepend the backend static base URL
//         return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')
//             ? url
//             : `${BACKEND_STATIC_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
//     };

//     const toggleMute = () => {
//         setIsMuted(prev => {
//             const currentVideo = videoRefs.current.get(playingVideoId!);
//             if (currentVideo) {
//                 currentVideo.muted = !prev; // Directly set muted state on the video element
//             }
//             return !prev;
//         });
//     };

//     // Function to toggle play/pause on video click
//     const togglePlayPause = () => {
//         const currentVideo = videoRefs.current.get(playingVideoId!);
//         if (currentVideo) {
//             if (currentVideo.paused) {
//                 currentVideo.play().catch(e => console.error("Video play failed on click:", e));
//                 setIsPaused(false);
//                 setShowPlayPauseIcon(true); // Show icon briefly when playing
//             } else {
//                 currentVideo.pause();
//                 setIsPaused(true);
//                 setShowPlayPauseIcon(true); // Always show icon when paused
//             }
//         }
//     };


//     // Video time update handler
//     const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
//         const video = e.currentTarget;
//         if (video.duration) { // Ensure duration is available to avoid NaN
//             setVideoProgress((video.currentTime / video.duration) * 100);
//         }
//     };

//     // Video seek handler
//     const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const video = videoRefs.current.get(playingVideoId!);
//         if (video && video.duration) { // Ensure video and duration are available
//             const seekTime = (parseFloat(e.target.value) / 100) * video.duration;
//             video.currentTime = seekTime;
//             setVideoProgress(parseFloat(e.target.value));
//         }
//     };

//     if (loadingReels) {
//         return (
//             <div className="flex flex-col items-center justify-center h-screen w-full bg-black">
//                 <MoonLoader color="#fff" size={50} />
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex flex-col items-center justify-center h-screen w-full text-red-600 font-semibold bg-gray-100">
//                 <p>Error: {error}</p>
//                 <button
//                     onClick={fetchReels}
//                     className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                 >
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     if (reels.length === 0) {
//         return (
//             <div className="flex items-center justify-center h-screen w-full text-gray-600 bg-gray-100">
//                 <p>No reels available yet!</p>
//             </div>
//         );
//     }

//     return (
//         <div className="relative flex flex-col items-center justify-center h-[86vh] w-full bg-black">
//             {/* Mute/Unmute Button */}
//             <button
//                 onClick={(e) => { // Add event parameter
//                     e.stopPropagation(); // Prevent click from bubbling up to video
//                     toggleMute();
//                 }}
//                 className="absolute top-2 right-2 p-2 bg-white/30 rounded-full text-white hover:bg-white/50 transition-all focus:outline-none z-20 cursor-pointer"
//                 aria-label={isMuted ? "Unmute" : "Mute"}
//             >
//                 {isMuted ? (
//                     // Muted icon
//                     <VolumeOff size={20} />
//                 ) : (
//                     // Unmuted icon
//                     <Volume2 size={20} />
//                 )}
//             </button>

//             {/* Reel Container - will handle scrolling */}
//             <div
//                 ref={containerRef}
//                 className="relative flex-grow w-full h-[86vh] overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
//             >
//                 {reels.map((reel, index) => {
//                     const shouldRenderVideo = index === currentReelIndex ||
//                         index === currentReelIndex - 1 ||
//                         index === currentReelIndex + 1;

//                     // Calculate authorAvatarSrc inside the map function for each reel
//                     const authorAvatarSrc = reel.author?.avatarUrl && reel.author.avatarUrl.trim() !== ''
//                         ? (reel.author.avatarUrl.startsWith('http') || reel.author.avatarUrl.startsWith('https')
//                             ? reel.author.avatarUrl
//                             : `${BACKEND_STATIC_BASE_URL}${reel.author.avatarUrl.startsWith('/') ? '' : '/'}${reel.author.avatarUrl}`)
//                         : defaultUserLogo.src;
//                     return (
//                         <div
//                             key={reel._id}
//                             className="relative w-full h-[86vh] snap-center flex flex-col items-center justify-center bg-black overflow-hidden"
//                             data-reel-id={reel._id}
//                             data-reel-index={index}
//                         >
//                             {/* Video element */}
//                             {shouldRenderVideo ? (
//                                 <video
//                                     ref={el => {
//                                         if (el) {
//                                             videoRefs.current.set(reel._id, el);
//                                         } else {
//                                             videoRefs.current.delete(reel._id);
//                                         }
//                                     }}
//                                     src={getFullMediaUrl(reel.mediaUrl)}
//                                     className="object-contain w-full h-full absolute inset-0 z-0"
//                                     autoPlay={reel._id === playingVideoId && !isPaused} // Only autoPlay if not paused
//                                     muted={isMuted} // Controlled by isMuted state
//                                     loop
//                                     playsInline
//                                     onEnded={() => navigateReels('down')}
//                                     onTimeUpdate={handleTimeUpdate} // Update progress
//                                     onError={(e) => console.error("Video load error:", e, reel.mediaUrl)}
//                                     onClick={togglePlayPause} // ADDED: Click to play/pause
//                                 />
//                             ) : (
//                                 <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 z-0">
//                                     <MoonLoader color="#fff" size={30} />
//                                     <p className="mt-2">Loading next reel...</p>
//                                 </div>
//                             )}

//                             {/* NEW: Play/Pause Icon Overlay */}
//                             {index === currentReelIndex && showPlayPauseIcon && (
//                                 <div
//                                     className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none" // pointer-events-none ensures video click works
//                                 >
//                                     {isPaused ? (
//                                         <Pause size={34} className="text-black drop-shadow-lg opacity-80 bg-gray-200 p-2 rounded-full cursor-pointer" />
//                                     ) : (
//                                         <Play size={34} className="text-black drop-shadow-lg opacity-80 bg-gray-200 p-2 rounded-full cursor-pointer" />
//                                     )}
//                                 </div>
//                             )}

//                             {/* Overlay content: User Info and Text/Skeleton */}
//                             {index === currentReelIndex && (
//                                 <div className="absolute bottom-0 left-0 right-0 p-4 pb-0 bg-gradient-to-t from-black/70 to-transparent text-white z-10 w-full">
//                                     {/* Author Info */}
//                                     <div className="flex items-center mb-2">
//                                         <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 flex-shrink-0">
//                                             {/* Author Avatar Image */}
//                                             <img
//                                                 src={authorAvatarSrc}
//                                                 alt={reel.author.name || 'Author Avatar'}
//                                                 className="w-full h-full rounded-full object-cover"
//                                                 onError={(e) => {
//                                                     const target = e.target as HTMLImageElement;
//                                                     target.onerror = null; // Prevents infinite loop
//                                                     target.src = defaultUserLogo.src; // Fallback to local default logo
//                                                     target.alt = reel.author.name ? reel.author.name[0].toUpperCase() : 'U';
//                                                 }}
//                                             />
//                                         </div>
//                                         <p className="font-semibold text-lg">{reel.author.name}</p>
//                                     </div>

//                                     {/* Reel Text / Skeleton */}
//                                     {reel.text !== null && reel.text !== undefined ? ( // Check if reel.text exists (is not null or undefined)
//                                         reel.text.trim() !== '' ? ( // Then check if it's not an empty string after trimming whitespace
//                                             <p className="text-sm">{reel.text}</p>
//                                         ) : (
//                                             // Only show skeleton if reel.text is an empty string (or just whitespace)
//                                             <>
//                                                 <Skeleton baseColor="#333" highlightColor="#555" height={20} width="20%" className="mb-2" />
//                                                 <Skeleton baseColor="#333" highlightColor="#555" height={15} width="20%" />
//                                             </>
//                                         )
//                                     ) : (
//                                         // If reel.text is null or undefined, render nothing
//                                         null
//                                     )}
//                                     {/* seek bar */}
//                                     <input
//                                         type="range"
//                                         min="0"
//                                         max="100"
//                                         value={videoProgress}
//                                         onChange={handleSeek}
//                                         className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 z-20 custom-range-slider"
//                                         style={{ background: `linear-gradient(to right, #fff ${videoProgress}%, #6b7280 ${videoProgress}%)` }}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Navigation Buttons */}
//             <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
//                 <button
//                     onClick={() => navigateReels('up')}
//                     className="p-3 bg-white/30 rounded-full text-white hover:bg-white/50 transition-all focus:outline-none"
//                     aria-label="Previous reel cursor-pointer"
//                 >
//                     <ArrowUp />
//                 </button>
//                 <button
//                     onClick={() => navigateReels('down')}
//                     className="p-3 bg-white/30 rounded-full text-white hover:bg-white/50 transition-all focus:outline-none"
//                     aria-label="Next reel cursor-pointer"
//                 >
//                     <ArrowDown />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ReelsFeed;


'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import { MoonLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import defaultUserLogo from '../../app/assets/userLogo.png'; // Correct import for default user logo
import { Volume2, VolumeOff, ArrowUp, ArrowDown, Play, Pause } from 'lucide-react'; // Added Play, Pause icons

// Define the interface for the post data (reels are essentially video posts)
interface ReelPost {
    _id: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    author: {
        _id: string;
        name: string;
        avatarUrl?: string; // We will explicitly fetch and use this
        firebaseUid: string;
    };
    likes: string[];
    comments: any[];
    createdAt: string;
}

// Define interface for the currentUser prop
interface CurrentUser {
    avatarUrl?: string;
    // Add other user properties if needed, e.g., name, _id, etc.
}

interface ReelsFeedProps {
    currentUser?: CurrentUser; // Define currentUser as an optional prop
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';
const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'https://vartalaap-r36o.onrender.com';

// --- DEBUGGING CONSOLE LOGS FOR ENVIRONMENT VARIABLES AND DEFAULT ASSETS ---
console.log('BACKEND_STATIC_BASE_URL:', BACKEND_STATIC_BASE_URL);
console.log('Default User Logo Source:', defaultUserLogo.src);
// --- END DEBUGGING CONSOLE LOGS ---

const ReelsFeed: React.FC<ReelsFeedProps> = ({ currentUser }) => { // Accept currentUser as a prop
    const { user, getIdToken, loading: authLoading } = useAuth();
    const [reels, setReels] = useState<ReelPost[]>([]);
    const [currentReelIndex, setCurrentReelIndex] = useState(0);
    const [loadingReels, setLoadingReels] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(true); // State to control mute/unmute
    const [videoProgress, setVideoProgress] = useState(0); // State for video progress (0-100)
    const [isPaused, setIsPaused] = useState(false); // NEW STATE for play/pause functionality
    const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(true); // NEW STATE: Controls visibility of play/pause icon

    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchReels = useCallback(async () => {
        if (!user || authLoading) {
            if (!authLoading) {
                console.warn("User not authenticated for reels. Skipping fetch.");
                setLoadingReels(false);
            }
            return;
        }

        setLoadingReels(true);
        setError(null);

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error("Authentication token not available. Please log in.");
            }

            const response = await fetch(`${API_BASE_URL}/posts/videos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch reels');
            }

            const data: ReelPost[] = await response.json();
            const videoReels = data.filter(post => post.mediaType === 'video' && post.mediaUrl);
            setReels(videoReels);
            setLoadingReels(false);

            if (videoReels.length > 0) {
                setPlayingVideoId(videoReels[0]._id);
                setIsPaused(false); // Ensure it starts playing and not paused initially
                setShowPlayPauseIcon(true); // Show icon briefly on first load of reels
            } else {
                setPlayingVideoId(null);
                setIsPaused(true); // If no videos, consider it paused
                setShowPlayPauseIcon(true); // Show icon if no video to play
            }
        } catch (err: any) {
            console.error("Error fetching reels:", err);
            setError(err.message || 'An unexpected error occurred.');
            toast.error(err.message || 'Failed to load reels.');
            setLoadingReels(false);
        }
    }, [user, authLoading, getIdToken]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchReels();
        }
    }, [authLoading, user, fetchReels]);

    // Handle video playback and mute state based on playingVideoId and isPaused
    useEffect(() => {
        // Pause all videos and reset their time when current reel changes
        videoRefs.current.forEach((video, id) => {
            if (id !== playingVideoId && !video.paused) {
                video.pause();
                video.currentTime = 0; // Reset only non-playing videos
            }
        });

        if (playingVideoId) {
            const currentVideo = videoRefs.current.get(playingVideoId);
            if (currentVideo) {
                currentVideo.muted = isMuted; // Apply current mute state
                if (!isPaused) { // Only play if not intentionally paused
                    currentVideo.play().catch(e => console.error("Video play failed:", e));
                    // setShowPlayPauseIcon(true); // Decided to let the onLoadedData or the auto-hide useEffect manage this for new reels
                } else {
                    currentVideo.pause();
                    setShowPlayPauseIcon(true); // Keep icon visible if it was manually paused
                }
            }
        }
        // Reset progress when a new video starts playing
        setVideoProgress(0);
    }, [playingVideoId, reels, isMuted, isPaused]); // Added isMuted and isPaused dependencies

    // Effect to auto-hide the play/pause icon after a delay when playing
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (!isPaused && playingVideoId) { // Only auto-hide if playing a video
            timeoutId = setTimeout(() => {
                setShowPlayPauseIcon(false);
            }, 1000); // Hide after 1 second (adjust as needed)
        } else {
            // If it's paused or no video playing, make sure icon is visible
            setShowPlayPauseIcon(true);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isPaused, playingVideoId, currentReelIndex]); // Added currentReelIndex to re-evaluate on reel change


    // Handle scrolling and update current reel index
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let scrollTimeout: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                const viewportHeight = container.clientHeight;
                const reelElements = Array.from(container.children) as HTMLElement[];

                let newIndex = currentReelIndex;
                for (let i = 0; i < reelElements.length; i++) {
                    const rect = reelElements[i].getBoundingClientRect();
                    // Check if the reel is mostly in view (e.g., more than 50% visible)
                    if (Math.abs(rect.top) < (viewportHeight * 0.5)) { // Simplified: if top is within 50% of viewport
                        newIndex = i;
                        break;
                    }
                }

                if (newIndex !== currentReelIndex) {
                    setCurrentReelIndex(newIndex);
                    if (reels[newIndex]) {
                        setPlayingVideoId(reels[newIndex]._id);
                        setIsPaused(false); // Automatically play new reel on scroll
                        setShowPlayPauseIcon(true); // Show icon briefly when new reel appears
                    } else {
                        setPlayingVideoId(null);
                        setIsPaused(true);
                        setShowPlayPauseIcon(true); // Ensure icon is visible if no video
                    }
                }
            }, 150); // Debounce scroll
        };

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, [reels, currentReelIndex]);

    // Manual navigation (buttons & keyboard)
    const navigateReels = useCallback((direction: 'up' | 'down') => {
        if (reels.length === 0) return;

        let newIndex = currentReelIndex;
        if (direction === 'down') {
            newIndex = (currentReelIndex + 1) % reels.length;
        } else { // 'up'
            newIndex = (currentReelIndex - 1 + reels.length) % reels.length;
            if (newIndex < 0) newIndex = reels.length - 1;
        }

        setCurrentReelIndex(newIndex);
        if (reels[newIndex]) {
            setPlayingVideoId(reels[newIndex]._id);
            setIsPaused(false); // Automatically play on manual navigation
            setShowPlayPauseIcon(true); // Show icon briefly when navigating
            if (containerRef.current) {
                const targetDiv = containerRef.current.children[newIndex] as HTMLElement;
                if (targetDiv) {
                    targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }, [currentReelIndex, reels.length, reels]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                navigateReels('down');
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                navigateReels('up');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigateReels]);

    // Helper to get full media URL
    const getFullMediaUrl = (url: string | undefined) => {
        if (!url) return '';
        // If the URL already starts with http/https or is a data URL, return as is
        // Otherwise, prepend the backend static base URL
        return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')
            ? url
            : `${BACKEND_STATIC_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const toggleMute = () => {
        setIsMuted(prev => {
            const currentVideo = videoRefs.current.get(playingVideoId!);
            if (currentVideo) {
                currentVideo.muted = !prev; // Directly set muted state on the video element
            }
            return !prev;
        });
    };

    // Function to toggle play/pause on video click
    const togglePlayPause = () => {
        const currentVideo = videoRefs.current.get(playingVideoId!);
        if (currentVideo) {
            if (currentVideo.paused) {
                currentVideo.play().catch(e => console.error("Video play failed on click:", e));
                setIsPaused(false);
                setShowPlayPauseIcon(true); // Show icon when starting to play
            } else {
                currentVideo.pause();
                setIsPaused(true);
                setShowPlayPauseIcon(true); // Always show icon when paused
            }
        }
    };


    // Video time update handler
    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = e.currentTarget;
        if (video.duration) { // Ensure duration is available to avoid NaN
            setVideoProgress((video.currentTime / video.duration) * 100);
        }
    };

    // Video seek handler
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRefs.current.get(playingVideoId!);
        if (video && video.duration) { // Ensure video and duration are available
            const seekTime = (parseFloat(e.target.value) / 100) * video.duration;
            video.currentTime = seekTime;
            setVideoProgress(parseFloat(e.target.value));
            // You can decide if you want the video to resume playing after a seek.
            // For typical player behavior, it often resumes.
            // if (isPaused) {
            //     video.play().catch(e => console.error("Video play failed after seek:", e));
            //     setIsPaused(false);
            // }
        }
    };

    // Handler for when video data is loaded, can be used to set initial icon visibility
    const handleVideoLoadedData = useCallback(() => {
        if (!isPaused && playingVideoId) { // Only hide if it's supposed to be playing
            setShowPlayPauseIcon(true); // Show it initially, then auto-hide useEffect will take over
        } else if (isPaused) {
            setShowPlayPauseIcon(true); // If already paused, ensure it's visible
        }
    }, [isPaused, playingVideoId]);


    if (loadingReels) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full bg-black">
                <MoonLoader color="#fff" size={50} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full text-red-600 font-semibold bg-gray-100">
                <p>Error: {error}</p>
                <button
                    onClick={fetchReels}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen w-full text-gray-600 bg-gray-100">
                <p>No reels available yet!</p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center h-auto w-full bg-black hide-scrollbar">
            {/* Mute/Unmute Button */}
            <button
                onClick={(e) => { // Added event parameter and stopPropagation
                    e.stopPropagation(); // Prevents click from bubbling to video
                    toggleMute();
                }}
                className="absolute top-2 right-2 p-2 bg-white/30 rounded-full text-white hover:bg-white/50 transition-all focus:outline-none z-20 cursor-pointer"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                    // Muted icon
                    <VolumeOff size={20} />
                ) : (
                    // Unmuted icon
                    <Volume2 size={20} />
                )}
            </button>

            {/* Reel Container - will handle scrolling */}
            <div
                ref={containerRef}
                className="relative flex-grow w-full h-[89vh] overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
            >
                {reels.map((reel, index) => {
                    const shouldRenderVideo = index === currentReelIndex ||
                        index === currentReelIndex - 1 ||
                        index === currentReelIndex + 1;

                    // Calculate authorAvatarSrc inside the map function for each reel
                    const authorAvatarSrc = reel.author?.avatarUrl && reel.author.avatarUrl.trim() !== ''
                        ? (reel.author.avatarUrl.startsWith('http') || reel.author.avatarUrl.startsWith('https')
                            ? reel.author.avatarUrl
                            : `${BACKEND_STATIC_BASE_URL}${reel.author.avatarUrl.startsWith('/') ? '' : '/'}${reel.author.avatarUrl}`)
                        : defaultUserLogo.src;
                    // --- DEBUGGING CONSOLE LOGS FOR EACH REEL'S AVATAR ---
                    console.log(`Reel ID: ${reel._id}, Index: ${index}`);
                    console.log(`  Author Avatar URL (raw):`, reel.author?.avatarUrl);
                    console.log(`  Author Avatar Source (resolved):`, authorAvatarSrc);
                    // --- END DEBUGGING CONSOLE LOGS ---

                    return (
                        <div
                            key={reel._id}
                            className="relative w-full h-[89vh] snap-center flex flex-col items-center justify-center bg-black overflow-hidden"
                            data-reel-id={reel._id}
                            data-reel-index={index}
                        >
                            {/* Video element */}
                            {shouldRenderVideo ? (
                                <video
                                    ref={el => {
                                        if (el) {
                                            videoRefs.current.set(reel._id, el);
                                        } else {
                                            videoRefs.current.delete(reel._id);
                                        }
                                    }}
                                    src={getFullMediaUrl(reel.mediaUrl)}
                                    className="object-contain w-full h-full absolute inset-0 z-0"
                                    autoPlay={reel._id === playingVideoId && !isPaused} // Only autoPlay if not paused
                                    muted={isMuted} // Controlled by isMuted state
                                    loop
                                    playsInline
                                    onEnded={() => navigateReels('down')}
                                    onTimeUpdate={handleTimeUpdate} // Update progress
                                    onLoadedData={handleVideoLoadedData} // Added for better initial icon state
                                    onError={(e) => console.error("Video load error:", e, reel.mediaUrl)}
                                    onClick={togglePlayPause} // ADDED: Click to play/pause
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 z-0">
                                    <MoonLoader color="#fff" size={30} />
                                    <p className="mt-2">Loading next reel...</p>
                                </div>
                            )}

                            {/* NEW: Play/Pause Icon Overlay */}
                            {index === currentReelIndex && showPlayPauseIcon && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none" // pointer-events-none ensures video click works
                                >
                                    {isPaused ? (
                                        <Pause size={34} className="text-black drop-shadow-lg opacity-80 bg-gray-200 p-2 rounded-full cursor-pointer" />
                                    ) : (
                                        <Play size={34} className="text-black drop-shadow-lg opacity-80 bg-gray-200 p-2 rounded-full cursor-pointer" />
                                    )}
                                </div>
                            )}

                            {/* Overlay content: User Info and Text/Skeleton */}
                            {index === currentReelIndex && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 pb-0 bg-gradient-to-t from-black/70 to-transparent text-white z-10 w-full">
                                    {/* Author Info */}
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 flex-shrink-0">
                                            {/* Author Avatar Image */}
                                            <img
                                                src={authorAvatarSrc} // This is the image that was causing the TypeError
                                                alt={reel.author.name || 'Author Avatar'}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null; // Prevents infinite loop
                                                    target.src = defaultUserLogo.src; // Fallback to local default logo
                                                    target.alt = reel.author.name ? reel.author.name[0].toUpperCase() : 'U';
                                                    console.error(`Error loading avatar for ${reel.author.name}. Falling back to default. Original URL: ${authorAvatarSrc}`);
                                                }}
                                            />
                                        </div>
                                        <p className="font-semibold text-lg">{reel.author.name}</p>
                                    </div>

                                    {/* Reel Text / Skeleton */}
                                    {reel.text !== null && reel.text !== undefined ? ( // Check if reel.text exists (is not null or undefined)
                                        reel.text.trim() !== '' ? ( // Then check if it's not an empty string after trimming whitespace
                                            <p className="text-sm">{reel.text}</p>
                                        ) : (
                                            // Only show skeleton if reel.text is an empty string (or just whitespace)
                                            <>
                                                <Skeleton baseColor="#333" highlightColor="#555" height={20} width="20%" className="mb-2" />
                                                <Skeleton baseColor="#333" highlightColor="#555" height={15} width="20%" />
                                            </>
                                        )
                                    ) : (
                                        // If reel.text is null or undefined, render nothing
                                        null
                                    )}
                                    {/* seek bar */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={videoProgress}
                                        onChange={handleSeek}
                                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2 z-20 custom-range-slider"
                                        style={{ background: `linear-gradient(to right, #fff ${videoProgress}%, #6b7280 ${videoProgress}%)` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
                <button
                    onClick={() => navigateReels('up')}
                    className="p-3 bg-white/30 rounded-full text-white hover:bg-white/50 transition-all focus:outline-none"
                    aria-label="Previous reel cursor-pointer"
                >
                    <ArrowUp />
                </button>
                <button
                    onClick={() => navigateReels('down')}
                    className="p-3 bg-white/30 rounded-full text-white hover:bg-white/50 transition-all focus:outline-none"
                    aria-label="Next reel cursor-pointer"
                >
                    <ArrowDown />
                </button>
            </div>
        </div>
    );
};

export default ReelsFeed;