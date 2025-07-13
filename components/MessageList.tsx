
// MessageList.tsx
"use client";

import React, { useRef, useEffect, FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { format } from 'date-fns';
import { FileText, ZoomIn } from 'lucide-react';
import { Message } from '../app/types';

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
    onEditMessage: (message: Message) => void;
    editingMessageId: string | null;
    backgroundImageUrl: string | null;
    uploadingMessage: {
        mediaType: 'image' | 'video' | 'audio' | 'file';
        tempId: string;
    } | null;
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
    onEditMessage,
    editingMessageId,
    backgroundImageUrl,
    uploadingMessage,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading, uploadingMessage]);

    const messageListStyle: React.CSSProperties = {
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: backgroundImageUrl ? 'transparent' : '#f9fafb',
    };

    const handleMessageClick = (messageId: string) => {
        if (!editingMessageId) {
            onSelectMessage(messageId);
        }
    };

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

    return (
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar" style={messageListStyle}>
            {messages.length === 0 && !uploadingMessage && (
                <div className="text-center text-gray-500 py-4">No messages yet. Start a conversation!</div>
            )}

            {/* Upload progress bubble */}
            {uploadingMessage && (
                <div className="flex flex-col mb-2 items-end animate-pulse">
                    <div className="flex items-end flex-row-reverse">
                        <div className="bg-blue-300 text-white p-2 rounded-lg max-w-[75%] shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm">
                                    {uploadingMessage.mediaType === 'image' && 'Uploading image...'}
                                    {uploadingMessage.mediaType === 'video' && 'Uploading video...'}
                                    {uploadingMessage.mediaType === 'audio' && 'Uploading audio...'}
                                    {uploadingMessage.mediaType === 'file' && 'Uploading file...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {messages.map((message) => {
                const isCurrentUser = message.sender._id === currentUserId;
                const messageDate = new Date(message.createdAt);
                const formattedTime = format(messageDate, 'hh:mm a');
                const formattedDate = format(messageDate, 'MMM dd, yyyy');
                const isMediaMessage = !!message.mediaUrl;
                const isMessageSelected = selectedMessages.includes(message._id);
                const isBeingEdited = editingMessageId === message._id;

                const bubbleClasses = `
                    relative p-2 max-w-[75%] break-words shadow-sm
                    ${isMediaMessage ? 'rounded-lg' : 'rounded'}
                    ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
                    ${message.isDeleted ? 'opacity-60 italic' : ''}
                `;

                const handleMediaClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!message.mediaUrl) return;

                    const url = getFullMediaUrl(message.mediaUrl);
                    if (message.mediaType === 'image') onOpenImagePreview(url);
                    else window.open(url, '_blank');
                };

                return (
                    <div
                        key={message._id}
                        className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                        onClick={() => handleMessageClick(message._id)}
                    >
                        <div
                            className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${isMessageSelected ? 'border-2 border-blue-400 rounded-lg' : ''}`}
                        >
                            {/* {!isCurrentUser && (
                                <img
                                    src={getFullMediaUrl(message.sender.avatarUrl || defaultAvatarUrl)}
                                    alt={message.sender.name || message.sender.username}
                                    className="w-8 h-8 rounded-lg object-cover shadow-sm mr-2"
                                    onError={(e) => { e.currentTarget.src = defaultAvatarUrl; }}
                                />
                            )} */}
                            <div className={`${bubbleClasses} ${isBeingEdited ? 'ring-2 ring-offset-2 ring-purple-400' : ''}`}>
                                {isMediaMessage && (
                                    <div
                                        className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
                                        onClick={handleMediaClick}
                                    >
                                        {message.mediaType === 'image' && (
                                            <>
                                                <img
                                                    src={getFullMediaUrl(message.mediaUrl)}
                                                    alt={message.content || 'Sent image'}
                                                    className="rounded-lg max-h-[300px] w-auto object-cover"
                                                    style={{ maxWidth: '100%' }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                                    <ZoomIn className="text-white text-3xl" />
                                                </div>
                                            </>
                                        )}
                                        {message.mediaType === 'video' && (
                                            <video
                                                src={getFullMediaUrl(message.mediaUrl)}
                                                controls
                                                className="max-h-[200px] w-full rounded-lg"
                                            />
                                        )}
                                        {message.mediaType === 'audio' && (
                                            <audio controls className="w-full rounded">
                                                <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        )}
                                        {message.mediaType === 'file' && (
                                            <div className="bg-gray-700 text-white rounded-lg flex items-center space-x-2 px-4 py-2">
                                                <FileText size={24} />
                                                <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {message.content && <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>{message.content}</p>}
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
