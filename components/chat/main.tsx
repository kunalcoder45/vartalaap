// 'use client';

// import React, { useCallback, useMemo, useState } from 'react';
// import ChatList from './chatList';
// import ChatWindow from '../ChatWindow';
// import defaultAvatar from '../../app/assets/userLogo.png';
// import { ChatParticipant } from '../../app/types';
// import { MessageSquareText } from 'lucide-react';

// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'https://vartalaap-r36o.onrender.com';

// interface ActivityBarProps {
//   userId: string | null;
// }

// const Main: React.FC<ActivityBarProps> = ({ userId }) => {
//   const [selectedChatUser, setSelectedChatUser] = useState<ChatParticipant | null>(null);
//   const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

//   const defaultAvatarUrl = useMemo(() => {
//     return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
//   }, []);

//   const getFullMediaUrl = useCallback((relativePath?: string): string => {
//     if (!relativePath || relativePath.startsWith('http')) {
//       return relativePath || defaultAvatarUrl;
//     }
//     const baseUrl = MEDIA_BASE_URL.endsWith('/')
//       ? MEDIA_BASE_URL.slice(0, -1)
//       : MEDIA_BASE_URL;

//     const normalizedPath = relativePath.replace(/\\/g, '/');
//     const encodedPath = normalizedPath
//       .split('/')
//       .map(encodeURIComponent)
//       .join('/');

//     return `${baseUrl}/${encodedPath}`;
//   }, [defaultAvatarUrl]);

//   const handleSelectChatUser = useCallback((user: ChatParticipant) => {
//     setSelectedChatUser(user);
//     setIsChatWindowOpen(true);
//     console.log(`[ActivityBar] Selected: ${user.displayName || user.name} (${user._id})`);
//   }, []);

//   const handleCloseChatWindow = useCallback(() => {
//     setIsChatWindowOpen(false);
//     setSelectedChatUser(null);
//   }, []);

//   const handleMessageSent = useCallback(() => {
//     console.log("A message was sent, refresh UI if needed.");
//   }, []);

//   return (
//     <div className="h-full w-full flex">
//       <div className="flex h-full w-full">
//         {/* Left side: ChatList */}
//         <div className="w-3/4 border-r border-gray-300">
//           <ChatList
//             userId={userId}
//             getFullMediaUrl={getFullMediaUrl}
//             defaultAvatarUrl={defaultAvatarUrl}
//             onSelectChat={handleSelectChatUser}
//             currentSelectedChatUser={selectedChatUser}
//           />
//         </div>

//         {/* Right side: ChatWindow */}
//         <div className="w-2/4">
//           {isChatWindowOpen && selectedChatUser && userId ? (
//             <ChatWindow
//               isOpen={isChatWindowOpen}
//               onClose={handleCloseChatWindow}
//               chatUser={selectedChatUser}
//               currentUserId={userId}
//               getFullMediaUrl={getFullMediaUrl}
//               defaultAvatarUrl={defaultAvatarUrl}
//               onMessageSent={handleMessageSent}
//             />
//           ) : (
//             <div className="hidden flex-col items-center justify-center h-full text-gray-500 md:flex">
//               <div className="p-4 rounded-full border border-gray-400 mb-2">
//                 <MessageSquareText className="w-10 h-10" />
//               </div>
//               <p className="text-center">Select a chat to start messaging</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Main;



// responsiveness

// 'use client';

// import React, { useCallback, useMemo, useState } from 'react';
// import ChatList from './chatList';
// import ChatWindow from '../ChatWindow';
// import defaultAvatar from '../../app/assets/userLogo.png';
// import { ChatParticipant } from '../../app/types';
// import { MessageSquareText } from 'lucide-react';

// const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'https://vartalaap-r36o.onrender.com';

// interface ActivityBarProps {
//   userId: string | null;
// }

// const Main: React.FC<ActivityBarProps> = ({ userId }) => {
//   const [selectedChatUser, setSelectedChatUser] = useState<ChatParticipant | null>(null);
//   const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

//   const defaultAvatarUrl = useMemo(() => {
//     return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
//   }, []);

//   const getFullMediaUrl = useCallback((relativePath?: string): string => {
//     if (!relativePath || relativePath.startsWith('http')) {
//       return relativePath || defaultAvatarUrl;
//     }
//     const baseUrl = MEDIA_BASE_URL.endsWith('/')
//       ? MEDIA_BASE_URL.slice(0, -1)
//       : MEDIA_BASE_URL;

//     const normalizedPath = relativePath.replace(/\\/g, '/');
//     const encodedPath = normalizedPath
//       .split('/')
//       .map(encodeURIComponent)
//       .join('/');

//     return `${baseUrl}/${encodedPath}`;
//   }, [defaultAvatarUrl]);

//   const handleSelectChatUser = useCallback((user: ChatParticipant) => {
//     setSelectedChatUser(user);
//     setIsChatWindowOpen(true);
//   }, []);

//   const handleCloseChatWindow = useCallback(() => {
//     setIsChatWindowOpen(false);
//     setSelectedChatUser(null);
//   }, []);

//   const handleMessageSent = useCallback(() => {
//     console.log("Message sent.");
//   }, []);

