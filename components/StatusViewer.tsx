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