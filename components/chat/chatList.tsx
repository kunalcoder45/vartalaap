// // 'use client';

// // import React, { useEffect, useState, useCallback, useMemo } from 'react';
// // import { useAuth } from '../AuthProvider';
// // import Skeleton from 'react-loading-skeleton';
// // import 'react-loading-skeleton/dist/skeleton.css';
// // import { ChatParticipant } from '../../app/types';

// // interface ConversationPreview {
// //   _id: string;
// //   otherParticipant: any; // raw backend response
// //   lastMessage: {
// //     sender: string;
// //     content: string;
// //     createdAt: string;
// //   } | null;
// //   updatedAt: string;
// // }

// // interface ChatListProps {
// //   userId: string | null;
// //   getFullMediaUrl: (path?: string) => string;
// //   defaultAvatarUrl: string;
// //   onSelectChat: (selectedUser: ChatParticipant) => void;
// //   currentSelectedChatUser?: ChatParticipant | null;
// // }

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // const ChatList: React.FC<ChatListProps> = ({
// //   userId,
// //   getFullMediaUrl,
// //   defaultAvatarUrl,
// //   onSelectChat,
// //   currentSelectedChatUser,
// // }) => {
// //   const { getIdToken } = useAuth();
// //   const [chatUsers, setChatUsers] = useState<ChatParticipant[]>([]);
// //   const [conversations, setConversations] = useState<ConversationPreview[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   const fetchConversations = useCallback(async () => {
// //     if (!userId) return;
// //     setError(null);
// //     try {
// //       const token = await getIdToken();
// //       if (!token) throw new Error('Authentication required.');

// //       const res = await fetch(`${API_BASE_URL}/chats/conversations`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       if (!res.ok) throw new Error('Failed to fetch conversations.');
// //       const data: ConversationPreview[] = await res.json();
// //       setConversations(data);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Unknown error');
// //     }
// //   }, [userId, getIdToken]);

// //   const fetchFollowsAndFollowers = useCallback(async () => {
// //     if (!userId) return;
// //     setError(null);
// //     try {
// //       const token = await getIdToken();
// //       if (!token) throw new Error('Authentication required.');

// //       const [followingRes, followersRes] = await Promise.all([
// //         fetch(`${API_BASE_URL}/users/${userId}/following`, { headers: { Authorization: `Bearer ${token}` } }),
// //         fetch(`${API_BASE_URL}/users/${userId}/followers`, { headers: { Authorization: `Bearer ${token}` } }),
// //       ]);

// //       const followingData = await followingRes.json();
// //       const followersData = await followersRes.json();

// //       const users: ChatParticipant[] = [...followingData, ...followersData].map((u: any) => ({
// //         _id: u._id,
// //         uid: u.uid || u.firebaseUid || '', // fallback
// //         name: u.name,
// //         email: u.email || null,
// //         displayName: u.displayName,
// //         username: u.username,
// //         avatarUrl: getFullMediaUrl(u.avatarUrl),
// //         photoURL: u.photoURL,
// //         bio: u.bio,
// //       }));

// //       const uniqueUsers = Array.from(new Map(users.map(user => [user._id, user])).values());
// //       setChatUsers(uniqueUsers);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Error loading contacts');
// //     }
// //   }, [userId, getIdToken, getFullMediaUrl]);

// //   useEffect(() => {
// //     if (!userId) return;

// //     const load = async () => {
// //       setLoading(true);
// //       await Promise.allSettled([fetchConversations(), fetchFollowsAndFollowers()]);
// //       setLoading(false);
// //     };

// //     load();

// //     const interval = setInterval(fetchConversations, 30000);
// //     return () => clearInterval(interval);
// //   }, [userId, fetchConversations, fetchFollowsAndFollowers]);

// //   const combinedChatList = useMemo(() => {
// //     const map = new Map<string, ChatParticipant>();

