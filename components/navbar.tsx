// 'use client';

// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useAuth } from './AuthProvider';
// import { useSocket } from './SocketProvider';
// import toast from 'react-hot-toast';
// import { Bell, Home, MessageSquare, Search, Settings, User, LogOut, Users, Check, X, Menu } from 'lucide-react';
// import defaultUserLogo from '../app/assets/userLogo.png'; // Keep this for direct use for fallback
// import { useRouter } from 'next/navigation';
// import SearchBar from './SearchBar';

// // IMPORT THE UTILITY FUNCTION HERE:
// import { getFullAvatarUrl } from '../utils/imageUtils'; // <--- THIS IS THE KEY CHANGE

// interface Notification {
//     _id: string;
//     type: string;
//     message: string;
//     read: boolean;
//     createdAt: string;
//     sender?: {
//         _id: string;
//         name: string;
//         avatarUrl?: string | null;
//         firebaseUid?: string;
//     };
//     link?: string;
//     data?: {
//         requestId?: string;
//     };
// }

// // Define the base URL for your backend's API.
// // This should match the backend's API endpoint base.
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // IMPORTANT: Do NOT define BACKEND_STATIC_BASE_URL here anymore.
// // It's handled by getFullAvatarUrl in imageUtils.ts.
// // const BACKEND_STATIC_BASE_URL = ... (REMOVE THIS FROM NAVBAR)

// const Navbar: React.FC = () => {
//     const { user, getIdToken, logout } = useAuth();
//     const { socket } = useSocket();
//     const router = useRouter();

//     const [notificationCount, setNotificationCount] = useState(0);
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
//     const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//     const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
//     const [isMenuOpen, setIsMenuOpen] = useState(false);

//     const profileDropdownRef = useRef<HTMLDivElement>(null);
//     const notificationDropdownRef = useRef<HTMLDivElement>(null);
//     const menuRef = useRef<HTMLDivElement>(null);

//     const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);
//     const requestRejectedAudio = useRef<HTMLAudioElement | null>(null);

//     useEffect(() => {
//         requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
//         requestRejectedAudio.current = new Audio('/sounds/request_rejected.mp3');
//         requestAcceptedAudio.current.load();
//         requestRejectedAudio.current.load();
//     }, []);

//     const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
//         if (audioElementRef.current) {
//             audioElementRef.current.currentTime = 0;
//             audioElementRef.current.play().catch(error => {
//                 console.warn('Audio playback failed:', error);
//             });
//         }
//     }, []);

//     // REMOVE THIS LOCAL getFullImageUrl FUNCTION.
//     // Use the imported getFullAvatarUrl instead.
//     /*
//     const getFullImageUrl = useCallback((avatarPath: string | null | undefined): string => {
//         if (!avatarPath || typeof avatarPath !== 'string' || avatarPath.trim() === '') {
//             return defaultUserLogo.src;
//         }
//         if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
//             return avatarPath;
//         }
//         const cleanedPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
//         const finalPath = cleanedPath.startsWith('uploads/avatars/') ? cleanedPath : `uploads/avatars/${cleanedPath}`;
//         return `${BACKEND_STATIC_BASE_URL}/${finalPath}`;
//     }, []);
//     */


//     const fetchNotifications = useCallback(async (markAsRead: boolean = false) => {
//         if (!user || !user._id || !getIdToken) {
//             console.log("Not authorized, user not logged in, or user ID not available to fetch notifications.");
//             return;
//         }

//         try {
//             const idToken = await getIdToken();
//             if (!idToken) {
//                 console.warn('No ID token available for fetching notifications. User might be unauthenticated.');
//                 return;
//             }

//             const url = markAsRead ? `${API_BASE_URL}/notifications/mark-as-read` : `${API_BASE_URL}/notifications?limit=5`;
//             const method = markAsRead ? 'PUT' : 'GET';

//             const response = await fetch(url, {
//                 method: method,
//                 headers: {
//                     'Authorization': `Bearer ${idToken}`,
//                     'Content-Type': 'application/json'
//                 },
//             });

