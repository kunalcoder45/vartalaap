// components/ChatList.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AppUser } from '../../app/types';

// Re-using User and Status interfaces from ActivityBar/StatusViewer
import { User as GeneralUser } from '../StatusViewer';

// Define a type for a chat participant with potentially last message info
interface ChatParticipant extends GeneralUser {
  lastMessageContent?: string;
  lastMessageTimestamp?: string;
}

// Define a type for the data returned by the /api/chats/conversations endpoint
interface ConversationPreview {
  _id: string; // Conversation ID
  otherParticipant: GeneralUser;
  lastMessage: {
    sender: string; // User ID of the sender
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}


interface ChatListProps {
  userId: string | null;
  getFullMediaUrl: (path?: string) => string;
  defaultAvatarUrl: string;
  onSelectChat: (selectedUser: AppUser) => void;
  currentSelectedChatUser: AppUser | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

const ChatList: React.FC<ChatListProps> = ({
  userId,
  getFullMediaUrl,
  defaultAvatarUrl,
  onSelectChat,
  currentSelectedChatUser,
}) => {
  const { getIdToken } = useAuth();
  const [chatUsers, setChatUsers] = useState<GeneralUser[]>([]); // All chat-eligible users (followers/following)
  const [conversations, setConversations] = useState<ConversationPreview[]>([]); // Previews of active conversations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required.');

      const response = await fetch(`${API_BASE_URL}/chats/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch conversations.');
      }

      const data: ConversationPreview[] = await response.json();
      setConversations(data);
      console.log("[ChatList] Fetched conversations:", data);

      // Extract all unique participants from conversations (excluding self)
      const uniqueParticipantIds = new Set<string>();
      data.forEach(conv => {
        if (conv.otherParticipant) {
          uniqueParticipantIds.add(conv.otherParticipant._id);
        }
      });
    } catch (err) {
      console.error('[ChatList] Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, [userId, getIdToken]);

  // Fetch all followers/following to populate the chat list
  const fetchFollowsAndFollowers = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required.');

      // Fetch followed users
      const followingResponse = await fetch(`${API_BASE_URL}/users/${userId}/following`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const followingData = await followingResponse.json();
      const followingUsers: GeneralUser[] = followingData.map((f: any) => ({
        _id: f._id,
        name: f.name,
        avatarUrl: getFullMediaUrl(f.avatarUrl),
      }));

      // Fetch followers
      const followersResponse = await fetch(`${API_BASE_URL}/users/${userId}/followers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const followersData = await followersResponse.json();
      const followerUsers: GeneralUser[] = followersData.map((f: any) => ({
        _id: f._id,
        name: f.name,
        avatarUrl: getFullMediaUrl(f.avatarUrl),
      }));

      // Combine and unique users
      const allChatUsersMap = new Map<string, GeneralUser>();
      [...followingUsers, ...followerUsers].forEach(user => {
        if (user._id !== userId) { // Exclude self
          allChatUsersMap.set(user._id, user);
        }
      });

      const uniqueChatUsers = Array.from(allChatUsersMap.values());
      setChatUsers(uniqueChatUsers);
      console.log("[ChatList] Fetched chat-eligible users (followers/following):", uniqueChatUsers);

    } catch (err) {
      console.error('[ChatList] Error fetching followers/following:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chat contacts.');
    } finally {
      setLoading(false);
    }
  }, [userId, getIdToken, getFullMediaUrl]);


  useEffect(() => {
    if (userId) {
      fetchConversations();
      fetchFollowsAndFollowers();
    }
    // Poll for new messages/conversations periodically (e.g., every 30 seconds)
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchConversations, fetchFollowsAndFollowers]);

  // Combine and sort users: current conversations first, then other eligible users
  const combinedChatList = React.useMemo(() => {
    const list: ChatParticipant[] = [];
    const addedUserIds = new Set<string>();

    // Add users from active conversations first
    conversations.forEach(conv => {
      if (conv.otherParticipant && !addedUserIds.has(conv.otherParticipant._id)) {
        list.push({
          ...conv.otherParticipant,
          lastMessageContent: conv.lastMessage?.content,
          lastMessageTimestamp: conv.lastMessage?.createdAt,
        });
        addedUserIds.add(conv.otherParticipant._id);
      }
    });

    // Add remaining chat-eligible users who are not already in active conversations
    chatUsers.forEach(user => {
      if (!addedUserIds.has(user._id)) {
        list.push(user);
        addedUserIds.add(user._id);
      }
    });

    // Sort: active conversations (by last message time) then alphabetically
    return list.sort((a, b) => {
      if (a.lastMessageTimestamp && b.lastMessageTimestamp) {
        return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
      }
      if (a.lastMessageTimestamp) return -1; // Active conv first
      if (b.lastMessageTimestamp) return 1;  // Active conv first
      return a.name.localeCompare(b.name);
    });
  }, [conversations, chatUsers]);

  return (
    <div className="p-4">
      <h3 className="text-2xl font-semibold mb-3">Chats</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <Skeleton circle width={40} height={40} />
              <div>
                <Skeleton width={100} height={14} />
                <Skeleton width={150} height={10} className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
          {combinedChatList.length === 0 ? (
            <p className="text-gray-500 text-sm">No chats or contacts yet.</p>
          ) : (
            combinedChatList.map(user => (
              <li
                key={user._id}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200
                                    ${currentSelectedChatUser && currentSelectedChatUser._id === user._id ? 'bg-blue-100' : 'hover:bg-gray-100'}
                                `}
                onClick={() => onSelectChat(user)}
              >
                <img
                  src={user.avatarUrl || defaultAvatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatarUrl;
                  }}
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">{user.name}</p>
                  {user.lastMessageContent && (
                    <p className="text-sm text-gray-500 truncate">
                      {user.lastMessageContent}
                    </p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ChatList;