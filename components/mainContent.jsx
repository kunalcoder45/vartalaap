// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { Smile, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
// import ActionSection from './actionSection/page';

// const MainContent = () => {
//     const [post, setPost] = useState({
//         author: 'John Carter',
//         time: '4 hours ago',
//         text: 'Lorem ipsum is simply dummy text of the printing and typesetting industry.',
//         imageUrl: 'https://us-84x1.onrender.com/original-ca8a961b724ff59f3b0a1adb9f957340.webp',
//         authorAvatarUrl: '/avatars/john-carter.jpg',
//     });

//     const [likes, setLikes] = useState(0);
//     const [comments, setComments] = useState(0);
//     const [shares, setShares] = useState(0);
//     const [isLiked, setIsLiked] = useState(false);

//     useEffect(() => {
//         setLikes(0);
//         setComments(0);
//         setShares(0);
//         setIsLiked(false);
//     }, []);

//     const handleLike = () => {
//         setIsLiked(prev => !prev);
//         setLikes(prev => (isLiked ? prev - 1 : prev + 1));
//     };

//     const handleShare = async () => {
//         const shareableLink = window.location.origin + `/posts/${post.author.toLowerCase().replace(/\s/g, '-')}`;
//         const shareData = {
//             title: `Check out this post by ${post.author}`,
//             text: post.text,
//             url: shareableLink,
//         };

//         try {
//             // Check if the Web Share API is available
//             if (navigator.share) {
//                 await navigator.share(shareData);
//                 setShares(prev => prev + 1);
//                 console.log('Post shared successfully');
//             } else {
//                 // Fallback for browsers that do not support Web Share API
//                 // You can either copy the link to clipboard or show a custom modal
//                 await navigator.clipboard.writeText(shareableLink);
//                 setShares(prev => prev + 1);
//                 console.log('Web Share API not supported, link copied to clipboard.');
//                 alert('Link copied to clipboard (Web Share API not supported)'); // Keeping alert for fallback for now
//             }
//         } catch (error) {
//             console.error('Error sharing:', error);
//             // Handle cases where user cancels the share or an error occurs
//         }
//     };

//     return (
//         <div className="flex-grow p-0 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto">
//             <ActionSection />
//             <div className="bg-white rounded-lg shadow-md m-4 p-4">
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                         <img
//                             src={post.authorAvatarUrl}
//                             alt={post.author}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800">{post.author}</p>
//                             <p className="text-gray-500 text-sm">{post.time}</p>
//                         </div>
//                     </div>
//                     <button className="text-gray-500 hover:text-gray-800">
//                         <span className="text-2xl font-bold leading-none">...</span>
//                     </button>
//                 </div>

//                 <p className="text-gray-700 mb-4">{post.text}</p>

//                 <div className="mb-4 rounded-lg overflow-hidden">
//                     <Image
//                         src={'https://us-84x1.onrender.com/V_VMWB2'}
//                         alt="Post Image"
//                         width={600}
//                         height={400}
//                         layout="responsive"
//                         className="rounded-lg object-cover"
//                         priority
//                     />
//                 </div>

//                 <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                     <div className="flex items-center space-x-4">
//                         <button
//                             onClick={handleLike}
//                             className={`flex items-center p-2 rounded-full transition-colors ${
//                                 isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
//                             }`}
//                         >
//                             <ThumbsUp size={16} className={`mr-1 ${isLiked ? 'text-blue-500' : ''}`} />
//                             <span>{likes}</span>
//                         </button>
//                         <button className="flex items-center p-2 rounded-full hover:bg-gray-100">
//                             <MessageSquare size={16} className="mr-1" />
//                             <span>{comments}</span>
//                         </button>
//                     </div>
//                     <button onClick={handleShare} className="flex items-center p-2 rounded-full hover:bg-gray-100">
//                         <Share2 size={16} className="mr-1" />
//                         <span>{shares}</span>
//                     </button>
//                 </div>

//                 <hr className="my-4 border-gray-200" />

//                 <div className="flex items-center space-x-3 mb-4">
//                     <img
//                         src="/avatars/user-default.jpg"
//                         alt="User Avatar"
//                         className="w-10 h-10 rounded-full object-cover"
//                     />
//                     <div className="relative flex-grow">
//                         <input
//                             type="text"
//                             placeholder="Write your comment"
//                             className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
//                         />
//                         <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                     </div>
//                 </div>

//                 <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
//                     <img
//                         src="/avatars/annalise-hane.jpg"
//                         alt="Annalise Hane"
//                         className="w-8 h-8 rounded-full object-cover mt-1"
//                     />
//                     <div>
//                         <p className="font-semibold text-gray-800">Annalise Hane</p>
//                         <p className="text-gray-700 text-sm">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
//                     </div>
//                 </div>
//                 <div className="text-center mt-3">
//                     <button className="text-blue-600 text-sm hover:underline">View all comments</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MainContent;


// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { Smile, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
// import ActionSection from './actionSection/page';

// // Import Firebase Auth
// import { auth } from '../firebase/config';
// import { onAuthStateChanged } from 'firebase/auth';

// const API_BASE_URL = 'http://localhost:5000/api';

// const MainContent = () => {
//     const [post, setPost] = useState({
//         id: null,
//         author: '',
//         time: '',
//         text: '',
//         imageUrl: '', // Will be fetched from MongoDB
//         authorAvatarUrl: '', // Will be fetched from MongoDB
//         likes: 0,
//         commentsCount: 0,
//         shares: 0,
//     });

//     const [isLiked, setIsLiked] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);

//     useEffect(() => {
//         const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
//             setCurrentUser(user);
//         });

//         const fetchPostData = async () => {
//             try {
//                 const examplePostId = '68491c5947021135c796ede0';
//                 const response = await fetch(`${API_BASE_URL}/posts/${examplePostId}`);
//                 if (!response.ok) {
//                     // If response is not OK, but not a network error (like 404/500)
//                     const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                     throw new Error(errorData.message || 'Failed to fetch post data');
//                 }
//                 const data = await response.json();

//                 // Set post data from fetched data
//                 setPost({
//                     id: data._id,
//                     author: data.authorName,
//                     time: data.time || 'Unknown time',
//                     text: data.text,
//                     imageUrl: data.imageUrl || '', // Use URL from MongoDB, fallback to empty string
//                     authorAvatarUrl: data.authorAvatarUrl || '', // Use URL from MongoDB, fallback to empty string
//                     likes: data.likes,
//                     commentsCount: data.commentsCount,
//                     shares: data.shares,
//                 });

//                 // --- Check if current user has liked this post ---
//                 if (currentUser && data._id) {
//                     const token = await currentUser.getIdToken();
//                     const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${data._id}/check-like`, {
//                         method: 'GET',
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                         },
//                     });
//                     if (checkLikeResponse.ok) {
//                         const checkLikeData = await checkLikeResponse.json();
//                         setIsLiked(checkLikeData.isLiked);
//                     } else {
//                         console.warn('Could not check like status:', await checkLikeResponse.json().catch(() => ({ message: 'Error parsing check-like response' })));
//                         setIsLiked(false);
//                     }
//                 } else {
//                     setIsLiked(false);
//                 }
//                 // --- End check like status ---

//             } catch (error) {
//                 console.error("Error fetching post data:", error);
//                 setPost({
//                     id: null,
//                     author: 'Error',
//                     time: 'N/A',
//                     text: 'Failed to load post.',
//                     imageUrl: '',
//                     authorAvatarUrl: '',
//                     likes: 0,
//                     commentsCount: 0,
//                     shares: 0,
//                 });
//                 setIsLiked(false);
//             }
//         };

//         // Fetch post data only when currentUser is determined and post ID is set
//         // Adding post.id to dependency array can cause infinite loop if not careful.
//         // It's better to fetch once or re-fetch on currentUser changes.
//         // If post.id is always the same for this page, it's fine.
//         if (currentUser !== undefined) {
//             fetchPostData();
//         }

//         return () => unsubscribeAuth();
//     }, [currentUser]); // Run when currentUser changes

//     const getIdToken = async () => {
//         if (currentUser) {
//             return await currentUser.getIdToken();
//         }
//         return null;
//     };

//     const handleLike = async () => {
//         if (!currentUser || !post.id) {
//             alert('Please log in to like this post.');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 alert('Authentication token not available. Please try logging in again.');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/posts/${post.id}/like`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) { // This now correctly handles only non-2xx statuses as errors
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//                 throw new Error(errorData.message || `Failed to like/unlike post (Status: ${response.status})`);
//             }

//             const data = await response.json();
//             setPost(prevPost => ({
//                 ...prevPost,
//                 likes: data.updatedLikes,
//             }));
//             setIsLiked(data.isNowLiked);
//             console.log(data.message);

//         } catch (error) {
//             console.error("Error liking/unliking post:", error);
//             alert(`Failed to like/unlike post: ${error.message}`);
//         }
//     };

//     const handleShare = async () => {
//         if (!currentUser || !post.id) {
//             alert('Please log in to share this post.');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 alert('Authentication token not available. Please try logging in again.');
//                 return;
//             }

//             const apiResponse = await fetch(`${API_BASE_URL}/posts/${post.id}/share`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!apiResponse.ok && !(apiResponse.status === 200 && apiResponse.headers.get('Content-Type')?.includes('application/json'))) { // More robust check
//                 const errorData = await apiResponse.json().catch(() => ({ message: 'Unknown error' }));
//                 throw new Error(errorData.message || `Failed to record share on backend (Status: ${apiResponse.status})`);
//             } else {
//                 const data = await apiResponse.json();
//                 if (data.message && data.message.includes('already shared')) {
//                     console.log(data.message);
//                 } else if (data.updatedShares !== undefined) {
//                     setPost(prevPost => ({
//                         ...prevPost,
//                         shares: data.updatedShares,
//                     }));
//                 }
//             }

