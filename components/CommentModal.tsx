// client/app/components/CommentModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import toast from 'react-hot-toast';
import PostContent from './comments/PostContent';
import CommentsSection from './comments/CommentsSection';

interface CommentModalProps {
    post: any; // Define a more specific type for 'post' if possible
    onClose: () => void;
    currentUser: any; // Define a more specific type for 'currentUser' (CustomUser from AuthProvider)
    getIdToken: () => Promise<string | null>;
    handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void>;
    handleShare: (postId: string) => Promise<void>;
    backendUrl: string; // The full backend API URL, e.g., 'https://vartalaap-r36o.onrender.com/api'
}

const CommentModal = ({
    post,
    onClose,
    currentUser,
    getIdToken,
    handleLike,
    handleShare,
    backendUrl
}: CommentModalProps) => {
    const [comments, setComments] = useState<any[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [errorComments, setErrorComments] = useState<string | null>(null);
    const commentsListRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const baseBackendUrl = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl;
    const apiBaseUrl = backendUrl;

    useEffect(() => {
        const fetchComments = async () => {
            if (!post?._id) {
                setLoadingComments(false);
                setErrorComments('Post ID is missing');
                return;
            }

            setLoadingComments(true);
            setErrorComments(null);

            try {
                const token = currentUser ? await getIdToken() : null;
                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${apiBaseUrl}/posts/${post._id}/comments`, {
                    method: 'GET',
                    headers: headers,
                });

                if (!res.ok) {
                    let errorMessage = `Failed to fetch comments (${res.status})`;
                    try {
                        const errorData = await res.clone().json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        const errorText = await res.clone().text();
                        errorMessage = errorText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                const data = await res.json();
                if (Array.isArray(data)) {
                    setComments(data);
                } else if (data.comments && Array.isArray(data.comments)) {
                    setComments(data.comments);
                } else {
                    console.warn("Unexpected comment data format:", data);
                    setComments([]);
                }

            } catch (err: any) {
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    setErrorComments('Unable to connect to server. Please check your connection.');
                } else if (err.message.includes('404')) {
                    setErrorComments('Comments endpoint not found. Please contact support.');
                } else if (err.message.includes('500')) {
                    setErrorComments('Server error. Please try again later.');
                } else {
                    setErrorComments(err.message || 'Failed to fetch comments');
                }
            } finally {
                setLoadingComments(false);
            }
        };

        fetchComments();
    }, [post?._id, apiBaseUrl, currentUser, getIdToken]);

    useEffect(() => {
        if (commentsListRef.current) {
            commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
        }
    }, [comments]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handlePostComment = async () => {
        if (!currentUser) {
            toast.error('Please log in to post a comment.');
            return;
        }

        if (!newCommentText.trim()) {
            toast.error('Comment cannot be empty.');
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
                toast.error('Authentication token not available. Please log in again.');
                return;
            }

            const res = await fetch(`${apiBaseUrl}/posts/${post._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ text: newCommentText.trim() }),
            });

            const resText = await res.text();
            if (!res.ok) {
                let errorDetails = resText;
                try {
                    const errorJson = JSON.parse(resText);
                    errorDetails = errorJson.message || JSON.stringify(errorJson);
                } catch {
                    // Not JSON, use raw text
                }
                throw new Error(`Failed to post comment (${res.status}): ${errorDetails}`);
            }

            const newComment = JSON.parse(resText);
            setComments((prev) => [...prev, newComment]);
            setNewCommentText('');
            toast.success('Comment posted successfully!');
        } catch (error: any) {
            toast.error(`Failed to post comment: ${error.message || 'Unknown error'}`);
        }
    };

    const formatDate = (isoString: string) => moment(isoString).format('MMM D, h:mm A');

    const postAuthorAvatar = post?.author?.avatarUrl;
    const currentUserAvatar = currentUser?.avatarUrl;

    const postAuthorName = post?.author?.name || 'Unknown User';
    const postTime = moment(post.createdAt).fromNow();

    const postMediaFullUrl = post?.mediaUrl
        ? (post.mediaUrl.startsWith('http') || post.mediaUrl.startsWith('data:')
            ? post.mediaUrl
            : `${baseBackendUrl}/${post.mediaUrl.startsWith('/') ? post.mediaUrl.substring(1) : post.mediaUrl}`)
        : '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out animate-scale-in">
            <div className="bg-white rounded-lg shadow-xl flex flex-col md:flex-row w-full max-w-4xl h-[90vh] md:h-[80vh] overflow-hidden transform transition-transform duration-300 ease-out">

                <PostContent
                    post={post}
                    postAuthorAvatar={postAuthorAvatar}
                    postAuthorName={postAuthorName}
                    postTime={postTime}
                    postMediaFullUrl={postMediaFullUrl}
                    onClose={onClose}
                    handleLike={handleLike}
                    handleShare={handleShare}    
                />

                <CommentsSection
                    comments={comments}
                    loadingComments={loadingComments}
                    errorComments={errorComments}
                    currentUser={currentUser}
                    currentUserAvatar={currentUserAvatar}
                    newCommentText={newCommentText}
                    setNewCommentText={setNewCommentText}
                    handlePostComment={handlePostComment}
                    formatDate={formatDate}
                    post={post}
                />

            </div>
        </div>
    );
};

