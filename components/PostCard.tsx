'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThumbsUp, MessageSquare, Share2, Smile, Edit, Trash2, MoreVertical } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';

import CommentModal from './CommentModal';
import PostEditModal from './PostEditModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Corrected path for the default logo, assuming it's in public/assets
// If '../app/assets/userLogo.png' is correct, keep it as is.
// Otherwise, adjust based on your project structure:
// import defaultUserLogo from '../../public/assets/userLogo.png'; 
import defaultUserLogo from '../app/assets/userLogo.png'; // Keeping your original path


interface PostCardProps {
    post?: any;
    handleLike: (postId: string) => Promise<void>; // Simplified like handler, no longer passes currentLikes/isLiked
    handleShare: (postId: string) => Promise<void>;
    loading: boolean;
    currentUser: any; // Firebase user object (now includes customAvatarUrl)
    getIdToken: () => Promise<string | null>;
    onPostDeleted: (postId: string) => void;
    onPostUpdated: (updatedPost: any) => void;
    // Removed updatedUserIcon and setUpdatedUserIcon props - no longer needed here
}

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

    const dropdownRef = useRef<HTMLDivElement>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

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

    // --- SIMPLIFIED LOGIC FOR AUTHOR AVATAR ---
    // Use post.author.avatarUrl (from backend) or fallback to frontend default
    const authorAvatarUrl = post?.author?.avatarUrl && post.author.avatarUrl.trim() !== ''
        ? (post.author.avatarUrl.startsWith('http')
            ? post.author.avatarUrl
            : `${BACKEND_URL.replace('/api', '')}${post.author.avatarUrl}`)
        : defaultUserLogo.src;


    const authorFirebaseUid = post?.author?.firebaseUid || '#';
    const postTime = moment(post.createdAt).fromNow();

    const postMediaFullUrl = post?.mediaUrl
        ? (post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BACKEND_URL.replace('/api', '')}${post.mediaUrl}`)
        : '';

    // --- SIMPLIFIED LOGIC FOR CURRENT USER AVATAR ---
    // Use currentUser.customAvatarUrl (from AuthProvider) or fallback to frontend default
    const currentUserAvatarUrl = currentUser?.avatarUrl || defaultUserLogo.src;


    const isCurrentUserAuthor = currentUser && currentUser.uid === post?.author?.firebaseUid;

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

    return (
        <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <Link href={`/users/${authorFirebaseUid}`} className="flex items-center space-x-3 group">
                        <img
                            src={authorAvatarUrl} // Use the resolved authorAvatarUrl
                            alt={authorName}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{authorName}</p>
                            <p className="text-gray-500 text-sm">{postTime}</p>
                        </div>
                    </Link>
                </div>
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

            <p className="text-gray-700 mb-4">{post.text}</p>

            {postMediaFullUrl && (
                <div className="mb-4 rounded-lg overflow-hidden relative">
                    {post.mediaType === 'image' ? (
                        <>
                            <Image
                                src={postMediaFullUrl}
                                alt="Post Image"
                                width={600}
                                height={450}
                                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                                className="rounded-lg"
                                priority
                            />
                        </>
                    ) : (
                        <video
                            src={postMediaFullUrl}
                            controls
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                        />
                    )}
                </div>
            )}

            <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleLike(post._id)} // Simplified: no longer passing currentLikes/isLiked
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
                    src={currentUserAvatarUrl} // Use the resolved currentUserAvatarUrl
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
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
                    handleLike={handleLike} // Pass the simplified handleLike
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