//             const shareableLink = window.location.origin + `/posts/${post.id}`;
//             const shareData = {
//                 title: `Check out this post: ${post.text.substring(0, 50)}...`,
//                 text: post.text,
//                 url: shareableLink,
//             };

//             if (navigator.share) {
//                 await navigator.share(shareData);
//                 console.log('Native share dialog opened successfully.');
//             } else {
//                 await navigator.clipboard.writeText(shareableLink);
//                 alert('Link copied to clipboard (Web Share API not supported in this browser).');
//                 console.log('Link copied to clipboard as fallback.');
//             }

//         } catch (error) {
//             console.error('Error during share operation:', error);
//             if (error.name === 'AbortError') {
//                 console.log('Share dialog aborted by user.');
//             } else {
//                 alert(`Failed to share post: ${error.message}`);
//             }
//         }
//     };

//     return (
//         <div className="flex-grow p-0 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto">
//             <ActionSection />
//             {post.id ? (
//                 <div className="bg-white rounded-lg shadow-md m-4 p-4">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center space-x-3">
//                             {/* Use post.authorAvatarUrl first, then fallback to a local public path */}
//                             <img
//                                 src={post.authorAvatarUrl || '/avatars/user-default.jpg'} // Fallback to local default if no URL from MongoDB
//                                 alt={post.author}
//                                 className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                             />
//                             <div>
//                                 <p className="font-semibold text-gray-800">{post.author}</p>
//                                 <p className="text-gray-500 text-sm">{post.time}</p>
//                             </div>
//                         </div>
//                         <button className="text-gray-500 hover:text-gray-800">
//                             <span className="text-2xl font-bold leading-none">...</span>
//                         </button>
//                     </div>

//                     <p className="text-gray-700 mb-4">{post.text}</p>

//                     <div className="mb-4 rounded-lg overflow-hidden">
//                         {/* Use post.imageUrl first, then fallback to a local public path */}
//                         <Image
//                             src={post.imageUrl || '/images/default-post.jpg'} // Fallback to local default if no URL from MongoDB
//                             alt="Post Image"
//                             width={600}
//                             height={400}
//                             layout="responsive"
//                             className="rounded-lg object-cover"
//                             priority
//                         />
//                     </div>

//                     <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                         <div className="flex items-center space-x-4">
//                             <button
//                                 onClick={handleLike}
//                                 className={`flex items-center p-2 rounded-full transition-colors ${
//                                     isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
//                                 }`}
//                             >
//                                 <ThumbsUp size={16} className={`mr-1 ${isLiked ? 'text-blue-500' : ''}`} />
//                                 <span>{post.likes}</span>
//                             </button>
//                             <button className="flex items-center p-2 rounded-full hover:bg-gray-100">
//                                 <MessageSquare size={16} className="mr-1" />
//                                 <span>{post.commentsCount}</span>
//                             </button>
//                         </div>
//                         <button onClick={handleShare} className="flex items-center p-2 rounded-full hover:bg-gray-100">
//                             <Share2 size={16} className="mr-1" />
//                             <span>{post.shares}</span>
//                         </button>
//                     </div>

//                     <hr className="my-4 border-gray-200" />

//                     <div className="flex items-center space-x-3 mb-4">
//                         <img
//                             src={'/avatars/user-default.jpg'} // This will ALWAYS look for local public/avatars/user-default.jpg
//                             alt="User Avatar"
//                             className="w-10 h-10 rounded-full object-cover"
//                         />
//                         <div className="relative flex-grow">
//                             <input
//                                 type="text"
//                                 placeholder="Write your comment"
//                                 className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
//                             />
//                             <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                         </div>
//                     </div>

//                     <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
//                         <img
//                             src={'/avatars/annalise-hane.jpg'} // This will ALWAYS look for local public/avatars/annalise-hane.jpg
//                             alt="Annalise Hane"
//                             className="w-8 h-8 rounded-full object-cover mt-1"
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800">Annalise Hane</p>
//                             <p className="text-gray-700 text-sm">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
//                         </div>
//                     </div>
//                     <div className="text-center mt-3">
//                         <button className="text-blue-600 text-sm hover:underline">View all comments</button>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="text-center p-8">Loading post...</div>
//             )}
//         </div>
//     );
// };

// export default MainContent;

// MainContent.jsx




'use client';

import { useState, useEffect, useCallback } from 'react';
import ActionSection from './actionSection/page';
import PostCard from './PostCard';