// //     conversations.forEach(conv => {
// //       const u = conv.otherParticipant;
// //       const participant: ChatParticipant = {
// //         _id: u._id,
// //         uid: u.uid || u.firebaseUid || '',
// //         name: u.name,
// //         email: u.email || null,
// //         displayName: u.displayName,
// //         username: u.username,
// //         avatarUrl: getFullMediaUrl(u.avatarUrl),
// //         photoURL: u.photoURL,
// //         bio: u.bio,
// //         lastMessageContent: conv.lastMessage?.content,
// //         lastMessageTimestamp: conv.lastMessage?.createdAt,
// //       };
// //       map.set(participant._id, participant);
// //     });

// //     chatUsers.forEach(user => {
// //       if (!map.has(user._id)) map.set(user._id, user);
// //     });

// //     return Array.from(map.values()).sort((a, b) => {
// //       if (a.lastMessageTimestamp && b.lastMessageTimestamp)
// //         return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
// //       return (a.name || '').localeCompare(b.name || '');
// //     });
// //   }, [conversations, chatUsers, getFullMediaUrl]);

// //   return (
// //     <div className="p-4 h-full flex flex-col"> {/* Added h-full and flex flex-col */}
// //       <h3 className="text-2xl font-semibold mb-3">Chats</h3>
// //       {error && <div className="text-red-500 text-sm">{error}</div>}
// //       {loading ? (
// //         <Skeleton count={5} height={50} className="mb-2" />
// //       ) : (
// //         <ul className="space-y-2 h-[calc(100%-70px)] overflow-y-auto hide-scrollbar"> {/* Changed max-h-auto to h-[calc(100%-70px)] */}
// //           {combinedChatList.length === 0 ? (
// //             <p className="text-gray-500 text-sm">No chats or contacts yet.</p>
// //           ) : (
// //             combinedChatList.map(user => (
// //               <li
// //                 key={user._id}
// //                 className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200
// //                   ${currentSelectedChatUser?._id === user._id ? 'bg-blue-100' : 'hover:bg-gray-100'}
// //                 `}
// //                 onClick={() => onSelectChat(user)}
// //               >
// //                 <img
// //                   src={user.avatarUrl || defaultAvatarUrl}
// //                   alt={user.name || 'User'}
// //                   className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
// //                   onError={(e) => {
// //                     const target = e.target as HTMLImageElement;
// //                     target.src = defaultAvatarUrl;
// //                   }}
// //                 />
// //                 <div className="flex-1 overflow-hidden">
// //                   <p className="font-medium text-gray-800 truncate">{user.name || user.username || 'Unknown'}</p>
// //                   {user.lastMessageContent && (
// //                     <p className="text-sm text-gray-500 truncate">{user.lastMessageContent}</p>
// //                   )}
// //                 </div>
// //               </li>
// //             ))
// //           )}
// //         </ul>
// //       )}
// //     </div>
// //   );
// // };

// // export default ChatList;






// // 'use client';

// // import React, { useEffect, useState, useCallback, useMemo } from 'react';
// // import { useAuth } from '../AuthProvider';
// // import Skeleton from 'react-loading-skeleton';
// // import 'react-loading-skeleton/dist/skeleton.css';
// // import { ChatParticipant } from '../../app/types';

// // interface ConversationPreview {
// //   _id: string;
// //   otherParticipant: any; // raw backend response
// //   lastMessage: {
// //     sender: string;
// //     content: string;
// //     createdAt: string;
// //   } | null;
// //   updatedAt: string;
// // }

// // interface ChatListProps {
// //   userId: string | null;
// //   getFullMediaUrl: (path?: string) => string;
// //   defaultAvatarUrl: string;
// //   onSelectChat: (selectedUser: ChatParticipant) => void;
// //   currentSelectedChatUser?: ChatParticipant | null;
// // }

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// // const ChatList: React.FC<ChatListProps> = ({
// //   userId,
// //   getFullMediaUrl,
// //   defaultAvatarUrl,
// //   onSelectChat,
// //   currentSelectedChatUser,
// // }) => {
// //   const { getIdToken } = useAuth();
// //   const [chatUsers, setChatUsers] = useState<ChatParticipant[]>([]);
// //   const [conversations, setConversations] = useState<ConversationPreview[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   const fetchConversations = useCallback(async () => {
// //     if (!userId) return;
// //     setError(null);
// //     try {
// //       const token = await getIdToken();
// //       if (!token) throw new Error('Authentication required.');

