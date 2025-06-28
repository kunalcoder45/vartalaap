// // client/app/profile/page.tsx
// 'use client';

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { useAuth } from '../../components/AuthProvider';
// import Navbar from '../../components/navbar';
// import Slidebar from '../../components/slidebar';
// import Image from 'next/image';
// import toast from 'react-hot-toast';
// import { Camera, Save } from 'lucide-react';
// import LoadingBar from 'react-top-loading-bar';
// import PostCard from '../../components/PostCard';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// // Define a type for Post structure (expanded to match PostCard's needs)
// interface Post {
//     _id: string;
//     text: string; // Changed from 'content' to 'text' as per PostCard
//     mediaUrl?: string; // For images/videos
//     mediaType?: 'image' | 'video'; // Type of media
//     createdAt: string;
//     author: {
//         _id: string;
//         name: string;
//         firebaseUid: string;
//         avatarUrl?: string;
//     };
//     likes: string[]; // Array of user IDs who liked it
//     comments: any[]; // Array of comments
//     sharesBy: string[]; // Array of user IDs who shared it
//     isLiked: boolean; // Indicates if current user liked it
// }

// export default function ProfilePage() {
//     const { user, getIdToken } = useAuth();
//     const pathname = usePathname();
//     const joinedGroups: any[] = [];

//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [progress, setProgress] = useState(0);

//     const [name, setName] = useState('');
//     const [bio, setBio] = useState('');
//     const [currentAvatarUrl, setCurrentAvatarUrl] = useState(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//     const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
//     const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

//     const [userPosts, setUserPosts] = useState<Post[]>([]);
//     const [isPostsLoading, setIsPostsLoading] = useState(true);
//     const [postsError, setPostsError] = useState<string | null>(null);

//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         setProgress(30);
//         const timer = setTimeout(() => {
//             setProgress(100);
//         }, 200);
//         return () => clearTimeout(timer);
//     }, [pathname]);

//     /**
//      * Effect hook to fetch the user's profile data and posts from the backend.
//      */
//     useEffect(() => {
//         const fetchUserProfileAndPosts = async () => {
//             if (!user) {
//                 setIsLoading(false);
//                 setIsPostsLoading(false);
//                 return;
//             }

//             setIsLoading(true);
//             setIsPostsLoading(true);
//             setError(null);
//             setPostsError(null);

//             try {
//                 const token = await getIdToken();
//                 if (!token) throw new Error('Authentication token not available.');

