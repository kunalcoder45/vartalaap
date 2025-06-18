// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png'; // Make sure this path is correct
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken } = useAuth();

//     const [followers, setFollowers] = useState<User[]>([]);
//     const [following, setFollowing] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) {
//                     if (isMounted) {
//                         setLoading(false);
//                         console.error('ActivityBar: Authentication token not available.');
//                     }
//                     return;
//                 }

//                 // <<<<<<<<<<<< यहाँ API एंडपॉइंट को ठीक किया गया है >>>>>>>>>>>>
//                 // अपने बैकएंड के वास्तविक एंडपॉइंट से इसे मिलाएं।
//                 // यह `/follow/user-connections/:userId` हो सकता है
//                 // या `/follow-details/:userId` हो सकता है
//                 const res = await fetch(`${API_BASE_URL}/follow-details/${userId}`, {
//                 // या अगर यह पहले `/follow-details/:userId` था:
//                 // const res = await fetch(`${API_BASE_URL}/follow-details/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 if (!res.ok) {
//                     const err = await res.json();
//                     throw new Error(err.message || 'Failed to fetch follow details');
//                 }

//                 const data = await res.json();

//                 if (isMounted) {
//                     setFollowers(data.followers || []);
//                     setFollowing(data.following || []);
//                 }
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) {
//                     setFollowers([]);
//                     setFollowing([]);
//                 }
//             } finally {
//                 if (isMounted) {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchFollowDetails();

//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken]);

//     const getAvatarSrc = (user: User): string => {
//         return user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : defaultAvatar.src;
//     };

//     const SkeletonItem = () => (
//         <div className="flex items-center space-x-3 py-2 animate-pulse">
//             <Skeleton circle width={40} height={40} />
//             <Skeleton width={120} height={20} className="rounded-md" />
//         </div>
//     );

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex items-center space-x-3 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer"
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all duration-200"
//                 onError={e => {
//                     (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//                 }}
//             />
//             <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
//         </li>
//     );

//     return (
//         <div className="
//             flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96
//             p-4 bg-white rounded-xl shadow-lg
//             border border-gray-200
//             flex flex-col space-y-6
//             h-full overflow-y-auto custom-scrollbar
//         ">
//             {/* Following Section */}
//             <div>
//                 <h2 className="text-xl font-extrabold text-gray-800 mb-4 border-b pb-2 border-gray-200">
//                     Following
//                 </h2>
//                 {loading ? (
//                     <>
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </>
//                 ) : following.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         You're not following anyone yet. Start exploring!
//                     </p>
//                 ) : (
//                     <ul className="space-y-2">
//                         {following.map(renderUserItem)}
//                     </ul>
//                 )}
//             </div>

//             <div>
//                 <h2 className="text-xl font-extrabold text-gray-800 mb-4 border-b pb-2 border-gray-200">
//                     Followers
//                 </h2>
//                 {loading ? (
//                     <>
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </>
//                 ) : followers.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No followers yet. Share your content to gain some!
//                     </p>
//                 ) : (
//                     <ul className="space-y-2">
//                         {followers.map(renderUserItem)}
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ActivityBar;




// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken } = useAuth();
//     const [followers, setFollowers] = useState<User[]>([]);
//     const [following, setFollowing] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) {
//                     if (isMounted) {
//                         setLoading(false);
//                         console.error('Token not found');
//                     }
//                     return;
//                 }

//                 const res = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 if (!res.ok) {
//                     const err = await res.json();
//                     throw new Error(err.message || 'Failed to fetch follow details');
//                 }

//                 const data = await res.json();

//                 if (isMounted) {
//                     // Combine followers and following and remove duplicates
//                     const followingList = Array.isArray(data.following) ? data.following : [];
//                     const followersList = Array.isArray(data.followers) ? data.followers : [];

//                     // Create a Map to keep unique users by _id
//                     const uniqueUsersMap = new Map<string, User>();

//                     // Add following first
//                     followingList.forEach((user: User) => {
//                         uniqueUsersMap.set(user._id, user);
//                     });

//                     // Add followers only if not already present
//                     followersList.forEach((user: User) => {
//                         if (!uniqueUsersMap.has(user._id)) {
//                             uniqueUsersMap.set(user._id, user);
//                         }
//                     });

//                     const uniqueUsers = Array.from(uniqueUsersMap.values());

//                     setFollowing(followingList);
//                     setFollowers(followersList);
//                     setAllConnections(uniqueUsers);
//                 }
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) {
//                     setFollowers([]);
//                     setFollowing([]);
//                     setAllConnections([]);
//                 }
//             } finally {
//                 if (isMounted) {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchFollowDetails();

//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken]);

//     // State for combined unique connections
//     const [allConnections, setAllConnections] = useState<User[]>([]);

//     const getAvatarSrc = (user: User): string => {
//         return user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : defaultAvatar.src;
//     };

//     const SkeletonItem = () => (
//         <div className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer py-2 animate-pulse">
//             <Skeleton circle width={56} height={56} />
//             <Skeleton width={80} height={14} className="rounded-md" />
//         </div>
//     );

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             title={user.name}
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className="w-14 h-14 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition outline outline-gray-300"
//                 onError={e => {
//                     (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//                 }}
//             />
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//         </li>
//     );

//     return (
//         <div
//             className="
//         flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96
//         p-4 bg-white rounded-xl shadow-lg
//         border border-gray-200
//         flex flex-col space-y-6
//         h-full overflow-y-auto custom-scrollbar
//       "
//         >
//             <div>
//                 {/* Heading */}
//                 <h2 className="text-2xl font-extrabold text-gray-800 mb-1 border-b pb-2 border-gray-200">
//                     Connections
//                 </h2>

//                 {/* Combined Connections Horizontal List */}
//                 {loading ? (
//                     <ul className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </ul>
//                 ) : allConnections.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No connections yet. Follow others to start building your network!
//                     </p>
//                 ) : (
//                     <ul className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
//                         {allConnections.map(renderUserItem)}
//                     </ul>
//                 )}
//                 <hr className='text-gray-200'/>
//             </div>

//         </div>
//     );
// };

// export default ActivityBar;



// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth(); // assuming currentUser has logged in user's info
//     const [followers, setFollowers] = useState<User[]>([]);
//     const [following, setFollowing] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public'); // toggle state
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [currentUserHasStatus, setCurrentUserHasStatus] = useState(false);


//     const openUploadModal = () => setIsUploadModalOpen(true);
//     const closeUploadModal = () => {
//         setIsUploadModalOpen(false);
//         setSelectedFile(null);
//         setUploadError(null);
//     };

//     useEffect(() => {
//         const fetchMyStatus = async () => {
//             try {
//                 const token = await getIdToken();
//                 const res = await fetch(`${API_BASE_URL}/status/me`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 const data = await res.json();
//                 setCurrentUserHasStatus(data.hasActiveStatus); // backend se true/false
//             } catch (err) {
//                 console.error('Error checking my status', err);
//             }
//         };

//         if (user) fetchMyStatus();
//     }, [user]);


//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) {
//                     if (isMounted) {
//                         setLoading(false);
//                         console.error('Token not found');
//                     }
//                     return;
//                 }

//                 const res = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 if (!res.ok) {
//                     const err = await res.json();
//                     throw new Error(err.message || 'Failed to fetch follow details');
//                 }

//                 const data = await res.json();

//                 if (isMounted) {
//                     const followingList = Array.isArray(data.following) ? data.following : [];
//                     const followersList = Array.isArray(data.followers) ? data.followers : [];

//                     // Merge and unique
//                     const uniqueUsersMap = new Map<string, User>();
//                     followingList.forEach(user => uniqueUsersMap.set(user._id, user));
//                     followersList.forEach(user => {
//                         if (!uniqueUsersMap.has(user._id)) uniqueUsersMap.set(user._id, user);
//                     });
//                     const uniqueUsers = Array.from(uniqueUsersMap.values());

//                     setFollowing(followingList);
//                     setFollowers(followersList);
//                     setAllConnections(uniqueUsers);
//                 }
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) {
//                     setFollowers([]);
//                     setFollowing([]);
//                     setAllConnections([]);
//                 }
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };

//         fetchFollowDetails();

//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken]);

//     const [allConnections, setAllConnections] = useState<User[]>([]);

//     const getAvatarSrc = (user: User): string => {
//         return user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : defaultAvatar.src;
//     };

//     const SkeletonItem = () => (
//         <div className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer py-2 animate-pulse">
//             <Skeleton circle width={56} height={56} />
//             <Skeleton width={80} height={14} className="rounded-md" />
//         </div>
//     );

//     // const renderUserItem = (user: User) => (
//     //     <li
//     //         key={user._id}
//     //         className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//     //         title={user.name}
//     //     >
//     //         <img
//     //             src={getAvatarSrc(user)}
//     //             alt={user.name}
//     //             className="w-14 h-14 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition outline outline-gray-200"
//     //             onError={e => {
//     //                 (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//     //             }}
//     //         />
//     //         <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//     //     </li>
//     // );


//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             title={user.name}
//             onClick={() => {
//                 if (user.hasActiveStatus) {
//                     // 👉 Open/view status for this user
//                     console.log(`Open status for ${user.name}`);
//                     // Replace with your logic to view status
//                 }
//             }}
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className={`w-14 h-14 rounded-full object-cover border-2 transition outline 
//         ${user.hasActiveStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}
//       `}
//                 onError={(e) => {
//                     (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//                 }}
//             />
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//         </li>
//     );


//     const handleUpload = async () => {
//         if (!selectedFile) return;

//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Not authenticated');

//             const formData = new FormData();
//             formData.append('visibility', visibility);
//             formData.append('expiresIn', '24h');
//             formData.append('media', selectedFile); // ✅ Only this for file


//             const res = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             });

//             if (!res.ok) {
//                 const err = await res.json();
//                 throw new Error(err.message || 'Upload failed');
//             }

//             // Success - close modal and reset
//             closeUploadModal();

//             // Optionally refresh statuses to show new upload
//             // fetchStatuses();
//         } catch (err: any) {
//             setUploadError(err.message || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };


//     // My Profile Icon with + below it
//     const MyProfileBox = () => {
//         const avatar = user?.avatarUrl || defaultAvatar.src;
//         const name = user?.name || 'You';

//         // You might track current user's active status from a separate API or context
//         const hasStatus = true; // 🔁 Replace with actual condition

//         return (
//             <div
//                 className="flex flex-col items-center min-w-[80px] cursor-pointer mr-0 mb-3"
//                 onClick={() => {
//                     if (hasStatus) {
//                         // 👉 Open your own status view modal
//                         console.log("Open your status");
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={avatar}
//                         alt={name}
//                         className={`w-16 h-16 rounded-full object-cover border-2 transition outline 
//             ${hasStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}
//           `}
//                         onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//                         }}
//                     />
//                     {/* Upload (+) Icon */}
//                     <div
//                         onClick={(e) => {
//                             e.stopPropagation(); // Don't trigger open-status on click
//                             openUploadModal();
//                         }}
//                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2
//                      w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center
//                      text-xl font-bold border-2 border-white cursor-pointer shadow-md"
//                         title="Upload status"
//                     >
//                         <Plus size={15} />
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div
//             className="
//         flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96
//         p-4 bg-white rounded-xl shadow-lg
//         border border-gray-200
//         flex flex-col space-y-6
//         h-full overflow-y-auto custom-scrollbar
//       "
//         >
//             <div>
//                 {/* Heading */}
//                 <h2 className="text-2xl font-extrabold text-gray-800 mb-2 border-b pb-2 border-gray-200">
//                     Connections
//                 </h2>

