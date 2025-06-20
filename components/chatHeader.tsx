// // // components/ChatHeader.tsx
// // import React from 'react';
// // import { ChevronLeft, MoreVertical } from 'lucide-react';
// // import { User as GeneralUser } from './StatusViewer'; // Adjust path as needed
// // import MessageSelectionMenu from './MessageSelectionMenu'; // New component

// // interface ChatHeaderProps {
// //     chatUser: GeneralUser;
// //     defaultAvatarUrl: string;
// //     getFullMediaUrl: (relativePath?: string) => string;
// //     onClose: () => void;
// //     showActionsMenu: boolean;
// //     onDeleteSelected: () => void;
// //     onDeleteAll: () => void;
// //     onClearSelection: () => void;
// // }

// // const ChatHeader: React.FC<ChatHeaderProps> = ({
// //     chatUser,
// //     defaultAvatarUrl,
// //     getFullMediaUrl,
// //     onClose,
// //     showActionsMenu,
// //     onDeleteSelected,
// //     onDeleteAll,
// //     onClearSelection
// // }) => {
// //     const [isMenuOpen, setIsMenuOpen] = React.useState(false);
// //     const menuRef = React.useRef<HTMLDivElement>(null);
// //     const buttonRef = React.useRef<HTMLButtonElement>(null);

// //     const handleMenuToggle = () => {
// //         setIsMenuOpen(prev => !prev);
// //     };

// //     React.useEffect(() => {
// //         const handleClickOutside = (event: MouseEvent) => {
// //             if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
// //                 buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
// //                 setIsMenuOpen(false);
// //             }
// //         };

// //         document.addEventListener('mousedown', handleClickOutside);
// //         return () => {
// //             document.removeEventListener('mousedown', handleClickOutside);
// //         };
// //     }, []);

// //     return (
// //         <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50 relative">
// //             <button
// //                 onClick={() => {
// //                     onClose();
// //                     onClearSelection(); // Clear selection when closing chat
// //                 }}
// //                 className="text-gray-600 p-1 rounded-full hover:bg-gray-600 hover:text-gray-50 mr-3 cursor-pointer"
// //                 aria-label="Back to chats"
// //             >
// //                 <ChevronLeft size={24} />
// //             </button>
// //             <img
// //                 src={getFullMediaUrl(chatUser.avatarUrl) || defaultAvatarUrl}
// //                 alt={chatUser.name ? `${chatUser.name}'s avatar` : 'User avatar'}
// //                 className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
// //                 onError={(e) => {
// //                     const target = e.target as HTMLImageElement;
// //                     target.src = defaultAvatarUrl;
// //                 }}
// //             />
// //             <h2 className="text-lg font-semibold text-gray-800 flex-1">{chatUser.name}</h2>

// //             {showActionsMenu && (
// //                 <div className="relative">
// //                     <button
// //                         ref={buttonRef}
// //                         onClick={handleMenuToggle}
// //                         className="p-1 rounded-full text-gray-600 hover:bg-gray-200 ml-2"
// //                         aria-label="More message options"
// //                     >
// //                         <MoreVertical size={24} />
// //                     </button>
// //                     {isMenuOpen && (
// //                         <MessageSelectionMenu
// //                             menuRef={menuRef}
// //                             onDeleteSelected={() => {
// //                                 setIsMenuOpen(false);
// //                                 onDeleteSelected();
// //                             }}
// //                             onDeleteAll={() => {
// //                                 setIsMenuOpen(false);
// //                                 onDeleteAll();
// //                             }}
// //                         />
// //                     )}
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default ChatHeader;









// // components/chatHeader.tsx
// 'use client';

// import React, { FC, useState, useRef, useEffect } from 'react';
// import { X, MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
// import { GeneralUser, Message } from '../app/types'; // Adjust path if necessary

// interface ChatHeaderProps {
//     chatUser: GeneralUser;
//     defaultAvatarUrl: string;
//     getFullMediaUrl: (relativePath?: string) => string;
//     onClose: () => void;
//     showActionsMenu: boolean; // Controls if the MoreVertical icon (and its menu) is shown
//     onDeleteSelected: () => void;
//     onDeleteAll: () => void;
//     onClearSelection: () => void; // Added for clearing selection from header
//     // New props for editing
//     selectedMessages: string[]; // Pass selected message IDs to determine edit option
//     messages: Message[]; // Pass all messages to find the actual message object for editing
//     currentUserId: string; // To check if the selected message belongs to the current user
//     onEditMessage: (message: Message) => void; // Callback to trigger edit mode in ChatWindow
//     isEditing: boolean; // Indicates if ChatWindow is in editing mode
// }

