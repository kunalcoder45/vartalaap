'use client';

import React, { FC, memo } from 'react';
import { Message as MessageType, GeneralUser } from '../../app/types'; // Renamed to MessageType to avoid conflict
import { format, parseISO } from 'date-fns'; // For date formatting
import Image from 'next/image'; // Assuming Next.js Image component for optimization

// Define the props for the Message component
interface MessageProps {
    message: MessageType; // Using the renamed MessageType
    isCurrentUser: boolean;
    getFullMediaUrl: (relativePath?: string) => string;
    defaultAvatarUrl: string;
    onOpenImagePreview: (imageUrl: string) => void;
    isSelected: boolean;
    onSelectMessage: (messageId: string) => void;
    onEditMessage: (message: MessageType) => void;
    isEditing: boolean; // True if any message is in editing mode
    editingMessageId: string | null; // ID of the message currently being edited
}

const MessageComponent: FC<MessageProps> = ({
    message,
    isCurrentUser,
    getFullMediaUrl,
    defaultAvatarUrl,
    onOpenImagePreview,
    isSelected,
    onSelectMessage,
    onEditMessage,
    isEditing,
    editingMessageId,
}) => {
    // Determine avatar URL
    const avatarSrc = message.sender?.avatarUrl
        ? getFullMediaUrl(message.sender.avatarUrl)
        : defaultAvatarUrl;

    // Handle message click for selection
    const handleMessageClick = () => {
        // Prevent selection if a message is currently being edited, unless it's this message
        if (isEditing && editingMessageId !== message._id) {
            return;
        }
        onSelectMessage(message._id);
    };

    // Format timestamp
    const formattedTimestamp = message.createdAt
        ? format(parseISO(message.createdAt), 'hh:mm a')
        : '';

    // Conditionally render the message content
    const renderMessageContent = () => {
        if (message.isDeleted) {
            return (
                <p className="text-gray-500 italic">This message was deleted.</p>
            );
        }

        return (
            <>
                {message.mediaUrl && (
                    <div className="mb-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg cursor-pointer rounded-lg overflow-hidden border border-gray-200"
                         onClick={() => onOpenImagePreview(getFullMediaUrl(message.mediaUrl!))}>
                        {message.mediaType?.startsWith('image/') ? (
                            <Image
                                src={getFullMediaUrl(message.mediaUrl)}
                                alt="Shared media"
                                width={300} // Example width, adjust as needed for your UI
                                height={200} // Example height, adjust as needed for your UI
                                layout="intrinsic" // or "responsive" depending on your styling needs
                                objectFit="cover"
                                className="rounded-lg"
                            />
                        ) : message.mediaType?.startsWith('video/') ? (
                            <video
                                src={getFullMediaUrl(message.mediaUrl)}
                                controls
                                className="w-full h-auto rounded-lg"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            // Fallback for other file types, allowing download
                            <div className="p-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                                <a href={getFullMediaUrl(message.mediaUrl)} target="_blank" rel="noopener noreferrer" className="underline">
                                    Download File: {message.mediaUrl.split('/').pop()}
                                </a>
                            </div>
                        )}
                    </div>
                )}
                {message.content && (
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                )}
                {message.isEdited && (
                    <span className="text-xs text-gray-500 ml-1">(edited)</span>
                )}
            </>
        );
    };

    return (
        <div
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
            onClick={handleMessageClick} // Attach the click handler for selection
        >
            {!isCurrentUser && (
                <div className="flex-shrink-0 mr-3">
                    <Image
                        src={avatarSrc}
                        alt={message.sender?.name || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </div>
            )}
            <div
                className={`flex flex-col p-3 rounded-lg max-w-[75%] relative
                    ${isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }
                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''}
                `}
            >
                {/* Message Content */}
                {renderMessageContent()}

                {/* Timestamp */}
                <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} self-end`}>
                    {formattedTimestamp}
                </div>

                {/* Edit Button (Only for current user's non-deleted, selected messages when not currently editing another message) */}
                {isCurrentUser && !message.isDeleted && isSelected && !isEditing && (
                    <div className="absolute top-0 right-full mr-2 flex space-x-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent message selection from toggling again
                                onEditMessage(message);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs"
                            title="Edit message"
                        >
                            Edit
                        </button>
                    </div>
                )}
                {/* Visual indicator when this specific message is being edited */}
                {editingMessageId === message._id && (
                    <div className="absolute inset-0 bg-yellow-100 bg-opacity-50 flex items-center justify-center rounded-lg pointer-events-none">
                        <span className="text-yellow-800 text-sm font-semibold">Editing...</span>
                    </div>
                )}
            </div>
            {isCurrentUser && (
                <div className="flex-shrink-0 ml-3">
                    <Image
                        src={avatarSrc}
                        alt={message.sender?.name || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </div>
            )}
        </div>
    );
};

export default memo(MessageComponent); // Memoize for performance