// //       const res = await fetch(`${API_BASE_URL}/chats/conversations`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       if (!res.ok) throw new Error('Failed to fetch conversations.');
// //       const data: ConversationPreview[] = await res.json();
// //       setConversations(data);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Unknown error');
// //     }
// //   }, [userId, getIdToken]);

// //   const fetchFollowsAndFollowers = useCallback(async () => {
// //     if (!userId) return;
// //     setError(null);
// //     try {
// //       const token = await getIdToken();
// //       if (!token) throw new Error('Authentication required.');

// //       const [followingRes, followersRes] = await Promise.all([
// //         fetch(`${API_BASE_URL}/users/${userId}/following`, { headers: { Authorization: `Bearer ${token}` } }),
// //         fetch(`${API_BASE_URL}/users/${userId}/followers`, { headers: { Authorization: `Bearer ${token}` } }),
// //       ]);

// //       const followingData = await followingRes.json();
// //       const followersData = await followersRes.json();

// //       const users: ChatParticipant[] = [...followingData, ...followersData].map((u: any) => ({
// //         _id: u._id,
// //         uid: u.uid || u.firebaseUid || '', // fallback
// //         name: u.name,
// //         email: u.email || null,
// //         displayName: u.displayName,
// //         username: u.username,
// //         avatarUrl: getFullMediaUrl(u.avatarUrl),
// //         photoURL: u.photoURL,
// //         bio: u.bio,
// //       }));

// //       const uniqueUsers = Array.from(new Map(users.map(user => [user._id, user])).values());
// //       setChatUsers(uniqueUsers);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Error loading contacts');
// //     }
// //   }, [userId, getIdToken, getFullMediaUrl]);

// //   useEffect(() => {
// //     if (!userId) return;

// //     const load = async () => {
// //       setLoading(true);
// //       await Promise.allSettled([fetchConversations(), fetchFollowsAndFollowers()]);
// //       setLoading(false);
// //     };

// //     load();

// //     const interval = setInterval(fetchConversations, 30000);
// //     return () => clearInterval(interval);
// //   }, [userId, fetchConversations, fetchFollowsAndFollowers]);

// //   const combinedChatList = useMemo(() => {
// //     const map = new Map<string, ChatParticipant>();

// //     conversations.forEach(conv => {
// //       const u = conv.otherParticipant;
// //       const participant: ChatParticipant = {
// //         _id: u._id,
// //         uid: u.uid || u.firebaseUid || '',
// //         name: u.name,
// //         email: u.email || null,
// //         displayName: u.displayName,
// //         username: u.username,
// //         avatarUrl: getFullMediaUrl(u.avatarUrl),
// //         photoURL: u.photoURL,
// //         bio: u.bio,
// //         lastMessageContent: conv.lastMessage?.content,
// //         lastMessageTimestamp: conv.lastMessage?.createdAt,
// //       };
// //       map.set(participant._id, participant);
// //     });

// //     chatUsers.forEach(user => {
// //       if (!map.has(user._id)) map.set(user._id, user);
// //     });

// //     return Array.from(map.values()).sort((a, b) => {
// //       if (a.lastMessageTimestamp && b.lastMessageTimestamp)
// //         return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
// //       return (a.name || '').localeCompare(b.name || '');
// //     });
// //   }, [conversations, chatUsers, getFullMediaUrl]);

// //   return (
// //     <div className="h-full flex flex-col p-4">
// //       <div className="flex-shrink-0 mb-4">
// //         <h3 className="text-2xl font-semibold">Chats</h3>
// //         {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
// //       </div>

