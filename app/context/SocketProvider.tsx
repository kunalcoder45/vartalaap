// client/app/context/SocketProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import io from 'socket.io-client'; // Default import for the io function

import { useAuth } from '../../components/AuthProvider'; // Verify this path is correct
import toast from 'react-hot-toast';

// Define the type for the socket instance by inferring it from the io() function's return type
// This is typically the most reliable way to get the Socket instance type.
type SocketInstance = ReturnType<typeof io>;

interface SocketContextType {
  socket: SocketInstance | null; // Use the derived type
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { getIdToken, user, loading: authLoading } = useAuth();
  const [socket, setSocket] = useState<SocketInstance | null>(null); // Use the derived type
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(async () => {
    if (!user || authLoading) {
      console.log("SocketProvider: Skipping connection - user not available or auth loading.");
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) {
        console.warn("SocketProvider: No ID token found, cannot connect to socket.");
        setSocket(null);
        setIsConnected(false);
        return;
      }

      // 'io' itself returns an instance of the Socket class
      const newSocket: SocketInstance = io(SOCKET_SERVER_URL, { // Use the derived type
        query: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('SocketProvider: Socket connected:', newSocket.id);
        toast.success('Real-time connection established!');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('SocketProvider: Socket disconnected:', reason);
        toast.error('Real-time connection lost!');
        setIsConnected(false);
        setSocket(null);
      });

      newSocket.on('connect_error', (error) => {
        console.error('SocketProvider: Socket connection error:', error.message);
        toast.error(`Socket connection error: ${error.message}`);
        setIsConnected(false);
        setSocket(null);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("SocketProvider: Error establishing socket connection:", error);
      toast.error("Failed to establish real-time connection.");
      setSocket(null);
      setIsConnected(false);
    }
  }, [user, getIdToken, authLoading]);

  useEffect(() => {
    // Connect socket when user is available and not already connected
    if (user && !socket && !authLoading) {
      connectSocket();
    }

    // Disconnect socket when user logs out or auth is loading
    if (!user && socket) {
        console.log('SocketProvider: Disconnecting socket due to user logout.');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
    }

    return () => {
      // Cleanup on component unmount or when dependencies change such that connection should terminate
      if (socket) {
        console.log('SocketProvider: Cleaning up socket on unmount or dependency change.');
        socket.disconnect();
      }
    };
  }, [user, socket, authLoading, connectSocket]);

  const contextValue = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};