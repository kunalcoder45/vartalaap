'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/navbar';
import Slidebar from '@/components/slidebar';
import PostCard from '@/components/PostCard';
import ConnectionsModal from '@/components/ConnectionsModal';
import toast, { Toaster } from 'react-hot-toast';
import LoadingBar from 'react-top-loading-bar';
import { ArrowLeft } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

interface Post {
    _id: string;
    text: string;
    likes: number;
    sharesBy?: number;
    author?: {
        name: string;
        avatarUrl: string;
        bio?: string;
        firebaseUid: string;
    };
    isLiked?: boolean;
    createdAt: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    comments?: any[];
}

interface CustomUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface UserType {
    _id: string;
    name: string;
    avatarUrl: string;
    username?: string;
    bio?: string;
    firebaseUid: string;
}

interface UserProfilePostsPageProps {
    uid: string; // This is firebaseUid
}

export default function UserProfilePostsPage({ uid: firebaseUid }: UserProfilePostsPageProps) {
    const { user: currentUser, getIdToken } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorName, setAuthorName] = useState<string>('');
    const [authorAvatar, setAuthorAvatar] = useState<string>('');
    const [authorBio, setAuthorBio] = useState('No bio available.');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userInfo, setUserInfo] = useState<UserType | null>(null);
    const loadingBarRef = useRef<any>(null);

    const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    const [postCount, setPostCount] = useState(0);
    const fetchUserInfo = useCallback(async () => {
        try {
            const token = await getIdToken(); // ✅ Get token
            if (!token) {
                console.warn("No Firebase token available");
                return null;
            }

            const res = await fetch(`${API_BASE_URL}/users/firebase/${firebaseUid}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch user: ${res.status}`);
            }

            const user = await res.json();
            setUserInfo(user);
            setAuthorName(user.name || 'User');
            setAuthorAvatar(
                user.avatarUrl?.startsWith('http')
                    ? user.avatarUrl
                    : `${API_BASE_URL.replace('/api', '')}${user.avatarUrl || '/avatars/userLogo.png'}`
            );
            setAuthorBio(user.bio || 'No bio available');
            return user;
        } catch (err) {
            console.error('Error fetching user info:', err);
            setAuthorName('User not found');
            setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
            setAuthorBio('User info not available');
            return null;
        }
    }, [firebaseUid, getIdToken]);

    useEffect(() => {
        let hasFetched = false;

        const loadProfileData = async () => {
            if (hasFetched) return;
            hasFetched = true;

            const userData = await fetchUserInfo();
            if (userData) {
                await fetchUserPosts(); // fetch posts AFTER setting user info
            }
        };

        loadProfileData();
    }, [firebaseUid]);

    const fetchUserPosts = useCallback(async () => {
        setLoading(true);
        loadingBarRef.current?.continuousStart();
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/posts/user/${firebaseUid}`);
            if (!response.ok) throw new Error('Failed to fetch posts');

            let data: Post[] = await response.json();
            setPostCount(data.length);

            if (currentUser) {
                const token = await getIdToken();
                if (token) {
                    data = await Promise.all(
                        data.map(async (post) => {
                            try {
                                const likeRes = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (!likeRes.ok) return { ...post, isLiked: false };
                                const likeData = await likeRes.json();
                                return { ...post, isLiked: likeData.isLiked };
                            } catch {
                                return { ...post, isLiked: false };
                            }
                        })
                    );
                }
            }

            setUserPosts(data);
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError(err.message || 'Failed to load posts');
            setUserPosts([]);
        } finally {
            setLoading(false);
            loadingBarRef.current?.complete();
        }
    }, [firebaseUid, currentUser, getIdToken]);


    useEffect(() => {
        fetchUserPosts();
    }, [fetchUserPosts]);

    const handleLike = useCallback(
        async (postId: string, currentLikes: number, currentIsLiked: boolean) => {
            if (!currentUser) {
                toast.error('Please log in to like this post.');
                return;
            }

            try {
                const token = await getIdToken();
                if (!token) {
                    toast.error('Authentication token not available. Please try logging in again.');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || `Failed to like/unlike post (Status: ${response.status})`);
                }

                const data = await response.json();
                setUserPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId ? { ...post, likes: data.updatedLikes, isLiked: data.isNowLiked } : post
                    )
                );
            } catch (error: any) {
                console.error('Error liking/unliking post:', error);
                toast.error(`Failed to like/unlike post: ${error.message}`);
            }
        },
        [currentUser, getIdToken]
    );

    const handleShare = useCallback(
        async (postId: string) => {
            if (!currentUser) {
                toast.error('Please log in to share this post.');
                return;
            }

            try {
                const token = await getIdToken();
                if (!token) {
                    toast.error('Authentication token not available. Please try logging in again.');
                    return;
                }

                const apiResponse = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!apiResponse.ok && !(apiResponse.status === 200 && apiResponse.headers.get('Content-Type')?.includes('application/json'))) {
                    const errorData = await apiResponse.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || `Failed to record share on backend (Status: ${apiResponse.status})`);
                }

                const data = await apiResponse.json();

                if (data.message && data.message.includes('already shared')) {
                    toast('You have already shared this post.', { icon: 'ℹ️' });
                } else if (data.updatedShares !== undefined) {
                    setUserPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post._id === postId ? { ...post, sharesBy: data.updatedShares } : post
                        )
                    );
                    toast.success('Post shared successfully!');
                }

                const postToShare = userPosts.find((p) => p._id === postId);
                const shareableLink = window.location.origin + `/posts/${postId}`;
                const shareData = {
                    title: `Check out this post: ${postToShare?.text?.substring(0, 50)}...`,
                    text: postToShare?.text,
                    url: shareableLink,
                };

                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(shareableLink);
                    toast('Link copied to clipboard. You can paste it to share!', { icon: '📋' });
                }
            } catch (error: any) {
                console.error('Error during share operation:', error);
                if (error.name === 'AbortError') {
                    console.log('Share dialog aborted by user.');
                } else {
                    toast.error(`Failed to share post: ${error.message}`);
                }
            }
        },
        [currentUser, getIdToken, userPosts]
    );

    const handlePostDeleted = useCallback((deletedPostId: string) => {
        setUserPosts((prevPosts) => prevPosts.filter(post => post._id !== deletedPostId));
        setPostCount((prevCount) => Math.max(0, prevCount - 1));
        toast.success('Post deleted successfully!');
    }, []);

    const handlePostUpdated = useCallback((updatedPost: Post) => {
        setUserPosts((prevPosts) =>
            prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
        );
        toast.success('Post updated successfully!');
    }, []);

    if (error) {
        return (
            <ProtectedRoute>
                <Navbar />
                <div className="flex-grow p-6 bg-red-50 text-center text-red-700 font-semibold flex flex-col items-center justify-center h-[calc(100vh-64px)]">
                    <p className="text-xl mb-4">Oops! Something went wrong.</p>
                    <p className="text-lg">Error: {error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
                    >
                        Go Back
                    </button>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <div className='flex flex-col h-screen'>
            <LoadingBar color="#2563EB" ref={loadingBarRef} shadow={true} />
            <ProtectedRoute>
                <Navbar />
                <div className='flex flex-grow overflow-hidden'>
                    <button
                        onClick={toggleSidebar}
                        className={`
                            md:hidden fixed top-1/2 -translate-y-1/2 left-0 px-1 py-12 bg-blue-500 text-white rounded-r-lg shadow-lg z-50
                            transition-all duration-300 transform
                            ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            ${isSidebarOpen ? '' : 'sm:left-0'}
                        `}
                        aria-label="Toggle sidebar"
                    >
                    </button>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
                            onClick={closeSidebar}
                        ></div>
                    )}

                    <div className={`hidden md:block pr-0 w-3/12 max-w-xs`}>
                        <Slidebar joinedGroups={[]} currentPath={pathname} className="h-full pt-4 mt-14" />
                    </div>

                    <Slidebar
                        joinedGroups={[]}
                        currentPath={pathname}
                        className={`
                            fixed inset-y-0 left-0 z-50 bg-white shadow-xl md:hidden transform transition-transform duration-300 ease-in-out
                            md:relative md:translate-x-0 md:w-3/12 md:max-w-xs
                            ${isSidebarOpen ? 'translate-x-0 w-4/5 top-12' : '-translate-x-full'}
                        `}
                        onLinkClick={closeSidebar}
                    />

                    <main className="flex-1 p-0 pt-2 max-w-full mx-auto overflow-y-auto hide-scrollbar md:pl-4">
                        <div className="bg-white rounded-lg shadow-xl mb-6">
                            <button
                                onClick={() => router.back()}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center mb-6 transition duration-300 cursor-pointer p-4"
                            >
                                <ArrowLeft size={15} className="mr-1" />
                                Back to Feed
                            </button>

                            <div className="w-full p-4 mt-8 md:mt-4">
                                <div className="flex sm:flex-row items-start sm:items-center text-left mb-0 w-full">
                                    <div className="flex-shrink-0 flex flex-col items-start mr-6 mb-0 sm:mb-0">
                                        {loading ? (
                                            <Skeleton circle width={112} height={112} />
                                        ) : (
                                            <img
                                                src={authorAvatar || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`}
                                                alt={authorName || 'User Avatar'}
                                                className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-md"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col pl-4 justify-center md:mt-0 mt-8">
                                        {loading ? (
                                            <Skeleton width={200} height={36} />
                                        ) : (
                                            <h1 className="md:text-4xl text-3xl font-extrabold text-gray-900">{authorName || 'User Profile'}</h1>
                                        )}
                                        <div className="flex flex-wrap items-center text-gray-600 mt-2 text-sm space-x-6">
                                            <span className="font-medium">
                                                <span className="text-gray-900 font-bold">{postCount}</span> Posts
                                            </span>

                                            <button
                                                onClick={() => setIsConnectionsModalOpen(true)}
                                                className="px-3 py-1 cursor-pointer bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors duration-200"
                                            >
                                                Connections
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-lg max-w-prose leading-relaxed pl-1 pt-2">
                                    {loading ? <Skeleton count={2} /> : authorBio}
                                </p>
                            </div>

                            <hr className="my-6 border-gray-300" />

                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {loading ? <Skeleton width={250} /> : `Posts by ${authorName || 'User'}`}
                            </h2>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                                    {Array(6).fill(0).map((_, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-md p-4">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <Skeleton circle width={40} height={40} />
                                                <div>
                                                    <Skeleton width={100} height={16} />
                                                    <Skeleton width={80} height={12} />
                                                </div>
                                            </div>
                                            <Skeleton count={3} height={16} className="mb-2" />
                                            <Skeleton height={150} className="rounded-md mb-3" />
                                            <div className="flex justify-around items-center text-gray-500">
                                                <Skeleton width={60} height={24} />
                                                <Skeleton width={60} height={24} />
                                                <Skeleton width={60} height={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : userPosts.length === 0 ? (
                                <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg mx-4 mb-4">
                                    <div className="mb-4">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-xl font-semibold text-gray-600 mb-2">No posts yet</p>
                                    <p className="text-lg text-gray-500">
                                        {authorName || 'This user'} hasn't shared any posts yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                                    {userPosts.map((post) => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            handleLike={handleLike}
                                            handleShare={handleShare}
                                            loading={false}
                                            currentUser={currentUser}
                                            getIdToken={getIdToken}
                                            onPostDeleted={handlePostDeleted}
                                            onPostUpdated={handlePostUpdated}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
                <Toaster />

                <ConnectionsModal
                    firebaseUid={firebaseUid}
                    isOpen={isConnectionsModalOpen}
                    onClose={() => setIsConnectionsModalOpen(false)}
                />
            </ProtectedRoute>
        </div>
    );
}