// //       <div className="flex-1 overflow-hidden">
// //         {loading ? (
// //           <div className="space-y-2">
// //             <Skeleton count={5} height={50} />
// //           </div>
// //         ) : (
// //           <div className="h-full overflow-y-auto hide-scrollbar">
// //             {combinedChatList.length === 0 ? (
// //               <p className="text-gray-500 text-sm">No chats or contacts yet.</p>
// //             ) : (
// //               <ul className="space-y-2">
// //                 {combinedChatList.map(user => (
// //                   <li
// //                     key={user._id}
// //                     className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200
// //                       ${currentSelectedChatUser?._id === user._id ? 'bg-blue-100' : 'hover:bg-gray-100'}
// //                     `}
// //                     onClick={() => onSelectChat(user)}
// //                   >
// //                     <img
// //                       src={user.avatarUrl || defaultAvatarUrl}
// //                       alt={user.name || 'User'}
// //                       className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300 flex-shrink-0"
// //                       onError={(e) => {
// //                         const target = e.target as HTMLImageElement;
// //                         target.src = defaultAvatarUrl;
// //                       }}
// //                     />
// //                     <div className="flex-1 overflow-hidden min-w-0">
// //                       <p className="font-medium text-gray-800 truncate">{user.name || user.username || 'Unknown'}</p>
// //                       {user.lastMessageContent && (
// //                         <p className="text-sm text-gray-500 truncate">{user.lastMessageContent}</p>
// //                       )}
// //                     </div>
// //                   </li>
// //                 ))}
// //               </ul>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ChatList;


// 'use client';

// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import { useAuth } from '../AuthProvider';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { ChatParticipant } from '../../app/types';
// import { useSocket } from '../SocketProvider'; // ✅ make sure this import path is correct

// interface ConversationPreview {
//   _id: string;
//   otherParticipant: any; // raw backend response
//   lastMessage: {
//     sender: string;
//     content: string;
//     createdAt: string;
//   } | null;
//   updatedAt: string;
// }

// interface ChatListProps {
//   userId: string | null;
//   getFullMediaUrl: (path?: string) => string;
//   defaultAvatarUrl: string;
//   onSelectChat: (selectedUser: ChatParticipant) => void;
//   currentSelectedChatUser?: ChatParticipant | null;
// }

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// const ChatList: React.FC<ChatListProps> = ({
//   userId,
//   getFullMediaUrl,
//   defaultAvatarUrl,
//   onSelectChat,
//   currentSelectedChatUser,
// }) => {
//   const { getIdToken } = useAuth();
//   const { socket } = useSocket();

//   const [chatUsers, setChatUsers] = useState<ChatParticipant[]>([]);
//   const [conversations, setConversations] = useState<ConversationPreview[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchConversations = useCallback(async () => {
//     if (!userId) return;
//     setError(null);
//     try {
//       const token = await getIdToken();
//       if (!token) throw new Error('Authentication required.');

//       const res = await fetch(`${API_BASE_URL}/chats/conversations`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) throw new Error('Failed to fetch conversations.');
//       const data: ConversationPreview[] = await res.json();
//       setConversations(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Unknown error');
//     }
//   }, [userId, getIdToken]);

//   const fetchFollowsAndFollowers = useCallback(async () => {
//     if (!userId) return;
//     setError(null);
//     try {
//       const token = await getIdToken();
//       if (!token) throw new Error('Authentication required.');

//       const [followingRes, followersRes] = await Promise.all([
//         fetch(`${API_BASE_URL}/users/${userId}/following`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch(`${API_BASE_URL}/users/${userId}/followers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const followingData = await followingRes.json();
//       const followersData = await followersRes.json();

//       const users: ChatParticipant[] = [...followingData, ...followersData].map((u: any) => ({
//         _id: u._id,
//         uid: u.uid || u.firebaseUid || '',
//         name: u.name,
//         email: u.email || null,
//         displayName: u.displayName,
//         username: u.username,
//         avatarUrl: getFullMediaUrl(u.avatarUrl),
//         photoURL: u.photoURL,
//         bio: u.bio,
//       }));

//       const uniqueUsers = Array.from(new Map(users.map(user => [user._id, user])).values());
//       setChatUsers(uniqueUsers);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Error loading contacts');
//     }
//   }, [userId, getIdToken, getFullMediaUrl]);

//   useEffect(() => {
//     if (!userId) return;

