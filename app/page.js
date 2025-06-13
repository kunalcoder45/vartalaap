'use client';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { BounceLoader } from 'react-spinners';


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><BounceLoader color="#f9b500" size={40} /></div>;
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to Vartalaap</h1>

      {user ? (
        <div>
          <p className="mb-4">Welcome, {user.email}!</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Go to Dashboard
          </button>
          <button
            onClick={async () => {
              const { signOut } = await import('firebase/auth');
              const { auth } = await import('../firebase/config');
              await signOut(auth);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
          >
            Login
          </button>
          <button
            onClick={() => router.push('/auth/register')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </div>
      )}
    </main>
  );
}