//                 {/* Horizontal row with MyProfileBox + connections */}
//                 {loading ? (
//                     <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </div>
//                 ) : allConnections.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No connections yet. Follow others to start building your network!
//                     </p>
//                 ) : (
//                     <ul className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <MyProfileBox />
//                         {allConnections.map(renderUserItem)}
//                     </ul>
//                 )}
//                 <hr className='text-gray-200' />
//             </div>
//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={closeUploadModal}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />
//         </div>
//     );
// };

// export default ActivityBar;






// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();
//     const [followers, setFollowers] = useState<User[]>([]);
//     const [following, setFollowing] = useState<User[]>([]);
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [currentUserHasStatus, setCurrentUserHasStatus] = useState(false);

//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatusUser, setViewingStatusUser] = useState<User | null>(null);
//     const [activeStatusUserIds, setActiveStatusUserIds] = useState<string[]>([]);


//     const openUploadModal = () => setIsUploadModalOpen(true);
//     const closeUploadModal = () => {
//         setIsUploadModalOpen(false);
//         setSelectedFile(null);
//         setUploadError(null);
//     };

//     useEffect(() => {
//         const fetchStatuses = async () => {
//             try {
//                 const token = await getIdToken();
//                 const res = await fetch(`${API_BASE_URL}/status`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const data = await res.json();
//                 const userIds = data.map((status: any) => status.userId);
//                 setActiveStatusUserIds(userIds);
//             } catch (err) {
//                 console.error('Error fetching statuses', err);
//             }
//         };
//         fetchStatuses();
//     }, [user]);

//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) return;

//                 const res = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 const data = await res.json();

//                 const followingList = Array.isArray(data.following) ? data.following : [];
//                 const followersList = Array.isArray(data.followers) ? data.followers : [];

//                 const uniqueUsersMap = new Map<string, User>();
//                 followingList.forEach(user => uniqueUsersMap.set(user._id, user));
//                 followersList.forEach(user => {
//                     if (!uniqueUsersMap.has(user._id)) uniqueUsersMap.set(user._id, user);
//                 });

//                 const uniqueUsers = Array.from(uniqueUsersMap.values());

//                 if (isMounted) {
//                     setFollowing(followingList);
//                     setFollowers(followersList);
//                     setAllConnections(uniqueUsers);
//                 }
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) {
//                     setFollowers([]);
//                     setFollowing([]);
//                     setAllConnections([]);
//                 }
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };

//         fetchFollowDetails();

//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken]);

//     const getAvatarSrc = (user: User): string => {
//         return user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : defaultAvatar.src;
//     };

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             const formData = new FormData();
//             formData.append('visibility', visibility);
//             formData.append('expiresIn', '24h');
//             formData.append('media', selectedFile);

//             const res = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             });

//             if (!res.ok) throw new Error('Upload failed');
//             closeUploadModal();
//         } catch (err: any) {
//             setUploadError(err.message || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const SkeletonItem = () => (
//         <div className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer py-2 animate-pulse">
//             <Skeleton circle width={56} height={56} />
//             <Skeleton width={80} height={14} className="rounded-md" />
//         </div>
//     );

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             title={user.name}
//             onClick={() => {
//                 if (user.hasActiveStatus) {
//                     setViewingStatusUser(user);
//                 }
//             }}
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className={`w-14 h-14 rounded-full object-cover border-2 transition outline 
//           ${user.hasActiveStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                 onError={(e) => {
//                     (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//                 }}
//             />
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//         </li>
//     );

//     const MyProfileBox = () => {
//         const avatar = user?.avatarUrl || defaultAvatar.src;
//         const name = user?.name || 'You';
//         const id = user?._id || '';

//         const hasStatus = activeStatusUserIds.includes(id);

//         return (
//             <div
//                 className="flex flex-col items-center min-w-[80px] cursor-pointer mr-0 mb-3"
//                 onClick={() => {
//                     if (hasStatus) {
//                         setViewingStatusUser({ _id: id, name, avatarUrl: user?.avatarUrl });
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={avatar}
//                         alt={name}
//                         className={`w-16 h-16 rounded-full object-cover border-2 transition outline 
//             ${hasStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                         onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).src = defaultAvatar.src;
//                         }}
//                     />
//                     <div
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             openUploadModal();
//                         }}
//                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold border-2 border-white cursor-pointer shadow-md"
//                         title="Upload status"
//                     >
//                         <Plus size={15} />
//                     </div>
//                 </div>
//             </div>
//         );
//     };


//     const StatusViewer = () => {
//         if (!viewingStatusUser) return null;

//         return (
//             <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full text-center">
//                     <h2 className="text-lg font-semibold mb-2">{viewingStatusUser.name}'s Status</h2>
//                     <img
//                         src={`${API_BASE_URL}/status/view/${viewingStatusUser._id}`}
//                         alt="Status"
//                         className="max-w-full h-auto rounded"
//                     />
//                     <button
//                         onClick={() => setViewingStatusUser(null)}
//                         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96 p-4 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar">
//             <div>
//                 <h2 className="text-2xl font-extrabold text-gray-800 mb-2 border-b pb-2 border-gray-200">Connections</h2>

//                 {loading ? (
//                     <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </div>
//                 ) : allConnections.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No connections yet. Follow others to start building your network!
//                     </p>
//                 ) : (
//                     <ul className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <MyProfileBox />
//                         {allConnections.map(renderUserItem)}
//                     </ul>
//                 )}
//                 <hr className='text-gray-200' />
//             </div>

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={closeUploadModal}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             <StatusViewer />
//         </div>
//     );
// };

// export default ActivityBar;



// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     mediaType?: 'image' | 'video';
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();
//     const [followers, setFollowers] = useState<User[]>([]);
//     const [following, setFollowing] = useState<User[]>([]);
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [activeStatusUserIds, setActiveStatusUserIds] = useState<string[]>([]);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatusUser, setViewingStatusUser] = useState<User | null>(null);

//     const openUploadModal = () => setIsUploadModalOpen(true);
//     const closeUploadModal = () => {
//         setIsUploadModalOpen(false);
//         setSelectedFile(null);
//         setUploadError(null);
//     };

//     const fetchStatuses = async () => {
//         try {
//             const token = await getIdToken();
//             const res = await fetch(`${API_BASE_URL}/status`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             const userIds = data.map((status: any) => status.userId);
//             setActiveStatusUserIds(userIds);
//         } catch (err) {
//             console.error('Error fetching statuses', err);
//         }
//     };

//     useEffect(() => {
//         fetchStatuses();
//     }, [user]);

//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) return;

//                 const res = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 const data = await res.json();

//                 const followingList: User[] = Array.isArray(data.following) ? data.following : [];
//                 const followersList: User[] = Array.isArray(data.followers) ? data.followers : [];

//                 const uniqueUsersMap = new Map<string, User>();
//                 followingList.forEach(user => uniqueUsersMap.set(user._id, user));
//                 followersList.forEach(user => {
//                     if (!uniqueUsersMap.has(user._id)) uniqueUsersMap.set(user._id, user);
//                 });

//                 const uniqueUsers = Array.from(uniqueUsersMap.values());

//                 // ✅ STEP 2: Apply active status
//                 uniqueUsers.forEach(user => {
//                     user.hasActiveStatus = activeStatusUserIds.includes(user._id);
//                 });

//                 if (isMounted) {
//                     setFollowing(followingList);
//                     setFollowers(followersList);
//                     setAllConnections(uniqueUsers);
//                 }
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) {
//                     setFollowers([]);
//                     setFollowing([]);
//                     setAllConnections([]);
//                 }
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };

//         fetchFollowDetails();

//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken, activeStatusUserIds]);

//     const getAvatarSrc = (user: User): string =>
//         user.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : defaultAvatar.src;

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             const formData = new FormData();
//             formData.append('visibility', visibility);
//             formData.append('expiresIn', '24h');
//             formData.append('media', selectedFile);

//             const res = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             });

//             if (!res.ok) throw new Error('Upload failed');
//             closeUploadModal();
//             await fetchStatuses();
//         } catch (err: any) {
//             setUploadError(err.message || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const SkeletonItem = () => (
//         <div className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer py-2 animate-pulse">
//             <Skeleton circle width={56} height={56} />
//             <Skeleton width={80} height={14} className="rounded-md" />
//         </div>
//     );

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             title={user.name}
//             onClick={() => {
//                 if (user.hasActiveStatus) setViewingStatusUser(user);
//             }}
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className={`w-14 h-14 rounded-full object-cover border-2 transition outline 
//         ${user.hasActiveStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                 onError={(e) => ((e.currentTarget as HTMLImageElement).src = defaultAvatar.src)}
//             />
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//         </li>
//     );

//     const MyProfileBox = () => {
//         const avatar = user?.avatarUrl || defaultAvatar.src;
//         const name = user?.name || 'You';
//         const id = user?._id || '';
//         const hasStatus = activeStatusUserIds.includes(id);

//         return (
//             <div
//                 className="flex flex-col items-center min-w-[80px] cursor-pointer mr-0 mb-3"
//                 onClick={() => {
//                     if (hasStatus) {
//                         setViewingStatusUser({
//                             _id: id,
//                             name,
//                             avatarUrl: user?.avatarUrl,
//                             mediaType: 'image', // OR dynamically fetch type later
//                         });
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={avatar}
//                         alt={name}
//                         className={`w-16 h-16 rounded-full object-cover border-2 transition outline 
//             ${hasStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                         onError={(e) => ((e.currentTarget as HTMLImageElement).src = defaultAvatar.src)}
//                     />
//                     <div
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             openUploadModal();
//                         }}
//                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold border-2 border-white cursor-pointer shadow-md"
//                         title="Upload status"
//                     >
//                         <Plus size={15} />
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const StatusViewer = () => {
//         if (!viewingStatusUser) return null;

//         return (
//             <div className="fixed top-0 left-0 w-full h-full  bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full text-center">
//                     <h2 className="text-lg font-semibold mb-2">{viewingStatusUser.name}'s Status</h2>
//                     {viewingStatusUser.mediaType === 'video' ? (
//                         <video controls className="max-w-full h-auto rounded">
//                             <source src={`${API_BASE_URL}/status/view/${viewingStatusUser._id}`} type="video/mp4" />
//                             Your browser does not support the video tag.
//                         </video>
//                     ) : (
//                         <img
//                             src={`${API_BASE_URL}/status/view/${viewingStatusUser._id}`}
//                             alt="Status"
//                             className="max-w-full h-auto rounded"
//                         />
//                     )}
//                     <button
//                         onClick={() => setViewingStatusUser(null)}
//                         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96 p-4 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar">
//             <div>
//                 <h2 className="text-2xl font-extrabold text-gray-800 mb-2 border-b pb-2 border-gray-200">Connections</h2>

//                 {loading ? (
//                     <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </div>
//                 ) : allConnections.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No connections yet. Follow others to start building your network!
//                     </p>
//                 ) : (
//                     <ul className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <MyProfileBox />
//                         {allConnections.map(renderUserItem)}
//                     </ul>
//                 )}
//                 <hr className="text-gray-200" />
//             </div>

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={closeUploadModal}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             <StatusViewer />
//         </div>
//     );
// };

// export default ActivityBar;



// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     mediaType?: 'image' | 'video';
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();

//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [activeStatusUserIds, setActiveStatusUserIds] = useState<string[]>([]);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatusUser, setViewingStatusUser] = useState<User | null>(null);

//     const openUploadModal = () => setIsUploadModalOpen(true);
//     const closeUploadModal = () => {
//         setIsUploadModalOpen(false);
//         setSelectedFile(null);
//         setUploadError(null);
//     };

//     const fetchStatuses = async () => {
//         try {
//             const token = await getIdToken();
//             const res = await fetch(`${API_BASE_URL}/status`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             const userIds = data.map((status: any) => status.userId);
//             setActiveStatusUserIds(userIds);
//         } catch (err) {
//             console.error('Error fetching statuses', err);
//         }
//     };

//     useEffect(() => {
//         fetchStatuses();
//     }, [user]);

//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) return;

//                 const res = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 const data = await res.json();

//                 const followingList: User[] = Array.isArray(data.following) ? data.following : [];
//                 const followersList: User[] = Array.isArray(data.followers) ? data.followers : [];

//                 const uniqueUsersMap = new Map<string, User>();
//                 followingList.forEach((u) => uniqueUsersMap.set(u._id, u));
//                 followersList.forEach((u) => {
//                     if (!uniqueUsersMap.has(u._id)) uniqueUsersMap.set(u._id, u);
//                 });

//                 const uniqueUsers = Array.from(uniqueUsersMap.values());

//                 // Mark active status
//                 uniqueUsers.forEach((u) => {
//                     u.hasActiveStatus = activeStatusUserIds.includes(u._id);
//                 });

//                 if (isMounted) setAllConnections(uniqueUsers);
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) setAllConnections([]);
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };

