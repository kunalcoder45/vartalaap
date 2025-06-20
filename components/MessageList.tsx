// // 'use client'; // If this component is client-side

// // import React, { useRef, useEffect, FC } from 'react';
// // import Skeleton from 'react-loading-skeleton';
// // import 'react-loading-skeleton/dist/skeleton.css';
// // import { format } from 'date-fns';
// // import { FileText, ZoomIn } from 'lucide-react';

// // // Import types from the shared file
// // import { Message, GeneralUser } from '../app/types'; // <--- IMPORTANT: Ensure this path is correct

// // interface MessageListProps {
// //     messages: Message[];
// //     loading: boolean;
// //     error: string | null;    
// //     currentUserId: string;
// //     getFullMediaUrl: (relativePath?: string) => string;
// //     defaultAvatarUrl: string;
// //     onOpenImagePreview: (imageUrl: string) => void;
// //     selectedMessages: string[];
// //     onSelectMessage: (messageId: string) => void;
// // }

// // const MessageList: FC<MessageListProps> = ({
// //     messages,
// //     loading,
// //     error,
// //     currentUserId,
// //     getFullMediaUrl,
// //     defaultAvatarUrl,
// //     onOpenImagePreview,
// //     selectedMessages,
// //     onSelectMessage,
// // }) => {
// //     const messagesEndRef = useRef<HTMLDivElement>(null);

// //     // Scroll to the latest message whenever messages change
// //     // useEffect(() => {
// //     //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //     // }, [messages]);

// //     if (loading) {
// //         return (
// //             <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
// //                 <div className="w-full max-w-md">
// //                     <Skeleton count={5} height={60} className="mb-2" />
// //                 </div>
// //             </div>
// //         );
// //     }

// //     if (error) {
// //         return (
// //             <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center text-center text-red-500">
// //                 <p>Error: {error}</p>
// //             </div>
// //         );
// //     }

// //     return (
// //         <div className="flex-1 overflow-y-auto p-4 bg-gray-50 hide-scrollbar">
// //             {messages.length === 0 && (
// //                 <div className="text-center text-gray-500 py-4">No messages yet. Start a conversation!</div>
// //             )}
// //             {messages.map((message) => {
// //                 const isCurrentUser = message.sender._id === currentUserId;
// //                 const messageDate = new Date(message.createdAt);
// //                 const formattedTime = format(messageDate, 'hh:mm a');
// //                 // Use the full date for the selection display
// //                 const formattedDate = format(messageDate, 'MMM dd, yyyy'); 

// //                 const isMediaMessage = !!message.mediaUrl;

// //                 const bubbleClasses = `
// //                     relative p-2 max-w-[75%] break-words shadow-sm
// //                     ${isMediaMessage ? 'rounded-lg' : 'rounded-full'}
// //                     ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
// //                     ${message.isDeleted ? 'opacity-60 italic' : ''}
// //                 `;

// //                 const handleMediaClick = (e: React.MouseEvent) => {
// //                     e.stopPropagation(); // Prevent message selection when clicking media
// //                     if (message.mediaUrl && message.mediaType === 'image') {
// //                         onOpenImagePreview(getFullMediaUrl(message.mediaUrl));
// //                     }
// //                     if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
// //                         window.open(getFullMediaUrl(message.mediaUrl), '_blank');
// //                     }
// //                 };

// //                 return (
// //                     <div
// //                         key={message._id}
// //                         className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
// //                         // Handle message selection on click of the container
// //                         onClick={() => onSelectMessage(message._id)}
// //                     >
// //                         <div
// //                             className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
// //                         >
// //                             {/* Message Sender Avatar (only for others' messages) */}
// //                             {!isCurrentUser && (
// //                                 <img
// //                                     src={getFullMediaUrl(message.sender.avatarUrl || defaultAvatarUrl)}
// //                                     alt={message.sender.name || message.sender.username}
// //                                     className="w-8 h-8 rounded-full object-cover shadow-sm mr-2" // Added mr-2 for spacing
// //                                     onError={(e) => {
// //                                         e.currentTarget.src = defaultAvatarUrl;
// //                                     }}
// //                                 />
// //                             )}
// //                             <div
// //                                 className={`${bubbleClasses} ${selectedMessages.includes(message._id) ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
// //                             >
// //                                 {message.mediaUrl && (
// //                                     <div
// //                                         className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
// //                                         onClick={handleMediaClick}
// //                                     >
// //                                         {message.mediaType === 'image' && (
// //                                             <>
// //                                                 {/* Using a regular <img> tag instead of Next.js <Image> for simplicity
// //                                                     If you use Next.js <Image>, ensure you provide width, height, and alt props */}
// //                                                 <img
// //                                                     src={getFullMediaUrl(message.mediaUrl)}
// //                                                     alt={message.content || "Sent image"}
// //                                                     className="rounded-lg max-h-[300px] w-auto h-auto object-cover"
// //                                                     style={{ maxWidth: '100%' }} // Ensure image fits bubble
// //                                                 />
// //                                                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
// //                                                     <ZoomIn className="text-white text-3xl" />
// //                                                 </div>
// //                                             </>
// //                                         )}
// //                                         {message.mediaType === 'video' && (
// //                                             <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
// //                                                 <video
// //                                                     src={getFullMediaUrl(message.mediaUrl)}
// //                                                     controls
// //                                                     className="max-h-full max-w-full rounded-lg"
// //                                                 >
// //                                                     Your browser does not support the video tag.
// //                                                 </video>
// //                                             </div>
// //                                         )}
// //                                         {message.mediaType === 'audio' && (
// //                                             <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
// //                                                 <audio controls className="w-full">
// //                                                     <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
// //                                                     Your browser does not support the audio element.
// //                                                 </audio>
// //                                             </div>
// //                                         )}
// //                                         {message.mediaType === 'file' && (
// //                                             <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
// //                                                 <FileText size={24} />
// //                                                 <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
// //                                             </div>
// //                                         )}
// //                                     </div>
// //                                 )}

