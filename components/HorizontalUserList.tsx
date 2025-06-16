// HorizontalUserList.tsx
'use client';

import React from 'react';

interface User {
  id: string;
  username: string;
  avatarUrl: string;
}

interface Props {
  followers: User[];
  following: User[];
}

const HorizontalUserList: React.FC<Props> = ({ followers, following }) => {
  // Merge and filter out duplicates by user id
  const mergedUsersMap = new Map<string, User>();
  [...followers, ...following].forEach((user) => {
    if (!mergedUsersMap.has(user.id)) {
      mergedUsersMap.set(user.id, user);
    }
  });

  const uniqueUsers = Array.from(mergedUsersMap.values());

  return (
    <div className="flex space-x-4 overflow-x-auto py-4 px-2 bg-white rounded-xl shadow-sm">
      {uniqueUsers.map((user) => (
        <div key={user.id} className="flex flex-col items-center w-20 flex-shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-14 h-14 rounded-full border-2 border-pink-400 object-cover"
          />
          <p className="text-xs text-center mt-1 truncate w-full">{user.username}</p>
        </div>
      ))}
    </div>
  );
};

export default HorizontalUserList;
