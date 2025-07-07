// // // 'use client';

// // // import React, { useEffect, useState, useCallback, useRef } from 'react';
// // // import { useAuth } from './AuthProvider';
// // // import { ChevronLeft, Send, Paperclip, XCircle, Image as ImageIcon, Video as VideoIcon, FileText, Music as MusicIcon, ZoomIn } from 'lucide-react';
// // // import Skeleton from 'react-loading-skeleton';
// // // import 'react-loading-skeleton/dist/skeleton.css';
// // // import { format } from 'date-fns';

// // // import { User as GeneralUser } from './StatusViewer';
// // // import MediaPreview from './MediaPreview'; // Import the new MediaPreview component

// // // interface Message {
// // //     _id: string;
// // //     conversationId: string;
// // //     sender: GeneralUser;
// // //     receiver: string;
// // //     content: string;
// // //     mediaUrl?: string;
// // //     mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     createdAt: string;
// // // }

// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: GeneralUser;
// // //     currentUserId: string;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // // }

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // // const ChatWindow: React.FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState('');
// // //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// // //     const [sendingMessage, setSendingMessage] = useState(false);
// // //     const [error, setError] = useState<string | null>(null);
// // //     const messagesEndRef = useRef<HTMLDivElement>(null);

// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const hasFetchedInitialMessages = useRef(false);

// // //     // States for media upload
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// // //     const fileInputRef = useRef<HTMLInputElement>(null);

// // //     // New state for image preview
// // //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// // //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// // //     // --- Media Selection Handlers ---
// // //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             const file = e.target.files[0];

// // //             if (file.size > 20 * 1024 * 1024) {
// // //                 setError('File size exceeds 20MB limit.');
// // //                 setSelectedMedia(null);
// // //                 setMediaPreviewUrl(null);
// // //                 if (fileInputRef.current) fileInputRef.current.value = '';
// // //                 return;
// // //             }

// // //             setSelectedMedia(file);
// // //             setError(null);

// // //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// // //                 const reader = new FileReader();
// // //                 reader.onloadend = () => {
// // //                     setMediaPreviewUrl(reader.result as string);
// // //                 };
// // //                 reader.readAsDataURL(file);
// // //             } else {
// // //                 setMediaPreviewUrl(null);
// // //             }
// // //         }
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         setMediaPreviewUrl(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         setError(null);
// // //     }, []);

// // //     // --- Conversation ID Fetching ---
// // //     useEffect(() => {
// // //         const findConversationId = async () => {
// // //             if (!isOpen || !chatUser || !currentUserId) return;

// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             try {
// // //                 const token = await getIdToken();
// // //                 if (!token) throw new Error('Authentication required.');

// // //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });
// // //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// // //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// // //                 const existingConv = conversations.find(conv =>
// // //                     conv.otherParticipant?._id === chatUser._id
// // //                 );

// // //                 if (existingConv) {
// // //                     setCurrentConversationId(existingConv._id);
// // //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// // //                 } else {
// // //                     setCurrentConversationId(null);
// // //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// // //                 }
// // //             } catch (err) {
// // //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// // //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// // //             }
// // //             // Note: setLoadingInitialMessages(false) is handled by fetchMessages below
// // //         };

// // //         if (isOpen) {
// // //             findConversationId();
// // //         }
// // //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// // //     // --- Message Fetching ---
// // //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// // //         if (!isOpen) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (!currentConversationId && !isInitialFetch) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (isInitialFetch) {
// // //             setLoadingInitialMessages(true);
// // //             setError(null);
// // //         }

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             if (currentConversationId) {
// // //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });

// // //                 if (!response.ok) {
// // //                     const errorData = await response.json().catch(() => ({}));
// // //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// // //                 }

// // //                 const data: Message[] = await response.json();
// // //                 setMessages(data);
// // //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// // //             } else {
// // //                 setMessages([]);
// // //             }
// // //             hasFetchedInitialMessages.current = true;
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //         } finally {
// // //             if (isInitialFetch) {
// // //                 setLoadingInitialMessages(false);
// // //             }
// // //         }
// // //     }, [isOpen, currentConversationId, getIdToken]);

// // //     useEffect(() => {
// // //         let interval: NodeJS.Timeout;

// // //         if (isOpen && currentConversationId) {
// // //             fetchMessages(true);
// // //             interval = setInterval(() => {
// // //                 fetchMessages(false);
// // //             }, 5000);
// // //         } else if (isOpen && !currentConversationId && !hasFetchedInitialMessages.current) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //         }

// // //         return () => clearInterval(interval);
// // //     }, [isOpen, currentConversationId, fetchMessages]);

// // //     // auto scroll

// // //     // useEffect(() => {
// // //     //     if (messagesEndRef.current && !loadingInitialMessages) {
// // //     //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
// // //     //     }
// // //     // }, [messages, loadingInitialMessages]);

// // //     // --- Message Sending Handler ---
// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();
// // //         const textContent = newMessageContent.trim();

// // //         if (!textContent && !selectedMedia) {
// // //             setError('Please type a message or select a file.');
// // //             return;
// // //         }
// // //         if (sendingMessage) return;

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             let response;
// // //             let sentMessage: Message;

// // //             if (selectedMedia) {
// // //                 const formData = new FormData();
// // //                 formData.append('media', selectedMedia);
// // //                 if (textContent) {
// // //                     formData.append('content', textContent);
// // //                 }

// // //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                     },
// // //                     body: formData,
// // //                 });
// // //             } else {
// // //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         'Content-Type': 'application/json',
// // //                     },
// // //                     body: JSON.stringify({ content: textContent }),
// // //                 });
// // //             }

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// // //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             setMessages(prev => [...prev, sentMessage]);
// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent();

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     // --- Image Preview Handlers ---
// // //     const openImagePreview = useCallback((imageUrl: string) => {
// // //         setPreviewImageUrl(imageUrl);
// // //         setIsImagePreviewOpen(true);
// // //     }, []);

// // //     const closeImagePreview = useCallback(() => {
// // //         setIsImagePreviewOpen(false);
// // //         setPreviewImageUrl(null);
// // //     }, []);

// // //     if (!isOpen) return null;

// // //     return (
// // //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// // //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// // //                 {/* Header */}
// // //                 <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
// // //                     <button onClick={onClose} className="text-gray-600 p-1 rounded-full hover:bg-gray-600 hover:text-gray-50 mr-3 cursor-pointer">
// // //                         <ChevronLeft size={24} />
// // //                     </button>
// // //                     <img
// // //                         src={getFullMediaUrl(chatUser.avatarUrl) || defaultAvatarUrl}
// // //                         alt={chatUser.name}
// // //                         className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
// // //                         onError={(e) => {
// // //                             const target = e.target as HTMLImageElement;
// // //                             target.src = defaultAvatarUrl;
// // //                         }}
// // //                     />
// // //                     <h2 className="text-lg font-semibold text-gray-800">{chatUser.name}</h2>
// // //                 </div>

// // //                 {/* Messages Area */}
// // //                 <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
// // //                     {loadingInitialMessages ? (
// // //                         <div className="space-y-3">
// // //                             <Skeleton height={50} width="80%" />
// // //                             <Skeleton height={50} width="70%" className="ml-auto" />
// // //                             <Skeleton height={50} width="90%" />
// // //                         </div>
// // //                     ) : error && messages.length === 0 ? (
// // //                         <div className="text-center text-red-600 py-10">{error}</div>
// // //                     ) : messages.length === 0 ? (
// // //                         <div className="text-center text-gray-500 py-10">
// // //                             Say hi! Start a conversation.
// // //                             <p className="text-sm mt-2">You can also send photos, videos, or files!</p>
// // //                         </div>
// // //                     ) : (
// // //                         messages.map((msg) => (
// // //                             <div
// // //                                 key={msg._id}
// // //                                 // Outer div aligns the entire message row (avatar, bubble, time)
// // //                                 className={`flex ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'} mb-2`} // Added mb-2 for spacing between messages
// // //                             >
// // //                                 <div
// // //                                     // This inner div acts as the container for the avatar, message bubble, and time.
// // //                                     // We use space-x and flex-row/flex-row-reverse to manage their order.
// // //                                     className={`flex items-end max-w-[70%] ${msg.sender._id === currentUserId ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-2'}`}
// // //                                 >
// // //                                     {/* Avatar */}
// // //                                     <img
// // //                                         src={getFullMediaUrl(msg.sender.avatarUrl) || defaultAvatarUrl}
// // //                                         alt={msg.sender.name}
// // //                                         className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-300"
// // //                                         onError={(e) => {
// // //                                             const target = e.target as HTMLImageElement;
// // //                                             target.src = defaultAvatarUrl;
// // //                                         }}
// // //                                     />

// // //                                     {/* Message Bubble */}
// // //                                     <div
// // //                                         className={`p-3 flex flex-col ${msg.sender._id === currentUserId
// // //                                             ? 'bg-blue-500 text-white mr-2 ml-2 rounded-br-none'
// // //                                             : 'bg-gray-200 text-gray-800 rounded-bl-none'
// // //                                             } ${msg.mediaUrl ? 'rounded' : 'rounded-full'} mr-1`} // mr-1 for spacing between bubble and time (if time is right)
// // //                                     >
// // //                                         {/* Render media if available */}
// // //                                         {msg.mediaUrl && (
// // //                                             <div className="mb-2 max-w-[250px] relative">
// // //                                                 {msg.mediaType === 'image' && (
// // //                                                     <>
// // //                                                         <img
// // //                                                             src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                             alt="Sent image"
// // //                                                             className="max-w-full h-auto rounded-lg object-cover cursor-pointer"
// // //                                                             onClick={() => openImagePreview(getFullMediaUrl(msg.mediaUrl))}
// // //                                                             onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
// // //                                                         />
// // //                                                         <div
// // //                                                             className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
// // //                                                             onClick={() => openImagePreview(getFullMediaUrl(msg.mediaUrl))}
// // //                                                         >
// // //                                                             <ZoomIn size={16} />
// // //                                                         </div>
// // //                                                     </>
// // //                                                 )}
// // //                                                 {msg.mediaType === 'video' && (
// // //                                                     <video
// // //                                                         src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                         controls
// // //                                                         className="max-w-full h-auto rounded-lg object-cover"
// // //                                                         onLoadedData={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
// // //                                                     />
// // //                                                 )}
// // //                                                 {msg.mediaType === 'audio' && (
// // //                                                     <audio
// // //                                                         src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                         controls
// // //                                                         className="max-w-full"
// // //                                                     />
// // //                                                 )}
// // //                                                 {msg.mediaType === 'file' && (
// // //                                                     <a
// // //                                                         href={getFullMediaUrl(msg.mediaUrl)}
// // //                                                         target="_blank"
// // //                                                         rel="noopener noreferrer"
// // //                                                         className={`flex items-center p-2 rounded-md ${msg.sender._id === currentUserId ? 'bg-blue-600' : 'bg-gray-300'} text-blue-100 hover:underline`}
// // //                                                     >
// // //                                                         <FileText size={20} className="mr-2" />
// // //                                                         <span>{msg.mediaUrl.split('/').pop()}</span>
// // //                                                     </a>
// // //                                                 )}
// // //                                             </div>
// // //                                         )}

// // //                                         {msg.content && <p className="break-words">{msg.content}</p>}

// // //                                         {!msg.content && msg.mediaType && (
// // //                                             <p className={`text-xs ${msg.sender._id === currentUserId ? 'text-blue-100' : 'text-gray-600'} italic mt-1`}>
// // //                                                 {msg.mediaType === 'image' ? 'Image 📸' :
// // //                                                     msg.mediaType === 'video' ? 'Video 🎥' :
// // //                                                         msg.mediaType === 'audio' ? 'Audio 🎧' :
// // //                                                             'File 📄'}
// // //                                             </p>
// // //                                         )}
// // //                                     </div>

// // //                                     {/* Time Stamp */}
// // //                                     <span
// // //                                         className={`text-xs text-gray-500 w-20 self-end ${msg.sender._id === currentUserId ? ' text-right' : 'text-left'}`} // Conditional margin and text alignment
// // //                                     >
// // //                                         {format(new Date(msg.createdAt), 'hh:mm a')}
// // //                                     </span>
// // //                                 </div>
// // //                             </div>
// // //                         ))
// // //                     )}
// // //                     <div ref={messagesEndRef} />
// // //                 </div>

// // //                 {/* Media Preview Area (if media is selected) */}
// // //                 {selectedMedia && (
// // //                     <MediaPreview
// // //                         file={selectedMedia}
// // //                         previewUrl={mediaPreviewUrl}
// // //                         onRemove={removeSelectedMedia}
// // //                         error={error}
// // //                     />
// // //                 )}

// // //                 {/* Message Input and Attachment Button */}
// // //                 <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex items-center">
// // //                     {/* Hidden file input */}
// // //                     <input
// // //                         type="file"
// // //                         ref={fileInputRef}
// // //                         style={{ display: 'none' }}
// // //                         onChange={handleFileChange}
// // //                         accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
// // //                     />
// // //                     <button
// // //                         type="button"
// // //                         onClick={() => fileInputRef.current?.click()}
// // //                         className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
// // //                         title="Attach Media"
// // //                         disabled={sendingMessage}
// // //                     >
// // //                         <Paperclip size={24} />
// // //                     </button>

// // //                     <input
// // //                         type="text"
// // //                         value={newMessageContent}
// // //                         onChange={(e) => setNewMessageContent(e.target.value)}
// // //                         placeholder={selectedMedia ? `Add a caption (optional)` : "Type a message..."}
// // //                         className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
// // //                         disabled={sendingMessage}
// // //                     />
// // //                     <button
// // //                         type="submit"
// // //                         className="ml-3 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// // //                         disabled={(!newMessageContent.trim() && !selectedMedia) || sendingMessage}
// // //                     >
// // //                         <Send size={20} />
// // //                     </button>
// // //                 </form>
// // //             </div>

// // //             {/* Image Preview Modal */}
// // //             {isImagePreviewOpen && (
// // //                 <div className="fixed inset-0 z-50 bg-opacity-75 backdrop-blur-sm flex items-center justify-center">
// // //                     <div className="relative top-10 h-[88vh]"> {/* Remove max-w/h to let parent determine size, or give fixed size */}
// // //                         <img
// // //                             src={previewImageUrl}
// // //                             alt="Full size preview"
// // //                             className="w-full h-full object-cover"
// // //                             onClick={closeImagePreview}
// // //                         />
// // //                         <button
// // //                             onClick={closeImagePreview}
// // //                             className="absolute top-1 right-1 bg-transparent bg-opacity-50 text-black cursor-pointer rounded-full p-2 hover:bg-opacity-70"
// // //                         >
// // //                             <XCircle size={24} />
// // //                         </button>
// // //                     </div>
// // //                 </div>
// // //             )}
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;








// // // 'use client';

// // // import React, { useEffect, useState, useCallback, useRef } from 'react';
// // // import { useAuth } from './AuthProvider';
// // // import { ChevronLeft, Send, Paperclip, XCircle, Image as ImageIcon, Video as VideoIcon, FileText, Music as MusicIcon, ZoomIn, Phone, Video, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
// // // import Skeleton from 'react-loading-skeleton';
// // // import 'react-loading-skeleton/dist/skeleton.css';
// // // import { format } from 'date-fns';

// // // import { User as GeneralUser } from './StatusViewer';
// // // import MediaPreview from './MediaPreview';
// // // import { useCall } from './CallManager'; // Import the useCall hook

// // // interface Message {
// // //     _id: string;
// // //     conversationId: string;
// // //     sender: GeneralUser;
// // //     receiver: string;
// // //     content: string;
// // //     mediaUrl?: string;
// // //     mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     createdAt: string;
// // //     // New fields for editing/deleting
// // //     updatedAt?: string; // To show when a message was last edited
// // //     isEdited?: boolean;
// // //     isDeleted?: boolean; // To mark as deleted instead of removing from UI immediately
// // // }

// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: GeneralUser;
// // //     currentUserId: string;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // //     // socket: any; // Remove this if you import it directly as above
// // // }

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // // const ChatWindow: React.FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // //     // socket, // Remove this from props destructuring
// // // }) => {
// // //     const { getIdToken, mongoUser } = useAuth();
// // //     const {
// // //         callUser,
// // //         incomingCall,
// // //         callAccepted,
// // //         isCalling,
// // //         outgoingCallTarget,
// // //         // currentCallId, // Not used directly in UI rendering here
// // //         // endCall // Not used directly in UI rendering here
// // //     } = useCall();

// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState('');
// // //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// // //     const [sendingMessage, setSendingMessage] = useState(false);
// // //     const [error, setError] = useState<string | null>(null);
// // //     const messagesEndRef = useRef<HTMLDivElement>(null);

// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(undefined); // Use undefined to indicate not yet determined
// // //     const hasFetchedInitialMessages = useRef(false);

// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// // //     const fileInputRef = useRef<HTMLInputElement>(null);

// // //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// // //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// // //     // State for editing a message
// // //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// // //     const [editingMessageContent, setEditingMessageContent] = useState<string>(''); // This state will hold the content being edited

// // //     // State for showing context menu (for edit/delete)
// // //     const [showContextMenu, setShowContextMenu] = useState<string | null>(null); // Stores message._id
// // //     const contextMenuRef = useRef<HTMLDivElement>(null);

// // //     // --- Media Selection Handlers ---
// // //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             const file = e.target.files[0];

// // //             if (file.size > 20 * 1024 * 1024) { // 20MB limit
// // //                 setError('File size exceeds 20MB limit.');
// // //                 setSelectedMedia(null);
// // //                 setMediaPreviewUrl(null);
// // //                 if (fileInputRef.current) fileInputRef.current.value = '';
// // //                 return;
// // //             }

// // //             setSelectedMedia(file);
// // //             setError(null);
// // //             setEditingMessageId(null); // Clear editing state if new media is selected
// // //             setNewMessageContent(''); // Clear text input for new media message

// // //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// // //                 const reader = new FileReader();
// // //                 reader.onloadend = () => {
// // //                     setMediaPreviewUrl(reader.result as string);
// // //                 };
// // //                 reader.readAsDataURL(file);
// // //             } else {
// // //                 setMediaPreviewUrl(null);
// // //             }
// // //         }
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         setMediaPreviewUrl(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         setError(null);
// // //     }, []);

// // //     // --- Edit Message Handlers ---
// // //     // Moved these handlers UP to fix "used before declaration" error
// // //     const handleEditMessageConfirm = useCallback(async () => {
// // //         if (!editingMessageId || sendingMessage) return; // Use sendingMessage as a general busy indicator
// // //         const updatedContent = newMessageContent.trim(); // Use newMessageContent for the input value

// // //         if (!updatedContent) {
// // //             setError('Edited message content cannot be empty.');
// // //             return;
// // //         }

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// // //                 method: 'PUT',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                     'Content-Type': 'application/json',
// // //                 },
// // //                 body: JSON.stringify({ content: updatedContent }),
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to edit message.');
// // //             }

// // //             const editedMessage: Message = await response.json();
// // //             console.log("[ChatWindow] Message edited:", editedMessage);

// // //             // Update local state with the edited message (Socket.IO will also update for others)
// // //             setMessages(prev =>
// // //                 prev.map(msg =>
// // //                     msg._id === editedMessage._id
// // //                         ? { ...editedMessage, isEdited: true } // Mark as edited on client
// // //                         : msg
// // //                 )
// // //             );
// // //             setEditingMessageId(null);
// // //             setEditingMessageContent('');
// // //             setNewMessageContent(''); // Clear the input after successful edit
// // //             // No need to onMessageSent here as it's not a new message
// // //             // Socket.IO will handle real-time update for others

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error editing message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to edit message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [editingMessageId, newMessageContent, sendingMessage, getIdToken]); // Include newMessageContent in dependencies

// // //     const handleEditClick = useCallback((message: Message) => {
// // //         if (message.sender._id !== currentUserId) {
// // //             alert('You can only edit your own messages.');
// // //             return;
// // //         }
// // //         setEditingMessageId(message._id);
// // //         setEditingMessageContent(message.content); // Set the specific state for the editing message content
// // //         setNewMessageContent(message.content); // Pre-fill input with message content for user to modify
// // //         removeSelectedMedia(); // Cannot edit media with new media, need to send new message
// // //         setShowContextMenu(null); // Close context menu
// // //         setError(null); // Clear any previous errors
// // //     }, [currentUserId, removeSelectedMedia]);

// // //     const handleCancelEdit = useCallback(() => {
// // //         setEditingMessageId(null);
// // //         setEditingMessageContent('');
// // //         setNewMessageContent(''); // Clear the input when canceling edit
// // //         setError(null); // Clear any edit-related errors
// // //     }, []);

// // //     // --- Delete Message Handlers ---
// // //     const handleDeleteClick = useCallback(async (messageId: string) => {
// // //         if (!window.confirm('Are you sure you want to delete this message?')) return;

// // //         setSendingMessage(true); // Use sendingMessage to prevent multiple actions
// // //         setError(null);
// // //         setShowContextMenu(null); // Close context menu

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                 method: 'DELETE',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete message.');
// // //             }

// // //             // Update UI: Mark message as deleted instead of completely removing
// // //             setMessages(prev =>
// // //                 prev.map(msg =>
// // //                     msg._id === messageId ? {
// // //                         ...msg,
// // //                         isDeleted: true,
// // //                         content: 'This message was deleted.',
// // //                         mediaUrl: undefined, // Clear media for deleted messages
// // //                         mediaType: undefined,
// // //                         isEdited: false // A deleted message is no longer "edited"
// // //                     } : msg
// // //                 )
// // //             );
// // //             // No need to onMessageSent here
// // //             // Socket.IO will handle real-time update for others

// // //             console.log(`[ChatWindow] Message ${messageId} deleted.`);

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [getIdToken, sendingMessage]);


// // //     // --- Conversation ID Fetching ---
// // //     useEffect(() => {
// // //         const findConversationId = async () => {
// // //             if (!isOpen || !chatUser || !currentUserId) return;

// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             setCurrentConversationId(undefined); // Reset to undefined before fetching

// // //             try {
// // //                 const token = await getIdToken();
// // //                 if (!token) throw new Error('Authentication required.');

// // //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });
// // //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// // //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// // //                 const existingConv = conversations.find(conv =>
// // //                     conv.otherParticipant?._id === chatUser._id
// // //                 );

// // //                 if (existingConv) {
// // //                     setCurrentConversationId(existingConv._id);
// // //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// // //                 } else {
// // //                     setCurrentConversationId(null);
// // //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// // //                 }
// // //             } catch (err) {
// // //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// // //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// // //                 setCurrentConversationId(null); // Ensure it's null on error too
// // //             }
// // //             // messages will be fetched by the effect watching currentConversationId
// // //         };

// // //         if (isOpen) {
// // //             findConversationId();
// // //         }
// // //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// // //     // --- Message Fetching ---
// // //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// // //         if (!isOpen) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (isInitialFetch && currentConversationId === undefined) {
// // //             // Still waiting for findConversationId to complete
// // //             return;
// // //         }

// // //         if (isInitialFetch) {
// // //             setLoadingInitialMessages(true);
// // //             setError(null);
// // //         }

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             if (currentConversationId) {
// // //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });

// // //                 if (!response.ok) {
// // //                     const errorData = await response.json().catch(() => ({}));
// // //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// // //                 }

// // //                 const data: Message[] = await response.json();
// // //                 setMessages(data);
// // //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// // //             } else if (!isInitialFetch) {
// // //                 setMessages([]); // Clear messages if no active conversation ID for a refresh
// // //             }
// // //             hasFetchedInitialMessages.current = true;
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //         } finally {
// // //             if (isInitialFetch) {
// // //                 setLoadingInitialMessages(false);
// // //             }
// // //         }
// // //     }, [isOpen, currentConversationId, getIdToken]);

// // //     // Polling and initial fetch effect
// // //     useEffect(() => {
// // //         let interval: NodeJS.Timeout;

// // //         if (isOpen) {
// // //             if (currentConversationId !== undefined) {
// // //                 fetchMessages(true); // Initial fetch or re-fetch when conv ID determined
// // //             }

// // //             interval = setInterval(() => {
// // //                 if (currentConversationId) { // Only poll if a conversation ID exists
// // //                     fetchMessages(false);
// // //                 }
// // //             }, 5000);
// // //         } else {
// // //             // When chat window closes, clear state
// // //             setMessages([]);
// // //             setCurrentConversationId(undefined); // Reset to undefined for next open
// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             setEditingMessageId(null);
// // //             setEditingMessageContent('');
// // //             setNewMessageContent(''); // Also clear new message content on close
// // //             removeSelectedMedia();
// // //             setShowContextMenu(null);
// // //         }

// // //         return () => clearInterval(interval);
// // //     }, [isOpen, currentConversationId, fetchMessages, removeSelectedMedia]);

// // //     // auto scroll
// // //     useEffect(() => {
// // //         if (messagesEndRef.current && !loadingInitialMessages) {
// // //             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
// // //         }
// // //     }, [messages, loadingInitialMessages]);

// // //     // Socket.IO for real-time message updates
// // //     useEffect(() => {
// // //         if (!socket || !isOpen || !currentConversationId) return;

// // //         // Ensure the socket is connected and joined to the conversation room
// // //         if (socket.connected) {
// // //             socket.emit('join_conversation', currentConversationId);
// // //         } else {
// // //             // Handle reconnection logic if needed, or rely on socket.io-client's auto-reconnect
// // //             socket.connect(); // Attempt to connect if not already
// // //             socket.on('connect', () => {
// // //                 socket.emit('join_conversation', currentConversationId);
// // //             });
// // //         }


// // //         const handleReceiveMessage = (message: Message) => {
// // //             // Ensure message belongs to the current conversation
// // //             if (message.conversationId === currentConversationId) {
// // //                 setMessages(prev => {
// // //                     // Check if message already exists to avoid duplicates (important for polling + socket.io)
// // //                     const exists = prev.some(msg => msg._id === message._id);
// // //                     return exists ? prev : [...prev, message];
// // //                 });
// // //             }
// // //         };

// // //         const handleMessageEdited = (editedMessage: Message) => {
// // //             if (editedMessage.conversationId === currentConversationId) {
// // //                 setMessages(prev =>
// // //                     prev.map(msg => (msg._id === editedMessage._id ? editedMessage : msg))
// // //                 );
// // //             }
// // //         };

// // //         // Typo correction: your backend likely emits `messageDeleted` (camelCase)
// // //         // rather than `deleted_message`. Adjust both backend and frontend if needed.
// // //         const handleMessageDeleted = ({ messageId, conversationId }: { messageId: string, conversationId: string }) => {
// // //             if (conversationId === currentConversationId) {
// // //                 setMessages(prev =>
// // //                     prev.map(msg =>
// // //                         msg._id === messageId ? { ...msg, isDeleted: true, content: 'This message was deleted.', mediaUrl: undefined, mediaType: undefined } : msg
// // //                     )
// // //                 );
// // //             }
// // //         };

// // //         socket.on('new_message', handleReceiveMessage); // Common event name for new messages
// // //         socket.on('message_edited', handleMessageEdited);
// // //         socket.on('message_deleted', handleMessageDeleted); // Listen for the corrected event name

// // //         return () => {
// // //             socket.off('new_message', handleReceiveMessage);
// // //             socket.off('message_edited', handleMessageEdited);
// // //             socket.off('message_deleted', handleMessageDeleted);
// // //             // Also, leave the conversation room when component unmounts or chat closes
// // //             if (socket.connected) {
// // //                 socket.emit('leave_conversation', currentConversationId);
// // //             }
// // //         };
// // //     }, [socket, isOpen, currentConversationId]);


// // //     // --- Message Sending Handler ---
// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();
// // //         const textContent = newMessageContent.trim(); // Get content from input

// // //         if (editingMessageId) {
// // //             // If in editing mode, handle edit
// // //             await handleEditMessageConfirm(); // Call the confirmed edit handler
// // //             return;
// // //         }

// // //         // If not in editing mode, handle new message
// // //         if (!textContent && !selectedMedia) {
// // //             setError('Please type a message or select a file.');
// // //             return;
// // //         }
// // //         if (sendingMessage) return;

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             let response;
// // //             let sentMessage: Message;

// // //             if (selectedMedia) {
// // //                 const formData = new FormData();
// // //                 formData.append('media', selectedMedia);
// // //                 if (textContent) {
// // //                     formData.append('content', textContent);
// // //                 }

// // //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         // 'Content-Type': 'multipart/form-data' is NOT needed with FormData; browser sets it
// // //                     },
// // //                     body: formData,
// // //                 });
// // //             } else {
// // //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         'Content-Type': 'application/json',
// // //                     },
// // //                     body: JSON.stringify({ content: textContent }),
// // //                 });
// // //             }

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// // //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //                 // Also, proactively join the new conversation room if it's the first message
// // //                 if (socket.connected) {
// // //                     socket.emit('join_conversation', sentMessage.conversationId);
// // //                 }
// // //             }

// // //             // Update messages state only if not already added by socket.io (due to self-emission)
// // //             // It's often simpler to let socket.io be the single source of truth for new messages
// // //             // but this check handles potential race conditions or network latency.
// // //             setMessages(prev => {
// // //                 const exists = prev.some(msg => msg._id === sentMessage._id);
// // //                 return exists ? prev : [...prev, sentMessage];
// // //             });
// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent(); // Notify parent component (e.g., ActivityBar) that a message was sent

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia, editingMessageId, handleEditMessageConfirm, socket]);


// // //     // --- Image Preview Handlers ---
// // //     const openImagePreview = useCallback((imageUrl: string) => {
// // //         setPreviewImageUrl(imageUrl);
// // //         setIsImagePreviewOpen(true);
// // //     }, []);

// // //     const closeImagePreview = useCallback(() => {
// // //         setIsImagePreviewOpen(false);
// // //         setPreviewImageUrl(null);
// // //     }, []);

// // //     // --- Calling Logic ---
// // //     const handleCallClick = useCallback(() => {
// // //         if (chatUser && mongoUser) {
// // //             callUser(chatUser);
// // //         } else {
// // //             console.warn("Cannot make call: chatUser or mongoUser is missing.");
// // //             alert("Could not start call. Please ensure user data is loaded.");
// // //         }
// // //     }, [chatUser, mongoUser, callUser]);

// // //     const disableCallButton = !chatUser ||
// // //         !mongoUser ||
// // //         isCalling ||
// // //         incomingCall !== null ||
// // //         (outgoingCallTarget && outgoingCallTarget._id === chatUser._id && !callAccepted);

// // //     // Close context menu when clicking outside
// // //     useEffect(() => {
// // //         const handleClickOutside = (event: MouseEvent) => {
// // //             if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
// // //                 setShowContextMenu(null);
// // //             }
// // //         };