export default CommentModal;





// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// // Removed: import { useRouter } from 'next/navigation'; // Not available in this environment
// // Removed: import moment from 'moment'; // Replaced with custom function
// import toast from 'react-hot-toast'; // Assuming toast is available globally

// // --- Placeholder for CustomUser type (Updated to make properties optional) ---
// interface CustomUser {
//     uid?: string; // Made optional
//     mongoUserId?: string; // Made optional to resolve the error
//     name?: string; // Made optional
//     avatarUrl?: string; // Made optional
// }

// // --- Placeholder for default user logo and image error ---
// const DEFAULT_USER_LOGO_URL = "https://placehold.co/48x48/cccccc/333333?text=User";
// const DEFAULT_IMAGE_ERROR_URL = "https://placehold.co/600x450/cccccc/333333?text=Image+Load+Error";

// interface CommentModalProps {
//     post: any; // Define a more specific type for 'post' if possible
//     onClose: () => void;
//     currentUser: CustomUser | null; // Using CustomUser type
//     getIdToken: () => Promise<string | null>;
//     handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void | string>;
//     handleShare: (postId: string) => Promise<void | string>;
//     backendUrl: string; // The full backend API URL, e.g., 'https://vartalaap-r36o.onrender.com/api'
// }

// // --- Custom date formatting function (replaces moment) ---
// const formatDate = (isoString: string) => {
//     const date = new Date(isoString);
//     const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
//     return date.toLocaleString('en-US', options);
// };

// // --- Custom time ago function (replaces moment().fromNow()) ---
// const getTimeAgo = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     if (seconds < 60) return `${seconds} seconds ago`;
//     const minutes = Math.floor(seconds / 60);
//     if (minutes < 60) return `${minutes} minutes ago`;
//     const hours = Math.floor(minutes / 60);
//     if (hours < 24) return `${hours} hours ago`;
//     const days = Math.floor(hours / 24);
//     if (days < 30) return `${days} days ago`;
//     const months = Math.floor(days / 30);
//     if (months < 12) return `${months} months ago`;
//     const years = Math.floor(months / 12);
//     return `${years} years ago`;
// };


// const CommentModal = ({
//     post,
//     onClose,
//     currentUser,
//     getIdToken,
//     handleLike,
//     handleShare,
//     backendUrl
// }: CommentModalProps) => {
//     const [comments, setComments] = useState<any[]>([]);
//     const [newCommentText, setNewCommentText] = useState('');
//     const [loadingComments, setLoadingComments] = useState(true);
//     const [errorComments, setErrorComments] = useState<string | null>(null);
//     const commentsListRef = useRef<HTMLDivElement>(null);
//     // Removed: const router = useRouter(); // No longer needed

//     const baseBackendUrl = backendUrl.endsWith('/api') ? backendUrl.slice(0, -4) : backendUrl;
//     const apiBaseUrl = backendUrl;

//     // Fetch comments effect
//     useEffect(() => {
//         const fetchComments = async () => {
//             if (!post?._id) {
//                 setLoadingComments(false);
//                 setErrorComments('Post ID is missing');
//                 return;
//             }

//             setLoadingComments(true);
//             setErrorComments(null);

//             try {
//                 const token = currentUser ? await getIdToken() : null;
//                 const headers: HeadersInit = {
//                     'Content-Type': 'application/json',
//                 };
//                 if (token) {
//                     headers['Authorization'] = `Bearer ${token}`;
//                 }

//                 const res = await fetch(`${apiBaseUrl}/posts/${post._id}/comments`, {
//                     method: 'GET',
//                     headers: headers,
//                 });

//                 if (!res.ok) {
//                     let errorMessage = `Failed to fetch comments (${res.status})`;
//                     try {
//                         const errorData = await res.clone().json();
//                         errorMessage = errorData.message || errorData.error || errorMessage;
//                     } catch {
//                         const errorText = await res.clone().text();
//                         errorMessage = errorText || errorMessage;
//                     }
//                     throw new Error(errorMessage);
//                 }

