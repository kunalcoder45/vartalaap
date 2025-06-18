import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Eye, Clock } from 'lucide-react';

// Define the interfaces for better type safety
export interface Status {
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
}

interface StatusViewerProps {
    isOpen: boolean;
    onClose: () => void;
    user: User; // The user whose statuses are being viewed
    statuses: Status[]; // All statuses for this user
    currentUserData: User | null; // The currently logged-in user's data (for view logic)
    getFullMediaUrl: (relativePath?: string) => string;
    defaultAvatarUrl: string;
    markAsViewed: (statusId: string) => Promise<void>; // Function to mark a status as viewed
    fetchUserDetails: (userIds: string[]) => Promise<User[]>; // New prop to fetch user details
}

const StatusViewer = ({
    isOpen,
    onClose,
    user,
    statuses,
    currentUserData,
    getFullMediaUrl,
    defaultAvatarUrl,
    markAsViewed,
    fetchUserDetails
}: StatusViewerProps) => {
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showViewedByDropdown, setShowViewedByDropdown] = useState(false);
    const [viewedByUsers, setViewedByUsers] = useState<User[]>([]);
    const [isLoadingViewers, setIsLoadingViewers] = useState(false); // New loading state for viewers
    const dropdownRef = useRef<HTMLDivElement>(null);

    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const STORY_DURATION = 15000; // 15 seconds for images
    const currentStatus = statuses[currentStatusIndex];

    // Helper functions
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeAgo = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / (24 * 60))}d ago`;
    };

    // Callback functions for navigation and playback
    const handleNext = useCallback(() => {
        if (currentStatusIndex < statuses.length - 1) {
            setCurrentStatusIndex(prev => prev + 1);
        } else {
            onClose();
        }
    }, [currentStatusIndex, statuses.length, onClose]);

    const handlePrevious = useCallback(() => {
        if (currentStatusIndex > 0) {
            setCurrentStatusIndex(prev => prev - 1);
        }
    }, [currentStatusIndex]);

    const handleStatusClick = useCallback((index: number) => {
        setCurrentStatusIndex(index);
    }, []);

    const handlePlayPause = useCallback(() => {
        if (currentStatus?.mediaType === 'video' && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            } else {
                videoRef.current.play();
                // For video, timeUpdate listener will handle progress, no need for a separate interval here
            }
            setIsPlaying(prev => !prev);
        } else if (currentStatus?.mediaType === 'image') {
            // For images, we control the progress interval
            if (isPlaying) {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            } else {
                const remainingDuration = STORY_DURATION * (1 - progress / 100);
                const startTime = Date.now();
                progressIntervalRef.current = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const newProgress = Math.min((elapsed / remainingDuration) * (100 - progress) + progress, 100);
                    setProgress(newProgress);
                    setTimeRemaining(Math.max(0, Math.ceil((remainingDuration - elapsed) / 1000)));
                    if (newProgress >= 100) {
                        handleNext();
                    }
                }, 100);
            }
            setIsPlaying(prev => !prev);
        }
    }, [isPlaying, currentStatus, progress, handleNext]);

    // Function to toggle views dropdown and fetch user details
    const toggleViewedByDropdown = useCallback(async () => {
        setShowViewedByDropdown(prev => !prev);
        // Only fetch if dropdown is about to open and there are viewers
        if (!showViewedByDropdown && currentStatus?.viewedBy && currentStatus.viewedBy.length > 0) {
            setIsLoadingViewers(true); // Set loading true
            try {
                const details = await fetchUserDetails(currentStatus.viewedBy);
                setViewedByUsers(details);
            } catch (error) {
                console.error("Failed to fetch viewer details:", error);
                // Optionally handle error, e.g., show a toast message
            } finally {
                setIsLoadingViewers(false); // Set loading false
            }
        }
    }, [showViewedByDropdown, currentStatus?.viewedBy, fetchUserDetails]);


    // Effect for handling progress bar, media playback, and marking as viewed
    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setCurrentStatusIndex(0);
            setProgress(0);
            setIsPlaying(false);
            setTimeRemaining(0);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            // Close dropdown and clear viewed by users on close
            setShowViewedByDropdown(false);
            setViewedByUsers([]);
            setIsLoadingViewers(false); // Reset loading state
            return;
        }

        // If the viewer is open and we have a current status
        if (currentStatus) {
            console.log(`[StatusViewer] Current status changed to index: ${currentStatusIndex}, id: ${currentStatus._id}`);
            setProgress(0);
            setIsPlaying(true);

            // Clear any existing progress interval
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }

            // Mark as viewed when a new status is displayed (only if not own status)
            if (currentUserData && user._id !== currentUserData._id) {
                markAsViewed(currentStatus._id);
            }

            // Handle media playback and timer
            if (currentStatus.mediaType === 'video' && videoRef.current) {
                const video = videoRef.current;
                video.load(); // Reload video source if it changes
                video.onloadedmetadata = () => {
                    if (video) {
                        setTimeRemaining(Math.ceil(video.duration));
                        video.play().catch(e => console.error("Video autoplay failed:", e));
                    }
                };
            } else {
                // For images, set a fixed duration timer
                const startTime = Date.now();
                setTimeRemaining(Math.ceil(STORY_DURATION / 1000));
                progressIntervalRef.current = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progressPercent = Math.min((elapsed / STORY_DURATION) * 100, 100);
                    setProgress(progressPercent);
                    setTimeRemaining(Math.max(0, Math.ceil((STORY_DURATION - elapsed) / 1000)));

                    if (progressPercent >= 100) {
                        handleNext();
                    }
                }, 100);
            }
            // Close dropdown and clear viewed by users on status change
            setShowViewedByDropdown(false);
            setViewedByUsers([]);
            setIsLoadingViewers(false); // Reset loading state
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [isOpen, currentStatusIndex, currentStatus, user._id, currentUserData?._id, markAsViewed, handleNext]);


    // Video specific event listeners
    useEffect(() => {
        if (currentStatus?.mediaType === 'video' && videoRef.current) {
            const video = videoRef.current;

            const handleLoadedMetadata = () => {
                setTimeRemaining(Math.ceil(video.duration));
            };

            const handleTimeUpdate = () => {
                if (video.duration) {
                    const progressPercent = (video.currentTime / video.duration) * 100;
                    setProgress(progressPercent);
                    setTimeRemaining(Math.max(0, Math.ceil(video.duration - video.currentTime)));
                }
            };

            const handleEnded = () => {
                handleNext();
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('ended', handleEnded);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('ended', handleEnded);
            };
        }
    }, [currentStatus, handleNext]);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowViewedByDropdown(false);
            }
        };
        if (showViewedByDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showViewedByDropdown]);


    if (!isOpen || !currentStatus) return null;

    return (
        <div className="fixed inset-0 bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative w-full max-w-md mx-4 h-[85vh] top-8 max-h-[90vh] rounded-lg overflow-hidden">
                {/* Header with progress bars */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4">
                    {/* Progress bars */}
                    <div className="flex space-x-1 mb-4">
                        {statuses.map((_, index) => (
                            <div
                                key={index}
                                className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                                onClick={() => handleStatusClick(index)}
                                aria-label={`Progress for status ${index + 1}`} // Added aria-label
                            >
                                <div
                                    className="h-full bg-white transition-all duration-300 ease-linear"
                                    style={{
                                        width: index < currentStatusIndex ? '100%' :
                                            index === currentStatusIndex ? `${progress}%` : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* User info and controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src={getFullMediaUrl(user.avatarUrl)}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = defaultAvatarUrl;
                                }}
                            />
                            <div>
                                <h3 className="text-white font-semibold text-sm">{user.name}</h3>
                                <p className="text-gray-300 text-xs">
                                    {getTimeAgo(currentStatus.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Timer */}
                            <div className="flex items-center space-x-1 text-white text-sm">
                                <Clock size={14} />
                                <span>{formatTime(timeRemaining)}</span>
                            </div>

                            {/* Views count (only show for own status) */}
                            {user._id === currentUserData?._id && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={toggleViewedByDropdown}
                                        className="flex items-center space-x-1 text-white text-sm hover:text-gray-300 transition-colors"
                                        aria-label={`Viewers of this status. Currently ${currentStatus.viewedBy?.length || 0} views.`} // Added aria-label
                                    >
                                        <Eye size={14} />
                                        <span>{currentStatus.viewedBy?.length || 0}</span>
                                    </button>
                                    {showViewedByDropdown && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 max-h-48 overflow-y-auto">
                                            {isLoadingViewers ? (
                                                <p className="text-gray-400 text-sm p-3">Loading views...</p>
                                            ) : viewedByUsers.length > 0 ? (
                                                viewedByUsers.map((viewer) => (
                                                    <div key={viewer._id} className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer">
                                                        <img
                                                            src={getFullMediaUrl(viewer.avatarUrl)}
                                                            alt={viewer.name}
                                                            className="w-8 h-8 rounded-full object-cover mr-2"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = defaultAvatarUrl;
                                                            }}
                                                        />
                                                        <span className="text-white text-sm">{viewer.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-sm p-3">No views yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-300 transition-colors"
                                aria-label="Close status viewer" // Added aria-label
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation buttons */}
                <button
                    onClick={handlePrevious}
                    disabled={currentStatusIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous status" // Added aria-label
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                    aria-label="Next status" // Added aria-label
                >
                    <ChevronRight size={24} />
                </button>

                {/* Media content */}
                <div
                    className="w-full h-full flex items-center justify-center bg-black"
                    onClick={currentStatus.mediaType === 'video' ? handlePlayPause : undefined}
                    role={currentStatus.mediaType === 'video' ? "button" : undefined} // Indicate it's an interactive element for videos
                    aria-label={currentStatus.mediaType === 'video' ? (isPlaying ? "Pause video" : "Play video") : undefined} // Added aria-label for video
                >
                    {currentStatus.mediaType === 'video' ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted
                            playsInline
                            key={currentStatus._id}
                        >
                            <source
                                src={getFullMediaUrl(currentStatus.mediaUrl)}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                            src={getFullMediaUrl(currentStatus.mediaUrl)}
                            alt="Status"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = defaultAvatarUrl;
                            }}
                        />
                    )}
                </div>

                {/* Bottom status indicator */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="flex justify-center space-x-2">
                        {statuses.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleStatusClick(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentStatusIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-gray-500 hover:bg-gray-300'
                                }`}
                                aria-label={`Go to status ${index + 1}`} // Added aria-label
                            />
                        ))}
                    </div>

                    {/* Status info */}
                    <div className="text-center mt-2">
                        <p className="text-white text-sm">
                            {currentStatusIndex + 1} of {statuses.length}
                        </p>
                        {currentStatus.visibility && (
                            <p className="text-gray-300 text-xs mt-1 capitalize">
                                {currentStatus.visibility}
                            </p>
                        )}
                    </div>
                </div>

                {/* Play/Pause overlay for videos */}
                {currentStatus.mediaType === 'video' && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusViewer;