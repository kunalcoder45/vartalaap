// "use client";

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   ReactNode,
// } from "react";

// import io from "socket.io-client";
// import type { Socket } from "socket.io-client/build/esm/socket";

// import { useAuth } from "./AuthProvider";

// const SOCKET_SERVER_URL =
//   process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api", "") ||
//   "https://vartalaap-r36o.onrender.com";

// const NAMESPACE = "";

// type SocketInstance = ReturnType<typeof io> & Socket;

// interface SocketContextType {
//   socket: SocketInstance | null;
//   isConnected: boolean;
//   onlineUsers: string[];
// }

// const SocketContext = createContext<SocketContextType | undefined>(undefined);

// interface SocketProviderProps {
//   children: ReactNode;
// }

// const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
//   const { getIdToken, user, mongoUser } = useAuth();

//   // useState for socket instead of useRef
//   const [socket, setSocket] = useState<SocketInstance | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

//   const connectSocket = useCallback(async () => {
//     if (!user || !mongoUser) {
//       console.log("No authenticated user, skipping socket connect");
//       return;
//     }

//     if (socket && socket.connected) {
//       return; // already connected
//     }

//     try {
//       const token = await getIdToken();
//       if (!token) {
//         console.warn("No token for socket connection");
//         socket?.disconnect();
//         setSocket(null);
//         setIsConnected(false);
//         return;
//       }

//       const url = NAMESPACE
//         ? `${SOCKET_SERVER_URL}${NAMESPACE}`
//         : SOCKET_SERVER_URL;

//       console.log("Connecting to socket:", url);

//       socket?.disconnect();

//       const newSocket = io(url, {
//         auth: { token },
//         transports: ["websocket", "polling"],
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         timeout: 10000,
//         forceNew: true,
//       }) as SocketInstance;

//       setSocket(newSocket);

//       newSocket.on("connect", () => {
//         console.log("Socket connected, ID:", newSocket.id);
//         setIsConnected(true);

//         newSocket.emit("user-online", {
//           userId: mongoUser._id,
//           name: mongoUser.name,
//           avatarUrl: mongoUser.avatarUrl,
//         });
//       });

//       newSocket.on("disconnect", (reason) => {
//         console.log("Socket disconnected:", reason);
//         setIsConnected(false);
//         setOnlineUsers([]);
//       });

//       newSocket.on("connect_error", (error) => {
//         console.error("Socket connection error:", error.message);
//         setIsConnected(false);
//       });

//       newSocket.on("reconnect", () => {
//         console.log("Socket reconnected");
//         setIsConnected(true);

//         newSocket.emit("user-online", {
//           userId: mongoUser._id,
//           name: mongoUser.name,
//           avatarUrl: mongoUser.avatarUrl,
//         });
//       });

//       newSocket.on("online_users", (users: string[]) => {
//         console.log("Online users updated:", users);
//         setOnlineUsers(users);
//       });

//       newSocket.on(
//         "user-status-change",
//         (data: { userId: string; status: "online" | "offline" }) => {
//           console.log("User status changed:", data);
//           setOnlineUsers((prev) =>
//             data.status === "online"
//               ? prev.includes(data.userId)
//                 ? prev
//                 : [...prev, data.userId]
//               : prev.filter((id) => id !== data.userId)
//           );
//         }
//       );
//     } catch (error) {
//       console.error("Error connecting socket:", error);
//       setIsConnected(false);
//     }
//   }, [getIdToken, user, mongoUser, socket]);

//   const disconnectSocket = useCallback(() => {
//     if (socket) {
//       console.log("Disconnecting socket...");
//       if (mongoUser) {
//         socket.emit("user-offline", {
//           userId: mongoUser._id,
//         });
//       }
//       socket.disconnect();
//       setSocket(null);
//       setIsConnected(false);
//       setOnlineUsers([]);
//     }
//   }, [mongoUser, socket]);

//   useEffect(() => {
//     if (user && mongoUser) {
//       connectSocket();
//     } else {
//       disconnectSocket();
//     }

//     return () => {
//       disconnectSocket();
//     };
//   }, [user, mongoUser, connectSocket, disconnectSocket]);

//   const value: SocketContextType = {
//     socket,
//     isConnected,
//     onlineUsers,
//   };

//   return (
//     <SocketContext.Provider value={value}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (context === undefined) {
//     throw new Error("useSocket must be used within SocketProvider");
//   }
//   return context;
// };
// client/components/SocketProvider.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { ReactNode } from 'react';

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket: Socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      transports: ['websocket'], // ✅ recommended
      // auth: { token: 'your_jwt_token_here' } // optional
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
