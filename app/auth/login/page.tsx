'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WelcomeImg from '../../assets/welcome.png';
import GoogleSignInButton from '../../../components/GoogleSignInButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 border rounded shadow bg-white">
        {/* Welcome Image centered and larger */}
        <div className="flex justify-center mb-6"> {/* Centering container */}
          <img
            src={WelcomeImg.src}
            alt="Welcome"
            className="w-full h-32  object-contain" // Adjust w- and h- values as needed for size
          />
        </div>
        {/* <h1 className="text-2xl font-bold mb-4 text-center">Welcome Back User</h1> */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={`w-full mt-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-4 focus:ring-green-400/40 focus:ring-offset-2 shadow-sm transition-all duration-200 border-gray-300 ${error ? 'border-red-500' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={`w-full mt-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-4 focus:ring-green-400/40 focus:ring-offset-2 shadow-sm transition-all duration-200 border-gray-300 ${error ? 'border-red-500' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-full hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>

        <div className="mt-4 flex justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}