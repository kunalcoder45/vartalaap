'use client';

import { useState } from 'react';
import { auth } from '../firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function PhoneSignIn() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [message, setMessage] = useState('');

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible', // or 'normal' to show the reCAPTCHA box
      callback: () => {},
    });
  };

  const handleSendOTP = async () => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmation(result);
      setMessage('OTP sent successfully.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setMessage(error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
      setMessage('Phone authentication successful!');
    } catch (error) {
      console.error('OTP verification failed:', error);
      setMessage('Invalid OTP.');
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Phone Sign-In</h2>
      <input
        type="text"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <div id="recaptcha-container" className="mb-2"></div>

      {confirmation ? (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <button
            onClick={handleVerifyOTP}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Verify OTP
          </button>
        </>
      ) : (
        <button
          onClick={handleSendOTP}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Send OTP
        </button>
      )}

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
