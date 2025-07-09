// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical } from 'lucide-react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { useState, useRef, useEffect } from 'react';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// import CommentModal from './CommentModal';
// import PostEditModal from './PostEditModal';
// import DeleteConfirmationModal from './DeleteConfirmationModal';

// // Corrected path for the default logo, assuming it's in public/assets
// // If '../app/assets/userLogo.png' is correct, keep it as is.
// // Otherwise, adjust based on your project structure:
// // import defaultUserLogo from '../../public/assets/userLogo.png'; 
// import defaultUserLogo from '../app/assets/userLogo.png'; // Keeping your original path


// interface PostCardProps {
//     post?: any;
//     handleLike: (postId: string) => Promise<void>; // Simplified like handler, no longer passes currentLikes/isLiked
//     handleShare: (postId: string) => Promise<void>;
//     loading: boolean;
//     currentUser: any; // Firebase user object (now includes customAvatarUrl)
//     getIdToken: () => Promise<string | null>;
//     onPostDeleted: (postId: string) => void;
//     onPostUpdated: (updatedPost: any) => void;
//     // Removed updatedUserIcon and setUpdatedUserIcon props - no longer needed here
// }

// const PostCard = ({
//     post,
//     handleLike,
//     handleShare,
//     loading,
//     currentUser,
//     getIdToken,
//     onPostDeleted,
//     onPostUpdated,
// }: PostCardProps) => {
//     const [showCommentsModal, setShowCommentsModal] = useState(false);
//     const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowOptionsDropdown(false);
//             }
//         };

//         if (showOptionsDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showOptionsDropdown]);


//     if (loading) {
//         return (
//             <div className="bg-white rounded-lg shadow-md m-4 p-4">
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                         <Skeleton circle width={48} height={48} />
//                         <div>
//                             <Skeleton width={120} height={20} />
//                             <Skeleton width={80} height={14} style={{ marginTop: '4px' }} />
//                         </div>
//                     </div>
//                     <Skeleton width={20} height={20} />
//                 </div>

//                 <Skeleton count={2} height={16} style={{ marginBottom: '16px' }} />
//                 <Skeleton height={200} style={{ marginBottom: '16px', borderRadius: '8px' }} />

//                 <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                     <div className="flex items-center space-x-4">
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                     </div>
//                     <Skeleton width={80} height={32} borderRadius={999} />
//                 </div>

//                 <hr className="my-4 border-gray-200" />
//                 <Skeleton height={40} className="w-full" borderRadius={999} />
//             </div>
//         );
//     }

//     const authorName = post?.author?.name || 'Unknown User';

//     // --- SIMPLIFIED LOGIC FOR AUTHOR AVATAR ---
//     // Use post.author.avatarUrl (from backend) or fallback to frontend default
//     const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
//         ? (post.author.avatarUrl.startsWith('http')
//             ? post.author.avatarUrl
//             : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
//         : defaultUserLogo.src;


//     const authorFirebaseUid = post?.author?.firebaseUid || '#';
//     const postTime = moment(post.createdAt).fromNow();

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
//         : '';

//     // --- SIMPLIFIED LOGIC FOR CURRENT USER AVATAR ---
//     // Use currentUser.customAvatarUrl (from AuthProvider) or fallback to frontend default
//     const currentUserAvatarUrl = currentUser?.avatarUrl || defaultUserLogo.src;


//     const isCurrentUserAuthor = currentUser && currentUser.uid === post?.author?.firebaseUid;

//     const handleEditPost = () => {
//         setShowEditModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const confirmDeleteHandler = () => {
//         setShowDeleteConfirmModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const executeDelete = async () => {
//         setShowDeleteConfirmModal(false);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required to delete post.');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete post');
//             }

//             toast.success('Post deleted successfully!');
//             onPostDeleted(post._id);

//         } catch (error: any) {
//             console.error('Error deleting post:', error);
//             toast.error(`Error deleting post: ${error.message}`);
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     <Link href={`/users/${authorFirebaseUid}`} className="flex items-center space-x-3 group">
//                         <img
//                             src={authorAvatarUrl} // Use the resolved authorAvatarUrl
//                             alt={authorName}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
//                             <p className="text-gray-500 text-sm">{postTime}</p>
//                         </div>
//                     </Link>
//                 </div>
//                 {isCurrentUserAuthor && (
//                     <div className="relative" ref={dropdownRef}>
//                         <button
//                             className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
//                             onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
//                             aria-haspopup="true"
//                             aria-expanded={showOptionsDropdown}
//                         >
//                             <MoreVertical size={20} />
//                         </button>