// //                                 {message.content && (
// //                                     <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
// //                                         {message.content}
// //                                     </p>
// //                                 )}
// //                             </div>
// //                             <div className={`text-xs mt-1 ${isCurrentUser ? 'mr-2' : 'ml-2'} text-gray-500 flex items-center`}>
// //                                 {message.isEdited && <span className="mr-1">(edited)</span>}
// //                                 {formattedTime}
// //                             </div>
// //                         </div>
// //                         {selectedMessages.includes(message._id) && (
// //                             <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
// //                                 {formattedDate}
// //                             </div>
// //                         )}
// //                     </div>
// //                 );
// //             })}
// //             <div ref={messagesEndRef} />
// //         </div>
// //     );
// // };

// // export default MessageList;






// 'use client';

// import React, { useRef, useEffect, FC } from 'react';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { format } from 'date-fns';
// import { FileText, ZoomIn } from 'lucide-react'; // Removed EllipsisVertical, Edit icons

// // Import types from the shared file
// import { Message, GeneralUser } from '../app/types';

// interface MessageListProps {
//     messages: Message[];
//     loading: boolean;
//     error: string | null;
//     currentUserId: string;
//     getFullMediaUrl: (relativePath?: string) => string;
//     defaultAvatarUrl: string;
//     onOpenImagePreview: (imageUrl: string) => void;
//     selectedMessages: string[];
//     onSelectMessage: (messageId: string) => void;
//     // New prop for editing (still passed, but triggered from ChatHeader now)
//     onEditMessage: (message: Message) => void;
//     editingMessageId: string | null;
// }

// const MessageList: FC<MessageListProps> = ({
//     messages,
//     loading,
//     error,
//     currentUserId,
//     getFullMediaUrl,
//     defaultAvatarUrl,
//     onOpenImagePreview,
//     selectedMessages,
//     onSelectMessage,
//     // onEditMessage and editingMessageId are still received but not directly used for rendering ellipsis here
//     editingMessageId,
// }) => {
//     const messagesEndRef = useRef<HTMLDivElement>(null);

//     // Scroll to the latest message whenever messages change
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages, loading]);

//     if (loading) {
//         return (
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
//                 <div className="w-full max-w-md">
//                     <Skeleton count={5} height={60} className="mb-2" />
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center text-center text-red-500">
//                 <p>Error: {error}</p>
//             </div>
//         );
//     }

//     const handleMessageClick = (messageId: string) => {
//         if (editingMessageId) {
//             // If currently in editing mode, clicking other messages should not select them
//             return;
//         }
//         onSelectMessage(messageId);
//     };

//     return (
//         <div className="flex-1 overflow-y-auto p-4 bg-gray-50 hide-scrollbar">
//             {messages.length === 0 && (
//                 <div className="text-center text-gray-500 py-4">No messages yet. Start a conversation!</div>
//             )}
//             {messages.map((message) => {
//                 const isCurrentUser = message.sender._id === currentUserId;
//                 const messageDate = new Date(message.createdAt);
//                 const formattedTime = format(messageDate, 'hh:mm a');
//                 const formattedDate = format(messageDate, 'MMM dd, yyyy');

//                 const isMediaMessage = !!message.mediaUrl;
//                 const isMessageSelected = selectedMessages.includes(message._id);
//                 const isThisMessageBeingEdited = editingMessageId === message._id;