// const ChatHeader: FC<ChatHeaderProps> = ({
//     chatUser,
//     defaultAvatarUrl,
//     getFullMediaUrl,
//     onClose,
//     showActionsMenu,
//     onDeleteSelected,
//     onDeleteAll,
//     onClearSelection,
//     selectedMessages,
//     messages,
//     currentUserId,
//     onEditMessage,
//     isEditing,
// }) => {
//     const [showDropdown, setShowDropdown] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);
//     const buttonRef = useRef<HTMLButtonElement>(null);

//     // Determine if a single, non-deleted, current user's message is selected for editing
//     const canEdit = selectedMessages.length === 1 && !isEditing;
//     const selectedMessage = canEdit ? messages.find(msg => msg._id === selectedMessages[0]) : null;
//     const isSelectedMessageMineAndNotDeleted = selectedMessage && selectedMessage.sender._id === currentUserId && !selectedMessage.isDeleted;

//     // Close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (
//                 dropdownRef.current &&
//                 !dropdownRef.current.contains(event.target as Node) &&
//                 buttonRef.current &&
//                 !buttonRef.current.contains(event.target as Node)
//             ) {
//                 setShowDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     const handleEditOptionClick = () => {
//         if (selectedMessage) {
//             onEditMessage(selectedMessage);
//             onClearSelection(); // Clear selection after initiating edit
//             setShowDropdown(false); // Close dropdown
//         }
//     };

//     return (
//         <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
//             <div className="flex items-center">
//                 <img
//                     src={getFullMediaUrl(chatUser.avatarUrl || defaultAvatarUrl)}
//                     alt={chatUser.name || chatUser.username}
//                     className="w-10 h-10 rounded-full object-cover mr-3"
//                     onError={(e) => {
//                         e.currentTarget.src = defaultAvatarUrl;
//                     }}
//                 />
//                 <h2 className="text-xl font-semibold text-gray-800">{chatUser.name || chatUser.username}</h2>
//             </div>

//             <div className="relative flex items-center space-x-2">
//                 {/* Clear Selection button (only visible when messages are selected and not editing) */}
//                 {showActionsMenu && !isEditing && (
//                     <button
//                         onClick={onClearSelection}
//                         className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                         aria-label="Clear selection"
//                         title="Clear Selection"
//                     >
//                         <XCircle size={20} />
//                     </button>
//                 )}

//                 {/* More options dropdown (ellipsis) */}
//                 {showActionsMenu && !isEditing && ( // Only show ellipsis if actions are available and not editing
//                     <button
//                         ref={buttonRef}
//                         onClick={() => setShowDropdown(!showDropdown)}
//                         className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                         aria-label="More chat options"
//                     >
//                         <MoreVertical size={20} />
//                     </button>
//                 )}
//                 {showDropdown && (
//                     <div
//                         ref={dropdownRef}
//                         className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1"
//                     >
//                         {/* Edit option */}
//                         {isSelectedMessageMineAndNotDeleted && (
//                             <button
//                                 onClick={handleEditOptionClick}
//                                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                             >
//                                 <Edit size={16} className="mr-2" /> Edit Message
//                             </button>
//                         )}
//                         {/* Delete Selected Messages */}
//                         {selectedMessages.length > 0 && (
//                             <button
//                                 onClick={() => { onDeleteSelected(); setShowDropdown(false); }}
//                                 className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
//                             >
//                                 <Trash2 size={16} className="mr-2" /> Delete Selected
//                             </button>
//                         )}
//                         {/* Delete All Messages */}
//                         <button
//                             onClick={() => { onDeleteAll(); setShowDropdown(false); }}
//                             className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
//                         >
//                             <Trash2 size={16} className="mr-2" /> Delete All My Messages
//                         </button>
//                     </div>
//                 )}

//                 {/* Close Button */}
//                 <button
//                     onClick={onClose}
//                     className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     aria-label="Close chat"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ChatHeader;


'use client';