//                         {showOptionsDropdown && (
//                             <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                                 <button
//                                     onClick={handleEditPost}
//                                     className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
//                                 >
//                                     <Edit size={16} className="mr-2" /> Edit Post
//                                 </button>
//                                 <button
//                                     onClick={confirmDeleteHandler}
//                                     className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
//                                 >
//                                     <Trash2 size={16} className="mr-2" /> Delete Post
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             {postMediaFullUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden relative">
//                     {post.mediaType === 'image' ? (
//                         <>
//                             <Image
//                                 src={postMediaFullUrl}
//                                 alt="Post Image"
//                                 width={600}
//                                 height={450}
//                                 style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
//                                 className="rounded-lg"
//                                 priority
//                             />
//                         </>
//                     ) : (
//                         <video
//                             src={postMediaFullUrl}
//                             controls
//                             className="w-full h-auto max-h-96 object-contain rounded-lg"
//                         />
//                     )}
//                 </div>
//             )}

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id)} // Simplified: no longer passing currentLikes/isLiked
//                         className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes ? post.likes.length : 0}</span>
//                     </button>
//                     <button
//                         onClick={() => setShowCommentsModal(true)}
//                         className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                     >
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.comments ? post.comments.length : 0}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id)}
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={currentUserAvatarUrl} // Use the resolved currentUserAvatarUrl
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment..."
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//                         readOnly
//                         onClick={() => setShowCommentsModal(true)}
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             {showCommentsModal && (
//                 <CommentModal
//                     post={post}
//                     onClose={() => setShowCommentsModal(false)}
//                     currentUser={currentUser}
//                     getIdToken={getIdToken}
//                     handleLike={handleLike} // Pass the simplified handleLike
//                     handleShare={handleShare}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showEditModal && (
//                 <PostEditModal
//                     post={post}
//                     onClose={() => setShowEditModal(false)}
//                     onPostUpdated={onPostUpdated}
//                     getIdToken={getIdToken}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showDeleteConfirmModal && (
//                 <DeleteConfirmationModal
//                     title="Delete Post"
//                     message="Are you sure you want to permanently delete this post? This action cannot be undone."
//                     onConfirm={executeDelete}
//                     onCancel={() => setShowDeleteConfirmModal(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default PostCard;






// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { useState, useRef, useEffect } from 'react';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// import CommentModal from './CommentModal';
// import PostEditModal from './PostEditModal';
// import DeleteConfirmationModal from './DeleteConfirmationModal';

// import defaultUserLogo from '../app/assets/userLogo.png';

// interface PostCardProps {
//     post?: any;
//     handleLike: (postId: string) => Promise<void>;
//     handleShare: (postId: string) => Promise<void>;
//     loading: boolean;
//     currentUser: any;
//     getIdToken: () => Promise<string | null>;
//     onPostDeleted: (postId: string) => void;
//     onPostUpdated: (updatedPost: any) => void;
// }

// interface FollowStatus {
//     status: 'following' | 'pending' | 'not_following' | 'self';
// }

// const PostCard = ({
//     post,
//     handleLike,
//     handleShare,
//     loading,
//     currentUser,
//     getIdToken,
//     onPostDeleted,
//     onPostUpdated,
// }: PostCardProps) => {
//     const [showCommentsModal, setShowCommentsModal] = useState(false);
//     const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     // Follow related states
//     const [followStatus, setFollowStatus] = useState<FollowStatus['status']>('not_following');
//     const [isFollowLoading, setIsFollowLoading] = useState(false);

//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowOptionsDropdown(false);
//             }
//         };

//         if (showOptionsDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showOptionsDropdown]);

//     // Check follow status when component mounts or user changes
//     useEffect(() => {
//         if (currentUser && post?.author?._id && currentUser.uid !== post?.author?.firebaseUid) {
//             checkFollowStatus();
//         }
//     }, [currentUser, post?.author?._id]);

//     const checkFollowStatus = async () => {
//         if (!currentUser || !post?.author?._id) return;

//         try {
//             const token = await getIdToken();
//             if (!token) return;

//             const response = await fetch(`${BACKEND_URL}/follow/follow-status/${post.author._id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setFollowStatus(data.status);
//             }
//         } catch (error) {
//             console.error('Error checking follow status:', error);
//         }
//     };

//     const handleFollowAction = async () => {
//         if (!currentUser || !post?.author?._id) return;

//         setIsFollowLoading(true);
//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required');
//                 return;
//             }

//             let response;
//             let successMessage = '';

//             if (followStatus === 'not_following') {
//                 // Send follow request
//                 response = await fetch(`${BACKEND_URL}/follow/send-follow-request`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ targetUserId: post.author._id }),
//                 });
//                 successMessage = 'Follow request sent!';
//             } else if (followStatus === 'following') {
//                 // Unfollow
//                 response = await fetch(`${BACKEND_URL}/follow/unfollow/${post.author._id}`, {
//                     method: 'DELETE',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });
//                 successMessage = 'Unfollowed successfully!';
//             }

//             if (response && response.ok) {
//                 toast.success(successMessage);
//                 checkFollowStatus(); // Refresh follow status
//             } else {
//                 const errorData = await response?.json();
//                 toast.error(errorData.message || 'Action failed');
//             }
//         } catch (error: any) {
//             console.error('Error with follow action:', error);
//             toast.error('Something went wrong');
//         } finally {
//             setIsFollowLoading(false);
//         }
//     };

//     const getFollowButtonConfig = () => {
//         switch (followStatus) {
//             case 'following':
//                 return {
//                     icon: UserCheck,
//                     text: 'Following',
//                     className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
//                 };
//             case 'pending':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'not_following':
//                 return {
//                     icon: UserPlus,
//                     text: 'Follow',
//                     className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//                 };
//             default:
//                 return null;
//         }
//     };

//     if (loading) {
//         return (
//             <div className="bg-white rounded-lg shadow-md m-4 p-4">
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                         <Skeleton circle width={48} height={48} />
//                         <div>
//                             <Skeleton width={120} height={20} />
//                             <Skeleton width={80} height={14} style={{ marginTop: '4px' }} />
//                         </div>
//                     </div>
//                     <Skeleton width={20} height={20} />
//                 </div>

//                 <Skeleton count={2} height={16} style={{ marginBottom: '16px' }} />
//                 <Skeleton height={200} style={{ marginBottom: '16px', borderRadius: '8px' }} />

//                 <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                     <div className="flex items-center space-x-4">
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                     </div>
//                     <Skeleton width={80} height={32} borderRadius={999} />
//                 </div>

//                 <hr className="my-4 border-gray-200" />
//                 <Skeleton height={40} className="w-full" borderRadius={999} />
//             </div>
//         );
//     }

//     const authorName = post?.author?.name || 'Unknown User';
//     const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
//         ? (post.author.avatarUrl.startsWith('http')
//             ? post.author.avatarUrl
//             : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
//         : defaultUserLogo.src;

//     const authorFirebaseUid = post?.author?.firebaseUid || '#';
//     const postTime = moment(post.createdAt).fromNow();

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
//         : '';

//     const currentUserAvatarUrl = currentUser?.avatarUrl || defaultUserLogo.src;
//     const isCurrentUserAuthor = currentUser && currentUser.uid === post?.author?.firebaseUid;
//     const followButtonConfig = getFollowButtonConfig();

//     const handleEditPost = () => {
//         setShowEditModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const confirmDeleteHandler = () => {
//         setShowDeleteConfirmModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const executeDelete = async () => {
//         setShowDeleteConfirmModal(false);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required to delete post.');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete post');
//             }

//             toast.success('Post deleted successfully!');
//             onPostDeleted(post._id);

//         } catch (error: any) {
//             console.error('Error deleting post:', error);
//             toast.error(`Error deleting post: ${error.message}`);
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     <Link href={`/users/${authorFirebaseUid}`} className="flex items-center space-x-3 group">
//                         <img
//                             src={authorAvatarUrl}
//                             alt={authorName}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
//                             <p className="text-gray-500 text-sm">{postTime}</p>
//                         </div>
//                     </Link>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                     {/* Follow Button - Show only if not current user's post */}
//                     {!isCurrentUserAuthor && followButtonConfig && (
//                         <button
//                             onClick={handleFollowAction}
//                             disabled={isFollowLoading || followButtonConfig.disabled}
//                             className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
//                                 followButtonConfig.className
//                             } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             <followButtonConfig.icon size={16} className="mr-1" />
//                             {isFollowLoading ? 'Loading...' : followButtonConfig.text}
//                         </button>
//                     )}

//                     {/* Options Dropdown - Show only for current user's posts */}
//                     {isCurrentUserAuthor && (
//                         <div className="relative" ref={dropdownRef}>
//                             <button
//                                 className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
//                                 onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
//                                 aria-haspopup="true"
//                                 aria-expanded={showOptionsDropdown}
//                             >
//                                 <MoreVertical size={20} />
//                             </button>

//                             {showOptionsDropdown && (
//                                 <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                                     <button
//                                         onClick={handleEditPost}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
//                                     >
//                                         <Edit size={16} className="mr-2" /> Edit Post
//                                     </button>
//                                     <button
//                                         onClick={confirmDeleteHandler}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
//                                     >
//                                         <Trash2 size={16} className="mr-2" /> Delete Post
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             {postMediaFullUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden relative">
//                     {post.mediaType === 'image' ? (
//                         <Image
//                             src={postMediaFullUrl}
//                             alt="Post Image"
//                             width={600}
//                             height={450}
//                             style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
//                             className="rounded-lg"
//                             priority
//                         />
//                     ) : (
//                         <video
//                             src={postMediaFullUrl}
//                             controls
//                             className="w-full h-auto max-h-96 object-contain rounded-lg"
//                         />
//                     )}
//                 </div>
//             )}

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id)}
//                         className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes ? post.likes.length : 0}</span>
//                     </button>
//                     <button
//                         onClick={() => setShowCommentsModal(true)}
//                         className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                     >
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.comments ? post.comments.length : 0}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id)}
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={currentUserAvatarUrl}
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment..."
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//                         readOnly
//                         onClick={() => setShowCommentsModal(true)}
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             {showCommentsModal && (
//                 <CommentModal
//                     post={post}
//                     onClose={() => setShowCommentsModal(false)}
//                     currentUser={currentUser}
//                     getIdToken={getIdToken}
//                     handleLike={handleLike}
//                     handleShare={handleShare}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showEditModal && (
//                 <PostEditModal
//                     post={post}
//                     onClose={() => setShowEditModal(false)}
//                     onPostUpdated={onPostUpdated}
//                     getIdToken={getIdToken}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showDeleteConfirmModal && (
//                 <DeleteConfirmationModal
//                     title="Delete Post"
//                     message="Are you sure you want to permanently delete this post? This action cannot be undone."
//                     onConfirm={executeDelete}
//                     onCancel={() => setShowDeleteConfirmModal(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default PostCard;


// 'use client'; // This directive indicates that this component should be rendered on the client side in Next.js

// import Link from 'next/link';
// import Image from 'next/image';
// import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// import CommentModal from './CommentModal';
// import PostEditModal from './PostEditModal';
// import DeleteConfirmationModal from './DeleteConfirmationModal';

// import defaultUserLogo from '../app/assets/userLogo.png';

// // Define the structure for the post and current user data received by PostCard
// interface PostCardProps {
//     post?: any; // Consider defining a more specific interface for Post
//     handleLike: (postId: string) => Promise<void>;
//     handleShare: (postId: string) => Promise<void>;
//     loading: boolean;
//     currentUser: {
//         uid: string; // Firebase UID
//         mongoUserId: string; // MongoDB _id
//         name: string;
//         avatarUrl: string;
//         // Add other user properties you might need
//     };
//     getIdToken: () => Promise<string | null>;
//     onPostDeleted: (postId: string) => void;
//     onPostUpdated: (updatedPost: any) => void;
// }

// // Updated type for follow status to explicitly include sent/received pending states
// type FollowStatus = 'following' | 'pending_sent' | 'pending_received' | 'not_following' | 'self';

// const PostCard = ({
//     post,
//     handleLike,
//     handleShare,
//     loading,
//     currentUser,
//     getIdToken,
//     onPostDeleted,
//     onPostUpdated,
// }: PostCardProps) => {
//     const [showCommentsModal, setShowCommentsModal] = useState(false);
//     const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
//     const [isFollowLoading, setIsFollowLoading] = useState(false);

//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

//     // Effect to close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowOptionsDropdown(false);
//             }
//         };

//         if (showOptionsDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showOptionsDropdown]);

//     // Function to check and update follow status from the backend
//     const checkFollowStatus = useCallback(async () => {
//         // If current user or post author is missing, or it's the current user's own post
//         if (!currentUser || !post?.author?._id) {
//             setFollowStatus('not_following'); // Cannot determine status, default to not following
//             return;
//         }

//         // If it's the current user's post, set status to 'self' and exit
//         if (currentUser.mongoUserId === post.author._id) {
//             setFollowStatus('self');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setFollowStatus('not_following'); // Cannot check status without token, assume not following
//                 return;
//             }

//             // Call the new backend endpoint to get the detailed follow status
//             const response = await fetch(`${BACKEND_URL}/follow/follow-status/${post.author._id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 // Directly use the backend status
//                 setFollowStatus(data.status);
//             } else {
//                 console.error('Failed to fetch follow status:', response.status, await response.text());
//                 setFollowStatus('not_following'); // Default to not following on fetch error
//             }
//         } catch (error) {
//             console.error('Error checking follow status:', error);
//             setFollowStatus('not_following'); // Default to not following on network error
//         }
//     }, [currentUser, post?.author?._id, getIdToken, BACKEND_URL]);

//     // Effect to run checkFollowStatus on component mount or relevant state changes
//     useEffect(() => {
//         checkFollowStatus();
//     }, [checkFollowStatus]);

//     // Handler for follow/unfollow actions
//     const handleFollowAction = async () => {
//         // Prevent action if it's the current user's own post or loading
//         if (followStatus === 'self' || isFollowLoading) return;
//         if (!currentUser || !post?.author?._id) return; // Basic check

//         setIsFollowLoading(true);
//         let actionToastId: string | undefined;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required');
//                 return;
//             }

//             let response;
//             let successMessage = '';
//             let optimisticNewStatus: FollowStatus = followStatus;

//             if (followStatus === 'not_following') {
//                 actionToastId = toast.loading('Sending follow request...');
//                 response = await fetch(`${BACKEND_URL}/follow/send-follow-request`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ targetUserId: post.author._id }),
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Follow request sent!';
//                     // If the backend auto-accepted (e.g., reverse request), it would return status 'accepted'.
//                     // Otherwise, it returns 'pending'. We should reflect that.
//                     optimisticNewStatus = data.status === 'accepted' ? 'following' : 'pending_sent';
//                 } else {
//                     throw new Error(data.message || 'Failed to send follow request');
//                 }
//             } else if (followStatus === 'following') {
//                 actionToastId = toast.loading('Unfollowing user...');
//                 response = await fetch(`${BACKEND_URL}/follow/unfollow/${post.author._id}`, {
//                     method: 'DELETE',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Unfollowed successfully!';
//                     optimisticNewStatus = 'not_following';
//                 } else {
//                     throw new Error(data.message || 'Failed to unfollow user');
//                 }
//             } else if (followStatus === 'pending_received') {
//                 // If you want to accept from here, you would need the requestId.
//                 // For now, consistent with your backend, this action implicitly means the user
//                 // should go to their requests page. So, we'll keep it disabled and inform the user.
//                 toast("This user has sent you a request. Please go to your requests page to accept or reject.");
//                 setIsFollowLoading(false); // Make sure to stop loading
//                 return;
//             }

//             if (response && response.ok) {
//                 toast.dismiss(actionToastId);
//                 toast.success(successMessage);
//                 setFollowStatus(optimisticNewStatus);
//             }
//         } catch (error: any) {
//             console.error('Error with follow action:', error);
//             toast.dismiss(actionToastId);
//             toast.error(error.message || 'Something went wrong with the follow action.');
//             checkFollowStatus(); // Re-fetch actual status on error
//         } finally {
//             setIsFollowLoading(false);
//         }
//     };


//     // Configuration for the follow button based on current status
//     const getFollowButtonConfig = () => {
//         // No button if it's the current user's own post
//         if (followStatus === 'self') {
//             return null;
//         }

//         switch (followStatus) {
//             case 'following':
//                 return {
//                     icon: UserCheck, // Icon for 'Following'
//                     text: 'Following',
//                     className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
//                     disabled: false, // User can unfollow
//                 };
//             case 'pending_sent':
//                 return {
//                     icon: Clock, // Icon for 'Pending'
//                     text: 'Pending', // You sent the request, waiting for their approval
//                     className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'pending_received':
//                 return {
//                     icon: Clock, // Icon for 'Pending'
//                     text: 'Pending', // They sent you a request, you need to accept
//                     className: 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed',
//                     disabled: true, // You need to accept it from your requests page, not here.
//                 };
//             case 'not_following':
//                 return {
//                     icon: UserPlus, // Icon for 'Follow'
//                     text: 'Follow',
//                     className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//                     disabled: false,
//                 };
//             default:
//                 return null; // Don't show button for unknown or loading states before status is determined
//         }
//     };

//     if (loading) {
//         return (
//             <div className="bg-white rounded-lg shadow-md m-4 p-4">
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                         <Skeleton circle width={48} height={48} />
//                         <div>
//                             <Skeleton width={120} height={20} />
//                             <Skeleton width={80} height={14} style={{ marginTop: '4px' }} />
//                         </div>
//                     </div>
//                     <Skeleton width={20} height={20} />
//                 </div>

//                 <Skeleton count={2} height={16} style={{ marginBottom: '16px' }} />
//                 <Skeleton height={200} style={{ marginBottom: '16px', borderRadius: '8px' }} />

//                 <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                     <div className="flex items-center space-x-4">
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                     </div>
//                     <Skeleton width={80} height={32} borderRadius={999} />
//                 </div>

//                 <hr className="my-4 border-gray-200" />
//                 <Skeleton height={40} className="w-full" borderRadius={999} />
//             </div>
//         );
//     }

//     const authorName = post?.author?.name || 'Unknown User';
//     const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
//         ? (post.author.avatarUrl.startsWith('http')
//             ? post.author.avatarUrl
//             : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
//         : defaultUserLogo.src;

//     const postTime = moment(post.createdAt).fromNow();

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
//         : '';

//     const currentUserAvatarUrl = currentUser?.avatarUrl || defaultUserLogo.src;
//     // `isCurrentUserAuthor` is already used to show/hide edit/delete options
//     const isCurrentUserAuthor = currentUser && currentUser.mongoUserId === post?.author?._id;
//     const followButtonConfig = getFollowButtonConfig();

//     const handleEditPost = () => {
//         setShowEditModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const confirmDeleteHandler = () => {
//         setShowDeleteConfirmModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const executeDelete = async () => {
//         setShowDeleteConfirmModal(false);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required to delete post.');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete post');
//             }

//             toast.success('Post deleted successfully!');
//             onPostDeleted(post._id);

//         } catch (error: any) {
//             console.error('Error deleting post:', error);
//             toast.error(`Error deleting post: ${error.message}`);
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     <Link href={`/dashboard/profile/${post?.author?._id}`} className="flex items-center space-x-3 group">
//                         <img
//                             src={authorAvatarUrl}
//                             alt={authorName}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = defaultUserLogo.src;
//                             }}
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
//                             <p className="text-gray-500 text-sm">{postTime}</p>
//                         </div>
//                     </Link>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                     {/* Follow Button - Conditionally rendered based on followButtonConfig */}
//                     {followButtonConfig && (
//                         <button
//                             onClick={handleFollowAction}
//                             disabled={isFollowLoading || followButtonConfig.disabled}
//                             className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
//                                 followButtonConfig.className
//                             } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             <followButtonConfig.icon size={16} className="mr-1" />
//                             {isFollowLoading ? 'Loading...' : followButtonConfig.text}
//                         </button>
//                     )}

//                     {/* Options Dropdown - Show only for current user's posts */}
//                     {isCurrentUserAuthor && (
//                         <div className="relative" ref={dropdownRef}>
//                             <button
//                                 className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
//                                 onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
//                                 aria-haspopup="true"
//                                 aria-expanded={showOptionsDropdown}
//                             >
//                                 <MoreVertical size={20} />
//                             </button>

//                             {showOptionsDropdown && (
//                                 <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                                     <button
//                                         onClick={handleEditPost}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
//                                     >
//                                         <Edit size={16} className="mr-2" /> Edit Post
//                                     </button>
//                                     <button
//                                         onClick={confirmDeleteHandler}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
//                                     >
//                                         <Trash2 size={16} className="mr-2" /> Delete Post
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             {postMediaFullUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden relative">
//                     {post.mediaType === 'image' ? (
//                         <Image
//                             src={postMediaFullUrl}
//                             alt="Post Image"
//                             width={600}
//                             height={450}
//                             style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
//                             className="rounded-lg"
//                             priority
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = `https://placehold.co/600x450/cccccc/333333?text=Image+Load+Error`;
//                             }}
//                         />
//                     ) : (
//                         <video
//                             src={postMediaFullUrl}
//                             controls
//                             className="w-full h-auto max-h-96 object-contain rounded-lg"
//                             onError={(e) => {
//                                 console.error('Video load error:', e);
//                             }}
//                         />
//                     )}
//                 </div>
//             )}

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id)}
//                         className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes ? post.likes.length : 0}</span>
//                     </button>
//                     <button
//                         onClick={() => setShowCommentsModal(true)}
//                         className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                     >
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.comments ? post.comments.length : 0}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id)}
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={currentUserAvatarUrl}
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultUserLogo.src;
//                     }}
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment..."
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//                         readOnly
//                         onClick={() => setShowCommentsModal(true)}
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             {showCommentsModal && (
//                 <CommentModal
//                     post={post}
//                     onClose={() => setShowCommentsModal(false)}
//                     currentUser={currentUser}
//                     getIdToken={getIdToken}
//                     handleLike={handleLike}
//                     handleShare={handleShare}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showEditModal && (
//                 <PostEditModal
//                     post={post}
//                     onClose={() => setShowEditModal(false)}
//                     onPostUpdated={onPostUpdated}
//                     getIdToken={getIdToken}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showDeleteConfirmModal && (
//                 <DeleteConfirmationModal
//                     title="Delete Post"
//                     message="Are you sure you want to permanently delete this post? This action cannot be undone."
//                     onConfirm={executeDelete}
//                     onCancel={() => setShowDeleteConfirmModal(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default PostCard;

// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import moment from 'moment';
// import toast from 'react-hot-toast';

// import CommentModal from './CommentModal';
// import PostEditModal from './PostEditModal';
// import DeleteConfirmationModal from './DeleteConfirmationModal';

// import defaultUserLogo from '../app/assets/userLogo.png';

// interface PostCardProps {
//     post?: any;
//     handleLike: (postId: string) => Promise<void>;
//     handleShare: (postId: string) => Promise<void>;
//     loading: boolean;
//     currentUser: {
//         uid: string;
//         mongoUserId: string;
//         name: string;
//         avatarUrl: string;
//     };
//     getIdToken: () => Promise<string | null>;
//     onPostDeleted: (postId: string) => void;
//     onPostUpdated: (updatedPost: any) => void;
// }

// type FollowStatus = 'following' | 'pending_sent' | 'pending_received' | 'not_following' | 'self';

// const PostCard = ({
//     post,
//     handleLike,
//     handleShare,
//     loading,
//     currentUser,
//     getIdToken,
//     onPostDeleted,
//     onPostUpdated,
// }: PostCardProps) => {
//     const [showCommentsModal, setShowCommentsModal] = useState(false);
//     const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
//     const [isFollowLoading, setIsFollowLoading] = useState(false);

//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

//     // --- New: Audio Players for sounds ---
//     const requestSentAudio = useRef<HTMLAudioElement | null>(null);
//     const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);

//     useEffect(() => {
//         // Initialize audio elements once on component mount
//         requestSentAudio.current = new Audio('/sounds/request_sent.mp3');
//         requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
//         // Preload sounds for faster playback
//         requestSentAudio.current.load();
//         requestAcceptedAudio.current.load();
//     }, []);

//     const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
//         if (audioElementRef.current) {
//             audioElementRef.current.currentTime = 0; // Rewind to start
//             audioElementRef.current.play().catch(error => {
//                 console.warn('Audio playback failed:', error);
//                 // This might happen if the user hasn't interacted with the page yet
//                 // or if autoplay is blocked.
//             });
//         }
//     }, []);
//     // --- End New: Audio Players ---

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowOptionsDropdown(false);
//             }
//         };

//         if (showOptionsDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showOptionsDropdown]);

//     const checkFollowStatus = useCallback(async () => {
//         if (!currentUser || !post?.author?._id) {
//             setFollowStatus('not_following');
//             return;
//         }

//         if (currentUser.mongoUserId === post.author._id) {
//             setFollowStatus('self');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setFollowStatus('not_following');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/follow/follow-status/${post.author._id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setFollowStatus(data.status);
//             } else {
//                 console.error('Failed to fetch follow status:', response.status, await response.text());
//                 setFollowStatus('not_following');
//             }
//         } catch (error) {
//             console.error('Error checking follow status:', error);
//             setFollowStatus('not_following');
//         }
//     }, [currentUser, post?.author?._id, getIdToken, BACKEND_URL]);

//     useEffect(() => {
//         checkFollowStatus();
//     }, [checkFollowStatus]);

//     const handleFollowAction = async () => {
//         if (followStatus === 'self' || isFollowLoading) return;
//         if (!currentUser || !post?.author?._id) return;

//         setIsFollowLoading(true);
//         let actionToastId: string | undefined;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required');
//                 return;
//             }

//             let response;
//             let successMessage = '';
//             let optimisticNewStatus: FollowStatus = followStatus;

//             if (followStatus === 'not_following') {
//                 actionToastId = toast.loading('Sending follow request...');
//                 response = await fetch(`${BACKEND_URL}/follow/send-follow-request`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ targetUserId: post.author._id }),
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Follow request sent!';
//                     optimisticNewStatus = data.status === 'accepted' ? 'following' : 'pending_sent';
//                     // --- New: Play sound for request sent ---
//                     if (data.status !== 'accepted') { // Don't play sent sound if it auto-accepted
//                         playSound(requestSentAudio);
//                     } else {
//                         playSound(requestAcceptedAudio); // If it auto-accepted, play accepted sound
//                     }
//                     // --- End New ---
//                 } else {
//                     throw new Error(data.message || 'Failed to send follow request');
//                 }
//             } else if (followStatus === 'following') {
//                 actionToastId = toast.loading('Unfollowing user...');
//                 response = await fetch(`${BACKEND_URL}/follow/unfollow/${post.author._id}`, {
//                     method: 'DELETE',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Unfollowed successfully!';
//                     optimisticNewStatus = 'not_following';
//                 } else {
//                     throw new Error(data.message || 'Failed to unfollow user');
//                 }
//             } else if (followStatus === 'pending_received') {
//                 toast("This user has sent you a request. Please go to your requests page to accept or reject.");
//                 setIsFollowLoading(false);
//                 return;
//             }

//             if (response && response.ok) {
//                 toast.dismiss(actionToastId);
//                 toast.success(successMessage);
//                 setFollowStatus(optimisticNewStatus);
//             }
//         } catch (error: any) {
//             console.error('Error with follow action:', error);
//             toast.dismiss(actionToastId);
//             toast.error(error.message || 'Something went wrong with the follow action.');
//             checkFollowStatus();
//         } finally {
//             setIsFollowLoading(false);
//         }
//     };


//     const getFollowButtonConfig = () => {
//         if (followStatus === 'self') {
//             return null;
//         }

//         switch (followStatus) {
//             case 'following':
//                 return {
//                     icon: UserCheck,
//                     text: 'Following',
//                     className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
//                     disabled: false,
//                 };
//             case 'pending_sent':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'pending_received':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'not_following':
//                 return {
//                     icon: UserPlus,
//                     text: 'Follow',
//                     className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//                     disabled: false,
//                 };
//             default:
//                 return null;
//         }
//     };

//     if (loading) {
//         return (
//             <div className="bg-white rounded-lg shadow-md m-4 p-4">
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-3">
//                         <Skeleton circle width={48} height={48} />
//                         <div>
//                             <Skeleton width={120} height={20} />
//                             <Skeleton width={80} height={14} style={{ marginTop: '4px' }} />
//                         </div>
//                     </div>
//                     <Skeleton width={20} height={20} />
//                 </div>

//                 <Skeleton count={2} height={16} style={{ marginBottom: '16px' }} />
//                 <Skeleton height={200} style={{ marginBottom: '16px', borderRadius: '8px' }} />

//                 <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                     <div className="flex items-center space-x-4">
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                         <Skeleton width={80} height={32} borderRadius={999} />
//                     </div>
//                     <Skeleton width={80} height={32} borderRadius={999} />
//                 </div>

//                 <hr className="my-4 border-gray-200" />
//                 <Skeleton height={40} className="w-full" borderRadius={999} />
//             </div>
//         );
//     }

//     const authorName = post?.author?.name || 'Unknown User';
//     const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
//         ? (post.author.avatarUrl.startsWith('http')
//             ? post.author.avatarUrl
//             : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
//         : defaultUserLogo.src;

//     const postTime = moment(post.createdAt).fromNow();

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
//         : '';

//     const currentUserAvatarUrl = currentUser?.avatarUrl || defaultUserLogo.src;
//     const isCurrentUserAuthor = currentUser && currentUser.mongoUserId === post?.author?._id;
//     const followButtonConfig = getFollowButtonConfig();

//     const handleEditPost = () => {
//         setShowEditModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const confirmDeleteHandler = () => {
//         setShowDeleteConfirmModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const executeDelete = async () => {
//         setShowDeleteConfirmModal(false);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required to delete post.');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete post');
//             }

//             toast.success('Post deleted successfully!');
//             onPostDeleted(post._id);

//         } catch (error: any) {
//             console.error('Error deleting post:', error);
//             toast.error(`Error deleting post: ${error.message}`);
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     <Link href={`/https://vartalaap-r36o.onrender.com/${post?.author?._id}`} className="flex items-center space-x-3 group">
//                         <img
//                             src={authorAvatarUrl}
//                             alt={authorName}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = defaultUserLogo.src;
//                             }}
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
//                             <p className="text-gray-500 text-sm">{postTime}</p>
//                         </div>
//                     </Link>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                     {followButtonConfig && (
//                         <button
//                             onClick={handleFollowAction}
//                             disabled={isFollowLoading || followButtonConfig.disabled}
//                             className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
//                                 followButtonConfig.className
//                             } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             <followButtonConfig.icon size={16} className="mr-1" />
//                             {isFollowLoading ? 'Loading...' : followButtonConfig.text}
//                         </button>
//                     )}

//                     {isCurrentUserAuthor && (
//                         <div className="relative" ref={dropdownRef}>
//                             <button
//                                 className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
//                                 onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
//                                 aria-haspopup="true"
//                                 aria-expanded={showOptionsDropdown}
//                             >
//                                 <MoreVertical size={20} />
//                             </button>

//                             {showOptionsDropdown && (
//                                 <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                                     <button
//                                         onClick={handleEditPost}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
//                                     >
//                                         <Edit size={16} className="mr-2" /> Edit Post
//                                     </button>
//                                     <button
//                                         onClick={confirmDeleteHandler}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
//                                     >
//                                         <Trash2 size={16} className="mr-2" /> Delete Post
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             {postMediaFullUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden relative">
//                     {post.mediaType === 'image' ? (
//                         <Image
//                             src={postMediaFullUrl}
//                             alt="Post Image"
//                             width={600}
//                             height={450}
//                             style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
//                             className="rounded-lg"
//                             priority
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = `https://placehold.co/600x450/cccccc/333333?text=Image+Load+Error`;
//                             }}
//                         />
//                     ) : (
//                         <video
//                             src={postMediaFullUrl}
//                             controls
//                             className="w-full h-auto max-h-96 object-contain rounded-lg"
//                             onError={(e) => {
//                                 console.error('Video load error:', e);
//                             }}
//                         />
//                     )}
//                 </div>
//             )}

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id)}
//                         className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes ? post.likes.length : 0}</span>
//                     </button>
//                     <button
//                         onClick={() => setShowCommentsModal(true)}
//                         className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                     >
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.comments ? post.comments.length : 0}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id)}
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={currentUserAvatarUrl}
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultUserLogo.src;
//                     }}
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment..."
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//                         readOnly
//                         onClick={() => setShowCommentsModal(true)}
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             {showCommentsModal && (
//                 <CommentModal
//                     post={post}
//                     onClose={() => setShowCommentsModal(false)}
//                     currentUser={currentUser}
//                     getIdToken={getIdToken}
//                     handleLike={handleLike}
//                     handleShare={handleShare}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showEditModal && (
//                 <PostEditModal
//                     post={post}
//                     onClose={() => setShowEditModal(false)}
//                     onPostUpdated={onPostUpdated}
//                     getIdToken={getIdToken}
//                     backendUrl={BACKEND_URL}
//                 />
//             )}

//             {showDeleteConfirmModal && (
//                 <DeleteConfirmationModal
//                     title="Delete Post"
//                     message="Are you sure you want to permanently delete this post? This action cannot be undone."
//                     onConfirm={executeDelete}
//                     onCancel={() => setShowDeleteConfirmModal(false)}
//                 />
//             )}
//         </div>
//     );
// };

// export default PostCard;



import Link from 'next/link';
import Image from 'next/image';
import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';

import CommentModal from './CommentModal';
import PostEditModal from './PostEditModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { CustomUser } from '../app/types';
import defaultUserLogo from '../app/assets/userLogo.png';

interface PostCardProps {
    post?: any;
    // handleLike: (postId: string) => Promise<void>;
    handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void>; // <--- MODIFIED
    handleShare: (postId: string) => Promise<void>;
    loading: boolean;
    // currentUser: {
    //     uid: string;
    //     mongoUserId: string;
    //     name: string;
    //     avatarUrl: string;
    // };
    currentUser: CustomUser | null;
    getIdToken: () => Promise<string | null>;
    onPostDeleted: (postId: string) => void;
    onPostUpdated: (updatedPost: any) => void;
}

type FollowStatus = 'following' | 'pending_sent' | 'pending_received' | 'not_following' | 'self';

const PostCard = ({
    post,
    handleLike,
    handleShare,
    loading,
    currentUser,
    getIdToken,
    onPostDeleted,
    onPostUpdated,
}: PostCardProps) => {
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // --- New: Audio Players for sounds ---
    const requestSentAudio = useRef<HTMLAudioElement | null>(null);
    const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);
    const requestRejectedAudio = useRef<HTMLAudioElement | null>(null); // Added this ref

    useEffect(() => {
        // Initialize audio elements once on component mount
        requestSentAudio.current = new Audio('/sounds/request_sent.mp3');
        requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
        requestRejectedAudio.current = new Audio('/sounds/request_rejected.mp3'); // Initialize rejected audio
        // Preload sounds for faster playback
        requestSentAudio.current.load();
        requestAcceptedAudio.current.load();
        requestRejectedAudio.current.load(); // Preload rejected audio
    }, []);

    const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
        if (audioElementRef.current) {
            audioElementRef.current.currentTime = 0; // Rewind to start
            audioElementRef.current.play().catch(error => {
                console.warn('Audio playback failed:', error);
                // This might happen if the user hasn't interacted with the page yet
                // or if autoplay is blocked.
            });
        }
    }, []);
    // --- End New: Audio Players ---

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOptionsDropdown(false);
            }
        };

        if (showOptionsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionsDropdown]);

    const checkFollowStatus = useCallback(async () => {
        if (!currentUser || !post?.author?._id) {
            setFollowStatus('not_following');
            return;
        }

        if (currentUser.mongoUserId === post.author._id) {
            setFollowStatus('self');
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
                setFollowStatus('not_following');
                return;
            }

            const response = await fetch(`${BACKEND_URL}/follow/follow-status/${post.author._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFollowStatus(data.status);
            } else {
                console.error('Failed to fetch follow status:', response.status, await response.text());
                setFollowStatus('not_following');
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
            setFollowStatus('not_following');
        }
    }, [currentUser, post?.author?._id, getIdToken, BACKEND_URL]);

    useEffect(() => {
        checkFollowStatus();
    }, [checkFollowStatus]);

    const handleFollowAction = async () => {
        if (followStatus === 'self' || isFollowLoading) return;
        if (!currentUser || !post?.author?._id) return;

        setIsFollowLoading(true);
        let actionToastId: string | undefined;

        try {
            const token = await getIdToken();
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            let response;
            let successMessage = '';
            let optimisticNewStatus: FollowStatus = followStatus;

            if (followStatus === 'not_following') {
                actionToastId = toast.loading('Sending follow request...');
                response = await fetch(`${BACKEND_URL}/follow/send-follow-request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ targetUserId: post.author._id }),
                });
                const data = await response.json();
                if (response.ok) {
                    successMessage = data.message || 'Follow request sent!';
                    optimisticNewStatus = data.status === 'accepted' ? 'following' : 'pending_sent';
                    if (data.status !== 'accepted') {
                        playSound(requestSentAudio);
                    } else {
                        playSound(requestAcceptedAudio);
                    }
                } else {
                    throw new Error(data.message || 'Failed to send follow request');
                }
            } else if (followStatus === 'following') {
                actionToastId = toast.loading('Unfollowing user...');
                response = await fetch(`${BACKEND_URL}/follow/unfollow/${post.author._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    successMessage = data.message || 'Unfollowed successfully!';
                    optimisticNewStatus = 'not_following';
                    // --- Play rejected sound specifically for successful unfollow ---
                    playSound(requestRejectedAudio);
                    // --- End Play rejected sound ---
                } else {
                    throw new Error(data.message || 'Failed to unfollow user');
                }
            } else if (followStatus === 'pending_received') {
                toast("This user has sent you a request. Please go to your requests page to accept or reject.");
                setIsFollowLoading(false);
                return;
            }

            if (response && response.ok) {
                toast.dismiss(actionToastId);
                toast.success(successMessage);
                setFollowStatus(optimisticNewStatus);
            }
        } catch (error: any) {
            console.error('Error with follow action:', error);
            toast.dismiss(actionToastId);
            toast.error(error.message || 'Something went wrong with the follow action.');
            // If the request itself failed (e.g., network error or server error), still play rejected
            // This is the fallback if the 'ok' condition isn't met at all.
            playSound(requestRejectedAudio);
            checkFollowStatus();
        } finally {
            setIsFollowLoading(false);
        }
    };


    const getFollowButtonConfig = () => {
        if (followStatus === 'self') {
            return null;
        }

        switch (followStatus) {
            case 'following':
                return {
                    icon: UserCheck,
                    text: 'Following',
                    className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
                    disabled: false,
                };
            case 'pending_sent':
                return {
                    icon: Clock,
                    text: 'Pending',
                    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed',
                    disabled: true,
                };
            case 'pending_received':
                return {
                    icon: Clock,
                    text: 'Pending',
                    className: 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed',
                    disabled: true,
                };
            case 'not_following':
                return {
                    icon: UserPlus,
                    text: 'Follow',
                    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
                    disabled: false,
                };
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md m-4 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Skeleton circle width={48} height={48} />
                        <div>
                            <Skeleton width={120} height={20} />
                            <Skeleton width={80} height={14} style={{ marginTop: '4px' }} />
                        </div>
                    </div>
                    <Skeleton width={20} height={20} />
                </div>

                <Skeleton count={2} height={16} style={{ marginBottom: '16px' }} />
                <Skeleton height={200} style={{ marginBottom: '16px', borderRadius: '8px' }} />

                <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton width={80} height={32} borderRadius={999} />
                        <Skeleton width={80} height={32} borderRadius={999} />
                    </div>
                    <Skeleton width={80} height={32} borderRadius={999} />
                </div>

                <hr className="my-4 border-gray-200" />
                <Skeleton height={40} className="w-full" borderRadius={999} />
            </div>
        );
    }

    const authorName = post?.author?.name || 'Unknown User';
    const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
        ? (post.author.avatarUrl.startsWith('http')
            ? post.author.avatarUrl
            : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
        : defaultUserLogo.src;

    const postTime = moment(post.createdAt).fromNow();

    const postMediaFullUrl = post?.mediaUrl
        ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
        : '';

    const currentUserAvatarUrl = currentUser?.avatarUrl || defaultUserLogo.src;
    const isCurrentUserAuthor = currentUser && currentUser.mongoUserId === post?.author?._id;
    const followButtonConfig = getFollowButtonConfig();

    const handleEditPost = () => {
        setShowEditModal(true);
        setShowOptionsDropdown(false);
    };

    const confirmDeleteHandler = () => {
        setShowDeleteConfirmModal(true);
        setShowOptionsDropdown(false);
    };

    const executeDelete = async () => {
        setShowDeleteConfirmModal(false);

        try {
            const token = await getIdToken();
            if (!token) {
                toast.error('Authentication required to delete post.');
                return;
            }

            const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete post');
            }

            toast.success('Post deleted successfully!');
            onPostDeleted(post._id);

        } catch (error: any) {
            console.error('Error deleting post:', error);
            toast.error(`Error deleting post: ${error.message}`);
        }
    };
    const postAuthorFirebaseUid = post?.author?.firebaseUid || post?.author?._id || 'unknown';
    return (
        <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <Link href={`/users/${postAuthorFirebaseUid}`} className="flex items-center space-x-3 group">
                        <img
                            src={authorAvatarUrl}
                            alt={authorName}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = defaultUserLogo.src;
                            }}
                        />
                        <div>
                            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
                            <p className="text-gray-500 text-sm">{postTime}</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    {followButtonConfig && (
                        <button
                            onClick={handleFollowAction}
                            disabled={isFollowLoading || followButtonConfig.disabled}
                            className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition-colors ${followButtonConfig.className
                                } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <followButtonConfig.icon size={16} className="mr-1" />
                            {isFollowLoading ? 'Loading...' : followButtonConfig.text}
                        </button>
                    )}

                    {isCurrentUserAuthor && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                                aria-haspopup="true"
                                aria-expanded={showOptionsDropdown}
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showOptionsDropdown && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                    <button
                                        onClick={handleEditPost}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
                                    >
                                        <Edit size={16} className="mr-2" /> Edit Post
                                    </button>
                                    <button
                                        onClick={confirmDeleteHandler}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
                                    >
                                        <Trash2 size={16} className="mr-2" /> Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-gray-700 mb-4">{post.text}</p>

            {postMediaFullUrl && (
                <div className="mb-4 rounded-lg overflow-hidden relative">
                    {post.mediaType === 'image' ? (
                        <Image
                            src={postMediaFullUrl}
                            alt="Post Image"
                            width={600}
                            height={450}
                            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                            className="rounded-lg"
                            priority
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://placehold.co/600x450/cccccc/333333?text=Image+Load+Error`;
                            }}
                        />
                    ) : (
                        <video
                            src={postMediaFullUrl}
                            controls
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                            // onError={(e) => {
                            //     console.error('Video load error:', e);
                            // }}
                        />
                    )}
                </div>
            )}

            <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleLike(post._id, post.likes, post.isLiked)}
                        className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                    >
                        <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
                        <span>{post.likes ? post.likes.length : 0}</span>
                    </button>
                    <button
                        onClick={() => setShowCommentsModal(true)}
                        className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                        <MessageSquare size={16} className="mr-1" />
                        <span>{post.comments ? post.comments.length : 0}</span>
                    </button>
                </div>
                <button
                    onClick={() => handleShare(post._id)}
                    className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                    <Share2 size={16} className="mr-1" />
                    <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
                </button>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="flex items-center space-x-3 mb-4">
                <img
                    src={currentUserAvatarUrl}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultUserLogo.src;
                    }}
                />
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Write your comment..."
                        className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                        readOnly
                        onClick={() => setShowCommentsModal(true)}
                    />
                    <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
                </div>
            </div>

            {showCommentsModal && (
                <CommentModal
                    post={post}
                    onClose={() => setShowCommentsModal(false)}
                    currentUser={currentUser}
                    getIdToken={getIdToken}
                    handleLike={handleLike}
                    handleShare={handleShare}
                    backendUrl={BACKEND_URL}
                />
            )}

            {showEditModal && (
                <PostEditModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdated={onPostUpdated}
                    getIdToken={getIdToken}
                    backendUrl={BACKEND_URL}
                />
            )}

            {showDeleteConfirmModal && (
                <DeleteConfirmationModal
                    title="Delete Post"
                    message="Are you sure you want to permanently delete this post? This action cannot be undone."
                    onConfirm={executeDelete}
                    onCancel={() => setShowDeleteConfirmModal(false)}
                />
            )}
        </div>
    );
};

export default PostCard;






// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
// import toast from 'react-hot-toast'; // Assuming toast is globally available or handled externally

// // --- Placeholder for CustomUser type ---
// interface CustomUser {
//     uid?: string;
//     mongoUserId?: string;
//     name?: string;
//     avatarUrl?: string;
// }

// interface PostCardProps {
//     post?: any;
//     handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void | string>;
//     handleShare: (postId: string) => Promise<void | string>;
//     loading: boolean; // Keep loading prop for skeleton if you re-introduce it externally
//     currentUser: CustomUser | null;
//     getIdToken: () => Promise<string | null>;
//     onPostDeleted: (postId: string) => void;
//     onPostUpdated: (updatedPost: any) => void;
// }

// type FollowStatus = 'following' | 'pending_sent' | 'pending_received' | 'not_following' | 'self';

// // --- Helper function for time formatting (replaces moment) ---
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

// // --- Default user logo and image error placeholders ---
// const DEFAULT_USER_LOGO_URL = "https://placehold.co/48x48/cccccc/333333?text=User";
// const DEFAULT_POST_IMAGE_ERROR_URL = "https://placehold.co/600x450/cccccc/333333?text=Image+Load+Error";

// const PostCard = ({
//     post,
//     handleLike,
//     handleShare,
//     loading, // Still accepting loading prop, but Skeleton is removed internally
//     currentUser,
//     getIdToken,
//     onPostDeleted,
//     onPostUpdated,
// }: PostCardProps) => {
//     const [showCommentsModal, setShowCommentsModal] = useState(false);
//     const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

