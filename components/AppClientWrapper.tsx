'use client';

import { useAuth } from './AuthProvider';
import { ReactNode, useEffect } from 'react';
import { CallProvider } from './CallManager';
import SocketProvider from './SocketProvider';
import { BeatLoader } from 'react-spinners';
import { useRouter, usePathname } from 'next/navigation';

export default function AppClientWrapper({ children }: { children: ReactNode }) {
  const { user, mongoUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define paths that should NOT trigger redirection to login or show full-screen auth loader
  // IMPORTANT: Make sure these paths exactly match your Next.js file structure.
  // Now includes '/auth/login' and '/auth/signup'
  const publicPaths = ['/auth/login', '/auth/register', '/forgot-password', '/reset-password', '/'];
  const isPublicPath = publicPaths.includes(pathname);

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log("AppClientWrapper State:");
    console.log("  Current pathname:", pathname);
    console.log("  Is current path public (isPublicPath):", isPublicPath);
    console.log("  Auth loading (authLoading):", authLoading);
    console.log("  Firebase user:", user ? 'present' : 'null');
    console.log("  Mongo user:", mongoUser ? 'present' : 'null');
  }, [pathname, isPublicPath, authLoading, user, mongoUser]);
  // --- END DEBUGGING LOGS ---

  // Effect hook to handle redirection if the user is not authenticated and on a protected route
  useEffect(() => {
    // If auth is NOT loading, and there's NO user (Firebase/Auth0) and NO mongoUser,
    // AND we are NOT currently on a public path.
    if (!authLoading && !user && !mongoUser && !isPublicPath) {
      console.log("AppClientWrapper: Not authenticated on protected route. Redirecting to /auth/login."); // <--- लॉग भी अपडेट किया
      router.push('/auth/login'); // <--- रीडायरेक्ट पाथ भी अपडेट किया
    }
  }, [authLoading, user, mongoUser, isPublicPath, router]);


  // --- CORE RENDERING LOGIC ---

  // 1. If we are on a public path, always render children immediately.
  //    This is crucial to prevent the loader from blocking public pages.
  if (isPublicPath) {
    console.log("AppClientWrapper: On public path. Rendering children directly.");
    return <>{children}</>;
  }

  // 2. If not on a public path, and authentication is still loading, show the loader.
  if (authLoading) {
    console.log("AppClientWrapper: Auth loading on protected path. Showing loader.");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BeatLoader color="#3498db" size={15} />
      </div>
    );
  }

  // 3. If authLoading is false, but user or mongoUser is still null (on a protected path),
  //    this means authentication failed or profile fetch failed.
  //    At this point, the useEffect above should have triggered a redirect.
  //    We can show a loader here as a fallback until the redirect fully processes.
  if (!mongoUser || !user) {
    console.log("AppClientWrapper: Auth finished, but user/mongoUser missing on protected path. Showing loader (awaiting redirect).");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BeatLoader color="#3498db" size={15} />
      </div>
    );
  }

  // 4. If we reach here, it means:
  //    - Not a public path (`!isPublicPath`)
  //    - Auth is finished (`!authLoading`)
  //    - `user` is present
  //    - `mongoUser` is present
  //    So, the user is authenticated and their profile is loaded. Render the main app.
  console.log("AppClientWrapper: User authenticated and profile loaded. Rendering main app components.");
  return (
    <SocketProvider>
      {/* CallProvider requires mongoUser._id, so ensure mongoUser is not null */}
      <CallProvider currentUserId={mongoUser._id} currentUserName={mongoUser.name}>
        {children}
      </CallProvider>
    </SocketProvider>
  );
}