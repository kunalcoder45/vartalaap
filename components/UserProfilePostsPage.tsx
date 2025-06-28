// // // client/components/UserProfilePostsPage.tsx
// // 'use client'; // Keep this, it's a client component

// // import { useEffect, useState, useCallback, useRef } from 'react';
// // import { usePathname, useRouter } from 'next/navigation';
// // import ProtectedRoute from '../components/ProtectedRoute';
// // import { useAuth } from '../components/AuthProvider';
// // import Navbar from '../components/navbar';
// // import Slidebar from '../components/slidebar';
// // import PostCard from '../components/PostCard';
// // import toast from 'react-hot-toast';
// // import LoadingBar from 'react-top-loading-bar';
// // import { ArrowLeft } from 'lucide-react';
// // // import React from 'react'; // REMOVE THIS IMPORT, as React.use() is no longer used here

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// // interface Post {
// //   _id: string;
// //   text: string;
// //   likes: number;
// //   sharesBy?: number;
// //   author?: {
// //     name: string;
// //     avatarUrl: string;
// //     bio?: string;
// //   };
// //   isLiked?: boolean;
// // }

// // // --- CHANGE HERE: uid is now a direct prop, not from params ---
// // interface UserProfilePostsPageProps {
// //   uid: string; // Receive uid directly as a prop
// // }

// // export default function UserProfilePostsPage({ uid: firebaseUid }: UserProfilePostsPageProps) { // Destructure uid and rename it
// //   // No need for React.use(params) or params here
// //   // const { uid: firebaseUid } = params; // REMOVE THIS LINE

// //   const { user: currentUser, getIdToken } = useAuth();
// //   const router = useRouter();
// //   const pathname = usePathname();
  
// //   const [userPosts, setUserPosts] = useState<Post[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [authorName, setAuthorName] = useState('Loading User...');
// //   const [authorAvatar, setAuthorAvatar] = useState(
// //     `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`
// //   );
// //   const [authorBio, setAuthorBio] = useState('No bio available.');

// //   const loadingBarRef = useRef<any>(null);

// //   const fetchUserPosts = useCallback(async () => {
// //     setLoading(true);
// //     loadingBarRef.current?.continuousStart();
// //     setError(null);

// //     try {
// //       const response = await fetch(`${API_BASE_URL}/posts/user/${firebaseUid}`);
// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
// //         throw new Error(errorData.message || `Failed to fetch user posts (Status: ${response.status})`);
// //       }
// //       let data: Post[] = await response.json();

// //       if (currentUser) {
// //         const token = await getIdToken();
// //         if (token) {
// //           data = await Promise.all(
// //             data.map(async (post) => {
// //               try {
// //                 const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
// //                   method: 'GET',
// //                   headers: { Authorization: `Bearer ${token}` },
// //                 });
// //                 if (!checkLikeResponse.ok) return { ...post, isLiked: false };
// //                 const likeData = await checkLikeResponse.json();
// //                 return { ...post, isLiked: likeData.isLiked };
// //               } catch {
// //                 return { ...post, isLiked: false };
// //               }
// //             })
// //           );
// //         }
// //       } else {
// //         data = data.map((post) => ({ ...post, isLiked: false }));
// //       }

// //       setUserPosts(data);

// //       if (data.length > 0 && data[0].author) {
// //         setAuthorName(data[0].author.name);
// //         setAuthorAvatar(
// //           data[0].author.avatarUrl.startsWith('http')
// //             ? data[0].author.avatarUrl
// //             : `${API_BASE_URL.replace('/api', '')}${data[0].author.avatarUrl}`
// //         );
// //         setAuthorBio(data[0].author.bio || 'No bio available.');
// //       } else {
// //         setAuthorName('User not found or has no posts');
// //         setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
// //         setAuthorBio('No bio available.');
// //       }
// //     } catch (err: any) {
// //       console.error("Error fetching user posts:", err.message);
// //       setError(err.message || 'Failed to load user posts.');
// //       toast.error(`Error loading user's posts: ${err.message}`);
// //       setUserPosts([]);
// //       setAuthorName('User not found');
// //       setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
// //       setAuthorBio('Could not load user information.');
// //     } finally {
// //       setLoading(false);
// //       loadingBarRef.current?.complete();
// //     }
// //   }, [firebaseUid, currentUser, getIdToken]); // firebaseUid is now a prop

