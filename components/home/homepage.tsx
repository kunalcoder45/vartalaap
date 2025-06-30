// // components/homepage.tsx
// 'use client'; // Still needed because of useAuth, useRouter, and state management

// import { useAuth } from '../AuthProvider'; // Ensure this path is correct
// import { useRouter } from 'next/navigation';
// import { BounceLoader } from 'react-spinners'; // Still needed for the loading spinner

// // No GSAP, ScrollTrigger, SplitText, useRef, useEffect, or useState imports related to animation here.

// export default function HomePage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   // Display a loading spinner while authentication status is being determined
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <BounceLoader color="#f9b500" size={40} />
//       </div>
//     );
//   }

//   return (
//     <main className="p-6">
//       {user ? (
//         // --- User is logged in ---
//         <div>
//           <h1 className="text-3xl font-bold mb-4">Welcome, {user.email}!</h1>
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
//           >
//             Go to Dashboard
//           </button>
//           <button
//             onClick={async () => {
//               // Dynamically import firebase auth methods
//               const { signOut } = await import('firebase/auth');
//               const { auth } = await import('../../firebase/config'); // Ensure this path is correct
//               await signOut(auth);
//             }}
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//           >
//             Logout
//           </button>
//         </div>
//       ) : (
//         // --- User is NOT logged in ---
//         <div>
//           <h1 className="text-3xl font-bold mb-4 text-center">Welcome to Vartalaap</h1>
//           <button
//             onClick={() => router.push('/auth/login')}
//             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
//           >
//             Login
//           </button>
//           <button
//             onClick={() => router.push('/auth/register')}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Register
//           </button>
//         </div>
//       )}
//     </main>
//   );
// }


// 1st animated

// 'use client';

// import { useAuth } from '../AuthProvider';
// import { useRouter } from 'next/navigation';
// import { BounceLoader } from 'react-spinners';
// import { motion } from 'framer-motion'; // Import motion from framer-motion
// import dynamic from 'next/dynamic'; // For dynamic import of 3D canvas
// import { useEffect, useRef } from 'react'; // For GSAP integration
// import gsap from 'gsap';
// import { TextPlugin } from 'gsap/TextPlugin'; // If you need text typing effects
// import { ScrollTrigger } from 'gsap/ScrollTrigger'; // If you want scroll animations
// // If you plan to animate text character by character
// // import Splitting from 'splitting';
// // import 'splitting/dist/splitting.css';
// // import 'splitting/dist/splitting-cells.css';

// gsap.registerPlugin(TextPlugin, ScrollTrigger); // Register GSAP plugins

// // Dynamically import the 3D Canvas component
// // We use ssr: false because Three.js/Canvas needs client-side environment
// const DynamicHeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

// export default function HomePage() {
//     const { user, loading } = useAuth();
//     const router = useRouter();
//     const welcomeRef = useRef(null);
//     const ctaButtonRef = useRef(null);

//     // GSAP animation for the welcome text and buttons when NOT logged in
//     useEffect(() => {
//         if (!user && !loading) {
//             gsap.fromTo(
//                 welcomeRef.current,
//                 { opacity: 0, y: 50 },
//                 { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 }
//             );
//             gsap.fromTo(
//                 ctaButtonRef.current,
//                 { opacity: 0, y: 50 },
//                 { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8, stagger: 0.2 }
//             );
//         }
//     }, [user, loading]);

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gray-900">
//                 <BounceLoader color="#f9b500" size={40} />
//             </div>
//         );
//     }

//     return (
//         <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
//             {user ? (
//                 // --- User is logged in (Dashboard placeholder) ---
//                 <motion.div
//                     initial={{ opacity: 0, y: 50 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5 }}
//                     className="text-center p-6 bg-white rounded-lg shadow-xl z-10 max-w-md w-full"
//                 >
//                     <h1 className="text-4xl font-extrabold mb-6 text-blue-600">Welcome, {user.email}!</h1>
//                     <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => router.push('/dashboard')}
//                         className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out text-lg font-semibold mb-4"
//                     >
//                         Go to Dashboard
//                     </motion.button>
//                     <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={async () => {
//                             const { signOut } = await import('firebase/auth');
//                             const { auth } = await import('../../firebase/config');
//                             await signOut(auth);
//                         }}
//                         className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out text-lg font-semibold"
//                     >
//                         Logout
//                     </motion.button>
//                 </motion.div>
//             ) : (
//                 // --- User is NOT logged in (Modern Landing Page) ---
//                 <>
//                     {/* 3D Background Canvas */}
//                     <div className="absolute inset-0 z-0">
//                         <DynamicHeroCanvas />
//                     </div>

