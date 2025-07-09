'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { fetchMongoUserId } from '@/utils/userApi';
import userLogo from '../../../assets/userLogo.png'; // Adjust path based on your project structure

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

interface User {
    _id: string;
    name: string;
    username?: string;
    avatarUrl?: string | null;
}

// Type for the active tab
type ActiveTab = 'followers' | 'following';

export default function ConnectionsPage() {
    const { uid: firebaseUid } = useParams() || {};
    const { getIdToken } = useAuth();

    const [activeTab, setActiveTab] = useState<ActiveTab>('followers'); // Default to 'followers'
    const [users, setUsers] = useState<User[]>([]); // This state will hold either followers or following
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mongoId, setMongoId] = useState<string | null>(null);

    // --- Helper function for avatar URL ---
    const getAvatarUrl = useCallback((avatarUrl?: string | null) => {
        if (!avatarUrl || avatarUrl.trim() === '') {
            return userLogo.src;
        }
        if (avatarUrl.startsWith('http')) {
            return avatarUrl;
        }
        return `${process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || ''}${avatarUrl}`;
    }, []);

    // --- Fetch users based on active tab ---
    useEffect(() => {
        const fetchUsers = async () => {
            if (!firebaseUid) {
                setError('User ID not provided.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setUsers([]); // Clear previous list

            try {
                const token = await getIdToken();
                if (!token) throw new Error('Authentication token missing. Please log in.');

                // Fetch mongoId only once, or if it's not set yet
                let currentMongoId = mongoId;
                if (!currentMongoId) {
                    currentMongoId = await fetchMongoUserId(firebaseUid as string, token);
                    if (!currentMongoId) {
                        throw new Error('MongoDB user ID not found for this Firebase UID.');
                    }
                    setMongoId(currentMongoId); // Store for future use in this session
                }
                
                const endpoint = activeTab === 'followers'
                    ? `${API_BASE_URL}/users/${currentMongoId}/followers`
                    : `${API_BASE_URL}/users/${currentMongoId}/following`;

                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || `Failed to fetch ${activeTab} (Status: ${res.status})`);
                }

                const data: User[] = await res.json();
                setUsers(data);

            } catch (err: any) {
                console.error(`Error fetching ${activeTab}:`, err);
                setError(err.message || `Failed to load ${activeTab}.`);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if firebaseUid or mongoId is available and activeTab changes
        fetchUsers();
    }, [firebaseUid, activeTab, getIdToken, mongoId, getAvatarUrl]); // Added mongoId to dependency

    if (error && !loading) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center text-red-700">
                <p className="text-lg font-semibold mb-4">Error: {error}</p>
                <Link href={`/users/${firebaseUid}`} className="text-blue-600 hover:underline">
                    ← Back to Profile
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg my-8">
            <Link href={`/users/${firebaseUid}`} className="text-blue-600 hover:underline mb-6 block font-medium">
                ← Back to Profile
            </Link>

            <h1 className="text-3xl font-bold mb-6 text-gray-800">Connections</h1>

            <div className="flex justify-around border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('followers')}
                    className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
                        activeTab === 'followers'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Followers
                </button>
                <button
                    onClick={() => setActiveTab('following')}
                    className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
                        activeTab === 'following'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Following
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                    {activeTab === 'followers'
                        ? 'This user has no followers yet.'
                        : 'This user is not following anyone yet.'}
                </p>
            ) : (
                <ul className="space-y-4">
                    {users.map((user) => (
                        <li key={user._id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                            <Link href={`/users/${firebaseUid}`} className="flex items-center space-x-4">
                                <img
                                    src={getAvatarUrl(user.avatarUrl)}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => { e.currentTarget.src = userLogo.src; }}
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                    {user.username && <p className="text-sm text-gray-600">@{user.username}</p>}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}