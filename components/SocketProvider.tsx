// 'use client';

// import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAuth } from './AuthProvider';

// // Fix: Remove /api from socket URL - sockets connect directly to server, not API routes
// const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:5001';

// interface SocketContextType {
//     socket: Socket | null;
//     isConnected: boolean;
// }

// const SocketContext = createContext<SocketContextType | undefined>(undefined);

// const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//     const { getIdToken, user } = useAuth(); // Also get user to check auth state
//     const socketRef = useRef<Socket | null>(null);
//     const [isConnected, setIsConnected] = useState(false);

//     const connectSocket = useCallback(async () => {
//         // Don't connect if no user is authenticated
//         if (!user) {
//             console.log("No user authenticated, skipping socket connection");
//             return;
//         }

//         if (socketRef.current && socketRef.current.connected) {
//             return; // Already connected
//         }

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 console.warn("No authentication token available for socket connection.");
//                 if (socketRef.current) {
//                     socketRef.current.disconnect();
//                     socketRef.current = null;
//                 }
//                 setIsConnected(false);
//                 return;
//             }

//             console.log("Connecting to socket server:", SOCKET_SERVER_URL);

//             // Disconnect existing socket if any
//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//             }

//             // Create new socket connection
//             socketRef.current = io(SOCKET_SERVER_URL, {
//                 auth: { token },
//                 transports: ['websocket', 'polling'], // Allow both transports
//                 reconnectionAttempts: 5,
//                 reconnectionDelay: 1000,
//                 timeout: 10000,
//             });

//             socketRef.current.on('connect', () => {
//                 console.log('Socket connected:', socketRef.current?.id);
//                 setIsConnected(true);
//             });

//             socketRef.current.on('disconnect', (reason) => {
//                 console.log('Socket disconnected:', reason);
//                 setIsConnected(false);
//             });

//             socketRef.current.on('connect_error', (error) => {
//                 console.error('Socket connection error:', error.message);
//                 setIsConnected(false);
//             });

//             // Listen for reconnection
//             socketRef.current.on('reconnect', () => {
//                 console.log('Socket reconnected');
//                 setIsConnected(true);
//             });

//         } catch (error) {
//             console.error('Error in connectSocket:', error);
//             setIsConnected(false);
//         }
//     }, [getIdToken, user]);

//     const disconnectSocket = useCallback(() => {
//         if (socketRef.current) {
//             console.log("Disconnecting socket...");
//             socketRef.current.disconnect();
//             socketRef.current = null;
//             setIsConnected(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (user) {
//             connectSocket();
//         } else {
//             disconnectSocket();
//         }

//         return () => {
//             disconnectSocket();
//         };
//     }, [user, connectSocket, disconnectSocket]);

//     const value = {
//         socket: socketRef.current,
//         isConnected,
//     };

//     return (
//         <SocketContext.Provider value={value}>
//             {children}
//         </SocketContext.Provider>
//     );
// };

// export default SocketProvider;

// export const useSocket = () => {
//     const context = useContext(SocketContext);
//     if (context === undefined) {
//         throw new Error('useSocket must be used within a SocketProvider');
//     }
//     return context;
// };





// 'use client';

// import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAuth } from './AuthProvider'; // Make sure AuthProvider gives you firebaseUser.uid

// // Fix: Remove /api from socket URL - sockets connect directly to server, not API routes
// const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_NEW_URL?.replace('/api', '') || 'http://localhost:5001';

// interface SocketContextType {
//     socket: Socket | null;
//     isConnected: boolean;
// }

// const SocketContext = createContext<SocketContextType | undefined>(undefined);

// interface SocketProviderProps {
//     children: ReactNode;
// }

// const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
//     const { getIdToken, user } = useAuth(); // Get firebaseUser to check auth state and get UID
//     const socketRef = useRef<Socket | null>(null);
//     const [isConnected, setIsConnected] = useState(false);

//     const connectSocket = useCallback(async () => {
//         // Don't connect if no user is authenticated via Firebase
//         if (!user) {
//             console.log("No Firebase user authenticated, skipping socket connection");
//             return;
//         }

//         // Only connect if not already connected
//         if (socketRef.current && socketRef.current.connected) {
//             return;
//         }

//         try {
//             const token = await getIdToken(); // Get the Firebase ID token for socket authentication
//             if (!token) {
//                 console.warn("No authentication token available for socket connection. User might not be fully authenticated.");
//                 if (socketRef.current) {
//                     socketRef.current.disconnect();
//                     socketRef.current = null;
//                 }
//                 setIsConnected(false);
//                 return;
//             }

//             console.log("Connecting to socket server:", SOCKET_SERVER_URL);

//             // Disconnect existing socket if any before creating a new one
//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//             }

//             // Create new socket connection
//             const newSocket = io(SOCKET_SERVER_URL, {
//                 auth: { token }, // Pass Firebase ID token for authentication
//                 transports: ['websocket', 'polling'], // Allow both transports
//                 reconnectionAttempts: 5,
//                 reconnectionDelay: 1000,
//                 timeout: 10000,
//             });

//             // Assign the new socket to the ref IMMEDIATELY after creation
//             socketRef.current = newSocket; 

//             newSocket.on('connect', () => {
//                 console.log('Socket connected:', newSocket.id);
//                 setIsConnected(true);
//                 // After connection, you might want to emit a 'register' event with the mongoUser._id if your backend uses it for mapping
//                 // However, the backend socketAuth.js already gets socket.userId, so explicit 'register' might not be needed if that's sufficient.
//             });

//             newSocket.on('disconnect', (reason) => {
//                 console.log('Socket disconnected:', reason);
//                 setIsConnected(false);
//             });

//             newSocket.on('connect_error', (error) => {
//                 console.error('Socket connection error:', error.message);
//                 setIsConnected(false);
//             });

//             // Listen for reconnection
//             newSocket.on('reconnect', () => {
//                 console.log('Socket reconnected');
//                 setIsConnected(true);
//             });

//         } catch (error) {
//             console.error('Error in connectSocket:', error);
//             setIsConnected(false);
//         }
//     }, [getIdToken, user]); // Depend on firebaseUser to trigger reconnect on auth state change

//     const disconnectSocket = useCallback(() => {
//         if (socketRef.current) {
//             console.log("Disconnecting socket...");
//             socketRef.current.disconnect();
//             socketRef.current = null; // Clear the ref
//             setIsConnected(false);
//         }
//     }, []);

//     useEffect(() => {
//         // This useEffect manages the lifecycle of the socket connection
//         if (user) { // Connect only if a Firebase user is logged in
//             connectSocket();
//         } else { // Disconnect if no Firebase user
//             disconnectSocket();
//         }

//         // Cleanup function for when the component unmounts
//         return () => {
//             disconnectSocket();
//         };
//     }, [user, connectSocket, disconnectSocket]); // Re-run when firebaseUser or connect/disconnect callbacks change

//     const value = {
//         socket: socketRef.current, // Provide the current socket instance
//         isConnected,
//     };

//     return (
//         <SocketContext.Provider value={value}>
//             {children}
//         </SocketContext.Provider>
//     );
// };

// export default SocketProvider;

// export const useSocket = () => {
//     const context = useContext(SocketContext);
//     if (context === undefined) {
//         throw new Error('useSocket must be used within a SocketProvider');
//     }
//     return context;
// };












// 'use client';

// import React, {
//     createContext,
//     useContext,
//     useEffect,
//     useState,
//     useRef,
//     useCallback,
//     ReactNode
// } from 'react';
// // CORRECTED: Import 'io' as the default export and 'Socket' as a named type export
// import io, { Socket } from 'socket.io-client';
// import { useAuth } from './AuthProvider';

// const SOCKET_SERVER_URL =
//     process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') ||
//     'http://localhost:5001';

// interface SocketContextType {
//     socket: Socket | null;
//     isConnected: boolean;
//     onlineUsers: string[];
// }

