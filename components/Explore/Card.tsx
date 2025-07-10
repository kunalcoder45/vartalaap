// 'use client';

// import React from 'react';
// import Image from 'next/image';
// // import Link from 'next/link';

// interface PostAuthor {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     firebaseUid: string;
// }

// interface Post {
//     _id: string;
//     text?: string;
//     mediaUrl?: string;
//     mediaType?: 'image' | 'video';
//     author: PostAuthor | null;
//     likes: string[];
//     sharesBy: string[];
//     comments: any[];
//     createdAt: string;
// }

// interface CardProps {
//     post: Post;
// }

// const defaultAvatar = '/userLogo.png';

// const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'https://vartalaap-r36o.onrender.com';

// const Card: React.FC<CardProps> = ({ post }) => {
//     const authorName = post.author?.name || 'Unknown User';

//     const authorAvatar = post.author?.avatarUrl
//         ? post.author.avatarUrl.startsWith('http') || post.author.avatarUrl.startsWith('data:')
//             ? post.author.avatarUrl
//             : `${BACKEND_STATIC_BASE_URL}${post.author.avatarUrl.startsWith('/') ? '' : '/'}${post.author.avatarUrl}`
//         // : `${BACKEND_STATIC_BASE_URL}${defaultAvatar}`;
//         : defaultAvatar;

//     const fullMediaUrl = post.mediaUrl
//         ? post.mediaUrl.startsWith('http') || post.mediaUrl.startsWith('data:')
//             ? post.mediaUrl
//             : `${BACKEND_STATIC_BASE_URL}${post.mediaUrl.startsWith('/') ? '' : '/'}${post.mediaUrl}`
//         : undefined;

//     if (!fullMediaUrl) {
//         return null;
//     }

//     if (!post.author) {
//         console.warn(`Post with ID ${post._id} has media but no valid author. Rendering with placeholder author.`);
//     }

//     // --- Video Debugging Tip ---
//     if (post.mediaType === 'video') {
//         console.log('Attempting to load video:', fullMediaUrl);
//     }
//     // --- End Video Debugging Tip ---

//     return (
//         <div className="relative group overflow-hidden rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200 ease-in-out w-full">
//             {/* <Link href={`/post/${post._id}`} className="block w-full h-full"> */}
//                 {post.mediaType === 'image' && (
//                     <div className="relative w-full h-auto">
//                         <Image
//                             src={fullMediaUrl}
//                             alt={post.text || `Post by ${authorName}`}
//                             width={500}
//                             height={500}
//                             className="object-contain w-full h-auto transition-transform duration-300 group-hover:scale-105"
//                             sizes="100vw"
//                             priority
//                         />
//                     </div>
//                 )}
//                 {post.mediaType === 'video' && (
//                     <div className="relative w-full h-auto bg-black flex items-center justify-center">
//                         <video
//                             src={fullMediaUrl}
//                             className="object-contain w-full h-auto"
//                             controls // TEMPORARILY SET TO TRUE FOR DEBUGGING
//                             autoPlay
//                             muted
//                             loop
//                             playsInline
//                         />
//                         {/* Play icon overlay on hover */}
//                         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
//                             </svg>
//                         </div>
//                     </div>
//                 )}
//             {/* </Link> */}

//             <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <div className="flex items-center gap-2 mb-2">
//                     <Image
//                         src={authorAvatar}
//                         alt={authorName}
//                         width={24}
//                         height={24}
//                         className="rounded-full object-cover"
//                     />
//                     <span className="font-semibold text-sm truncate">{authorName}</span>
//                 </div>
//                 <div className="flex justify-between items-center text-xs">
//                     <div className="flex items-center gap-1">
//                         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
//                         </svg>
//                         <span>{post.likes.length}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
//                             <path d="M7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
//                             <path fillRule="evenodd" d="M15.828 7.172a3 3 0 00-4.242 0L10 8.757l-1.586-1.585a3 3 0 10-4.242 4.242L10 16.243l5.828-5.829a3 3 0 000-4.242zM10 1.5A.5.5 0 009.5 2V3h1V2A.5.5 0 0010 1.5zm-5.707 3.328a.5.5 0 00-.707.707L4.793 6.5a.5.5 0 00.707-.707L4.293 4.828zM14.707 4.828a.5.5 0 00.707.707L15.707 6.5a.5.5 0 00-.707-.707l-.793-.793zM10 17.5a.5.5 0 00.5.5h-1a.5.5 0 00.5-.5zM17 9.5a.5.5 0 00-.5-.5H16v1h.5a.5.5 0 00.5-.5zm-1.793-1.293a.5.5 0 00-.707.707L15.207 9.5a.5.5 0 00.707-.707L15.207 8.207zM3 9.5a.5.5 0 00-.5.5H2v1h.5a.5.5 0 00.5-.5zm1.293-1.293a.5.5 0 00-.707-.707L3.793 8.5a.5.5 0 00.707.707L4.293 8.207z" clipRule="evenodd" />
//                         </svg>
//                         <span>{post.sharesBy.length}</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Card;

'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
// import Link from 'next/link';

// Lucide React icons for controls
import { Play, Pause, Volume2, VolumeX, FastForward, Rewind, Maximize } from 'lucide-react';

interface PostAuthor {
    _id: string;
    name: string;
    avatarUrl?: string;
    firebaseUid: string;
}

interface Post {
    _id: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    author: PostAuthor | null;
    likes: string[];
    sharesBy: string[];
    comments: any[];
    createdAt: string;
}

interface CardProps {
    post: Post;
}

const defaultAvatar = '/userLogo.png';

const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'https://vartalaap-r36o.onrender.com';

const Card: React.FC<CardProps> = ({ post }) => {
    const authorName = post.author?.name || 'Unknown User';

    const authorAvatar = post.author?.avatarUrl
        ? post.author.avatarUrl.startsWith('http') || post.author.avatarUrl.startsWith('data:')
            ? post.author.avatarUrl
            : `${BACKEND_STATIC_BASE_URL}${post.author.avatarUrl.startsWith('/') ? '' : '/'}${post.author.avatarUrl}`
        : defaultAvatar;

    const fullMediaUrl = post.mediaUrl
        ? post.mediaUrl.startsWith('http') || post.mediaUrl.startsWith('data:')
            ? post.mediaUrl
            : `${BACKEND_STATIC_BASE_URL}${post.mediaUrl.startsWith('/') ? '' : '/'}${post.mediaUrl}`
        : undefined;

    if (!fullMediaUrl) {
        return null;
    }

    if (!post.author) {
        console.warn(`Post with ID ${post._id} has media but no valid author. Rendering with placeholder author.`);
    }

    // --- Video Specific State and Refs ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.5); // New state for actual volume (0 to 1)
    const [lastVolume, setLastVolume] = useState(0.5); // To store volume before muting
    const [progress, setProgress] = useState(0); // 0 to 100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isHovering, setIsHovering] = useState(false); // To show controls on hover

    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            if (isMuted) {
                // If currently muted, unmute and restore last known volume or default
                videoRef.current.muted = false;
                videoRef.current.volume = lastVolume > 0 ? lastVolume : 0.5; // Restore, or set to 0.5 if lastVolume was 0
                setVolume(lastVolume > 0 ? lastVolume : 0.5);
                setIsMuted(false);
            } else {
                // If currently unmuted, mute and save current volume
                setLastVolume(videoRef.current.volume); // Save current volume before muting
                videoRef.current.muted = true;
                videoRef.current.volume = 0; // Set actual volume to 0
                setVolume(0);
                setIsMuted(true);
            }
        }
    }, [isMuted, lastVolume]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const newVolume = parseFloat(e.target.value);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            if (newVolume > 0 && isMuted) {
                // If volume is increased from 0 while muted, unmute
                videoRef.current.muted = false;
                setIsMuted(false);
            } else if (newVolume === 0 && !isMuted) {
                // If volume is set to 0, mute
                videoRef.current.muted = true;
                setIsMuted(true);
            }
            // If the user drags the volume slider, and it's not 0, update lastVolume
            if (newVolume > 0) {
                setLastVolume(newVolume);
            }
        }
    }, [isMuted]);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            setCurrentTime(current);
            setDuration(dur);
            setProgress((current / dur) * 100 || 0);
        }
    }, []);

    const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const newProgress = parseFloat(e.target.value);
            const newTime = (newProgress / 100) * duration;
            videoRef.current.currentTime = newTime;
            setProgress(newProgress);
        }
    }, [duration]);

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Auto-play and mute on load, and reset state if post changes
    useEffect(() => {
        if (videoRef.current && post.mediaType === 'video') {
            videoRef.current.muted = true; // Ensure it starts muted
            videoRef.current.volume = 0; // Set initial volume to 0 when muted
            setIsMuted(true);
            setVolume(0); // Sync state
            setLastVolume(0.5); // Reset last volume for new video

            videoRef.current.play().catch(error => {
                // Autoplay might be blocked by browser. Handle silently or show user a message.
                console.log("Autoplay prevented:", error.message);
                setIsPlaying(false); // Set to false if autoplay fails
            });
            setIsPlaying(true);
            setDuration(videoRef.current.duration); // Set initial duration if available
        }
    }, [fullMediaUrl, post.mediaType]);

    return (
        <div
            className="relative group overflow-hidden rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200 ease-in-out w-full cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={post.mediaType === 'video' ? togglePlayPause : undefined}
        >
            {post.mediaType === 'image' && (
                <div className="relative w-full h-auto">
                    <Image
                        src={fullMediaUrl}
                        alt={post.text || `Post by ${authorName}`}
                        width={500}
                        height={500}
                        className="object-contain w-full h-auto transition-transform duration-300 group-hover:scale-105"
                        sizes="100vw"
                        priority
                    />
                </div>
            )}
            {post.mediaType === 'video' && (
                <div className="relative w-full h-auto bg-black flex items-center justify-center">
                    <video
                        ref={videoRef}
                        src={fullMediaUrl}
                        className="object-contain w-full h-auto"
                        autoPlay
                        muted={isMuted} // Controlled by state
                        loop
                        playsInline
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={() => {
                            if (videoRef.current) {
                                setDuration(videoRef.current.duration);
                                // Set initial volume of the video element here too,
                                // but keep it muted for autoplay policies.
                                videoRef.current.volume = volume;
                            }
                        }}
                    />
                    {/* Custom Controls Overlay - Visible on hover or when video is paused */}
                    <div className={`absolute inset-0 flex flex-col justify-between p-2 bg-opacity-30 transition-opacity duration-300
                                    ${(isHovering || !isPlaying) ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex-grow flex items-center justify-center">
                            {/* Central Play/Pause button for easy tapping on mobile/clicking */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                                className="bg-white/30 rounded-full p-3 text-white backdrop-blur-sm hover:bg-white/50 transition-colors"
                                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                            >
                                {isPlaying ? <Pause size={21} /> : <Play size={21} />}
                            </button>
                        </div>
                        {/* Control Bar at the bottom */}
                        <div className="w-full flex flex-col gap-1">
                            {/* Progress Bar */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                onChange={handleProgressChange}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full"
                                style={{
                                    background: `linear-gradient(to right, #ffffff ${progress}%, #6B7280 ${progress}%)`
                                }}
                            />
                            <div className="flex justify-between items-center text-xs text-white">
                                <span>{formatTime(currentTime)}</span>
                                <div className="flex items-center gap-2">
                                    {/* Mute/Unmute Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                        className="p-1 rounded-full hover:bg-white/20 transition-colors"
                                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                    >
                                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    {/* Volume Slider */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume} // Show 0 if muted, otherwise current volume
                                        onChange={handleVolumeChange}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-20 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full"
                                        style={{
                                            background: `linear-gradient(to right, #ffffff ${isMuted ? 0 : volume * 100}%, #6B7280 ${isMuted ? 0 : volume * 100}%)`
                                        }}
                                    />
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 mb-2">
                    <Image
                        src={authorAvatar}
                        alt={authorName}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                    />
                    <span className="font-semibold text-sm truncate">{authorName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>{post.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                            <path fillRule="evenodd" d="M15.828 7.172a3 3 0 00-4.242 0L10 8.757l-1.586-1.585a3 3 0 10-4.242 4.242L10 16.243l5.828-5.829a3 3 0 000-4.242zM10 1.5A.5.5 0 009.5 2V3h1V2A.5.5 0 0010 1.5zm-5.707 3.328a.5.5 0 00-.707.707L4.793 6.5a.5.5 0 00.707-.707L4.293 4.828zM14.707 4.828a.5.5 0 00.707.707L15.707 6.5a.5.5 0 00-.707-.707l-.793-.793zM10 17.5a.5.5 0 00.5.5h-1a.5.5 0 00.5-.5zM17 9.5a.5.5 0 00-.5-.5H16v1h.5a.5.5 0 00.5-.5zm-1.793-1.293a.5.5 0 00-.707.707L15.207 9.5a.5.5 0 00.707-.707L15.207 8.207zM3 9.5a.5.5 0 00-.5.5H2v1h.5a.5.5 0 00.5-.5zm1.293-1.293a.5.5 0 00-.707-.707L3.793 8.5a.5.5 0 00.707.707L4.293 8.207z" clipRule="evenodd" />
                        </svg>
                        <span>{post.sharesBy.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;