'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';

// Fix: Remove /api from socket URL - sockets connect directly to server, not API routes
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:5001';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { getIdToken, user } = useAuth(); // Also get user to check auth state
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectSocket = useCallback(async () => {
        // Don't connect if no user is authenticated
        if (!user) {
            console.log("No user authenticated, skipping socket connection");
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            return; // Already connected
        }

        try {
            const token = await getIdToken();
            if (!token) {
                console.warn("No authentication token available for socket connection.");
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
                setIsConnected(false);
                return;
            }

            console.log("Connecting to socket server:", SOCKET_SERVER_URL);

            // Disconnect existing socket if any
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Create new socket connection
            socketRef.current = io(SOCKET_SERVER_URL, {
                auth: { token },
                transports: ['websocket', 'polling'], // Allow both transports
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
                setIsConnected(true);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                setIsConnected(false);
            });

            // Listen for reconnection
            socketRef.current.on('reconnect', () => {
                console.log('Socket reconnected');
                setIsConnected(true);
            });

        } catch (error) {
            console.error('Error in connectSocket:', error);
            setIsConnected(false);
        }
    }, [getIdToken, user]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            console.log("Disconnecting socket...");
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            connectSocket();
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [user, connectSocket, disconnectSocket]);

    const value = {
        socket: socketRef.current,
        isConnected,
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
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};