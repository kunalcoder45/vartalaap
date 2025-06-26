'use client';

import React from 'react';

interface OutgoingCallPopupProps {
  targetName: string;
  targetAvatar?: string; // Optional avatar URL
  onEndCall: () => void; // Function to end the outgoing call
}

const OutgoingCallPopup: React.FC<OutgoingCallPopupProps> = ({ targetName, targetAvatar, onEndCall }) => {
  // You might want a default avatar here if targetAvatar is not provided
  const defaultAvatar = '/images/default-avatar.png'; // Make sure you have a default avatar in public/images

  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
        {targetAvatar && (
          <img
            src={targetAvatar}
            alt={targetName}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar; // Fallback on error
            }}
          />
        )}
        <h2 className="text-xl font-semibold mb-4">Calling {targetName}...</h2>
        <p className="text-gray-600 mb-6">Waiting for {targetName} to answer.</p>
        <button onClick={onEndCall} className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition duration-300">
          End Call
        </button>
      </div>
    </div>
  );
};

export default OutgoingCallPopup;