//                 const data = await res.json();
//                 if (Array.isArray(data)) {
//                     setComments(data);
//                 } else if (data.comments && Array.isArray(data.comments)) {
//                     setComments(data.comments);
//                 } else {
//                     console.warn("Unexpected comment data format:", data);
//                     setComments([]);
//                 }

//             } catch (err: any) {
//                 if (err.name === 'TypeError' && err.message.includes('fetch')) {
//                     setErrorComments('Unable to connect to server. Please check your connection.');
//                 } else if (err.message.includes('404')) {
//                     setErrorComments('Comments endpoint not found. Please contact support.');
//                 } else if (err.message.includes('500')) {
//                     setErrorComments('Server error. Please try again later.');
//                 } else {
//                     setErrorComments(err.message || 'Failed to fetch comments');
//                 }
//             } finally {
//                 setLoadingComments(false);
//             }
//         };

//         fetchComments();
//     }, [post?._id, apiBaseUrl, currentUser, getIdToken]);

//     // Scroll to bottom of comments list
//     useEffect(() => {
//         if (commentsListRef.current) {
//             commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
//         }
//     }, [comments]);

//     // Escape key listener
//     useEffect(() => {
//         const handleEscape = (e: KeyboardEvent) => {
//             if (e.key === 'Escape') onClose();
//         };
//         window.addEventListener('keydown', handleEscape);
//         return () => window.removeEventListener('keydown', handleEscape);
//     }, [onClose]);

//     // Handle posting a new comment
//     const handlePostComment = async () => {
//         if (!currentUser) {
//             toast.error('Please log in to post a comment.');
//             return;
//         }

//         if (!newCommentText.trim()) {
//             toast.error('Comment cannot be empty.');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication token not available. Please log in again.');
//                 return;
//             }

//             const res = await fetch(`${apiBaseUrl}/posts/${post._id}/comments`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ text: newCommentText.trim() }),
//             });

//             const resText = await res.text();
//             if (!res.ok) {
//                 let errorDetails = resText;
//                 try {
//                     const errorJson = JSON.parse(resText);
//                     errorDetails = errorJson.message || JSON.stringify(errorJson);
//                 } catch {
//                     // Not JSON, use raw text
//                 }
//                 throw new Error(`Failed to post comment (${res.status}): ${errorDetails}`);
//             }

//             const newComment = JSON.parse(resText);
//             setComments((prev) => [...prev, newComment]);
//             setNewCommentText('');
//             toast.success('Comment posted successfully!');
//         } catch (error: any) {
//             toast.error(`Failed to post comment: ${error.message || 'Unknown error'}`);
//         }
//     };

//     const postAuthorAvatar = post?.author?.avatarUrl || DEFAULT_USER_LOGO_URL;
//     const currentUserAvatar = currentUser?.avatarUrl || DEFAULT_USER_LOGO_URL;

//     const postAuthorName = post?.author?.name || 'Unknown User';
//     const postTime = getTimeAgo(post.createdAt); // Using custom getTimeAgo function

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') || post.mediaUrl.startsWith('data:')
//             ? post.mediaUrl
//             : `${baseBackendUrl}/${post.mediaUrl.startsWith('/') ? post.mediaUrl.substring(1) : post.mediaUrl}`)
//         : '';

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out animate-scale-in">
//             <div className="bg-white rounded-lg shadow-xl flex flex-col md:flex-row w-full max-w-4xl h-[90vh] md:h-[80vh] overflow-hidden transform transition-transform duration-300 ease-out">

//                 {/* Post Content Section (formerly PostContent component) */}
//                 <div className="w-full md:w-1/2 flex flex-col bg-gray-50 p-4 relative">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center space-x-3">
//                             {/* Replaced Next.js Link with a standard <a> tag */}
//                             <a href={`/users/${post?.author?.firebaseUid || post?.author?._id || 'unknown'}`} className="flex items-center space-x-3 group">
//                                 <img
//                                     src={postAuthorAvatar}
//                                     alt={postAuthorName}
//                                     className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                                     onError={(e) => {
//                                         const target = e.target as HTMLImageElement;
//                                         target.src = DEFAULT_USER_LOGO_URL;
//                                     }}
//                                 />
//                                 <div>
//                                     <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{postAuthorName}</p>
//                                     <p className="text-gray-500 text-sm">{postTime}</p>
//                                 </div>
//                             </a>
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
//                         </button>
//                     </div>

//                     <p className="text-gray-700 mb-4">{post.text}</p>