// // //         document.addEventListener('mousedown', handleClickOutside);
// // //         return () => {
// // //             document.removeEventListener('mousedown', handleClickOutside);
// // //         };
// // //     }, []);


// // //     if (!isOpen) return null;

// // //     return (
// // //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// // //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// // //                 {/* Header */}
// // //                 <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
// // //                     <div className="flex items-center">
// // //                         <button onClick={onClose} className="text-gray-600 p-1 rounded-full hover:bg-gray-600 hover:text-gray-50 mr-3 cursor-pointer">
// // //                             <ChevronLeft size={24} />
// // //                         </button>
// // //                         <img
// // //                             src={getFullMediaUrl(chatUser.avatarUrl) || defaultAvatarUrl}
// // //                             alt={chatUser.name}
// // //                             className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
// // //                             onError={(e) => {
// // //                                 const target = e.target as HTMLImageElement;
// // //                                 target.src = defaultAvatarUrl;
// // //                             }}
// // //                         />
// // //                         <h2 className="text-lg font-semibold text-gray-800">{chatUser.name}</h2>
// // //                     </div>

// // //                     {/* Call Buttons and More Options */}
// // //                     <div className="flex items-center space-x-3">
// // //                         <button
// // //                             onClick={handleCallClick}
// // //                             className={`p-2 rounded-full text-white ${disableCallButton ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} transition-colors duration-200`}
// // //                             disabled={disableCallButton}
// // //                             title={disableCallButton ? "Call unavailable" : `Call ${chatUser.name}`}
// // //                         >
// // //                             <Phone size={20} />
// // //                         </button>
// // //                         <button
// // //                             className="p-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //                             disabled={true} // Disable for now as only audio call is implemented
// // //                             title="Video call (coming soon)"
// // //                         >
// // //                             <Video size={20} />
// // //                         </button>
// // //                         <button className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
// // //                             <MoreHorizontal size={20} />
// // //                         </button>
// // //                     </div>
// // //                 </div>

// // //                 {/* Messages Area */}
// // //                 <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
// // //                     {loadingInitialMessages ? (
// // //                         <div className="space-y-3">
// // //                             <Skeleton height={50} width="80%" />
// // //                             <Skeleton height={50} width="70%" className="ml-auto" />
// // //                             <Skeleton height={50} width="90%" />
// // //                         </div>
// // //                     ) : error && messages.length === 0 && currentConversationId !== null ? (
// // //                         <div className="text-center text-red-600 py-10">{error}</div>
// // //                     ) : messages.length === 0 && currentConversationId === null ? (
// // //                         <div className="text-center text-gray-500 py-10">
// // //                             Say hi! Start a conversation.
// // //                             <p className="text-sm mt-2">You can also send photos, videos, or files!</p>
// // //                         </div>
// // //                     ) : (
// // //                         messages.map((msg) => (
// // //                             <div
// // //                                 key={msg._id}
// // //                                 className={`flex ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'} mb-2`}
// // //                             >
// // //                                 <div
// // //                                     className={`relative flex items-end max-w-[70%] group ${msg.sender._id === currentUserId ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-2'}`}
// // //                                 >
// // //                                     {/* Avatar */}
// // //                                     <img
// // //                                         src={getFullMediaUrl(msg.sender.avatarUrl) || defaultAvatarUrl}
// // //                                         alt={msg.sender.name}
// // //                                         className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-300"
// // //                                         onError={(e) => {
// // //                                             const target = e.target as HTMLImageElement;
// // //                                             target.src = defaultAvatarUrl;
// // //                                         }}
// // //                                     />

// // //                                     {/* Message Bubble */}
// // //                                     <div
// // //                                         className={`p-3 flex flex-col relative ${msg.sender._id === currentUserId
// // //                                                 ? 'bg-blue-500 text-white mr-2 ml-2 rounded-br-none'
// // //                                                 : 'bg-gray-200 text-gray-800 rounded-bl-none'
// // //                                             } ${msg.mediaUrl ? 'rounded-lg' : 'rounded-full'} mr-1 ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
// // //                                         onContextMenu={(e) => {
// // //                                             if (msg.sender._id === currentUserId && !msg.isDeleted && !msg.mediaUrl) { // Only allow editing text messages
// // //                                                 e.preventDefault();
// // //                                                 setShowContextMenu(msg._id);
// // //                                             }
// // //                                         }}
// // //                                     >
// // //                                         {msg.isDeleted ? (
// // //                                             <p className="text-sm text-gray-400">This message was deleted.</p>
// // //                                         ) : (
// // //                                             <>
// // //                                                 {/* Render media if available */}
// // //                                                 {msg.mediaUrl && (
// // //                                                     <div className="mb-2 max-w-[250px] relative">
// // //                                                         {msg.mediaType === 'image' && (
// // //                                                             <>
// // //                                                                 <img
// // //                                                                     src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                                     alt="Sent image"
// // //                                                                     className="max-w-full h-auto rounded-lg object-cover cursor-pointer"
// // //                                                                     onClick={() => openImagePreview(getFullMediaUrl(msg.mediaUrl))}
// // //                                                                     onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
// // //                                                                 />
// // //                                                                 <div
// // //                                                                     className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
// // //                                                                     onClick={() => openImagePreview(getFullMediaUrl(msg.mediaUrl))}
// // //                                                                 >
// // //                                                                     <ZoomIn size={16} />
// // //                                                                 </div>
// // //                                                             </>
// // //                                                         )}
// // //                                                         {msg.mediaType === 'video' && (
// // //                                                             <video
// // //                                                                 src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                                 controls
// // //                                                                 className="max-w-full h-auto rounded-lg object-cover"
// // //                                                                 onLoadedData={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
// // //                                                             />
// // //                                                         )}
// // //                                                         {msg.mediaType === 'audio' && (
// // //                                                             <audio
// // //                                                                 src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                                 controls
// // //                                                                 className="max-w-full"
// // //                                                             />
// // //                                                         )}
// // //                                                         {msg.mediaType === 'file' && (
// // //                                                             <a
// // //                                                                 href={getFullMediaUrl(msg.mediaUrl)}
// // //                                                                 target="_blank"
// // //                                                                 rel="noopener noreferrer"
// // //                                                                 className={`flex items-center p-2 rounded-md ${msg.sender._id === currentUserId ? 'bg-blue-600' : 'bg-gray-300'} text-blue-100 hover:underline`}
// // //                                                             >
// // //                                                                 <FileText size={20} className="mr-2" />
// // //                                                                 <span>{msg.mediaUrl.split('/').pop()}</span>
// // //                                                             </a>
// // //                                                         )}
// // //                                                     </div>
// // //                                                 )}

// // //                                                 {msg.content && <p className="break-words">{msg.content}</p>}

// // //                                                 {msg.isEdited && (
// // //                                                     <span className={`text-xs ${msg.sender._id === currentUserId ? 'text-blue-200' : 'text-gray-500'} mt-1 self-end`}>
// // //                                                         (Edited)
// // //                                                     </span>
// // //                                                 )}
// // //                                             </>
// // //                                         )}
// // //                                         <span className={`text-xs ${msg.sender._id === currentUserId ? 'text-blue-200' : 'text-gray-500'} mt-1 self-end`}>
// // //                                             {format(new Date(msg.createdAt), 'h:mm a')}
// // //                                         </span>

// // //                                         {/* Context Menu for Edit/Delete */}
// // //                                         {showContextMenu === msg._id && !msg.isDeleted && msg.sender._id === currentUserId && (
// // //                                             <div
// // //                                                 ref={contextMenuRef}
// // //                                                 className={`absolute z-10 bg-white shadow-lg rounded-md overflow-hidden ${msg.sender._id === currentUserId ? 'right-0 top-full mt-1' : 'left-0 top-full mt-1'}`}
// // //                                             >
// // //                                                 {!msg.mediaUrl && ( // Only allow editing text messages
// // //                                                     <button
// // //                                                         onClick={() => handleEditClick(msg)}
// // //                                                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                                     >
// // //                                                         <Edit size={16} className="mr-2" /> Edit
// // //                                                     </button>
// // //                                                 )}
// // //                                                 <button
// // //                                                     onClick={() => handleDeleteClick(msg._id)}
// // //                                                     className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
// // //                                                 >
// // //                                                     <Trash2 size={16} className="mr-2" /> Delete
// // //                                                 </button>
// // //                                             </div>
// // //                                         )}
// // //                                     </div>
// // //                                 </div>
// // //                             </div>
// // //                         ))
// // //                     )}
// // //                     <div ref={messagesEndRef} /> {/* For auto-scrolling to the bottom */}
// // //                 </div>

// // //                 {/* Media Preview (if selected) */}
// // //                 {mediaPreviewUrl && (
// // //                     <MediaPreview
// // //                         file={selectedMedia}
// // //                         previewUrl={mediaPreviewUrl}
// // //                         onRemove={removeSelectedMedia}
// // //                     />
// // //                 )}

// // //                 {/* Input Area */}
// // //                 {editingMessageId && (
// // //                     <div className="flex items-center justify-between p-2 bg-yellow-100 text-yellow-800 text-sm border-t border-yellow-200">
// // //                         <span>Editing message...</span>
// // //                         <button onClick={handleCancelEdit} className="text-yellow-700 hover:underline">Cancel</button>
// // //                     </div>
// // //                 )}
// // //                 <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-200 bg-gray-50">
// // //                     <input
// // //                         type="file"
// // //                         ref={fileInputRef}
// // //                         className="hidden"
// // //                         onChange={handleFileChange}
// // //                         accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
// // //                         disabled={sendingMessage || !!editingMessageId} // Disable file input during edit/send
// // //                     />
// // //                     <button
// // //                         type="button"
// // //                         onClick={() => fileInputRef.current?.click()}
// // //                         className="p-2 mr-2 text-gray-600 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //                         disabled={sendingMessage || !!editingMessageId} // Disable file input button during edit/send
// // //                         title="Attach file"
// // //                     >
// // //                         <Paperclip size={24} />
// // //                     </button>
// // //                     <input
// // //                         type="text"
// // //                         value={newMessageContent}
// // //                         onChange={(e) => setNewMessageContent(e.target.value)}
// // //                         placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
// // //                         className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
// // //                         disabled={sendingMessage}
// // //                     />
// // //                     <button
// // //                         type="submit"
// // //                         className="ml-2 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //                         disabled={sendingMessage || (!newMessageContent.trim() && !selectedMedia)}
// // //                     >
// // //                         {sendingMessage ? (
// // //                             <span className="animate-spin h-5 w-5 border-t-2 border-r-2 border-white rounded-full block"></span>
// // //                         ) : (
// // //                             <Send size={24} />
// // //                         )}
// // //                     </button>
// // //                 </form>
// // //                 {error && <p className="text-red-500 text-center text-sm py-2">{error}</p>}
// // //             </div>

// // //             {/* Full Image Preview Modal */}
// // //             {isImagePreviewOpen && previewImageUrl && (
// // //                 <div
// // //                     className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
// // //                     onClick={closeImagePreview}
// // //                 >
// // //                     <button
// // //                         onClick={closeImagePreview}
// // //                         className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
// // //                         aria-label="Close image preview"
// // //                     >
// // //                         <XCircle size={32} />
// // //                     </button>
// // //                     <img
// // //                         src={previewImageUrl}
// // //                         alt="Full size preview"
// // //                         className="max-w-[90%] max-h-[90%] object-contain"
// // //                     />
// // //                 </div>
// // //             )}
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;























// // // 'use client';

// // // import React, { useEffect, useState, useCallback, useRef } from 'react';
// // // import { useAuth } from './AuthProvider';
// // // import { ChevronLeft, Send, Paperclip, XCircle, Image as ImageIcon, Video as VideoIcon, FileText, Music as MusicIcon, ZoomIn, MoreVertical, Edit, Trash2 } from 'lucide-react';
// // // import Skeleton from 'react-loading-skeleton';
// // // import 'react-loading-skeleton/dist/skeleton.css';
// // // import { format } from 'date-fns';


// // // import { User as GeneralUser } from './StatusViewer';
// // // import MediaPreview from './MediaPreview'; // Import the new MediaPreview component

// // // interface Message {
// // //     _id: string;
// // //     conversationId: string;
// // //     sender: GeneralUser;
// // //     receiver: string;
// // //     content: string;
// // //     mediaUrl?: string;
// // //     mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     createdAt: string;
// // //     updatedAt?: string; // Add this for edit functionality
// // // }

// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: GeneralUser;
// // //     currentUserId: string;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // // }

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // // const ChatWindow: React.FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState('');
// // //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// // //     const [sendingMessage, setSendingMessage] = useState(false);
// // //     const [error, setError] = useState<string | null>(null);
// // //     const messagesEndRef = useRef<HTMLDivElement>(null);

// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const hasFetchedInitialMessages = useRef(false);

// // //     // States for media upload
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// // //     const fileInputRef = useRef<HTMLInputElement>(null);

// // //     // New state for image preview
// // //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// // //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// // //     // States for message editing
// // //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// // //     const [editedMessageContent, setEditedMessageContent] = useState('');
// // //     const [isEditing, setIsEditing] = useState(false); // To disable send button during edit

// // //     // State for context menu
// // //     const [contextMenu, setContextMenu] = useState<{
// // //         messageId: string;
// // //         x: number;
// // //         y: number;
// // //     } | null>(null);
// // //     const contextMenuRef = useRef<HTMLDivElement>(null);

// // //     // --- Context Menu Handlers ---
// // //     const handleContextMenu = useCallback((event: React.MouseEvent, messageId: string) => {
// // //         event.preventDefault();
// // //         setContextMenu({ messageId, x: event.clientX, y: event.clientY });
// // //     }, []);

// // //     const handleClickOutsideContextMenu = useCallback((event: MouseEvent) => {
// // //         if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
// // //             setContextMenu(null);
// // //         }
// // //     }, []);

// // //     useEffect(() => {
// // //         document.addEventListener('mousedown', handleClickOutsideContextMenu);
// // //         return () => {
// // //             document.removeEventListener('mousedown', handleClickOutsideContextMenu);
// // //         };
// // //     }, [handleClickOutsideContextMenu]);


// // //     // --- Media Selection Handlers ---
// // //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             const file = e.target.files[0];

// // //             if (file.size > 20 * 1024 * 1024) {
// // //                 setError('File size exceeds 20MB limit.');
// // //                 setSelectedMedia(null);
// // //                 setMediaPreviewUrl(null);
// // //                 if (fileInputRef.current) fileInputRef.current.value = '';
// // //                 return;
// // //             }

// // //             setSelectedMedia(file);
// // //             setError(null);