//     const load = async () => {
//       setLoading(true);
//       await Promise.allSettled([fetchConversations(), fetchFollowsAndFollowers()]);
//       setLoading(false);
//     };

//     load();

//     const interval = setInterval(fetchConversations, 30000); // optional fallback
//     return () => clearInterval(interval);
//   }, [userId, fetchConversations, fetchFollowsAndFollowers]);

//   // ✅ SOCKET-BASED REAL-TIME REFRESH
//   // useEffect(() => {
//   //   if (!socket) return;

//   //   const handleNewMessage = () => {
//   //     fetchConversations();
//   //   };

//   //   socket.on('newMessage', handleNewMessage);

//   //   return () => {
//   //     socket.off('newMessage', handleNewMessage);
//   //   };
//   // }, [socket, fetchConversations]);
//   useEffect(() => {
//     if (!socket || !userId) return;

//     const handleNewMessage = (data: {
//       senderId: string;
//       recipientId: string;
//       content: string;
//       createdAt: string;
//     }) => {
//       const partnerId = data.senderId === userId ? data.recipientId : data.senderId;

//       setConversations(prev => {
//         const existing = prev.find(conv => conv.otherParticipant._id === partnerId);

//         const updatedConversation: ConversationPreview = {
//           _id: existing?._id || `temp-${partnerId}`, // fallback
//           otherParticipant: existing?.otherParticipant || chatUsers.find(u => u._id === partnerId),
//           lastMessage: {
//             sender: data.senderId,
//             content: data.content,
//             createdAt: data.createdAt,
//           },
//           updatedAt: data.createdAt,
//         };

//         const filtered = prev.filter(conv => conv.otherParticipant._id !== partnerId);
//         return [updatedConversation, ...filtered];
//       });
//     };

//     socket.on('newMessage', handleNewMessage);
//     return () => socket.off('newMessage', handleNewMessage);
//   }, [socket, userId, fetchConversations]);

//   const combinedChatList = useMemo(() => {
//     const map = new Map<string, ChatParticipant>();

//     conversations.forEach(conv => {
//       const u = conv.otherParticipant;
//       const participant: ChatParticipant = {
//         _id: u._id,
//         uid: u.uid || u.firebaseUid || '',
//         name: u.name,
//         email: u.email || null,
//         displayName: u.displayName,
//         username: u.username,
//         avatarUrl: getFullMediaUrl(u.avatarUrl),
//         photoURL: u.photoURL,
//         bio: u.bio,
//         lastMessageContent: conv.lastMessage?.content,
//         lastMessageTimestamp: conv.lastMessage?.createdAt,
//       };
//       map.set(participant._id, participant);
//     });

//     chatUsers.forEach(user => {
//       if (!map.has(user._id)) map.set(user._id, user);
//     });

//     return Array.from(map.values()).sort((a, b) => {
//       if (a.lastMessageTimestamp && b.lastMessageTimestamp)
//         return (
//           new Date(b.lastMessageTimestamp).getTime() -
//           new Date(a.lastMessageTimestamp).getTime()
//         );
//       return (a.name || '').localeCompare(b.name || '');
//     });
//   }, [conversations, chatUsers, getFullMediaUrl]);

//   return (
//     <div className="h-full flex flex-col p-4">
//       <div className="flex-shrink-0 mb-4">
//         <h3 className="text-2xl font-semibold">Chats</h3>
//         {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
//       </div>

