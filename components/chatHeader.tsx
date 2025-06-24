// 'use client';

// import React, { FC, useState, useRef, useEffect } from 'react';
// import { ChevronLeft, MoreVertical, Edit, Trash2, XCircle } from 'lucide-react';
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
//                 {/* Back Button (ChevronLeft) */}
//                 <button
//                     onClick={() => {
//                         onClose();
//                         onClearSelection(); // Clear selection when closing chat
//                     }}
//                     className="p-1 rounded-full hover:bg-gray-100 text-gray-600 mr-3 cursor-pointer"
//                     aria-label="Back to chats"
//                 >
//                     <ChevronLeft size={24} />
//                 </button>
//                 <img
//                     src={getFullMediaUrl(chatUser.avatarUrl || defaultAvatarUrl)}
//                     alt={chatUser.name || chatUser.username}
//                     className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
//                     onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                     }}
//                 />
//                 <h2 className="text-xl font-semibold text-gray-800 flex-1">{chatUser.name || chatUser.username}</h2>
//             </div>

//             <div className="relative flex items-center space-x-2 top-3">
//                 {/* Clear Selection button (only visible when messages are selected and not editing) */}
//                 {selectedMessages.length > 0 && !isEditing && ( // Show clear selection if any message is selected and not editing
//                     <button
//                         onClick={onClearSelection}
//                         className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
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
//                         className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer mr-0"
//                         aria-label="More chat options"
//                     >
//                         <MoreVertical size={20} />
//                     </button>
//                 )}
//                 {showDropdown && (
//                     <div
//                         ref={dropdownRef}
//                         className="absolute right-0 top-full mt-2 w-35 bg-white rounded-md shadow-lg z-50 py-1"
//                     >
//                         {/* Edit option */}
//                         {isSelectedMessageMineAndNotDeleted && (
//                             <button
//                                 onClick={handleEditOptionClick}
//                                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left  cursor-pointer"
//                             >
//                                 <Edit size={16} className="mr-2" /> Edit Message
//                             </button>
//                         )}
//                         {/* Delete Selected Messages */}
//                         {selectedMessages.length > 0 && (
//                             <button
//                                 onClick={() => { onDeleteSelected(); setShowDropdown(false); }}
//                                 className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left  cursor-pointer"
//                             >
//                                 <Trash2 size={16} className="mr-2" /> Delete
//                             </button>
//                         )}
//                         {/* Delete All Messages */}
//                         <button
//                             onClick={() => { onDeleteAll(); setShowDropdown(false); }}
//                             className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left  cursor-pointer"
//                         >
//                             <Trash2 size={16} className="mr-2" /> Delete All
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ChatHeader;










'use client';

import React, { FC, useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Edit, Trash2, XCircle, Palette } from 'lucide-react'; // Added Palette icon
import { GeneralUser, Message } from '../app/types'; // Adjust path if necessary

// Define themes directly in ChatHeader for simplicity, or you can move this to a separate config file
const themes = [
  { name: "Cute Cat", imageUrl: "/images/cat.jpg" },
  { name: "BMW Ride", imageUrl: "/images/bmw.jpg" },
  { name: "Doraemon Vibes", imageUrl: "/images/doremon.jpg" },
  { name: "Love Moments", imageUrl: "/images/love.jpg" },
  { name: "Nature Tree", imageUrl: "/images/tree.jpg" },
];


interface ChatHeaderProps {
    chatUser: GeneralUser;
    defaultAvatarUrl: string;
    getFullMediaUrl: (relativePath?: string) => string;
    onClose: () => void;
    showActionsMenu: boolean;
    onDeleteSelected: () => void;
    onDeleteAll: () => void;
    onClearSelection: () => void;
    selectedMessages: string[];
    messages: Message[];
    currentUserId: string;
    onEditMessage: (message: Message) => void;
    isEditing: boolean;
    onThemeChange: (imageUrl: string | null) => void; // New prop for theme change
    currentThemeImage: string | null; // New prop to indicate current theme
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
    onThemeChange, // Destructure new prop
    currentThemeImage, // Destructure new prop
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showThemeDropdown, setShowThemeDropdown] = useState(false); // New state for theme dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);
    const themeDropdownRef = useRef<HTMLDivElement>(null); // New ref for theme dropdown
    const buttonRef = useRef<HTMLButtonElement>(null);
    const themeButtonRef = useRef<HTMLButtonElement>(null); // New ref for theme button

    const canEdit = selectedMessages.length === 1 && !isEditing;
    const selectedMessage = canEdit ? messages.find(msg => msg._id === selectedMessages[0]) : null;
    const isSelectedMessageMineAndNotDeleted = selectedMessage && selectedMessage.sender._id === currentUserId && !selectedMessage.isDeleted;

    // Close all dropdowns when clicking outside
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
            if (
                themeDropdownRef.current &&
                !themeDropdownRef.current.contains(event.target as Node) &&
                themeButtonRef.current &&
                !themeButtonRef.current.contains(event.target as Node)
            ) {
                setShowThemeDropdown(false);
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
            onClearSelection();
            setShowDropdown(false);
        }
    };

    const handleThemeSelect = (imageUrl: string | null) => {
        onThemeChange(imageUrl);
        setShowThemeDropdown(false);
        setShowDropdown(false); // Close main dropdown too
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center">
                <button
                    onClick={() => {
                        onClose();
                        onClearSelection();
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

            <div className="relative flex items-center space-x-2"> {/* Removed top-3 */}
                {selectedMessages.length > 0 && !isEditing && (
                    <button
                        onClick={onClearSelection}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                        aria-label="Clear selection"
                        title="Clear Selection"
                    >
                        <XCircle size={20} />
                    </button>
                )}

                {showActionsMenu && !isEditing && (
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
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1"
                    >
                        {isSelectedMessageMineAndNotDeleted && (
                            <button
                                onClick={handleEditOptionClick}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                            >
                                <Edit size={16} className="mr-2" /> Edit Message
                            </button>
                        )}
                        {selectedMessages.length > 0 && (
                            <button
                                onClick={() => { onDeleteSelected(); setShowDropdown(false); }}
                                className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left cursor-pointer"
                            >
                                <Trash2 size={16} className="mr-2" /> Delete Selected
                            </button>
                        )}
                        <button
                            onClick={() => { onDeleteAll(); setShowDropdown(false); }}
                            className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left cursor-pointer"
                        >
                            <Trash2 size={16} className="mr-2" /> Delete All
                        </button>
                        <div className="border-t border-gray-200 my-1"></div> {/* Separator */}
                        {/* Theme Option */}
                        <div className="relative">
                            <button
                                ref={themeButtonRef}
                                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                            >
                                <Palette size={16} className="mr-2" /> Theme
                            </button>
                            {showThemeDropdown && (
                                <div
                                    ref={themeDropdownRef}
                                    className="absolute right-full top-0 mt-0 mr-1 w-40 bg-white rounded-md shadow-lg z-50 py-1"
                                >
                                    {themes.map(theme => (
                                        <button
                                            key={theme.name}
                                            onClick={() => handleThemeSelect(theme.imageUrl)}
                                            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer ${currentThemeImage === theme.imageUrl ? 'bg-blue-100 font-semibold' : ''}`}
                                        >
                                            {theme.name}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleThemeSelect(null)} // Option to clear theme
                                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer ${currentThemeImage === null ? 'bg-blue-100 font-semibold' : ''}`}
                                    >
                                        No Theme
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHeader;