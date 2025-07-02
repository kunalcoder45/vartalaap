'use client';

import Particles from '@/components/Particles';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
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
        className="z-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8 md:p-10 w-full max-w-md text-white text-center"
      >
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Page Not Found</p>

        <Link
          href="/dashboard"
          className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 transition-all"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
