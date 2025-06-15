// // 'use client'; // Ensure this directive is at the very top if this is a Client Component

// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useAuth } from './AuthProvider';
// import { useSocket } from './SocketProvider';
// import toast from 'react-hot-toast';
// import { Bell, Home, MessageSquare, Search, Settings, User, LogOut, Users, Check, X } from 'lucide-react';
// import defaultUserLogo from '../app/assets/userLogo.png';
// import { useRouter } from 'next/navigation';

// interface Notification {
//     _id: string;
//     type: string;
//     message: string;
//     read: boolean;
//     createdAt: string;
//     sender: {
//         _id: string;
//         name: string;
//         avatarUrl: string;
//         firebaseUid?: string;
//     };
//     link?: string;
//     data?: {
//         requestId?: string;
//     };
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

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

//     // --- New: Audio Players for sounds ---
//     const requestAcceptedAudio = useRef<HTMLAudioElement | null>(null);
//     const requestRejectedAudio = useRef<HTMLAudioElement | null>(null);

//     useEffect(() => {
//         // Initialize audio elements once on component mount
//         requestAcceptedAudio.current = new Audio('/sounds/request_accepted.mp3');
//         requestRejectedAudio.current = new Audio('/sounds/request_rejected.mp3');
//         // Preload sounds for faster playback
//         requestAcceptedAudio.current.load();
//         requestRejectedAudio.current.load();
//     }, []);

//     const playSound = useCallback((audioElementRef: React.MutableRefObject<HTMLAudioElement | null>) => {
//         if (audioElementRef.current) {
//             audioElementRef.current.currentTime = 0; // Rewind to start
//             audioElementRef.current.play().catch(error => {
//                 console.warn('Audio playback failed:', error);
//                 // This might happen if the user hasn't interacted with the page yet
//             });
//         }
//     }, []);
//     // --- End New: Audio Players ---

//     const fetchNotifications = useCallback(async (markAsRead: boolean = false) => {
//         if (!user || !getIdToken) return;

//         try {
//             const idToken = await getIdToken();
//             if (!idToken) {
//                 console.warn('No ID token available for fetching notifications.');
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
//                 const errorData = await response.json();
//                 console.error('Failed to fetch/update notifications:', errorData.message || response.statusText);
//                 toast.error('Failed to load notifications.');
//             }
//         } catch (error) {
//             console.error('Error fetching/updating notifications:', error);
//             toast.error('An unexpected error occurred while loading notifications.');
//         }
//     }, [user, getIdToken]);

//     // Handle accepting or rejecting a follow request
//     const handleAcceptReject = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
//         if (!user || !getIdToken || processingRequests.has(requestId)) return;

//         setProcessingRequests(prev => new Set([...prev, requestId]));
//         const loadingToast = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`);

//         try {
//             const idToken = await getIdToken();
//             if (!idToken) {
//                 throw new Error('No authentication token available');
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
//                 // Remove the specific follow request notification from the list
//                 setNotifications(prev => prev.filter(notif =>
//                     notif.type !== 'followRequest' || notif.data?.requestId !== requestId
//                 ));
//                 toast.dismiss(loadingToast);
//                 toast.success(data.message || `Follow request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);

//                 // --- New: Play sound based on action ---
//                 if (action === 'accept') {
//                     playSound(requestAcceptedAudio);
//                 } else {
//                     playSound(requestRejectedAudio);
//                 }
//                 // --- End New ---

//                 fetchNotifications(); // Refresh notifications after action
//             } else {
//                 throw new Error(data.message || `Failed to ${action} request`);
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
//     }, [user, getIdToken, processingRequests, fetchNotifications, playSound]); // Added playSound to dependencies


//     // Effect for handling real-time notifications via Socket.IO
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
//                 // Consider playing a general notification sound here if you want
//                 // E.g., playSound(generalNotificationAudio);
//             };

//             socket.on('newNotification', handleNewNotification);

//             return () => {
//                 socket.off('newNotification', handleNewNotification);
//             };
//         }
//     }, [socket, user?._id]);

//     // Initial fetch of notifications on component mount
//     useEffect(() => {
//         fetchNotifications();
//     }, [fetchNotifications]);

//     // Handle user logout
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

//     // Toggle notification dropdown and fetch notifications if opening
//     const handleNotificationClick = () => {
//         if (!showNotificationDropdown) {
//             fetchNotifications();
//         }
//         setShowNotificationDropdown(prev => !prev);
//         setShowProfileDropdown(false);
//     };

//     // Close dropdowns when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
//                 setShowProfileDropdown(false);
//             }
//             if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
//                 setShowNotificationDropdown(false);
//             }
//             if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//                 setIsMenuOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     // Render individual notification based on its type
//     const renderNotification = (notification: Notification) => {
//         if (notification.type === 'followRequest') {
//             const isProcessing = processingRequests.has(notification.data?.requestId || notification._id);
//             return (
//                 <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100" key={notification._id}>
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <Image
//                                 src={notification.sender.avatarUrl || defaultUserLogo}
//                                 alt={notification.sender.name}
//                                 width={40}
//                                 height={40}
//                                 className="rounded-full object-cover"
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
//                                     handleAcceptReject(notification.data?.requestId || notification._id, 'accept');
//                                 }}
//                                 disabled={isProcessing}
//                                 className={`p-2 rounded-full transition-colors ${isProcessing
//                                         ? 'bg-gray-100 cursor-not-allowed'
//                                         : 'bg-green-100 hover:bg-green-200 text-green-600'
//                                     }`}
//                                 aria-label="Accept follow request"
//                             >
//                                 <Check className="w-4 h-4" />
//                             </button>
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleAcceptReject(notification.data?.requestId || notification._id, 'reject');
//                                 }}
//                                 disabled={isProcessing}
//                                 className={`p-2 rounded-full transition-colors ${isProcessing
//                                         ? 'bg-gray-100 cursor-not-allowed'
//                                         : 'bg-red-100 hover:bg-red-200 text-red-600'
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

//         // Default rendering for other notification types
//         return (
//             <Link
//                 key={notification._id}
//                 href={`/dashboard/notifications?id=${notification._id}`} // Example link
//                 onClick={() => setShowNotificationDropdown(false)}
//                 className={`block px-4 py-3 text-sm hover:bg-gray-100 ${notification.read ? 'text-gray-500' : 'font-medium text-gray-800'}`}
//             >
//                 <div className="flex items-center space-x-3">
//                     <Image
//                         src={notification.sender.avatarUrl || defaultUserLogo}
//                         alt={notification.sender.name}
//                         width={40}
//                         height={40}
//                         className="rounded-full object-cover"
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

//     const userAvatar = user?.avatarUrl || defaultUserLogo.src;

//     return (
//         <nav className="bg-white shadow-md p-4 flex items-center justify-between fixed top-0 left-0 w-full z-50">
//             {/* Logo and Brand Name */}
//             <div className="flex items-center space-x-2 ml-10">
//                 <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
//                     Vartalaap<span className="custom-yellow text-3xl">.</span>
//                 </Link>
//             </div>
//             {/* Search Bar (Desktop) */}
//             <div className="hidden md:flex items-center flex-grow mx-4 max-w-lg ml-45">
//                 <div className="relative w-full">
//                     <input
//                         type="text"
//                         placeholder="Search Vartalaap"
//                         className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
//                     />
//                     <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                 </div>
//             </div>

//             {/* Desktop Navigation Icons & Profile */}
//             <div className="flex items-center space-x-4">
//                 <div className="hidden md:flex items-center space-x-4">
//                     <Link href="/dashboard" className="nav-icon-wrapper group cursor-pointer">
//                         <Home size={18} className="nav-icon" />
//                     </Link>

//                     {/* Notifications Dropdown */}
//                     <div className="relative" ref={notificationDropdownRef}>
//                         <button onClick={handleNotificationClick} className="nav-icon-wrapper group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer" aria-label="Notifications">
//                             <Bell size={18} className="nav-icon" />
//                             {notificationCount > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
//                                     {notificationCount}
//                                 </span>
//                             )}
//                         </button>

//                         {showNotificationDropdown && (
//                             <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
//                                 <div className="p-3 font-semibold text-gray-800 border-b border-gray-200">
//                                     Notifications
//                                 </div>
//                                 {notifications.length > 0 ? (
//                                     <>
//                                         {notifications.map((notification) => (
//                                             renderNotification(notification)
//                                         ))}
//                                         <div className="border-t border-gray-200">
//                                             <button
//                                                 onClick={() => {
//                                                     fetchNotifications(true); // Mark all as read
//                                                     setShowNotificationDropdown(false);
//                                                 }}
//                                                 className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50"
//                                             >
//                                                 Mark All as Read
//                                             </button>
//                                             <Link
//                                                 href="/dashboard/notifications"
//                                                 onClick={() => setShowNotificationDropdown(false)}
//                                                 className="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                             >
//                                                 View All Notifications
//                                             </Link>
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <div className="p-4 text-center text-gray-500">No new notifications.</div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     <Link href="/dashboard/messages" className="nav-icon-wrapper group cursor-pointer">
//                         <MessageSquare size={18} className="nav-icon" />
//                     </Link>
//                     <Link href="/dashboard/groups" className="nav-icon-wrapper group cursor-pointer">
//                         <Users size={18} className="nav-icon" />
//                     </Link>
//                 </div>

//                 {/* User Profile Dropdown */}
//                 <div className="relative" ref={profileDropdownRef}>
//                     <button
//                         onClick={() => {
//                             setShowProfileDropdown(!showProfileDropdown);
//                             setShowNotificationDropdown(false);
//                         }}
//                         className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
//                         aria-label="User menu"
//                     >
//                         <Image
//                             src={userAvatar}
//                             alt="User Avatar"
//                             width={32}
//                             height={32}
//                             className="rounded-full object-cover aspect-square"
//                             priority
//                         />
//                         <span className="font-medium hidden sm:block">{user?.name || 'Guest'}</span>
//                     </button>

//                     {showProfileDropdown && (
//                         <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
//                             <Link href={`/dashboard/profile/${user?._id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md">
//                                 <User size={16} className="mr-2" /> My Profile
//                             </Link>
//                             <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
//                                 <Settings size={16} className="mr-2" /> Settings
//                             </Link>
//                             <button
//                                 onClick={handleLogout}
//                                 className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md"
//                             >
//                                 <LogOut size={16} className="mr-2" /> Logout
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;





// 'use client';

// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useAuth } from './AuthProvider';
// import { useSocket } from './SocketProvider';
// import toast from 'react-hot-toast';
// import { Bell, Home, MessageSquare, Search, Settings, User, LogOut, Users, Check, X, Menu } from 'lucide-react';
// import defaultUserLogo from '../app/assets/userLogo.png';
// import { useRouter } from 'next/navigation';

// interface Notification {
//     _id: string;
//     type: string;
//     message: string;
//     read: boolean;
//     createdAt: string;
//     sender: {
//         _id: string;
//         name: string;
//         avatarUrl: string;
//         firebaseUid?: string;
//     };
//     link?: string;
//     data?: {
//         requestId?: string;
//     };
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

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
//     const menuRef = useRef<HTMLDivElement>(null); // Ref for the mobile slide-in menu content

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

//     const fetchNotifications = useCallback(async (markAsRead: boolean = false) => {
//         if (!user || !getIdToken) return;

//         try {
//             const idToken = await getIdToken();
//             if (!idToken) {
//                 console.warn('No ID token available for fetching notifications.');
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
//                 const errorData = await response.json();
//                 console.error('Failed to fetch/update notifications:', errorData.message || response.statusText);
//                 toast.error('Failed to load notifications.');
//             }
//         } catch (error) {
//             console.error('Error fetching/updating notifications:', error);
//             toast.error('An unexpected error occurred while loading notifications.');
//         }
//     }, [user, getIdToken]);

//     const handleAcceptReject = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
//         if (!user || !getIdToken || processingRequests.has(requestId)) return;

//         setProcessingRequests(prev => new Set([...prev, requestId]));
//         const loadingToast = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`);

//         try {
//             const idToken = await getIdToken();
//             if (!idToken) {
//                 throw new Error('No authentication token available');
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
//                 throw new Error(data.message || `Failed to ${action} request`);
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
//         setShowProfileDropdown(false); // Close other dropdowns
//         setIsMenuOpen(false); // Close mobile menu
//     };

//     const handleProfileClick = () => {
//         setShowProfileDropdown(prev => !prev);
//         setShowNotificationDropdown(false); // Close other dropdowns
//         setIsMenuOpen(false); // Close mobile menu
//     };

//     const handleMenuToggle = () => {
//         setIsMenuOpen(prev => !prev);
//         setShowProfileDropdown(false); // Close other dropdowns
//         setShowNotificationDropdown(false); // Close other dropdowns
//     };

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             // Check if the click was outside of any of the open dropdowns/menus
//             let clickedInsideAnyDropdown = false;

//             if (isMenuOpen && menuRef.current && menuRef.current.contains(event.target as Node)) {
//                 clickedInsideAnyDropdown = true;
//             }
//             if (showNotificationDropdown && notificationDropdownRef.current && notificationDropdownRef.current.contains(event.target as Node)) {
//                 clickedInsideAnyDropdown = true;
//             }
//             if (showProfileDropdown && profileDropdownRef.current && profileDropdownRef.current.contains(event.target as Node)) {
//                 clickedInsideAnyDropdown = true;
//             }

//             // Check if the click was on any of the buttons that trigger dropdowns
//             const isDropdownToggleButton = (event.target as HTMLElement).closest(
//                 'button[aria-label="Open menu"], button[aria-label="Close menu"], button[aria-label="Notifications"], button[aria-label="User menu"]'
//             );

