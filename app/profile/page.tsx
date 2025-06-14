// // client/app/profile/page.tsx
// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { usePathname } from 'next/navigation';
// import ProtectedRoute from '../../components/ProtectedRoute'; // Protects route authentication
// import { useAuth } from '../../components/AuthProvider'; // Custom auth hook
// import Navbar from '../../components/navbar'; // Top navigation
// import Slidebar from '../../components/slidebar'; // Left sidebar
// import Image from 'next/image'; // For optimized image loading
// import toast from 'react-hot-toast'; // For notifications
// import { Camera, Save } from 'lucide-react'; // Icons
// // import { BounceLoader } from 'react-spinners';
// import LoadingBar from 'react-top-loading-bar';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// /**
//  * ProfilePage component: Allows users to view and update their profile information.
//  */
// export default function ProfilePage() {
//     const { user, getIdToken } = useAuth(); // Get user and token getter from auth context
//     const pathname = usePathname(); // Get current Next.js pathname
//     const joinedGroups: any[] = []; // Placeholder for groups (not fetched on this page)

//     const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input
//     const [progress, setProgress] = useState(0);
//     // State for profile form fields
//     const [name, setName] = useState('');
//     const [bio, setBio] = useState('');
//     // Default avatar URL, dynamically constructed
//     const [currentAvatarUrl, setCurrentAvatarUrl] = useState(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//     const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null); // State for new avatar file
//     const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null); // State for new avatar preview URL

//     // State for loading and saving operations
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         // When the pathname changes (i.e., a new page navigation starts),
//         // we set the progress to an initial value (e.g., 30%) to show it's loading.
//         setProgress(30);

//         // After a short delay, we set it to 100% to simulate completion.
//         // For real data fetches, you'd manually control this based on your API calls.
//         const timer = setTimeout(() => {
//             setProgress(100);
//         }, 200); // Simulate completion after 500ms

//         // Clean up the timer if the component unmounts or the pathname changes again quickly.
//         return () => clearTimeout(timer);
//     }, [pathname]);
//     /**
//      * Effect hook to fetch the user's profile data from the backend when the component mounts
//      * or when the user object/token changes.
//      */
//     useEffect(() => {
//         const fetchUserProfile = async () => {
//             if (!user) { // If no user is authenticated, stop loading
//                 setIsLoading(false);
//                 return;
//             }

//             setIsLoading(true);
//             setError(null); // Clear previous errors

//             try {
//                 const token = await getIdToken(); // Get fresh Firebase ID token
//                 if (!token) throw new Error('Authentication token not available.');

