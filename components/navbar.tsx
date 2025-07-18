'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';
import {
  Bell,
  Home,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Users,
  Check,
  X,
  Menu,
  UserRound,
} from 'lucide-react';
import defaultUserLogo from '../app/assets/userLogo.png';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedList from './AnimatedList';
import { getFullAvatarUrl } from '../utils/imageUtils';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { useSocket } from './SocketProvider';

const Navbar: React.FC = () => {
  const { user, getIdToken, logout } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Use notification hook
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    setNotifications,
  } = useNotifications(getIdToken, user?._id);

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

  const playSound = useCallback((audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    }
  }, []);

  const handleAcceptReject = useCallback(
    async (requestId: string, action: 'accept' | 'reject') => {
      if (!user?._id || !getIdToken || processingRequests.has(requestId)) return;

      setProcessingRequests((prev) => new Set(prev).add(requestId));
      const toastId = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'}...`);

      try {
        const token = await getIdToken();
        const endpoint = action === 'accept' ? 'accept-follow-request' : 'reject-follow-request';

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api'}/follow/${endpoint}/${requestId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to process request');

        // Remove the related notification from list
        setNotifications((prev) =>
          prev.filter((n) => !(n.type === 'followRequest' && n.data?.requestId === requestId))
        );

        toast.dismiss(toastId);
        toast.success(data.message);

        if (action === 'accept') playSound(requestAcceptedAudio);
        else playSound(requestRejectedAudio);

        await fetchNotifications();
      } catch (err: any) {
        toast.dismiss(toastId);
        toast.error(err.message || `Failed to ${action}`);
      } finally {
        setProcessingRequests((prev) => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }
    },
    [user, getIdToken, processingRequests, playSound, fetchNotifications, setNotifications]
  );

  // Register socket for new notifications
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit('registerUser', user._id);

    const onNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
      toast(`🔔 ${notification.message}`);
    };

    socket.on('newNotification', onNewNotification);

    return () => {
      socket.off('newNotification', onNewNotification);
    };
  }, [socket, user?._id, setNotifications]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    } finally {
      closeAllDropdowns();
    }
  }, [logout, router]);

  const closeAllDropdowns = () => {
    setShowNotificationDropdown(false);
    setShowProfileDropdown(false);
    setIsMenuOpen(false);
  };

  const toggleNotificationDropdown = () => {
    fetchNotifications();
    setShowNotificationDropdown((prev) => !prev);
    setShowProfileDropdown(false);
    setIsMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
    setShowNotificationDropdown(false);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setShowNotificationDropdown(false);
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        profileDropdownRef.current?.contains(target) ||
        notificationDropdownRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;

      if (
        !target.closest('button[aria-label="Notifications"]') &&
        !target.closest('button[aria-label="User menu"]') &&
        !target.closest('button[aria-label="Open menu"], button[aria-label="Close menu"]')
      ) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfileDropdown, showNotificationDropdown, isMenuOpen]);

  const renderNotificationItem = useCallback(
    (notification: Notification) => {
      const avatarUrl = getFullAvatarUrl(notification.sender?.avatarUrl);
      const senderName = notification.sender?.name || 'User';
      const avatarSrc = typeof avatarUrl === 'string' ? avatarUrl : defaultUserLogo;

      if (notification.type === 'followRequest') {
        const requestId = notification.data?.requestId || notification._id;
        const isProcessing = processingRequests.has(requestId);
        return (
          <div
            key={notification._id}
            className="p-4 border-b flex justify-between items-center cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Image
                src={avatarSrc}
                alt={senderName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptReject(requestId, 'accept');
                }}
                disabled={isProcessing}
                className="p-1 bg-green-100 hover:bg-green-200 text-green-600 rounded-full"
              >
                <Check size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptReject(requestId, 'reject');
                }}
                disabled={isProcessing}
                className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={notification._id}
          href={`/user/${notification.sender?.firebaseUid || notification.sender?._id}`}
          className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-100"
          onClick={() => setShowNotificationDropdown(false)}
        >
          <Image
            src={avatarSrc}
            alt={senderName}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div>
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </Link>
      );
    },
    [processingRequests, handleAcceptReject]
  );

  const userAvatar = getFullAvatarUrl(user?.avatarUrl) || defaultUserLogo;
  const avatarSrc = typeof userAvatar === 'string' ? userAvatar : defaultUserLogo;

  return (
    <div className='z-999'>
      {(showNotificationDropdown || showProfileDropdown || isMenuOpen) && (
        <div
          className="fixed inset-0 bg-opacity-30 backdrop-blur-sm"
          style={{ top: '64px' }}
          onClick={closeAllDropdowns}
        />
      )}

      <nav className="bg-white shadow-lg p-3 flex items-center justify-between fixed top-0 left-0 w-full">
        <div className="flex items-center space-x-2 md:pl-8">
          <Link href="/dashboard" className="text-2xl font-extrabold text-blue-600 tracking-tight">
            Vartalaap<span className="text-yellow-500 text-3xl">.</span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center flex-grow mx-auto max-w-xl pr-20">
          <SearchBar currentAuthUser={user} />
        </div>

        {/* Desktop Nav Links and Profile */}
        <div className="hidden md:flex items-center space-x-6 mr-0">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            aria-label="Home"
          >
            <Home size={20} />
          </Link>
          <Link
            href="/users"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            aria-label="Find Users"
          >
            <Users size={20} />
          </Link>
          <Link
            href="/chat"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            aria-label="Messages"
          >
            <MessageSquare size={20} />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotificationDropdown}
              className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 hide-scrollbar"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2 hide-scrollbar">
                  {unreadCount}
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
                  className="absolute hide-scrollbar right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right max-h-auto overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {/* REMOVE THE {unreadCount > 0 && ...} CONDITION HERE */}
                    <button
                      onClick={async () => {
                        await markAllAsRead();
                        toast.success('All notifications marked as read');
                      }}
                      className="text-blue-600 text-sm hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {notifications.length > 0 ? (
                    <AnimatedList
                      items={notifications}
                      renderItem={renderNotificationItem}
                      onItemSelect={(item) => {
                        if (item.link) {
                          router.push(
                            '/users/' + (item.sender?.firebaseUid || item.sender?._id || 'profile')
                          );
                          setShowNotificationDropdown(false);
                        }
                      }}
                      className="max-h-96"
                      showGradients={true}
                      enableArrowNavigation={true}
                      displayScrollbar={true}
                    />
                  ) : (
                    <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                  )}
                  <div className="p-3 bg-white border-t border-gray-200 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotificationDropdown(false)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative hover:bg-gray-100 rounded-full p-1 ">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full"
              aria-label="User menu"
            >
              <Image
                src={avatarSrc}
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
                  className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden"
                >
                  <Link
                    href={`/user/${user?.firebaseUid || user?._id}`}
                    onClick={() => setShowProfileDropdown(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="inline-block mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} className="inline-block mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut size={16} className="inline-block mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Hamburger Menu */}

        <div className='flex gap-3'>
          <div className="relative md:hidden">
            <button
              onClick={toggleNotificationDropdown}
              className="relative text-gray-600 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 hide-scrollbar"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2 hide-scrollbar">
                  {unreadCount}
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
                  className="absolute hide-scrollbar right-[-20px] mt-4  w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[310] overflow-hidden transform origin-top-right max-h-auto overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {/* REMOVE THE {unreadCount > 0 && ...} CONDITION HERE */}
                    <button
                      onClick={async () => {
                        await markAllAsRead();
                        toast.success('All notifications marked as read');
                      }}
                      className="text-blue-600 text-sm hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {notifications.length > 0 ? (
                    <AnimatedList
                      items={notifications}
                      renderItem={renderNotificationItem}
                      onItemSelect={(item) => {
                        if (item.link) {
                          router.push(
                            '/users/' + (item.sender?.firebaseUid || item.sender?._id || 'profile')
                          );
                          setShowNotificationDropdown(false);
                        }
                      }}
                      className="max-h-96"
                      showGradients={true}
                      enableArrowNavigation={true}
                      displayScrollbar={true}
                    />
                  ) : (
                    <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                  )}
                  <div className="p-3 bg-white border-t border-gray-200 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotificationDropdown(false)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="md:hidden text-gray-600 hover:text-blue-600 transition-colors duration-200"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-full bg-white z-[310] shadow-lg p-5 flex flex-col"
          >
            <button
              className="self-end mb-4 text-gray-600 hover:text-blue-600"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
            <div className="mb-3">
              <SearchBar currentAuthUser={user} />
            </div>
            <Link
              href="/dashboard"
              className="mb-3 text-lg font-semibold text-gray-800 hover:text-blue-600 flex items-center gap-2"
              onClick={toggleMenu}
            >
              <Home size={18} />
              Home
            </Link>

            <Link
              href="/users"
              className="mb-3 text-lg font-semibold text-gray-800 hover:text-blue-600 flex items-center gap-2"
              onClick={toggleMenu}
            >
              <User size={18} />
              Find Users
            </Link>

            <Link
              href="/chat"
              className="mb-3 text-lg font-semibold text-gray-800 hover:text-blue-600 flex items-center gap-2"
              onClick={toggleMenu}
            >
              <MessageSquare size={18} />
              Messages
            </Link>

            <Link
              // href={`/user/${user?.firebaseUid || user?._id}`}
              href={'/profile'}
              className="mb-3 text-lg font-semibold text-gray-800 hover:text-blue-600 flex items-center gap-2"
              onClick={toggleMenu}
            >
              <UserRound size={18} />
              Profile
            </Link>

            <Link
              href="/settings"
              className="mb-3 text-lg font-semibold text-gray-800 hover:text-blue-600 flex items-center gap-2"
              onClick={toggleMenu}
            >
              <Settings size={18} />
              Settings
            </Link>

            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="mt-auto text-left text-red-600 font-semibold flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