//                     {/* Content Overlay */}
//                     <div className="relative z-10 text-center text-white p-6 md:p-10 bg-black bg-opacity-40 rounded-xl shadow-2xl max-w-3xl mx-auto backdrop-blur-md border border-gray-700">
//                         <h1 ref={welcomeRef} className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
//                             <span className="text-blue-400">Vartalaap</span>: Connect, Share, Discover.
//                         </h1>
//                         <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-200">
//                             Join a vibrant community where ideas flow and connections grow.
//                             Share your moments, engage in conversations, and discover new perspectives.
//                         </p>
//                         <div ref={ctaButtonRef} className="flex flex-col md:flex-row justify-center gap-4">
//                             <motion.button
//                                 whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0, 200, 255, 0.4)" }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={() => router.push('/auth/register')}
//                                 className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out text-xl font-semibold transform hover:-translate-y-1"
//                             >
//                                 Get Started
//                             </motion.button>
//                             <motion.button
//                                 whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(100, 100, 255, 0.4)" }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={() => router.push('/auth/login')}
//                                 className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out text-xl font-semibold transform hover:-translate-y-1"
//                             >
//                                 Login
//                             </motion.button>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </main>
//     );
// }






// 2nd animated
// components/HomePage.tsx
// 'use client';

// import { useAuth } from '../AuthProvider';
// import { useRouter } from 'next/navigation';
// import { BounceLoader } from 'react-spinners';
// import { motion } from 'framer-motion';
// import {
//   LogIn,
//   LogOut,
//   UserPlus,
//   ArrowRightCircle,
// } from 'lucide-react'; // Lucide icons

// export default function HomePage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-blue-300">
//         <BounceLoader color="#3B82F6" size={60} />
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-10">
//       <motion.div
//         className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center"
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: 'easeOut' }}
//       >
//         <motion.h1
//           className="text-3xl font-extrabold text-blue-600 mb-6"
//           initial={{ scale: 0.8 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.2, duration: 0.5 }}
//         >
//           {user ? `Welcome, ${user.email}!` : 'Welcome to Vartalaap'}
//         </motion.h1>

//         {user ? (
//           <div className="space-y-4">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700"
//               onClick={() => router.push('/dashboard')}
//             >
//               <ArrowRightCircle size={18} /> Go to Dashboard
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl shadow hover:bg-red-600"
//               onClick={async () => {
//                 const { signOut } = await import('firebase/auth');
//                 const { auth } = await import('../../firebase/config');
//                 await signOut(auth);
//               }}
//             >
//               <LogOut size={18} /> Logout
//             </motion.button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-xl shadow hover:bg-green-600"
//               onClick={() => router.push('/auth/login')}
//             >
//               <LogIn size={18} /> Login
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-xl shadow hover:bg-blue-600"
//               onClick={() => router.push('/auth/register')}
//             >
//               <UserPlus size={18} /> Register
//             </motion.button>
//           </div>
//         )}
//       </motion.div>
//     </main>
//   );
// }






///      BOXY BACKGROUND          /////////////
// 'use client';

// import { useAuth } from '../AuthProvider';
// import { useRouter } from 'next/navigation';
// import { BounceLoader } from 'react-spinners';
// import { motion } from 'framer-motion';
// import {
//   LogIn,
//   LogOut,
//   UserPlus,
//   ArrowRightCircle,
// } from 'lucide-react';

// import BoxyBackground from '../BoxyBackground';

// export default function HomePage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <BounceLoader color="#fff" size={60} />
//       </div>
//     );
//   }

//   return (
//     <main className="relative min-h-screen w-full overflow-hidden">
//       <BoxyBackground />

//       {/* Foreground Content */}
//       <div className="relative z-10 flex justify-center items-center min-h-screen px-4 py-10">
//         <motion.div
//           className="bg-white/10 backdrop-blur-xl border border-white/30 text-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center"
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <h1 className="text-3xl font-bold mb-6">
//             {user ? `Welcome, ${user.email}!` : 'Welcome to Vartalaap'}
//           </h1>