// const SocketContext = createContext<SocketContextType | undefined>(undefined);

// interface SocketProviderProps {
//     children: ReactNode;
// }

// const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
//     const { getIdToken, user, mongoUser } = useAuth();
//     // CORRECTED: Use 'Socket' type here
//     const socketRef = useRef<Socket | null>(null);
//     const [isConnected, setIsConnected] = useState(false);
//     const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

//     const connectSocket = useCallback(async () => {
//         if (!user || !mongoUser) {
//             console.log('No Firebase user or mongoUser authenticated, skipping socket connection');
//             return;
//         }

//         if (socketRef.current && socketRef.current.connected) return;

//         try {
//             const token = await getIdToken();
//             if (!token) {
//                 console.warn('No authentication token available for socket connection.');
//                 socketRef.current?.disconnect();
//                 socketRef.current = null;
//                 setIsConnected(false);
//                 return;
//             }

//             console.log('Connecting to socket server:', SOCKET_SERVER_URL);

//             // Clean any existing socket
//             socketRef.current?.disconnect();

//             const socket = io(SOCKET_SERVER_URL, {
//                 auth: { token },
//                 transports: ['websocket', 'polling'],
//                 reconnectionAttempts: 5,
//                 reconnectionDelay: 1000,
//                 timeout: 10000,
//                 forceNew: true
//             });

//             socketRef.current = socket;

//             socket.on('connect', () => {
//                 console.log('Socket connected:', socket.id);
//                 setIsConnected(true);

//                 socket.emit('user-online', {
//                     userId: mongoUser._id, // ✅ send correct ID (should match backend)
//                     name: mongoUser.name,
//                     avatarUrl: mongoUser.avatarUrl
//                 });
//             });

//             socket.on('disconnect', (reason) => {
//                 console.log('Socket disconnected:', reason);
//                 setIsConnected(false);
//                 setOnlineUsers([]);
//             });

//             socket.on('connect_error', (error) => {
//                 console.error('Socket connection error:', error.message);
//                 setIsConnected(false);
//             });

//             socket.on('reconnect', () => {
//                 console.log('Socket reconnected');
//                 setIsConnected(true);
//                 socket.emit('user-online', {
//                     userId: mongoUser._id,
//                     name: mongoUser.name,
//                     avatarUrl: mongoUser.avatarUrl
//                 });
//             });

//             // 🔄 Update online users
//             socket.on('online_users', (users: string[]) => {
//                 console.log('Online users updated:', users);
//                 setOnlineUsers(users);
//             });

//             socket.on('user-status-change', (data: { userId: string; status: 'online' | 'offline' }) => {
//                 console.log('User status change:', data);
//                 setOnlineUsers((prev) =>
//                     data.status === 'online'
//                         ? prev.includes(data.userId)
//                             ? prev
//                             : [...prev, data.userId]
//                         : prev.filter((id) => id !== data.userId)
//                 );
//             });

//         } catch (error) {
//             console.error('Error in connectSocket:', error);
//             setIsConnected(false);
//         }
//     }, [getIdToken, user, mongoUser]);

//     const disconnectSocket = useCallback(() => {
//         if (socketRef.current) {
//             console.log('Disconnecting socket...');
//             if (mongoUser) {
//                 socketRef.current.emit('user-offline', {
//                     userId: mongoUser._id
//                 });
//             }

//             socketRef.current.disconnect();
//             socketRef.current = null;
//             setIsConnected(false);
//             setOnlineUsers([]);
//         }
//     }, [mongoUser]);

//     useEffect(() => {
//         if (user && mongoUser) {
//             connectSocket();
//         } else {
//             disconnectSocket();
//         }

//         return () => {
//             disconnectSocket();
//         };
//     }, [user, mongoUser, connectSocket, disconnectSocket]);

//     const value = {
//         socket: socketRef.current,
//         isConnected,
//         onlineUsers
//     };

//     return (
//         <SocketContext.Provider value={value}>
//             {children}
//         </SocketContext.Provider>
//     );
// };

