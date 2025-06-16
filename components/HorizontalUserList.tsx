// components/HorizontalUserList.tsx
'use client';

import React from 'react';
import Image from 'next/image'; // Use next/image for optimized images
import { useAuth } from './AuthProvider'; // Assuming you have an AuthProvider to get current user data
import defaultAvatar from '../app/assets/userLogo.png'; // Your default avatar image

// Define a type for a user in this list
interface UserForList {
    _id: string;
    name: string;
    avatarUrl?: string;
    // Add any other properties if needed, e.g., for story status
}

interface HorizontalUserListProps {
    // This could be an array of all users you want to display horizontally
    // For now, we'll use dummy data, but you'd fetch this from your backend.
    users: UserForList[];
}

const HorizontalUserList: React.FC<HorizontalUserListProps> = ({ users }) => {
    const { user: currentUser } = useAuth(); // Get current authenticated user from AuthProvider

    // Helper function to get the correct avatar source
    const getAvatarSrc = (avatarUrl?: string | null): string => {
        if (avatarUrl && avatarUrl.trim() !== '' && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:'))) {
            return avatarUrl;
        }
        // Fallback to default if no valid URL or it's empty
        return defaultAvatar.src;
    };

    // Your own user's display item
    const renderMyUserItem = () => {
        if (!currentUser) return null; // Don't render if no current user

        return (
            <div className="flex flex-col items-center flex-shrink-0 w-20 px-1 py-2">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 hover:border-purple-600 transition-all duration-200 cursor-pointer shadow-md">
                    <Image
                        src={getAvatarSrc(currentUser.avatarUrl)}
                        alt={currentUser.name || "My Profile"}
                        layout="fill" // Makes the image fill the parent div
                        objectFit="cover" // Covers the area without distortion
                        className="object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultAvatar.src;
                        }}
                    />
                    {/* Plus icon for "Add Story" if applicable - position it correctly */}
                    <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 bg-white rounded-full p-[2px] border border-gray-200 shadow-sm">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <p className="text-xs text-gray-700 font-medium mt-1 w-full text-center truncate px-1">
                    Your Story
                </p>
            </div>
        );
    };

    // Renders a single user's avatar and name
    const renderUserItem = (user: UserForList) => (
        <div key={user._id} className="flex flex-col items-center flex-shrink-0 w-20 px-1 py-2 group">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-blue-500 transition-all duration-200 cursor-pointer shadow-sm">
                <Image
                    src={getAvatarSrc(user.avatarUrl)}
                    alt={user.name}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultAvatar.src;
                    }}
                />
            </div>
            <p className="text-xs text-gray-700 font-medium mt-1 w-full text-center truncate px-1">
                {user.name}
            </p>
        </div>
    );

    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4"> {/* Adjusted spacing */}
                {renderMyUserItem()}
                {users.map(renderUserItem)}
            </div>
        </div>
    );
};

export default HorizontalUserList;