//                 // --- Fetch User Profile ---
//                 const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                     method: 'GET',
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!profileResponse.ok) {
//                     let errorMessage = `Failed to fetch user profile (Status: ${profileResponse.status})`;
//                     try {
//                         const errorData = await profileResponse.json();
//                         errorMessage = errorData.message || errorMessage;
//                     } catch {
//                         const errorText = await profileResponse.text();
//                         console.error('Non-JSON error response fetching profile:', errorText);
//                         errorMessage = errorText || errorMessage;
//                     }
//                     throw new Error(errorMessage);
//                 }

//                 const userData = await profileResponse.json();
//                 setName(userData.name || '');
//                 setBio(userData.bio || '');
//                 setCurrentAvatarUrl(userData.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//                 setNewAvatarPreview(null);

//                 // --- Fetch User Posts ---
//                 const postsResponse = await fetch(`${API_BASE_URL}/posts/user/${user.uid}`, {
//                     method: 'GET',
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!postsResponse.ok) {
//                     let errorMessage = `Failed to fetch user posts (Status: ${postsResponse.status})`;
//                     try {
//                         const errorData = await postsResponse.json();
//                         errorMessage = errorData.message || errorMessage;
//                     } catch {
//                         const errorText = await postsResponse.text();
//                         console.error('Non-JSON error response fetching posts:', errorText);
//                         errorMessage = errorText || errorMessage;
//                     }
//                     throw new Error(errorMessage);
//                 }

//                 const postsData: Post[] = await postsResponse.json();
//                 setUserPosts(postsData);

//             } catch (err: any) {
//                 console.error('Error fetching data:', err);
//                 setError(err.message || 'Failed to load profile data.');
//                 setPostsError(err.message || 'Failed to load user posts.');
//                 toast.error(`Error loading data: ${err.message}`);
//             } finally {
//                 setIsLoading(false);
//                 setIsPostsLoading(false);
//             }
//         };

//         fetchUserProfileAndPosts();
//     }, [user, getIdToken]);

//     /**
//      * Handles file selection for a new avatar.
//      * Performs size validation and creates a preview URL.
//      */
//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             if (file.size > 5 * 1024 * 1024) {
//                 toast.error('Image size cannot exceed 5MB.');
//                 setNewAvatarFile(null);
//                 setNewAvatarPreview(null);
//                 return;
//             }
//             setNewAvatarFile(file);
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setNewAvatarPreview(reader.result as string);
//             };
//             reader.readAsDataURL(file);
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
//         event.preventDefault();

//         if (!user) {
//             toast.error('Please log in to update your profile.');
//             return;
//         }

//         setIsSaving(true);
//         setError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available.');

//             const formData = new FormData();
//             formData.append('name', name);
//             formData.append('bio', bio);
//             if (newAvatarFile) {
//                 formData.append('avatar', newAvatarFile);
//             }

//             const response = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'PUT',
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 let errorMessage = `Failed to update profile (Status: ${response.status})`;
//                 try {
//                     const errorData = await response.json();
//                     errorMessage = errorData.message || errorMessage;
//                 } catch {
//                     const errorText = await response.text();
//                     console.error('Non-JSON error response updating profile:', errorText);
//                     errorMessage = errorText || errorMessage;
//                 }
//                 throw new Error(errorMessage);
//             }

//             const updatedUser = await response.json();
//             setCurrentAvatarUrl(updatedUser.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//             setNewAvatarFile(null);
//             setNewAvatarPreview(null);
//             toast.success('Profile updated successfully!');
//         } catch (err: any) {
//             console.error('Error updating profile:', err);
//             setError(err.message || 'Failed to update profile.');
//             toast.error(`Error updating profile: ${err.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // --- Post Action Handlers (needed for PostCard) ---
//     const handleLikePost = useCallback(async (postId: string) => {
//         if (!user) {
//             toast.error('Please log in to like posts.');
//             return;
//         }
//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available.');

//             const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to like/unlike post.');
//             }

//             const updatedPost = await response.json();
//             setUserPosts(prevPosts =>
//                 prevPosts.map(p => (p._id === postId ? { ...p, likes: updatedPost.likes, isLiked: updatedPost.isLiked } : p))
//             );
//             toast.success(updatedPost.isLiked ? 'Post liked!' : 'Post unliked!');
//         } catch (error: any) {
//             console.error('Error liking post:', error);
//             toast.error(`Error liking post: ${error.message}`);
//         }
//     }, [user, getIdToken]);

//     const handleSharePost = useCallback(async (postId: string) => {
//         const postLink = `${window.location.origin}/posts/${postId}`;
//         try {
//             await navigator.clipboard.writeText(postLink);
//             toast.success('Post link copied to clipboard!');

//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available.');

//             const response = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to record share.');
//             }
//             const updatedPost = await response.json();
//             setUserPosts(prevPosts =>
//                 prevPosts.map(p => (p._id === postId ? { ...p, sharesBy: updatedPost.sharesBy } : p))
//             );
//         } catch (err: any) {
//             console.error('Error sharing post:', err);
//             toast.error(`Failed to share post: ${err.message}`);
//         }
//     }, [getIdToken]);

//     const handlePostDeleted = useCallback((deletedPostId: string) => {
//         setUserPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
//         toast.success('Post removed from your profile.');
//     }, []);

//     const handlePostUpdated = useCallback((updatedPost: Post) => {
//         setUserPosts(prevPosts =>
//             prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
//         );
//         toast.success('Post updated!');
//     }, []);


//     // When `isLoading` is true (before any profile data is loaded), show a generic loader.
//     // This is for the *entire page* loading, not just posts.
//     if (isLoading) {
//         return (
//             <ProtectedRoute>
//                 <Navbar />
//                 <div className="flex-grow p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
//                     <LoadingBar
//                         color="#3498db"
//                         progress={progress}
//                         onLoaderFinished={() => setProgress(0)}
//                         shadow={true}
//                         height={3}
//                     />
//                     <p className="text-gray-600 text-lg mt-4">Loading profile data...</p>
//                 </div>
//             </ProtectedRoute>
//         );
//     }

//     return (
//         <ProtectedRoute>
//             <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
//                 <Navbar />
//                 <LoadingBar
//                     color="#3498db"
//                     progress={progress}
//                     onLoaderFinished={() => setProgress(0)}
//                     shadow={true}
//                     height={3}
//                 />

//                 <div className="flex flex-1 overflow-hidden">
//                     <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="flex-shrink-0 m-4" />

//                     <main className="flex-1 overflow-y-auto p-6 md:p-4 lg:p-4 bg-gray-100 flex justify-center items-start">
//                         <div className="w-full max-w-full bg-white rounded-xl shadow-2xl p-8 md:p-10 lg:p-12 border border-gray-200">
//                             <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
//                                 Your Profile{name && <span className="text-blue-600">, {name}!</span>}
//                             </h1>

//                             {error && (
//                                 <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-8 shadow-sm animate-fade-in-down" role="alert">
//                                     <strong className="font-semibold">Error:</strong>
//                                     <span className="block sm:inline ml-2"> {error}</span>
//                                 </div>
//                             )}

//                             <form onSubmit={handleUpdateProfile} className="space-y-8">
//                                 <div className="flex items-start mb-8 gap-6 flex-wrap justify-center sm:flex-nowrap sm:justify-start">
//                                     <div className="flex-shrink-0 flex flex-col items-center">
//                                         <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400 shadow-xl group transition-all duration-300 hover:scale-105 mb-4">
//                                             <Image
//                                                 src={newAvatarPreview || currentAvatarUrl}
//                                                 alt="Profile Avatar"
//                                                 fill
//                                                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                                                 style={{ objectFit: 'cover' }}
//                                                 className="rounded-full"
//                                                 priority
//                                             />
//                                             <input
//                                                 type="file"
//                                                 accept="image/*"
//                                                 ref={fileInputRef}
//                                                 onChange={handleFileChange}
//                                                 className="hidden"
//                                             />
//                                             <div
//                                                 onClick={() => fileInputRef.current?.click()}
//                                                 className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-lg font-semibold"
//                                                 title="Change profile picture"
//                                             >
//                                                 <Camera size={30} className="text-white" />
//                                             </div>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={() => fileInputRef.current?.click()}
//                                             className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg text-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                                         >
//                                             Change Picture
//                                         </button>
//                                     </div>

//                                     <div className="flex-1 flex flex-col justify-center w-full sm:w-auto">
//                                         <div className="mb-4">
//                                             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 sr-only">
//                                                 Your Name
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="name"
//                                                 value={name}
//                                                 onChange={(e) => setName(e.target.value)}
//                                                 className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm text-2xl font-bold text-gray-900"
//                                                 placeholder="Enter your full name"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2 sr-only">
//                                                 Your Bio
//                                             </label>
//                                             <textarea
//                                                 id="bio"
//                                                 value={bio}
//                                                 onChange={(e) => setBio(e.target.value)}
//                                                 rows={4}
//                                                 className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y transition duration-150 ease-in-out shadow-sm text-base text-gray-700"
//                                                 placeholder="Tell us a little about yourself (e.g., your interests, profession)..."
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     disabled={isSaving}
//                                     className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-xl font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-1"
//                                 >
//                                     {isSaving ? (
//                                         <>
//                                             <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Saving...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Save size={24} className="mr-3" />
//                                             Save Profile
//                                         </>
//                                     )}
//                                 </button>
//                             </form>

//                             <hr className="my-12 border-gray-200" />

//                             {/* User Posts Section */}
//                             <section className="mt-12 pt-8 border-t border-gray-200">
//                                 <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Posts</h2>

//                                 {isPostsLoading ? (
//                                     <div className="text-center text-gray-600 text-lg py-8 **grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3** gap-6"> {/* Applied grid to loading state */}
//                                         <p className="col-span-full">Loading your posts...</p> {/* Ensures message spans all columns */}
//                                         {/* Provide dummy props for PostCard when loading */}
//                                         <PostCard
//                                             loading={true}
//                                             // Dummy props for skeleton, as they won't be used by PostCard when loading is true
//                                             post={{ _id: 'skeleton1' } as Post} // Cast to Post to satisfy type, _id is minimum
//                                             handleLike={() => Promise.resolve()}
//                                             handleShare={() => Promise.resolve()}
//                                             currentUser={user} // Pass real user if available, or a dummy {uid: '', email: ''}
//                                             getIdToken={getIdToken}
//                                             onPostDeleted={() => {}}
//                                             onPostUpdated={() => {}}
//                                         />
//                                         <PostCard
//                                             loading={true}
//                                             post={{ _id: 'skeleton2' } as Post}
//                                             handleLike={() => Promise.resolve()}
//                                             handleShare={() => Promise.resolve()}
//                                             currentUser={user}
//                                             getIdToken={getIdToken}
//                                             onPostDeleted={() => {}}
//                                             onPostUpdated={() => {}}
//                                         />
//                                          <PostCard
//                                             loading={true}
//                                             post={{ _id: 'skeleton3' } as Post}
//                                             handleLike={() => Promise.resolve()}
//                                             handleShare={() => Promise.resolve()}
//                                             currentUser={user}
//                                             getIdToken={getIdToken}
//                                             onPostDeleted={() => {}}
//                                             onPostUpdated={() => {}}
//                                         />
//                                     </div>
//                                 ) : postsError ? (
//                                     <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
//                                         <strong className="font-semibold">Error loading posts:</strong>
//                                         <span className="block sm:inline ml-2"> {postsError}</span>
//                                     </div>
//                                 ) : userPosts.length === 0 ? (
//                                     <p className="text-center text-gray-600 text-lg py-8">You haven't made any posts yet.</p>
//                                 ) : (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Changed this line */}
//                                         {userPosts.map((post) => (
//                                             <PostCard
//                                                 key={post._id}
//                                                 post={post}
//                                                 handleLike={handleLikePost}
//                                                 handleShare={handleSharePost}
//                                                 loading={false}
//                                                 currentUser={user}
//                                                 getIdToken={getIdToken}
//                                                 onPostDeleted={handlePostDeleted}
//                                                 onPostUpdated={handlePostUpdated}
//                                             />
//                                         ))}
//                                     </div>
//                                 )}
//                             </section>
//                         </div>
//                     </main>
//                 </div>
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

interface CustomUser {
  uid: string;
  mongoUserId: string;
  name: string;
  email: string; // <--- Add email
  displayName: string; // <--- Add displayName
  avatarUrl: string;
}

export default function ProfilePage() {
    const { user, getIdToken, mongoUser } = useAuth();
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

    // Create a properly typed currentUser for PostCard
    const createCurrentUserForPostCard = useCallback(() => {
        if (!user || !mongoUser) return null;
        
        return {
            uid: user.uid,
            mongoUserId: mongoUser._id, // Use _id from mongoUser
            name: user.name || user.displayName || 'Unknown User',
            email: user.email || '', // Add email property
            displayName: user.displayName || user.name || 'Unknown User',
            avatarUrl: user.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`
        };
    }, [user, mongoUser]);

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

    const currentUserForPostCard = createCurrentUserForPostCard();

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen overflow-hidden mt-18">
                <Navbar />
                <LoadingBar
                    color="#3498db"
                    progress={progress}
                    onLoaderFinished={() => setProgress(0)}
                    shadow={true}
                    height={3}
                />

                <div className="flex flex-1 overflow-hidden bg-gray-100">
                    <Slidebar joinedGroups={joinedGroups} currentPath={pathname} className="flex-shrink-0 m-4" />

                    <main className="flex-1 overflow-y-auto p-6 md:p-4 lg:p-4 flex justify-center items-start hide-scrollbar bg-gray-50">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <p className="col-span-full text-center text-gray-600 text-lg py-8">Loading your posts...</p>
                                        {/* Show skeleton loading cards */}
                                        {currentUserForPostCard && (
                                            <>
                                                <PostCard
                                                    loading={true}
                                                    post={{ _id: 'skeleton1' } as Post}
                                                    handleLike={() => Promise.resolve()}
                                                    handleShare={() => Promise.resolve()}
                                                    currentUser={currentUserForPostCard}
                                                    getIdToken={getIdToken}
                                                    onPostDeleted={() => {}}
                                                    onPostUpdated={() => {}}
                                                />
                                                <PostCard
                                                    loading={true}
                                                    post={{ _id: 'skeleton2' } as Post}
                                                    handleLike={() => Promise.resolve()}
                                                    handleShare={() => Promise.resolve()}
                                                    currentUser={currentUserForPostCard}
                                                    getIdToken={getIdToken}
                                                    onPostDeleted={() => {}}
                                                    onPostUpdated={() => {}}
                                                />
                                                <PostCard
                                                    loading={true}
                                                    post={{ _id: 'skeleton3' } as Post}
                                                    handleLike={() => Promise.resolve()}
                                                    handleShare={() => Promise.resolve()}
                                                    currentUser={currentUserForPostCard}
                                                    getIdToken={getIdToken}
                                                    onPostDeleted={() => {}}
                                                    onPostUpdated={() => {}}
                                                />
                                            </>
                                        )}
                                    </div>
                                ) : postsError ? (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
                                        <strong className="font-semibold">Error loading posts:</strong>
                                        <span className="block sm:inline ml-2"> {postsError}</span>
                                    </div>
                                ) : userPosts.length === 0 ? (
                                    <p className="text-center text-gray-600 text-lg py-8">You haven't made any posts yet.</p>
                                ) : (
                                    currentUserForPostCard && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {userPosts.map((post) => (
                                                <PostCard
                                                    key={post._id}
                                                    post={post}
                                                    handleLike={handleLikePost}
                                                    handleShare={handleSharePost}
                                                    loading={false}
                                                    currentUser={currentUserForPostCard}
                                                    getIdToken={getIdToken}
                                                    onPostDeleted={handlePostDeleted}
                                                    onPostUpdated={handlePostUpdated}
                                                />
                                            ))}
                                        </div>
                                    )
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}