import React, { FC, useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Edit, Trash2, XCircle } from 'lucide-react';
import { GeneralUser, Message } from '../app/types'; // Adjust path if necessary

interface ChatHeaderProps {
    chatUser: GeneralUser;
    defaultAvatarUrl: string;
    getFullMediaUrl: (relativePath?: string) => string;
    onClose: () => void;
    showActionsMenu: boolean; // Controls if the MoreVertical icon (and its menu) is shown
    onDeleteSelected: () => void;
    onDeleteAll: () => void;
    onClearSelection: () => void; // Added for clearing selection from header
    // New props for editing
    selectedMessages: string[]; // Pass selected message IDs to determine edit option
    messages: Message[]; // Pass all messages to find the actual message object for editing
    currentUserId: string; // To check if the selected message belongs to the current user
    onEditMessage: (message: Message) => void; // Callback to trigger edit mode in ChatWindow
    isEditing: boolean; // Indicates if ChatWindow is in editing mode
}

const ChatHeader: FC<ChatHeaderProps> = ({
    chatUser,
    defaultAvatarUrl,
    getFullMediaUrl,
    onClose,
    showActionsMenu,
    onDeleteSelected,
    onDeleteAll,
    onClearSelection,
    selectedMessages,
    messages,
    currentUserId,
    onEditMessage,
    isEditing,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Determine if a single, non-deleted, current user's message is selected for editing
    const canEdit = selectedMessages.length === 1 && !isEditing;
    const selectedMessage = canEdit ? messages.find(msg => msg._id === selectedMessages[0]) : null;
    const isSelectedMessageMineAndNotDeleted = selectedMessage && selectedMessage.sender._id === currentUserId && !selectedMessage.isDeleted;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEditOptionClick = () => {
        if (selectedMessage) {
            onEditMessage(selectedMessage);
            onClearSelection(); // Clear selection after initiating edit
            setShowDropdown(false); // Close dropdown
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center">
                {/* Back Button (ChevronLeft) */}
                <button
                    onClick={() => {
                        onClose();
                        onClearSelection(); // Clear selection when closing chat
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 mr-3 cursor-pointer"
                    aria-label="Back to chats"
                >
                    <ChevronLeft size={24} />
                </button>
                <img
                    src={getFullMediaUrl(chatUser.avatarUrl || defaultAvatarUrl)}
                    alt={chatUser.name || chatUser.username}
                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatarUrl;
                    }}
                />
                <h2 className="text-xl font-semibold text-gray-800 flex-1">{chatUser.name || chatUser.username}</h2>
            </div>

            <div className="relative flex items-center space-x-2 top-3">
                {/* Clear Selection button (only visible when messages are selected and not editing) */}
                {selectedMessages.length > 0 && !isEditing && ( // Show clear selection if any message is selected and not editing
                    <button
                        onClick={onClearSelection}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                        aria-label="Clear selection"
                        title="Clear Selection"
                    >
                        <XCircle size={20} />
                    </button>
                )}

                {/* More options dropdown (ellipsis) */}
                {showActionsMenu && !isEditing && ( // Only show ellipsis if actions are available and not editing
                    <button
                        ref={buttonRef}
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer mr-0"
                        aria-label="More chat options"
                    >
                        <MoreVertical size={20} />
                    </button>
                )}
                {showDropdown && (
                    <div
                        ref={dropdownRef}
                        className="absolute right-0 top-full mt-2 w-35 bg-white rounded-md shadow-lg z-50 py-1"
                    >
                        {/* Edit option */}
                        {isSelectedMessageMineAndNotDeleted && (
                            <button
                                onClick={handleEditOptionClick}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left  cursor-pointer"
                            >
                                <Edit size={16} className="mr-2" /> Edit Message
                            </button>
                        )}
                        {/* Delete Selected Messages */}
                        {selectedMessages.length > 0 && (
                            <button
                                onClick={() => { onDeleteSelected(); setShowDropdown(false); }}
                                className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left  cursor-pointer"
                            >
                                <Trash2 size={16} className="mr-2" /> Delete
                            </button>
                        )}
                        {/* Delete All Messages */}
                        <button
                            onClick={() => { onDeleteAll(); setShowDropdown(false); }}
                            className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left  cursor-pointer"
                        >
                            <Trash2 size={16} className="mr-2" /> Delete All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHeader;