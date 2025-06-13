import PostContent from './PostContent';
import CommentsSection from './CommentsSection';

export default function CommentModal(props) {
  const {
    post,
    postAuthorAvatar,
    postAuthorName,
    postTime,
    postMediaFullUrl,
    onClose,
    handleLike,
    handleShare,
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
  } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-lg shadow-xl flex flex-col md:flex-row w-full max-w-4xl h-[90vh] md:h-[80vh] overflow-hidden transform transition-transform duration-300 ease-out scale-95 opacity-0 animate-scale-in">
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
}