//           {user ? (
//             <div className="space-y-4">
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-4 rounded-xl"
//               >
//                 <ArrowRightCircle size={18} /> Go to Dashboard
//               </button>

//               <button
//                 onClick={async () => {
//                   const { signOut } = await import('firebase/auth');
//                   const { auth } = await import('../../firebase/config');
//                   await signOut(auth);
//                 }}
//                 className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition text-white py-2 px-4 rounded-xl"
//               >
//                 <LogOut size={18} /> Logout
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <button
//                 onClick={() => router.push('/auth/login')}
//                 className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-white py-2 px-4 rounded-xl"
//               >
//                 <LogIn size={18} /> Login
//               </button>

//               <button
//                 onClick={() => router.push('/auth/register')}
//                 className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition text-white py-2 px-4 rounded-xl"
//               >
//                 <UserPlus size={18} /> Register
//               </button>
//             </div>
//           )}
//         </motion.div>
//       </div>
//     </main>
//   );
// }






////        particles       ////



'use client';

import { useAuth } from '../AuthProvider';
import { useRouter } from 'next/navigation';
import { BounceLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import {
  LogIn,
  LogOut,
  UserPlus,
  ArrowRightCircle,
  Instagram,
  Github,
  Linkedin,
} from 'lucide-react';

import Particles from '../Particles'; // ⬅️ Import Particles component

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <BounceLoader color="#fff" size={60} />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* 🟡 Animated Particles Background */}
      <Particles
        particleCount={300}
        particleColors={['#ffffff']}
        particleBaseSize={140}
        alphaParticles={true}
        cameraDistance={25}
        speed={0.3}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        className="z-[-1]"
      />

      {/* 🔵 Foreground Content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen px-4 py-10">
        <motion.div
          className="bg-white/10 backdrop-blur-sm border border-white/30 text-white shadow-2xl p-10 max-w-md w-full text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">
            {user ? `Welcome, ${user.email}!` : 'Welcome to Vartalaap'}
          </h1>

          {user ? (
            <div className="space-y-4 flex gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full m-0 flex items-center gap-1 cursor-pointer justify-center bg-blue-600 hover:bg-blue-700 transition text-white p-2 "
              >
                <ArrowRightCircle size={18} /> Go to Dashboard
              </button>

              <button
                onClick={async () => {
                  const { signOut } = await import('firebase/auth');
                  const { auth } = await import('../../firebase/config');
                  await signOut(auth);
                }}
                className="w-full flex items-center justify-center cursor-pointer gap-2 bg-red-600 hover:bg-red-700 transition text-white p-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex gap-2">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center m-0 justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-white p-2"
              >
                <LogIn size={18} /> Login
              </button>

              <button
                onClick={() => router.push('/auth/register')}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition text-white "
              >
                <UserPlus size={18} /> Register
              </button>
            </div>
          )}
        </motion.div>
        {/* 🟣 Bottom Dock with Creator and Social Icons */}
        <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-8 pointer-events-none">
          {/* Center Text */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-2 mb-10 md:mb-0 py-2 md:px-6 shadow-lg pointer-events-auto">
            Made by ❤️{' '}
            <a
              href="https://kunalportfolio45.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 hover:underline"
            >
              Kunal Sharma
            </a>
          </div>

          {/* Right Social Icons */}
          <div
            className="
      flex flex-col fixed bottom-4 right-4 gap-4 pointer-events-auto
      bg-white/10 p-2 backdrop-blur-sm border border-white/20 rounded-md
      md:flex-row md:static md:ml-auto md:bg-transparent md:p-0 md:border-0 md:rounded-none"
          >
            <a
              href="https://www.instagram.com/kunal_sharma_45_/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 text-white/60 p-2 hover:bg-white/20 transition backdrop-blur-sm border border-white/20 hover:text-pink-400"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://github.com/kunalcoder45"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 text-white/60 p-2 hover:bg-white/20 transition backdrop-blur-sm border border-white/20 hover:text-green-500"
            >
              <Github size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/kunal-sharma-cse-student"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 text-white/60 p-2 hover:bg-white/20 transition backdrop-blur-sm border border-white/20 hover:text-blue-400"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
