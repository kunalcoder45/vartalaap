'use client';

import React, { useRef, ChangeEvent, FC, useEffect, useState } from 'react';
import { Send, Paperclip, XCircle, SendHorizontal, X, FileText, Music, Video, Image as ImageIcon } from 'lucide-react'; // Import additional icons

interface ChatInputProps {
    newMessageContent: string;
    setNewMessageContent: (content: string) => void;
    selectedMedia: File | null;
    mediaPreviewUrl: string | null;
    removeSelectedMedia: () => void;
    error: string | null;
    isEditing: boolean;
    editingMessageId: string | null;
    sendingMessage: boolean;
    isSavingEdit: boolean;
    handleSendMessage: (e?: React.FormEvent) => Promise<void>;
    handleSaveEdit: (e?: React.FormEvent) => Promise<void>;
    handleCancelEdit: () => void;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    uploadingMessage: {
        tempId: string;
        mediaType: 'image' | 'video' | 'audio' | 'file';
    } | null;
}

const ChatInput: FC<ChatInputProps> = ({
    newMessageContent,
    setNewMessageContent,
    selectedMedia,
    mediaPreviewUrl,
    removeSelectedMedia,
    error,
    isEditing,
    editingMessageId,
    sendingMessage,
    isSavingEdit,
    handleSendMessage,
    handleSaveEdit,
    handleCancelEdit,
    handleFileChange,
    uploadingMessage,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // For example progress animation (replace with real progress if you have)
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (uploadingMessage) {
            setUploadProgress(0); // Reset progress when a new upload starts
            interval = setInterval(() => {
                setUploadProgress((old) => {
                    // Stop incrementing if already at 100
                    if (old >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    // Increment by a small amount to simulate progress
                    return Math.min(100, old + 10);
                });
            }, 300);
        } else {
            // Reset progress if no message is uploading
            setUploadProgress(0);
        }
        // Cleanup function to clear interval
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [uploadingMessage]); //handleSendMessage: (e?: React.FormEvent) => Promise<void>; Dependency on uploadingMessage ensures effect runs when it changes

    // const onSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (isEditing) {
    //         handleSaveEdit(e);
    //     } else {
    //         handleSendMessage(e);
    //     }
    // };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            await handleSaveEdit(e);
        } else {
            await handleSendMessage(e);
        }
    };


    const isOperationInProgress = sendingMessage || isSavingEdit;

    // Helper for label based on mediaType
    const getSendingLabel = (type: string) => {
        switch (type) {
            case 'image':
                return 'Sending image...';
            case 'video':
                return 'Sending video...';
            case 'audio':
                return 'Sending audio...';
            case 'file':
                return 'Sending document...'; // General file
            default:
                return 'Sending media...'; // Fallback
        }
    };

    return (
        <form onSubmit={onSubmit} className="p-4 bg-white border-t border-gray-200">
            {/* Uploading message and progress bar */}
            {uploadingMessage && (
                <div className="mb-2 flex items-center text-sm text-gray-600">
                    {getSendingLabel(uploadingMessage.mediaType)}
                    <div className="ml-2 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Media Preview Section */}
            {selectedMedia && ( // Only show this div if selectedMedia exists
                <div className="relative mb-2 p-2 border border-gray-300 rounded-lg flex items-center justify-between">
                    {selectedMedia.type.startsWith('image/') ? (
                        // Fix: Directly use mediaPreviewUrl without || ''
                        <img src={mediaPreviewUrl as string | undefined} alt="Image Preview" className="h-20 w-auto rounded-md object-cover" />
                    ) : selectedMedia.type.startsWith('video/') ? (
                        // Fix: Directly use mediaPreviewUrl without || ''
                        <video src={mediaPreviewUrl as string | undefined} controls className="h-20 w-auto rounded-md object-cover" />
                    ) : selectedMedia.type.startsWith('audio/') ? (
                        <div className="flex items-center">
                            <Music size={24} className="mr-2 text-gray-500" />
                            {/* Fix: Directly use mediaPreviewUrl without || '' */}
                            <audio src={mediaPreviewUrl as string | undefined} controls className="max-w-[200px]" />
                        </div>
                    ) : (
                        // Generic file preview (for documents, unknown files, etc.)
                        <div className="flex items-center">
                            <FileText size={24} className="mr-2 text-gray-500" />
                            <span className="text-sm text-gray-700 truncate max-w-[150px]">{selectedMedia.name || 'Selected file'}</span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={removeSelectedMedia}
                        className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        aria-label="Remove selected media"
                    >
                        <XCircle size={16} />
                    </button>
                </div>
            )}

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex items-center space-x-2">
                {!isEditing && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            // Expanded accept attribute for common media and document types
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                            aria-label="Attach file"
                            disabled={isOperationInProgress || !!selectedMedia} // Disable if operation in progress or media already selected
                        >
                            <Paperclip size={20} />
                        </button>
                    </>
                )}

                <input
                    type="text"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder={isEditing ? "Edit your message..." : (selectedMedia ? "Add a caption..." : "Type your message...")}
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isOperationInProgress}
                />

                {isEditing ? (
                    <>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                            disabled={isOperationInProgress}
                            title="Cancel Edit"
                        >
                            <X size={20} />
                        </button>
                        <button
                            type="submit"
                            className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                            disabled={!newMessageContent.trim() || isOperationInProgress}
                            title="Save Edit"
                        >
                            <Send size={20} />
                        </button>
                    </>
                ) : (
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                        disabled={(!newMessageContent.trim() && !selectedMedia) || isOperationInProgress}
                    >
                        <SendHorizontal size={20} />
                    </button>
                )}
            </div>
        </form>
    );
};

export default ChatInput;