//         fetchFollowDetails();
//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken, activeStatusUserIds]);

//     const getAvatarSrc = (user: User): string =>
//         typeof user.avatarUrl === 'string' && user.avatarUrl.trim() !== ''
//             ? user.avatarUrl
//             : typeof defaultAvatar === 'string'
//                 ? defaultAvatar
//                 : defaultAvatar.src;

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             const formData = new FormData();
//             formData.append('visibility', visibility);
//             formData.append('expiresIn', '24h');
//             formData.append('media', selectedFile);

//             const res = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             });

//             if (!res.ok) throw new Error('Upload failed');
//             closeUploadModal();
//             await fetchStatuses();
//         } catch (err: any) {
//             setUploadError(err.message || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const SkeletonItem = () => (
//         <div className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer py-2 animate-pulse">
//             <Skeleton circle width={56} height={56} />
//             <Skeleton width={80} height={14} className="rounded-md" />
//         </div>
//     );

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             title={user.name}
//             onClick={() => {
//                 if (user.hasActiveStatus) setViewingStatusUser(user);
//             }}
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className={`w-14 h-14 rounded-full object-cover border-2 transition outline 
//         ${user.hasActiveStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                 onError={(e) => ((e.currentTarget as HTMLImageElement).src = getAvatarSrc(user))}
//             />
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//         </li>
//     );

//     const MyProfileBox = () => {
//         const avatar = getAvatarSrc(user as User);
//         const name = user?.name || 'You';
//         const id = user?._id || '';
//         const hasStatus = activeStatusUserIds.includes(id);

//         return (
//             <div
//                 className="flex flex-col items-center min-w-[80px] cursor-pointer mr-0 mb-3"
//                 onClick={() => {
//                     if (hasStatus) {
//                         setViewingStatusUser({
//                             _id: id,
//                             name,
//                             avatarUrl: user?.avatarUrl,
//                             mediaType: 'image',
//                         });
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={avatar}
//                         alt={name}
//                         className={`w-16 h-16 rounded-full object-cover border-2 transition outline 
//             ${hasStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                         onError={(e) => ((e.currentTarget as HTMLImageElement).src = avatar)}
//                     />
//                     <div
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             openUploadModal();
//                         }}
//                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold border-2 border-white cursor-pointer shadow-md"
//                         title="Upload status"
//                     >
//                         <Plus size={15} />
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const StatusViewer = () => {
//         if (!viewingStatusUser) return null;

//         return (
//             <div className="fixed top-0 left-0 w-full h-full bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full text-center">
//                     <h2 className="text-lg font-semibold mb-2">{viewingStatusUser.name}'s Status</h2>
//                     {viewingStatusUser.mediaType === 'video' ? (
//                         <video controls className="max-w-full h-auto rounded">
//                             <source src={`${API_BASE_URL}/status/view/${userId}`} type="video/mp4" />
//                             Your browser does not support the video tag.
//                         </video>
//                     ) : (
//                         <img
//                             src={`${API_BASE_URL}/status/view/${userId}`}
//                             alt="Status"
//                             className="max-w-full h-auto rounded"
//                         />
//                     )}
//                     <button
//                         onClick={() => setViewingStatusUser(null)}
//                         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96 p-4 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar">
//             <div>
//                 <h2 className="text-2xl font-extrabold text-gray-800 mb-2 border-b pb-2 border-gray-200">Connections</h2>

//                 {loading ? (
//                     <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </div>
//                 ) : allConnections.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No connections yet. Follow others to start building your network!
//                     </p>
//                 ) : (
//                     <ul className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <MyProfileBox />
//                         {allConnections.map(renderUserItem)}
//                     </ul>
//                 )}
//                 <hr className="text-gray-200" />
//             </div>

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={closeUploadModal}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             <StatusViewer />
//         </div>
//     );
// };

// export default ActivityBar;



// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     mediaType?: 'image' | 'video';
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();

//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [activeStatusUserIds, setActiveStatusUserIds] = useState<string[]>([]);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatusUser, setViewingStatusUser] = useState<User | null>(null);

//     const openUploadModal = () => setIsUploadModalOpen(true);
//     const closeUploadModal = () => {
//         setIsUploadModalOpen(false);
//         setSelectedFile(null);
//         setUploadError(null);
//     };

//     const fetchStatuses = async () => {
//         try {
//             const token = await getIdToken();
//             if (!token) return;

//             const res = await fetch(`${API_BASE_URL}/status`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`, // <- fixed!
//                 },
//             });

//             if (!res.ok) throw new Error('Failed to fetch statuses');

//             const data = await res.json();

//             // Extract unique userIds who have active statuses
//             const userIds: string[] = Array.from(new Set(
//                 data
//                     .map((status: any) => (typeof status.userId === 'string' ? status.userId : ''))
//                     .filter(id => id !== '')
//             ));
//             setActiveStatusUserIds(userIds);

//         } catch (err) {
//             console.error('Error fetching statuses', err);
//         }
//     };

//     useEffect(() => {
//         fetchStatuses();
//     }, [user]);

//     // Fetch user's followers and following lists and mark those with active status
//     useEffect(() => {
//         if (!userId) {
//             setLoading(false);
//             return;
//         }

//         let isMounted = true;

//         const fetchFollowDetails = async () => {
//             try {
//                 setLoading(true);
//                 const token = await getIdToken();
//                 if (!token) return;

//                 const res = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                     headers: {
//                         Authorization: `Bearer ${token}`, // <- fixed!
//                     },
//                 });

//                 if (!res.ok) throw new Error('Failed to fetch follow details');

//                 const data = await res.json();

//                 const followingList: User[] = Array.isArray(data.following) ? data.following : [];
//                 const followersList: User[] = Array.isArray(data.followers) ? data.followers : [];

//                 // Merge unique users from followers & following
//                 const uniqueUsersMap = new Map<string, User>();
//                 followingList.forEach((u) => uniqueUsersMap.set(u._id, u));
//                 followersList.forEach((u) => {
//                     if (!uniqueUsersMap.has(u._id)) uniqueUsersMap.set(u._id, u);
//                 });

//                 const uniqueUsers = Array.from(uniqueUsersMap.values());

//                 // Mark who has active status
//                 uniqueUsers.forEach((u) => {
//                     u.hasActiveStatus = activeStatusUserIds.includes(u._id);
//                 });

//                 if (isMounted) setAllConnections(uniqueUsers);
//             } catch (err) {
//                 console.error('ActivityBar: Error fetching follow details:', err);
//                 if (isMounted) setAllConnections([]);
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         };

//         fetchFollowDetails();

//         return () => {
//             isMounted = false;
//         };
//     }, [userId, getIdToken, activeStatusUserIds]);

//     // Helper to get avatar src fallback
//     const getAvatarSrc = (user: User): string =>
//         typeof user.avatarUrl === 'string' && user.avatarUrl.trim() !== ''
//             ? user.avatarUrl
//             : typeof defaultAvatar === 'string'
//                 ? defaultAvatar
//                 : defaultAvatar.src;

//     // Handle uploading new status
//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('No auth token');

//             const formData = new FormData();
//             formData.append('visibility', visibility);
//             formData.append('media', selectedFile);

//             const res = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     Authorization: `Bearer ${token}`, // <- fixed!
//                 },
//                 body: formData,
//             });

//             if (!res.ok) throw new Error('Upload failed');

//             closeUploadModal();
//             await fetchStatuses(); // Refresh statuses after upload
//         } catch (err: any) {
//             setUploadError(err.message || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };

//     // UI Skeleton while loading
//     const SkeletonItem = () => (
//         <div className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer py-2 animate-pulse">
//             <Skeleton circle width={56} height={56} />
//             <Skeleton width={80} height={14} className="rounded-md" />
//         </div>
//     );

//     // Render each user item in the list
//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             title={user.name}
//             onClick={() => {
//                 if (user.hasActiveStatus) setViewingStatusUser(user);
//             }}
//         >
//             <img
//                 src={getAvatarSrc(user)}
//                 alt={user.name}
//                 className={`w-14 h-14 rounded-full object-cover border-2 transition outline 
//           ${user.hasActiveStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                 onError={(e) => ((e.currentTarget as HTMLImageElement).src = getAvatarSrc(user))}
//             />
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</span>
//         </li>
//     );

//     // The logged-in user's box with upload button
//     const MyProfileBox = () => {
//         const avatar = getAvatarSrc(user as User);
//         const name = user?.name || 'You';
//         const id = user?._id || '';
//         const hasStatus = activeStatusUserIds.includes(id);

//         return (
//             <div
//                 className="flex flex-col items-center min-w-[80px] cursor-pointer mr-0 mb-3"
//                 onClick={() => {
//                     if (hasStatus) {
//                         setViewingStatusUser({
//                             _id: id,
//                             name,
//                             avatarUrl: user?.avatarUrl,
//                             mediaType: 'image',
//                         });
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={avatar}
//                         alt={name}
//                         className={`w-16 h-16 rounded-full object-cover border-2 transition outline 
//               ${hasStatus ? 'border-blue-500 outline-yellow-400' : 'border-transparent outline-gray-200'}`}
//                         onError={(e) => ((e.currentTarget as HTMLImageElement).src = avatar)}
//                     />
//                     <div
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             openUploadModal();
//                         }}
//                         className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold border-2 border-white cursor-pointer shadow-md"
//                         title="Upload status"
//                     >
//                         <Plus size={15} />
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // Status viewer modal to show image or video of selected user
//     const StatusViewer = () => {
//         if (!viewingStatusUser) return null;

//         const statusUserId = viewingStatusUser._id;
//         const mediaType = viewingStatusUser.mediaType || 'image';

//         return (
//             <div className="fixed top-0 left-0 w-full h-full bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full text-center">
//                     <h2 className="text-lg font-semibold mb-2">{viewingStatusUser.name}&apos;s Status</h2>
//                     {viewingStatusUser.mediaType === 'video' ? (
//                         <video
//                             controls
//                             className="max-w-full h-auto rounded"
//                             onError={() => console.error('Failed to load video')}
//                             preload="auto"
//                             crossOrigin="anonymous"
//                         >
//                             <source
//                                 src={`${API_BASE_URL}/status/view/${viewingStatusUser._id}`}
//                                 type="video/mp4"
//                             />
//                             Your browser does not support the video tag.
//                         </video>
//                     ) : (
//                         <img
//                             src={`${API_BASE_URL}/status/view/${viewingStatusUser._id}`}
//                             alt="Status"
//                             className="max-w-full h-auto rounded"
//                         />
//                     )}
//                     <button
//                         onClick={() => setViewingStatusUser(null)}
//                         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-64 md:w-72 lg:w-80 xl:w-96 p-4 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar">
//             <div>
//                 <h2 className="text-2xl font-extrabold text-gray-800 mb-2 border-b pb-2 border-gray-200">
//                     Connections
//                 </h2>

//                 {loading ? (
//                     <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <SkeletonItem />
//                         <SkeletonItem />
//                         <SkeletonItem />
//                     </div>
//                 ) : allConnections.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-md">
//                         No connections yet. Follow others to start building your network!
//                     </p>
//                 ) : (
//                     <ul className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
//                         <MyProfileBox />
//                         {allConnections.map(renderUserItem)}
//                     </ul>
//                 )}
//                 <hr className="text-gray-200" />
//             </div>

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={closeUploadModal}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             <StatusViewer />
//         </div>
//     );
// };

// export default ActivityBar;











// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     activeStatus?: Status;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     const fetchStatuses = async () => {
//         if (!userId) return;

//         try {
//             setError(null);
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses');
//             }

//             const statuses = await response.json();

//             setAllConnections(prev => prev.map(connection => {
//                 const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                 return {
//                     ...connection,
//                     hasActiveStatus: !!userStatus,
//                     activeStatus: userStatus || null
//                 };
//             }));

//         } catch (err) {
//             console.error('Error fetching statuses:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses');
//         }
//     };

//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];
//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values());
//             setAllConnections(uniqueConnections);

//             // Fetch statuses immediately after getting connections
//             await fetchStatuses();

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchConnections();
//         }
//     }, [userId]);

//     useEffect(() => {
//         if (userId && statusRefreshKey > 0) {
//             fetchStatuses();
//         }
//     }, [userId, statusRefreshKey]);

//     // const handleUpload = async () => {
//     //     if (!selectedFile) return;
//     //     setUploading(true);
//     //     setUploadError(null);

//     //     try {
//     //         const token = await getIdToken();
//     //         if (!token) throw new Error('Authentication required');

//     //         const formData = new FormData();
//     //         formData.append('media', selectedFile);
//     //         formData.append('visibility', visibility);

//     //         const response = await fetch(`${API_BASE_URL}/status/upload`, {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Authorization': `Bearer ${token}`,
//     //             },
//     //             body: formData,
//     //         });

//     //         if (!response.ok) {
//     //             const errorData = await response.json().catch(() => ({}));
//     //             throw new Error(errorData.message || 'Upload failed');
//     //         }

//     //         setIsUploadModalOpen(false);
//     //         setSelectedFile(null);
//     //         setStatusRefreshKey(prev => prev + 1);

//     //     } catch (err) {
//     //         setUploadError(err instanceof Error ? err.message : 'Upload failed');
//     //     } finally {
//     //         setUploading(false);
//     //     }
//     // };
//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Upload failed');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setStatusRefreshKey(prev => prev + 1);
//         } catch (err) {
//             setUploadError(err instanceof Error ? err.message : 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };


//     const handleStatusView = async (user: User) => {
//         if (!user.hasActiveStatus || !user.activeStatus) return;

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const response = await fetch(`${API_BASE_URL}/status/view/${user.activeStatus._id}`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to view status');
//             }

//             setViewingStatus({ user, status: user.activeStatus });
//         } catch (err) {
//             console.error('Error viewing status:', err);
//             setError(err instanceof Error ? err.message : 'Failed to view status');
//         }
//     };

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             onClick={() => user.hasActiveStatus && handleStatusView(user)}
//         >
//             <div className="relative">
//                 <img
//                     src={user.avatarUrl || defaultAvatarUrl}
//                     alt={user.name}
//                     className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                     }}
//                 />
//                 {user.hasActiveStatus && (
//                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                 )}
//             </div>
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                 {user.name}
//             </span>
//         </li>
//     );

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b">
//                             <div className="flex items-center">
//                                 <img
//                                     src={viewingStatus.user.avatarUrl || defaultAvatarUrl}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain"
//                                     autoPlay
//                                 >
//                                     <source
//                                         src={viewingStatus.status.mediaUrl}
//                                         type="video/mp4"
//                                     />
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={viewingStatus.status.mediaUrl}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain"
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;




// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     activeStatus?: Status;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     const fetchStatuses = async () => {
//         if (!userId) return;

//         try {
//             setError(null);
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses');
//             }

//             const statuses = await response.json();

//             setAllConnections(prev => prev.map(connection => {
//                 const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                 return {
//                     ...connection,
//                     hasActiveStatus: !!userStatus,
//                     activeStatus: userStatus || null
//                 };
//             }));

//         } catch (err) {
//             console.error('Error fetching statuses:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses');
//         }
//     };

//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];
//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values());
//             setAllConnections(uniqueConnections);

//             await fetchStatuses();

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchConnections();
//         }
//     }, [userId]);

//     useEffect(() => {
//         if (userId && statusRefreshKey > 0) {
//             fetchStatuses();
//         }
//     }, [userId, statusRefreshKey]);

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     // Do NOT set 'Content-Type': 'multipart/form-data' here. The browser sets it automatically.
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 // Log detailed error from server
//                 console.error('Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Upload failed');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setStatusRefreshKey(prev => prev + 1);
//         } catch (err) {
//             console.error('Error during upload:', err); // Log full error object
//             setUploadError(err instanceof Error ? err.message : 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };


//     const handleStatusView = async (user: User) => {
//         if (!user.hasActiveStatus || !user.activeStatus) return;

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const response = await fetch(`${API_BASE_URL}/status/view/${user.activeStatus._id}`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to view status');
//             }

//             setViewingStatus({ user, status: user.activeStatus });
//         } catch (err) {
//             console.error('Error viewing status:', err);
//             setError(err instanceof Error ? err.message : 'Failed to view status');
//         }
//     };

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             onClick={() => user.hasActiveStatus && handleStatusView(user)}
//         >
//             <div className="relative">
//                 <img
//                     src={user.avatarUrl || defaultAvatarUrl}
//                     alt={user.name}
//                     className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                     }}
//                 />
//                 {user.hasActiveStatus && (
//                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                 )}
//             </div>
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                 {user.name}
//             </span>
//         </li>
//     );

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b">
//                             <div className="flex items-center">
//                                 <img
//                                     src={viewingStatus.user.avatarUrl || defaultAvatarUrl}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain"
//                                     autoPlay
//                                 >
//                                     <source
//                                         src={viewingStatus.status.mediaUrl}
//                                         type="video/mp4"
//                                     />
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={viewingStatus.status.mediaUrl}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain"
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;





// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// // API_BASE_URL is for your API endpoints (e.g., /api/status, /api/user)
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

// // MEDIA_BASE_URL is for accessing static files (like uploads, avatars)
// // It should point to the root of your backend server.
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001'; // <<< --- NEW LINE

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string; // This will come from the backend with backslashes
//     createdAt: string;
//     viewedBy: string[];
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     activeStatus?: Status;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user } = useAuth();
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     // --- Helper function to get the full URL for media ---
//     const getFullMediaUrl = (relativePath: string) => {
//         // Replace backslashes with forward slashes for URLs
//         const cleanedPath = relativePath.replace(/\\/g, '/');
//         // Construct the full URL using the MEDIA_BASE_URL
//         return `${MEDIA_BASE_URL}/${cleanedPath}`;
//     };

//     const fetchStatuses = async () => {
//         if (!userId) return;

//         try {
//             setError(null);
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses');
//             }

//             const statuses = await response.json();

//             setAllConnections(prev => prev.map(connection => {
//                 const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                 return {
//                     ...connection,
//                     hasActiveStatus: !!userStatus,
//                     activeStatus: userStatus || null
//                 };
//             }));

//         } catch (err) {
//             console.error('Error fetching statuses:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses');
//         }
//     };

//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];
//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values());
//             setAllConnections(uniqueConnections);

//             await fetchStatuses();

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchConnections();
//         }
//     }, [userId]);

//     useEffect(() => {
//         if (userId && statusRefreshKey > 0) {
//             fetchStatuses();
//         }
//     }, [userId, statusRefreshKey]);

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     // Do NOT set 'Content-Type': 'multipart/form-data' here. The browser sets it automatically.
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 // Log detailed error from server
//                 console.error('Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Upload failed');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setStatusRefreshKey(prev => prev + 1);
//         } catch (err) {
//             console.error('Error during upload:', err); // Log full error object
//             setUploadError(err instanceof Error ? err.message : 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };


//     const handleStatusView = async (user: User) => {
//         if (!user.hasActiveStatus || !user.activeStatus) return;

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const response = await fetch(`${API_BASE_URL}/status/view/${user.activeStatus._id}`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to view status');
//             }

//             setViewingStatus({ user, status: user.activeStatus });
//         } catch (err) {
//             console.error('Error viewing status:', err);
//             setError(err instanceof Error ? err.message : 'Failed to view status');
//         }
//     };

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             onClick={() => user.hasActiveStatus && handleStatusView(user)}
//         >
//             <div className="relative">
//                 <img
//                     // Ensure avatarUrl also uses getFullMediaUrl if it's a relative path
//                     src={
//                         user.avatarUrl
//                             ? user.avatarUrl.startsWith('http') // Check if it's already an absolute URL
//                                 ? user.avatarUrl // If absolute, use as is
//                                 : getFullMediaUrl(user.avatarUrl) // If relative, use helper
//                             : defaultAvatarUrl
//                     }
//                     alt={user.name}
//                     className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                     }}
//                 />
//                 {user.hasActiveStatus && (
//                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                 )}
//             </div>
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                 {user.name}
//             </span>
//         </li>
//     );

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b">
//                             <div className="flex items-center">
//                                 <img
//                                     // Make sure avatarUrl here is also correctly resolved if it's a relative path
//                                     src={
//                                         viewingStatus.user.avatarUrl
//                                             ? viewingStatus.user.avatarUrl.startsWith('http') // Check if already absolute
//                                                 ? viewingStatus.user.avatarUrl // If absolute, use as is
//                                                 : getFullMediaUrl(viewingStatus.user.avatarUrl) // If relative, use helper
//                                             : defaultAvatarUrl
//                                     }
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain"
//                                     autoPlay
//                                 >
//                                     <source
//                                         // Use the helper function here!
//                                         src={getFullMediaUrl(viewingStatus.status.mediaUrl)} // <<< --- CORRECTED
//                                         type="video/mp4"
//                                     />
//                                 </video>
//                             ) : (
//                                 <img
//                                     // Use the helper function here!
//                                     src={getFullMediaUrl(viewingStatus.status.mediaUrl)} // <<< --- CORRECTED
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain"
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;










// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     activeStatus?: Status;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth(); // Renamed 'user' to 'authUser' to avoid conflict
//     const [currentUserData, setCurrentUserData] = useState<User | null>(null); // State for current user's data
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     // Helper function to get the full URL for media/avatars
//     const getFullMediaUrl = (relativePath: string) => {
//         if (relativePath.startsWith('http')) { // Already an absolute URL
//             return relativePath;
//         }
//         // Replace backslashes with forward slashes for URLs
//         const cleanedPath = relativePath.replace(/\\/g, '/');
//         // Construct the full URL using the MEDIA_BASE_URL
//         return `${MEDIA_BASE_URL}/${cleanedPath}`;
//     };

//     // --- NEW: Function to fetch current user's details and status ---
//     const fetchCurrentUserDataAndStatus = async () => {
//         if (!userId) return;

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available');

//             // Fetch current user's profile
//             const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userProfileResponse.ok) {
//                 throw new Error('Failed to fetch current user profile');
//             }
//             const userProfile = await userProfileResponse.json();

//             // Fetch current user's status
//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userId}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userStatusResponse.ok) {
//                 // If no status or error fetching, that's okay, just log and proceed without status
//                 console.warn('Failed to fetch current user status, proceeding without it.');
//                 setCurrentUserData({
//                     _id: userProfile._id,
//                     name: userProfile.name,
//                     avatarUrl: userProfile.avatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//                 return;
//             }
//             const userStatuses = await userStatusResponse.json();
//             const activeUserStatus = userStatuses.length > 0 ? userStatuses[0] : null; // Assuming most recent/active

//             setCurrentUserData({
//                 _id: userProfile._id,
//                 name: userProfile.name,
//                 avatarUrl: userProfile.avatarUrl,
//                 hasActiveStatus: !!activeUserStatus,
//                 activeStatus: activeUserStatus || undefined
//             });

//         } catch (err) {
//             console.error('Error fetching current user data or status:', err);
//             // Even on error, try to set basic user data if authUser exists
//             if(authUser){
//                 setCurrentUserData({
//                     _id: authUser.uid, // Use firebase UID as fallback if MongoDB ID isn't immediately available
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             } else {
//                 setError('Failed to load your profile and status.');
//             }
//         }
//     };

//     const fetchStatuses = async () => {
//         if (!userId) return;

//         try {
//             setError(null);
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses');
//             }

//             const statuses = await response.json();

//             setAllConnections(prev => prev.map(connection => {
//                 const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                 return {
//                     ...connection,
//                     hasActiveStatus: !!userStatus,
//                     activeStatus: userStatus || null
//                 };
//             }));

//         } catch (err) {
//             console.error('Error fetching statuses:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch statuses');
//         }
//     };

//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];
//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values());
//             setAllConnections(uniqueConnections);

//             await fetchStatuses(); // Fetch others' statuses after connections
//             await fetchCurrentUserDataAndStatus(); // <<< --- Fetch current user's data and status here

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchConnections();
//         }
//     }, [userId]);

//     useEffect(() => {
//         if (userId && statusRefreshKey > 0) {
//             fetchConnections(); // Re-fetch all data when status is refreshed
//         }
//     }, [userId, statusRefreshKey]);

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Upload failed');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setStatusRefreshKey(prev => prev + 1); // Trigger refresh
//         } catch (err) {
//             console.error('Error during upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };


//     const handleStatusView = async (userToView: User) => { // Renamed param to avoid confusion
//         if (!userToView.hasActiveStatus || !userToView.activeStatus) return;

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required');

//             // Only mark as viewed if it's not the current user's status
//             if (userToView._id !== userId) {
//                 const response = await fetch(`${API_BASE_URL}/status/view/${userToView.activeStatus._id}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!response.ok) {
//                     console.error('Failed to mark status as viewed:', await response.json());
//                     // Don't throw error to prevent blocking view, just log
//                 }
//             }

//             setViewingStatus({ user: userToView, status: userToView.activeStatus });
//         } catch (err) {
//             console.error('Error viewing status:', err);
//             setError(err instanceof Error ? err.message : 'Failed to view status');
//         }
//     };

//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             onClick={() => user.hasActiveStatus && handleStatusView(user)}
//         >
//             <div className="relative">
//                 <img
//                     src={user.avatarUrl ? getFullMediaUrl(user.avatarUrl) : defaultAvatarUrl}
//                     alt={user.name}
//                     className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                     }}
//                 />
//                 {user.hasActiveStatus && (
//                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                 )}
//             </div>
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                 {user.name}
//             </span>
//         </li>
//     );

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {/* Render current user's status first */}
//                     {currentUserData && renderUserItem(currentUserData)}
//                     {/* Then render other connections */}
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b">
//                             <div className="flex items-center">
//                                 <img
//                                     src={viewingStatus.user.avatarUrl ? getFullMediaUrl(viewingStatus.user.avatarUrl) : defaultAvatarUrl}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain"
//                                     autoPlay
//                                 >
//                                     <source
//                                         src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                         type="video/mp4"
//                                     />
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain"
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;




// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png'; // Make sure this path is correct
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal'; // Make sure this component exists and works

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// // Define the Status interface based on your backend's status schema
// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
//     visibility: 'public' | 'followers'; // Added visibility as it's crucial for status logic
//     // Add other fields if your Status schema has them (e.g., caption, expiresAt)
// }

// // Define the User interface based on how you expect user data on the frontend
// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string; // Optional because it might not always be present or could be default
//     hasActiveStatus?: boolean; // Indicates if this user has any active status
//     activeStatus?: Status; // The actual active status object, if available
// }

// interface ActivityBarProps {
//     userId: string | null; // The MongoDB ID of the currently authenticated user
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth(); // `authUser` is from Firebase Auth
//     const [currentUserData, setCurrentUserData] = useState<User | null>(null); // MongoDB user data
//     const [allConnections, setAllConnections] = useState<User[]>([]); // Users the current user is connected with
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public'); // Default visibility for new status
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null); // State for the currently viewed status
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0); // To trigger re-fetches

//     // Ensure defaultAvatarUrl is always a string for the src attribute
//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     // Helper function to get the full URL for media/avatars
//     const getFullMediaUrl = (relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             // If path is missing or already an absolute URL (e.g., from Google profile), return as is
//             return relativePath || defaultAvatarUrl; // Fallback to default if no path
//         }
//         // Replace backslashes with forward slashes for URL compatibility
//         const cleanedPath = relativePath.replace(/\\/g, '/');
//         // Construct the full URL using the MEDIA_BASE_URL
//         return `${MEDIA_BASE_URL}/${cleanedPath}`;
//     };

//     // --- Function to fetch the current authenticated user's profile and statuses ---
//     const fetchCurrentUserDataAndStatus = async () => {
//         if (!userId) {
//             // If userId (MongoDB ID) is not available, we can't fetch.
//             // This might happen if the Firebase user exists but hasn't synced to Mongo yet.
//             // A fallback might be to display the Firebase authUser data.
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid, // Use Firebase UID as a temporary ID
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available.');

//             // 1. Fetch current user's profile using the /api/users/profile endpoint
//             // This endpoint relies on the token to identify the user.
//             const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userProfileResponse.ok) {
//                 const errorData = await userProfileResponse.json().catch(() => ({}));
//                 console.error('Failed to fetch current user profile:', errorData);
//                 throw new Error(errorData.message || 'Failed to fetch your profile data.');
//             }
//             const userProfile = await userProfileResponse.json();

//             // 2. Fetch current user's statuses from /api/status/user/:userId
//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userId}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatus: Status | undefined = undefined;
//             if (userStatusResponse.ok) {
//                 const userStatuses: Status[] = await userStatusResponse.json();
//                 if (userStatuses && userStatuses.length > 0) {
//                     // For your own profile, you likely want to see any active status.
//                     // If you want only public, add userStatuses.find(s => s.visibility === 'public')
//                     // Or if you want the latest, sort by createdAt.
//                     activeUserStatus = userStatuses[0]; // Take the first available status
//                 }
//             } else {
//                 console.warn(`No active status found for current user (${userId}), or failed to fetch statuses. Status: ${userStatusResponse.status}`);
//                 // console.warn('Status response text:', await userStatusResponse.text()); // Uncomment for more debug info
//             }

//             // Update the state with the current user's full data and status info
//             setCurrentUserData({
//                 _id: userProfile._id,
//                 name: userProfile.name,
//                 avatarUrl: userProfile.avatarUrl,
//                 hasActiveStatus: !!activeUserStatus, // True if activeUserStatus is not null/undefined
//                 activeStatus: activeUserStatus
//             });

//         } catch (err) {
//             console.error('Error in fetchCurrentUserDataAndStatus:', err);
//             setError(err instanceof Error ? err.message : 'Could not load your stories.');
//             // Fallback for currentUserData if fetching fails
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid,
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             }
//         }
//     };