//     const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
//     const [isFollowLoading, setIsFollowLoading] = useState(false);

//     const dropdownRef = useRef<HTMLDivElement>(null);
//     // Using a placeholder for BACKEND_URL
//     const BACKEND_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

//     // Removed audio players as local paths are not accessible in this environment
//     // const requestSentAudio = useRef<HTMLAudioElement | null>(null);
//     // const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);
//     // const requestRejectedAudio = useRef<HTMLAudioElement | null>(null);

//     // useEffect(() => {
//     //     requestSentAudio.current = new Audio('/sounds/request_sent.mp3');
//     //     requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
//     //     requestRejectedAudio.current = new Audio('/sounds/request_rejected.mp3');
//     //     requestSentAudio.current.load();
//     //     requestAcceptedAudio.current.load();
//     //     requestRejectedAudio.current.load();
//     // }, []);

//     // const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
//     //     if (audioElementRef.current) {
//     //         audioElementRef.current.currentTime = 0;
//     //         audioElementRef.current.play().catch(error => {
//     //             console.warn('Audio playback failed:', error);
//     //         });
//     //     }
//     // }, []);

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowOptionsDropdown(false);
//             }
//         };

//         if (showOptionsDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showOptionsDropdown]);

//     const checkFollowStatus = useCallback(async () => {
//         if (!currentUser || !post?.author?._id) {
//             setFollowStatus('not_following');
//             return;
//         }

//         if (currentUser.mongoUserId === post.author._id) {
//             setFollowStatus('self');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setFollowStatus('not_following');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/follow/follow-status/${post.author._id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setFollowStatus(data.status);
//             } else {
//                 console.error('Failed to fetch follow status:', response.status, await response.text());
//                 setFollowStatus('not_following');
//             }
//         } catch (error) {
//             console.error('Error checking follow status:', error);
//             setFollowStatus('not_following');
//         }
//     }, [currentUser, post?.author?._id, getIdToken, BACKEND_URL]);

//     useEffect(() => {
//         checkFollowStatus();
//     }, [checkFollowStatus]);

//     const handleFollowAction = async () => {
//         if (followStatus === 'self' || isFollowLoading) return;
//         if (!currentUser || !post?.author?._id) return;

//         setIsFollowLoading(true);
//         let actionToastId: string | undefined;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required');
//                 return;
//             }

//             let response;
//             let successMessage = '';
//             let optimisticNewStatus: FollowStatus = followStatus;

//             if (followStatus === 'not_following') {
//                 actionToastId = toast.loading('Sending follow request...');
//                 response = await fetch(`${BACKEND_URL}/follow/send-follow-request`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ targetUserId: post.author._id }),
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Follow request sent!';
//                     optimisticNewStatus = data.status === 'accepted' ? 'following' : 'pending_sent';
//                     // Removed playSound calls
//                 } else {
//                     throw new Error(data.message || 'Failed to send follow request');
//                 }
//             } else if (followStatus === 'following') {
//                 actionToastId = toast.loading('Unfollowing user...');
//                 response = await fetch(`${BACKEND_URL}/follow/unfollow/${post.author._id}`, {
//                     method: 'DELETE',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Unfollowed successfully!';
//                     optimisticNewStatus = 'not_following';
//                     // Removed playSound calls
//                 } else {
//                     throw new Error(data.message || 'Failed to unfollow user');
//                 }
//             } else if (followStatus === 'pending_received') {
//                 toast("This user has sent you a request. Please go to your requests page to accept or reject.");
//                 setIsFollowLoading(false);
//                 return;
//             }

