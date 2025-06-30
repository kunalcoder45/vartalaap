// 'use client';
// import { useState } from 'react';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../../firebase/config';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import GoogleImg from '../../assets/google.webp';
// import GoogleSignInButton from '../../../components/GoogleSignInButton';

// export default function Register() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState<string | null>(null); // Use string | null for consistency
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null); // Clear previous errors

//     if (password !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     if (password.length < 6) {
//       setError('Password should be at least 6 characters.');
//       return;
//     }

//     setLoading(true);

//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       router.push('/auth/login');
//     } catch (err: any) {
//       // More user-friendly error messages for common Firebase auth errors
//       if (err.code === 'auth/email-already-in-use') {
//         setError('This email is already registered. Please log in or use a different email.');
//       } else if (err.code === 'auth/invalid-email') {
//         setError('The email address is not valid.');
//       } else if (err.code === 'auth/weak-password') {
//         setError('The password is too weak. Please choose a stronger password.');
//       } else {
//         setError(err.message); // Fallback for other Firebase errors
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="max-w-md w-full p-6 border rounded shadow bg-white">
//         <h1 className="text-2xl font-bold mb-4 text-center">Create Your Account</h1>
//         <form onSubmit={handleRegister} className="flex flex-col gap-4">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className={`w-full mt-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-4 focus:ring-green-400/40 focus:ring-offset-2 shadow-sm transition-all duration-200 border-gray-300 ${error ? 'border-red-500' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             disabled={loading}
//           />
//           <input
//             type="password"
//             placeholder="Password (min 6 characters)"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             className={`w-full mt-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-4 focus:ring-green-400/40 focus:ring-offset-2 shadow-sm transition-all duration-200 border-gray-300 ${error ? 'border-red-500' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             disabled={loading}
//           />
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             className={`w-full mt-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-4 focus:ring-green-400/40 focus:ring-offset-2 shadow-sm transition-all duration-200 border-gray-300 ${error ? 'border-red-500' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             disabled={loading}
//           />
//           {error && <p className="text-red-600 text-sm">{error}</p>}
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-green-600 text-white py-2 rounded-full hover:bg-green-700 disabled:bg-gray-400" // Changed to green-600 for consistency with Login
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//         </form>

//         <p className="mt-4 text-center">
//           Already have an account?{' '}
//           <Link href="/auth/login" className="text-blue-600 hover:underline">
//             Login here
//           </Link>
//         </p>
//         <div className="mt-4 flex justify-center">
//           <GoogleSignInButton />
//         </div>
//       </div>
//     </div>
//   );
// }









/// 


'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Particles from '../../../components/Particles';
import GoogleSignInButton from '../../../components/GoogleSignInButton';
import { motion } from 'framer-motion';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/auth/login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in or use a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
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
        particleColors={['#ffffff']}
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
        className="z-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8 md:p-10 w-full max-w-md rounded-xl text-white"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-full bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-full bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className={`w-full px-4 py-2 border rounded-full bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-all cursor-pointer"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>

        <div className="flex justify-center mt-6">
          <GoogleSignInButton />
        </div>
      </motion.div>
    </div>
  );
}