//     // --- Function to fetch statuses of connections (other users) ---
//     const fetchStatusesForConnections = async () => {
//         if (!userId) return; // Need current user's ID to fetch connections' statuses

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, { // This endpoint should return all active statuses for connected users
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses for connections.');
//             }

//             const statuses: Status[] = await response.json();

//             // Map the fetched statuses to the existing connection data
//             setAllConnections(prevConnections => {
//                 return prevConnections.map(connection => {
//                     const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                     return {
//                         ...connection,
//                         hasActiveStatus: !!userStatus,
//                         activeStatus: userStatus || undefined // Set to undefined if no status found
//                     };
//                 });
//             });

//         } catch (err) {
//             console.error('Error fetching statuses for connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections statuses.');
//         }
//     };

//     // --- Function to fetch the list of users the current user is following/followers with ---
//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             // Fetch the list of users the current user is following or is followed by
//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections.');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];

//             // Filter out the current user themselves from the connections list
//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values())
//                 .filter(conn => conn._id !== userId);

//             // Temporarily set connections without status, status will be fetched next
//             setAllConnections(uniqueConnections);

//             // Fetch statuses for these connections
//             await fetchStatusesForConnections();

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Main useEffect to trigger initial data fetching
//     useEffect(() => {
//         if (userId) {
//             // First, fetch the current user's profile and status
//             fetchCurrentUserDataAndStatus();
//             // Then, fetch the list of connections and their statuses
//             fetchConnections();
//         } else {
//             // If no userId (e.g., not logged in or Firebase UID not mapped to Mongo yet)
//             setLoading(false);
//             setCurrentUserData(null);
//             setAllConnections([]);
//         }
//     }, [userId, statusRefreshKey]); // Re-run when userId changes or a status is uploaded/deleted

//     // Handle status upload
//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public'); // Reset visibility for next upload
//             setStatusRefreshKey(prev => prev + 1); // Trigger a re-fetch of all stories
//         } catch (err) {
//             console.error('Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     // Handle opening and marking a status as viewed
//     const handleStatusView = async (userToView: User) => {
//         // Ensure the user has an active status to view
//         if (!userToView.hasActiveStatus || !userToView.activeStatus) {
//             console.warn(`Attempted to view status for ${userToView.name} but no active status found.`);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to view status.');

//             // Only send 'viewed' request if it's not the current user's own status
//             if (userToView._id !== userId) {
//                 const response = await fetch(`${API_BASE_URL}/status/view/${userToView.activeStatus._id}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                 });

//                 if (!response.ok) {
//                     // Log the error but don't prevent viewing the status
//                     console.error('Failed to mark status as viewed:', await response.json());
//                 } else {
//                     // Optionally refresh connections to update 'viewed' status in UI
//                     setStatusRefreshKey(prev => prev + 1);
//                 }
//             }

//             // Set the state to display the status in the modal
//             setViewingStatus({ user: userToView, status: userToView.activeStatus });
//         } catch (err) {
//             console.error('Error handling status view:', err);
//             setError(err instanceof Error ? err.message : 'Failed to display status.');
//         }
//     };

//     // JSX for rendering a single user item in the stories bar
//     const renderUserItem = (user: User) => (
//         <li
//             key={user._id}
//             className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//             // Only allow click if the user has an active status
//             onClick={() => {
//                 if (user.hasActiveStatus) {
//                     handleStatusView(user);
//                     console.log(`DEBUG: Clicked on user: ${user.name}, hasActiveStatus: ${user.hasActiveStatus}`);
//                 }
//             }}
//         >
//             <div className="relative">
//                 <img
//                     src={getFullMediaUrl(user.avatarUrl)} // Use the helper function
//                     alt={user.name}
//                     className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                     onError={(e) => {
//                         // Fallback to default avatar if the image fails to load
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                     }}
//                 />
//                 {/* Visual indicator for active status */}
//                 {user.hasActiveStatus && (
//                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                 )}
//             </div>
//             <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                 {user.name}
//             </span>
//         </li>
//     );

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {/* Render current user's status first IF currentUserData exists */}
//                     {currentUserData && renderUserItem(currentUserData)}
//                     {/* Then render other connections */}
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             {/* Upload Modal */}
//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {/* Status Viewing Modal */}
//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b flex justify-between items-center">
//                             <div className="flex items-center">
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.user.avatarUrl)}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     autoPlay
//                                 // Add onError for video if needed, similar to img
//                                 >
//                                     <source
//                                         src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                         type="video/mp4"
//                                     />
//                                     Your browser does not support the video tag.
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     onError={(e) => {
//                                         const target = e.target as HTMLImageElement;
//                                         target.src = defaultAvatarUrl; // Fallback for status image too
//                                     }}
//                                 />
//                             )}
//                         </div>
//                         {/* You can add status details like timestamp, view count here */}
//                         <div className="p-4 border-t flex justify-end">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;










// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png'; // Make sure this path is correct
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal'; // Make sure this component exists and works

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// // Define the Status interface based on your backend's status schema
// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
//     visibility: 'public' | 'followers'; // Added visibility as it's crucial for status logic
//     // Add other fields if your Status schema has them (e.g., caption, expiresAt)
// }

// // Define the User interface based on how you expect user data on the frontend
// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string; // Optional because it might not always be present or could be default
//     hasActiveStatus?: boolean; // Indicates if this user has any active status
//     activeStatus?: Status; // The actual active status object, if available
// }

// interface ActivityBarProps {
//     userId: string | null; // The MongoDB ID of the currently authenticated user
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth(); // `authUser` is from Firebase Auth
//     const [currentUserData, setCurrentUserData] = useState<User | null>(null); // MongoDB user data
//     const [allConnections, setAllConnections] = useState<User[]>([]); // Users the current user is connected with
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public'); // Default visibility for new status
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null); // State for the currently viewed status
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0); // To trigger re-fetches