//   return (
//     <div className="h-full w-full flex relative"> {/* Added h-full */}
//       {/* Desktop Layout */}
//       <div className="hidden md:flex h-full w-full"> {/* Added h-full */}
//         <div className="w-3/4 border-r border-gray-300 h-full"> {/* Added h-full */}
//           <ChatList
//             userId={userId}
//             getFullMediaUrl={getFullMediaUrl}
//             defaultAvatarUrl={defaultAvatarUrl}
//             onSelectChat={handleSelectChatUser}
//             currentSelectedChatUser={selectedChatUser}
//           />
//         </div>
//         <div className="w-2/4 h-full"> {/* Added h-full */}
//           {isChatWindowOpen && selectedChatUser && userId ? (
//             <ChatWindow
//               isOpen={isChatWindowOpen}
//               onClose={handleCloseChatWindow}
//               chatUser={selectedChatUser}
//               currentUserId={userId}
//               getFullMediaUrl={getFullMediaUrl}
//               defaultAvatarUrl={defaultAvatarUrl}
//               onMessageSent={handleMessageSent}
//             />
//           ) : (
//             <div className="hidden flex-col items-center justify-center h-full text-gray-500 md:flex">
//               <div className="p-4 rounded-full border border-gray-400 mb-2">
//                 <MessageSquareText className="w-10 h-10" />
//               </div>
//               <p className="text-center">Select a chat to start messaging</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile Layout */}
//       <div className="md:hidden flex w-full h-full"> {/* Added h-full */}
//         {!isChatWindowOpen ? (
//           <div className="w-full h-full"> {/* Added h-full */}
//             <ChatList
//               userId={userId}
//               getFullMediaUrl={getFullMediaUrl}
//               defaultAvatarUrl={defaultAvatarUrl}
//               onSelectChat={handleSelectChatUser}
//               currentSelectedChatUser={selectedChatUser}
//             />
//           </div>
//         ) : (
//           <div className="fixed inset-0 bg-white z-50 transition-transform animate-slide-in">
//             <ChatWindow
//               isOpen={isChatWindowOpen}
//               onClose={handleCloseChatWindow}
//               chatUser={selectedChatUser!}
//               currentUserId={userId}
//               getFullMediaUrl={getFullMediaUrl}
//               defaultAvatarUrl={defaultAvatarUrl}
//               onMessageSent={handleMessageSent}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Main;





'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ChatList from './chatList';
import ChatWindow from '../ChatWindow';
import defaultAvatar from '../../app/assets/userLogo.png';
import { ChatParticipant } from '../../app/types';
import { MessageSquareText } from 'lucide-react';

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL || 'https://vartalaap-r36o.onrender.com';

interface ActivityBarProps {
  userId: string | null;
}

const Main: React.FC<ActivityBarProps> = ({ userId }) => {
  const [selectedChatUser, setSelectedChatUser] = useState<ChatParticipant | null>(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

  const defaultAvatarUrl = useMemo(() => {
    return typeof defaultAvatar === 'string' ? defaultAvatar : defaultAvatar.src;
  }, []);

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

  const handleSelectChatUser = useCallback((user: ChatParticipant) => {
    setSelectedChatUser(user);
    setIsChatWindowOpen(true);
  }, []);

  const handleCloseChatWindow = useCallback(() => {
    setIsChatWindowOpen(false);
    setSelectedChatUser(null);
  }, []);

  const handleMessageSent = useCallback(() => {
    console.log("Message sent.");
  }, []);

  return (
    <div className="h-full w-full flex">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full w-full">
        <div className="w-3/4 border-r border-gray-300 h-full">
          <ChatList
            userId={userId}
            getFullMediaUrl={getFullMediaUrl}
            defaultAvatarUrl={defaultAvatarUrl}
            onSelectChat={handleSelectChatUser}
            currentSelectedChatUser={selectedChatUser}
          />
        </div>
        <div className="w-2/4 h-full">
          {isChatWindowOpen && selectedChatUser && userId ? (
            <ChatWindow
              isOpen={isChatWindowOpen}
              onClose={handleCloseChatWindow}
              chatUser={selectedChatUser}
              currentUserId={userId}
              getFullMediaUrl={getFullMediaUrl}
              defaultAvatarUrl={defaultAvatarUrl}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="p-4 rounded-full border border-gray-400 mb-2">
                <MessageSquareText className="w-10 h-10" />
              </div>
              <p className="text-center">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex w-full h-full">
        {!isChatWindowOpen ? (
          <div className="w-full h-full">
            <ChatList
              userId={userId}
              getFullMediaUrl={getFullMediaUrl}
              defaultAvatarUrl={defaultAvatarUrl}
              onSelectChat={handleSelectChatUser}
              currentSelectedChatUser={selectedChatUser}
            />
          </div>
        ) : (
          <div className="fixed inset-0 bg-white z-50 transition-transform animate-slide-in top-30">
            <ChatWindow
              isOpen={isChatWindowOpen}
              onClose={handleCloseChatWindow}
              chatUser={selectedChatUser!}
              currentUserId={userId}
              getFullMediaUrl={getFullMediaUrl}
              defaultAvatarUrl={defaultAvatarUrl}
              onMessageSent={handleMessageSent}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;