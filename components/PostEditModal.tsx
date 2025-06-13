// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

// const PostEditModal = ({ post, onClose, onPostUpdated, getIdToken, backendUrl }: {
//     post: any;
//     onClose: () => void;
//     onPostUpdated: (updatedPost: any) => void;
//     getIdToken: () => Promise<string | null>;
//     backendUrl: string;
// }) => {
//     const [editText, setEditText] = useState(post.text || '');
//     const [mediaFile, setMediaFile] = useState<File | null>(null);
//     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(post.mediaUrl || null);
//     const [mediaType, setMediaType] = useState(post.mediaType || '');
//     const [loading, setLoading] = useState(false);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // Effect to update mediaPreviewUrl if mediaFile changes
//     useEffect(() => {
//         if (mediaFile) {
//             const url = URL.createObjectURL(mediaFile);
//             setMediaPreviewUrl(url);
//             // Determine media type
//             if (mediaFile.type.startsWith('image/')) {
//                 setMediaType('image');
//             } else if (mediaFile.type.startsWith('video/')) {
//                 setMediaType('video');
//             } else {
//                 setMediaType(''); // Reset if unsupported
//             }
//             return () => URL.revokeObjectURL(url); // Clean up on unmount or file change
//         } else if (!post.mediaUrl) {
//             setMediaPreviewUrl(null); // Clear preview if no file and no original media
//             setMediaType('');
//         }
//     }, [mediaFile, post.mediaUrl]);


//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             // Basic file type check (more robust validation can be added)
//             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
//                 setMediaFile(file);
//             } else {
//                 alert('Only image or video files are allowed.');
//                 setMediaFile(null);
//                 if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
//             }
//         }
//     };

//     const handleRemoveMedia = () => {
//         setMediaFile(null);
//         setMediaPreviewUrl(null);
//         setMediaType('');
//         if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
//     };


//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 alert('Authentication required to edit post.');
//                 setLoading(false);
//                 return;
//             }

//             const formData = new FormData();
//             formData.append('text', editText);

//             if (mediaFile) {
//                 formData.append('media', mediaFile);
//                 formData.append('mediaType', mediaType); // Pass the determined media type
//             } else if (!mediaPreviewUrl && post.mediaUrl) {
//                 // If there was original media but it's now removed by user, send a flag
//                 formData.append('removeMedia', 'true');
//             }


//             const response = await fetch(`${backendUrl}/posts/${post._id}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to update post');
//             }

//             const result = await response.json();
//             alert('Post updated successfully!');
//             onPostUpdated(result.post); // Update the post in parent's state
//             onClose(); // Close the modal

//         } catch (error: any) {
//             console.error('Error updating post:', error);
//             alert(`Error updating post: ${error.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
//                 <button
//                     onClick={onClose}
//                     className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//                 >
//                     <X size={24} />
//                 </button>
//                 <h2 className="text-2xl font-semibold mb-4 text-center">Edit Post</h2>

//                 <form onSubmit={handleSubmit}>
//                     <textarea
//                         className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 mb-4 resize-y"
//                         rows={4}
//                         placeholder="What's on your mind?"
//                         value={editText}
//                         onChange={(e) => setEditText(e.target.value)}
//                     />

//                     {mediaPreviewUrl && (
//                         <div className="mb-4 relative">
//                             {mediaType === 'image' ? (
//                                 <img src={mediaPreviewUrl} alt="Media Preview" className="w-full h-auto rounded-lg max-h-60 object-contain border border-gray-200" />
//                             ) : (
//                                 <video src={mediaPreviewUrl} controls className="w-full h-auto rounded-lg max-h-60 object-contain border border-gray-200" />
//                             )}
//                             <button
//                                 type="button"
//                                 onClick={handleRemoveMedia}
//                                 className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
//                                 aria-label="Remove media"
//                             >
//                                 <X size={16} />
//                             </button>
//                         </div>
//                     )}

//                     <input
//                         type="file"
//                         ref={fileInputRef}
//                         accept="image/*,video/*"
//                         onChange={handleFileChange}
//                         className="hidden" // Hide the default file input
//                     />
//                     <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="flex items-center justify-center w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors mb-4"
//                     >
//                         {mediaPreviewUrl ? (
//                             <>
//                                 {mediaType === 'image' ? <ImageIcon size={20} className="mr-2" /> : <Video size={20} className="mr-2" />}
//                                 Change Media
//                             </>
//                         ) : (
//                             <>
//                                 <ImageIcon size={20} className="mr-2" />
//                                 Add Photo/Video
//                             </>
//                         )}
//                     </button>