// //   useEffect(() => {
// //     fetchUserPosts();
// //   }, [fetchUserPosts]);

// //   const handleLike = useCallback(
// //     async (postId: string) => {
// //       if (!currentUser) {
// //         toast.error('Please log in to like this post.');
// //         return;
// //       }

// //       try {
// //         const token = await getIdToken();
// //         if (!token) {
// //           toast.error('Authentication token not available. Please try logging in again.');
// //           return;
// //         }

// //         const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });

// //         if (!response.ok) {
// //           const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
// //           throw new Error(errorData.message || `Failed to like/unlike post (Status: ${response.status})`);
// //         }

// //         const data = await response.json();
// //         setUserPosts((prevPosts) =>
// //           prevPosts.map((post) =>
// //             post._id === postId ? { ...post, likes: data.updatedLikes, isLiked: data.isNowLiked } : post
// //           )
// //         );
// //       } catch (error: any) {
// //         console.error('Error liking/unliking post:', error);
// //         toast.error(`Failed to like/unlike post: ${error.message}`);
// //       }
// //     },
// //     [currentUser, getIdToken]
// //   );

// //   const handleShare = useCallback(
// //     async (postId: string) => {
// //       if (!currentUser) {
// //         toast.error('Please log in to share this post.');
// //         return;
// //       }

// //       try {
// //         const token = await getIdToken();
// //         if (!token) {
// //           toast.error('Authentication token not available. Please try logging in again.');
// //           return;
// //         }

// //         const apiResponse = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });

// //         if (!apiResponse.ok && !(apiResponse.status === 200 && apiResponse.headers.get('Content-Type')?.includes('application/json'))) {
// //           const errorData = await apiResponse.json().catch(() => ({ message: 'Unknown error' }));
// //           throw new Error(errorData.message || `Failed to record share on backend (Status: ${apiResponse.status})`);
// //         }

// //         const data = await apiResponse.json();

// //         if (data.message && data.message.includes('already shared')) {
// //           toast('You have already shared this post.', { icon: 'ℹ️' });
// //         } else if (data.updatedShares !== undefined) {
// //           setUserPosts((prevPosts) =>
// //             prevPosts.map((post) =>
// //               post._id === postId ? { ...post, sharesBy: data.updatedShares } : post
// //             )
// //           );
// //           toast.success('Post shared successfully!');
// //         }

// //         const postToShare = userPosts.find((p) => p._id === postId);
// //         const shareableLink = window.location.origin + `/posts/${postId}`;
// //         const shareData = {
// //           title: `Check out this post: ${postToShare?.text?.substring(0, 50)}...`,
// //           text: postToShare?.text,
// //           url: shareableLink,
// //         };

// //         if (navigator.share) {
// //           await navigator.share(shareData);
// //         } else {
// //           await navigator.clipboard.writeText(shareableLink);
// //           toast('Link copied to clipboard. You can paste it to share!', { icon: '📋' });
// //         }
// //       } catch (error: any) {
// //         console.error('Error during share operation:', error);
// //         if (error.name === 'AbortError') {
// //           console.log('Share dialog aborted by user.');
// //         } else {
// //           toast.error(`Failed to share post: ${error.message}`);
// //         }
// //       }
// //     },
// //     [currentUser, getIdToken, userPosts]
// //   );

// //   const mainContentHeight = 'calc(100vh - 64px)';

// //   if (error) {
// //     return (
// //       <ProtectedRoute>
// //         <Navbar />
// //         <div
// //           className="flex-grow p-6 bg-red-50 text-center text-red-700 font-semibold flex flex-col items-center justify-center"
// //           style={{ minHeight: mainContentHeight }}
// //         >
// //           <p className="text-xl mb-4">Oops! Something went wrong.</p>
// //           <p className="text-lg">Error: {error}</p>
// //           <button
// //             onClick={() => router.back()}
// //             className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
// //           >
// //             Go Back
// //           </button>
// //         </div>
// //       </ProtectedRoute>
// //     );
// //   }

