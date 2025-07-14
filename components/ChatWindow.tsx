
'use client';

import { v4 as uuid } from 'uuid';
import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
import { useAuth } from './AuthProvider';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client'; // Import socket.io-client

// Import types from the shared file
import { Message, GeneralUser } from '../app/types';

// Import the new sub-components
import ChatHeader from '../components/chatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/chatInput';
import ImagePreviewModal from '../components/ImagePreviewModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Define the props for ChatWindow
interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    chatUser: GeneralUser;
    currentUserId: string;
    getFullMediaUrl: (relativePath?: string) => string;
    defaultAvatarUrl: string;
    onMessageSent: () => void;
}

// IMPORTANT: Replace with your actual WebSocket server URL
const WS_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:5001/api'; // Example
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

const ChatWindow: FC<ChatWindowProps> = ({
    isOpen,
    onClose,
    chatUser,
    currentUserId,
    getFullMediaUrl,
    defaultAvatarUrl,
    onMessageSent,
}) => {
    const { getIdToken } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const hasFetchedInitialMessages = useRef(false);

    const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState('');
    const [deleteModalTitle, setDeleteModalTitle] = useState('');
    const [confirmDeleteAction, setConfirmDeleteAction] = useState<(() => Promise<void>) | null>(null);

    const [currentThemeImage, setCurrentThemeImage] = useState<string | null>(null);

    const [uploadingMessage, setUploadingMessage] = useState<{
        tempId: string;
        mediaType: 'image' | 'video' | 'audio' | 'file';
    } | null>(null);

    // // State for the other user's typing status
    // const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // const socket = useRef<any>(null); // Ref to hold the WebSocket connection

    // --- WebSocket Connection & Event Handling ---

    // Typing indicator
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Socket ref
    const socket = useRef<any>(null);

    // WebSocket Connection Setup
    useEffect(() => {
        if (!isOpen || !currentUserId || !chatUser?._id) return;

        let timeoutId: NodeJS.Timeout | null = null;
        let isMounted = true;
        let socketInstance: any = null;

        const setupSocket = async () => {
            try {
                // Get fresh Firebase ID token
                const token = await getIdToken();
                if (!token) throw new Error('Firebase token not available');

                // Connect socket with auth token
                socketInstance = io(WS_SERVER_URL, {
                    query: { userId: currentUserId },
                    auth: { token },
                });

                socketInstance.on('connect', () => {
                    console.log('[WebSocket] Connected');
                });

                socketInstance.on('disconnect', () => {
                    console.log('[WebSocket] Disconnected');
                });

                socketInstance.on('connect_error', (err: any) => {
                    console.error('[WebSocket] Connection Error:', err);
                    // toast.error('Real-time features disconnected.');
                });

                socketInstance.on(
                    'typing_status',
                    (data: { conversationId: string; userId: string; isTyping: boolean }) => {
                        if (data.conversationId === currentConversationId && data.userId === chatUser._id) {
                            if (data.isTyping) {
                                setIsOtherUserTyping(true);
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = setTimeout(() => {
                                    setIsOtherUserTyping(false);
                                }, 2500);
                            } else {
                                setIsOtherUserTyping(false);
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            }
                        }
                    }
                );

                if (isMounted) socket.current = socketInstance;
            } catch (error) {
                console.error('Socket connection failed:', error);
                toast.error('Failed to connect real-time features.');
            }
        };

        setupSocket();

        return () => {
            isMounted = false;
            if (socketInstance) {
                if (currentConversationId) {
                    socketInstance.emit('leave_conversation', currentConversationId);
                }
                socketInstance.disconnect();
                socketInstance = null;
                socket.current = null;
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [isOpen, currentUserId, chatUser?._id, currentConversationId, getIdToken]);

    // Join conversation room when conversationId changes
    useEffect(() => {
        if (socket.current && currentConversationId) {
            socket.current.emit('join_conversation', currentConversationId);
            console.log('[WebSocket] Joined room:', currentConversationId);
        }
    }, [currentConversationId]);

    // Send typing status
    const sendTypingStatus = useCallback(
        (isTyping: boolean) => {
            if (socket.current && currentConversationId && currentUserId) {
                socket.current.emit('typing', {
                    conversationId: currentConversationId,
                    userId: currentUserId,
                    isTyping,
                });
            }
        },
        [currentConversationId, currentUserId]
    );

    // Handle text input change & typing indicator
    const handleNewMessageContentChange = useCallback(
        (content: string) => {
            setNewMessageContent(content);

            if (content.length > 0 && typingTimeoutRef.current === null) {
                sendTypingStatus(true);
            }

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                sendTypingStatus(false);
                typingTimeoutRef.current = null;
            }, 1500);
        },
        [sendTypingStatus]
    );
    // --- Message Selection Handlers ---
    const handleSelectMessage = useCallback((messageId: string) => {
        if (editingMessageId) {
            return;
        }
        setSelectedMessages(prevSelected => {
            if (prevSelected.includes(messageId)) {
                return prevSelected.filter(id => id !== messageId);
            } else {
                return [...prevSelected, messageId];
            }
        });
    }, [editingMessageId]);

    const handleClearSelection = useCallback(() => {
        setSelectedMessages([]);
    }, []);

    // --- Media Selection Handlers ---
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingMessageId) {
            toast.error("Cannot attach files while editing a message.");
            return;
        }

        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 20 * 1024 * 1024) {
                toast.error('File size exceeds 20MB limit.');
                setSelectedMedia(null);
                setMediaPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setSelectedMedia(file);
            setError(null);

            // Create preview URL for image/video or null for others
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setMediaPreviewUrl(null);
            }
            setNewMessageContent(''); // Clear text content when media is selected
            sendTypingStatus(false); // Stop typing if media is selected
        }
    }, [editingMessageId, sendTypingStatus]);

    const removeSelectedMedia = useCallback(() => {
        setSelectedMedia(null);
        setMediaPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setError(null);
        // Clear uploadingMessage if a media was selected but then removed before sending
        setUploadingMessage(null);
    }, []);

    // --- Conversation ID Fetching ---
    useEffect(() => {
        const findConversationId = async () => {
            if (!isOpen || !chatUser || !currentUserId) return;

            setLoadingInitialMessages(true);
            hasFetchedInitialMessages.current = false;
            setError(null);

            try {
                const token = await getIdToken();
                if (!token) throw new Error('Authentication required.');

                const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

                const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
                const existingConv = conversations.find(conv =>
                    conv.otherParticipant?._id === chatUser._id
                );

                if (existingConv) {
                    setCurrentConversationId(existingConv._id);
                    console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
                } else {
                    setCurrentConversationId(null);
                    console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
                }
            } catch (err) {
                console.error('[ChatWindow] Error finding conversation ID:', err);
                setError(err instanceof Error ? err.message : 'Could not find conversation.');
                setLoadingInitialMessages(false);
            }
        };

        if (isOpen) {
            findConversationId();
        }
    }, [isOpen, chatUser, currentUserId, getIdToken]);

    // --- Message Fetching ---
    const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
        if (!isOpen) {
            setLoadingInitialMessages(false);
            setMessages([]);
            return;
        }

        if (!currentConversationId && !isInitialFetch) {
            setLoadingInitialMessages(false);
            setMessages([]);
            return;
        }

        if (isInitialFetch) {
            setLoadingInitialMessages(true);
            setError(null);
        }

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            if (currentConversationId) {
                const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch messages.');
                }

                const data: Message[] = await response.json();
                setMessages(data);
                console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
            } else {
                setMessages([]);
            }
            hasFetchedInitialMessages.current = true;
        } catch (err) {
            console.error('[ChatWindow] Error fetching messages:', err);
            setError(err instanceof Error ? err.message : 'Failed to load messages.');
        } finally {
            if (isInitialFetch) {
                setLoadingInitialMessages(false);
            }
        }
    }, [isOpen, currentConversationId, getIdToken]);

    // Polling for messages (can be replaced by WebSocket message events for new messages)
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (isOpen) {
            fetchMessages(true);
            interval = setInterval(() => {
                fetchMessages(false);
            }, 5000); // Poll every 5 seconds for new messages
        } else {
            if (interval) clearInterval(interval);
            // Reset all chat-related states when the window closes
            setMessages([]);
            setCurrentConversationId(null);
            setNewMessageContent('');
            setSelectedMedia(null);
            setMediaPreviewUrl(null);
            setIsImagePreviewOpen(false);
            setPreviewImageUrl(null);
            setEditingMessageId(null);
            setIsEditing(false); // Ensure isEditing is false
            setIsSavingEdit(false);
            setError(null);
            setLoadingInitialMessages(true);
            setSelectedMessages([]);
            hasFetchedInitialMessages.current = false;
            setCurrentThemeImage(null);
            setUploadingMessage(null); // Clear uploading message on close
            setIsOtherUserTyping(false); // Reset typing indicator
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); // Clear local typing timeout
        }

        return () => {
            if (interval) clearInterval(interval);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [isOpen, currentConversationId, fetchMessages]);

    // --- Message Sending Handler ---
    const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        const textContent = newMessageContent.trim();

        if (!textContent && !selectedMedia) {
            toast.error('Please type a message or select a file.');
            return;
        }
        if (sendingMessage) return; // Prevent double submission

        setSendingMessage(true);
        setError(null);

        // Send 'stopped typing' status when message is sent
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        sendTypingStatus(false);


        // Determine media type for upload indicator
        let mediaType: 'image' | 'video' | 'audio' | 'file' = 'file';
        if (selectedMedia) {
            if (selectedMedia.type.startsWith('image/')) {
                mediaType = 'image';
            } else if (selectedMedia.type.startsWith('video/')) {
                mediaType = 'video';
            } else if (selectedMedia.type.startsWith('audio/')) {
                mediaType = 'audio';
            }
        }

        // Set the uploadingMessage state with the correct mediaType
        if (selectedMedia) { // Only show upload progress if media is actually being sent
            setUploadingMessage({
                tempId: uuid(), // Generate a temporary ID
                mediaType: mediaType,
            });
        }

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            let response;
            let sentMessage: Message;

            if (selectedMedia) {
                const formData = new FormData();
                formData.append('media', selectedMedia);
                if (textContent) {
                    formData.append('content', textContent);
                }

                response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // 'Content-Type': 'multipart/form-data' is not needed here; browser sets it with boundary
                    },
                    body: formData,
                });
            } else {
                response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: textContent }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
                throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
            }

            sentMessage = await response.json();
            console.log("[ChatWindow] Message sent:", sentMessage);

            if (!currentConversationId && sentMessage.conversationId) {
                setCurrentConversationId(sentMessage.conversationId);
            }

            setNewMessageContent('');
            removeSelectedMedia(); // This also clears selectedMedia and mediaPreviewUrl
            onMessageSent(); // Trigger a refresh or update in the parent
            setSelectedMessages([]); // Clear any selected messages after sending a new one
            setUploadingMessage(null); // Clear upload indicator on success
        } catch (err) {
            console.error('[ChatWindow] Error sending message:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to send message.');
            setUploadingMessage(null); // Clear upload indicator on error
        } finally {
            setSendingMessage(false);
            // A re-fetch might be good here to ensure the UI is in sync
            fetchMessages(false); // Re-fetch to get the newly sent message and any other updates
        }
    }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia, fetchMessages, sendTypingStatus]);

    // --- Message Editing Handlers ---
    const handleEditClick = useCallback((message: Message) => {
        if (message.sender._id !== currentUserId || message.isDeleted) {
            toast.error("You can only edit your own non-deleted messages.");
            return;
        }
        setSelectedMessages([]);
        setEditingMessageId(message._id);
        setNewMessageContent(message.content || '');
        setIsEditing(true); // Set isEditing to true here
        removeSelectedMedia();
        console.log(`[ChatWindow] Started editing message: ${message._id}`);
        sendTypingStatus(false); // Stop typing when entering edit mode
    }, [currentUserId, removeSelectedMedia, sendTypingStatus]);

    const handleSaveEdit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!editingMessageId || isSavingEdit) return;

        const contentToSave = newMessageContent.trim();
        if (!contentToSave) {
            toast.error('Message content cannot be empty.');
            return;
        }

        setIsSavingEdit(true);
        setError(null);

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: contentToSave }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to edit message.');
            }

            const updatedMessage: Message = await response.json();
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === editingMessageId ? {
                        ...msg,
                        content: updatedMessage.content,
                        updatedAt: updatedMessage.updatedAt,
                        isEdited: true
                    } : msg
                )
            );

            setEditingMessageId(null);
            setNewMessageContent('');
            setIsEditing(false); // Set isEditing to false
            setIsSavingEdit(false);
            toast.success('Message edited successfully!');
            console.log(`[ChatWindow] Message ${editingMessageId} edited successfully`);
        } catch (err) {
            console.error('[ChatWindow] Error editing message:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to edit message.');
        } finally {
            setIsSavingEdit(false);
        }
    }, [editingMessageId, newMessageContent, getIdToken, isSavingEdit]);

    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
        setNewMessageContent('');
        setIsEditing(false); // Set isEditing to false
        setIsSavingEdit(false);
        setError(null);
        console.log(`[ChatWindow] Cancelled editing`);
    }, []);

    // --- Message Deletion Handlers with Custom Modal ---
    const confirmAndDeleteSelectedMessages = useCallback(async () => {
        setError(null);

        const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
        const userOwnedMessages = messagesToDelete.filter(msg => msg.sender._id === currentUserId);
        const otherUserMessages = messagesToDelete.filter(msg => msg.sender._id !== currentUserId);

        if (messagesToDelete.length === 0) {
            toast.error('No messages selected for deletion.');
            setShowDeleteModal(false);
            setConfirmDeleteAction(null);
            return;
        }

        if (otherUserMessages.length > 0 && userOwnedMessages.length === 0) {
            toast.error('You can only delete your own messages.');
            setShowDeleteModal(false);
            setConfirmDeleteAction(null);
            setSelectedMessages([]);
            return;
        } else if (otherUserMessages.length > 0 && userOwnedMessages.length > 0) {
            toast.error(`You can only delete your ${userOwnedMessages.length} message(s). ${otherUserMessages.length} message(s) from other users will not be deleted.`);
        }

        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            const results = await Promise.allSettled(
                userOwnedMessages.map(message =>
                    fetch(`${API_BASE_URL}/chats/message/${message._id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` },
                    })
                )
            );

            const failedDeletions = results.filter(result =>
                result.status === 'rejected' ||
                (result.status === 'fulfilled' && !result.value.ok)
            );

            if (failedDeletions.length > 0) {
                if (failedDeletions.length === userOwnedMessages.length && otherUserMessages.length === 0) {
                    toast.error('Failed to delete all your selected messages.');
                } else {
                    toast.error(`Failed to delete ${failedDeletions.length} of your message(s).`);
                }
            } else if (userOwnedMessages.length > 0) {
                toast.success('Selected message(s) deleted successfully!');
            }

            await fetchMessages(false);
            setSelectedMessages([]);
            onMessageSent();
        } catch (err) {
            console.error('[ChatWindow] Error deleting selected messages:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
        } finally {
            setShowDeleteModal(false);
            setConfirmDeleteAction(null);
        }
    }, [selectedMessages, messages, currentUserId, getIdToken, fetchMessages, onMessageSent, setSelectedMessages]);

    const handleDeleteSelectedMessages = useCallback(() => {
        if (selectedMessages.length === 0) return;

        setDeleteModalTitle('Delete Selected Messages');
        setDeleteModalMessage(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`);
        setConfirmDeleteAction(() => confirmAndDeleteSelectedMessages);
        setShowDeleteModal(true);
    }, [selectedMessages, confirmAndDeleteSelectedMessages]);

    const confirmAndDeleteAllMessages = useCallback(async () => {
        if (!currentConversationId) return;

        setError(null);
        try {
            const token = await getIdToken();
            if (!token) throw new Error('Authentication required.');

            const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete all messages.');
            }

            setMessages([]);
            setSelectedMessages([]);
            onMessageSent();
            toast.success('All messages are deleted successfully!');
        } catch (err) {
            console.error('[ChatWindow] Error deleting all messages:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
        } finally {
            setShowDeleteModal(false);
            setConfirmDeleteAction(null);
        }
    }, [currentConversationId, getIdToken, onMessageSent, setSelectedMessages, setMessages]);

    const handleDeleteAllMessages = useCallback(() => {
        if (!currentConversationId) return;

        setDeleteModalTitle('Delete All Messages');
        setDeleteModalMessage('Are you sure you want to delete ALL your messages in this conversation? This action cannot be undone.');
        setConfirmDeleteAction(() => confirmAndDeleteAllMessages);
        setShowDeleteModal(true);
    }, [currentConversationId, confirmAndDeleteAllMessages]);

    // Handlers for the custom DeleteConfirmationModal
    const handleConfirmDelete = async () => {
        if (confirmDeleteAction) {
            await confirmDeleteAction();
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setConfirmDeleteAction(null);
    };

    // --- Image Preview Handlers ---
    const openImagePreview = useCallback((imageUrl: string) => {
        setPreviewImageUrl(imageUrl);
        setIsImagePreviewOpen(true);
    }, []);

    const closeImagePreview = useCallback(() => {
        setIsImagePreviewOpen(false);
        setPreviewImageUrl(null);
    }, []);

    // --- Theme Change Handler ---
    const handleThemeChange = useCallback((imageUrl: string | null) => {
        setCurrentThemeImage(imageUrl);
        if (imageUrl) {
            localStorage.setItem('chatTheme', imageUrl);
        } else {
            localStorage.removeItem('chatTheme');
        }
    }, []);

    // Load theme from local storage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('chatTheme');
        if (savedTheme) {
            setCurrentThemeImage(savedTheme);
        }
    }, []);


    // If the chat window is not open, return null to render nothing
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-0 md:p-4 md:top-16 top-[-50]"
            onClick={onClose}>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="relative w-full max-w-lg h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <ChatHeader
                    chatUser={chatUser}
                    defaultAvatarUrl={defaultAvatarUrl}
                    getFullMediaUrl={getFullMediaUrl}
                    onClose={onClose}
                    showActionsMenu={selectedMessages.length > 0 || !editingMessageId}
                    onDeleteSelected={handleDeleteSelectedMessages}
                    onDeleteAll={handleDeleteAllMessages}
                    onClearSelection={handleClearSelection}
                    selectedMessages={selectedMessages}
                    messages={messages}
                    currentUserId={currentUserId}
                    onEditMessage={handleEditClick}
                    isEditing={editingMessageId !== null}
                    onThemeChange={handleThemeChange}
                    currentThemeImage={currentThemeImage}
                    isTyping={isOtherUserTyping}
                />

                {/* Messages Area */}
                <MessageList
                    messages={messages.filter(msg => !msg.isDeleted)}
                    loading={loadingInitialMessages}
                    error={error}
                    currentUserId={currentUserId}
                    getFullMediaUrl={getFullMediaUrl}
                    defaultAvatarUrl={defaultAvatarUrl}
                    onOpenImagePreview={openImagePreview}
                    selectedMessages={selectedMessages}
                    onSelectMessage={handleSelectMessage}
                    onEditMessage={handleEditClick}
                    editingMessageId={editingMessageId}
                    backgroundImageUrl={currentThemeImage}
                    // Pass the uploadingMessage state to MessageList as well if it needs to display temporary messages
                    uploadingMessage={uploadingMessage}
                />

                {/* Message Input and Attachment Button */}
                <ChatInput
                    newMessageContent={newMessageContent}
                    setNewMessageContent={handleNewMessageContentChange}
                    selectedMedia={selectedMedia}
                    mediaPreviewUrl={mediaPreviewUrl}
                    removeSelectedMedia={removeSelectedMedia}
                    error={error}
                    isEditing={editingMessageId !== null} // Set this correctly based on editingMessageId
                    editingMessageId={editingMessageId}
                    sendingMessage={sendingMessage}
                    isSavingEdit={isSavingEdit}
                    handleSendMessage={handleSendMessage}
                    handleSaveEdit={handleSaveEdit}
                    handleCancelEdit={handleCancelEdit}
                    handleFileChange={handleFileChange}
                    uploadingMessage={uploadingMessage}
                />
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                imageUrl={previewImageUrl}
                onClose={closeImagePreview}
            />

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    title={deleteModalTitle}
                    message={deleteModalMessage}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default ChatWindow;