'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../AuthProvider';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChatParticipant } from '../../app/types';

interface ConversationPreview {
  _id: string;
  otherParticipant: any; // raw backend response
  lastMessage: {
    sender: string;
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

interface ChatListProps {
  userId: string | null;
  getFullMediaUrl: (path?: string) => string;
  defaultAvatarUrl: string;
  onSelectChat: (selectedUser: ChatParticipant) => void;
  currentSelectedChatUser?: ChatParticipant | null;
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
  const [chatUsers, setChatUsers] = useState<ChatParticipant[]>([]);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required.');

      const res = await fetch(`${API_BASE_URL}/chats/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch conversations.');
      const data: ConversationPreview[] = await res.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [userId, getIdToken]);

  const fetchFollowsAndFollowers = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required.');

      const [followingRes, followersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${userId}/following`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users/${userId}/followers`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const followingData = await followingRes.json();
      const followersData = await followersRes.json();

      const users: ChatParticipant[] = [...followingData, ...followersData].map((u: any) => ({
        _id: u._id,
        uid: u.uid || u.firebaseUid || '', // fallback
        name: u.name,
        email: u.email || null,
        displayName: u.displayName,
        username: u.username,
        avatarUrl: getFullMediaUrl(u.avatarUrl),
        photoURL: u.photoURL,
        bio: u.bio,
      }));

      const uniqueUsers = Array.from(new Map(users.map(user => [user._id, user])).values());
      setChatUsers(uniqueUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading contacts');
    }
  }, [userId, getIdToken, getFullMediaUrl]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      await Promise.allSettled([fetchConversations(), fetchFollowsAndFollowers()]);
      setLoading(false);
    };

    load();

    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchConversations, fetchFollowsAndFollowers]);

  const combinedChatList = useMemo(() => {
    const map = new Map<string, ChatParticipant>();

    conversations.forEach(conv => {
      const u = conv.otherParticipant;
      const participant: ChatParticipant = {
        _id: u._id,
        uid: u.uid || u.firebaseUid || '',
        name: u.name,
        email: u.email || null,
        displayName: u.displayName,
        username: u.username,
        avatarUrl: getFullMediaUrl(u.avatarUrl),
        photoURL: u.photoURL,
        bio: u.bio,
        lastMessageContent: conv.lastMessage?.content,
        lastMessageTimestamp: conv.lastMessage?.createdAt,
      };
      map.set(participant._id, participant);
    });

    chatUsers.forEach(user => {
      if (!map.has(user._id)) map.set(user._id, user);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.lastMessageTimestamp && b.lastMessageTimestamp)
        return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [conversations, chatUsers, getFullMediaUrl]);

  return (
    <div className="p-4">
      <h3 className="text-2xl font-semibold mb-3">Chats</h3>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {loading ? (
        <Skeleton count={5} height={50} className="mb-2" />
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
          {combinedChatList.length === 0 ? (
            <p className="text-gray-500 text-sm">No chats or contacts yet.</p>
          ) : (
            combinedChatList.map(user => (
              <li
                key={user._id}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200
                  ${currentSelectedChatUser?._id === user._id ? 'bg-blue-100' : 'hover:bg-gray-100'}
                `}
                onClick={() => onSelectChat(user)}
              >
                <img
                  src={user.avatarUrl || defaultAvatarUrl}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatarUrl;
                  }}
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">{user.name || user.username || 'Unknown'}</p>
                  {user.lastMessageContent && (
                    <p className="text-sm text-gray-500 truncate">{user.lastMessageContent}</p>
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