// // //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// // //                 const reader = new FileReader();
// // //                 reader.onloadend = () => {
// // //                     setMediaPreviewUrl(reader.result as string);
// // //                 };
// // //                 reader.readAsDataURL(file);
// // //             } else {
// // //                 setMediaPreviewUrl(null);
// // //             }
// // //         }
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         setMediaPreviewUrl(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         setError(null);
// // //     }, []);

// // //     // --- Conversation ID Fetching ---
// // //     useEffect(() => {
// // //         const findConversationId = async () => {
// // //             if (!isOpen || !chatUser || !currentUserId) return;

// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             try {
// // //                 const token = await getIdToken();
// // //                 if (!token) throw new Error('Authentication required.');

// // //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });
// // //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// // //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// // //                 const existingConv = conversations.find(conv =>
// // //                     conv.otherParticipant?._id === chatUser._id
// // //                 );

// // //                 if (existingConv) {
// // //                     setCurrentConversationId(existingConv._id);
// // //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// // //                 } else {
// // //                     setCurrentConversationId(null);
// // //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// // //                 }
// // //             } catch (err) {
// // //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// // //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// // //             }
// // //             // Note: setLoadingInitialMessages(false) is handled by fetchMessages below
// // //         };

// // //         if (isOpen) {
// // //             findConversationId();
// // //         }
// // //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// // //     // --- Message Fetching ---
// // //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// // //         if (!isOpen) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (!currentConversationId && !isInitialFetch) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (isInitialFetch) {
// // //             setLoadingInitialMessages(true);
// // //             setError(null);
// // //         }

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             if (currentConversationId) {
// // //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });

// // //                 if (!response.ok) {
// // //                     const errorData = await response.json().catch(() => ({}));
// // //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// // //                 }

// // //                 const data: Message[] = await response.json();
// // //                 setMessages(data);
// // //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// // //             } else {
// // //                 setMessages([]);
// // //             }
// // //             hasFetchedInitialMessages.current = true;
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //         } finally {
// // //             if (isInitialFetch) {
// // //                 setLoadingInitialMessages(false);
// // //             }
// // //         }
// // //     }, [isOpen, currentConversationId, getIdToken]);

// // //     useEffect(() => {
// // //         let interval: NodeJS.Timeout;

// // //         if (isOpen && currentConversationId) {
// // //             fetchMessages(true);
// // //             interval = setInterval(() => {
// // //                 fetchMessages(false);
// // //             }, 5000);
// // //         } else if (isOpen && !currentConversationId && !hasFetchedInitialMessages.current) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //         }

// // //         return () => clearInterval(interval);
// // //     }, [isOpen, currentConversationId, fetchMessages]);

// // //     // auto scroll
// // //     useEffect(() => {
// // //         if (messagesEndRef.current && !loadingInitialMessages) {
// // //             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
// // //         }
// // //     }, [messages, loadingInitialMessages]);

// // //     // --- Message Sending Handler ---
// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();
// // //         const textContent = newMessageContent.trim();

// // //         if (!textContent && !selectedMedia) {
// // //             setError('Please type a message or select a file.');
// // //             return;
// // //         }
// // //         if (sendingMessage) return;

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             let response;
// // //             let sentMessage: Message;

// // //             if (selectedMedia) {
// // //                 const formData = new FormData();
// // //                 formData.append('media', selectedMedia);
// // //                 if (textContent) {
// // //                     formData.append('content', textContent);
// // //                 }

// // //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                     },
// // //                     body: formData,
// // //                 });
// // //             } else {
// // //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         'Content-Type': 'application/json',
// // //                     },
// // //                     body: JSON.stringify({ content: textContent }),
// // //                 });
// // //             }

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// // //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             setMessages(prev => [...prev, sentMessage]);
// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent();

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     // --- Message Editing Handlers ---
// // //     const handleEditClick = useCallback((message: Message) => {
// // //         setContextMenu(null); // Close context menu
// // //         setEditingMessageId(message._id);
// // //         setEditedMessageContent(message.content || '');
// // //         setNewMessageContent(message.content || ''); // Populate input with current content
// // //         setIsEditing(true);
// // //         removeSelectedMedia(); // Clear any selected media when editing
// // //     }, [removeSelectedMedia]);

// // //     const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
// // //         e.preventDefault();
// // //         if (!editingMessageId || isEditing) return;

// // //         const contentToSave = editedMessageContent.trim();
// // //         if (!contentToSave) {
// // //             setError('Message content cannot be empty.');
// // //             return;
// // //         }

// // //         setIsEditing(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// // //                 method: 'PUT',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                     'Content-Type': 'application/json',
// // //                 },
// // //                 body: JSON.stringify({ content: contentToSave }),
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to edit message.');
// // //             }

// // //             const updatedMessage: Message = await response.json();
// // //             setMessages(prevMessages =>
// // //                 prevMessages.map(msg =>
// // //                     msg._id === editingMessageId ? { ...msg, content: updatedMessage.content, updatedAt: updatedMessage.updatedAt } : msg
// // //                 )
// // //             );
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setNewMessageContent('');
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error editing message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to edit message.');
// // //         } finally {
// // //             setIsEditing(false);
// // //         }
// // //     }, [editingMessageId, editedMessageContent, getIdToken, isEditing]);

// // //     const handleCancelEdit = useCallback(() => {
// // //         setEditingMessageId(null);
// // //         setEditedMessageContent('');
// // //         setNewMessageContent('');
// // //         setIsEditing(false);
// // //     }, []);

// // //     // --- Message Deletion Handler ---
// // //     const handleDeleteMessage = useCallback(async (messageId: string) => {
// // //         setContextMenu(null); // Close context menu
// // //         if (!window.confirm('Are you sure you want to delete this message?')) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                 method: 'DELETE',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete message.');
// // //             }

// // //             setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
// // //             onMessageSent(); // To update conversation list if last message was deleted
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete message.');
// // //         }
// // //     }, [getIdToken, onMessageSent]);


// // //     // --- Image Preview Handlers ---
// // //     const openImagePreview = useCallback((imageUrl: string) => {
// // //         setPreviewImageUrl(imageUrl);
// // //         setIsImagePreviewOpen(true);
// // //     }, []);

// // //     const closeImagePreview = useCallback(() => {
// // //         setIsImagePreviewOpen(false);
// // //         setPreviewImageUrl(null);
// // //     }, []);

// // //     if (!isOpen) return null;

// // //     return (
// // //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// // //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// // //                 {/* Header */}
// // //                 <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
// // //                     <button onClick={onClose} className="text-gray-600 p-1 rounded-full hover:bg-gray-600 hover:text-gray-50 mr-3 cursor-pointer">
// // //                         <ChevronLeft size={24} />
// // //                     </button>
// // //                     <img
// // //                         src={getFullMediaUrl(chatUser.avatarUrl) || defaultAvatarUrl}
// // //                         alt={chatUser.name}
// // //                         className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
// // //                         onError={(e) => {
// // //                             const target = e.target as HTMLImageElement;
// // //                             target.src = defaultAvatarUrl;
// // //                         }}
// // //                     />
// // //                     <h2 className="text-lg font-semibold text-gray-800">{chatUser.name}</h2>
// // //                 </div>

// // //                 {/* Messages Area */}
// // //                 <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
// // //                     {loadingInitialMessages ? (
// // //                         <div className="space-y-3">
// // //                             <Skeleton height={50} width="80%" />
// // //                             <Skeleton height={50} width="70%" className="ml-auto" />
// // //                             <Skeleton height={50} width="90%" />
// // //                         </div>
// // //                     ) : error && messages.length === 0 ? (
// // //                         <div className="text-center text-red-600 py-10">{error}</div>
// // //                     ) : messages.length === 0 ? (
// // //                         <div className="text-center text-gray-500 py-10">
// // //                             Say hi! Start a conversation.
// // //                             <p className="text-sm mt-2">You can also send photos, videos, or files!</p>
// // //                         </div>
// // //                     ) : (
// // //                         messages.map((msg) => (
// // //                             <div
// // //                                 key={msg._id}
// // //                                 className={`flex ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'} mb-2`}
// // //                             >
// // //                                 <div
// // //                                     className={`flex items-end max-w-[70%] ${msg.sender._id === currentUserId ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-2'}`}
// // //                                 >
// // //                                     {/* Avatar */}
// // //                                     <img
// // //                                         src={getFullMediaUrl(msg.sender.avatarUrl) || defaultAvatarUrl}
// // //                                         alt={msg.sender.name}
// // //                                         className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-300"
// // //                                         onError={(e) => {
// // //                                             const target = e.target as HTMLImageElement;
// // //                                             target.src = defaultAvatarUrl;
// // //                                         }}
// // //                                     />

// // //                                     {/* Message Bubble */}
// // //                                     <div
// // //                                         className={`p-3 flex flex-col relative ${msg.sender._id === currentUserId
// // //                                             ? 'bg-blue-500 text-white mr-2 ml-2 rounded-br-none'
// // //                                             : 'bg-gray-200 text-gray-800 rounded-bl-none'
// // //                                             } ${msg.mediaUrl ? 'rounded' : 'rounded-full'} mr-1`}
// // //                                         onContextMenu={(e) => msg.sender._id === currentUserId && handleContextMenu(e, msg._id)}
// // //                                     >
// // //                                         {/* Edit/Delete Options Button (only for current user's messages) */}
// // //                                         {msg.sender._id === currentUserId && (
// // //                                             <button
// // //                                                 className="absolute top-1 right-1 p-1 rounded-full text-white bg-black bg-opacity-30 hover:bg-opacity-50"
// // //                                                 onClick={(e) => handleContextMenu(e, msg._id)}
// // //                                             >
// // //                                                 <MoreVertical size={16} />
// // //                                             </button>
// // //                                         )}

// // //                                         {/* Context Menu for Edit/Delete */}
// // //                                         {contextMenu && contextMenu.messageId === msg._id && (
// // //                                             <div
// // //                                                 ref={contextMenuRef}
// // //                                                 className="absolute z-10 bg-white rounded-md shadow-lg py-1"
// // //                                                 style={{ top: contextMenu.y, left: contextMenu.x }}
// // //                                             >
// // //                                                 <button
// // //                                                     className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// // //                                                     onClick={() => handleEditClick(msg)}
// // //                                                 >
// // //                                                     <Edit size={16} className="mr-2" /> Edit
// // //                                                 </button>
// // //                                                 <button
// // //                                                     className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
// // //                                                     onClick={() => handleDeleteMessage(msg._id)}
// // //                                                 >
// // //                                                     <Trash2 size={16} className="mr-2" /> Delete
// // //                                                 </button>
// // //                                             </div>
// // //                                         )}


// // //                                         {/* Render media if available */}
// // //                                         {msg.mediaUrl && (
// // //                                             <div className="mb-2 max-w-[250px] relative">
// // //                                                 {msg.mediaType === 'image' && (
// // //                                                     <>
// // //                                                         <img
// // //                                                             src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                             alt="Sent image"
// // //                                                             className="max-w-full h-auto rounded-lg object-cover cursor-pointer"
// // //                                                             onClick={() => openImagePreview(getFullMediaUrl(msg.mediaUrl))}
// // //                                                             onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
// // //                                                         />
// // //                                                         <div
// // //                                                             className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
// // //                                                             onClick={() => openImagePreview(getFullMediaUrl(msg.mediaUrl))}
// // //                                                         >
// // //                                                             <ZoomIn size={16} />
// // //                                                         </div>
// // //                                                     </>
// // //                                                 )}
// // //                                                 {msg.mediaType === 'video' && (
// // //                                                     <video
// // //                                                         src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                         controls
// // //                                                         className="max-w-full h-auto rounded-lg object-cover"
// // //                                                         onLoadedData={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
// // //                                                     />
// // //                                                 )}
// // //                                                 {msg.mediaType === 'audio' && (
// // //                                                     <audio
// // //                                                         src={getFullMediaUrl(msg.mediaUrl)}
// // //                                                         controls
// // //                                                         className="max-w-full"
// // //                                                     />
// // //                                                 )}
// // //                                                 {msg.mediaType === 'file' && (
// // //                                                     <a
// // //                                                         href={getFullMediaUrl(msg.mediaUrl)}
// // //                                                         target="_blank"
// // //                                                         rel="noopener noreferrer"
// // //                                                         className={`flex items-center p-2 rounded-md ${msg.sender._id === currentUserId ? 'bg-blue-600' : 'bg-gray-300'} text-blue-100 hover:underline`}
// // //                                                     >
// // //                                                         <FileText size={20} className="mr-2" />
// // //                                                         <span>{msg.mediaUrl.split('/').pop()}</span>
// // //                                                     </a>
// // //                                                 )}
// // //                                             </div>
// // //                                         )}

// // //                                         {msg.content && <p className="break-words">{msg.content}</p>}

// // //                                         {!msg.content && msg.mediaType && (
// // //                                             <p className={`text-xs ${msg.sender._id === currentUserId ? 'text-blue-100' : 'text-gray-600'} italic mt-1`}>
// // //                                                 {msg.mediaType === 'image' ? 'Image 📸' :
// // //                                                     msg.mediaType === 'video' ? 'Video 🎥' :
// // //                                                         msg.mediaType === 'audio' ? 'Audio 🎧' :
// // //                                                             'File 📄'}
// // //                                             </p>
// // //                                         )}
// // //                                         {msg.updatedAt && msg.updatedAt !== msg.createdAt && (
// // //                                             <p className={`text-xs ${msg.sender._id === currentUserId ? 'text-blue-100' : 'text-gray-600'} italic mt-1`}>
// // //                                                 (Edited)
// // //                                             </p>
// // //                                         )}
// // //                                     </div>

// // //                                     {/* Time Stamp */}
// // //                                     <span
// // //                                         className={`text-xs text-gray-500 w-20 self-end ${msg.sender._id === currentUserId ? ' text-right' : 'text-left'}`}
// // //                                     >
// // //                                         {format(new Date(msg.createdAt), 'hh:mm a')}
// // //                                     </span>
// // //                                 </div>
// // //                             </div>
// // //                         ))
// // //                     )}
// // //                     <div ref={messagesEndRef} />
// // //                 </div>

// // //                 {/* Media Preview Area (if media is selected) */}
// // //                 {selectedMedia && (
// // //                     <MediaPreview
// // //                         file={selectedMedia}
// // //                         previewUrl={mediaPreviewUrl}
// // //                         onRemove={removeSelectedMedia}
// // //                         error={error}
// // //                     />
// // //                 )}

// // //                 {/* Message Input and Attachment Button */}
// // //                 <form onSubmit={editingMessageId ? handleSaveEdit : handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex items-center">
// // //                     {/* Hidden file input */}
// // //                     <input
// // //                         type="file"
// // //                         ref={fileInputRef}
// // //                         style={{ display: 'none' }}
// // //                         onChange={handleFileChange}
// // //                         accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
// // //                         disabled={isEditing || sendingMessage} // Disable file input during edit/send
// // //                     />
// // //                     <button
// // //                         type="button"
// // //                         onClick={() => fileInputRef.current?.click()}
// // //                         className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
// // //                         title="Attach Media"
// // //                         disabled={isEditing || sendingMessage} // Disable file input during edit/send
// // //                     >
// // //                         <Paperclip size={24} />
// // //                     </button>

// // //                     <input
// // //                         type="text"
// // //                         value={editingMessageId ? editedMessageContent : newMessageContent}
// // //                         onChange={(e) => {
// // //                             if (editingMessageId) {
// // //                                 setEditedMessageContent(e.target.value);
// // //                             } else {
// // //                                 setNewMessageContent(e.target.value);
// // //                             }
// // //                         }}
// // //                         placeholder={selectedMedia ? `Add a caption (optional)` : (editingMessageId ? "Edit your message..." : "Type a message...")}
// // //                         className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
// // //                         disabled={sendingMessage}
// // //                     />
// // //                     {editingMessageId ? (
// // //                         <>
// // //                             <button
// // //                                 type="submit"
// // //                                 className="ml-3 p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// // //                                 disabled={!editedMessageContent.trim() || isEditing}
// // //                             >
// // //                                 <Send size={20} /> {/* Use a different icon for save, or just Send */}
// // //                             </button>
// // //                             <button
// // //                                 type="button"
// // //                                 onClick={handleCancelEdit}
// // //                                 className="ml-2 p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// // //                                 disabled={isEditing}
// // //                             >
// // //                                 <XCircle size={20} />
// // //                             </button>
// // //                         </>
// // //                     ) : (
// // //                         <button
// // //                             type="submit"
// // //                             className="ml-3 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// // //                             disabled={(!newMessageContent.trim() && !selectedMedia) || sendingMessage}
// // //                         >
// // //                             <Send size={20} />
// // //                         </button>
// // //                     )}
// // //                 </form>
// // //             </div>

// // //             {/* Image Preview Modal */}
// // //             {isImagePreviewOpen && (
// // //                 <div className="fixed inset-0 z-50 bg-opacity-75 backdrop-blur-sm flex items-center justify-center">
// // //                     <div className="relative top-10 h-[88vh]">
// // //                         <img
// // //                             src={previewImageUrl}
// // //                             alt="Full size preview"
// // //                             className="w-full h-full object-contain" // Changed to object-contain to prevent cropping
// // //                             onClick={closeImagePreview}
// // //                         />
// // //                         <button
// // //                             onClick={closeImagePreview}
// // //                             className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white cursor-pointer rounded-full p-2 hover:bg-opacity-70"
// // //                         >
// // //                             <XCircle size={24} />
// // //                         </button>
// // //                     </div>
// // //                 </div>
// // //             )}
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;







// // // // client/app/ChatWindow.tsx
// // // 'use client';

// // // import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
// // // import { useRouter } from 'next/navigation';
// // // import Image from 'next/image';
// // // import { XCircle, Send, Paperclip, ChevronLeft, MoreVertical, ZoomIn } from 'lucide-react';
// // // import MessageBubble from '../components/MessageBubble';
// // // import { useAuth } from './AuthProvider'; // Assuming you have this context
// // // import DeleteConfirmationModal from '../components/DeleteConfirmationModal'; // Import the modal
// // // import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

// // // // You might need to install socket.io-client: npm install socket.io-client
// // // import io from 'socket.io-client';

// // // // Define the base URL for your API
// // // const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
// // // const UPLOADS_BASE_URL = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || 'http://localhost:5000/uploads';


// // // interface User {
// // //     _id: string;
// // //     username: string;
// // //     avatarUrl?: string;
// // //     // Add other user properties you expect
// // // }

// // // interface Message {
// // //     _id: string;
// // //     sender: User;
// // //     content?: string;
// // //     mediaUrl?: string;
// // //     mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     createdAt: string;
// // //     isDeleted?: boolean;
// // //     isEdited?: boolean; 
// // // }

// // // interface Conversation {
// // //     _id: string;
// // //     participants: User[];
// // //     lastMessage?: {
// // //         sender: string;
// // //         content: string;
// // //         createdAt: string;
// // //         mediaType?: 'image' | 'video' | 'audio' | 'file'; // Add mediaType here
// // //     };
// // // }

// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: User | null; // The user you are chatting with
// // //     currentUserId: string; // The currently logged-in user's ID
// // //     defaultAvatarUrl: string; // Default avatar for users without one
// // //     onMessageSent: () => void; // Callback to refresh conversations list after sending/deleting
// // // }

// // // const ChatWindow: React.FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const router = useRouter();
// // //     const messagesEndRef = useRef<HTMLDivElement>(null);

// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState<string>('');
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [sendingMessage, setSendingMessage] = useState<boolean>(false);
// // //     const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
// // //     const [error, setError] = useState<string | null>(null);
// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]); // Array of message IDs
// // //     const [showOptions, setShowOptions] = useState<boolean>(false); // For ellipsis menu
// // //     const [isFullScreenImage, setIsFullScreenImage] = useState<boolean>(false);
// // //     const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string>('');

// // //     // State for confirmation modals
// // //     const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
// // //     const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);


// // //     const getFullMediaUrl = useCallback((relativePath: string) => {
// // //         return `${UPLOADS_BASE_URL}${relativePath}`;
// // //     }, []);

// // //     const onViewImage = useCallback((imageUrl: string) => {
// // //         setFullScreenImageUrl(imageUrl);
// // //         setIsFullScreenImage(true);
// // //     }, []);

// // //     const closeFullScreenImage = useCallback(() => {
// // //         setIsFullScreenImage(false);
// // //         setFullScreenImageUrl('');
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         // Clear file input if possible
// // //         const fileInput = document.getElementById('media-upload') as HTMLInputElement;
// // //         if (fileInput) {
// // //             fileInput.value = '';
// // //         }
// // //     }, []);

// // //     // Function to fetch messages or conversation details
// // //     const fetchMessages = useCallback(async (shouldScrollToBottom = true) => {
// // //         if (!chatUser?._id || !currentUserId) return;

// // //         setLoadingMessages(true);
// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             // First, find or create the conversation
// // //             const conversationResponse = await fetch(`${API_BASE_URL}/chats/conversations/findOrCreate`, {
// // //                 method: 'POST',
// // //                 headers: {
// // //                     'Content-Type': 'application/json',
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //                 body: JSON.stringify({
// // //                     participant1Id: currentUserId,
// // //                     participant2Id: chatUser._id,
// // //                 }),
// // //             });

// // //             if (!conversationResponse.ok) {
// // //                 const errorData = await conversationResponse.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to get conversation.');
// // //             }

// // //             const conversationData = await conversationResponse.json();
// // //             setCurrentConversationId(conversationData.conversation._id);

// // //             // Then, fetch messages for that conversation
// // //             const messagesResponse = await fetch(`${API_BASE_URL}/chats/messages/${conversationData.conversation._id}`, {
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //             });

// // //             if (!messagesResponse.ok) {
// // //                 const errorData = await messagesResponse.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to fetch messages.');
// // //             }

// // //             const messagesData = await messagesResponse.json();
// // //             setMessages(messagesData.messages);

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //             setMessages([]); // Clear messages on error
// // //         } finally {
// // //             setLoadingMessages(false);
// // //             if (shouldScrollToBottom) {
// // //                 setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
// // //             }
// // //         }
// // //     }, [chatUser, currentUserId, getIdToken]);

// // //     // Initial load and when chatUser changes
// // //     useEffect(() => {
// // //         if (isOpen && chatUser) {
// // //             fetchMessages();
// // //         } else if (!isOpen) {
// // //             // Reset states when chat window closes
// // //             setMessages([]);
// // //             setNewMessageContent('');
// // //             setSelectedMedia(null);
// // //             setSendingMessage(false);
// // //             setError(null);
// // //             setCurrentConversationId(null);
// // //             setSelectedMessages([]);
// // //             setShowOptions(false);
// // //             setIsFullScreenImage(false);
// // //             setFullScreenImageUrl('');
// // //         }
// // //     }, [isOpen, chatUser, fetchMessages]);

// // //     // Scroll to bottom when messages update
// // //     useEffect(() => {
// // //         if (isOpen) {
// // //             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //         }
// // //     }, [messages, isOpen]);


// // //     // Socket.IO setup
// // //     useEffect(() => {
// // //         if (!isOpen || !currentConversationId) return;

// // //         const socket = io(API_BASE_URL, {
// // //             auth: { token: getIdToken() } // Assuming getIdToken returns a Promise<string | null>
// // //         });

// // //         // Event listener for new messages
// // //         socket.on('newMessage', (newMessage: Message) => {
// // //             setMessages(prevMessages => {
// // //                 // Prevent adding duplicates: check if a message with this ID already exists
// // //                 const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
// // //                 if (!messageExists) {
// // //                     return [...prevMessages, newMessage];
// // //                 }
// // //                 return prevMessages; // If it exists, return previous state unchanged
// // //             });
// // //             onMessageSent(); // To update conversation list with new last message
// // //         });

// // //         // Event listener for message edits
// // //         socket.on('messageEdited', (updatedMessage: Message) => {
// // //             setMessages(prevMessages =>
// // //                 prevMessages.map(msg =>
// // //                     msg._id === updatedMessage._id ? updatedMessage : msg
// // //                 )
// // //             );
// // //             onMessageSent(); // To update conversation list if last message was edited
// // //         });

// // //         // Event listener for message deletions
// // //         socket.on('messageDeleted', (deletedInfo: { messageId: string, conversationId: string, content: string, isDeleted: boolean, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'file' }) => {
// // //             setMessages(prevMessages =>
// // //                 prevMessages.map(msg =>
// // //                     msg._id === deletedInfo.messageId
// // //                         ? { ...msg, content: deletedInfo.content, isDeleted: deletedInfo.isDeleted, mediaUrl: deletedInfo.mediaUrl, mediaType: deletedInfo.mediaType }
// // //                         : msg
// // //                 )
// // //             );
// // //             onMessageSent(); // To update conversation list if last message was deleted
// // //         });

// // //         // Event listener for clear all messages
// // //         socket.on('messagesCleared', (clearInfo: { conversationId: string, clearedBy: string }) => {
// // //              // Only clear if it's the current conversation AND the user who initiated the clear (or clear for everyone)
// // //             if (clearInfo.conversationId === currentConversationId) {
// // //                 setMessages([]);
// // //                 toast.success('All messages in this chat have been cleared.');
// // //                 onMessageSent(); // To update conversation list
// // //             }
// // //         });


// // //         return () => {
// // //             socket.disconnect();
// // //         };
// // //     }, [isOpen, currentConversationId, getIdToken, onMessageSent]); // Re-run if these dependencies change


// // //     const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             setSelectedMedia(e.target.files[0]);
// // //             setNewMessageContent(''); // Clear text content if media is selected
// // //         }
// // //     };

// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault(); // Prevent default form submission

// // //         if (sendingMessage || (!newMessageContent.trim() && !selectedMedia)) {
// // //             return; // Don't send empty messages or if already sending
// // //         }

// // //         setSendingMessage(true);
// // //         setError(null);
// // //         let sentMessage: Message | null = null;

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const formData = new FormData();
// // //             formData.append('receiverId', chatUser?._id || '');
// // //             if (newMessageContent.trim()) {
// // //                 formData.append('content', newMessageContent.trim());
// // //             }
// // //             if (selectedMedia) {
// // //                 formData.append('media', selectedMedia);
// // //             }
// // //             if (currentConversationId) {
// // //                 formData.append('conversationId', currentConversationId);
// // //             }

// // //             const response = await fetch(`${API_BASE_URL}/chats/message`, {
// // //                 method: 'POST',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //                 body: formData,
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to send message.');
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             // Update conversation ID if it was a new conversation
// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             // Add the new message to the state, preventing duplicates
// // //             setMessages(prev => {
// // //                 const messageExists = prev.some(msg => msg._id === sentMessage!._id);
// // //                 if (!messageExists && !sentMessage!.isDeleted) {
// // //                     return [...prev, sentMessage!];
// // //                 }
// // //                 return prev;
// // //             });

// // //             setNewMessageContent(''); // Clear input
// // //             removeSelectedMedia(); // Clear selected media
// // //             onMessageSent(); // Notify parent to refresh conversation list
// // //             toast.success('Message sent!');

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     const toggleMessageSelection = useCallback((messageId: string) => {
// // //         setSelectedMessages(prevSelected =>
// // //             prevSelected.includes(messageId)
// // //                 ? prevSelected.filter(id => id !== messageId)
// // //                 : [...prevSelected, messageId]
// // //         );
// // //     }, []);

// // //     const handleDeleteSelectedMessages = useCallback(() => {
// // //         if (selectedMessages.length === 0) return;
// // //         setShowDeleteSelectedModal(true); // Show the confirmation modal
// // //     }, [selectedMessages]);

// // //     const confirmDeleteSelected = useCallback(async () => {
// // //         setShowDeleteSelectedModal(false); // Close modal
// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const results = await Promise.allSettled(
// // //                 selectedMessages.map(messageId =>
// // //                     fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                         method: 'DELETE',
// // //                         headers: { 'Authorization': `Bearer ${token}` },
// // //                     })
// // //                 )
// // //             );

// // //             const failedDeletions = results.filter(result => result.status === 'rejected' || !(result as PromiseFulfilledResult<Response>).value.ok);
// // //             const successfulDeletions = results.length - failedDeletions.length;

// // //             if (successfulDeletions > 0) {
// // //                 toast.success(`${successfulDeletions} message(s) deleted.`);
// // //             }
// // //             if (failedDeletions.length > 0) {
// // //                 // Fetch error message from failed responses if possible
// // //                 const errorMessages = await Promise.all(
// // //                     failedDeletions.map(async res => {
// // //                         if (res.status === 'fulfilled' && !res.value.ok) {
// // //                             const errorData = await res.value.json().catch(() => ({}));
// // //                             return errorData.message || 'Unknown error';
// // //                         }
// // //                         return (res as PromiseRejectedResult).reason?.message || 'Network error';
// // //                     })
// // //                 );
// // //                 toast.error(`Failed to delete ${failedDeletions.length} message(s). Reason: ${errorMessages.join(', ')}`);
// // //             }

// // //             await fetchMessages(false); // Re-fetch messages to reflect deletions, don't scroll
// // //             setSelectedMessages([]); // Clear selected messages
// // //             onMessageSent(); // Notify parent to refresh conversation list
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting selected messages:', err);
// // //             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //             setError(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //         }
// // //     }, [selectedMessages, getIdToken, fetchMessages, onMessageSent]);

// // //     const cancelDeleteSelected = useCallback(() => {
// // //         setShowDeleteSelectedModal(false);
// // //     }, []);


// // //     const handleDeleteAllMessages = useCallback(() => {
// // //         if (!currentConversationId) return;
// // //         setShowDeleteAllModal(true); // Show the confirmation modal
// // //     }, [currentConversationId]);

// // //     const confirmDeleteAll = useCallback(async () => {
// // //         setShowDeleteAllModal(false); // Close modal
// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// // //                 method: 'DELETE',
// // //                 headers: { 'Authorization': `Bearer ${token}` },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// // //             }

// // //             setMessages([]); // Clear all messages from UI
// // //             setSelectedMessages([]); // Clear any selected messages
// // //             onMessageSent(); // Notify parent to refresh conversation list
// // //             toast.success('All messages deleted successfully!');
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting all messages:', err);
// // //             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //             setError(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //         }
// // //     }, [currentConversationId, getIdToken, onMessageSent]);

// // //     const cancelDeleteAll = useCallback(() => {
// // //         setShowDeleteAllModal(false);
// // //     }, []);


// // //     if (!isOpen || !chatUser) {
// // //         return null;
// // //     }

// // //     return (
// // //         <div className="fixed inset-0 bg-white flex flex-col z-40 md:relative md:flex-grow md:rounded-lg md:shadow-lg md:overflow-hidden">
// // //             {/* Header */}
// // //             <div className="flex items-center justify-between p-4 bg-black text-white shadow-md z-10">
// // //                 <button onClick={onClose} className="md:hidden text-white">
// // //                     <ChevronLeft size={24} />
// // //                 </button>
// // //                 <div className="flex items-center flex-grow">
// // //                     <Image
// // //                         src={chatUser.avatarUrl ? getFullMediaUrl(chatUser.avatarUrl) : defaultAvatarUrl}
// // //                         alt={chatUser.username}
// // //                         width={40}
// // //                         height={40}
// // //                         className="rounded-full mr-3 object-cover"
// // //                     />
// // //                     <h2 className="text-xl font-semibold truncate">{chatUser.username}</h2>
// // //                 </div>
// // //                 <div className="relative">
// // //                     <button onClick={() => setShowOptions(!showOptions)} className="ml-4 text-white">
// // //                         <MoreVertical size={24} />
// // //                     </button>
// // //                     {showOptions && (
// // //                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
// // //                             {selectedMessages.length > 0 && (
// // //                                 <button
// // //                                     onClick={handleDeleteSelectedMessages}
// // //                                     className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
// // //                                 >
// // //                                     Delete Selected ({selectedMessages.length})
// // //                                 </button>
// // //                             )}
// // //                             <button
// // //                                 onClick={handleDeleteAllMessages}
// // //                                 className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
// // //                             >
// // //                                 Clear All Messages
// // //                             </button>
// // //                             {/* Add other options here if needed */}
// // //                         </div>
// // //                     )}
// // //                 </div>
// // //             </div>

// // //             {/* Messages Area */}
// // //             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
// // //                 {loadingMessages && <div className="text-center text-gray-500">Loading messages...</div>}
// // //                 {error && <div className="text-center text-red-500">{error}</div>}
// // //                 {!loadingMessages && messages.length === 0 && !error && (
// // //                     <div className="text-center text-gray-500">Say hi to {chatUser.username}!</div>
// // //                 )}
// // //                 {messages.map((message) => (
// // //                     <MessageBubble
// // //                         key={message._id} // Ensure unique keys
// // //                         message={message}
// // //                         isCurrentUser={message.sender._id === currentUserId}
// // //                         onSelect={toggleMessageSelection}
// // //                         isSelected={selectedMessages.includes(message._id)}
// // //                         getFullMediaUrl={getFullMediaUrl}
// // //                         onViewImage={onViewImage}
// // //                     />
// // //                 ))}
// // //                 <div ref={messagesEndRef} />
// // //             </div>

// // //             {/* Input Area */}
// // //             <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center shadow-md">
// // //                 {selectedMedia && (
// // //                     <div className="relative mr-2 p-2 bg-gray-100 rounded-lg flex items-center">
// // //                         <span className="text-sm text-gray-700 truncate max-w-[150px]">{selectedMedia.name}</span>
// // //                         <button
// // //                             type="button"
// // //                             onClick={removeSelectedMedia}
// // //                             className="ml-2 text-red-500 hover:text-red-700"
// // //                         >
// // //                             <XCircle size={18} />
// // //                         </button>
// // //                     </div>
// // //                 )}
// // //                 <label htmlFor="media-upload" className="cursor-pointer text-gray-500 hover:text-gray-700 mr-2">
// // //                     <Paperclip size={24} />
// // //                     <input
// // //                         id="media-upload"
// // //                         type="file"
// // //                         className="hidden"
// // //                         onChange={handleMediaChange}
// // //                         accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" // Allowed file types
// // //                     />
// // //                 </label>
// // //                 <input
// // //                     type="text"
// // //                     value={newMessageContent}
// // //                     onChange={(e) => setNewMessageContent(e.target.value)}
// // //                     placeholder={selectedMedia ? 'Add a caption (optional)' : 'Type a message...'}
// // //                     className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-100"
// // //                     disabled={sendingMessage}
// // //                 />
// // //                 <button
// // //                     type="submit"
// // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
// // //                     disabled={sendingMessage || (!newMessageContent.trim() && !selectedMedia)}
// // //                 >
// // //                     <Send size={24} />
// // //                 </button>
// // //             </form>

// // //             {/* Full Screen Image Modal */}
// // //             {isFullScreenImage && fullScreenImageUrl && (
// // //                 <div
// // //                     className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
// // //                     onClick={closeFullScreenImage}
// // //                 >
// // //                     <button
// // //                         onClick={closeFullScreenImage}
// // //                         className="absolute top-4 right-4 text-white text-3xl z-50"
// // //                     >
// // //                         &times;
// // //                     </button>
// // //                     <Image
// // //                         src={fullScreenImageUrl}
// // //                         alt="Full Screen"
// // //                         layout="fill"
// // //                         objectFit="contain"
// // //                         className="cursor-zoom-out"
// // //                     />
// // //                 </div>
// // //             )}

// // //             {/* Delete Selected Confirmation Modal */}
// // //             {showDeleteSelectedModal && (
// // //                 <DeleteConfirmationModal
// // //                     title="Delete Selected Messages"
// // //                     message={`Are you sure you want to delete ${selectedMessages.length} selected message(s)? Note: You can only delete messages sent by you.`}
// // //                     onConfirm={confirmDeleteSelected}
// // //                     onCancel={cancelDeleteSelected}
// // //                 />
// // //             )}

// // //             {/* Delete All Confirmation Modal */}
// // //             {showDeleteAllModal && (
// // //                 <DeleteConfirmationModal
// // //                     title="Clear All Messages"
// // //                     message="Are you sure you want to clear ALL messages in this conversation? This will clear the chat history for both participants."
// // //                     onConfirm={confirmDeleteAll}
// // //                     onCancel={cancelDeleteAll}
// // //                 />
// // //             )}

// // //             <Toaster position="top-center" reverseOrder={false} />
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;


// // // // client/components/ChatWindow.tsx
// // // 'use client';

// // // import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
// // // import { useRouter } from 'next/navigation';
// // // import Image from 'next/image';
// // // import { XCircle, Send, Paperclip, ChevronLeft, MoreVertical, ZoomIn, FileText } from 'lucide-react';
// // // import MessageBubble from './MessageBubble'; // Kept, but logic moved directly
// // // import { useAuth } from './AuthProvider';
// // // import DeleteConfirmationModal from './DeleteConfirmationModal';
// // // import toast, { Toaster } from 'react-hot-toast';
// // // import io from 'socket.io-client';
// // // import { format } from 'date-fns';

// // // import { GeneralUser as User } from '../app/statusViewer';

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
// // // const UPLOADS_BASE_URL = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL || 'http://localhost:5000/uploads';

// // // interface Message {
// // //     _id: string;
// // //     conversationId: string;
// // //     sender: User;
// // //     content?: string;
// // //     mediaUrl?: string;
// // //     mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     createdAt: string;
// // //     isDeleted?: boolean;
// // //     isEdited?: boolean;
// // // }

// // // interface Conversation {
// // //     _id: string;
// // //     participants: User[];
// // //     lastMessage?: {
// // //         sender: string;
// // //         content: string;
// // //         createdAt: string;
// // //         mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     };
// // // }

// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: User | null;
// // //     currentUserId: string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // // }

// // // const ChatWindow: React.FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const router = useRouter();
// // //     const messagesEndRef = useRef<HTMLDivElement>(null);

// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState<string>('');
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [sendingMessage, setSendingMessage] = useState<boolean>(false);
// // //     const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
// // //     const [error, setError] = useState<string | null>(null);
// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
// // //     const [showOptions, setShowOptions] = useState<boolean>(false);
// // //     const [isFullScreenImage, setIsFullScreenImage] = useState<boolean>(false);
// // //     const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string>('');

// // //     const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
// // //     const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);


// // //     const getFullMediaUrl = useCallback((relativePath?: string) => {
// // //         if (!relativePath) return defaultAvatarUrl;
// // //         return `${UPLOADS_BASE_URL}${relativePath}`;
// // //     }, [defaultAvatarUrl]);

// // //     const onViewImage = useCallback((imageUrl: string) => {
// // //         setFullScreenImageUrl(imageUrl);
// // //         setIsFullScreenImage(true);
// // //     }, []);

// // //     const closeFullScreenImage = useCallback(() => {
// // //         setIsFullScreenImage(false);
// // //         setFullScreenImageUrl('');
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         const fileInput = document.getElementById('media-upload') as HTMLInputElement;
// // //         if (fileInput) {
// // //             fileInput.value = '';
// // //         }
// // //     }, []);

// // //     const fetchMessages = useCallback(async (shouldScrollToBottom = true) => {
// // //         if (!chatUser?._id || !currentUserId) return;

// // //         setLoadingMessages(true);
// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const conversationResponse = await fetch(`${API_BASE_URL}/chats/conversations/findOrCreate`, {
// // //                 method: 'POST',
// // //                 headers: {
// // //                     'Content-Type': 'application/json',
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //                 body: JSON.stringify({
// // //                     participant1Id: currentUserId,
// // //                     participant2Id: chatUser._id,
// // //                 }),
// // //             });

// // //             if (!conversationResponse.ok) {
// // //                 const errorData = await conversationResponse.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to get conversation.');
// // //             }

// // //             const conversationData = await conversationResponse.json();
// // //             setCurrentConversationId(conversationData.conversation._id);

// // //             const messagesResponse = await fetch(`${API_BASE_URL}/chats/messages/${conversationData.conversation._id}`, {
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //             });

// // //             if (!messagesResponse.ok) {
// // //                 const errorData = await messagesResponse.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to fetch messages.');
// // //             }

// // //             const messagesData = await messagesResponse.json();
// // //             setMessages(messagesData.messages);

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //             setMessages([]);
// // //         } finally {
// // //             setLoadingMessages(false);
// // //             if (shouldScrollToBottom) {
// // //                 setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
// // //             }
// // //         }
// // //     }, [chatUser, currentUserId, getIdToken]);

// // //     useEffect(() => {
// // //         if (isOpen && chatUser) {
// // //             fetchMessages();
// // //         } else if (!isOpen) {
// // //             setMessages([]);
// // //             setNewMessageContent('');
// // //             setSelectedMedia(null);
// // //             setSendingMessage(false);
// // //             setError(null);
// // //             setCurrentConversationId(null);
// // //             setSelectedMessages([]);
// // //             setShowOptions(false);
// // //             setIsFullScreenImage(false);
// // //             setFullScreenImageUrl('');
// // //         }
// // //     }, [isOpen, chatUser, fetchMessages]);

// // //     useEffect(() => {
// // //         if (isOpen) {
// // //             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// // //         }
// // //     }, [messages, isOpen]);

// // //     useEffect(() => {
// // //         if (!isOpen || !currentConversationId) return;

// // //         const setupSocket = async () => {
// // //             const token = await getIdToken();
// // //             const socket = io(API_BASE_URL, {
// // //                 auth: { token: token }
// // //             });

// // //             socket.on('newMessage', (newMessage: Message) => {
// // //                 setMessages(prevMessages => {
// // //                     const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
// // //                     if (!messageExists) {
// // //                         return [...prevMessages, newMessage];
// // //                     }
// // //                     return prevMessages;
// // //                 });
// // //                 onMessageSent();
// // //             });

// // //             socket.on('messageEdited', (updatedMessage: Message) => {
// // //                 setMessages(prevMessages =>
// // //                     prevMessages.map(msg =>
// // //                         msg._id === updatedMessage._id ? updatedMessage : msg
// // //                     )
// // //                 );
// // //                 onMessageSent();
// // //             });

// // //             socket.on('messageDeleted', (deletedInfo: { messageId: string, conversationId: string, content: string, isDeleted: boolean, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'file' }) => {
// // //                 setMessages(prevMessages =>
// // //                     prevMessages.map(msg =>
// // //                         msg._id === deletedInfo.messageId
// // //                             ? { ...msg, content: deletedInfo.content, isDeleted: deletedInfo.isDeleted, mediaUrl: deletedInfo.mediaUrl, mediaType: deletedInfo.mediaType }
// // //                             : msg
// // //                     )
// // //                 );
// // //                 onMessageSent();
// // //             });

// // //             socket.on('messagesCleared', (clearInfo: { conversationId: string, clearedBy: string }) => {
// // //                 if (clearInfo.conversationId === currentConversationId) {
// // //                     setMessages([]);
// // //                     toast.success('All messages in this chat have been cleared.');
// // //                     onMessageSent();
// // //                 }
// // //             });

// // //             return () => {
// // //                 socket.disconnect();
// // //             };
// // //         };

// // //         setupSocket();

// // //     }, [isOpen, currentConversationId, getIdToken, onMessageSent]);

// // //     const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             setSelectedMedia(e.target.files[0]);
// // //             setNewMessageContent('');
// // //         }
// // //     };

// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();

// // //         if (sendingMessage || (!newMessageContent.trim() && !selectedMedia)) {
// // //             return;
// // //         }

// // //         setSendingMessage(true);
// // //         setError(null);
// // //         let sentMessage: Message | null = null;

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const formData = new FormData();
// // //             formData.append('receiverId', chatUser?._id || '');
// // //             if (newMessageContent.trim()) {
// // //                 formData.append('content', newMessageContent.trim());
// // //             }
// // //             if (selectedMedia) {
// // //                 formData.append('media', selectedMedia);
// // //             }
// // //             if (currentConversationId) {
// // //                 formData.append('conversationId', currentConversationId);
// // //             }

// // //             const response = await fetch(`${API_BASE_URL}/chats/message`, {
// // //                 method: 'POST',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                 },
// // //                 body: formData,
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to send message.');
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             setMessages(prev => {
// // //                 const messageExists = prev.some(msg => msg._id === sentMessage!._id);
// // //                 if (!messageExists && !sentMessage!.isDeleted) {
// // //                     return [...prev, sentMessage!];
// // //                 }
// // //                 return prev;
// // //             });

// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent();
// // //             toast.success('Message sent!');

// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     const toggleMessageSelection = useCallback((messageId: string) => {
// // //         setSelectedMessages(prevSelected =>
// // //             prevSelected.includes(messageId)
// // //                 ? prevSelected.filter(id => id !== messageId)
// // //                 : [...prevSelected, messageId]
// // //         );
// // //     }, []);

// // //     const handleDeleteSelectedMessages = useCallback(() => {
// // //         if (selectedMessages.length === 0) return;
// // //         setShowDeleteSelectedModal(true);
// // //     }, [selectedMessages]);

// // //     const confirmDeleteSelected = useCallback(async () => {
// // //         setShowDeleteSelectedModal(false);
// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const results = await Promise.allSettled(
// // //                 selectedMessages.map(messageId =>
// // //                     fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                         method: 'DELETE',
// // //                         headers: { 'Authorization': `Bearer ${token}` },
// // //                     })
// // //                 )
// // //             );

// // //             const failedDeletions = results.filter(result => result.status === 'rejected' || !(result as PromiseFulfilledResult<Response>).value.ok);
// // //             const successfulDeletions = results.length - failedDeletions.length;

// // //             if (successfulDeletions > 0) {
// // //                 toast.success(`${successfulDeletions} message(s) deleted.`);
// // //             }
// // //             if (failedDeletions.length > 0) {
// // //                 const errorMessages = await Promise.all(
// // //                     failedDeletions.map(async res => {
// // //                         if (res.status === 'fulfilled' && !res.value.ok) {
// // //                             const errorData = await res.value.json().catch(() => ({}));
// // //                             return errorData.message || 'Unknown error';
// // //                         }
// // //                         return (res as PromiseRejectedResult).reason?.message || 'Network error';
// // //                     })
// // //                 );
// // //                 toast.error(`Failed to delete ${failedDeletions.length} message(s). Reason: ${errorMessages.join(', ')}`);
// // //             }

// // //             await fetchMessages(false);
// // //             setSelectedMessages([]);
// // //             onMessageSent();
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting selected messages:', err);
// // //             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //             setError(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //         }
// // //     }, [selectedMessages, getIdToken, fetchMessages, onMessageSent]);

// // //     const cancelDeleteSelected = useCallback(() => {
// // //         setShowDeleteSelectedModal(false);
// // //     }, []);


// // //     const handleDeleteAllMessages = useCallback(() => {
// // //         if (!currentConversationId) return;
// // //         setShowDeleteAllModal(true);
// // //     }, [currentConversationId]);

// // //     const confirmDeleteAll = useCallback(async () => {
// // //         setShowDeleteAllModal(false);
// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// // //                 method: 'DELETE',
// // //                 headers: { 'Authorization': `Bearer ${token}` },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// // //             }

// // //             setMessages([]);
// // //             setSelectedMessages([]);
// // //             onMessageSent();
// // //             toast.success('All messages deleted successfully!');
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting all messages:', err);
// // //             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //             setError(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //         }
// // //     }, [currentConversationId, getIdToken, onMessageSent]);

// // //     const cancelDeleteAll = useCallback(() => {
// // //         setShowDeleteAllModal(false);
// // //     }, []);


// // //     if (!isOpen || !chatUser) {
// // //         return null;
// // //     }

// // //     return (
// // //         <div className="fixed inset-0 bg-white flex flex-col z-40 md:relative md:flex-grow md:rounded-lg md:shadow-lg md:overflow-hidden">
// // //             {/* Header */}
// // //             <div className="flex items-center justify-between p-4 bg-blue-600 text-white shadow-md z-10">
// // //                 <button onClick={onClose} className="md:hidden text-white">
// // //                     <ChevronLeft size={24} />
// // //                 </button>
// // //                 <div className="flex items-center flex-grow">
// // //                     <Image
// // //                         src={chatUser.avatarUrl ? getFullMediaUrl(chatUser.avatarUrl) : defaultAvatarUrl}
// // //                         alt={chatUser.username ? `${chatUser.username}'s avatar` : 'User avatar'} // Fixed: Added alt
// // //                         width={40}
// // //                         height={40}
// // //                         className="rounded-full mr-3 object-cover"
// // //                     />
// // //                     <h2 className="text-xl font-semibold truncate">{chatUser.username}</h2>
// // //                 </div>
// // //                 <div className="relative">
// // //                     <button onClick={() => setShowOptions(!showOptions)} className="ml-4 text-white">
// // //                         <MoreVertical size={24} />
// // //                     </button>
// // //                     {showOptions && (
// // //                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
// // //                             {selectedMessages.length > 0 && (
// // //                                 <button
// // //                                     onClick={handleDeleteSelectedMessages}
// // //                                     className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
// // //                                 >
// // //                                     Delete Selected ({selectedMessages.length})
// // //                                 </button>
// // //                             )}
// // //                             <button
// // //                                 onClick={handleDeleteAllMessages}
// // //                                 className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
// // //                             >
// // //                                 Clear All Messages
// // //                             </button>
// // //                         </div>
// // //                     )}
// // //                 </div>
// // //             </div>

// // //             {/* Messages Area (Directly in ChatWindow) */}
// // //             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
// // //                 {loadingMessages && <div className="text-center text-gray-500">Loading messages...</div>}
// // //                 {error && <div className="text-center text-red-500">{error}</div>}
// // //                 {!loadingMessages && messages.length === 0 && !error && (
// // //                     <div className="text-center text-gray-500">Say hi to {chatUser.username}!</div>
// // //                 )}
// // //                 {messages.map((message) => {
// // //                     const isCurrentUser = message.sender._id === currentUserId;
// // //                     const messageDate = new Date(message.createdAt);
// // //                     const formattedTime = format(messageDate, 'hh:mm a');
// // //                     const formattedDate = format(messageDate, 'MMM dd, yyyy'); // Fixed typo in year format

// // //                     const bubbleClasses = `
// // //                         relative p-2 rounded-lg max-w-[75%] break-words shadow-sm
// // //                         ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
// // //                         ${message.isDeleted ? 'opacity-60 italic' : ''}
// // //                     `;

// // //                     const handleMediaClick = () => {
// // //                         if (message.mediaUrl && message.mediaType === 'image') {
// // //                             onViewImage(getFullMediaUrl(message.mediaUrl));
// // //                         }
// // //                         if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
// // //                             window.open(getFullMediaUrl(message.mediaUrl), '_blank');
// // //                         }
// // //                     };

// // //                     return (
// // //                         <div
// // //                             key={message._id}
// // //                             className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
// // //                             onClick={() => toggleMessageSelection(message._id)}
// // //                         >
// // //                             <div
// // //                                 className={`${bubbleClasses} ${selectedMessages.includes(message._id) ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
// // //                             >
// // //                                 {message.mediaUrl && (
// // //                                     <div
// // //                                         className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
// // //                                         onClick={handleMediaClick}
// // //                                     >
// // //                                         {message.mediaType === 'image' && (
// // //                                             <>
// // //                                                 <Image
// // //                                                     src={getFullMediaUrl(message.mediaUrl)}
// // //                                                     alt={message.content || "Sent image"} // Fixed: Added alt
// // //                                                     width={200}
// // //                                                     height={200}
// // //                                                     layout="responsive"
// // //                                                     objectFit="cover"
// // //                                                     className="rounded-lg max-h-[300px] w-auto h-auto"
// // //                                                 />
// // //                                                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
// // //                                                     <ZoomIn className="text-white text-3xl" />
// // //                                                 </div>
// // //                                             </>
// // //                                         )}
// // //                                         {message.mediaType === 'video' && (
// // //                                             <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
// // //                                                 <video
// // //                                                     src={getFullMediaUrl(message.mediaUrl)}
// // //                                                     controls
// // //                                                     className="max-h-full max-w-full rounded-lg"
// // //                                                 >
// // //                                                     Your browser does not support the video tag.
// // //                                                 </video>
// // //                                             </div>
// // //                                         )}
// // //                                         {message.mediaType === 'audio' && (
// // //                                             <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
// // //                                                 <audio controls className="w-full">
// // //                                                     <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
// // //                                                     Your browser does not support the audio element.
// // //                                                 </audio>
// // //                                             </div>
// // //                                         )}
// // //                                         {message.mediaType === 'file' && (
// // //                                             <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
// // //                                                 <FileText size={24} />
// // //                                                 <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
// // //                                             </div>
// // //                                         )}
// // //                                     </div>
// // //                                 )}

// // //                                 {message.content && (
// // //                                     <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
// // //                                         {message.content}
// // //                                     </p>
// // //                                 )}

// // //                                 <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} flex items-center justify-end w-full`}>
// // //                                     {message.isEdited && <span className="mr-1">(edited)</span>}
// // //                                     {formattedTime}
// // //                                 </div>
// // //                             </div>
// // //                             {selectedMessages.includes(message._id) && (
// // //                                 <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
// // //                                     {formattedDate}
// // //                                 </div>
// // //                             )}
// // //                         </div>
// // //                     );
// // //                 })}
// // //                 <div ref={messagesEndRef} />
// // //             </div>

// // //             {/* Input Area */}
// // //             <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center shadow-md">
// // //                 {selectedMedia && (
// // //                     <div className="relative mr-2 p-2 bg-gray-100 rounded-lg flex items-center">
// // //                         <span className="text-sm text-gray-700 truncate max-w-[150px]">{selectedMedia.name}</span>
// // //                         <button
// // //                             type="button"
// // //                             onClick={removeSelectedMedia}
// // //                             className="ml-2 text-red-500 hover:text-red-700"
// // //                         >
// // //                             <XCircle size={18} />
// // //                         </button>
// // //                     </div>
// // //                 )}
// // //                 <label htmlFor="media-upload" className="cursor-pointer text-gray-500 hover:text-gray-700 mr-2">
// // //                     <Paperclip size={24} />
// // //                     <input
// // //                         id="media-upload"
// // //                         type="file"
// // //                         className="hidden"
// // //                         onChange={handleMediaChange}
// // //                         accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
// // //                     />
// // //                 </label>
// // //                 <input
// // //                     type="text"
// // //                     value={newMessageContent}
// // //                     onChange={(e) => setNewMessageContent(e.target.value)}
// // //                     placeholder={selectedMedia ? 'Add a caption (optional)' : 'Type a message...'}
// // //                     className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-gray-100"
// // //                     disabled={sendingMessage}
// // //                 />
// // //                 <button
// // //                     type="submit"
// // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
// // //                     disabled={sendingMessage || (!newMessageContent.trim() && !selectedMedia)}
// // //                 >
// // //                     <Send size={24} />
// // //                 </button>
// // //             </form>

// // //             {/* Full Screen Image Modal */}
// // //             {isFullScreenImage && fullScreenImageUrl && (
// // //                 <div
// // //                     className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
// // //                     onClick={closeFullScreenImage}
// // //                 >
// // //                     <button
// // //                         onClick={closeFullScreenImage}
// // //                         className="absolute top-4 right-4 text-white text-3xl z-50"
// // //                     >
// // //                         &times;
// // //                     </button>
// // //                     <Image
// // //                         src={fullScreenImageUrl}
// // //                         alt="Full screen view of message media" // Fixed: Added alt
// // //                         layout="fill"
// // //                         objectFit="contain"
// // //                         className="cursor-zoom-out"
// // //                     />
// // //                 </div>
// // //             )}

// // //             {/* Delete Selected Confirmation Modal */}
// // //             {showDeleteSelectedModal && (
// // //                 <DeleteConfirmationModal
// // //                     title="Delete Selected Messages"
// // //                     message={`Are you sure you want to delete ${selectedMessages.length} selected message(s)? Note: You can only delete messages sent by you.`}
// // //                     onConfirm={confirmDeleteSelected}
// // //                     onCancel={cancelDeleteSelected}
// // //                 />
// // //             )}

// // //             {/* Delete All Confirmation Modal */}
// // //             {showDeleteAllModal && (
// // //                 <DeleteConfirmationModal
// // //                     title="Clear All Messages"
// // //                     message="Are you sure you want to clear ALL messages in this conversation? This will clear the chat history for both participants."
// // //                     onConfirm={confirmDeleteAll}
// // //                     onCancel={cancelDeleteAll}
// // //                 />
// // //             )}

// // //             <Toaster position="top-center" reverseOrder={false} />
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;






// // // yah bahut had tak sahi hain


// // // // app/ChatWindow.tsx (Main component)
// // // 'use client';

// // // import React, { useEffect, useState, useCallback, useRef } from 'react';
// // // import { useAuth } from './AuthProvider';
// // // import Skeleton from 'react-loading-skeleton';
// // // import 'react-loading-skeleton/dist/skeleton.css';
// // // import { format } from 'date-fns';

// // // import { User as GeneralUser } from './StatusViewer';
// // // import MediaPreview from './MediaPreview'; // Import the new MediaPreview component

// // // // Import the new sub-components
// // // import ChatHeader from './chatHeader';
// // // import MessageList from './MessageList';
// // // import ChatInput from './chatInput';
// // // import ImagePreviewModal from '../components/ImagePreviewModal';

// // // interface Message {
// // //     _id: string;
// // //     conversationId: string;
// // //     sender: GeneralUser;
// // //     receiver: string;
// // //     content: string;
// // //     mediaUrl?: string;
// // //     mediaType?: 'image' | 'video' | 'audio' | 'file';
// // //     createdAt: string;
// // //     updatedAt?: string;
// // //     isDeleted?: boolean; // Add this to your Message interface
// // // }

// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: GeneralUser;
// // //     currentUserId: string;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // // }

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // // const ChatWindow: React.FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState('');
// // //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// // //     const [sendingMessage, setSendingMessage] = useState(false);
// // //     const [error, setError] = useState<string | null>(null);

// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const hasFetchedInitialMessages = useRef(false);

// // //     // States for media upload
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// // //     const fileInputRef = useRef<HTMLInputElement>(null); // Still needed for programmatic click

// // //     // New state for image preview
// // //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// // //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// // //     // States for message editing
// // //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// // //     const [editedMessageContent, setEditedMessageContent] = useState('');
// // //     const [isEditing, setIsEditing] = useState(false); // To disable send button during edit

// // //     // New state for message selection
// // //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]); // Array of selected message IDs

// // //     // --- Message Selection Handlers ---
// // //     const handleSelectMessage = useCallback((messageId: string) => {
// // //         setSelectedMessages(prevSelected => {
// // //             if (prevSelected.includes(messageId)) {
// // //                 return prevSelected.filter(id => id !== messageId); // Deselect
// // //             } else {
// // //                 return [...prevSelected, messageId]; // Select
// // //             }
// // //         });
// // //     }, []);

// // //     const handleClearSelection = useCallback(() => {
// // //         setSelectedMessages([]);
// // //     }, []);

// // //     // --- Media Selection Handlers ---
// // //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             const file = e.target.files[0];

// // //             if (file.size > 20 * 1024 * 1024) {
// // //                 setError('File size exceeds 20MB limit.');
// // //                 setSelectedMedia(null);
// // //                 setMediaPreviewUrl(null);
// // //                 if (fileInputRef.current) fileInputRef.current.value = '';
// // //                 return;
// // //             }

// // //             setSelectedMedia(file);
// // //             setError(null);

// // //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// // //                 const reader = new FileReader();
// // //                 reader.onloadend = () => {
// // //                     setMediaPreviewUrl(reader.result as string);
// // //                 };
// // //                 reader.readAsDataURL(file);
// // //             } else {
// // //                 setMediaPreviewUrl(null);
// // //             }
// // //         }
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         setMediaPreviewUrl(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         setError(null);
// // //     }, []);

// // //     // --- Conversation ID Fetching ---
// // //     useEffect(() => {
// // //         const findConversationId = async () => {
// // //             if (!isOpen || !chatUser || !currentUserId) return;

// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             setError(null); // Clear previous errors

// // //             try {
// // //                 const token = await getIdToken();
// // //                 if (!token) throw new Error('Authentication required.');

// // //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });
// // //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// // //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// // //                 const existingConv = conversations.find(conv =>
// // //                     conv.otherParticipant?._id === chatUser._id
// // //                 );

// // //                 if (existingConv) {
// // //                     setCurrentConversationId(existingConv._id);
// // //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// // //                 } else {
// // //                     setCurrentConversationId(null);
// // //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// // //                 }
// // //             } catch (err) {
// // //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// // //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// // //                 setLoadingInitialMessages(false); // Ensure loading is off even if error finding conversation
// // //             }
// // //         };

// // //         if (isOpen) {
// // //             findConversationId();
// // //         }
// // //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// // //     // --- Message Fetching ---
// // //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// // //         if (!isOpen) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (!currentConversationId && !isInitialFetch) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (isInitialFetch) {
// // //             setLoadingInitialMessages(true);
// // //             setError(null);
// // //         }

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             if (currentConversationId) {
// // //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });

// // //                 if (!response.ok) {
// // //                     const errorData = await response.json().catch(() => ({}));
// // //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// // //                 }

// // //                 const data: Message[] = await response.json();
// // //                 // Filter out soft-deleted messages for display
// // //                 setMessages(data.filter(msg => !msg.isDeleted));
// // //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// // //             } else {
// // //                 setMessages([]);
// // //             }
// // //             hasFetchedInitialMessages.current = true;
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //         } finally {
// // //             if (isInitialFetch) {
// // //                 setLoadingInitialMessages(false);
// // //             }
// // //         }
// // //     }, [isOpen, currentConversationId, getIdToken]);

// // //     useEffect(() => {
// // //         let interval: NodeJS.Timeout;

// // //         if (isOpen) {
// // //             // Fetch immediately, then set up interval
// // //             fetchMessages(true);
// // //             interval = setInterval(() => {
// // //                 fetchMessages(false);
// // //             }, 5000);
// // //         } else {
// // //             // Clear interval and reset states when chat window is closed
// // //             clearInterval(interval);
// // //             setMessages([]);
// // //             setCurrentConversationId(null);
// // //             setNewMessageContent('');
// // //             setSelectedMedia(null);
// // //             setMediaPreviewUrl(null);
// // //             setIsImagePreviewOpen(false);
// // //             setPreviewImageUrl(null);
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setIsEditing(false);
// // //             setError(null);
// // //             setLoadingInitialMessages(true);
// // //             setSelectedMessages([]); // Clear selected messages
// // //             hasFetchedInitialMessages.current = false;
// // //         }

// // //         return () => clearInterval(interval);
// // //     }, [isOpen, currentConversationId, fetchMessages]);

// // //     // --- Message Sending Handler ---
// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();
// // //         const textContent = newMessageContent.trim();

// // //         if (!textContent && !selectedMedia) {
// // //             setError('Please type a message or select a file.');
// // //             return;
// // //         }
// // //         if (sendingMessage) return;

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             let response;
// // //             let sentMessage: Message;

// // //             if (selectedMedia) {
// // //                 const formData = new FormData();
// // //                 formData.append('media', selectedMedia);
// // //                 if (textContent) {
// // //                     formData.append('content', textContent);
// // //                 }

// // //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                     },
// // //                     body: formData,
// // //                 });
// // //             } else {
// // //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         'Content-Type': 'application/json',
// // //                     },
// // //                     body: JSON.stringify({ content: textContent }),
// // //                 });
// // //             }

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// // //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             // Only add if not deleted, though new messages shouldn't be deleted
// // //             if (!sentMessage.isDeleted) {
// // //                 setMessages(prev => [...prev, sentMessage]);
// // //             }
// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent(); // Trigger conversation list update
// // //             setSelectedMessages([]); // Clear selection after sending
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     // --- Message Editing Handlers ---
// // //     const handleEditClick = useCallback((message: Message) => {
// // //         // setContextMenu(null); // No context menu with new selection
// // //         setSelectedMessages([message._id]); // Select only the message being edited
// // //         setEditingMessageId(message._id);
// // //         setEditedMessageContent(message.content || '');
// // //         setNewMessageContent(message.content || ''); // Populate input with current content
// // //         setIsEditing(true);
// // //         removeSelectedMedia(); // Clear any selected media when editing
// // //     }, [removeSelectedMedia]);

// // //     const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
// // //         e.preventDefault();
// // //         if (!editingMessageId || isEditing) return;

// // //         const contentToSave = editedMessageContent.trim();
// // //         if (!contentToSave) {
// // //             setError('Message content cannot be empty.');
// // //             return;
// // //         }

// // //         setIsEditing(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// // //                 method: 'PUT',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                     'Content-Type': 'application/json',
// // //                 },
// // //                 body: JSON.stringify({ content: contentToSave }),
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to edit message.');
// // //             }

// // //             const updatedMessage: Message = await response.json();
// // //             setMessages(prevMessages =>
// // //                 prevMessages.map(msg =>
// // //                     msg._id === editingMessageId ? { ...msg, content: updatedMessage.content, updatedAt: updatedMessage.updatedAt } : msg
// // //                 )
// // //             );
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setNewMessageContent('');
// // //             setSelectedMessages([]); // Clear selection after editing
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error editing message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to edit message.');
// // //         } finally {
// // //             setIsEditing(false);
// // //         }
// // //     }, [editingMessageId, editedMessageContent, getIdToken, isEditing]);

// // //     const handleCancelEdit = useCallback(() => {
// // //         setEditingMessageId(null);
// // //         setEditedMessageContent('');
// // //         setNewMessageContent('');
// // //         setIsEditing(false);
// // //         setSelectedMessages([]); // Clear selection when canceling edit
// // //     }, []);

// // //     // --- Message Deletion Handlers ---
// // //     const handleDeleteSelectedMessages = useCallback(async () => {
// // //         if (selectedMessages.length === 0) return;

// // //         if (!window.confirm(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`)) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const results = await Promise.allSettled(
// // //                 selectedMessages.map(messageId =>
// // //                     fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                         method: 'DELETE',
// // //                         headers: { 'Authorization': `Bearer ${token}` },
// // //                     })
// // //                 )
// // //             );

// // //             const failedDeletions = results.filter(result => result.status === 'rejected' || (result as PromiseFulfilledResult<Response>).value.ok === false);

// // //             if (failedDeletions.length > 0) {
// // //                 setError(`Failed to delete ${failedDeletions.length} message(s).`);
// // //             } else {
// // //                 setError(null); // Clear any previous error
// // //             }

// // //             // Refetch messages to get the updated state (including soft deletes)
// // //             await fetchMessages(false);
// // //             setSelectedMessages([]); // Clear selection after deletion attempt
// // //             onMessageSent(); // To update conversation list if last message(s) were deleted
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting selected messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //         }
// // //     }, [selectedMessages, getIdToken, fetchMessages, onMessageSent]);

// // //     const handleDeleteAllMessages = useCallback(async () => {
// // //         if (!currentConversationId) return;

// // //         if (!window.confirm('Are you sure you want to delete ALL messages in this conversation? This action cannot be undone.')) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// // //                 method: 'DELETE',
// // //                 headers: { 'Authorization': `Bearer ${token}` },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// // //             }

// // //             setMessages([]); // Clear all messages from UI immediately
// // //             setSelectedMessages([]); // Clear any selected messages
// // //             onMessageSent(); // To update conversation list

// // //             alert('All messages deleted successfully.');
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting all messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //         }
// // //     }, [currentConversationId, getIdToken, onMessageSent]);


// // //     // --- Image Preview Handlers ---
// // //     const openImagePreview = useCallback((imageUrl: string) => {
// // //         setPreviewImageUrl(imageUrl);
// // //         setIsImagePreviewOpen(true);
// // //     }, []);

// // //     const closeImagePreview = useCallback(() => {
// // //         setIsImagePreviewOpen(false);
// // //         setPreviewImageUrl(null);
// // //     }, []);

// // //     if (!isOpen) return null;

// // //     return (
// // //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// // //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// // //                 {/* Header */}
// // //                 <ChatHeader
// // //                     chatUser={chatUser}
// // //                     defaultAvatarUrl={defaultAvatarUrl}
// // //                     getFullMediaUrl={getFullMediaUrl}
// // //                     onClose={onClose}
// // //                     showActionsMenu={selectedMessages.length > 0} // Show menu only if messages are selected
// // //                     onDeleteSelected={handleDeleteSelectedMessages}
// // //                     onDeleteAll={handleDeleteAllMessages}
// // //                     onClearSelection={handleClearSelection}
// // //                 />

// // //                 {/* Messages Area */}
// // //                 <MessageList
// // //                     messages={messages}
// // //                     loading={loadingInitialMessages}
// // //                     error={error}
// // //                     currentUserId={currentUserId}
// // //                     getFullMediaUrl={getFullMediaUrl}
// // //                     defaultAvatarUrl={defaultAvatarUrl}
// // //                     onOpenImagePreview={openImagePreview}
// // //                     selectedMessages={selectedMessages}
// // //                     onSelectMessage={handleSelectMessage}
// // //                 />

// // //                 {/* Message Input and Attachment Button */}
// // //                 <ChatInput
// // //                     newMessageContent={newMessageContent}
// // //                     setNewMessageContent={setNewMessageContent}
// // //                     selectedMedia={selectedMedia}
// // //                     mediaPreviewUrl={mediaPreviewUrl}
// // //                     removeSelectedMedia={removeSelectedMedia}
// // //                     error={error} // Pass error state to ChatInput
// // //                     isEditing={isEditing}
// // //                     editingMessageId={editingMessageId}
// // //                     editedMessageContent={editedMessageContent}
// // //                     setEditedMessageContent={setEditedMessageContent}
// // //                     sendingMessage={sendingMessage}
// // //                     handleSendMessage={handleSendMessage}
// // //                     handleSaveEdit={handleSaveEdit}
// // //                     handleCancelEdit={handleCancelEdit}
// // //                     handleFileChange={(e) => {
// // //                         // Clear selection when attempting to send new message/media
// // //                         if (!editingMessageId) setSelectedMessages([]);
// // //                         handleFileChange(e);
// // //                     }}
// // //                 />
// // //             </div>

// // //             {/* Image Preview Modal */}
// // //             <ImagePreviewModal
// // //                 imageUrl={previewImageUrl}
// // //                 onClose={closeImagePreview}
// // //             />
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;

// // // // app/ChatWindow.tsx
// // // 'use client';

// // // import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// // // import { useAuth } from './AuthProvider';
// // // import Skeleton from 'react-loading-skeleton';
// // // import 'react-loading-skeleton/dist/skeleton.css';
// // // import { format } from 'date-fns';

// // // // Import types from the shared file
// // // import { Message, GeneralUser } from '../app/types';

// // // // Import the new sub-components
// // // import ChatHeader from './chatHeader';
// // // import MessageList from './MessageList';
// // // import ChatInput from './chatInput';
// // // import ImagePreviewModal from '../components/ImagePreviewModal';
// // // import MediaPreview from './MediaPreview'; // Ensure this is a valid path if used directly

// // // // Define the props for ChatWindow
// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: GeneralUser;
// // //     currentUserId: string;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // // }

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // // const ChatWindow: FC<ChatWindowProps> = ({ // Explicitly type as FC
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState('');
// // //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// // //     const [sendingMessage, setSendingMessage] = useState(false);
// // //     const [error, setError] = useState<string | null>(null);

// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const hasFetchedInitialMessages = useRef(false);

// // //     // States for media upload
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// // //     const fileInputRef = useRef<HTMLInputElement>(null);

// // //     // New state for image preview
// // //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// // //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// // //     // States for message editing
// // //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// // //     const [editedMessageContent, setEditedMessageContent] = useState('');
// // //     const [isEditing, setIsEditing] = useState(false); // To disable send button during edit

// // //     // New state for message selection
// // //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]); // Array of selected message IDs

// // //     // --- Message Selection Handlers ---
// // //     const handleSelectMessage = useCallback((messageId: string) => {
// // //         setSelectedMessages(prevSelected => {
// // //             if (prevSelected.includes(messageId)) {
// // //                 return prevSelected.filter(id => id !== messageId); // Deselect
// // //             } else {
// // //                 return [...prevSelected, messageId]; // Select
// // //             }
// // //         });
// // //     }, []);

// // //     const handleClearSelection = useCallback(() => {
// // //         setSelectedMessages([]);
// // //     }, []);

// // //     // --- Media Selection Handlers ---
// // //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             const file = e.target.files[0];

// // //             if (file.size > 20 * 1024 * 1024) {
// // //                 setError('File size exceeds 20MB limit.');
// // //                 setSelectedMedia(null);
// // //                 setMediaPreviewUrl(null);
// // //                 if (fileInputRef.current) fileInputRef.current.value = '';
// // //                 return;
// // //             }

// // //             setSelectedMedia(file);
// // //             setError(null);

// // //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// // //                 const reader = new FileReader();
// // //                 reader.onloadend = () => {
// // //                     setMediaPreviewUrl(reader.result as string);
// // //                 };
// // //                 reader.readAsDataURL(file);
// // //             } else {
// // //                 setMediaPreviewUrl(null);
// // //             }
// // //         }
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         setMediaPreviewUrl(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         setError(null);
// // //     }, []);

// // //     // --- Conversation ID Fetching ---
// // //     useEffect(() => {
// // //         const findConversationId = async () => {
// // //             if (!isOpen || !chatUser || !currentUserId) return;

// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             setError(null); // Clear previous errors

// // //             try {
// // //                 const token = await getIdToken();
// // //                 if (!token) throw new Error('Authentication required.');

// // //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });
// // //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// // //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// // //                 const existingConv = conversations.find(conv =>
// // //                     conv.otherParticipant?._id === chatUser._id
// // //                 );

// // //                 if (existingConv) {
// // //                     setCurrentConversationId(existingConv._id);
// // //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// // //                 } else {
// // //                     setCurrentConversationId(null);
// // //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.username}.`);
// // //                 }
// // //             } catch (err) {
// // //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// // //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// // //                 setLoadingInitialMessages(false); // Ensure loading is off even if error finding conversation
// // //             }
// // //         };

// // //         if (isOpen) {
// // //             findConversationId();
// // //         }
// // //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// // //     // --- Message Fetching ---
// // //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// // //         if (!isOpen) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (!currentConversationId && !isInitialFetch) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (isInitialFetch) {
// // //             setLoadingInitialMessages(true);
// // //             setError(null);
// // //         }

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             if (currentConversationId) {
// // //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });

// // //                 if (!response.ok) {
// // //                     const errorData = await response.json().catch(() => ({}));
// // //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// // //                 }

// // //                 const data: Message[] = await response.json();
// // //                 // Filter out soft-deleted messages for display
// // //                 setMessages(data.filter(msg => !msg.isDeleted));
// // //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// // //             } else {
// // //                 setMessages([]);
// // //             }
// // //             hasFetchedInitialMessages.current = true;
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //         } finally {
// // //             if (isInitialFetch) {
// // //                 setLoadingInitialMessages(false);
// // //             }
// // //         }
// // //     }, [isOpen, currentConversationId, getIdToken]);

// // //     useEffect(() => {
// // //         let interval: NodeJS.Timeout;

// // //         if (isOpen) {
// // //             // Fetch immediately, then set up interval
// // //             fetchMessages(true);
// // //             interval = setInterval(() => {
// // //                 fetchMessages(false);
// // //             }, 5000);
// // //         } else {
// // //             // Clear interval and reset states when chat window is closed
// // //             clearInterval(interval);
// // //             setMessages([]);
// // //             setCurrentConversationId(null);
// // //             setNewMessageContent('');
// // //             setSelectedMedia(null);
// // //             setMediaPreviewUrl(null);
// // //             setIsImagePreviewOpen(false);
// // //             setPreviewImageUrl(null);
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setIsEditing(false);
// // //             setError(null);
// // //             setLoadingInitialMessages(true);
// // //             setSelectedMessages([]); // Clear selected messages
// // //             hasFetchedInitialMessages.current = false;
// // //         }

// // //         return () => clearInterval(interval);
// // //     }, [isOpen, currentConversationId, fetchMessages]);

// // //     // --- Message Sending Handler ---
// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();
// // //         const textContent = newMessageContent.trim();

// // //         if (!textContent && !selectedMedia) {
// // //             setError('Please type a message or select a file.');
// // //             return;
// // //         }
// // //         if (sendingMessage) return;

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             let response;
// // //             let sentMessage: Message;

// // //             if (selectedMedia) {
// // //                 const formData = new FormData();
// // //                 formData.append('media', selectedMedia);
// // //                 if (textContent) {
// // //                     formData.append('content', textContent);
// // //                 }

// // //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                     },
// // //                     body: formData,
// // //                 });
// // //             } else {
// // //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         'Content-Type': 'application/json',
// // //                     },
// // //                     body: JSON.stringify({ content: textContent }),
// // //                 });
// // //             }

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// // //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             // Only add if not deleted, though new messages shouldn't be deleted
// // //             if (!sentMessage.isDeleted) {
// // //                 setMessages(prev => [...prev, sentMessage]);
// // //             }
// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent(); // Trigger conversation list update
// // //             setSelectedMessages([]); // Clear selection after sending
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     // --- Message Editing Handlers ---
// // //     const handleEditClick = useCallback((message: Message) => {
// // //         setSelectedMessages([message._id]); // Select only the message being edited
// // //         setEditingMessageId(message._id);
// // //         setEditedMessageContent(message.content || '');
// // //         setNewMessageContent(message.content || ''); // Populate input with current content
// // //         setIsEditing(true);
// // //         removeSelectedMedia(); // Clear any selected media when editing
// // //     }, [removeSelectedMedia]);

// // //     const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
// // //         e.preventDefault();
// // //         if (!editingMessageId || isEditing) return;

// // //         const contentToSave = editedMessageContent.trim();
// // //         if (!contentToSave) {
// // //             setError('Message content cannot be empty.');
// // //             return;
// // //         }

// // //         setIsEditing(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// // //                 method: 'PUT',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                     'Content-Type': 'application/json',
// // //                 },
// // //                 body: JSON.stringify({ content: contentToSave }),
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to edit message.');
// // //             }

// // //             const updatedMessage: Message = await response.json();
// // //             setMessages(prevMessages =>
// // //                 prevMessages.map(msg =>
// // //                     msg._id === editingMessageId ? { ...msg, content: updatedMessage.content, updatedAt: updatedMessage.updatedAt, isEdited: true } : msg
// // //                 )
// // //             );
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setNewMessageContent('');
// // //             setSelectedMessages([]); // Clear selection after editing
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error editing message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to edit message.');
// // //         } finally {
// // //             setIsEditing(false);
// // //         }
// // //     }, [editingMessageId, editedMessageContent, getIdToken, isEditing]);

// // //     const handleCancelEdit = useCallback(() => {
// // //         setEditingMessageId(null);
// // //         setEditedMessageContent('');
// // //         setNewMessageContent('');
// // //         setIsEditing(false);
// // //         setSelectedMessages([]); // Clear selection when canceling edit
// // //     }, []);

// // //     // --- Message Deletion Handlers ---
// // //     const handleDeleteSelectedMessages = useCallback(async () => {
// // //         if (selectedMessages.length === 0) return;

// // //         if (!window.confirm(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`)) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const results = await Promise.allSettled(
// // //                 selectedMessages.map(messageId =>
// // //                     fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                         method: 'DELETE',
// // //                         headers: { 'Authorization': `Bearer ${token}` },
// // //                     })
// // //                 )
// // //             );

// // //             const failedDeletions = results.filter(result => result.status === 'rejected' || (result as PromiseFulfilledResult<Response>).value.ok === false);

// // //             if (failedDeletions.length > 0) {
// // //                 setError(`Failed to delete ${failedDeletions.length} message(s).`);
// // //             } else {
// // //                 setError(null); // Clear any previous error
// // //             }

// // //             // Refetch messages to get the updated state (including soft deletes)
// // //             await fetchMessages(false);
// // //             setSelectedMessages([]); // Clear selection after deletion attempt
// // //             onMessageSent(); // To update conversation list if last message(s) were deleted
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting selected messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //         }
// // //     }, [selectedMessages, getIdToken, fetchMessages, onMessageSent]);

// // //     const handleDeleteAllMessages = useCallback(async () => {
// // //         if (!currentConversationId) return;

// // //         if (!window.confirm('Are you sure you want to delete ALL messages in this conversation? This action cannot be undone.')) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// // //                 method: 'DELETE',
// // //                 headers: { 'Authorization': `Bearer ${token}` },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// // //             }

// // //             setMessages([]); // Clear all messages from UI immediately
// // //             setSelectedMessages([]); // Clear any selected messages
// // //             onMessageSent(); // To update conversation list

// // //             alert('All messages deleted successfully.');
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting all messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //         }
// // //     }, [currentConversationId, getIdToken, onMessageSent]);


// // //     // --- Image Preview Handlers ---
// // //     const openImagePreview = useCallback((imageUrl: string) => {
// // //         setPreviewImageUrl(imageUrl);
// // //         setIsImagePreviewOpen(true);
// // //     }, []);

// // //     const closeImagePreview = useCallback(() => {
// // //         setIsImagePreviewOpen(false);
// // //         setPreviewImageUrl(null);
// // //     }, []);

// // //     // If the chat window is not open, return null to render nothing
// // //     if (!isOpen) {
// // //         return null;
// // //     }

// // //     return (
// // //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// // //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// // //                 {/* Header */}
// // //                 <ChatHeader
// // //                     chatUser={chatUser}
// // //                     defaultAvatarUrl={defaultAvatarUrl}
// // //                     getFullMediaUrl={getFullMediaUrl}
// // //                     onClose={onClose}
// // //                     showActionsMenu={selectedMessages.length > 0} // Show menu only if messages are selected
// // //                     onDeleteSelected={handleDeleteSelectedMessages}
// // //                     onDeleteAll={handleDeleteAllMessages}
// // //                     onClearSelection={handleClearSelection}
// // //                 />

// // //                 {/* Messages Area */}
// // //                 <MessageList
// // //                     messages={messages}
// // //                     loading={loadingInitialMessages}
// // //                     error={error}
// // //                     currentUserId={currentUserId}
// // //                     getFullMediaUrl={getFullMediaUrl}
// // //                     defaultAvatarUrl={defaultAvatarUrl}
// // //                     onOpenImagePreview={openImagePreview}
// // //                     selectedMessages={selectedMessages}
// // //                     onSelectMessage={handleSelectMessage}
// // //                 />

// // //                 {/* Message Input and Attachment Button */}
// // //                 <ChatInput
// // //                     newMessageContent={newMessageContent}
// // //                     setNewMessageContent={setNewMessageContent}
// // //                     selectedMedia={selectedMedia}
// // //                     mediaPreviewUrl={mediaPreviewUrl}
// // //                     removeSelectedMedia={removeSelectedMedia}
// // //                     error={error} // Pass error state to ChatInput
// // //                     isEditing={isEditing}
// // //                     editingMessageId={editingMessageId}
// // //                     editedMessageContent={editedMessageContent}
// // //                     setEditedMessageContent={setEditedMessageContent}
// // //                     sendingMessage={sendingMessage}
// // //                     handleSendMessage={handleSendMessage}
// // //                     handleSaveEdit={handleSaveEdit}
// // //                     handleCancelEdit={handleCancelEdit}
// // //                     handleFileChange={(e) => {
// // //                         // Clear selection when attempting to send new message/media
// // //                         if (!editingMessageId) setSelectedMessages([]);
// // //                         handleFileChange(e);
// // //                     }}
// // //                 />
// // //             </div>

// // //             {/* Image Preview Modal */}
// // //             <ImagePreviewModal
// // //                 imageUrl={previewImageUrl}
// // //                 onClose={closeImagePreview}
// // //             />
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;





// // // // app/ChatWindow.tsx
// // // 'use client';

// // // import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// // // import { useAuth } from './AuthProvider';
// // // import Skeleton from 'react-loading-skeleton';
// // // import 'react-loading-skeleton/dist/skeleton.css';
// // // import { format } from 'date-fns';

// // // // Import types from the shared file
// // // import { Message, GeneralUser } from '../app/types'; // Ensure GeneralUser now includes 'name'

// // // // Import the new sub-components
// // // import ChatHeader from './chatHeader';
// // // import MessageList from './MessageList';
// // // import ChatInput from './chatInput';
// // // import ImagePreviewModal from '../components/ImagePreviewModal';
// // // import MediaPreview from './MediaPreview';

// // // // Define the props for ChatWindow
// // // interface ChatWindowProps {
// // //     isOpen: boolean;
// // //     onClose: () => void;
// // //     chatUser: GeneralUser; // This now correctly matches the updated GeneralUser
// // //     currentUserId: string;
// // //     getFullMediaUrl: (relativePath?: string) => string;
// // //     defaultAvatarUrl: string;
// // //     onMessageSent: () => void;
// // // }

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // // const ChatWindow: FC<ChatWindowProps> = ({
// // //     isOpen,
// // //     onClose,
// // //     chatUser,
// // //     currentUserId,
// // //     getFullMediaUrl,
// // //     defaultAvatarUrl,
// // //     onMessageSent,
// // // }) => {
// // //     const { getIdToken } = useAuth();
// // //     const [messages, setMessages] = useState<Message[]>([]);
// // //     const [newMessageContent, setNewMessageContent] = useState('');
// // //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// // //     const [sendingMessage, setSendingMessage] = useState(false);
// // //     const [error, setError] = useState<string | null>(null);

// // //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// // //     const hasFetchedInitialMessages = useRef(false);

// // //     // States for media upload
// // //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// // //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// // //     const fileInputRef = useRef<HTMLInputElement>(null);

// // //     // New state for image preview
// // //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// // //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// // //     // States for message editing
// // //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// // //     const [editedMessageContent, setEditedMessageContent] = useState('');
// // //     const [isEditing, setIsEditing] = useState(false); // To disable send button during edit

// // //     // New state for message selection
// // //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]); // Array of selected message IDs

// // //     // --- Message Selection Handlers ---
// // //     const handleSelectMessage = useCallback((messageId: string) => {
// // //         setSelectedMessages(prevSelected => {
// // //             if (prevSelected.includes(messageId)) {
// // //                 return prevSelected.filter(id => id !== messageId); // Deselect
// // //             } else {
// // //                 return [...prevSelected, messageId]; // Select
// // //             }
// // //         });
// // //     }, []);

// // //     const handleClearSelection = useCallback(() => {
// // //         setSelectedMessages([]);
// // //     }, []);

// // //     // --- Media Selection Handlers ---
// // //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// // //         if (e.target.files && e.target.files[0]) {
// // //             const file = e.target.files[0];

// // //             if (file.size > 20 * 1024 * 1024) {
// // //                 setError('File size exceeds 20MB limit.');
// // //                 setSelectedMedia(null);
// // //                 setMediaPreviewUrl(null);
// // //                 if (fileInputRef.current) fileInputRef.current.value = '';
// // //                 return;
// // //             }

// // //             setSelectedMedia(file);
// // //             setError(null);

// // //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// // //                 const reader = new FileReader();
// // //                 reader.onloadend = () => {
// // //                     setMediaPreviewUrl(reader.result as string);
// // //                 };
// // //                 reader.readAsDataURL(file);
// // //             } else {
// // //                 setMediaPreviewUrl(null);
// // //             }
// // //         }
// // //     }, []);

// // //     const removeSelectedMedia = useCallback(() => {
// // //         setSelectedMedia(null);
// // //         setMediaPreviewUrl(null);
// // //         if (fileInputRef.current) {
// // //             fileInputRef.current.value = '';
// // //         }
// // //         setError(null);
// // //     }, []);

// // //     // --- Conversation ID Fetching ---
// // //     useEffect(() => {
// // //         const findConversationId = async () => {
// // //             if (!isOpen || !chatUser || !currentUserId) return;

// // //             setLoadingInitialMessages(true);
// // //             hasFetchedInitialMessages.current = false;
// // //             setError(null); // Clear previous errors

// // //             try {
// // //                 const token = await getIdToken();
// // //                 if (!token) throw new Error('Authentication required.');

// // //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });
// // //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// // //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// // //                 const existingConv = conversations.find(conv =>
// // //                     conv.otherParticipant?._id === chatUser._id
// // //                 );

// // //                 if (existingConv) {
// // //                     setCurrentConversationId(existingConv._id);
// // //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// // //                 } else {
// // //                     setCurrentConversationId(null);
// // //                     // Using chatUser.name here as per the updated GeneralUser type
// // //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// // //                 }
// // //             } catch (err) {
// // //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// // //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// // //                 setLoadingInitialMessages(false); // Ensure loading is off even if error finding conversation
// // //             }
// // //         };

// // //         if (isOpen) {
// // //             findConversationId();
// // //         }
// // //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// // //     // --- Message Fetching ---
// // //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// // //         if (!isOpen) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (!currentConversationId && !isInitialFetch) {
// // //             setLoadingInitialMessages(false);
// // //             setMessages([]);
// // //             return;
// // //         }

// // //         if (isInitialFetch) {
// // //             setLoadingInitialMessages(true);
// // //             setError(null);
// // //         }

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             if (currentConversationId) {
// // //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// // //                     headers: { 'Authorization': `Bearer ${token}` },
// // //                 });

// // //                 if (!response.ok) {
// // //                     const errorData = await response.json().catch(() => ({}));
// // //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// // //                 }

// // //                 const data: Message[] = await response.json();
// // //                 // Filter out soft-deleted messages for display
// // //                 setMessages(data.filter(msg => !msg.isDeleted));
// // //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// // //             } else {
// // //                 setMessages([]);
// // //             }
// // //             hasFetchedInitialMessages.current = true;
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error fetching messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// // //         } finally {
// // //             if (isInitialFetch) {
// // //                 setLoadingInitialMessages(false);
// // //             }
// // //         }
// // //     }, [isOpen, currentConversationId, getIdToken]);

// // //     useEffect(() => {
// // //         let interval: NodeJS.Timeout;

// // //         if (isOpen) {
// // //             // Fetch immediately, then set up interval
// // //             fetchMessages(true);
// // //             interval = setInterval(() => {
// // //                 fetchMessages(false);
// // //             }, 5000);
// // //         } else {
// // //             // Clear interval and reset states when chat window is closed
// // //             clearInterval(interval);
// // //             setMessages([]);
// // //             setCurrentConversationId(null);
// // //             setNewMessageContent('');
// // //             setSelectedMedia(null);
// // //             setMediaPreviewUrl(null);
// // //             setIsImagePreviewOpen(false);
// // //             setPreviewImageUrl(null);
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setIsEditing(false);
// // //             setError(null);
// // //             setLoadingInitialMessages(true);
// // //             setSelectedMessages([]); // Clear selected messages
// // //             hasFetchedInitialMessages.current = false;
// // //         }

// // //         return () => clearInterval(interval);
// // //     }, [isOpen, currentConversationId, fetchMessages]);

// // //     // --- Message Sending Handler ---
// // //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// // //         e?.preventDefault();
// // //         const textContent = newMessageContent.trim();

// // //         if (!textContent && !selectedMedia) {
// // //             setError('Please type a message or select a file.');
// // //             return;
// // //         }
// // //         if (sendingMessage) return;

// // //         setSendingMessage(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             let response;
// // //             let sentMessage: Message;

// // //             if (selectedMedia) {
// // //                 const formData = new FormData();
// // //                 formData.append('media', selectedMedia);
// // //                 if (textContent) {
// // //                     formData.append('content', textContent);
// // //                 }

// // //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                     },
// // //                     body: formData,
// // //                 });
// // //             } else {
// // //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Authorization': `Bearer ${token}`,
// // //                         'Content-Type': 'application/json',
// // //                     },
// // //                     body: JSON.stringify({ content: textContent }),
// // //                 });
// // //             }

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// // //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// // //             }

// // //             sentMessage = await response.json();
// // //             console.log("[ChatWindow] Message sent:", sentMessage);

// // //             if (!currentConversationId && sentMessage.conversationId) {
// // //                 setCurrentConversationId(sentMessage.conversationId);
// // //             }

// // //             // Only add if not deleted, though new messages shouldn't be deleted
// // //             if (!sentMessage.isDeleted) {
// // //                 setMessages(prev => [...prev, sentMessage]);
// // //             }
// // //             setNewMessageContent('');
// // //             removeSelectedMedia();
// // //             onMessageSent(); // Trigger conversation list update
// // //             setSelectedMessages([]); // Clear selection after sending
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error sending message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to send message.');
// // //         } finally {
// // //             setSendingMessage(false);
// // //         }
// // //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// // //     // --- Message Editing Handlers ---
// // //     const handleEditClick = useCallback((message: Message) => {
// // //         setSelectedMessages([message._id]); // Select only the message being edited
// // //         setEditingMessageId(message._id);
// // //         setEditedMessageContent(message.content || '');
// // //         setNewMessageContent(message.content || ''); // Populate input with current content
// // //         setIsEditing(true);
// // //         removeSelectedMedia(); // Clear any selected media when editing
// // //     }, [removeSelectedMedia]);

// // //     const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
// // //         e.preventDefault();
// // //         if (!editingMessageId || isEditing) return;

// // //         const contentToSave = editedMessageContent.trim();
// // //         if (!contentToSave) {
// // //             setError('Message content cannot be empty.');
// // //             return;
// // //         }

// // //         setIsEditing(true);
// // //         setError(null);

// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// // //                 method: 'PUT',
// // //                 headers: {
// // //                     'Authorization': `Bearer ${token}`,
// // //                     'Content-Type': 'application/json',
// // //                 },
// // //                 body: JSON.stringify({ content: contentToSave }),
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to edit message.');
// // //             }

// // //             const updatedMessage: Message = await response.json();
// // //             setMessages(prevMessages =>
// // //                 prevMessages.map(msg =>
// // //                     msg._id === editingMessageId ? { ...msg, content: updatedMessage.content, updatedAt: updatedMessage.updatedAt, isEdited: true } : msg
// // //                 )
// // //             );
// // //             setEditingMessageId(null);
// // //             setEditedMessageContent('');
// // //             setNewMessageContent('');
// // //             setSelectedMessages([]); // Clear selection after editing
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error editing message:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to edit message.');
// // //         } finally {
// // //             setIsEditing(false);
// // //         }
// // //     }, [editingMessageId, editedMessageContent, getIdToken, isEditing]);

// // //     const handleCancelEdit = useCallback(() => {
// // //         setEditingMessageId(null);
// // //         setEditedMessageContent('');
// // //         setNewMessageContent('');
// // //         setIsEditing(false);
// // //         setSelectedMessages([]); // Clear selection when canceling edit
// // //     }, []);

// // //     // --- Message Deletion Handlers ---
// // //     const handleDeleteSelectedMessages = useCallback(async () => {
// // //         if (selectedMessages.length === 0) return;

// // //         if (!window.confirm(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`)) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const results = await Promise.allSettled(
// // //                 selectedMessages.map(messageId =>
// // //                     fetch(`${API_BASE_URL}/chats/message/${messageId}`, {
// // //                         method: 'DELETE',
// // //                         headers: { 'Authorization': `Bearer ${token}` },
// // //                     })
// // //                 )
// // //             );

// // //             const failedDeletions = results.filter(result => result.status === 'rejected' || (result as PromiseFulfilledResult<Response>).value.ok === false);

// // //             if (failedDeletions.length > 0) {
// // //                 setError(`Failed to delete ${failedDeletions.length} message(s).`);
// // //             } else {
// // //                 setError(null); // Clear any previous error
// // //             }

// // //             // Refetch messages to get the updated state (including soft deletes)
// // //             await fetchMessages(false);
// // //             setSelectedMessages([]); // Clear selection after deletion attempt
// // //             onMessageSent(); // To update conversation list if last message(s) were deleted
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting selected messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// // //         }
// // //     }, [selectedMessages, getIdToken, fetchMessages, onMessageSent]);

// // //     const handleDeleteAllMessages = useCallback(async () => {
// // //         if (!currentConversationId) return;

// // //         if (!window.confirm('Are you sure you want to delete ALL messages in this conversation? This action cannot be undone.')) {
// // //             return;
// // //         }

// // //         setError(null);
// // //         try {
// // //             const token = await getIdToken();
// // //             if (!token) throw new Error('Authentication required.');

// // //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// // //                 method: 'DELETE',
// // //                 headers: { 'Authorization': `Bearer ${token}` },
// // //             });

// // //             if (!response.ok) {
// // //                 const errorData = await response.json().catch(() => ({}));
// // //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// // //             }

// // //             setMessages([]); // Clear all messages from UI immediately
// // //             setSelectedMessages([]); // Clear any selected messages
// // //             onMessageSent(); // To update conversation list

// // //             alert('All messages deleted successfully.');
// // //         } catch (err) {
// // //             console.error('[ChatWindow] Error deleting all messages:', err);
// // //             setError(err instanceof Error ? err.message : 'Failed to delete all messages.');
// // //         }
// // //     }, [currentConversationId, getIdToken, onMessageSent]);


// // //     // --- Image Preview Handlers ---
// // //     const openImagePreview = useCallback((imageUrl: string) => {
// // //         setPreviewImageUrl(imageUrl);
// // //         setIsImagePreviewOpen(true);
// // //     }, []);

// // //     const closeImagePreview = useCallback(() => {
// // //         setIsImagePreviewOpen(false);
// // //         setPreviewImageUrl(null);
// // //     }, []);

// // //     // If the chat window is not open, return null to render nothing
// // //     if (!isOpen) {
// // //         return null;
// // //     }

// // //     return (
// // //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// // //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// // //                 {/* Header */}
// // //                 <ChatHeader
// // //                     chatUser={chatUser}
// // //                     defaultAvatarUrl={defaultAvatarUrl}
// // //                     getFullMediaUrl={getFullMediaUrl}
// // //                     onClose={onClose}
// // //                     showActionsMenu={selectedMessages.length > 0} // Show menu only if messages are selected
// // //                     onDeleteSelected={handleDeleteSelectedMessages}
// // //                     onDeleteAll={handleDeleteAllMessages}
// // //                     onClearSelection={handleClearSelection}
// // //                 />

// // //                 {/* Messages Area */}
// // //                 <MessageList
// // //                     messages={messages}
// // //                     loading={loadingInitialMessages}
// // //                     error={error}
// // //                     currentUserId={currentUserId}
// // //                     getFullMediaUrl={getFullMediaUrl}
// // //                     defaultAvatarUrl={defaultAvatarUrl}
// // //                     onOpenImagePreview={openImagePreview}
// // //                     selectedMessages={selectedMessages}
// // //                     onSelectMessage={handleSelectMessage}
// // //                 />

// // //                 {/* Message Input and Attachment Button */}
// // //                 <ChatInput
// // //                     newMessageContent={newMessageContent}
// // //                     setNewMessageContent={setNewMessageContent}
// // //                     selectedMedia={selectedMedia}
// // //                     mediaPreviewUrl={mediaPreviewUrl}
// // //                     removeSelectedMedia={removeSelectedMedia}
// // //                     error={error} // Pass error state to ChatInput
// // //                     isEditing={isEditing}
// // //                     editingMessageId={editingMessageId}
// // //                     editedMessageContent={editedMessageContent}
// // //                     setEditedMessageContent={setEditedMessageContent}
// // //                     sendingMessage={sendingMessage}
// // //                     handleSendMessage={handleSendMessage}
// // //                     handleSaveEdit={handleSaveEdit}
// // //                     handleCancelEdit={handleCancelEdit}
// // //                     handleFileChange={(e) => {
// // //                         // Clear selection when attempting to send new message/media
// // //                         if (!editingMessageId) setSelectedMessages([]);
// // //                         handleFileChange(e);
// // //                     }}
// // //                 />
// // //             </div>

// // //             {/* Image Preview Modal */}
// // //             <ImagePreviewModal
// // //                 imageUrl={previewImageUrl}
// // //                 onClose={closeImagePreview}
// // //             />
// // //         </div>
// // //     );
// // // };

// // // export default ChatWindow;



// // 'use client';

// // import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// // import { useAuth } from './AuthProvider';
// // import Skeleton from 'react-loading-skeleton';
// // import 'react-loading-skeleton/dist/skeleton.css';
// // import { format } from 'date-fns';
// // import toast, { Toaster } from 'react-hot-toast';

// // // Import types from the shared file
// // import { Message, GeneralUser } from '../app/types';

// // // Import the new sub-components
// // import ChatHeader from '../components/chatHeader'; // Updated import path
// // import MessageList from '../components/MessageList'; // Updated import path
// // import ChatInput from '../components/chatInput'; // Updated import path
// // import ImagePreviewModal from '../components/ImagePreviewModal';
// // import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// // // Define the props for ChatWindow
// // interface ChatWindowProps {
// //     isOpen: boolean;
// //     onClose: () => void;
// //     chatUser: GeneralUser;
// //     currentUserId: string;
// //     getFullMediaUrl: (relativePath?: string) => string;
// //     defaultAvatarUrl: string;
// //     onMessageSent: () => void;
// // }

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // const ChatWindow: FC<ChatWindowProps> = ({
// //     isOpen,
// //     onClose,
// //     chatUser,
// //     currentUserId,
// //     getFullMediaUrl,
// //     defaultAvatarUrl,
// //     onMessageSent,
// // }) => {
// //     const { getIdToken } = useAuth();
// //     const [messages, setMessages] = useState<Message[]>([]);
// //     const [newMessageContent, setNewMessageContent] = useState('');
// //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// //     const [sendingMessage, setSendingMessage] = useState(false);
// //     const [error, setError] = useState<string | null>(null);

// //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// //     const hasFetchedInitialMessages = useRef(false);

// //     // States for media upload
// //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// //     const fileInputRef = useRef<HTMLInputElement>(null);

// //     // New state for image preview
// //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// //     // States for message editing
// //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// //     const [isSavingEdit, setIsSavingEdit] = useState(false);

// //     // State for message selection
// //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

// //     // State for the custom delete confirmation modal
// //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// //     const [deleteModalMessage, setDeleteModalMessage] = useState('');
// //     const [deleteModalTitle, setDeleteModalTitle] = useState('');
// //     const [confirmDeleteAction, setConfirmDeleteAction] = useState<(() => Promise<void>) | null>(null);

// //     // --- Message Selection Handlers ---
// //     const handleSelectMessage = useCallback((messageId: string) => {
// //         // If an edit is active, clicking other messages should not select them
// //         if (editingMessageId) {
// //             return;
// //         }

// //         setSelectedMessages(prevSelected => {
// //             // If the message is already selected, unselect it.
// //             if (prevSelected.includes(messageId)) {
// //                 return prevSelected.filter(id => id !== messageId);
// //             } else {
// //                 // If a message is not selected, select it and clear any other selections.
// //                 return [messageId]; // Ensure only one message is selected at a time
// //             }
// //         });
// //     }, [editingMessageId]);

// //     const handleClearSelection = useCallback(() => {
// //         setSelectedMessages([]);
// //     }, []);

// //     // --- Media Selection Handlers ---
// //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// //         // If editing, prevent new media selection
// //         if (editingMessageId) {
// //             toast.error("Cannot attach files while editing a message.");
// //             return;
// //         }

// //         if (e.target.files && e.target.files[0]) {
// //             const file = e.target.files[0];

// //             if (file.size > 20 * 1024 * 1024) {
// //                 toast.error('File size exceeds 20MB limit.');
// //                 setSelectedMedia(null);
// //                 setMediaPreviewUrl(null);
// //                 if (fileInputRef.current) fileInputRef.current.value = '';
// //                 return;
// //             }

// //             setSelectedMedia(file);
// //             setError(null);

// //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// //                 const reader = new FileReader();
// //                 reader.onloadend = () => {
// //                     setMediaPreviewUrl(reader.result as string);
// //                 };
// //                 reader.readAsDataURL(file);
// //             } else {
// //                 setMediaPreviewUrl(null);
// //             }
// //             // Clear message content when a file is selected, especially if it's not an image/video with caption
// //             setNewMessageContent('');
// //         }
// //     }, [editingMessageId]);

// //     const removeSelectedMedia = useCallback(() => {
// //         setSelectedMedia(null);
// //         setMediaPreviewUrl(null);
// //         if (fileInputRef.current) {
// //             fileInputRef.current.value = '';
// //         }
// //         setError(null);
// //     }, []);

// //     // --- Conversation ID Fetching ---
// //     useEffect(() => {
// //         const findConversationId = async () => {
// //             if (!isOpen || !chatUser || !currentUserId) return;

// //             setLoadingInitialMessages(true);
// //             hasFetchedInitialMessages.current = false;
// //             setError(null);

// //             try {
// //                 const token = await getIdToken();
// //                 if (!token) throw new Error('Authentication required.');

// //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// //                     headers: { 'Authorization': `Bearer ${token}` },
// //                 });
// //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// //                 const existingConv = conversations.find(conv =>
// //                     conv.otherParticipant?._id === chatUser._id
// //                 );

// //                 if (existingConv) {
// //                     setCurrentConversationId(existingConv._id);
// //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// //                 } else {
// //                     setCurrentConversationId(null);
// //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// //                 }
// //             } catch (err) {
// //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// //                 setLoadingInitialMessages(false);
// //             }
// //         };

// //         if (isOpen) {
// //             findConversationId();
// //         }
// //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// //     // --- Message Fetching ---
// //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// //         if (!isOpen) {
// //             setLoadingInitialMessages(false);
// //             setMessages([]);
// //             return;
// //         }

// //         // Only proceed if currentConversationId is set or if it's an initial fetch and we're about to determine it.
// //         // If it's not an initial fetch and there's no conversation ID, it means no messages have been sent yet.
// //         if (!currentConversationId && !isInitialFetch) {
// //             setLoadingInitialMessages(false);
// //             setMessages([]);
// //             return;
// //         }

// //         if (isInitialFetch) {
// //             setLoadingInitialMessages(true);
// //             setError(null);
// //         }

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             if (currentConversationId) {
// //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// //                     headers: { 'Authorization': `Bearer ${token}` },
// //                 });

// //                 if (!response.ok) {
// //                     const errorData = await response.json().catch(() => ({}));
// //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// //                 }

// //                 const data: Message[] = await response.json();
// //                 setMessages(data); // Set all messages, including soft-deleted ones for internal tracking
// //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// //             } else {
// //                 setMessages([]);
// //             }
// //             hasFetchedInitialMessages.current = true;
// //         } catch (err) {
// //             console.error('[ChatWindow] Error fetching messages:', err);
// //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// //         } finally {
// //             if (isInitialFetch) {
// //                 setLoadingInitialMessages(false);
// //             }
// //         }
// //     }, [isOpen, currentConversationId, getIdToken]);

// //     useEffect(() => {
// //         let interval: NodeJS.Timeout;

// //         if (isOpen) {
// //             fetchMessages(true);
// //             interval = setInterval(() => {
// //                 fetchMessages(false);
// //             }, 5000); // Poll every 5 seconds for new messages
// //         } else {
// //             // Reset all states when chat window closes
// //             clearInterval(interval);
// //             setMessages([]);
// //             setCurrentConversationId(null);
// //             setNewMessageContent('');
// //             setSelectedMedia(null);
// //             setMediaPreviewUrl(null);
// //             setIsImagePreviewOpen(false);
// //             setPreviewImageUrl(null);
// //             setEditingMessageId(null);
// //             setNewMessageContent(''); // Reset this too
// //             setIsSavingEdit(false);
// //             setError(null);
// //             setLoadingInitialMessages(true);
// //             setSelectedMessages([]);
// //             hasFetchedInitialMessages.current = false;
// //         }

// //         return () => clearInterval(interval);
// //     }, [isOpen, currentConversationId, fetchMessages]);

// //     // --- Message Sending Handler ---
// //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// //         e?.preventDefault();
// //         const textContent = newMessageContent.trim();

// //         if (!textContent && !selectedMedia) {
// //             toast.error('Please type a message or select a file.');
// //             return;
// //         }
// //         if (sendingMessage) return;

// //         setSendingMessage(true);
// //         setError(null);

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             let response;
// //             let sentMessage: Message;

// //             if (selectedMedia) {
// //                 const formData = new FormData();
// //                 formData.append('media', selectedMedia);
// //                 if (textContent) {
// //                     formData.append('content', textContent);
// //                 }

// //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Authorization': `Bearer ${token}`,
// //                     },
// //                     body: formData,
// //                 });
// //             } else {
// //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Authorization': `Bearer ${token}`,
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify({ content: textContent }),
// //                 });
// //             }

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// //             }

// //             sentMessage = await response.json();
// //             console.log("[ChatWindow] Message sent:", sentMessage);

// //             if (!currentConversationId && sentMessage.conversationId) {
// //                 setCurrentConversationId(sentMessage.conversationId);
// //             }

// //             // Add the new message to the state, ensuring it's not marked as deleted from the start
// //             setMessages(prev => [...prev, { ...sentMessage, isDeleted: false, isEdited: false }]);
// //             setNewMessageContent('');
// //             removeSelectedMedia();
// //             onMessageSent();
// //             setSelectedMessages([]); // Clear selection after sending
// //         } catch (err) {
// //             console.error('[ChatWindow] Error sending message:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
// //         } finally {
// //             setSendingMessage(false);
// //         }
// //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// //     // --- Message Editing Handlers ---
// //     const handleEditClick = useCallback((message: Message) => {
// //         // Only allow editing if the message belongs to the current user and is not deleted
// //         if (message.sender._id !== currentUserId || message.isDeleted) {
// //             toast.error("You can only edit your own non-deleted messages.");
// //             return;
// //         }

// //         // Clear any selections first
// //         setSelectedMessages([]);

// //         // Set editing state
// //         setEditingMessageId(message._id);
// //         setNewMessageContent(message.content || ''); // Populate input with current content
// //         // Do not allow editing media files, only their captions
// //         removeSelectedMedia();

// //         console.log(`[ChatWindow] Started editing message: ${message._id}`);
// //     }, [currentUserId, removeSelectedMedia]);

// //     const handleSaveEdit = useCallback(async (e?: React.FormEvent) => {
// //         e?.preventDefault();
// //         if (!editingMessageId || isSavingEdit) return;

// //         const contentToSave = newMessageContent.trim();
// //         if (!contentToSave) {
// //             toast.error('Message content cannot be empty.');
// //             return;
// //         }

// //         setIsSavingEdit(true);
// //         setError(null);

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// //                 method: 'PUT',
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({ content: contentToSave }),
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 throw new Error(errorData.message || 'Failed to edit message.');
// //             }

// //             const updatedMessage: Message = await response.json();
// //             setMessages(prevMessages =>
// //                 prevMessages.map(msg =>
// //                     msg._id === editingMessageId ? {
// //                         ...msg,
// //                         content: updatedMessage.content,
// //                         updatedAt: updatedMessage.updatedAt,
// //                         isEdited: true // Ensure this is set to true after edit
// //                     } : msg
// //                 )
// //             );

// //             // Reset editing state
// //             setEditingMessageId(null);
// //             setNewMessageContent('');
// //             toast.success('Message edited successfully!');
// //             console.log(`[ChatWindow] Message ${editingMessageId} edited successfully`);
// //         } catch (err) {
// //             console.error('[ChatWindow] Error editing message:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to edit message.');
// //         } finally {
// //             setIsSavingEdit(false);
// //         }
// //     }, [editingMessageId, newMessageContent, getIdToken, isSavingEdit]);

// //     const handleCancelEdit = useCallback(() => {
// //         setEditingMessageId(null);
// //         setNewMessageContent('');
// //         setIsSavingEdit(false); // Ensure this is reset too
// //         setError(null); // Clear any previous error
// //         console.log(`[ChatWindow] Cancelled editing`);
// //     }, []);

// //     // --- Message Deletion Handlers with Custom Modal ---
// //     const confirmAndDeleteSelectedMessages = useCallback(async () => {
// //         setError(null);

// //         const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
// //         const userOwnedMessages = messagesToDelete.filter(msg => msg.sender._id === currentUserId);
// //         const otherUserMessages = messagesToDelete.filter(msg => msg.sender._id !== currentUserId);

// //         if (messagesToDelete.length === 0) {
// //             toast.error('No messages selected for deletion.');
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //             return;
// //         }

// //         if (otherUserMessages.length > 0 && userOwnedMessages.length === 0) {
// //             toast.error('You can only delete your own messages.');
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //             setSelectedMessages([]);
// //             return;
// //         } else if (otherUserMessages.length > 0 && userOwnedMessages.length > 0) {
// //             toast.error(`You can only delete your ${userOwnedMessages.length} message(s). ${otherUserMessages.length} message(s) from other users will not be deleted.`);
// //         }

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const results = await Promise.allSettled(
// //                 userOwnedMessages.map(message =>
// //                     fetch(`${API_BASE_URL}/chats/message/${message._id}`, {
// //                         method: 'DELETE',
// //                         headers: { 'Authorization': `Bearer ${token}` },
// //                     })
// //                 )
// //             );

// //             const failedDeletions = results.filter(result =>
// //                 result.status === 'rejected' ||
// //                 (result.status === 'fulfilled' && !result.value.ok)
// //             );

// //             if (failedDeletions.length > 0) {
// //                 if (failedDeletions.length === userOwnedMessages.length && otherUserMessages.length === 0) {
// //                     toast.error('Failed to delete all your selected messages.');
// //                 } else {
// //                     toast.error(`Failed to delete ${failedDeletions.length} of your message(s).`);
// //                 }
// //             } else if (userOwnedMessages.length > 0) {
// //                 toast.success('Selected message(s) deleted successfully!');
// //             }

// //             await fetchMessages(false); // Re-fetch messages to reflect changes
// //             setSelectedMessages([]);
// //             onMessageSent();
// //         } catch (err) {
// //             console.error('[ChatWindow] Error deleting selected messages:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// //         } finally {
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //         }
// //     }, [selectedMessages, messages, currentUserId, getIdToken, fetchMessages, onMessageSent, setSelectedMessages]);

// //     const handleDeleteSelectedMessages = useCallback(() => {
// //         if (selectedMessages.length === 0) return;

// //         setDeleteModalTitle('Delete Selected Messages');
// //         setDeleteModalMessage(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`);
// //         setConfirmDeleteAction(() => confirmAndDeleteSelectedMessages);
// //         setShowDeleteModal(true);
// //     }, [selectedMessages, confirmAndDeleteSelectedMessages]);

// //     const confirmAndDeleteAllMessages = useCallback(async () => {
// //         if (!currentConversationId) return;

// //         setError(null);
// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// //                 method: 'DELETE',
// //                 headers: { 'Authorization': `Bearer ${token}` },
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// //             }

// //             setMessages([]); // Clear all messages in the UI
// //             setSelectedMessages([]);
// //             onMessageSent();
// //             toast.success('All your messages in this conversation deleted successfully!');
// //         } catch (err) {
// //             console.error('[ChatWindow] Error deleting all messages:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
// //         } finally {
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //         }
// //     }, [currentConversationId, getIdToken, onMessageSent, setSelectedMessages, setMessages]);

// //     const handleDeleteAllMessages = useCallback(() => {
// //         if (!currentConversationId) return;

// //         setDeleteModalTitle('Delete All Messages');
// //         setDeleteModalMessage('Are you sure you want to delete ALL your messages in this conversation? This action cannot be undone.');
// //         setConfirmDeleteAction(() => confirmAndDeleteAllMessages);
// //         setShowDeleteModal(true);
// //     }, [currentConversationId, confirmAndDeleteAllMessages]);

// //     // Handlers for the custom DeleteConfirmationModal
// //     const handleConfirmDelete = async () => {
// //         if (confirmDeleteAction) {
// //             await confirmDeleteAction();
// //         }
// //     };

// //     const handleCancelDelete = () => {
// //         setShowDeleteModal(false);
// //         setConfirmDeleteAction(null);
// //     };

// //     // --- Image Preview Handlers ---
// //     const openImagePreview = useCallback((imageUrl: string) => {
// //         setPreviewImageUrl(imageUrl);
// //         setIsImagePreviewOpen(true);
// //     }, []);

// //     const closeImagePreview = useCallback(() => {
// //         setIsImagePreviewOpen(false);
// //         setPreviewImageUrl(null);
// //     }, []);

// //     // If the chat window is not open, return null to render nothing
// //     if (!isOpen) {
// //         return null;
// //     }

// //     return (
// //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// //             <Toaster position="top-center" reverseOrder={false} />
// //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// //                 {/* Header */}
// //                 <ChatHeader
// //                     chatUser={chatUser}
// //                     defaultAvatarUrl={defaultAvatarUrl}
// //                     getFullMediaUrl={getFullMediaUrl}
// //                     onClose={onClose}
// //                     // Show actions menu only if messages are selected or if not editing
// //                     showActionsMenu={selectedMessages.length > 0 || !editingMessageId} // Changed logic
// //                     onDeleteSelected={handleDeleteSelectedMessages}
// //                     onDeleteAll={handleDeleteAllMessages}
// //                     onClearSelection={handleClearSelection}
// //                     selectedMessages={selectedMessages} // Pass selected messages to header
// //                     messages={messages} // Pass all messages to header
// //                     currentUserId={currentUserId}
// //                     onEditMessage={handleEditClick} // Pass the edit handler to header
// //                     isEditing={editingMessageId !== null} // Pass editing state to header
// //                 />

// //                 {/* Messages Area */}
// //                 <MessageList
// //                     messages={messages.filter(msg => !msg.isDeleted)} // Only display non-deleted messages
// //                     loading={loadingInitialMessages}
// //                     error={error}
// //                     currentUserId={currentUserId}
// //                     getFullMediaUrl={getFullMediaUrl}
// //                     defaultAvatarUrl={defaultAvatarUrl}
// //                     onOpenImagePreview={openImagePreview}
// //                     selectedMessages={selectedMessages}
// //                     onSelectMessage={handleSelectMessage}
// //                     onEditMessage={handleEditClick} // Still pass, but direct usage removed from MessageList
// //                     editingMessageId={editingMessageId}
// //                 />

// //                 {/* Message Input and Attachment Button */}
// //                 <ChatInput
// //                     newMessageContent={newMessageContent}
// //                     setNewMessageContent={setNewMessageContent}
// //                     selectedMedia={selectedMedia}
// //                     mediaPreviewUrl={mediaPreviewUrl}
// //                     removeSelectedMedia={removeSelectedMedia}
// //                     error={error}
// //                     isEditing={editingMessageId !== null}
// //                     editingMessageId={editingMessageId}
// //                     sendingMessage={sendingMessage || isSavingEdit}
// //                     handleSendMessage={handleSendMessage} // Pass base send handler
// //                     handleSaveEdit={handleSaveEdit} // Pass explicit save handler
// //                     handleCancelEdit={handleCancelEdit} // Pass explicit cancel handler
// //                     handleFileChange={(e) => {
// //                         // Clear selections if a file is being attached (only if not editing)
// //                         if (!editingMessageId) setSelectedMessages([]);
// //                         handleFileChange(e);
// //                     }}
// //                 />
// //             </div>

// //             {/* Image Preview Modal */}
// //             <ImagePreviewModal
// //                 imageUrl={previewImageUrl}
// //                 onClose={closeImagePreview}
// //             />

// //             {/* Custom Delete Confirmation Modal */}
// //             {showDeleteModal && (
// //                 <DeleteConfirmationModal
// //                     title={deleteModalTitle}
// //                     message={deleteModalMessage}
// //                     onConfirm={handleConfirmDelete}
// //                     onCancel={handleCancelDelete}
// //                 />
// //             )}
// //         </div>
// //     );
// // };

// // export default ChatWindow;




// // 'use client';

// // import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// // import { useAuth } from './AuthProvider';
// // import Skeleton from 'react-loading-skeleton';
// // import 'react-loading-skeleton/dist/skeleton.css';
// // import toast, { Toaster } from 'react-hot-toast';

// // // Import types from the shared file
// // import { Message, GeneralUser } from '../app/types';

// // // Import the new sub-components
// // import ChatHeader from '../components/chatHeader'; // Updated import path
// // import MessageList from '../components/MessageList'; // Updated import path
// // import ChatInput from '../components/chatInput'; // Updated import path
// // import ImagePreviewModal from '../components/ImagePreviewModal';
// // import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// // // Define the props for ChatWindow
// // interface ChatWindowProps {
// //     isOpen: boolean;
// //     onClose: () => void;
// //     chatUser: GeneralUser;
// //     currentUserId: string;
// //     getFullMediaUrl: (relativePath?: string) => string;
// //     defaultAvatarUrl: string;
// //     onMessageSent: () => void;
// // }

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // const ChatWindow: FC<ChatWindowProps> = ({
// //     isOpen,
// //     onClose,
// //     chatUser,
// //     currentUserId,
// //     getFullMediaUrl,
// //     defaultAvatarUrl,
// //     onMessageSent,
// // }) => {
// //     const { getIdToken } = useAuth();
// //     const [messages, setMessages] = useState<Message[]>([]);
// //     const [newMessageContent, setNewMessageContent] = useState(''); // Unified content state
// //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// //     const [sendingMessage, setSendingMessage] = useState(false); // For new messages
// //     const [error, setError] = useState<string | null>(null);

// //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// //     const hasFetchedInitialMessages = useRef(false);

// //     // States for media upload
// //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// //     const fileInputRef = useRef<HTMLInputElement>(null);

// //     // New state for image preview
// //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// //     // States for message editing
// //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// //     const [isSavingEdit, setIsSavingEdit] = useState(false); // Separate state for saving edit

// //     // State for message selection
// //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

// //     // State for the custom delete confirmation modal
// //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// //     const [deleteModalMessage, setDeleteModalMessage] = useState('');
// //     const [deleteModalTitle, setDeleteModalTitle] = useState('');
// //     const [confirmDeleteAction, setConfirmDeleteAction] = useState<(() => Promise<void>) | null>(null);

// //     // --- Message Selection Handlers ---
// //     const handleSelectMessage = useCallback((messageId: string) => {
// //         // If an edit is active, clicking other messages should not select them
// //         if (editingMessageId) {
// //             return;
// //         }

// //         setSelectedMessages(prevSelected => {
// //             // If the message is already selected, unselect it.
// //             if (prevSelected.includes(messageId)) {
// //                 return prevSelected.filter(id => id !== messageId);
// //             } else {
// //                 // If a message is not selected, select it and clear any other selections.
// //                 return [...prevSelected, messageId]; // Ensure only one message is selected at a time
// //             }
// //         });
// //     }, [editingMessageId]);

// //     const handleClearSelection = useCallback(() => {
// //         setSelectedMessages([]);
// //     }, []);

// //     // --- Media Selection Handlers ---
// //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// //         // If editing, prevent new media selection
// //         if (editingMessageId) {
// //             toast.error("Cannot attach files while editing a message.");
// //             return;
// //         }

// //         if (e.target.files && e.target.files[0]) {
// //             const file = e.target.files[0];

// //             if (file.size > 20 * 1024 * 1024) {
// //                 toast.error('File size exceeds 20MB limit.');
// //                 setSelectedMedia(null);
// //                 setMediaPreviewUrl(null);
// //                 if (fileInputRef.current) fileInputRef.current.value = '';
// //                 return;
// //             }

// //             setSelectedMedia(file);
// //             setError(null);

// //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// //                 const reader = new FileReader();
// //                 reader.onloadend = () => {
// //                     setMediaPreviewUrl(reader.result as string);
// //                 };
// //                 reader.readAsDataURL(file);
// //             } else {
// //                 setMediaPreviewUrl(null);
// //             }
// //             // Clear message content when a file is selected, especially if it's not an image/video with caption
// //             setNewMessageContent('');
// //         }
// //     }, [editingMessageId]);

// //     const removeSelectedMedia = useCallback(() => {
// //         setSelectedMedia(null);
// //         setMediaPreviewUrl(null);
// //         if (fileInputRef.current) {
// //             fileInputRef.current.value = '';
// //         }
// //         setError(null);
// //     }, []);

// //     // --- Conversation ID Fetching ---
// //     useEffect(() => {
// //         const findConversationId = async () => {
// //             if (!isOpen || !chatUser || !currentUserId) return;

// //             setLoadingInitialMessages(true);
// //             hasFetchedInitialMessages.current = false;
// //             setError(null);

// //             try {
// //                 const token = await getIdToken();
// //                 if (!token) throw new Error('Authentication required.');

// //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// //                     headers: { 'Authorization': `Bearer ${token}` },
// //                 });
// //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// //                 const existingConv = conversations.find(conv =>
// //                     conv.otherParticipant?._id === chatUser._id
// //                 );

// //                 if (existingConv) {
// //                     setCurrentConversationId(existingConv._id);
// //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// //                 } else {
// //                     setCurrentConversationId(null);
// //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// //                 }
// //             } catch (err) {
// //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// //                 setLoadingInitialMessages(false);
// //             }
// //         };

// //         if (isOpen) {
// //             findConversationId();
// //         }
// //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// //     // --- Message Fetching ---
// //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// //         if (!isOpen) {
// //             setLoadingInitialMessages(false);
// //             setMessages([]);
// //             return;
// //         }

// //         // Only proceed if currentConversationId is set or if it's an initial fetch and we're about to determine it.
// //         // If it's not an initial fetch and there's no conversation ID, it means no messages have been sent yet.
// //         if (!currentConversationId && !isInitialFetch) {
// //             setLoadingInitialMessages(false);
// //             setMessages([]);
// //             return;
// //         }

// //         if (isInitialFetch) {
// //             setLoadingInitialMessages(true);
// //             setError(null);
// //         }

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             if (currentConversationId) {
// //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// //                     headers: { 'Authorization': `Bearer ${token}` },
// //                 });

// //                 if (!response.ok) {
// //                     const errorData = await response.json().catch(() => ({}));
// //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// //                 }

// //                 const data: Message[] = await response.json();
// //                 setMessages(data); // Set all messages, including soft-deleted ones for internal tracking
// //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// //             } else {
// //                 setMessages([]);
// //             }
// //             hasFetchedInitialMessages.current = true;
// //         } catch (err) {
// //             console.error('[ChatWindow] Error fetching messages:', err);
// //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// //         } finally {
// //             if (isInitialFetch) {
// //                 setLoadingInitialMessages(false);
// //             }
// //         }
// //     }, [isOpen, currentConversationId, getIdToken]);

// //     useEffect(() => {
// //         let interval: NodeJS.Timeout;

// //         if (isOpen) {
// //             fetchMessages(true);
// //             interval = setInterval(() => {
// //                 fetchMessages(false);
// //             }, 5000); // Poll every 5 seconds for new messages
// //         } else {
// //             // Reset all states when chat window closes
// //             clearInterval(interval);
// //             setMessages([]);
// //             setCurrentConversationId(null);
// //             setNewMessageContent('');
// //             setSelectedMedia(null);
// //             setMediaPreviewUrl(null);
// //             setIsImagePreviewOpen(false);
// //             setPreviewImageUrl(null);
// //             setEditingMessageId(null);
// //             setNewMessageContent(''); // Reset this too
// //             setIsSavingEdit(false);
// //             setError(null);
// //             setLoadingInitialMessages(true);
// //             setSelectedMessages([]);
// //             hasFetchedInitialMessages.current = false;
// //         }

// //         return () => clearInterval(interval);
// //     }, [isOpen, currentConversationId, fetchMessages]);

// //     // --- Message Sending Handler ---
// //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// //         e?.preventDefault();
// //         const textContent = newMessageContent.trim();

// //         if (!textContent && !selectedMedia) {
// //             toast.error('Please type a message or select a file.');
// //             return;
// //         }
// //         if (sendingMessage) return;

// //         setSendingMessage(true);
// //         setError(null);

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             let response;
// //             let sentMessage: Message;

// //             if (selectedMedia) {
// //                 const formData = new FormData();
// //                 formData.append('media', selectedMedia);
// //                 if (textContent) {
// //                     formData.append('content', textContent);
// //                 }

// //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Authorization': `Bearer ${token}`,
// //                     },
// //                     body: formData,
// //                 });
// //             } else {
// //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Authorization': `Bearer ${token}`,
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify({ content: textContent }),
// //                 });
// //             }

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// //             }

// //             sentMessage = await response.json();
// //             console.log("[ChatWindow] Message sent:", sentMessage);

// //             if (!currentConversationId && sentMessage.conversationId) {
// //                 setCurrentConversationId(sentMessage.conversationId);
// //             }

// //             // Add the new message to the state, ensuring it's not marked as deleted from the start
// //             setMessages(prev => [...prev, { ...sentMessage, isDeleted: false, isEdited: false }]);
// //             setNewMessageContent('');
// //             removeSelectedMedia();
// //             onMessageSent();
// //             setSelectedMessages([]); // Clear selection after sending
// //         } catch (err) {
// //             console.error('[ChatWindow] Error sending message:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
// //         } finally {
// //             setSendingMessage(false);
// //         }
// //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// //     // --- Message Editing Handlers ---
// //     const handleEditClick = useCallback((message: Message) => {
// //         // Only allow editing if the message belongs to the current user and is not deleted
// //         if (message.sender._id !== currentUserId || message.isDeleted) {
// //             toast.error("You can only edit your own non-deleted messages.");
// //             return;
// //         }

// //         // Clear any selections first
// //         setSelectedMessages([]);

// //         // Set editing state
// //         setEditingMessageId(message._id);
// //         setNewMessageContent(message.content || ''); // Populate input with current content
// //         // Do not allow editing media files, only their captions
// //         removeSelectedMedia();

// //         console.log(`[ChatWindow] Started editing message: ${message._id}`);
// //     }, [currentUserId, removeSelectedMedia]);

// //     const handleSaveEdit = useCallback(async (e?: React.FormEvent) => {
// //         e?.preventDefault();
// //         if (!editingMessageId || isSavingEdit) return;

// //         const contentToSave = newMessageContent.trim();
// //         if (!contentToSave) {
// //             toast.error('Message content cannot be empty.');
// //             return;
// //         }

// //         setIsSavingEdit(true);
// //         setError(null);

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// //                 method: 'PUT',
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({ content: contentToSave }),
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 throw new Error(errorData.message || 'Failed to edit message.');
// //             }

// //             const updatedMessage: Message = await response.json();
// //             setMessages(prevMessages =>
// //                 prevMessages.map(msg =>
// //                     msg._id === editingMessageId ? {
// //                         ...msg,
// //                         content: updatedMessage.content,
// //                         updatedAt: updatedMessage.updatedAt,
// //                         isEdited: true // Ensure this is set to true after edit
// //                     } : msg
// //                 )
// //             );

// //             // Reset editing state
// //             setEditingMessageId(null);
// //             setNewMessageContent('');
// //             toast.success('Message edited successfully!');
// //             console.log(`[ChatWindow] Message ${editingMessageId} edited successfully`);
// //         } catch (err) {
// //             console.error('[ChatWindow] Error editing message:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to edit message.');
// //         } finally {
// //             setIsSavingEdit(false);
// //         }
// //     }, [editingMessageId, newMessageContent, getIdToken, isSavingEdit]);

// //     const handleCancelEdit = useCallback(() => {
// //         setEditingMessageId(null);
// //         setNewMessageContent('');
// //         setIsSavingEdit(false); // Ensure this is reset too
// //         setError(null); // Clear any previous error
// //         console.log(`[ChatWindow] Cancelled editing`);
// //     }, []);

// //     // --- Message Deletion Handlers with Custom Modal ---
// //     const confirmAndDeleteSelectedMessages = useCallback(async () => {
// //         setError(null);

// //         const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
// //         const userOwnedMessages = messagesToDelete.filter(msg => msg.sender._id === currentUserId);
// //         const otherUserMessages = messagesToDelete.filter(msg => msg.sender._id !== currentUserId);

// //         if (messagesToDelete.length === 0) {
// //             toast.error('No messages selected for deletion.');
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //             return;
// //         }

// //         if (otherUserMessages.length > 0 && userOwnedMessages.length === 0) {
// //             toast.error('You can only delete your own messages.');
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //             setSelectedMessages([]);
// //             return;
// //         } else if (otherUserMessages.length > 0 && userOwnedMessages.length > 0) {
// //             toast.error(`You can only delete your ${userOwnedMessages.length} message(s). ${otherUserMessages.length} message(s) from other users will not be deleted.`);
// //         }

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const results = await Promise.allSettled(
// //                 userOwnedMessages.map(message =>
// //                     fetch(`${API_BASE_URL}/chats/message/${message._id}`, {
// //                         method: 'DELETE',
// //                         headers: { 'Authorization': `Bearer ${token}` },
// //                     })
// //                 )
// //             );

// //             const failedDeletions = results.filter(result =>
// //                 result.status === 'rejected' ||
// //                 (result.status === 'fulfilled' && !result.value.ok)
// //             );

// //             if (failedDeletions.length > 0) {
// //                 if (failedDeletions.length === userOwnedMessages.length && otherUserMessages.length === 0) {
// //                     toast.error('Failed to delete all your selected messages.');
// //                 } else {
// //                     toast.error(`Failed to delete ${failedDeletions.length} of your message(s).`);
// //                 }
// //             } else if (userOwnedMessages.length > 0) {
// //                 toast.success('Selected message(s) deleted successfully!');
// //             }

// //             await fetchMessages(false); // Re-fetch messages to reflect changes
// //             setSelectedMessages([]);
// //             onMessageSent();
// //         } catch (err) {
// //             console.error('[ChatWindow] Error deleting selected messages:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// //         } finally {
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //         }
// //     }, [selectedMessages, messages, currentUserId, getIdToken, fetchMessages, onMessageSent, setSelectedMessages]);

// //     const handleDeleteSelectedMessages = useCallback(() => {
// //         if (selectedMessages.length === 0) return;

// //         setDeleteModalTitle('Delete Selected Messages');
// //         setDeleteModalMessage(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`);
// //         setConfirmDeleteAction(() => confirmAndDeleteSelectedMessages);
// //         setShowDeleteModal(true);
// //     }, [selectedMessages, confirmAndDeleteSelectedMessages]);

// //     const confirmAndDeleteAllMessages = useCallback(async () => {
// //         if (!currentConversationId) return;

// //         setError(null);
// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// //                 method: 'DELETE',
// //                 headers: { 'Authorization': `Bearer ${token}` },
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// //             }

// //             setMessages([]); // Clear all messages in the UI
// //             setSelectedMessages([]);
// //             onMessageSent();
// //             toast.success('All messages are deleted successfully!');
// //         } catch (err) {
// //             console.error('[ChatWindow] Error deleting all messages:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
// //         } finally {
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //         }
// //     }, [currentConversationId, getIdToken, onMessageSent, setSelectedMessages, setMessages]);

// //     const handleDeleteAllMessages = useCallback(() => {
// //         if (!currentConversationId) return;

// //         setDeleteModalTitle('Delete All Messages');
// //         setDeleteModalMessage('Are you sure you want to delete ALL your messages in this conversation? This action cannot be undone.');
// //         setConfirmDeleteAction(() => confirmAndDeleteAllMessages);
// //         setShowDeleteModal(true);
// //     }, [currentConversationId, confirmAndDeleteAllMessages]);

// //     // Handlers for the custom DeleteConfirmationModal
// //     const handleConfirmDelete = async () => {
// //         if (confirmDeleteAction) {
// //             await confirmDeleteAction();
// //         }
// //     };

// //     const handleCancelDelete = () => {
// //         setShowDeleteModal(false);
// //         setConfirmDeleteAction(null);
// //     };

// //     // --- Image Preview Handlers ---
// //     const openImagePreview = useCallback((imageUrl: string) => {
// //         setPreviewImageUrl(imageUrl);
// //         setIsImagePreviewOpen(true);
// //     }, []);

// //     const closeImagePreview = useCallback(() => {
// //         setIsImagePreviewOpen(false);
// //         setPreviewImageUrl(null);
// //     }, []);

// //     // If the chat window is not open, return null to render nothing
// //     if (!isOpen) {
// //         return null;
// //     }

// //     return (
// //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4">
// //             <Toaster position="top-center" reverseOrder={false} />
// //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
// //                 {/* Header */}
// //                 <ChatHeader
// //                     chatUser={chatUser}
// //                     defaultAvatarUrl={defaultAvatarUrl}
// //                     getFullMediaUrl={getFullMediaUrl}
// //                     onClose={onClose}
// //                     // Show actions menu only if messages are selected or if not editing
// //                     showActionsMenu={selectedMessages.length > 0 || !editingMessageId} // Changed logic
// //                     onDeleteSelected={handleDeleteSelectedMessages}
// //                     onDeleteAll={handleDeleteAllMessages}
// //                     onClearSelection={handleClearSelection}
// //                     selectedMessages={selectedMessages} // Pass selected messages to header
// //                     messages={messages} // Pass all messages to header
// //                     currentUserId={currentUserId}
// //                     onEditMessage={handleEditClick} // Pass the edit handler to header
// //                     isEditing={editingMessageId !== null} // Pass editing state to header
// //                 />

// //                 {/* Messages Area */}
// //                 <MessageList
// //                     messages={messages.filter(msg => !msg.isDeleted)} // Only display non-deleted messages
// //                     loading={loadingInitialMessages}
// //                     error={error}
// //                     currentUserId={currentUserId}
// //                     getFullMediaUrl={getFullMediaUrl}
// //                     defaultAvatarUrl={defaultAvatarUrl}
// //                     onOpenImagePreview={openImagePreview}
// //                     selectedMessages={selectedMessages}
// //                     onSelectMessage={handleSelectMessage}
// //                     onEditMessage={handleEditClick}
// //                     editingMessageId={editingMessageId}
// //                 />

// //                 {/* Message Input and Attachment Button */}
// //                 <ChatInput
// //                     newMessageContent={newMessageContent}
// //                     setNewMessageContent={setNewMessageContent}
// //                     selectedMedia={selectedMedia}
// //                     mediaPreviewUrl={mediaPreviewUrl}
// //                     removeSelectedMedia={removeSelectedMedia}
// //                     error={error}
// //                     isEditing={editingMessageId !== null}
// //                     editingMessageId={editingMessageId}
// //                     sendingMessage={sendingMessage} // Pass sending status for new messages
// //                     isSavingEdit={isSavingEdit}   // Pass saving status for edits
// //                     handleSendMessage={handleSendMessage} // Pass base send handler
// //                     handleSaveEdit={handleSaveEdit} // Pass explicit save handler
// //                     handleCancelEdit={handleCancelEdit} // Pass explicit cancel handler
// //                     handleFileChange={(e) => {
// //                         // Clear selections if a file is being attached (only if not editing)
// //                         if (!editingMessageId) setSelectedMessages([]);
// //                         handleFileChange(e);
// //                     }}
// //                 />
// //             </div>

// //             {/* Image Preview Modal */}
// //             <ImagePreviewModal
// //                 imageUrl={previewImageUrl}
// //                 onClose={closeImagePreview}
// //             />

// //             {/* Custom Delete Confirmation Modal */}
// //             {showDeleteModal && (
// //                 <DeleteConfirmationModal
// //                     title={deleteModalTitle}
// //                     message={deleteModalMessage}
// //                     onConfirm={handleConfirmDelete}
// //                     onCancel={handleCancelDelete}
// //                 />
// //             )}
// //         </div>
// //     );
// // };

// // export default ChatWindow;




// // 'use client';

// // import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// // import { useAuth } from './AuthProvider';
// // import Skeleton from 'react-loading-skeleton';
// // import 'react-loading-skeleton/dist/skeleton.css';
// // import toast, { Toaster } from 'react-hot-toast';

// // // Import types from the shared file
// // import { Message, GeneralUser } from '../app/types';

// // // Import the new sub-components
// // import ChatHeader from '../components/chatHeader';
// // import MessageList from '../components/MessageList';
// // import ChatInput from '../components/chatInput';
// // import ImagePreviewModal from '../components/ImagePreviewModal';
// // import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// // // Define the props for ChatWindow
// // interface ChatWindowProps {
// //     isOpen: boolean;
// //     onClose: () => void;
// //     chatUser: GeneralUser;
// //     currentUserId: string;
// //     getFullMediaUrl: (relativePath?: string) => string;
// //     defaultAvatarUrl: string;
// //     onMessageSent: () => void;
// // }

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // const ChatWindow: FC<ChatWindowProps> = ({
// //     isOpen,
// //     onClose,
// //     chatUser,
// //     currentUserId,
// //     getFullMediaUrl,
// //     defaultAvatarUrl,
// //     onMessageSent,
// // }) => {
// //     const { getIdToken } = useAuth();
// //     const [messages, setMessages] = useState<Message[]>([]);
// //     const [newMessageContent, setNewMessageContent] = useState('');
// //     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
// //     const [sendingMessage, setSendingMessage] = useState(false);
// //     const [error, setError] = useState<string | null>(null);

// //     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
// //     const hasFetchedInitialMessages = useRef(false);

// //     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
// //     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
// //     const fileInputRef = useRef<HTMLInputElement>(null);

// //     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
// //     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

// //     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
// //     const [isSavingEdit, setIsSavingEdit] = useState(false);

// //     const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

// //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// //     const [deleteModalMessage, setDeleteModalMessage] = useState('');
// //     const [deleteModalTitle, setDeleteModalTitle] = useState('');
// //     const [confirmDeleteAction, setConfirmDeleteAction] = useState<(() => Promise<void>) | null>(null);

// //     // --- Message Selection Handlers ---
// //     const handleSelectMessage = useCallback((messageId: string) => {
// //         if (editingMessageId) {
// //             return;
// //         }
// //         setSelectedMessages(prevSelected => {
// //             if (prevSelected.includes(messageId)) {
// //                 return prevSelected.filter(id => id !== messageId);
// //             } else {
// //                 return [...prevSelected, messageId];
// //             }
// //         });
// //     }, [editingMessageId]);

// //     const handleClearSelection = useCallback(() => {
// //         setSelectedMessages([]);
// //     }, []);

// //     // --- Media Selection Handlers ---
// //     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
// //         if (editingMessageId) {
// //             toast.error("Cannot attach files while editing a message.");
// //             return;
// //         }

// //         if (e.target.files && e.target.files[0]) {
// //             const file = e.target.files[0];

// //             if (file.size > 20 * 1024 * 1024) {
// //                 toast.error('File size exceeds 20MB limit.');
// //                 setSelectedMedia(null);
// //                 setMediaPreviewUrl(null);
// //                 if (fileInputRef.current) fileInputRef.current.value = '';
// //                 return;
// //             }

// //             setSelectedMedia(file);
// //             setError(null);

// //             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
// //                 const reader = new FileReader();
// //                 reader.onloadend = () => {
// //                     setMediaPreviewUrl(reader.result as string);
// //                 };
// //                 reader.readAsDataURL(file);
// //             } else {
// //                 setMediaPreviewUrl(null);
// //             }
// //             setNewMessageContent('');
// //         }
// //     }, [editingMessageId]);

// //     const removeSelectedMedia = useCallback(() => {
// //         setSelectedMedia(null);
// //         setMediaPreviewUrl(null);
// //         if (fileInputRef.current) {
// //             fileInputRef.current.value = '';
// //         }
// //         setError(null);
// //     }, []);

// //     // --- Conversation ID Fetching ---
// //     useEffect(() => {
// //         const findConversationId = async () => {
// //             if (!isOpen || !chatUser || !currentUserId) return;

// //             setLoadingInitialMessages(true);
// //             hasFetchedInitialMessages.current = false;
// //             setError(null);

// //             try {
// //                 const token = await getIdToken();
// //                 if (!token) throw new Error('Authentication required.');

// //                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
// //                     headers: { 'Authorization': `Bearer ${token}` },
// //                 });
// //                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

// //                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
// //                 const existingConv = conversations.find(conv =>
// //                     conv.otherParticipant?._id === chatUser._id
// //                 );

// //                 if (existingConv) {
// //                     setCurrentConversationId(existingConv._id);
// //                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
// //                 } else {
// //                     setCurrentConversationId(null);
// //                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
// //                 }
// //             } catch (err) {
// //                 console.error('[ChatWindow] Error finding conversation ID:', err);
// //                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
// //                 setLoadingInitialMessages(false);
// //             }
// //         };

// //         if (isOpen) {
// //             findConversationId();
// //         }
// //     }, [isOpen, chatUser, currentUserId, getIdToken]);

// //     // --- Message Fetching ---
// //     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
// //         if (!isOpen) {
// //             setLoadingInitialMessages(false);
// //             setMessages([]);
// //             return;
// //         }

// //         if (!currentConversationId && !isInitialFetch) {
// //             setLoadingInitialMessages(false);
// //             setMessages([]);
// //             return;
// //         }

// //         if (isInitialFetch) {
// //             setLoadingInitialMessages(true);
// //             setError(null);
// //         }

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             if (currentConversationId) {
// //                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
// //                     headers: { 'Authorization': `Bearer ${token}` },
// //                 });

// //                 if (!response.ok) {
// //                     const errorData = await response.json().catch(() => ({}));
// //                     throw new Error(errorData.message || 'Failed to fetch messages.');
// //                 }

// //                 const data: Message[] = await response.json();
// //                 setMessages(data);
// //                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
// //             } else {
// //                 setMessages([]);
// //             }
// //             hasFetchedInitialMessages.current = true;
// //         } catch (err) {
// //             console.error('[ChatWindow] Error fetching messages:', err);
// //             setError(err instanceof Error ? err.message : 'Failed to load messages.');
// //         } finally {
// //             if (isInitialFetch) {
// //                 setLoadingInitialMessages(false);
// //             }
// //         }
// //     }, [isOpen, currentConversationId, getIdToken]);

// //     useEffect(() => {
// //         let interval: NodeJS.Timeout;

// //         if (isOpen) {
// //             fetchMessages(true);
// //             interval = setInterval(() => {
// //                 fetchMessages(false);
// //             }, 5000);
// //         } else {
// //             clearInterval(interval);
// //             setMessages([]);
// //             setCurrentConversationId(null);
// //             setNewMessageContent('');
// //             setSelectedMedia(null);
// //             setMediaPreviewUrl(null);
// //             setIsImagePreviewOpen(false);
// //             setPreviewImageUrl(null);
// //             setEditingMessageId(null);
// //             setNewMessageContent('');
// //             setIsSavingEdit(false);
// //             setError(null);
// //             setLoadingInitialMessages(true);
// //             setSelectedMessages([]);
// //             hasFetchedInitialMessages.current = false;
// //         }

// //         return () => clearInterval(interval);
// //     }, [isOpen, currentConversationId, fetchMessages]);

// //     // --- Message Sending Handler ---
// //     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
// //         e?.preventDefault();
// //         const textContent = newMessageContent.trim();

// //         if (!textContent && !selectedMedia) {
// //             toast.error('Please type a message or select a file.');
// //             return;
// //         }
// //         if (sendingMessage) return;

// //         setSendingMessage(true);
// //         setError(null);

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             let response;
// //             let sentMessage: Message;

// //             if (selectedMedia) {
// //                 const formData = new FormData();
// //                 formData.append('media', selectedMedia);
// //                 if (textContent) {
// //                     formData.append('content', textContent);
// //                 }

// //                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Authorization': `Bearer ${token}`,
// //                     },
// //                     body: formData,
// //                 });
// //             } else {
// //                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
// //                     method: 'POST',
// //                     headers: {
// //                         'Authorization': `Bearer ${token}`,
// //                         'Content-Type': 'application/json',
// //                     },
// //                     body: JSON.stringify({ content: textContent }),
// //                 });
// //             }

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
// //                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
// //             }

// //             sentMessage = await response.json();
// //             console.log("[ChatWindow] Message sent:", sentMessage);

// //             if (!currentConversationId && sentMessage.conversationId) {
// //                 setCurrentConversationId(sentMessage.conversationId);
// //             }

// //             setMessages(prev => [...prev, { ...sentMessage, isDeleted: false, isEdited: false }]);
// //             setNewMessageContent('');
// //             removeSelectedMedia();
// //             onMessageSent();
// //             setSelectedMessages([]);
// //         } catch (err) {
// //             console.error('[ChatWindow] Error sending message:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
// //         } finally {
// //             setSendingMessage(false);
// //         }
// //     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

// //     // --- Message Editing Handlers ---
// //     const handleEditClick = useCallback((message: Message) => {
// //         if (message.sender._id !== currentUserId || message.isDeleted) {
// //             toast.error("You can only edit your own non-deleted messages.");
// //             return;
// //         }
// //         setSelectedMessages([]);
// //         setEditingMessageId(message._id);
// //         setNewMessageContent(message.content || '');
// //         removeSelectedMedia();
// //         console.log(`[ChatWindow] Started editing message: ${message._id}`);
// //     }, [currentUserId, removeSelectedMedia]);

// //     const handleSaveEdit = useCallback(async (e?: React.FormEvent) => {
// //         e?.preventDefault();
// //         if (!editingMessageId || isSavingEdit) return;

// //         const contentToSave = newMessageContent.trim();
// //         if (!contentToSave) {
// //             toast.error('Message content cannot be empty.');
// //             return;
// //         }

// //         setIsSavingEdit(true);
// //         setError(null);

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
// //                 method: 'PUT',
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({ content: contentToSave }),
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 throw new Error(errorData.message || 'Failed to edit message.');
// //             }

// //             const updatedMessage: Message = await response.json();
// //             setMessages(prevMessages =>
// //                 prevMessages.map(msg =>
// //                     msg._id === editingMessageId ? {
// //                         ...msg,
// //                         content: updatedMessage.content,
// //                         updatedAt: updatedMessage.updatedAt,
// //                         isEdited: true
// //                     } : msg
// //                 )
// //             );

// //             setEditingMessageId(null);
// //             setNewMessageContent('');
// //             toast.success('Message edited successfully!');
// //             console.log(`[ChatWindow] Message ${editingMessageId} edited successfully`);
// //         } catch (err) {
// //             console.error('[ChatWindow] Error editing message:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to edit message.');
// //         } finally {
// //             setIsSavingEdit(false);
// //         }
// //     }, [editingMessageId, newMessageContent, getIdToken, isSavingEdit]);

// //     const handleCancelEdit = useCallback(() => {
// //         setEditingMessageId(null);
// //         setNewMessageContent('');
// //         setIsSavingEdit(false);
// //         setError(null);
// //         console.log(`[ChatWindow] Cancelled editing`);
// //     }, []);

// //     // --- Message Deletion Handlers with Custom Modal ---
// //     const confirmAndDeleteSelectedMessages = useCallback(async () => {
// //         setError(null);

// //         const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
// //         const userOwnedMessages = messagesToDelete.filter(msg => msg.sender._id === currentUserId);
// //         const otherUserMessages = messagesToDelete.filter(msg => msg.sender._id !== currentUserId);

// //         if (messagesToDelete.length === 0) {
// //             toast.error('No messages selected for deletion.');
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //             return;
// //         }

// //         if (otherUserMessages.length > 0 && userOwnedMessages.length === 0) {
// //             toast.error('You can only delete your own messages.');
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //             setSelectedMessages([]);
// //             return;
// //         } else if (otherUserMessages.length > 0 && userOwnedMessages.length > 0) {
// //             toast.error(`You can only delete your ${userOwnedMessages.length} message(s). ${otherUserMessages.length} message(s) from other users will not be deleted.`);
// //         }

// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const results = await Promise.allSettled(
// //                 userOwnedMessages.map(message =>
// //                     fetch(`${API_BASE_URL}/chats/message/${message._id}`, {
// //                         method: 'DELETE',
// //                         headers: { 'Authorization': `Bearer ${token}` },
// //                     })
// //                 )
// //             );

// //             const failedDeletions = results.filter(result =>
// //                 result.status === 'rejected' ||
// //                 (result.status === 'fulfilled' && !result.value.ok)
// //             );

// //             if (failedDeletions.length > 0) {
// //                 if (failedDeletions.length === userOwnedMessages.length && otherUserMessages.length === 0) {
// //                     toast.error('Failed to delete all your selected messages.');
// //                 } else {
// //                     toast.error(`Failed to delete ${failedDeletions.length} of your message(s).`);
// //                 }
// //             } else if (userOwnedMessages.length > 0) {
// //                 toast.success('Selected message(s) deleted successfully!');
// //             }

// //             await fetchMessages(false);
// //             setSelectedMessages([]);
// //             onMessageSent();
// //         } catch (err) {
// //             console.error('[ChatWindow] Error deleting selected messages:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
// //         } finally {
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //         }
// //     }, [selectedMessages, messages, currentUserId, getIdToken, fetchMessages, onMessageSent, setSelectedMessages]);

// //     const handleDeleteSelectedMessages = useCallback(() => {
// //         if (selectedMessages.length === 0) return;

// //         setDeleteModalTitle('Delete Selected Messages');
// //         setDeleteModalMessage(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`);
// //         setConfirmDeleteAction(() => confirmAndDeleteSelectedMessages);
// //         setShowDeleteModal(true);
// //     }, [selectedMessages, confirmAndDeleteSelectedMessages]);

// //     const confirmAndDeleteAllMessages = useCallback(async () => {
// //         if (!currentConversationId) return;

// //         setError(null);
// //         try {
// //             const token = await getIdToken();
// //             if (!token) throw new Error('Authentication required.');

// //             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
// //                 method: 'DELETE',
// //                 headers: { 'Authorization': `Bearer ${token}` },
// //             });

// //             if (!response.ok) {
// //                 const errorData = await response.json().catch(() => ({}));
// //                 throw new Error(errorData.message || 'Failed to delete all messages.');
// //             }

// //             setMessages([]);
// //             setSelectedMessages([]);
// //             onMessageSent();
// //             toast.success('All messages are deleted successfully!');
// //         } catch (err) {
// //             console.error('[ChatWindow] Error deleting all messages:', err);
// //             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
// //         } finally {
// //             setShowDeleteModal(false);
// //             setConfirmDeleteAction(null);
// //         }
// //     }, [currentConversationId, getIdToken, onMessageSent, setSelectedMessages, setMessages]);

// //     const handleDeleteAllMessages = useCallback(() => {
// //         if (!currentConversationId) return;

// //         setDeleteModalTitle('Delete All Messages');
// //         setDeleteModalMessage('Are you sure you want to delete ALL your messages in this conversation? This action cannot be undone.');
// //         setConfirmDeleteAction(() => confirmAndDeleteAllMessages);
// //         setShowDeleteModal(true);
// //     }, [currentConversationId, confirmAndDeleteAllMessages]);

// //     // Handlers for the custom DeleteConfirmationModal
// //     const handleConfirmDelete = async () => {
// //         if (confirmDeleteAction) {
// //             await confirmDeleteAction();
// //         }
// //     };

// //     const handleCancelDelete = () => {
// //         setShowDeleteModal(false);
// //         setConfirmDeleteAction(null);
// //     };

// //     // --- Image Preview Handlers ---
// //     const openImagePreview = useCallback((imageUrl: string) => {
// //         setPreviewImageUrl(imageUrl);
// //         setIsImagePreviewOpen(true);
// //     }, []);

// //     const closeImagePreview = useCallback(() => {
// //         setIsImagePreviewOpen(false);
// //         setPreviewImageUrl(null);
// //     }, []);

// //     // If the chat window is not open, return null to render nothing
// //     if (!isOpen) {
// //         return null;
// //     }

// //     return (
// //         // Outermost div for the backdrop, handling clicks outside the chat content
// //         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4"
// //              onClick={onClose}> {/* Click outside to close */}
// //             <Toaster position="top-center" reverseOrder={false} />
// //             {/* Inner div for the actual chat content, preventing propagation of clicks */}
// //             <div className="relative w-full max-w-lg h-[90vh] top-8 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
// //                  onClick={(e) => e.stopPropagation()}> {/* Prevent clicks here from closing the window */}
// //                 {/* Header */}
// //                 <ChatHeader
// //                     chatUser={chatUser}
// //                     defaultAvatarUrl={defaultAvatarUrl}
// //                     getFullMediaUrl={getFullMediaUrl}
// //                     onClose={onClose}
// //                     showActionsMenu={selectedMessages.length > 0 || !editingMessageId}
// //                     onDeleteSelected={handleDeleteSelectedMessages}
// //                     onDeleteAll={handleDeleteAllMessages}
// //                     onClearSelection={handleClearSelection}
// //                     selectedMessages={selectedMessages}
// //                     messages={messages}
// //                     currentUserId={currentUserId}
// //                     onEditMessage={handleEditClick}
// //                     isEditing={editingMessageId !== null}
// //                 />

// //                 {/* Messages Area */}
// //                 <MessageList
// //                     messages={messages.filter(msg => !msg.isDeleted)}
// //                     loading={loadingInitialMessages}
// //                     error={error}
// //                     currentUserId={currentUserId}
// //                     getFullMediaUrl={getFullMediaUrl}
// //                     defaultAvatarUrl={defaultAvatarUrl}
// //                     onOpenImagePreview={openImagePreview}
// //                     selectedMessages={selectedMessages}
// //                     onSelectMessage={handleSelectMessage}
// //                     onEditMessage={handleEditClick}
// //                     editingMessageId={editingMessageId}
// //                 />

// //                 {/* Message Input and Attachment Button */}
// //                 <ChatInput
// //                     newMessageContent={newMessageContent}
// //                     setNewMessageContent={setNewMessageContent}
// //                     selectedMedia={selectedMedia}
// //                     mediaPreviewUrl={mediaPreviewUrl}
// //                     removeSelectedMedia={removeSelectedMedia}
// //                     error={error}
// //                     isEditing={editingMessageId !== null}
// //                     editingMessageId={editingMessageId}
// //                     sendingMessage={sendingMessage}
// //                     isSavingEdit={isSavingEdit}
// //                     handleSendMessage={handleSendMessage}
// //                     handleSaveEdit={handleSaveEdit}
// //                     handleCancelEdit={handleCancelEdit}
// //                     handleFileChange={(e) => {
// //                         if (!editingMessageId) setSelectedMessages([]);
// //                         handleFileChange(e);
// //                     }}
// //                 />
// //             </div>

// //             {/* Image Preview Modal */}
// //             <ImagePreviewModal
// //                 imageUrl={previewImageUrl}
// //                 onClose={closeImagePreview}
// //             />

// //             {/* Custom Delete Confirmation Modal */}
// //             {showDeleteModal && (
// //                 <DeleteConfirmationModal
// //                     title={deleteModalTitle}
// //                     message={deleteModalMessage}
// //                     onConfirm={handleConfirmDelete}
// //                     onCancel={handleCancelDelete}
// //                 />
// //             )}
// //         </div>
// //     );
// // };

// // export default ChatWindow;







// 'use client';

// import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// import { useAuth } from './AuthProvider';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import toast, { Toaster } from 'react-hot-toast';

// // Import types from the shared file
// import { Message, GeneralUser } from '../app/types';

// // Import the new sub-components
// import ChatHeader from '../components/chatHeader';
// import MessageList from '../components/MessageList';
// import ChatInput from '../components/chatInput';
// import ImagePreviewModal from '../components/ImagePreviewModal';
// import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// // Define the props for ChatWindow
// interface ChatWindowProps {
//     isOpen: boolean;
//     onClose: () => void;
//     chatUser: GeneralUser;
//     currentUserId: string;
//     getFullMediaUrl: (relativePath?: string) => string;
//     defaultAvatarUrl: string;
//     onMessageSent: () => void;
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// const ChatWindow: FC<ChatWindowProps> = ({
//     isOpen,
//     onClose,
//     chatUser,
//     currentUserId,
//     getFullMediaUrl,
//     defaultAvatarUrl,
//     onMessageSent,
// }) => {
//     const { getIdToken } = useAuth();
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [newMessageContent, setNewMessageContent] = useState('');
//     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
//     const [sendingMessage, setSendingMessage] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
//     const hasFetchedInitialMessages = useRef(false);

//     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
//     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
//     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

//     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
//     const [isSavingEdit, setIsSavingEdit] = useState(false);

//     const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [deleteModalMessage, setDeleteModalMessage] = useState('');
//     const [deleteModalTitle, setDeleteModalTitle] = useState('');
//     const [confirmDeleteAction, setConfirmDeleteAction] = useState<(() => Promise<void>) | null>(null);

//     const [currentThemeImage, setCurrentThemeImage] = useState<string | null>(null);

//     // --- Message Selection Handlers ---
//     const handleSelectMessage = useCallback((messageId: string) => {
//         if (editingMessageId) {
//             return;
//         }
//         setSelectedMessages(prevSelected => {
//             if (prevSelected.includes(messageId)) {
//                 return prevSelected.filter(id => id !== messageId);
//             } else {
//                 return [...prevSelected, messageId];
//             }
//         });
//     }, [editingMessageId]);

//     const handleClearSelection = useCallback(() => {
//         setSelectedMessages([]);
//     }, []);

//     // --- Media Selection Handlers ---
//     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//         if (editingMessageId) {
//             toast.error("Cannot attach files while editing a message.");
//             return;
//         }

//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];

//             if (file.size > 20 * 1024 * 1024) {
//                 toast.error('File size exceeds 20MB limit.');
//                 setSelectedMedia(null);
//                 setMediaPreviewUrl(null);
//                 if (fileInputRef.current) fileInputRef.current.value = '';
//                 return;
//             }

//             setSelectedMedia(file);
//             setError(null);

//             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     setMediaPreviewUrl(reader.result as string);
//                 };
//                 reader.readAsDataURL(file);
//             } else {
//                 setMediaPreviewUrl(null);
//             }
//             setNewMessageContent('');
//         }
//     }, [editingMessageId]);

//     const removeSelectedMedia = useCallback(() => {
//         setSelectedMedia(null);
//         setMediaPreviewUrl(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//         setError(null);
//     }, []);

//     // --- Conversation ID Fetching ---
//     useEffect(() => {
//         const findConversationId = async () => {
//             if (!isOpen || !chatUser || !currentUserId) return;

//             setLoadingInitialMessages(true);
//             hasFetchedInitialMessages.current = false;
//             setError(null);

//             try {
//                 const token = await getIdToken();
//                 if (!token) throw new Error('Authentication required.');

//                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 });
//                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

//                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
//                 const existingConv = conversations.find(conv =>
//                     conv.otherParticipant?._id === chatUser._id
//                 );

//                 if (existingConv) {
//                     setCurrentConversationId(existingConv._id);
//                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
//                 } else {
//                     setCurrentConversationId(null);
//                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
//                 }
//             } catch (err) {
//                 console.error('[ChatWindow] Error finding conversation ID:', err);
//                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
//                 setLoadingInitialMessages(false);
//             }
//         };

//         if (isOpen) {
//             findConversationId();
//         }
//     }, [isOpen, chatUser, currentUserId, getIdToken]);

//     // --- Message Fetching ---
//     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
//         if (!isOpen) {
//             setLoadingInitialMessages(false);
//             setMessages([]);
//             return;
//         }

//         if (!currentConversationId && !isInitialFetch) {
//             setLoadingInitialMessages(false);
//             setMessages([]);
//             return;
//         }

//         if (isInitialFetch) {
//             setLoadingInitialMessages(true);
//             setError(null);
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             if (currentConversationId) {
//                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({}));
//                     throw new Error(errorData.message || 'Failed to fetch messages.');
//                 }

//                 const data: Message[] = await response.json();
//                 setMessages(data);
//                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
//             } else {
//                 setMessages([]);
//             }
//             hasFetchedInitialMessages.current = true;
//         } catch (err) {
//             console.error('[ChatWindow] Error fetching messages:', err);
//             setError(err instanceof Error ? err.message : 'Failed to load messages.');
//         } finally {
//             if (isInitialFetch) {
//                 setLoadingInitialMessages(false);
//             }
//         }
//     }, [isOpen, currentConversationId, getIdToken]);

//     useEffect(() => {
//         let interval: NodeJS.Timeout;

//         if (isOpen) {
//             fetchMessages(true);
//             interval = setInterval(() => {
//                 fetchMessages(false);
//             }, 5000);
//         } else {
//             clearInterval(interval);
//             setMessages([]);
//             setCurrentConversationId(null);
//             setNewMessageContent('');
//             setSelectedMedia(null);
//             setMediaPreviewUrl(null);
//             setIsImagePreviewOpen(false);
//             setPreviewImageUrl(null);
//             setEditingMessageId(null);
//             setNewMessageContent('');
//             setIsSavingEdit(false);
//             setError(null);
//             setLoadingInitialMessages(true);
//             setSelectedMessages([]);
//             hasFetchedInitialMessages.current = false;
//             setCurrentThemeImage(null);
//         }

//         return () => clearInterval(interval);
//     }, [isOpen, currentConversationId, fetchMessages]);

//     // --- Message Sending Handler ---
//     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
//         e?.preventDefault();
//         const textContent = newMessageContent.trim();

//         if (!textContent && !selectedMedia) {
//             toast.error('Please type a message or select a file.');
//             return;
//         }
//         if (sendingMessage) return;

//         setSendingMessage(true);
//         setError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             let response;
//             let sentMessage: Message;

//             if (selectedMedia) {
//                 const formData = new FormData();
//                 formData.append('media', selectedMedia);
//                 if (textContent) {
//                     formData.append('content', textContent);
//                 }

//                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                     body: formData,
//                 });
//             } else {
//                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ content: textContent }),
//                 });
//             }

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
//                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
//             }

//             sentMessage = await response.json();
//             console.log("[ChatWindow] Message sent:", sentMessage);

//             if (!currentConversationId && sentMessage.conversationId) {
//                 setCurrentConversationId(sentMessage.conversationId);
//             }

//             setMessages(prev => [...prev, { ...sentMessage, isDeleted: false, isEdited: false }]);
//             setNewMessageContent('');
//             removeSelectedMedia();
//             onMessageSent();
//             setSelectedMessages([]);
//         } catch (err) {
//             console.error('[ChatWindow] Error sending message:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
//         } finally {
//             setSendingMessage(false);
//         }
//     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia]);

//     // --- Message Editing Handlers ---
//     const handleEditClick = useCallback((message: Message) => {
//         if (message.sender._id !== currentUserId || message.isDeleted) {
//             toast.error("You can only edit your own non-deleted messages.");
//             return;
//         }
//         setSelectedMessages([]);
//         setEditingMessageId(message._id);
//         setNewMessageContent(message.content || '');
//         removeSelectedMedia();
//         console.log(`[ChatWindow] Started editing message: ${message._id}`);
//     }, [currentUserId, removeSelectedMedia]);

//     const handleSaveEdit = useCallback(async (e?: React.FormEvent) => {
//         e?.preventDefault();
//         if (!editingMessageId || isSavingEdit) return;

//         const contentToSave = newMessageContent.trim();
//         if (!contentToSave) {
//             toast.error('Message content cannot be empty.');
//             return;
//         }

//         setIsSavingEdit(true);
//         setError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ content: contentToSave }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to edit message.');
//             }

//             const updatedMessage: Message = await response.json();
//             setMessages(prevMessages =>
//                 prevMessages.map(msg =>
//                     msg._id === editingMessageId ? {
//                         ...msg,
//                         content: updatedMessage.content,
//                         updatedAt: updatedMessage.updatedAt,
//                         isEdited: true
//                     } : msg
//                 )
//             );

//             setEditingMessageId(null);
//             setNewMessageContent('');
//             toast.success('Message edited successfully!');
//             console.log(`[ChatWindow] Message ${editingMessageId} edited successfully`);
//         } catch (err) {
//             console.error('[ChatWindow] Error editing message:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to edit message.');
//         } finally {
//             setIsSavingEdit(false);
//         }
//     }, [editingMessageId, newMessageContent, getIdToken, isSavingEdit]);

//     const handleCancelEdit = useCallback(() => {
//         setEditingMessageId(null);
//         setNewMessageContent('');
//         setIsSavingEdit(false);
//         setError(null);
//         console.log(`[ChatWindow] Cancelled editing`);
//     }, []);

//     // --- Message Deletion Handlers with Custom Modal ---
//     const confirmAndDeleteSelectedMessages = useCallback(async () => {
//         setError(null);

//         const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
//         const userOwnedMessages = messagesToDelete.filter(msg => msg.sender._id === currentUserId);
//         const otherUserMessages = messagesToDelete.filter(msg => msg.sender._id !== currentUserId);

//         if (messagesToDelete.length === 0) {
//             toast.error('No messages selected for deletion.');
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//             return;
//         }

//         if (otherUserMessages.length > 0 && userOwnedMessages.length === 0) {
//             toast.error('You can only delete your own messages.');
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//             setSelectedMessages([]);
//             return;
//         } else if (otherUserMessages.length > 0 && userOwnedMessages.length > 0) {
//             toast.error(`You can only delete your ${userOwnedMessages.length} message(s). ${otherUserMessages.length} message(s) from other users will not be deleted.`);
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const results = await Promise.allSettled(
//                 userOwnedMessages.map(message =>
//                     fetch(`${API_BASE_URL}/chats/message/${message._id}`, {
//                         method: 'DELETE',
//                         headers: { 'Authorization': `Bearer ${token}` },
//                     })
//                 )
//             );

//             const failedDeletions = results.filter(result =>
//                 result.status === 'rejected' ||
//                 (result.status === 'fulfilled' && !result.value.ok)
//             );

//             if (failedDeletions.length > 0) {
//                 if (failedDeletions.length === userOwnedMessages.length && otherUserMessages.length === 0) {
//                     toast.error('Failed to delete all your selected messages.');
//                 } else {
//                     toast.error(`Failed to delete ${failedDeletions.length} of your message(s).`);
//                 }
//             } else if (userOwnedMessages.length > 0) {
//                 toast.success('Selected message(s) deleted successfully!');
//             }

//             await fetchMessages(false);
//             setSelectedMessages([]);
//             onMessageSent();
//         } catch (err) {
//             console.error('[ChatWindow] Error deleting selected messages:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
//         } finally {
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//         }
//     }, [selectedMessages, messages, currentUserId, getIdToken, fetchMessages, onMessageSent, setSelectedMessages]);

//     const handleDeleteSelectedMessages = useCallback(() => {
//         if (selectedMessages.length === 0) return;

//         setDeleteModalTitle('Delete Selected Messages');
//         setDeleteModalMessage(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`);
//         setConfirmDeleteAction(() => confirmAndDeleteSelectedMessages);
//         setShowDeleteModal(true);
//     }, [selectedMessages, confirmAndDeleteSelectedMessages]);

//     const confirmAndDeleteAllMessages = useCallback(async () => {
//         if (!currentConversationId) return;

//         setError(null);
//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${token}` },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to delete all messages.');
//             }

//             setMessages([]);
//             setSelectedMessages([]);
//             onMessageSent();
//             toast.success('All messages are deleted successfully!');
//         } catch (err) {
//             console.error('[ChatWindow] Error deleting all messages:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
//         } finally {
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//         }
//     }, [currentConversationId, getIdToken, onMessageSent, setSelectedMessages, setMessages]);

//     const handleDeleteAllMessages = useCallback(() => {
//         if (!currentConversationId) return;

//         setDeleteModalTitle('Delete All Messages');
//         setDeleteModalMessage('Are you sure you want to delete ALL your messages in this conversation? This action cannot be undone.');
//         setConfirmDeleteAction(() => confirmAndDeleteAllMessages);
//         setShowDeleteModal(true);
//     }, [currentConversationId, confirmAndDeleteAllMessages]);

//     // Handlers for the custom DeleteConfirmationModal
//     const handleConfirmDelete = async () => {
//         if (confirmDeleteAction) {
//             await confirmDeleteAction();
//         }
//     };

//     const handleCancelDelete = () => {
//         setShowDeleteModal(false);
//         setConfirmDeleteAction(null);
//     };

//     // --- Image Preview Handlers ---
//     const openImagePreview = useCallback((imageUrl: string) => {
//         setPreviewImageUrl(imageUrl);
//         setIsImagePreviewOpen(true);
//     }, []);

//     const closeImagePreview = useCallback(() => {
//         setIsImagePreviewOpen(false);
//         setPreviewImageUrl(null);
//     }, []);

//     // --- Theme Change Handler ---
//     const handleThemeChange = useCallback((imageUrl: string | null) => {
//         setCurrentThemeImage(imageUrl);
//         if (imageUrl) {
//             localStorage.setItem('chatTheme', imageUrl);
//         } else {
//             localStorage.removeItem('chatTheme');
//         }
//     }, []);

//     // Load theme from local storage on component mount
//     useEffect(() => {
//         const savedTheme = localStorage.getItem('chatTheme');
//         if (savedTheme) {
//             setCurrentThemeImage(savedTheme);
//         }
//     }, []);


//     // If the chat window is not open, return null to render nothing
//     if (!isOpen) {
//         return null;
//     }

//     return (
//         <div className="fixed inset-0 top-14 h-[95vh] z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-4"
//              onClick={onClose}>
//             <Toaster position="top-center" reverseOrder={false} />
//             <div className="relative w-full max-w-lg h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
//                  onClick={(e) => e.stopPropagation()}>
//                 {/* Header */}
//                 <ChatHeader
//                     chatUser={chatUser}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     getFullMediaUrl={getFullMediaUrl}
//                     onClose={onClose}
//                     showActionsMenu={selectedMessages.length > 0 || !editingMessageId}
//                     onDeleteSelected={handleDeleteSelectedMessages}
//                     onDeleteAll={handleDeleteAllMessages}
//                     onClearSelection={handleClearSelection}
//                     selectedMessages={selectedMessages}
//                     messages={messages}
//                     currentUserId={currentUserId}
//                     onEditMessage={handleEditClick} // Corrected: passing handleEditClick
//                     isEditing={editingMessageId !== null}
//                     onThemeChange={handleThemeChange}
//                     currentThemeImage={currentThemeImage}
//                 />

//                 {/* Messages Area */}
//                 <MessageList
//                     messages={messages.filter(msg => !msg.isDeleted)}
//                     loading={loadingInitialMessages}
//                     error={error}
//                     currentUserId={currentUserId}
//                     getFullMediaUrl={getFullMediaUrl}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     onOpenImagePreview={openImagePreview}
//                     selectedMessages={selectedMessages}
//                     onSelectMessage={handleSelectMessage}
//                     onEditMessage={handleEditClick} // Corrected: passing handleEditClick
//                     editingMessageId={editingMessageId}
//                     backgroundImageUrl={currentThemeImage}
//                 />

//                 {/* Message Input and Attachment Button */}
//                 <ChatInput
//                     newMessageContent={newMessageContent}
//                     setNewMessageContent={setNewMessageContent}
//                     selectedMedia={selectedMedia}
//                     mediaPreviewUrl={mediaPreviewUrl}
//                     removeSelectedMedia={removeSelectedMedia}
//                     error={error}
//                     isEditing={editingMessageId !== null}
//                     editingMessageId={editingMessageId}
//                     sendingMessage={sendingMessage}
//                     isSavingEdit={isSavingEdit}
//                     handleSendMessage={handleSendMessage}
//                     handleSaveEdit={handleSaveEdit}
//                     handleCancelEdit={handleCancelEdit}
//                     handleFileChange={(e) => {
//                         if (!editingMessageId) setSelectedMessages([]);
//                         handleFileChange(e);
//                     }}
//                 />
//             </div>

//             {/* Image Preview Modal */}
//             <ImagePreviewModal
//                 imageUrl={previewImageUrl}
//                 onClose={closeImagePreview}
//             />

//             {/* Custom Delete Confirmation Modal */}
//             {showDeleteModal && (
//                 <DeleteConfirmationModal
//                     title={deleteModalTitle}
//                     message={deleteModalMessage}
//                     onConfirm={handleConfirmDelete}
//                     onCancel={handleCancelDelete}
//                 />
//             )}
//         </div>
//     );
// };

// export default ChatWindow;



// 'use client';

// import { v4 as uuid } from 'uuid';
// import React, { useEffect, useState, useCallback, useRef, FC } from 'react';
// import { useAuth } from './AuthProvider';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import toast, { Toaster } from 'react-hot-toast';

// // Import types from the shared file
// import { Message, GeneralUser } from '../app/types';

// // Import the new sub-components
// import ChatHeader from '../components/chatHeader';
// import MessageList from '../components/MessageList';
// import ChatInput from '../components/chatInput';
// import ImagePreviewModal from '../components/ImagePreviewModal';
// import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// // Define the props for ChatWindow
// interface ChatWindowProps {
//     isOpen: boolean;
//     onClose: () => void;
//     chatUser: GeneralUser;
//     currentUserId: string;
//     getFullMediaUrl: (relativePath?: string) => string;
//     defaultAvatarUrl: string;
//     onMessageSent: () => void;
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// const ChatWindow: FC<ChatWindowProps> = ({
//     isOpen,
//     onClose,
//     chatUser,
//     currentUserId,
//     getFullMediaUrl,
//     defaultAvatarUrl,
//     onMessageSent,
// }) => {
//     const { getIdToken } = useAuth();
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [newMessageContent, setNewMessageContent] = useState('');
//     const [loadingInitialMessages, setLoadingInitialMessages] = useState(true);
//     const [sendingMessage, setSendingMessage] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
//     const hasFetchedInitialMessages = useRef(false);

//     const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
//     const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
//     const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
//     const [isSavingEdit, setIsSavingEdit] = useState(false);

//     const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [deleteModalMessage, setDeleteModalMessage] = useState('');
//     const [deleteModalTitle, setDeleteModalTitle] = useState('');
//     const [confirmDeleteAction, setConfirmDeleteAction] = useState<(() => Promise<void>) | null>(null);

//     const [currentThemeImage, setCurrentThemeImage] = useState<string | null>(null);

//     const [uploadingMessage, setUploadingMessage] = useState<{
//         tempId: string;
//         mediaType: 'image' | 'video' | 'audio' | 'file';
//     } | null>(null);

//     // State for the other user's typing status
//     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
//     const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


//     // --- Typing Indicator Logic ---
//     // This function would typically be called by your WebSocket listener
//     // when a "typing" event is received from the server for the other user.
//     const handleOtherUserTyping = useCallback(() => {
//         setIsOtherUserTyping(true);
//         // Clear any previous timeout to keep the indicator active
//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }
//         // Set a new timeout to hide the indicator after a short delay (e.g., 2 seconds)
//         // if no further typing events are received.
//         typingTimeoutRef.current = setTimeout(() => {
//             setIsOtherUserTyping(false);
//         }, 2000);
//     }, []);

//     // Placeholder for how you might receive typing status from a real-time API
//     // In a real application, you'd listen to your WebSocket for messages like:
//     // socket.on('typing_status', (data) => {
//     //   if (data.userId === chatUser._id && data.isTyping) {
//     //     handleOtherUserTyping();
//     //   } else if (data.userId === chatUser._id && !data.isTyping) {
//     //     // Optionally, handle explicit stop typing events
//     //     setIsOtherUserTyping(false);
//     //     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//     //   }
//     // });

//     // This handles local user typing and could emit events to a backend
//     const handleNewMessageContentChange = useCallback((content: string) => {
//         setNewMessageContent(content);

//         // --- Simulate sending typing events to the server ---
//         // In a real application, you'd send this via WebSocket:
//         // socket.emit('typing', { conversationId: currentConversationId, isTyping: true });

//         // Optionally, if you want to also handle the local user's typing indicator
//         // or ensure that 'stopped typing' is sent after a delay:
//         // if (typingTimeoutRef.current) {
//         //     clearTimeout(typingTimeoutRef.current);
//         // }
//         // typingTimeoutRef.current = setTimeout(() => {
//         //     // socket.emit('typing', { conversationId: currentConversationId, isTyping: false });
//         //     // setIsMyUserTyping(false); // If you have a state for your own typing
//         // }, 1500); // Send 'stopped typing' after 1.5 seconds of no new input
//     }, []);


//     // --- Message Selection Handlers ---
//     const handleSelectMessage = useCallback((messageId: string) => {
//         if (editingMessageId) {
//             return;
//         }
//         setSelectedMessages(prevSelected => {
//             if (prevSelected.includes(messageId)) {
//                 return prevSelected.filter(id => id !== messageId);
//             } else {
//                 return [...prevSelected, messageId];
//             }
//         });
//     }, [editingMessageId]);

//     const handleClearSelection = useCallback(() => {
//         setSelectedMessages([]);
//     }, []);

//     // --- Media Selection Handlers ---
//     const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//         if (editingMessageId) {
//             toast.error("Cannot attach files while editing a message.");
//             return;
//         }

//         if (e.target.files && e.target.files[0]) {
//             const file = e.target.files[0];

//             if (file.size > 20 * 1024 * 1024) {
//                 toast.error('File size exceeds 20MB limit.');
//                 setSelectedMedia(null);
//                 setMediaPreviewUrl(null);
//                 if (fileInputRef.current) fileInputRef.current.value = '';
//                 return;
//             }

//             setSelectedMedia(file);
//             setError(null);

//             // Create preview URL for image/video or null for others
//             if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     setMediaPreviewUrl(reader.result as string);
//                 };
//                 reader.readAsDataURL(file);
//             } else {
//                 setMediaPreviewUrl(null);
//             }
//             setNewMessageContent(''); // Clear text content when media is selected
//         }
//     }, [editingMessageId]);

//     const removeSelectedMedia = useCallback(() => {
//         setSelectedMedia(null);
//         setMediaPreviewUrl(null);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//         setError(null);
//         // Clear uploadingMessage if a media was selected but then removed before sending
//         setUploadingMessage(null);
//     }, []);

//     // --- Conversation ID Fetching ---
//     useEffect(() => {
//         const findConversationId = async () => {
//             if (!isOpen || !chatUser || !currentUserId) return;

//             setLoadingInitialMessages(true);
//             hasFetchedInitialMessages.current = false;
//             setError(null);

//             try {
//                 const token = await getIdToken();
//                 if (!token) throw new Error('Authentication required.');

//                 const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 });
//                 if (!response.ok) throw new Error('Failed to fetch conversations to find ID.');

//                 const conversations: { _id: string; otherParticipant: GeneralUser }[] = await response.json();
//                 const existingConv = conversations.find(conv =>
//                     conv.otherParticipant?._id === chatUser._id
//                 );

//                 if (existingConv) {
//                     setCurrentConversationId(existingConv._id);
//                     console.log(`[ChatWindow] Found existing conversation ID: ${existingConv._id}`);
//                 } else {
//                     setCurrentConversationId(null);
//                     console.log(`[ChatWindow] No existing conversation with ${chatUser.name}.`);
//                 }
//             } catch (err) {
//                 console.error('[ChatWindow] Error finding conversation ID:', err);
//                 setError(err instanceof Error ? err.message : 'Could not find conversation.');
//                 setLoadingInitialMessages(false);
//             }
//         };

//         if (isOpen) {
//             findConversationId();
//         }
//     }, [isOpen, chatUser, currentUserId, getIdToken]);

//     // --- Message Fetching ---
//     const fetchMessages = useCallback(async (isInitialFetch: boolean) => {
//         if (!isOpen) {
//             setLoadingInitialMessages(false);
//             setMessages([]);
//             return;
//         }

//         if (!currentConversationId && !isInitialFetch) {
//             setLoadingInitialMessages(false);
//             setMessages([]);
//             return;
//         }

//         if (isInitialFetch) {
//             setLoadingInitialMessages(true);
//             setError(null);
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             if (currentConversationId) {
//                 const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json().catch(() => ({}));
//                     throw new Error(errorData.message || 'Failed to fetch messages.');
//                 }

//                 const data: Message[] = await response.json();
//                 setMessages(data);
//                 console.log(`[ChatWindow] Fetched ${data.length} messages for conv ID ${currentConversationId}.`);
//             } else {
//                 setMessages([]);
//             }
//             hasFetchedInitialMessages.current = true;
//         } catch (err) {
//             console.error('[ChatWindow] Error fetching messages:', err);
//             setError(err instanceof Error ? err.message : 'Failed to load messages.');
//         } finally {
//             if (isInitialFetch) {
//                 setLoadingInitialMessages(false);
//             }
//         }
//     }, [isOpen, currentConversationId, getIdToken]);

//     useEffect(() => {
//         let interval: NodeJS.Timeout | undefined; // Initialize with undefined

//         if (isOpen) {
//             fetchMessages(true);
//             // Simulate typing indicator for demonstration, remove in real app
//             // and replace with actual WebSocket listener for other user's typing status
//             const demoTypingInterval = setInterval(() => {
//                 // Simulate other user typing every 10 seconds for 2 seconds
//                 handleOtherUserTyping(); 
//             }, 10000);

//             interval = setInterval(() => {
//                 fetchMessages(false);
//             }, 5000);

//             return () => {
//                 clearInterval(interval);
//                 clearInterval(demoTypingInterval); // Clear demo interval
//                 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); // Clear any pending typing timeout
//             };
//         } else {
//             if (interval) clearInterval(interval); // Clear interval if it's set
//             // Reset all chat-related states when the window closes
//             setMessages([]);
//             setCurrentConversationId(null);
//             setNewMessageContent('');
//             setSelectedMedia(null);
//             setMediaPreviewUrl(null);
//             setIsImagePreviewOpen(false);
//             setPreviewImageUrl(null);
//             setEditingMessageId(null);
//             setIsEditing(false); // Ensure isEditing is false
//             setIsSavingEdit(false);
//             setError(null);
//             setLoadingInitialMessages(true);
//             setSelectedMessages([]);
//             hasFetchedInitialMessages.current = false;
//             setCurrentThemeImage(null);
//             setUploadingMessage(null); // Clear uploading message on close
//             setIsOtherUserTyping(false); // Reset typing indicator
//             if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); // Clear typing timeout
//         }

//         // Return cleanup function outside the if-else for proper unmounting
//         return () => {
//             if (interval) clearInterval(interval);
//             if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//         };
//     }, [isOpen, currentConversationId, fetchMessages, handleOtherUserTyping]); // Added handleOtherUserTyping to dependencies

//     // --- Message Sending Handler ---
//     const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
//         e?.preventDefault();
//         const textContent = newMessageContent.trim();

//         if (!textContent && !selectedMedia) {
//             toast.error('Please type a message or select a file.');
//             return;
//         }
//         if (sendingMessage) return; // Prevent double submission

//         setSendingMessage(true);
//         setError(null);

//         // Determine media type for upload indicator
//         let mediaType: 'image' | 'video' | 'audio' | 'file' = 'file';
//         if (selectedMedia) {
//             if (selectedMedia.type.startsWith('image/')) {
//                 mediaType = 'image';
//             } else if (selectedMedia.type.startsWith('video/')) {
//                 mediaType = 'video';
//             } else if (selectedMedia.type.startsWith('audio/')) {
//                 mediaType = 'audio';
//             }
//         }

//         // Set the uploadingMessage state with the correct mediaType
//         if (selectedMedia) { // Only show upload progress if media is actually being sent
//             setUploadingMessage({
//                 tempId: uuid(), // Generate a temporary ID
//                 mediaType: mediaType,
//             });
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             let response;
//             let sentMessage: Message;

//             if (selectedMedia) {
//                 const formData = new FormData();
//                 formData.append('media', selectedMedia);
//                 if (textContent) {
//                     formData.append('content', textContent);
//                 }

//                 response = await fetch(`${API_BASE_URL}/chats/media-message/${chatUser._id}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         // 'Content-Type': 'multipart/form-data' is not needed here; browser sets it with boundary
//                     },
//                     body: formData,
//                 });
//             } else {
//                 response = await fetch(`${API_BASE_URL}/chats/message/${chatUser._id}`, {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ content: textContent }),
//                 });
//             }

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error.' }));
//                 throw new Error(errorData.message || `Failed to send ${selectedMedia ? 'media' : 'text'} message.`);
//             }

//             sentMessage = await response.json();
//             console.log("[ChatWindow] Message sent:", sentMessage);

//             if (!currentConversationId && sentMessage.conversationId) {
//                 setCurrentConversationId(sentMessage.conversationId);
//             }

//             setNewMessageContent('');
//             removeSelectedMedia(); // This also clears selectedMedia and mediaPreviewUrl
//             onMessageSent(); // Trigger a refresh or update in the parent
//             setSelectedMessages([]); // Clear any selected messages after sending a new one
//             setUploadingMessage(null); // Clear upload indicator on success
//         } catch (err) {
//             console.error('[ChatWindow] Error sending message:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to send message.');
//             setUploadingMessage(null); // Clear upload indicator on error
//         } finally {
//             setSendingMessage(false);
//             // A re-fetch might be good here to ensure the UI is in sync
//             fetchMessages(false);
//         }
//     }, [newMessageContent, selectedMedia, sendingMessage, getIdToken, chatUser, currentConversationId, onMessageSent, removeSelectedMedia, fetchMessages]);

//     // --- Message Editing Handlers ---
//     const handleEditClick = useCallback((message: Message) => {
//         if (message.sender._id !== currentUserId || message.isDeleted) {
//             toast.error("You can only edit your own non-deleted messages.");
//             return;
//         }
//         setSelectedMessages([]);
//         setEditingMessageId(message._id);
//         setNewMessageContent(message.content || '');
//         setIsEditing(true); // Set isEditing to true here
//         removeSelectedMedia();
//         console.log(`[ChatWindow] Started editing message: ${message._id}`);
//     }, [currentUserId, removeSelectedMedia]);

//     const handleSaveEdit = useCallback(async (e?: React.FormEvent) => {
//         e?.preventDefault();
//         if (!editingMessageId || isSavingEdit) return;

//         const contentToSave = newMessageContent.trim();
//         if (!contentToSave) {
//             toast.error('Message content cannot be empty.');
//             return;
//         }

//         setIsSavingEdit(true);
//         setError(null);

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const response = await fetch(`${API_BASE_URL}/chats/message/${editingMessageId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ content: contentToSave }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to edit message.');
//             }

//             const updatedMessage: Message = await response.json();
//             setMessages(prevMessages =>
//                 prevMessages.map(msg =>
//                     msg._id === editingMessageId ? {
//                         ...msg,
//                         content: updatedMessage.content,
//                         updatedAt: updatedMessage.updatedAt,
//                         isEdited: true
//                     } : msg
//                 )
//             );

//             setEditingMessageId(null);
//             setNewMessageContent('');
//             setIsEditing(false); // Set isEditing to false
//             setIsSavingEdit(false);
//             toast.success('Message edited successfully!');
//             console.log(`[ChatWindow] Message ${editingMessageId} edited successfully`);
//         } catch (err) {
//             console.error('[ChatWindow] Error editing message:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to edit message.');
//         } finally {
//             setIsSavingEdit(false);
//         }
//     }, [editingMessageId, newMessageContent, getIdToken, isSavingEdit]);

//     const handleCancelEdit = useCallback(() => {
//         setEditingMessageId(null);
//         setNewMessageContent('');
//         setIsEditing(false); // Set isEditing to false
//         setIsSavingEdit(false);
//         setError(null);
//         console.log(`[ChatWindow] Cancelled editing`);
//     }, []);

//     // --- Message Deletion Handlers with Custom Modal ---
//     const confirmAndDeleteSelectedMessages = useCallback(async () => {
//         setError(null);

//         const messagesToDelete = messages.filter(msg => selectedMessages.includes(msg._id));
//         const userOwnedMessages = messagesToDelete.filter(msg => msg.sender._id === currentUserId);
//         const otherUserMessages = messagesToDelete.filter(msg => msg.sender._id !== currentUserId);

//         if (messagesToDelete.length === 0) {
//             toast.error('No messages selected for deletion.');
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//             return;
//         }

//         if (otherUserMessages.length > 0 && userOwnedMessages.length === 0) {
//             toast.error('You can only delete your own messages.');
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//             setSelectedMessages([]);
//             return;
//         } else if (otherUserMessages.length > 0 && userOwnedMessages.length > 0) {
//             toast.error(`You can only delete your ${userOwnedMessages.length} message(s). ${otherUserMessages.length} message(s) from other users will not be deleted.`);
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const results = await Promise.allSettled(
//                 userOwnedMessages.map(message =>
//                     fetch(`${API_BASE_URL}/chats/message/${message._id}`, {
//                         method: 'DELETE',
//                         headers: { 'Authorization': `Bearer ${token}` },
//                     })
//                 )
//             );

//             const failedDeletions = results.filter(result =>
//                 result.status === 'rejected' ||
//                 (result.status === 'fulfilled' && !result.value.ok)
//             );

//             if (failedDeletions.length > 0) {
//                 if (failedDeletions.length === userOwnedMessages.length && otherUserMessages.length === 0) {
//                     toast.error('Failed to delete all your selected messages.');
//                 } else {
//                     toast.error(`Failed to delete ${failedDeletions.length} of your message(s).`);
//                 }
//             } else if (userOwnedMessages.length > 0) {
//                 toast.success('Selected message(s) deleted successfully!');
//             }

//             await fetchMessages(false);
//             setSelectedMessages([]);
//             onMessageSent();
//         } catch (err) {
//             console.error('[ChatWindow] Error deleting selected messages:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to delete selected messages.');
//         } finally {
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//         }
//     }, [selectedMessages, messages, currentUserId, getIdToken, fetchMessages, onMessageSent, setSelectedMessages]);

//     const handleDeleteSelectedMessages = useCallback(() => {
//         if (selectedMessages.length === 0) return;

//         setDeleteModalTitle('Delete Selected Messages');
//         setDeleteModalMessage(`Are you sure you want to delete ${selectedMessages.length} selected message(s)?`);
//         setConfirmDeleteAction(() => confirmAndDeleteSelectedMessages);
//         setShowDeleteModal(true);
//     }, [selectedMessages, confirmAndDeleteSelectedMessages]);

//     const confirmAndDeleteAllMessages = useCallback(async () => {
//         if (!currentConversationId) return;

//         setError(null);
//         try {
//             const token = await getIdToken();
//             if (!token) throw new Error('Authentication required.');

//             const response = await fetch(`${API_BASE_URL}/chats/messages/${currentConversationId}/all`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${token}` },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || 'Failed to delete all messages.');
//             }

//             setMessages([]);
//             setSelectedMessages([]);
//             onMessageSent();
//             toast.success('All messages are deleted successfully!');
//         } catch (err) {
//             console.error('[ChatWindow] Error deleting all messages:', err);
//             toast.error(err instanceof Error ? err.message : 'Failed to delete all messages.');
//         } finally {
//             setShowDeleteModal(false);
//             setConfirmDeleteAction(null);
//         }
//     }, [currentConversationId, getIdToken, onMessageSent, setSelectedMessages, setMessages]);

//     const handleDeleteAllMessages = useCallback(() => {
//         if (!currentConversationId) return;

//         setDeleteModalTitle('Delete All Messages');
//         setDeleteModalMessage('Are you sure you want to delete ALL your messages in this conversation? This action cannot be undone.');
//         setConfirmDeleteAction(() => confirmAndDeleteAllMessages);
//         setShowDeleteModal(true);
//     }, [currentConversationId, confirmAndDeleteAllMessages]);

//     // Handlers for the custom DeleteConfirmationModal
//     const handleConfirmDelete = async () => {
//         if (confirmDeleteAction) {
//             await confirmDeleteAction();
//         }
//     };

//     const handleCancelDelete = () => {
//         setShowDeleteModal(false);
//         setConfirmDeleteAction(null);
//     };

//     // --- Image Preview Handlers ---
//     const openImagePreview = useCallback((imageUrl: string) => {
//         setPreviewImageUrl(imageUrl);
//         setIsImagePreviewOpen(true);
//     }, []);

//     const closeImagePreview = useCallback(() => {
//         setIsImagePreviewOpen(false);
//         setPreviewImageUrl(null);
//     }, []);

//     // --- Theme Change Handler ---
//     const handleThemeChange = useCallback((imageUrl: string | null) => {
//         setCurrentThemeImage(imageUrl);
//         if (imageUrl) {
//             localStorage.setItem('chatTheme', imageUrl);
//         } else {
//             localStorage.removeItem('chatTheme');
//         }
//     }, []);

//     // Load theme from local storage on component mount
//     useEffect(() => {
//         const savedTheme = localStorage.getItem('chatTheme');
//         if (savedTheme) {
//             setCurrentThemeImage(savedTheme);
//         }
//     }, []);


//     // If the chat window is not open, return null to render nothing
//     if (!isOpen) {
//         return null;
//     }

//     return (
//         <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-opacity-75 backdrop-blur-sm p-0 md:p-4 md:top-16 top-[-50]"
//             onClick={onClose}>
//             <Toaster position="top-center" reverseOrder={false} />
//             <div className="relative w-full max-w-lg h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
//                 onClick={(e) => e.stopPropagation()}>
//                 {/* Header */}
//                 <ChatHeader
//                     chatUser={chatUser}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     getFullMediaUrl={getFullMediaUrl}
//                     onClose={onClose}
//                     showActionsMenu={selectedMessages.length > 0 || !editingMessageId}
//                     onDeleteSelected={handleDeleteSelectedMessages}
//                     onDeleteAll={handleDeleteAllMessages}
//                     onClearSelection={handleClearSelection}
//                     selectedMessages={selectedMessages}
//                     messages={messages}
//                     currentUserId={currentUserId}
//                     onEditMessage={handleEditClick}
//                     isEditing={editingMessageId !== null}
//                     onThemeChange={handleThemeChange}
//                     currentThemeImage={currentThemeImage}
//                     isTyping={isOtherUserTyping}
//                 />

//                 {/* Messages Area */}
//                 <MessageList
//                     messages={messages.filter(msg => !msg.isDeleted)}
//                     loading={loadingInitialMessages}
//                     error={error}
//                     currentUserId={currentUserId}
//                     getFullMediaUrl={getFullMediaUrl}
//                     defaultAvatarUrl={defaultAvatarUrl}
//                     onOpenImagePreview={openImagePreview}
//                     selectedMessages={selectedMessages}
//                     onSelectMessage={handleSelectMessage}
//                     onEditMessage={handleEditClick}
//                     editingMessageId={editingMessageId}
//                     backgroundImageUrl={currentThemeImage}
//                     // Pass the uploadingMessage state to MessageList as well if it needs to display temporary messages
//                     uploadingMessage={uploadingMessage}
//                 />

//                 {/* Message Input and Attachment Button */}
//                 <ChatInput
//                     newMessageContent={newMessageContent}
//                     setNewMessageContent={handleNewMessageContentChange}
//                     selectedMedia={selectedMedia}
//                     mediaPreviewUrl={mediaPreviewUrl}
//                     removeSelectedMedia={removeSelectedMedia}
//                     error={error}
//                     isEditing={editingMessageId !== null} // Set this correctly based on editingMessageId
//                     editingMessageId={editingMessageId}
//                     sendingMessage={sendingMessage}
//                     isSavingEdit={isSavingEdit}
//                     handleSendMessage={handleSendMessage}
//                     handleSaveEdit={handleSaveEdit}
//                     handleCancelEdit={handleCancelEdit}
//                     handleFileChange={handleFileChange}
//                     uploadingMessage={uploadingMessage}
//                 />
//             </div>

//             {/* Image Preview Modal */}
//             <ImagePreviewModal
//                 imageUrl={previewImageUrl}
//                 onClose={closeImagePreview}
//             />

//             {/* Custom Delete Confirmation Modal */}
//             {showDeleteModal && (
//                 <DeleteConfirmationModal
//                     title={deleteModalTitle}
//                     message={deleteModalMessage}
//                     onConfirm={handleConfirmDelete}
//                     onCancel={handleCancelDelete}
//                 />
//             )}
//         </div>
//     );
// };

// export default ChatWindow;


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


    // const handleNewMessageContentChange = useCallback((content: string) => {
    //     setNewMessageContent(content);

    //     // Emit 'typing' event when user starts typing
    //     if (content.length > 0 && typingTimeoutRef.current === null) {
    //         sendTypingStatus(true);
    //     }

    //     // Clear previous timeout and set a new one to send 'stopped typing'
    //     if (typingTimeoutRef.current) {
    //         clearTimeout(typingTimeoutRef.current);
    //     }
    //     typingTimeoutRef.current = setTimeout(() => {
    //         sendTypingStatus(false);
    //         typingTimeoutRef.current = null; // Reset ref
    //     }, 1500); // Send 'stopped typing' after 1.5 seconds of no new input
    // }, [sendTypingStatus]);


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