//                 const bubbleClasses = `
//                     relative p-2 max-w-[75%] break-words shadow-sm
//                     ${isMediaMessage ? 'rounded-lg' : 'rounded-full'}
//                     ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
//                     ${message.isDeleted ? 'opacity-60 italic' : ''}
//                 `;

//                 const handleMediaClick = (e: React.MouseEvent) => {
//                     e.stopPropagation(); // Prevent message selection when clicking media
//                     if (message.mediaUrl && message.mediaType === 'image') {
//                         onOpenImagePreview(getFullMediaUrl(message.mediaUrl));
//                     }
//                     if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
//                         window.open(getFullMediaUrl(message.mediaUrl), '_blank');
//                     }
//                 };

//                 // Only allow selection if not currently editing any message
//                 const canSelect = !editingMessageId;

//                 return (
//                     <div
//                         key={message._id}
//                         className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
//                         // Handle message selection on click of the container
//                         onClick={() => canSelect && handleMessageClick(message._id)}
//                     >
//                         <div
//                             className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${isMessageSelected ? 'border-2 border-blue-400 rounded-lg' : ''}`}
//                         >
//                             {/* Message Sender Avatar (only for others' messages) */}
//                             {!isCurrentUser && (
//                                 <img
//                                     src={getFullMediaUrl(message.sender.avatarUrl || defaultAvatarUrl)}
//                                     alt={message.sender.name || message.sender.username}
//                                     className="w-8 h-8 rounded-full object-cover shadow-sm mr-2"
//                                     onError={(e) => {
//                                         e.currentTarget.src = defaultAvatarUrl;
//                                     }}
//                                 />
//                             )}
//                             <div
//                                 className={`${bubbleClasses} ${isThisMessageBeingEdited ? 'ring-2 ring-offset-2 ring-purple-400' : ''}`}
//                             >
//                                 {message.mediaUrl && (
//                                     <div
//                                         className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
//                                         onClick={handleMediaClick}
//                                     >
//                                         {message.mediaType === 'image' && (
//                                             <>
//                                                 <img
//                                                     src={getFullMediaUrl(message.mediaUrl)}
//                                                     alt={message.content || "Sent image"}
//                                                     className="rounded-lg max-h-[300px] w-auto h-auto object-cover"
//                                                     style={{ maxWidth: '100%' }}
//                                                 />
//                                                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
//                                                     <ZoomIn className="text-white text-3xl" />
//                                                 </div>
//                                             </>
//                                         )}
//                                         {message.mediaType === 'video' && (
//                                             <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
//                                                 <video
//                                                     src={getFullMediaUrl(message.mediaUrl)}
//                                                     controls
//                                                     className="max-h-full max-w-full rounded-lg"
//                                                 >
//                                                     Your browser does not support the video tag.
//                                                 </video>
//                                             </div>
//                                         )}
//                                         {message.mediaType === 'audio' && (
//                                             <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
//                                                 <audio controls className="w-full">
//                                                     <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
//                                                     Your browser does not support the audio element.
//                                                 </audio>
//                                             </div>
//                                         )}
//                                         {message.mediaType === 'file' && (
//                                             <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
//                                                 <FileText size={24} />
//                                                 <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )}

//                                 {message.content && (
//                                     <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
//                                         {message.content}
//                                     </p>
//                                 )}
//                             </div>

//                             <div className={`text-xs mt-1 ${isCurrentUser ? 'mr-2' : 'ml-2'} text-gray-500 flex items-center`}>
//                                 {message.isEdited && <span className="mr-1">(edited)</span>}
//                                 {formattedTime}
//                             </div>
//                         </div>
//                         {isMessageSelected && (
//                             <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
//                                 {formattedDate}
//                             </div>
//                         )}
//                     </div>
//                 );
//             })}
//             <div ref={messagesEndRef} />
//         </div>
//     );
// };

// export default MessageList;










'use client';

