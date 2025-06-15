
// // client/components/mainContent.tsx
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import PostCard from './PostCard'; // Component to display individual posts
// import { useAuth } from './AuthProvider'; // Use your AuthProvider's hook
// import toast from 'react-hot-toast'; // Import toast here

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// /**
//  * MainContent component: Fetches and displays the main feed of posts.
//  * It integrates with PostCard for rendering and handles like/share actions.
//  * This component no longer handles its own scrolling; scrolling is managed by its parent.
//  */
// const MainContent = () => {
//     const { user: currentUser, getIdToken } = useAuth();

//     const [posts, setPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const fetchPosts = useCallback(() => {
//         const controller = new AbortController();
//         const signal = controller.signal;

//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const response = await fetch(`${API_BASE_URL}/posts`, { signal });
//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
//                 }
//                 const data = await response.json();

//                 let postsWithLikeStatus = data;
//                 if (currentUser) {
//                     const token = await getIdToken();
//                     if (!token) {
//                         console.warn('No token available for like status check, showing all posts as unliked.');
//                         postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
//                     } else {
//                         postsWithLikeStatus = await Promise.all(
//                             data.map(async (post: any) => {
//                                 try {
//                                     const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
//                                         method: 'GET',
//                                         headers: { Authorization: `Bearer ${token}` },
//                                         signal,
//                                     });
//                                     if (!checkLikeResponse.ok) {
//                                         return { ...post, isLiked: false };
//                                     }
//                                     const likeData = await checkLikeResponse.json();
//                                     return { ...post, isLiked: likeData.isLiked };
//                                 } catch (likeError) {
//                                     console.error(`Error checking like status for post ${post._id}:`, likeError);
//                                     return { ...post, isLiked: false };
//                                 }
//                             })
//                         );
//                     }
//                 } else {
//                     postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
//                 }
//                 setPosts(postsWithLikeStatus);
//             } catch (err: any) {
//                 if (err.name === 'AbortError') {
//                     console.log('Fetch aborted');
//                 } else {
//                     setError(err.message);
//                     setPosts([]);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();

//         return () => controller.abort();
//     }, [currentUser, getIdToken, API_BASE_URL]);

//     useEffect(() => {
//         if (currentUser !== undefined) {
//             fetchPosts();
//         }
//     }, [fetchPosts, currentUser]);

//     const handleLike = useCallback(
//         async (postId: string, currentLikes: number, currentIsLiked: boolean) => {
//             if (!currentUser || !postId) {
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
//                 setPosts((prevPosts) =>
//                     prevPosts.map((postItem: any) =>
//                         postItem._id === postId
//                             ? { ...postItem, likes: data.updatedLikes, isLiked: data.isNowLiked }
//                             : postItem
//                     )
//                 );
//             } catch (error: any) {
//                 console.error('Error liking/unliking post:', error);
//                 toast.error(`Failed to like/unlike post: ${error.message}`);
//             }
//         },
//         [currentUser, getIdToken, API_BASE_URL]
//     );

//     const handleShare = useCallback(
//         async (postId: string) => {
//             if (!currentUser || !postId) {
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
//                 } else {
//                     const data = await apiResponse.json();
//                     if (data.message && data.message.includes('already shared')) {
//                         toast('You have already shared this post.');
//                     } else if (data.updatedShares !== undefined) {
//                         setPosts((prevPosts) =>
//                             prevPosts.map((postItem: any) =>
//                                 postItem._id === postId ? { ...postItem, sharesBy: data.updatedShares } : postItem
//                             )
//                         );
//                         toast.success('Post shared successfully!');
//                     }
//                 }

//                 const postToShare = posts.find((p: any) => p._id === postId);
//                 const shareableLink = window.location.origin + `/posts/${postId}`;
//                 const shareData = {
//                     title: `Check out this post: ${postToShare?.text?.substring(0, 50)}...`,
//                     text: postToShare?.text,
//                     url: shareableLink,
//                 };

//                 if (navigator.share) {
//                     await navigator.share(shareData);
//                     console.log('Native share dialog opened successfully.');
//                 } else {
//                     await navigator.clipboard.writeText(shareableLink);
//                     toast('Link copied to clipboard. You can paste it to share!', { icon: '📋' });
//                     console.log('Link copied to clipboard as fallback.');
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
//         [currentUser, getIdToken, posts, API_BASE_URL]
//     );

