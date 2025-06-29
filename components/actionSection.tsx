// components/actionSection.tsx
'use client';

import { Video, ImageIcon, Smile, SendHorizontal, X } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import LoadingBar from 'react-top-loading-bar';
import Link from 'next/link';
import { useState, useRef } from 'react';
// import { usePathname } from 'next/navigation'; // This import is not used, can be removed

import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';
const BACKEND_URL = API_BASE_URL.replace('/api', ''); // Define BACKEND_URL for cleaner avatar paths

const ActionSection = () => { // Removed `post` prop as it's not needed here
  const { user, getIdToken } = useAuth();
  const [postText, setPostText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const loadingBarRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Determine the current user's avatar source
  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith('http') // Check if it's an absolute URL
      ? user.avatarUrl
      : `${BACKEND_URL}${user.avatarUrl}` // Prepend BACKEND_URL for relative paths
    : `${BACKEND_URL}/avatars/userLogo.png`; // Fallback to local default
  // Function to clear selected file and preview
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error('File size exceeds 25MB limit.');
        handleRemoveFile();
        return;
      }
      setSelectedFile(file);
      setFileType(type);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      handleRemoveFile();
    }
  };

  const handlePost = async () => {
    if (!user) {
      toast.error('Please log in to create a post.');
      return;
    }
    if (!postText.trim() && !selectedFile) {
      toast.error('Post cannot be empty!');
      return;
    }

    setIsPosting(true);
    loadingBarRef.current?.continuousStart();

    try {
      const token = await getIdToken();
      if (!token) {
        toast.error('Authentication token not available. Please log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('text', postText.trim());
      if (selectedFile) {
        formData.append('media', selectedFile);
        formData.append('mediaType', fileType || '');
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Server sent non-JSON response or empty body.',
        }));
        throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
      }

      const newPost = await response.json();
      toast.success('Post created successfully!');
      console.log('New post:', newPost);

      setPostText('');
      handleRemoveFile();

      // TODO: trigger refresh of MainContent if needed

    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsPosting(false);
      loadingBarRef.current?.complete();
    }
  };

  return (
    <>
      <LoadingBar color="#2563eb" ref={loadingBarRef} />
      <div className="flex-grow p-0 pt-0 space-y-6 mb-0 overflow-y-auto max-w-2xl mx-auto">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pt-0 space-y-6 mb-0 max-w-2xl mx-auto">
            <div className="bg-white md:p-5 p-2 rounded-lg shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <Link href="/profile" className="flex-shrink-0">
                  <img
                    src={avatarSrc} // Correctly using avatarSrc for the current user
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover border border-gray-300 cursor-pointer"
                    title="View your profile"
                  />
                </Link>
                <textarea
                  placeholder="What's on your mind?"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={3}
                  className="flex-grow md:p-3 p-2 md:h-auto h-15 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                />
              </div>

              {filePreview && (
                <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-200">
                  {fileType === 'image' ? (
                    <img src={filePreview} alt="Selected Preview" className="w-full h-auto max-h-96 object-contain" />
                  ) : (
                    <video src={filePreview} controls className="w-full h-auto max-h-96 object-contain" />
                  )}
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
                    aria-label="Remove file"
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-around text-gray-600 flex-wrap md:gap-2 gap-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="hidden"
                  id="image-upload-input"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center md:p-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedFile !== null && fileType !== 'image'}
                  type="button"
                >
                  <ImageIcon size={20} className="text-green-500 mr-2" />
                  <span>Photo</span>
                </button>

                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={(e) => handleFileChange(e, 'video')}
                  className="hidden"
                  id="video-upload-input"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedFile !== null && fileType !== 'video'}
                  type="button"
                >
                  <Video size={20} className="text-purple-500 mr-2" />
                  <span>Video</span>
                </button>
                
                {/* Uncomment if you want to add "Go Live" and "Feeling" buttons later */}

                {/* <button
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70"
                  type="button"
                  disabled
                >
                  {/* <Video size={20} className="text-red-500 mr-2" />
                  <span>Go Live</span>
                </button>

                <button
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70"
                  type="button"
                  disabled
                >
                  <Smile size={20} className="text-yellow-500 mr-2" />
                  <span>Feeling</span>
                </button> */}

                <button
                  onClick={handlePost}
                  disabled={isPosting || (!postText.trim() && !selectedFile)}
                  className="flex items-center p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {isPosting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    <>
                      <SendHorizontal size={20} className="mr-2" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActionSection;