'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Card from './Card';
import { useAuth } from '../AuthProvider';
import { MoonLoader } from 'react-spinners';
import toast from 'react-hot-toast';

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
    author: PostAuthor;
    likes: string[];
    sharesBy: string[];
    comments: any[];
    createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const PostGrid: React.FC = () => {
    const { user, getIdToken, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllPosts = useCallback(async () => {
        if (!user || authLoading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error("Authentication token not available. Please log in.");
            }

            const response = await fetch(`${API_BASE_URL}/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch posts');
            }

            const data: Post[] = await response.json();
            const mediaPosts = data.filter(post => post.mediaUrl && (post.mediaType === 'image' || post.mediaType === 'video'));
            setPosts(mediaPosts);
        } catch (err: any) {
            console.error("Error fetching posts:", err);
            setError(err.message || 'An unexpected error occurred.');
            toast.error(err.message || 'Failed to load posts.');
        } finally {
            setLoading(false);
        }
    }, [user, getIdToken, authLoading]);

    useEffect(() => {
        if (!authLoading) {
            fetchAllPosts();
        }
    }, [authLoading, fetchAllPosts]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[50vh] w-full">
                <MoonLoader color="#3498db" size={25} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-600 font-semibold">
                <p>Error: {error}</p>
                <button
                    onClick={fetchAllPosts}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const postsWithMedia = posts.filter(post => post.mediaUrl && (post.mediaType === 'image' || post.mediaType === 'video'));

    if (postsWithMedia.length === 0) {
        return (
            <div className="text-center p-8 text-gray-600 min-h-[50vh] flex items-center justify-center w-full">
                <p>No media posts available. Be the first to upload an image or video!</p>
            </div>
        );
    }

    return (
        // Parent container using CSS Multi-column Layout
        <div style={{
            columnWidth: '250px',
            columnGap: '1rem',

        }}>
            {postsWithMedia.map((post) => (
                // Each Card is wrapped in a div to ensure it doesn't break across columns.
                // mb-4 provides vertical spacing between cards within a column.
                <div key={post._id} style={{ breakInside: 'avoid-column' }} className="mb-4">
                    <Card post={post} />
                </div>
            ))}
        </div>
    );
};

export default PostGrid;