//     // Ensure defaultAvatarUrl is always a string for the src attribute
//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     // Helper function to get the full URL for media/avatars
//     const getFullMediaUrl = (relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath || defaultAvatarUrl;
//         }
//         const cleanedPath = relativePath.replace(/\\/g, '/');
//         return `${MEDIA_BASE_URL}/${cleanedPath}`;
//     };

//     // --- Function to fetch the current authenticated user's profile and statuses ---
//     const fetchCurrentUserDataAndStatus = async () => {
//         if (!userId) {
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid,
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available.');

//             // 1. Fetch current user's profile
//             const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userProfileResponse.ok) {
//                 const errorData = await userProfileResponse.json().catch(() => ({}));
//                 console.error('Failed to fetch current user profile:', errorData);
//                 throw new Error(errorData.message || 'Failed to fetch your profile data.');
//             }
//             const userProfile = await userProfileResponse.json();
//             // console.log('DEBUG: Fetched User Profile:', userProfile); // Debug Log

//             // 2. Fetch current user's statuses
//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userId}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatus: Status | undefined = undefined;
//             if (userStatusResponse.ok) {
//                 const userStatuses: Status[] = await userStatusResponse.json();
//                 // console.log('DEBUG: Fetched User Statuses:', userStatuses); // Debug Log

