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
    backendUrl: string; // The full backend API URL, e.g., 'http://localhost:5001/api'
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