//                     {postMediaFullUrl && (
//                         <div className="mb-4 rounded-lg overflow-hidden relative flex-grow flex items-center justify-center">
//                             {post.mediaType === 'image' ? (
//                                 <img
//                                     src={postMediaFullUrl}
//                                     alt="Post Image"
//                                     style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '100%' }}
//                                     className="rounded-lg"
//                                     onError={(e) => {
//                                         const target = e.target as HTMLImageElement;
//                                         target.src = DEFAULT_IMAGE_ERROR_URL;
//                                     }}
//                                 />
//                             ) : (
//                                 <video
//                                     src={postMediaFullUrl}
//                                     controls
//                                     className="w-full h-auto max-h-full object-contain rounded-lg"
//                                     onError={(e) => {
//                                         console.error('Video load error:', e);
//                                     }}
//                                 />
//                             )}
//                         </div>
//                     )}

//                     <div className="flex items-center justify-between text-gray-600 text-sm mt-auto pt-4 border-t border-gray-200">
//                         <div className="flex items-center space-x-4">
//                             <button
//                                 onClick={() => handleLike(post._id, post.likes, post.isLiked)}
//                                 className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-thumbs-up mr-1 ${post.isLiked ? 'text-blue-500' : ''}`}><path d="M7 10v12"/><path d="M18 10V2a2 2 0 0 0-2-2L9 4l-3 7v9h9a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-3z"/></svg>
//                                 <span>{post.likes ? post.likes.length : 0}</span>
//                             </button>
//                             <button
//                                 onClick={() => { /* Comments are handled within this modal, so no separate modal needed */ }}
//                                 className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
//                                 <span>{comments.length}</span> {/* Use local comments state */}
//                             </button>
//                         </div>
//                         <button
//                             onClick={() => handleShare(post._id)}
//                             className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2 mr-1"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
//                             <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Comments Section (formerly CommentsSection component) */}
//                 <div className="w-full md:w-1/2 flex flex-col p-4 border-l border-gray-200">
//                     <h3 className="text-lg font-semibold mb-4">Comments</h3>

//                     {loadingComments && (
//                         <div className="flex-grow flex items-center justify-center text-gray-500">
//                             Loading comments...
//                         </div>
//                     )}
//                     {errorComments && (
//                         <div className="flex-grow flex items-center justify-center text-red-500">
//                             Error: {errorComments}
//                         </div>
//                     )}
//                     {!loadingComments && !errorComments && comments.length === 0 && (
//                         <div className="flex-grow flex items-center justify-center text-gray-500">
//                             No comments yet. Be the first to comment!
//                         </div>
//                     )}

//                     {!loadingComments && !errorComments && comments.length > 0 && (
//                         <div ref={commentsListRef} className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
//                             {comments.map((comment: any) => (
//                                 <div key={comment._id} className="mb-4 flex items-start space-x-3">
//                                     <img
//                                         src={comment.author?.avatarUrl || DEFAULT_USER_LOGO_URL}
//                                         alt={comment.author?.name || 'Unknown User'}
//                                         className="w-8 h-8 rounded-full object-cover"
//                                         onError={(e) => {
//                                             const target = e.target as HTMLImageElement;
//                                             target.src = DEFAULT_USER_LOGO_URL;
//                                         }}
//                                     />
//                                     <div className="flex-grow bg-gray-100 rounded-lg p-3">
//                                         <p className="font-semibold text-gray-800 text-sm">
//                                             {comment.author?.name || 'Unknown User'}
//                                             <span className="text-gray-500 text-xs ml-2">
//                                                 {getTimeAgo(comment.createdAt)}
//                                             </span>
//                                         </p>
//                                         <p className="text-gray-700 text-sm">{comment.text}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     <div className="mt-4 flex items-center space-x-3 pt-4 border-t border-gray-200">
//                         <img
//                             src={currentUserAvatar || DEFAULT_USER_LOGO_URL}
//                             alt="Your Avatar"
//                             className="w-10 h-10 rounded-full object-cover"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = DEFAULT_USER_LOGO_URL;
//                             }}
//                         />
//                         <div className="relative flex-grow">
//                             <input
//                                 type="text"
//                                 placeholder="Write your comment..."
//                                 value={newCommentText}
//                                 onChange={(e) => setNewCommentText(e.target.value)}
//                                 onKeyPress={(e) => {
//                                     if (e.key === 'Enter') handlePostComment();
//                                 }}
//                                 className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
//                             />
//                             <button
//                                 onClick={handlePostComment}
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 p-1 rounded-full"
//                                 aria-label="Post comment"
//                             >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//             {/* Custom Scrollbar Style */}
//             <style jsx>{`
//                 .custom-scrollbar::-webkit-scrollbar {
//                     width: 8px;
//                 }
//                 .custom-scrollbar::-webkit-scrollbar-track {
//                     background: #f1f1f1;
//                     border-radius: 10px;
//                 }
//                 .custom-scrollbar::-webkit-scrollbar-thumb {
//                     background: #888;
//                     border-radius: 10px;
//                 }
//                 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//                     background: #555;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default CommentModal;
