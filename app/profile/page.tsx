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
// import { getFullAvatarUrl } from '../../utils/imageUtils';

// // Ensure this matches your backend's URL from .env.local or process.env
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// interface Post {
//     _id: string;
//     text: string;
//     mediaUrl?: string;
//     mediaType?: 'image' | 'video';
//     createdAt: string;
//     author: {
//         _id: string;
//         name: string;
//         firebaseUid: string;
//         avatarUrl?: string;
//     };
//     likes: string[];
//     comments: any[];
//     sharesBy: string[];
//     isLiked: boolean;
// }

// export default function ProfilePage() {
//     const { user, getIdToken, mongoUser } = useAuth();
//     const pathname = usePathname();
//     const joinedGroups: any[] = []; // Placeholder, adjust as needed

//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [progress, setProgress] = useState(0);

//     const [name, setName] = useState('');
//     const [bio, setBio] = useState('');
//     // Initialize with a default local path that the backend should also serve
//     const [currentAvatarUrl, setCurrentAvatarUrl] = useState(''); // Will be set by fetch based on backend's response
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

//                 // Fetch user profile
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
//                 // currentAvatarUrl will be the full URL from the backend
//                 // setCurrentAvatarUrl(userData.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//                 // setCurrentAvatarUrl(getFullAvatarUrl(userData.avatarUrl));
//                 setCurrentAvatarUrl(getFullAvatarUrl(userData.avatarUrl));

//                 setNewAvatarPreview(null); // Clear any old preview

//                 // Fetch user posts (using firebaseUid as per your backend route)
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
//     }, [user, getIdToken]); // Dependency array: re-run if user or getIdToken changes

//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (file) {
//             if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
//             reader.readAsDataURL(file); // Read file as Data URL for preview
//         } else {
//             setNewAvatarFile(null);
//             setNewAvatarPreview(null);
//         }
//     };

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
//                 formData.append('avatar', newAvatarFile); // Append the file for upload
//             }

//             const response = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'PUT',
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     // Content-Type is NOT set for FormData; browser sets it automatically
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
//             // Backend now returns the full URL, so update directly
//             // setCurrentAvatarUrl(updatedUser.avatarUrl || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//             setCurrentAvatarUrl(getFullAvatarUrl(updatedUser.avatarUrl));

//             setNewAvatarFile(null);
//             setNewAvatarPreview(null); // Clear preview after successful upload
//             toast.success('Profile updated successfully!');
//         } catch (err: any) {
//             console.error('Error updating profile:', err);
//             setError(err.message || 'Failed to update profile.');
//             toast.error(`Error updating profile: ${err.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Callback functions for PostCard (like, share, delete, update)
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

//     const createCurrentUserForPostCard = useCallback(() => {
//         if (!user || !mongoUser) return null;

//         return {
//             uid: user.uid,
//             mongoUserId: mongoUser._id,
//             name: mongoUser.name || user.displayName || 'Unknown User',
//             // avatarUrl: mongoUser.avatarUrl || user.photoURL || `${API_BASE_URL.replace('/api', '')}/uploads/avatars/userLogo.png`,
//             avatarUrl: getFullAvatarUrl(mongoUser.avatarUrl || user.photoURL),
//             _id: mongoUser._id,
//             email: user.email,
//             displayName: user.displayName,
//             photoURL: user.photoURL,
//         };
//     }, [user, mongoUser]);

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