//                 const response = await fetch(`${API_BASE_URL}/users/profile`, {
//                     method: 'GET',
//                     headers: {
//                         Authorization: `Bearer ${token}`, // Send token for authentication
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!response.ok) {
//                     let errorMessage = `Failed to fetch user profile (Status: ${response.status})`;
//                     try {
//                         const errorData = await response.json(); // Try parsing as JSON
//                         errorMessage = errorData.message || errorMessage;
//                     } catch {
//                         const errorText = await response.text(); // Fallback to text if JSON fails
//                         console.error('Non-JSON error response fetching profile:', errorText);
//                         errorMessage = errorText || errorMessage; // Use raw text as error message
//                     }
//                     throw new Error(errorMessage);
//                 }

//                 const userData = await response.json(); // Parse the successful JSON response

//                 // Set state with fetched user data
//                 setName(userData.name || '');
//                 setBio(userData.bio || '');
//                 // Set current avatar URL, falling back to default if backend doesn't provide one
//                 setCurrentAvatarUrl(userData.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//                 setNewAvatarPreview(null); // Clear any existing preview
//             } catch (err: any) {
//                 console.error('Error fetching user profile:', err);
//                 setError(err.message || 'Failed to load profile data.');
//                 toast.error(`Error loading profile: ${err.message}`); // Show toast notification
//             } finally {
//                 setIsLoading(false); // End loading regardless of success or failure
//             }
//         };

//         fetchUserProfile(); // Call the fetch function
//     }, [user, getIdToken, API_BASE_URL]); // Dependencies: user object, getIdToken function, API_BASE_URL

//     /**
//      * Handles file selection for a new avatar.
//      * Performs size validation and creates a preview URL.
//      */
//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0]; // Get the selected file
//         if (file) {
//             // Validate file size (max 5MB)
//             if (file.size > 5 * 1024 * 1024) {
//                 toast.error('Image size cannot exceed 5MB.');
//                 setNewAvatarFile(null);
//                 setNewAvatarPreview(null);
//                 return;
//             }
//             setNewAvatarFile(file); // Store the file itself
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setNewAvatarPreview(reader.result as string); // Set data URL as preview
//             };
//             reader.readAsDataURL(file); // Read file as Data URL
//         } else {
//             setNewAvatarFile(null);
//             setNewAvatarPreview(null);
//         }
//     };

//     /**
//      * Handles the form submission to update the user's profile.
//      * Sends a PUT request to the backend with updated data and optional avatar.
//      */
//     const handleUpdateProfile = async (event: React.FormEvent) => {
//         event.preventDefault(); // Prevent default form submission behavior

//         if (!user) {
//             toast.error('Please log in to update your profile.');
//             return;
//         }

//         setIsSaving(true); // Set saving state
//         setError(null); // Clear previous errors

//         try {
//             const token = await getIdToken(); // Get fresh Firebase ID token
//             if (!token) throw new Error('Authentication token not available.');

//             const formData = new FormData(); // Use FormData for text and file uploads
//             formData.append('name', name); // Append name
//             formData.append('bio', bio); // Append bio
//             if (newAvatarFile) {
//                 formData.append('avatar', newAvatarFile); // Append new avatar file
//             }

//             const response = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'PUT',
//                 headers: {
//                     Authorization: `Bearer ${token}`, // Send token for authentication
//                     // 'Content-Type': 'multipart/form-data' is NOT needed when using FormData
//                     // The browser sets it automatically with the correct boundary.
//                 },
//                 body: formData, // Send FormData directly
//             });

//             if (!response.ok) {
//                 let errorMessage = `Failed to update profile (Status: ${response.status})`;
//                 try {
//                     const errorData = await response.json(); // Try parsing as JSON
//                     errorMessage = errorData.message || errorMessage;
//                 } catch {
//                     const errorText = await response.text(); // Fallback to text if JSON fails
//                     console.error('Non-JSON error response updating profile:', errorText);
//                     errorMessage = errorText || errorMessage; // Use raw text as error message
//                 }
//                 throw new Error(errorMessage);
//             }

//             const updatedUser = await response.json(); // Parse the successful JSON response

//             // Update local state with the new avatar URL returned from the backend
//             setCurrentAvatarUrl(updatedUser.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//             setNewAvatarFile(null); // Clear the file input state
//             setNewAvatarPreview(null); // Clear the preview
//             toast.success('Profile updated successfully!'); // Show success toast
//         } catch (err: any) {
//             console.error('Error updating profile:', err);
//             setError(err.message || 'Failed to update profile.');
//             toast.error(`Error updating profile: ${err.message}`); // Show error toast
//         } finally {
//             setIsSaving(false); // End saving state
//         }
//     };

//     // Show loading state while fetching profile data
//     if (isLoading) {
//         return (
//             <ProtectedRoute>
//                 <Navbar />
//                 <div className="flex-grow p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]"> {/* <--- Added flex-col */}
//                     {/* <BounceLoader color="#3498db" size={30} /> */}
//                     <LoadingBar
//                         color="#3498db" // The requested blue color
//                         progress={progress}
//                         onLoaderFinished={() => setProgress(0)} // Reset progress to 0 when it finishes (makes it disappear)
//                         shadow={true} // Adds a subtle shadow to the bar
//                         height={3} // Sets the thickness of the bar in pixels
//                     />
//                 </div>
//             </ProtectedRoute>
//         );
//     }

//     // Render the profile page content
//     return (
//         <ProtectedRoute>
//             <Navbar />
//             <div className="h-auto p-4 bg-gray-50 flex space-x-6 justify-center">
//                 <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className='' /> {/* Left sidebar */}

//                 {/* Main content area for the profile page */}
//                 <main className="flex-1 p-6 max-w-2xl bg-white rounded-lg shadow-md">
//                     <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Your Profile</h1>

//                     {error && ( // Display error message if present
//                         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                             <strong className="font-bold">Error:</strong>
//                             <span className="block sm:inline"> {error}</span>
//                         </div>
//                     )}

//                     <form onSubmit={handleUpdateProfile} className="space-y-6">
//                         {/* Profile Picture Section */}
//                         <div className="flex flex-col items-center mb-6">
//                             <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-md group">
//                                 <Image
//                                     src={newAvatarPreview || currentAvatarUrl} // Show new preview or current avatar
//                                     alt="Profile Avatar"
//                                     fill // Makes the image fill its parent container
//                                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
//                                     style={{ objectFit: 'cover' }} // CSS object-fit property
//                                     className="rounded-full" // Apply rounded corners via Tailwind
//                                     priority // Prioritize loading this image
//                                 />
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     ref={fileInputRef} // Link to ref
//                                     onChange={handleFileChange} // Handle file selection
//                                     className="hidden" // Hide the default input
//                                 />
//                                 <div
//                                     onClick={() => fileInputRef.current?.click()} // Click handler to open file dialog
//                                     className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
//                                     title="Change profile picture"
//                                 >
//                                     <Camera size={30} className="text-white" /> {/* Camera icon */}
//                                 </div>
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={() => fileInputRef.current?.click()} // Button to trigger file input
//                                 className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
//                             >
//                                 Change Picture
//                             </button>
//                         </div>

//                         {/* Name Input */}
//                         <div>
//                             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                             <input
//                                 type="text"
//                                 id="name"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                                 placeholder="Enter your full name"
//                                 required
//                             />
//                         </div>

//                         {/* Bio Input */}
//                         <div>
//                             <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
//                             <textarea
//                                 id="bio"
//                                 value={bio}
//                                 onChange={(e) => setBio(e.target.value)}
//                                 rows={4}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
//                                 placeholder="Tell us a little about yourself..."
//                             />
//                         </div>

//                         {/* Save Button */}
//                         <button
//                             type="submit"
//                             disabled={isSaving} // Disable while saving
//                             className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                         >
//                             {isSaving ? (
//                                 <>
//                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Saving...
//                                 </>
//                             ) : (
//                                 <>
//                                     <Save size={20} className="mr-2" />
//                                     Save Profile
//                                 </>
//                             )}
//                         </button>
//                     </form>
//                 </main>
//             </div>
//         </ProtectedRoute>
//     );
// }









// client/app/profile/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Camera, Save } from 'lucide-react';
import LoadingBar from 'react-top-loading-bar';
import PostCard from '../../components/PostCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// Define a type for Post structure (expanded to match PostCard's needs)
interface Post {
    _id: string;
    text: string; // Changed from 'content' to 'text' as per PostCard
    mediaUrl?: string; // For images/videos
    mediaType?: 'image' | 'video'; // Type of media
    createdAt: string;
    author: {
        _id: string;
        name: string;
        firebaseUid: string;
        avatarUrl?: string;
    };
    likes: string[]; // Array of user IDs who liked it
    comments: any[]; // Array of comments
    sharesBy: string[]; // Array of user IDs who shared it
    isLiked: boolean; // Indicates if current user liked it
}