// export default SocketProvider;

// export const useSocket = () => {
//     const context = useContext(SocketContext);
//     if (context === undefined) {
//         throw new Error('useSocket must be used within a SocketProvider');
//     }
//     return context;
// };



'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
    ReactNode
} from 'react';

// 'io' को डिफ़ॉल्ट निर्यात (मूल्य) के रूप में आयात करें
// और 'Socket' को विशेष रूप से एक प्रकार निर्यात के रूप में आयात करें।
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import { useAuth } from './AuthProvider';

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') ||
    'http://localhost:5001';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const { getIdToken, user, mongoUser } = useAuth();
    // 'Socket' यहाँ अब सही ढंग से आयातित प्रकार को संदर्भित करता है
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const connectSocket = useCallback(async () => {
        if (!user || !mongoUser) {
            console.log('कोई Firebase उपयोगकर्ता या mongoUser प्रमाणित नहीं, सॉकेट कनेक्शन छोड़ रहे हैं');
            return;
        }

        if (socketRef.current && socketRef.current.connected) return;

        try {
            const token = await getIdToken();
            if (!token) {
                console.warn('सॉकेट कनेक्शन के लिए कोई प्रमाणीकरण टोकन उपलब्ध नहीं है।');
                socketRef.current?.disconnect();
                socketRef.current = null;
                setIsConnected(false);
                return;
            }

            console.log('सॉकेट सर्वर से कनेक्ट हो रहा है:', SOCKET_SERVER_URL);

            // किसी भी मौजूदा सॉकेट को साफ करें
            socketRef.current?.disconnect();

            const socket = io(SOCKET_SERVER_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
                forceNew: true
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('सॉकेट कनेक्टेड:', socket.id);
                setIsConnected(true);

                socket.emit('user-online', {
                    userId: mongoUser._id,
                    name: mongoUser.name,
                    avatarUrl: mongoUser.avatarUrl
                });
            });

            socket.on('disconnect', (reason) => {
                console.log('सॉकेट डिस्कनेक्टेड:', reason);
                setIsConnected(false);
                setOnlineUsers([]);
            });

            socket.on('connect_error', (error) => {
                console.error('सॉकेट कनेक्शन त्रुटि:', error.message);
                setIsConnected(false);
            });

            socket.on('reconnect', () => {
                console.log('सॉकेट फिर से कनेक्टेड');
                setIsConnected(true);
                socket.emit('user-online', {
                    userId: mongoUser._id,
                    name: mongoUser.name,
                    avatarUrl: mongoUser.avatarUrl
                });
            });

            // ऑनलाइन उपयोगकर्ताओं को अपडेट करें
            socket.on('online_users', (users: string[]) => {
                console.log('ऑनलाइन उपयोगकर्ता अपडेटेड:', users);
                setOnlineUsers(users);
            });

            socket.on('user-status-change', (data: { userId: string; status: 'online' | 'offline' }) => {
                console.log('उपयोगकर्ता स्थिति परिवर्तन:', data);
                setOnlineUsers((prev) =>
                    data.status === 'online'
                        ? prev.includes(data.userId)
                            ? prev
                            : [...prev, data.userId]
                        : prev.filter((id) => id !== data.userId)
                );
            });

        } catch (error) {
            console.error('connectSocket में त्रुटि:', error);
            setIsConnected(false);
        }
    }, [getIdToken, user, mongoUser]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            console.log('सॉकेट डिस्कनेक्ट हो रहा है...');
            if (mongoUser) {
                socketRef.current.emit('user-offline', {
                    userId: mongoUser._id
                });
            }

            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            setOnlineUsers([]);
        }
    }, [mongoUser]);

    useEffect(() => {
        if (user && mongoUser) {
            connectSocket();
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [user, mongoUser, connectSocket, disconnectSocket]);

    const value = {
        socket: socketRef.current,
        isConnected,
        onlineUsers
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket का उपयोग SocketProvider के भीतर ही किया जाना चाहिए');
    }
    return context;
};