import React, { useRef, useEffect, FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { format } from 'date-fns';
import { FileText, ZoomIn } from 'lucide-react'; // Removed EllipsisVertical, Edit icons

// Import types from the shared file
import { Message, GeneralUser } from '../app/types';

interface MessageListProps {
    messages: Message[];
    loading: boolean;
    error: string | null;
    currentUserId: string;
    getFullMediaUrl: (relativePath?: string) => string;
    defaultAvatarUrl: string;
    onOpenImagePreview: (imageUrl: string) => void;
    selectedMessages: string[];
    onSelectMessage: (messageId: string) => void;
    // These props are *no longer directly used for rendering ellipses/edit icon in MessageList itself*,
    // but might be passed for other internal logic or child components if needed.
    // For current requirement, they are not directly consumed here for UI rendering.
    // However, it's safer to keep them as props for the `editingMessageId`
    // to control message selection behavior (cannot select other messages when editing).
    onEditMessage: (message: Message) => void; // Kept as a prop, though not directly used for UI in this component.
    editingMessageId: string | null;
}

const MessageList: FC<MessageListProps> = ({
    messages,
    loading,
    error,
    currentUserId,
    getFullMediaUrl,
    defaultAvatarUrl,
    onOpenImagePreview,
    selectedMessages,
    onSelectMessage,
    onEditMessage, // Still present as prop for consistency, but not for direct UI ellipsis rendering here.
    editingMessageId,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the latest message whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <Skeleton count={5} height={60} className="mb-2" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center text-center text-red-500">
                <p>Error: {error}</p>
            </div>
        );
    }

    const handleMessageClick = (messageId: string) => {
        if (editingMessageId) {
            // If currently in editing mode, clicking other messages should not select them
            return;
        }
        onSelectMessage(messageId);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 hide-scrollbar">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 py-4">No messages yet. Start a conversation!</div>
            )}
            {messages.map((message) => {
                const isCurrentUser = message.sender._id === currentUserId;
                const messageDate = new Date(message.createdAt);
                const formattedTime = format(messageDate, 'hh:mm a');
                const formattedDate = format(messageDate, 'MMM dd, yyyy');

                const isMediaMessage = !!message.mediaUrl;
                const isMessageSelected = selectedMessages.includes(message._id);
                const isThisMessageBeingEdited = editingMessageId === message._id;

                const bubbleClasses = `
                    relative p-2 max-w-[75%] break-words shadow-sm
                    ${isMediaMessage ? 'rounded-lg' : 'rounded-full'}
                    ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
                    ${message.isDeleted ? 'opacity-60 italic' : ''}
                `;

                const handleMediaClick = (e: React.MouseEvent) => {
                    e.stopPropagation(); // Prevent message selection when clicking media
                    if (message.mediaUrl && message.mediaType === 'image') {
                        onOpenImagePreview(getFullMediaUrl(message.mediaUrl));
                    }
                    if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
                        window.open(getFullMediaUrl(message.mediaUrl), '_blank');
                    }
                };

                // Only allow selection if not currently editing any message
                const canSelect = !editingMessageId;

                return (
                    <div
                        key={message._id}
                        className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                        // Handle message selection on click of the container
                        onClick={() => canSelect && handleMessageClick(message._id)}
                    >
                        <div
                            className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${isMessageSelected ? 'border-2 border-blue-400 rounded-lg' : ''}`}
                        >
                            {/* Message Sender Avatar (only for others' messages) */}
                            {!isCurrentUser && (
                                <img
                                    src={getFullMediaUrl(message.sender.avatarUrl || defaultAvatarUrl)}
                                    alt={message.sender.name || message.sender.username}
                                    className="w-8 h-8 rounded-full object-cover shadow-sm mr-2"
                                    onError={(e) => {
                                        e.currentTarget.src = defaultAvatarUrl;
                                    }}
                                />
                            )}
                            <div
                                className={`${bubbleClasses} ${isThisMessageBeingEdited ? 'ring-2 ring-offset-2 ring-purple-400' : ''}`}
                            >
                                {message.mediaUrl && (
                                    <div
                                        className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
                                        onClick={handleMediaClick}
                                    >
                                        {message.mediaType === 'image' && (
                                            <>
                                                <img
                                                    src={getFullMediaUrl(message.mediaUrl)}
                                                    alt={message.content || "Sent image"}
                                                    className="rounded-lg max-h-[300px] w-auto h-auto object-cover"
                                                    style={{ maxWidth: '100%' }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                    <ZoomIn className="text-white text-3xl" />
                                                </div>
                                            </>
                                        )}
                                        {message.mediaType === 'video' && (
                                            <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
                                                <video
                                                    src={getFullMediaUrl(message.mediaUrl)}
                                                    controls
                                                    className="max-h-full max-w-full rounded-lg"
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            </div>
                                        )}
                                        {message.mediaType === 'audio' && (
                                            <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
                                                <audio controls className="w-full">
                                                    <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                        )}
                                        {message.mediaType === 'file' && (
                                            <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
                                                <FileText size={24} />
                                                <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {message.content && (
                                    <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
                                        {message.content}
                                    </p>
                                )}
                            </div>

                            <div className={`text-xs mt-1 ${isCurrentUser ? 'mr-2' : 'ml-2'} text-gray-500 flex items-center`}>
                                {message.isEdited && <span className="mr-1">(edited)</span>}
                                {formattedTime}
                            </div>
                        </div>
                        {isMessageSelected && (
                            <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
                                {formattedDate}
                            </div>
                        )}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;