//             if (!clickedInsideAnyDropdown && !isDropdownToggleButton) {
//                 // If clicked outside of any open dropdown and not on a toggle button, close all
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
//         if (notification.type === 'followRequest') {
//             const isProcessing = processingRequests.has(notification.data?.requestId || notification._id);
//             return (
//                 <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0" key={notification._id}>
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <Image
//                                 src={notification.sender.avatarUrl || defaultUserLogo}
//                                 alt={notification.sender.name}
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
//                                     handleAcceptReject(notification.data?.requestId || notification._id, 'accept');
//                                 }}
//                                 disabled={isProcessing}
//                                 className={`p-2 rounded-full transition-colors ${isProcessing
//                                         ? 'bg-gray-100 cursor-not-allowed'
//                                         : 'bg-green-100 hover:bg-green-200 text-green-600'
//                                     }`}
//                                 aria-label="Accept follow request"
//                             >
//                                 <Check className="w-4 h-4" />
//                             </button>
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleAcceptReject(notification.data?.requestId || notification._id, 'reject');
//                                 }}
//                                 disabled={isProcessing}
//                                 className={`p-2 rounded-full transition-colors ${isProcessing
//                                         ? 'bg-gray-100 cursor-not-allowed'
//                                         : 'bg-red-100 hover:bg-red-200 text-red-600'
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
//                         src={notification.sender.avatarUrl || defaultUserLogo}
//                         alt={notification.sender.name}
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

//     const userAvatar = user?.avatarUrl || defaultUserLogo.src;

//     return (
//         <>
//             {/* The main Navbar, always on top */}
//             <nav className="bg-white shadow-lg p-4 flex items-center justify-between fixed top-0 left-0 w-full z-[200]">
//                 {/* Logo and Brand Name */}
//                 <div className="flex items-center space-x-2 md:pl-8">
//                     <Link href="/dashboard" className="text-2xl font-extrabold text-blue-600 tracking-tight">
//                         Vartalaap<span className="text-yellow-500 text-3xl">.</span>
//                     </Link>
//                 </div>

//                 {/* Search Bar (Desktop) */}
//                 <div className="hidden md:flex items-center flex-grow mx-auto max-w-xl pr-20">
//                     <div className="relative w-full">
//                         <input
//                             type="text"
//                             placeholder="Search Vartalaap"
//                             className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
//                         />
//                         <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                     </div>
//                 </div>

//                 {/* Desktop Navigation Icons & Profile */}
//                 <div className="hidden md:flex items-center space-x-6 pr-4">
//                     <Link href="/dashboard" className="nav-icon-wrapper group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
//                         <Home size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
//                     </Link>

//                     {/* Notifications Dropdown (Desktop) */}
//                     <div className="relative" ref={notificationDropdownRef}>
//                         <button onClick={handleNotificationClick} className="nav-icon-wrapper group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200" aria-label="Notifications">
//                             <Bell size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
//                             {notificationCount > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
//                                     {notificationCount}
//                                 </span>
//                             )}
//                         </button>

//                         {showNotificationDropdown && (
//                             <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[260] max-h-96 overflow-y-auto transform origin-top-right animate-fade-in">
//                                 <div className="p-3 font-bold text-gray-800 border-b border-gray-200 text-lg">
//                                     Notifications
//                                 </div>
//                                 {notifications.length > 0 ? (
//                                     <>
//                                         {notifications.map((notification) => (
//                                             renderNotification(notification)
//                                         ))}
//                                         <div className="border-t border-gray-200 flex flex-col">
//                                             <button
//                                                 onClick={() => {
//                                                     fetchNotifications(true);
//                                                     setShowNotificationDropdown(false);
//                                                 }}
//                                                 className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
//                                             >
//                                                 Mark All as Read
//                                             </button>
//                                             <Link
//                                                 href="/dashboard/notifications"
//                                                 onClick={() => setShowNotificationDropdown(false)}
//                                                 className="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors duration-200"
//                                             >
//                                                 View All Notifications
//                                             </Link>
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <div className="p-4 text-center text-gray-500">No new notifications.</div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     <Link href="/dashboard/messages" className="nav-icon-wrapper group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
//                         <MessageSquare size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
//                     </Link>
//                     <Link href="/dashboard/groups" className="nav-icon-wrapper group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
//                         <Users size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
//                     </Link>

//                     {/* User Profile Dropdown (Desktop) */}
//                     <div className="relative" ref={profileDropdownRef}>
//                         <button
//                             onClick={handleProfileClick}
//                             className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
//                             aria-label="User menu"
//                         >
//                             <Image
//                                 src={userAvatar}
//                                 alt="User Avatar"
//                                 width={36}
//                                 height={36}
//                                 className="rounded-full object-cover aspect-square border-2 border-transparent group-hover:border-blue-500 transition-all duration-200"
//                                 priority
//                             />
//                             <span className="font-semibold hidden sm:block text-gray-800">{user?.name || 'Guest'}</span>
//                         </button>

