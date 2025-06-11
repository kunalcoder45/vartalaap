"use client";
import { useEffect, useState } from 'react';
import React from 'react'
import { useAuth } from '../components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/navigation';
import UserLogo from '../app/assets/userLogo.png';
import { Search, Users, MessageSquare, Bell } from 'lucide-react';
import Link from 'next/link';

const navbar = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [showProfile, setShowProfile] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(UserLogo.src);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        if (user?.photoURL) {
            setAvatarSrc(user.photoURL); // Update if photoURL exists
        } else {
            setAvatarSrc(UserLogo.src); // Revert to logo if photoURL becomes null/undefined
        }
    }, [user]);

    return (
        <div>
            <div className="flex flex-col">
                {/* Header Section */}
                <div className="flex items-center p-4 bg-white shadow-md relative z-10">
                    <Link href='/dashboard' className="text-3xl font-bold flex items-baseline mr-auto">
                        Vartalaap
                        <div className="bg-yellow-500 w-2 h-2 rounded-full ml-1" style={{ marginBottom: '-0.2em' }}>
                        </div>
                    </Link>
                    <div className="flex-grow flex justify-center mx-4">
                        <div className="relative w-full max-w-lg flex items-center border border-gray-300 rounded-full focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                            <Search size={20} className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for friends, groups, pages"
                                className="w-full px-4 py-2 pl-10 pr-4 bg-transparent focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                        <div className="flex space-x-2">
                            <button className="p-2 rounded-full hover:bg-gray-200">
                                <Users size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-gray-200">
                                <MessageSquare size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-gray-200">
                                <Bell size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <img
                            src={avatarSrc}
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-colors object-cover"
                            onClick={() => setShowProfile(!showProfile)}
                        />
                    </div>
                </div>
                <hr className="my-0 border-gray-200" />

                {showProfile && (
                    <div className="absolute top-16 right-4 mt-2 bg-white p-6 rounded-lg shadow-xl border border-gray-200 z-20">
                        <h3 className="text-lg font-semibold mb-2">My Profile</h3>
                        <p className="text-gray-700 mb-1">Welcome, {user?.displayName || 'User'}!</p>
                        <p className="text-gray-700 mb-4 text-sm break-words">{user?.email}</p>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors mt-4"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => setShowProfile(false)}
                            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors mt-2"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default navbar;