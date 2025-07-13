'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import Particles from '../../../components/Particles';
import { motion } from 'framer-motion';

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

      // wait briefly for AuthProvider to sync
      await new Promise((resolve) => setTimeout(resolve, 500));
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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <Particles
        particleCount={300}
        particleColors={['#ffffff', '#3b82f6', '#8b5cf6']}
        particleBaseSize={140}
        alphaParticles={true}
        cameraDistance={25}
        speed={0.3}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        className="absolute inset-0 z-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8 md:p-10 w-full max-w-md text-white"
      >
        <div className="flex justify-center mb-6">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-full bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${error ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-full bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${error ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-all cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
        {/* <p className='text-blue-400 text-center'>
          <Link href='/auth/forgetPassword'>
            Forget Password
          </Link>
        </p> */}
        <div className="flex justify-center mt-6">
          <GoogleSignInButton />
        </div>
      </motion.div>
    </div>
  );
}
