// client/app/profile/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute'; // Protects route authentication
import { useAuth } from '../../components/AuthProvider'; // Custom auth hook
import Navbar from '../../components/navbar'; // Top navigation
import Slidebar from '../../components/slidebar'; // Left sidebar
import Image from 'next/image'; // For optimized image loading
import toast from 'react-hot-toast'; // For notifications
import { Camera, Save } from 'lucide-react'; // Icons

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

/**
 * ProfilePage component: Allows users to view and update their profile information.
 */
export default function ProfilePage() {
    const { user, getIdToken } = useAuth(); // Get user and token getter from auth context
    const pathname = usePathname(); // Get current Next.js pathname
    const joinedGroups: any[] = []; // Placeholder for groups (not fetched on this page)

    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input

    // State for profile form fields
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    // Default avatar URL, dynamically constructed
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null); // State for new avatar file
    const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null); // State for new avatar preview URL

    // State for loading and saving operations
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Effect hook to fetch the user's profile data from the backend when the component mounts
     * or when the user object/token changes.
     */
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) { // If no user is authenticated, stop loading
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null); // Clear previous errors

            try {
                const token = await getIdToken(); // Get fresh Firebase ID token
                if (!token) throw new Error('Authentication token not available.');

                const response = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token for authentication
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    let errorMessage = `Failed to fetch user profile (Status: ${response.status})`;
                    try {
                        const errorData = await response.json(); // Try parsing as JSON
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        const errorText = await response.text(); // Fallback to text if JSON fails
                        console.error('Non-JSON error response fetching profile:', errorText);
                        errorMessage = errorText || errorMessage; // Use raw text as error message
                    }
                    throw new Error(errorMessage);
                }

                const userData = await response.json(); // Parse the successful JSON response

                // Set state with fetched user data
                setName(userData.name || '');
                setBio(userData.bio || '');
                // Set current avatar URL, falling back to default if backend doesn't provide one
                setCurrentAvatarUrl(userData.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
                setNewAvatarPreview(null); // Clear any existing preview
            } catch (err: any) {
                console.error('Error fetching user profile:', err);
                setError(err.message || 'Failed to load profile data.');
                toast.error(`Error loading profile: ${err.message}`); // Show toast notification
            } finally {
                setIsLoading(false); // End loading regardless of success or failure
            }
        };

        fetchUserProfile(); // Call the fetch function
    }, [user, getIdToken, API_BASE_URL]); // Dependencies: user object, getIdToken function, API_BASE_URL

    /**
     * Handles file selection for a new avatar.
     * Performs size validation and creates a preview URL.
     */
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the selected file
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size cannot exceed 5MB.');
                setNewAvatarFile(null);
                setNewAvatarPreview(null);
                return;
            }
            setNewAvatarFile(file); // Store the file itself
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatarPreview(reader.result as string); // Set data URL as preview
            };
            reader.readAsDataURL(file); // Read file as Data URL
        } else {
            setNewAvatarFile(null);
            setNewAvatarPreview(null);
        }
    };

    /**
     * Handles the form submission to update the user's profile.
     * Sends a PUT request to the backend with updated data and optional avatar.
     */
    const handleUpdateProfile = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default form submission behavior

        if (!user) {
            toast.error('Please log in to update your profile.');
            return;
        }

        setIsSaving(true); // Set saving state
        setError(null); // Clear previous errors

        try {
            const token = await getIdToken(); // Get fresh Firebase ID token
            if (!token) throw new Error('Authentication token not available.');

            const formData = new FormData(); // Use FormData for text and file uploads
            formData.append('name', name); // Append name
            formData.append('bio', bio); // Append bio
            if (newAvatarFile) {
                formData.append('avatar', newAvatarFile); // Append new avatar file
            }

            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`, // Send token for authentication
                    // 'Content-Type': 'multipart/form-data' is NOT needed when using FormData
                    // The browser sets it automatically with the correct boundary.
                },
                body: formData, // Send FormData directly
            });

            if (!response.ok) {
                let errorMessage = `Failed to update profile (Status: ${response.status})`;
                try {
                    const errorData = await response.json(); // Try parsing as JSON
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text(); // Fallback to text if JSON fails
                    console.error('Non-JSON error response updating profile:', errorText);
                    errorMessage = errorText || errorMessage; // Use raw text as error message
                }
                throw new Error(errorMessage);
            }

            const updatedUser = await response.json(); // Parse the successful JSON response

            // Update local state with the new avatar URL returned from the backend
            setCurrentAvatarUrl(updatedUser.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
            setNewAvatarFile(null); // Clear the file input state
            setNewAvatarPreview(null); // Clear the preview
            toast.success('Profile updated successfully!'); // Show success toast
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile.');
            toast.error(`Error updating profile: ${err.message}`); // Show error toast
        } finally {
            setIsSaving(false); // End saving state
        }
    };

    // Show loading state while fetching profile data
    if (isLoading) {
        return (
            <ProtectedRoute>
                <Navbar />
                <div className="flex-grow p-6 bg-gray-50 flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <p className="text-lg text-gray-700">Loading profile...</p>
                </div>
            </ProtectedRoute>
        );
    }

    // Render the profile page content
    return (
        <ProtectedRoute>
            <Navbar />
            <div className="h-auto p-4 bg-gray-50 flex space-x-6 justify-center">
                <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className='' /> {/* Left sidebar */}

                {/* Main content area for the profile page */}
                <main className="flex-1 p-6 max-w-2xl bg-white rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Profile</h1>

                    {error && ( // Display error message if present
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-md group">
                                <Image
                                    src={newAvatarPreview || currentAvatarUrl} // Show new preview or current avatar
                                    alt="Profile Avatar"
                                    fill // Makes the image fill its parent container
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
                                    style={{ objectFit: 'cover' }} // CSS object-fit property
                                    className="rounded-full" // Apply rounded corners via Tailwind
                                    priority // Prioritize loading this image
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef} // Link to ref
                                    onChange={handleFileChange} // Handle file selection
                                    className="hidden" // Hide the default input
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()} // Click handler to open file dialog
                                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Change profile picture"
                                >
                                    <Camera size={30} className="text-white" /> {/* Camera icon */}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()} // Button to trigger file input
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                Change Picture
                            </button>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Bio Input */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isSaving} // Disable while saving
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} className="mr-2" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </form>
                </main>
            </div>
        </ProtectedRoute>
    );
}