//     const currentUserForPostCard = createCurrentUserForPostCard();

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
//                                             {/* Use newAvatarPreview if available, otherwise currentAvatarUrl */}
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
//                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                         <p className="col-span-full text-center text-gray-600 text-lg py-8">Loading your posts...</p>
//                                         {/* Show skeleton loading cards */}
//                                         {currentUserForPostCard && (
//                                             <>
//                                                 <PostCard
//                                                     loading={true}
//                                                     post={{ _id: 'skeleton1' } as Post}
//                                                     handleLike={() => Promise.resolve()}
//                                                     handleShare={() => Promise.resolve()}
//                                                     currentUser={currentUserForPostCard}
//                                                     getIdToken={getIdToken}
//                                                     onPostDeleted={() => {}}
//                                                     onPostUpdated={() => {}}
//                                                 />
//                                                 <PostCard
//                                                     loading={true}
//                                                     post={{ _id: 'skeleton2' } as Post}
//                                                     handleLike={() => Promise.resolve()}
//                                                     handleShare={() => Promise.resolve()}
//                                                     currentUser={currentUserForPostCard}
//                                                     getIdToken={getIdToken}
//                                                     onPostDeleted={() => {}}
//                                                     onPostUpdated={() => {}}
//                                                 />
//                                                 <PostCard
//                                                     loading={true}
//                                                     post={{ _id: 'skeleton3' } as Post}
//                                                     handleLike={() => Promise.resolve()}
//                                                     handleShare={() => Promise.resolve()}
//                                                     currentUser={currentUserForPostCard}
//                                                     getIdToken={getIdToken}
//                                                     onPostDeleted={() => {}}
//                                                     onPostUpdated={() => {}}
//                                                 />
//                                             </>
//                                         )}
//                                     </div>
//                                 ) : postsError ? (
//                                     <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
//                                         <strong className="font-semibold">Error loading posts:</strong>
//                                         <span className="block sm:inline ml-2"> {postsError}</span>
//                                     </div>
//                                 ) : userPosts.length === 0 ? (
//                                     <p className="text-center text-gray-600 text-lg py-8">You haven't made any posts yet.</p>
//                                 ) : (
//                                     currentUserForPostCard && (
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                             {userPosts.map((post) => (
//                                                 <PostCard
//                                                     key={post._id}
//                                                     post={post}
//                                                     handleLike={handleLikePost}
//                                                     handleShare={handleSharePost}
//                                                     loading={false}
//                                                     currentUser={currentUserForPostCard}
//                                                     getIdToken={getIdToken}
//                                                     onPostDeleted={handlePostDeleted}
//                                                     onPostUpdated={handlePostUpdated}
//                                                 />
//                                             ))}
//                                         </div>
//                                     )
//                                 )}
//                             </section>
//                         </div>
//                     </main>
//                 </div>
//             </div>
//         </ProtectedRoute>
//     );
// }








// responsive

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';
import Navbar from '../../components/navbar';
import Slidebar from '../../components/slidebar';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Camera, Save, Menu } from 'lucide-react'; // Import Menu icon for toggle
import LoadingBar from 'react-top-loading-bar';
import PostCard from '../../components/PostCard';
import { getFullAvatarUrl } from '../../utils/imageUtils';

// Ensure this matches your backend's URL from .env.local or process.env
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

interface Post {
    _id: string;
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: string;
    author: {
        _id: string;
        name: string;
        firebaseUid: string;
        avatarUrl?: string;
    };
    likes: string[];
    comments: any[];
    sharesBy: string[];
    isLiked: boolean;
}

export default function ProfilePage() {
    const { user, getIdToken, mongoUser } = useAuth();
    const pathname = usePathname();
    const joinedGroups: any[] = []; // Placeholder, adjust as needed

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for managing sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setProgress(30);
        const timer = setTimeout(() => {
            setProgress(100);
        }, 200);
        return () => clearTimeout(timer);
    }, [pathname]);

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

                // Fetch user profile
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
                setCurrentAvatarUrl(getFullAvatarUrl(userData.avatarUrl));
                setNewAvatarPreview(null);

                // Fetch user posts
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
            setCurrentAvatarUrl(getFullAvatarUrl(updatedUser.avatarUrl));
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

    const createCurrentUserForPostCard = useCallback(() => {
        if (!user || !mongoUser) return null;

        return {
            uid: user.uid,
            mongoUserId: mongoUser._id,
            name: mongoUser.name || user.displayName || 'Unknown User',
            avatarUrl: getFullAvatarUrl(mongoUser.avatarUrl || user.photoURL),
            _id: mongoUser._id,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };
    }, [user, mongoUser]);

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
            <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
                <Navbar />
                <LoadingBar
                    color="#3498db"
                    progress={progress}
                    onLoaderFinished={() => setProgress(0)}
                    shadow={true}
                    height={3}
                />

                <div className="flex flex-1 overflow-hidden mt-14 m-0">
                    {/* Mobile Menu Button */}
                    <div
                        className="lg:hidden fixed top-1/2 left-0 z-50 px-1 py-12 bg-blue-500 text-white rounded-full shadow-lg"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        ></div>
                    )}

                    {/* Slidebar */}
                    <Slidebar
                        joinedGroups={joinedGroups}
                        currentPath={pathname}
                        className={`fixed inset-y-0 left-0 z- w-[80%] md:w-3/12 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full mt-4'
                            }`}
                        onLinkClick={() => setIsSidebarOpen(false)} // Close sidebar on link click
                    />

                    <main className="flex-1 overflow-y-auto p-0 md:p-6 lg:p-4 bg-gray-100 flex justify-center items-start">
                        <div className="w-full max-w-full bg-white rounded-xl shadow-2xl  md:p-8 p-4 lg:p-12 border border-gray-200">
                            <h1 className="text-2xl md:text-4xl mt-3 md:mt-0 font-extrabold text-center text-gray-900 mb-4 md:mb-10 tracking-tight">
                                Your Profile{name && <span className="text-blue-600">, {name}!</span>}
                            </h1>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-8 shadow-sm animate-fade-in-down" role="alert">
                                    <strong className="font-semibold">Error:</strong>
                                    <span className="block sm:inline ml-2"> {error}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="md:flex items-start mb-8 gap-6 flex-wrap justify-center sm:flex-nowrap sm:justify-start">
                                    <div className="flex-shrink-0 flex flex-col items-center md:mb-0 mb-6">
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
                                                className="w-full px-5 py-3 h-20 md:h-auto border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y transition duration-150 ease-in-out shadow-sm text-base text-gray-700"
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
                                                    onPostDeleted={() => { }}
                                                    onPostUpdated={() => { }}
                                                />
                                                <PostCard
                                                    loading={true}
                                                    post={{ _id: 'skeleton2' } as Post}
                                                    handleLike={() => Promise.resolve()}
                                                    handleShare={() => Promise.resolve()}
                                                    currentUser={currentUserForPostCard}
                                                    getIdToken={getIdToken}
                                                    onPostDeleted={() => { }}
                                                    onPostUpdated={() => { }}
                                                />
                                                <PostCard
                                                    loading={true}
                                                    post={{ _id: 'skeleton3' } as Post}
                                                    handleLike={() => Promise.resolve()}
                                                    handleShare={() => Promise.resolve()}
                                                    currentUser={currentUserForPostCard}
                                                    getIdToken={getIdToken}
                                                    onPostDeleted={() => { }}
                                                    onPostUpdated={() => { }}
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