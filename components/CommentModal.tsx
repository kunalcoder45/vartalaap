'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import toast from 'react-hot-toast';
import PostContent from './comments/PostContent'; // Assuming this path is correct
import CommentsSection from './comments/CommentsSection'; // Assuming this path is correct

// Define the props interface for CommentModal
interface CommentModalProps {
    post: any;
    onClose: () => void;
    currentUser: any;
    getIdToken: () => Promise<string | null>;
    handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void>;
    handleShare: (postId: string) => Promise<void>;
    backendUrl: string;
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

    // Use the backendUrl prop - it already includes /api
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
                console.log(`Fetching comments from: ${apiBaseUrl}/posts/${post._id}/comments`);

                const res = await fetch(`${apiBaseUrl}/posts/${post._id}/comments`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add authorization header if needed
                        ...(currentUser && await getIdToken() && {
                            'Authorization': `Bearer ${await getIdToken()}`
                        })
                    },
                });

                console.log('Response status:', res.status, res.statusText);

                if (!res.ok) {
                    let errorMessage = `Failed to fetch comments (${res.status})`;

                    try {
                        // Clone the response so we can try multiple parsing methods
                        const errorData = await res.clone().json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                        console.error('Server error response:', errorData);
                    } catch (parseError) {
                        try {
                            const errorText = await res.clone().text();
                            errorMessage = errorText || errorMessage;
                            console.error('Server error text:', errorText);
                        } catch (textError) {
                            console.error('Could not parse error response:', textError);
                        }
                    }

                    throw new Error(errorMessage);
                }

                const data = await res.json();
                console.log('Comments fetched successfully:', data);

                // Ensure data is an array
                if (Array.isArray(data)) {
                    setComments(data);
                } else if (data.comments && Array.isArray(data.comments)) {
                    setComments(data.comments);
                } else {
                    console.warn('Unexpected data format:', data);
                    setComments([]);
                }

            } catch (err: any) {
                console.error('Error fetching comments:', err);

                // Provide more specific error messages
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
    }, [post?._id, backendUrl, currentUser, getIdToken]); // Added getIdToken to dependencies

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

            console.log('Response status:', res.status);
            const resText = await res.text();
            console.log('Response text:', resText);

            if (!res.ok) {
                throw new Error(`Failed to post comment (${res.status}): ${resText}`);
            }

            const newComment = JSON.parse(resText);

            setComments((prev) => [...prev, newComment]);
            setNewCommentText('');

            // Success toast
            toast.success('Comment posted successfully!');
        } catch (error: any) {
            console.error('Error posting comment:', error);
            toast.error(`Failed to post comment: ${error.message || 'Unknown error'}`);
        }
    };


    const formatDate = (isoString: string) => moment(isoString).format('MMM D, h:mm A');

    const postAuthorAvatar =
        post?.author?.avatarUrl
            ? post.author.avatarUrl.startsWith('http') || post.author.avatarUrl.startsWith('data:')
                ? post.author.avatarUrl
                : `${backendUrl}${post.author.avatarUrl.startsWith('/') ? '' : '/'}${post.author.avatarUrl}`
            : `${backendUrl}/avatars/userLogo.png`;

    const postAuthorName = post?.author?.name || 'Unknown User';
    const postTime = moment(post.createdAt).fromNow();
    const postMediaFullUrl = post?.mediaUrl ? `${post.mediaUrl}` : ''; // Ensure correct construction, backendUrl isn't always needed for media
    const currentUserAvatar = currentUser?.photoURL || `${backendUrl}/avatars/userLogo.png`;

    // Debug info - remove in production
    console.log('CommentModal Debug Info:', {
        postId: post?._id,
        backendUrl,
        apiBaseUrl,
        currentUser: !!currentUser,
        commentsCount: comments.length
    });

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
                    backendUrl={backendUrl}
                />

            </div>
        </div>
    );
};

export default CommentModal;