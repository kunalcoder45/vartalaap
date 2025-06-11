// 'use client';

// import { auth, googleProvider } from "../firebase/config";
// import { signInWithPopup } from "firebase/auth";
// import GoogleImg from '../app/assets/google.webp'

// export default function GoogleSignInButton() {
//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       // Signed in user info
//       const user = result.user;
//       console.log("User Info:", user);
//       // You can now store user info in context or local storage or send to backend
//     } catch (error) {
//       console.error("Google Sign-In Error:", error);
//     }
//   };

//   return (
//     <button
//       onClick={handleGoogleSignIn}
//       className="flex items-center justify-center border border-gray-300 rounded-full cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//     >
//       <img src={GoogleImg.src} alt="Google" className="h-5 w-5" />
//     </button>
//   );
// }
'use client';

import { auth, googleProvider } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import GoogleImg from '../app/assets/google.webp';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GoogleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("User Info:", user);
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex items-center justify-center border border-gray-300 rounded-full cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <img src={GoogleImg.src} alt="Google" className="h-5 w-5" />
    </button>
  );
}