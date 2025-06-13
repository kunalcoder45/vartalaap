// // client/app/dashboard/page.tsx
// 'use client';

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import ProtectedRoute from '../../components/ProtectedRoute'; // Assumed component for auth redirection
// import { useAuth } from '../../components/AuthProvider'; // Custom auth hook
// import Navbar from '../../components/navbar'; // Top navigation bar
// import Slidebar from '../../components/slidebar'; // Left sidebar
// import MainContent from '../../components/mainContent'; // Central feed content
// import RightSidebar from '../../components/activitybar'; // Right sidebar

// import { Video, ImageIcon, Smile, SendHorizontal, X } from 'lucide-react'; // Icons from Lucide React
// import toast, { Toaster } from 'react-hot-toast';
// import LoadingBar from 'react-top-loading-bar'; // Top progress bar
// import Link from 'next/link'; // For navigation

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// /**
//  * Dashboard component: The main social media feed page.
//  * Handles group fetching, post creation, and overall layout.
//  */
// export default function Dashboard() {
//     const { user, getIdToken } = useAuth(); // Get user and token getter from auth context
//     const pathname = usePathname(); // Get current Next.js pathname

//     // State for user's joined groups
//     const [userJoinedGroups, setUserJoinedGroups] = useState([]);
//     const [loadingGroups, setLoadingGroups] = useState(true);
//     const [groupsError, setGroupsError] = useState(null);

//     // State for new post creation form
//     const [postText, setPostText] = useState('');
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [filePreview, setFilePreview] = useState<string | null>(null);
//     const [fileType, setFileType] = useState<string | null>(null); // 'image' or 'video'
//     const [isPosting, setIsPosting] = useState(false); // Loading state for post creation

//     const loadingBarRef = useRef<any>(null); // Ref for the top loading bar
//     const imageInputRef = useRef<HTMLInputElement>(null); // Ref for image file input
//     const videoInputRef = useRef<HTMLInputElement>(null); // Ref for video file input

//     /**
//      * Memoized callback to fetch groups the current user has joined.
//      */
//     const fetchUserGroups = useCallback(async () => {
//         if (!user) { // If no user, no groups to fetch
//             setUserJoinedGroups([]);
//             setLoadingGroups(false);
//             return;
//         }

//         setLoadingGroups(true);
//         setGroupsError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error("Authentication token not available.");

//             const response = await fetch(`${API_BASE_URL}/groups/joined`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 let errorMessage = 'Failed to fetch joined groups';
//                 try {
//                     // Clone response to read body twice (once for json, once for text fallback)
//                     const clonedResponse = response.clone();
//                     const errorData = await clonedResponse.json();
//                     errorMessage = errorData.message || errorMessage;
//                 } catch (jsonError) {
//                     try {
//                         const text = await response.text(); // Read as text if JSON parsing fails
//                         console.error('Non-JSON error response from /groups/joined:', text);
//                         errorMessage = text || errorMessage;
//                     } catch (textError) {
//                         console.error('Error reading response text from /groups/joined:', textError);
//                     }
//                 }
//                 throw new Error(`${errorMessage} (Status: ${response.status})`);
//             }

//             const data = await response.json();
//             setUserJoinedGroups(data);
//         } catch (error: any) {
//             console.error("Error fetching joined groups:", error.message);
//             setGroupsError(error.message);
//             setUserJoinedGroups([]);
//             toast.error(`Error loading groups: ${error.message}`); // Show toast for group fetch errors
//         } finally {
//             setLoadingGroups(false);
//         }
//     }, [user, getIdToken]); // Dependencies for useCallback

//     // Effect hook to trigger fetching user groups when user or getIdToken changes
//     useEffect(() => {
//         fetchUserGroups();
//     }, [fetchUserGroups]);


//     // --- Post Creation File Handling ---
//     /**
//      * Handles file selection for images or videos for a new post.
//      * Performs basic size validation and creates a file preview.
//      */
//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
//         const file = event.target.files?.[0]; // Get the first selected file
//         if (file) {
//             // Validate file size (max 25MB)
//             if (file.size > 25 * 1024 * 1024) {
//                 toast.error('File size exceeds 25MB limit.');
//                 handleRemoveFile(); // Clear selection if too large
//                 return;
//             }
//             setSelectedFile(file);
//             setFileType(type);

//             const reader = new FileReader();
//             reader.onloadend = () => setFilePreview(reader.result as string); // Set file preview URL
//             reader.readAsDataURL(file); // Read file as Data URL for preview
//         } else {
//             handleRemoveFile(); // Clear selection if no file
//         }
//     };

//     /**
//      * Removes the selected file and clears its preview.
//      */
//     const handleRemoveFile = () => {
//         setSelectedFile(null);
//         setFilePreview(null);
//         setFileType(null);
//         // Reset file input values to allow re-selection of the same file
//         if (imageInputRef.current) imageInputRef.current.value = '';
//         if (videoInputRef.current) videoInputRef.current.value = '';
//     };

//     /**
//      * Handles the creation of a new post, sending text and media to the backend.
//      */
//     const handlePost = async () => {
//         if (!user) {
//             toast.error('Please log in to create a post.');
//             return;
//         }
//         if (!postText.trim() && !selectedFile) {
//             toast.error('Post cannot be empty!');
//             return;
//         }

//         setIsPosting(true); // Set posting state to true
//         loadingBarRef.current?.continuousStart(); // Start top loading bar

//         try {
//             const token = await getIdToken(); // Get current user's ID token
//             if (!token) {
//                 toast.error('Authentication token not available. Please log in again.');
//                 return;
//             }

//             const formData = new FormData(); // Use FormData for file uploads
//             formData.append('text', postText.trim());
//             if (selectedFile) {
//                 formData.append('media', selectedFile);
//                 formData.append('mediaType', fileType || ''); // Ensure mediaType is sent
//             }

//             const response = await fetch(`${API_BASE_URL}/posts`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`, // Send Firebase ID token
//                     // 'Content-Type': 'multipart/form-data' is NOT needed when using FormData; browser sets it.
//                 },
//                 body: formData, // Send FormData directly
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({
//                     message: 'Server sent non-JSON response or empty body.',
//                 }));
//                 throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
//             }

//             const newPost = await response.json();
//             toast.success('Post created successfully!');
//             console.log('New post:', newPost);

//             // Reset form fields after successful post
//             setPostText('');
//             handleRemoveFile();

//             // TODO: Ideally, trigger a refresh of the posts in MainContent here
//             // This would involve MainContent taking a `refreshPosts` prop
//             // or using a state management solution. For now, users might need to refresh manually.

//         } catch (error: any) {
//             console.error('Error creating post:', error);
//             toast.error(`Failed to create post: ${error.message}`);
//         } finally {
//             setIsPosting(false); // Reset posting state
//             loadingBarRef.current?.complete(); // Complete top loading bar
//         }
//     };

//     // Render the dashboard layout
//     return (
//         <ProtectedRoute> {/* Protects the route, redirects if not authenticated */}
//             <Navbar /> {/* Top navigation */}
//             <div className="h-auto p-4 bg-gray-50">
//                 <div className="flex">
//                     <div className="flex-shrink-0">
//                         {/* Left sidebar, passes joined groups */}
//                         <Slidebar
//                             joinedGroups={userJoinedGroups}
//                             currentPath={pathname}
//                             className="" // Empty className prop for consistency
//                         />
//                     </div>

//                     <div className="flex-1 overflow-y-auto">
//                         <LoadingBar color="#2563eb" ref={loadingBarRef} /> {/* Top loading bar */}
//                         <div className="p-4 pt-0 space-y-6 mb-0 max-w-2xl mx-auto">
//                             {/* Post Creation Section */}
//                             <div className="bg-white p-5 rounded-lg shadow-md">
//                                 <div className="flex items-center space-x-3 mb-4">
//                                     {/* Link user avatar to their profile page */}
//                                     <Link href="/profile" className="flex-shrink-0">
//                                         <img
//                                             src={user?.photoURL || `${API_BASE_URL.replace('/api', '')}/avatars/userLogo.png`}
//                                             alt="User Avatar"
//                                             className="w-12 h-12 rounded-full object-cover border border-gray-300 cursor-pointer"
//                                             title="View your profile"
//                                         />
//                                     </Link>
//                                     <textarea
//                                         placeholder="What's on your mind?"
//                                         value={postText}
//                                         onChange={(e) => setPostText(e.target.value)}
//                                         rows={3}
//                                         className="flex-grow p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
//                                     />
//                                 </div>

//                                 {/* File Preview Section */}
//                                 {filePreview && (
//                                     <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-200">
//                                         {fileType === 'image' ? (
//                                             <img src={filePreview} alt="Selected Preview" className="w-full h-auto max-h-96 object-contain" />
//                                         ) : (
//                                             <video src={filePreview} controls className="w-full h-auto max-h-96 object-contain" />
//                                         )}
//                                         <button
//                                             onClick={handleRemoveFile}
//                                             className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-colors"
//                                             aria-label="Remove file"
//                                         >
//                                             <X size={20} /> {/* Close icon */}
//                                         </button>
//                                     </div>
//                                 )}

//                                 <hr className="my-4 border-gray-200" />

//                                 <div className="flex justify-around text-gray-600 flex-wrap gap-2">
//                                     {/* Photo Input Button */}
//                                     <input
//                                         type="file"
//                                         accept="image/*"
//                                         ref={imageInputRef}
//                                         onChange={(e) => handleFileChange(e, 'image')}
//                                         className="hidden"
//                                         id="image-upload-input"
//                                     />
//                                     <button
//                                         onClick={() => imageInputRef.current?.click()}
//                                         className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//                                         disabled={selectedFile !== null && fileType !== 'image'} // Disable if another file type is selected
//                                     >
//                                         <ImageIcon size={20} className="text-green-500 mr-2" />
//                                         <span>Photo</span>
//                                     </button>

//                                     {/* Video Input Button */}
//                                     <input
//                                         type="file"
//                                         accept="video/*"
//                                         ref={videoInputRef}
//                                         onChange={(e) => handleFileChange(e, 'video')}
//                                         className="hidden"
//                                         id="video-upload-input"
//                                     />
//                                     <button
//                                         onClick={() => videoInputRef.current?.click()}
//                                         className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//                                         disabled={selectedFile !== null && fileType !== 'video'} // Disable if another file type is selected
//                                     >
//                                         <Video size={20} className="text-purple-500 mr-2" />
//                                         <span>Video</span>
//                                     </button>

//                                     {/* Static/Placeholder Buttons */}
//                                     <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70">
//                                         <Video size={20} className="text-red-500 mr-2" />
//                                         <span>Go Live</span>
//                                     </button>
//                                     <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-not-allowed opacity-70">
//                                         <Smile size={20} className="text-yellow-500 mr-2" />
//                                         <span>Feeling</span>
//                                     </button>

//                                     {/* Post Button */}
//                                     <button
//                                         onClick={handlePost}
//                                         disabled={isPosting || (!postText.trim() && !selectedFile)} // Disable if no content or posting
//                                         className="flex items-center p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         {isPosting ? (
//                                             <span className="flex items-center">
//                                                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                                 </svg>
//                                                 Posting...
//                                             </span>
//                                         ) : (
//                                             <>
//                                                 <SendHorizontal size={20} className="mr-2" />
//                                                 <span>Post</span>
//                                             </>
//                                         )}
//                                     </button>
//                                 </div>
//                             </div>

//                             <MainContent /> {/* Renders the main posts feed */}
//                         </div>
//                     </div>

//                     <div className="flex-shrink-0">
//                         <RightSidebar /> {/* Right sidebar for activity/suggestions */}
//                     </div>
//                 </div>
//                 <Toaster />
//             </div>
//         </ProtectedRoute>
//     );
// }











// client/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute'; // Assumed component for auth redirection
import { useAuth } from '../../components/AuthProvider'; // Custom auth hook
import Navbar from '../../components/navbar'; // Top navigation bar
import Slidebar from '../../components/slidebar'; // Left sidebar
import RightSidebar from '../../components/activitybar'; // Right sidebar
import MainBar from '../../components/mainBar';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

/**
 * Dashboard component: The main social media feed page.
 * Handles group fetching, post creation, and overall layout.
 */
export default function Dashboard() {
    const { user, getIdToken } = useAuth(); // Get user and token getter from auth context
    const pathname = usePathname(); // Get current Next.js pathname

    // State for user's joined groups
    const [userJoinedGroups, setUserJoinedGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState(null);
    const imageInputRef = useRef<HTMLInputElement>(null); // Ref for image file input
    const videoInputRef = useRef<HTMLInputElement>(null); // Ref for video file input

    /**
     * Memoized callback to fetch groups the current user has joined.
     */
    const fetchUserGroups = useCallback(async () => {
        if (!user) { // If no user, no groups to fetch
            setUserJoinedGroups([]);
            setLoadingGroups(false);
            return;
        }

        setLoadingGroups(true);
        setGroupsError(null);

        try {
            const token = await getIdToken();
            if (!token) throw new Error("Authentication token not available.");

            const response = await fetch(`${API_BASE_URL}/groups/joined`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch joined groups';
                try {
                    // Clone response to read body twice (once for json, once for text fallback)
                    const clonedResponse = response.clone();
                    const errorData = await clonedResponse.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    try {
                        const text = await response.text(); // Read as text if JSON parsing fails
                        console.error('Non-JSON error response from /groups/joined:', text);
                        errorMessage = text || errorMessage;
                    } catch (textError) {
                        console.error('Error reading response text from /groups/joined:', textError);
                    }
                }
                throw new Error(`${errorMessage} (Status: ${response.status})`);
            }

            const data = await response.json();
            setUserJoinedGroups(data);
        } catch (error: any) {
            console.error("Error fetching joined groups:", error.message);
            setGroupsError(error.message);
            setUserJoinedGroups([]);
            toast.error(`Error loading groups: ${error.message}`); // Show toast for group fetch errors
        } finally {
            setLoadingGroups(false);
        }
    }, [user, getIdToken]); // Dependencies for useCallback

    // Effect hook to trigger fetching user groups when user or getIdToken changes
    useEffect(() => {
        fetchUserGroups();
    }, [fetchUserGroups]);

    // Render the dashboard layout
    return (
        <ProtectedRoute> {/* Protects the route, redirects if not authenticated */}
            <Navbar /> {/* Top navigation */}
            <div className="h-auto p-4 bg-gray-50">
                <div className="flex">
                    <div className="flex-shrink-0">
                        {/* Left sidebar, passes joined groups */}
                        <Slidebar
                            joinedGroups={userJoinedGroups}
                            currentPath={pathname}
                            className="" // Empty className prop for consistency
                        />
                    </div>
                    <MainBar />
                    {/* <ActionSection /> */}
                    {/* <MainContent/> */}
                    <div className="flex-shrink-0">
                        <RightSidebar /> {/* Right sidebar for activity/suggestions */}
                    </div>
                </div>
                <Toaster />
            </div>
        </ProtectedRoute>
    );
}