//       <div className="flex-1 overflow-hidden">
//         {loading ? (
//           <div className="space-y-2">
//             <Skeleton count={5} height={50} />
//           </div>
//         ) : (
//           <div className="h-full overflow-y-auto hide-scrollbar">
//             {combinedChatList.length === 0 ? (
//               <p className="text-gray-500 text-sm">No chats or contacts yet.</p>
//             ) : (
//               <ul className="space-y-2">
//                 {combinedChatList.map(user => (
//                   <li
//                     key={user._id}
//                     className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${currentSelectedChatUser?._id === user._id
//                       ? 'bg-blue-100'
//                       : 'hover:bg-gray-100'
//                       }`}
//                     onClick={() => onSelectChat(user)}
//                   >
//                     <img
//                       src={user.avatarUrl || defaultAvatarUrl}
//                       alt={user.name || 'User'}
//                       className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300 flex-shrink-0"
//                       onError={(e) => {
//                         const target = e.target as HTMLImageElement;
//                         target.src = defaultAvatarUrl;
//                       }}
//                     />
//                     <div className="flex-1 overflow-hidden min-w-0">
//                       <p className="font-medium text-gray-800 truncate">
//                         {user.name || user.username || 'Unknown'}
//                       </p>
//                       {user.lastMessageContent && (
//                         <p className="text-sm text-gray-500 truncate">{user.lastMessageContent}</p>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatList;
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../AuthProvider';
import { useSocket } from '../SocketProvider';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChatParticipant } from '../../app/types';

interface ConversationPreview {
  _id: string;
  otherParticipant: any;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

const ChatList: React.FC<ChatListProps> = ({
  userId,
  getFullMediaUrl,
  defaultAvatarUrl,
  onSelectChat,
  currentSelectedChatUser,
}) => {
  const { getIdToken } = useAuth();
  const { socket } = useSocket();

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
        fetch(`${API_BASE_URL}/users/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/users/${userId}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const followingData = await followingRes.json();
      const followersData = await followersRes.json();

      const users: ChatParticipant[] = [...followingData, ...followersData].map((u: any) => ({
        _id: u._id,
        uid: u.uid || u.firebaseUid || '',
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

    setLoading(true);
    Promise.allSettled([fetchConversations(), fetchFollowsAndFollowers()]).finally(() => setLoading(false));

    // Optional: refresh conversations every 30s as fallback
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchConversations, fetchFollowsAndFollowers]);

  // ** Important fix: define handleNewMessage using useCallback at component top level **
  const handleNewMessage = useCallback((data: {
    conversationId: string;
    message: {
      sender: string;
      content: string;
      createdAt: string;
    };
  }) => {
    const existingConv = conversations.find(c => c._id === data.conversationId);
    const partnerId = existingConv?.otherParticipant?._id || null;

    setConversations(prev => {
      const updatedConv: ConversationPreview = {
        _id: data.conversationId,
        otherParticipant: existingConv?.otherParticipant || chatUsers.find(u => u._id === partnerId) || {
          _id: partnerId || 'unknown',
          name: 'Unknown',
          avatarUrl: defaultAvatarUrl,
        },
        lastMessage: {
          sender: data.message.sender,
          content: data.message.content,
          createdAt: data.message.createdAt,
        },
        updatedAt: data.message.createdAt,
      };

      const filtered = prev.filter(c => c._id !== data.conversationId);
      return [updatedConv, ...filtered];
    });
  }, [conversations, chatUsers, defaultAvatarUrl]);

  // Listen for socket messages
  useEffect(() => {
    if (!socket || !userId) return;

    socket.on('message_received', handleNewMessage);
    return () => {
      socket.off('message_received', handleNewMessage);
    };
  }, [socket, userId, handleNewMessage]);

  // Combine chatUsers and conversations
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
      if (a.lastMessageTimestamp && b.lastMessageTimestamp) {
        return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [conversations, chatUsers, getFullMediaUrl]);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-shrink-0 mb-4">
        <h3 className="text-2xl font-semibold">Chats</h3>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-2">
            <Skeleton count={5} height={50} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto hide-scrollbar">
            {combinedChatList.length === 0 ? (
              <p className="text-gray-500 text-sm">No chats or contacts yet.</p>
            ) : (
              <ul className="space-y-2">
                {combinedChatList.map(user => (
                  <li
                    key={user._id}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                      currentSelectedChatUser?._id === user._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectChat(user)}
                  >
                    <img
                      src={user.avatarUrl || defaultAvatarUrl}
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300 flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatarUrl;
                      }}
                    />
                    <div className="flex-1 overflow-hidden min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {user.name || user.username || 'Unknown'}
                      </p>
                      {user.lastMessageContent && (
                        <p className="text-sm text-gray-500 truncate">{user.lastMessageContent}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