export default function ProfilePage() {
    const { user, getIdToken } = useAuth();
    const pathname = usePathname();
    const joinedGroups: any[] = [];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setProgress(30);
        const timer = setTimeout(() => {
            setProgress(100);
        }, 200);
        return () => clearTimeout(timer);
    }, [pathname]);

    /**
     * Effect hook to fetch the user's profile data and posts from the backend.
     */
    useEffect(() => {
        const fetchUserProfileAndPosts = async () => {
            if (!user) {
                setIsLoading(false);
                setIsPostsLoading(false);
                return;
            }

            setIsLoading(true);
            setIsPostsLoading(true);
            setError(null);
            setPostsError(null);

            try {
                const token = await getIdToken();
                if (!token) throw new Error('Authentication token not available.');

                // --- Fetch User Profile ---
                const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!profileResponse.ok) {
                    let errorMessage = `Failed to fetch user profile (Status: ${profileResponse.status})`;
                    try {
                        const errorData = await profileResponse.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        const errorText = await profileResponse.text();
                        console.error('Non-JSON error response fetching profile:', errorText);
                        errorMessage = errorText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                const userData = await profileResponse.json();
                setName(userData.name || '');
                setBio(userData.bio || '');
                setCurrentAvatarUrl(userData.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
                setNewAvatarPreview(null);

                // --- Fetch User Posts ---
                const postsResponse = await fetch(`${API_BASE_URL}/posts/user/${user.uid}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!postsResponse.ok) {
                    let errorMessage = `Failed to fetch user posts (Status: ${postsResponse.status})`;
                    try {
                        const errorData = await postsResponse.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        const errorText = await postsResponse.text();
                        console.error('Non-JSON error response fetching posts:', errorText);
                        errorMessage = errorText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                const postsData: Post[] = await postsResponse.json();
                setUserPosts(postsData);

            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load profile data.');
                setPostsError(err.message || 'Failed to load user posts.');
                toast.error(`Error loading data: ${err.message}`);
            } finally {
                setIsLoading(false);
                setIsPostsLoading(false);
            }
        };

        fetchUserProfileAndPosts();
    }, [user, getIdToken]);

    /**
     * Handles file selection for a new avatar.
     * Performs size validation and creates a preview URL.
     */
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size cannot exceed 5MB.');
                setNewAvatarFile(null);
                setNewAvatarPreview(null);
                return;
            }
            setNewAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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
        event.preventDefault();

        if (!user) {
            toast.error('Please log in to update your profile.');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication token not available.');

            const formData = new FormData();
            formData.append('name', name);
            formData.append('bio', bio);
            if (newAvatarFile) {
                formData.append('avatar', newAvatarFile);
            }

            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = `Failed to update profile (Status: ${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text();
                    console.error('Non-JSON error response updating profile:', errorText);
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const updatedUser = await response.json();
            setCurrentAvatarUrl(updatedUser.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
            setNewAvatarFile(null);
            setNewAvatarPreview(null);
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile.');
            toast.error(`Error updating profile: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Post Action Handlers (needed for PostCard) ---
    const handleLikePost = useCallback(async (postId: string) => {
        if (!user) {
            toast.error('Please log in to like posts.');
            return;
        }
        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication token not available.');

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to like/unlike post.');
            }

            const updatedPost = await response.json();
            setUserPosts(prevPosts =>
                prevPosts.map(p => (p._id === postId ? { ...p, likes: updatedPost.likes, isLiked: updatedPost.isLiked } : p))
            );
            toast.success(updatedPost.isLiked ? 'Post liked!' : 'Post unliked!');
        } catch (error: any) {
            console.error('Error liking post:', error);
            toast.error(`Error liking post: ${error.message}`);
        }
    }, [user, getIdToken]);

    const handleSharePost = useCallback(async (postId: string) => {
        const postLink = `${window.location.origin}/posts/${postId}`;
        try {
            await navigator.clipboard.writeText(postLink);
            toast.success('Post link copied to clipboard!');

            const token = await getIdToken();
            if (!token) throw new Error('Authentication token not available.');

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to record share.');
            }
            const updatedPost = await response.json();
            setUserPosts(prevPosts =>
                prevPosts.map(p => (p._id === postId ? { ...p, sharesBy: updatedPost.sharesBy } : p))
            );
        } catch (err: any) {
            console.error('Error sharing post:', err);
            toast.error(`Failed to share post: ${err.message}`);
        }
    }, [getIdToken]);

    const handlePostDeleted = useCallback((deletedPostId: string) => {
        setUserPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
        toast.success('Post removed from your profile.');
    }, []);

    const handlePostUpdated = useCallback((updatedPost: Post) => {
        setUserPosts(prevPosts =>
            prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
        );
        toast.success('Post updated!');
    }, []);


    // When `isLoading` is true (before any profile data is loaded), show a generic loader.
    // This is for the *entire page* loading, not just posts.
    if (isLoading) {
        return (
            <ProtectedRoute>
                <Navbar />
                <div className="flex-grow p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <LoadingBar
                        color="#3498db"
                        progress={progress}
                        onLoaderFinished={() => setProgress(0)}
                        shadow={true}
                        height={3}
                    />
                    <p className="text-gray-600 text-lg mt-4">Loading profile data...</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
                <Navbar />
                <LoadingBar
                    color="#3498db"
                    progress={progress}
                    onLoaderFinished={() => setProgress(0)}
                    shadow={true}
                    height={3}
                />

                <div className="flex flex-1 overflow-hidden">
                    <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="flex-shrink-0 m-4" />

                    <main className="flex-1 overflow-y-auto p-6 md:p-4 lg:p-4 bg-gray-100 flex justify-center items-start">
                        <div className="w-full max-w-full bg-white rounded-xl shadow-2xl p-8 md:p-10 lg:p-12 border border-gray-200">
                            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
                                Your Profile{name && <span className="text-blue-600">, {name}!</span>}
                            </h1>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-8 shadow-sm animate-fade-in-down" role="alert">
                                    <strong className="font-semibold">Error:</strong>
                                    <span className="block sm:inline ml-2"> {error}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="flex items-start mb-8 gap-6 flex-wrap justify-center sm:flex-nowrap sm:justify-start">
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400 shadow-xl group transition-all duration-300 hover:scale-105 mb-4">
                                            <Image
                                                src={newAvatarPreview || currentAvatarUrl}
                                                alt="Profile Avatar"
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                style={{ objectFit: 'cover' }}
                                                className="rounded-full"
                                                priority
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-lg font-semibold"
                                                title="Change profile picture"
                                            >
                                                <Camera size={30} className="text-white" />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg text-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Change Picture
                                        </button>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center w-full sm:w-auto">
                                        <div className="mb-4">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 sr-only">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm text-2xl font-bold text-gray-900"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2 sr-only">
                                                Your Bio
                                            </label>
                                            <textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={4}
                                                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y transition duration-150 ease-in-out shadow-sm text-base text-gray-700"
                                                placeholder="Tell us a little about yourself (e.g., your interests, profession)..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-xl font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={24} className="mr-3" />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </form>

                            <hr className="my-12 border-gray-200" />

                            {/* User Posts Section */}
                            <section className="mt-12 pt-8 border-t border-gray-200">
                                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Posts</h2>

                                {isPostsLoading ? (
                                    <div className="text-center text-gray-600 text-lg py-8 **grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3** gap-6"> {/* Applied grid to loading state */}
                                        <p className="col-span-full">Loading your posts...</p> {/* Ensures message spans all columns */}
                                        {/* Provide dummy props for PostCard when loading */}
                                        <PostCard
                                            loading={true}
                                            // Dummy props for skeleton, as they won't be used by PostCard when loading is true
                                            post={{ _id: 'skeleton1' } as Post} // Cast to Post to satisfy type, _id is minimum
                                            handleLike={() => Promise.resolve()}
                                            handleShare={() => Promise.resolve()}
                                            currentUser={user} // Pass real user if available, or a dummy {uid: '', email: ''}
                                            getIdToken={getIdToken}
                                            onPostDeleted={() => {}}
                                            onPostUpdated={() => {}}
                                        />
                                        <PostCard
                                            loading={true}
                                            post={{ _id: 'skeleton2' } as Post}
                                            handleLike={() => Promise.resolve()}
                                            handleShare={() => Promise.resolve()}
                                            currentUser={user}
                                            getIdToken={getIdToken}
                                            onPostDeleted={() => {}}
                                            onPostUpdated={() => {}}
                                        />
                                         <PostCard
                                            loading={true}
                                            post={{ _id: 'skeleton3' } as Post}
                                            handleLike={() => Promise.resolve()}
                                            handleShare={() => Promise.resolve()}
                                            currentUser={user}
                                            getIdToken={getIdToken}
                                            onPostDeleted={() => {}}
                                            onPostUpdated={() => {}}
                                        />
                                    </div>
                                ) : postsError ? (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
                                        <strong className="font-semibold">Error loading posts:</strong>
                                        <span className="block sm:inline ml-2"> {postsError}</span>
                                    </div>
                                ) : userPosts.length === 0 ? (
                                    <p className="text-center text-gray-600 text-lg py-8">You haven't made any posts yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Changed this line */}
                                        {userPosts.map((post) => (
                                            <PostCard
                                                key={post._id}
                                                post={post}
                                                handleLike={handleLikePost}
                                                handleShare={handleSharePost}
                                                loading={false}
                                                currentUser={user}
                                                getIdToken={getIdToken}
                                                onPostDeleted={handlePostDeleted}
                                                onPostUpdated={handlePostUpdated}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}