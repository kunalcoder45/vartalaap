'use client';

import { useAuth } from './AuthProvider';
import { ReactNode } from 'react';
import { CallProvider } from './CallManager';
import SocketProvider from './SocketProvider';
import { BeatLoader } from 'react-spinners';

export default function AppClientWrapper({ children }: { children: ReactNode }) {
  const { mongoUser } = useAuth();

  if (!mongoUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BeatLoader color="#3498db" size={15} />
      </div>
    );
  }

  return (
    <SocketProvider>
      <CallProvider currentUserId={mongoUser._id} currentUserName={mongoUser.name}>
        {children}
      </CallProvider>
    </SocketProvider>
  );
}
