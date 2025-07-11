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
//   Instagram,
//   Github,
//   Linkedin,
// } from 'lucide-react';

// import Particles from '../Particles';

// export default function HomePage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-black">
//         <BounceLoader color="#fff" size={60} />
//       </div>
//     );
//   }

//   return (
//     <main className="relative min-h-screen w-full overflow-hidden">
//       <Particles
//         particleCount={300}
//         particleColors={['#ffffff']}
//         particleBaseSize={140}
//         alphaParticles={true}
//         cameraDistance={25}
//         speed={0.3}
//         moveParticlesOnHover={true}
//         particleHoverFactor={2}
//         className="z-[-1]"
//       />
//       <div className="relative z-10 flex justify-center items-center min-h-screen px-4 py-10">
//         <motion.div
//           className="bg-white/10 backdrop-blur-sm border border-white/30 text-white shadow-2xl p-10 max-w-md w-full text-center"
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <h1 className="text-3xl font-bold mb-6">
//             {user ? `Welcome, ${user.email}!` : 'Welcome to Vartalaap'}
//           </h1>

//           {user ? (
//             <div className="space-y-4 flex gap-2">
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="w-full m-0 flex items-center gap-1 cursor-pointer justify-center bg-blue-600 hover:bg-blue-700 transition text-white p-2 "
//               >
//                 <ArrowRightCircle size={18} /> Go to Dashboard
//               </button>

//               <button
//                 onClick={async () => {
//                   const { signOut } = await import('firebase/auth');
//                   const { auth } = await import('../../firebase/config');
//                   await signOut(auth);
//                 }}
//                 className="w-full flex items-center justify-center cursor-pointer gap-2 bg-red-600 hover:bg-red-700 transition text-white p-2"
//               >
//                 <LogOut size={18} /> Logout
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4 flex gap-2">
//               <button
//                 onClick={() => router.push('/auth/login')}
//                 className="w-full flex items-center m-0 justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-white p-2"
//               >
//                 <LogIn size={18} /> Login
//               </button>

//               <button
//                 onClick={() => router.push('/auth/register')}
//                 className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition text-white "
//               >
//                 <UserPlus size={18} /> Register
//               </button>
//             </div>
//           )}
//         </motion.div>
//         <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-8 pointer-events-none">
//           <div className="absolute left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm px-2 mb-10 md:mb-0 py-2 md:px-6 shadow-lg pointer-events-auto">
//             Made by ❤️{' '}
//             <a
//               href="https://kunalportfolio45.netlify.app"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="hover:text-blue-400 hover:underline"
//             >
//               Kunal Sharma
//             </a>
//           </div>
//           <div
//             className="
//       flex flex-col fixed bottom-4 right-4 gap-4 pointer-events-auto
//       bg-white/10 p-2 backdrop-blur-sm border border-white/20 -md
//       md:flex-row md:static md:ml-auto md:bg-transparent md:p-0 md:border-0 md:-none"
//           >
//             <a
//               href="https://www.instagram.com/kunal_sharma_45_/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="bg-white/10 text-white/60 p-2 hover:bg-white/20 transition backdrop-blur-sm border border-white/20 hover:text-pink-400"
//             >
//               <Instagram size={18} />
//             </a>
//             <a
//               href="https://github.com/kunalcoder45"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="bg-white/10 text-white/60 p-2 hover:bg-white/20 transition backdrop-blur-sm border border-white/20 hover:text-green-500"
//             >
//               <Github size={18} />
//             </a>
//             <a
//               href="https://www.linkedin.com/in/kunal-sharma-cse-student"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="bg-white/10 text-white/60 p-2 hover:bg-white/20 transition backdrop-blur-sm border border-white/20 hover:text-blue-400"
//             >
//               <Linkedin size={18} />
//             </a>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }
