//                         {showProfileDropdown && (
//                             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[400] transform origin-top-right animate-fade-in">
//                                 <Link
//                                     href={`/dashboard/profile/${user?._id}`}
//                                     onClick={() => setShowProfileDropdown(false)}
//                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors duration-200"
//                                 >
//                                     <User size={16} className="mr-2 text-gray-500" /> My Profile
//                                 </Link>
//                                 <Link
//                                     href="/dashboard/settings"
//                                     onClick={() => setShowProfileDropdown(false)}
//                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                                 >
//                                     <Settings size={16} className="mr-2 text-gray-500" /> Settings
//                                 </Link>
//                                 <button
//                                     onClick={handleLogout}
//                                     className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200"
//                                 >
//                                     <LogOut size={16} className="mr-2 text-red-500" /> Logout
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Mobile Navigation Icons & Hamburger Menu */}
//                 {/* This `div` acts as a container for all mobile-specific icons. */}
//                 <div className="md:hidden flex items-center space-x-3 relative z-[100]">
//                     {/* Mobile Notification Bell and its Dropdown */}
//                     {/* NEW: This `div` is now relative, and the dropdown is inside it. */}
//                     <div className="relative">
//                         <button
//                             onClick={handleNotificationClick}
//                             className="nav-icon-wrapper group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer"
//                             aria-label="Notifications"
//                         >
//                             <Bell size={20} className="text-gray-600" />
//                             {notificationCount > 0 && (
//                                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
//                                     {notificationCount}
//                                 </span>
//                             )}
//                         </button>

//                         {showNotificationDropdown && (
//                             <>
//                                 {/* Backdrop for mobile notification dropdown */}
//                                 {/* Note: These backdrops are `fixed` so they cover the whole screen. */}
//                                 <div
//                                     className="fixed inset-0  bg-opacity-30 backdrop-blur-sm z-[0]"
//                                     onClick={() => setShowNotificationDropdown(false)}
//                                     aria-hidden="true"
//                                 ></div>
//                                 {/* Notification Dropdown for Mobile (positioned relative to its parent `div.relative`) */}
//                                 <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[96] max-h-96 overflow-y-auto transform origin-top-right animate-fade-in" ref={notificationDropdownRef}>
//                                     <div className="p-3 font-bold text-gray-800 border-b border-gray-200 text-lg">
//                                         Notifications
//                                     </div>
//                                     {notifications.length > 0 ? (
//                                         <>
//                                             {notifications.map((notification) => (
//                                                 renderNotification(notification)
//                                             ))}
//                                             <div className="border-t border-gray-200 flex flex-col">
//                                                 <button
//                                                     onClick={() => {
//                                                         fetchNotifications(true);
//                                                         setShowNotificationDropdown(false);
//                                                     }}
//                                                     className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
//                                                 >
//                                                     Mark All as Read
//                                                 </button>
//                                                 <Link
//                                                     href="/dashboard/notifications"
//                                                     onClick={() => setShowNotificationDropdown(false)}
//                                                     className="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors duration-200"
//                                                 >
//                                                     View All Notifications
//                                                 </Link>
//                                             </div>
//                                         </>
//                                     ) : (
//                                         <div className="p-4 text-center text-gray-500">No new notifications.</div>
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     {/* Mobile User Avatar and its Dropdown */}
//                     {/* NEW: This `div` is now relative, and the dropdown is inside it. */}
//                     <div className="relative">
//                         <button
//                             onClick={handleProfileClick}
//                             className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
//                             aria-label="User menu"
//                         >
//                             <Image
//                                 src={userAvatar}
//                                 alt="User Avatar"
//                                 width={32}
//                                 height={32}
//                                 className="rounded-full object-cover aspect-square"
//                                 priority
//                             />
//                         </button>

