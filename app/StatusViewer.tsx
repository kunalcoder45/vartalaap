// client/app/StatusViewer.tsx
'use client'; // This directive is necessary if you are using Next.js 13+ App Router with client-side features

import React from 'react';
import Image from 'next/image';

// Define the User interface. This is crucial for type consistency across your application.
// Renamed to GeneralUser as per your MessageList.tsx import alias
export interface GeneralUser {
    _id: string;
    username: string; // Ensure this property exists, as it's used in MessageBubble
    email: string;
    avatarUrl?: string; // Optional avatar URL (relative path)
    status?: 'online' | 'offline' | 'away' | 'busy'; // Example: Add various status options
    lastSeen?: string; // ISO string or similar timestamp
    // Add any other user-related fields that you expect from your backend's User model
}

interface StatusViewerProps {
    user: GeneralUser; // The user object to display status for
    defaultAvatarUrl: string; // Fallback avatar URL
    // You might also pass a function to get full media URL if avatarUrl is relative
    getFullMediaUrl: (relativePath?: string) => string;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ user, defaultAvatarUrl, getFullMediaUrl }) => {
    const statusColor = user.status === 'online' ? 'bg-green-500' :
                        user.status === 'away' ? 'bg-yellow-500' :
                        user.status === 'busy' ? 'bg-red-500' :
                        'bg-gray-400'; // Default for offline

    return (
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-white shadow-sm">
            <div className="relative">
                <Image
                    src={user.avatarUrl ? getFullMediaUrl(user.avatarUrl) : defaultAvatarUrl}
                    alt={user.username || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                />
                <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${statusColor}`}></span>
            </div>
            <div>
                <p className="font-semibold text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500 capitalize">{user.status || 'Offline'}</p>
                {user.status === 'offline' && user.lastSeen && (
                    <p className="text-xs text-gray-400">Last seen: {new Date(user.lastSeen).toLocaleTimeString()}</p>
                )}
            </div>
        </div>
    );
};

export default StatusViewer;