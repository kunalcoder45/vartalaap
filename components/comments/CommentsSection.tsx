
'use client';

import React, { useRef } from 'react';
import { SendHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Define types, keeping them for clarity even if not all fields are directly used
interface Comment {
    _id: string;
    text: string;
    createdAt: string;
    // author: CommentAuthor; // We won't use this for display or link directly
}

interface PostAuthor {
    _id: string;
    name: string;
    avatarUrl?: string;
    firebaseUid?: string; // This is what we'll primarily use for linking
}

interface Post {
    _id: string;
    author: PostAuthor; // We MUST have post.author for this approach
    // ... other post properties if needed
}

interface CommentsSectionProps {
    comments: Comment[];
    loadingComments: boolean;
    errorComments: string | null;
    currentUser: any;
    currentUserAvatar: string;
    newCommentText: string;
    setNewCommentText: (text: string) => void;
    handlePostComment: () => Promise<void>;
    formatDate: (isoString: string) => string;
    post: Post; // Ensure post prop is passed with author details
}

export default function CommentsSection({
    comments,
    loadingComments,
    errorComments,
    currentUser,
    currentUserAvatar,
    newCommentText,
    setNewCommentText,
    handlePostComment,
    formatDate,
    post, // Receive the post prop
}: CommentsSectionProps) {
    const commentsListRef = useRef<HTMLDivElement>(null);

    // Get the post author's details once, to use for all comments
    const postAuthorName = post?.author?.name || 'Unknown User';
    const postAuthorAvatar = post?.author?.avatarUrl || `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatars/userLogo.png`;
    const postAuthorFirebaseUid = post?.author?.firebaseUid || post?.author?._id || 'unknown'; // Fallback for the link

    return (
        <div className="w-full md:w-1/2 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                    Comments ({comments.length})
                </h3>
            </div>

            <div ref={commentsListRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                {loadingComments ? (
                    <div className="text-center text-gray-500">Loading comments...</div>
                ) : errorComments ? (
                    <div className="text-center text-red-500">
                        <p>Error loading comments:</p>
                        <p className="text-sm">{errorComments}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                            Retry
                        </button>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500">No comments yet. Be the first to comment!</div>
                ) : (
                    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((comment) => {
                        return (
                            <div
                                key={comment._id}
                                className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm relative"
                            >
                                {/* Use postAuthorFirebaseUid for the link */}
                                <Link href={`/users/${postAuthorFirebaseUid}`} className="flex items-start space-x-3 group">
                                    {/* Use postAuthorAvatar for the avatar */}
                                    <Image
                                        src={postAuthorAvatar}
                                        alt={postAuthorName}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover mt-1 aspect-square border border-gray-200 group-hover:scale-105 transition-transform"
                                        unoptimized={postAuthorAvatar.startsWith('data:') || postAuthorAvatar.startsWith('http')}
                                    />
                                    <div className="flex-grow">
                                        {/* Use postAuthorName for the name */}
                                        <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {postAuthorName}
                                        </p>
                                        <p className="text-gray-700 text-sm break-words pr-12">{comment.text}</p>
                                    </div>
                                </Link>
                                <div className="absolute bottom-2 right-3 text-gray-500 text-xs">
                                    {formatDate(comment.createdAt)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                    <Image
                        src={currentUserAvatar}
                        alt="Your Avatar"
                        width={40}
                        height={40}
                        className="rounded-full object-cover aspect-square border border-gray-200"
                        unoptimized={currentUserAvatar.startsWith('data:') || currentUserAvatar.startsWith('http')}
                    />
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder={currentUser ? "Write your comment..." : "Log in to comment"}
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && newCommentText.trim() && currentUser) {
                                    handlePostComment();
                                }
                            }}
                            className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                            disabled={!currentUser}
                        />
                        <button
                            onClick={handlePostComment}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed bg-blue-200 disabled:bg-transparent p-2.5 rounded-3xl cursor-pointer"
                            disabled={!currentUser || !newCommentText.trim()}
                        >
                            <SendHorizontal size={20} />
                        </button>
                    </div>
                </div>
                {!currentUser && (
                    <p className="text-red-500 text-xs mt-2 text-center">Please log in to add comments.</p>
                )}
            </div>
        </div>
    );
}