//             if (response && response.ok) {
//                 toast.dismiss(actionToastId);
//                 toast.success(successMessage);
//                 setFollowStatus(optimisticNewStatus);
//             }
//         } catch (error: any) {
//             console.error('Error with follow action:', error);
//             toast.dismiss(actionToastId);
//             toast.error(error.message || 'Something went wrong with the follow action.');
//             // Removed playSound calls
//             checkFollowStatus();
//         } finally {
//             setIsFollowLoading(false);
//         }
//     };


//     const getFollowButtonConfig = () => {
//         if (followStatus === 'self') {
//             return null;
//         }

//         switch (followStatus) {
//             case 'following':
//                 return {
//                     icon: UserCheck,
//                     text: 'Following',
//                     className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
//                     disabled: false,
//                 };
//             case 'pending_sent':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'pending_received':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'not_following':
//                 return {
//                     icon: UserPlus,
//                     text: 'Follow',
//                     className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//                     disabled: false,
//                 };
//             default:
//                 return null;
//         }
//     };

//     // Removed Skeleton loading block as react-loading-skeleton is not available.
//     // If 'loading' is true, you might want to return a simple loading indicator or null.
//     if (loading) {
//         return (
//             <div className="bg-white rounded-lg shadow-md m-4 p-4 animate-pulse">
//                 <div className="flex items-center space-x-3 mb-4">
//                     <div className="w-12 h-12 rounded-full bg-gray-200"></div>
//                     <div>
//                         <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
//                         <div className="h-3 bg-gray-200 rounded w-24"></div>
//                     </div>
//                 </div>
//                 <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
//                 <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
//                 <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
//                 <div className="flex justify-between">
//                     <div className="h-8 bg-gray-200 rounded-full w-20"></div>
//                     <div className="h-8 bg-gray-200 rounded-full w-20"></div>
//                 </div>
//             </div>
//         );
//     }