//                     <button
//                         type="submit"
//                         className="w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-300"
//                         disabled={loading || (editText.trim() === '' && !mediaFile && !post.mediaUrl)} // Disable if no text and no media
//                     >
//                         {loading && <Loader2 size={20} className="mr-2 animate-spin" />}
//                         {loading ? 'Updating...' : 'Save Changes'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default PostEditModal;


// corrected 







'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Import react-hot-toast

const PostEditModal = ({ post, onClose, onPostUpdated, getIdToken, backendUrl }: {
    post: any;
    onClose: () => void;
    onPostUpdated: (updatedPost: any) => void;
    getIdToken: () => Promise<string | null>;
    backendUrl: string;
}) => {
    const [editText, setEditText] = useState(post.text || '');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(post.mediaUrl || null);
    const [mediaType, setMediaType] = useState(post.mediaType || '');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to update mediaPreviewUrl if mediaFile changes
    useEffect(() => {
        if (mediaFile) {
            const url = URL.createObjectURL(mediaFile);
            setMediaPreviewUrl(url);
            // Determine media type
            if (mediaFile.type.startsWith('image/')) {
                setMediaType('image');
            } else if (mediaFile.type.startsWith('video/')) {
                setMediaType('video');
            } else {
                setMediaType(''); // Reset if unsupported
            }
            return () => URL.revokeObjectURL(url); // Clean up on unmount or file change
        } else if (!post.mediaUrl) {
            setMediaPreviewUrl(null); // Clear preview if no file and no original media
            setMediaType('');
        } else if (post.mediaUrl && !mediaFile) {
            // If there's an original media URL and no new file selected, use original
            setMediaPreviewUrl(post.mediaUrl.startsWith('http') ? post.mediaUrl : `${backendUrl.replace('/api', '')}${post.mediaUrl}`);
            setMediaType(post.mediaType);
        }
    }, [mediaFile, post.mediaUrl, post.mediaType, backendUrl]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Basic file type check (more robust validation can be added)
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                setMediaFile(file);
            } else {
                toast.error('Only image or video files are allowed.');
                setMediaFile(null);
                if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
            }
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setMediaPreviewUrl(null);
        setMediaType('');
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getIdToken();
            if (!token) {
                toast.error('Authentication required to edit post.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('text', editText);

            if (mediaFile) {
                formData.append('media', mediaFile);
                formData.append('mediaType', mediaType); // Pass the determined media type
            } else if (!mediaPreviewUrl && post.mediaUrl) {
                // If there was original media but it's now removed by user, send a flag
                formData.append('removeMedia', 'true');
            }


            const response = await fetch(`${backendUrl}/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update post');
            }

            const result = await response.json();
            toast.success('Post updated successfully!');
            onPostUpdated(result.post); // Update the post in parent's state
            onClose(); // Close the modal

        } catch (error: any) {
            console.error('Error updating post:', error);
            toast.error(`Error updating post: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transform transition-opacity duration-300 ease-out animate-scale-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-center">Edit Post</h2>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 mb-4 resize-y"
                        rows={4}
                        placeholder="What's on your mind?"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                    />

                    {mediaPreviewUrl && (
                        <div className="mb-4 relative">
                            {mediaType === 'image' ? (
                                <img src={mediaPreviewUrl} alt="Media Preview" className="w-full h-auto rounded-lg max-h-60 object-contain border border-gray-200" />
                            ) : (
                                <video src={mediaPreviewUrl} controls className="w-full h-auto rounded-lg max-h-60 object-contain border border-gray-200" />
                            )}
                            <button
                                type="button"
                                onClick={handleRemoveMedia}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                aria-label="Remove media"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden" // Hide the default file input
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors mb-4 cursor-pointer"
                    >
                        {mediaPreviewUrl ? (
                            <>
                                {mediaType === 'image' ? <ImageIcon size={20} className="mr-2" /> : <Video size={20} className="mr-2" />}
                                Change Media
                            </>
                        ) : (
                            <>
                                <ImageIcon size={20} className="mr-2" />
                                Add Photo/Video
                            </>
                        )}
                    </button>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-300 cursor-pointer"
                        disabled={loading || (editText.trim() === '' && !mediaFile && !post.mediaUrl)} // Disable if no text and no media
                    >
                        {loading && <Loader2 size={20} className="mr-2 animate-spin" />}
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostEditModal;