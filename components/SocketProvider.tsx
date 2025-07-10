'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
// Remove this line: import type { Socket } from 'socket.io-client';
import type { ReactNode } from 'react';

// Infer the Socket type directly from the 'io' function
type SocketContextType = {
  socket: ReturnType<typeof io> | null; // Corrected type
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
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null); // Corrected type

  useEffect(() => {
    const newSocket: ReturnType<typeof io> = io(process.env.NEXT_PUBLIC_BACKEND_URL!, { // Corrected type
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