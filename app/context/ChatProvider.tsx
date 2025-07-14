// 'use client';
// import { createContext, useContext, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import { useAuth } from '../../components/AuthProvider';

// // 👇 Create context with correct type using ReturnType
// type SocketType = ReturnType<typeof io>;
// const SocketContext = createContext<SocketType | null>(null);

// // Custom hook to access socket
// export const useSocket = () => useContext(SocketContext);

// export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
//   const { user } = useAuth();
//   const socketRef = useRef<SocketType | null>(null);

//   useEffect(() => {
//     if (user?.uid && !socketRef.current) {
//       const socket = io('http://localhost:5000', {
//         auth: {
//           userId: user.uid,
//         },
//       });

//       socketRef.current = socket;

//       socket.on('connect', () => console.log('🟢 connected'));
//       socket.on('disconnect', () => console.log('🔴 disconnected'));
//     }

//     return () => {
//       socketRef.current?.disconnect();
//       socketRef.current = null;
//     };
//   }, [user?.uid]);

//   return (
//     <SocketContext.Provider value={socketRef.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../components/AuthProvider';

// Define a type for the context value
type SocketContextType = {
  socket: ReturnType<typeof io> | null;
  onlineUsers: Set<string>;
};

// Create context with default value
const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Set(),
});

// Hook to use context
export const useSocket = () => useContext(SocketContext);

// Provider component
export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.uid && !socketRef.current) {
      const socket = io('http://localhost:5000', {
        auth: { userId: user.uid },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('get-online-users');
      });

      socket.on('online-users-list', (users: string[]) => {
        setOnlineUsers(new Set(users));
      });

      socket.on('user-online', (userId: string) => {
        setOnlineUsers((prev) => new Set(prev).add(userId));
      });

      socket.on('user-offline', (userId: string) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setOnlineUsers(new Set());
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setOnlineUsers(new Set());
    };
  }, [user?.uid]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