//     const authorName = post?.author?.name || 'Unknown User';
//     const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
//         ? (post.author.avatarUrl.startsWith('http')
//             ? post.author.avatarUrl
//             : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
//         : DEFAULT_USER_LOGO_URL;

//     const postTime = getTimeAgo(post.createdAt); // Using custom getTimeAgo function

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
//         : '';

//     const currentUserAvatarUrl = currentUser?.avatarUrl || DEFAULT_USER_LOGO_URL;
//     const isCurrentUserAuthor = currentUser && currentUser.mongoUserId === post?.author?._id;
//     const followButtonConfig = getFollowButtonConfig();

//     const handleEditPost = () => {
//         setShowEditModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const confirmDeleteHandler = () => {
//         setShowDeleteConfirmModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const executeDelete = async () => {
//         setShowDeleteConfirmModal(false);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required to delete post.');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete post');
//             }

//             toast.success('Post deleted successfully!');
//             onPostDeleted(post._id);

//         } catch (error: any) {
//             console.error('Error deleting post:', error);
//             toast.error(`Error deleting post: ${error.message}`);
//         }
//     };
//     const postAuthorFirebaseUid = post?.author?.firebaseUid || post?.author?._id || 'unknown';
//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     {/* Replaced Next.js Link with a standard <a> tag */}
//                     <a href={`/users/${postAuthorFirebaseUid}`} className="flex items-center space-x-3 group">
//                         <img
//                             src={authorAvatarUrl}
//                             alt={authorName}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = DEFAULT_USER_LOGO_URL;
//                             }}
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
//                             <p className="text-gray-500 text-sm">{postTime}</p>
//                         </div>
//                     </a>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                     {followButtonConfig && (
//                         <button
//                             onClick={handleFollowAction}
//                             disabled={isFollowLoading || followButtonConfig.disabled}
//                             className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition-colors ${followButtonConfig.className
//                                 } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             <followButtonConfig.icon size={16} className="mr-1" />
//                             {isFollowLoading ? 'Loading...' : followButtonConfig.text}
//                         </button>
//                     )}

//                     {isCurrentUserAuthor && (
//                         <div className="relative" ref={dropdownRef}>
//                             <button
//                                 className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
//                                 onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
//                                 aria-haspopup="true"
//                                 aria-expanded={showOptionsDropdown}
//                             >
//                                 <MoreVertical size={20} />
//                             </button>

//                             {showOptionsDropdown && (
//                                 <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                                     <button
//                                         onClick={handleEditPost}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
//                                     >
//                                         <Edit size={16} className="mr-2" /> Edit Post
//                                     </button>
//                                     <button
//                                         onClick={confirmDeleteHandler}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
//                                     >
//                                         <Trash2 size={16} className="mr-2" /> Delete Post
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             {postMediaFullUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden relative">
//                     {post.mediaType === 'image' ? (
//                         // Replaced Next.js Image with a standard <img> tag
//                         <img
//                             src={postMediaFullUrl}
//                             alt="Post Image"
//                             style={{ objectFit: 'cover', width: '100%', height: 'auto', maxHeight: '450px' }}
//                             className="rounded-lg"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = DEFAULT_POST_IMAGE_ERROR_URL;
//                             }}
//                         />
//                     ) : (
//                         <video
//                             src={postMediaFullUrl}
//                             controls
//                             className="w-full h-auto max-h-96 object-contain rounded-lg"
//                             onError={(e) => {
//                                 console.error('Video load error:', e);
//                             }}
//                         />
//                     )}
//                 </div>
//             )}

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id, post.likes, post.isLiked)}
//                         className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes ? post.likes.length : 0}</span>
//                     </button>
//                     <button
//                         onClick={() => setShowCommentsModal(true)}
//                         className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                     >
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.comments ? post.comments.length : 0}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id)}
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={currentUserAvatarUrl}
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = DEFAULT_USER_LOGO_URL;
//                     }}
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment..."
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//                         readOnly
//                         onClick={() => setShowCommentsModal(true)}
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             {/* Placeholder for modals - in a real app, these would be separate components */}
//             {showCommentsModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg">
//                         <h2 className="text-xl font-bold mb-4">Comments Modal (Placeholder)</h2>
//                         <p>This is where comments would be displayed and added.</p>
//                         <button onClick={() => setShowCommentsModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
//                     </div>
//                 </div>
//             )}
//             {showEditModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg">
//                         <h2 className="text-xl font-bold mb-4">Edit Post Modal (Placeholder)</h2>
//                         <p>This is where you would edit the post content.</p>
//                         <button onClick={() => setShowEditModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
//                     </div>
//                 </div>
//             )}
//             {showDeleteConfirmModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg">
//                         <h2 className="text-xl font-bold mb-4">Delete Confirmation (Placeholder)</h2>
//                         <p>Are you sure you want to delete this post?</p>
//                         <div className="flex justify-end space-x-2 mt-4">
//                             <button onClick={executeDelete} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
//                             <button onClick={() => setShowDeleteConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PostCard;




// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
// import toast from 'react-hot-toast'; // Assuming toast is globally available or handled externally

// // --- Placeholder for CustomUser type ---
// interface CustomUser {
//     uid?: string;
//     mongoUserId?: string;
//     name?: string;
//     avatarUrl?: string;
// }

// interface PostCardProps {
//     post?: any;
//     handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void | string>;
//     handleShare: (postId: string) => Promise<void | string>;
//     loading: boolean; // Keep loading prop for skeleton if you re-introduce it externally
//     currentUser: CustomUser | null;
//     getIdToken: () => Promise<string | null>;
//     onPostDeleted: (postId: string) => void;
//     onPostUpdated: (updatedPost: any) => void;
// }

// type FollowStatus = 'following' | 'pending_sent' | 'pending_received' | 'not_following' | 'self';

// // --- Helper function for time formatting (replaces moment) ---
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

// // --- Default user logo and image error placeholders ---
// const DEFAULT_USER_LOGO_URL = "https://placehold.co/48x48/cccccc/333333?text=User";
// const DEFAULT_POST_IMAGE_ERROR_URL = "https://placehold.co/600x450/cccccc/333333?text=Image+Load+Error";
// // Added a specific placeholder for video errors
// const DEFAULT_POST_VIDEO_ERROR_URL = "https://placehold.co/600x450/ff0000/ffffff?text=Video+Load+Error";


// const PostCard = ({
//     post,
//     handleLike,
//     handleShare,
//     loading, // Still accepting loading prop, but Skeleton is removed internally
//     currentUser,
//     getIdToken,
//     onPostDeleted,
//     onPostUpdated,
// }: PostCardProps) => {
//     const [showCommentsModal, setShowCommentsModal] = useState(false);
//     const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
//     const [videoError, setVideoError] = useState(false); // New state to track video loading errors

//     const [followStatus, setFollowStatus] = useState<FollowStatus>('not_following');
//     const [isFollowLoading, setIsFollowLoading] = useState(false);

//     const dropdownRef = useRef<HTMLDivElement>(null);
//     // Using a placeholder for BACKEND_URL
//     const BACKEND_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

//     // Removed audio players as local paths are not accessible in this environment
//     // const requestSentAudio = useRef<HTMLAudioElement | null>(null);
//     // const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);
//     // const requestRejectedAudio = useRef<HTMLAudioElement | null>(null);

//     // useEffect(() => {
//     //     requestSentAudio.current = new Audio('/sounds/request_sent.mp3');
//     //     requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
//     //     requestRejectedAudio.current = new Audio('/sounds/request_rejected.mp3');
//     //     requestSentAudio.current.load();
//     //     requestAcceptedAudio.current.load();
//     //     requestRejectedAudio.current.load();
//     // }, []);

//     // const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
//     //     if (audioElementRef.current) {
//     //         audioElementRef.current.currentTime = 0;
//     //         audioElementRef.current.play().catch(error => {
//     //             console.warn('Audio playback failed:', error);
//     //         });
//     //     }
//     // }, []);

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setShowOptionsDropdown(false);
//             }
//         };

//         if (showOptionsDropdown) {
//             document.addEventListener('mousedown', handleClickOutside);
//         } else {
//             document.removeEventListener('mousedown', handleClickOutside);
//         }

//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showOptionsDropdown]);

//     const checkFollowStatus = useCallback(async () => {
//         if (!currentUser || !post?.author?._id) {
//             setFollowStatus('not_following');
//             return;
//         }