// Import Firebase Auth
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5000/api';

const MainContent = () => {
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const heightAdjustment = "110px";

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);

        const DELAY_TIME = 10;

        try {
            await new Promise(resolve => setTimeout(resolve, DELAY_TIME));

            const response = await fetch(`${API_BASE_URL}/posts`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Failed to fetch posts (Status: ${response.status})`);
            }
            const data = await response.json();

            if (currentUser && data.length > 0) {
                const token = await currentUser.getIdToken();
                const postsWithLikeStatus = await Promise.all(data.map(async (post) => {
                    try {
                        const checkLikeResponse = await fetch(`${API_BASE_URL}/posts/${post._id}/check-like`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        if (checkLikeResponse.ok) {
                            const checkLikeData = await checkLikeResponse.json();
                            return { ...post, isLiked: checkLikeData.isLiked };
                        } else {
                            console.warn(`Could not check like status for post ${post._id}:`, await checkLikeResponse.json().catch(() => ({ message: 'Error parsing check-like response' })));
                            return { ...post, isLiked: false };
                        }
                    } catch (checkError) {
                        console.error(`Error checking like status for post ${post._id}:`, checkError);
                        return { ...post, isLiked: false };
                    }
                }));
                setPosts(postsWithLikeStatus);
            } else {
                setPosts(data.map(post => ({ ...post, isLiked: false })));
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser !== undefined) {
            fetchPosts();
        }
    }, [fetchPosts, currentUser]);

    const getIdToken = async () => {
        if (currentUser) {
            return await currentUser.getIdToken();
        }
        return null;
    };

    const handleLike = async (postId, currentLikes, currentIsLiked) => {
        if (!currentUser || !postId) {
            alert('Please log in to like this post.');
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
                alert('Authentication token not available. Please try logging in again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Failed to like/unlike post (Status: ${response.status})`);
            }

            const data = await response.json();
            setPosts(prevPosts =>
                prevPosts.map(postItem =>
                    postItem._id === postId
                        ? { ...postItem, likes: data.updatedLikes, isLiked: data.isNowLiked }
                        : postItem
                )
            );
            console.log(data.message);

        } catch (error) {
            console.error("Error liking/unliking post:", error);
            alert(`Failed to like/unlike post: ${error.message}`);
        }
    };

    const handleShare = async (postId, currentShares) => {
        if (!currentUser || !postId) {
            alert('Please log in to share this post.');
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
                alert('Authentication token not available. Please try logging in again.');
                return;
            }

            const apiResponse = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!apiResponse.ok && !(apiResponse.status === 200 && apiResponse.headers.get('Content-Type')?.includes('application/json'))) {
                const errorData = await apiResponse.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Failed to record share on backend (Status: ${apiResponse.status})`);
            } else {
                const data = await apiResponse.json();
                if (data.message && data.message.includes('already shared')) {
                    console.log(data.message);
                } else if (data.updatedShares !== undefined) {
                    setPosts(prevPosts =>
                        prevPosts.map(postItem =>
                            postItem._id === postId
                                ? { ...postItem, shares: data.updatedShares }
                                : postItem
                        )
                    );
                }
            }

            const shareableLink = window.location.origin + `/posts/${postId}`;
            const shareData = {
                title: `Check out this post: ${posts.find(p => p._id === postId)?.text?.substring(0, 50)}...`,
                text: posts.find(p => p._id === postId)?.text,
                url: shareableLink,
            };

            if (navigator.share) {
                await navigator.share(shareData);
                console.log('Native share dialog opened successfully.');
            } else {
                await navigator.clipboard.writeText(shareableLink);
                alert('Link copied to clipboard (Web Share API not supported in this browser).');
                console.log('Link copied to clipboard as fallback.');
            }

        } catch (error) {
            console.error('Error during share operation:', error);
            if (error.name === 'AbortError') {
                console.log('Share dialog aborted by user.');
            } else {
                alert(`Failed to share post: ${error.message}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex-grow p-0 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto hide-scrollbar">
                <ActionSection />
                {/* 3-5 स्केलेटन कार्ड्स दिखाएं */}
                {[...Array(3)].map((_, index) => (
                    <PostCard key={index} loading={true} />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-600">Error: {error}</div>;
    }

    if (posts.length === 0) {
        return <div className="text-center p-8 text-gray-500">No posts available.</div>;
    }

    return (
        <div className="flex-grow space-y-6 overflow-y-auto max-w-2xl mx-auto hide-scrollbar"
            style={{ height: `calc(100vh - ${heightAdjustment})` }}>
            <ActionSection />
            {posts.map((postItem) => (
                <PostCard
                    key={postItem._id}
                    post={postItem}
                    handleLike={handleLike}
                    handleShare={handleShare}
                    loading={false}
                />
            ))}
        </div>
    );
};

export default MainContent;