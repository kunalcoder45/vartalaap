'use client'; // This directive is important for client-side components in Next.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Main ComingSoon component for the Coming Soon page
const ComingSoon = () => {
  // Initialize useRouter hook for programmatic navigation
  const router = useRouter();

  // State to hold the currently displayed text for the first message
  const [displayedText1, setDisplayedText1] = useState('');
  // State to hold the currently displayed text for the second message
  const [displayedText2, setDisplayedText2] = useState('');
  // State to control the blinking cursor visibility
  const [showCursor, setShowCursor] = useState(true);
  // State to track if the first message has finished typing
  const [message1Completed, setMessage1Completed] = useState(false);

  // The full messages to be typed out
  const fullMessage1 = "Coming Soon...";
  const fullMessage2 = "This page is under construction.";

  // Effect to handle the typing animation for both messages
  useEffect(() => {
    let index1 = 0;
    let index2 = 0;
    let typingInterval;

    // Function to start typing the first message
    const typeMessage1 = () => {
      typingInterval = setInterval(() => {
        if (index1 < fullMessage1.length) {
          // Use substring to ensure the entire portion of the string is rendered
          setDisplayedText1(fullMessage1.substring(0, index1 + 1));
          index1++;
        } else {
          clearInterval(typingInterval);
          setMessage1Completed(true); // Mark first message as complete
          setTimeout(typeMessage2, 1000); // Wait a bit, then start typing second message
        }
      }, 100); // Typing speed for first message
    };

    // Function to start typing the second message
    const typeMessage2 = () => {
      typingInterval = setInterval(() => {
        if (index2 < fullMessage2.length) {
          // Use substring to ensure the entire portion of the string is rendered
          setDisplayedText2(fullMessage2.substring(0, index2 + 1));
          index2++;
        } else {
          clearInterval(typingInterval);
          // Keep the cursor blinking after both messages are typed
        }
      }, 70); // Typing speed for second message
    };

    // Add a small delay before starting the typing animation
    // This gives the component a moment to fully render before the animation begins.
    const initialDelayTimeout = setTimeout(() => {
      typeMessage1(); // Start the typing process after a short delay
    }, 200); // Increased initial delay to 200ms

    // Cleanup intervals and timeouts on unmount
    return () => {
      clearInterval(typingInterval);
      clearTimeout(initialDelayTimeout); // Clear the initial delay timeout as well
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Effect to handle the blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500); // Cursor blink speed

    // Cleanup interval on unmount
    return () => clearInterval(cursorInterval);
  }, []);

  // Handler for the "Back to Home Page" button click
  const handleBackToHome = () => {
    router.push('/dashboard'); // Navigate to the /dashboard route
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono text-green-400">
      <div className="relative border-2 border-green-500 rounded-lg shadow-lg p-6 md:p-8 lg:p-10 max-w-xl w-full bg-gray-900 bg-opacity-70">
        {/* Terminal header bar */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="flex-grow text-center text-xs md:text-sm text-gray-400">
            Terminal
          </div>
        </div>

        {/* Terminal content area */}
        <div className="text-sm md:text-base lg:text-lg leading-relaxed">
          {/* First message with typing effect */}
          <p className="mb-2">
            <span className="text-green-300">user@website:~#</span> {displayedText1}
            {/* Blinking cursor for the first message while it's typing */}
            {!message1Completed && showCursor && <span className="animate-blink">_</span>}
          </p>

          {/* Second message, only shown after the first is complete */}
          {message1Completed && (
            <p>
              <span className="text-green-300">user@website:~#</span> {displayedText2}
              {/* Blinking cursor for the second message or after both are typed */}
              {showCursor && <span className="animate-blink">_</span>}
            </p>
          )}

          {/* Back to Home Page Button */}
          {/* The button will appear after both messages have finished typing */}
          {message1Completed && displayedText2.length === fullMessage2.length && (
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToHome}
                className="px-4 py-2 border cursor-pointer border-green-500 text-green-400 rounded-md hover:bg-green-700 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Back to Home Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tailwind CSS for blinking animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