//                         {showProfileDropdown && (
//                             <>
//                                 {/* Backdrop for mobile profile dropdown */}
//                                 {/* Note: These backdrops are `fixed` so they cover the whole screen. */}
//                                 <div
//                                     className="fixed inset-0  bg-opacity-30 backdrop-blur-sm z-[0]"
//                                     onClick={() => setShowProfileDropdown(false)}
//                                     aria-hidden="true"
//                                 ></div>
//                                 {/* Profile Dropdown for Mobile (positioned relative to its parent `div.relative`) */}
//                                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[96] transform origin-top-right animate-fade-in" ref={profileDropdownRef}>
//                                     <Link
//                                         href={`/dashboard/profile/${user?._id}`}
//                                         onClick={() => setShowProfileDropdown(false)}
//                                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors duration-200"
//                                     >
//                                         <User size={16} className="mr-2 text-gray-500" /> My Profile
//                                     </Link>
//                                     <Link
//                                         href="/dashboard/settings"
//                                         onClick={() => setShowProfileDropdown(false)}
//                                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                                     >
//                                         <Settings size={16} className="mr-2 text-gray-500" /> Settings
//                                     </Link>
//                                     <button
//                                         onClick={handleLogout}
//                                         className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200"
//                                     >
//                                         <LogOut size={16} className="mr-2 text-red-500" /> Logout
//                                     </button>
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     {/* Hamburger/X Toggle Button (its menu is separate, fixed to top) */}
//                     <button
//                         onClick={handleMenuToggle}
//                         className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
//                         aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//                     >
//                         {isMenuOpen ? (
//                             <X size={24} className="text-gray-700 transition-transform duration-300 transform rotate-90" />
//                         ) : (
//                             <Menu size={24} className="text-gray-700 transition-transform duration-300" />
//                         )}
//                     </button>
//                 </div>
//             </nav>

//             {/* Mobile Menu Backdrop (remains outside for full-screen effect) */}
//             {/* This backdrop covers the entire screen, *underneath* the mobile menu. */}
//             {isMenuOpen && (
//                 <div
//                     className="md:hidden fixed inset-0  bg-opacity-30 backdrop-blur-sm z-[0]"
//                     onClick={() => setIsMenuOpen(false)}
//                     aria-hidden="true"
//                 ></div>
//             )}

//             {/* Mobile Navigation Menu Content (fixed from top) */}
//             {/* This menu slides down from below the main navbar. */}
//             {isMenuOpen && (
//                 <div ref={menuRef} className="md:hidden fixed top-[64px] left-0 w-full bg-white border-t border-gray-200 shadow-lg pb-4 z-[106] animate-slide-down">
//                     <div className="flex flex-col items-start p-4 space-y-3">
//                         <div className="relative w-full mb-2">
//                             <input
//                                 type="text"
//                                 placeholder="Search Vartalaap"
//                                 className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
//                             />
//                             <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//                         </div>
//                         <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
//                             <Home size={18} className="mr-3" /> Home
//                         </Link>
//                         <Link href="/dashboard/messages" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
//                             <MessageSquare size={18} className="mr-3" /> Messages
//                         </Link>
//                         <Link href="/dashboard/groups" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
//                             <Users size={18} className="mr-3" /> Groups
//                         </Link>
//                         <Link href={`/dashboard/profile/${user?._id}`} onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
//                             <User size={18} className="mr-3" /> My Profile
//                         </Link>
//                         <Link href="/dashboard/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
//                             <Settings size={18} className="mr-3" /> Settings
//                         </Link>
//                         <button
//                             onClick={handleLogout}
//                             className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
//                         >
//                             <LogOut size={18} className="mr-3 text-red-500" /> Logout
//                         </button>
//                     </div>
//                 </div>
//             )}
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

interface Notification {
    _id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
    sender: {
        _id: string;
        name: string;
        avatarUrl: string;
        firebaseUid?: string;
    };
    link?: string;
    data?: {
        requestId?: string;
    };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

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
    const menuRef = useRef<HTMLDivElement>(null); // Ref for the mobile slide-in menu content

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
        if (!user || !getIdToken) return;