"use client"
import { useAuth } from "../AuthProvider"
import { useRouter } from "next/navigation"
import { BounceLoader } from "react-spinners"
import { motion } from "framer-motion"
import {
  LogIn,
  LogOut,
  UserPlus,
  ArrowRightCircle,
  Instagram,
  Github,
  Linkedin,
  MessageCircle,
  Users,
  Camera,
  Heart,
  Share2,
  Zap,
  Shield,
  Smartphone,
} from "lucide-react"
import Particles from "../Particles"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <BounceLoader color="#fff" size={60} />
      </div>
    )
  }

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Real-time Chat",
      description: "Connect instantly with friends through seamless messaging",
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Reels & Posts",
      description: "Share your moments with stunning photos and engaging reels",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Follow & Connect",
      description: "Build your network and stay connected with people you care about",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Engage & React",
      description: "Like, comment, and interact with content that matters to you",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Easy Sharing",
      description: "Share your favorite content across the platform effortlessly",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security",
    },
  ]

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <Particles
        particleCount={300}
        particleColors={["#ffffff", "#3b82f6", "#8b5cf6"]}
        particleBaseSize={140}
        alphaParticles={true}
        cameraDistance={25}
        speed={0.3}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        className="z-[-1]"
      />

      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center min-h-screen px-4 py-20">
          <motion.div
            className="text-center max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Vartalaap<span className="text-yellow-500">.</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/80 mb-4 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Where Conversations Come Alive
            </motion.p>

            <motion.div
              className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Experience the next generation of social media. Connect, share, and engage with your community through
              seamless conversations, stunning visuals, and meaningful interactions.
              <div className="text-3xl mt-3 text-white font-bold">
                {user ? `Welcome, ${user.email}!` : 'Welcome to Vartalaap'}
              </div>
            </motion.div>

            {/* Auth Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                  >
                    <ArrowRightCircle size={20} />
                    Go to Dashboard
                    <div className="absolute cursor-pointer inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={async () => {
                      const { signOut } = await import('firebase/auth');
                      const { auth } = await import('../../firebase/config');
                      await signOut(auth);
                    }}
                    className="cursor-pointer group relative px-16 md:px-8 py-4 bg-red-500/80 backdrop-blur-md border border-white/20 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 hover:bg-red-500"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="group relative px-12 md:px-8 cursor-pointer py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                  >
                    <LogIn size={20} />
                    Login
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => router.push("/auth/register")}
                    className="group relative px-8 py-4 bg-white/10 cursor-pointer backdrop-blur-md border border-white/20 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 hover:bg-blue-500/20"
                  >
                    <UserPlus size={20} />
                    Get Started
                  </button>
                </div>
              )}
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 -2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-white/60">Active Users</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 -2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">1M+</div>
                <div className="text-white/60">Messages Sent</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 -2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-white/60">Posts Shared</div>
              </div>
            </motion.div> */}
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Powerful Features</h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Everything you need to connect, share, and engage with your community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 p-8 text-center hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-blue-400 mb-4 flex justify-center group-hover:text-purple-400 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 p-12">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Conversations?</h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already experiencing the future of social media
              </p>
              {!user && (
                <button
                  onClick={() => router.push("/auth/register")}
                  className="group cursor-pointer relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto"
                >
                  <Smartphone size={24} />
                  Join Vartalaap Today
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative py-8 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 text-white text-sm px-6 py-3">
              Made with ❤️ by{" "}
              <a
                href="https://kunalportfolio45.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 hover:underline transition-colors duration-300"
              >
                Kunal Sharma
              </a>
            </div>

            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/kunal_sharma_45_/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 backdrop-blur-md text-white/60 p-3 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:text-pink-400 transform hover:scale-110"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://github.com/kunalcoder45"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 backdrop-blur-md text-white/60 p-3 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:text-green-400 transform hover:scale-110"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/kunal-sharma-cse-student"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 backdrop-blur-md text-white/60 p-3 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:text-blue-400 transform hover:scale-110"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
