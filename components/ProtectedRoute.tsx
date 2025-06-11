'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';
import { BounceLoader } from 'react-spinners';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Loading state dikhayiye
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><BounceLoader color="#f9b500" size={40} /></div>;
  }

  // User nahi hai to null return karo
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
