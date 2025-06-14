// client/app/components/comments/PostContent.tsx
'use client'; // Ensure this is present if it's a client component

import Image from 'next/image'; // Import Image component
import { useRouter } from 'next/navigation';
import { ThumbsUp, Share2, X } from 'lucide-react';

// You might want to define a more specific Post type here if not already done globally
interface PostContentProps {
  post: any;
  postAuthorAvatar: string; // This should be the full URL
  postAuthorName: string;
  postTime: string;
  postMediaFullUrl: string; // This should be the full URL
  onClose: () => void;
  handleLike: (postId: string, currentLikes: number, currentIsLiked: boolean) => Promise<void>;
  handleShare: (postId: string) => Promise<void>;
}

export default function PostContent({
  post,
  postAuthorAvatar,
  postAuthorName,
  postTime,
  postMediaFullUrl,
  onClose,
  handleLike,
  handleShare,
}: PostContentProps) {
  const router = useRouter();

  return (
    <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto border-r border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center space-x-3 cursor-pointer hover:underline"
          // Navigate to profile using the author's UID from the post object
          onClick={() => router.push(`/profile/${post.author?.firebaseUid || post.author._id}`)}
        >
          {/* Use Next.js Image component for post author's avatar */}
          <Image
            src={postAuthorAvatar}
            alt={postAuthorName}
            width={40} // Fixed width
            height={42} // Fixed height
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
            // Unoptimize if the source is an external URL (e.g., Firebase) or a data URI
            unoptimized={postAuthorAvatar.startsWith('data:') || postAuthorAvatar.startsWith('http')}
          />
          <div>
            <p className="font-semibold text-gray-800">{postAuthorName}</p>
            <p className="text-gray-500 text-sm">{postTime}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 cursor-pointer hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={24} />
        </button>
      </div>

      <p className="text-gray-700 mb-4">{post.text}</p>

      {postMediaFullUrl && (
        <div className="mb-4 rounded-lg overflow-hidden text-center flex justify-center items-center h-auto max-h-[400px] w-full"> {/* Modified className here */}
          {post.mediaType === 'image' ? (
            <Image
              src={postMediaFullUrl}
              alt="Post Image"
              width={600}
              height={600}
              layout="responsive" // Keep layout responsive for now, or consider 'fill' for Next.js 13+
              className="rounded-lg object-contain mx-auto max-h-[400px] w-auto" // Adjusted for centering
              priority
              unoptimized={postMediaFullUrl.startsWith('data:') || postMediaFullUrl.startsWith('http')}
            />
          ) : (
            <video
              src={postMediaFullUrl}
              controls
              className="w-full h-auto max-h-[400px] object-contain rounded-lg mx-auto" // Adjusted for centering
            />
          )}
        </div>
      )}

      {post.location && (
        <p className="text-sm text-gray-600 mb-2">📍 {post.location}</p>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleLike(post._id, post.likes ? post.likes.length : 0, post.isLiked)}
          className={`flex items-center p-2 rounded-full transition-colors ${post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
        >
          <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
          <span>{post.likes ? post.likes.length : 0}</span>
        </button>

        <button
          onClick={() => handleShare(post._id)}
          className="flex items-center p-2 rounded-full hover:bg-gray-100"
        >
          <Share2 size={16} className="mr-1" />
          <span>{post.sharesBy ? post.sharesBy.length : 0}</span>
        </button>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags.map((tag: string, i: number) => ( // Added type for tag and i
            <span
              key={i}
              className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-1"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}