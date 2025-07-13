'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config'; // 🔁 adjust the path as per your project
import toast from 'react-hot-toast';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <form
                onSubmit={handleReset}
                className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full space-y-6"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-violet-600 text-white rounded-md font-semibold hover:bg-violet-700 transition disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <p className="text-sm text-center text-gray-600">
                    Go back to <a href="/auth/login" className="text-violet-600 underline">Login</a>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