//             if (response.ok) {
//                 if (markAsRead) {
//                     setNotificationCount(0);
//                     fetchNotifications();
//                 } else {
//                     const data = await response.json();
//                     setNotifications(data.notifications || []);
//                     setNotificationCount(data.unreadCount || 0);
//                 }
//             } else {
//                 const errorData = await response.json().catch(() => ({ message: response.statusText }));
//                 console.error('Failed to fetch/update notifications:', errorData.message || response.statusText);
//                 toast.error('Failed to load notifications.');
//             }
//         } catch (error) {
//             console.error('Error fetching/updating notifications:', error);
//             toast.error('An unexpected error occurred while loading notifications.');
//         }
//     }, [user, getIdToken]);

//     const handleAcceptReject = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
//         if (!user || !user._id || !getIdToken || processingRequests.has(requestId)) {
//             console.log("Skipping accept/reject: User, token or request already processing.");
//             return;
//         }

//         setProcessingRequests(prev => new Set([...prev, requestId]));
//         const loadingToast = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`);

//         try {
//             const idToken = await getIdToken();
//             if (!idToken) {
//                 throw new Error('No authentication token available.');
//             }

//             const endpoint = action === 'accept' ? 'accept-follow-request' : 'reject-follow-request';
//             const response = await fetch(`${API_BASE_URL}/follow/${endpoint}/${requestId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${idToken}`,
//                     'Content-Type': 'application/json'
//                 },
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 setNotifications(prev => prev.filter(notif =>
//                     notif.type !== 'followRequest' || notif.data?.requestId !== requestId
//                 ));
//                 toast.dismiss(loadingToast);
//                 toast.success(data.message || `Follow request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);

//                 if (action === 'accept') {
//                     playSound(requestAcceptedAudio);
//                 } else {
//                     playSound(requestRejectedAudio);
//                 }
//                 fetchNotifications();
//             } else {
//                 throw new Error(data.message || `Failed to ${action} request.`);
//             }
//         } catch (error) {
//             console.error(`Error ${action}ing request:`, error);
//             toast.dismiss(loadingToast);
//             toast.error(error instanceof Error ? error.message : `Failed to ${action} request. Please try again.`);
//         } finally {
//             setProcessingRequests(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(requestId);
//                 return newSet;
//             });
//         }
//     }, [user, getIdToken, processingRequests, fetchNotifications, playSound]);

//     useEffect(() => {
//         if (socket && user?._id) {
//             socket.emit('registerUser', user._id);

//             const handleNewNotification = (notification: Notification) => {
//                 console.log('New notification received:', notification);
//                 setNotificationCount(prev => prev + 1);
//                 setNotifications(prev => [notification, ...prev].slice(0, 5));
//                 toast(`New notification: ${notification.message}`, {
//                     icon: '🔔',
//                     duration: 4000,
//                 });
//             };

//             socket.on('newNotification', handleNewNotification);

//             return () => {
//                 socket.off('newNotification', handleNewNotification);
//             };
//         }
//     }, [socket, user?._id]);

//     useEffect(() => {
//         fetchNotifications();
//     }, [fetchNotifications]);

//     const handleLogout = useCallback(async () => {
//         try {
//             await logout();
//             router.push('/login');
//         } catch (error) {
//             console.error('Error logging out:', error);
//             toast.error('Failed to log out.');
//         } finally {
//             setShowProfileDropdown(false);
//             setShowNotificationDropdown(false);
//             setIsMenuOpen(false);
//         }
//     }, [logout, router]);

//     const handleNotificationClick = () => {
//         if (!showNotificationDropdown) {
//             fetchNotifications();
//         }
//         setShowNotificationDropdown(prev => !prev);
//         setShowProfileDropdown(false);
//         setIsMenuOpen(false);
//     };

//     const handleProfileClick = () => {
//         setShowProfileDropdown(prev => !prev);
//         setShowNotificationDropdown(false);
//         setIsMenuOpen(false);
//     };

//     const handleMenuToggle = () => {
//         setIsMenuOpen(prev => !prev);
//         setShowProfileDropdown(false);
//         setShowNotificationDropdown(false);
//     };

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             let clickedInsideAnyDropdownOrMenu = false;

//             if (isMenuOpen && menuRef.current && menuRef.current.contains(event.target as Node)) {
//                 clickedInsideAnyDropdownOrMenu = true;
//             }
//             if (showNotificationDropdown && notificationDropdownRef.current && notificationDropdownRef.current.contains(event.target as Node)) {
//                 clickedInsideAnyDropdownOrMenu = true;
//             }
//             if (showProfileDropdown && profileDropdownRef.current && profileDropdownRef.current.contains(event.target as Node)) {
//                 clickedInsideAnyDropdownOrMenu = true;
//             }

//             const isDropdownToggleButton = (event.target as HTMLElement).closest(
//                 'button[aria-label="Open menu"], button[aria-label="Close menu"], button[aria-label="Notifications"], button[aria-label="User menu"]'
//             );

//             if (!clickedInsideAnyDropdownOrMenu && !isDropdownToggleButton) {
//                 setIsMenuOpen(false);
//                 setShowNotificationDropdown(false);
//                 setShowProfileDropdown(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isMenuOpen, showNotificationDropdown, showProfileDropdown]);

//     const renderNotification = (notification: Notification) => {
//         // Use the imported getFullAvatarUrl for notification sender's avatar
//         const senderAvatar = getFullAvatarUrl(notification.sender?.avatarUrl); // <--- Use imported function

//         const senderName = notification.sender?.name ?? 'Unknown User';

//         if (notification.type === 'followRequest') {
//             const requestIdToProcess = notification.data?.requestId || notification._id;
//             const isProcessing = processingRequests.has(requestIdToProcess);
//             return (
//                 <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0" key={notification._id}>
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <Image
//                                 src={senderAvatar}
//                                 alt={senderName}
//                                 width={40}
//                                 height={40}
//                                 className="rounded-full object-cover aspect-square"
//                             />
//                             <div>
//                                 <p className="font-medium text-gray-800">{notification.message}</p>
//                                 <p className="text-xs text-gray-500">
//                                     {new Date(notification.createdAt).toLocaleString()}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className="flex space-x-2">
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleAcceptReject(requestIdToProcess, 'accept');
//                                 }}
//                                 disabled={isProcessing}
//                                 className={`p-2 rounded-full transition-colors ${isProcessing
//                                     ? 'bg-gray-100 cursor-not-allowed'
//                                     : 'bg-green-100 hover:bg-green-200 text-green-600'
//                                     }`}
//                                 aria-label="Accept follow request"
//                             >
//                                 <Check className="w-4 h-4" />
//                             </button>
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleAcceptReject(requestIdToProcess, 'reject');
//                                 }}
//                                 disabled={isProcessing}
//                                 className={`p-2 rounded-full transition-colors ${isProcessing
//                                     ? 'bg-gray-100 cursor-not-allowed'
//                                     : 'bg-red-100 hover:bg-red-200 text-red-600'
//                                     }`}
//                                 aria-label="Reject follow request"
//                             >
//                                 <X className="w-4 h-4" />
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <Link
//                 key={notification._id}
//                 href={`/dashboard/notifications?id=${notification._id}`}
//                 onClick={() => setShowNotificationDropdown(false)}
//                 className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${notification.read ? 'text-gray-500' : 'font-medium text-gray-800'}`}
//             >
//                 <div className="flex items-center space-x-3">
//                     <Image
//                         src={senderAvatar}
//                         alt={senderName}
//                         width={40}
//                         height={40}
//                         className="rounded-full object-cover aspect-square"
//                     />
//                     <div>
//                         <p>{notification.message}</p>
//                         <span className="block text-xs text-gray-400 mt-1">
//                             {new Date(notification.createdAt).toLocaleString()}
//                         </span>
//                     </div>
//                 </div>
//             </Link>
//         );
//     };

//     // Determine the user's avatar URL, with fallback, using the imported utility
//     const userAvatar = getFullAvatarUrl(user?.avatarUrl); // <--- Use imported function here too

//     return (
//         <>
//             {/* Overlay */}
//             {(showNotificationDropdown || showProfileDropdown || isMenuOpen) && (
//                 <div
//                     className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-[190]"
//                     style={{ top: '64px' }}
//                     onClick={() => {
//                         setShowNotificationDropdown(false);
//                         setShowProfileDropdown(false);
//                         setIsMenuOpen(false);
//                     }}
//                     aria-hidden="true"
//                 ></div>
//             )}

//             <nav className="bg-white shadow-lg p-3 flex items-center justify-between fixed top-0 left-0 w-full z-[300]">
//                 <div className="flex items-center space-x-2 md:pl-8">
//                     <Link href="/dashboard" className="text-2xl font-extrabold text-blue-600 tracking-tight">
//                         Vartalaap<span className="text-yellow-500 text-3xl">.</span>
//                     </Link>
//                 </div>

//                 {/* Desktop Search Bar */}
//                 <div className="hidden md:flex items-center flex-grow mx-auto max-w-xl pr-20">
//                     <SearchBar currentAuthUser={user} />
//                 </div>

//                 {/* Desktop Navigation Links and User Menu */}
//                 <div className="hidden md:flex items-center space-x-6 mr-0">
//                     <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" aria-label="Home">
//                         <Home size={20} />
//                     </Link>
//                     <Link href="/users" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" aria-label="Find Users">
//                         <Users size={20} />
//                     </Link>
//                     <Link href="/messages" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" aria-label="Messages">
//                         <MessageSquare size={20} />
//                     </Link>

//                     {/* Notifications Dropdown */}
//                     <div className="relative">
//                         <button
//                             onClick={handleNotificationClick}
//                             className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
//                             aria-label="Notifications"
//                         >
//                             <Bell size={20} />
//                             {notificationCount > 0 && (
//                                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
//                                     {notificationCount}
//                                 </span>
//                             )}
//                         </button>
//                         {showNotificationDropdown && (
//                             <div
//                                 ref={notificationDropdownRef}
//                                 className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right animate-fade-in"
//                             >
//                                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//                                     <h3 className="font-semibold text-gray-800">Notifications</h3>
//                                     {notificationCount > 0 && (
//                                         <button
//                                             onClick={() => fetchNotifications(true)}
//                                             className="text-blue-600 text-sm hover:underline"
//                                         >
//                                             Mark all as read
//                                         </button>
//                                     )}
//                                 </div>
//                                 {notifications.length > 0 ? (
//                                     <div className="max-h-96 overflow-y-auto">
//                                         {notifications.map(renderNotification)}
//                                     </div>
//                                 ) : (
//                                     <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
//                                 )}
//                                 <div className="p-3 border-t border-gray-200 text-center">
//                                     <Link href="/dashboard/notifications" onClick={() => setShowNotificationDropdown(false)} className="text-blue-600 hover:underline text-sm">
//                                         View all notifications
//                                     </Link>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* User Profile Dropdown */}
//                     <div className="relative hover:bg-gray-100 rounded-full p-1 ">
//                         <button
//                             onClick={handleProfileClick}
//                             className="flex items-center focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
//                             aria-label="User menu"
//                         >
//                             <Image
//                                 src={userAvatar} // Uses the correctly resolved URL
//                                 alt={'{user.name}'}
//                                 width={40}
//                                 height={40}
//                                 className="rounded-full object-cover aspect-square"
//                             />
//                             <p className="ml-2 text-gray-800 font-medium">{user?.name}</p>
//                         </button>
//                         {showProfileDropdown && (
//                             <div
//                                 ref={profileDropdownRef}
//                                 className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right animate-fade-in"
//                             >
//                                 <div className="py-2">
//                                     <Link
//                                         href={`/users/${user?.firebaseUid || user?._id || 'profile'}`}
//                                         onClick={() => setShowProfileDropdown(false)}
//                                         className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                     >
//                                         <User size={18} className="mr-2" /> My Profile
//                                     </Link>
//                                     <Link
//                                         href="/dashboard/settings"
//                                         onClick={() => setShowProfileDropdown(false)}
//                                         className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                     >
//                                         <Settings size={18} className="mr-2" /> Settings
//                                     </Link>
//                                     <div className="border-t border-gray-200 my-2"></div>
//                                     {/* ... rest of your dropdown items */}
//                                     <button
//                                         onClick={handleLogout}
//                                         className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                                     >
//                                         <LogOut size={18} className="mr-2" /> Log Out
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Mobile Menu Button (Visible on smaller screens) */}
//                 <div className="md:hidden flex items-center space-x-4">
//                     <div className="relative">
//                         <button
//                             onClick={handleNotificationClick}
//                             className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
//                             aria-label="Notifications"
//                         >
//                             <Bell size={18} />
//                             {notificationCount > 0 && (
//                                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
//                                     {notificationCount}
//                                 </span>
//                             )}
//                         </button>
//                         {showNotificationDropdown && (
//                             <div
//                                 ref={notificationDropdownRef}
//                                 className="absolute ml-[-255px] mt-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right animate-fade-in"
//                             >
//                                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//                                     <h3 className="font-semibold text-gray-800">Notifications</h3>
//                                     {notificationCount > 0 && (
//                                         <button
//                                             onClick={() => fetchNotifications(true)}
//                                             className="text-blue-600 text-sm hover:underline"
//                                         >
//                                             Mark all as read
//                                         </button>
//                                     )}
//                                 </div>
//                                 {notifications.length > 0 ? (
//                                     <div className="max-h-100 overflow-y-auto">
//                                         {notifications.map(renderNotification)}
//                                     </div>
//                                 ) : (
//                                     <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
//                                 )}
//                                 {/* <div className="p-3 border-t border-gray-200 text-center">
//                                     <Link href="/dashboard/notifications" onClick={() => setShowNotificationDropdown(false)} className="text-blue-600 hover:underline text-sm">
//                                         View all notifications
//                                     </Link>
//                                 </div> */}
//                             </div>
//                         )}
//                     </div>
//                     <button
//                         onClick={handleMenuToggle}
//                         className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
//                         aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//                     >
//                         <Menu size={20} />
//                     </button>
//                 </div>

//                 {/* Mobile Menu (Hidden by default, shown when toggled) */}
//                 {isMenuOpen && (
//                     <div
//                         ref={menuRef}
//                         className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl z-[200] py-4 transform origin-top animate-fade-in-down"
//                     >
//                         <div className="m-0 p-0 flex items-center justify-center">
//                             <SearchBar currentAuthUser={user} />
//                         </div>
//                         <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
//                             <Home size={20} className="mr-3" /> Home
//                         </Link>
//                         <Link href="/users" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
//                             <Users size={20} className="mr-3" /> Find Users
//                         </Link>
//                         <Link href="/messages" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
//                             <MessageSquare size={20} className="mr-3" /> Messages
//                         </Link>
//                         <div className="border-t border-gray-200 my-2"></div>
//                         <Link
//                             href={`/users/${user?.firebaseUid || user?._id || 'profile'}`}
//                             className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
//                             onClick={handleMenuToggle}
//                         >
//                             <User size={20} className="mr-3" /> My Profile
//                         </Link>
//                         <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
//                             <Settings size={20} className="mr-3" /> Settings
//                         </Link>
//                         <button
//                             onClick={handleLogout}
//                             className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
//                         >
//                             <LogOut size={20} className="mr-3" /> Log Out
//                         </button>
//                     </div>
//                 )}
//             </nav>
//         </>
//     );
// };

// export default Navbar;





'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useSocket } from './SocketProvider';
import toast from 'react-hot-toast';
import { Bell, Home, MessageSquare, Search, Settings, User, LogOut, Users, Check, X, Menu } from 'lucide-react';
import defaultUserLogo from '../app/assets/userLogo.png';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

// IMPORT THE UTILITY FUNCTION HERE:
import { getFullAvatarUrl } from '../utils/imageUtils';

// --- Framer Motion Imports ---
import { motion, AnimatePresence } from 'framer-motion';
// --- End Framer Motion Imports ---

// --- Import AnimatedList ---
import AnimatedList from './AnimatedList'; // Adjust the path as needed
// --- End Import AnimatedList ---

interface Notification {
    _id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
    sender?: {
        _id: string;
        name: string;
        avatarUrl?: string | null;
        firebaseUid?: string;
    };
    link?: string;
    data?: {
        requestId?: string;
    };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

const Navbar: React.FC = () => {
    const { user, getIdToken, logout } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();

    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);
    const requestRejectedAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
        requestRejectedAudio.current = new Audio('/sounds/request_rejected.mp3');
        requestAcceptedAudio.current.load();
        requestRejectedAudio.current.load();
    }, []);

    const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
        if (audioElementRef.current) {
            audioElementRef.current.currentTime = 0;
            audioElementRef.current.play().catch(error => {
                console.warn('Audio playback failed:', error);
            });
        }
    }, []);

    const fetchNotifications = useCallback(async (markAsRead: boolean = false) => {
        if (!user || !user._id || !getIdToken) {
            console.log("Not authorized, user not logged in, or user ID not available to fetch notifications.");
            return;
        }

        try {
            const idToken = await getIdToken();
            if (!idToken) {
                console.warn('No ID token available for fetching notifications. User might be unauthenticated.');
                return;
            }

            const url = markAsRead ? `${API_BASE_URL}/notifications/mark-as-read` : `${API_BASE_URL}/notifications?limit=5`;
            const method = markAsRead ? 'PUT' : 'GET';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                if (markAsRead) {
                    setNotificationCount(0);
                    fetchNotifications();
                } else {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                    setNotificationCount(data.unreadCount || 0);
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                console.error('Failed to fetch/update notifications:', errorData.message || response.statusText);
                toast.error('Failed to load notifications.');
            }
        } catch (error) {
            console.error('Error fetching/updating notifications:', error);
            toast.error('An unexpected error occurred while loading notifications.');
        }
    }, [user, getIdToken]);

    const handleAcceptReject = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
        if (!user || !user._id || !getIdToken || processingRequests.has(requestId)) {
            console.log("Skipping accept/reject: User, token or request already processing.");
            return;
        }

        setProcessingRequests(prev => new Set([...prev, requestId]));
        const loadingToast = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`);

        try {
            const idToken = await getIdToken();
            if (!idToken) {
                throw new Error('No authentication token available.');
            }

            const endpoint = action === 'accept' ? 'accept-follow-request' : 'reject-follow-request';
            const response = await fetch(`${API_BASE_URL}/follow/${endpoint}/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Remove the notification from the list immediately
                setNotifications(prev => prev.filter(notif =>
                    notif.type !== 'followRequest' || notif.data?.requestId !== requestId
                ));
                toast.dismiss(loadingToast);
                toast.success(data.message || `Follow request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);

                if (action === 'accept') {
                    playSound(requestAcceptedAudio);
                } else {
                    playSound(requestRejectedAudio);
                }
                // Re-fetch to get updated count and potentially new notifications
                fetchNotifications();
            } else {
                throw new Error(data.message || `Failed to ${action} request.`);
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : `Failed to ${action} request. Please try again.`);
        } finally {
            setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    }, [user, getIdToken, processingRequests, fetchNotifications, playSound]);

    useEffect(() => {
        if (socket && user?._id) {
            socket.emit('registerUser', user._id);

            const handleNewNotification = (notification: Notification) => {
                console.log('New notification received:', notification);
                setNotificationCount(prev => prev + 1);
                // Prepend new notification and keep only the latest 5
                setNotifications(prev => [notification, ...prev].slice(0, 5));
                toast(`New notification: ${notification.message}`, {
                    icon: '🔔',
                    duration: 4000,
                });
            };

            socket.on('newNotification', handleNewNotification);

            return () => {
                socket.off('newNotification', handleNewNotification);
            };
        }
    }, [socket, user?._id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Failed to log out.');
        } finally {
            setShowProfileDropdown(false);
            setShowNotificationDropdown(false);
            setIsMenuOpen(false);
        }
    }, [logout, router]);

    const handleNotificationClick = () => {
        if (!showNotificationDropdown) {
            fetchNotifications(); // Fetch latest when opening
        }
        setShowNotificationDropdown(prev => !prev);
        setShowProfileDropdown(false);
        setIsMenuOpen(false);
    };

    const handleProfileClick = () => {
        setShowProfileDropdown(prev => !prev);
        setShowNotificationDropdown(false);
        setIsMenuOpen(false);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => !prev);
        setShowProfileDropdown(false);
        setShowNotificationDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            let clickedInsideAnyDropdownOrMenu = false;

            if (isMenuOpen && menuRef.current && menuRef.current.contains(event.target as Node)) {
                clickedInsideAnyDropdownOrMenu = true;
            }
            if (showNotificationDropdown && notificationDropdownRef.current && notificationDropdownRef.current.contains(event.target as Node)) {
                clickedInsideAnyDropdownOrMenu = true;
            }
            if (showProfileDropdown && profileDropdownRef.current && profileDropdownRef.current.contains(event.target as Node)) {
                clickedInsideAnyDropdownOrMenu = true;
            }

            const isDropdownToggleButton = (event.target as HTMLElement).closest(
                'button[aria-label="Open menu"], button[aria-label="Close menu"], button[aria-label="Notifications"], button[aria-label="User menu"]'
            );

            if (!clickedInsideAnyDropdownOrMenu && !isDropdownToggleButton) {
                setIsMenuOpen(false);
                setShowNotificationDropdown(false);
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, showNotificationDropdown, showProfileDropdown]);


    // This is the render function passed to AnimatedList
    const renderNotificationItem = useCallback((notification: Notification, index: number, isSelected: boolean) => {
        const senderAvatar = getFullAvatarUrl(notification.sender?.avatarUrl);
        const senderName = notification.sender?.name ?? 'Unknown User';

        if (notification.type === 'followRequest') {
            const requestIdToProcess = notification.data?.requestId || notification._id;
            const isProcessing = processingRequests.has(requestIdToProcess);
            return (
                <div
                    // No motion.div here as AnimatedItem wraps it.
                    // Removed individual animation props, AnimatedItem handles it.
                    className={`px-4 py-3 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Image
                                src={senderAvatar}
                                alt={senderName}
                                width={40}
                                height={40}
                                className="rounded-full object-cover aspect-square"
                            />
                            <div>
                                <p className="font-medium text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent dropdown closing or item selection
                                    handleAcceptReject(requestIdToProcess, 'accept');
                                }}
                                disabled={isProcessing}
                                className={`p-2 rounded-full transition-colors ${isProcessing
                                    ? 'bg-gray-100 cursor-not-allowed'
                                    : 'bg-green-100 hover:bg-green-200 text-green-600'
                                    }`}
                                aria-label="Accept follow request"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent dropdown closing or item selection
                                    handleAcceptReject(requestIdToProcess, 'reject');
                                }}
                                disabled={isProcessing}
                                className={`p-2 rounded-full transition-colors ${isProcessing
                                    ? 'bg-gray-100 cursor-not-allowed'
                                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                                    }`}
                                aria-label="Reject follow request"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Link
                href={`/dashboard/notifications?id=${notification._id}`}
                // Using onMouseDown instead of onClick to ensure Link navigation works before AnimatedItem's onClick
                onMouseDown={() => setShowNotificationDropdown(false)}
                className={`flex items-center px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 ${notification.read ? 'text-gray-500' : 'font-medium text-gray-800'} ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
                <div className="flex items-center space-x-3">
                    <Image
                        src={senderAvatar}
                        alt={senderName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover aspect-square"
                    />
                    <div>
                        <p>{notification.message}</p>
                        <span className="block text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
            </Link>
        );
    }, [processingRequests, handleAcceptReject]);


    // Determine the user's avatar URL, with fallback, using the imported utility
    const userAvatar = getFullAvatarUrl(user?.avatarUrl);

    return (
        <>
            {/* Overlay */}
            {(showNotificationDropdown || showProfileDropdown || isMenuOpen) && (
                <div
                    className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-[190]"
                    style={{ top: '64px' }}
                    onClick={() => {
                        setShowNotificationDropdown(false);
                        setShowProfileDropdown(false);
                        setIsMenuOpen(false);
                    }}
                    aria-hidden="true"
                ></div>
            )}

            <nav className="bg-white shadow-lg p-3 flex items-center justify-between fixed top-0 left-0 w-full z-[300]">
                <div className="flex items-center space-x-2 md:pl-8">
                    <Link href="/dashboard" className="text-2xl font-extrabold text-blue-600 tracking-tight">
                        Vartalaap<span className="text-yellow-500 text-3xl">.</span>
                    </Link>
                </div>

                {/* Desktop Search Bar */}
                <div className="hidden md:flex items-center flex-grow mx-auto max-w-xl pr-20">
                    <SearchBar currentAuthUser={user} />
                </div>

                {/* Desktop Navigation Links and User Menu */}
                <div className="hidden md:flex items-center space-x-6 mr-0">
                    <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" aria-label="Home">
                        <Home size={20} />
                    </Link>
                    <Link href="/users" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" aria-label="Find Users">
                        <Users size={20} />
                    </Link>
                    <Link href="/chat" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" aria-label="Messages">
                        <MessageSquare size={20} />
                    </Link>

                    {/* Notifications Dropdown */}
                    <div className="relative">
                        <button
                            onClick={handleNotificationClick}
                            className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            {notificationCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                        <AnimatePresence>
                            {showNotificationDropdown && (
                                <motion.div
                                    ref={notificationDropdownRef}
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right"
                                >
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        {notificationCount > 0 && (
                                            <button
                                                onClick={() => fetchNotifications(true)}
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    {notifications.length > 0 ? (
                                        <AnimatedList
                                            items={notifications}
                                            renderItem={renderNotificationItem} // Pass the custom render function
                                            onItemSelect={(item) => {
                                                // Handle selection if needed, e.g., navigate or mark as read
                                                if (item.link) {
                                                    router.push(item.link);
                                                    setShowNotificationDropdown(false);
                                                }
                                                // If it's a follow request, do nothing on select as buttons handle it
                                                if (item.type !== 'followRequest' && !item.read) {
                                                    // Optionally mark selected notification as read here
                                                    // This would require an API call specific to that notification
                                                }
                                            }}
                                            className="max-h-96" // Apply max-height here
                                            showGradients={true}
                                            enableArrowNavigation={true}
                                            displayScrollbar={true}
                                        />
                                    ) : (
                                        <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                                    )}
                                    <div className="p-3 border-t border-gray-200 text-center">
                                        <Link href="/dashboard/notifications" onClick={() => setShowNotificationDropdown(false)} className="text-blue-600 hover:underline text-sm">
                                            View all notifications
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative hover:bg-gray-100 rounded-full p-1 ">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
                            aria-label="User menu"
                        >
                            <Image
                                src={userAvatar}
                                alt={user?.name || 'User Profile'}
                                width={40}
                                height={40}
                                className="rounded-full object-cover aspect-square"
                            />
                            <p className="ml-2 text-gray-800 font-medium">{user?.name}</p>
                        </button>
                        <AnimatePresence>
                            {showProfileDropdown && (
                                <motion.div
                                    ref={profileDropdownRef}
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right"
                                >
                                    <div className="">
                                        <Link
                                            // href={`/users/${user?.firebaseUid || user?._id || 'profile'}`}
                                            href={'/profile'}
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <User size={18} className="mr-2" /> My Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <Settings size={18} className="mr-2" /> Settings
                                        </Link>
                                        <div className="border-t border-gray-200 my-0"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-red-500/80 hover:text-white cursor-pointer"
                                        >
                                            <LogOut size={18} className="mr-2" /> Log Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Menu Button (Visible on smaller screens) */}
                <div className="md:hidden flex items-center space-x-4">
                    <div className="relative">
                        <button
                            onClick={handleNotificationClick}
                            className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                        <AnimatePresence>
                            {showNotificationDropdown && (
                                <motion.div
                                    ref={notificationDropdownRef}
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute ml-[-255px] mt-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right"
                                >
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        {notificationCount > 0 && (
                                            <button
                                                onClick={() => fetchNotifications(true)}
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    {notifications.length > 0 ? (
                                        <AnimatedList
                                            items={notifications}
                                            renderItem={renderNotificationItem}
                                            onItemSelect={(item) => {
                                                if (item.link) {
                                                    router.push(item.link);
                                                    setShowNotificationDropdown(false);
                                                }
                                                if (item.type !== 'followRequest' && !item.read) {
                                                    // Optionally mark selected notification as read here
                                                }
                                            }}
                                            className="max-h-100" // Adjusted max-height for mobile
                                            showGradients={true}
                                            enableArrowNavigation={true}
                                            displayScrollbar={true}
                                        />
                                    ) : (
                                        <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={handleMenuToggle}
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Mobile Menu (Hidden by default, shown when toggled) */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl z-[200] py-4 transform origin-top"
                        >
                            <div className="m-0 p-0 flex items-center justify-center">
                                <SearchBar currentAuthUser={user} />
                            </div>
                            <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
                                <Home size={20} className="mr-3" /> Home
                            </Link>
                            <Link href="/users" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
                                <Users size={20} className="mr-3" /> Find Users
                            </Link>
                            <Link href="/messages" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
                                <MessageSquare size={20} className="mr-3" /> Messages
                            </Link>
                            <div className="border-t border-gray-200 my-2"></div>
                            <Link
                                // href={`/users/${user?.firebaseUid || user?._id || 'profile'}`}
                                href={'/profile'}
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                                onClick={handleMenuToggle}
                            >
                                <User size={20} className="mr-3" /> My Profile
                            </Link>
                            <Link href="settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={handleMenuToggle}>
                                <Settings size={20} className="mr-3" /> Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
                            >
                                <LogOut size={20} className="mr-3" /> Log Out
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Navbar;