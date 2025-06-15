

"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { UserCheck, UserX, Clock, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const NotificationDropdown = ({ isOpen, onClose, socket }) => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingRequests, setProcessingRequests] = useState(new Set());
    const dropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch notifications and pending requests when dropdown opens
        if (isOpen && user && token) {
            fetchNotifications();
            fetchPendingRequests();
        }
    }, [isOpen, user, token]);

    // Socket event listeners for real-time notifications
    useEffect(() => {
        if (socket && user) {
            // Listen for new notifications
            const handleNewNotification = (notification) => {
                console.log('New notification received:', notification);
                
                // Add new notification to the list
                setNotifications(prev => [notification, ...prev]);
                
                // If it's a follow request, also add to pending requests
                if (notification.type === 'followRequest') {
                    setPendingRequests(prev => [
                        {
                            _id: notification.data?.requestId || notification._id,
                            sender: notification.sender,
                            createdAt: notification.createdAt
                        },
                        ...prev
                    ]);
                }
                
                // Show toast notification
                toast.success(notification.message, {
                    duration: 4000,
                    icon: getNotificationIcon(notification.type),
                });
            };

            socket.on('newNotification', handleNewNotification);

            return () => {
                socket.off('newNotification', handleNewNotification);
            };
        }
    }, [socket, user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'followRequest':
                return '👤';
            case 'followRequestAccepted':
                return '✅';
            case 'followRequestRejected':
                return '❌';
            case 'newFollower':
                return '👥';
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            default:
                return '🔔';
        }
    };

    const fetchNotifications = async () => {
        if (!user || !token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        }
    };

    const fetchPendingRequests = async () => {
        if (!user || !token) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/follow/pending-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch pending requests');
            }

            const data = await res.json();
            setPendingRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            toast.error('Failed to load friend requests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptReject = async (requestId, action) => {
        if (!user || !token || processingRequests.has(requestId)) return;

        // Add to processing set to prevent double clicks
        setProcessingRequests(prev => new Set([...prev, requestId]));

        try {
            const endpoint = action === 'accept' ? 'accept-follow-request' : 'reject-follow-request';
            const res = await fetch(`${API_BASE_URL}/follow/${endpoint}/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to ${action} request`);
            }

            // Remove the processed request from the list
            setPendingRequests(prev => prev.filter(req => req._id !== requestId));
            
            // Show success message
            const actionText = action === 'accept' ? 'accepted' : 'rejected';
            toast.success(`Follow request ${actionText} successfully!`);

        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            toast.error(`Failed to ${action} request`);
        } finally {
            // Remove from processing set
            setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const handleNotificationClick = (notification) => {
        onClose(); // Close dropdown
        
        // Mark as read if not already read
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        
        // Navigate based on notification type
        if (notification.link) {
            router.push(notification.link);
        } else {
            // Default navigation based on type
            switch (notification.type) {
                case 'followRequest':
                case 'followRequestAccepted':
                    router.push(`/dashboard/profile/${notification.sender.firebaseUid}`);
                    break;
                default:
                    router.push('/dashboard');
            }
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif._id === notificationId 
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const notificationTime = new Date(dateString);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    if (!isOpen) return null;

    // Filter follow request notifications from general notifications
    const followRequestNotifications = notifications.filter(n => n.type === 'followRequest');
    const otherNotifications = notifications.filter(n => n.type !== 'followRequest');

    return (
        <div
            ref={dropdownRef}
            className="absolute top-16 right-4 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-30 max-h-96 overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Bell size={18} className="mr-2" />
                        Notifications
                    </h3>
                    {(pendingRequests.length > 0 || notifications.filter(n => !n.isRead).length > 0) && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {pendingRequests.length + notifications.filter(n => !n.isRead).length}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
                    </div>
                ) : (
                    <>
                        {/* Pending Follow Requests */}
                        {pendingRequests.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-blue-50 border-b">
                                    <h4 className="text-sm font-semibold text-blue-800">Friend Requests</h4>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {pendingRequests.map((request) => (
                                        <li key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div 
                                                className="flex items-center space-x-3 cursor-pointer mb-3"
                                                onClick={() => handleNotificationClick({
                                                    type: 'followRequest',
                                                    sender: request.sender,
                                                    link: `/dashboard/profile/${request.sender.firebaseUid}`
                                                })}
                                            >
                                                <img
                                                    src={request.sender.avatarUrl || '/assets/userLogo.png'}
                                                    alt={request.sender.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-800 font-semibold text-sm truncate">
                                                        {request.sender.name}
                                                    </p>
                                                    <p className="text-gray-600 text-xs">
                                                        sent you a follow request
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        {getTimeAgo(request.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        handleAcceptReject(request._id, 'accept'); 
                                                    }}
                                                    disabled={processingRequests.has(request._id)}
                                                    className="flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <UserCheck size={12} className="mr-1" />
                                                    {processingRequests.has(request._id) ? 'Processing...' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        handleAcceptReject(request._id, 'reject'); 
                                                    }}
                                                    disabled={processingRequests.has(request._id)}
                                                    className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-xs rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <UserX size={12} className="mr-1" />
                                                    {processingRequests.has(request._id) ? 'Processing...' : 'Reject'}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Other Notifications */}
                        {otherNotifications.length > 0 && (
                            <div>
                                {pendingRequests.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50 border-b">
                                        <h4 className="text-sm font-semibold text-gray-800">Recent Activity</h4>
                                    </div>
                                )}
                                <ul className="divide-y divide-gray-100">
                                    {otherNotifications.map((notification) => (
                                        <li 
                                            key={notification._id} 
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                !notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={notification.sender.avatarUrl || '/assets/userLogo.png'}
                                                    alt={notification.sender.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-800 text-sm">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        {getTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Empty State */}
                        {pendingRequests.length === 0 && otherNotifications.length === 0 && (
                            <div className="p-6 text-center">
                                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500 text-sm">No new notifications.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {(pendingRequests.length > 0 || otherNotifications.length > 0) && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={() => {
                            fetchNotifications();
                            fetchPendingRequests();
                        }}
                        className="w-full text-center text-blue-600 text-sm hover:text-blue-800 transition-colors"
                    >
                        Refresh notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;