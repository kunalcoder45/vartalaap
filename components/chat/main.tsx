'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ChatList from './chatList';
// Correctly import the full chat window component (your original ChatWindow.tsx)
import ChatWindow from '../ChatWindow'; // Assuming ChatWindow is in the components/ directory
import defaultAvatar from '../../app/assets/userLogo.png';
import { AppUser, GeneralUser } from '../../app/types';
import { MessageSquareText } from 'lucide-react';

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'http://localhost:5001';

interface ActivityBarProps {
  userId: string | null;
}

const Main: React.FC<ActivityBarProps> = ({ userId }) => {
  const [selectedChatUser, setSelectedChatUser] = useState<AppUser | null>(null);
  // isChatWindowOpen state controls the visibility of the ChatWindow component
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

  // Memoize default avatar URL resolution
  const defaultAvatarUrl = useMemo(() => {
    return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
  }, []);

  // Callback to construct full media URLs, handling relative paths and encoding
  const getFullMediaUrl = useCallback((relativePath?: string): string => {
    if (!relativePath || relativePath.startsWith('http')) {
      return relativePath || defaultAvatarUrl;
    }
    const baseUrl = MEDIA_BASE_URL.endsWith('/')
      ? MEDIA_BASE_URL.slice(0, -1)
      : MEDIA_BASE_URL;

    const normalizedPath = relativePath.replace(/\\/g, '/');
    const encodedPath = normalizedPath
      .split('/')
      .map(encodeURIComponent)
      .join('/');

    return `${baseUrl}/${encodedPath}`;
  }, [defaultAvatarUrl]);

  // Handler for selecting a chat user from the ChatList
  const handleSelectChatUser = useCallback((user: AppUser) => {
    setSelectedChatUser(user);
    setIsChatWindowOpen(true); // Open the chat window when a user is selected
    console.log(`[ActivityBar] Selected: ${user.name} (${user._id})`);
  }, []);

  // Handler for closing the chat window
  const handleCloseChatWindow = useCallback(() => {
    setIsChatWindowOpen(false);
    setSelectedChatUser(null); // Clear the selected user when the window closes
  }, []);

  // Handler for when a message is successfully sent
  const handleMessageSent = useCallback(() => {
    // This can be used to trigger updates in the ChatList, e.g., refreshing unread counts.
    console.log("A message was sent, refresh UI if needed.");
  }, []);

  return (
    <div className="h-full w-full flex">
      <div className="flex h-full w-full">
        {/* Left side: ChatList */}
        <div className="w-3/4 border-r border-gray-300">
          <ChatList
            userId={userId}
            getFullMediaUrl={getFullMediaUrl}
            defaultAvatarUrl={defaultAvatarUrl}
            onSelectChat={handleSelectChatUser}
            currentSelectedChatUser={selectedChatUser}
          />
        </div>

        {/* Right side: ChatWindow */}
        <div className="w-2/4">
          {isChatWindowOpen && selectedChatUser && userId ? (
            <ChatWindow
              isOpen={isChatWindowOpen}
              onClose={handleCloseChatWindow}
              chatUser={selectedChatUser as GeneralUser}
              currentUserId={userId}
              getFullMediaUrl={getFullMediaUrl}
              defaultAvatarUrl={defaultAvatarUrl}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="p-4 rounded-full border border-gray-400 mb-2">
                <MessageSquareText className="w-10 h-10"/>
              </div>
              <p className="text-center">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Main;