        try {
            const idToken = await getIdToken();
            if (!idToken) {
                console.warn('No ID token available for fetching notifications.');
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
                const errorData = await response.json();
                console.error('Failed to fetch/update notifications:', errorData.message || response.statusText);
                toast.error('Failed to load notifications.');
            }
        } catch (error) {
            console.error('Error fetching/updating notifications:', error);
            toast.error('An unexpected error occurred while loading notifications.');
        }
    }, [user, getIdToken]);

    const handleAcceptReject = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
        if (!user || !getIdToken || processingRequests.has(requestId)) return;

        setProcessingRequests(prev => new Set([...prev, requestId]));
        const loadingToast = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`);

        try {
            const idToken = await getIdToken();
            if (!idToken) {
                throw new Error('No authentication token available');
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
                fetchNotifications();
            } else {
                throw new Error(data.message || `Failed to ${action} request`);
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
            fetchNotifications();
        }
        setShowNotificationDropdown(prev => !prev);
        setShowProfileDropdown(false); // Close other dropdowns
        setIsMenuOpen(false); // Close mobile menu
    };

    const handleProfileClick = () => {
        setShowProfileDropdown(prev => !prev);
        setShowNotificationDropdown(false); // Close other dropdowns
        setIsMenuOpen(false); // Close mobile menu
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => !prev);
        setShowProfileDropdown(false); // Close other dropdowns
        setShowNotificationDropdown(false); // Close other dropdowns
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click was outside of any of the open dropdowns/menus
            let clickedInsideAnyDropdown = false;

            if (isMenuOpen && menuRef.current && menuRef.current.contains(event.target as Node)) {
                clickedInsideAnyDropdown = true;
            }
            if (showNotificationDropdown && notificationDropdownRef.current && notificationDropdownRef.current.contains(event.target as Node)) {
                clickedInsideAnyDropdown = true;
            }
            if (showProfileDropdown && profileDropdownRef.current && profileDropdownRef.current.contains(event.target as Node)) {
                clickedInsideAnyDropdown = true;
            }

            // Check if the click was on any of the buttons that trigger dropdowns
            const isDropdownToggleButton = (event.target as HTMLElement).closest(
                'button[aria-label="Open menu"], button[aria-label="Close menu"], button[aria-label="Notifications"], button[aria-label="User menu"]'
            );

            if (!clickedInsideAnyDropdown && !isDropdownToggleButton) {
                // If clicked outside of any open dropdown and not on a toggle button, close all
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


    const renderNotification = (notification: Notification) => {
        if (notification.type === 'followRequest') {
            const isProcessing = processingRequests.has(notification.data?.requestId || notification._id);
            return (
                <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0" key={notification._id}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Image
                                src={notification.sender.avatarUrl || defaultUserLogo}
                                alt={notification.sender.name}
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
                                    e.stopPropagation();
                                    handleAcceptReject(notification.data?.requestId || notification._id, 'accept');
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
                                    e.stopPropagation();
                                    handleAcceptReject(notification.data?.requestId || notification._id, 'reject');
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
                key={notification._id}
                href={`/dashboard/notifications?id=${notification._id}`}
                onClick={() => setShowNotificationDropdown(false)}
                className={`flex items-center px-4 py-3 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${notification.read ? 'text-gray-500' : 'font-medium text-gray-800'}`}
            >
                <div className="flex items-center space-x-3">
                    <Image
                        src={notification.sender.avatarUrl || defaultUserLogo}
                        alt={notification.sender.name}
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
    };

    const userAvatar = user?.avatarUrl || defaultUserLogo.src;

    return (
        <>
            {/* Backdrop - Only shows when any dropdown/menu is open, positioned below navbar */}
            {(showNotificationDropdown || showProfileDropdown || isMenuOpen) && (
                <div
                    className="fixed inset-0  bg-opacity-30 backdrop-blur-sm z-[190]"
                    style={{ top: '64px' }} // Start below navbar
                    onClick={() => {
                        setShowNotificationDropdown(false);
                        setShowProfileDropdown(false);
                        setIsMenuOpen(false);
                    }}
                    aria-hidden="true"
                ></div>
            )}

            {/* The main Navbar, always on top and never blurred */}
            <nav className="bg-white shadow-lg p-4 flex items-center justify-between fixed top-0 left-0 w-full z-[300]">
                {/* Logo and Brand Name */}
                <div className="flex items-center space-x-2 md:pl-8">
                    <Link href="/dashboard" className="text-2xl font-extrabold text-blue-600 tracking-tight">
                        Vartalaap<span className="text-yellow-500 text-3xl">.</span>
                    </Link>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex items-center flex-grow mx-auto max-w-xl pr-20">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search Vartalaap"
                            className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
                        />
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                {/* Desktop Navigation Icons & Profile */}
                <div className="hidden md:flex items-center space-x-6 pr-4">
                    <Link href="/dashboard" className="nav-icon-wrapper group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <Home size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                    </Link>

                    {/* Notifications Dropdown (Desktop) */}
                    <div className="relative" ref={notificationDropdownRef}>
                        <button onClick={handleNotificationClick} className="nav-icon-wrapper group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200" aria-label="Notifications">
                            <Bell size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {showNotificationDropdown && (
                            <div className="absolute right-0 mt-5 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] max-h-96 overflow-y-auto transform origin-top-right animate-fade-in">
                                <div className="p-3 font-bold text-gray-800 border-b border-gray-200 text-lg">
                                    Notifications
                                </div>
                                {notifications.length > 0 ? (
                                    <>
                                        {notifications.map((notification) => (
                                            renderNotification(notification)
                                        ))}
                                        <div className="border-t border-gray-200 flex flex-col">
                                            <button
                                                onClick={() => {
                                                    fetchNotifications(true);
                                                    setShowNotificationDropdown(false);
                                                }}
                                                className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                Mark All as Read
                                            </button>
                                            <Link
                                                href="/dashboard/notifications"
                                                onClick={() => setShowNotificationDropdown(false)}
                                                className="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors duration-200"
                                            >
                                                View All Notifications
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">No new notifications.</div>
                                )}
                            </div>
                        )}
                    </div>

                    <Link href="/dashboard/messages" className="nav-icon-wrapper group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <MessageSquare size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                    </Link>
                    <Link href="/dashboard/groups" className="nav-icon-wrapper group cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <Users size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                    </Link>

                    {/* User Profile Dropdown (Desktop) */}
                    <div className="relative" ref={profileDropdownRef}>
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="User menu"
                        >
                            <Image
                                src={userAvatar}
                                alt="User Avatar"
                                width={36}
                                height={36}
                                className="rounded-full object-cover aspect-square border-2 border-transparent group-hover:border-blue-500 transition-all duration-200"
                                priority
                            />
                            <span className="font-semibold hidden sm:block text-gray-800">{user?.name || 'Guest'}</span>
                        </button>

                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-4 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] transform origin-top-right animate-fade-in">
                                <Link
                                    href={`/dashboard/profile/${user?._id}`}
                                    onClick={() => setShowProfileDropdown(false)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors duration-200"
                                >
                                    <User size={16} className="mr-2 text-gray-500" /> My Profile
                                </Link>
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setShowProfileDropdown(false)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <Settings size={16} className="mr-2 text-gray-500" /> Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200"
                                >
                                    <LogOut size={16} className="mr-2 text-red-500" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Icons & Hamburger Menu */}
                <div className="md:hidden flex items-center space-x-3">
                    {/* Mobile Notification Bell and its Dropdown */}
                    <div className="relative">
                        <button
                            onClick={handleNotificationClick}
                            className="nav-icon-wrapper group relative p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                            aria-label="Notifications"
                        >
                            <Bell size={20} className="text-gray-600" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {showNotificationDropdown && (
                            <div className="absolute right-0 mt-5 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] max-h-96 overflow-y-auto transform origin-top-right animate-fade-in">
                                <div className="p-3 font-bold text-gray-800 border-b border-gray-200 text-lg">
                                    Notifications
                                </div>
                                {notifications.length > 0 ? (
                                    <>
                                        {notifications.map((notification) => (
                                            renderNotification(notification)
                                        ))}
                                        <div className="border-t border-gray-200 flex flex-col">
                                            <button
                                                onClick={() => {
                                                    fetchNotifications(true);
                                                    setShowNotificationDropdown(false);
                                                }}
                                                className="w-full text-center py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                Mark All as Read
                                            </button>
                                            <Link
                                                href="/dashboard/notifications"
                                                onClick={() => setShowNotificationDropdown(false)}
                                                className="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors duration-200"
                                            >
                                                View All Notifications
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">No new notifications.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile User Avatar and its Dropdown */}
                    <div className="relative">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="User menu"
                        >
                            <Image
                                src={userAvatar}
                                alt="User Avatar"
                                width={32}
                                height={32}
                                className="rounded-full object-cover aspect-square"
                                priority
                            />
                        </button>

                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-5 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] transform origin-top-right animate-fade-in">
                                <Link
                                    href={`/dashboard/profile/${user?._id}`}
                                    onClick={() => setShowProfileDropdown(false)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors duration-200"
                                >
                                    <User size={16} className="mr-2 text-gray-500" /> My Profile
                                </Link>
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setShowProfileDropdown(false)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <Settings size={16} className="mr-2 text-gray-500" /> Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors duration-200"
                                >
                                    <LogOut size={16} className="mr-2 text-red-500" /> Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hamburger/X Toggle Button */}
                    <button
                        onClick={handleMenuToggle}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMenuOpen ? (
                            <X size={24} className="text-gray-700 transition-transform duration-300 transform rotate-90" />
                        ) : (
                            <Menu size={24} className="text-gray-700 transition-transform duration-300" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Menu Content */}
            {isMenuOpen && (
                <div ref={menuRef} className="md:hidden fixed top-[64px] left-0 w-full bg-white border-t border-gray-200 shadow-lg pb-4 z-[310] animate-slide-down mt-2">
                    <div className="flex flex-col items-start p-4 space-y-3">
                        <div className="relative w-full mb-2">
                            <input
                                type="text"
                                placeholder="Search Vartalaap"
                                className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
                            />
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <Home size={18} className="mr-3" /> Home
                        </Link>
                        <Link href="/dashboard/messages" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <MessageSquare size={18} className="mr-3" /> Messages
                        </Link>
                        <Link href="/dashboard/groups" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <Users size={18} className="mr-3" /> Groups
                        </Link>
                        <Link href={`/dashboard/profile/${user?._id}`} onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <User size={18} className="mr-3" /> My Profile
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200">
                            <Settings size={18} className="mr-3" /> Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                            <LogOut size={18} className="mr-3 text-red-500" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;