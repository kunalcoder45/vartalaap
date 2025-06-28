// // app/userPost/page.jsx
// 'use client';

// import { useState, useRef } from 'react';
// import { Video, ImageIcon, SendHorizontal, X } from 'lucide-react';
// import { useAuth } from '../../components/AuthProvider'; // Adjust path if AuthProvider is elsewhere
// import toast from 'react-hot-toast'; // For notifications

// // Your backend API base URL
// // Make sure this matches your Express server's address
// const API_BASE_URL = 'http://localhost:5000/api'; 

// const CreatePostPage = () => {
//     const { user, getIdToken } = useAuth(); // Assuming useAuth provides getIdToken
//     const [postText, setPostText] = useState('');
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [filePreview, setFilePreview] = useState(null);
//     const [fileType, setFileType] = useState(null); // 'image' or 'video'
//     const [isPosting, setIsPosting] = useState(false);

//     const imageInputRef = useRef(null);
//     const videoInputRef = useRef(null);

//     const handleFileChange = (event, type) => {
//         const file = event.target.files[0];
//         if (file) {
//             // Basic validation for file size (e.g., max 25MB)
//             if (file.size > 25 * 1024 * 1024) { // 25 MB
//                 toast.error('File size exceeds 25MB limit.');
//                 handleRemoveFile(); // Clear selection
//                 return;
//             }
//             setSelectedFile(file);
//             setFileType(type);
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setFilePreview(reader.result);
//             };
//             reader.readAsDataURL(file);
//         } else {
//             handleRemoveFile();
//         }
//     };

//     const handleRemoveFile = () => {
//         setSelectedFile(null);
//         setFilePreview(null);
//         setFileType(null);
//         if (imageInputRef.current) imageInputRef.current.value = '';
//         if (videoInputRef.current) videoInputRef.current.value = '';
//     };

//     const handlePost = async () => {
//         if (!user) {
//             toast.error('Please log in to create a post.');
//             return;
//         }
//         if (!postText.trim() && !selectedFile) {
//             toast.error('Post cannot be empty!');
//             return;
//         }

//         setIsPosting(true);
//         const toastId = toast.loading('Creating your post...'); // Show loading toast

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 toast.dismiss(toastId);
//                 toast.error('Authentication token not available. Please log in again.');
//                 setIsPosting(false);
//                 return;
//             }

//             // Create FormData object to send text and file
//             const formData = new FormData();
//             formData.append('text', postText.trim());
//             if (selectedFile) {
//                 formData.append('media', selectedFile); // 'media' will be the field name on backend
//                 formData.append('mediaType', fileType); // 'image' or 'video'
//             }
            
//             // Backend will use authorId from token, but we can pass name/avatar for convenience
//             // or let backend fetch from User model. Fetching from backend is more robust.
//             // formData.append('authorName', user.displayName || 'Anonymous');
//             // formData.append('authorAvatarUrl', user.photoURL || '/avatars/user-default.jpg');


//             const response = await fetch(`${API_BASE_URL}/posts`, {
//                 method: 'POST',
//                 headers: {
//                     // 'Content-Type' is automatically set to 'multipart/form-data' when using FormData
//                     // Do NOT manually set Content-Type header when sending FormData
//                     'Authorization': `Bearer ${token}`, // Send Firebase ID token
//                 },
//                 body: formData, // Send FormData directly
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
//                 throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
//             }

//             const newPost = await response.json();
//             toast.dismiss(toastId); // Dismiss loading toast
//             toast.success('Post created successfully!');
//             console.log('New post:', newPost);

//             // Reset form
//             setPostText('');
//             handleRemoveFile();

//         } catch (error) {
//             console.error('Error creating post:', error);
//             toast.dismiss(toastId); // Dismiss loading toast
//             toast.error(`Failed to create post: ${error.message}`);
//         } finally {
//             setIsPosting(false);
//         }
//     };

//     return (
//         <div className="flex-grow p-4 pt-0 space-y-6 mb-0 overflow-y-auto max-w-2xl mx-auto">
//             <div className="bg-white p-5 rounded-lg shadow-md">
//                 <div className="flex items-center space-x-3 mb-4">
//                     <img
//                         src={user?.photoURL || '/avatars/user-default.jpg'}
//                         alt="User Avatar"
//                         className="w-12 h-12 rounded-full object-cover border border-gray-300"
//                     />
//                     <textarea
//                         placeholder="What's on your mind?"
//                         value={postText}
//                         onChange={(e) => setPostText(e.target.value)}
//                         rows={3} // Allow multiple lines for text
//                         className="flex-grow p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
//                     />
//                 </div>

//                 {/* File Preview Section */}
//                 {filePreview && (
//                     <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-200">
//                         {fileType === 'image' ? (
//                             // Use Next.js Image component for optimization if it's an image
//                             // For local preview, `src` directly from FileReader result is fine
//                             <img src={filePreview} alt="Selected Preview" className="w-full h-auto max-h-96 object-contain" />
//                         ) : (
//                             <video src={filePreview} controls className="w-full h-auto max-h-96 object-contain" />
//                         )}
//                         <button
//                             onClick={handleRemoveFile}
//                             className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
//                             aria-label="Remove file"
//                         >
//                             <X size={20} />
//                         </button>
//                     </div>
//                 )}

//                 <hr className="my-4 border-gray-200" />

//                 <div className="flex justify-around text-gray-600 flex-wrap gap-2">
//                     {/* Input for Image Upload */}
//                     <input
//                         type="file"
//                         accept="image/*"
//                         ref={imageInputRef}
//                         onChange={(e) => handleFileChange(e, 'image')}
//                         className="hidden"
//                         id="image-upload-input"
//                     />
//                     <button
//                         onClick={() => imageInputRef.current?.click()}
//                         className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
//                         disabled={selectedFile && fileType !== 'image'} // Disable if another file type is selected
//                     >
//                         <ImageIcon size={20} className="text-green-500 mr-2" />
//                         <span>Photo</span>
//                     </button>

//                     {/* Input for Video Upload */}
//                     <input
//                         type="file"
//                         accept="video/*"
//                         ref={videoInputRef}
//                         onChange={(e) => handleFileChange(e, 'video')}
//                         className="hidden"
//                         id="video-upload-input"
//                     />
//                     <button
//                         onClick={() => videoInputRef.current?.click()}
//                         className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
//                         disabled={selectedFile && fileType !== 'video'} // Disable if another file type is selected
//                     >
//                         <Video size={20} className="text-purple-500 mr-2" />
//                         <span>Video</span>
//                     </button>

//                     {/* "Go Live" and "Feeling" buttons are currently static */}
//                     <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70">
//                          <Video size={20} className="text-red-500 mr-2" />
//                          <span>Go Live</span>
//                     </button>
//                     <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70">
//                          <ImageIcon size={20} className="text-yellow-500 mr-2" /> {/* Changed icon for 'Feeling' as 'Smile' is not directly imported */}
//                          <span>Feeling</span>
//                     </button>

//                     <button
//                         onClick={handlePost}
//                         disabled={isPosting || (!postText.trim() && !selectedFile)}
//                         className="flex items-center p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {isPosting ? (
//                             <span className="flex items-center">
//                                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                 </svg>
//                                 Posting...
//                             </span>
//                         ) : (
//                             <>
//                                 <SendHorizontal size={20} className="mr-2" />
//                                 <span>Post</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreatePostPage;

// app/userPost/page.jsx


'use client';

import { useState, useRef } from 'react';
import { Video, ImageIcon, Smile, SendHorizontal, X } from 'lucide-react';
import { useAuth } from '../../components/AuthProvider'; // Adjust path if AuthProvider is elsewhere
import toast from 'react-hot-toast'; // For notifications
import LoadingBar from 'react-top-loading-bar'; // Import LoadingBar

// --- API Base URL ---
const API_BASE_URL = 'https://vartalaap-r36o.onrender.com/api'; // Make sure this matches your Express server's address

const CreatePostPage = () => {
    const { user, getIdToken } = useAuth();
    const [postText, setPostText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [isPosting, setIsPosting] = useState(false);
    const loadingBarRef = useRef(null); // Ref for the loading bar

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // --- Handle file selection ---
    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            // Basic validation for file size (e.g., max 25MB)
            if (file.size > 25 * 1024 * 1024) { // 25 MB
                toast.error('File size exceeds 25MB limit.');
                handleRemoveFile(); // Clear selection
                return;
            }
            setSelectedFile(file);
            setFileType(type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            handleRemoveFile();
        }
    };

    // --- Remove selected file ---
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    // --- Handle Post creation ---
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
        loadingBarRef.current?.continuousStart(); // Start loading bar

        try {
            const token = await getIdToken();
            if (!token) {
                toast.error('Authentication token not available. Please log in again.');
                return; // Don't proceed if no token
            }

            const formData = new FormData();
            formData.append('text', postText.trim());
            if (selectedFile) {
                formData.append('media', selectedFile);
                formData.append('mediaType', fileType);
            }
            
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Send Firebase ID token
                },
                body: formData, // Send FormData directly
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
                throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
            }

            const newPost = await response.json();
            toast.success('Post created successfully!');
            console.log('New post:', newPost);

            // Reset form
            setPostText('');
            handleRemoveFile();

        } catch (error) {
            console.error('Error creating post:', error);
            toast.error(`Failed to create post: ${error.message}`);
        } finally {
            setIsPosting(false);
            loadingBarRef.current?.complete(); // Complete loading bar
        }
    };

    return (
        <div className="flex-grow p-4 pt-0 space-y-6 mb-0 overflow-y-auto max-w-2xl mx-auto w-full">
            {/* Loading Bar */}
            <LoadingBar color="#2563eb" ref={loadingBarRef} />

            <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                    <img
                        src={user?.avatarUrl || '/avatars/user-default.jpg'}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                    />
                    <textarea
                        placeholder="What's on your mind?"
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        rows={3}
                        className="flex-grow p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                    />
                </div>

                {/* File Preview Section */}
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
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <hr className="my-4 border-gray-200" />

                <div className="flex justify-around text-gray-600 flex-wrap gap-2">
                    {/* Photo Input */}
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
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        disabled={selectedFile && fileType !== 'image'}
                    >
                        <ImageIcon size={20} className="text-green-500 mr-2" />
                        <span>Photo</span>
                    </button>

                    {/* Video Input */}
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
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        disabled={selectedFile && fileType !== 'video'}
                    >
                        <Video size={20} className="text-purple-500 mr-2" />
                        <span>Video</span>
                    </button>
                    
                    {/* Other static buttons */}
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70">
                         <Video size={20} className="text-red-500 mr-2" />
                         <span>Go Live</span>
                    </button>
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70">
                         <Smile size={20} className="text-yellow-500 mr-2" />
                         <span>Feeling</span>
                    </button>

                    {/* Post Button */}
                    <button
                        onClick={handlePost}
                        disabled={isPosting || (!postText.trim() && !selectedFile)}
                        className="flex items-center p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPosting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    );
};

export default CreatePostPage;