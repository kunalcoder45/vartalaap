'use client';

import React, { FC, useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Edit,
  Trash2,
  XCircle,
  Palette,
  Phone,
  Video,
} from 'lucide-react';
import { GeneralUser, Message, CustomUser } from '../app/types'; // Ensure these are correct
import { useCall } from '../app/context/CallProvider';

const themes = [
  { name: 'Cute Cat', imageUrl: '/images/cat.jpg' },
  { name: 'BMW Ride', imageUrl: '/images/bmw.jpg' },
  { name: 'Doraemon Vibes', imageUrl: '/images/doremon.jpg' },
  { name: 'Love Moments', imageUrl: '/images/love.jpg' },
  { name: 'Nature Tree', imageUrl: '/images/tree.jpg' },
];

interface ChatHeaderProps {
  chatUser: GeneralUser; // The user you want to chat/call with
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
  onThemeChange: (imageUrl: string | null) => void;
  currentThemeImage: string | null;
  isTyping: boolean;
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
  onThemeChange,
  currentThemeImage,
  isTyping,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  // Call context
  const { startCall, isInCall } = useCall();

  // Check if user can edit selected message
  const canEdit = selectedMessages.length === 1 && !isEditing;
  const selectedMessage = canEdit
    ? messages.find((msg) => msg._id === selectedMessages[0])
    : null;

  const isSelectedMessageMineAndNotDeleted =
    selectedMessage &&
    selectedMessage.sender._id === currentUserId &&
    !selectedMessage.isDeleted;

  // Close dropdowns on outside click
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setShowDropdown(false);
  };

  // Voice call button handler
  const handleAudioCall = () => {
    if (isInCall) {
      alert('Already in a call');
      return;
    }
    // Corrected: Passing all 4 required arguments
    startCall(chatUser._id, chatUser.name || chatUser.username, chatUser.avatarUrl || null, 'audio');
  };

  // Video call button handler
  const handleVideoCall = () => {
    if (isInCall) {
      alert('Already in a call');
      return;
    }
    // Corrected: Passing all 4 required arguments
    startCall(chatUser._id, chatUser.name || chatUser.username, chatUser.avatarUrl || null, 'video');
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
        <div className="flex flex-col justify-center">
          <h2 className="text-sm md:text-xl font-semibold text-gray-800 flex-1">
            {chatUser.name || chatUser.username}
          </h2>
          {isTyping && <span className="text-xs text-green-500">Typing...</span>}
        </div>
      </div>

      <div className="relative flex items-center space-x-2">
        {/* Audio Call Button */}
        <button
          disabled={isInCall}
          onClick={handleAudioCall}
          title="Audio Call"
          className={`p-2 rounded-full ${
            isInCall ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
          } text-blue-600`}
        >
          <Phone size={20} />
        </button>

        {/* Video Call Button */}
        <button
          disabled={isInCall}
          onClick={handleVideoCall}
          title="Video Call"
          className={`p-2 rounded-full ${
            isInCall ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
          } text-blue-600`}
        >
          <Video size={20} />
        </button>

        {/* Clear selection button */}
        {selectedMessages.length > 0 && !isEditing && (
          <button
            onClick={onClearSelection}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="Clear Selection"
          >
            <XCircle size={20} />
          </button>
        )}

        {/* Actions menu button */}
        {showActionsMenu && !isEditing && (
          <button
            ref={buttonRef}
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="More options"
          >
            <MoreVertical size={20} />
          </button>
        )}

        {/* Dropdown menu */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1"
          >
            {isSelectedMessageMineAndNotDeleted && (
              <button
                onClick={handleEditOptionClick}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Edit size={16} className="mr-2" /> Edit Message
              </button>
            )}
            {selectedMessages.length > 0 && (
              <button
                onClick={() => {
                  onDeleteSelected();
                  setShowDropdown(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left"
              >
                <Trash2 size={16} className="mr-2" /> Delete Selected
              </button>
            )}
            <button
              onClick={() => {
                onDeleteAll();
                setShowDropdown(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-100 w-full text-left"
            >
              <Trash2 size={16} className="mr-2" /> Delete All
            </button>
            <div className="border-t border-gray-200 my-1" />
            <div className="relative">
              <button
                ref={themeButtonRef}
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Palette size={16} className="mr-2" /> Theme
              </button>
              {showThemeDropdown && (
                <div
                  ref={themeDropdownRef}
                  className="absolute right-full top-0 mt-0 mr-1 w-40 bg-white rounded-md shadow-lg z-50 py-1"
                >
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeSelect(theme.imageUrl)}
                      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                        currentThemeImage === theme.imageUrl
                          ? 'bg-blue-100 font-semibold'
                          : ''
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                  <button
                    onClick={() => handleThemeSelect(null)}
                    className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${
                      currentThemeImage === null ? 'bg-blue-100 font-semibold' : ''
                    }`}
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