//                 if (userStatuses && userStatuses.length > 0) {
//                     // For the current user, we want to display ANY active status.
//                     // If you have multiple, you might want to display the latest one,
//                     // or cycle through them in the modal. For now, we take the first.
//                     activeUserStatus = userStatuses[0];
//                 }
//             } else {
//                 console.warn(`No active status found for current user (${userId}), or failed to fetch statuses. Status: ${userStatusResponse.status}`);
//             }

//             // Set currentUserData with the fetched profile and determined active status
//             const newCurrentUserData = {
//                 _id: userProfile._id,
//                 name: userProfile.name,
//                 avatarUrl: userProfile.avatarUrl,
//                 hasActiveStatus: !!activeUserStatus, // True if activeUserStatus is not null/undefined
//                 activeStatus: activeUserStatus
//             };
//             setCurrentUserData(newCurrentUserData);
//             // console.log('DEBUG: currentUserData after setting:', newCurrentUserData); // Debug Log

//         } catch (err) {
//             console.error('Error in fetchCurrentUserDataAndStatus:', err);
//             setError(err instanceof Error ? err.message : 'Could not load your stories.');
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid,
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             }
//         }
//     };

//     const fetchStatusesForConnections = async () => {
//         if (!userId) return;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses for connections.');
//             }

//             const statuses: Status[] = await response.json();

//             setAllConnections(prevConnections => {
//                 return prevConnections.map(connection => {
//                     const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                     return {
//                         ...connection,
//                         hasActiveStatus: !!userStatus,
//                         activeStatus: userStatus || undefined
//                     };
//                 });
//             });

//         } catch (err) {
//             console.error('Error fetching statuses for connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections statuses.');
//         }
//     };

//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];

//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values())
//                 .filter(conn => conn._id !== userId);

//             setAllConnections(uniqueConnections);

//             await fetchStatusesForConnections();

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchCurrentUserDataAndStatus(); // Always fetch own data first
//             fetchConnections(); // Then fetch connections and their statuses
//         } else {
//             setLoading(false);
//             setCurrentUserData(null);
//             setAllConnections([]);
//         }
//     }, [userId, statusRefreshKey]);

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1); // Trigger re-fetch of all stories, including own
//         } catch (err) {
//             console.error('Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleStatusView = async (userToView: User) => {
//         if (!userToView.hasActiveStatus || !userToView.activeStatus) {
//             console.warn(`Attempted to view status for ${userToView.name} but no active status found. This should not happen if the click was enabled.`);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to view status.');

//             // Only send 'viewed' request if it's NOT the current user's own status
//             if (userToView._id !== userId) {
//                 // Ensure the current user's ID is available for marking as viewed
//                 if (currentUserData?._id) {
//                     const response = await fetch(`${API_BASE_URL}/status/view/${userToView.activeStatus._id}`, {
//                         method: 'POST',
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json',
//                         },
//                     });

//                     if (!response.ok) {
//                         console.error('Failed to mark status as viewed:', await response.json());
//                     } else {
//                         setStatusRefreshKey(prev => prev + 1); // Refresh to update viewed status in UI
//                     }
//                 } else {
//                     console.warn("Cannot mark status as viewed: Current user's MongoDB ID not available.");
//                 }
//             } else {
//                 console.log(`DEBUG: Viewing own status for ${userToView.name}. No 'viewed' request sent.`);
//             }


//             setViewingStatus({ user: userToView, status: userToView.activeStatus });
//             // console.log('DEBUG: Viewing status set:', { user: userToView.name, statusId: userToView.activeStatus._id }); // Debug Log
//         } catch (err) {
//             console.error('Error handling status view:', err);
//             setError(err instanceof Error ? err.message : 'Failed to display status.');
//         }
//     };

//     // JSX for rendering a single user item in the stories bar
//     const renderUserItem = (user: User) => {
//         // console.log(`DEBUG: Rendering user: ${user.name}, ID: ${user._id}, hasActiveStatus: ${user.hasActiveStatus}`); // Debug Log
//         return (
//             <li
//                 key={user._id}
//                 className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//                 // The onClick handler is critical. It should fire handleStatusView only if hasActiveStatus is true.
//                 onClick={() => {
//                     // console.log(`DEBUG: Clicked on ${user.name}. Checking hasActiveStatus: ${user.hasActiveStatus}`); // Debug Log
//                     if (user.hasActiveStatus && user.activeStatus) { // Ensure activeStatus object is also present
//                         handleStatusView(user);
//                     } else {
//                         // console.log(`DEBUG: ${user.name} does not have an active status or status object is missing. Not opening.`); // Debug Log
//                         // Optionally, show a toast/message: "No status available."
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className={`w-14 h-14 rounded-full object-cover border-2 ${
//                             user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl;
//                         }}
//                     />
//                     {/* Visual indicator for active status */}
//                     {user.hasActiveStatus && (
//                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                     )}
//                 </div>
//                 <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                     {user.name}
//                 </span>
//             </li>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {/* Render current user's status first IF currentUserData exists */}
//                     {currentUserData && renderUserItem(currentUserData)}
//                     {/* Then render other connections */}
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             {/* Upload Modal */}
//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {/* Status Viewing Modal */}
//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b flex justify-between items-center">
//                             <div className="flex items-center">
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.user.avatarUrl)}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     autoPlay
//                                 >
//                                     <source
//                                         src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                         type="video/mp4"
//                                     />
//                                     Your browser does not support the video tag.
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     onError={(e) => {
//                                         const target = e.target as HTMLImageElement;
//                                         target.src = defaultAvatarUrl;
//                                     }}
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t flex justify-end">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;








// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from './AuthProvider';
// import defaultAvatar from '../app/assets/userLogo.png';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { Plus } from 'lucide-react';
// import UploadModal from './UploadModal';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

// interface Status {
//     _id: string;
//     userId: string;
//     mediaType: 'image' | 'video';
//     mediaUrl: string;
//     createdAt: string;
//     viewedBy: string[];
//     visibility: 'public' | 'followers';
// }

// interface User {
//     _id: string;
//     name: string;
//     avatarUrl?: string;
//     hasActiveStatus?: boolean;
//     activeStatus?: Status;
// }

// interface ActivityBarProps {
//     userId: string | null;
// }

// const ActivityBar = ({ userId }: ActivityBarProps) => {
//     const { getIdToken, user: authUser } = useAuth();
//     const [currentUserData, setCurrentUserData] = useState<User | null>(null);
//     const [allConnections, setAllConnections] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState<string | null>(null);
//     const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
//     const [statusRefreshKey, setStatusRefreshKey] = useState(0);

//     const defaultAvatarUrl = typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;

//     const getFullMediaUrl = (relativePath?: string): string => {
//         if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
//             return relativePath || defaultAvatarUrl;
//         }
//         const cleanedPath = relativePath.replace(/\\/g, '/');
//         return `${MEDIA_BASE_URL}/${cleanedPath}`;
//     };

//     const fetchCurrentUserDataAndStatus = async () => {
//         if (!userId) {
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid,
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             }
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication token not available.');

//             // 1. Fetch current user's profile
//             const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             if (!userProfileResponse.ok) {
//                 const errorData = await userProfileResponse.json().catch(() => ({}));
//                 console.error('Failed to fetch current user profile:', errorData);
//                 throw new Error(errorData.message || 'Failed to fetch your profile data.');
//             }
//             const userProfile = await userProfileResponse.json();
//             console.log('DEBUG: User Profile:', userProfile); // <--- DEBUG LOG

//             // 2. Fetch current user's statuses
//             const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userId}`, {
//                 method: 'GET',
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             let activeUserStatus: Status | undefined = undefined;
//             if (userStatusResponse.ok) {
//                 const userStatuses: Status[] = await userStatusResponse.json();
//                 console.log('DEBUG: Fetched User Statuses:', userStatuses); // <--- DEBUG LOG

//                 if (userStatuses && userStatuses.length > 0) {
//                     activeUserStatus = userStatuses[0];
//                 }
//             } else {
//                 console.warn(`No active status found for current user (${userId}), or failed to fetch statuses. Status: ${userStatusResponse.status}`);
//             }

//             const newCurrentUserData = {
//                 _id: userProfile._id,
//                 name: userProfile.name,
//                 avatarUrl: userProfile.avatarUrl,
//                 hasActiveStatus: !!activeUserStatus,
//                 activeStatus: activeUserStatus
//             };
//             setCurrentUserData(newCurrentUserData);
//             console.log('DEBUG: currentUserData after setting:', newCurrentUserData); // <--- DEBUG LOG

//         } catch (err) {
//             console.error('Error in fetchCurrentUserDataAndStatus:', err);
//             setError(err instanceof Error ? err.message : 'Could not load your stories.');
//             if (authUser) {
//                 setCurrentUserData({
//                     _id: authUser.uid,
//                     name: authUser.displayName || 'You',
//                     avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
//                     hasActiveStatus: false,
//                     activeStatus: undefined
//                 });
//             }
//         }
//     };

//     const fetchStatusesForConnections = async () => {
//         if (!userId) return;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/status`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch statuses for connections.');
//             }

//             const statuses: Status[] = await response.json();

//             setAllConnections(prevConnections => {
//                 return prevConnections.map(connection => {
//                     const userStatus = statuses.find((s: Status) => s.userId === connection._id);
//                     return {
//                         ...connection,
//                         hasActiveStatus: !!userStatus,
//                         activeStatus: userStatus || undefined
//                     };
//                 });
//             });

//         } catch (err) {
//             console.error('Error fetching statuses for connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections statuses.');
//         }
//     };

//     const fetchConnections = async () => {
//         if (!userId) return;

//         try {
//             setLoading(true);
//             setError(null);
//             const token = await getIdToken();

//             if (!token) {
//                 setError('Authentication token not available');
//                 return;
//             }

//             const response = await fetch(`${API_BASE_URL}/user/follow-details/${userId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to fetch connections');
//             }

//             const data = await response.json();
//             const connections = [...(data.following || []), ...(data.followers || [])];

//             const uniqueConnections = Array.from(new Map(connections.map(c => [c._id, c])).values())
//                 .filter(conn => conn._id !== userId);

//             setAllConnections(uniqueConnections);

//             await fetchStatusesForConnections();

//         } catch (err) {
//             console.error('Error fetching connections:', err);
//             setError(err instanceof Error ? err.message : 'Failed to fetch connections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (userId) {
//             fetchCurrentUserDataAndStatus();
//             fetchConnections();
//         } else {
//             setLoading(false);
//             setCurrentUserData(null);
//             setAllConnections([]);
//         }
//     }, [userId, statusRefreshKey]);

//     const handleUpload = async () => {
//         if (!selectedFile) return;
//         setUploading(true);
//         setUploadError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const formData = new FormData();
//             formData.append('media', selectedFile);
//             formData.append('visibility', visibility);

//             const response = await fetch(`${API_BASE_URL}/status/upload`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 console.error('Server responded with an error during upload:', errorData);
//                 throw new Error(errorData.message || 'Status upload failed.');
//             }

//             setIsUploadModalOpen(false);
//             setSelectedFile(null);
//             setVisibility('public');
//             setStatusRefreshKey(prev => prev + 1);
//         } catch (err) {
//             console.error('Error during status upload:', err);
//             setUploadError(err instanceof Error ? err.message : 'Upload failed.');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleStatusView = async (userToView: User) => {
//         if (!userToView.hasActiveStatus || !userToView.activeStatus) {
//             console.warn(`Attempted to view status for ${userToView.name} but no active status found.`);
//             return;
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required to view status.');

//             if (userToView._id !== userId) {
//                 if (currentUserData?._id) {
//                     const response = await fetch(`${API_BASE_URL}/status/view/${userToView.activeStatus._id}`, {
//                         method: 'POST',
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json',
//                         },
//                     });

//                     if (!response.ok) {
//                         console.error('Failed to mark status as viewed:', await response.json());
//                     } else {
//                         setStatusRefreshKey(prev => prev + 1);
//                     }
//                 } else {
//                     console.warn("Cannot mark status as viewed: Current user's MongoDB ID not available.");
//                 }
//             } else {
//                 console.log(`DEBUG: Viewing own status for ${userToView.name}. No 'viewed' request sent.`); // <--- DEBUG LOG
//             }

//             setViewingStatus({ user: userToView, status: userToView.activeStatus });
//             console.log('DEBUG: viewingStatus set to:', { user: userToView.name, statusId: userToView.activeStatus?._id }); // <--- DEBUG LOG

//         } catch (err) {
//             console.error('Error handling status view:', err);
//             setError(err instanceof Error ? err.message : 'Failed to display status.');
//         }
//     };

//     const renderUserItem = (user: User) => {
//         return (
//             <li
//                 key={user._id}
//                 className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
//                 onClick={() => {
//                     console.log(`DEBUG: Clicked on user: ${user.name} (ID: ${user._id}). hasActiveStatus: ${user.hasActiveStatus}`); // <--- DEBUG LOG
//                     if (user.hasActiveStatus && user.activeStatus) {
//                         handleStatusView(user);
//                     } else {
//                         console.log(`DEBUG: ${user.name} does not have an active status or status object is missing. Not opening.`); // <--- DEBUG LOG
//                         // Optional: You could show a small toast notification here
//                         // alert(`No active status available for ${user.name}.`);
//                     }
//                 }}
//             >
//                 <div className="relative">
//                     <img
//                         src={getFullMediaUrl(user.avatarUrl)}
//                         alt={user.name}
//                         className={`w-14 h-14 rounded-full object-cover border-2 ${
//                             user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
//                         }`}
//                         onError={(e) => {
//                             const target = e.target as HTMLImageElement;
//                             target.src = defaultAvatarUrl;
//                         }}
//                     />
//                     {user.hasActiveStatus && (
//                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
//                     )}
//                 </div>
//                 <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
//                     {user._id === userId ? 'You' : user.name} {/* Display 'You' for own profile */}
//                 </span>
//             </li>
//         );
//     };

//     return (
//         <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Stories</h2>
//                 <button
//                     onClick={() => setIsUploadModalOpen(true)}
//                     className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
//                 >
//                     <Plus size={20} />
//                 </button>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="flex space-x-4 overflow-x-auto py-2">
//                     {[1, 2, 3].map(i => (
//                         <Skeleton key={i} circle width={56} height={56} />
//                     ))}
//                 </div>
//             ) : (
//                 <ul className="flex space-x-4 overflow-x-auto py-2">
//                     {/* Render current user's status first IF currentUserData exists */}
//                     {currentUserData && renderUserItem(currentUserData)}
//                     {/* Then render other connections */}
//                     {allConnections.map(renderUserItem)}
//                 </ul>
//             )}

//             {/* Upload Modal */}
//             <UploadModal
//                 isOpen={isUploadModalOpen}
//                 onClose={() => setIsUploadModalOpen(false)}
//                 onFileSelected={setSelectedFile}
//                 selectedFile={selectedFile}
//                 visibility={visibility}
//                 setVisibility={setVisibility}
//                 onUpload={handleUpload}
//                 uploading={uploading}
//                 error={uploadError}
//             />

//             {/* Status Viewing Modal */}
//             {viewingStatus && (
//                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
//                         <div className="p-4 border-b flex justify-between items-center">
//                             <div className="flex items-center">
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.user.avatarUrl)}
//                                     alt={viewingStatus.user.name}
//                                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                                 />
//                                 <span className="font-semibold">{viewingStatus.user.name}</span>
//                             </div>
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         <div className="p-4">
//                             {viewingStatus.status.mediaType === 'video' ? (
//                                 <video
//                                     controls
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     autoPlay
//                                 >
//                                     <source
//                                         src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                         type="video/mp4"
//                                     />
//                                     Your browser does not support the video tag.
//                                 </video>
//                             ) : (
//                                 <img
//                                     src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
//                                     alt="Status"
//                                     className="w-full max-h-[80vh] object-contain rounded-lg"
//                                     onError={(e) => {
//                                         const target = e.target as HTMLImageElement;
//                                         target.src = defaultAvatarUrl;
//                                     }}
//                                 />
//                             )}
//                         </div>
//                         <div className="p-4 border-t flex justify-end">
//                             <button
//                                 onClick={() => setViewingStatus(null)}
//                                 className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ActivityBar;









'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthProvider'; // Adjust path if necessary
import defaultAvatar from '../app/assets/userLogo.png'; // Adjust path if necessary
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Plus } from 'lucide-react';
import UploadModal from './UploadModal'; // Adjust path if necessary

// Ensure these are correctly set in your .env.local file
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

interface Status {
    _id: string;
    userId: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    viewedBy: string[]; // This will contain user IDs who viewed it
    visibility: 'public' | 'followers';
}

interface User {
    _id: string;
    name: string;
    avatarUrl?: string;
    hasActiveStatus?: boolean; // Indicates if this user has an active status
    activeStatus?: Status; // The actual status object (if hasActiveStatus is true)
}

interface ActivityBarProps {
    userId: string | null; // This should be the MongoDB ID of the current authenticated user
}

const ActivityBar = ({ userId }: ActivityBarProps) => {
    const { getIdToken, user: authUser } = useAuth();
    const [currentUserData, setCurrentUserData] = useState<User | null>(null);
    const [allConnections, setAllConnections] = useState<User[]>([]); // This will hold other users with statuses
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [viewingStatus, setViewingStatus] = useState<{ user: User; status: Status } | null>(null);
    const [statusRefreshKey, setStatusRefreshKey] = useState(0); // Key to trigger re-fetches

    // Use a ref for the default avatar URL for consistent access
    const defaultAvatarUrl = React.useMemo(() => {
        return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
    }, []);

    const getFullMediaUrl = useCallback((relativePath?: string): string => {
        if (!relativePath || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath || defaultAvatarUrl;
        }
        // Ensure path uses forward slashes for URLs, especially important for Windows paths from Multer
        const cleanedPath = relativePath.replace(/\\/g, '/');
        // Add a check to prevent double slashes if MEDIA_BASE_URL already ends with one
        const baseUrl = MEDIA_BASE_URL.endsWith('/') ? MEDIA_BASE_URL.slice(0, -1) : MEDIA_BASE_URL;
        return `${baseUrl}/${cleanedPath}`;
    }, [defaultAvatarUrl]);

    // Function to fetch current user's profile and their status
    const fetchCurrentUserDataAndStatus = useCallback(async () => {
        console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] called. Current userId prop: ${userId}`);

        if (!userId) {
            console.log('[ActivityBar:fetchCurrentUserDataAndStatus] userId prop is null/undefined. Initializing currentUserData with Firebase authUser if available.');
            if (authUser) {
                setCurrentUserData({
                    _id: authUser.uid, // This is Firebase UID here, will be updated to Mongo ID if /profile succeeds
                    name: authUser.displayName || 'You',
                    avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
                    hasActiveStatus: false,
                    activeStatus: undefined
                });
            } else {
                setCurrentUserData(null);
            }
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) {
                console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Authentication token not available. Cannot fetch current user data and status.');
                setError('Authentication token not available. Please log in.');
                setCurrentUserData(null);
                return;
            }

            // 1. Fetch current user's profile to get their accurate MongoDB ID and latest profile info
            const userProfileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!userProfileResponse.ok) {
                const errorData = await userProfileResponse.json().catch(() => ({}));
                console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch current user profile:', errorData);
                throw new Error(errorData.message || 'Failed to fetch your profile data.');
            }
            const userProfile = await userProfileResponse.json();
            console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Profile (MongoDB ID):', userProfile._id);

            // 2. Fetch current user's statuses using the *obtained MongoDB ID*
            const userStatusResponse = await fetch(`${API_BASE_URL}/status/user/${userProfile._id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let activeUserStatus: Status | undefined = undefined;
            if (userStatusResponse.ok) {
                const userStatuses: Status[] = await userStatusResponse.json();
                console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] Fetched User Statuses for '${userProfile.name}' (ID: ${userProfile._id}):`, userStatuses);

                if (userStatuses && userStatuses.length > 0) {
                    activeUserStatus = userStatuses[0]; // Assuming you only want to display the first active status
                    console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Active status found for current user:', activeUserStatus);
                } else {
                    console.log(`[ActivityBar:fetchCurrentUserDataAndStatus] No active status found for current user '${userProfile.name}' (ID: ${userProfile._id}).`);
                }
            } else {
                const errorData = await userStatusResponse.json().catch(() => ({}));
                console.warn(`[ActivityBar:fetchCurrentUserDataAndStatus] Failed to fetch active status for current user (${userProfile._id}). Status: ${userStatusResponse.status}, Error: ${errorData.message || 'Unknown'}`);
            }

            const newCurrentUserData = {
                _id: userProfile._id, // IMPORTANT: Use the MongoDB ID from the profile fetch
                name: userProfile.name,
                avatarUrl: userProfile.avatarUrl,
                hasActiveStatus: !!activeUserStatus, // Set to true if activeUserStatus object exists
                activeStatus: activeUserStatus
            };
            setCurrentUserData(newCurrentUserData);
            console.log('[ActivityBar:fetchCurrentUserDataAndStatus] Updated currentUserData state:', newCurrentUserData);

        } catch (err) {
            console.error('[ActivityBar:fetchCurrentUserDataAndStatus] Error:', err);
            setError(err instanceof Error ? err.message : 'Could not load your stories.');
            // Fallback for currentUserData on error (important to set something for UI)
            if (authUser) {
                setCurrentUserData({
                    _id: authUser.uid, // Fallback to Firebase UID if MongoDB ID not available from profile
                    name: authUser.displayName || 'You',
                    avatarUrl: authUser.avatarUrl || defaultAvatarUrl,
                    hasActiveStatus: false,
                    activeStatus: undefined
                });
            } else {
                setCurrentUserData(null);
            }
        }
    }, [userId, authUser, defaultAvatarUrl, getIdToken]); // Dependencies for useCallback

    // Function to fetch statuses for connections (followers/following)
    const fetchStatusesForConnections = useCallback(async () => {
        if (!userId) return; // Only fetch if current user's MongoDB ID is available

        try {
            const token = await getIdToken();
            if (!token) {
                setError('Authentication token not available');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/status`, { // This endpoint gets statuses for connections
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch statuses for connections.');
            }

            const statuses: User[] = await response.json(); // Backend now sends already formatted User[] with activeStatus
            console.log('[ActivityBar:fetchStatusesForConnections] Fetched connections with statuses:', statuses);

            // Filter out the current user's own entry if it somehow appears here (it shouldn't based on backend change)
            const filteredConnections = statuses.filter(conn => conn._id !== userId);
            setAllConnections(filteredConnections);

        } catch (err) {
            console.error('[ActivityBar:fetchStatusesForConnections] Error fetching statuses for connections:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch connections statuses.');
        }
    }, [userId, getIdToken]); // Dependencies for useCallback


    // Main useEffect to orchestrate fetching
    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch current user's data and status first
                await fetchCurrentUserDataAndStatus();
                // Then fetch statuses for connections
                await fetchStatusesForConnections();
            } catch (err) {
                console.error('[ActivityBar:useEffect] Error during overall data fetch:', err);
                // Errors already handled within individual fetch functions
            } finally {
                setLoading(false);
            }
        };

        if (userId) { // Only start fetching if we have a MongoDB userId
            loadAllData();
        } else {
            // If userId is null (e.g., not logged in or MongoDB ID not synced yet)
            setLoading(false);
            setCurrentUserData(null);
            setAllConnections([]);
        }
    }, [userId, statusRefreshKey, fetchCurrentUserDataAndStatus, fetchStatusesForConnections]); // Dependencies


    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadError(null);

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            const formData = new FormData();
            formData.append('media', selectedFile);
            formData.append('visibility', visibility);

            const response = await fetch(`${API_BASE_URL}/status/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[ActivityBar:handleUpload] Server responded with an error during upload:', errorData);
                throw new Error(errorData.message || 'Status upload failed.');
            }

            const responseData = await response.json(); // Get the response data
            console.log('[ActivityBar:handleUpload] Status uploaded successfully:', responseData);

            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setVisibility('public');
            setStatusRefreshKey(prev => prev + 1); // Trigger re-fetch of all statuses to show the new one
        } catch (err) {
            console.error('[ActivityBar:handleUpload] Error during status upload:', err);
            setUploadError(err instanceof Error ? err.message : 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleStatusView = async (userToView: User) => {
        if (!userToView.hasActiveStatus || !userToView.activeStatus) {
            console.warn(`[ActivityBar:handleStatusView] Attempted to view status for ${userToView.name} but no active status found.`);
            return;
        }

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required to view status.');

            // Only mark as viewed if it's not your own status
            if (userToView._id !== userId) {
                // currentUserData?._id should now always be the MongoDB ID
                if (currentUserData?._id) {
                    console.log(`[ActivityBar:handleStatusView] Marking status ${userToView.activeStatus._id} as viewed by ${currentUserData._id}`);
                    const response = await fetch(`${API_BASE_URL}/status/view/${userToView.activeStatus._id}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        console.error('[ActivityBar:handleStatusView] Failed to mark status as viewed:', await response.json());
                    } else {
                        console.log('[ActivityBar:handleStatusView] Status marked as viewed successfully.');
                        // Refresh to reflect the 'viewed' state if needed, though typically not for self-view
                        // setStatusRefreshKey(prev => prev + 1); // This might cause UI flicker
                    }
                } else {
                    console.warn("[ActivityBar:handleStatusView] Cannot mark status as viewed: Current user's MongoDB ID not available in currentUserData.");
                }
            } else {
                console.log(`[ActivityBar:handleStatusView] Viewing own status for ${userToView.name}. No 'viewed' request sent.`);
            }

            // Always set viewingStatus to display the modal
            setViewingStatus({ user: userToView, status: userToView.activeStatus });
            console.log('[ActivityBar:handleStatusView] ViewingStatus modal opened for:', { user: userToView.name, statusId: userToView.activeStatus?._id });

        } catch (err) {
            console.error('[ActivityBar:handleStatusView] Error handling status view:', err);
            setError(err instanceof Error ? err.message : 'Failed to display status.');
        }
    };

    const renderUserItem = (user: User) => {
        const isCurrentUser = user._id === userId;
        return (
            <li
                key={user._id}
                className="flex flex-col items-center space-y-1 min-w-[80px] cursor-pointer"
                onClick={() => {
                    console.log(`[ActivityBar:renderUserItem] Clicked on user: ${user.name} (ID: ${user._id}). hasActiveStatus: ${user.hasActiveStatus}`);
                    if (user.hasActiveStatus && user.activeStatus) {
                        handleStatusView(user);
                    } else {
                        console.log(`[ActivityBar:renderUserItem] ${user.name} does not have an active status or status object is missing. Not opening.`);
                        // Optional: You could show a small toast notification here
                        // alert(`No active status available for ${user.name}.`);
                    }
                }}
            >
                <div className="relative">
                    <img
                        src={getFullMediaUrl(user.avatarUrl)}
                        alt={user.name}
                        className={`w-14 h-14 rounded-full object-cover border-2 ${user.hasActiveStatus ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                            }`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultAvatarUrl;
                        }}
                    />
                    {user.hasActiveStatus && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                </div>
                <span className="text-xs font-medium text-gray-800 truncate w-full text-center">
                    {isCurrentUser ? 'You' : user.name} {/* Display 'You' for own profile */}
                </span>
            </li>
        );
    };

    return (
        <div className="flex-shrink-0 w-full max-w-xs bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stories</h2>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                >
                    <Plus size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex space-x-4 overflow-x-auto py-2">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} circle width={56} height={56} />
                    ))}
                </div>
            ) : (
                <ul className="flex space-x-4 overflow-x-auto py-2">
                    {/* Render current user's status first IF currentUserData exists and has an active status */}
                    {currentUserData && renderUserItem(currentUserData)}
                    {/* Then render other connections */}
                    {allConnections.map(renderUserItem)}
                </ul>
            )}

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onFileSelected={setSelectedFile}
                selectedFile={selectedFile}
                visibility={visibility}
                setVisibility={setVisibility}
                onUpload={handleUpload}
                uploading={uploading}
                error={uploadError}
            />

            {/* Status Viewing Modal */}
            {viewingStatus && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <div className="flex items-center">
                                <img
                                    src={getFullMediaUrl(viewingStatus.user.avatarUrl)}
                                    alt={viewingStatus.user.name}
                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                />
                                <span className="font-semibold">{viewingStatus.user.name}</span>
                            </div>
                            <button
                                onClick={() => setViewingStatus(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-4">
                            {viewingStatus.status.mediaType === 'video' ? (
                                <video
                                    controls
                                    className="w-full max-h-[80vh] object-contain rounded-lg"
                                    autoPlay
                                    // Add a key to force re-render if video source changes, important for video playback
                                    key={viewingStatus.status.mediaUrl}
                                >
                                    <source
                                        src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src={getFullMediaUrl(viewingStatus.status.mediaUrl)}
                                    alt="Status"
                                    className="w-full max-h-[80vh] object-contain rounded-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = defaultAvatarUrl;
                                    }}
                                />
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button
                                onClick={() => setViewingStatus(null)}
                                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityBar;