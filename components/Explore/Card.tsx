'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

const defaultAvatar = '/avatars/userLogo.png';

const BACKEND_STATIC_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:5001';

const Card: React.FC<CardProps> = ({ post }) => {
    const authorName = post.author?.name || 'Unknown User';

    const authorAvatar = post.author?.avatarUrl
        ? post.author.avatarUrl.startsWith('http') || post.author.avatarUrl.startsWith('data:')
            ? post.author.avatarUrl
            : `${BACKEND_STATIC_BASE_URL}${post.author.avatarUrl.startsWith('/') ? '' : '/'}${post.author.avatarUrl}`
        : `${BACKEND_STATIC_BASE_URL}${defaultAvatar}`;

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

    // --- Video Debugging Tip ---
    if (post.mediaType === 'video') {
        console.log('Attempting to load video:', fullMediaUrl);
    }
    // --- End Video Debugging Tip ---

    return (
        <div className="relative group overflow-hidden rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200 ease-in-out w-full">
            <Link href={`/post/${post._id}`} className="block w-full h-full">
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
                            src={fullMediaUrl}
                            className="object-contain w-full h-auto"
                            controls={true} // TEMPORARILY SET TO TRUE FOR DEBUGGING
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                        {/* Play icon overlay on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                )}
            </Link>

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