// //   return (
// //     <>
// //       <LoadingBar color="#2563EB" ref={loadingBarRef} shadow={true} />
// //       <ProtectedRoute>
// //         <Navbar />
// //         <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
// //           <div className="hidden md:block p-4 pr-0">
// //             <Slidebar joinedGroups={[]} currentPath={pathname} className="min-h-full" />
// //           </div>

// //           <main
// //             className="flex-1 p-6 pt-2 max-w-full mx-auto overflow-y-auto hide-scrollbar"
// //             style={{ height: mainContentHeight }}
// //           >
// //             <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
// //               <button
// //                 onClick={() => router.back()}
// //                 className="text-blue-600 hover:text-blue-800 font-semibold flex items-center mb-6 transition duration-300 cursor-pointer"
// //               >
// //                 <ArrowLeft size={15} />
// //                 Back to Feed
// //               </button>

// //               <div className="flex flex-col sm:flex-row items-start sm:items-center text-left">
// //                 <div className="flex-shrink-0 flex flex-col items-start mr-6 mb-4 sm:mb-0">
// //                   <img
// //                     src={authorAvatar}
// //                     alt={`${authorName}'s avatar`}
// //                     className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-md pb-3"
// //                   />
// //                 </div>
// //                 <div className="flex flex-col pl-4 justify-center">
// //                   <h1 className="text-4xl font-extrabold text-gray-900">{authorName}</h1>
// //                 </div>
// //               </div>
// //               <p className="text-gray-600 text-lg max-w-prose leading-relaxed pl-1 pt-2">
// //                 {authorBio}
// //               </p>

// //               <hr className="my-8 border-gray-300" />

// //               <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Posts by {authorName}</h2>

// //               {userPosts.length === 0 && !loading ? (
// //                 <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
// //                   <p className="text-lg">No posts yet from {authorName}.</p>
// //                 </div>
// //               ) : (
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //                   {userPosts.map((post) => (
// //                     <PostCard
// //                       key={post._id}
// //                       post={post}
// //                       handleLike={handleLike}
// //                       handleShare={handleShare}
// //                       loading={false}
// //                       currentUser={currentUser}
// //                       getIdToken={getIdToken}
// //                     />
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </main>
// //         </div>
// //       </ProtectedRoute>
// //     </>
// //   );
// // }
// // client/components/UserProfilePostsPage.tsx




// 'use client'; // Keep this, it's a client component

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// // FIX: Corrected import paths based on the file's location (client/components/)
// import ProtectedRoute from './ProtectedRoute'; // Assuming ProtectedRoute is in client/components/
// import { useAuth } from './AuthProvider'; // Assuming AuthProvider is in client/components/
// import Navbar from './navbar'; // Assuming navbar is in client/components/
// import Slidebar from './slidebar'; // Assuming slidebar is in client/components/
// import PostCard from './PostCard'; // Assuming PostCard is in client/components/
// import toast, { Toaster } from 'react-hot-toast';
// import LoadingBar from 'react-top-loading-bar';
// import { ArrowLeft } from 'lucide-react';
// import Skeleton from 'react-loading-skeleton'; // Import Skeleton
// import 'react-loading-skeleton/dist/skeleton.css'; // Import Skeleton CSS

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface Post {
//     _id: string;
//     text: string;
//     likes: number;
//     sharesBy?: number;
//     author?: {
//         name: string;
//         avatarUrl: string;
//         bio?: string;
//         firebaseUid: string; // Ensure firebaseUid is part of author type
//     };
//     isLiked?: boolean;
//     createdAt: string; // Assuming post has a createdAt field for moment.js
//     mediaUrl?: string;
//     mediaType?: 'image' | 'video';
//     comments?: any[]; // Add comments to Post interface if it exists
// }

// interface UserProfilePostsPageProps {
//     uid: string; // Receive uid directly as a prop
// }

// export default function UserProfilePostsPage({ uid: firebaseUid }: UserProfilePostsPageProps) {
//     const { user: currentUser, getIdToken } = useAuth();
//     const router = useRouter();
//     const pathname = usePathname();

//     const [userPosts, setUserPosts] = useState<Post[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     // FIX: Re-introduced useState for authorName and authorAvatar
//     const [authorName, setAuthorName] = useState<string>(''); // Initialize with empty string or 'Loading User...'
//     const [authorAvatar, setAuthorAvatar] = useState<string>(''); // Initialize with empty string
//     const [authorBio, setAuthorBio] = useState('No bio available.');

//     const loadingBarRef = useRef<any>(null);

//     const fetchUserPosts = useCallback(async () => {
//         setLoading(true);
//         loadingBarRef.current?.continuousStart();
//         setError(null);

//         try {
//             const response = await fetch(`${API_BASE_URL}/posts/user/${firebaseUid}`);
//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                 throw new Error(errorData.message || `Failed to fetch user posts (Status: ${response.status})`);
//             }
//             let data: Post[] = await response.json();

//             // Set initial author info from the first post if available
//             if (data.length > 0 && data[0].author) {
//                 setAuthorName(data[0].author.name);
//                 setAuthorAvatar(
//                     data[0].author.avatarUrl.startsWith('http')
//                         ? data[0].author.avatarUrl
//                         : `${API_BASE_URL.replace('/api', '')}${data[0].author.avatarUrl}`
//                 );
//                 setAuthorBio(data[0].author.bio || 'No bio available.');
//             } else {
//                 // If no posts, set a default "User not found" state
//                 setAuthorName('User not found or has no posts');
//                 setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//                 setAuthorBio('No bio available.');
//             }

//             if (currentUser) {
//                 const token = await getIdToken();
//                 if (token) {
//                     data = await Promise.all(
//                         data.map(async (post) => {
//                             try {
//                                 const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
//                                     method: 'GET',
//                                     headers: { Authorization: `Bearer ${token}` },
//                                 });
//                                 if (!checkLikeResponse.ok) return { ...post, isLiked: false };
//                                 const likeData = await checkLikeResponse.json();
//                                 return { ...post, isLiked: likeData.isLiked };
//                             } catch {
//                                 return { ...post, isLiked: false };
//                             }
//                         })
//                     );
//                 }
//             } else {
//                 data = data.map((post) => ({ ...post, isLiked: false }));
//             }

//             setUserPosts(data);

//         } catch (err: any) {
//             console.error("Error fetching user posts:", err.message);
//             setError(err.message || 'Failed to load user posts.');
//             toast.error(`Error loading user's posts: ${err.message}`);
//             setUserPosts([]);
//             // When an error occurs, explicitly set user info to 'User not found'
//             setAuthorName('User not found');
//             setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
//             setAuthorBio('Could not load user information.');
//         } finally {
//             setLoading(false);
//             loadingBarRef.current?.complete();
//         }
//     }, [firebaseUid, currentUser, getIdToken]); // Dependencies are correct here

//     useEffect(() => {
//         fetchUserPosts();
//     }, [fetchUserPosts]);

//     const handleLike = useCallback(
//         async (postId: string, currentLikes: number, currentIsLiked: boolean) => { // Added params to match PostCard
//             if (!currentUser) {
//                 toast.error('Please log in to like this post.');
//                 return;
//             }

//             try {
//                 const token = await getIdToken();
//                 if (!token) {
//                     toast.error('Authentication token not available. Please try logging in again.');
//                     return;
//                 }

//                 const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to like/unlike post (Status: ${response.status})`);
//                 }

//                 const data = await response.json();
//                 setUserPosts((prevPosts) =>
//                     prevPosts.map((post) =>
//                         post._id === postId ? { ...post, likes: data.updatedLikes, isLiked: data.isNowLiked } : post
//                     )
//                 );
//             } catch (error: any) {
//                 console.error('Error liking/unliking post:', error);
//                 toast.error(`Failed to like/unlike post: ${error.message}`);
//             }
//         },
//         [currentUser, getIdToken] // Dependencies needed for actual API calls
//     );

//     const handleShare = useCallback(
//         async (postId: string) => {
//             if (!currentUser) {
//                 toast.error('Please log in to share this post.');
//                 return;
//             }

//             try {
//                 const token = await getIdToken();
//                 if (!token) {
//                     toast.error('Authentication token not available. Please try logging in again.');
//                     return;
//                 }

//                 const apiResponse = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });

//                 if (!apiResponse.ok && !(apiResponse.status === 200 && apiResponse.headers.get('Content-Type')?.includes('application/json'))) {
//                     const errorData = await apiResponse.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to record share on backend (Status: ${apiResponse.status})`);
//                 }

//                 const data = await apiResponse.json();

//                 if (data.message && data.message.includes('already shared')) {
//                     toast('You have already shared this post.', { icon: 'ℹ️' });
//                 } else if (data.updatedShares !== undefined) {
//                     setUserPosts((prevPosts) =>
//                         prevPosts.map((post) =>
//                             post._id === postId ? { ...post, sharesBy: data.updatedShares } : post
//                         )
//                     );
//                     toast.success('Post shared successfully!');
//                 }

//                 const postToShare = userPosts.find((p) => p._id === postId);
//                 const shareableLink = window.location.origin + `/posts/${postId}`;
//                 const shareData = {
//                     title: `Check out this post: ${postToShare?.text?.substring(0, 50)}...`,
//                     text: postToShare?.text,
//                     url: shareableLink,
//                 };

//                 if (navigator.share) {
//                     await navigator.share(shareData);
//                 } else {
//                     await navigator.clipboard.writeText(shareableLink);
//                     toast('Link copied to clipboard. You can paste it to share!', { icon: '📋' });
//                 }
//             } catch (error: any) {
//                 console.error('Error during share operation:', error);
//                 if (error.name === 'AbortError') {
//                     console.log('Share dialog aborted by user.');
//                 } else {
//                     toast.error(`Failed to share post: ${error.message}`);
//                 }
//             }
//         },
//         [currentUser, getIdToken, userPosts] // Dependencies needed for actual API calls and userPosts
//     );

//     const mainContentHeight = 'calc(100vh - 64px)';

//     if (error) {
//         return (
//             <ProtectedRoute>
//                 <Navbar />
//                 <div
//                     className="flex-grow p-6 bg-red-50 text-center text-red-700 font-semibold flex flex-col items-center justify-center"
//                     style={{ minHeight: mainContentHeight }}
//                 >
//                     <p className="text-xl mb-4">Oops! Something went wrong.</p>
//                     <p className="text-lg">Error: {error}</p>
//                     <button
//                         onClick={() => router.back()}
//                         className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
//                     >
//                         Go Back
//                     </button>
//                 </div>
//             </ProtectedRoute>
//         );
//     }

//     return (
//         <>
//             <LoadingBar color="#2563EB" ref={loadingBarRef} shadow={true} />
//             <ProtectedRoute>
//                 <Navbar />
//                 <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
//                     <div className="hidden md:block p-4 pr-0">
//                         <Slidebar joinedGroups={[]} currentPath={pathname} className="min-h-full" />
//                     </div>

//                     <main
//                         className="flex-1 p-6 pt-2 max-w-full mx-auto overflow-y-auto hide-scrollbar"
//                         style={{ height: mainContentHeight }}
//                     >
//                         <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
//                             <button
//                                 onClick={() => router.back()}
//                                 className="text-blue-600 hover:text-blue-800 font-semibold flex items-center mb-6 transition duration-300 cursor-pointer"
//                             >
//                                 <ArrowLeft size={15} />
//                                 Back to Feed
//                             </button>

//                             <div className="flex flex-col sm:flex-row items-start sm:items-center text-left mb-6">
//                                 <div className="flex-shrink-0 flex flex-col items-start mr-6 mb-4 sm:mb-0">
//                                     {loading ? (
//                                         <Skeleton circle width={112} height={112} />
//                                     ) : (
//                                         <img
//                                             src={authorAvatar || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`} // Fallback for authorAvatar
//                                             alt={authorName || 'User Avatar'} // Fallback for alt text
//                                             className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-md pb-3"
//                                         />
//                                     )}
//                                 </div>
//                                 <div className="flex flex-col pl-4 justify-center">
//                                     {loading ? (
//                                         <Skeleton width={200} height={36} />
//                                     ) : (
//                                         <h1 className="text-4xl font-extrabold text-gray-900">{authorName || 'User Profile'}</h1> // Fallback for authorName
//                                     )}
//                                 </div>
//                             </div>
//                             <p className="text-gray-600 text-lg max-w-prose leading-relaxed pl-1 pt-2">
//                                 {loading ? <Skeleton count={2} /> : authorBio}
//                             </p>

//                             <hr className="my-8 border-gray-300" />

//                             <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//                                 {loading ? <Skeleton width={250} /> : `Posts by ${authorName || 'User'}`}
//                             </h2>

//                             {loading ? (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     {Array(6).fill(0).map((_, index) => (
//                                         <div key={index} className="bg-white rounded-lg shadow-md p-4">
//                                             <div className="flex items-center space-x-3 mb-3">
//                                                 <Skeleton circle width={40} height={40} />
//                                                 <div>
//                                                     <Skeleton width={100} height={16} />
//                                                     <Skeleton width={80} height={12} />
//                                                 </div>
//                                             </div>
//                                             <Skeleton count={3} height={16} className="mb-2" />
//                                             <Skeleton height={150} className="rounded-md mb-3" />
//                                             <div className="flex justify-around items-center text-gray-500">
//                                                 <Skeleton width={60} height={24} />
//                                                 <Skeleton width={60} height={24} />
//                                                 <Skeleton width={60} height={24} />
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : userPosts.length === 0 ? (
//                                 <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
//                                     <p className="text-lg">No posts yet from {authorName || 'this user'}.</p>
//                                 </div>
//                             ) : (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     {userPosts.map((post) => (
//                                         <PostCard
//                                             key={post._id}
//                                             post={post}
//                                             handleLike={handleLike}
//                                             handleShare={handleShare}
//                                             loading={false}
//                                             currentUser={currentUser}
//                                             getIdToken={getIdToken}
//                                         />
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </main>
//                 </div>
//                 <Toaster />
//             </ProtectedRoute>
//         </>
//     );
// }










'use client'; // Keep this, it's a client component

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// FIX: Corrected import paths based on the file's location (client/components/)
import ProtectedRoute from './ProtectedRoute'; // Assuming ProtectedRoute is in client/components/
import { useAuth } from './AuthProvider'; // Assuming AuthProvider is in client/components/
import Navbar from './navbar'; // Assuming navbar is in client/components/
import Slidebar from './slidebar'; // Assuming slidebar is in client/components/
import PostCard from './PostCard'; // Assuming PostCard is in client/components/
import toast, { Toaster } from 'react-hot-toast';
import LoadingBar from 'react-top-loading-bar';
import { ArrowLeft } from 'lucide-react';
import Skeleton from 'react-loading-skeleton'; // Import Skeleton
import 'react-loading-skeleton/dist/skeleton.css'; // Import Skeleton CSS

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

interface Post {
    _id: string;
    text: string;
    likes: number;
    sharesBy?: number;
    author?: {
        name: string;
        avatarUrl: string;
        bio?: string;
        firebaseUid: string; // Ensure firebaseUid is part of author type
    };
    isLiked?: boolean;
    createdAt: string; // Assuming post has a createdAt field for moment.js
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    comments?: any[]; // Add comments to Post interface if it exists
}

// Assuming CustomUser type is defined somewhere or implicitly understood from AuthProvider
// For demonstration, let's define a minimal CustomUser type if it's not globally available.
// You should replace this with your actual CustomUser type from AuthProvider.
interface CustomUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}


interface UserProfilePostsPageProps {
    uid: string; // Receive uid directly as a prop
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

    const loadingBarRef = useRef<any>(null);

    const fetchUserPosts = useCallback(async () => {
        setLoading(true);
        loadingBarRef.current?.continuousStart();
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/posts/user/${firebaseUid}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Failed to fetch user posts (Status: ${response.status})`);
            }
            let data: Post[] = await response.json();

            // Set initial author info from the first post if available
            if (data.length > 0 && data[0].author) {
                setAuthorName(data[0].author.name);
                setAuthorAvatar(
                    data[0].author.avatarUrl.startsWith('http')
                        ? data[0].author.avatarUrl
                        : `${API_BASE_URL.replace('/api', '')}${data[0].author.avatarUrl}`
                );
                setAuthorBio(data[0].author.bio || 'No bio available.');
            } else {
                // If no posts, set a default "User not found" state
                setAuthorName('User not found or has no posts');
                setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
                setAuthorBio('No bio available.');
            }

            if (currentUser) {
                const token = await getIdToken();
                if (token) {
                    data = await Promise.all(
                        data.map(async (post) => {
                            try {
                                const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
                                    method: 'GET',
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                                if (!checkLikeResponse.ok) return { ...post, isLiked: false };
                                const likeData = await checkLikeResponse.json();
                                return { ...post, isLiked: likeData.isLiked };
                            } catch {
                                return { ...post, isLiked: false };
                            }
                        })
                    );
                }
            } else {
                data = data.map((post) => ({ ...post, isLiked: false }));
            }

            setUserPosts(data);

        } catch (err: any) {
            console.error("Error fetching user posts:", err.message);
            setError(err.message || 'Failed to load user posts.');
            toast.error(`Error loading user's posts: ${err.message}`);
            setUserPosts([]);
            // When an error occurs, explicitly set user info to 'User not found'
            setAuthorName('User not found');
            setAuthorAvatar(`${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`);
            setAuthorBio('Could not load user information.');
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

    // --- NEW: Callback for when a post is deleted from within PostCard ---
    const handlePostDeleted = useCallback((deletedPostId: string) => {
        setUserPosts((prevPosts) => prevPosts.filter(post => post._id !== deletedPostId));
        toast.success('Post deleted successfully!');
    }, []);

    // --- NEW: Callback for when a post is updated from within PostCard ---
    const handlePostUpdated = useCallback((updatedPost: Post) => {
        setUserPosts((prevPosts) =>
            prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
        );
        toast.success('Post updated successfully!');
    }, []);

    const mainContentHeight = 'calc(100vh - 64px)';

    if (error) {
        return (
            <ProtectedRoute>
                <Navbar />
                <div
                    className="flex-grow p-6 bg-red-50 text-center text-red-700 font-semibold flex flex-col items-center justify-center"
                    style={{ minHeight: mainContentHeight }}
                >
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
        <>
            <LoadingBar color="#2563EB" ref={loadingBarRef} shadow={true} />
            <ProtectedRoute>
                <Navbar />
                <div className="flex min-h-[calc(100vh-64px)] bg-gray-100">
                    <div className="hidden md:block p-4 pr-0">
                        <Slidebar joinedGroups={[]} currentPath={pathname} className="min-h-full" />
                    </div>

                    <main
                        className="flex-1 p-6 pt-2 max-w-full mx-auto overflow-y-auto hide-scrollbar"
                        style={{ height: mainContentHeight }}
                    >
                        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                            <button
                                onClick={() => router.back()}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center mb-6 transition duration-300 cursor-pointer"
                            >
                                <ArrowLeft size={15} />
                                Back to Feed
                            </button>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center text-left mb-6">
                                <div className="flex-shrink-0 flex flex-col items-start mr-6 mb-4 sm:mb-0">
                                    {loading ? (
                                        <Skeleton circle width={112} height={112} />
                                    ) : (
                                        <img
                                            src={authorAvatar || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`} // Fallback for authorAvatar
                                            alt={authorName || 'User Avatar'} // Fallback for alt text
                                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-md pb-3"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col pl-4 justify-center">
                                    {loading ? (
                                        <Skeleton width={200} height={36} />
                                    ) : (
                                        <h1 className="text-4xl font-extrabold text-gray-900">{authorName || 'User Profile'}</h1> // Fallback for authorName
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg max-w-prose leading-relaxed pl-1 pt-2">
                                {loading ? <Skeleton count={2} /> : authorBio}
                            </p>

                            <hr className="my-8 border-gray-300" />

                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {loading ? <Skeleton width={250} /> : `Posts by ${authorName || 'User'}`}
                            </h2>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                                    <p className="text-lg">No posts yet from {authorName || 'this user'}.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userPosts.map((post) => (
                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            handleLike={handleLike}
                                            handleShare={handleShare}
                                            loading={false}
                                            currentUser={currentUser}
                                            getIdToken={getIdToken}
                                            onPostDeleted={handlePostDeleted} // Added
                                            onPostUpdated={handlePostUpdated} // Added
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
                <Toaster />
            </ProtectedRoute>
        </>
    );
}