//     // No direct height adjustment here, it will be controlled by the parent
//     if (loading) {
//         return (
//             <div className="space-y-6"> {/* Removed overflow-y-auto and fixed height */}
//                 {[...Array(3)].map((_, index) => (
//                     <PostCard
//                         key={index}
//                         loading={true}
//                         handleLike={async () => { }}
//                         handleShare={async () => { }}
//                         currentUser={null}
//                         getIdToken={async () => null}
//                     />
//                 ))}
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="text-center p-8 text-red-600" role="alert">
//                 Error loading posts: {error}
//             </div>
//         );
//     }

//     if (posts.length === 0) {
//         return (
//             <div className="text-center p-8 text-gray-500" role="status">
//                 No posts available.
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6"> {/* Removed overflow-y-auto and fixed height */}
//             {posts.map((postItem: any) => (
//                 <PostCard
//                     key={postItem._id}
//                     post={postItem}
//                     handleLike={handleLike}
//                     handleShare={handleShare}
//                     loading={false}
//                     currentUser={currentUser}
//                     getIdToken={getIdToken}
//                 />
//             ))}
//         </div>
//     );
// };

// export default MainContent;




// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import PostCard from './PostCard'; // Component to display individual posts
// import { useAuth } from './AuthProvider'; // Use your AuthProvider's hook
// import toast from 'react-hot-toast'; // Import toast here (already present, good!)

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// /**
//  * MainContent component: Fetches and displays the main feed of posts.
//  * It integrates with PostCard for rendering and handles like/share actions.
//  * This component no longer handles its own scrolling; scrolling is managed by its parent.
//  */
// const MainContent = () => {
//     const { user: currentUser, getIdToken } = useAuth();