//         if (currentUser.mongoUserId === post.author._id) {
//             setFollowStatus('self');
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setFollowStatus('not_following');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/follow/follow-status/${post.author._id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setFollowStatus(data.status);
//             } else {
//                 console.error('Failed to fetch follow status:', response.status, await response.text());
//                 setFollowStatus('not_following');
//             }
//         } catch (error) {
//             console.error('Error checking follow status:', error);
//             setFollowStatus('not_following');
//         }
//     }, [currentUser, post?.author?._id, getIdToken, BACKEND_URL]);

//     useEffect(() => {
//         checkFollowStatus();
//     }, [checkFollowStatus]);

//     const handleFollowAction = async () => {
//         if (followStatus === 'self' || isFollowLoading) return;
//         if (!currentUser || !post?.author?._id) return;

//         setIsFollowLoading(true);
//         let actionToastId: string | undefined;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required');
//                 return;
//             }

//             let response;
//             let successMessage = '';
//             let optimisticNewStatus: FollowStatus = followStatus;

//             if (followStatus === 'not_following') {
//                 actionToastId = toast.loading('Sending follow request...');
//                 response = await fetch(`${BACKEND_URL}/follow/send-follow-request`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({ targetUserId: post.author._id }),
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Follow request sent!';
//                     optimisticNewStatus = data.status === 'accepted' ? 'following' : 'pending_sent';
//                     // Removed playSound calls
//                 } else {
//                     throw new Error(data.message || 'Failed to send follow request');
//                 }
//             } else if (followStatus === 'following') {
//                 actionToastId = toast.loading('Unfollowing user...');
//                 response = await fetch(`${BACKEND_URL}/follow/unfollow/${post.author._id}`, {
//                     method: 'DELETE',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });
//                 const data = await response.json();
//                 if (response.ok) {
//                     successMessage = data.message || 'Unfollowed successfully!';
//                     optimisticNewStatus = 'not_following';
//                     // Removed playSound calls
//                 } else {
//                     throw new Error(data.message || 'Failed to unfollow user');
//                 }
//             } else if (followStatus === 'pending_received') {
//                 toast("This user has sent you a request. Please go to your requests page to accept or reject.");
//                 setIsFollowLoading(false);
//                 return;
//             }

//             if (response && response.ok) {
//                 toast.dismiss(actionToastId);
//                 toast.success(successMessage);
//                 setFollowStatus(optimisticNewStatus);
//             }
//         } catch (error: any) {
//             console.error('Error with follow action:', error);
//             toast.dismiss(actionToastId);
//             toast.error(error.message || 'Something went wrong with the follow action.');
//             // Removed playSound calls
//             checkFollowStatus();
//         } finally {
//             setIsFollowLoading(false);
//         }
//     };


//     const getFollowButtonConfig = () => {
//         if (followStatus === 'self') {
//             return null;
//         }

//         switch (followStatus) {
//             case 'following':
//                 return {
//                     icon: UserCheck,
//                     text: 'Following',
//                     className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
//                     disabled: false,
//                 };
//             case 'pending_sent':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-yellow-100 text-yellow-700 border-yellow-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'pending_received':
//                 return {
//                     icon: Clock,
//                     text: 'Pending',
//                     className: 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed',
//                     disabled: true,
//                 };
//             case 'not_following':
//                 return {
//                     icon: UserPlus,
//                     text: 'Follow',
//                     className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
//                     disabled: false,
//                 };
//             default:
//                 return null;
//         }
//     };

//     // Removed Skeleton loading block as react-loading-skeleton is not available.
//     // If 'loading' is true, you might want to return a simple loading indicator or null.
//     if (loading) {
//         return (
//             <div className="bg-white rounded-lg shadow-md m-4 p-4 animate-pulse">
//                 <div className="flex items-center space-x-3 mb-4">
//                     <div className="w-12 h-12 rounded-full bg-gray-200"></div>
//                     <div>
//                         <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
//                         <div className="h-3 bg-gray-200 rounded w-24"></div>
//                     </div>
//                 </div>
//                 <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
//                 <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
//                 <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
//                 <div className="flex justify-between">
//                     <div className="h-8 bg-gray-200 rounded-full w-20"></div>
//                     <div className="h-8 bg-gray-200 rounded-full w-20"></div>
//                 </div>
//             </div>
//         );
//     }

//     const authorName = post?.author?.name || 'Unknown User';
//     const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
//         ? (post.author.avatarUrl.startsWith('http')
//             ? post.author.avatarUrl
//             : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
//         : DEFAULT_USER_LOGO_URL;

//     const postTime = getTimeAgo(post.createdAt); // Using custom getTimeAgo function

//     const postMediaFullUrl = post?.mediaUrl
//         ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
//         : '';

//     const currentUserAvatarUrl = currentUser?.avatarUrl || DEFAULT_USER_LOGO_URL;
//     const isCurrentUserAuthor = currentUser && currentUser.mongoUserId === post?.author?._id;
//     const followButtonConfig = getFollowButtonConfig();

//     const handleEditPost = () => {
//         setShowEditModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const confirmDeleteHandler = () => {
//         setShowDeleteConfirmModal(true);
//         setShowOptionsDropdown(false);
//     };

//     const executeDelete = async () => {
//         setShowDeleteConfirmModal(false);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.error('Authentication required to delete post.');
//                 return;
//             }

//             const response = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete post');
//             }

//             toast.success('Post deleted successfully!');
//             onPostDeleted(post._id);

//         } catch (error: any) {
//             console.error('Error deleting post:', error);
//             toast.error(`Error deleting post: ${error.message}`);
//         }
//     };

//     // Handler for video error
//     const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
//         console.error('Video load error details:', e.nativeEvent);
//         setVideoError(true); // Set state to true to show fallback
//     };

//     const postAuthorFirebaseUid = post?.author?.firebaseUid || post?.author?._id || 'unknown';
//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     {/* Replaced Next.js Link with a standard <a> tag */}
//                     <a href={`/users/${postAuthorFirebaseUid}`} className="flex items-center space-x-3 group">
//                         <img
//                             src={authorAvatarUrl}
//                             alt={authorName}
//                             className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = DEFAULT_USER_LOGO_URL;
//                             }}
//                         />
//                         <div>
//                             <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
//                             <p className="text-gray-500 text-sm">{postTime}</p>
//                         </div>
//                     </a>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                     {followButtonConfig && (
//                         <button
//                             onClick={handleFollowAction}
//                             disabled={isFollowLoading || followButtonConfig.disabled}
//                             className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition-colors ${followButtonConfig.className
//                                 } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             <followButtonConfig.icon size={16} className="mr-1" />
//                             {isFollowLoading ? 'Loading...' : followButtonConfig.text}
//                         </button>
//                     )}

//                     {isCurrentUserAuthor && (
//                         <div className="relative" ref={dropdownRef}>
//                             <button
//                                 className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
//                                 onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
//                                 aria-haspopup="true"
//                                 aria-expanded={showOptionsDropdown}
//                             >
//                                 <MoreVertical size={20} />
//                             </button>

//                             {showOptionsDropdown && (
//                                 <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                                     <button
//                                         onClick={handleEditPost}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-t-md cursor-pointer"
//                                     >
//                                         <Edit size={16} className="mr-2" /> Edit Post
//                                     </button>
//                                     <button
//                                         onClick={confirmDeleteHandler}
//                                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md cursor-pointer"
//                                     >
//                                         <Trash2 size={16} className="mr-2" /> Delete Post
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             {postMediaFullUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden relative">
//                     {post.mediaType === 'image' ? (
//                         // Replaced Next.js Image with a standard <img> tag
//                         <img
//                             src={postMediaFullUrl}
//                             alt="Post Image"
//                             style={{ objectFit: 'cover', width: '100%', height: 'auto', maxHeight: '450px' }}
//                             className="rounded-lg"
//                             onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = DEFAULT_POST_IMAGE_ERROR_URL;
//                             }}
//                         />
//                     ) : (
//                         // Conditional rendering for video or video error fallback
//                         videoError ? (
//                             <img
//                                 src={DEFAULT_POST_VIDEO_ERROR_URL}
//                                 alt="Video Load Error"
//                                 style={{ objectFit: 'cover', width: '100%', height: 'auto', maxHeight: '450px' }}
//                                 className="rounded-lg"
//                             />
//                         ) : (
//                             <video
//                                 src={postMediaFullUrl}
//                                 controls
//                                 className="w-full h-auto max-h-96 object-contain rounded-lg"
//                                 onError={handleVideoError} // Use the new error handler
//                             />
//                         )
//                     )}
//                 </div>
//             )}

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id, post.likes, post.isLiked)}
//                         className={`flex items-center p-2 rounded-full cursor-pointer transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes ? post.likes.length : 0}</span>
//                     </button>
//                     <button
//                         onClick={() => setShowCommentsModal(true)}
//                         className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                     >
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.comments ? post.comments.length : 0}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id)}
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={currentUserAvatarUrl}
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = DEFAULT_USER_LOGO_URL;
//                     }}
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment..."
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
//                         readOnly
//                         onClick={() => setShowCommentsModal(true)}
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             {/* Placeholder for modals - in a real app, these would be separate components */}
//             {showCommentsModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg">
//                         <h2 className="text-xl font-bold mb-4">Comments Modal (Placeholder)</h2>
//                         <p>This is where comments would be displayed and added.</p>
//                         <button onClick={() => setShowCommentsModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
//                     </div>
//                 </div>
//             )}
//             {showEditModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg">
//                         <h2 className="text-xl font-bold mb-4">Edit Post Modal (Placeholder)</h2>
//                         <p>This is where you would edit the post content.</p>
//                         <button onClick={() => setShowEditModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
//                     </div>
//                 </div>
//             )}
//             {showDeleteConfirmModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg">
//                         <h2 className="text-xl font-bold mb-4">Delete Confirmation (Placeholder)</h2>
//                         <p>Are you sure you want to delete this post?</p>
//                         <div className="flex justify-end space-x-2 mt-4">
//                             <button onClick={executeDelete} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
//                             <button onClick={() => setShowDeleteConfirmModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PostCard;
