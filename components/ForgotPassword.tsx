'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config'; // 🔁 adjust the path as per your project
import toast, { Toaster } from 'react-hot-toast';
import Particles from './Particles';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted"); // ✅ Check if this logs

        setLoading(true);

        try {
            console.log("Trying to send reset email..."); // ✅ Check if this logs
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
            setEmail('');
        } catch (error: any) {
            console.error("ERROR:", error); // ✅ force console log
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden" >
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
                <form
                    onSubmit={handleReset}
                    className="bg-transparent shadow-lg rounded-lg p-8 max-w-sm w-full space-y-6"
                >
                    <h2 className="text-2xl font-bold text-center text-white">Forgot Password</h2>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 border"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-violet-600 text-white rounded-full cursor-pointer font-semibold hover:bg-violet-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <p className="text-sm text-center text-white">
                        Go back to <a href="/auth/login" className="text-blue-400 underline">Login</a>
                    </p>
                </form>
            </motion.div>
            <Toaster />
        </div>
    );
};

export default ForgotPassword;
