import React, { useRef } from 'react';
import { SendHorizontal } from 'lucide-react';

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
  backendUrl,
}) {
  const commentsListRef = useRef(null);

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
          comments.map((comment) => {
            const commentAuthorAvatar = comment.authorAvatarUrl
              ? (comment.authorAvatarUrl.startsWith('http') ||
                comment.authorAvatarUrl.startsWith('data:'))
                ? comment.authorAvatarUrl
                : `${backendUrl}${comment.authorAvatarUrl.startsWith('/') ? '' : '/'}${comment.authorAvatarUrl}`
              : `${backendUrl}/avatars/userLogo.png`;

            return (
              <div
                key={comment._id}
                className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm"
              >
                <img
                  src={commentAuthorAvatar}
                  alt={comment.authorName || 'Unknown User'}
                  className="w-8 h-8 rounded-full object-cover mt-1 border border-gray-200"
                />
                <div>
                  <p className="font-semibold text-gray-800">{comment.authorName || 'Unknown User'}</p>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(comment.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <img
            src={currentUserAvatar}
            alt="Your Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={currentUser ? "Write your comment..." : "Log in to comment"}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
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
