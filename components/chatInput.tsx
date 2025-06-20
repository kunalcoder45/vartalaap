// // components/ChatInput.tsx
// import React, { useRef } from 'react';
// import { Send, Paperclip, XCircle } from 'lucide-react';
// import MediaPreview from './MediaPreview'; // Adjust path as needed

// interface ChatInputProps {
//     newMessageContent: string;
//     setNewMessageContent: (content: string) => void;
//     selectedMedia: File | null;
//     mediaPreviewUrl: string | null;
//     removeSelectedMedia: () => void;
//     error: string | null;
//     isEditing: boolean;
//     editingMessageId: string | null;
//     editedMessageContent: string;
//     setEditedMessageContent: (content: string) => void;
//     sendingMessage: boolean;
//     handleSendMessage: (e?: React.FormEvent) => void;
//     handleSaveEdit: (e: React.FormEvent) => void;
//     handleCancelEdit: () => void;
//     handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }

// const ChatInput: React.FC<ChatInputProps> = ({
//     newMessageContent,
//     setNewMessageContent,
//     selectedMedia,
//     mediaPreviewUrl,
//     removeSelectedMedia,
//     error,
//     isEditing,
//     editingMessageId,
//     editedMessageContent,
//     setEditedMessageContent,
//     sendingMessage,
//     handleSendMessage,
//     handleSaveEdit,
//     handleCancelEdit,
//     handleFileChange,
// }) => {
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     return (
//         <form
//             onSubmit={editingMessageId ? handleSaveEdit : handleSendMessage}
//             className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col"
//         >
//             {selectedMedia && (
//                 <MediaPreview
//                     file={selectedMedia}
//                     previewUrl={mediaPreviewUrl}
//                     onRemove={removeSelectedMedia}
//                     error={error}
//                 />
//             )}

//             <div className="flex items-center mt-2">
//                 {/* Hidden file input */}
//                 <input
//                     type="file"
//                     ref={fileInputRef}
//                     style={{ display: 'none' }}
//                     onChange={handleFileChange}
//                     accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
//                     disabled={isEditing || sendingMessage}
//                 />
//                 <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
//                     title="Attach Media"
//                     disabled={isEditing || sendingMessage}
//                 >
//                     <Paperclip size={24} />
//                 </button>

//                 <input
//                     type="text"
//                     value={editingMessageId ? editedMessageContent : newMessageContent}
//                     onChange={(e) => {
//                         if (editingMessageId) {
//                             setEditedMessageContent(e.target.value);
//                         } else {
//                             setNewMessageContent(e.target.value);
//                         }
//                     }}
//                     placeholder={selectedMedia ? `Add a caption (optional)` : (editingMessageId ? "Edit your message..." : "Type a message...")}
//                     className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     disabled={sendingMessage}
//                 />
//                 {editingMessageId ? (
//                     <>
//                         <button
//                             type="submit"
//                             className="ml-3 p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             disabled={!editedMessageContent.trim() || isEditing}
//                             aria-label="Save edited message"
//                         >
//                             <Send size={20} />
//                         </button>
//                         <button
//                             type="button"
//                             onClick={handleCancelEdit}
//                             className="ml-2 p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                             disabled={isEditing}
//                             aria-label="Cancel edit"
//                         >
//                             <XCircle size={20} />
//                         </button>
//                     </>
//                 ) : (
//                     <button
//                         type="submit"
//                         className="ml-3 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={(!newMessageContent.trim() && !selectedMedia) || sendingMessage}
//                         aria-label="Send message"
//                     >
//                         <Send size={20} />
//                     </button>
//                 )}
//             </div>
//             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//         </form>
//     );
// };

// export default ChatInput;




'use client';

import React, { useRef, ChangeEvent, FC } from 'react';
import { Send, Paperclip, XCircle, SendHorizontal, X } from 'lucide-react';

interface ChatInputProps {
    newMessageContent: string;
    setNewMessageContent: (content: string) => void;
    selectedMedia: File | null;
    mediaPreviewUrl: string | null;
    removeSelectedMedia: () => void;
    error: string | null;
    isEditing: boolean; // Indicates if in editing mode
    editingMessageId: string | null; // The ID of the message being edited
    sendingMessage: boolean; // For new message send
    isSavingEdit: boolean; // For edit save
    handleSendMessage: (e?: React.FormEvent) => Promise<void>; // Can be send or save
    handleSaveEdit: (e?: React.FormEvent) => Promise<void>; // Explicit save handler
    handleCancelEdit: () => void; // Explicit cancel handler
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
    sendingMessage, // For new message sending
    isSavingEdit,   // For edit saving
    handleSendMessage,
    handleSaveEdit,
    handleCancelEdit,
    handleFileChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            handleSaveEdit(e);
        } else {
            handleSendMessage(e);
        }
    };

    // Determine if any operation (sending new message or saving edit) is in progress
    const isOperationInProgress = sendingMessage || isSavingEdit;

    return (
        <form onSubmit={onSubmit} className="p-4 bg-white border-t border-gray-200">
            {mediaPreviewUrl && (
                <div className="relative mb-2 p-2 border border-gray-300 rounded-lg flex items-center justify-between">
                    {/* If you have your MediaPreview component, uncomment and use it here: */}
                    {/* <MediaPreview
                        file={selectedMedia}
                        previewUrl={mediaPreviewUrl}
                        onRemove={removeSelectedMedia}
                        error={error} // Pass error prop if MediaPreview handles it
                    /> */}
                    {/* Otherwise, use this simplified inline preview: */}
                    {mediaPreviewUrl.startsWith('data:image/') ? (
                        <img src={mediaPreviewUrl} alt="Media Preview" className="h-20 w-auto rounded-md object-cover" />
                    ) : mediaPreviewUrl.startsWith('data:video/') ? (
                        <video src={mediaPreviewUrl} controls className="h-20 w-auto rounded-md object-cover" />
                    ) : (
                        <div className="flex items-center">
                            <Paperclip size={20} className="mr-2 text-gray-500" />
                            <span className="text-sm text-gray-700 truncate max-w-[150px]">{selectedMedia?.name || 'Selected file'}</span>
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

            <div className="flex items-center space-x-2">
                {!isEditing && ( // Only show attachment button if not editing
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.click();
                                }
                            }}
                            className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                            aria-label="Attach file"
                            disabled={isOperationInProgress}
                        >
                            <Paperclip size={20} />
                        </button>
                    </>
                )}

                <input
                    type="text"
                    value={newMessageContent} // Always use newMessageContent
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder={isEditing ? "Edit your message..." : "Type your message..."}
                    className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isOperationInProgress}
                />

                {isEditing ? (
                    <>
                        <button
                            type="button" // Use type="button" to prevent form submission
                            onClick={handleCancelEdit}
                            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                            disabled={isOperationInProgress}
                            title="Cancel Edit"
                        >
                            <X size={20} />
                        </button>
                        <button
                            type="submit" // This button will trigger onSubmit, which calls handleSaveEdit
                            className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                            disabled={!newMessageContent.trim() || isOperationInProgress} // Disable if content is empty or saving
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
                        <SendHorizontal size={20}/>
                    </button>
                )}
            </div>
        </form>
    );
};

export default ChatInput;