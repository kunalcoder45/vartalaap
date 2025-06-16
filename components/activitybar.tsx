'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import defaultAvatar from '../app/assets/userLogo.png'; // Make sure this path is correct
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

interface User {
    _id: string;
    name: string;
    avatarUrl?: string;
}

interface ActivityBarProps {
    userId: string | null;
}

const ActivityBar = ({ userId }: ActivityBarProps) => {
    const { getIdToken } = useAuth();

    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchFollowDetails = async () => {
            try {
                setLoading(true);
                const token = await getIdToken();
                if (!token) {
                    if (isMounted) {
                        setLoading(false);
                        console.error('ActivityBar: Authentication token not available.');
                    }
                    return;
                }

                // <<<<<<<<<<<< यहाँ API एंडपॉइंट को ठीक किया गया है >>>>>>>>>>>>
                // अपने बैकएंड के वास्तविक एंडपॉइंट से इसे मिलाएं।
                // यह `/follow/user-connections/:userId` हो सकता है
                // या `/follow-details/:userId` हो सकता है
                const res = await fetch(`${API_BASE_URL}/follow-details/${userId}`, {
                // या अगर यह पहले `/follow-details/:userId` था:
                // const res = await fetch(`${API_BASE_URL}/follow-details/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to fetch follow details');
                }

                const data = await res.json();

                if (isMounted) {
                    setFollowers(data.followers || []);
                    setFollowing(data.following || []);
                }
            } catch (err) {
                console.error('ActivityBar: Error fetching follow details:', err);
                if (isMounted) {
                    setFollowers([]);
                    setFollowing([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchFollowDetails();

        return () => {
            isMounted = false;
        };
    }, [userId, getIdToken]);

    const getAvatarSrc = (user: User): string => {
        return user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : defaultAvatar.src;
    };

    const SkeletonItem = () => (
        <div className="flex items-center space-x-3 py-2 animate-pulse">
            <Skeleton circle width={40} height={40} />
            <Skeleton width={120} height={20} className="rounded-md" />
        </div>
    );

    const renderUserItem = (user: User) => (
        <li
            key={user._id}
            className="flex items-center space-x-3 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer"
        >
            <img
                src={getAvatarSrc(user)}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all duration-200"
                onError={e => {
                    (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
                }}
            />
            <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
        </li>
    );

    return (
        <div className="
            flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96
            p-4 bg-white rounded-xl shadow-lg
            border border-gray-200
            flex flex-col space-y-6
            h-full overflow-y-auto custom-scrollbar
        ">
            {/* Following Section */}
            <div>
                <h2 className="text-xl font-extrabold text-gray-800 mb-4 border-b pb-2 border-gray-200">
                    Following
                </h2>
                {loading ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : following.length === 0 ? (
                    <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
                        You're not following anyone yet. Start exploring!
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {following.map(renderUserItem)}
                    </ul>
                )}
            </div>

            {/* Followers Section */}
            <div>
                <h2 className="text-xl font-extrabold text-gray-800 mb-4 border-b pb-2 border-gray-200">
                    Followers
                </h2>
                {loading ? (
                    <>
                        <SkeletonItem />
                        <SkeletonItem />
                        <SkeletonItem />
                    </>
                ) : followers.length === 0 ? (
                    <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
                        No followers yet. Share your content to gain some!
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {followers.map(renderUserItem)}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ActivityBar;