//     const [posts, setPosts] = useState<any[]>([]); // Initialize with empty array and type
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const fetchPosts = useCallback(() => {
//         const controller = new AbortController();
//         const signal = controller.signal;

//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const response = await fetch(`${API_BASE_URL}/posts`, { signal });
//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
//                 }
//                 const data = await response.json();

//                 let postsWithLikeStatus = data;
//                 if (currentUser) {
//                     const token = await getIdToken();
//                     if (!token) {
//                         console.warn('No token available for like status check, showing all posts as unliked.');
//                         postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
//                     } else {
//                         postsWithLikeStatus = await Promise.all(
//                             data.map(async (post: any) => {
//                                 try {
//                                     const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
//                                         method: 'GET',
//                                         headers: { Authorization: `Bearer ${token}` },
//                                         signal,
//                                     });
//                                     if (!checkLikeResponse.ok) {
//                                         return { ...post, isLiked: false };
//                                     }
//                                     const likeData = await checkLikeResponse.json();
//                                     return { ...post, isLiked: likeData.isLiked };
//                                 } catch (likeError) {
//                                     console.error(`Error checking like status for post ${post._id}:`, likeError);
//                                     return { ...post, isLiked: false };
//                                 }
//                             })
//                         );
//                     }
//                 } else {
//                     postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
//                 }
//                 setPosts(postsWithLikeStatus);
//             } catch (err: any) {
//                 if (err.name === 'AbortError') {
//                     console.log('Fetch aborted');
//                 } else {
//                     setError(err.message);
//                     setPosts([]);
//                     toast.error(`Failed to fetch posts: ${err.message}`); // Display error toast
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();

//         return () => controller.abort();
//     }, [currentUser, getIdToken, API_BASE_URL]);

//     useEffect(() => {
//         if (currentUser !== undefined) {
//             fetchPosts();
//         }
//     }, [fetchPosts, currentUser]);

//     const handleLike = useCallback(
//         async (postId: string, currentLikes: number, currentIsLiked: boolean) => {
//             if (!currentUser || !postId) {
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
//                 setPosts((prevPosts) =>
//                     prevPosts.map((postItem: any) =>
//                         postItem._id === postId
//                             ? { ...postItem, likes: data.updatedLikes, isLiked: data.isNowLiked }
//                             : postItem
//                     )
//                 );
//                 // No toast needed for successful like/unlike, as it's a quick action.
//             } catch (error: any) {
//                 console.error('Error liking/unliking post:', error);
//                 toast.error(`Failed to like/unlike post: ${error.message}`);
//             }
//         },
//         [currentUser, getIdToken, API_BASE_URL]
//     );

//     const handleShare = useCallback(
//         async (postId: string) => {
//             if (!currentUser || !postId) {
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
//                 } else {
//                     const data = await apiResponse.json();
//                     if (data.message && data.message.includes('already shared')) {
//                         toast('You have already shared this post.');
//                     } else if (data.updatedShares !== undefined) {
//                         setPosts((prevPosts) =>
//                             prevPosts.map((postItem: any) =>
//                                 postItem._id === postId ? { ...postItem, sharesBy: data.updatedShares } : postItem
//                             )
//                         );
//                         toast.success('Post shared successfully!');
//                     }
//                 }

//                 const postToShare = posts.find((p: any) => p._id === postId);
//                 const shareableLink = window.location.origin + `/posts/${postId}`;
//                 const shareData = {
//                     title: `Check out this post: ${postToShare?.text?.substring(0, 50)}...`,
//                     text: postToShare?.text,
//                     url: shareableLink,
//                 };

//                 if (navigator.share) {
//                     await navigator.share(shareData);
//                     console.log('Native share dialog opened successfully.');
//                 } else {
//                     await navigator.clipboard.writeText(shareableLink);
//                     toast('Link copied to clipboard. You can paste it to share!', { icon: '📋' });
//                     console.log('Link copied to clipboard as fallback.');
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
//         [currentUser, getIdToken, posts, API_BASE_URL]
//     );

//     // --- NEW: handlePostDeleted function ---
//     const handlePostDeleted = useCallback((deletedPostId: string) => {
//         setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
//         // toast message is already handled in PostCard
//     }, []);

//     // --- NEW: handlePostUpdated function ---
//     const handlePostUpdated = useCallback((updatedPost: any) => {
//         setPosts(prevPosts =>
//             prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
//         );
//         // toast message is already handled in PostEditModal
//     }, []);


//     if (loading) {
//         return (
//             <div className="space-y-6"> {/* Removed overflow-y-auto and fixed height */}
//                 {[...Array(3)].map((_, index) => (
//                     <PostCard
//                         key={index}
//                         loading={true}
//                         handleLike={async () => { }}
//                         handleShare={async () => { }}
//                         currentUser={null}
//                         getIdToken={async () => null}
//                         onPostDeleted={handlePostDeleted} // Pass the dummy function for loading state
//                         onPostUpdated={handlePostUpdated} // Pass the dummy function for loading state
//                     />
//                 ))}
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="text-center p-8 text-red-600" role="alert">
//                 Error loading posts: {error}
//             </div>
//         );
//     }

//     if (posts.length === 0) {
//         return (
//             <div className="text-center p-8 text-gray-500" role="status">
//                 No posts available.
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6"> {/* Removed overflow-y-auto and fixed height */}
//             {posts.map((postItem: any) => (
//                 <PostCard
//                     key={postItem._id}
//                     post={postItem}
//                     handleLike={handleLike}
//                     handleShare={handleShare}
//                     loading={false}
//                     currentUser={currentUser}
//                     getIdToken={getIdToken}
//                     onPostDeleted={handlePostDeleted} // Pass the actual function
//                     onPostUpdated={handlePostUpdated} // Pass the actual function
//                 />
//             ))}
//         </div>
//     );
// };

// export default MainContent;
// client/components/MainContent.tsx


// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import PostCard from './PostCard';
// import { useAuth } from './AuthProvider';
// import toast from 'react-hot-toast';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// const MainContent = () => {
//     // Get currentUser and getIdToken from AuthProvider
//     const { user: currentUser, getIdToken } = useAuth();

//     const [posts, setPosts] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // REMOVED updatedUserIcon and setUpdatedUserIcon state
//     // localStorage sync for updatedUserIcon is also REMOVED as it's no longer needed here.
//     // The AuthProvider will handle providing the correct `currentUser.customAvatarUrl`

//     // Fetch posts
//     const fetchPosts = useCallback(() => {
//         const controller = new AbortController();
//         const signal = controller.signal;

//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const response = await fetch(`${API_BASE_URL}/posts`, { signal });
//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
//                 }
//                 const data = await response.json();

//                 let postsWithLikeStatus = data;
//                 if (currentUser) {
//                     const token = await getIdToken();
//                     if (!token) {
//                         postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
//                     } else {
//                         postsWithLikeStatus = await Promise.all(
//                             data.map(async (post: any) => {
//                                 try {
//                                     const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
//                                         method: 'GET',
//                                         headers: { Authorization: `Bearer ${token}` },
//                                         signal,
//                                     });
//                                     if (!checkLikeResponse.ok) {
//                                         return { ...post, isLiked: false };
//                                     }
//                                     const likeData = await checkLikeResponse.json();
//                                     return { ...post, isLiked: likeData.isLiked };
//                                 } catch (innerError) {
//                                     console.error(`Error checking like status for post ${post._id}:`, innerError);
//                                     return { ...post, isLiked: false };
//                                 }
//                             })
//                         );
//                     }
//                 } else {
//                     postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
//                 }
//                 setPosts(postsWithLikeStatus);
//             } catch (err: any) {
//                 if (err.name === 'AbortError') {
//                     console.log('Fetch aborted');
//                 } else {
//                     setError(err.message);
//                     setPosts([]);
//                     toast.error(`Failed to fetch posts: ${err.message}`);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();

//         return () => controller.abort();
//     }, [currentUser, getIdToken]); // currentUser is a dependency now

//     useEffect(() => {
//         // Only fetch posts if currentUser is definitively resolved (not undefined)
//         // This ensures the `if (currentUser)` block in fetchPosts is meaningful.
//         if (currentUser !== undefined) { 
//             fetchPosts();
//         }
//     }, [fetchPosts, currentUser]);


//     // Handle like - This will now trigger re-fetching posts to update likes count.
//     // Or, you can update posts state directly as you were doing before.
//     // I'm simplifying the `handleLike` signature in `PostCard` to only `postId`.
//     const handleLike = useCallback(
//         async (postId: string) => {
//             if (!currentUser || !postId) {
//                 toast.error('Please log in to like this post.');
//                 return;
//             }

//             try {
//                 const token = await getIdToken();
//                 if (!token) {
//                     toast.error('Authentication token not available. Please log in again.');
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
//                 setPosts((prevPosts) =>
//                     prevPosts.map((postItem: any) =>
//                         postItem._id === postId
//                             ? { ...postItem, likes: data.updatedLikes, isLiked: data.isNowLiked }
//                             : postItem
//                     )
//                 );
//             } catch (error: any) {
//                 toast.error(`Failed to like/unlike post: ${error.message}`);
//             }
//         },
//         [currentUser, getIdToken]
//     );

//     // Handle share (can keep your existing code or simplify)
//     const handleShare = async (postId: string) => {
//         try {
//             console.log("Share post with id:", postId);
//             // Add actual share logic here, e.g., using Web Share API or copying link
//             toast.success("Post link copied to clipboard!"); // Example
//             navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`); // Example
//         } catch (error) {
//             console.error("Error sharing post:", error);
//             toast.error("Failed to share post.");
//         }
//     };

//     // Handle post deleted
//     const handlePostDeleted = useCallback((deletedPostId: string) => {
//         setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
//     }, []);

//     // Handle post updated
//     const handlePostUpdated = useCallback((updatedPost: any) => {
//         setPosts(prevPosts =>
//             prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
//         );
//     }, []);

//     if (loading) {
//         return (
//             <div className="space-y-6">
//                 {[...Array(3)].map((_, i) => (
//                     <PostCard
//                         key={i}
//                         loading={true}
//                         handleLike={async () => { }}
//                         currentUser={null} // Pass null for loading skeleton
//                         handleShare={async () => { }}
//                         getIdToken={async () => null}
//                         onPostDeleted={handlePostDeleted}
//                         onPostUpdated={handlePostUpdated}
//                     />
//                 ))}
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="text-center p-8 text-red-600" role="alert">
//                 Error loading posts: {error}
//             </div>
//         );
//     }

//     if (posts.length === 0) {
//         return (
//             <div className="text-center p-8 text-gray-500" role="status">
//                 No posts available.
//             </div>
//         );
//     }
//     const heightAdjustment = "130px";
//     return (
//         <div className="space-y-6"
//         style={{ height: `calc(100vh - ${heightAdjustment})` }}>
//             {posts.map((post) => (
//                 <PostCard
//                     key={post._id}
//                     post={post}
//                     handleLike={handleLike}
//                     handleShare={handleShare}
//                     loading={false} // Posts are loaded, so loading is false for individual cards
//                     currentUser={currentUser} // Pass the actual currentUser from AuthProvider
//                     getIdToken={getIdToken}
//                     onPostDeleted={handlePostDeleted}
//                     onPostUpdated={handlePostUpdated}
//                 />
//             ))}
//         </div>
//     );
// };

// export default MainContent;

'use client';

import { useState, useEffect, useCallback } from 'react';
import PostCard from './PostCard';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const MainContent = () => {
    // Get currentUser and getIdToken from AuthProvider
    const { user: currentUser, getIdToken } = useAuth();

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch posts
    const fetchPosts = useCallback(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/posts`, { signal });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
                }
                const data = await response.json();

                let postsWithLikeStatus = data;
                if (currentUser) {
                    const token = await getIdToken();
                    if (!token) {
                        postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
                    } else {
                        postsWithLikeStatus = await Promise.all(
                            data.map(async (post: any) => {
                                try {
                                    const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
                                        method: 'GET',
                                        headers: { Authorization: `Bearer ${token}` },
                                        signal,
                                    });
                                    if (!checkLikeResponse.ok) {
                                        return { ...post, isLiked: false };
                                    }
                                    const likeData = await checkLikeResponse.json();
                                    return { ...post, isLiked: likeData.isLiked };
                                } catch (innerError) {
                                    console.error(`Error checking like status for post ${post._id}:`, innerError);
                                    return { ...post, isLiked: false };
                                }
                            })
                        );
                    }
                } else {
                    postsWithLikeStatus = data.map((post: any) => ({ ...post, isLiked: false }));
                }
                setPosts(postsWithLikeStatus);
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    setError(err.message);
                    setPosts([]);
                    toast.error(`Failed to fetch posts: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => controller.abort();
    }, [currentUser, getIdToken]);

    useEffect(() => {
        if (currentUser !== undefined) {
            fetchPosts();
        }
    }, [fetchPosts, currentUser]);

    // Handle like
    const handleLike = useCallback(
        async (postId: string) => {
            if (!currentUser || !postId) {
                toast.error('Please log in to like this post.');
                return;
            }

            try {
                const token = await getIdToken();
                if (!token) {
                    toast.error('Authentication token not available. Please log in again.');
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
                setPosts((prevPosts) =>
                    prevPosts.map((postItem: any) =>
                        postItem._id === postId
                            ? { ...postItem, likes: data.updatedLikes, isLiked: data.isNowLiked }
                            : postItem
                    )
                );
            } catch (error: any) {
                toast.error(`Failed to like/unlike post: ${error.message}`);
            }
        },
        [currentUser, getIdToken]
    );

    // Handle share
    const handleShare = async (postId: string) => {
        try {
            console.log("Share post with id:", postId);
            toast.success("Post link copied to clipboard!");
            navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
        } catch (error) {
            console.error("Error sharing post:", error);
            toast.error("Failed to share post.");
        }
    };

    // Handle post deleted
    const handlePostDeleted = useCallback((deletedPostId: string) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    }, []);

    // Handle post updated
    const handlePostUpdated = useCallback((updatedPost: any) => {
        setPosts(prevPosts =>
            prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
        );
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <PostCard
                        key={i}
                        loading={true}
                        handleLike={async () => { }}
                        currentUser={null}
                        handleShare={async () => { }}
                        getIdToken={async () => null}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostUpdated}
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-600" role="alert">
                Error loading posts: {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500" role="status">
                No posts available.
            </div>
        );
    }

    // Increased heightAdjustment to make the content area shorter
    const heightAdjustment = "105px"; 

    return (
        <div className="space-y-6 overflow-y-auto hide-scrollbar" // Added overflow-y-auto for scrollability
             style={{ height: `calc(100vh - ${heightAdjustment})` }}>
            {posts.map((post) => (
                <PostCard
                    key={post._id}
                    post={post}
                    handleLike={handleLike}
                    handleShare={handleShare}
                    loading={false}
                    currentUser={currentUser}
                    getIdToken={getIdToken}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostUpdated}
                />
            ))}
        </div>
    );
};

export default MainContent;